package com.skillpilot.backend.api;

public record CurriculumQualityOverview(
                String landscapeId,
                String subject,
                String maturity,
                long goals,
                long atomicGoals,
                int warnings,
                int failures,
                String qualityStatus,
                HumanTrialSummary humanTrial) {
}
