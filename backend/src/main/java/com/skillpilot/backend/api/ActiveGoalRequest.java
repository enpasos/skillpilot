package com.skillpilot.backend.api;

import jakarta.validation.constraints.NotBlank;

public record ActiveGoalRequest(
        @NotBlank String goalId) {
}
