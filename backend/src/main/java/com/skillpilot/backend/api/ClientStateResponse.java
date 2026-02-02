package com.skillpilot.backend.api;

import java.time.Instant;

public record ClientStateResponse(
        String status,
        Instant savedAt,
        int storedKeys) {
}
