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
        String cardId,
        String prompt,
        String category) {
}
