package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1RuntimeValidation;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Mints and cryptographically validates short-lived capabilities for normal memory practice,
 * Verified Recall and Exam Evaluation.
 *
 * <p>Every capability binds provider, learning-session HMAC, learning goal, the exact card or ordered card
 * list relevant to its purpose, the learner state revision it was issued against, and an expiry.
 * The payload is authenticated and
 * encrypted: Claude can copy it unchanged but cannot read the session binding embedded in it.
 * Verification is fail-closed: an unparsable, unauthenticated, expired or mismatched capability
 * throws rather than degrading to a weaker check.</p>
 */
@Service
@ConditionalOnClaudeV1Enabled
public class ClaudeV1CapabilityService {

    private static final String KIND_RECALL_BATCH = "RECALL_BATCH";
    private static final String KIND_RECALL_GRADING = "RECALL_GRADING";
    private static final String KIND_EXAM_EVALUATION = "EXAM_EVAL";
    private static final String KIND_MEMORY_PRACTICE_REVIEW = "MEMORY_REVIEW";
    private static final String FIELD_SEPARATOR = "|";
    private static final String CARD_SEPARATOR = ",";
    private static final int MAX_CAPABILITY_CHARACTERS = 16_384;
    private static final int MAX_BINDING_VALUE_LENGTH = 256;
    private static final int MAX_RECALL_CARDS = 20;
    private static final byte TOKEN_VERSION = 1;
    private static final int GCM_NONCE_BYTES = 12;
    private static final int GCM_TAG_BITS = 128;
    private static final byte[] TOKEN_AAD =
            "SkillPilot\0ClaudeConnector\0Capability\0v1".getBytes(StandardCharsets.UTF_8);
    private static final byte[] KEY_CONTEXT =
            "SkillPilot\0ClaudeConnector\0CapabilityKey\0v1\0".getBytes(StandardCharsets.UTF_8);

    /** Thrown for every capability that fails to verify, so callers can map one error code. */
    public static class CapabilityException extends RuntimeException {
        public CapabilityException(String message) {
            super(message);
        }
    }

    public record RecallBatchClaim(
            String sessionBinding,
            String goalId,
            List<String> cardIds,
            int configuredBatchSize,
            long stateVersion,
            Instant issuedAt,
            Instant expiresAt) {}

    public record ExamEvaluationClaim(
            String sessionBinding,
            String goalId,
            long stateVersion,
            Instant expiresAt) {}

    public record MemoryPracticeReviewClaim(
            String sessionBinding,
            String goalId,
            String cardId,
            long issuedStateVersion,
            Instant expiresAt) {}

    private final ClaudeV1Properties properties;
    private final ClaudeV1SessionTokenCodec sessionTokens;
    private final ClaudeV1LearningSessionRepository sessions;
    private final SecretKeySpec capabilityKey;
    private final SecureRandom secureRandom = new SecureRandom();

    @Autowired
    public ClaudeV1CapabilityService(
            ClaudeV1Properties properties,
            ClaudeV1LearningSessionRepository sessions) {
        this(properties, sessions, true);
    }

    /** Test-only constructor for cryptographic unit tests without JDBC persistence. */
    ClaudeV1CapabilityService(ClaudeV1Properties properties) {
        this(properties, null, false);
    }

