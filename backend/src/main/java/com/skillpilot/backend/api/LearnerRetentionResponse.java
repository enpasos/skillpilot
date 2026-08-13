package com.skillpilot.backend.api;

import java.time.Instant;

public record LearnerRetentionResponse(
        Instant lastActivityAt,
        Instant scheduledDeletionAt) {
}
