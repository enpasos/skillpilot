package com.skillpilot.backend.api;

public record MemoryPracticeProgress(
        int totalCards,
        int dueCards,
        int scheduledCards) {
}
