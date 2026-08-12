package com.skillpilot.backend.api;

public record VerifiedRecallBatchAnswerCard(
        String cardId,
        String prompt,
        String expectedAnswer,
        String category) {
}
