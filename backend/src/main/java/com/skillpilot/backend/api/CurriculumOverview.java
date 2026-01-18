package com.skillpilot.backend.api;

import java.util.List;

public record CurriculumOverview(
                String curriculumId,
                String title,
                String description,
                String subject,
                String country,
                String region,
                long totalAtomicGoals,
                long totalMastered,
                List<String> topLevelTopics,
                List<CurriculumChampionProfile> champions) {
}
