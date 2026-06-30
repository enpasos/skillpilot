package com.skillpilot.backend.api;

public record VerifiedRecallResultResponse(
        String savedCardId,
        boolean passed,
        int verifiedCards,
        int pendingCards,
        boolean masterySaved,
        String masteryGoalId,
        String instruction,
        VerifiedRecallPromptResponse next) {

    public VerifiedRecallResultResponse(
            String savedCardId,
            boolean passed,
            int verifiedCards,
            int pendingCards,
            VerifiedRecallPromptResponse next) {
        this(savedCardId, passed, verifiedCards, pendingCards, false, null, null, next);
    }
}
