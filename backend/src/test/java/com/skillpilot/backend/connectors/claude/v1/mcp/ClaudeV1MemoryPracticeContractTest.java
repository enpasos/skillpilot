package com.skillpilot.backend.connectors.claude.v1.mcp;

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
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1ConnectionRepository;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
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
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1MemoryPracticeContractTest {

    private static final long INITIAL_STATE_VERSION = 10L;
    private static final String GOAL_ID = "memory-goal";

    @Autowired
    private ClaudeV1McpContractAdapter contractAdapter;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private ClaudeV1ConnectionRepository connectionRepository;

    @MockitoBean
    private CoachToolFacade coachToolFacade;

    private String learnerId;

    @BeforeEach
    void setUp() {
        ClaudeV1TestFixtures.BoundLearner bound = ClaudeV1TestFixtures.createBoundLearner(
                learnerRepository,
                connectionRepository,
                INITIAL_STATE_VERSION);
        learnerId = bound.learnerId();
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                bound.connectionId(),
                "unused",
                List.of(
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
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
    void startKeepsCardsAndCapabilitiesOnlyInPrivateMetadata() {
        McpSchema.CallToolResult result = call(
                ClaudeV1Contract.TOOL_START_MEMORY_PRACTICE,
                Map.of(
                        "goalId", GOAL_ID,
                        "expectedStateVersion", INITIAL_STATE_VERSION,
                        "language", "de"));

        assertThat(result.isError()).isFalse();
        assertThat(result.structuredContent()).isInstanceOf(Map.class);
        assertThat(result.structuredContent().toString())
                .contains("goalTitle", "stateVersion", "progress")
                .doesNotContain("card-1", "card-2", "Vorderseite", "Rückseite", "reviewCapability");
        assertThat(result.content().toString())
                .doesNotContain("card-1", "card-2", "Vorderseite", "Rückseite", "reviewCapability");

        assertThat(result.meta()).containsOnlyKeys("skillpilotMemoryCard");
        Map<String, Object> privatePractice = map(result.meta().get("skillpilotMemoryCard"));
        assertThat(privatePractice)
                .containsEntry("communicationLocale", "de")
                .containsEntry("goalId", GOAL_ID)
                .containsEntry("expectedStateVersion", INITIAL_STATE_VERSION)
                .doesNotContainKeys("learningSessionId", "cockpitUrl");
        assertThat(privatePractice.keySet()).containsExactlyInAnyOrder(
                "communicationLocale",
                "goalId",
                "goalTitle",
                "expectedStateVersion",
                "progress",
                "completed",
                "cardBatch");
        Map<String, Object> cardBatch = map(privatePractice.get("cardBatch"));
        assertThat(cardBatch.keySet()).containsExactlyInAnyOrder("totalDueCards", "cards");
        List<?> cards = (List<?>) cardBatch.get("cards");
        assertThat(cards).hasSize(2);
        Map<String, Object> firstCard = map(cards.getFirst());
        assertThat(firstCard.keySet()).containsExactlyInAnyOrder(
                "id", "front", "back", "reviewCapability");
        assertThat(firstCard.get("reviewCapability").toString())
                .matches("^[A-Za-z0-9_-]{1,16384}$");
    }

    @Test
    void appOnlyReviewUsesTheBoundCapabilityAndChangesNoMastery() {
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
                ClaudeV1Contract.TOOL_REVIEW_MEMORY_PRACTICE_CARD,
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
        assertThat(map(reviewed.meta().get("skillpilotMemoryCard")))
                .containsEntry("expectedStateVersion", 11L)
                .doesNotContainKeys("cardBatch", "learningSessionId");
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
                ClaudeV1Contract.TOOL_REVIEW_MEMORY_PRACTICE_CARD,
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
                ClaudeV1Contract.TOOL_REVIEW_MEMORY_PRACTICE_CARD,
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
                ClaudeV1Contract.TOOL_START_MEMORY_PRACTICE,
                Map.of(
                        "goalId", GOAL_ID,
                        "expectedStateVersion", INITIAL_STATE_VERSION,
                        "language", "de"));
    }

    private String firstCapability(McpSchema.CallToolResult result) {
        Map<String, Object> privatePractice = map(result.meta().get("skillpilotMemoryCard"));
        Map<String, Object> batch = map(privatePractice.get("cardBatch"));
        Map<String, Object> card = map(((List<?>) batch.get("cards")).getFirst());
        return card.get("reviewCapability").toString();
    }

    private McpSchema.CallToolResult call(String toolName, Map<String, Object> arguments) {
        McpStatelessServerFeatures.SyncToolSpecification specification = contractAdapter.toolSpecifications().stream()
                .filter(candidate -> toolName.equals(candidate.tool().name()))
                .findFirst()
                .orElseThrow();
        return specification.callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(toolName, arguments));
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
