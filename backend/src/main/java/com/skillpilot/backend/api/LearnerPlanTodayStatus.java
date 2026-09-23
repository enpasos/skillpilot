package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
import com.skillpilot.backend.service.learningplan.PlanBalanceResult;
import com.skillpilot.backend.service.learningplan.StatusDirection;
import java.time.LocalDate;
import java.util.List;

/**
 * The single provider-neutral learning-plan status shared by Cockpit, Chat and planning.
 *
 * <p>One calculation, one binding formulation, several output channels. The backend owns both
 * the quantitative evaluation and its wording; no channel recalculates or reinterprets it.
 * {@link #statusText()} and the per-subject {@link SubjectStatus#subjectLine()} remain the
 * authoritative formulation. The per-subject gauge values are a backend-owned projection for
 * the learner Cockpit; the raw {@link PlanBalanceResult} stays in-process for tests, diagnosis
 * and control flow only. Coach adapters continue to project the formatted text separately.</p>
 *
 * <p>Evaluability is its own state, never a flavour of "on track". A subject whose plan set
 * cannot be evaluated reliably carries no status direction and no status texts, while
 * {@link SubjectStatus#canContinue()} may still be true: the ability to keep learning is
 * independent of whether the plan status can be determined.</p>
 */
public record LearnerPlanTodayStatus(
        @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate asOf,
        PeriodBasis periodBasis,
        @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate periodStart,
        @JsonFormat(shape = JsonFormat.Shape.STRING) LocalDate periodEnd,
        String timeZone,
        String language,
        boolean evaluable,
        String statusText,
        String noticeText,
        @JsonIgnore boolean periodQuotaFulfilled,
        ActiveGoal activeGoal,
        boolean followLearningPlans,
        boolean resumeAvailable,
        List<SubjectStatus> subjects,
        int unavailablePlanCount,
        @JsonIgnore boolean automaticResumeAvailable) {

    /**
     * The active learning goal, announced independently of the plan evaluation.
     *
     * <p>Never phrased as a contradiction to a fulfilled period target.</p>
     */
    public record ActiveGoal(
            @JsonIgnore String goalId,
            String title,
            String announcement) {
    }

    /**
     * Progress-effective plan goals credited toward the current day or week. Completion may
     * come from advance work, so it does not imply all goals were finished in this period.
     * A null needle position means that this evaluable period has no target.
     */
    public record PeriodGauge(int completed, int target, Double needlePosition) {
    }

    /**
     * Cumulative balance for one subject. The signed net is advance work minus backlog,
     * excluding unfinished work within the still-open period. Scale limit is 2 × the typical
     * positive period quota. Position is normalized to [-1, 1] by the backend; -1 and 1 are
     * needle stops, while the signed number remains unbounded. The negative stop is reached
     * strictly after 2 × the typical quota, the positive stop at 2 × that quota.
     */
    public record BalanceGauge(
            int net,
            int typicalAmount,
            long scaleLimit,
            double needlePosition,
            boolean severeBehind,
            boolean strongAhead) {
    }

    /**
     * One subject, merged across every current plan of that subject.
     *
     * <p>The stable {@link #subjectKey()} identifies the subject, not the translated label.
     * Goals shared by several plans of the same subject count once, and the earliest valid
     * scheduled date wins. Both gauges are null when the subject is unevaluable. An evaluable
     * subject still has its period gauge when its quota is zero; its balance gauge is null
     * only if no positive quota exists anywhere in that subject's schedule.</p>
     */
    public record SubjectStatus(
            List<String> landscapeIds,
            String subjectKey,
            String subjectLabel,
            boolean evaluable,
            String periodText,
            String planStatusText,
            String subjectLine,
            StatusDirection statusDirection,
            boolean current,
            boolean canContinue,
            PeriodGauge periodGauge,
            BalanceGauge balanceGauge,
            @JsonIgnore PlanBalanceResult balance) {

        /**
         * The one plan landscape backing this subject, or {@code null} when several do.
         *
         * <p>An ambiguous subject fails closed: a switch must never guess which plan of a
         * subject the learner meant.</p>
         */
        @JsonIgnore
        public String landscapeId() {
            return landscapeIds != null && landscapeIds.size() == 1 ? landscapeIds.get(0) : null;
        }
    }
}
