package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
import jakarta.persistence.EntityManager;
import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Real canonical graphs and persisted H2 plans: the exam selection is not a quota. */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class ExamLearningScopeIntegrationTest {
    private static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String ROOT = "bf980fff-b62b-4ea4-a20d-31681a7ad785";
    private static final String DIAGRAMS = "ce431132-dfc4-42c2-aff6-bd72035190f8";
    private static final String UNIFORM = "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd";
    private static final String ACCELERATION = "e4b38061-1f28-43ad-8371-a3e7c0e81856";
    // The course planner normalizes the projected E.1 program container to its
    // seven visible canonical targets, excluding the separate Sek-I fall target.
    private static final List<String> MOTION_TOPICS = List.of(DIAGRAMS, UNIFORM,
            "bf8517a9-142b-5789-826a-767f3b277998", ACCELERATION,
            "09029573-864f-40ca-bf8a-cee7bf6dcb73", "d6dc0e02-831d-4894-a61a-852bcc74f147",
            "4a2bf015-052b-4af0-aed7-324259fa1a8a");
    private static final List<String> EXAM_ROOTS = List.of(DIAGRAMS, UNIFORM,
            "bf8517a9-142b-5789-826a-767f3b277998", ACCELERATION,
            "09029573-864f-40ca-bf8a-cee7bf6dcb73", "d6dc0e02-831d-4894-a61a-852bcc74f147",
            "4a2bf015-052b-4af0-aed7-324259fa1a8a", "68c90ba6-c438-463c-9a53-cf61062d416a",
            "89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2",
            "a9562b05-c54d-5635-9244-3f7dd24a8642", "4ab1cf6d-b808-5b86-9291-85df0b9f2496",
            "6ea3fb3c-abdc-568f-ab13-97c36dc274e4");
    private static final LocalDate TODAY = LocalDate.parse("2026-10-22");
    private static final ZoneId BERLIN = ZoneId.of("Europe/Berlin");

    @Autowired LearnerService learners;
    @Autowired CoachToolFacade coachTools;
    @Autowired LearnerLearningPlanService plans;
    @Autowired LearnerRepository learnerRepository;
    @Autowired MasteryRepository masteryRepository;
    @Autowired PlannedGoalRepository focusRepository;
    @Autowired LandscapeService landscapes;
    @Autowired ObjectMapper mapper;
    @Autowired EntityManager entityManager;
    private Learner learner;
    private Clock oldPlanClock;
    private Clock oldLearnerClock;

    @BeforeEach
    void setUp() throws Exception {
        oldPlanClock = (Clock) ReflectionTestUtils.getField(plans, "clock");
        oldLearnerClock = (Clock) ReflectionTestUtils.getField(learners, "learningPlanClock");
        setDate(TODAY);
        learner = new Learner();
        learner.setSkillpilotId("exam-scope-" + UUID.randomUUID());
        learner.setSelectedCurriculum("a0e13c56-c25f-4742-9272-3a1a603ee52e");
        learner.setPersonalCurriculum("""
                {
                 "a0e13c56-c25f-4742-9272-3a1a603ee52e":{"selected":true,"filterId":"DE-HE","stage":"CrossStage","durationModel":"G9"},
                 "__skillpilot_stage_scope_sek1__":{"selected":true},
                 "__skillpilot_stage_scope_sek2__":{"selected":true},
                 "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced":{"selected":true,"filterId":"GK+LK"},
                 "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a":{"selected":true,"filterId":"GK+LK"}}
                """);
        Map<String, Object> config = mapper.readValue(learner.getPersonalCurriculum(), Map.class);
        config.put(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, learner.getSelectedCurriculum(),
                CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true));
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        learner.setAutoPilot(false);
        learner.setLearningStrategy("SEQUENTIAL");
        learner.setFollowLearningPlans(false);
        learner.setLearningPlanPeriodBasis(PeriodBasis.DAY);
        learner = learnerRepository.saveAndFlush(learner);
        learners.setPlannedGoals(id(), Set.copyOf(MOTION_TOPICS));
    }

    @AfterEach
    void restoreClocks() {
        ReflectionTestUtils.setField(plans, "clock", oldPlanClock);
        ReflectionTestUtils.setField(learners, "learningPlanClock", oldLearnerClock);
    }

    @Test
    void ordinaryExamFocusStartsInsideAllTwelveSelectedGoalsWithoutOutsideMastery() {
        assertThat(storedMastery()).isEmpty();
        var activated = activate(List.of(inactiveGeneralCourse(), exam("exam", TODAY.plusDays(5), EXAM_ROOTS)));

        assertThat(activated.activeGoalId()).isEqualTo(DIAGRAMS);
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(EXAM_ROOTS);
        var coach = learners.getCoachLearnerState(id());
        assertThat(coach.activeGoal().id()).isEqualTo(DIAGRAMS);
        assertThat(coach.frontier()).extracting(FrontierGoal::id).containsExactly(DIAGRAMS);
        assertThat(learners.getFrontier(id())).containsExactly(DIAGRAMS);
        assertThat(coach.goals().planned()).extracting(FrontierGoal::id)
                .containsExactlyInAnyOrderElementsOf(EXAM_ROOTS);
        assertThat(coach.goals().scope().total_atomic()).isEqualTo(12);
        assertThat(coach.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
        var status = physicsStatus();
        assertThat(status.learningScope().goalIds()).containsExactlyInAnyOrderElementsOf(EXAM_ROOTS);
        assertThat(status.learningScope().achievedGoalCount()).isZero();
        assertThat(status.learningScope().progressText()).doesNotContain("Offene Voraussetzungen");
        assertThat(status.periodGauge().target()).isZero();
        assertThat(status.balanceGauge()).isNull();
        assertThat(storedMastery()).isEmpty();

        var next = coachTools.setMastery(id(), new MasteryUpdateRequest(Map.of(DIAGRAMS, 1.0), DIAGRAMS));
        assertThat(next.status()).isEqualTo(CoachToolFacade.MasteryStatus.UPDATED);
        assertThat(storedMastery()).containsExactlyEntriesOf(Map.of(DIAGRAMS, 1.0));
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(EXAM_ROOTS);
        assertThat(learners.getCoachLearnerState(id()).frontier()).extracting(FrontierGoal::id)
                .contains(UNIFORM).doesNotContain(ACCELERATION);
    }

    @Test
    void strictExamFocusKeepsOutsidePrerequisitesAndAllNineTopicsAndThreeTasks() throws Exception {
        learner.setStrictMode(true);
        learnerRepository.saveAndFlush(learner);
        List<String> selected = selected(EXAM_ROOTS);
        assertThat(selected).containsExactlyInAnyOrderElementsOf(EXAM_ROOTS);
        masteryRepository.saveAndFlush(new Mastery(learner, UNIFORM, 1.0));
        // Achieved uniform motion ends its own preparation demand. Its direct
        // successor is available even in strict mode, while goals with their
        // own open direct requirements remain blocked. No earlier goal is mastered.
        assertThat(learners.getFrontier(id()))
                .contains("bf8517a9-142b-5789-826a-767f3b277998")
                .doesNotContain(DIAGRAMS, ACCELERATION);
        assertThat(storedMastery()).containsExactlyEntriesOf(Map.of(UNIFORM, 1.0));

        // Keep one achieved target for the scope/counting assertions below, but
        // use a terminal task that unlocks no further selected goal. The strict
        // route must therefore still respect its genuinely open prerequisites.
        masteryRepository.deleteAll(masteryRepository.findByLearner_SkillpilotId(id()));
        masteryRepository.saveAndFlush(new Mastery(learner, EXAM_ROOTS.getLast(), 1.0));
        assertThat(learners.getPersonalCurriculumSubjectFrontier(id(), MATH))
                .as("Unscheduled Mathematics really has a reachable orientation before the exam is activated")
                .extracting(FrontierGoal::id).contains("65365dce-f33f-49d8-9516-42f75883aa86");
        Map<String, Double> masteryBefore = storedMastery();
        var activated = activate(List.of(inactiveGeneralCourse(), exam("exam", TODAY.plusDays(5), EXAM_ROOTS)));

        assertThat(activated.activeGoalId()).isNull();
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(selected);
        var status = physicsStatus();
        assertThat(status.learningScope().goalIds()).containsExactlyElementsOf(selected);
        assertThat(status.learningScope().achievedGoalCount()).isEqualTo(1);
        assertThat(status.learningScope().targetGoalCount()).isEqualTo(12);
        assertThat(status.learningScope().schedulingState()).isEqualTo("unscheduled");
        assertThat(status.periodText()).isEqualTo("Zeitplanung offen");
        assertThat(status.subjectLine()).contains("Klausurvorbereitung: 1 von 12").doesNotContain("Keine Lernziele eingeplant");
        assertThat(status.periodGauge().target()).isZero();
        assertThat(status.balanceGauge()).isNull();
        assertThat(status.balance().rueckstand()).isZero();
        assertThat(activated.plans().getFirst().learningScope()).isEqualTo(status.learningScope());
        var coach = learners.getCoachLearnerState(id());
        assertThat(coach.activeGoal()).isNull();
        assertThat(coach.frontier()).isEmpty();
        assertThat(coach.stateMachine().goalOptions()).isEmpty();
        assertThat(coach.goals().scope_completed()).isFalse();
        assertThat(plans.getTodayStatus(id(), "de").resumeAvailable()).isFalse();
        assertThat(status.learningScope().progressText()).contains("Offene Voraussetzungen:");
        assertThat(plans.resumeExplicitly(id(), new LearnerLearningPlanApi.ReconcileRequest(TODAY)).activeGoalId())
                .isNull();
        assertThat(storedMastery()).isEqualTo(masteryBefore);
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(selected);
        assertThat(mapper.readTree(mapper.writeValueAsString(status)).path("learningScope").path("goalIds")).hasSize(12);
        assertThatThrownBy(() -> coachTools.resumeLearningPlan(id(), "de"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode().value()).isEqualTo(409));
        assertThat(storedMastery()).isEqualTo(masteryBefore);
        assertThat(learnerRepository.findById(id()).orElseThrow().getActiveGoalId()).isNull();
    }

    @Test
    void milestoneWithoutPreparationStartsExplicitlyInsideItsSelectionWithoutCreatingDueWork() {
        List<String> targets = selected(EXAM_ROOTS);
        assertThat(storedMastery()).isEmpty();
        plans.upsert(id(), PHYSICS, new LearnerLearningPlanApi.UpsertRequest(0L, "Kinematik",
                List.of(inactiveGeneralCourse(), exam("exam", TODAY.plusDays(5), EXAM_ROOTS))), TODAY);
        learner.setFollowLearningPlans(true);
        learnerRepository.saveAndFlush(learner);
        Map<String, Double> masteryBefore = storedMastery();
        assertThat(plans.reconcile(id(), new LearnerLearningPlanApi.ReconcileRequest(TODAY)).activeGoalId()).isNull();
        assertThat(plans.getTodayStatus(id(), "de").resumeAvailable()).isTrue();
        assertThat(plans.getTodayStatus(id(), "de").automaticResumeAvailable()).isFalse();

        var resumed = coachTools.resumeLearningPlan(id(), "de");
        assertThat(resumed.activeGoalId()).isEqualTo(DIAGRAMS);
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(targets);
        assertThat(resumed.state().goals().planned()).extracting(FrontierGoal::id)
                .containsExactlyInAnyOrderElementsOf(targets);
        assertThat(resumed.state().goals().scope().total_atomic()).isEqualTo(12);
        assertThat(resumed.state().goals().scope_completed()).isFalse();
        assertThat(resumed.state().frontier()).extracting(FrontierGoal::id).allMatch(targets::contains);
        assertThat(physicsStatus().periodGauge().target()).isZero();
        assertThat(physicsStatus().balanceGauge()).isNull();
        entityManager.flush();
        entityManager.clear();
        assertThat(learnerRepository.findById(id()).orElseThrow().getActiveGoalId()).isEqualTo(resumed.activeGoalId());
        assertThat(plans.getPlan(id(), PHYSICS, TODAY).learningScope().goalIds())
                .containsExactlyElementsOf(targets);
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(targets);
        assertThat(storedMastery()).isEqualTo(masteryBefore);
    }

    @Test
    void futurePreparationHasRealScopeAndExplicitStartButNoPrematureAutomaticQuota() {
        var targets = selected(EXAM_ROOTS);
        preparePrerequisites(targets);
        var prep = new LearnerLearningPlanApi.Block("prep", "learning", null, "Vorbereitung",
                TODAY.plusDays(4), TODAY.plusDays(4), null, targets, EXAM_ROOTS, true);
        plans.upsert(id(), PHYSICS, new LearnerLearningPlanApi.UpsertRequest(0L, "Kinematik",
                List.of(inactiveGeneralCourse(), prep, exam("exam", TODAY.plusDays(5), EXAM_ROOTS))), TODAY);
        learner.setFollowLearningPlans(true);
        learnerRepository.saveAndFlush(learner);
        assertThat(physicsStatus().learningScope().schedulingState()).isEqualTo("scheduled");
        assertThat(physicsStatus().periodGauge().target()).isZero();
        assertThat(plans.reconcile(id(), new LearnerLearningPlanApi.ReconcileRequest(TODAY)).activeGoalId()).isNull();
        assertThat(plans.resumeExplicitly(id(), new LearnerLearningPlanApi.ReconcileRequest(TODAY)).activeGoalId())
                .isEqualTo(DIAGRAMS);
    }

    @Test
    void dateChangeAndGenericResumeRemainBoundToFirstExamAndNeverUnionTheSecond() {
        List<String> first = List.of(DIAGRAMS, UNIFORM);
        preparePrerequisites(List.of(DIAGRAMS, UNIFORM, ACCELERATION));
        activate(List.of(inactiveGeneralCourse(), exam("first", TODAY.plusDays(1), first),
                exam("second", TODAY.plusDays(5), List.of(ACCELERATION))));
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(first);
        setDate(TODAY.plusDays(2));
        learners.setMastery(id(), new MasteryUpdateRequest(Map.of(DIAGRAMS, 1.0), DIAGRAMS));
        assertThat(physicsStatus().learningScope().sourceBlockId()).isEqualTo("first");
        assertThat(physicsStatus().learningScope().goalIds()).containsExactlyInAnyOrderElementsOf(first);
        assertThat(plans.resumeExplicitly(id(), new LearnerLearningPlanApi.ReconcileRequest(TODAY.plusDays(2)))
                .activeGoalId()).isEqualTo(UNIFORM);
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(first);
        assertThat(learners.getCoachLearnerState(id()).frontier()).extracting(FrontierGoal::id)
                .doesNotContain(ACCELERATION);
    }

    @Test
    void automaticHandoffKeepsCompleteMultiRootExamFocusAndStopsAtTheDatedQuota() {
        List<String> targets = selected(EXAM_ROOTS);
        preparePrerequisites(targets);
        var prep = new LearnerLearningPlanApi.Block("prep", "learning", null, "Vorbereitung",
                TODAY, TODAY, null, List.of(DIAGRAMS, UNIFORM), List.of(DIAGRAMS, UNIFORM), true);
        activate(List.of(inactiveGeneralCourse(), prep, exam("exam", TODAY.plusDays(5), EXAM_ROOTS)));
        var next = learners.setMastery(id(), new MasteryUpdateRequest(Map.of(DIAGRAMS, 1.0), DIAGRAMS));
        assertThat(next.activeGoal().id()).isEqualTo(UNIFORM);
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(targets);
        var stopped = learners.setMastery(id(), new MasteryUpdateRequest(Map.of(UNIFORM, 1.0), UNIFORM));
        assertThat(stopped.activeGoal()).isNull();
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(targets);
        assertThat(physicsStatus().periodGauge().target()).isEqualTo(2);
    }

    @Test
    void savingAndReadingANewExamPreserveTheCurrentGoalUntilExplicitActivation() {
        preparePrerequisites(List.of(DIAGRAMS));
        learners.setPlannedGoals(id(), Set.of(DIAGRAMS));
        learners.setActiveGoal(id(), DIAGRAMS);
        learner.setFollowLearningPlans(true);
        learnerRepository.saveAndFlush(learner);
        assertThat(learners.getCoachLearnerState(id()).activeGoal().id()).isEqualTo(DIAGRAMS);
        Map<String, Double> masteryBefore = storedMastery();
        var blocks = List.of(inactiveGeneralCourse(), exam("new-exam", TODAY.plusDays(5), List.of(ACCELERATION)));
        var saved = plans.upsert(id(), PHYSICS, new LearnerLearningPlanApi.UpsertRequest(0L, "Neue Klausur", blocks), TODAY);
        long revisionBeforeReads = learnerRepository.findById(id()).orElseThrow().getCoachStateRevision();

        assertThat(learners.getCoachLearnerState(id()).activeGoal().id()).isEqualTo(DIAGRAMS);
        assertThat(learners.getLearnerState(id()).activeGoal().id()).isEqualTo(DIAGRAMS);
        assertThat(learnerRepository.findById(id()).orElseThrow().getActiveGoalId()).isEqualTo(DIAGRAMS);
        assertThat(learnerRepository.findById(id()).orElseThrow().getCoachStateRevision()).isEqualTo(revisionBeforeReads);
        assertThat(storedFocus()).containsExactly(DIAGRAMS);
        assertThat(storedMastery()).isEqualTo(masteryBefore);

        var activated = plans.activatePlans(id(), new LearnerLearningPlanApi.ActivateRequest(TODAY,
                List.of(new LearnerLearningPlanApi.ActivationPlan(PHYSICS, saved.revision(), "Neue Klausur", blocks))));
        assertThat(activated.activeGoalId()).isEqualTo(ACCELERATION);
        assertThat(learnerRepository.findById(id()).orElseThrow().getActiveGoalId()).isEqualTo(ACCELERATION);
        assertThat(storedFocus()).containsExactly(ACCELERATION);
        assertThat(storedMastery()).isEqualTo(masteryBefore);
    }

    @Test
    void weeklyAutomaticHandoffAfterTheFirstExamDateKeepsItsCompleteBoundScope() {
        List<String> first = List.of(DIAGRAMS, UNIFORM);
        List<String> scheduled = List.of(DIAGRAMS, UNIFORM, ACCELERATION);
        preparePrerequisites(scheduled);
        learner.setLearningPlanPeriodBasis(PeriodBasis.WEEK);
        learnerRepository.saveAndFlush(learner);
        var prep = new LearnerLearningPlanApi.Block("prep", "learning", null, "Vorbereitung beider Termine",
                TODAY, TODAY.plusDays(4), null, scheduled, scheduled, true);
        var activated = activate(List.of(inactiveGeneralCourse(), prep,
                exam("first", TODAY.plusDays(1), first), exam("second", TODAY.plusDays(5), List.of(ACCELERATION))));
        assertThat(activated.activeGoalId()).isEqualTo(DIAGRAMS);
        assertThat(plans.getTodayStatus(id(), "de").periodBasis()).isEqualTo(PeriodBasis.WEEK);
        assertThat(physicsStatus().periodGauge().target()).isEqualTo(2);
        Map<String, Double> masteryBefore = storedMastery();

        setDate(TODAY.plusDays(2));
        var completed = learners.setMastery(id(), new MasteryUpdateRequest(Map.of(DIAGRAMS, 1.0), DIAGRAMS));
        assertThat(completed.activeGoal().id()).isEqualTo(UNIFORM);
        assertThat(plans.getPlan(id(), PHYSICS, TODAY.plusDays(2)).nextMilestone().blockId()).isEqualTo("second");
        assertThat(physicsStatus().learningScope().sourceBlockId()).isEqualTo("first");
        assertThat(physicsStatus().learningScope().goalIds()).containsExactlyInAnyOrderElementsOf(first);
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(first);
        assertThat(completed.goals().planned()).extracting(FrontierGoal::id)
                .containsExactlyInAnyOrderElementsOf(first);
        assertThat(physicsStatus().periodGauge().target()).isEqualTo(2);
        assertThat(physicsStatus().periodGauge().completed()).isEqualTo(1);
        assertThat(storedMastery()).containsAllEntriesOf(masteryBefore)
                .containsEntry(DIAGRAMS, 1.0).hasSize(masteryBefore.size() + 1);
    }

    @Test
    void reorderingTheSameFocusDoesNotWriteAnotherLearnerStateRevision() {
        List<String> targets = List.of(DIAGRAMS, UNIFORM);
        preparePrerequisites(targets);
        var activated = activate(List.of(inactiveGeneralCourse(), exam("exam", TODAY.plusDays(5), targets)));
        assertThat(activated.activeGoalId()).isEqualTo(DIAGRAMS);
        var reordered = new ArrayList<>(storedFocus());
        Collections.reverse(reordered);
        assertThat(reordered).isNotEqualTo(storedFocus());
        long revision = learnerRepository.findById(id()).orElseThrow().getCoachStateRevision();
        Map<String, Double> masteryBefore = storedMastery();

        var unchanged = learners.applyLearningPlanScopeTransition(id(), true, true,
                reordered, DIAGRAMS, true, "SAME_EXAM_FOCUS");
        assertThat(unchanged.changed()).isFalse();
        assertThat(learnerRepository.findById(id()).orElseThrow().getCoachStateRevision()).isEqualTo(revision);
        assertThat(unchanged.state().activeGoal().id()).isEqualTo(DIAGRAMS);
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(targets);
        assertThat(storedMastery()).isEqualTo(masteryBefore);
    }

    @Test
    void blockedPhysicsExamDoesNotResumeAnOrdinaryMathPlanButAllowsAnExplicitSubjectSwitch() {
        learner.setStrictMode(true);
        learnerRepository.saveAndFlush(learner);
        var activated = activate(List.of(inactiveGeneralCourse(), exam("exam", TODAY.plusDays(5), EXAM_ROOTS)));
        assertThat(activated.activeGoalId()).isNull();
        String mathOrientation = "65365dce-f33f-49d8-9516-42f75883aa86";
        var mathBlock = new LearnerLearningPlanApi.Block("math", "learning",
                "c01b1ce9-a667-4a46-b251-ec33ae602b15", "Mathematik",
                TODAY, TODAY, null, List.of(mathOrientation), null, true);
        plans.upsert(id(), MATH, new LearnerLearningPlanApi.UpsertRequest(0L, "Mathematik", List.of(mathBlock)), TODAY);
        Map<String, Double> masteryBefore = storedMastery();
        var status = plans.getTodayStatus(id(), "de");
        assertThat(status.subjects()).filteredOn(subject -> subject.landscapeIds().contains(MATH))
                .singleElement().satisfies(subject -> assertThat(subject.canContinue()).isTrue());
        assertThat(status.resumeAvailable()).isFalse();
        assertThat(plans.resumeExplicitly(id(), new LearnerLearningPlanApi.ReconcileRequest(TODAY)).activeGoalId()).isNull();
        assertThat(storedFocus()).containsExactlyInAnyOrderElementsOf(EXAM_ROOTS);
        assertThatThrownBy(() -> coachTools.resumeLearningPlan(id(), "de"))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode().value()).isEqualTo(409));
        assertThat(learnerRepository.findById(id()).orElseThrow().getActiveGoalId()).isNull();

        var switched = coachTools.switchLearningPlanSubject(id(), "de", "Mathematik");
        assertThat(switched.activeGoalId()).isEqualTo(mathOrientation);
        assertThat(switched.landscapeId()).isEqualTo(MATH);
        assertThat(storedMastery()).isEqualTo(masteryBefore);
    }

    @Test
    void fullyInactivePlanHasNoExamScopeAndOffersNoUnselectedSubjectFallback() {
        var inactiveExam = new LearnerLearningPlanApi.Block("exam", "milestone", null, "Klausur",
                null, null, TODAY.plusDays(5), null, EXAM_ROOTS, false);
        var inactiveMath = new LearnerLearningPlanApi.Block("math-general", "learning",
                "c01b1ce9-a667-4a46-b251-ec33ae602b15", "Mathematik pausiert",
                TODAY.minusDays(40), TODAY.plusYears(2), null,
                learners.getPlanningScope(id(), MATH).scopeAtomicGoalIds(), null, false);
        plans.activatePlans(id(), new LearnerLearningPlanApi.ActivateRequest(TODAY, List.of(
                new LearnerLearningPlanApi.ActivationPlan(MATH, 0L, "Mathematik", List.of(inactiveMath)),
                new LearnerLearningPlanApi.ActivationPlan(PHYSICS, 0L, "Physik",
                        List.of(inactiveGeneralCourse(), inactiveExam)))));
        assertThat(physicsStatus().learningScope()).isNull();
        assertThat(physicsStatus().periodText()).isEqualTo("Keine Lernziele eingeplant");
        assertThat(learners.getCoachLearnerState(id()).frontier()).isEmpty();
        assertThat(plans.resumeExplicitly(id(), new LearnerLearningPlanApi.ReconcileRequest(TODAY)).activeGoalId()).isNull();
    }

    private String id() { return learner.getSkillpilotId(); }
    private List<String> selected(List<String> roots) {
        assertThat(learners.getPlanningScope(id(), PHYSICS).scopeAtomicGoalIds())
                .as("The fixture uses the course planner's selected visible canonical atoms")
                .containsAll(roots);
        return learners.resolveLearningPlanGoalIds(id(), PHYSICS, roots);
    }
    private Map<String, Double> storedMastery() {
        return masteryRepository.findByLearner_SkillpilotId(id()).stream()
                .collect(Collectors.toMap(Mastery::getGoalKey, Mastery::getValue));
    }
    private List<String> storedFocus() {
        return focusRepository.findByLearner_SkillpilotId(id()).stream().map(PlannedGoal::getGoalId).toList();
    }
    private LearnerLearningPlanApi.Block inactiveGeneralCourse() {
        return new LearnerLearningPlanApi.Block("general", "learning", ROOT, "Oberstufe Physik",
                TODAY.minusDays(40), TODAY.plusYears(2), null,
                learners.getPlanningScope(id(), PHYSICS).scopeAtomicGoalIds(), null, false);
    }
    private LearnerLearningPlanApi.Block exam(String blockId, LocalDate date, List<String> roots) {
        return new LearnerLearningPlanApi.Block(blockId, "milestone", null, "Klausur " + blockId,
                null, null, date, null, roots, true);
    }
    private LearnerLearningPlanApi.ActivateResponse activate(List<LearnerLearningPlanApi.Block> blocks) {
        return plans.activatePlans(id(), new LearnerLearningPlanApi.ActivateRequest(TODAY,
                List.of(new LearnerLearningPlanApi.ActivationPlan(PHYSICS, 0L, "Physik", blocks))));
    }
    private LearnerPlanTodayStatus.SubjectStatus physicsStatus() {
        return plans.getTodayStatus(id(), "de").subjects().stream()
                .filter(subject -> subject.landscapeIds().contains(PHYSICS)).findFirst().orElseThrow();
    }
    private void setDate(LocalDate date) {
        Clock clock = Clock.fixed(date.atStartOfDay(BERLIN).toInstant(), BERLIN);
        ReflectionTestUtils.setField(plans, "clock", clock);
        ReflectionTestUtils.setField(learners, "learningPlanClock", clock);
    }
    private void preparePrerequisites(List<String> targets) {
        var prerequisites = CanonicalPrerequisiteTestContext.withStoredPrerequisites(landscapes, targets, List.of(), Set.of());
        masteryRepository.saveAllAndFlush(prerequisites.stream()
                .filter(goalId -> landscapes.getGoalDefinition(goalId).getContains() == null
                        || landscapes.getGoalDefinition(goalId).getContains().isEmpty())
                .map(goalId -> new Mastery(learner, goalId, 1.0)).toList());
        assertThat(learners.getUncompactedRichFrontierForFocus(id(), targets))
                .as("The explicit prior-knowledge fixture must make diagrams reachable: %s",
                        learners.describeLearningPlanBlockage(id(), targets, "de"))
                .extracting(FrontierGoal::id).contains(DIAGRAMS);
    }
}
