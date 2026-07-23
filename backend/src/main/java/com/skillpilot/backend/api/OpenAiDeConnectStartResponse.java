package com.skillpilot.backend.api;

import java.time.Instant;

public record OpenAiDeConnectStartResponse(
        String chatgptUrl,
        String prompt,
        Instant expiresAt,
        boolean connected) {
}
