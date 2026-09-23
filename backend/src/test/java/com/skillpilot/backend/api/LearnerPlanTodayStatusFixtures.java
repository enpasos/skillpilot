package com.skillpilot.backend.api;

import com.skillpilot.backend.service.learningplan.PeriodBasis;
import com.skillpilot.backend.service.learningplan.PlanBalanceInputs;
import com.skillpilot.backend.service.learningplan.PlanBalanceResult;
import com.skillpilot.backend.service.learningplan.UnifiedLearningPlanStatusCalculator;
import com.skillpilot.backend.service.learningplan.UnifiedLearningPlanStatusFormatter;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Builds unified plan-status fixtures the way production builds them: from S, P, I and H
 * through the real calculator and the real formatter.
 *
 * <p>Tests therefore state a learning situation rather than a pre-cooked status text, and
 * cannot assert a wording the production code would never produce.</p>
 */
public final class LearnerPlanTodayStatusFixtures {

    public static final LocalDate DEFAULT_AS_OF = LocalDate.parse("2026-09-04");

    private LearnerPlanTodayStatusFixtures() {
    }

    /**
     * An evaluable subject.
     *
     * @param s plan goals scheduled through the end of the period
     * @param p plan goals newly due within the period
     * @param i currently mastered plan goals, regardless of their date
     * @param h distinct goals completed within the period and still mastered
     */
    public static LearnerPlanTodayStatus.SubjectStatus subject(
            String landscapeId, String label, int s, int p, int i, int h,
            boolean current, boolean canContinue) {
        return subject(landscapeId, label, s, p, i, h, current, canContinue, PeriodBasis.DAY, "de");
    }

    public static LearnerPlanTodayStatus.SubjectStatus subject(
            String landscapeId, String label, int s, int p, int i, int h,
            boolean current, boolean canContinue, PeriodBasis basis, String locale) {
        PlanBalanceResult balance = UnifiedLearningPlanStatusCalculator.calculate(
                new PlanBalanceInputs(s, p, i, h));
        // These text-contract fixtures have no due-date schedule. Use a representative
        // one-goal period solely to provide a coherent wire example for the Cockpit fields.
        int net = balance.vorsprung() - balance.rueckstand();
        double balanceNeedle = Math.max(-1.0, Math.min(1.0, net / (net < 0 ? 3.0 : 2.0)));
        return new LearnerPlanTodayStatus.SubjectStatus(
                List.of(landscapeId),
                subjectKey(label),
                label,
                true,
                UnifiedLearningPlanStatusFormatter.formatPeriodText(basis, balance, locale),
                UnifiedLearningPlanStatusFormatter.formatPlanStatusText(balance, locale),
                UnifiedLearningPlanStatusFormatter.formatSubjectLine(label, basis, balance, locale),
                balance.statusDirection(),
                current,
                canContinue,
                new LearnerPlanTodayStatus.PeriodGauge(
                        balance.erfuelltesPeriodenziel(), p,
                        p == 0 ? null : (double) balance.erfuelltesPeriodenziel() / p),
                new LearnerPlanTodayStatus.BalanceGauge(
                        net, 1, 2, balanceNeedle, net < -2, net >= 2),
                balance);
    }

    /** A subject whose plan status cannot be determined; continuation stays a separate question. */
    public static LearnerPlanTodayStatus.SubjectStatus unevaluableSubject(
            String landscapeId, String label, boolean current, boolean canContinue) {
        return new LearnerPlanTodayStatus.SubjectStatus(
                List.of(landscapeId), subjectKey(label), label, false,
                null, null, null, null, current, canContinue, null, null, null);
    }

    /** A subject backed by more than one plan, which therefore cannot be switched to. */
    public static LearnerPlanTodayStatus.SubjectStatus ambiguousSubject(
            List<String> landscapeIds, String label, int s, int p, int i, int h, boolean current) {
        LearnerPlanTodayStatus.SubjectStatus single = subject(
                landscapeIds.get(0), label, s, p, i, h, current, false);
        return new LearnerPlanTodayStatus.SubjectStatus(
                List.copyOf(landscapeIds), single.subjectKey(), label, true,
                single.periodText(), single.planStatusText(), single.subjectLine(),
                single.statusDirection(), current, false,
                single.periodGauge(), single.balanceGauge(), single.balance());
    }

