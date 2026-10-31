package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.api.CompletionAssessmentStart;
import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.completion.CompletionApplicationService;
import com.skillpilot.backend.completion.CompletionCallContext;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.completion.LearningPlanCompletionContext;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Real canonical curriculum, persistence and lifecycle, with no authored pilot profiles. */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AutomaticCompletionIntegrationTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String DEFAULT_SCOPE = "automatic:personal-curriculum";
    private static final String PREPARATION = "3016ec37-1c2e-47db-83f5-e767923bc97e";
    private static final String PILOT_EXAM = "e98672c6-871a-5d0b-889c-5afc51040f0d";
    private static final String SEK1_EXAM = "311ab2f2-3364-5166-ac22-3ef01419fee4";
    @Autowired LearnerService learners;
    @Autowired LearnerRepository learnerRepository;
    @Autowired MasteryRepository masteryRepository;
    @Autowired PlannedGoalRepository focus;
    @Autowired ObjectMapper mapper;
    private Learner learner;
    private Object originalApplication;
    private CompletionApplicationService automatic;

    @BeforeEach void setup() throws Exception {
        originalApplication = ReflectionTestUtils.getField(learners, "completionApplicationService");
        automatic = new CompletionApplicationService(new CompletionProfileCatalog(
                Map.of(), Map.of(), "auto-test-generation", true));
        ReflectionTestUtils.setField(learners, "completionApplicationService", automatic);
        learner = new Learner();
        learner.setSkillpilotId("automatic-completion-" + UUID.randomUUID());
        learner.setSelectedCurriculum(ROOT);
        Map<String, Object> config = new LinkedHashMap<>();
        config.put(ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "CrossStage", "durationModel", "G9"));
        config.put("__skillpilot_stage_scope_sek1__", Map.of("selected", true));
        config.put("__skillpilot_stage_scope_sek2__", Map.of("selected", true));
        config.put(MATH, Map.of("selected", true, "filterId", "GK+LK"));
        config.put(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true));
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        learner.setAutoPilot(false);
        learner = learnerRepository.saveAndFlush(learner);
        focus.saveAndFlush(new PlannedGoal(learner, PREPARATION));
    }

    @AfterEach void restore() {
        ReflectionTestUtils.setField(learners, "completionApplicationService", originalApplication);
    }

    @Test void defaultPreviewIncludesNonPilotAndSekOneAssessmentsWithoutMutatingNavigationOrMastery() throws Exception {
        learner.setActiveGoalId(PREPARATION);
        learner.setLearningState(LearningState.TEACHING);
        long revision = learner.getCoachStateRevision();
        var response = preview();
        assertThat(automatic.catalog().profiles()).isEmpty();
        assertThat(response.calculationStatus()).isEqualTo("valid");
        assertThat(response.profileId()).isEqualTo(DEFAULT_SCOPE);
        assertThat(response.assessments()).hasSizeGreaterThan(24)
                .extracting(LevelCompletionResponse.Assessment::goalId).contains(SEK1_EXAM, PILOT_EXAM);
        assertThat(response.assessments()).allSatisfy(assessment -> {
            assertThat(assessment.mastered()).isFalse();
            assertThat(assessment.startAvailable()).isTrue();
        });
        assertThat(response.profileOptions()).extracting(LevelCompletionResponse.ProfileOption::profileId)
                .contains(DEFAULT_SCOPE).hasSizeGreaterThan(1);
        assertThat(mapper.writeValueAsString(response)).doesNotContain(
                "taskContent", "solutionContent", "passingPoints", "evaluationCapability", "sessionBinding");
        preview();
        assertThat(learner.getActiveGoalId()).isEqualTo(PREPARATION);
        assertThat(learner.getLearningState()).isEqualTo(LearningState.TEACHING);
        assertUnchanged(revision);
    }

    @Test void aNonPilotAssessmentStartsDirectlyWithUnmasteredPrerequisitesAndOneRevision() {
        var available = preview().assessments().stream().filter(a -> SEK1_EXAM.equals(a.goalId())).findFirst().orElseThrow();
        assertThat(available.startAvailable()).isTrue();
        assertThat(learners.getLearningPlanCompletionContext(learner.getSkillpilotId(), Set.of(SEK1_EXAM))
                .canonicalGoals().get(SEK1_EXAM).getRequires()).isNotEmpty();
        long before = learner.getCoachStateRevision();
        learners.startCompletionAssessment(learner.getSkillpilotId(), request(SEK1_EXAM, before),
                "claude", "owner", Instant.now().plusSeconds(600));
        assertThat(learner.getCoachStateRevision()).isEqualTo(before + 1);
        assertThat(learner.getActiveGoalId()).isEqualTo(SEK1_EXAM);
        assertThat(learner.getLearningState()).isEqualTo(LearningState.TEACHING);
        assertThat(preview().directAssessmentRunning()).isTrue();
        assertThat(preview().profileId()).isEqualTo(DEFAULT_SCOPE);
        assertThat(learner.getCompletionWorkflow()).contains("owner");
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
    }

    @Test void staleForgedNonAssessmentAndExpiredStartsCannotSelectAProfileOrWriteProgress() {
        long revision = learner.getCoachStateRevision();
        Instant expiry = Instant.now().plusSeconds(600);
        for (var request : List.of(request(SEK1_EXAM, revision + 1), request(PREPARATION, revision),
                new CompletionAssessmentStart("automatic:forged", SEK1_EXAM, revision),
                new CompletionAssessmentStart(DEFAULT_SCOPE, SEK1_EXAM, revision, true))) {
            assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(), request,
                    "claude", "owner", expiry)).isInstanceOf(ResponseStatusException.class);
        }
        assertThatThrownBy(() -> learners.startCompletionAssessment(learner.getSkillpilotId(), request(SEK1_EXAM, revision),
                "claude", "owner", Instant.now().minusSeconds(1))).isInstanceOf(ResponseStatusException.class);
        assertUnchanged(revision);
        assertThat(learner.getActiveGoalId()).isNull();
    }

    @Test void optOutAndIncompletePersonalizationStillBlockAutomaticDirectEntry() throws Exception {
        long revision = learner.getCoachStateRevision();
        var enabled = preview();
        learner.setUseAssessmentShortcuts(false);
        var disabled = preview();
        assertThat(disabled.calculationStatus()).isEqualTo("valid");
        assertThat(disabled.profileId()).isEqualTo(DEFAULT_SCOPE);
        assertThat(disabled.waivedTargetGoalIds()).isEqualTo(enabled.waivedTargetGoalIds());
        assertThat(disabled.masteredTargetCount()).isEqualTo(enabled.masteredTargetCount());
        assertThat(disabled.pendingTargetCount()).isEqualTo(enabled.pendingTargetCount());
        assertThat(disabled.profileOptions()).isEmpty();
        assertThat(disabled.assessments()).isNotEmpty().allSatisfy(assessment ->
                assertThat(assessment.startAvailable()).isFalse());
        assertThatThrownBy(() -> start(SEK1_EXAM)).isInstanceOf(ResponseStatusException.class);
        assertUnchanged(revision);
        learner.setUseAssessmentShortcuts(true);
        var config = (ObjectNode) mapper.readTree(learner.getPersonalCurriculum());
        ((ObjectNode) config.get(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY))
                .put(CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, false);
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        assertThat(learners.getPersonalizationPlan(learner.getSkillpilotId()).required()).isTrue();
        assertThatThrownBy(() -> start(SEK1_EXAM)).isInstanceOf(ResponseStatusException.class);
        assertUnchanged(revision);
    }

    @Test void unsupportedProvidersCannotUseAutomaticDiscoveryAsABypass() {
        long revision = learner.getCoachStateRevision();
        Instant expiry = Instant.now().plusSeconds(600);
        var unsupported = new CompletionCallContext("openai", "unsupported-owner", expiry, false);
        assertThatThrownBy(() -> CompletionCallContext.with(unsupported, () -> {
            learners.startCompletionAssessment(learner.getSkillpilotId(), request(SEK1_EXAM, revision),
                    "claude", "unsupported-owner", expiry);
            return null;
        })).isInstanceOf(ResponseStatusException.class);
        assertUnchanged(revision);
    }

    @Test void automaticDirectAssessmentKeepsItsAuthenticatedSessionOwnership() {
        start(SEK1_EXAM);
        long revision = learner.getCoachStateRevision();
        String workflow = learner.getCompletionWorkflow();
        var foreign = new CompletionCallContext("claude", "foreign", Instant.now().plusSeconds(600), true);
        var state = CompletionCallContext.with(foreign, () -> learners.getCoachLearnerState(learner.getSkillpilotId()));
        assertThat(state.activeGoal()).isNull();
        assertThat(state.frontier()).isEmpty();
        assertThat(state.nextAllowedActions()).isEmpty();
        assertThat(state.levelCompletion().notice()).isEqualTo("completion_assessment_owned_elsewhere");
        assertThatThrownBy(() -> CompletionCallContext.with(foreign, () -> learners.chooseLevelCompletion(
                learner.getSkillpilotId(), new LevelCompletionActionRequest("leaveProfile", null, null, null, revision))))
                .isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
        assertThat(learner.getCompletionWorkflow()).isEqualTo(workflow);
        assertThat(learner.getActiveGoalId()).isEqualTo(SEK1_EXAM);
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
    }

    @Test void planCompletionReceivesAutomaticInputsIndependentlyOfRouteAndShortcutOptOut() {
        learner.setUseAssessmentShortcuts(false);
        long revision = learner.getCoachStateRevision();
        var context = learners.getLearningPlanCompletionContext(learner.getSkillpilotId(), Set.of(PREPARATION));
        assertThat(context).isNotNull();
        assertThat(context.semantics()).isEqualTo(LearningPlanCompletionContext.Semantics.AUTOMATIC);
        assertThat(context.reviewedProfiles()).isEmpty();
        assertThat(context.canonicalGoals()).containsKey(PREPARATION);
        assertUnchanged(revision);
    }

    private LevelCompletionResponse preview() {
        return learners.getLearnerState(learner.getSkillpilotId()).levelCompletion();
    }

    private static CompletionAssessmentStart request(String goalId, long revision) {
        return new CompletionAssessmentStart(DEFAULT_SCOPE, goalId, revision);
    }

    private void start(String goalId) {
        learners.startCompletionAssessment(learner.getSkillpilotId(), request(goalId, learner.getCoachStateRevision()),
                "claude", "owner", Instant.now().plusSeconds(600));
    }

    private void assertUnchanged(long revision) {
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
        assertThat(learner.getCompletionWorkflow()).isNull();
        assertThat(masteryRepository.findByLearner_SkillpilotId(learner.getSkillpilotId())).isEmpty();
        assertThat(focus.findByLearner_SkillpilotId(learner.getSkillpilotId()))
                .extracting(PlannedGoal::getGoalId).containsExactly(PREPARATION);
    }
}
