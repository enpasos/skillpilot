package com.skillpilot.backend.ai;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.ExamTaskReadiness;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Builds a provider-neutral, AI-safe projection of learner state.
 *
 * <p>The projection rewrites public resource URLs and chat math delimiters,
 * removes exam solutions from selectable goals, and only exposes an active
 * exam payload after it passes the release/readiness checks. Provider adapters
 * may compact or render the projected state further, but must not bypass this
 * safety boundary.
 */
@Component
public final class CoachStateProjection {

    /** Retained work is not evidence of a start of the current fixed task. */
    public static boolean requiresAssessmentStartConfirmation(UnifiedLearnerStateResponse state) {
        StateMachineInfo machine = state == null ? null : state.stateMachine();
        FrontierGoal active = state == null ? null : state.activeGoal();
        return machine != null && "setActiveGoal".equals(machine.requiredAction()) && active != null
                && machine.activeGoal() != null && active.id().equals(machine.activeGoal().id())
                && (active.examData() != null || "exam".equalsIgnoreCase(active.nodeKind())
                    || "practiceAssessment".equalsIgnoreCase(active.semanticKind())
                    || "assessment".equalsIgnoreCase(active.semanticKind()));
    }

    public static String assessmentStartConfirmationInstruction(String language) {
        return english(language)
                ? "The current assessment task has not been explicitly started in its present form. Preserve the learner's existing work. Ask once whether they want to begin or continue this complete task. Only after their explicit agreement, select the same published goal with setActiveGoal; a sole option, autopilot or an evaluation/mastery request is not agreement. If no choice is published, do not invent availability. Do not teach new content, obtain evaluation data or record success before confirmation. A prior valid mastery remains valid; this is no new task or second pass."
                : "Die aktuelle Prüfungsaufgabe wurde in ihrer jetzigen Fassung noch nicht ausdrücklich begonnen. Bewahre die bisherige Arbeit. Frage einmal, ob die Person diese ganze Aufgabe beginnen oder fortsetzen möchte. Wähle erst nach ausdrücklicher Zustimmung dasselbe angebotene Ziel mit setActiveGoal; eine einzige Option, Autopilot oder ein Bewertungs-/Masteryauftrag ist keine Zustimmung. Ohne angebotene Wahl keine Verfügbarkeit erfinden. Vor der Bestätigung keinen neuen Inhalt beginnen, Bewertungsdaten laden oder Erfolg speichern. Vorhandene gültige Mastery bleibt gültig; dies ist keine neue Aufgabe und kein zweiter Pass.";
    }

    /** Presentation of an explicit ordinary choice; never a completion or authorization decision. */
    public static boolean isVoluntaryLearningChoice(UnifiedLearnerStateResponse state) {
        StateMachineInfo machine = state == null ? null : state.stateMachine();
        return machine != null && "setActiveGoal".equals(machine.requiredAction())
                && machine.activeGoal() == null && state.activeGoal() == null
                && state.frontier() != null && state.frontier().isEmpty()
                && machine.goalOptions() != null && !machine.goalOptions().isEmpty()
                && state.levelCompletion() != null
                && "invalid".equals(state.levelCompletion().calculationStatus())
                && "completion_target_routes_uncovered".equals(state.levelCompletion().notice());
    }

    public static String voluntaryChoiceDescription(String description, String language) {
        return (english(language)
                ? "Optional learning choice; the remaining required work cannot currently be calculated reliably. "
                : "Freiwillige Lernwahl; der verbleibende Pflichtbedarf lässt sich derzeit nicht sicher berechnen. ")
                + (description == null ? "" : description);
    }

