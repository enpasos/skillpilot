package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.persistence.ClaudeV1IdempotencyRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1MasteryContractTest {

    private static final long INITIAL_STATE_VERSION = 10L;
    private static final String ACTIVE_GOAL_ID = "orientation-current";
    private static final String BACKEND_NEXT_GOAL_ID = "backend-next";
    private static final String COMPETING_GOAL_ID = "competing-frontier-goal";

    @Autowired
    private ClaudeV1McpContractAdapter contractAdapter;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private ClaudeV1LearningSessionRepository connectionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClaudeV1IdempotencyRepository idempotencyRepository;

    @Autowired
    private ClaudeV1SessionTokenCodec sessionTokens;

    @Autowired
    private JdbcOperations jdbc;

    @MockitoBean
    private CoachToolFacade coachToolFacade;

    private String learnerId;
    private String connectionId;

    @BeforeEach
    void setUp() {
        ClaudeV1TestFixtures.BoundLearner bound = ClaudeV1TestFixtures.createBoundLearner(
                learnerRepository,
                connectionRepository,
                INITIAL_STATE_VERSION);
        learnerId = bound.learnerId();
        connectionId = bound.connectionId();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                connectionId,
                "unused",
                List.of(
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void completionWritesOnlyTheActiveGoalAndLeavesProgressionToTheCanonicalBackend() throws Exception {
        FrontierGoal activeGoal = goal(ACTIVE_GOAL_ID, "orientation");
        FrontierGoal backendNext = goal(BACKEND_NEXT_GOAL_ID, "content");
        FrontierGoal competingGoal = goal(COMPETING_GOAL_ID, "content");
        when(coachToolFacade.getLearnerState(learnerId))
                .thenReturn(learnerState(activeGoal, List.of(activeGoal), "orientActiveGoal"));
        when(coachToolFacade.setMastery(eq(learnerId), any(MasteryUpdateRequest.class)))
                .thenAnswer(invocation -> {
                    Learner learner = learnerRepository.findById(learnerId).orElseThrow();
                    learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
                    learnerRepository.save(learner);
                    MasteryUpdateResponse update = new MasteryUpdateResponse(
                            true,
                            ACTIVE_GOAL_ID,
                            1.0,
                            List.of(backendNext, competingGoal),
                            List.of("setMastery"),
                            "TEACHING",
                            backendNext,
                            new StateMachineInfo(
                                    "TEACHING",
                                    "teachActiveGoal",
                                    List.of(backendNext),
                                    List.of(),
                                    backendNext),
                            null);
                    return new CoachToolFacade.MasteryResult(
                            CoachToolFacade.MasteryStatus.UPDATED,
                            update,
                            null,
                            null);
                });

        String requestId = UUID.randomUUID().toString();
        McpSchema.CallToolResult result = callMastery(Map.of(), requestId);
        McpSchema.CallToolResult replay = callMastery(Map.of(), requestId);

        assertThat(result.isError()).isFalse();
        Map<String, Object> resultPayload = payload(result);
        assertThat(resultPayload)
                .containsEntry("status", "SUCCESS")
                .containsEntry("stateVersion", 11)
                .containsEntry("savedGoalId", ACTIVE_GOAL_ID)
                .containsEntry("savedMastery", 1.0)
                .doesNotContainKeys("activatedGoalId", "orientationPathId", "successorGoalId")
                .hasEntrySatisfying("presentationInstruction", instruction -> assertThat(instruction.toString())
                        .contains("returned context", "canonical backend state", "do not reload")
                        .doesNotContain("Reload coach context now"));
        assertThat(payload(replay)).isEqualTo(resultPayload);

        String tokenHash = sessionTokens.hash(connectionId);
        Map<String, Object> storedResponse = objectMapper.readValue(
                idempotencyRepository.findLive(tokenHash, requestId, java.time.Instant.now())
                        .orElseThrow()
                        .responsePayload(),
                new TypeReference<>() {});
        assertThat(storedResponse).isEqualTo(resultPayload);

        @SuppressWarnings("unchecked")
        Map<String, Object> successorContext = (Map<String, Object>) resultPayload.get("context");
        assertThat(successorContext)
                .containsEntry("stateVersion", 11)
                .containsEntry("language", "de")
                .hasEntrySatisfying("activeGoal", projectedGoal -> assertThat(projectedGoal)
                        .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.MAP)
                        .containsEntry("id", BACKEND_NEXT_GOAL_ID))
                .hasEntrySatisfying("stateMachine", projectedStateMachine -> assertThat(projectedStateMachine)
                        .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.MAP)
                        .containsEntry("requiredAction", "teachActiveGoal"))
                .containsEntry("frontier", List.of());
        assertThat(successorContext.toString()).doesNotContain(COMPETING_GOAL_ID);

        jdbc.update(
                "UPDATE claude_v1_session_idempotency SET response_payload = ? "
                        + "WHERE token_hash = ? AND client_request_id = ?",
                objectMapper.writeValueAsString(Map.of(
                        "savedGoalId", ACTIVE_GOAL_ID,
                        "savedMastery", 1.0)),
                tokenHash,
                requestId);
        Map<String, Object> legacyReplay = payload(callMastery(Map.of(), requestId));
        assertThat(legacyReplay)
                .containsEntry("status", "SUCCESS")
                .containsEntry("stateVersion", 11)
                .containsEntry("savedGoalId", ACTIVE_GOAL_ID)
                .doesNotContainKey("context")
                .hasEntrySatisfying("presentationInstruction", instruction -> assertThat(instruction.toString())
                        .contains("exact replay", "Reload coach context now", "Do not repeat the mastery write")
                        .doesNotContain("do not reload"));

        ArgumentCaptor<MasteryUpdateRequest> request = ArgumentCaptor.forClass(MasteryUpdateRequest.class);
        verify(coachToolFacade, times(1)).setMastery(eq(learnerId), request.capture());
        assertThat(request.getValue().goalId()).isEqualTo(ACTIVE_GOAL_ID);
        assertThat(request.getValue().mastery()).isNull();
        verify(coachToolFacade, times(1)).getLearnerState(learnerId);
        verify(coachToolFacade, never()).getOrientationOutlook(any(), any());
        verify(coachToolFacade, never()).setActiveGoal(any(), any(ActiveGoalRequest.class));
    }

    @Test
    void modelSelectedProgressionArgumentsAreRejectedBeforeAnyCanonicalWrite() throws Exception {
        McpSchema.CallToolResult result = callMastery(
                Map.of(
                        "orientationPathId", "model-selected-path",
                        "nextGoalId", "model-selected-successor"),
                UUID.randomUUID().toString());

        assertThat(result.isError()).isTrue();
        assertThat(payload(result))
                .containsEntry("status", "ERROR")
                .containsEntry("errorCode", "INVALID_INPUT")
                .hasEntrySatisfying("message", message -> assertThat(message.toString())
                        .contains("unsupported argument"));
        assertThat(currentStateVersion()).isEqualTo(INITIAL_STATE_VERSION);
        verify(coachToolFacade, never()).setMastery(any(), any());
        verify(coachToolFacade, never()).getLearnerState(any());
        verify(coachToolFacade, never()).setActiveGoal(any(), any(ActiveGoalRequest.class));
    }

    private McpSchema.CallToolResult callMastery(
            Map<String, Object> additionalArguments,
            String clientRequestId) {
        Map<String, Object> arguments = new LinkedHashMap<>();
        arguments.put("learningSessionId", connectionId);
        arguments.put("goalId", ACTIVE_GOAL_ID);
        arguments.put("workFeedback", "The learner gave a meaningful orientation response.");
        arguments.put("outcomeFeedback", "The active orientation goal is complete.");
        arguments.put("expectedStateVersion", INITIAL_STATE_VERSION);
        arguments.put("clientRequestId", clientRequestId);
        arguments.put("language", "en");
        arguments.putAll(additionalArguments);

        McpStatelessServerFeatures.SyncToolSpecification specification = contractAdapter.toolSpecifications().stream()
                .filter(candidate -> ClaudeV1Contract.TOOL_SET_MASTERY.equals(candidate.tool().name()))
                .findFirst()
                .orElseThrow();
        return specification.callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(ClaudeV1Contract.TOOL_SET_MASTERY, arguments));
    }

    private UnifiedLearnerStateResponse learnerState(
            FrontierGoal activeGoal,
            List<FrontierGoal> frontier,
            String requiredAction) {
        return new UnifiedLearnerStateResponse(
                null,
                null,
                frontier,
                null,
                List.of("setMastery"),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                new StateMachineInfo(
                        "TEACHING",
                        requiredAction,
                        frontier,
                        List.of(),
                        activeGoal));
    }

    private FrontierGoal goal(String id, String semanticKind) {
        return new FrontierGoal(
                id,
                "Learning goal " + id,
                "Learner-facing description",
                "atomic",
                "tutor",
                semanticKind,
                null,
                List.of(),
                List.of(),
                null,
                null,
                null,
                null,
                false);
    }

    private Map<String, Object> payload(McpSchema.CallToolResult result) throws Exception {
        assertThat(result.content()).singleElement().isInstanceOf(McpSchema.TextContent.class);
        String json = ((McpSchema.TextContent) result.content().getFirst()).text();
        return objectMapper.readValue(json, new TypeReference<>() {});
    }

    private long currentStateVersion() {
        return learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision();
    }
}
