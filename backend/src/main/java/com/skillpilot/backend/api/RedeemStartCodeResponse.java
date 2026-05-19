package com.skillpilot.backend.api;

import java.time.Instant;

public record RedeemStartCodeResponse(
        String chatSessionToken,
        Instant expiresAt,
        UnifiedLearnerStateResponse state) {
}
