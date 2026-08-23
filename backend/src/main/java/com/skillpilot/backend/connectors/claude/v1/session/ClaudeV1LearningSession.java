package com.skillpilot.backend.connectors.claude.v1.session;

import java.time.Instant;

/** Persisted, HMAC-addressed Claude v1 learning session. */
public record ClaudeV1LearningSession(
        String tokenHash,
        String learnerId,
        Instant startedAt,
        Instant expiresAt,
        String communicationLocale,
        long stateVersion) {
}