    public static String voluntaryChoiceInstruction(String language) {
        return english(language)
                ? "These are voluntary learning choices, not calculated required work. Automatic completion is invalid and supplies no implicit credit. "
                    + "Honor an explicit already stated request for a currently offered goal. Otherwise present the optional choice and wait. "
                    + "Never select a goal merely because it is first or unique, the required frontier is empty, or autopilot is enabled. "
                    + "Do not widen the focus, continue a plan, or claim completion from this choice."
                : "Dies sind freiwillige Lernmöglichkeiten, kein berechneter Pflichtbedarf. Die automatische Erledigungsberechnung ist ungültig und liefert keine implizite Gutschrift. "
                    + "Ein bereits ausdrücklich genannter Wunsch nach einem aktuell angebotenen Lernziel gilt weiter. Andernfalls zeige die freiwillige Auswahl und warte. "
                    + "Wähle kein Ziel allein deshalb, weil es zuerst steht oder die einzige Option ist, die Pflichtfrontier leer ist oder Autopilot aktiv ist. "
                    + "Erweitere dadurch keinen Fokus, setze keinen Plan fort und behaupte keinen Abschluss.";
    }

    public static String completionCalculationWarning(UnifiedLearnerStateResponse state, String language) {
        if (state != null && state.levelCompletion() != null
                && "valid".equals(state.levelCompletion().calculationStatus())
                && "completion_target_routes_uncovered".equals(state.levelCompletion().notice())) {
            return english(language)
                    ? "The curriculum's completion routes have a quality defect; infer no required work or implicit credit from them. A stored route choice is not a new determination of required work. Known explicit successes remain valid. "
                    : "Die curricularen Abschlussrouten haben einen Qualitätsfehler; leite daraus keinen Pflichtbedarf und keine implizite Gutschrift ab. Eine gespeicherte Routenauswahl ist kein neuer Pflichtnachweis. Bekannte ausdrückliche Erfolge bleiben gültig. ";
        }
        if (state == null || state.levelCompletion() == null
                || !"invalid".equals(state.levelCompletion().calculationStatus())
                    && !"unavailable".equals(state.levelCompletion().calculationStatus())) return "";
        return english(language)
                ? "Automatic completion cannot currently be calculated reliably; infer no required work or implicit credit from it. Known explicit results remain valid. "
                : "Die automatische Erledigung lässt sich derzeit nicht verlässlich berechnen; leite daraus keinen Pflichtbedarf und keine implizite Gutschrift ab. Bekannte ausdrückliche Erfolge bleiben gültig. ";
    }

    private static boolean english(String language) {
        return language != null && language.toLowerCase(Locale.ROOT).startsWith("en");
    }


    private final String assetBase;

    public CoachStateProjection(
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl) {
        this.assetBase = publicBaseUrl.replaceAll("/+$", "") + "/ai-assets";
    }

    public UnifiedLearnerStateResponse project(UnifiedLearnerStateResponse state) {
        if (state == null) {
            return null;
        }
        StateMachineInfo stateMachine = state.stateMachine();
        FrontierGoal activeGoal = prepareActiveGoal(state.activeGoal());
        List<FrontierGoal> frontier = prepareSelectableGoals(filterFrontier(
                rewriteGoals(state.frontier()),
                stateMachine));
        LearnerGoals goals = rewriteLearnerGoals(state.goals());
        FrontierGoal stateMachineActiveGoal = stateMachine == null
                ? null
                : prepareActiveGoal(stateMachine.activeGoal());
        StateMachineInfo preparedStateMachine = stateMachine == null
                ? null
                : new StateMachineInfo(
                        stateMachine.state(),
                        stateMachine.requiredAction(),
                        prepareSelectableGoals(rewriteGoals(stateMachine.goalOptions())),
                        stateMachine.curriculumOptions(),
                        stateMachineActiveGoal,
                        stateMachine.modeOptions());

        return new UnifiedLearnerStateResponse(
                null,
                state.curriculum(),
                frontier,
                goals,
                state.nextAllowedActions(),
                state.activeFilters(),
                Set.of(),
                state.learningState(),
                activeGoal,
                preparedStateMachine,
                state.levelCompletion());
    }

