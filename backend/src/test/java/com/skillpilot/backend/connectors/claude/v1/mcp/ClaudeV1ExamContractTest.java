package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.repository.LearnerRepository;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Contract tests for exam handling: what ordinary coaching context may contain, and what the
 * evaluation capability is bound to.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1ExamContractTest {

    private static final String EXAM_GOAL_ID = "goal_exam_1";

    @Autowired
    private ClaudeV1CapabilityService capabilityService;

    @Autowired
    private ClaudeV1CoachContextProjector contextProjector;

    @Autowired
    private ClaudeV1McpContractAdapter contractAdapter;

    @Autowired
    private ClaudeV1LearningSessionRepository connectionRepository;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private ClaudeV1SessionTokenCodec sessionTokens;

    private String connectionId;
    private String otherConnectionId;

    @BeforeEach
    void setUp() {
        connectionId = ClaudeV1TestFixtures
                .createBoundLearner(learnerRepository, connectionRepository, 2L).connectionId();
        otherConnectionId = ClaudeV1TestFixtures
                .createBoundLearner(learnerRepository, connectionRepository, 2L).connectionId();
    }

    private FrontierGoal examGoal() {
        ExamData examData = new ExamData();
        examData.setTaskContent("Berechne die Nullstellen von f(x) = x^2 - 4.");
        examData.setTaskContentEn("Find the roots of f(x) = x^2 - 4.");

        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(10.0);
        scoring.setPassingPoints(6.0);
        examData.setScoring(scoring);

        return new FrontierGoal(
                EXAM_GOAL_ID,
                "Nullstellen bestimmen",
                "Prüfungsaufgabe zu quadratischen Funktionen",
                "atomic",
                "exam",
                "exam",
                null,
                java.util.List.of(),
                java.util.List.of(),
                null,
                null,
                null,
                examData,
                true);
    }

    @Test
    void coachingContextShowsTheTaskAndMaxPointsButNeverThePassMark() {
        Map<String, Object> projected = contextProjector.formatGoal(examGoal());
        assertNotNull(projected);

        @SuppressWarnings("unchecked")
        Map<String, Object> exam = (Map<String, Object>) projected.get("examData");
        assertNotNull(exam);
        assertEquals(10.0, exam.get("maxPoints"));
        assertTrue(exam.containsKey("taskDe"));
        assertTrue(exam.containsKey("taskEn"));

        // The pass mark, the step rubric and the sample solution are released only by
        // get_skillpilot_exam_evaluation.
        assertFalse(exam.containsKey("passingPoints"), "passingPoints must not appear in coaching context");
        assertFalse(exam.containsKey("steps"), "The scoring rubric must not appear in coaching context");
        assertFalse(exam.containsKey("solutionContent"));
        assertFalse(projected.toString().contains("6.0"), "The pass mark must not leak through any field");
    }

    @Test
    void theEvaluationCapabilityIsBoundToSessionGoalAndRevision() {
        String capability = capabilityService.mintExamEvaluationCapability(connectionId, EXAM_GOAL_ID, 2L);

        ClaudeV1CapabilityService.ExamEvaluationClaim claim =
                capabilityService.verifyExamEvaluationCapability(capability, connectionId, EXAM_GOAL_ID);
        assertEquals(sessionTokens.hash(connectionId), claim.sessionBinding());
        assertEquals(EXAM_GOAL_ID, claim.goalId());
        assertEquals(2L, claim.stateVersion());
    }

    @Test
    void anEvaluationCapabilityFromAnotherSessionCannotSaveMastery() {
        String foreignCapability =
                capabilityService.mintExamEvaluationCapability(otherConnectionId, EXAM_GOAL_ID, 2L);

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability(foreignCapability, connectionId, EXAM_GOAL_ID));
    }

    @Test
    void anEvaluationCapabilityForAnotherGoalIsRefused() {
        String capability = capabilityService.mintExamEvaluationCapability(connectionId, "goal_exam_other", 2L);

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability(capability, connectionId, EXAM_GOAL_ID));
    }

    @Test
    void aRecallCapabilityCannotStandInForAnExamEvaluation() {
        String recallCapability = capabilityService.mintRecallGradingCapability(
                connectionId,
                EXAM_GOAL_ID,
                java.util.List.of("card_a"),
                20,
                2L,
                java.time.Instant.now());

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability(recallCapability, connectionId, EXAM_GOAL_ID));
    }

    @Test
    void releasedExamEvaluationRequiresAUsableCriterionRubric() {
        CoachToolFacade.ExamEvaluationResult valid = evaluation(
                10.0,
                6.0,
                List.of(
                        new CoachToolFacade.ExamScoringStep("step-1", 4.0, "Ansatz"),
                        new CoachToolFacade.ExamScoringStep("step-2", 5.0, "Auswertung")));

        assertDoesNotThrow(() -> contractAdapter.requireValidExamEvaluation(valid, EXAM_GOAL_ID));

        CoachToolFacade.ExamEvaluationResult emptyRubric = evaluation(10.0, 6.0, List.of());
        assertThrows(
                ClaudeV1McpContractAdapter.ToolConflictException.class,
                () -> contractAdapter.requireValidExamEvaluation(emptyRubric, EXAM_GOAL_ID));

        CoachToolFacade.ExamEvaluationResult duplicateStepIds = evaluation(
                10.0,
                6.0,
                List.of(
                        new CoachToolFacade.ExamScoringStep("step-1", 4.0, "Ansatz"),
                        new CoachToolFacade.ExamScoringStep("step-1", 4.0, "Auswertung")));
        assertThrows(
                ClaudeV1McpContractAdapter.ToolConflictException.class,
                () -> contractAdapter.requireValidExamEvaluation(duplicateStepIds, EXAM_GOAL_ID));
    }

    @Test
    void releasedRubricMustSupportThePassMarkWithoutExceedingMaxPoints() {
        CoachToolFacade.ExamEvaluationResult cannotReachPassMark = evaluation(
                10.0,
                6.0,
                List.of(new CoachToolFacade.ExamScoringStep("step-1", 5.0, "Kriterium")));
        assertThrows(
                ClaudeV1McpContractAdapter.ToolConflictException.class,
                () -> contractAdapter.requireValidExamEvaluation(cannotReachPassMark, EXAM_GOAL_ID));

        CoachToolFacade.ExamEvaluationResult exceedsMaximum = evaluation(
                10.0,
                6.0,
                List.of(new CoachToolFacade.ExamScoringStep("step-1", 11.0, "Kriterium")));
        assertThrows(
                ClaudeV1McpContractAdapter.ToolConflictException.class,
                () -> contractAdapter.requireValidExamEvaluation(exceedsMaximum, EXAM_GOAL_ID));
    }

    private CoachToolFacade.ExamEvaluationResult evaluation(
            double maxPoints,
            double passingPoints,
            List<CoachToolFacade.ExamScoringStep> steps) {
        return new CoachToolFacade.ExamEvaluationResult(
                EXAM_GOAL_ID,
                "Musterlösung",
                "Sample solution",
                new CoachToolFacade.ExamScoring(maxPoints, passingPoints, steps));
    }
}
