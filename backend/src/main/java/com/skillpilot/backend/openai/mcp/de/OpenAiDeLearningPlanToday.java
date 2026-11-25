package com.skillpilot.backend.openai.mcp.de;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.completion.CompletionRouteChoices;
import com.skillpilot.backend.service.learningplan.UnifiedLearningPlanStatusFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Reduced plan projection: the binding backend text plus non-numeric control information.
 *
 * <p>No learner, plan, revision or landscape identifiers cross this boundary. The finished
 * {@code text} remains authoritative for plan status. Unit results are separate from period
 * quotas and expose only backend-recorded assessment progress and voluntary goal titles.</p>
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record OpenAiDeLearningPlanToday(
        String asOf,
        String periodBasis,
        String text,
        String activeGoalAnnouncement,
        boolean evaluable,
        boolean followLearningPlans,
        boolean resumeAvailable,
        List<Subject> subjects,
        Guidance guidance) {

    /** An unevaluable subject carries no direction at all rather than an empty one. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Subject(
            String subject,
            boolean current,
            boolean canContinue,
            boolean evaluable,
            String statusDirection,
            @JsonInclude(JsonInclude.Include.NON_EMPTY) List<UnitAssignment> unitAssignments) {
        public Subject(String subject, boolean current, boolean canContinue, boolean evaluable,
                String statusDirection) {
            this(subject, current, canContinue, evaluable, statusDirection, List.of());
        }
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record UnitAssignment(
            String title,
            String status,
            @JsonInclude(JsonInclude.Include.NON_EMPTY) List<String> voluntaryGoalTitles) {
    }

    public record Guidance(String state, String instruction) {
    }

    public static OpenAiDeLearningPlanToday project(
            LearnerPlanTodayStatus source, boolean hasActiveGoal, boolean activeExam) {
        return project(source, hasActiveGoal, activeExam, source == null ? "de" : source.language());
    }

    public static OpenAiDeLearningPlanToday project(
            LearnerPlanTodayStatus source, boolean hasActiveGoal, boolean activeExam, String locale) {
        if (source == null) {
            return new OpenAiDeLearningPlanToday(null, null,
                    UnifiedLearningPlanStatusFormatter.formatUnavailableStatusNotice(locale),
                    null, false, false, false, List.of(), guidance("unavailable"));
        }
        boolean unavailable = false;
        List<Subject> subjects = new ArrayList<>();
        for (LearnerPlanTodayStatus.SubjectStatus subject :
                source.subjects() == null ? List.<LearnerPlanTodayStatus.SubjectStatus>of() : source.subjects()) {
            String label = subject == null ? null : safeSubjectLabel(subject.subjectLabel());
            if (label == null) {
                unavailable = true;
                continue;
            }
            subjects.add(new Subject(
                    label,
                    hasActiveGoal && subject.current(),
                    source.asOf() != null && source.followLearningPlans() && !activeExam
                            && subject.canContinue() && label.equals(subject.subjectLabel()),
                    subject.evaluable(),
                    subject.statusDirection() == null ? null : subject.statusDirection().getValue(),
                    projectUnitAssignments(subject.unitAssignments())));
        }
        boolean resume = source.asOf() != null && source.followLearningPlans()
                && source.resumeAvailable() && !hasActiveGoal;
        String state = source.coachGuidanceState(hasActiveGoal, !subjects.isEmpty(), unavailable);
        return new OpenAiDeLearningPlanToday(
                source.asOf() == null ? null : source.asOf().toString(),
                source.periodBasis() != null ? source.periodBasis().name() : "DAY",
                source.statusText(),
                hasActiveGoal && source.activeGoal() != null ? source.activeGoal().announcement() : null,
                source.evaluable(),
                source.followLearningPlans(),
                resume,
                List.copyOf(subjects),
                guidance(state));
    }

    /** The backend text is the binding formulation; this channel composes no alternative. */
    public String summary(boolean english) {
        if (text != null && !text.isBlank()) {
            return text;
        }
        return UnifiedLearningPlanStatusFormatter.formatUnavailableStatusNotice(english ? "en" : "de");
    }

    public OpenAiDeLearningPlanToday withManualGoalChoice(boolean choicesAvailable) {
        return new OpenAiDeLearningPlanToday(asOf, periodBasis, text, activeGoalAnnouncement,
                evaluable, followLearningPlans, false, subjects, choicesAvailable ? guidance("chooseGoal") : guidance);
    }

    private static List<UnitAssignment> projectUnitAssignments(
            List<LearnerPlanTodayStatus.UnitAssignmentStatus> assignments) {
        if (assignments == null || assignments.isEmpty()) {
            return List.of();
        }
        List<UnitAssignment> projected = new ArrayList<>();
        for (LearnerPlanTodayStatus.UnitAssignmentStatus assignment : assignments) {
            String title = safeSubjectLabel(assignment.title());
            if (title == null) continue;
            List<String> voluntaryTitles = assignment.voluntaryGoals().stream()
                    .map(LearnerPlanTodayStatus.VoluntaryGoal::title)
                    .map(OpenAiDeLearningPlanToday::safeSubjectLabel)
                    .filter(Objects::nonNull).distinct().limit(CompletionRouteChoices.MAX_CHOICES).toList();
            projected.add(new UnitAssignment(title, assignment.status(), voluntaryTitles));
        }
        return List.copyOf(projected);
    }

    private static Guidance guidance(String state) {
        String instruction = switch (state) {
            case "unitChoice" -> "Quote the backend's plan text for status. When the learner requests work on this "
                    + "unit assignment, offer only its parts published in current assessment choices and await a "
                    + "choice, unless the learner explicitly requested one unambiguous available assessment. "
                    + "A clear subject request may use a published subject with canContinue=true. Never start an "
                    + "assessment or substitute another goal automatically. If no part is published, explain current availability.";
            case "unitComplete" -> "The explicitly chosen unit assignment is complete. Quote its plan text for status. "
                    + "After a request to continue, offer eligible voluntary goals using the completed unit's "
                    + "voluntaryGoalTitles and their matching published learning choices; wait for the learner to choose. "
                    + "A title alone is not tool authority, and the planning preference remains unchanged. A clear "
                    + "subject request may use a published subject with canContinue=true. If no voluntary choice is "
                    + "available, offer a pause or an eligible next assignment.";
            case "continue" -> "Output 'text' verbatim when reporting plan status, at most once per "
                    + "response, and add no numbers, totals or overall judgement of your own. Then "
                    + "continue the active goal directly. A pure status-only question or pause without new evidence permits no "
                    + "unsolicited visualization, navigation, exercise or write. Resolve a requested "
                    + "subject before rendering the old goal and use only the switched successor; "
                    + "never interrupt an active exam.";
            case "resume" -> "For a normal learning start call resume_skillpilot_learning_plan using the "
                    + "current stateVersion. A clear subject request takes priority: use its exact "
                    + "published subject with canContinue=true before rendering the old goal. For "
                    + "pure status-only questions or a pause without new evidence do not render, navigate, start a goal or write "
                    + "state. When reporting plan status, output 'text' verbatim and add no numbers of "
                    + "your own.";
            case "chooseGoal" -> "On a learning request, offer the current goal options and wait for an "
                    + "explicit choice. A plain request to continue is not a goal choice. If a named subject is "
                    + "requested, use its published subject action; it can return a choice without an active goal. "
                    + "For status-only or pause requests perform no write or unsolicited navigation. "
                    + "Report the plan status by quoting 'text' verbatim.";
            case "complete" -> "Acknowledge only reached period targets named in the backend text. "
                    + "When reporting plan status, output 'text' verbatim and add no numbers, "
                    + "totals or overall judgement of your own; it already states any remaining backlog. "
                    + "Offer optional further learning or a break. Remaining backlog is not required today. "
                    + "Extra learning requires an explicit request, even when resumeAvailable=true. A request "
                    + "to continue, catch up or learn a named subject is sufficient; use the published "
                    + "resumeAvailable or canContinue capability without another confirmation. A fulfilled "
                    + "period target never revokes that capability. Learning plans prioritize work and never "
                    + "limit learning within the Personal Curriculum. Do not automatically resume, select "
                    + "future goals, widen focus or redirect to the Web app.";
            case "blocked" -> "Do not claim the period is complete or automatically resume extra work. "
                    + "When reporting plan status, output 'text' verbatim and add no numbers of your own. "
                    + "An explicit learning request may still use published resumeAvailable or canContinue "
                    + "capabilities for eligible personal targets; the plan prioritizes work and never limits "
                    + "learning. If no learning capability is available, explain the current prerequisite "
                    + "obstacle briefly. Any plan correction belongs to the teacher; do not require the "
                    + "learner to repair configuration.";
            case "paused" -> "Automatic plan guidance is off; do not enable or resume it automatically. A "
                    + "normal learning request may use the active goal or authoritative frontier. Status-only "
                    + "or pure pause requests without new evidence start no exercise and make no write. When reporting plan status, "
                    + "output 'text' verbatim.";
            default -> "Output 'text' verbatim including its "
                    + "unavailability notice, never claim the period is complete and never invent a "
                    + "substitute status. Learning plans prioritize work and never limit learning within the "
                    + "Personal Curriculum. For an explicit learning request, use published resumeAvailable "
                    + "or canContinue capabilities even if a plan is missing or outdated; the backend selects "
                    + "an eligible personal target. Any plan correction can be handled separately by the "
                    + "teacher. Do not send the learner through configuration.";
        };
        return new Guidance(state,
                "For ordinary goals and fully evaluated exams, save warranted success immediately, including "
                        + "when sufficient evidence also asks to pause. After that save, give feedback and wait "
                        + "for explicit learner continuation before applying any teaching, rendering or resume "
                        + "instruction below. Orientation and Verified Recall retain their separate closure rules. "
                        + instruction);
    }

    private static String safeSubjectLabel(String value) {
        if (value == null) {
            return null;
        }
        String cleaned = value.replaceAll("[\\p{Cc}\\p{Cf}]+", " ").replaceAll("\\s+", " ").trim();
        return cleaned.isEmpty() ? null : cleaned.substring(0, Math.min(cleaned.length(), 120));
    }

}
