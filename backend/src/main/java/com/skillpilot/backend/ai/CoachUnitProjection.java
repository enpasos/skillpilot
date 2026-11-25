package com.skillpilot.backend.ai;

import com.skillpilot.backend.api.ActiveGoalContext;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.completion.CompletionRouteChoices;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.service.srs.SrsCardStepFacts;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.BiFunction;

/** Publishes the same learner-facing unit and card choices to compatible coach adapters. */
public final class CoachUnitProjection {
    private final CoachToolFacade coachToolFacade;
    private final BiFunction<String, String, String> cockpitUrl;

    public CoachUnitProjection(CoachToolFacade coachToolFacade, BiFunction<String, String, String> cockpitUrl) {
        this.coachToolFacade = coachToolFacade;
        this.cockpitUrl = cockpitUrl;
    }

    public Map<String, Object> projectActiveGoalContext(String skillpilotId, long stateVersion, String language,
            LandscapeSummary curriculum, FrontierGoal activeGoal, Set<String> publishedFrontierIds,
            boolean includeActivities, boolean guidedPlan, boolean ordinaryGoal, LevelCompletionResponse completion, CompletionRouteChoices.Page page) {
        boolean exam = activeGoal != null && ("exam".equals(activeGoal.nodeKind()) || activeGoal.examData() != null);
        String activeGoalId = activeGoal == null ? null : activeGoal.id();
        ActiveGoalContext detail = coachToolFacade.getActiveGoalContext(skillpilotId, activeGoalId, stateVersion,
                language, exam ? Set.of() : publishedFrontierIds, !exam && includeActivities);
        if (detail == null || !Objects.equals(detail.goalId(), activeGoalId)) return null;

        Map<String, Object> result = new LinkedHashMap<>();
        if (detail.goalId() != null) result.put("goalId", detail.goalId());
        if (detail.phase() != null && detail.phase().matches("E|Q[1-4]")) result.put("phase", detail.phase());
        if (exam) return result;

        if (!detail.unitPaths().isEmpty()) result.put("unitPaths", detail.unitPaths());
        if (!detail.prerequisites().isEmpty()) {
            result.put("prerequisites", projectDirectPrerequisites(detail.prerequisites(), completion, stateVersion, language));
        }
        if (detail.unitIntroduction() != null) result.put("unitIntroduction", detail.unitIntroduction());
        if (includeActivities && ordinaryGoal && detail.practiceExercise() != null) {
            result.put("practiceExercise", detail.practiceExercise());
        }
        if (includeActivities && !detail.activities().isEmpty()) {
            String curriculumId = curriculum == null ? null : curriculum.getCurriculumId();
            List<CompletionRouteChoices.Choice> choices = completion != null && completion.learnerRevision() == stateVersion
                    ? page.choices() : List.of();
            List<Map<String, Object>> activities = detail.activities().stream().map(activity -> projectUnitActivity(
                    activity, choices, page.number(), curriculumId, activeGoalId, stateVersion))
                    .filter(activity -> !guidedPlan || activity.containsKey("action")).toList();
            for (var activity : activities) {
                if ("assessment".equals(activity.get("kind"))) {
                    coachToolFacade.latestExamPass(skillpilotId, (String) activity.get("goalId"))
                            .ifPresent(pass -> activity.put("latestRecordedPass", Map.of(
                                    "passedAt", pass.passedAt().toString(), "earnedPoints", pass.earnedPoints(),
                                    "maxPointsAtAssessment", pass.maxPoints(), "passingPointsAtAssessment", pass.passingPoints())));
                }
            }
            if (!activities.isEmpty()) result.put("activities", activities);
        }
        return result;
    }

    private static final String CARD_STEP_PRIORITY =
            "Status-only questions, pauses, explicit subject or goal requests, feedback or questions still owed "
                    + "for completed work and a completion route that owns navigation keep their priority. "
                    + "Never show, answer or rate card content in the chat.";
    private static final String CARD_STEP_MOMENT =
            "Card step, at most once for each offerKey in this conversation: when teaching is about to start or "
                    + "continue (a normal learning start, a resume, or the learner's request to continue after a "
                    + "completed goal), ";

