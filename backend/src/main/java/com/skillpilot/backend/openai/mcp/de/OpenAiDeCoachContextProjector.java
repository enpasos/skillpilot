package com.skillpilot.backend.openai.mcp.de;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearningModeOption;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/** Provider-specific compaction layered on the shared AI-safety projection. */
final class OpenAiDeCoachContextProjector {

    private static final String IMAGE_PATH_PREFIX = "IMAGE_PATH: ";

    private final CoachStateProjection stateProjection;
    private final String publicBaseUrl;

    OpenAiDeCoachContextProjector(CoachStateProjection stateProjection, String publicBaseUrl) {
        this.stateProjection = stateProjection;
        this.publicBaseUrl = publicBaseUrl == null || publicBaseUrl.isBlank()
                ? "https://skillpilot.com"
                : publicBaseUrl.replaceAll("/+$", "");
    }

    OpenAiDeCoachContext project(UnifiedLearnerStateResponse rawState) {
        UnifiedLearnerStateResponse state = stateProjection.project(rawState);
        if (state == null) {
            return null;
        }
        FrontierGoal activeGoal = activeGoal(state);
        String requiredAction = requiredAction(state);
        List<OpenAiDeCoachContext.Option> options = stateOptions(state, requiredAction, activeGoal);
        OpenAiDeCoachContext.Completion completion = completion(state);
        String interactionMode = interactionMode(requiredAction, activeGoal, options, completion);
        boolean examHasImage = hasExamImage(activeGoal);
        return new OpenAiDeCoachContext(
                valueOrEmpty(state.learningState()),
                valueOrEmpty(requiredAction),
                interactionMode,
                curriculum(state.curriculum()),
                activeGoal(state.curriculum(), activeGoal),
                options,
                goals(state.frontier()),
                resources(state.curriculum(), activeGoal),
                nextAllowedTools(requiredAction, activeGoal),
                progress(state.goals()),
                completion,
                policies(interactionMode, examHasImage),
                instruction(requiredAction, activeGoal, options, completion, examHasImage));
    }

    List<FrontierGoal> projectNavigationGoals(List<FrontierGoal> goals) {
        List<FrontierGoal> projected = stateProjection.projectNavigationGoals(goals);
        return projected == null ? List.of() : projected;
    }

    OpenAiDeCoachContext.Option curriculumOption(LandscapeSummary curriculum) {
        if (curriculum == null || blank(curriculum.getCurriculumId())) {
            return null;
        }
        return new OpenAiDeCoachContext.Option(
                "curriculum",
                curriculum.getCurriculumId(),
                fallback(curriculum.getTitle(), curriculum.getCurriculumId()),
                compact(curriculum.getDescription()),
                List.of(),
                List.of(),
                null);
    }

    OpenAiDeCoachContext.Option goalOption(FrontierGoal goal, String kind) {
        if (goal == null || blank(goal.id())) {
            return null;
        }
        return new OpenAiDeCoachContext.Option(
                kind,
                goal.id(),
                fallback(goal.title(), goal.id()),
                compact(goal.description()),
                List.of(goal.id()),
                List.of(),
                null);
    }

    List<OpenAiDeCoachContext.Option> personalizationOptions(LandscapeSummary curriculum) {
        if (curriculum == null || curriculum.getFilters() == null) {
            return List.of();
        }
        List<OpenAiDeCoachContext.Option> options = new ArrayList<>();
        for (LandscapeFilter filter : curriculum.getFilters()) {
            if (filter == null || blank(filter.getId())) {
                continue;
            }
            options.add(new OpenAiDeCoachContext.Option(
                    "personalization",
                    filter.getId(),
                    fallback(filter.getLabel(), filter.getId()),
                    null,
                    List.of(),
                    List.of(filter.getId()),
                    null));
        }
        return List.copyOf(options);
    }

