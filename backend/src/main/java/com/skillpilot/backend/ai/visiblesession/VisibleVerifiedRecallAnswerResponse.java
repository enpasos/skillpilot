package com.skillpilot.backend.ai.visiblesession;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "relayFooter", "instruction", "goalId", "cardId", "prompt", "expectedAnswer", "category" })
public record VisibleVerifiedRecallAnswerResponse(
        String relayFooter,
        String instruction,
        String goalId,
        String cardId,
        String prompt,
        String expectedAnswer,
        String category) {
}
