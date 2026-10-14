package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonInclude;

/** A bounded curricular fact, never a learner configuration or a selectable goal. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PrerequisiteBlocker(
        String goalId,
        String goalTitle,
        String goalTitleEn,
        String prerequisiteId,
        String prerequisiteTitle,
        String prerequisiteTitleEn,
        String reason,
        String remediation) {

    /** Provider coaches may explain the blocker but cannot offer Level-2 editing. */
    public PrerequisiteBlocker forCoach() {
        return new PrerequisiteBlocker(goalId, goalTitle, goalTitleEn, prerequisiteId,
                prerequisiteTitle, prerequisiteTitleEn, reason, null);
    }
}
