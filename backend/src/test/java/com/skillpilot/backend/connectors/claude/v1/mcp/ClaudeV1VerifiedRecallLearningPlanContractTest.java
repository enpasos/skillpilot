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
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchResultRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchResultResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.persistence.ClaudeV1IdempotencyRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.spec.McpSchema;
import java.time.Instant;
import java.time.LocalDate;
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
class ClaudeV1VerifiedRecallLearningPlanContractTest {

    private static final long INITIAL_STATE_VERSION = 40L;
    private static final String MEMORY_GOAL_ID = "math-memory-goal";
    private static final String PHYSICS_GOAL_ID = "backend-next-physics-goal";
    private static final String CARD_ID = "math-memory-card";

    @Autowired private ClaudeV1McpContractAdapter contractAdapter;
    @Autowired private ClaudeV1CapabilityService capabilityService;
    @Autowired private LearnerRepository learnerRepository;
    @Autowired private ClaudeV1LearningSessionRepository sessionRepository;
    @Autowired private ClaudeV1IdempotencyRepository idempotencyRepository;
    @Autowired private ClaudeV1SessionTokenCodec sessionTokens;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcOperations jdbc;
    @MockitoBean private CoachToolFacade coachToolFacade;

    private String learnerId;
    private String connectionId;
    private Instant issuedAt;
    private AtomicReference<FrontierGoal> activeGoal;