    public MasteryUpdateResponse project(MasteryUpdateResponse update) {
        if (update == null) {
            return null;
        }
        UnifiedLearnerStateResponse projected = project(new UnifiedLearnerStateResponse(
                null,
                null,
                update.frontier(),
                update.goals(),
                update.nextAllowedActions(),
                List.of(),
                Set.of(),
                update.learningState(),
                update.activeGoal(),
                update.stateMachine(),
                update.levelCompletion()));
        return new MasteryUpdateResponse(
                update.saved(),
                update.savedGoalId(),
                update.savedMastery(),
                projected.frontier(),
                projected.nextAllowedActions(),
                projected.learningState(),
                projected.activeGoal(),
                projected.stateMachine(),
                projected.goals(),
                projected.levelCompletion());
    }

    public List<FrontierGoal> projectNavigationGoals(List<FrontierGoal> goals) {
        return prepareSelectableGoals(rewriteGoals(goals));
    }

    public boolean isExamReadyForHardCheck(FrontierGoal goal) {
        return goal != null && isExamDataReadyForHardCheck(goal.examData());
    }

    /**
     * Normalizes already-authorized evaluation content for an AI provider.
     * Callers remain responsible for enforcing the evaluation workflow before
     * passing protected solution content to this method.
     */
    public String projectReleasedEvaluationContent(String content) {
        return normalizeMathDelimitersForChat(rewriteAssetLinks(content));
    }

    private FrontierGoal prepareActiveGoal(FrontierGoal goal) {
        FrontierGoal rewritten = rewriteGoal(goal);
        if (rewritten == null || rewritten.examData() == null) {
            return rewritten;
        }
        if (isExamDataReadyForHardCheck(rewritten.examData())) {
            return withExamData(rewritten, taskOnlyExamData(rewritten.examData()));
        }
        return withExamData(rewritten, null);
    }

    private FrontierGoal withExamData(FrontierGoal goal, ExamData examData) {
        return new FrontierGoal(
                goal.id(),
                goal.title(),
                goal.description(),
                goal.type(),
                "exam",
                goal.semanticKind(),
                goal.reason(),
                goal.tags(),
                goal.resourceLinks(),
                goal.sourceRef(),
                goal.sourceLicense(),
                goal.sourceLicenseUrl(),
                examData,
                goal.examReadyForSelection(),
                goal.selectionGoalIds());
    }

    private ExamData taskOnlyExamData(ExamData exam) {
        ExamData projected = new ExamData();
        projected.setTaskContent(exam.getTaskContent());
        projected.setTaskContentEn(exam.getTaskContentEn());
        if (exam.getScoring() != null && exam.getScoring().getMaxPoints() > 0) {
            TaskOnlyScoring scoring = new TaskOnlyScoring();
            scoring.setMaxPoints(exam.getScoring().getMaxPoints());
            projected.setScoring(scoring);
        }
        return projected;
    }

    private LearnerGoals rewriteLearnerGoals(LearnerGoals goals) {
        if (goals == null) {
            return null;
        }
        return new LearnerGoals(
                stripExamData(rewriteGoals(goals.planned())),
                goals.mastered_count(),
                goals.total_count(),
                goals.personalized(),
                goals.scope(),
                goals.scope_completed());
    }

    private List<FrontierGoal> rewriteGoals(List<FrontierGoal> goals) {
        if (goals == null || goals.isEmpty()) {
            return goals;
        }
        return goals.stream().map(this::rewriteGoal).toList();
    }

    private List<FrontierGoal> stripExamData(List<FrontierGoal> goals) {
        if (goals == null || goals.isEmpty()) {
            return goals;
        }
        return goals.stream().map(this::stripExamData).toList();
    }

    private List<FrontierGoal> prepareSelectableGoals(List<FrontierGoal> goals) {
        if (goals == null || goals.isEmpty()) {
            return goals;
        }
        return goals.stream()
                .filter(this::isSelectableGoalReady)
                .map(this::stripExamData)
                .toList();
    }

    private boolean isSelectableGoalReady(FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        boolean exam = "exam".equals(goal.nodeKind()) || goal.examData() != null;
        if (!exam) {
            return true;
        }
        return goal.examData() == null
                ? goal.examReadyForSelection()
                : isExamDataReadyForHardCheck(goal.examData());
    }

