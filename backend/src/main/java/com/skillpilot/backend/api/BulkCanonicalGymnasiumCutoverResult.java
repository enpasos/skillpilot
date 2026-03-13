package com.skillpilot.backend.api;

public record BulkCanonicalGymnasiumCutoverResult(
        String skillpilotId,
        String status,
        String previousCurriculumId,
        String resultingCurriculumId,
        int normalizedPlannedGoalCount,
        String message) {
}
