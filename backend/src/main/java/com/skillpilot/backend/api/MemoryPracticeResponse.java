package com.skillpilot.backend.api;

import java.util.List;

public record MemoryPracticeResponse(
        String status,
        String instruction,
        String goalId,
        String goalTitle,
        MemoryPracticeProgress progress,
        List<MemoryPracticeCard> cards) {

    public MemoryPracticeResponse {
        cards = cards == null ? List.of() : List.copyOf(cards);
    }
}
