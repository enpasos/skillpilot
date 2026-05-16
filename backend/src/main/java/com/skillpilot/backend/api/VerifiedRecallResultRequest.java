package com.skillpilot.backend.api;

public record VerifiedRecallResultRequest(
        String goalId,
        String cardId,
        Boolean passed,
        String feedback) {
}