    private List<OpenAiDeCoachContext.Option> stateOptions(
            UnifiedLearnerStateResponse state,
            String requiredAction,
            FrontierGoal activeGoal) {
        StateMachineInfo machine = state.stateMachine();
        if (machine == null || blank(requiredAction)) {
            return List.of();
        }
        List<OpenAiDeCoachContext.Option> options = new ArrayList<>();
        switch (requiredAction) {
            case "setCurriculum" -> {
                if (machine.curriculumOptions() != null) {
                    for (LandscapeSummary item : machine.curriculumOptions()) {
                        add(options, curriculumOption(item));
                    }
                }
            }
            case "setPersonalization" -> {
                options.addAll(personalizationOptions(state.curriculum()));
                if (options.isEmpty() && machine.goalOptions() != null) {
                    for (FrontierGoal item : machine.goalOptions()) {
                        add(options, goalOption(item, "personalization"));
                    }
                }
            }
            case "setScope", "setActiveGoal" -> {
                String kind = "setScope".equals(requiredAction) ? "scope" : "goal";
                if (machine.goalOptions() != null) {
                    for (FrontierGoal item : machine.goalOptions()) {
                        add(options, goalOption(item, kind));
                    }
                }
            }
            case "chooseMemoryMode" -> {
                if (machine.modeOptions() != null) {
                    for (LearningModeOption mode : machine.modeOptions()) {
                        if (mode == null || blank(mode.action())) {
                            continue;
                        }
                        String goalId = blank(mode.goalId()) && activeGoal != null ? activeGoal.id() : mode.goalId();
                        options.add(new OpenAiDeCoachContext.Option(
                                "memoryMode",
                                fallback(mode.id(), mode.action()),
                                fallback(mode.title(), mode.action()),
                                compact(mode.description()),
                                blank(goalId) ? List.of() : List.of(goalId),
                                List.of(),
                                mode.action()));
                    }
                }
            }
            default -> {
                // Teaching and mutation states do not need a selection payload.
            }
        }
        return List.copyOf(options);
    }

    private OpenAiDeCoachContext.Curriculum curriculum(LandscapeSummary curriculum) {
        return curriculum == null
                ? null
                : new OpenAiDeCoachContext.Curriculum(
                        curriculum.getCurriculumId(),
                        curriculum.getTitle(),
                        curriculum.getSubject());
    }

    private OpenAiDeCoachContext.ActiveGoal activeGoal(
            LandscapeSummary curriculum,
            FrontierGoal goal) {
        if (goal == null) {
            return null;
        }
        return new OpenAiDeCoachContext.ActiveGoal(
                goal.id(),
                goal.title(),
                goal.description(),
                goal.type(),
                visibleNodeKind(goal),
                cockpitUrl(curriculum == null ? null : curriculum.getCurriculumId(), goal.id()),
                examTask(goal.examData()));
    }

    private OpenAiDeCoachContext.ExamTask examTask(ExamData exam) {
        if (exam == null) {
            return null;
        }
        String task = exam.getTaskContent();
        boolean hasImage = task != null && task.startsWith(IMAGE_PATH_PREFIX);
        String visibleTask = hasImage
                ? task.replaceFirst("^IMAGE_PATH: [^\\r\\n]+(?:\\r?\\n){1,2}", "")
                : task;
        Double maxPoints = exam.getScoring() == null ? null : exam.getScoring().getMaxPoints();
        return new OpenAiDeCoachContext.ExamTask(visibleTask, maxPoints, hasImage);
    }

    private List<OpenAiDeCoachContext.Goal> goals(List<FrontierGoal> goals) {
        if (goals == null || goals.isEmpty()) {
            return List.of();
        }
        return goals.stream()
                .filter(goal -> goal != null && !blank(goal.id()))
                .map(goal -> new OpenAiDeCoachContext.Goal(
                        goal.id(),
                        goal.title(),
                        goal.description(),
                        goal.type(),
                        visibleNodeKind(goal),
                        goal.reason()))
                .toList();
    }

