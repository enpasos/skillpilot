package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.api.LevelCompletionActionRequest;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.completion.CompletionCallContext;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Projects authorized choices; it never calculates mastery, waivers or prerequisite access. */
final class ClaudeV1CompletionChoices {
    private static final int MAX_CHOICES = 24;
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
        return completion != null && completion.profileId() != null;
    }

    static List<Choice> published(LevelCompletionResponse completion, String language) {
        if (completion == null || !supported()
                || "completion_assessment_owned_elsewhere".equals(completion.notice())) return List.of();
        boolean en = "en".equals(language);
        List<Choice> candidates = new ArrayList<>();
        if (!active(completion) && "unresolved".equals(completion.calculationStatus())
                && completion.notice() == null && completion.profileOptions() != null) {
            for (var option : completion.profileOptions()) {
                for (var assessment : option.assessments()) {
                    if (!assessment.mastered() && assessment.startAvailable()) {
                        candidates.add(new Choice((en ? "Try assessment directly: " : "Prüfung direkt versuchen: ")
                                + label(assessment.title(), language), "startAssessment", option.profileId(),
                                assessment.goalId(), null));
                    }
                }
                candidates.add(new Choice((en ? "Choose section: " : "Abschnitt wählen: ")
                        + label(option.title(), language), "selectProfile", option.profileId(), null, null));
            }
        }
        if ("valid".equals(completion.calculationStatus()) && completion.assessments() != null
                && !completion.directAssessmentRunning()) {
            for (var assessment : completion.assessments()) {
                if (!assessment.mastered() && assessment.startAvailable()) {
                    candidates.add(new Choice((en ? "Try assessment directly: " : "Prüfung direkt versuchen: ")
                            + label(assessment.title(), language), "startAssessment", completion.profileId(),
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
                        || "includeSupport".equals(action.action())) {
                    prefix = "";
                } else continue;
                candidates.add(new Choice(prefix + label(action.title(), language), action.action(),
                        completion.profileId(), action.goalId(), action.intent()));
            }
        }
        // An ambiguous label is never executable. Do not silently choose a goal by order.
        Map<String, Integer> counts = new LinkedHashMap<>();
        for (Choice choice : candidates) counts.merge(choice.label(), 1, Integer::sum);
        return candidates.stream().filter(choice -> counts.get(choice.label()) == 1)
                .filter(choice -> !choice.label().isBlank() && choice.label().length() <= 512)
                .limit(MAX_CHOICES).toList();
    }

    static Map<String, Object> project(LevelCompletionResponse completion, String language) {
        if (completion == null) return null;
        boolean en = "en".equals(language);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("calculationStatus", completion.calculationStatus());
        result.put("title", label(completion.title(), language));
        result.put("directAssessmentRunning", completion.directAssessmentRunning());
        if (!active(completion) && completion.profileOptions() != null && !completion.profileOptions().isEmpty()) {
            result.put("sections", completion.profileOptions().stream().limit(MAX_CHOICES).map(option -> {
                Map<String, Object> section = new LinkedHashMap<>();
                section.put("title", label(option.title(), language));
                if (option.targetCount() != null) section.put("targetCount", option.targetCount());
                if (option.requiredAssessmentCount() != null) section.put("requiredAssessmentCount", option.requiredAssessmentCount());
                if (!option.assessments().isEmpty()) {
                    section.put("assessments", option.assessments().stream().limit(MAX_CHOICES).map(assessment ->
                            Map.of("title", label(assessment.title(), language), "mastered", assessment.mastered(),
                                    "startAvailable", supported() && assessment.startAvailable())).toList());
                }
                return section;
            }).toList());
        }
        if ("valid".equals(completion.calculationStatus()) && completion.complete() != null) {
            result.put("complete", completion.complete());
            result.put("text", en
                    ? "%d of %d learning goals achieved; %d of %d required assessments passed. Preparation for %d learning goals is no longer required for this section. These goals do not become mastered. %d target goals remain required.%s".formatted(
                            completion.masteredTargetCount(), completion.targetCount(), completion.masteredAssessmentCount(),
                            completion.requiredAssessmentCount(), completion.waivedTargetCount(), completion.pendingTargetCount(),
                            Boolean.TRUE.equals(completion.complete()) ? " Learning section completed." : "")
                    : "%d von %d Lernzielen geschafft; %d von %d erforderlichen Prüfungen geschafft. Für diesen Abschnitt entfällt die Vorbereitung für %d Lernziele. Diese Lernziele werden dadurch nicht gemeistert. %d Zielpflichten sind noch offen.%s".formatted(
                            completion.masteredTargetCount(), completion.targetCount(), completion.masteredAssessmentCount(),
                            completion.requiredAssessmentCount(), completion.waivedTargetCount(), completion.pendingTargetCount(),
                            Boolean.TRUE.equals(completion.complete()) ? " Lernabschnitt abgeschlossen." : ""));
        }
        if ("paused".equals(completion.navigationIntent())) {
            result.put("paused", true);
        }
        if ("valid".equals(completion.calculationStatus()) && !completion.waiverDetails().isEmpty()) {
            result.put("waivedPreparation", completion.waiverDetails().stream().map(detail -> Map.of(
                    "goal", label(detail.title(), language),
                    "passedAssessments", detail.assessments().stream().map(assessment -> label(assessment.title(), language)).toList(),
                    "supportingAssessmentCount", detail.assessmentCount(),
                    "scope", en ? "Only this learning section; the goal keeps its existing result."
                            : "Nur dieser Lernabschnitt; das Lernziel behält seinen bisherigen Stand.")).toList());
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
        result.put("choices", published(completion, language).stream().map(Choice::label).toList());
        result.put("instruction", "Use this backend completion statement without recalculating or turning waived preparation into mastery. "
                + "Available direct assessment choices can be selected from ordinary learning without choosing a section first. "
                + "Offer them when the learner asks for a shortcut, an assessment or to demonstrate existing knowledge; do not interrupt ordinary teaching unprompted. "
                + "For an explicit learner choice, copy exactly one current choices entry into choose_skillpilot_completion_route. "
                + "An explicit learner request to start exactly one currently published assessment already supplies selection consent; invoke that choice without asking again. "
                + "Otherwise offer choices by their exact titles and wait for the learner's explicit selection before invoking the choice tool. "
                + "A successfully accepted navigation choice needs no second consent; respect pauses. "
                + "Do not call ordinary focus, goal-selection or plan-resume tools while this completion route owns navigation. "
                + "If the calculation is unavailable, do not invent remaining obligations or report failure. "
                + "An endAssessment choice is neutral navigation: never transmit an unsuccessful attempt, score or chat text.");
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
