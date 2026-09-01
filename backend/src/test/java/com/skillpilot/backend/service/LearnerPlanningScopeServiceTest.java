package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
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
                        "315093d4-515a-542c-b776-d72a12763d1a",
                        "dc12f281-f161-572b-a973-8405ae9b2498",
                        "0b162cb0-8507-5ac2-b9d6-57f40f4d3f35",
                        "71fe4a39-38e8-5c6a-8eef-ff4783fe70c2");
        assertThat(snapshot.totalAtomicGoalCount())
                .isEqualTo(snapshot.scopeAtomicGoalIds().size());
        assertThat(snapshot.openAtomicGoalIds())
                .containsExactlyElementsOf(snapshot.scopeAtomicGoalIds());
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
                        "filterId", "GK"))));
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
        Learner learner = learnerRepository.findById(LEARNER_ID).orElseThrow();
        learner.setSelectedCurriculum(CURRICULUM_ID);
        learner.setPersonalCurriculum(completedPersonalizationConfig(Map.of(
                CURRICULUM_ID, Map.of(
                        "selected", true,
                        "filterId", "DE-HE",
                        "stage", "CrossStage",
                        "durationModel", "G9"),
                PHYSICS_LANDSCAPE_ID, Map.of(
                        "selected", true,
                        "filterId", "GK+LK"))));
        learnerRepository.saveAndFlush(learner);
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