    private List<OpenAiDeCoachContext.Resource> resources(
            LandscapeSummary curriculum,
            FrontierGoal goal) {
        if (goal == null || goal.resourceLinks() == null) {
            return List.of();
        }
        String cockpitUrl = cockpitUrl(curriculum == null ? null : curriculum.getCurriculumId(), goal.id());
        List<OpenAiDeCoachContext.Resource> resources = new ArrayList<>();
        for (GoalSourceLink link : goal.resourceLinks()) {
            if (link == null || blank(link.url())) {
                continue;
            }
            boolean visualization = "goal-visualization".equals(link.type())
                    && "image".equals(link.resourceType());
            if (visualization && blank(cockpitUrl)) {
                continue;
            }
            String type = fallback(link.type(), "resource");
            resources.add(new OpenAiDeCoachContext.Resource(
                    type,
                    fallback(link.title(), type),
                    visualization ? cockpitUrl : link.url(),
                    visualization ? "cockpit" : link.resourceType(),
                    visualization ? "SkillPilot" : link.provider(),
                    link.altText(),
                    visualization));
        }
        return List.copyOf(resources);
    }

    private OpenAiDeCoachContext.Progress progress(LearnerGoals goals) {
        if (goals == null) {
            return new OpenAiDeCoachContext.Progress(0, 0, null, null, false);
        }
        return new OpenAiDeCoachContext.Progress(
                goals.mastered_count(),
                goals.total_count(),
                goalProgress(goals.personalized()),
                goalProgress(goals.scope()),
                goals.scope_completed());
    }

    private OpenAiDeCoachContext.GoalProgress goalProgress(GoalStats stats) {
        return stats == null
                ? null
                : new OpenAiDeCoachContext.GoalProgress(stats.mastered_atomic(), stats.total_atomic());
    }

    private OpenAiDeCoachContext.Completion completion(UnifiedLearnerStateResponse state) {
        LearnerGoals goals = state.goals();
        boolean scopeComplete = goals != null && goals.scope_completed();
        GoalStats curriculum = goals == null ? null : goals.personalized();
        boolean curriculumComplete = curriculum != null
                && curriculum.total_atomic() > 0
                && curriculum.mastered_atomic() >= curriculum.total_atomic();
        return new OpenAiDeCoachContext.Completion(scopeComplete, curriculumComplete);
    }

    private List<String> nextAllowedTools(String requiredAction, FrontierGoal activeGoal) {
        List<String> tools = new ArrayList<>();
        tools.add(OpenAiDeCoachMcpContract.GET_CONTEXT);
        tools.add(OpenAiDeCoachMcpContract.GET_NAVIGATION);
        if (requiredAction != null) {
            switch (requiredAction) {
                case "setCurriculum" -> tools.add(OpenAiDeCoachMcpContract.SET_CURRICULUM);
                case "setPersonalization" -> tools.add(OpenAiDeCoachMcpContract.SET_PERSONALIZATION);
                case "setScope" -> tools.add(OpenAiDeCoachMcpContract.SET_SCOPE);
                case "setActiveGoal" -> tools.add(OpenAiDeCoachMcpContract.SET_ACTIVE_GOAL);
                case "teachActiveGoal", "setMastery" -> {
                    tools.add(OpenAiDeCoachMcpContract.SET_ACTIVE_GOAL);
                    tools.add(OpenAiDeCoachMcpContract.SET_MASTERY);
                }
                case "chooseMemoryMode" -> {
                    if (isMemoryGoal(activeGoal)) {
                        tools.add(OpenAiDeCoachMcpContract.START_RECALL);
                    }
                }
                default -> {
                    // The context itself remains the safe recovery operation.
                }
            }
        }
        if (isExamGoal(activeGoal)) {
            tools.add(OpenAiDeCoachMcpContract.GET_EXAM_EVALUATION);
        }
        return List.copyOf(tools.stream().distinct().toList());
    }

