package com.skillpilot.backend.connectors.claude.v1.session;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.sql.Timestamp;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcOperations;

class ClaudeV1LearningSessionRepositoryJdbcTest {

    @Test
    void bindsSessionInstantsAsJdbcTimestamps() {
        JdbcOperations jdbc = mock(JdbcOperations.class);
        ClaudeV1LearningSessionRepository repository = new ClaudeV1LearningSessionRepository(jdbc);
        Instant startedAt = Instant.parse("2026-08-23T15:40:56.123456Z");
        Instant expiresAt = startedAt.plusSeconds(86_400);

        repository.insert(new ClaudeV1LearningSession(
                "token-hash",
                "learner-id",
                startedAt,
                expiresAt,
                "de",
                17L));

        verify(jdbc).update(
                "INSERT INTO claude_v1_learning_session (token_hash, learner_id, started_at, "
                        + "expires_at, communication_locale, state_version) VALUES (?, ?, ?, ?, ?, ?)",
                "token-hash",
                "learner-id",
                Timestamp.from(startedAt),
                Timestamp.from(expiresAt),
                "de",
                17L);
    }

    @Test
    void bindsCleanupInstantAsJdbcTimestamp() {
        JdbcOperations jdbc = mock(JdbcOperations.class);
        ClaudeV1LearningSessionRepository repository = new ClaudeV1LearningSessionRepository(jdbc);
        Instant now = Instant.parse("2026-08-24T15:40:56.123456Z");

        repository.deleteExpired(now);

        verify(jdbc).update(
                "DELETE FROM claude_v1_learning_session WHERE expires_at <= ?",
                Timestamp.from(now));
    }
}
