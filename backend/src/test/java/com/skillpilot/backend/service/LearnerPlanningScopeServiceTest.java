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
    private static final String DE_MATH_LK_SCOPE_ID =
            "composition:de-de-gym-math-lk:structure:math-root";
    private static final String DE_PHYSICS_LK_SCOPE_ID =
            "composition:de-de-gym-physics-lk:structure:physics-root";

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
    void explicitSekOneScopeMirrorsAuthoritativeStatsAndReturnsExactlyTheOpenRemainder() {
        selectHessenG9Math();
        learnerService.setPlannedGoals(LEARNER_ID, Set.of(SEK_ONE_SCOPE_ID));
        var authoritativeState = learnerService.getCoachLearnerState(LEARNER_ID);

        var initial = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID,
                SEK_ONE_SCOPE_ID);
        var currentFocus = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID,
                null);

        assertThat(initial.curriculumId()).isEqualTo(CURRICULUM_ID);
        assertThat(initial.landscapeId()).isEqualTo(MATH_LANDSCAPE_ID);
        assertThat(initial.focusGoalIds()).containsExactly(SEK_ONE_SCOPE_ID);
        assertThat(initial.scopeGoalIds()).isNotEmpty().doesNotHaveDuplicates();
        assertThat(initial.totalAtomicGoalCount())
                .isEqualTo(authoritativeState.goals().scope().total_atomic())
                .isEqualTo(initial.scopeGoalIds().size());
        assertThat(initial.masteredAtomicGoalCount()).isZero();
        assertThat(initial.openAtomicGoalIds()).containsExactlyElementsOf(initial.scopeGoalIds());
        assertThat(currentFocus.focusGoalIds()).containsExactly(SEK_ONE_SCOPE_ID);
        assertThat(currentFocus.scopeGoalIds()).containsExactlyElementsOf(initial.scopeGoalIds());
        assertThat(currentFocus.totalAtomicGoalCount()).isEqualTo(initial.totalAtomicGoalCount());

        Learner learner = learnerRepository.findById(LEARNER_ID).orElseThrow();
        int masteredGoalCount = initial.scopeGoalIds().size() - 53;
        List<String> masteredGoalIds = initial.scopeGoalIds().subList(0, masteredGoalCount);
        masteryRepository.saveAllAndFlush(java.util.stream.IntStream.range(0, masteredGoalIds.size())
                .mapToObj(index -> new Mastery(
                        learner,
                        masteredGoalIds.get(index),
                        index == masteredGoalIds.size() - 1 ? 0.9 : 1.0))
                .toList());
        long revisionBefore = learner.getCoachStateRevision();

        var snapshot = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID,
                SEK_ONE_SCOPE_ID);
        var updatedAuthoritativeState = learnerService.getCoachLearnerState(LEARNER_ID);

        assertThat(snapshot.totalAtomicGoalCount()).isEqualTo(initial.totalAtomicGoalCount());
        assertThat(snapshot.masteredAtomicGoalCount()).isEqualTo(masteredGoalCount);
        assertThat(snapshot.masteredAtomicGoalCount())
                .isEqualTo(updatedAuthoritativeState.goals().scope().mastered_atomic());
        assertThat(snapshot.openAtomicGoalIds())
                .hasSize(53)
                .containsExactlyElementsOf(initial.scopeGoalIds().subList(
                        masteredGoalCount,
                        initial.scopeGoalIds().size()));
        assertThat(snapshot.scopeGoalIds()).containsExactlyElementsOf(initial.scopeGoalIds());
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
    void currentMultiSubjectFocusIsStrictlyCutToTheRequestedLandscape() {
        selectNationalMathAndPhysicsLk();
        learnerService.setScope(
                LEARNER_ID,
                List.of(DE_MATH_LK_SCOPE_ID, DE_PHYSICS_LK_SCOPE_ID));

        var math = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID,
                null);
        var physics = learnerService.getPlanningScope(
                LEARNER_ID,
                PHYSICS_LANDSCAPE_ID,
                null);

        assertThat(math.focusGoalIds()).containsExactly(DE_MATH_LK_SCOPE_ID);
        assertThat(math.scopeGoalIds())
                .isNotEmpty()
                .allSatisfy(goalId -> assertThat(landscapeService.getLandscapeIdForGoal(goalId))
                        .isEqualTo(MATH_LANDSCAPE_ID));
        assertThat(physics.focusGoalIds()).containsExactly(DE_PHYSICS_LK_SCOPE_ID);
        assertThat(physics.scopeGoalIds())
                .isNotEmpty()
                .allSatisfy(goalId -> assertThat(landscapeService.getLandscapeIdForGoal(goalId))
                        .isEqualTo(PHYSICS_LANDSCAPE_ID));
        assertThat(math.scopeGoalIds()).doesNotContainAnyElementsOf(physics.scopeGoalIds());
    }

    @Test
    void explicitScopeSnapshotDoesNotPersistOrRepairLevelThreeState() {
        selectHessenG9Math();
        long revisionBefore = learnerRepository.findById(LEARNER_ID)
                .orElseThrow()
                .getCoachStateRevision();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();

        var snapshot = learnerService.getPlanningScope(
                LEARNER_ID,
                MATH_LANDSCAPE_ID,
                SEK_ONE_SCOPE_ID);

        assertThat(snapshot.scopeGoalIds()).isNotEmpty();
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID)).isEmpty();
        assertThat(learnerRepository.findById(LEARNER_ID).orElseThrow().getCoachStateRevision())
                .isEqualTo(revisionBefore);
    }

    @Test
    void unrelatedLandscapeOrScopeFailsClosed() {
        selectHessenG9Math();

        assertThatThrownBy(() -> learnerService.getPlanningScope(
                        LEARNER_ID,
                        PHYSICS_LANDSCAPE_ID,
                        SEK_ONE_SCOPE_ID))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.CONFLICT));
        assertThatThrownBy(() -> learnerService.getPlanningScope(
                        LEARNER_ID,
                        MATH_LANDSCAPE_ID,
                        "unknown-scope"))
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
