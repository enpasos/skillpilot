package com.skillpilot.backend.api;

import java.util.List;

public record VerifiedRecallBatchAnswerResponse(
        String instruction,
        String goalId,
        List<VerifiedRecallBatchAnswerCard> cards) {
}
