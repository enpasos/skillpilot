package com.skillpilot.backend.ai.visiblesession;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.ExamData;
import java.net.URI;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Applies the same AI-facing exam, resource and math preparation used by the
 * legacy controller before the compact visible-session projection is built.
 */
final class VisibleSessionAiStatePreparer {

    private static final String IMAGE_PATH_PREFIX = "IMAGE_PATH: ";

    private final String assetBase;

    VisibleSessionAiStatePreparer(String publicBaseUrl) {
        this.assetBase = publicBaseUrl.replaceAll("/+$", "") + "/ai-assets";
    }

    UnifiedLearnerStateResponse prepare(UnifiedLearnerStateResponse state) {
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
                state.skillpilotId(),
                state.curriculum(),
                frontier,
                goals,
                state.nextAllowedActions(),
                state.activeFilters(),
                state.copySources(),
                state.learningState(),
                activeGoal,
                preparedStateMachine);
    }

    List<FrontierGoal> prepareNavigationGoals(List<FrontierGoal> goals) {
        return prepareSelectableGoals(rewriteGoals(goals));
    }

    boolean isExamReadyForHardCheck(FrontierGoal goal) {
        return goal != null && isExamDataReadyForHardCheck(goal.examData());
    }

    private FrontierGoal prepareActiveGoal(FrontierGoal goal) {
        FrontierGoal rewritten = rewriteGoal(goal);
        if (rewritten == null || rewritten.examData() == null
                || isExamDataReadyForHardCheck(rewritten.examData())) {
            return rewritten;
        }
        return new FrontierGoal(
                rewritten.id(),
                rewritten.title(),
                rewritten.description(),
                rewritten.type(),
                "exam",
                rewritten.reason(),
                rewritten.tags(),
                rewritten.resourceLinks(),
                rewritten.sourceRef(),
                rewritten.sourceLicense(),
                rewritten.sourceLicenseUrl(),
                null);
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
        return !exam || isExamDataReadyForHardCheck(goal.examData());
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
                goal.reason(),
                goal.tags(),
                goal.resourceLinks(),
                goal.sourceRef(),
                goal.sourceLicense(),
                goal.sourceLicenseUrl(),
                null);
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
                goal.reason(),
                goal.tags(),
                resourceLinks,
                goal.sourceRef(),
                goal.sourceLicense(),
                goal.sourceLicenseUrl(),
                rewrittenExam);
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
}
