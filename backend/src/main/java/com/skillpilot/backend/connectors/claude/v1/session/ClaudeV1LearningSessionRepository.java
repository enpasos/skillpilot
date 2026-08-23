package com.skillpilot.backend.connectors.claude.v1.session;

import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.stereotype.Repository;

/** JDBC persistence boundary for Claude v1 learning sessions. */
@Repository
@ConditionalOnClaudeV1Enabled
public class ClaudeV1LearningSessionRepository {

    private static final String COLUMNS =
            "token_hash, learner_id, started_at, expires_at, communication_locale, state_version";

    private final JdbcOperations jdbc;

    public ClaudeV1LearningSessionRepository(JdbcOperations jdbc) {
        this.jdbc = jdbc;
    }

    public void insert(ClaudeV1LearningSession session) {
        jdbc.update(
                "INSERT INTO claude_v1_learning_session (" + COLUMNS + ") VALUES (?, ?, ?, ?, ?, ?)",
                session.tokenHash(),
                session.learnerId(),
                session.startedAt(),
                session.expiresAt(),
                session.communicationLocale(),
                session.stateVersion());
    }

    public Optional<ClaudeV1LearningSession> findByTokenHashForUpdate(String tokenHash) {
        return jdbc.query(
                        "SELECT " + COLUMNS
                                + " FROM claude_v1_learning_session WHERE token_hash = ? FOR UPDATE",
                        this::map,
                        tokenHash)
                .stream()
                .findFirst();
    }

    public Optional<ClaudeV1LearningSession> findByTokenHash(String tokenHash) {
        return jdbc.query(
                        "SELECT " + COLUMNS
                                + " FROM claude_v1_learning_session WHERE token_hash = ?",
                        this::map,
                        tokenHash)
                .stream()
                .findFirst();
    }

    public Optional<String> findLearnerIdByTokenHash(String tokenHash) {
        return jdbc.query(
                        "SELECT learner_id FROM claude_v1_learning_session WHERE token_hash = ?",
                        (rs, rowNum) -> rs.getString(1),
                        tokenHash)
                .stream()
                .findFirst();
    }

    public void updateStateVersion(String tokenHash, long stateVersion) {
        jdbc.update(
                "UPDATE claude_v1_learning_session SET state_version = ? WHERE token_hash = ?",
                stateVersion,
                tokenHash);
    }

    public int deleteExpired(Instant now) {
        return jdbc.update("DELETE FROM claude_v1_learning_session WHERE expires_at <= ?", now);
    }

    private ClaudeV1LearningSession map(ResultSet rs, int rowNum) throws SQLException {
        return new ClaudeV1LearningSession(
                rs.getString("token_hash"),
                rs.getString("learner_id"),
                rs.getObject("started_at", java.time.OffsetDateTime.class).toInstant(),
                rs.getObject("expires_at", java.time.OffsetDateTime.class).toInstant(),
                rs.getString("communication_locale"),
                rs.getLong("state_version"));
    }
}