    private String interactionMode(
            String requiredAction,
            FrontierGoal goal,
            List<OpenAiDeCoachContext.Option> options,
            OpenAiDeCoachContext.Completion completion) {
        if (goal == null && completion.curriculumComplete()) {
            return "complete";
        }
        if (!options.isEmpty()) {
            return "selection";
        }
        if (isExamGoal(goal)) {
            return "exam";
        }
        if (isMemoryGoal(goal)) {
            return "verifiedRecall";
        }
        if ("setPersonalization".equals(requiredAction)) {
            return "selection";
        }
        return "chat";
    }

    private List<String> policies(String interactionMode, boolean examHasImage) {
        List<String> policies = new ArrayList<>(List.of(
                "Der jüngste SkillPilot-Kontext ist die einzige Autorität. Erfinde keine Ziele, Optionen, Zustände, Fortschrittswerte oder Abläufe.",
                "Nenne in sichtbaren Antworten keine Tool-, API-, JSON- oder Feldnamen und keine technischen IDs. Fordere niemals OAuth-Tokens oder die dauerhafte SkillPilot-ID an und gib sie nie aus.",
                "Verwende ausschließlich vom Backend gelieferte URLs wortgetreu. Konstruiere keine Links aus IDs und hänge keine Tokens oder SkillPilot-IDs an. Fehlt ein freigegebener Link, verwende nur https://skillpilot.com.",
                "Schreibe Mathematik ausschließlich mit \\(...\\) inline und \\[...\\] abgesetzt; verwende niemals Dollar-Delimiter.",
                "Nenne Fortschritt ausschließlich aus dem frisch gelieferten progress und zuerst für den aktuellen Lernumfang. Nenne breitere Werte nur auf Nachfrage und schätze niemals.",
                "Behaupte eine Zustandsänderung nur nach bestätigtem Backend-Erfolg. Bei einem Konflikt lade den Kontext genau einmal neu; bei Authentifizierungs-, Schema-, Speicher- oder wiederholtem Konfliktfehler stoppe die strukturierte Arbeit transparent."));
        switch (interactionMode) {
            case "chat" -> policies.addAll(List.of(
                    "Arbeite dialogisch an genau einem bestätigten atomischen Ziel: prüfe kurz Vorwissen, gib kleine Hinweise, lasse selbst arbeiten und unterscheide Denkfehler von Flüchtigkeitsfehlern. Gib nie die Lösung der unmittelbar folgenden Aufgabe vor.",
                    "Bewerte die fachliche Bedeutung statt den Wortlaut. Rekonstruiere ungewöhnliche Wege fair und korrigiere nur tatsächlich falsche oder unbegründete Schritte; ausdrücklich verlangte Formate und Inhalte bleiben bindend.",
                    "Speichere Mastery nur nach zwei unabhängigen Checks, etwa Erklärung plus neue Anwendung, oder nach echtem mehrschrittigem Transfer in verändertem Kontext. Prüfe alle Aspekte eines mehrteiligen Ziels; Selbsteinschätzung, Wiederholung und derselbe vorgerechnete Fall genügen nicht. Cluster- und Memorierungsziele werden nie manuell gemeistert."));
            case "exam" -> policies.addAll(List.of(
                    "Prüfungsmodus: Gib die Aufgabe wortgetreu aus und ändere nur Dollar-TeX-Begrenzer. Gib keine Hinweise, Teilantworten, Lösungen oder Scaffolds und stelle während der Prüfung keine Rückfragen.",
                    "Lade Lösung und Raster erst nach einer vollständigen sichtbaren Abgabe. Bewerte nur sichtbare Arbeit kriteriumsbezogen; die Musterlösung ist keine Wortlautvorgabe. Gleichwertige Wege, Darstellungen, Rundungen und Begründungen zählen voll, sofern die Aufgabe nichts Bestimmtes verlangt.",
                    "Ordne jeden Punktabzug konkret zu. Unterstelle bei Unleserlichkeit keinen Fachfehler. Speichere Mastery ausschließlich nach finalem Bestehen mit mindestens der ausgewiesenen Bestehenspunktzahl."));
            case "verifiedRecall" -> policies.addAll(List.of(
                    "Verified Recall: Zeige den vollständigen Fragenbatch in Reihenfolge und warte auf alle Antworten. Lade jede Sollantwort erst nach der zugehörigen Lernendenantwort.",
                    "Vergleiche fachlich und akzeptiere gleichwertige Formulierungen. Speichere jede Karte sofort; passed=true nur bei richtiger Antwort ohne Hilfe. Speichere den ganzen Batch vor dem nächsten Batch. Prüfe dieselbe Karte höchstens einmal pro Tag und speichere keine zusätzliche manuelle Mastery."));
            case "selection" -> policies.add(
                    "Behandle einen natürlichen Mehrfachwunsch als fortgeltende Absicht. Wende jeden eindeutig bestimmten frischen Schritt direkt an und frage nur die tatsächlich offene Auswahl. Kandidaten sind noch keine aktiven Ziele.");
            case "complete" -> policies.add(
                    "Nenne nur frisch gelieferte Fortschrittswerte und zuerst den aktuellen Lernumfang. Würdige einen Abschluss kurz und biete ausschließlich gelieferte Folgeoptionen an; erfinde keine neuen Ziele.");
            default -> {
                // The common safety and recovery policies apply in every mode.
            }
        }
        if ("exam".equals(interactionMode) && examHasImage) {
            policies.add("Diese Prüfungsaufgabe benötigt eine Abbildung, die nicht im MCP-Kontext übertragen wird. "
                    + "Gib vor der Aufgabe den gelieferten activeGoal.cockpitUrl wortgetreu als Cockpit-Link aus, "
                    + "sage knapp, dass die Abbildung dort angesehen werden muss, und erfinde oder beschreibe "
                    + "keine vermeintliche Abbildung.");
        }
        return List.copyOf(policies);
    }

