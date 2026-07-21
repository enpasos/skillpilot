package com.skillpilot.backend.ai.visiblesession;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "relayFooter", "savedCardId", "passed", "verifiedCards", "pendingCards",
        "masterySaved", "masteryGoalId", "instruction", "next"
})
public record VisibleVerifiedRecallResultResponse(
        String relayFooter,
        String savedCardId,
        boolean passed,
        int verifiedCards,
        int pendingCards,
        boolean masterySaved,
        String masteryGoalId,
        String instruction,
        VisibleVerifiedRecallState next) {
}
