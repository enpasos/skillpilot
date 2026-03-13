package com.skillpilot.backend.landscape;

public record ResolvedGoalMapping(
        String sourceLandscapeId,
        String targetLandscapeId,
        String legacyGoalId,
        String canonicalGoalId,
        String matchType,
        String sourceFile) {
}
