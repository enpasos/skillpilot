package com.skillpilot.backend.connectors.gemini.v1.session;

import java.time.Instant;

/** Persisted, HMAC-addressed Gemini v1 learning session. */
public record GeminiV1LearningSession(
        String tokenHash,
        String learnerId,
        Instant startedAt,
        Instant expiresAt,
        String communicationLocale,
        long stateVersion) {
}