    private String instruction(
            String requiredAction,
            FrontierGoal goal,
            List<OpenAiDeCoachContext.Option> options,
            OpenAiDeCoachContext.Completion completion,
            boolean examHasImage) {
        if (goal == null && completion.curriculumComplete()) {
            return "Der personalisierte Lehrplan ist vollständig abgeschlossen. Gratuliere kurz, nenne nur frisch "
                    + "gelieferte Fortschrittswerte und erfinde kein weiteres Lernziel.";
        }
        if ("chooseMemoryMode".equals(requiredAction) && !options.isEmpty()) {
            return "Frage nur dann nach dem Lernmodus, wenn der Wunsch nicht bereits eindeutig ist. Bei "
                    + "openCockpitPractice gib ausschließlich die vom Backend gelieferte cockpitUrl wortgetreu aus "
                    + "und pausiere die strukturierte Kartenprüfung. Bei startVerifiedRecall starte die harte "
                    + "Abrufprüfung, zeige den ganzen Fragenbatch und warte auf alle Antworten.";
        }
        if (isExamGoal(goal)) {
            String imageInstruction = examHasImage
                    ? "Die notwendige Aufgabenabbildung ist nur im Cockpit sichtbar: Gib zuerst activeGoal.cockpitUrl "
                            + "wortgetreu aus und fordere die lernende Person auf, die Abbildung dort anzusehen. "
                    : "";
            return "Prüfungsmodus: " + imageInstruction
                    + "Gib taskContent wortgetreu aus und ändere nur Dollar-TeX-Begrenzer. Gib keine "
                    + "lösungslenkenden Hinweise und stelle keine Nachfragen. Warte auf eine vollständige sichtbare "
                    + "Abgabe. Lade erst danach mit "
                    + OpenAiDeCoachMcpContract.GET_EXAM_EVALUATION
                    + " die freigegebene Bewertungsgrundlage und bewerte abschließend.";
        }
        if (isMemoryGoal(goal)) {
            return "Verified Recall: Starte die Abrufprüfung für das bestätigte aktive Merkziel, zeige den ganzen "
                    + "Fragenbatch und warte auf alle Antworten. Lade Sollantworten erst danach, speichere jedes "
                    + "Kartenergebnis und beginne erst nach vollständiger Speicherung den nächsten Batch.";
        }
        if (blank(requiredAction)) {
            return "Es ist keine weitere Backend-Aktion erforderlich. Lade bei Zweifel den aktuellen Kontext neu.";
        }
        return switch (requiredAction) {
            case "setCurriculum", "setPersonalization", "setScope", "setActiveGoal", "chooseMemoryMode" ->
                    options.isEmpty()
                            ? "Für den erforderlichen Schritt sind keine sicheren Optionen vorhanden. Lade den Kontext neu."
                            : "Behandle einen natürlichen Mehrfachwunsch in diesem Assistententurn als fortgeltende Absicht. "
                                    + "Wende einen fachlich eindeutigen Treffer direkt an, lade den Folgezustand und frage "
                                    + "nur eine tatsächlich offene Auswahl nach.";
            case "teachActiveGoal", "setMastery" ->
                    "Arbeite dialogisch am aktiven Lernziel. Anerkenne fachlich gleichwertige korrekte Lösungswege, "
                            + "Darstellungen und Begründungen; ausdrücklich verlangte Formate bleiben verbindlich. "
                            + "Speichere Mastery erst nach zwei unabhängigen Checks oder echtem Transfer in einem "
                            + "veränderten Kontext und nachdem alle Aspekte des Ziels geprüft sind.";
            default -> "Folge ausschließlich der angezeigten erforderlichen Aktion und lade danach den Kontext neu.";
        };
    }

