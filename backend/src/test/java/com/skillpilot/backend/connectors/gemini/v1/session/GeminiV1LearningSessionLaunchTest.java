package com.skillpilot.backend.connectors.gemini.v1.session;

import static org.junit.jupiter.api.Assertions.*;

import com.skillpilot.backend.connectors.gemini.v1.GeminiV1TestFixtures;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1TestProperties;
import com.skillpilot.backend.connectors.gemini.v1.persistence.GeminiV1IdempotencyRecord;
import com.skillpilot.backend.connectors.gemini.v1.persistence.GeminiV1IdempotencyRepository;
import com.skillpilot.backend.connectors.gemini.v1.web.GeminiV1CoachStartRequest;
import com.skillpilot.backend.connectors.gemini.v1.web.GeminiV1CoachUiController;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        GeminiV1TestProperties.ENABLED,
        GeminiV1TestProperties.SIGNING_SECRET,
        GeminiV1TestProperties.CAPABILITY_SECRET,
        GeminiV1TestProperties.GATEWAY_SECRET,
        GeminiV1TestProperties.GATEWAY_AUDIENCE,
        GeminiV1TestProperties.BETA_DISABLED,
        GeminiV1TestProperties.CORE_DATASOURCE
})
class GeminiV1LearningSessionLaunchTest {
    @Autowired private GeminiV1LearningSessionService service;
    @Autowired private GeminiV1LearningSessionRepository sessions;
    @Autowired private GeminiV1SessionTokenCodec tokens;
    @Autowired private GeminiV1IdempotencyRepository idempotency;
    @Autowired private GeminiV1CoachUiController controller;
    @Autowired private LearnerRepository learners;
    @Autowired private JdbcOperations jdbc;

    @Test void persistedLaunchCreatesIndependentAbsoluteSessionAndNoPermanentIdLeavesTheController() {
        String learnerId = GeminiV1TestFixtures.createBoundLearner(learners, sessions, 7).learnerId();
        var first = service.createFirstPartyLaunch(learnerId, new GeminiV1CoachStartRequest("en", "web-start"));
        var response = controller.createLaunch(learnerId, new GeminiV1CoachStartRequest("de", "web-start"));
        var second = response.getBody();
        assertNotNull(second);
        assertEquals("no-store", response.getHeaders().getCacheControl());
        assertFalse(second.toString().contains(learnerId));
        assertNotEquals(first.learningSessionId(), second.learningSessionId());
        for (var launch : java.util.List.of(first, second)) {
            var persisted = sessions.findByTokenHash(tokens.hash(launch.learningSessionId())).orElseThrow();
            assertEquals(learnerId, persisted.learnerId());
            assertEquals(7, persisted.stateVersion());
            assertEquals(Duration.ofHours(24), Duration.between(persisted.startedAt(), persisted.expiresAt()));
            assertEquals(launch.expiresAt(), persisted.expiresAt());
            assertEquals(0, jdbc.queryForObject("SELECT COUNT(*) FROM claude_v1_learning_session WHERE token_hash = ?", Integer.class, persisted.tokenHash()));
        }
    }

    @Test void geminiReceiptPersistenceIsSessionBoundAndExpiredSessionCleanupCascades() {
        var bound = GeminiV1TestFixtures.createBoundLearner(learners, sessions, 9);
        String hash = tokens.hash(bound.connectionId());
        // PostgreSQL/H2 timestamp columns persist microseconds. Use that exact precision
        // for the equality boundary; rounding nanoseconds on insert can otherwise make
        // a stored expiry slightly later than the unpersisted test instant.
        Instant now = Instant.now().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
        var receipt = new GeminiV1IdempotencyRecord(hash, "session-receipt-test", "set_skillpilot_mastery",
                "a".repeat(64), "{\"stateVersion\":10}", 10, now, now.plusSeconds(60));
        idempotency.save(receipt);
        assertEquals(receipt.responsePayload(), idempotency.findLive(hash, receipt.clientRequestId(), now).orElseThrow().responsePayload());
        assertTrue(idempotency.findLive("different-session-hash", receipt.clientRequestId(), now).isEmpty());
        assertTrue(idempotency.findLive(hash, receipt.clientRequestId(), now.plusSeconds(60)).isEmpty());
        assertEquals(1, jdbc.update("UPDATE gemini_v1_learning_session SET expires_at = ? WHERE token_hash = ?", java.sql.Timestamp.from(now.minusSeconds(1)), hash));
        service.cleanupExpiredSessions();
        assertTrue(sessions.findByTokenHash(hash).isEmpty());
        assertTrue(idempotency.findLive(hash, receipt.clientRequestId(), now).isEmpty());
        assertTrue(learners.findById(bound.learnerId()).isPresent());
    }
}
