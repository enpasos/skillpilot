package com.skillpilot.backend.api;

import java.time.Instant;
import java.util.Map;

public record TrackingEventRequest(
        String event,
        Instant occurredAt,
        String path,
        String skillpilotId,
        Map<String, Object> context) {
}