    private boolean hasExamImage(FrontierGoal goal) {
        ExamData exam = goal == null ? null : goal.examData();
        return exam != null
                && exam.getTaskContent() != null
                && exam.getTaskContent().startsWith(IMAGE_PATH_PREFIX);
    }

    private FrontierGoal activeGoal(UnifiedLearnerStateResponse state) {
        if (state.stateMachine() != null && state.stateMachine().activeGoal() != null) {
            return state.stateMachine().activeGoal();
        }
        return state.activeGoal();
    }

    private String requiredAction(UnifiedLearnerStateResponse state) {
        return state.stateMachine() == null ? null : state.stateMachine().requiredAction();
    }

    private String visibleNodeKind(FrontierGoal goal) {
        if (goal == null) {
            return null;
        }
        if (!blank(goal.nodeKind())) {
            return goal.nodeKind();
        }
        if (goal.examData() != null) {
            return "exam";
        }
        return null;
    }

    private boolean isExamGoal(FrontierGoal goal) {
        return goal != null && ("exam".equals(goal.nodeKind()) || goal.examData() != null);
    }

    private boolean isMemoryGoal(FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        if ("memory".equals(goal.nodeKind())) {
            return true;
        }
        return goal.tags() != null && goal.tags().stream()
                .anyMatch(tag -> "memorization".equals(tag) || (tag != null && tag.startsWith("srs-deck:")));
    }

    private String cockpitUrl(String curriculumId, String goalId) {
        if (blank(goalId)) {
            return null;
        }
        StringBuilder url = new StringBuilder(publicBaseUrl).append("/?");
        if (!blank(curriculumId)) {
            url.append("l=").append(queryValue(curriculumId)).append('&');
        }
        return url.append("goal=").append(queryValue(goalId)).toString();
    }

    private String queryValue(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private void add(List<OpenAiDeCoachContext.Option> options, OpenAiDeCoachContext.Option option) {
        if (option != null) {
            options.add(option);
        }
    }

    private String compact(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.replaceAll("\\s+", " ").trim();
        return normalized.length() <= 320 ? normalized : normalized.substring(0, 317) + "...";
    }

    private String fallback(String value, String fallback) {
        return blank(value) ? fallback : value;
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
