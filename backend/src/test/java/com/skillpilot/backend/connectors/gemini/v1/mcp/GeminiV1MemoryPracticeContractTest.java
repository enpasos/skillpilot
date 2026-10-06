package com.skillpilot.backend.connectors.gemini.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MemoryPracticeCard;
import com.skillpilot.backend.api.MemoryPracticeProgress;
import com.skillpilot.backend.api.MemoryPracticeResponse;
import com.skillpilot.backend.api.MemoryPracticeReviewRequest;
import com.skillpilot.backend.api.MemoryPracticeStartRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Contract;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1TestFixtures;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1TestProperties;
import com.skillpilot.backend.connectors.gemini.v1.session.GeminiV1LearningSessionRepository;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        GeminiV1TestProperties.ENABLED,
        GeminiV1TestProperties.SIGNING_SECRET,
        GeminiV1TestProperties.CAPABILITY_SECRET,
        GeminiV1TestProperties.GATEWAY_SECRET,
        GeminiV1TestProperties.GATEWAY_AUDIENCE,
        GeminiV1TestProperties.BETA_DISABLED,
        GeminiV1TestProperties.CORE_DATASOURCE
})
class GeminiV1MemoryPracticeContractTest {

    private static final long INITIAL_STATE_VERSION = 10L;
    private static final String GOAL_ID = "memory-goal";

    @Autowired
    private GeminiV1McpContractAdapter contractAdapter;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private GeminiV1LearningSessionRepository connectionRepository;

    @MockitoBean
    private CoachToolFacade coachToolFacade;

    private String learnerId;
    private String learningSessionId;

