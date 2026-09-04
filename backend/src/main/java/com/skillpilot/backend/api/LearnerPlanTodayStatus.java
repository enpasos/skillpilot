package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.util.List;

/**
 * Provider-neutral, read-only status of the learner's current subject plans.
 *
 * <p>Only plans still bound to the current personal curriculum are included in
 * {@link #subjects()}. Stale or malformed plans contribute exclusively to
 * {@link #unavailablePlanCount()} and never to the visible counts.
 * {@link #resumeAvailable()} is true only when the existing authoritative
 * plan-continuation check finds a due frontier goal and no unmastered active
 * goal is already in progress.</p>
 */
public record LearnerPlanTodayStatus(
        @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate asOf,
        boolean followLearningPlans,
        boolean resumeAvailable,
        List<SubjectStatus> subjects,
        Totals totals,
        int unavailablePlanCount) {

    /** Daily counts for one valid subject plan. */
    public record SubjectStatus(
            @JsonIgnore String landscapeId,
            String subjectLabel,
            int dueToday,
            int completedToday,
            int openToday,
            int openOverdue,
            boolean current,
            boolean canContinue) {

        /** Count-only callers cannot authorize a subject transition. */
        public SubjectStatus(
                String landscapeId,
                String subjectLabel,
                int dueToday,
                int completedToday,
                int openToday,
                int openOverdue) {
            this(landscapeId, subjectLabel, dueToday, completedToday, openToday, openOverdue,
                    false, false);
        }
    }

    /** Sum of the daily counts from all entries in {@link #subjects()}. */
    public record Totals(
            int dueToday,
            int completedToday,
            int openToday,
            int openOverdue) {
    }
}
