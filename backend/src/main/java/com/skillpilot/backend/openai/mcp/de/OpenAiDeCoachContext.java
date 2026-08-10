package com.skillpilot.backend.openai.mcp.de;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/** Compact, allowlist-only state returned to the OpenAI Coach V1. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record OpenAiDeCoachContext(
        String learningState,
        String requiredAction,
        String interactionMode,
        Curriculum curriculum,
        Orientation orientation,
        OrientationOutlook orientationOutlook,
        ActiveGoal activeGoal,
        List<Option> options,
        CurriculumCatalog curriculumCatalog,
        Decision decision,
        List<Goal> frontier,
        List<Resource> resources,
        GoalVisualization goalVisualization,
        List<String> nextAllowedTools,
        Progress progress,
        Completion completion,
        List<String> policies,
        String instruction) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Curriculum(
            String curriculumId,
            String title,
            String subject) {
    }

    /**
     * User-facing orientation for guided setup.
     *
     * <p>Only the current decision's options are executable. Later questions
     * are published here solely so a conversational client can ask for all
     * missing information together and retain an order-independent answer.</p>
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Orientation(
            String establishedContext,
            List<OpenQuestion> openQuestions) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record OpenQuestion(
            String topic,
            String question) {
    }

    /**
     * Reviewed map of the actual material downstream from the active
     * orientation goal. It is already filtered to the learner's target scope.
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record OrientationOutlook(
            List<OrientationPath> paths) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record OrientationPath(
            String pathId,
            String title,
            String learningOutlook,
            List<String> practicalContexts,
            List<String> representativeGoalTitles) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ActiveGoal(
            String goalId,
            String title,
            String description,
            String type,
            String nodeKind,
            String semanticKind,
            String cockpitUrl,
            ExamTask exam) {
    }

    /** Normal context exposes the task and maximum score, never the solution or rubric. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ExamTask(
            String taskContent,
            Double maxPoints,
            boolean hasImage) {
    }

    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    public record Option(
            String kind,
            String id,
            String label,
            String description,
            List<String> goalIds,
            List<String> filterIds,
            String action) {
    }

    /** Presentation-only facets bound one-to-one to the published curriculum options. */
    public record CurriculumCatalog(int schemaVersion, List<CurriculumCatalogEntry> entries) {
        public CurriculumCatalog {
            entries = List.copyOf(entries);
        }
    }

    public record CurriculumCatalogEntry(
            String optionId,
            String category,
            String qualityStatus,
            int sortRank) {
    }

    /**
     * User-facing metadata for the currently open authored decision.
     *
     * <p>Technical stage, group, instance, landscape and filter identifiers
     * are deliberately not part of this projection.</p>
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Decision(
            String stageLabel,
            String groupLabel,
            int minSelections,
            int maxSelections,
            int selectedCount) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Goal(
            String goalId,
            String title,
            String description,
            String type,
            String nodeKind,
            String semanticKind,
            String reason) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Resource(
            String type,
            String title,
            String url,
            String resourceType,
            String provider,
            String altText,
            boolean requiresCockpit) {
    }

    /**
     * Public, learner-facing image data for the MCP Apps inline component.
     *
     * <p>The field is present only for an active atomic goal with a matching,
     * canonical {@code goal-visualization} resource link.</p>
     */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GoalVisualization(
            String goalId,
            String title,
            String description,
            String imageUrl,
            String altText,
            String cockpitUrl) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Progress(
            long masteredAtomic,
            long totalAtomic,
            GoalProgress personalized,
            GoalProgress scope,
            boolean scopeCompleted) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GoalProgress(
            long masteredAtomic,
            long totalAtomic) {
    }

    public record Completion(
            boolean scopeComplete,
            boolean curriculumComplete) {
    }
}
