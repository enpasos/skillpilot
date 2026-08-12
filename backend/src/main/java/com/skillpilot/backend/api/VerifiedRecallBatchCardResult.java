package com.skillpilot.backend.api;

public record VerifiedRecallBatchCardResult(
        String cardId,
        Boolean passed,
        String feedback) {
}
