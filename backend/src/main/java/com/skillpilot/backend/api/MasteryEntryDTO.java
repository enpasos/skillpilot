package com.skillpilot.backend.api;

import java.time.Instant;

public record MasteryEntryDTO(
        double value,
        Instant updatedAt) {
}
