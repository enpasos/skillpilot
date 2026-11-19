package com.skillpilot.backend.api;

public record MemoryPracticeReviewRequest(
        String goalId,
        String cardId,
        String rating,
        String practiceScopeId) {
    public MemoryPracticeReviewRequest(String goalId, String cardId, String rating) {
        this(goalId, cardId, rating, null);
    }
}
