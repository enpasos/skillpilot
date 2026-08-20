package com.skillpilot.backend.connectors.claude.v1.identity;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import com.skillpilot.backend.service.LearnerService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Manages the lifecycle of binding transactions and connections for Claude v1.
 *
 * <p>Handles are random 256-bit values that are stored only as a SHA-256 digest, so a database
 * reader cannot replay an outstanding binding. The permanent SkillPilot id is written once, to the
 * connection row, and is removed again on revocation.</p>
 */
@Service
@ConditionalOnClaudeV1Enabled
public class ClaudeV1BindingService {

    private static final Pattern SKILLPILOT_ID_PATTERN =
            Pattern.compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
    private static final Pattern HANDLE_PATTERN = Pattern.compile("^[0-9a-f]{64}$");

    public record BindingResult(String connectionId, ClaudeV1BindingTransaction transaction) {}

    private final ClaudeV1ConnectionRepository connectionRepository;
    private final LearnerService learnerService;
    private final ClaudeV1Properties properties;
    private final SecureRandom secureRandom = new SecureRandom();

    public ClaudeV1BindingService(
            ClaudeV1ConnectionRepository connectionRepository,
            LearnerService learnerService,
            ClaudeV1Properties properties) {
        this.connectionRepository = Objects.requireNonNull(connectionRepository, "connectionRepository");
        this.learnerService = Objects.requireNonNull(learnerService, "learnerService");
        this.properties = Objects.requireNonNull(properties, "properties");
    }

    @Transactional
    public String createBindingTransaction(
            String oauthState,
            String codeChallenge,
            String codeChallengeMethod,
            String registeredClientId,
            String redirectUri,
            String scope) {
        return createBindingTransaction(
                oauthState,
                codeChallenge,
                codeChallengeMethod,
                registeredClientId,
                redirectUri,
                scope,
                properties.getPublicMcpUrl());
    }

    @Transactional
    public String createBindingTransaction(
            String oauthState,
            String codeChallenge,
            String codeChallengeMethod,
            String registeredClientId,
            String redirectUri,
            String scope,
            String resource) {

        requireBounded(oauthState, "oauthState", 256);
        requireBounded(codeChallenge, "codeChallenge", 128);
        requireBounded(registeredClientId, "registeredClientId", 256);
        requireBounded(redirectUri, "redirectUri", 1024);
        requireBounded(scope, "scope", 256);
        requireBounded(resource, "resource", 512);
        if (!"S256".equals(codeChallengeMethod)) {
            throw new IllegalArgumentException("Only PKCE S256 binding transactions are accepted.");
        }

        Instant now = Instant.now();
        // Reclaim expired handshakes here rather than from a scheduler bean, which this lane is
        // not permitted to create.
        connectionRepository.deleteExpiredBindingTransactions(now);

        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        String handle = HexFormat.of().formatHex(randomBytes);
        connectionRepository.insertBindingTransaction(new ClaudeV1BindingTransaction(
                sha256Hex(handle),
                oauthState,
                codeChallenge,
                codeChallengeMethod,
                registeredClientId,
                redirectUri,
                scope,
                resource,
                null,
                ClaudeV1BindingTransaction.STATUS_PENDING,
                now.plus(properties.getBindingTransactionTtl()),
                now));

        // Only the caller receives the clear handle; the row keeps the digest.
        return handle;
    }

    /**
     * Binds a decrypted SkillPilot id to a pending transaction and returns the new opaque
     * connection id. The learner must already exist — Claude v1 never creates learners.
     */
    @Transactional
    public String bindLearner(String handle, String skillpilotId) {
        return bindLearnerWithResult(handle, skillpilotId).connectionId();
    }

