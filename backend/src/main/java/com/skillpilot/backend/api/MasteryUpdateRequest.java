package com.skillpilot.backend.api;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.util.Map;

public record MasteryUpdateRequest(
        Map<String, Double> mastery,
        String goalId) {
}
