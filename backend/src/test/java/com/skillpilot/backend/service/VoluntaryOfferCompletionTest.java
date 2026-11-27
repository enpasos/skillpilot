package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.completion.CompletionCallContext;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.completion.CompletionApplicationService;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@Import(VoluntaryOfferTestConfiguration.class)
@Transactional
class VoluntaryOfferCompletionTest {
    private static final String PROFILE = "automatic:personal-curriculum";

    @Autowired LearnerService learners;
    @Autowired CoachToolFacade coach;
    @Autowired LearnerLearningPlanService plans;
    @Autowired LearnerRepository learnerRepository;
    @Autowired MasteryRepository mastery;
    @Autowired PlannedGoalRepository focus;
    @Autowired ObjectMapper mapper;
    private Object previousCompletion;
    private Learner learner;
    private String id;

    @BeforeEach
    void setup() throws Exception {
        previousCompletion = ReflectionTestUtils.getField(learners, "completionApplicationService");
        ReflectionTestUtils.setField(learners, "completionApplicationService", new CompletionApplicationService(
                new CompletionProfileCatalog(Map.of(), Map.of(), "voluntary-completion", true)));
        learner = new Learner();
        id = "voluntary-completion-" + UUID.randomUUID();
        learner.setSkillpilotId(id);
        learner.setSelectedCurriculum(ROOT);
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "SekII", "durationModel", "G9"),
                PHYSICS, Map.of("selected", true, "filterId", "GK"),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        learner.setAutoPilot(false);
        learner.setFollowLearningPlans(false);
        learner = learnerRepository.saveAndFlush(learner);
        mastery.saveAndFlush(new Mastery(learner, INTRO, 1.0));
        focus.saveAndFlush(new PlannedGoal(learner, MIXED));
    }

    @AfterEach
    void restore() {
        ReflectionTestUtils.setField(learners, "completionApplicationService", previousCompletion);
    }

    private UnifiedLearnerStateResponse chooseInCoach(LevelCompletionActionRequest request) {
        var call = new CompletionCallContext("claude", id, Instant.now().plusSeconds(600), true);
        return CompletionCallContext.with(call, () -> coach.chooseLevelCompletion(id, request));
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void voluntaryChoiceSurvivesCoachReadAndCountsOnlyInItsExplicitPlan(boolean autoPilot) {
        learner.setAutoPilot(autoPilot);
        // Completing the required work must not choose the remaining offer, even with AutoPilot.
        mastery.saveAndFlush(new Mastery(learner, TEMPERATURE, 1.0));
        var untouched = learners.getCoachLearnerState(id).levelCompletion();
        assertThat(untouched.complete()).isTrue();
        var day = LocalDate.of(2026, 11, 26);
        var block = new LearnerLearningPlanApi.Block("offer", "learning", ARROW, "Pfeile",
                day, day, null, List.of(ARROW), List.of(ARROW), true);
        var plan = plans.upsert(id, PHYSICS, new LearnerLearningPlanApi.UpsertRequest(
                0L, "Physik", List.of(block)), day);
        assertThat(plan.learningScope().goalIds()).containsExactly(ARROW);
        var profile = chooseInCoach(
                new LevelCompletionActionRequest("selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        assertThat(profile.levelCompletion().targetCount()).isEqualTo(untouched.targetCount());
        assertThat(profile.levelCompletion().requiredAssessmentCount()).isEqualTo(untouched.requiredAssessmentCount());
        var route = profile.levelCompletion();
        assertThat(route.actions()).filteredOn(action -> ARROW.equals(action.goalId()))
                .extracting(LevelCompletionResponse.Action::intent).containsExactly("voluntary");
        assertThat(profile.activeGoal()).isNull();
        var selected = chooseInCoach(new LevelCompletionActionRequest(
                "learnGoal", PROFILE, ARROW, "voluntary", route.learnerRevision()));
        assertThat(selected.activeGoal().id()).isEqualTo(ARROW);
        var reload = learners.getCoachLearnerState(id);
        assertThat(reload.activeGoal().id()).isEqualTo(ARROW);
        assertThat(reload.frontier()).extracting(com.skillpilot.backend.api.FrontierGoal::id).contains(ARROW);
        assertThat(reload.levelCompletion().navigationIntent()).isEqualTo("voluntary");
        assertThat(reload.levelCompletion().complete()).isTrue();
        assertThat(learners.getMastery(id)).doesNotContainKey(ARROW);
        assertThat(learners.getLearningPlanCompletionContext(id).requiredRegularGoalIds()).doesNotContain(ARROW);
        assertThat(learners.getLearningPlanCompletionContext(id).level2TargetGoalIds()).doesNotContain(ARROW);
        var call = new CompletionCallContext("claude", id, Instant.now().plusSeconds(600), true);
        var grade = CompletionCallContext.with(call, () -> coach.setMastery(id,
                new MasteryUpdateRequest(Map.of(ARROW, 1.0), ARROW)));
        assertThat(grade.status()).isEqualTo(CoachToolFacade.MasteryStatus.UPDATED);
        assertThat(learners.getMastery(id)).containsEntry(ARROW, 1.0).doesNotContainKey(ARROW_TASK);
        var after = learners.getCoachLearnerState(id);
        assertThat(after.activeGoal()).isNull();
        assertThat(after.levelCompletion().targetCount()).isEqualTo(untouched.targetCount());
        assertThat(after.levelCompletion().masteredTargetCount()).isEqualTo(untouched.masteredTargetCount());
        assertThat(after.levelCompletion().requiredAssessmentCount()).isEqualTo(untouched.requiredAssessmentCount());
        assertThat(after.levelCompletion().actions()).noneMatch(action -> ARROW.equals(action.goalId()));
        var archive = learners.exportLearner(id);
        assertThat(archive.data().mastery().get(ARROW).value()).isEqualTo(1.0);
        mastery.deleteById(new MasteryId(id, ARROW));
        mastery.flush();
        assertThat(learners.getMastery(id)).doesNotContainKey(ARROW);
        learners.importLearner(id, archive);
        assertThat(learners.getMastery(id)).containsEntry(ARROW, 1.0).doesNotContainKey(ARROW_TASK);
        assertThat(learners.exportLearner(id).data().learningPlans().getFirst().blocks())
                .containsExactly(block);
        assertThat(learners.getLearningPlanCompletionContext(id).level2TargetGoalIds()).doesNotContain(ARROW);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void anAssessmentFromAnOfferOnlySectionCanBeLeftWithoutCredit(boolean autoPilot) {
        learner.setAutoPilot(autoPilot);
        mastery.saveAndFlush(new Mastery(learner, ARROW, 1.0));
        focus.saveAndFlush(new PlannedGoal(learner, OPTIONAL));
        var before = learners.getCoachLearnerState(id).levelCompletion();
        var route = chooseInCoach(
                new LevelCompletionActionRequest("selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        assertThat(route.levelCompletion().assessments()).noneMatch(a -> ARROW_TASK.equals(a.goalId()));
        assertThat(route.levelCompletion().actions()).anyMatch(a -> ARROW_TASK.equals(a.goalId())
                && "learnGoal".equals(a.action()) && "voluntary".equals(a.intent()));
        var selected = chooseInCoach(new LevelCompletionActionRequest("learnGoal", PROFILE,
                ARROW_TASK, "voluntary", route.levelCompletion().learnerRevision()));
        assertThat(selected.activeGoal().id()).isEqualTo(ARROW_TASK);
        assertThat(learners.getCoachLearnerState(id).activeGoal().id()).isEqualTo(ARROW_TASK);
        // A voluntary exam learned from the ordinary frontier claims no direct-exam exception.
        assertThat(selected.levelCompletion().directAssessmentRunning()).isFalse();
        // Temperature is a regular target of this view. Automatic completion already
        // waives it in this tiny assignment; the existing voluntary continuation still works.
        assertThat(selected.levelCompletion().waivedTargetGoalIds()).contains(TEMPERATURE);
        var returned = chooseInCoach(new LevelCompletionActionRequest("learnGoal", PROFILE,
                TEMPERATURE, "voluntary", selected.levelCompletion().learnerRevision()));
        assertThat(returned.activeGoal().id()).isEqualTo(TEMPERATURE);
        assertThat(learners.getMastery(id)).doesNotContainKey(ARROW_TASK);
        assertThat(returned.levelCompletion().requiredAssessmentCount()).isEqualTo(before.requiredAssessmentCount());
    }

    @Test
    void selectingTheMixedProfileRetainsAnAlreadyChosenOfferAtItsPlace() {
        learners.setActiveGoal(id, ARROW);
        var selected = chooseInCoach(new LevelCompletionActionRequest("selectProfile", "automatic:" + MIXED,
                null, null, learner.getCoachStateRevision()));
        assertThat(selected.activeGoal().id()).isEqualTo(ARROW);
        assertThat(selected.levelCompletion().navigationIntent()).isEqualTo("voluntary");
        assertThat(selected.levelCompletion().waivedTargetGoalIds()).doesNotContain(ARROW);
        assertThat(learners.getMastery(id)).doesNotContainKey(ARROW);
    }

    @Test
    void profileStudyChoicesRespectTheOffersPlaceEvenWithBothSectionsFocused() {
        mastery.saveAndFlush(new Mastery(learner, ARROW, 1.0));
        focus.saveAndFlush(new PlannedGoal(learner, OPTIONAL));
        assertThat(learners.getUncompactedRichFrontier(id)).anyMatch(goal -> ARROW_TASK.equals(goal.id()));
        var mixed = chooseInCoach(new LevelCompletionActionRequest("selectProfile", "automatic:" + MIXED,
                null, null, learner.getCoachStateRevision()));
        assertThat(mixed.levelCompletion().actions()).noneMatch(action -> ARROW_TASK.equals(action.goalId()));
    }

    @Test
    void requiredIntentCannotStartAnOffer() {
        var selected = chooseInCoach(
                new LevelCompletionActionRequest("selectProfile", PROFILE, null, null, learner.getCoachStateRevision()));
        assertThat(selected.levelCompletion().actions()).anyMatch(action ->
                ARROW.equals(action.goalId()) && "voluntary".equals(action.intent()));
        assertThatThrownBy(() -> chooseInCoach(new LevelCompletionActionRequest(
                "learnGoal", PROFILE, ARROW, "required", selected.levelCompletion().learnerRevision())))
                .isInstanceOf(ResponseStatusException.class).hasMessageContaining("Refresh the completion choices");
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learners.getMastery(id)).doesNotContainKey(ARROW);
    }
}
