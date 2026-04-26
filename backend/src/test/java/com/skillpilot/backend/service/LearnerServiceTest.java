package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
public class LearnerServiceTest {

    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String COMPOSITION_J8_SCOPE_ID =
            "composition:merged:de-de-gym-math-lk+de-de-gym-math-gk:structure:j8";

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private PlannedGoalRepository plannedGoalRepository;

    private String learnerId;

    @BeforeEach
    void setUp() {
        Learner learner = new Learner();
        learner.setSkillpilotId("test-learner");
        learnerRepository.save(learner);
        learnerId = learner.getSkillpilotId();
    }

    @AfterEach
    void tearDown() {
        plannedGoalRepository.deleteAll();
        learnerRepository.deleteAll();
    }

    @Test
    @Transactional
    void setPlannedGoals_isIdempotentForSameTargetSet() {
        assertThatCode(() -> learnerService.setPlannedGoals(learnerId, Set.of("GOAL_1"))).doesNotThrowAnyException();
        assertThatCode(() -> learnerService.setPlannedGoals(learnerId, Set.of("GOAL_1"))).doesNotThrowAnyException();

        var goals = plannedGoalRepository.findByLearner_SkillpilotId(learnerId);
        assertThat(goals).hasSize(1);
        assertThat(goals.get(0).getGoalId()).isEqualTo("GOAL_1");
    }

    @Test
    @Transactional
    void setPlannedGoals_updatesDiffWithoutDuplicates() {
        learnerService.setPlannedGoals(learnerId, Set.of("G1", "G2"));
        learnerService.setPlannedGoals(learnerId, Set.of("G2"));

        var goals = plannedGoalRepository.findByLearner_SkillpilotId(learnerId);
        assertThat(goals).hasSize(1);
        assertThat(goals.get(0).getGoalId()).isEqualTo("G2");
    }

    @Test
    void computeEffectiveRequires_inheritsAlongContainsChain() {
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("ROOT", goal("ROOT", List.of("PREREQ_ROOT"), List.of("A")));
        goals.put("A", goal("A", List.of("PREREQ_A"), List.of("B")));
        goals.put("B", goal("B", List.of(), List.of()));

        Map<String, List<String>> effective = learnerService.computeEffectiveRequires(goals);

        assertThat(effective.get("ROOT")).containsExactly("PREREQ_ROOT");
        assertThat(effective.get("A")).containsExactlyInAnyOrder("PREREQ_A", "PREREQ_ROOT");
        assertThat(effective.get("B")).containsExactlyInAnyOrder("PREREQ_A", "PREREQ_ROOT");
    }

    @Test
    void computeEffectiveRequires_dropsSelfDependencyFromInherited() {
        Map<String, LearningGoal> goals = new HashMap<>();
        // Parent requires child; child would otherwise inherit itself
        goals.put("PARENT", goal("PARENT", List.of("CHILD"), List.of("CHILD")));
        goals.put("CHILD", goal("CHILD", List.of("LEAF_REQ"), List.of()));

        Map<String, List<String>> effective = learnerService.computeEffectiveRequires(goals);

        assertThat(effective.get("CHILD")).containsExactlyInAnyOrder("LEAF_REQ");
    }

    @Test
    void computeEffectiveRequires_normalizesColonReferences() {
        Map<String, LearningGoal> goals = new HashMap<>();
        goals.put("P", goal("P", List.of("X"), List.of("L1:CH")));
        goals.put("CH", goal("CH", List.of(), List.of()));

        Map<String, List<String>> effective = learnerService.computeEffectiveRequires(goals);
        assertThat(effective.get("CH")).contains("X");
    }

    @Test
    @Transactional
    void getLearnerState_returnsUpdateCurriculum_whenNoCurriculumSelected() {
        var state = learnerService.getLearnerState(learnerId);
        assertThat(state.nextAllowedActions()).containsExactly("setCurriculum");
    }

    @Test
    @Transactional
    void getLearnerState_returnsStandardActions_whenCurriculumSelected() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum("TEST_CURRICULUM");
        learnerRepository.save(learner);

        var state = learnerService.getLearnerState(learnerId);
        assertThat(state.nextAllowedActions()).containsExactlyInAnyOrder(
                "setPersonalization", "setScope", "getFrontier");
    }

    @Test
    @Transactional
    void getLearnerState_resolvesCompositionViewPlannedScopeForAiFrontier() {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "ALL"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "ALL"}
                }
                """);
        learnerRepository.save(learner);

        learnerService.setPlannedGoals(learnerId, Set.of(COMPOSITION_J8_SCOPE_ID));

        var state = learnerService.getLearnerState(learnerId);

        assertThat(state.goals().planned())
                .singleElement()
                .satisfies(goal -> {
                    assertThat(goal.id()).isEqualTo(COMPOSITION_J8_SCOPE_ID);
                    assertThat(goal.title()).isEqualTo("Jahrgangsstufe 8");
                    assertThat(goal.type()).isEqualTo("cluster");
                });
        assertThat(state.goals().scope()).isNotNull();
        assertThat(state.goals().scope().total_atomic()).isLessThan(state.goals().personalized().total_atomic());
        assertThat(state.frontier())
                .extracting(goal -> goal.title())
                .doesNotContain("Mathematik", "Physik");
        assertThat(state.stateMachine().requiredAction()).isNotEqualTo("setScope");
    }

    private static LearningGoal goal(String id, List<String> requires, List<String> contains) {
        LearningGoal g = new LearningGoal();
        g.setId(id);
        g.setRequires(requires == null ? List.of() : new ArrayList<>(requires));
        g.setContains(contains == null ? List.of() : new ArrayList<>(contains));
        return g;
    }
}