    @BeforeEach
    void setUp() {
        GeminiV1TestFixtures.BoundLearner bound = GeminiV1TestFixtures.createBoundLearner(
                learnerRepository,
                connectionRepository,
                INITIAL_STATE_VERSION);
        learnerId = bound.learnerId();
        learningSessionId = bound.connectionId();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                bound.connectionId(),
                "unused",
                List.of(
                        new SimpleGrantedAuthority("SCOPE_" + GeminiV1Contract.SCOPE_READ),
                        new SimpleGrantedAuthority("SCOPE_" + GeminiV1Contract.SCOPE_WRITE))));
        when(coachToolFacade.getLearnerState(learnerId)).thenReturn(memoryState());
        when(coachToolFacade.startMemoryPractice(
                eq(learnerId),
                eq("de"),
                eq(new MemoryPracticeStartRequest(GOAL_ID))))
                .thenReturn(startResponse());
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void startPublishesFrontsWithoutAnyAnswersOrReviewCapabilities() {
        McpSchema.CallToolResult result = start();
        assertThat(result.isError()).isFalse();
        assertThat(result.meta()).isNullOrEmpty();
        assertThat(result.structuredContent().toString())
                .contains("Vorderseite", "answerCapability", "stateVersion", "progress")
                .doesNotContain("Rückseite", "reviewCapability", "back", learningSessionId, learnerId);
        assertThat(result.content().toString()).doesNotContain("Rückseite", "reviewCapability");
        Map<String, Object> first = map(((List<?>) map(result.structuredContent()).get("cards")).getFirst());
        assertThat(first).containsOnlyKeys("id", "front", "answerCapability");
    }

    @Test
    void answerReleasesOnlyTheIssuedCardAndItsReviewCapability() {
        McpSchema.CallToolResult result = answer(start(), "card-1");
        assertThat(result.isError()).isFalse();
        assertThat(result.content().toString()).contains("Rückseite 1", "reviewCapability")
                .doesNotContain("Rückseite 2", learningSessionId, learnerId);
        assertThat(result.meta()).isNullOrEmpty();
        verify(coachToolFacade, never()).reviewMemoryPracticeCard(any(), any(), any());
    }

    @Test
    void answerCapabilityCannotAuthorizeARatingBeforeReveal() {
        Map<String, Object> first = map(((List<?>) map(start().structuredContent()).get("cards")).getFirst());
        McpSchema.CallToolResult result = call(
                GeminiV1Contract.TOOL_REVIEW_MEMORY_PRACTICE_CARD,
                Map.of("goalId", GOAL_ID, "cardId", "card-1",
                        "reviewCapability", first.get("answerCapability"), "rating", "known",
                        "expectedStateVersion", INITIAL_STATE_VERSION,
                        "clientRequestId", UUID.randomUUID().toString(), "language", "de"));
        assertThat(result.isError()).isTrue();
        assertThat(result.content().toString()).contains("CAPABILITY_MISMATCH");
        verify(coachToolFacade, never()).reviewMemoryPracticeCard(any(), any(), any());
    }

    @Test
    void answerCapabilityCannotReleaseAnotherCard() {
        McpSchema.CallToolResult result = answer(start(), "card-2");
        assertThat(result.isError()).isTrue();
        assertThat(result.content().toString()).contains("CAPABILITY_MISMATCH");
    }

    @Test
    void languageArgumentCannotOverrideThePersistedSessionLocale() {
        McpSchema.CallToolResult result = call(
                GeminiV1Contract.TOOL_START_MEMORY_PRACTICE,
                Map.of("goalId", GOAL_ID, "expectedStateVersion", INITIAL_STATE_VERSION,
                        "language", "en"));
        assertThat(result.isError()).isFalse();
        assertThat(map(result.structuredContent())).containsEntry("language", "de");
        verify(coachToolFacade).startMemoryPractice(
                learnerId, "de", new MemoryPracticeStartRequest(GOAL_ID));
        verify(coachToolFacade, never()).startMemoryPractice(
                eq(learnerId), eq("en"), any(MemoryPracticeStartRequest.class));
    }

    @Test
    void explicitReviewUsesTheReleasedCapabilityAndChangesNoMastery() {
        McpSchema.CallToolResult start = start();
        String capability = firstCapability(start);
        when(coachToolFacade.reviewMemoryPracticeCard(
                eq(learnerId),
                eq("de"),
                eq(new MemoryPracticeReviewRequest(GOAL_ID, "card-1", "known"))))
                .thenAnswer(invocation -> {
                    Learner learner = learnerRepository.findById(learnerId).orElseThrow();
                    learner.setCoachStateRevision(learner.getCoachStateRevision() + 1);
                    learnerRepository.save(learner);
                    return reviewResponse();
                });

        McpSchema.CallToolResult reviewed = call(
                GeminiV1Contract.TOOL_REVIEW_MEMORY_PRACTICE_CARD,
                Map.of(
                        "goalId", GOAL_ID,
                        "cardId", "card-1",
                        "reviewCapability", capability,
                        "rating", "known",
                        "expectedStateVersion", INITIAL_STATE_VERSION,
                        "clientRequestId", UUID.randomUUID().toString(),
                        "language", "de"));

        assertThat(reviewed.isError()).isFalse();
        assertThat(map(reviewed.structuredContent()))
                .containsEntry("stateVersion", 11L)
                .containsEntry("completed", false);
        assertThat(reviewed.structuredContent().toString())
                .doesNotContain("card-1", "card-2", "Vorderseite", "Rückseite", capability);
        assertThat(reviewed.meta()).isNullOrEmpty();
        verify(coachToolFacade).reviewMemoryPracticeCard(
                learnerId,
                "de",
                new MemoryPracticeReviewRequest(GOAL_ID, "card-1", "known"));
        verify(coachToolFacade, never()).setMastery(any(), any());
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(11L);
    }

    @Test
    void capabilityForAnotherCardFailsBeforeTheCanonicalReview() {
        String capability = firstCapability(start());

        McpSchema.CallToolResult reviewed = call(
                GeminiV1Contract.TOOL_REVIEW_MEMORY_PRACTICE_CARD,
                Map.of(
                        "goalId", GOAL_ID,
                        "cardId", "card-2",
                        "reviewCapability", capability,
                        "rating", "known",
                        "expectedStateVersion", INITIAL_STATE_VERSION,
                        "clientRequestId", UUID.randomUUID().toString(),
                        "language", "de"));

        assertThat(reviewed.isError()).isTrue();
        assertThat(reviewed.content().toString()).contains("CAPABILITY_MISMATCH");
        verify(coachToolFacade, never()).reviewMemoryPracticeCard(
                eq(learnerId), eq("de"), any(MemoryPracticeReviewRequest.class));
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(INITIAL_STATE_VERSION);
    }

    @Test
    void staleReviewRevisionFailsBeforeCapabilityOrCanonicalReview() {
        String capability = firstCapability(start());

        McpSchema.CallToolResult reviewed = call(
                GeminiV1Contract.TOOL_REVIEW_MEMORY_PRACTICE_CARD,
                Map.of(
                        "goalId", GOAL_ID,
                        "cardId", "card-1",
                        "reviewCapability", capability,
                        "rating", "known",
                        "expectedStateVersion", INITIAL_STATE_VERSION - 1,
                        "clientRequestId", UUID.randomUUID().toString(),
                        "language", "de"));

        assertThat(reviewed.isError()).isTrue();
        assertThat(reviewed.content().toString()).contains("STALE_STATE");
        verify(coachToolFacade, never()).reviewMemoryPracticeCard(
                eq(learnerId), eq("de"), any(MemoryPracticeReviewRequest.class));
        assertThat(learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision())
                .isEqualTo(INITIAL_STATE_VERSION);
    }

    private McpSchema.CallToolResult start() {
        return call(
                GeminiV1Contract.TOOL_START_MEMORY_PRACTICE,
                Map.of(
                        "goalId", GOAL_ID,
                        "expectedStateVersion", INITIAL_STATE_VERSION,
                        "language", "de"));
    }

    private String firstCapability(McpSchema.CallToolResult result) {
        return map(payload(answer(result, "card-1"))).get("reviewCapability").toString();
    }

    private McpSchema.CallToolResult answer(McpSchema.CallToolResult result, String cardId) {
        Map<String, Object> card = map(((List<?>) map(result.structuredContent()).get("cards")).getFirst());
        return call(GeminiV1Contract.TOOL_GET_MEMORY_PRACTICE_ANSWER,
                Map.of("goalId", GOAL_ID, "cardId", cardId,
                        "answerCapability", card.get("answerCapability"),
                        "expectedStateVersion", INITIAL_STATE_VERSION, "language", "de"));
    }

    private Map<String, Object> payload(McpSchema.CallToolResult result) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().readValue(
                    ((McpSchema.TextContent) result.content().getFirst()).text(),
                    new com.fasterxml.jackson.core.type.TypeReference<>() {});
        } catch (Exception e) {
            throw new AssertionError(e);
        }
    }

    private McpSchema.CallToolResult call(String toolName, Map<String, Object> arguments) {
        Map<String, Object> sessionArguments = new LinkedHashMap<>(arguments);
        sessionArguments.put("learningSessionId", learningSessionId);
        McpStatelessServerFeatures.SyncToolSpecification specification = contractAdapter.toolSpecifications().stream()
                .filter(candidate -> toolName.equals(candidate.tool().name()))
                .findFirst()
                .orElseThrow();
        return specification.callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(toolName, sessionArguments));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> map(Object value) {
        return (Map<String, Object>) value;
    }

    private UnifiedLearnerStateResponse memoryState() {
        return new UnifiedLearnerStateResponse(
                learnerId,
                null,
                List.of(memoryGoal()),
                null,
                List.of(),
                List.of(),
                java.util.Set.of(),
                "TEACHING",
                memoryGoal(),
                null);
    }

    private FrontierGoal memoryGoal() {
        return new FrontierGoal(
                GOAL_ID,
                "Wichtige Begriffe behalten",
                "Die Begriffe sicher erinnern.",
                "atomic",
                "memory",
                "content",
                null,
                List.of("memorization", "srs-deck:test"),
                List.of(),
                null,
                null,
                null,
                null,
                false);
    }

    private MemoryPracticeResponse startResponse() {
        return new MemoryPracticeResponse(
                "ready",
                "private instruction",
                GOAL_ID,
                "Wichtige Begriffe behalten",
                new MemoryPracticeProgress(2, 2, 0),
                List.of(
                        new MemoryPracticeCard("card-1", "Vorderseite 1", "Rückseite 1", "test"),
                        new MemoryPracticeCard("card-2", "Vorderseite 2", "Rückseite 2", "test")));
    }

    private MemoryPracticeResponse reviewResponse() {
        return new MemoryPracticeResponse(
                "ready",
                "private instruction",
                GOAL_ID,
                "Wichtige Begriffe behalten",
                new MemoryPracticeProgress(2, 1, 1),
                List.of(new MemoryPracticeCard("card-2", "Vorderseite 2", "Rückseite 2", "test")));
    }
}
