package com.skillpilot.backend.service;

import java.util.Collections;
import java.util.Map;

/** Supplies the optional curriculum-quality projection for the active curriculum source mode. */
public interface CurriculumQualitySnapshotProvider {

    CurriculumQualitySnapshot load();

    record CurriculumQualityEntry(
            String landscapeId,
            String subject,
            String maturity,
            long goals,
            long atomicGoals,
            int warnings,
            int failures) {
    }

    record CurriculumQualitySnapshot(
            Map<String, CurriculumQualityEntry> byLandscapeId,
            Map<String, CurriculumQualityEntry> canonicalSubjects) {

        public static CurriculumQualitySnapshot empty() {
            return new CurriculumQualitySnapshot(Collections.emptyMap(), Collections.emptyMap());
        }
    }
}
