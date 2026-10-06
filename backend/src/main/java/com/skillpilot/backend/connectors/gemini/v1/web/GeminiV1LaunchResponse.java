package com.skillpilot.backend.connectors.gemini.v1.web;

import java.time.Instant;

/** One-time first-party launch material for a new Gemini chat. */
public record GeminiV1LaunchResponse(
        String prompt,
        String webUrl,
        String learningSessionId,
        Instant expiresAt) {
}
