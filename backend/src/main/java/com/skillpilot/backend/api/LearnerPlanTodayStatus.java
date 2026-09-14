package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDate;
import java.util.List;

/**
 * Provider-neutral, read-only status of the learner's current subject plans.
 *
 * <p>Daily counts come only from plans bound to the current personal curriculum.
 * Subjects without a usable plan can still expose explicit continuation from
 * the current personal targets, with no invented daily quota. Stale plans contribute to
 * {@link #unavailablePlanCount()} and never to the visible counts.
 * {@link #resumeAvailable()} is true only when the existing authoritative
 * continuation check finds a personal-curriculum frontier goal and no unmastered
 * active goal is already in progress. Due work takes priority, but dates and
 * quotas never deny explicit further learning. This flag is capability,
 * never automatic consent to extra work. The internal
 * {@link #automaticResumeAvailable()} separately requires reachable due work
 * and an open daily quota.</p>
 */
public record LearnerPlanTodayStatus(
        @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate asOf,
        boolean followLearningPlans,
        boolean resumeAvailable,
        List<SubjectStatus> subjects,
        Totals totals,
        int unavailablePlanCount,
        @JsonIgnore boolean automaticResumeAvailable) {

    /** Compatibility for callers that only describe the original due-work capability. */
    public LearnerPlanTodayStatus(LocalDate asOf, boolean followLearningPlans, boolean resumeAvailable,
            List<SubjectStatus> subjects, Totals totals, int unavailablePlanCount) {
        this(asOf, followLearningPlans, resumeAvailable, subjects, totals, unavailablePlanCount,
                resumeAvailable && subjects != null
                        && subjects.stream().filter(java.util.Objects::nonNull)
                                .anyMatch(subject -> subject.openToday() > 0));
    }

    /** Subject capability with valid plan counts, or zero counts without a usable schedule. */
    public record SubjectStatus(
            @JsonIgnore String landscapeId,
            String subjectLabel,
            int dueToday,
            int completedToday,
            int openToday,
            int openOverdue,
            boolean current,
            boolean canContinue,
            int extraCompletedToday) {

        public SubjectStatus(String landscapeId, String subjectLabel, int dueToday, int completedToday,
                int openToday, int openOverdue, boolean current, boolean canContinue) {
            this(landscapeId, subjectLabel, dueToday, completedToday, openToday, openOverdue,
                    current, canContinue, 0);
        }

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
            int openOverdue,
            int extraCompletedToday) {
        public Totals(int dueToday, int completedToday, int openToday, int openOverdue) {
            this(dueToday, completedToday, openToday, openOverdue, 0);
        }
    }
}
