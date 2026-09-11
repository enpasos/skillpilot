package com.skillpilot.backend.oauth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Objects;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/** Shared, bounded one-time assertion consumption; never stores a JWT or its raw identifiers. */
public final class JdbcOAuthClientAssertionReplayStore {
    private final JdbcOperations jdbc;
    private final TransactionTemplate transaction;
    private final Clock clock;
    private final String databaseTimeQuery;

    public JdbcOAuthClientAssertionReplayStore(JdbcOperations jdbc, PlatformTransactionManager manager) {
        this(jdbc, manager, null);
    }

    public JdbcOAuthClientAssertionReplayStore(
            JdbcOperations jdbc, PlatformTransactionManager manager, Clock clock) {
        this.jdbc = Objects.requireNonNull(jdbc);
        // Production uses the database clock, not the local JVM clock. Otherwise a fast
        // node could purge a jti which a lagging node still accepts during clock tolerance.
        this.clock = clock;
        this.databaseTimeQuery = clock == null ? jdbc.execute((ConnectionCallback<String>) connection ->
                "PostgreSQL".equals(connection.getMetaData().getDatabaseProductName())
                        ? "SELECT clock_timestamp()" : "SELECT CURRENT_TIMESTAMP") : null;
        this.transaction = new TransactionTemplate(Objects.requireNonNull(manager));
        // A later failed grant/outer transaction must not resurrect the assertion.
        this.transaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    public boolean consume(String clientId, String jti, Instant retainUntil, int maxEntries) {
        if (clientId == null || clientId.isBlank() || jti == null || jti.isBlank()
                || retainUntil == null || maxEntries <= 0) {
            throw new IllegalArgumentException("Invalid assertion replay parameters.");
        }
        String key = digest(clientId.length() + ":" + clientId + jti);
        return Boolean.TRUE.equals(transaction.execute(status -> {
            // A dedicated seeded row serializes cleanup/capacity/insert across JVMs and restarts.
            jdbc.queryForObject("SELECT id FROM oauth_client_assertion_lock WHERE id = 1 FOR UPDATE", Integer.class);
            Instant now = clock != null ? clock.instant() : Objects.requireNonNull(
                    jdbc.queryForObject(databaseTimeQuery, Timestamp.class)).toInstant();
            if (retainUntil.isBefore(now)) {
                return false;
            }
            // Keep the boundary instant: the JWT timestamp validator can still accept equality.
            jdbc.update("DELETE FROM oauth_client_assertion_replay WHERE retain_until < ?", Timestamp.from(now));
            Long existing = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM oauth_client_assertion_replay WHERE replay_key = ?", Long.class, key);
            if (existing == null || existing != 0) {
                return false;
            }
            Long count = jdbc.queryForObject("SELECT COUNT(*) FROM oauth_client_assertion_replay", Long.class);
            if (count == null || count >= maxEntries) {
                return false;
            }
            jdbc.update("INSERT INTO oauth_client_assertion_replay (replay_key, retain_until) VALUES (?, ?)",
                    key, Timestamp.from(retainUntil));
            return true;
        }));
    }

    static String digest(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 is unavailable.", impossible);
        }
    }
}
