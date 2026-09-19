package com.skillpilot.backend.service;

import java.util.Collections;
import java.util.Map;

/** Supplies the optional curriculum-quality projection for the active curriculum source mode. */
public interface CurriculumQualitySnapshotProvider {

    CurriculumQualitySnapshot load();

    /** Cheap publication revision used only to invalidate already-derived UI projections. */
    default String revision() { return "unversioned"; }

    record CurriculumQualityEntry(
            String landscapeId,
            String subject,
            String maturity,
            long goals,
            long atomicGoals,
            int warnings,
            int failures,
            int humanTrialBlockingFindings,
            int humanTrialBlockingRuleFailures,
            boolean humanTrialFindingsAvailable) {
        public CurriculumQualityEntry(String landscapeId, String subject, String maturity, long goals,
                long atomicGoals, int warnings, int failures) {
            this(landscapeId, subject, maturity, goals, atomicGoals, warnings, failures, 0, failures, false);
        }
    }

    record CurriculumQualitySnapshot(
            Map<String, CurriculumQualityEntry> byLandscapeId,
            Map<String, CurriculumQualityEntry> canonicalSubjects) {

        public static CurriculumQualitySnapshot empty() {
            return new CurriculumQualitySnapshot(Collections.emptyMap(), Collections.emptyMap());
        }
    }
}
