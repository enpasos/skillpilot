package com.skillpilot.backend.ai.visiblesession;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record VisibleMasteryRequest(
        @NotBlank String goalId,
        @NotNull @DecimalMin("0.0") @DecimalMax("1.0") Double mastery) {
}
