package com.skillpilot.backend.api;

public record MemoryPracticeReviewRequest(
        String goalId,
        String cardId,
        String rating) {
}
