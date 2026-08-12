package com.skillpilot.backend.ai;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.ExamData;
import java.net.URI;
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

    private static final String IMAGE_PATH_PREFIX = "IMAGE_PATH: ";

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
                preparedStateMachine);
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
                update.stateMachine()));
        return new MasteryUpdateResponse(
                update.saved(),
                update.savedGoalId(),
                update.savedMastery(),
                projected.frontier(),
                projected.nextAllowedActions(),
                projected.learningState(),
                projected.activeGoal(),
                projected.stateMachine(),
                projected.goals());
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
        if (exam == null || hasBlockingReviewStatus(exam.getReviewStatus()) || containsPlaceholderExamText(exam)) {
            return false;
        }
        return hasScoringStructure(exam)
                && exam.getTaskContent() != null
                && !exam.getTaskContent().isBlank()
                && exam.getSolutionContent() != null
                && !exam.getSolutionContent().isBlank();
    }

    private boolean hasBlockingReviewStatus(String reviewStatus) {
        if (reviewStatus == null || reviewStatus.isBlank()) {
            return false;
        }
        return !"released".equals(reviewStatus.trim().toLowerCase(Locale.ROOT));
    }

    private boolean containsPlaceholderExamText(ExamData exam) {
        String task = normalizeForInspection(exam.getTaskContent());
        String solution = normalizeForInspection(exam.getSolutionContent());
        if (task.matches("^eine materialgestuetzte j\\d+[- ]uebungsaufgabe\\b.*")) {
            return true;
        }
        if (task.matches("^eine integrative sek[- ]i[- ]abschlussaufgabe\\b.*")) {
            return true;
        }
        if (task.contains("uebungsaufgabe verbindet") && !hasSubtaskMarkers(task)) {
            return true;
        }
        return solution.startsWith("die loesung zeigt ")
                && !hasSubtaskMarkers(task)
                && !task.matches(".*\\b\\d+[,.]?\\d*\\b.*");
    }

    private boolean hasSubtaskMarkers(String normalizedTask) {
        return normalizedTask.matches("(?s).*(?:\\b1\\.|\\ba\\)|\\baufgabe\\s+1\\b|\\bteilaufgabe\\b).*");
    }

    private String normalizeForInspection(String value) {
        if (value == null) {
            return "";
        }
        return value.toLowerCase(Locale.ROOT)
                .replace("ü", "ue")
                .replace("ä", "ae")
                .replace("ö", "oe")
                .replace("ß", "ss")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private boolean hasScoringStructure(ExamData exam) {
        ExamData.Scoring scoring = exam.getScoring();
        return scoring != null
                && scoring.getMaxPoints() > 0
                && scoring.getPassingPoints() > 0
                && scoring.getSteps() != null
                && !scoring.getSteps().isEmpty();
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
        if (content == null || content.isBlank()) {
            return content;
        }
        Pattern imagePattern = Pattern.compile("!\\[[^\\]]*\\]\\(([^)]+)\\)");
        Matcher matcher = imagePattern.matcher(content);
        String firstUrl = null;
        StringBuffer result = new StringBuffer();
        while (matcher.find()) {
            if (firstUrl == null) {
                firstUrl = matcher.group(1);
            }
            matcher.appendReplacement(result, "");
        }
        matcher.appendTail(result);
        String stripped = normalizeMathDelimitersForChat(
                result.toString().replaceAll("(?m)^\\s*$\\n?", "").trim());
        if (firstUrl == null || firstUrl.isBlank()) {
            return stripped;
        }
        String relativePath = toRelativeAssetPath(firstUrl);
        if (relativePath == null || relativePath.isBlank()) {
            return stripped;
        }
        String normalized = IMAGE_PATH_PREFIX + relativePath + "\n\n" + stripped;
        if ("bc60e300-96be-599a-89b6-8fcca380803d".equals(goalId)
                || "68a262fc-43f4-5d23-af30-853870bfd45b".equals(goalId)) {
            normalized = buildExamPackagedContent(relativePath, stripped);
        }
        return normalized;
    }

    private String buildExamPackagedContent(String imagePath, String body) {
        String safeBody = body == null ? "" : body.trim();
        String imageLine = imagePath == null || imagePath.isBlank()
                ? ""
                : IMAGE_PATH_PREFIX + imagePath + "\n\n";
        return imageLine
                + "**Prüfungsmodus – Mathematik LK (Analysis)**\n\n"
                + "Hinweis: Du bearbeitest jetzt eine prüfungsnahe Abituraufgabe.\n\n"
                + "Arbeite selbstständig, strukturiert und rechne sauber.\n"
                + "Ich gebe keine Hinweise während der Bearbeitung.\n\n"
                + "---\n\n"
                + safeBody + "\n\n"
                + "---\n\n"
                + "Bitte reiche deine vollständige Lösung in einer Nachricht ein (Text reicht, Skizze gern beschrieben).\n"
                + "Wenn du abbrechen möchtest, sag einfach Bescheid.";
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

    private String toRelativeAssetPath(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        String trimmed = url.trim();
        if (trimmed.startsWith("/")) {
            return trimmed;
        }
        try {
            URI uri = URI.create(trimmed);
            String path = uri.getPath();
            if (path == null || path.isBlank()) {
                return null;
            }
            return uri.getQuery() == null || uri.getQuery().isBlank()
                    ? path
                    : path + "?" + uri.getQuery();
        } catch (IllegalArgumentException exception) {
            return null;
        }
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
