package com.skillpilot.backend.api;

public record VerifiedRecallResultResponse(
        String savedCardId,
        boolean passed,
        int verifiedCards,
        int pendingCards,
        VerifiedRecallPromptResponse next) {
}
