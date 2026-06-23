package com.skillpilot.backend.api;

import java.util.Collections;
import java.util.List;

public record VerifiedRecallPromptResponse(
        String status,
        String instruction,
        String skillpilotId,
        String goalId,
        String goalTitle,
        int totalCards,
        int verifiedCards,
        int pendingCards,
        int eligibleCards,
        int blockedCards,
        String nextEligibleAt,
        int batchSize,
        List<VerifiedRecallPromptCard> cards,
        String cardId,
        String prompt,
        String category) {

    public VerifiedRecallPromptResponse(
            String status,
            String instruction,
            String skillpilotId,
            String goalId,
            String goalTitle,
            int totalCards,
            int verifiedCards,
            int pendingCards,
            int eligibleCards,
            int blockedCards,
            String nextEligibleAt,
            String cardId,
            String prompt,
            String category) {
        this(
                status,
                instruction,
                skillpilotId,
                goalId,
                goalTitle,
                totalCards,
                verifiedCards,
                pendingCards,
                eligibleCards,
                blockedCards,
                nextEligibleAt,
                cardId == null ? 0 : 1,
                cardId == null ? Collections.emptyList() : List.of(new VerifiedRecallPromptCard(cardId, prompt, category)),
                cardId,
                prompt,
                category);
    }
}
