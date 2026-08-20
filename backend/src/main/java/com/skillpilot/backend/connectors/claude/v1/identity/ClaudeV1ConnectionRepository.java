package com.skillpilot.backend.connectors.claude.v1.identity;

import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

/**
 * JDBC repository for Claude v1 connections and binding transactions.
 *
 * <p>Connection identifiers are immutable and inserted exactly once. A duplicate identifier is a
 * hard failure instead of an upsert that could accidentally reactivate or relink a revoked
 * subject.</p>
 */
@Repository
@ConditionalOnClaudeV1Enabled
public class ClaudeV1ConnectionRepository {

    private static final String CONNECTION_COLUMNS =
            "id, skillpilot_id, learner_id_hash, registered_client_id, status, created_at, last_activity_at";
    private static final String TRANSACTION_COLUMNS =
            "id, oauth_state, code_challenge, code_challenge_method, registered_client_id, redirect_uri, "
                    + "scope, resource, bound_connection_id, status, expires_at, created_at";

    private final JdbcTemplate jdbcTemplate;

    public ClaudeV1ConnectionRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = Objects.requireNonNull(jdbcTemplate, "jdbcTemplate");
    }

    public void insertConnection(ClaudeV1Connection connection) {
        Objects.requireNonNull(connection, "connection");
        jdbcTemplate.update("""
                INSERT INTO claude_v1_connection (%s) VALUES (?, ?, ?, ?, ?, ?, ?)
                """.formatted(CONNECTION_COLUMNS),
                connection.id(),
                connection.skillpilotId(),
                connection.learnerIdHash(),
                connection.registeredClientId(),
                connection.status(),
                Timestamp.from(connection.createdAt()),
                Timestamp.from(connection.lastActivityAt()));
    }

    public Optional<ClaudeV1Connection> findConnectionById(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        List<ClaudeV1Connection> results = jdbcTemplate.query(
                "SELECT " + CONNECTION_COLUMNS + " FROM claude_v1_connection WHERE id = ?",
                new ConnectionRowMapper(),
                id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.getFirst());
    }

    public Optional<ClaudeV1Connection> findActiveConnectionById(String id) {
        return findConnectionById(id).filter(ClaudeV1Connection::isActive);
    }

    /** Locks an active connection for a state-changing operation or revocation boundary. */
    public Optional<ClaudeV1Connection> findActiveConnectionByIdForUpdate(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        List<ClaudeV1Connection> results = jdbcTemplate.query(
                "SELECT " + CONNECTION_COLUMNS
                        + " FROM claude_v1_connection WHERE id = ? AND status = ? FOR UPDATE",
                new ConnectionRowMapper(),
                id,
                ClaudeV1Connection.STATUS_ACTIVE);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.getFirst());
    }

    public void updateConnectionLastActivity(String id, Instant lastActivityAt) {
        if (id == null || id.isBlank() || lastActivityAt == null) {
            return;
        }
        jdbcTemplate.update(
                "UPDATE claude_v1_connection SET last_activity_at = ? WHERE id = ?",
                Timestamp.from(lastActivityAt),
                id);
    }

    public void revokeConnection(String id) {
        if (id == null || id.isBlank()) {
            return;
        }
        // Revocation clears the permanent learner reference but keeps the row, so a revoked
        // connection id can never be re-resolved to a learner while remaining auditable.
        jdbcTemplate.update("""
                UPDATE claude_v1_connection
                   SET status = ?, skillpilot_id = NULL, learner_id_hash = NULL, last_activity_at = ?
                 WHERE id = ?
                """,
                ClaudeV1Connection.STATUS_REVOKED,
                Timestamp.from(Instant.now()),
                id);
    }

    public void insertBindingTransaction(ClaudeV1BindingTransaction tx) {
        Objects.requireNonNull(tx, "tx");
        jdbcTemplate.update("""
                INSERT INTO claude_v1_binding_transaction (%s) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """.formatted(TRANSACTION_COLUMNS),
                tx.id(),
                tx.oauthState(),
                tx.codeChallenge(),
                tx.codeChallengeMethod(),
                tx.registeredClientId(),
                tx.redirectUri(),
                tx.scope(),
                tx.resource(),
                tx.boundConnectionId(),
                tx.status(),
                Timestamp.from(tx.expiresAt()),
                Timestamp.from(tx.createdAt()));
    }

    /**
     * Atomically changes a still-pending transaction into the bound state. A concurrent second
     * browser submission updates zero rows, which lets its surrounding transaction roll back the
     * connection row it just attempted to create.
     */
    public boolean bindPendingTransaction(String id, String connectionId, Instant now) {
        if (id == null || id.isBlank() || connectionId == null || connectionId.isBlank()) {
            return false;
        }
        return jdbcTemplate.update("""
                UPDATE claude_v1_binding_transaction
                   SET bound_connection_id = ?, status = ?
                 WHERE id = ? AND status = ? AND expires_at > ?
                """,
                connectionId,
                ClaudeV1BindingTransaction.STATUS_BOUND,
                id,
                ClaudeV1BindingTransaction.STATUS_PENDING,
                Timestamp.from(now)) == 1;
    }

    /**
     * Marks a bound transaction as consumed, but only while it is still bound. The affected-row
     * count is the one-time-use guard: a second caller updates zero rows and is refused.
     */
    public boolean consumeBindingTransaction(String id) {
        if (id == null || id.isBlank()) {
            return false;
        }
        return jdbcTemplate.update("""
                UPDATE claude_v1_binding_transaction
                   SET status = ?
                 WHERE id = ? AND status = ? AND expires_at > ?
                """,
                ClaudeV1BindingTransaction.STATUS_CONSUMED,
                id,
                ClaudeV1BindingTransaction.STATUS_BOUND,
                Timestamp.from(Instant.now())) == 1;
    }

    public Optional<ClaudeV1BindingTransaction> findBindingTransactionById(String id) {
        if (id == null || id.isBlank()) {
            return Optional.empty();
        }
        List<ClaudeV1BindingTransaction> results = jdbcTemplate.query(
                "SELECT " + TRANSACTION_COLUMNS + " FROM claude_v1_binding_transaction WHERE id = ?",
                new BindingTransactionRowMapper(),
                id);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.getFirst());
    }

    public Optional<ClaudeV1BindingTransaction> findBindingTransactionByOAuthState(String oauthState) {
        if (oauthState == null || oauthState.isBlank()) {
            return Optional.empty();
        }
        List<ClaudeV1BindingTransaction> results = jdbcTemplate.query(
                "SELECT " + TRANSACTION_COLUMNS + " FROM claude_v1_binding_transaction WHERE oauth_state = ?",
                new BindingTransactionRowMapper(),
                oauthState);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.getFirst());
    }

    public int deleteExpiredBindingTransactions(Instant now) {
        return jdbcTemplate.update(
                "DELETE FROM claude_v1_binding_transaction WHERE expires_at <= ?",
                Timestamp.from(now));
    }

    public int deleteBindingTransactionsForConnection(String connectionId) {
        if (connectionId == null || connectionId.isBlank()) {
            return 0;
        }
        return jdbcTemplate.update(
                "DELETE FROM claude_v1_binding_transaction WHERE bound_connection_id = ?",
                connectionId);
    }

    private static class ConnectionRowMapper implements RowMapper<ClaudeV1Connection> {
        @Override
        public ClaudeV1Connection mapRow(ResultSet rs, int rowNum) throws SQLException {
            String skillpilotId = rs.getString("skillpilot_id");
            return new ClaudeV1Connection(
                    rs.getString("id"),
                    skillpilotId == null ? "" : skillpilotId,
                    rs.getString("learner_id_hash"),
                    rs.getString("registered_client_id"),
                    rs.getString("status"),
                    rs.getTimestamp("created_at").toInstant(),
                    rs.getTimestamp("last_activity_at").toInstant());
        }
    }

    private static class BindingTransactionRowMapper implements RowMapper<ClaudeV1BindingTransaction> {
        @Override
        public ClaudeV1BindingTransaction mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new ClaudeV1BindingTransaction(
                    rs.getString("id"),
                    rs.getString("oauth_state"),
                    rs.getString("code_challenge"),
                    rs.getString("code_challenge_method"),
                    rs.getString("registered_client_id"),
                    rs.getString("redirect_uri"),
                    rs.getString("scope"),
                    rs.getString("resource"),
                    rs.getString("bound_connection_id"),
                    rs.getString("status"),
                    rs.getTimestamp("expires_at").toInstant(),
                    rs.getTimestamp("created_at").toInstant());
        }
    }
}