    private FrontierGoal stripExamData(FrontierGoal goal) {
        if (goal == null || goal.examData() == null) {
            return goal;
        }
        return new FrontierGoal(
                goal.id(),
                normalizeMathDelimitersForChat(goal.title()),
                normalizeMathDelimitersForChat(goal.description()),
                goal.type(),
                goal.nodeKind(),
                goal.semanticKind(),
                goal.reason(),
                goal.tags(),
                goal.resourceLinks(),
                goal.sourceRef(),
                goal.sourceLicense(),
                goal.sourceLicenseUrl(),
                null,
                goal.examReadyForSelection(),
                goal.selectionGoalIds());
    }

    private List<FrontierGoal> filterFrontier(List<FrontierGoal> frontier, StateMachineInfo stateMachine) {
        if (frontier == null || frontier.isEmpty() || stateMachine == null
                || !"setActiveGoal".equals(stateMachine.requiredAction())) {
            return frontier;
        }
        List<FrontierGoal> atomic = frontier.stream()
                .filter(goal -> "atomic".equals(goal.type()))
                .toList();
        return atomic.isEmpty() ? frontier : atomic;
    }

    private FrontierGoal rewriteGoal(FrontierGoal goal) {
        if (goal == null) {
            return null;
        }
        List<GoalSourceLink> resourceLinks = rewriteResourceLinks(goal.resourceLinks());
        // Teaching visualizations can contain worked solutions. Assessment task
        // media stay in examData/IMAGE_PATH and keep their existing transport.
        if (isAssessmentExecution(goal) && resourceLinks != null) {
            resourceLinks = resourceLinks.stream().filter(link -> link == null
                    || !("goal-visualization".equals(link.type())
                        || "goal-visualization".equals(link.resourceType()))).toList();
        }

        ExamData rewrittenExam = null;
        if (goal.examData() != null) {
            ExamData exam = goal.examData();
            rewrittenExam = new ExamData();
            rewrittenExam.setReviewStatus(exam.getReviewStatus());
            rewrittenExam.setCoveredGoalIds(exam.getCoveredGoalIds());
            rewrittenExam.setCoveredStrands(exam.getCoveredStrands());
            rewrittenExam.setDemandLevels(exam.getDemandLevels());
            rewrittenExam.setSourceArtifactPath(exam.getSourceArtifactPath());
            rewrittenExam.setTaskContent(normalizeTaskContentForAi(
                    goal.id(), rewriteAssetLinks(exam.getTaskContent())));
            rewrittenExam.setTaskContentEn(normalizeTaskContentForAi(
                    goal.id(), rewriteAssetLinks(exam.getTaskContentEn())));
            rewrittenExam.setSolutionContent(normalizeMathDelimitersForChat(
                    rewriteAssetLinks(exam.getSolutionContent())));
            rewrittenExam.setSolutionContentEn(normalizeMathDelimitersForChat(
                    rewriteAssetLinks(exam.getSolutionContentEn())));
            rewrittenExam.setScoring(exam.getScoring());
        }
        return new FrontierGoal(
                goal.id(),
                normalizeMathDelimitersForChat(goal.title()),
                normalizeMathDelimitersForChat(goal.description()),
                goal.type(),
                goal.nodeKind(),
                goal.semanticKind(),
                goal.reason(),
                goal.tags(),
                resourceLinks,
                goal.sourceRef(),
                goal.sourceLicense(),
                goal.sourceLicenseUrl(),
                rewrittenExam,
                goal.examReadyForSelection(),
                goal.selectionGoalIds());
    }

    // Keep the same supported assessment encodings as CompletionProfileCompiler.isAssessment.
    private boolean isAssessmentExecution(FrontierGoal goal) {
        return goal != null && ("exam".equalsIgnoreCase(goal.nodeKind()) || goal.examData() != null
                || "practiceAssessment".equalsIgnoreCase(goal.semanticKind())
                || "assessment".equalsIgnoreCase(goal.semanticKind()));
    }

