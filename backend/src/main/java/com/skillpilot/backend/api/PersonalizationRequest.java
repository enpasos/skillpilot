package com.skillpilot.backend.api;

import java.util.Map;

public record PersonalizationRequest(
                Map<String, Object> config,
                java.util.List<String> goalIds) {
}
