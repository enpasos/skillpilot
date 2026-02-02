package com.skillpilot.backend.api;

import java.time.Instant;
import java.util.Map;

public record ClientStateSnapshot(
        Instant updatedAt,
        Map<String, Object> srsState) {
}
