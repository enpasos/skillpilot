package com.skillpilot.backend.api;

import java.time.Instant;

public record OpenAiDeLaunchResponse(
        String prompt,
        String webUrl,
        String learningSessionId,
        Instant expiresAt) {
}
