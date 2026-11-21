package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.api.UnitAssessmentResponse;
import com.skillpilot.backend.completion.CompletionCallContext;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Projects authorized choices; it never calculates mastery, waivers or prerequisite access. */
final class ClaudeV1CompletionChoices {
    static final int MAX_CHOICES = 24;
    private ClaudeV1CompletionChoices() { }

    record Choice(String label, String action, String profileId, String goalId, String intent) {
        LevelCompletionActionRequest request(long revision) {
            return new LevelCompletionActionRequest(action, profileId, goalId, intent, revision);
        }
    }

    static boolean supported() {
        CompletionCallContext call = CompletionCallContext.current();
        return call != null && call.supported() && "claude".equals(call.provider());
    }

    static boolean active(LevelCompletionResponse completion) {
        return completion != null && completion.profileId() != null
                && (!completion.profileId().startsWith("automatic:")
                    || completion.navigationIntent() != null || completion.directAssessmentRunning());
    }

    static List<Choice> published(LevelCompletionResponse completion, String language) {
        if (completion == null || !supported()
                || "completion_assessment_owned_elsewhere".equals(completion.notice())) return List.of();
        boolean en = "en".equals(language);
        List<Choice> candidates = new ArrayList<>();
        boolean automaticOverview = !active(completion) && completion.profileId() != null
                && completion.profileId().startsWith("automatic:");
        if (!active(completion) && ("unresolved".equals(completion.calculationStatus())
                    || automaticOverview && "valid".equals(completion.calculationStatus()))
                && completion.notice() == null && completion.profileOptions() != null) {
            for (var option : completion.profileOptions()) {
                for (var assessment : automaticOverview ? List.<LevelCompletionResponse.Assessment>of() : option.assessments()) {
                    if (!assessment.mastered() && assessment.startAvailable()) {
                        candidates.add(new Choice(assessmentChoice(assessment, language), "startAssessment", option.profileId(),
                                assessment.goalId(), null));
                    }
                }
                if (automaticOverview && option.profileId().equals(completion.profileId())) continue;
                candidates.add(new Choice((en ? "Choose section: " : "Abschnitt wählen: ")
                        + label(option.title(), language), "selectProfile", option.profileId(), null, null));
            }
        }
        if ("valid".equals(completion.calculationStatus()) && completion.assessments() != null
                && !completion.directAssessmentRunning()) {
            for (var assessment : completion.assessments()) {
                if (!assessment.mastered() && assessment.startAvailable()) {
                    candidates.add(new Choice(assessmentChoice(assessment, language), "startAssessment", completion.profileId(),
                            assessment.goalId(), null));
                }
            }
        }
        if (completion.actions() != null) {
            for (var action : completion.actions()) {
                String prefix;
                if ("learnGoal".equals(action.action())) {
                    if (action.goalId() == null || action.intent() == null
                            || !Set.of("required", "support", "voluntary").contains(action.intent())) continue;
                    prefix = switch (action.intent()) {
                        case "support" -> en ? "Get support: " : "Unterstützung: ";
                        case "voluntary" -> en ? "Study voluntarily: " : "Freiwillig vertiefen: ";
                        default -> en ? "Continue learning: " : "Weiterlernen: ";
                    };
                } else if ("leaveProfile".equals(action.action()) || "endAssessment".equals(action.action())
                        || "pauseProfile".equals(action.action())
                        || "retryAssessment".equals(action.action()) || "includeTarget".equals(action.action())
                        || "includeSupport".equals(action.action()) || "focusPractice".equals(action.action())) {
                    prefix = "";
                } else continue;
                candidates.add(new Choice(prefix + label(action.title(), language), action.action(),
                        completion.profileId(), action.goalId(), action.intent()));
            }
        }
        // An ambiguous label is never executable. Do not silently choose a goal by order.
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (Choice choice : candidates) counts.merge(choice.label(), 1, Integer::sum);
        List<Choice> unambiguous = candidates.stream().filter(choice -> counts.get(choice.label()) == 1)
                .filter(choice -> !choice.label().isBlank() && choice.label().length() <= 512)
                .toList();
        java.util.LinkedHashSet<Choice> ordered = new java.util.LinkedHashSet<>();
        // A long list of reachable goals or exams must never displace a neutral exit.
        unambiguous.stream().filter(choice -> Set.of("leaveProfile", "endAssessment", "pauseProfile", "retryAssessment")
                .contains(choice.action())).forEach(ordered::add);
        unambiguous.stream().filter(choice -> "voluntary".equals(choice.intent())).findFirst().ifPresent(ordered::add);
        if (completion.profileId() == null || !completion.profileId().startsWith("automatic:")) {
            ordered.addAll(unambiguous);
            return ordered.stream().limit(MAX_CHOICES).toList();
        }
        // Keep exits and useful work reachable even when hundreds of exams exist.
        // Sections consume at most six slots; they cannot crowd out direct starts.
        unambiguous.stream().filter(choice -> !"startAssessment".equals(choice.action())
                && !"selectProfile".equals(choice.action())).limit(8).forEach(ordered::add);
        unambiguous.stream().filter(choice -> "selectProfile".equals(choice.action()))
                .limit(6).forEach(ordered::add);
        unambiguous.stream().filter(choice -> "startAssessment".equals(choice.action())).forEach(ordered::add);
        return ordered.stream().limit(MAX_CHOICES).toList();
    }

