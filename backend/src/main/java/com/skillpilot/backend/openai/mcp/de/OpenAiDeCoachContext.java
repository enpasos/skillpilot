package com.skillpilot.backend.openai.mcp.de;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

/** Compact, allowlist-only state returned to the German OpenAI coach. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record OpenAiDeCoachContext(
        String learningState,
        String requiredAction,
        String interactionMode,
        Curriculum curriculum,
        ActiveGoal activeGoal,
        List<Option> options,
        List<Goal> frontier,
        List<Resource> resources,
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

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ActiveGoal(
            String goalId,
            String title,
            String description,
            String type,
            String nodeKind,
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

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Goal(
            String goalId,
            String title,
            String description,
            String type,
            String nodeKind,
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
