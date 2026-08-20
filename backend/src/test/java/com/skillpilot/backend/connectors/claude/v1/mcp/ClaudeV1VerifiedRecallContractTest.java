package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1ConnectionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Contract tests for the verified-recall capability chain.
 *
 * <p>The server cannot prove the learner answered before the answers were requested — it has no
 * view of the Claude conversation. What it can and must prove is everything below: the chain from
 * batch to grading capability is bound to one connection, one goal, one ordered card list and one
 * issue time, and cannot be replayed into another context.</p>
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
class ClaudeV1VerifiedRecallContractTest {

    private static final String GOAL_ID = "goal_memory_1";
    private static final List<String> CARDS = List.of("card_a", "card_b", "card_c");
    private static final int CONFIGURED_BATCH_SIZE = 20;

    @Autowired
    private ClaudeV1CapabilityService capabilityService;

    @Autowired
    private ClaudeV1McpContractAdapter contractAdapter;

    @Autowired
    private ClaudeV1ConnectionRepository connectionRepository;

    @Autowired
    private LearnerRepository learnerRepository;

    private String connectionId;
    private String otherConnectionId;
    private String learnerId;
    private Instant issuedAt;

    @BeforeEach
    void setUp() {
        ClaudeV1TestFixtures.BoundLearner learner =
                ClaudeV1TestFixtures.createBoundLearner(learnerRepository, connectionRepository, 4L);
        learnerId = learner.learnerId();
        connectionId = learner.connectionId();
        otherConnectionId = ClaudeV1TestFixtures
                .createBoundLearner(learnerRepository, connectionRepository, 4L).connectionId();
        issuedAt = Instant.now().minusSeconds(2);
    }

    @Test
    void theBatchCapabilityCarriesTheServerChosenBatchIntoTheAnswerStep() {
        String batchCapability =
                capabilityService.mintRecallBatchCapability(
                        connectionId, GOAL_ID, CARDS, CONFIGURED_BATCH_SIZE, 4L, issuedAt);

        // The answer step supplies no goal of its own; the authenticated batch is authoritative.
        ClaudeV1CapabilityService.RecallBatchClaim claim =
                capabilityService.verifyRecallBatchCapability(batchCapability, connectionId, null);

        assertEquals(GOAL_ID, claim.goalId());
        assertEquals(CARDS, claim.cardIds());
        assertEquals(CONFIGURED_BATCH_SIZE, claim.configuredBatchSize());
        assertEquals(4L, claim.stateVersion());
        assertEquals(issuedAt.getEpochSecond(), claim.issuedAt().getEpochSecond());
    }

    @Test
    void theGradingCapabilityIsSeparateFromTheBatchCapability() {
        String batchCapability =
                capabilityService.mintRecallBatchCapability(
                        connectionId, GOAL_ID, CARDS, CONFIGURED_BATCH_SIZE, 4L, issuedAt);
        String gradingCapability =
                capabilityService.mintRecallGradingCapability(
                        connectionId, GOAL_ID, CARDS, CONFIGURED_BATCH_SIZE, 4L, issuedAt);

        assertNotEquals(batchCapability, gradingCapability);
        // Releasing answers and writing results are two distinct authorizations; neither token
        // may be used in the other step.
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyRecallGradingCapability(batchCapability, connectionId, GOAL_ID));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyRecallBatchCapability(gradingCapability, connectionId, GOAL_ID));
    }

    @Test
    void aBatchFromAnotherConnectionIsRefused() {
        String foreignCapability =
                capabilityService.mintRecallBatchCapability(
                        otherConnectionId, GOAL_ID, CARDS, CONFIGURED_BATCH_SIZE, 4L, issuedAt);

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyRecallBatchCapability(foreignCapability, connectionId, null));
    }

    @Test
    void aBatchForAnotherGoalIsRefused() {
        String capability =
                capabilityService.mintRecallGradingCapability(
                        connectionId, "goal_other", CARDS, CONFIGURED_BATCH_SIZE, 4L, issuedAt);

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyRecallGradingCapability(capability, connectionId, GOAL_ID));
    }

    @Test
    void theCardListAndItsOrderCannotBeChangedAfterIssue() {
        String capability =
                capabilityService.mintRecallGradingCapability(
                        connectionId, GOAL_ID, CARDS, CONFIGURED_BATCH_SIZE, 4L, issuedAt);

        ClaudeV1CapabilityService.RecallBatchClaim claim =
                capabilityService.verifyRecallGradingCapability(capability, connectionId, GOAL_ID);
        assertEquals(CARDS, claim.cardIds());

        // A capability issued for a different card set authenticates a different payload.
        String shorterBatch = capabilityService.mintRecallGradingCapability(
                connectionId,
                GOAL_ID,
                List.of("card_a", "card_b"),
                CONFIGURED_BATCH_SIZE,
                4L,
                issuedAt);
        assertNotEquals(capability, shorterBatch);
        assertEquals(
                List.of("card_a", "card_b"),
                capabilityService.verifyRecallGradingCapability(shorterBatch, connectionId, GOAL_ID).cardIds());
    }

    @Test
    void aForgedCapabilityIsRefusedEvenWithCorrectContents() {
        // Structure alone must not be enough: without the server key, nothing verifies.
        String forged = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(
                ("RECALL_GRADING|" + connectionId + "|" + GOAL_ID + "|card_a,card_b,card_c|20|4|"
                        + issuedAt.getEpochSecond() + "|" + Instant.now().plusSeconds(300).getEpochSecond()
                        + "!00").getBytes(java.nio.charset.StandardCharsets.UTF_8));

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyRecallGradingCapability(forged, connectionId, GOAL_ID));
    }

    @Test
    void canonicalContinuationKeepsItsInstructionAndServerBatchSizeWithoutLeakingLearnerId() {
        VerifiedRecallPromptResponse continuation = new VerifiedRecallPromptResponse(
                "ready",
                "Present every returned card before requesting the answers.",
                learnerId,
                GOAL_ID,
                "Memory goal",
                3,
                0,
                3,
                3,
                0,
                null,
                3,
                List.of(
                        new VerifiedRecallPromptCard("card_a", "Prompt A", "Term"),
                        new VerifiedRecallPromptCard("card_b", "Prompt B", null),
                        new VerifiedRecallPromptCard("card_c", "Prompt C", "Formula")),
                "card_a",
                "Prompt A",
                "Term",
                CONFIGURED_BATCH_SIZE,
                issuedAt);

        Map<String, Object> projected = contractAdapter.projectRecallPrompt(
                connectionId,
                learnerId,
                GOAL_ID,
                4L,
                "en",
                continuation);

        assertEquals("ready", projected.get("status"));
        assertEquals(continuation.instruction(), projected.get("instruction"));
        assertEquals(3, projected.get("batchSize"));
        assertFalse(projected.toString().contains(learnerId));
        String nextCapability = (String) projected.get("batchCapability");
        assertNotNull(nextCapability);
        ClaudeV1CapabilityService.RecallBatchClaim claim = capabilityService.verifyRecallBatchCapability(
                nextCapability, connectionId, GOAL_ID, 4L);
        assertEquals(CARDS, claim.cardIds());
        assertEquals(CONFIGURED_BATCH_SIZE, claim.configuredBatchSize());
    }
}
