package com.skillpilot.backend.ai.visiblesession;

import jakarta.validation.constraints.NotBlank;

public record VisibleExamEvaluationRequest(
        @NotBlank String goalId) {
}
