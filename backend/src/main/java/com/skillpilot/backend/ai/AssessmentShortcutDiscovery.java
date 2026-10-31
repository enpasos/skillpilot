package com.skillpilot.backend.ai;

import com.skillpilot.backend.api.LevelCompletionResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Read-only recovery for obsolete Claude sessions; other providers have no shortcut integration yet. */
public record AssessmentShortcutDiscovery(String notice, List<Option> options, String instruction) {
    public static final int MAX_OPTIONS = 6;

    public record Option(String assessmentTitle, String sectionTitle, String cockpitUrl) { }

    public static AssessmentShortcutDiscovery project(LevelCompletionResponse completion,
            String publicBaseUrl, String language) {
        if (completion == null || completion.directAssessmentRunning() || completion.profileOptions() == null) return null;
        boolean automaticOverview = completion.profileId() != null && completion.profileId().startsWith("automatic:")
                && completion.navigationIntent() == null;
        boolean available = automaticOverview ? "valid".equals(completion.calculationStatus())
                : completion.profileId() == null && "unresolved".equals(completion.calculationStatus());
        boolean unsupportedOverview = automaticOverview
                && "completion_coach_contract_unsupported".equals(completion.notice());
        if (!available || completion.notice() != null && !unsupportedOverview) return null;
        List<Option> options = new ArrayList<>();
        String base = publicBaseUrl == null || publicBaseUrl.isBlank() ? "https://skillpilot.com"
                : publicBaseUrl.replaceAll("/+$", "");
        for (var profile : completion.profileOptions()) {
            for (var assessment : profile.assessments()) {
                if (assessment.mastered() || !assessment.startAvailable()) continue;
                String title = label(assessment.title(), language);
                String section = label(profile.title(), language);
                if (title.isBlank() || section.isBlank() || assessment.goalId() == null
                        || assessment.goalId().isBlank()) continue;
                String path = URLEncoder.encode(assessment.goalId(), StandardCharsets.UTF_8).replace("+", "%20");
                options.add(new Option(title, section, base + "/learner/" + path + "?completionShortcuts=1"));
                if (options.size() == MAX_OPTIONS) break;
            }
            if (options.size() == MAX_OPTIONS) break;
        }
        if (options.isEmpty()) return null;
        boolean en = "en".equals(language);
        return new AssessmentShortcutDiscovery(en
                ? "These assessment shortcuts are available in your personal curriculum. Direct assessments currently run with Claude; open the selected assessment in the Cockpit."
                : "Diese Prüfungsabkürzungen sind in deinem Persönlichen Lehrplan verfügbar. Direktprüfungen laufen derzeit mit Claude; öffne die gewünschte Prüfung im Cockpit.",
                List.copyOf(options),
                "When the learner asks about assessment shortcuts, offer only these exact assessment titles and their section. "
                        + "Copy the matching cockpitUrl unchanged and explain the provider limitation using notice. "
                        + "The link only opens the current options; it never starts an assessment or grants access. "
                        + "The learner chooses and confirms the start in the Cockpit using its fresh state. "
                        + "Do not use ordinary goal/focus tools to bypass prerequisites, present tasks or solutions, "
                        + "claim mastery of preparation, or change the learning plan merely to show these options. "
                        + "Do not interrupt current feedback or replace an agreed learning-plan continuation with unsolicited shortcuts.");
    }

    private static String label(Map<String, String> titles, String language) {
        if (titles == null) return "";
        String value = titles.get(language);
        if (value == null) value = titles.getOrDefault("de", titles.getOrDefault("en", ""));
        return value.replaceAll("[\\p{Cc}\\p{Cf}]+", " ").replaceAll("\\s+", " ").trim();
    }
}
