package com.skillpilot.backend.api;

import java.time.Instant;

public record CurriculumChampionProfile(
        String githubId,
        String skillpilotIdMasked,
        int issuesCount,
        int pullRequestsCount,
        Instant registeredAt) {
}
