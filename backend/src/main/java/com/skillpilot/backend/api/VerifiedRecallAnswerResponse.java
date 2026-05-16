package com.skillpilot.backend.api;

public record VerifiedRecallAnswerResponse(
        String instruction,
        String goalId,
        String cardId,
        String prompt,
        String expectedAnswer,
        String category) {
}
