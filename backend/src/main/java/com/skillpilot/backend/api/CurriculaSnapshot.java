package com.skillpilot.backend.api;

import java.time.Instant;
import java.util.List;

public record CurriculaSnapshot(
        List<CurriculumOverview> curricula,
        String defaultCurriculumId,
        Instant lastUpdatedAt) {
}
