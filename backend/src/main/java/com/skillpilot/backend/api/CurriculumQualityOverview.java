package com.skillpilot.backend.api;

public record CurriculumQualityOverview(
                String subject,
                String maturity,
                long goals,
                long atomicGoals,
                int warnings,
                int failures) {
}
