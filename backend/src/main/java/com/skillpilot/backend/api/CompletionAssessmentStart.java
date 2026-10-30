package com.skillpilot.backend.api;

/** Cockpit intent carried through provider selection, bound only by actual session creation. */
public record CompletionAssessmentStart(String profileId, String goalId, Long expectedRevision, Boolean restartCurrent) {
    public CompletionAssessmentStart(String profileId, String goalId, Long expectedRevision) {
        this(profileId, goalId, expectedRevision, false);
    }
}