    static Map<String, Object> project(LevelCompletionResponse completion, String language) {
        if (completion == null) return null;
        boolean en = "en".equals(language);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("calculationStatus", completion.calculationStatus());
        result.put("title", label(completion.title(), language));
        result.put("directAssessmentRunning", completion.directAssessmentRunning());
        if (completion.unitAssessment() != null) {
            var unit = completion.unitAssessment();
            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("passed", unit.passed());
            summary.put("partCount", unit.parts().size());
            summary.put("passedPartCount", unit.parts().stream().filter(UnitAssessmentResponse.Part::passed).count());
            summary.put("parts", unit.parts().stream().limit(MAX_CHOICES).map(part -> {
                Map<String, Object> projected = new LinkedHashMap<>();
                projected.put("title", label(part.title(), language));
                projected.put("passed", part.passed());
                projected.put("materialCurrent", part.materialCurrent());
                if (part.missingPlanningCreditBinding()) projected.put("planningCreditNotice", en
                        ? "This pass counts towards the unit. When you passed, the assessment record did not include the current approval for planning credit. The related individual goals stay open unless you have demonstrated them separately."
                        : "Dieser Beleg zählt für die Einheit. Dein Prüfungsbeleg enthält keine Freigabe für die aktuelle Planungsanrechnung. Die zugehörigen Fachziele bleiben offen, bis du sie selbst nachweist.");
                if (!part.materialCurrent()) projected.put("notice", en
                        ? "The current task has a different assessment version. This unit part is unavailable; saved historical passes remain retained."
                        : "Die aktuelle Aufgabe hat eine andere Prüfungsfassung. Dieser Einheitsteil ist derzeit nicht verfügbar; frühere Prüfungsbelege bleiben erhalten.");
                return projected;
            }).toList());
            summary.put("creditedForPlanningCount", unit.planningCreditGoalIds().size());
            summary.put("individuallyOpenCount", unit.individuallyOpenGoalIds().size());
            result.put("unitAssessment", summary);
        }
        if (!active(completion) && completion.profileOptions() != null && !completion.profileOptions().isEmpty()) {
            result.put("sections", completion.profileOptions().stream().limit(MAX_CHOICES).map(option -> {
                Map<String, Object> section = new LinkedHashMap<>();
                section.put("title", label(option.title(), language));
                if (option.targetCount() != null) section.put("targetCount", option.targetCount());
                if (option.requiredAssessmentCount() != null) section.put("requiredAssessmentCount", option.requiredAssessmentCount());
                if (!option.assessments().isEmpty()) {
                    section.put("assessments", option.assessments().stream().limit(MAX_CHOICES).map(assessment ->
                            projectedAssessment(assessment, language)).toList());
                }
                return section;
            }).toList());
        }
        if ("valid".equals(completion.calculationStatus()) && completion.complete() != null) {
            result.put("complete", completion.complete());
            int credited = completion.planningCreditGoalIds().size();
            String wording = en
                    ? "Direct evidence on learning goals (%d/%d), required assessments passed (%d/%d), "
                            + "goals credited for planning (%d), preparation waived (%d), "
                            + "remaining obligations (%d).%s"
                    : "Eigene Nachweise an Lernzielen (%d/%d), bestandene Pflichtprüfungen (%d/%d), "
                            + "fachlich angerechnete Ziele (%d), entfallene Vorbereitung (%d), "
                            + "offene Zielpflichten (%d).%s";
            result.put("text", wording.formatted(completion.masteredTargetCount(), completion.targetCount(),
                    completion.masteredAssessmentCount(), completion.requiredAssessmentCount(), credited,
                    completion.waivedTargetCount() - credited, completion.pendingTargetCount(),
                    completion.complete() ? (en ? " Learning section completed." : " Lernabschnitt abgeschlossen.") : ""));
        }
        if ("paused".equals(completion.navigationIntent())) {
            result.put("paused", true);
        }
        if ("valid".equals(completion.calculationStatus()) && !completion.waiverDetails().isEmpty()) {
            // Retain the compatibility key; implicit completion need not have any assessment witness.
            result.put("waivedPreparation", completion.waiverDetails().stream().map(detail -> Map.of(
                    "goal", label(detail.title(), language),
                    "passedAssessments", detail.assessments().stream().map(assessment -> label(assessment.title(), language)).toList(),
                    "supportingAssessmentCount", detail.assessmentCount(),
                    "scope", detail.ruleId() != null && detail.ruleId().startsWith("versioned_unit_assessment:")
                            ? en ? "A version-bound unit assessment establishes this full prerequisite for further planning; its individual result stays unchanged."
                                    : "Ein fassungsgebundener Einheitenbeleg weist diese ganze Voraussetzung für die weitere Planung nach; der individuelle Lernstand bleibt unverändert."
                            : en ? "Preparation for this learning section is optional. The goal remains available for individual learning."
                                    : "Die Vorbereitung für diesen Lernabschnitt ist freiwillig. Du kannst das Lernziel weiterhin einzeln erarbeiten.")).toList());
        }
        if (active(completion) && !supported()) {
            result.put("notice", en
                    ? "This coach session does not support the selected completion route. Pause teaching and open the Cockpit to start a supported coach session or deliberately return to regular learning."
                    : "Diese Coach-Sitzung unterstützt den gewählten Abschlussweg nicht. Pausiere den Unterricht und öffne das Cockpit, um eine unterstützte Coach-Sitzung zu starten oder bewusst zum regulären Lernweg zurückzukehren.");
        } else if ("completion_assessment_owned_elsewhere".equals(completion.notice())) {
            result.put("notice", en
                    ? "This assessment belongs to another coach session. Pause here; continue in that session or deliberately end it in the Cockpit."
                    : "Diese Prüfung gehört zu einer anderen Coach-Sitzung. Pausiere hier; setze sie dort fort oder beende sie bewusst im Cockpit.");
        } else if (completion.notice() != null) {
            result.put("notice", en
                    ? "This completion route cannot currently be used reliably. Follow only the published choices; existing mastery is retained."
                    : "Dieser Abschlussweg kann gerade nicht zuverlässig genutzt werden. Folge ausschließlich den angebotenen Möglichkeiten; vorhandene Mastery bleibt erhalten.");
        }
        var choices = published(completion, language);
        result.put("choices", choices.stream().map(Choice::label).toList());
        if (!choices.isEmpty() && completion.actions() != null) {
            var practice = new ArrayList<Map<String, Object>>();
            for (var action : completion.actions()) {
                if (action.practice() == null) continue;
                choices.stream().filter(choice -> choice.action().equals(action.action())
                        && action.goalId().equals(choice.goalId())).findFirst().ifPresent(choice ->
                        practice.add(Map.of("choice", choice.label(), "openPrerequisiteCount", action.practice().openPrerequisites().size(),
                                "openPrerequisites", action.practice().openPrerequisites().stream().limit(MAX_CHOICES)
                                        .map(goal -> label(goal.title(), language)).toList())));
            }
            if (!practice.isEmpty()) result.put("individualPractice", practice);
        }
        result.put("instruction", "Use this backend completion statement without recalculating or turning implicit completion into mastery. "
                + "A mastered goal no longer demands its own prerequisites. The backend marks non-assessment goals with no remaining demand as implicitly completed. "
                + "A passed assessment is not required for implicit completion, and it does not certify prerequisite competence. "
                + (completion.unitAssessment() != null || !completion.planningCreditGoalIds().isEmpty()
                    ? "Use only the named planning credits from the current assessment evidence. Each individual goal still needs its own mastery evidence. " : "")
                + "Do not restore implicitly completed work as mandatory. "
                + (result.containsKey("individualPractice")
                    ? "On a request to study a credited goal individually, use its published individualPractice choice. "
                        + "Offer help with its open prerequisites. When strict mode names a prerequisite as the first step, teach that returned active goal. " : "")
                + "Available direct assessment choices can be selected from ordinary learning without choosing a section first. "
                + "Offer them when the learner asks for a shortcut, an assessment or to demonstrate existing knowledge; do not interrupt ordinary teaching unprompted. "
                + "For an explicit learner choice, copy exactly one current choices entry into choose_skillpilot_completion_route. "
                + "An explicit learner request to start exactly one currently published assessment already supplies selection consent; invoke that choice without asking again. "
                + "Otherwise offer choices by their exact titles and wait for the learner's explicit selection before invoking the choice tool. "
                + "A successfully accepted navigation choice needs no second consent; respect pauses. "
                + (active(completion)
                    ? "This selected completion route owns navigation: do not call ordinary focus, goal-selection or plan-resume tools. "
                    : "This is a read-only overview, not an active completion route; ordinary learning and focus choices remain available. ")
                + "If the calculation is unavailable, do not invent remaining obligations or report failure. "
                + "An endAssessment choice is neutral navigation: never transmit an unsuccessful attempt, score or chat text.");
        return result;
    }

    private static String assessmentChoice(LevelCompletionResponse.Assessment assessment, String language) {
        boolean english = "en".equals(language);
        String prefix = Boolean.TRUE.equals(assessment.voluntary())
                ? (english ? "Try optional assessment: " : "Freiwillige Zusatzprüfung versuchen: ")
                : (english ? "Try assessment directly: " : "Prüfung direkt versuchen: ");
        return prefix + label(assessment.title(), language);
    }

    private static Map<String, Object> projectedAssessment(LevelCompletionResponse.Assessment assessment, String language) {
        var result = new LinkedHashMap<String, Object>();
        result.put("title", label(assessment.title(), language));
        result.put("mastered", assessment.mastered());
        result.put("startAvailable", supported() && assessment.startAvailable());
        if (Boolean.TRUE.equals(assessment.voluntary())) result.put("voluntary", true);
        return result;
    }

    private static String label(Map<String, String> labels, String language) {
        if (labels == null) return "";
        String value = labels.get(language);
        if (value == null) value = labels.get("de");
        if (value == null) value = labels.get("en");
        return value == null ? "" : value.replaceAll("[\\p{Cc}\\p{Cf}]+", " ").replaceAll("\\s+", " ").trim();
    }
}
