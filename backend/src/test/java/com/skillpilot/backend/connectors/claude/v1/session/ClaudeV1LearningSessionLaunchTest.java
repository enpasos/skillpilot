package com.skillpilot.backend.connectors.claude.v1.session;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1CapabilityService;
import com.skillpilot.backend.connectors.claude.v1.web.ClaudeV1CoachStartRequest;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Duration;
import java.time.Instant;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.server.ResponseStatusException;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.CORE_DATASOURCE
})
class ClaudeV1LearningSessionLaunchTest {

    @Autowired private ClaudeV1LearningSessionService service;
    @Autowired private ClaudeV1LearningSessionRepository sessions;
    @Autowired private ClaudeV1SessionTokenCodec tokens;
    @Autowired private ClaudeV1CapabilityService capabilities;
    @Autowired private LearnerRepository learners;
    @Autowired private JdbcOperations jdbc;

    @Test
    void firstPartyLaunchCreatesHmacOnlyExactly24HourSessionAndSafePrompt() {
        String learnerId = ClaudeV1TestFixtures.createBoundLearner(learners, sessions, 7L).learnerId();
        Instant before = Instant.now();

        var launch = service.createFirstPartyLaunch(
                learnerId,
                new ClaudeV1CoachStartRequest("de", "web-start"));

        assertEquals("https://claude.ai/new", launch.webUrl());
        assertTrue(ClaudeV1SessionTokenCodec.TOKEN_PATTERN.matcher(launch.learningSessionId()).matches());
        assertEquals(1, launch.prompt().split(java.util.regex.Pattern.quote(launch.learningSessionId()), -1).length - 1);
        assertFalse(launch.webUrl().contains(launch.learningSessionId()));
        ClaudeV1LearningSession persisted = sessions
                .findByTokenHash(tokens.hash(launch.learningSessionId()))
                .orElseThrow();
        assertNotEquals(launch.learningSessionId(), persisted.tokenHash());
        assertEquals(learnerId, persisted.learnerId());
        assertEquals(Duration.ofHours(24), Duration.between(persisted.startedAt(), persisted.expiresAt()));
        assertTrue(!persisted.startedAt().isBefore(before));
        assertEquals(launch.expiresAt(), persisted.expiresAt());
    }

    @Test
    void launchRejectsAnyClientOrLocaleOutsideTheFirstPartyContract() {
        String learnerId = ClaudeV1TestFixtures.createBoundLearner(learners, sessions, 1L).learnerId();
        assertThrows(ResponseStatusException.class, () -> service.createFirstPartyLaunch(
                learnerId, new ClaudeV1CoachStartRequest("de", "claude-plugin")));
        assertThrows(ResponseStatusException.class, () -> service.createFirstPartyLaunch(
                learnerId, new ClaudeV1CoachStartRequest("fr", "web-start")));
    }

    @Test
    void capabilityExpiryNeverOutlivesItsLearningSession() {
        String learnerId = ClaudeV1TestFixtures.createBoundLearner(learners, sessions, 3L).learnerId();
        var launch = service.createFirstPartyLaunch(
                learnerId,
                new ClaudeV1CoachStartRequest("en", "web-start"));
        String tokenHash = tokens.hash(launch.learningSessionId());
        Instant sessionExpiry = Instant.now()
                .plusSeconds(30)
                .truncatedTo(java.time.temporal.ChronoUnit.MILLIS);
        assertEquals(1, jdbc.update(
                "UPDATE claude_v1_learning_session SET expires_at = ? WHERE token_hash = ?",
                sessionExpiry,
                tokenHash));

        String capability = capabilities.mintExamEvaluationCapability(
                launch.learningSessionId(),
                "goal_exam",
                3L);
        var claim = capabilities.verifyExamEvaluationCapability(
                capability,
                launch.learningSessionId(),
                "goal_exam",
                3L);

        assertTrue(!claim.expiresAt().isAfter(sessionExpiry));
    }

    @Test
    void expiredSessionCleanupIsScheduledWithAClaudeOwnedDefault() throws Exception {
        Scheduled scheduled = ClaudeV1LearningSessionService.class
                .getMethod("cleanupExpiredSessions")
                .getAnnotation(Scheduled.class);

        assertNotNull(scheduled);
        assertEquals(
                "${skillpilot.claude.connector.v1.learning-session-cleanup-interval-ms:3600000}",
                scheduled.fixedDelayString());
    }
}
