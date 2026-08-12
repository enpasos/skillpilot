package com.skillpilot.backend.api;

import java.util.List;

public record VerifiedRecallBatchResultResponse(
        List<VerifiedRecallBatchSavedResult> savedResults,
        int verifiedCards,
        int pendingCards,
        boolean masterySaved,
        String masteryGoalId,
        VerifiedRecallPromptResponse next,
        UnifiedLearnerStateResponse successor) {
}
