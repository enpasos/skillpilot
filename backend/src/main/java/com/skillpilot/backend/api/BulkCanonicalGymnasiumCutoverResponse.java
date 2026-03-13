package com.skillpilot.backend.api;

import java.util.List;

public record BulkCanonicalGymnasiumCutoverResponse(
        boolean dryRun,
        int requestedCount,
        int migratedCount,
        int eligibleCount,
        int alreadyCanonicalCount,
        int unsupportedCount,
        int noCurriculumCount,
        int notFoundCount,
        int errorCount,
        List<BulkCanonicalGymnasiumCutoverResult> results) {
}