    private List<GoalSourceLink> rewriteResourceLinks(List<GoalSourceLink> links) {
        if (links == null || links.isEmpty()) {
            return links;
        }
        return links.stream()
                .map(link -> isGoalVisualizationImage(link) ? link : rewriteResourceLink(link))
                .toList();
    }

    private GoalSourceLink rewriteResourceLink(GoalSourceLink link) {
        if (link == null) {
            return null;
        }
        return new GoalSourceLink(
                link.type(),
                link.title(),
                rewriteResourceLinkUrl(link.url()),
                link.resourceType(),
                link.provider(),
                link.sections(),
                link.description(),
                link.lang(),
                link.license(),
                link.skillpilotId(),
                link.role(),
                link.altText(),
                link.reviewStatus());
    }

    private boolean isGoalVisualizationImage(GoalSourceLink link) {
        return link != null
                && "goal-visualization".equals(link.type())
                && "image".equals(link.resourceType());
    }

    private String rewriteResourceLinkUrl(String url) {
        if (url == null || url.isBlank()) {
            return url;
        }
        String trimmed = url.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        String baseUrl = assetBase.replaceAll("/ai-assets$", "");
        if (trimmed.startsWith("/assets/")) {
            return assetBase + trimmed.substring("/assets".length());
        }
        if (trimmed.startsWith("/ai-assets/")) {
            return baseUrl + trimmed;
        }
        if (trimmed.startsWith("/")) {
            return baseUrl + trimmed;
        }
        return trimmed;
    }

    private boolean isExamDataReadyForHardCheck(ExamData exam) {
        return ExamTaskReadiness.isReady(exam);
    }

    private String rewriteAssetLinks(String content) {
        if (content == null || content.isBlank()) {
            return content;
        }
        Pattern pattern = Pattern.compile("\\((/assets/[^)]+)\\)");
        Matcher matcher = pattern.matcher(content);
        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            String path = matcher.group(1);
            String normalized = path.startsWith("/assets/") ? path.substring("/assets".length()) : path;
            matcher.appendReplacement(result, Matcher.quoteReplacement("(" + assetBase + normalized + ")"));
        }
        matcher.appendTail(result);
        return result.toString();
    }

    private String normalizeTaskContentForAi(String goalId, String content) {
        return TaskImageTransport.normalize(goalId, content, this::normalizeMathDelimitersForChat);
    }

    private String normalizeMathDelimitersForChat(String content) {
        if (content == null || content.isBlank()) {
            return content;
        }
        Matcher displayMatcher = Pattern.compile("(?s)\\$\\$(.+?)\\$\\$").matcher(content);
        StringBuffer displayResult = new StringBuffer();
        while (displayMatcher.find()) {
            String replacement = "\\[\n" + displayMatcher.group(1).trim() + "\n\\]";
            displayMatcher.appendReplacement(displayResult, Matcher.quoteReplacement(replacement));
        }
        displayMatcher.appendTail(displayResult);

        Matcher inlineMatcher = Pattern.compile("(?<!\\\\)\\$(?!\\$)([^$\\n]+?)(?<!\\\\)\\$")
                .matcher(displayResult.toString());
        StringBuffer inlineResult = new StringBuffer();
        while (inlineMatcher.find()) {
            String replacement = "\\(" + inlineMatcher.group(1).trim() + "\\)";
            inlineMatcher.appendReplacement(inlineResult, Matcher.quoteReplacement(replacement));
        }
        inlineMatcher.appendTail(inlineResult);
        return inlineResult.toString();
    }


    /**
     * Keeps the non-sensitive maximum score available to provider renderers
     * while preventing Jackson from serializing evaluation thresholds or the
     * scoring rubric as part of normal coach state.
     */
    private static final class TaskOnlyScoring extends ExamData.Scoring {

        @Override
        @JsonIgnore
        public double getPassingPoints() {
            return 0;
        }

        @Override
        @JsonIgnore
        public List<ExamData.Step> getSteps() {
            return null;
        }
    }
}
