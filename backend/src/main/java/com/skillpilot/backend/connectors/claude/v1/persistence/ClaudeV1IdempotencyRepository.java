package com.skillpilot.backend.connectors.claude.v1.persistence;

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
 * JDBC repository for Claude v1 idempotency records.
 *
 * <p>Uniqueness of {@code (connection_id, client_request_id)} is enforced by a database
 * constraint, so two concurrent duplicates cannot both commit a mutation: the loser's insert
 * fails and its transaction rolls back.</p>
 */
@Repository
@ConditionalOnClaudeV1Enabled
public class ClaudeV1IdempotencyRepository {

    private static final String COLUMNS =
            "id, connection_id, client_request_id, request_hash, response_payload, state_version, "
                    + "created_at, expires_at";

    private final JdbcTemplate jdbcTemplate;

    public ClaudeV1IdempotencyRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = Objects.requireNonNull(jdbcTemplate, "jdbcTemplate");
    }

    public void save(ClaudeV1IdempotencyRecord record) {
        Objects.requireNonNull(record, "record");
        jdbcTemplate.update("""
                INSERT INTO claude_v1_idempotency (%s) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """.formatted(COLUMNS),
                record.id(),
                record.connectionId(),
                record.clientRequestId(),
                record.requestHash(),
                record.responsePayload(),
                record.stateVersion(),
                Timestamp.from(record.createdAt()),
                Timestamp.from(record.expiresAt()));
    }

    /** Returns a record only while it is unexpired; an expired one replays nothing. */
    public Optional<ClaudeV1IdempotencyRecord> findLive(String connectionId, String clientRequestId, Instant now) {
        if (connectionId == null || clientRequestId == null) {
            return Optional.empty();
        }
        List<ClaudeV1IdempotencyRecord> results = jdbcTemplate.query("""
                SELECT %s FROM claude_v1_idempotency
                 WHERE connection_id = ? AND client_request_id = ? AND expires_at > ?
                """.formatted(COLUMNS),
                new RecordRowMapper(),
                connectionId,
                clientRequestId,
                Timestamp.from(now));
        return results.isEmpty() ? Optional.empty() : Optional.of(results.getFirst());
    }

    public int deleteExpired(Instant now) {
        return jdbcTemplate.update(
                "DELETE FROM claude_v1_idempotency WHERE expires_at <= ?",
                Timestamp.from(now));
    }

    public int deleteForConnection(String connectionId) {
        if (connectionId == null || connectionId.isBlank()) {
            return 0;
        }
        return jdbcTemplate.update("DELETE FROM claude_v1_idempotency WHERE connection_id = ?", connectionId);
    }

    private static class RecordRowMapper implements RowMapper<ClaudeV1IdempotencyRecord> {
        @Override
        public ClaudeV1IdempotencyRecord mapRow(ResultSet rs, int rowNum) throws SQLException {
            return new ClaudeV1IdempotencyRecord(
                    rs.getString("id"),
                    rs.getString("connection_id"),
                    rs.getString("client_request_id"),
                    rs.getString("request_hash"),
                    rs.getString("response_payload"),
                    rs.getLong("state_version"),
                    rs.getTimestamp("created_at").toInstant(),
                    rs.getTimestamp("expires_at").toInstant());
        }
    }
}
