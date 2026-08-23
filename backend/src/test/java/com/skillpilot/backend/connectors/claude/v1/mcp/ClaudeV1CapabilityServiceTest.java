package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ClaudeV1CapabilityServiceTest {

    private static final String CONNECTION_ID = "spc_" + "A".repeat(43);
    private static final String OTHER_CONNECTION_ID = "spc_" + "B".repeat(43);
    private static final String GOAL_ID = "goal_abc";
    private static final List<String> CARDS = List.of("card_1", "card_2", "card_3");
    private static final int CONFIGURED_BATCH_SIZE = 20;

    private ClaudeV1CapabilityService capabilityService;
    private Instant issuedAt;

    private static ClaudeV1Properties properties(String capabilitySecret) {
        ClaudeV1Properties properties = new ClaudeV1Properties();
        properties.setSigningSecret(ClaudeV1TestProperties.SIGNING_SECRET_VALUE);
        properties.setCapabilitySecret(capabilitySecret);
        return properties;
    }

    @BeforeEach
    void setUp() {
        capabilityService = new ClaudeV1CapabilityService(
                properties(ClaudeV1TestProperties.CAPABILITY_SECRET_VALUE));
        issuedAt = Instant.now().minusSeconds(5);
    }

    @Test
    void refusesToStartWithoutItsOwnSecret() {
        assertThrows(IllegalStateException.class, () -> new ClaudeV1CapabilityService(properties(null)));
        assertThrows(IllegalStateException.class, () -> new ClaudeV1CapabilityService(properties("too-short")));
    }

    @Test
    void recallBatchCapabilityRoundTripsEveryBinding() {
        String capability = capabilityService.mintRecallBatchCapability(
                CONNECTION_ID, GOAL_ID, CARDS, CONFIGURED_BATCH_SIZE, 5L, issuedAt);

        ClaudeV1CapabilityService.RecallBatchClaim claim =
                capabilityService.verifyRecallBatchCapability(capability, CONNECTION_ID, GOAL_ID);
        assertEquals(sessionBinding(CONNECTION_ID), claim.sessionBinding());
        assertEquals(GOAL_ID, claim.goalId());
        assertEquals(CARDS, claim.cardIds());
        assertEquals(CONFIGURED_BATCH_SIZE, claim.configuredBatchSize());
        assertEquals(5L, claim.stateVersion());
        // Capabilities use the same millisecond precision as the canonical Verified Recall
        // contract; sub-millisecond precision is not part of the wire binding.
        assertEquals(Instant.ofEpochMilli(issuedAt.toEpochMilli()), claim.issuedAt());
    }

    @Test
    void capabilityEnvelopeDoesNotExposeTheOauthSubject() {
        String capability = capabilityService.mintRecallBatchCapability(
                CONNECTION_ID, GOAL_ID, CARDS, CONFIGURED_BATCH_SIZE, 5L, issuedAt);

        byte[] envelope = java.util.Base64.getUrlDecoder().decode(capability);
        String printableEnvelope = new String(envelope, java.nio.charset.StandardCharsets.ISO_8859_1);
        assertFalse(printableEnvelope.contains(CONNECTION_ID));
        assertFalse(printableEnvelope.contains(GOAL_ID));
    }

    @Test
    void memoryReviewCapabilityBindsConnectionGoalCardAndIssuedRevision() {
        String capability = capabilityService.mintMemoryPracticeReviewCapability(
                CONNECTION_ID,
                GOAL_ID,
                "card_1",
                5L);

        ClaudeV1CapabilityService.MemoryPracticeReviewClaim claim =
                capabilityService.verifyMemoryPracticeReviewCapability(
                        capability,
                        CONNECTION_ID,
                        GOAL_ID,
                        "card_1",
                        5L);
        assertEquals(sessionBinding(CONNECTION_ID), claim.sessionBinding());
        assertEquals(GOAL_ID, claim.goalId());
        assertEquals("card_1", claim.cardId());
        assertEquals(5L, claim.issuedStateVersion());

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyMemoryPracticeReviewCapability(
                        capability, OTHER_CONNECTION_ID, GOAL_ID, "card_1", 5L));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyMemoryPracticeReviewCapability(
                        capability, CONNECTION_ID, "other_goal", "card_1", 5L));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyMemoryPracticeReviewCapability(
                        capability, CONNECTION_ID, GOAL_ID, "card_2", 5L));
    }

    @Test
    void memoryReviewCapabilityRemainsUsableAcrossEarlierRatingsButNotBeforeItsIssueRevision() {
        String capability = capabilityService.mintMemoryPracticeReviewCapability(
                CONNECTION_ID,
                GOAL_ID,
                "card_2",
                5L);

        assertEquals(
                5L,
                capabilityService.verifyMemoryPracticeReviewCapability(
                        capability, CONNECTION_ID, GOAL_ID, "card_2", 7L).issuedStateVersion());
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyMemoryPracticeReviewCapability(
                        capability, CONNECTION_ID, GOAL_ID, "card_2", 4L));
    }

    @Test
    void memoryReviewCapabilityIsEncryptedAndCannotCrossCapabilityKinds() {
        String capability = capabilityService.mintMemoryPracticeReviewCapability(
                CONNECTION_ID,
                GOAL_ID,
                "card_1",
                5L);
        byte[] envelope = java.util.Base64.getUrlDecoder().decode(capability);
        String printableEnvelope = new String(envelope, java.nio.charset.StandardCharsets.ISO_8859_1);
        assertFalse(printableEnvelope.contains(CONNECTION_ID));
        assertFalse(printableEnvelope.contains(GOAL_ID));
        assertFalse(printableEnvelope.contains("card_1"));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyRecallBatchCapability(capability, CONNECTION_ID, GOAL_ID));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability(capability, CONNECTION_ID, GOAL_ID));
    }

    @Test
    void verificationWithoutAnExpectedGoalStillReturnsTheSignedGoal() {
        // The answers tool does not know the goal before verifying; the authenticated value is
        // authoritative because it is integrity-protected.
        String capability = capabilityService.mintRecallBatchCapability(
                CONNECTION_ID, GOAL_ID, CARDS, CONFIGURED_BATCH_SIZE, 5L, issuedAt);

        ClaudeV1CapabilityService.RecallBatchClaim claim =
                capabilityService.verifyRecallBatchCapability(capability, CONNECTION_ID, null);
        assertEquals(GOAL_ID, claim.goalId());
        assertEquals(CARDS, claim.cardIds());
    }

    @Test
    void aCapabilityIsBoundToItsConnectionGoalAndKind() {
        String batch = capabilityService.mintRecallBatchCapability(
                CONNECTION_ID, GOAL_ID, CARDS, CONFIGURED_BATCH_SIZE, 5L, issuedAt);

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyRecallBatchCapability(batch, OTHER_CONNECTION_ID, GOAL_ID));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyRecallBatchCapability(batch, CONNECTION_ID, "other_goal"));
        // A batch capability must not be usable where a grading capability is required.
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyRecallGradingCapability(batch, CONNECTION_ID, GOAL_ID));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability(batch, CONNECTION_ID, GOAL_ID));
    }

    @Test
    void aCapabilityMintedWithAnotherKeyDoesNotVerify() {
        ClaudeV1CapabilityService foreignService = new ClaudeV1CapabilityService(
                properties("a-completely-different-capability-secret-value"));
        String foreignCapability = foreignService.mintExamEvaluationCapability(CONNECTION_ID, GOAL_ID, 1L);

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability(foreignCapability, CONNECTION_ID, GOAL_ID));
    }

    @Test
    void tamperedAndMalformedCapabilitiesAreRefused() {
        String capability = capabilityService.mintExamEvaluationCapability(CONNECTION_ID, GOAL_ID, 1L);
        String tampered = capability.substring(0, capability.length() - 4) + "AAAA";

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability(tampered, CONNECTION_ID, GOAL_ID));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability("not base64!!", CONNECTION_ID, GOAL_ID));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability(null, CONNECTION_ID, GOAL_ID));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability("", CONNECTION_ID, GOAL_ID));
    }

    @Test
    void anExpiredCapabilityIsRefused() {
        ClaudeV1Properties shortLived = properties(ClaudeV1TestProperties.CAPABILITY_SECRET_VALUE);
        shortLived.setCapabilityTtl(Duration.ofMillis(1));
        ClaudeV1CapabilityService service = new ClaudeV1CapabilityService(shortLived);

        String capability = service.mintExamEvaluationCapability(CONNECTION_ID, GOAL_ID, 1L);
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () -> {
            Thread.sleep(20);
            service.verifyExamEvaluationCapability(capability, CONNECTION_ID, GOAL_ID);
        });
    }

    @Test
    void cardOrderIsPartOfTheAuthenticatedPayload() {
        String forward = capabilityService.mintRecallBatchCapability(
                CONNECTION_ID, GOAL_ID, List.of("card_1", "card_2"), CONFIGURED_BATCH_SIZE, 5L, issuedAt);
        String reversed = capabilityService.mintRecallBatchCapability(
                CONNECTION_ID, GOAL_ID, List.of("card_2", "card_1"), CONFIGURED_BATCH_SIZE, 5L, issuedAt);
        assertNotEquals(forward, reversed);

        assertEquals(
                List.of("card_1", "card_2"),
                capabilityService.verifyRecallBatchCapability(forward, CONNECTION_ID, GOAL_ID).cardIds());
    }

    @Test
    void cardIdsContainingASeparatorAreRefused() {
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.mintRecallBatchCapability(
                        CONNECTION_ID,
                        GOAL_ID,
                        List.of("card_1,card_2"),
                        CONFIGURED_BATCH_SIZE,
                        5L,
                        issuedAt));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.mintRecallBatchCapability(
                        CONNECTION_ID, GOAL_ID, List.of(), CONFIGURED_BATCH_SIZE, 5L, issuedAt));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.mintRecallBatchCapability(
                        CONNECTION_ID,
                        GOAL_ID,
                        List.of("card_1", "card_1"),
                        CONFIGURED_BATCH_SIZE,
                        5L,
                        issuedAt));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.mintRecallBatchCapability(
                        CONNECTION_ID, GOAL_ID, CARDS, 2, 5L, issuedAt));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.mintRecallBatchCapability(
                        CONNECTION_ID, GOAL_ID, CARDS, 21, 5L, issuedAt));
    }

    @Test
    void capabilityStateMustMatchTheCurrentCanonicalRevision() {
        String recall = capabilityService.mintRecallBatchCapability(
                CONNECTION_ID, GOAL_ID, CARDS, CONFIGURED_BATCH_SIZE, 5L, issuedAt);
        String exam = capabilityService.mintExamEvaluationCapability(CONNECTION_ID, GOAL_ID, 5L);

        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyRecallBatchCapability(
                        recall, CONNECTION_ID, GOAL_ID, 6L));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability(
                        exam, CONNECTION_ID, GOAL_ID, 6L));
    }

    @Test
    void oversizedTokensAndNegativeStateVersionsAreRefusedBeforeUse() {
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.verifyExamEvaluationCapability(
                        "a".repeat(20_000), CONNECTION_ID, GOAL_ID));
        assertThrows(ClaudeV1CapabilityService.CapabilityException.class, () ->
                capabilityService.mintExamEvaluationCapability(CONNECTION_ID, GOAL_ID, -1L));
    }

    @Test
    void examEvaluationCapabilityRoundTrips() {
        String capability = capabilityService.mintExamEvaluationCapability(CONNECTION_ID, "exam_xyz", 3L);
        assertNotNull(capability);

        ClaudeV1CapabilityService.ExamEvaluationClaim claim =
                capabilityService.verifyExamEvaluationCapability(capability, CONNECTION_ID, "exam_xyz");
        assertEquals(sessionBinding(CONNECTION_ID), claim.sessionBinding());
        assertEquals("exam_xyz", claim.goalId());
        assertEquals(3L, claim.stateVersion());
    }

    private String sessionBinding(String learningSessionId) {
        return new ClaudeV1SessionTokenCodec(properties(ClaudeV1TestProperties.CAPABILITY_SECRET_VALUE))
                .hash(learningSessionId);
    }
}
