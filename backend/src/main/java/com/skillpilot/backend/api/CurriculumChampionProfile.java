package com.skillpilot.backend.api;

import java.time.Instant;

public record CurriculumChampionProfile(
        String githubId,
        String skillpilotIdMasked,
        long masteredCount,
        int issuesCount,
        int pullRequestsCount,
        Instant registeredAt) {
}
