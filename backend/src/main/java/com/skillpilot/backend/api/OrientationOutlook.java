package com.skillpilot.backend.api;

import java.util.List;

/**
 * Reviewed, learner-scope-specific map of the material downstream from an
 * orientation goal.
 *
 * <p>The prose and path grouping are authored curriculum metadata. Goal
 * references are resolved and filtered against the current target projection
 * before this record is created. Provider adapters may expose the learner-facing
 * fields, but {@code relatedGoalIds} is an internal transition allowlist.</p>
 */
public record OrientationOutlook(
        String orientationGoalId,
        List<Path> paths) {

    public record Path(
            String pathId,
            String title,
            String learningOutlook,
            List<String> practicalContexts,
            List<GoalReference> representativeGoals,
            List<String> relatedGoalIds) {
    }

    public record GoalReference(
            String goalId,
            String title) {
    }
}
