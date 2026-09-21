package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.service.LearnerService;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

/**
 * Real canonical-data regression for loading the cuboid exam reported in the Claude beta.
 * No facade, learner service, projection, repository, or curriculum loader is mocked.
 * The synthetic learner starts with a persisted active exam; this tests retrieval, not grading
 * or proof that a submission took place in the external Claude conversation.
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        "spring.datasource.url=jdbc:h2:mem:claude-v1-canonical-exam-integration;"
                + "DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
class ClaudeV1CanonicalExamIntegrationTest {

    private static final String ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String EXAM_ID = "c34c6132-f85d-59be-8b95-032ddfc0d0de";

    @Autowired private ClaudeV1McpContractAdapter contractAdapter;
    @Autowired private ClaudeV1CapabilityService capabilityService;
    @Autowired private LearnerService learnerService;
    @Autowired private LearnerRepository learnerRepository;
    @Autowired private MasteryRepository masteryRepository;
    @Autowired private ClaudeV1LearningSessionRepository sessionRepository;
    @Autowired private ObjectMapper objectMapper;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @SuppressWarnings("unchecked")
    void evaluationReadPublishesOnlyItsExactReadInputs() {
        McpSchema.Tool tool = contractAdapter.toolSpecifications().stream()
                .filter(candidate -> ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION.equals(candidate.tool().name()))
                .findFirst().orElseThrow().tool();
        Map<String, Object> schema = (Map<String, Object>) tool.inputSchema();
        assertThat(nestedMap(schema, "properties")).containsOnlyKeys("learningSessionId", "goalId", "language");
        assertThat((List<String>) schema.get("required")).containsExactlyInAnyOrder("learningSessionId", "goalId");
        assertThat(schema).containsEntry("additionalProperties", false);
        assertThat(tool.description()).contains(
                "only after a complete learner submission",
                "Present the task from activeGoal.examData",
                "this tool is not needed to start the exam",
                "never expectedStateVersion, clientRequestId or learner answers");
    }

    @Test
    void canonicalCuboidTaskAndEvaluationLoadThroughMcpWithoutLeakingIntoNormalContext()
            throws Exception {
        var bound = createLearnerWithActiveExam();
        long revision = learnerRepository.findById(bound.learnerId()).orElseThrow().getCoachStateRevision();

        Map<String, Object> context = successfulCall(
                bound.connectionId(), ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of());
        assertTaskOnlyContext(context);

        // Reproduce the erroneous host invocation: read tools do not accept write-version fields.
        McpSchema.CallToolResult invalid = call(
                bound.connectionId(), ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION,
                Map.of("goalId", EXAM_ID, "expectedStateVersion", revision));
        assertThat(invalid.isError()).isTrue();
        String invalidPayload = ((McpSchema.TextContent) invalid.content().getFirst()).text();
        assertThat(invalidPayload).contains("INVALID_INPUT")
                .doesNotContain("solutionContent", "passingPoints", "evaluationCapability");
        Learner afterInvalidCall = learnerRepository.findById(bound.learnerId()).orElseThrow();
        assertThat(afterInvalidCall.getCoachStateRevision()).isEqualTo(revision);
        assertThat(afterInvalidCall.getActiveGoalId()).isEqualTo(EXAM_ID);
        assertThat(masteryRepository.findByLearner_SkillpilotId(bound.learnerId())).isEmpty();

        Map<String, Object> evaluation = successfulCall(
                bound.connectionId(), ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION, Map.of("goalId", EXAM_ID));
        assertThat(evaluation).containsEntry("goalId", EXAM_ID);
        assertThat(evaluation.get("solutionContent").toString())
                .contains("Das Netz besteht", "Schrägbild", "Draufsicht");
        Map<String, Object> scoring = nestedMap(evaluation, "scoring");
        assertThat(((Number) scoring.get("maxPoints")).doubleValue()).isEqualTo(10.0);
        assertThat(((Number) scoring.get("passingPoints")).doubleValue()).isEqualTo(5.0);
        List<?> steps = (List<?>) scoring.get("steps");
        assertThat(steps).isNotEmpty();
        double assignedPoints = steps.stream()
                .map(Map.class::cast)
                .peek(step -> assertThat(step.get("description").toString()).isNotBlank())
                .mapToDouble(step -> ((Number) step.get("points")).doubleValue())
                .sum();
        assertThat(assignedPoints).isEqualTo(10.0);
        var capability = capabilityService.verifyExamEvaluationCapability(
                evaluation.get("evaluationCapability").toString(), bound.connectionId(), EXAM_ID);
        assertThat(capability.goalId()).isEqualTo(EXAM_ID);
        assertThat(capability.stateVersion()).isEqualTo(revision);

        // Evaluation release must not poison a cached/shared goal or make later context unsafe.
        assertTaskOnlyContext(successfulCall(
                bound.connectionId(), ClaudeV1Contract.TOOL_GET_COACH_CONTEXT, Map.of()));
        Learner persisted = learnerRepository.findById(bound.learnerId()).orElseThrow();
        assertThat(persisted.getCoachStateRevision()).isEqualTo(revision);
        assertThat(persisted.getActiveGoalId()).isEqualTo(EXAM_ID);

        McpSchema.CallToolResult denied = call(
                bound.connectionId(), ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION,
                Map.of("goalId", "7285df88-39cf-59c5-86c3-166e84669abc"));
        assertThat(denied.isError()).isTrue();
        String deniedPayload = ((McpSchema.TextContent) denied.content().getFirst()).text();
        assertThat(deniedPayload).contains("CONFLICT")
                .doesNotContain("solutionContent", "passingPoints", "evaluationCapability");
    }

    private ClaudeV1TestFixtures.BoundLearner createLearnerWithActiveExam() {
        var bound = ClaudeV1TestFixtures.createBoundLearner(learnerRepository, sessionRepository, 0L);
        Learner learner = learnerRepository.findById(bound.learnerId()).orElseThrow();
        learner.setSelectedCurriculum(ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "%s": {"selected": true, "filterId": "DE-BW", "durationModel": "G9", "stage": "SekI"},
                  "%s": {"selected": true, "filterId": "GK"},
                  "__skillpilotPersonalizationFlow": {
                    "rootLandscapeId": "%s", "completedOptionIds": [], "migrationCompleted": true
                  }
                }
                """.formatted(ROOT_ID, MATH_ID, ROOT_ID));
        learner.setAutoPilot(false);
        learnerRepository.saveAndFlush(learner);
        learnerService.setPlannedGoals(bound.learnerId(), Set.of(EXAM_ID));
        learner = learnerRepository.findById(bound.learnerId()).orElseThrow();
        learner.setActiveGoalId(EXAM_ID);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                bound.connectionId(), "unused",
                List.of(new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ))));
        return bound;
    }

    private void assertTaskOnlyContext(Map<String, Object> context) throws Exception {
        Map<String, Object> active = nestedMap(context, "activeGoal");
        assertThat(active).containsEntry("id", EXAM_ID);
        Map<String, Object> task = nestedMap(active, "examData");
        assertThat(task.get("taskDe").toString()).contains("Ein Quader", "Netz", "Schrägbild", "P");
        assertThat(((Number) task.get("maxPoints")).doubleValue()).isEqualTo(10.0);
        assertThat(objectMapper.writeValueAsString(context))
                .doesNotContain("solutionContent", "passingPoints", "sourceArtifactPath", "evaluationCapability",
                        "j6_structural_split_cuboid_representations_v1", "Das Netz besteht");
        assertThat(task).doesNotContainKeys("steps", "scoring", "reviewNote");
    }

    private Map<String, Object> successfulCall(String sessionId, String tool, Map<String, Object> arguments)
            throws Exception {
        McpSchema.CallToolResult result = call(sessionId, tool, arguments);
        assertThat(result.isError()).as("%s: %s", tool, result.content()).isFalse();
        assertThat(result.content()).singleElement().isInstanceOf(McpSchema.TextContent.class);
        return objectMapper.readValue(((McpSchema.TextContent) result.content().getFirst()).text(),
                new TypeReference<>() {});
    }

    private McpSchema.CallToolResult call(String sessionId, String tool, Map<String, Object> arguments) {
        Map<String, Object> request = new LinkedHashMap<>(arguments);
        request.put("learningSessionId", sessionId);
        request.put("language", "de");
        var specification = contractAdapter.toolSpecifications().stream()
                .filter(candidate -> tool.equals(candidate.tool().name())).findFirst().orElseThrow();
        return specification.callHandler().apply(McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(tool, request));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> nestedMap(Map<String, Object> parent, String key) {
        assertThat(parent.get(key)).as(key).isInstanceOf(Map.class);
        return (Map<String, Object>) parent.get(key);
    }
}
