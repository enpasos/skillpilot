package com.skillpilot.backend.openai.mcp.de;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/** Allowlisted plan projection: no learner, plan, revision, or landscape identifiers. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record OpenAiDeLearningPlanToday(
        String asOf,
        boolean followLearningPlans,
        boolean resumeAvailable,
        List<Subject> subjects,
        Totals totals,
        int unavailablePlanCount,
        Guidance guidance) {

    public record Subject(String subject, boolean current, boolean canContinue,
            int dueToday, int completedToday, int openToday, int openOverdue, int extraCompletedToday) {}

    public record Totals(int dueToday, int completedToday, int openToday, int openOverdue,
            int extraCompletedToday) {}

    public record Guidance(String state, String instruction) {}

    public static OpenAiDeLearningPlanToday project(
            LearnerPlanTodayStatus source, boolean hasActiveGoal, boolean activeExam) {
        if (source == null) {
            return new OpenAiDeLearningPlanToday(null, false, false, List.of(),
                    new Totals(0, 0, 0, 0, 0), 0, guidance("unavailable"));
        }
        Map<String, Counts> bySubject = new TreeMap<>(String.CASE_INSENSITIVE_ORDER
                .thenComparing(java.util.Comparator.naturalOrder()));
        int unavailable = Math.max(0, source.unavailablePlanCount());
        for (LearnerPlanTodayStatus.SubjectStatus subject :
                source.subjects() == null ? List.<LearnerPlanTodayStatus.SubjectStatus>of() : source.subjects()) {
            String label = subject == null ? null : safeSubjectLabel(subject.subjectLabel());
            if (label == null || !validCounts(subject)) {
                unavailable = saturatingAdd(unavailable, 1);
                continue;
            }
            bySubject.merge(label, new Counts(subject.dueToday(), subject.completedToday(),
                    subject.openToday(), subject.openOverdue(), subject.extraCompletedToday(), subject.current(),
                    subject.canContinue() && label.equals(subject.subjectLabel()), 1),
                    Counts::add);
        }
        List<Subject> subjects = new ArrayList<>();
        Counts totals = new Counts(0, 0, 0, 0, 0, false, false, 0);
        for (Map.Entry<String, Counts> entry : bySubject.entrySet()) {
            Counts counts = entry.getValue();
            if (!counts.fitsIntegers() || !totals.add(counts).fitsIntegers()) {
                unavailable = saturatingAdd(unavailable, counts.planCount());
                continue;
            }
            subjects.add(new Subject(entry.getKey(), hasActiveGoal && counts.current(),
                    source.asOf() != null && source.followLearningPlans() && !activeExam
                            && counts.planCount() == 1 && counts.canContinue(),
                    (int) counts.dueToday(), (int) counts.completedToday(),
                    (int) counts.openToday(), (int) counts.openOverdue(), (int) counts.extraCompletedToday()));
            totals = totals.add(counts);
        }
        boolean resume = source.asOf() != null && source.followLearningPlans()
                && source.resumeAvailable() && !hasActiveGoal && !subjects.isEmpty();
        String state = !source.followLearningPlans() ? "paused"
                : hasActiveGoal ? "continue"
                : source.asOf() == null || subjects.isEmpty() ? "unavailable"
                : totals.openToday() == 0 ? unavailable > 0 ? "unavailable" : "complete"
                : resume && source.automaticResumeAvailable() ? "resume"
                : "blocked";
        return new OpenAiDeLearningPlanToday(source.asOf() == null ? null : source.asOf().toString(),
                source.followLearningPlans(), resume, List.copyOf(subjects),
                new Totals((int) totals.dueToday(), (int) totals.completedToday(),
                        (int) totals.openToday(), (int) totals.openOverdue(),
                        (int) totals.extraCompletedToday()), unavailable, guidance(state));
    }

    /** Today's real completions fill each subject's quota before counting voluntary extra work. */
    public String summary(boolean english) {
        if (asOf == null || subjects.isEmpty()) {
            return english ? "Daily plan unavailable." : "Tagesplan nicht auswertbar.";
        }
        String subjectsOpen = subjects.stream().map(subject -> subject.subject() + " " + subject.openToday())
                .collect(java.util.stream.Collectors.joining(" · "));
        String progress = totals.dueToday() == 0
                ? (english ? "No fixed quota today." : "Heute kein festes Pensum.")
                : (english ? "Today: " : "Heute: ") + totals.completedToday() + "/" + totals.dueToday()
                        + (english ? " done · Open: " : " geschafft · Offen: ") + subjectsOpen;
        return progress
                + (totals.extraCompletedToday() > 0 ? (english ? " · Extra: +" : " · Zusätzlich: +")
                        + totals.extraCompletedToday() : "")
                + (unavailablePlanCount > 0 ? (english ? " · Unavailable plans: " : " · Nicht auswertbare Pläne: ")
                        + unavailablePlanCount : "");
    }

    private static Guidance guidance(String state) {
        String instruction = switch (state) {
            case "continue" -> "For normal teaching continue the active goal directly. A status-only question "
                    + "or pause permits no unsolicited visualization, navigation, exercise or write. Resolve a "
                    + "requested subject before rendering the old goal and use only the switched successor; "
                    + "never interrupt an active exam.";
            case "resume" -> "For a normal learning start call resume_skillpilot_learning_plan using the current "
                    + "stateVersion. A clear subject request takes priority: use its exact published subject with "
                    + "canContinue=true before rendering the old goal. For status-only questions or a pause "
                    + "do not render, navigate, start a goal or write state.";
            case "complete" -> "Today's quota is fulfilled in every evaluated subject. Celebrate that progress. "
                    + "If openOverdue is positive, emphasize the opportunity to catch up without pressure or guilt; "
                    + "do not foreground a break. Otherwise offer optional further learning or a break. "
                    + "If dueToday=0, say there is no fixed quota "
                    + "today instead of claiming work was completed. Extra learning requires an explicit request, "
                    + "even when resumeAvailable=true. A request to continue, catch up or learn a named subject "
                    + "is sufficient; use the published resumeAvailable or canContinue capability without another "
                    + "confirmation. Zero openToday or openOverdue counts never revoke that capability. "
                    + "Learning plans prioritize work and never limit learning within the Personal Curriculum. "
                    + "Do not automatically resume, select future goals, widen "
                    + "focus or redirect to the Web app. Remaining backlog is not required today; neither the "
                    + "entire plan nor all backlog is necessarily finished.";
            case "blocked" -> "Some scheduled goals remain open, but no due target can currently be started "
                    + "automatically. Do not claim today is complete or automatically resume extra work. "
                    + "An explicit learning request may still use published resumeAvailable or canContinue "
                    + "capabilities for eligible personal targets; the plan prioritizes work and never limits learning. "
                    + "If no learning capability is available, explain the current prerequisite obstacle briefly. "
                    + "Any plan correction belongs to the teacher; do not require the learner to repair configuration.";
            case "paused" -> "Automatic plan guidance is off; do not enable or resume it automatically. A normal "
                    + "learning request may use the active goal or authoritative frontier. Status-only or pause "
                    + "requests start no exercise and make no write.";
            default -> "The full daily workload cannot be confirmed. Report only available counts with an "
                    + "unavailability warning, never claim today is complete. Learning plans prioritize work and "
                    + "never limit learning within the Personal Curriculum. For an explicit learning request, "
                    + "use published resumeAvailable or canContinue capabilities even if a plan is missing or "
                    + "outdated; the backend selects an eligible personal target. Any plan correction can be "
                    + "handled separately by the teacher. Do not send the learner through configuration.";
        };
        return new Guidance(state, instruction);
    }

    private static String safeSubjectLabel(String value) {
        if (value == null) return null;
        String cleaned = value.replaceAll("[\\p{Cc}\\p{Cf}]+", " ").replaceAll("\\s+", " ").trim();
        return cleaned.isEmpty() ? null : cleaned.substring(0, Math.min(cleaned.length(), 120));
    }

    private static boolean validCounts(LearnerPlanTodayStatus.SubjectStatus subject) {
        return subject != null && subject.dueToday() >= 0 && subject.completedToday() >= 0
                && subject.openToday() >= 0 && subject.openOverdue() >= 0
                && subject.extraCompletedToday() >= 0
                && (subject.extraCompletedToday() == 0 || subject.openToday() == 0)
                && (long) subject.completedToday() + subject.openToday() == subject.dueToday();
    }

    private static int saturatingAdd(int left, int right) {
        return (int) Math.min(Integer.MAX_VALUE, (long) left + right);
    }

    private record Counts(long dueToday, long completedToday, long openToday, long openOverdue,
            long extraCompletedToday,
            boolean current, boolean canContinue, int planCount) {
        Counts add(Counts other) {
            return new Counts(dueToday + other.dueToday, completedToday + other.completedToday,
                    openToday + other.openToday, openOverdue + other.openOverdue,
                    extraCompletedToday + other.extraCompletedToday,
                    current || other.current, canContinue || other.canContinue,
                    saturatingAdd(planCount, other.planCount));
        }
        boolean fitsIntegers() {
            return dueToday <= Integer.MAX_VALUE && completedToday <= Integer.MAX_VALUE
                    && openToday <= Integer.MAX_VALUE && openOverdue <= Integer.MAX_VALUE
                    && extraCompletedToday <= Integer.MAX_VALUE;
        }
    }
}
