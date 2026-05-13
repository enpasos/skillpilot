package com.skillpilot.backend.api;

import java.util.List;

public record CurriculumOverview(
                String curriculumId,
                String title,
                String titleEn,
                String description,
                String descriptionEn,
                String subject,
                String country,
                String region,
                long totalAtomicGoals,
                long totalMastered,
                String qualityMaturity,
                long qualityGoals,
                long qualityAtomicGoals,
                int qualityWarnings,
                int qualityFailures,
                List<CurriculumQualityOverview> subjectQuality,
                List<String> topLevelTopics,
                List<String> topLevelTopicsEn,
                List<CurriculumChampionProfile> champions) {
}
