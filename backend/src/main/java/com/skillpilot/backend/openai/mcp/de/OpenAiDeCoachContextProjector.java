package com.skillpilot.backend.openai.mcp.de;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearningModeOption;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.openai.OpenAiCoachLocale;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/** Provider-specific compaction layered on the shared AI-safety projection. */
public final class OpenAiDeCoachContextProjector {

    private static final String IMAGE_PATH_PREFIX = "IMAGE_PATH: ";
    private static final String GOAL_VISUALIZATION_ASSET_PREFIX =
            "/assets/goal-visualizations/";

    private final CoachStateProjection stateProjection;
    private final String publicBaseUrl;

    public OpenAiDeCoachContextProjector(CoachStateProjection stateProjection, String publicBaseUrl) {
        this.stateProjection = stateProjection;
        this.publicBaseUrl = publicBaseUrl == null || publicBaseUrl.isBlank()
                ? "https://skillpilot.com"
                : publicBaseUrl.replaceAll("/+$", "");
    }

    public OpenAiDeCoachContext project(
            UnifiedLearnerStateResponse rawState,
            PersonalizationPlan personalizationPlan,
            boolean includeGoalVisualization,
            String communicationLocale) {
        UnifiedLearnerStateResponse state = stateProjection.project(rawState);
        if (state == null) {
            return null;
        }
        FrontierGoal activeGoal = activeGoal(state);
        String requiredAction = requiredAction(state);
        List<OpenAiDeCoachContext.Option> options = stateOptions(
                state,
                requiredAction,
                activeGoal,
                personalizationPlan,
                communicationLocale);
        OpenAiDeCoachContext.Decision decision = "setPersonalization".equals(requiredAction)
                ? personalizationDecision(personalizationPlan)
                : null;
        OpenAiDeCoachContext.Orientation orientation = "setPersonalization".equals(requiredAction)
                ? personalizationOrientation(state.curriculum(), personalizationPlan, communicationLocale)
                : null;
        OpenAiDeCoachContext.Completion completion = completion(state);
        String interactionMode = interactionMode(requiredAction, activeGoal, options, completion);
        boolean examHasImage = hasExamImage(activeGoal);
        OpenAiDeCoachContext.GoalVisualization goalVisualization = includeGoalVisualization
                ? goalVisualization(state.curriculum(), activeGoal, communicationLocale)
                : null;
        return new OpenAiDeCoachContext(
                valueOrEmpty(state.learningState()),
                valueOrEmpty(requiredAction),
                interactionMode,
                curriculum(state.curriculum()),
                orientation,
                activeGoal(state.curriculum(), activeGoal),
                options,
                decision,
                goals(state.frontier()),
                resources(state.curriculum(), activeGoal),
                goalVisualization,
                nextAllowedTools(requiredAction, activeGoal, goalVisualization != null),
                progress(state.goals()),
                completion,
                policies(interactionMode, examHasImage, orientation, communicationLocale),
                instruction(
                        requiredAction,
                        activeGoal,
                        options,
                        decision,
                        orientation,
                        completion,
                        examHasImage,
                        communicationLocale));
    }

    public List<FrontierGoal> projectNavigationGoals(List<FrontierGoal> goals) {
        List<FrontierGoal> projected = stateProjection.projectNavigationGoals(goals);
        return projected == null ? List.of() : projected;
    }

