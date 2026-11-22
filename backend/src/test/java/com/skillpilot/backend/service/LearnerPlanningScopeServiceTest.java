package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LearnerPlanningScopeServiceTest {

    private static final String LEARNER_ID = "planning-scope-learner";
    private static final String CURRICULUM_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH_LANDSCAPE_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PHYSICS_LANDSCAPE_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String MOTION_OPENING = "a4d4efe1-7d30-526b-ac9c-806113da4363";
    private static final String FALL_OPENING = "b4e95dce-8537-5e38-8aa6-0d9cfaa2b19e";
    private static final String MODEL_GOAL = "d6dc0e02-831d-4894-a61a-852bcc74f147";
    private static final String FALL_GOAL = "e4b38061-1f28-43ad-8371-a3e7c0e81856";
    private static final String MOTION_SCOPE = "composition:de-he-gym-physics-gk-g9:structure:physics-e1-motion";
    private static final String FALL_SCOPE = "composition:de-he-gym-physics-gk-g9:structure:physics-e1-accelerated-and-free-fall";
    private static final String SEK_ONE_SCOPE_ID =
            "composition:de-he-gym-math-gk-g9:structure:sek1-g9";
    private static final String DE_PHYSICS_LK_SCOPE_ID =
            "composition:de-de-gym-physics-lk:structure:physics-root";
    private static final List<String> OPAQUE_PHYSICS_PRESENTATION_CLUSTER_IDS = List.of(
            "424b07df-bf66-5d7f-99f5-f28b32ad1f22",
            "549a427d-f10a-5537-990e-6fdd7466848b",
            "9dd7c596-a751-523c-acba-916f73e900a5",
            "b47a2a23-b56d-5433-9036-075d6bb7c782",
            "85bbad98-2f48-5d64-85c4-ab6cf67f24c2",
            "61684ca7-b725-534f-944b-c7645cea1792",
            "79028c45-90ae-57eb-8016-f5a96af18fa2");

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private MasteryRepository masteryRepository;

    @Autowired
    private PlannedGoalRepository plannedGoalRepository;

    @Autowired
    private LandscapeService landscapeService;

    @Autowired
    private CompositionViewService compositionViewService;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setLearningStrategy("RANDOM");
        learner.setAutoPilot(false);
        learnerRepository.saveAndFlush(learner);
    }

    @Test
    void completeLevelTwoScopeIsIndependentOfLevelThreeFocusAndReturnsExactlyTheOpenRemainder() {
        selectHessenG9Math();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();

        var initial = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID);

        assertThat(initial.curriculumId()).isEqualTo(CURRICULUM_ID);
        assertThat(initial.landscapeId()).isEqualTo(MATH_LANDSCAPE_ID);
        assertThat(initial.scopeAtomicGoalIds()).isNotEmpty().doesNotHaveDuplicates();
        assertThat(initial.totalAtomicGoalCount())
                .isEqualTo(initial.scopeAtomicGoalIds().size());
        assertThat(initial.masteredAtomicGoalCount()).isZero();
        assertThat(initial.openAtomicGoalIds())
                .containsExactlyElementsOf(initial.scopeAtomicGoalIds());
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();

        learnerService.setPlannedGoals(LEARNER_ID, Set.of(SEK_ONE_SCOPE_ID));
        var focusedState = learnerService.getCoachLearnerState(LEARNER_ID);
        var afterFocusChange = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID);

        assertThat(afterFocusChange.scopeAtomicGoalIds())
                .containsExactlyElementsOf(initial.scopeAtomicGoalIds());
        assertThat(afterFocusChange.openAtomicGoalIds())
                .containsExactlyElementsOf(initial.openAtomicGoalIds());
        assertThat(afterFocusChange.totalAtomicGoalCount())
                .isEqualTo(initial.totalAtomicGoalCount())
                .isGreaterThan(focusedState.goals().scope().total_atomic());

        Learner learner = learnerRepository.findById(LEARNER_ID).orElseThrow();
        int masteredGoalCount = initial.scopeAtomicGoalIds().size() - 53;
        List<String> directlyMasterableGoalIds = initial.scopeAtomicGoalIds().stream()
                .filter(goalId -> !isSrsManagedGoal(goalId))
                .toList();
        assertThat(directlyMasterableGoalIds).hasSizeGreaterThanOrEqualTo(masteredGoalCount);
        List<String> masteredGoalIds = directlyMasterableGoalIds.subList(0, masteredGoalCount);
        Set<String> masteredGoalIdSet = Set.copyOf(masteredGoalIds);
        List<String> expectedOpenGoalIds = initial.scopeAtomicGoalIds().stream()
                .filter(goalId -> !masteredGoalIdSet.contains(goalId))
                .toList();
        masteryRepository.saveAllAndFlush(java.util.stream.IntStream.range(0, masteredGoalIds.size())
                .mapToObj(index -> new Mastery(
                        learner,
                        masteredGoalIds.get(index),
                        index == masteredGoalIds.size() - 1 ? 0.9 : 1.0))
                .toList());
        long revisionBefore = learner.getCoachStateRevision();

        var snapshot = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID);

        assertThat(snapshot.totalAtomicGoalCount()).isEqualTo(initial.totalAtomicGoalCount());
        assertThat(snapshot.masteredAtomicGoalCount()).isEqualTo(masteredGoalCount);
        assertThat(snapshot.openAtomicGoalIds())
                .hasSize(53)
                .containsExactlyElementsOf(expectedOpenGoalIds);
        assertThat(snapshot.scopeAtomicGoalIds())
                .containsExactlyElementsOf(initial.scopeAtomicGoalIds());
        assertThat(snapshot.capturedAt()).isNotNull();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .singleElement()
                .satisfies(goal -> assertThat(goal.getGoalId()).isEqualTo(SEK_ONE_SCOPE_ID));
        assertThat(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .hasSize(masteredGoalCount);
        assertThat(learnerRepository.findById(LEARNER_ID).orElseThrow().getCoachStateRevision())
                .isEqualTo(revisionBefore);
    }

    @Test
    void combinedHessenG9MathPlanningScopeIncludesCrossPhaseCompositionTargetAtoms() {
        selectHessenG9MathCombined();

        var snapshot = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID);

        assertThat(snapshot.scopeAtomicGoalIds())
                .hasSizeGreaterThanOrEqualTo(15)
                .doesNotHaveDuplicates()
                .contains(
                        "49f9059a-876c-5051-8146-d008b5cc691c",
                        "b66d13c5-187e-530b-b4d3-efc7506a7f34",
                        "6a66b4f5-d36e-5b53-91ad-cf25a849d66b",
                        "10efb267-9733-5db3-a807-03f4cf54e336",
                        "f1eee698-04c6-5d60-bcc6-a3c67129eea2",
                        "4d55ba50-8d67-560c-a10f-cccff4728c40",
                        "565fcd3f-52cd-5402-a0ac-a1069ed9c598",
                        "c66cb27b-8199-58fb-95f4-6314c0c2d07b",
                        "911f3200-1dbc-59a6-90df-c883c77de39c",
                        "3773bd34-3631-5fd2-b9b7-dfa01adf5abd",
                        "1b664036-3c29-5d94-9f42-97069aaa2c53",
                        "315093d4-515a-542c-b776-d72a12763d1a")
                .doesNotContain(
                        "dc12f281-f161-572b-a973-8405ae9b2498",
                        "0b162cb0-8507-5ac2-b9d6-57f40f4d3f35",
                        "71fe4a39-38e8-5c6a-8eef-ff4783fe70c2");
        assertThat(snapshot.totalAtomicGoalCount())
                .isEqualTo(snapshot.scopeAtomicGoalIds().size());
        assertThat(snapshot.openAtomicGoalIds())
                .containsExactlyElementsOf(snapshot.scopeAtomicGoalIds());
    }

    @Test
    void mathematicsPlanningScopeRespectsHessenAndBavariaAdvancedCourseGoals() {
        String hessenFixedPoints = "d3c42193-f1b7-5c6d-a991-bf034d99359f";
        String bavariaModelValidation = "71fe4a39-38e8-5c6a-8eef-ff4783fe70c2";
        String advancedParallelProjection = "803d910d-96d1-5118-b9ca-29e93d0da76d";
        String advancedSequenceAnalysis = "b66d13c5-187e-530b-b4d3-efc7506a7f34";
        String advancedIntegralContext = "0b162cb0-8507-5ac2-b9d6-57f40f4d3f35";
        String bavariaNormalDistribution = "b431148b-526c-4bde-b04b-48d23101d0d3";
        String bavariaExponentialGrowth = "49f9059a-876c-5051-8146-d008b5cc691c";
        String bavariaVertiefungMandelbrot = "9b339361-7719-573d-a913-432246c502ee";
        String sharedMatrixAssessment = "81823f27-0c92-5444-ac4e-32b83169f318";

        selectMathScope("DE-HE", "GK");
        var hessenGkProjection = learnerService.getLearnerLandscapeClosure(LEARNER_ID, CURRICULUM_ID, "de")
                .stream().filter(landscape -> MATH_LANDSCAPE_ID.equals(landscape.getLandscapeId()))
                .findFirst().orElseThrow().getPersonalCurriculumProjection();
        assertThat(landscapeService.getGoalDefinition(sharedMatrixAssessment).getTags())
                .contains("GK", "LK", "Practice", "Assessment");
        assertThat(landscapeService.getGoalDefinition(sharedMatrixAssessment).getRequires())
                .contains(advancedParallelProjection, hessenFixedPoints);
        assertThat(hessenGkProjection.seedAtomicGoalIds()).contains(sharedMatrixAssessment)
                .doesNotContain(advancedParallelProjection, hessenFixedPoints);
        assertThat(hessenGkProjection.targetGoalIds()).contains(advancedParallelProjection, hessenFixedPoints);
        assertThat(hessenGkProjection.requiredByPaths())
                .containsEntry(advancedParallelProjection, List.of(sharedMatrixAssessment, advancedParallelProjection))
                .containsEntry(hessenFixedPoints, List.of(sharedMatrixAssessment, hessenFixedPoints));
        for (String necessary : List.of(advancedParallelProjection, hessenFixedPoints)) {
            assertThat(landscapeService.getGoalDefinition(necessary).getTags()).contains("LK").doesNotContain("GK");
        }
        assertThat(learnerService.getPlanningScope(LEARNER_ID, MATH_LANDSCAPE_ID).scopeAtomicGoalIds())
                .contains(sharedMatrixAssessment, hessenFixedPoints, advancedParallelProjection)
                .doesNotContain(advancedIntegralContext);
        assertThat(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();
        selectMathScope("DE-HE", "LK");
        assertThat(learnerService.getPlanningScope(LEARNER_ID, MATH_LANDSCAPE_ID).scopeAtomicGoalIds())
                .contains(hessenFixedPoints, advancedParallelProjection)
                .doesNotContain(advancedIntegralContext);

        selectMathScope("DE-BY", "GK");
        assertThat(compositionViewService.findLearnerScopeView(MATH_LANDSCAPE_ID, Map.of(
                "schoolForm", "Gymnasium", "jurisdiction", "DE-BY", "stage", "CrossStage",
                "durationModel", "G9", "courseProfile", "GK")))
                .containsEntry("viewId", "de-by-gym-math-gk");
        var bavariaGk = learnerService.getPlanningScope(LEARNER_ID, MATH_LANDSCAPE_ID).scopeAtomicGoalIds();
        assertThat(landscapeService.getLandscapeIdForGoal(advancedIntegralContext))
                .isEqualTo(MATH_LANDSCAPE_ID);
        assertThat(landscapeService.getGoalDefinition(advancedIntegralContext)).isNotNull();
        assertThat(bavariaGk)
                .contains(bavariaModelValidation, advancedIntegralContext,
                        bavariaNormalDistribution, bavariaExponentialGrowth)
                .doesNotContain(bavariaVertiefungMandelbrot);
        selectMathScope("DE-BY", "LK");
        assertThat(learnerService.getPlanningScope(LEARNER_ID, MATH_LANDSCAPE_ID).scopeAtomicGoalIds())
                .containsAll(bavariaGk)
                .contains(bavariaModelValidation, bavariaVertiefungMandelbrot);

        for (String courseProfile : List.of("GK", "LK")) {
            selectMathScope("DE-NI", courseProfile);
            var lowerSaxonyProjection = learnerService.getLearnerLandscapeClosure(LEARNER_ID, CURRICULUM_ID, "de")
                    .stream().filter(landscape -> MATH_LANDSCAPE_ID.equals(landscape.getLandscapeId()))
                    .findFirst().orElseThrow().getPersonalCurriculumProjection();
            assertThat(lowerSaxonyProjection.seedAtomicGoalIds()).contains(sharedMatrixAssessment)
                    .doesNotContain(advancedParallelProjection, hessenFixedPoints);
            assertThat(lowerSaxonyProjection.targetGoalIds()).contains(advancedParallelProjection, hessenFixedPoints);
            assertThat(lowerSaxonyProjection.requiredByPaths())
                    .containsEntry(advancedParallelProjection, List.of(sharedMatrixAssessment, advancedParallelProjection))
                    .containsEntry(hessenFixedPoints, List.of(sharedMatrixAssessment, hessenFixedPoints));
            var lowerSaxonyTargets = learnerService.getPlanningScope(LEARNER_ID, MATH_LANDSCAPE_ID).scopeAtomicGoalIds();
            assertThat(lowerSaxonyTargets).contains(sharedMatrixAssessment, advancedParallelProjection, hessenFixedPoints)
                    .doesNotContain(advancedIntegralContext);
            if ("GK".equals(courseProfile)) {
                assertThat(lowerSaxonyTargets).doesNotContain(advancedSequenceAnalysis);
            } else {
                assertThat(lowerSaxonyTargets).contains(advancedSequenceAnalysis);
            }
        }
    }

    @Test
    void multiSubjectLevelTwoScopeIsStrictlyCutToTheRequestedLandscapeAndIgnoresFocus() {
        selectNationalMathAndPhysicsLk();

        var mathBeforeFocus = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID);
        var physicsBeforeFocus = learnerService.getPlanningScope(
                LEARNER_ID,
                PHYSICS_LANDSCAPE_ID);

        learnerService.setScope(
                LEARNER_ID,
                List.of(DE_PHYSICS_LK_SCOPE_ID));

        var mathAfterPhysicsFocus = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID);
        var physicsAfterPhysicsFocus = learnerService.getPlanningScope(
                LEARNER_ID,
                PHYSICS_LANDSCAPE_ID);

        assertThat(mathBeforeFocus.scopeAtomicGoalIds())
                .isNotEmpty()
                .allSatisfy(goalId -> assertThat(landscapeService.getLandscapeIdForGoal(goalId))
                        .isEqualTo(MATH_LANDSCAPE_ID));
        assertThat(physicsBeforeFocus.scopeAtomicGoalIds())
                .isNotEmpty()
                .allSatisfy(goalId -> assertThat(landscapeService.getLandscapeIdForGoal(goalId))
                        .isEqualTo(PHYSICS_LANDSCAPE_ID));
        assertThat(mathBeforeFocus.scopeAtomicGoalIds())
                .doesNotContainAnyElementsOf(physicsBeforeFocus.scopeAtomicGoalIds());
        assertThat(mathAfterPhysicsFocus.scopeAtomicGoalIds())
                .containsExactlyElementsOf(mathBeforeFocus.scopeAtomicGoalIds());
        assertThat(physicsAfterPhysicsFocus.scopeAtomicGoalIds())
                .containsExactlyElementsOf(physicsBeforeFocus.scopeAtomicGoalIds());
        assertPlanningScopeContainsOnlyStructuralAtoms(mathBeforeFocus.scopeAtomicGoalIds());
        assertPlanningScopeContainsOnlyStructuralAtoms(physicsBeforeFocus.scopeAtomicGoalIds());
    }

    @Test
    void combinedHessenPhysicsPlanningScopeExcludesOpaquePresentationClusters() {
        selectHessenG9PhysicsCombined();

        var snapshot = learnerService.getPlanningScope(
                LEARNER_ID,
                PHYSICS_LANDSCAPE_ID);

        assertThat(snapshot.scopeAtomicGoalIds())
                .isNotEmpty()
                .doesNotHaveDuplicates()
                .doesNotContainAnyElementsOf(OPAQUE_PHYSICS_PRESENTATION_CLUSTER_IDS);
        assertThat(snapshot.openAtomicGoalIds())
                .containsExactlyElementsOf(snapshot.scopeAtomicGoalIds());
        assertPlanningScopeContainsOnlyStructuralAtoms(snapshot.scopeAtomicGoalIds());
    }

    @Test
    void guidedUnitEntryIsReadOnlyAndKeepsParentBeforeChildWithoutRequiringTheParentForExplicitChildFocus() {
        selectHessenPhysics("G9", "GK");
        learnerService.setPlannedGoals(LEARNER_ID, Set.of(MOTION_SCOPE));
        assertThat(learnerService.getFrontier(LEARNER_ID)).containsExactly(MOTION_OPENING);
        assertThat(learnerService.getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id).containsExactly(MOTION_OPENING);
        assertThat(learnerService.getRequiredUnitOrientationGoalId(LEARNER_ID, MODEL_GOAL)).isEqualTo(MOTION_OPENING);
        assertThat(learnerService.getRequiredUnitOrientationGoalId(LEARNER_ID, FALL_SCOPE)).isEqualTo(FALL_OPENING);
        assertThat(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();

        learnerService.setPlannedGoals(LEARNER_ID, Set.of(FALL_SCOPE));
        assertThat(learnerService.getFrontier(LEARNER_ID)).containsExactly(FALL_OPENING);
        assertThat(learnerService.getUncompactedRichFrontierForFocus(LEARNER_ID, List.of(FALL_SCOPE)))
                .extracting(FrontierGoal::id).containsExactly(FALL_OPENING);
        assertThat(learnerService.getRequiredUnitOrientationGoalId(LEARNER_ID, FALL_GOAL)).isEqualTo(FALL_OPENING);
        assertThat(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();
    }

    @Test
    void confirmingTheOpeningResumesTheExactOrdinaryGoalAndLeavesOtherResultsAlone() {
        Learner learner = selectHessenPhysics("G9", "GK");
        String selectedGoal = "8aff7aac-321b-5172-ac55-877876bfd2cd";
        learnerService.setPlannedGoals(LEARNER_ID, Set.of(MOTION_SCOPE));
        learnerService.setActiveGoal(LEARNER_ID, selectedGoal);
        assertThat(learner.getActiveGoalId()).isEqualTo(MOTION_OPENING);
        assertThat(learner.getPendingUnitEntry()).contains(selectedGoal);
        assertThat(objectMapper.valueToTree(learner).has("pendingUnitEntry")).isFalse();
        String parked = learner.getPendingUnitEntry();
        long revision = learner.getCoachStateRevision();
        learnerService.setActiveGoal(LEARNER_ID, MOTION_OPENING);
        learnerService.setActiveGoal(LEARNER_ID, MOTION_OPENING);
        assertThat(learner.getPendingUnitEntry()).isEqualTo(parked);
        assertThat(learner.getCoachStateRevision()).isEqualTo(revision);
        assertThat(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();

        learnerService.setMastery(LEARNER_ID, new MasteryUpdateRequest(Map.of(MOTION_OPENING, 1.0), MOTION_OPENING));
        assertThat(learner.getActiveGoalId()).isEqualTo(selectedGoal);
        assertThat(learner.getPendingUnitEntry()).isNull();
        assertThat(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).singleElement()
                .satisfies(result -> assertThat(result.getGoalKey()).isEqualTo(MOTION_OPENING));
        assertThat(learnerService.getRequiredUnitOrientationGoalId(LEARNER_ID, MODEL_GOAL)).isNull();
        assertThat(learnerService.getRequiredUnitOrientationGoalId(LEARNER_ID, FALL_GOAL)).isEqualTo(FALL_OPENING);
    }

    @Test
    void persistedSubjectProgressDoesNotInventOpeningCreditAndExistingActiveWorkIsPreserved() {
        Learner learner = selectHessenPhysics("G9", "GK");
        learnerService.setPlannedGoals(LEARNER_ID, Set.of(MOTION_SCOPE));
        masteryRepository.saveAndFlush(new Mastery(learner, MODEL_GOAL, 1.0));
        learner.setActiveGoalId(FALL_GOAL);
        learnerRepository.saveAndFlush(learner);
        assertThat(learnerService.getCoachLearnerState(LEARNER_ID).activeGoal().id()).isEqualTo(FALL_GOAL);
        assertThat(learnerService.getRequiredUnitOrientationGoalId(LEARNER_ID, FALL_GOAL)).isEqualTo(MOTION_OPENING);
        assertThat(learnerService.getRichFrontier(LEARNER_ID)).extracting(FrontierGoal::id).containsExactly(MOTION_OPENING);
        assertThat(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).singleElement()
                .satisfies(result -> assertThat(result.getGoalKey()).isEqualTo(MODEL_GOAL));
    }

    @Test
    void largePhaseResourceDoesNotInheritAChildOpeningAndAnExplicitChildHandoffStaysChild() {
        Learner learner = selectHessenPhysics("G9", "GK");
        learnerService.setPlannedGoals(LEARNER_ID, Set.of(MOTION_SCOPE));
        assertThat(learnerService.getRequiredUnitOrientationGoalId(LEARNER_ID,
                "composition:de-he-gym-physics-gk-g9:structure:physics-e-phase")).isNull();
        assertThat(learnerService.getRequiredUnitOrientationGoalId(LEARNER_ID, FALL_SCOPE)).isEqualTo(FALL_OPENING);
        learnerService.setActiveGoal(LEARNER_ID, FALL_OPENING);
        assertThat(learnerService.getPlannedGoals(LEARNER_ID)).containsExactly(FALL_SCOPE);
        assertThat(learnerService.getCoachLearnerState(LEARNER_ID).activeGoal().id()).isEqualTo(FALL_OPENING);
        assertThat(learner.getActiveGoalId()).isEqualTo(FALL_OPENING);
        assertThat(learnerService.getCoachActiveGoalContext(LEARNER_ID, FALL_OPENING,
                learner.getCoachStateRevision(), "de", Set.of(), true).unitIntroduction().orientationGoalId()).isEqualTo(FALL_OPENING);
        assertThat(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();
        learnerService.setMastery(LEARNER_ID, new MasteryUpdateRequest(Map.of(FALL_OPENING, 1.0), FALL_OPENING));
        assertThat(learnerService.getCoachLearnerState(LEARNER_ID).goals().planned()).extracting(FrontierGoal::id).containsExactly(FALL_SCOPE);
        assertThat(learnerService.getRequiredUnitOrientationGoalId(LEARNER_ID, FALL_GOAL)).isNull();
        learnerService.setActiveGoal(LEARNER_ID, FALL_GOAL);
        assertThat(learnerService.getCoachLearnerState(LEARNER_ID).activeGoal().id()).isEqualTo(FALL_GOAL);
        assertThat(learnerService.getMastery(LEARNER_ID)).doesNotContainKey(MOTION_OPENING);
    }

    @Test
    void aStrictSelectedGoalResumesThroughRealFoundationsAfterItsOpening() {
        Learner learner = selectHessenPhysics("G9", "GK");
        learner.setStrictMode(true);
        learnerRepository.saveAndFlush(learner);
        String target = "8aff7aac-321b-5172-ac55-877876bfd2cd";
        learnerService.setPlannedGoals(LEARNER_ID, Set.of(MOTION_SCOPE));
        learnerService.setActiveGoal(LEARNER_ID, target);
        learnerService.setMastery(LEARNER_ID, new MasteryUpdateRequest(Map.of(MOTION_OPENING, 1.0), MOTION_OPENING));
        assertThat(learner.getActiveGoalId()).isEqualTo("5c44b9ba-9b05-4774-95d5-073230d3fc4f");
        assertThat(learner.getPendingUnitEntry()).contains(target);
        learnerService.setMastery(LEARNER_ID, new MasteryUpdateRequest(Map.of(learner.getActiveGoalId(), 1.0), learner.getActiveGoalId()));
        assertThat(learner.getActiveGoalId()).isEqualTo(target);
        assertThat(learner.getPendingUnitEntry()).isNull();
    }

    @ParameterizedTest
    @ValueSource(strings = {"G8", "G9"})
    void physicsActiveContextUsesSelectedDurationAndOnlyStoredPrerequisiteEvidence(String duration) {
        Learner learner = selectHessenPhysics(duration, "GK");
        String throwGoalId = "89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2";
        String assessmentId = "a9562b05-c54d-5635-9244-3f7dd24a8642";
        String modelGoalId = "d6dc0e02-831d-4894-a61a-852bcc74f147";
        String focus = "composition:de-he-gym-physics-gk-" + duration.toLowerCase(java.util.Locale.ROOT)
                + ":structure:physics-e1-motion";
        long initialRevision = learner.getCoachStateRevision();
        assertThat(learnerService.getCoachActiveGoalContext(LEARNER_ID, null, initialRevision, "de", Set.of(), true)).isNull();
        learnerService.setPlannedGoals(LEARNER_ID, Set.of(focus));
        long revision = learner.getCoachStateRevision();
        var entry = learnerService.getCoachActiveGoalContext(LEARNER_ID, null, revision, "de", Set.of(), true);
        assertThat(entry).isNotNull();
        assertThat(entry.goalId()).isNull();
        assertThat(entry.practiceExercise()).isNull();
        assertThat(entry.unitIntroduction().question()).isEqualTo("Ein Ball rollt vom Tisch. Wo landet er?");
        assertThat(entry.unitPaths()).anySatisfy(path -> {
            assertThat(path.sections()).contains("E.1 Bewegungen und ihre Beschreibung");
            assertThat(path.inCurrentFocus()).isTrue();
        });

        learner.setActiveGoalId(throwGoalId);
        learnerRepository.saveAndFlush(learner);
        masteryRepository.saveAndFlush(new Mastery(learner, modelGoalId, 1.0));
        var context = learnerService.getCoachActiveGoalContext(LEARNER_ID, throwGoalId, revision, "de", Set.of(), true);
        assertThat(context).isNotNull();
        assertThat(context.practiceExercise().title()).isEqualTo("Wo muss die Bodenmarke liegen?");
        assertThat(context.practiceExercise().prompt()).contains("0,80 m hohen Tisch waagerecht");
        assertThat(learnerService.getCoachActiveGoalContext(LEARNER_ID, throwGoalId, revision, "de", Set.of(), false)
                .practiceExercise()).isNull();
        assertThat(context.unitPaths()).anySatisfy(path -> assertThat(path.sections())
                .contains("E.1 Bewegungen und ihre Beschreibung"));
        assertThat(context.prerequisites()).anySatisfy(prerequisite -> {
            assertThat(prerequisite.title()).isEqualTo("Modellierung und Idealisierung von Bewegungen");
            assertThat(prerequisite.recorded()).isTrue();
        }).anySatisfy(prerequisite -> assertThat(prerequisite.recorded()).isFalse());
        assertThat(context.activities()).anySatisfy(activity -> {
            assertThat(activity.goalId()).isEqualTo(assessmentId);
            assertThat(activity.route()).isEqualTo("cockpit");
        });
        assertThat(learnerService.getCoachActiveGoalContext(LEARNER_ID, throwGoalId, revision + 1, "de", Set.of(), true)).isNull();
        assertThat(learnerService.getCoachActiveGoalContext(LEARNER_ID, assessmentId, revision, "de", Set.of(), true)).isNull();

        learner.setActiveGoalId(assessmentId);
        learnerRepository.saveAndFlush(learner);
        var exam = learnerService.getCoachActiveGoalContext(LEARNER_ID, assessmentId, revision, "de", Set.of(), true);
        assertThat(exam.goalId()).isEqualTo(assessmentId);
        assertThat(exam.phase()).isEqualTo("E");
        assertThat(exam.unitIntroduction()).isNull();
        assertThat(exam.practiceExercise()).isNull();
        assertThat(exam.unitPaths()).isEmpty();
        assertThat(exam.prerequisites()).isEmpty();
        assertThat(exam.activities()).isEmpty();

        selectNationalMathAndPhysicsLk();
        learner.setActiveGoalId(throwGoalId);
        learnerRepository.saveAndFlush(learner);
        var otherView = learnerService.getCoachActiveGoalContext(LEARNER_ID, throwGoalId,
                learner.getCoachStateRevision(), "de", Set.of(), true);
        if (otherView != null) assertThat(otherView.practiceExercise()).isNull();
    }

    @Test
    void levelTwoSnapshotDoesNotPersistOrRepairLevelThreeState() {
        selectHessenG9Math();
        long revisionBefore = learnerRepository.findById(LEARNER_ID)
                .orElseThrow()
                .getCoachStateRevision();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();

        var snapshot = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID);

        assertThat(snapshot.scopeAtomicGoalIds()).isNotEmpty();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();
        assertThat(learnerRepository.findById(LEARNER_ID).orElseThrow().getCoachStateRevision())
                .isEqualTo(revisionBefore);
    }

    @Test
    void unrelatedLandscapeOrIncompletePersonalizationFailsClosed() {
        selectHessenG9Math();

        assertThatThrownBy(() -> learnerService.getPlanningScope(
                        LEARNER_ID,
                        PHYSICS_LANDSCAPE_ID))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));

        Learner learner = learnerRepository.findById(LEARNER_ID).orElseThrow();
        learner.setPersonalCurriculum("{}");
        learnerRepository.saveAndFlush(learner);

        assertThatThrownBy(() -> learnerService.getPlanningScope(
                        LEARNER_ID,
                        MATH_LANDSCAPE_ID))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
    }

    private void selectHessenG9Math() {
        selectMathScope("DE-HE", "GK");
    }

    private void selectMathScope(String jurisdiction, String courseProfile) {
        Learner learner = learnerRepository.findById(LEARNER_ID).orElseThrow();
        learner.setSelectedCurriculum(CURRICULUM_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig(Map.of(
                CURRICULUM_ID, Map.of(
                        "selected", true,
                        "filterId", jurisdiction,
                        "stage", "CrossStage",
                        "durationModel", "G9"),
                MATH_LANDSCAPE_ID, Map.of(
                        "selected", true,
                        "filterId", courseProfile))));
        learnerRepository.saveAndFlush(learner);
    }

    private void selectHessenG9MathCombined() {
        Learner learner = learnerRepository.findById(LEARNER_ID).orElseThrow();
        learner.setSelectedCurriculum(CURRICULUM_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig(Map.of(
                CURRICULUM_ID, Map.of(
                        "selected", true,
                        "filterId", "DE-HE",
                        "stage", "CrossStage",
                        "durationModel", "G9"),
                MATH_LANDSCAPE_ID, Map.of(
                        "selected", true,
                        "filterId", "GK+LK"))));
        learnerRepository.saveAndFlush(learner);
    }

    private void selectHessenG9PhysicsCombined() {
        selectHessenPhysics("G9", "GK+LK");
    }

    private Learner selectHessenPhysics(String duration, String profile) {
        Learner learner = learnerRepository.findById(LEARNER_ID).orElseThrow();
        learner.setSelectedCurriculum(CURRICULUM_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig(Map.of(
                CURRICULUM_ID, Map.of(
                        "selected", true,
                        "filterId", "DE-HE",
                        "stage", "CrossStage",
                        "durationModel", duration),
                PHYSICS_LANDSCAPE_ID, Map.of(
                        "selected", true,
                        "filterId", profile))));
        learnerRepository.saveAndFlush(learner);
        return learner;
    }

    private void assertPlanningScopeContainsOnlyStructuralAtoms(List<String> goalIds) {
        assertThat(goalIds).allSatisfy(goalId -> {
            var structuralGoal = landscapeService.getGoalDefinition(goalId);
            assertThat(structuralGoal)
                    .as("structural definition for planning goal %s", goalId)
                    .isNotNull();
            assertThat(structuralGoal.getType())
                    .as("canonical node type for planning goal %s", goalId)
                    .isNotEqualTo("cluster");
        });
    }

    private boolean isSrsManagedGoal(String goalId) {
        var goal = landscapeService.getGoalDefinition(goalId);
        if (goal == null) {
            return false;
        }
        Map<String, Object> extendedData = goal.getExtendedData();
        if (extendedData != null && extendedData.get("vocabularySource") instanceof String) {
            return true;
        }
        return goal.getTags() != null && goal.getTags().stream()
                .anyMatch(tag -> tag != null
                        && (tag.startsWith("srs-deck") || "memorization".equals(tag)));
    }

    private void selectNationalMathAndPhysicsLk() {
        Learner learner = learnerRepository.findById(LEARNER_ID).orElseThrow();
        learner.setSelectedCurriculum(CURRICULUM_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig(Map.of(
                CURRICULUM_ID, Map.of(
                        "selected", true,
                        "filterId", "ALL",
                        "stage", "CrossStage",
                        "durationModel", "G9"),
                MATH_LANDSCAPE_ID, Map.of(
                        "selected", true,
                        "filterId", "LK"),
                PHYSICS_LANDSCAPE_ID, Map.of(
                        "selected", true,
                        "filterId", "LK"))));
        learnerRepository.saveAndFlush(learner);
    }

    private String completedPersonalizationConfig(Map<String, Map<String, Object>> selections) {
        try {
            Map<String, Object> config = new LinkedHashMap<>(selections);
            config.put(
                    CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY,
                    Map.of(
                            CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY,
                            CURRICULUM_ID,
                            CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY,
                            List.of(),
                            CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY,
                            true));
            return objectMapper.writeValueAsString(config);
        } catch (Exception exception) {
            throw new AssertionError("Invalid planning-scope test fixture", exception);
        }
    }
}