    private ClaudeV1CapabilityService(
            ClaudeV1Properties properties,
            ClaudeV1LearningSessionRepository sessions,
            boolean requireSessionRepository) {
        this.properties = Objects.requireNonNull(properties, "properties");
        this.sessionTokens = new ClaudeV1SessionTokenCodec(properties);
        this.sessions = requireSessionRepository
                ? Objects.requireNonNull(sessions, "sessions")
                : sessions;
        String secret = properties.getCapabilitySecret();
        if (!ClaudeV1RuntimeValidation.isValidSecret(secret)) {
            // No default key: a capability encrypted with a value shipped in the source tree would be
            // forgeable by anyone who can read this repository.
            throw new IllegalStateException(
                    "Claude Connector v1 requires a configured capability secret of at least "
                            + ClaudeV1RuntimeValidation.MINIMUM_SECRET_LENGTH + " characters.");
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(KEY_CONTEXT);
            this.capabilityKey = new SecretKeySpec(
                    digest.digest(secret.getBytes(StandardCharsets.UTF_8)),
                    "AES");
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }

    public String mintRecallBatchCapability(
            String learningSessionId,
            String goalId,
            List<String> cardIds,
            int configuredBatchSize,
            long stateVersion,
            Instant issuedAt) {
        return mintRecallCapability(
                KIND_RECALL_BATCH,
                learningSessionId,
                goalId,
                cardIds,
                configuredBatchSize,
                stateVersion,
                issuedAt);
    }

    public String mintRecallGradingCapability(
            String learningSessionId,
            String goalId,
            List<String> cardIds,
            int configuredBatchSize,
            long stateVersion,
            Instant issuedAt) {
        return mintRecallCapability(
                KIND_RECALL_GRADING,
                learningSessionId,
                goalId,
                cardIds,
                configuredBatchSize,
                stateVersion,
                issuedAt);
    }

    public RecallBatchClaim verifyRecallBatchCapability(
            String capability,
            String expectedLearningSessionId,
            String expectedGoalId) {
        return verifyRecallBatchCapability(capability, expectedLearningSessionId, expectedGoalId, null);
    }

    public RecallBatchClaim verifyRecallBatchCapability(
            String capability,
            String expectedLearningSessionId,
            String expectedGoalId,
            Long expectedStateVersion) {
        return verifyRecallCapability(
                KIND_RECALL_BATCH, capability, expectedLearningSessionId, expectedGoalId, expectedStateVersion);
    }

    public RecallBatchClaim verifyRecallGradingCapability(
            String capability,
            String expectedLearningSessionId,
            String expectedGoalId) {
        return verifyRecallGradingCapability(capability, expectedLearningSessionId, expectedGoalId, null);
    }

    public RecallBatchClaim verifyRecallGradingCapability(
            String capability,
            String expectedLearningSessionId,
            String expectedGoalId,
            Long expectedStateVersion) {
        return verifyRecallCapability(
                KIND_RECALL_GRADING, capability, expectedLearningSessionId, expectedGoalId, expectedStateVersion);
    }

    public String mintExamEvaluationCapability(String learningSessionId, String goalId, long stateVersion) {
        String sessionBinding = sessionBinding(learningSessionId);
        requireBindingValue(goalId, "goalId");
        requireStateVersion(stateVersion);
        Instant expiresAt = capabilityExpiresAt(learningSessionId);
        String payload = String.join(
                FIELD_SEPARATOR,
                KIND_EXAM_EVALUATION,
                sessionBinding,
                goalId,
                Long.toString(stateVersion),
                Long.toString(expiresAt.toEpochMilli()));
        return encryptAndEncode(payload);
    }

    /**
     * Authorizes one app-only rating for one exact card in the bounded batch issued to this OAuth
     * connection. The encrypted token carries the technical identifiers and the state revision at
     * which the batch was loaded, so none of those bindings must be exposed in model-visible
     * content.
     */
    public String mintMemoryPracticeReviewCapability(
            String learningSessionId,
            String goalId,
            String cardId,
            long issuedStateVersion) {
        String sessionBinding = sessionBinding(learningSessionId);
        requireBindingValue(goalId, "goalId");
        requireBindingValue(cardId, "cardId");
        requireStateVersion(issuedStateVersion);
        Instant expiresAt = capabilityExpiresAt(learningSessionId);
        String payload = String.join(
                FIELD_SEPARATOR,
                KIND_MEMORY_PRACTICE_REVIEW,
                sessionBinding,
                goalId,
                cardId,
                Long.toString(issuedStateVersion),
                Long.toString(expiresAt.toEpochMilli()));
        return encryptAndEncode(payload);
    }

    /**
     * Verifies a private review capability against the current OAuth connection, active goal and
     * exact card. The issued revision is a lower bound rather than an equality check: every card in
     * one component-local batch is minted at the same revision, while each preceding card rating
     * legitimately advances the canonical revision. The caller still supplies the newest revision
     * to {@link ClaudeV1SessionCoordinator}, which enforces exact optimistic concurrency before the
     * write.
     */
    public MemoryPracticeReviewClaim verifyMemoryPracticeReviewCapability(
            String capability,
            String expectedLearningSessionId,
            String expectedGoalId,
            String expectedCardId,
            long currentStateVersion) {
        String[] parts = verifyAndSplit(capability, KIND_MEMORY_PRACTICE_REVIEW, 6);
        String sessionBinding = parts[1];
        String goalId = parts[2];
        String cardId = parts[3];
        long issuedStateVersion = parseLong(parts[4]);
        Instant expiresAt = parseInstant(parts[5]);

        requireNotExpired(expiresAt);
        requireBinding(sessionBinding(expectedLearningSessionId), sessionBinding, "learning session");
        requireBinding(expectedGoalId, goalId, "goal");
        requireBinding(expectedCardId, cardId, "card");
        requireStateVersion(currentStateVersion);
        requireStateVersion(issuedStateVersion);
        if (currentStateVersion < issuedStateVersion) {
            throw new CapabilityException("Capability was issued for a newer learner state.");
        }
        return new MemoryPracticeReviewClaim(
                sessionBinding,
                goalId,
                cardId,
                issuedStateVersion,
                expiresAt);
    }

    public ExamEvaluationClaim verifyExamEvaluationCapability(
            String capability,
            String expectedLearningSessionId,
            String expectedGoalId) {
        return verifyExamEvaluationCapability(capability, expectedLearningSessionId, expectedGoalId, null);
    }

    public ExamEvaluationClaim verifyExamEvaluationCapability(
            String capability,
            String expectedLearningSessionId,
            String expectedGoalId,
            Long expectedStateVersion) {
        String[] parts = verifyAndSplit(capability, KIND_EXAM_EVALUATION, 5);
        String sessionBinding = parts[1];
        String goalId = parts[2];
        long stateVersion = parseLong(parts[3]);
        Instant expiresAt = parseInstant(parts[4]);

        requireNotExpired(expiresAt);
        requireBinding(sessionBinding(expectedLearningSessionId), sessionBinding, "learning session");
        requireBinding(expectedGoalId, goalId, "goal");
        requireStateBinding(expectedStateVersion, stateVersion);

        return new ExamEvaluationClaim(sessionBinding, goalId, stateVersion, expiresAt);
    }

    private String mintRecallCapability(
            String kind,
            String learningSessionId,
            String goalId,
            List<String> cardIds,
            int configuredBatchSize,
            long stateVersion,
            Instant issuedAt) {
        String sessionBinding = sessionBinding(learningSessionId);
        requireBindingValue(goalId, "goalId");
        Objects.requireNonNull(cardIds, "cardIds");
        Objects.requireNonNull(issuedAt, "issuedAt");
        requireStateVersion(stateVersion);
        if (cardIds.isEmpty() || cardIds.size() > MAX_RECALL_CARDS) {
            throw new CapabilityException("A recall capability must bind a bounded, non-empty card batch.");
        }
        validateRecallCardIds(cardIds);
        validateConfiguredBatchSize(configuredBatchSize, cardIds.size());

        Instant expiresAt = capabilityExpiresAt(learningSessionId);
        String payload = String.join(
                FIELD_SEPARATOR,
                kind,
                sessionBinding,
                goalId,
                String.join(CARD_SEPARATOR, cardIds),
                Integer.toString(configuredBatchSize),
                Long.toString(stateVersion),
                Long.toString(issuedAt.toEpochMilli()),
                Long.toString(expiresAt.toEpochMilli()));
        return encryptAndEncode(payload);
    }

    private RecallBatchClaim verifyRecallCapability(
            String kind,
            String capability,
            String expectedLearningSessionId,
            String expectedGoalId,
            Long expectedStateVersion) {
        String[] parts = verifyAndSplit(capability, kind, 8);
        String sessionBinding = parts[1];
        String goalId = parts[2];
        List<String> cardIds = List.of(parts[3].split(CARD_SEPARATOR, -1));
        int configuredBatchSize = parseInt(parts[4]);
        long stateVersion = parseLong(parts[5]);
        Instant issuedAt = parseInstant(parts[6]);
        Instant expiresAt = parseInstant(parts[7]);

        validateRecallCardIds(cardIds);
        validateConfiguredBatchSize(configuredBatchSize, cardIds.size());
        if (issuedAt.isAfter(expiresAt)) {
            throw new CapabilityException("Capability contains an invalid issue interval.");
        }
        requireNotExpired(expiresAt);
        requireBinding(sessionBinding(expectedLearningSessionId), sessionBinding, "learning session");
        requireBinding(expectedGoalId, goalId, "goal");
        requireStateBinding(expectedStateVersion, stateVersion);

        return new RecallBatchClaim(
                sessionBinding,
                goalId,
                cardIds,
                configuredBatchSize,
                stateVersion,
                issuedAt,
                expiresAt);
    }

    /**
     * Compares one binding field. A {@code null} expectation means the caller does not yet know the
     * value and accepts the authenticated one; it never means "skip because the check is
     * inconvenient" — the value is authentic either way because the encrypted payload is
     * integrity-protected.
     */
    private void requireBinding(String expected, String actual, String what) {
        if (expected != null && !expected.equals(actual)) {
            throw new CapabilityException("Capability does not match the active " + what + ".");
        }
    }

    private String sessionBinding(String learningSessionId) {
        String binding = sessionTokens.hash(learningSessionId);
        requireBindingValue(binding, "sessionBinding");
        return binding;
    }

    private Instant capabilityExpiresAt(String learningSessionId) {
        Instant configuredExpiry = Instant.now().plus(properties.getCapabilityTtl());
        if (sessions == null) {
            return configuredExpiry;
        }
        String tokenHash = sessionBinding(learningSessionId);
        Instant sessionExpiry = sessions.findByTokenHash(tokenHash)
                .orElseThrow(() -> new CapabilityException("Learning session is not active."))
                .expiresAt();
        if (!Instant.now().isBefore(sessionExpiry)) {
            throw new CapabilityException("Learning session has expired.");
        }
        return configuredExpiry.isBefore(sessionExpiry) ? configuredExpiry : sessionExpiry;
    }

    private void requireBindingValue(String value, String name) {
        if (value == null
                || value.isBlank()
                || value.length() > MAX_BINDING_VALUE_LENGTH
                || value.contains(FIELD_SEPARATOR)) {
            throw new CapabilityException(name + " must not be empty when minting a capability.");
        }
    }

    private void validateRecallCardIds(List<String> cardIds) {
        if (cardIds == null || cardIds.isEmpty() || cardIds.size() > MAX_RECALL_CARDS) {
            throw new CapabilityException("A recall capability must bind a bounded, non-empty card batch.");
        }
        HashSet<String> uniqueCards = new HashSet<>();
        for (String cardId : cardIds) {
            requireBindingValue(cardId, "cardId");
            if (!uniqueCards.add(cardId)
                    || cardId.contains(CARD_SEPARATOR)
                    || cardId.contains(FIELD_SEPARATOR)) {
                throw new CapabilityException("Card identifiers must not contain a payload separator.");
            }
        }
    }

    private void validateConfiguredBatchSize(int configuredBatchSize, int issuedCardCount) {
        if (configuredBatchSize < issuedCardCount || configuredBatchSize > MAX_RECALL_CARDS) {
            throw new CapabilityException("Capability contains an invalid server batch size.");
        }
    }

    private void requireStateVersion(long stateVersion) {
        if (stateVersion < 0) {
            throw new CapabilityException("Capability state version must not be negative.");
        }
    }

    private void requireStateBinding(Long expected, long actual) {
        requireStateVersion(actual);
        if (expected != null && expected.longValue() != actual) {
            throw new CapabilityException("Capability does not match the current learner state.");
        }
    }

    private void requireNotExpired(Instant expiresAt) {
        if (!Instant.now().isBefore(expiresAt)) {
            throw new CapabilityException("Capability has expired.");
        }
    }

    private String[] verifyAndSplit(String capability, String expectedKind, int expectedFields) {
        String payload = verifyAndDecode(capability);
        String[] parts = payload.split("\\" + FIELD_SEPARATOR, expectedFields);
        if (parts.length != expectedFields || !expectedKind.equals(parts[0])) {
            throw new CapabilityException("Capability is not a valid " + expectedKind + " token.");
        }
        return parts;
    }

    private long parseLong(String value) {
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            throw new CapabilityException("Capability contains a malformed numeric field.");
        }
    }