    /** The card step is supplementary: a card-state failure offers no step instead of failing the context. */
    public SrsCardStepFacts cardStepFacts(String skillpilotId, String language) {
        try {
            return coachToolFacade.getCardStepFacts(skillpilotId, language);
        } catch (com.skillpilot.backend.service.srs.SrsStateUnavailableException unavailable) {
            return SrsCardStepFacts.none();
        }
    }

    /**
     * Projects the server-owned card step (issue #85): counts and published actions only, never card
     * text, plus one imperative instruction chosen by the server. Autopilot decides only who chooses:
     * with it on, the coach opens the cards directly; with it off, the cards are the first option.
     */
    public static Map<String, Object> projectCardStep(SrsCardStepFacts facts, long stateVersion) {
        SrsCardStepFacts step = facts == null ? SrsCardStepFacts.none() : facts;
        boolean practice = step.practiceGoalId() != null && step.practiceScopeId() != null;
        boolean check = step.checkGoalId() != null && step.practiceScopeId() != null;
        boolean propose = check && step.recallProposalReady();
        Map<String, Object> projected = new LinkedHashMap<>();
        projected.put("dueCards", step.dueCards());
        projected.put("boxCards", step.boxCards());
        projected.put("proposeCheck", propose);
        if (step.offerKey() != null && (practice || propose)) projected.put("offerKey", step.offerKey());
        if (practice) {
            Map<String, Object> arguments = new LinkedHashMap<>();
            arguments.put("goalId", step.practiceGoalId());
            arguments.put("practiceScopeId", step.practiceScopeId());
            arguments.put("expectedStateVersion", stateVersion);
            projected.put("practiceAction", Map.of("tool", "start_skillpilot_memory_practice",
                    "arguments", arguments));
        }
        if (check) {
            // The server derives the deck goal, the unit and the cards; the call names none of them.
            projected.put("checkAction", Map.of("tool", "start_skillpilot_verified_recall",
                    "arguments", Map.of()));
        }
        projected.put("instruction", cardStepInstruction(practice, check, propose, step.backendChooses()));
        return projected;
    }

    private static String cardStepInstruction(boolean practice, boolean check, boolean propose, boolean backendChooses) {
        String onRequest = check && !propose
                ? " If the learner explicitly asks to check this unit's flashcards, call checkAction and follow the "
                        + "Verified Recall workflow; do not propose the check yourself yet."
                : "";
        String proposal = " The learner knew every card of this unit on at least two days: also propose the unit "
                + "card check and call checkAction only after the learner agrees, then follow the Verified Recall "
                + "workflow.";
        if (practice && backendChooses) {
            return CARD_STEP_MOMENT + "call practiceAction first, before the next goal's content or image, copying "
                    + "its arguments unchanged and adding only the current learningSessionId. Say only that dueCards "
                    + "flashcards of this unit are due, then let the learner practise in the card component. When the "
                    + "learner returns, continue with the active goal or next step of the context." + (propose ? proposal : "")
                    + onRequest + " " + CARD_STEP_PRIORITY;
        }
        if (practice) {
            return CARD_STEP_MOMENT + "offer the flashcards as the first option, before the next goals: say only that "
                    + "dueCards flashcards of this unit are due. Call practiceAction, copying its arguments unchanged and "
                    + "adding only the current learningSessionId, only after the learner chooses the cards; otherwise "
                    + "follow the learner's choice. When the learner returns from the cards, continue with the active "
                    + "goal or next step of the context." + (propose ? proposal : "") + onRequest + " " + CARD_STEP_PRIORITY;
        }
        if (propose) {
            return CARD_STEP_MOMENT + "first propose the unit card check: the learner knew every card of this unit on "
                    + "at least two days and none is due. Call checkAction only after the learner agrees and follow the "
                    + "Verified Recall workflow; otherwise continue with the active goal or next step of the context. "
                    + CARD_STEP_PRIORITY;
        }
        return "No flashcards are due in the current learning context: continue without a card step." + onRequest;
    }

