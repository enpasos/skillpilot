package com.skillpilot.backend.api;

import java.time.Instant;

public record CurriculumChampionProfile(
        String curriculumId,
        String topicId,
        String topicTitle,
        String githubId,
        String skillpilotIdMasked,
        long masteredCount,
        long totalTopicGoals,
        int issuesCount,
        int pullRequestsCount,
        Instant registeredAt) {
}
