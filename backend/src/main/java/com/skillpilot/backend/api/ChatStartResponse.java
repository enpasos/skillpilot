package com.skillpilot.backend.api;

import java.time.Instant;

public record ChatStartResponse(
        String startCode,
        Instant expiresAt,
        String prompt) {
}
