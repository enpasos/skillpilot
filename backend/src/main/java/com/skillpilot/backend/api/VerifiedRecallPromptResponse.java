package com.skillpilot.backend.api;

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
        String cardId,
        String prompt,
        String category) {
}
