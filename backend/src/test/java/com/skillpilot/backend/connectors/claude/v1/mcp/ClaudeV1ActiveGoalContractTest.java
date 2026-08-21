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
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1ConnectionRepository;
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
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1ActiveGoalContractTest {

    private static final long INITIAL_STATE_VERSION = 10L;
    private static final String CURRENT_GOAL_ID = "goal-current";
    private static final String NEXT_GOAL_ID = "goal-next";

    @Autowired
    private ClaudeV1McpContractAdapter contractAdapter;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private ClaudeV1ConnectionRepository connectionRepository;

    @Autowired
    private ObjectMapper objectMapper;

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
    void freshSameGoalRequestReturnsAlreadyActiveConflictBeforeCanonicalNoOp() throws Exception {
        stubCanonicalActiveGoal(CURRENT_GOAL_ID);

        McpSchema.CallToolResult result = callActiveGoal(CURRENT_GOAL_ID, false, UUID.randomUUID().toString());

        assertThat(result.isError()).isTrue();
        assertThat(payload(result))
                .containsEntry("status", "ERROR")
                .containsEntry("errorCode", "CONFLICT")
                .hasEntrySatisfying("message", message -> assertThat(message.toString()).contains("already active"));
        assertThat(currentStateVersion()).isEqualTo(INITIAL_STATE_VERSION);
        verify(coachToolFacade, never()).setActiveGoal(eq(learnerId), any(ActiveGoalRequest.class));
    }

    @Test
    void changingAnActiveGoalWithoutExplicitRedirectFailsClosed() throws Exception {
        stubCanonicalActiveGoal(CURRENT_GOAL_ID);

        McpSchema.CallToolResult result = callActiveGoal(NEXT_GOAL_ID, false, UUID.randomUUID().toString());

        assertThat(result.isError()).isTrue();
        assertThat(payload(result))
                .containsEntry("errorCode", "CONFLICT")
                .hasEntrySatisfying(
                        "message",
                        message -> assertThat(message.toString()).contains("explicitly asks", "redirect enabled"));
        assertThat(currentStateVersion()).isEqualTo(INITIAL_STATE_VERSION);
        verify(coachToolFacade, never()).setActiveGoal(eq(learnerId), any(ActiveGoalRequest.class));
    }

    @Test
    void explicitRedirectReportsTheActivatedAndDisplacedGoalsTruthfully() throws Exception {
        stubCanonicalActiveGoal(CURRENT_GOAL_ID);
        String requestId = UUID.randomUUID().toString();

        McpSchema.CallToolResult result = callActiveGoal(NEXT_GOAL_ID, true, requestId);

        assertThat(result.isError()).isFalse();
        assertThat(payload(result))
                .containsEntry("status", "SUCCESS")
                .containsEntry("stateVersion", 11)
                .containsEntry("activatedGoalId", NEXT_GOAL_ID)
                .containsEntry("redirectApplied", true)
                .containsEntry("displacedGoalId", CURRENT_GOAL_ID);
        assertThat(currentStateVersion()).isEqualTo(11L);
        verify(coachToolFacade).setActiveGoal(
                learnerId,
                new ActiveGoalRequest(NEXT_GOAL_ID, true));
    }

    @Test
    void initialActivationDoesNotClaimThatARedirectWasApplied() throws Exception {
        stubCanonicalActiveGoal(null);

        McpSchema.CallToolResult result = callActiveGoal(NEXT_GOAL_ID, false, UUID.randomUUID().toString());

        assertThat(result.isError()).isFalse();
        assertThat(payload(result))
                .containsEntry("activatedGoalId", NEXT_GOAL_ID)
                .containsEntry("redirectApplied", false)
                .doesNotContainKey("displacedGoalId");
        verify(coachToolFacade).setActiveGoal(
                learnerId,
                new ActiveGoalRequest(NEXT_GOAL_ID, false));
    }

    @Test
    void exactReplayReturnsTheOriginalRedirectResultWithoutASecondCanonicalWrite() throws Exception {
        stubCanonicalActiveGoal(CURRENT_GOAL_ID);
        String requestId = UUID.randomUUID().toString();

        McpSchema.CallToolResult first = callActiveGoal(NEXT_GOAL_ID, true, requestId);
        McpSchema.CallToolResult replay = callActiveGoal(NEXT_GOAL_ID, true, requestId);

        assertThat(first.isError()).isFalse();
        assertThat(replay.isError()).isFalse();
        assertThat(payload(replay)).isEqualTo(payload(first));
        assertThat(currentStateVersion()).isEqualTo(11L);
        verify(coachToolFacade, times(1)).getLearnerState(learnerId);
        verify(coachToolFacade, times(1)).setActiveGoal(
                learnerId,
                new ActiveGoalRequest(NEXT_GOAL_ID, true));
    }

    @Test
    void canonicalBadRequestBecomesAnActionableInputErrorWithoutAWrite() throws Exception {
        stubCanonicalFailure(HttpStatus.BAD_REQUEST, "Internal domain detail");

        McpSchema.CallToolResult result = callActiveGoal(NEXT_GOAL_ID, false, UUID.randomUUID().toString());

        assertThat(result.isError()).isTrue();
        assertThat(payload(result))
                .containsEntry("errorCode", "INVALID_INPUT")
                .hasEntrySatisfying("message", message -> assertThat(message.toString())
                        .contains("not a valid active-goal selection")
                        .doesNotContain("Internal domain detail"));
        assertThat(currentStateVersion()).isEqualTo(INITIAL_STATE_VERSION);
    }

    @Test
    void canonicalConflictBecomesAnActionableConflictWithoutAWrite() throws Exception {
        stubCanonicalFailure(HttpStatus.CONFLICT, "Internal domain detail");

        McpSchema.CallToolResult result = callActiveGoal(NEXT_GOAL_ID, false, UUID.randomUUID().toString());

        assertThat(result.isError()).isTrue();
        assertThat(payload(result))
                .containsEntry("errorCode", "CONFLICT")
                .hasEntrySatisfying("message", message -> assertThat(message.toString())
                        .contains("Reload the SkillPilot context")
                        .doesNotContain("Internal domain detail"));
        assertThat(currentStateVersion()).isEqualTo(INITIAL_STATE_VERSION);
    }

    @Test
    void unexpectedCanonicalFailureRemainsOpaqueAndRollsBack() throws Exception {
        stubCanonicalFailure(HttpStatus.SERVICE_UNAVAILABLE, "Database host and learner secret");

        McpSchema.CallToolResult result = callActiveGoal(NEXT_GOAL_ID, false, UUID.randomUUID().toString());

        assertThat(result.isError()).isTrue();
        assertThat(payload(result))
                .containsEntry("errorCode", "INTERNAL_ERROR")
                .containsEntry("message", "The operation could not be completed.");
        assertThat(payload(result).toString()).doesNotContain("Database host", "learner secret");
        assertThat(currentStateVersion()).isEqualTo(INITIAL_STATE_VERSION);
    }

    @Test
    void inconsistentCanonicalSuccessIsRejectedAndItsRevisionIsRolledBack() throws Exception {
        when(coachToolFacade.getLearnerState(learnerId)).thenReturn(learnerState(null));
        when(coachToolFacade.setActiveGoal(eq(learnerId), any(ActiveGoalRequest.class)))
                .thenAnswer(invocation -> {
                    Learner learner = learnerRepository.findById(learnerId).orElseThrow();
                    learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
                    learnerRepository.save(learner);
                    return learnerState(CURRENT_GOAL_ID);
                });

        McpSchema.CallToolResult result = callActiveGoal(NEXT_GOAL_ID, false, UUID.randomUUID().toString());

        assertThat(result.isError()).isTrue();
        assertThat(payload(result))
                .containsEntry("errorCode", "INTERNAL_ERROR")
                .containsEntry("message", "The operation could not be completed.");
        assertThat(currentStateVersion()).isEqualTo(INITIAL_STATE_VERSION);
    }

    private void stubCanonicalActiveGoal(String initialGoalId) {
        AtomicReference<String> activeGoalId = new AtomicReference<>(initialGoalId);
        when(coachToolFacade.getLearnerState(learnerId))
                .thenAnswer(invocation -> learnerState(activeGoalId.get()));
        when(coachToolFacade.setActiveGoal(eq(learnerId), any(ActiveGoalRequest.class)))
                .thenAnswer(invocation -> {
                    ActiveGoalRequest request = invocation.getArgument(1);
                    Learner learner = learnerRepository.findById(learnerId).orElseThrow();
                    learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
                    learnerRepository.save(learner);
                    activeGoalId.set(request.goalId());
                    return learnerState(request.goalId());
                });
    }

    private void stubCanonicalFailure(HttpStatus status, String reason) {
        when(coachToolFacade.getLearnerState(learnerId)).thenReturn(learnerState(null));
        when(coachToolFacade.setActiveGoal(eq(learnerId), any(ActiveGoalRequest.class)))
                .thenThrow(new ResponseStatusException(status, reason));
    }

    private UnifiedLearnerStateResponse learnerState(String activeGoalId) {
        FrontierGoal activeGoal = activeGoalId == null ? null : goal(activeGoalId);
        String requiredAction = activeGoal == null ? "setActiveGoal" : "teachActiveGoal";
        return new UnifiedLearnerStateResponse(
                null,
                null,
                activeGoal == null ? List.of(goal(NEXT_GOAL_ID)) : List.of(activeGoal),
                null,
                List.of(requiredAction),
                List.of(),
                Set.of(),
                activeGoal == null ? "FRONTIER" : "TEACHING",
                activeGoal,
                new StateMachineInfo(
                        activeGoal == null ? "FRONTIER" : "TEACHING",
                        requiredAction,
                        activeGoal == null ? List.of(goal(NEXT_GOAL_ID)) : List.of(activeGoal),
                        List.of(),
                        activeGoal));
    }

    private FrontierGoal goal(String id) {
        return new FrontierGoal(
                id,
                "Learning goal " + id,
                "Learner-facing description",
                "atomic",
                "tutor",
                null,
                "test",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
    }

    private McpSchema.CallToolResult callActiveGoal(
            String goalId,
            boolean redirect,
            String requestId) {
        Map<String, Object> arguments = new LinkedHashMap<>();
        arguments.put("goalId", goalId);
        arguments.put("redirect", redirect);
        arguments.put("expectedStateVersion", INITIAL_STATE_VERSION);
        arguments.put("clientRequestId", requestId);
        arguments.put("language", "en");

        McpStatelessServerFeatures.SyncToolSpecification specification = contractAdapter.toolSpecifications().stream()
                .filter(candidate -> ClaudeV1Contract.TOOL_SET_ACTIVE_GOAL.equals(candidate.tool().name()))
                .findFirst()
                .orElseThrow();
        return specification.callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(ClaudeV1Contract.TOOL_SET_ACTIVE_GOAL, arguments));
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
