package com.skillpilot.backend.ai.visiblesession;

import jakarta.validation.constraints.NotBlank;

public record VisibleActiveGoalRequest(
        @NotBlank String goalId,
        Boolean redirect) {
}
