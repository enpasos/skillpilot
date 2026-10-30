package com.skillpilot.backend.api;

import java.time.Instant;
import java.util.Map;

public record ClientStateRequest(
        Instant updatedAt,
        Map<String, Object> srsState,
        Instant expectedUpdatedAt) {
    public ClientStateRequest(Instant updatedAt, Map<String, Object> srsState) {
        this(updatedAt, srsState, null);
    }
}