    private int parseInt(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new CapabilityException("Capability contains a malformed numeric field.");
        }
    }

    private Instant parseInstant(String value) {
        try {
            return Instant.ofEpochMilli(parseLong(value));
        } catch (java.time.DateTimeException e) {
            throw new CapabilityException("Capability contains a malformed timestamp.");
        }
    }

    private String encryptAndEncode(String payload) {
        try {
            byte[] nonce = new byte[GCM_NONCE_BYTES];
            secureRandom.nextBytes(nonce);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, capabilityKey, new GCMParameterSpec(GCM_TAG_BITS, nonce));
            cipher.updateAAD(TOKEN_AAD);
            byte[] ciphertext = cipher.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            byte[] tokenBytes = new byte[1 + nonce.length + ciphertext.length];
            tokenBytes[0] = TOKEN_VERSION;
            System.arraycopy(nonce, 0, tokenBytes, 1, nonce.length);
            System.arraycopy(ciphertext, 0, tokenBytes, 1 + nonce.length, ciphertext.length);
            String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
            if (token.length() > MAX_CAPABILITY_CHARACTERS) {
                throw new CapabilityException("Capability payload exceeds its permitted size.");
            }
            return token;
        } catch (CapabilityException e) {
            throw e;
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("AES-GCM is unavailable", e);
        }
    }

    private String verifyAndDecode(String token) {
        if (token == null || token.isBlank() || token.length() > MAX_CAPABILITY_CHARACTERS) {
            throw new CapabilityException("Capability token is missing.");
        }
        byte[] tokenBytes;
        try {
            tokenBytes = Base64.getUrlDecoder().decode(token);
        } catch (IllegalArgumentException e) {
            throw new CapabilityException("Capability token is not valid base64url.");
        }
        if (!Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes).equals(token)
                || tokenBytes.length <= 1 + GCM_NONCE_BYTES + (GCM_TAG_BITS / 8)
                || tokenBytes[0] != TOKEN_VERSION) {
            throw new CapabilityException("Capability token has an invalid envelope.");
        }
        try {
            byte[] nonce = java.util.Arrays.copyOfRange(tokenBytes, 1, 1 + GCM_NONCE_BYTES);
            byte[] ciphertext = java.util.Arrays.copyOfRange(tokenBytes, 1 + GCM_NONCE_BYTES, tokenBytes.length);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, capabilityKey, new GCMParameterSpec(GCM_TAG_BITS, nonce));
            cipher.updateAAD(TOKEN_AAD);
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (java.security.GeneralSecurityException e) {
            throw new CapabilityException("Capability authentication failed.");
        }
    }
}
