package com.skillpilot.backend.api;

import java.time.Instant;

public record MasteryHistoryEntry(
        String goalId,
        Instant timestamp,
        double value,
        String source) {

    public MasteryHistoryEntry(String goalId, Instant timestamp, double value) {
        this(goalId, timestamp, value, "legacy_last_updated");
    }
}
