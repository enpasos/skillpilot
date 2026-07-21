package com.skillpilot.backend.ai.visiblesession;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "status", "goalId", "goalTitle", "totalCards", "verifiedCards", "pendingCards",
        "eligibleCards", "blockedCards", "nextEligibleAt", "batchSize", "cards"
})
public record VisibleVerifiedRecallState(
        String status,
        String goalId,
        String goalTitle,
        int totalCards,
        int verifiedCards,
        int pendingCards,
        int eligibleCards,
        int blockedCards,
        String nextEligibleAt,
        int batchSize,
        List<VisibleVerifiedRecallPromptResponse.Card> cards) {
}