    @BeforeEach
    void setUp() {
        ClaudeV1TestFixtures.BoundLearner bound = ClaudeV1TestFixtures.createBoundLearner(
                learnerRepository, sessionRepository, INITIAL_STATE_VERSION);
        learnerId = bound.learnerId();
        connectionId = bound.connectionId();
        issuedAt = Instant.now().minusSeconds(2);
        activeGoal = new AtomicReference<>(goal(MEMORY_GOAL_ID, "memory"));
        when(coachToolFacade.getLearnerState(learnerId))
                .thenAnswer(invocation -> learnerState(activeGoal.get()));
        when(coachToolFacade.getPersonalizationPlan(learnerId))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(coachToolFacade.getLearningPlanTodayStatus(learnerId, "de"))
                .thenAnswer(invocation -> dailyStatus(PHYSICS_GOAL_ID.equals(activeGoal.get().id())));
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
    @SuppressWarnings("unchecked")
    void completedRecallReturnsNextSubjectAndUpdatedDailyCountsAndReplaysWithoutAnotherWrite() throws Exception {
        stubRecallResult(true, MEMORY_GOAL_ID);
        String requestId = UUID.randomUUID().toString();
        Map<String, Object> arguments = arguments(requestId, true);

        McpSchema.CallToolResult result = call(arguments);
        assertThat(result.isError()).isFalse();
        Map<String, Object> response = payload(result);
        assertThat(response)
                .containsEntry("status", "SUCCESS")
                .containsEntry("stateVersion", 41)
                .containsEntry("masterySaved", true)
                .containsEntry("pendingCards", 0)
                .hasEntrySatisfying("presentationInstruction", instruction -> assertThat(instruction.toString())
                        .contains("returned context", "do not reload", "goalVisualization")
                        .contains("Do not request recall answers or record another mastery update"));
        Map<String, Object> context = (Map<String, Object>) response.get("context");
        assertThat(context)
                .containsEntry("stateVersion", 41)
                .hasEntrySatisfying("activeGoal", value -> assertThat((Map<String, Object>) value)
                        .containsEntry("id", PHYSICS_GOAL_ID));
        Map<String, Object> today = (Map<String, Object>) context.get("learningPlanToday");
        assertThat(today).containsEntry("resumeAvailable", false);
        assertThat((List<Map<String, Object>>) today.get("subjects"))
                .anySatisfy(subject -> assertThat(subject)
                        .containsEntry("subject", "Mathematik")
                        .containsEntry("dueToday", 1)
                        .containsEntry("completedToday", 1)
                        .containsEntry("openToday", 0))
                .anySatisfy(subject -> assertThat(subject)
                        .containsEntry("subject", "Physik")
                        .containsEntry("dueToday", 2)
                        .containsEntry("completedToday", 1)
                        .containsEntry("openToday", 1)
                        .containsEntry("openOverdue", 3));
        assertThat((Map<String, Object>) today.get("totals"))
                .containsEntry("completedToday", 2)
                .containsEntry("openToday", 1)
                .containsEntry("openOverdue", 3);
        assertThat(context.toString()).doesNotContain("private-math", "private-physics", learnerId);
        assertThat(payload(call(arguments))).isEqualTo(response);

        String tokenHash = sessionTokens.hash(connectionId);
        Map<String, Object> stored = objectMapper.readValue(
                idempotencyRepository.findLive(tokenHash, requestId, Instant.now())
                        .orElseThrow().responsePayload(),
                new TypeReference<>() {});
        assertThat(stored).isEqualTo(response);
        verify(coachToolFacade, times(1)).recordVerifiedRecallResultsBatch(
                eq(learnerId), eq("de"), any(VerifiedRecallBatchResultRequest.class));
        verify(coachToolFacade, times(1)).getLearningPlanTodayStatus(learnerId, "de");
        verify(coachToolFacade, times(2)).getLearnerState(learnerId);
        verifyNoExtraLearningWrite();

        // Historical successful recall receipts remain replayable, but cannot
        // pretend to include a successor context that was never persisted.
        jdbc.update(
                "UPDATE claude_v1_session_idempotency SET response_payload = ? "
                        + "WHERE token_hash = ? AND client_request_id = ?",
                objectMapper.writeValueAsString(Map.of(
                        "masterySaved", true, "pendingCards", 0, "verifiedCards", 1)),
                tokenHash,
                requestId);
        assertThat(payload(call(arguments)))
                .containsEntry("stateVersion", 41)
                .doesNotContainKey("context")
                .hasEntrySatisfying("presentationInstruction", instruction -> assertThat(instruction.toString())
                        .contains("Reload coach context now", "Do not repeat the recall-result write"));
        verify(coachToolFacade, times(1)).recordVerifiedRecallResultsBatch(
                eq(learnerId), eq("de"), any(VerifiedRecallBatchResultRequest.class));
    }

    @Test
    void unfinishedRecallKeepsItsWaitingContinuationWithoutClaimingCompletionOrSwitchingSubjects() throws Exception {
        stubRecallResult(false, null);
        Map<String, Object> arguments = arguments(UUID.randomUUID().toString(), false);

        McpSchema.CallToolResult result = call(arguments);
        assertThat(result.isError()).isFalse();
        Map<String, Object> response = payload(result);
        assertThat(response)
                .containsEntry("stateVersion", 41)
                .containsEntry("masterySaved", false)
                .containsEntry("pendingCards", 1)
                .doesNotContainKeys("context", "presentationInstruction")
                .hasEntrySatisfying("next", next -> assertThat(next.toString())
                        .contains("waiting", "1 Karten offen"));
        assertThat(activeGoal.get().id()).isEqualTo(MEMORY_GOAL_ID);
        assertThat(payload(call(arguments))).isEqualTo(response);
        verify(coachToolFacade, never()).getLearningPlanTodayStatus(any(), any());
        verify(coachToolFacade, times(1)).getLearnerState(learnerId);
        verifyNoExtraLearningWrite();
    }

    @Test
    void mismatchedRecallCompletionCannotPublishASuccessorOrPersistASuccessfulReplay() throws Exception {
        stubRecallResult(true, "another-memory-goal");
        String requestId = UUID.randomUUID().toString();

        McpSchema.CallToolResult result = call(arguments(requestId, true));

        assertThat(result.isError()).isTrue();
        assertThat(payload(result)).containsEntry("errorCode", "INTERNAL_ERROR").doesNotContainKey("context");
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(INITIAL_STATE_VERSION);
        assertThat(idempotencyRepository.findLive(sessionTokens.hash(connectionId), requestId, Instant.now()))
                .isEmpty();
        verify(coachToolFacade, never()).getLearningPlanTodayStatus(any(), any());
        verifyNoExtraLearningWrite();
    }

    private void stubRecallResult(boolean completed, String masteryGoalId) {
        when(coachToolFacade.recordVerifiedRecallResultsBatch(
                eq(learnerId), eq("de"), any(VerifiedRecallBatchResultRequest.class)))
                .thenAnswer(invocation -> {
                    Learner learner = learnerRepository.findById(learnerId).orElseThrow();
                    learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
                    learnerRepository.save(learner);
                    if (completed) {
                        activeGoal.set(goal(PHYSICS_GOAL_ID, "tutor"));
                    }
                    return new VerifiedRecallBatchResultResponse(
                            List.of(), completed ? 1 : 0, completed ? 0 : 1, completed, masteryGoalId,
                            new VerifiedRecallPromptResponse(
                                    completed ? "complete" : "waiting", "Untrusted original instruction",
                                    learnerId, MEMORY_GOAL_ID, "Mathematische Lernkarten", 1,
                                    completed ? 1 : 0, completed ? 0 : 1, 0, completed ? 0 : 1,
                                    completed ? null : issuedAt.plusSeconds(60).toString(),
                                    0, List.of(), null, null, null, 20, issuedAt),
                            learnerState(activeGoal.get()));
                });
    }

    private Map<String, Object> arguments(String requestId, boolean passed) {
        return Map.of(
                "learningSessionId", connectionId,
                "gradingCapability", capabilityService.mintRecallGradingCapability(
                        connectionId, MEMORY_GOAL_ID, List.of(CARD_ID), 20, INITIAL_STATE_VERSION, issuedAt),
                "results", List.of(Map.of("cardId", CARD_ID, "passed", passed)),
                "expectedStateVersion", INITIAL_STATE_VERSION,
                "clientRequestId", requestId,
                "language", "de");
    }

    private McpSchema.CallToolResult call(Map<String, Object> arguments) {
        return contractAdapter.toolSpecifications().stream()
                .filter(specification -> ClaudeV1Contract.TOOL_RECORD_VERIFIED_RECALL_RESULTS
                        .equals(specification.tool().name()))
                .findFirst().orElseThrow().callHandler().apply(
                        McpTransportContext.EMPTY,
                        new McpSchema.CallToolRequest(ClaudeV1Contract.TOOL_RECORD_VERIFIED_RECALL_RESULTS, arguments));
    }

    private Map<String, Object> payload(McpSchema.CallToolResult result) throws Exception {
        return objectMapper.readValue(((McpSchema.TextContent) result.content().getFirst()).text(),
                new TypeReference<>() {});
    }

    private void verifyNoExtraLearningWrite() {
        verify(coachToolFacade, never()).setMastery(any(), any());
        verify(coachToolFacade, never()).setActiveGoal(any(), any());
        verify(coachToolFacade, never()).resumeLearningPlan(any(), any());
        verify(coachToolFacade, never()).switchLearningPlanSubject(any(), any(), any());
    }

    private LearnerPlanTodayStatus dailyStatus(boolean completedMath) {
        return new LearnerPlanTodayStatus(
                LocalDate.of(2026, 9, 4), true, false,
                List.of(
                        new LearnerPlanTodayStatus.SubjectStatus(
                                "private-math", "Mathematik", 1, completedMath ? 1 : 0, completedMath ? 0 : 1, 0),
                        new LearnerPlanTodayStatus.SubjectStatus("private-physics", "Physik", 2, 1, 1, 3)),
                new LearnerPlanTodayStatus.Totals(3, completedMath ? 2 : 1, completedMath ? 1 : 2, 3), 0);
    }

    private UnifiedLearnerStateResponse learnerState(FrontierGoal goal) {
        return new UnifiedLearnerStateResponse(
                null, null, List.of(goal), null, List.of(), List.of(), Set.of(), "TEACHING", goal,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(goal), List.of(), goal));
    }

    private FrontierGoal goal(String id, String nodeKind) {
        return new FrontierGoal(id, id, "Lernzielbeschreibung", "atomic", nodeKind, "content", null,
                List.of(), List.of(), null, null, null, null, false);
    }
}