    private static List<Map<String, Object>> projectDirectPrerequisites(List<ActiveGoalContext.Prerequisite> prerequisites,
            LevelCompletionResponse completion, long stateVersion, String language) {
        boolean scopedWaivers = completion != null && "valid".equals(completion.calculationStatus())
                && completion.learnerRevision() == stateVersion && completion.notice() == null
                && completion.contextRef() != null && !completion.contextRef().isBlank()
                && completion.profileId() != null && !completion.profileId().isBlank()
                && completion.title() != null && completion.waivedTargetGoalIds() != null;
        String scopeTitle = scopedWaivers ? localized(language, completion.title().get("de"), completion.title().get("en")) : null;
        return prerequisites.stream().map(prerequisite -> {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("title", prerequisite.title());
            result.put("recorded", prerequisite.recorded());
            if (prerequisite.planningCredit()) result.put("planningCredit", true);
            if (!prerequisite.recorded() && !prerequisite.planningCredit()
                    && scopeTitle != null && completion.waivedTargetGoalIds().contains(prerequisite.goalId())) {
                List<LevelCompletionResponse.WaiverDetail> matches = completion.waiverDetails().stream()
                        .filter(waiver -> prerequisite.goalId().equals(waiver.goalId())).limit(2).toList();
                String reason = matches.size() == 1 ? publishedWaiverReason(matches.getFirst()) : null;
                // The evaluator publishes at most three explanations, independently of the waived IDs.
                result.put("scopeWaiver", reason == null ? Map.of("sectionTitle", scopeTitle)
                        : Map.of("reason", reason, "sectionTitle", scopeTitle));
            }
            return result;
        }).toList();
    }

    private static String publishedWaiverReason(LevelCompletionResponse.WaiverDetail waiver) {
        if (waiver.ruleId() == null || waiver.ruleId().isBlank() || waiver.assessments() == null) return null;
        if ("no_remaining_demand".equals(waiver.ruleId())) {
            return waiver.assessmentCount() == 0 && waiver.assessments().isEmpty() ? "no_remaining_demand" : null;
        }
        return !waiver.assessments().isEmpty() && waiver.assessmentCount() >= waiver.assessments().size()
                ? "assessment" : null;
    }

    private Map<String, Object> projectUnitActivity(ActiveGoalContext.Activity activity,
            List<CompletionRouteChoices.Choice> choices, int pageNumber, String curriculumId, String activeGoalId, long stateVersion) {
        Map<String, Object> option = new LinkedHashMap<>();
        option.put("goalId", activity.goalId());
        option.put("title", activity.title());
        option.put("kind", activity.kind());
        option.put("sectionTitle", activity.sectionTitle());
        List<CompletionRouteChoices.Choice> direct = "assessment".equals(activity.kind())
                ? choices.stream().filter(choice -> "startAssessment".equals(choice.action())
                                && activity.goalId().equals(choice.goalId())).limit(2).toList()
                : List.of();
        if (direct.size() == 1) {
            option.put("route", "directAssessment");
            Map<String, Object> arguments = new LinkedHashMap<>();
            arguments.put("choice", direct.getFirst().label());
            arguments.put("expectedStateVersion", stateVersion);
            if (pageNumber > 1) arguments.put("completionChoicePage", pageNumber);
            option.put("action", Map.of("tool", "choose_skillpilot_completion_route",
                    "arguments", arguments));
            return option;
        }

        String route = activity.route();
        Map<String, Object> parameters = new LinkedHashMap<>();
        parameters.put("goalId", activity.goalId());
        parameters.put("expectedStateVersion", stateVersion);
        if ("frontier".equals(route)) {
            if (activeGoalId != null) parameters.put("redirect", true);
            option.put("action", Map.of("tool", "set_skillpilot_active_goal", "arguments", parameters));
        } else if ("activeMemory".equals(route) || ("unitPractice".equals(route) && activity.practiceScopeId() != null)) {
            if (activity.practiceScopeId() != null) parameters.put("practiceScopeId", activity.practiceScopeId());
            option.put("action", Map.of("tool", "start_skillpilot_memory_practice", "arguments", parameters));
        } else {
            route = "cockpit";
            option.put("cockpitUrl", cockpitUrl.apply(curriculumId, activity.goalId()));
        }
        option.put("route", route);
        return option;
    }

    private static String localized(String language, String germanOrDefault, String english) {
        String selected = language != null && language.toLowerCase(java.util.Locale.ROOT).startsWith("en")
                ? english
                : germanOrDefault;
        if (selected == null || selected.isBlank()) {
            selected = germanOrDefault;
        }
        return selected == null || selected.isBlank() ? null : selected;
    }
}
