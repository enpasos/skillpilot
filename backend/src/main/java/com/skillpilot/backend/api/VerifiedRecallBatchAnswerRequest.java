package com.skillpilot.backend.api;

import java.time.Instant;
import java.util.List;

/** Ordered, server-issued card batch whose expected answers are requested together. */
public record VerifiedRecallBatchAnswerRequest(
        String goalId,
        int configuredBatchSize,
        List<String> cardIds,
        Instant issuedAt) {
}