    @Transactional
    public BindingResult bindLearnerWithResult(String handle, String skillpilotId) {
        Objects.requireNonNull(handle, "handle");
        Objects.requireNonNull(skillpilotId, "skillpilotId");
        if (!HANDLE_PATTERN.matcher(handle).matches()) {
            throw new IllegalArgumentException("The binding handle is malformed.");
        }

        String normalizedId = skillpilotId.trim().toLowerCase(java.util.Locale.ROOT);
        if (!SKILLPILOT_ID_PATTERN.matcher(normalizedId).matches()) {
            throw new IllegalArgumentException("The submitted SkillPilot id is not a well-formed identifier.");
        }

        ClaudeV1BindingTransaction tx = connectionRepository.findBindingTransactionById(sha256Hex(handle))
                .orElseThrow(() -> new IllegalArgumentException("Binding transaction not found or invalid."));
        if (!tx.isPending()) {
            throw new IllegalStateException("Binding transaction is not pending or has expired.");
        }

        learnerService.assertActiveLearnerRouteAccess(normalizedId);

        Instant now = Instant.now();
        String connectionId = "conn_claude_v1_" + UUID.randomUUID().toString().replace("-", "");
        connectionRepository.insertConnection(new ClaudeV1Connection(
                connectionId,
                normalizedId,
                learnerAuditHash(normalizedId),
                tx.registeredClientId(),
                ClaudeV1Connection.STATUS_ACTIVE,
                now,
                now));
        if (!connectionRepository.bindPendingTransaction(tx.id(), connectionId, now)) {
            // The surrounding transaction rolls the just-created connection back. This closes the
            // double-submit race without leaving an orphan active subject behind.
            throw new IllegalStateException("Binding transaction was completed concurrently.");
        }

        return new BindingResult(connectionId, tx.withBoundConnection(connectionId));
    }

    /** Resolves only a still-pending transaction for the server-authoritative consent display. */
    public ClaudeV1BindingTransaction requirePendingTransaction(String handle) {
        if (handle == null || !HANDLE_PATTERN.matcher(handle).matches()) {
            throw new IllegalArgumentException("The binding handle is malformed.");
        }
        ClaudeV1BindingTransaction transaction = connectionRepository
                .findBindingTransactionById(sha256Hex(handle))
                .orElseThrow(() -> new IllegalArgumentException("Binding transaction not found or invalid."));
        if (!transaction.isPending()) {
            throw new IllegalStateException("Binding transaction is not pending or has expired.");
        }
        return transaction;
    }

    /** Looks up a transaction that is bound and still valid, without consuming it. */
    public Optional<ClaudeV1BindingTransaction> findBoundTransactionByState(String oauthState) {
        Objects.requireNonNull(oauthState, "oauthState");
        return connectionRepository.findBindingTransactionByOAuthState(oauthState)
                .filter(ClaudeV1BindingTransaction::isBound);
    }

    /** Atomically consumes a bound transaction; {@code false} means somebody else already did. */
    @Transactional
    public boolean consumeBindingTransaction(ClaudeV1BindingTransaction transaction) {
        Objects.requireNonNull(transaction, "transaction");
        return connectionRepository.consumeBindingTransaction(transaction.id());
    }

    public Optional<ClaudeV1Connection> findActiveConnection(String connectionId) {
        return connectionRepository.findActiveConnectionById(connectionId);
    }

    public void touchConnection(String connectionId) {
        connectionRepository.updateConnectionLastActivity(connectionId, Instant.now());
    }

    @Transactional
    public void revokeConnection(String connectionId) {
        connectionRepository.deleteBindingTransactionsForConnection(connectionId);
        connectionRepository.revokeConnection(connectionId);
    }

    public static String sha256Hex(String input) {
        if (input == null) {
            return "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(input.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is unavailable", e);
        }
    }

    private String learnerAuditHash(String learnerId) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    properties.getSigningSecret().getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(learnerId.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("HmacSHA256 is unavailable", e);
        }
    }

    private static void requireBounded(String value, String name, int maxLength) {
        if (value == null || value.isBlank() || value.length() > maxLength) {
            throw new IllegalArgumentException(name + " is missing or exceeds its permitted length.");
        }
    }
}
