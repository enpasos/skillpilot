package com.skillpilot.backend.openai.mcp.de;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import java.util.ArrayList;
import java.util.List;

/**
 * Reduced plan projection: the binding backend text plus non-numeric control information.
 *
 * <p>No learner, plan, revision or landscape identifiers cross this boundary, and no separate
 * count fields either. The model receives the finished {@code text} to quote verbatim; giving
 * it a second numeric data source would only invite a competing recalculation.</p>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record OpenAiDeLearningPlanToday(
        String asOf,
        String periodBasis,
        String text,
        String statusDirection,
        boolean evaluable,
        boolean followLearningPlans,
        boolean resumeAvailable,
        List<Subject> subjects,
        int unavailablePlanCount,
        Guidance guidance) {

    /** An unevaluable subject carries no direction at all rather than an empty one. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Subject(
            String subject,
            boolean current,
            boolean canContinue,
            boolean evaluable,
            String statusDirection) {
    }

    public record Guidance(String state, String instruction) {
    }

    public static OpenAiDeLearningPlanToday project(
            LearnerPlanTodayStatus source, boolean hasActiveGoal, boolean activeExam) {
        if (source == null) {
            return new OpenAiDeLearningPlanToday(null, "DAY", null, null, false, false, false,
                    List.of(), 0, guidance("unavailable"));
        }
        int unavailable = Math.max(0, source.unavailablePlanCount());
        List<Subject> subjects = new ArrayList<>();
        for (LearnerPlanTodayStatus.SubjectStatus subject :
                source.subjects() == null ? List.<LearnerPlanTodayStatus.SubjectStatus>of() : source.subjects()) {
            String label = subject == null ? null : safeSubjectLabel(subject.subjectLabel());
            if (label == null) {
                unavailable = saturatingAdd(unavailable, 1);
                continue;
            }
            subjects.add(new Subject(
                    label,
                    hasActiveGoal && subject.current(),
                    source.asOf() != null && source.followLearningPlans() && !activeExam
                            && subject.canContinue() && label.equals(subject.subjectLabel()),
                    subject.evaluable(),
                    subject.statusDirection() == null ? null : subject.statusDirection().getValue()));
        }
        boolean resume = source.asOf() != null && source.followLearningPlans()
                && source.resumeAvailable() && !hasActiveGoal && !subjects.isEmpty();
        String state = !source.followLearningPlans() ? "paused"
                : hasActiveGoal ? "continue"
                : source.asOf() == null || subjects.isEmpty() ? "unavailable"
                : source.periodQuotaFulfilled()
                        ? (unavailable > 0 || !source.evaluable() ? "unavailable" : "complete")
                : resume && source.automaticResumeAvailable() ? "resume"
                : "blocked";
        return new OpenAiDeLearningPlanToday(
                source.asOf() == null ? null : source.asOf().toString(),
                source.periodBasis() != null ? source.periodBasis().name() : "DAY",
                source.statusText(),
                source.statusDirection() != null ? source.statusDirection().getValue() : null,
                source.evaluable(),
                source.followLearningPlans(),
                resume,
                List.copyOf(subjects),
                unavailable,
                guidance(state));
    }

    /** The backend text is the binding formulation; this channel composes no alternative. */
    public String summary(boolean english) {
        if (text != null && !text.isBlank()) {
            return text;
        }
        return english ? "Daily plan unavailable." : "Tagesplan nicht auswertbar.";
    }

    private static Guidance guidance(String state) {
        String instruction = switch (state) {
            case "continue" -> "Output 'text' verbatim when reporting plan status, at most once per "
                    + "response, and add no numbers, totals or overall judgement of your own. Then "
                    + "continue the active goal directly. A status-only question or pause permits no "
                    + "unsolicited visualization, navigation, exercise or write. Resolve a requested "
                    + "subject before rendering the old goal and use only the switched successor; "
                    + "never interrupt an active exam.";
            case "resume" -> "For a normal learning start call resume_skillpilot_learning_plan using the "
                    + "current stateVersion. A clear subject request takes priority: use its exact "
                    + "published subject with canContinue=true before rendering the old goal. For "
                    + "status-only questions or a pause do not render, navigate, start a goal or write "
                    + "state. When reporting plan status, output 'text' verbatim and add no numbers of "
                    + "your own.";
            case "complete" -> "The period's workload is covered in every evaluated subject. Celebrate that "
                    + "progress. When reporting plan status, output 'text' verbatim and add no numbers, "
                    + "totals or overall judgement of your own; it already states any remaining backlog. "
                    + "Offer optional further learning or a break. Remaining backlog is not required today. "
                    + "Extra learning requires an explicit request, even when resumeAvailable=true. A request "
                    + "to continue, catch up or learn a named subject is sufficient; use the published "
                    + "resumeAvailable or canContinue capability without another confirmation. A fulfilled "
                    + "period target never revokes that capability. Learning plans prioritize work and never "
                    + "limit learning within the Personal Curriculum. Do not automatically resume, select "
                    + "future goals, widen focus or redirect to the Web app.";
            case "blocked" -> "Some scheduled goals remain open, but no due target can currently be started "
                    + "automatically. Do not claim the period is complete or automatically resume extra work. "
                    + "When reporting plan status, output 'text' verbatim and add no numbers of your own. "
                    + "An explicit learning request may still use published resumeAvailable or canContinue "
                    + "capabilities for eligible personal targets; the plan prioritizes work and never limits "
                    + "learning. If no learning capability is available, explain the current prerequisite "
                    + "obstacle briefly. Any plan correction belongs to the teacher; do not require the "
                    + "learner to repair configuration.";
            case "paused" -> "Automatic plan guidance is off; do not enable or resume it automatically. A "
                    + "normal learning request may use the active goal or authoritative frontier. Status-only "
                    + "or pause requests start no exercise and make no write. When reporting plan status, "
                    + "output 'text' verbatim.";
            default -> "The full workload cannot be confirmed. Output 'text' verbatim including its "
                    + "unavailability notice, never claim the period is complete and never invent a "
                    + "substitute status. Learning plans prioritize work and never limit learning within the "
                    + "Personal Curriculum. For an explicit learning request, use published resumeAvailable "
                    + "or canContinue capabilities even if a plan is missing or outdated; the backend selects "
                    + "an eligible personal target. Any plan correction can be handled separately by the "
                    + "teacher. Do not send the learner through configuration.";
        };
        return new Guidance(state, instruction);
    }

    private static String safeSubjectLabel(String value) {
        if (value == null) {
            return null;
        }
        String cleaned = value.replaceAll("[\\p{Cc}\\p{Cf}]+", " ").replaceAll("\\s+", " ").trim();
        return cleaned.isEmpty() ? null : cleaned.substring(0, Math.min(cleaned.length(), 120));
    }

    private static int saturatingAdd(int left, int right) {
        return (int) Math.min(Integer.MAX_VALUE, (long) left + right);
    }
}
