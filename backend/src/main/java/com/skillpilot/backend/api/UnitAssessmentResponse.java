package com.skillpilot.backend.api;

import java.util.List;
import java.util.Map;

/** A reviewed unit result derived from historical exam receipts in the learner's current scope. */
public record UnitAssessmentResponse(String sectionGoalId, String revision, boolean passed, List<Part> parts,
        List<String> planningCreditGoalIds, List<String> individuallyOpenGoalIds) {
    public record Part(String goalId, Map<String, String> title, boolean passed) { }
}
