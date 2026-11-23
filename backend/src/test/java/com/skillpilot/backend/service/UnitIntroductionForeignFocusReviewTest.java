package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/** Independent regression fixture: browsing one subject must not inherit another subject's entry policy. */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UnitIntroductionForeignFocusReviewTest {
    private static final String ID = "unit-entry-independent-foreign-focus-review";
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String MATH_SCOPE = "composition:de-he-gym-math-gk-g9:structure:sek1-g9";
    private static final String MATH_OPENING = "65365dce-f33f-49d8-9516-42f75883aa86";
    private static final String PHYSICS_SCOPE = "composition:de-he-gym-physics-gk-g9:structure:physics-e1-motion";
    private static final String PHYSICS_OPENING = "a4d4efe1-7d30-526b-ac9c-806113da4363";
    private static final String PHYSICS_PRACTICE = "8aff7aac-321b-5172-ac55-877876bfd2cd";
    // Since the E.1 cut (23 Nov 2026) the practice goal belongs to the child unit "Freier Fall schwerer
    // Kugeln". Entering it from an unrelated focus opens that child's own orientation.
    private static final String PHYSICS_PRACTICE_OPENING = "b4e95dce-8537-5e38-8aa6-0d9cfaa2b19e";

    @Autowired private LearnerService learners;
    @Autowired private LearnerRepository repository;
    @Autowired private MasteryRepository mastery;
    @Autowired private ObjectMapper mapper;

    @BeforeEach
    void createDisposableLearnerWithTwoSubjectsAndAnUnrelatedStructuralFocus() throws Exception {
        Learner learner = new Learner();
        learner.setSkillpilotId(ID);
        learner.setSelectedCurriculum(ROOT);
        learner.setLearningStrategy("RANDOM");
        learner.setAutoPilot(false);
        learner.setStrictMode(false);
        Map<String, Object> config = new LinkedHashMap<>();
        config.put(ROOT, Map.of("selected", true, "filterId", "DE-HE", "stage", "CrossStage", "durationModel", "G9"));
        config.put(MATH, Map.of("selected", true, "filterId", "GK"));
        config.put(PHYSICS, Map.of("selected", true, "filterId", "GK"));
        config.put(CurriculumPersonalizationPlanner.FLOW_STATE_CONFIG_KEY, Map.of(
                CurriculumPersonalizationPlanner.ROOT_LANDSCAPE_ID_KEY, ROOT,
                CurriculumPersonalizationPlanner.COMPLETED_OPTION_IDS_KEY, List.of(),
                CurriculumPersonalizationPlanner.MIGRATION_COMPLETED_KEY, true));
        learner.setPersonalCurriculum(mapper.writeValueAsString(config));
        repository.saveAndFlush(learner);
        learners.setPlannedGoals(ID, Set.of(MATH_SCOPE));
    }

    @Test
    void physicsResourceGateStillRequiresItsOwnOpeningAndDoesNotChangeTheMathematicsFocus() {
        long revision = repository.findById(ID).orElseThrow().getCoachStateRevision();
        assertThat(learners.getRequiredUnitOrientationGoalId(ID, PHYSICS_SCOPE)).isEqualTo(PHYSICS_OPENING);
        assertThat(learners.getRequiredUnitOrientationGoalId(ID, PHYSICS_PRACTICE)).isEqualTo(PHYSICS_PRACTICE_OPENING);
        assertThat(learners.getPlannedGoals(ID)).containsExactly(MATH_SCOPE);
        assertThat(repository.findById(ID).orElseThrow().getCoachStateRevision()).isEqualTo(revision);
        assertThat(mastery.findByLearner_SkillpilotId(ID)).isEmpty();
    }

    @Test
    void deliberatePhysicsStartAndConfirmedOpeningResumeTheSelectedGoalFromAnUnrelatedFocus() {
        learners.setActiveGoal(ID, PHYSICS_PRACTICE);
        assertThat(repository.findById(ID).orElseThrow().getActiveGoalId()).isEqualTo(PHYSICS_PRACTICE_OPENING);
        assertThat(repository.findById(ID).orElseThrow().getPendingUnitEntry()).contains(PHYSICS_PRACTICE);
        learners.setMastery(ID, new MasteryUpdateRequest(Map.of(PHYSICS_PRACTICE_OPENING, 1.0), PHYSICS_PRACTICE_OPENING));
        // Direct entry into a child introduces the child, not additionally the parent (decision of 22 Nov 2026).
        assertThat(repository.findById(ID).orElseThrow().getActiveGoalId()).isEqualTo(PHYSICS_PRACTICE);
        assertThat(mastery.findByLearner_SkillpilotId(ID)).singleElement()
                .satisfies(result -> assertThat(result.getGoalKey()).isEqualTo(PHYSICS_PRACTICE_OPENING));
    }

    @Test
    void ordinaryMathematicsStartNeverRequiresThePhysicsUnitOpening() {
        assertThat(learners.getRequiredUnitOrientationGoalId(ID, MATH_OPENING)).isNull();
        learners.setActiveGoal(ID, MATH_OPENING);
        assertThat(repository.findById(ID).orElseThrow().getActiveGoalId()).isEqualTo(MATH_OPENING);
        assertThat(repository.findById(ID).orElseThrow().getPendingUnitEntry()).isNull();
        assertThat(mastery.findByLearner_SkillpilotId(ID)).isEmpty();
    }
}