    public OpenAiDeCoachContext.Option curriculumOption(LandscapeSummary curriculum) {
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

    public OpenAiDeCoachContext.Option goalOption(FrontierGoal goal, String kind) {
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

    public List<OpenAiDeCoachContext.Option> personalizationOptions(
            PersonalizationPlan plan,
            String rootLandscapeId,
            String communicationLocale) {
        if (plan == null || !plan.required() || plan.options().isEmpty()) {
            return List.of();
        }
        return personalizationOptions(plan.options(), rootLandscapeId, communicationLocale);
    }

    public List<OpenAiDeCoachContext.Option> personalizationNavigationOptions(
            PersonalizationPlan plan,
            String rootLandscapeId,
            String communicationLocale) {
        if (plan == null || plan.navigationOptions().isEmpty()) {
            return List.of();
        }
        return personalizationOptions(plan.navigationOptions(), rootLandscapeId, communicationLocale);
    }

    public OpenAiDeCoachContext.Decision personalizationDecision(PersonalizationPlan plan) {
        if (plan == null
                || !plan.valid()
                || !plan.required()
                || blank(plan.stageLabel())
                || blank(plan.groupLabel())
                || plan.minSelections() < 0
                || plan.maxSelections() < plan.minSelections()
                || plan.selectedCount() < 0
                || plan.selectedCount() > plan.maxSelections()) {
            return null;
        }
        return new OpenAiDeCoachContext.Decision(
                compact(plan.stageLabel()),
                compact(plan.groupLabel()),
                plan.minSelections(),
                plan.maxSelections(),
                plan.selectedCount());
    }

    public OpenAiDeCoachContext.Orientation personalizationOrientation(
            LandscapeSummary curriculum,
            PersonalizationPlan plan,
            String communicationLocale) {
        if (plan == null || !plan.valid() || !plan.required()) {
            return null;
        }
        String curriculumLabel = curriculum == null
                ? null
                : fallback(curriculum.getTitle(), curriculum.getSubject());
        String establishedContext = blank(curriculumLabel)
                ? null
                : text(
                        communicationLocale,
                        "Du bist im Curriculum „" + compact(curriculumLabel) + "“.",
                        "You are using the “" + compact(curriculumLabel) + "” curriculum.");
        List<OpenAiDeCoachContext.OpenQuestion> openQuestions = plan.pendingDecisions().stream()
                .filter(prompt -> prompt != null && !blank(prompt.groupLabel()))
                .map(prompt -> new OpenAiDeCoachContext.OpenQuestion(
                        compact(fallback(prompt.stageLabel(), prompt.groupLabel())),
                        compact(prompt.groupLabel())))
                .toList();
        if (blank(establishedContext) && openQuestions.isEmpty()) {
            return null;
        }
        return new OpenAiDeCoachContext.Orientation(establishedContext, openQuestions);
    }

    private List<OpenAiDeCoachContext.Option> personalizationOptions(
            List<PersonalizationPlan.Option> source,
            String rootLandscapeId,
            String communicationLocale) {
        List<OpenAiDeCoachContext.Option> options = new ArrayList<>();
        for (PersonalizationPlan.Option option : source) {
            if (option == null) {
                continue;
            }
            if (option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP) {
                add(options, new OpenAiDeCoachContext.Option(
                        "personalization",
                        option.optionId(),
                        text(communicationLocale, "Auswahl abschließen", "Complete selection"),
                        text(
                                communicationLocale,
                                "Schließt nur die aktuelle Auswahlgruppe ab und übernimmt keine weitere fachliche Option.",
                                "Completes only the current selection group without choosing another subject option."),
                        List.of(),
                        List.of(),
                        null));
                continue;
            }
            if (option.kind() == PersonalizationPlan.OptionKind.SCOPE_VALUE) {
                add(options, new OpenAiDeCoachContext.Option(
                        "personalization",
                        option.optionId(),
                        fallback(option.scopeLabel(), option.scopeValue()),
                        null,
                        List.of(),
                        List.of(),
                        null));
                continue;
            }
            String landscapeId = option.landscapeId();
            if (blank(landscapeId)) {
                continue;
            }
            boolean selectionOnly = blank(option.filterId());
            boolean rootOption = landscapeId.equals(rootLandscapeId);
            String landscapeLabel = fallback(option.landscapeLabel(), landscapeId);
            String filterLabel = selectionOnly
                    ? null
                    : fallback(option.filterLabel(), option.filterId());
            add(options, new OpenAiDeCoachContext.Option(
                    "personalization",
                    option.optionId(),
                    selectionOnly
                            ? landscapeLabel
                            : rootOption
                            ? filterLabel
                            : landscapeLabel + " – " + filterLabel,
                    null,
                    List.of(),
                    List.of(),
                    null));
        }
        return List.copyOf(options);
    }

    private List<OpenAiDeCoachContext.Option> stateOptions(
            UnifiedLearnerStateResponse state,
            String requiredAction,
            FrontierGoal activeGoal,
            PersonalizationPlan personalizationPlan,
            String communicationLocale) {
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
                String rootLandscapeId = state.curriculum() == null
                        ? null
                        : state.curriculum().getCurriculumId();
                options.addAll(personalizationOptions(
                        personalizationPlan,
                        rootLandscapeId,
                        communicationLocale));
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
                goal.semanticKind(),
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
                        goal.semanticKind(),
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

    private OpenAiDeCoachContext.GoalVisualization goalVisualization(
            LandscapeSummary curriculum,
            FrontierGoal goal,
            String communicationLocale) {
        if (goal == null
                || !"atomic".equalsIgnoreCase(goal.type())
                || blank(goal.id())
                || goal.resourceLinks() == null) {
            return null;
        }
        GoalSourceLink visualization = goal.resourceLinks().stream()
                .filter(link -> link != null
                        && "goal-visualization".equals(link.type())
                        && "image".equals(link.resourceType())
                        && goal.id().equals(link.skillpilotId())
                        && !blank(link.url()))
                .findFirst()
                .orElse(null);
        if (visualization == null) {
            return null;
        }
        String imageUrl = publicAssetUrl(visualization.url());
        String cockpitUrl = cockpitUrl(
                curriculum == null ? null : curriculum.getCurriculumId(),
                goal.id());
        if (blank(imageUrl) || blank(cockpitUrl)) {
            return null;
        }
        String title = compact(fallback(goal.title(), goal.id()));
        return new OpenAiDeCoachContext.GoalVisualization(
                goal.id(),
                title,
                compact(goal.description()),
                imageUrl,
                compact(
                        fallback(
                                visualization.altText(),
                                text(
                                        communicationLocale,
                                        "Didaktische Visualisierung zum Lernziel „" + title + "“.",
                                        "Didactic visualisation for the learning goal “" + title + "”.")),
                        1_000),
                cockpitUrl);
    }

    private String publicAssetUrl(String value) {
        if (blank(value)) {
            return null;
        }
        String normalized = value.trim();
        if (!normalized.startsWith(GOAL_VISUALIZATION_ASSET_PREFIX)
                || normalized.contains("..")
                || normalized.contains("\\")
                || normalized.contains("%")
                || normalized.contains("?")
                || normalized.contains("#")) {
            return null;
        }
        return publicBaseUrl + normalized;
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

    private List<String> nextAllowedTools(
            String requiredAction,
            FrontierGoal activeGoal,
            boolean goalVisualizationAvailable) {
        List<String> tools = new ArrayList<>();
        tools.add(OpenAiDeV1McpContractAdapter.GET_CONTEXT);
        tools.add(OpenAiDeV1McpContractAdapter.GET_NAVIGATION);
        if (requiredAction != null) {
            switch (requiredAction) {
                case "setCurriculum" -> tools.add(OpenAiDeV1McpContractAdapter.SET_CURRICULUM);
                case "setPersonalization" -> tools.add(OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION);
                case "setScope" -> tools.add(OpenAiDeV1McpContractAdapter.SET_SCOPE);
                case "setActiveGoal" -> tools.add(OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL);
                case "orientActiveGoal", "teachActiveGoal", "setMastery" -> {
                    tools.add(OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL);
                    tools.add(OpenAiDeV1McpContractAdapter.SET_MASTERY);
                }
                case "chooseMemoryMode" -> {
                    if (isMemoryGoal(activeGoal)) {
                        tools.add(OpenAiDeV1McpContractAdapter.START_RECALL);
                    }
                }
                default -> {
                    // The context itself remains the safe recovery operation.
                }
            }
        }
        if (isExamGoal(activeGoal)) {
            tools.add(OpenAiDeV1McpContractAdapter.GET_EXAM_EVALUATION);
        }
        if (goalVisualizationAvailable) {
            tools.add(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);
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
        if (isOrientationGoal(goal)) {
            return "orientation";
        }
        if ("setPersonalization".equals(requiredAction)) {
            return "selection";
        }
        return "chat";
    }

    private List<String> policies(
            String interactionMode,
            boolean examHasImage,
            OpenAiDeCoachContext.Orientation orientation,
            String communicationLocale) {
        if (OpenAiCoachLocale.isEnglish(communicationLocale)) {
            return englishPolicies(interactionMode, examHasImage, orientation);
        }
        List<String> policies = new ArrayList<>(List.of(
                "Der jüngste SkillPilot-Kontext ist die einzige Autorität. Erfinde keine Ziele, Optionen, Zustände, Fortschrittswerte oder Abläufe.",
                "Nenne in sichtbaren Antworten keine Tool-, API-, JSON- oder Feldnamen und keine technischen IDs. Fordere niemals OAuth-Tokens oder die dauerhafte SkillPilot-ID an und gib sie nie aus.",
                "Verwende ausschließlich vom Backend gelieferte URLs wortgetreu. Konstruiere keine Links aus IDs und hänge keine Tokens oder SkillPilot-IDs an. Fehlt ein freigegebener Link, gib keinen Link aus.",
                "Schreibe Mathematik ausschließlich mit \\(...\\) inline und \\[...\\] abgesetzt; verwende niemals Dollar-Delimiter.",
                "Nenne Fortschritt ausschließlich aus dem frisch gelieferten progress und zuerst für den aktuellen Lernumfang. Nenne breitere Werte nur auf Nachfrage und schätze niemals.",
                "Behaupte eine Zustandsänderung nur nach bestätigtem Backend-Erfolg. Bei einem Konflikt lade den Kontext genau einmal neu; bei Authentifizierungs-, Schema-, Speicher- oder wiederholtem Konfliktfehler stoppe die strukturierte Arbeit transparent."));
        switch (interactionMode) {
            case "orientation" -> policies.addAll(List.of(
                    "Orientierungsmodus: Zeige zwei bis vier konkrete, altersgerechte Möglichkeiten und ehrliche positive Perspektiven, die der nachfolgende Stoff für Alltag, Interessen, gesellschaftliche Teilhabe, Studium oder Beruf eröffnet. Bleibe beim Überblick und knüpfe nur an tatsächlich bekannten Kontext an.",
                    "Prüfe weder Vorwissen noch Begriffe, Rechenverfahren oder anderes inhaltliches Detailwissen. Stelle keine Wissens-, Übungs-, Transfer-, Recall- oder Prüfungsaufgabe, fordere keinen Feynman-Teach-back und bewerte keine Antwort fachlich als richtig oder falsch.",
                    "Lade nach der kurzen Orientierung zu einer niedrigschwelligen Reaktion ein, etwa welche Möglichkeit neugierig macht oder ob die lernende Person weitergehen möchte. Speichere den Orientierungsabschluss erst nach einer sichtbaren Reaktion, Interessenäußerung oder ausdrücklichen Weiterbereitschaft. Dieser Abschluss belegt nur die erlebte Orientierung, niemals fachliche Kompetenz; nenne ihn nicht fachlich gemeistert."));
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
            case "selection" -> {
                policies.add(
                        "Behandle einen natürlichen Mehrfachwunsch als fortgeltende Absicht. Wende jeden eindeutig bestimmten frischen Schritt direkt an und frage nur die tatsächlich offene Auswahl. Kandidaten sind noch keine aktiven Ziele.");
                if (orientation != null) {
                    policies.add(
                            "Nenne zuerst knapp den bestätigten Einstiegskontext. Frage danach alle als noch offen "
                                    + "aufgeführten Angaben gemeinsam ab. Die lernende Person darf mehrere Angaben "
                                    + "in beliebiger Reihenfolge oder nur einen Teil davon nennen. Merke eindeutige "
                                    + "Angaben als fortgeltende Absicht; speichere trotzdem nur die aktuelle "
                                    + "veröffentlichte Option und lade vor jedem weiteren Schritt den frischen Kontext.");
                }
            }
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
            OpenAiDeCoachContext.Decision decision,
            OpenAiDeCoachContext.Orientation orientation,
            OpenAiDeCoachContext.Completion completion,
            boolean examHasImage,
            String communicationLocale) {
        if (OpenAiCoachLocale.isEnglish(communicationLocale)) {
            return englishInstruction(
                    requiredAction,
                    goal,
                    options,
                    decision,
                    orientation,
                    completion,
                    examHasImage);
        }
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
                    + OpenAiDeV1McpContractAdapter.GET_EXAM_EVALUATION
                    + " die freigegebene Bewertungsgrundlage und bewerte abschließend.";
        }
        if (isMemoryGoal(goal)) {
            return "Verified Recall: Starte die Abrufprüfung für das bestätigte aktive Merkziel, zeige den ganzen "
                    + "Fragenbatch und warte auf alle Antworten. Lade Sollantworten erst danach, speichere jedes "
                    + "Kartenergebnis und beginne erst nach vollständiger Speicherung den nächsten Batch.";
        }
        if (isOrientationGoal(goal)) {
            return "Motivierende Orientierung: Zeige anhand des aktiven Ziels zwei bis vier verständliche "
                    + "Möglichkeiten und positive, realistische Perspektiven des folgenden Stoffes. Frage danach "
                    + "nur niedrigschwellig, was neugierig macht oder ob die lernende Person weiterlernen möchte. "
                    + "Prüfe kein Vorwissen oder Detailwissen und bewerte keine Antwort als richtig oder falsch. "
                    + "Speichere den Orientierungsabschluss erst nach einer sichtbaren Reaktion, "
                    + "Interessenäußerung oder ausdrücklichen Weiterbereitschaft; er bescheinigt keine "
                    + "Fachkompetenz.";
        }
        if (blank(requiredAction)) {
            return "Es ist keine weitere Backend-Aktion erforderlich. Lade bei Zweifel den aktuellen Kontext neu.";
        }
        return switch (requiredAction) {
            case "setPersonalization" -> personalizationInstruction(
                    decision,
                    options,
                    orientation,
                    communicationLocale);
            case "setCurriculum", "setScope", "setActiveGoal", "chooseMemoryMode" ->
                    options.isEmpty()
                            ? "Für den erforderlichen Schritt sind keine sicheren Optionen vorhanden. Lade den Kontext neu."
                            : "Behandle einen natürlichen Mehrfachwunsch in diesem Assistententurn als fortgeltende Absicht. "
                                    + "Wende einen fachlich eindeutigen Treffer direkt an, lade den Folgezustand und frage "
                                    + "nur eine tatsächlich offene Auswahl nach.";
            case "orientActiveGoal" ->
                    "Führe die motivierende Orientierung ohne fachliche Prüfung durch und speichere den "
                            + "Orientierungsabschluss erst nach einer sichtbaren Reaktion oder ausdrücklichen "
                            + "Weiterbereitschaft; behaupte dabei keine fachliche Mastery.";
            case "teachActiveGoal", "setMastery" ->
                    "Arbeite dialogisch am aktiven Lernziel. Anerkenne fachlich gleichwertige korrekte Lösungswege, "
                            + "Darstellungen und Begründungen; ausdrücklich verlangte Formate bleiben verbindlich. "
                            + "Speichere Mastery erst nach zwei unabhängigen Checks oder echtem Transfer in einem "
                            + "veränderten Kontext und nachdem alle Aspekte des Ziels geprüft sind.";
            default -> "Folge ausschließlich der angezeigten erforderlichen Aktion und lade danach den Kontext neu.";
        };
    }

    private List<String> englishPolicies(
            String interactionMode,
            boolean examHasImage,
            OpenAiDeCoachContext.Orientation orientation) {
        List<String> policies = new ArrayList<>(List.of(
                "The newest SkillPilot context is the sole authority. Never invent goals, options, states, progress values, or workflows.",
                "Do not mention tool, API, JSON, or field names or technical IDs in visible answers. Never request or expose OAuth tokens or the permanent SkillPilot ID.",
                "Use only backend-provided URLs and reproduce them verbatim. Never construct links from IDs or append tokens or SkillPilot IDs. If no approved link is available, do not output a link.",
                "Write mathematics only with \\(...\\) inline and \\[...\\] displayed; never use dollar delimiters.",
                "Report progress only from the freshly returned progress data and begin with the current learning scope. Mention broader values only when asked and never estimate them.",
                "Claim a state change only after confirmed backend success. After a conflict, reload exactly once; after authentication, schema, persistence, or repeated conflict failures, stop structured work transparently."));
        switch (interactionMode) {
            case "orientation" -> policies.addAll(List.of(
                    "Orientation mode: show two to four concrete, age-appropriate possibilities and honest positive perspectives that the material ahead opens for everyday life, interests, participation, study, or work. Stay at overview level and use only known context.",
                    "Do not test prior knowledge, terminology, procedures, or other content details. Do not set knowledge, practice, transfer, recall, or exam tasks, require Feynman teach-back, or assess an answer as technically right or wrong.",
                    "After the short orientation, invite a low-threshold response about what sparks curiosity or whether the learner wants to continue. Save completion only after a visible response, expression of interest, or explicit willingness to continue. This marks experienced orientation, never subject mastery."));
            case "chat" -> policies.addAll(List.of(
                    "Coach dialogically on exactly one confirmed atomic goal: briefly check prior knowledge, give small hints, let the learner work, distinguish conceptual from careless errors, and never reveal the immediate next solution.",
                    "Assess technical meaning rather than wording. Reconstruct unusual approaches fairly and correct only genuinely false or unsupported steps; explicitly required formats and content remain binding.",
                    "Save mastery only after two independent checks, such as explanation plus a new application, or genuine multi-step transfer in a changed context. Check all parts; self-assessment, repetition, and the same worked case are insufficient. Never manually master clusters or memorisation goals."));
            case "exam" -> policies.addAll(List.of(
                    "Exam mode: reproduce the task verbatim except for replacing dollar TeX delimiters. Give no hints, partial answers, solutions, scaffolds, or follow-up questions during the exam.",
                    "Load the solution and rubric only after a complete visible submission. Assess only visible work criterion by criterion; the sample solution does not prescribe wording. Equivalent approaches, representations, rounding, and justifications receive full credit unless the task requires something specific.",
                    "Assign every point deduction concretely. Do not infer a subject error from unreadable work. Save mastery only after a final pass with at least the published passing score."));
            case "verifiedRecall" -> policies.addAll(List.of(
                    "Verified Recall: show the complete question batch in order and wait for all answers. Load each expected answer only after the corresponding learner answer.",
                    "Compare technical meaning and accept equivalent wording. Save every card immediately; passed=true only for a correct answer without help. Save the full batch before the next one, check a card at most once per day, and save no additional manual mastery."));
            case "selection" -> {
                policies.add("Treat a natural multi-part request as continuing intent. Apply each unambiguous fresh step directly and ask only for the selection that remains open. Candidates are not yet active goals.");
                if (orientation != null) {
                    policies.add("First state the confirmed entry context briefly. Then ask together for all information listed as open. Accept multiple answers in any order or a partial answer. Retain unambiguous values as continuing intent, but save only the current published option and reload before every further step.");
                }
            }
            case "complete" -> policies.add("Report only fresh progress values and begin with the current learning scope. Briefly acknowledge completion and offer only provided follow-up options; invent no new goals.");
            default -> {
                // Common safety and recovery policies apply in every mode.
            }
        }
        if ("exam".equals(interactionMode) && examHasImage) {
            policies.add("This exam task needs an image that is not transmitted in the MCP context. Before the task, provide activeGoal.cockpitUrl verbatim, briefly state that the image must be viewed there, and do not invent or describe an image.");
        }
        return List.copyOf(policies);
    }

    private String englishInstruction(
            String requiredAction,
            FrontierGoal goal,
            List<OpenAiDeCoachContext.Option> options,
            OpenAiDeCoachContext.Decision decision,
            OpenAiDeCoachContext.Orientation orientation,
            OpenAiDeCoachContext.Completion completion,
            boolean examHasImage) {
        if (goal == null && completion.curriculumComplete()) {
            return "The personalised curriculum is complete. Congratulate briefly, report only freshly returned progress, and invent no further learning goal.";
        }
        if ("chooseMemoryMode".equals(requiredAction) && !options.isEmpty()) {
            return "Ask about learning mode only when the request is not already unambiguous. For openCockpitPractice, provide only the backend cockpitUrl verbatim and pause structured card recall. For startVerifiedRecall, start strict recall, show the full question batch, and wait for all answers.";
        }
        if (isExamGoal(goal)) {
            String imageInstruction = examHasImage
                    ? "The required task image is available only in the cockpit. First provide activeGoal.cockpitUrl verbatim and ask the learner to view it there. "
                    : "";
            return "Exam mode: " + imageInstruction
                    + "Reproduce taskContent verbatim except for replacing dollar TeX delimiters. Give no solution-leading hints or follow-up questions. Wait for a complete visible submission, then load the approved evaluation with "
                    + OpenAiDeV1McpContractAdapter.GET_EXAM_EVALUATION
                    + " and complete the assessment.";
        }
        if (isMemoryGoal(goal)) {
            return "Verified Recall: start recall for the confirmed active memorisation goal, show the full question batch, and wait for all answers. Load expected answers only afterwards, save every card result, and start the next batch only after complete persistence.";
        }
        if (isOrientationGoal(goal)) {
            return "Motivating orientation: use the active goal to show two to four understandable possibilities and positive, realistic perspectives of the material ahead. Ask only what sparks curiosity or whether the learner wants to continue. Do not test prior knowledge or details or assess answers as right or wrong. Save completion only after a visible response, expression of interest, or explicit willingness to continue; it certifies no subject mastery.";
        }
        if (blank(requiredAction)) {
            return "No further backend action is required. Reload the current context if uncertain.";
        }
        return switch (requiredAction) {
            case "setPersonalization" -> personalizationInstruction(decision, options, orientation, "en");
            case "setCurriculum", "setScope", "setActiveGoal", "chooseMemoryMode" ->
                    options.isEmpty()
                            ? "No safe options are available for the required step. Reload the context."
                            : "Treat a natural multi-part request as continuing intent. Apply an unambiguous subject match directly, load the successor state, and ask only for a selection that remains genuinely open.";
            case "orientActiveGoal" -> "Give motivating orientation without subject assessment and save completion only after a visible response or explicit willingness to continue; do not claim subject mastery.";
            case "teachActiveGoal", "setMastery" -> "Coach dialogically on the active goal. Accept technically equivalent correct approaches, representations, and justifications; explicit format requirements remain binding. Save mastery only after two independent checks or genuine transfer in a changed context and after checking every aspect.";
            default -> "Follow only the published required action, then reload the context.";
        };
    }

    public String personalizationInstruction(
            OpenAiDeCoachContext.Decision decision,
            List<OpenAiDeCoachContext.Option> options,
            OpenAiDeCoachContext.Orientation orientation,
            String communicationLocale) {
        if (OpenAiCoachLocale.isEnglish(communicationLocale)) {
            return englishPersonalizationInstruction(decision, options, orientation);
        }
        if (decision == null || options == null || options.isEmpty()) {
            return "Für die erforderliche Personalisierungsentscheidung fehlen sichere, vollständig beschriebene "
                    + "Optionen. Lade den Kontext neu und erfinde weder die offene Frage noch mögliche Antworten.";
        }

        int minimum = decision.minSelections();
        int maximum = decision.maxSelections();
        int selected = decision.selectedCount();
        String cardinality;
        if (minimum == 0 && maximum == 0) {
            cardinality = "Keine weitere Auswahl ist vorgesehen";
        } else if (minimum == 0) {
            cardinality = maximum == 1
                    ? "Höchstens eine Auswahl ist möglich"
                    : "Höchstens " + maximum + " Auswahlen sind möglich";
        } else if (minimum == maximum) {
            cardinality = minimum == 1
                    ? "Genau eine Auswahl ist erforderlich"
                    : "Genau " + minimum + " Auswahlen sind erforderlich";
        } else {
            cardinality = "Mindestens " + minimum + " und höchstens " + maximum
                    + " Auswahlen sind vorgesehen";
        }

        String progress;
        if (selected < minimum) {
            int remaining = minimum - selected;
            progress = remaining == 1
                    ? "Es fehlt noch mindestens eine Auswahl."
                    : "Es fehlen noch mindestens " + remaining + " Auswahlen.";
        } else if (selected < maximum) {
            progress = "Das Minimum ist erfüllt. Weitere veröffentlichte Optionen dürfen gewählt werden. Falls eine "
                    + "Abschlussoption angeboten wird, darf die Auswahl stattdessen beendet werden.";
        } else {
            progress = "Die Höchstzahl ist erreicht; wähle keine weitere Option. Falls eine Abschlussoption "
                    + "angeboten wird, verwende jetzt ausschließlich diese.";
        }

        String orientationInstruction = orientation == null
                ? ""
                : "Beginne die sichtbare Antwort mit dem in der Orientierung bestätigten Einstiegskontext. Frage "
                        + "anschließend alle dort als noch offen aufgeführten Angaben gemeinsam und natürlich "
                        + "formuliert ab, statt sie in einer festen Reihenfolge einzeln zu stellen. Akzeptiere mehrere "
                        + "Angaben in beliebiger Reihenfolge oder eine Teilantwort und behalte jeden eindeutigen Wert "
                        + "als fortgeltende Absicht. ";
        return orientationInstruction
                + "Die aktuell ausführbare Auswahlfrage im Entscheidungsschritt „" + decision.stageLabel()
                + "“ lautet „" + decision.groupLabel() + "“. " + cardinality + "; bisher ausgewählt: " + selected
                + ". " + progress + " Übernimm ausschließlich eine aktuell veröffentlichte Options-ID unverändert. "
                + "Nach jeder erfolgreichen Auswahl lade den Kontext neu und wende erst dann einen weiteren "
                + "eindeutigen Teil der fortgeltenden Absicht an. Später aufgeführte Fragen dienen nur der "
                + "Orientierung und autorisieren keine vorgezogene Mutation. Frage nach der Verarbeitung eindeutiger "
                + "Angaben nur noch tatsächlich ungeklärte Punkte nach.";
    }

    private String englishPersonalizationInstruction(
            OpenAiDeCoachContext.Decision decision,
            List<OpenAiDeCoachContext.Option> options,
            OpenAiDeCoachContext.Orientation orientation) {
        if (decision == null || options == null || options.isEmpty()) {
            return "No safe, fully described options are available for the required personalisation decision. "
                    + "Reload the context and invent neither the open question nor possible answers.";
        }

        int minimum = decision.minSelections();
        int maximum = decision.maxSelections();
        int selected = decision.selectedCount();
        String cardinality;
        if (minimum == 0 && maximum == 0) {
            cardinality = "No further selection is expected";
        } else if (minimum == 0) {
            cardinality = maximum == 1
                    ? "At most one selection is allowed"
                    : "At most " + maximum + " selections are allowed";
        } else if (minimum == maximum) {
            cardinality = minimum == 1
                    ? "Exactly one selection is required"
                    : "Exactly " + minimum + " selections are required";
        } else {
            cardinality = "At least " + minimum + " and at most " + maximum
                    + " selections are expected";
        }

        String progress;
        if (selected < minimum) {
            int remaining = minimum - selected;
            progress = remaining == 1
                    ? "At least one selection is still missing."
                    : "At least " + remaining + " selections are still missing.";
        } else if (selected < maximum) {
            progress = "The minimum is satisfied. Further published options may be selected, or use a published "
                    + "completion option to finish the selection.";
        } else {
            progress = "The maximum has been reached; select no further option. If a completion option is "
                    + "available, use only that option now.";
        }

        String orientationInstruction = orientation == null
                ? ""
                : "Begin the visible answer with the confirmed entry context from the orientation. Then ask "
                        + "naturally and together for all information listed there as open, instead of asking in a "
                        + "fixed sequence. Accept multiple values in any order or a partial answer and retain every "
                        + "unambiguous value as continuing intent. ";
        return orientationInstruction
                + "The currently executable selection question in decision step \"" + decision.stageLabel()
                + "\" is \"" + decision.groupLabel() + "\". " + cardinality + "; selected so far: " + selected
                + ". " + progress + " Submit only a currently published option ID unchanged. After every successful "
                + "selection, reload the context before applying another unambiguous part of the continuing intent. "
                + "Questions listed for later steps provide orientation only and do not authorize an early mutation. "
                + "After processing unambiguous values, ask only about points that genuinely remain unresolved.";
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

    private boolean isOrientationGoal(FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        if (!blank(goal.semanticKind())) {
            return "orientation".equalsIgnoreCase(goal.semanticKind().trim());
        }
        return goal.tags() != null && goal.tags().stream()
                .filter(tag -> tag != null)
                .map(String::trim)
                .anyMatch(tag -> "Orientation".equalsIgnoreCase(tag)
                        || "Motivation".equalsIgnoreCase(tag));
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
        return compact(value, 320);
    }

    private String compact(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String normalized = value.replaceAll("\\s+", " ").trim();
        return normalized.length() <= maxLength
                ? normalized
                : normalized.substring(0, maxLength - 3) + "...";
    }

    private String fallback(String value, String fallback) {
        return blank(value) ? fallback : value;
    }

    private String text(String communicationLocale, String german, String english) {
        return OpenAiCoachLocale.localized(communicationLocale, german, english);
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value;
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }
}
