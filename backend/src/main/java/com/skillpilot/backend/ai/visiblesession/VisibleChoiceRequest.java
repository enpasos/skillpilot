package com.skillpilot.backend.ai.visiblesession;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record VisibleChoiceRequest(
        @NotBlank String selectionReference,
        @Positive int choiceNumber) {
}