    public static LearnerPlanTodayStatus.ActiveGoal activeGoal(String goalId, String title) {
        return new LearnerPlanTodayStatus.ActiveGoal(
                goalId,
                title,
                UnifiedLearningPlanStatusFormatter.formatActiveGoalAnnouncement(title, "de"));
    }

    public static LearnerPlanTodayStatus status(
            LocalDate asOf, boolean followLearningPlans, boolean resumeAvailable,
            LearnerPlanTodayStatus.SubjectStatus... subjects) {
        return status(asOf, followLearningPlans, resumeAvailable, 0, null, List.of(subjects));
    }

    public static LearnerPlanTodayStatus status(
            LocalDate asOf, boolean followLearningPlans, boolean resumeAvailable,
            int unavailablePlanCount, LearnerPlanTodayStatus.ActiveGoal activeGoal,
            List<LearnerPlanTodayStatus.SubjectStatus> subjects) {
        return status(asOf, PeriodBasis.DAY, "de", followLearningPlans, resumeAvailable,
                resumeAvailable, unavailablePlanCount, activeGoal, subjects);
    }

    public static LearnerPlanTodayStatus status(
            LocalDate asOf,
            PeriodBasis basis,
            String locale,
            boolean followLearningPlans,
            boolean resumeAvailable,
            boolean automaticResumeAvailable,
            int unavailablePlanCount,
            LearnerPlanTodayStatus.ActiveGoal activeGoal,
            List<LearnerPlanTodayStatus.SubjectStatus> subjects) {
        List<String> subjectLines = new ArrayList<>();
        List<String> unavailableLabels = new ArrayList<>();
        for (LearnerPlanTodayStatus.SubjectStatus subject : subjects) {
            if (subject.evaluable()) {
                subjectLines.add(subject.subjectLine());
            } else if (!unavailableLabels.contains(subject.subjectLabel())) {
                unavailableLabels.add(subject.subjectLabel());
            }
        }
        List<LearnerPlanTodayStatus.SubjectStatus> evaluated = subjects.stream()
                .filter(LearnerPlanTodayStatus.SubjectStatus::evaluable)
                .toList();
        String notice = UnifiedLearningPlanStatusFormatter.formatUnavailableNotice(unavailableLabels, locale);
        String text = UnifiedLearningPlanStatusFormatter.formatCombinedStatusText(subjectLines, unavailableLabels, locale);
        if (unavailablePlanCount > 0 && unavailableLabels.isEmpty()) {
            notice = UnifiedLearningPlanStatusFormatter.formatUnavailableStatusNotice(locale);
            text = subjectLines.isEmpty() ? notice : text + "\n" + notice;
        }
        return new LearnerPlanTodayStatus(
                asOf,
                basis,
                periodStart(asOf, basis),
                periodEnd(asOf, basis),
                "Europe/Berlin",
                locale,
                unavailablePlanCount == 0 && !subjects.isEmpty()
                        && subjects.stream().allMatch(LearnerPlanTodayStatus.SubjectStatus::evaluable),
                text,
                notice,
                evaluated.stream().allMatch(s -> s.balance().offenesPeriodenpensum() == 0),
                activeGoal,
                followLearningPlans,
                resumeAvailable,
                List.copyOf(subjects),
                unavailablePlanCount,
                automaticResumeAvailable);
    }

    private static String subjectKey(String label) {
        return label == null ? null : label.trim().toLowerCase(Locale.ROOT);
    }

    private static LocalDate periodStart(LocalDate asOf, PeriodBasis basis) {
        if (asOf == null) {
            return null;
        }
        return basis == PeriodBasis.WEEK
                ? asOf.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                : asOf;
    }

    private static LocalDate periodEnd(LocalDate asOf, PeriodBasis basis) {
        if (asOf == null) {
            return null;
        }
        return basis == PeriodBasis.WEEK
                ? asOf.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY))
                : asOf;
    }
}
