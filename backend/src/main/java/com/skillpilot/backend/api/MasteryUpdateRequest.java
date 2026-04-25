package com.skillpilot.backend.api;

import java.util.Map;

public record MasteryUpdateRequest(
        Map<String, Double> mastery,
        String goalId) {
}
