package com.skillpilot.backend.api;

import java.time.Instant;

public record ClaudeConnectStartResponse(
        String installUrl,
        Instant expiresAt,
        boolean connected) {
}
