package com.skillpilot.backend.service;

import static com.skillpilot.backend.service.VoluntaryOfferTestConfiguration.*;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@Import(VoluntaryOfferTestConfiguration.class)
@Transactional
class VoluntaryOfferPlanRoutesTest {
    private static final LocalDate DAY = LocalDate.of(2026, 11, 26);
    private static final ZoneId BERLIN = ZoneId.of("Europe/Berlin");
    @Autowired LearnerService learners;
    @Autowired CoachToolFacade coach;
    @Autowired LearnerLearningPlanService plans;
    @Autowired LearnerRepository rows;
    @Autowired MasteryRepository mastery;
    @Autowired PlatformTransactionManager transactions;
    @Autowired ObjectMapper mapper;
    private Clock previousPlanClock;
    private Clock previousLearnerClock;
    private Learner learner;
    private String id;

    @BeforeEach
    void createLearner() throws Exception {
        previousPlanClock = (Clock) ReflectionTestUtils.getField(plans, "clock");
        previousLearnerClock = (Clock) ReflectionTestUtils.getField(learners, "learningPlanClock");
        Clock day = Clock.fixed(DAY.atStartOfDay(BERLIN).toInstant(), BERLIN);
        ReflectionTestUtils.setField(plans, "clock", day);
        ReflectionTestUtils.setField(learners, "learningPlanClock", day);
        learner = new Learner();
        id = "offer-routes-" + UUID.randomUUID();
        learner.setSkillpilotId(id);
        learner.setSelectedCurriculum(ROOT);
        learner.setAutoPilot(false);
        learner.setLearningPlanCountOnlyExplicitGoals(true);
        learner.setLearningPlanPeriodBasis(PeriodBasis.DAY);
        learner.setLearningStrategy("SEQUENTIAL");
        learner.setPersonalCurriculum(mapper.writeValueAsString(Map.of(
                ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "SekII", "durationModel", "G9"),
                PHYSICS, Map.of("selected", true, "filterId", "GK"),
                "__skillpilot_stage_scope_sek2__", Map.of("selected", true),
                CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                        CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                        CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                        CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true))));
        rows.saveAndFlush(learner);
        var graph = new CompletionProfileCompiler().normalizePrerequisites(
                learners.getLearningPlanCompletionContext(id).canonicalGoals());
        var prior = new HashSet<>(graph.transitivePrerequisites(TEMPERATURE));
        prior.add(INTRO);
        prior.removeAll(List.of(ARROW, TEMPERATURE));
        mastery.saveAllAndFlush(prior.stream().map(goal -> new Mastery(learner, goal, 1.0)).toList());
    }

    @AfterEach
    void restoreDate() {
        ReflectionTestUtils.setField(plans, "clock", previousPlanClock);
        ReflectionTestUtils.setField(learners, "learningPlanClock", previousLearnerClock);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void planActivationStartsExactlyTheAnnouncedGoal(boolean explicit) {
        var regularFrontier = learners.getUncompactedRichFrontierForFocus(id, List.of(MIXED));
        assertThat(regularFrontier).as("Mixed section after the recorded prerequisites: %s; mastery %s",
                learners.describeLearningPlanBlockage(id, List.of(TEMPERATURE), "en"), learners.getMastery(id))
                .extracting(FrontierGoal::id).contains(TEMPERATURE);
        var block = mixed(explicit, List.of(ARROW, TEMPERATURE));
        var preview = save(List.of(block));
        String expected = explicit ? ARROW : TEMPERATURE;
        assertThat(preview.nextEligibleGoal()).isNotNull();
        assertThat(preview.nextEligibleGoal().goalId()).isEqualTo(expected);
        var activated = activate(preview.revision(), block);
        assertThat(activated.activeGoalId()).isEqualTo(expected);
        assertThat(learners.getLearner(id).getActiveGoalId()).isEqualTo(expected);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void explicitContinuationUsesTheSameOfferScopeAsThePlanStatus(boolean explicit) {
        var stored = save(List.of(mixed(explicit, List.of(ARROW, TEMPERATURE))));
        learner.setFollowLearningPlans(true);
        rows.saveAndFlush(learner);
        var detail = plans.getPlan(id, PHYSICS, DAY);
        String expected = explicit ? ARROW : TEMPERATURE;
        assertThat(detail.nextEligibleGoal().goalId()).isEqualTo(expected);
        assertThat(plans.continuePlan(id, stored.planId(),
                new LearnerLearningPlanApi.ContinueRequest(stored.revision(), DAY)).activeGoalId()).isEqualTo(expected);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void automaticHandoffAfterTheRegularGoalHonoursTheAtomChoice(boolean explicit) {
        var activated = activate(0L, mixed(explicit, List.of(TEMPERATURE, ARROW)));
        assertThat(activated.activeGoalId()).isEqualTo(TEMPERATURE);
        learners.setMastery(id, new MasteryUpdateRequest(Map.of(TEMPERATURE, 1.0), TEMPERATURE));
        assertThat(learners.getLearner(id).getActiveGoalId()).isEqualTo(explicit ? ARROW : null);
        assertThat(learners.getMastery(id)).containsEntry(TEMPERATURE, 1.0).doesNotContainKey(ARROW);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void manualPlanChoiceOffersReadyOptionalStudyWithoutAddingItToThePlan(boolean chooseOffer) {
        save(List.of(mixed(false, List.of(TEMPERATURE))));
        learner.setFollowLearningPlans(true);
        rows.saveAndFlush(learner);
        var required = learners.getLearningPlanCompletionContext(id);
        var closedBasis = learners.getFilteredAtomicGoalIds(ROOT, learner.getPersonalCurriculum(), null, false);
        var masteryBefore = learners.getMastery(id);
        var choices = coach.getManualCoachPlanGoals(id, "de").orElseThrow();
        assertThat(choices.stream().filter(LearnerLearningPlanService.CoachPlanGoal::voluntary))
                .extracting(LearnerLearningPlanService.CoachPlanGoal::goalId).containsExactly(ARROW);
        assertThat(choices).extracting(LearnerLearningPlanService.CoachPlanGoal::goalId)
                .contains(TEMPERATURE).doesNotContain(MASS, ARROW_TASK);
        String chosen = chooseOffer ? ARROW : TEMPERATURE;
        var transition = coach.selectManualCoachPlanGoal(id, chosen);
        assertThat(transition.activeGoal().id()).isEqualTo(chosen);
        assertThat(plans.getPlan(id, PHYSICS, DAY).learningScope().goalIds()).containsExactly(TEMPERATURE);
        assertThat(learners.getLearningPlanCompletionContext(id).requiredRegularGoalIds())
                .isEqualTo(required.requiredRegularGoalIds()).doesNotContain(ARROW);
        assertThat(learners.getLearningPlanCompletionContext(id).level2TargetGoalIds())
                .isEqualTo(required.level2TargetGoalIds()).doesNotContain(ARROW);
        assertThat(learners.getFilteredAtomicGoalIds(ROOT, learner.getPersonalCurriculum(), null, false))
                .isEqualTo(closedBasis).doesNotContain(ARROW);
        assertThat(learners.getMastery(id)).isEqualTo(masteryBefore);
    }

    @Test
    void aDirectManualPlanWriteRechecksAnOfferWithMissingPriorKnowledge() {
        save(List.of(mixed(false, List.of(TEMPERATURE))));
        learner.setFollowLearningPlans(true);
        rows.saveAndFlush(learner);
        var choices = coach.getManualCoachPlanGoals(id, "de").orElseThrow();
        assertThat(choices).extracting(LearnerLearningPlanService.CoachPlanGoal::goalId)
                .contains(ARROW).doesNotContain(ARROW_TASK);
        assertThatThrownBy(() -> coach.selectManualCoachPlanGoal(id, ARROW_TASK))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode().value()).isEqualTo(409));
        assertThat(learner.getActiveGoalId()).isNull();
    }

    @Test
    void aFollowedExamAdmitsItsExplicitOfferAndRefusesAnOutsideRegularAtom() {
        var saved = save(List.of(mixed(true, List.of(ARROW)), exam("arrows", List.of(ARROW), true)));
        assertThat(saved.learningScope().goalIds()).containsExactly(ARROW);
        learner.setFollowLearningPlans(true);
        rows.saveAndFlush(learner);
        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(ARROW))).extracting(FrontierGoal::id)
                .contains(ARROW).doesNotContain(TEMPERATURE);
        assertThat(learners.learningPlanTransitionAccepts(id, ARROW, List.of(ARROW))).isTrue();
        assertThat(learners.learningPlanTransitionAccepts(id, TEMPERATURE, List.of(TEMPERATURE))).isFalse();
        learners.setActiveGoal(id, ARROW);
        assertThat(learners.getLearner(id).getActiveGoalId()).isEqualTo(ARROW);
    }


    @Test
    void aNamedPhysicsOfferBindsPhysicsEvenWhileTheMathematicsExamIsFollowed() throws Exception {
        var config = mapper.readValue(learner.getPersonalCurriculum(), ObjectNode.class);
        config.set(MATH, mapper.valueToTree(Map.of("selected", true, "filterId", "GK")));
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        rows.saveAndFlush(learner);
        var mathBlock = new LearnerLearningPlanApi.Block("math", "learning", NUMBER_LINE, "Zahlen",
                DAY, DAY, null, List.of(NUMBER_LINE), List.of(NUMBER_LINE), true);
        plans.upsert(id, MATH, new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik",
                List.of(mathBlock, exam("math-exam", List.of(NUMBER_LINE), true))), DAY);
        var physics = save(List.of(mixed(true, List.of(ARROW, TEMPERATURE))));
        learners.setPlannedGoals(id, Set.of(ARROW));
        learner.setFollowLearningPlans(true);
        rows.saveAndFlush(learner);

        assertThat(learners.getStoredLearningPlanFocusSubject(learner)).contains(PHYSICS);
        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(ARROW))).extracting(FrontierGoal::id)
                .contains(ARROW).doesNotContain(NUMBER_LINE);
        assertThat(learners.learningPlanTransitionAccepts(id, ARROW, List.of(ARROW))).isTrue();
        var transition = plans.continuePlan(id, physics.planId(),
                new LearnerLearningPlanApi.ContinueRequest(physics.revision(), DAY));
        assertThat(transition.activeGoalId()).isEqualTo(ARROW);
        assertThat(learners.getLearner(id).getActiveGoalId()).isEqualTo(ARROW);
    }

    @Test
    void aFollowedPhysicsExamDoesNotAdmitAnOfferOnlyFromTheOrdinaryPlan() {
        save(List.of(mixed(true, List.of(TEMPERATURE, ARROW)), exam("temperature", List.of(TEMPERATURE), true)));
        learners.setPlannedGoals(id, Set.of(TEMPERATURE));
        learner.setFollowLearningPlans(true);
        rows.saveAndFlush(learner);

        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(MIXED))).extracting(FrontierGoal::id)
                .doesNotContain(ARROW);
        assertThat(learners.learningPlanTransitionAccepts(id, ARROW, List.of(ARROW))).isFalse();
        assertThatThrownBy(() -> learners.setActiveGoal(id, ARROW)).isInstanceOf(ResponseStatusException.class);
        assertThat(learner.getActiveGoalId()).isNull();
    }

    @Test
    void aReadyUnchosenOfferNeverBecomesAutomaticPlanWork() {
        save(List.of(mixed(false, List.of(TEMPERATURE))));
        learner.setFollowLearningPlans(true);
        learner.setAutoPilot(true);
        rows.saveAndFlush(learner);
        var request = new LearnerLearningPlanApi.ReconcileRequest(DAY);

        assertThat(plans.reconcile(id, request).activeGoalId()).isEqualTo(TEMPERATURE);
        learners.setMastery(id, new MasteryUpdateRequest(Map.of(TEMPERATURE, 1.0), TEMPERATURE));
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(plans.resumeExplicitly(id, request).activeGoalId()).isNull();
        assertThat(learner.getActiveGoalId()).isNull();
        assertThat(learners.getMastery(id)).doesNotContainKey(ARROW);
    }

    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void theForeignExamBindsItsPreparationInThePhysicsSectionOnlyWhileActive(boolean examActive) throws Exception {
        var config = mapper.readValue(learner.getPersonalCurriculum(), ObjectNode.class);
        config.set(MATH, mapper.valueToTree(Map.of("selected", true, "filterId", "GK")));
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        rows.saveAndFlush(learner);
        var prerequisites = new CompletionProfileCompiler().normalizePrerequisites(
                learners.getLearningPlanCompletionContext(id).canonicalGoals()).transitivePrerequisites(NUMBER_LINE);
        mastery.saveAllAndFlush(prerequisites.stream().map(goal -> new Mastery(learner, goal, 1.0)).toList());
        var before = learners.resolveLearningPlanGoalIds(id, PHYSICS, List.of(MIXED, ARROW));
        assertThat(before).contains(TEMPERATURE, ARROW).doesNotContain(NUMBER_LINE);
        String foreignSection = "composition:test-math-voluntary-gk:structure:numbers";
        assertThatThrownBy(() -> learners.resolveLearningPlanGoalIds(id, PHYSICS, List.of(foreignSection)))
                .isInstanceOf(ResponseStatusException.class);
        String wholeNumbers = "d07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe";
        var mathBlock = new LearnerLearningPlanApi.Block("math", "learning", NUMBER_LINE, "Zahlen",
                DAY, DAY, null, List.of(NUMBER_LINE), List.of(NUMBER_LINE), true);
        plans.upsert(id, MATH, new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik",
                List.of(mathBlock, exam("math-exam", List.of(wholeNumbers), examActive))), DAY);
        learners.setPlannedGoals(id, Set.of(MIXED));
        learner.setFollowLearningPlans(true);
        rows.saveAndFlush(learner);

        var offered = learners.getUncompactedRichFrontierForFocus(id, List.of(MIXED)).stream()
                .map(FrontierGoal::id).toList();
        assertThat(offered).contains(ARROW);
        assertThat(offered.contains(NUMBER_LINE)).isEqualTo(!examActive);
        assertThat(learners.learningPlanTransitionAccepts(id, NUMBER_LINE, List.of(MIXED))).isEqualTo(!examActive);
        if (examActive) {
            assertThatThrownBy(() -> learners.setActiveGoal(id, NUMBER_LINE))
                    .isInstanceOf(ResponseStatusException.class);
            learners.setActiveGoal(id, ARROW);
            assertThat(learners.getLearner(id).getActiveGoalId()).isEqualTo(ARROW);
        } else {
            learners.setActiveGoal(id, NUMBER_LINE);
            assertThat(learners.getLearner(id).getActiveGoalId()).isEqualTo(NUMBER_LINE);
        }
    }

    @Test
    void rejectingAForeignOfferDuringValidationKeepsTheReadersTransactionUsable() {
        new TransactionTemplate(transactions).executeWithoutResult(status -> {
            assertThatThrownBy(() -> learners.resolveLearningPlanGoalIds(id, MATH, List.of(ARROW)))
                    .isInstanceOf(ResponseStatusException.class);
            assertThat(status.isRollbackOnly()).isFalse();
            assertThat(learners.resolveLearningPlanGoalIds(id, PHYSICS, List.of(ARROW))).containsExactly(ARROW);
        });
    }

    @Test
    void aSelectedSubjectWhoseOnlyPlaceIsAnOfferStillAllowsAnIndividualPlan() throws Exception {
        var config = mapper.readValue(learner.getPersonalCurriculum(), ObjectNode.class);
        ((ObjectNode) config.get(ROOT)).put("filterId", "DE-BB");
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        rows.saveAndFlush(learner);
        assertThat(learners.getPersonalCurriculumSubjectIds(id)).contains(PHYSICS);
        assertThat(learners.getPersonalCurriculumAtomicTargetsByLandscape(id)
                .getOrDefault(PHYSICS, List.of())).isEmpty();
        assertThatThrownBy(() -> learners.getPlanningScope(id, PHYSICS))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        error -> assertThat(error.getStatusCode().value()).isEqualTo(409));
        var individual = new LearnerLearningPlanApi.Block("arrow", "learning", ARROW, "Pfeile",
                DAY, DAY, null, List.of(ARROW), List.of(ARROW), true);
        var selected = save(List.of(individual));
        assertThat(selected.stale()).isFalse();
        assertThat(selected.learningScope().goalIds()).containsExactly(ARROW);
        assertThat(learners.getPersonalCurriculumAtomicTargetsByLandscape(id)
                .getOrDefault(PHYSICS, List.of())).isEmpty();
    }

    @Test
    void anUnselectedSubjectIsNotEnrolledByReadingOrSelectingThePhysicsSection() {
        assertThat(learners.resolveLearningPlanGoalIds(id, PHYSICS, List.of(MIXED, ARROW)))
                .contains(TEMPERATURE, ARROW).doesNotContain(NUMBER_LINE);
        assertThat(learners.learningPlanTransitionAccepts(id, NUMBER_LINE, List.of(MIXED))).isFalse();
        assertThat(learners.getUncompactedRichFrontierForFocus(id, List.of(MIXED))).extracting(FrontierGoal::id)
                .contains(ARROW).doesNotContain(NUMBER_LINE, MASS);
        assertThat(learners.getPersonalCurriculumSubjectIds(id)).doesNotContain(MATH);
    }

    private static LearnerLearningPlanApi.Block mixed(boolean explicit, List<String> atoms) {
        var roots = explicit ? List.of(MIXED, ARROW) : List.of(MIXED);
        return new LearnerLearningPlanApi.Block("physics", "learning", MIXED, "Wärme und Pfeile",
                DAY, DAY, null, atoms, roots, true);
    }

    private static LearnerLearningPlanApi.Block exam(String key, List<String> roots, boolean active) {
        return new LearnerLearningPlanApi.Block(key, "milestone", null, "Klausur",
                null, null, DAY, null, roots, active);
    }

    private LearnerLearningPlanApi.PlanDetail save(List<LearnerLearningPlanApi.Block> blocks) {
        return plans.upsert(id, PHYSICS, new LearnerLearningPlanApi.UpsertRequest(0L, "Physik", blocks), DAY);
    }

    private LearnerLearningPlanApi.ActivateResponse activate(long revision, LearnerLearningPlanApi.Block block) {
        return plans.activatePlans(id, new LearnerLearningPlanApi.ActivateRequest(DAY, List.of(
                new LearnerLearningPlanApi.ActivationPlan(PHYSICS, revision, "Physik", List.of(block)))));
    }
}
