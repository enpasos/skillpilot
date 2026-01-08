package com.skillpilot.backend.api;

import java.time.Instant;

public record MasteryHistoryEntry(
        String goalId,
        Instant timestamp,
        double value) {
}
