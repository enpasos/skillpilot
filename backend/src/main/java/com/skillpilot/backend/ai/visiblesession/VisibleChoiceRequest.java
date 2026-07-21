package com.skillpilot.backend.ai.visiblesession;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.util.List;

public record VisibleChoiceRequest(
        @NotBlank String selectionReference,
        @Positive Integer choiceNumber,
        List<@Positive Integer> choiceNumbers) {

    public VisibleChoiceRequest(String selectionReference, int choiceNumber) {
        this(selectionReference, choiceNumber, null);
    }
}
