package com.skillpilot.backend.ai.visiblesession;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "relayFooter",
        "learningState",
        "requiredAction",
        "interactionMode",
        "curriculum",
        "activeGoal",
        "resources",
        "selection",
        "progress",
        "completion",
        "allowedActions",
        "instruction"
})
public record VisibleCoachStateResponse(
        String relayFooter,
        String learningState,
        String requiredAction,
        String interactionMode,
        CurriculumSummary curriculum,
        ActiveGoal activeGoal,
        List<Resource> resources,
        Selection selection,
        Progress progress,
        Completion completion,
        List<String> allowedActions,
        String instruction) {

    public record CurriculumSummary(
            String title,
            String subject) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ActiveGoal(
            String goalId,
            String title,
            String description,
            String nodeKind,
            String cockpitUrl,
            ExamTask examData) {
    }

    /** Only the task is part of normal state. Solutions are evaluation-only. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ExamTask(
            String taskContent,
            Double maxPoints,
            boolean hasImage) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record Progress(
            long masteredAtomic,
            long totalAtomic,
            GoalProgress personalized,
            GoalProgress scope,
            boolean scopeCompleted) {
    }

    public record GoalProgress(
            long masteredAtomic,
            long totalAtomic) {
    }

    public record Completion(
            boolean scopeComplete,
            boolean curriculumComplete) {
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

    public record Selection(
            String selectionReference,
            String question,
            List<SelectionOption> options) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record SelectionOption(
            int choiceNumber,
            String label,
            String description,
            String goalId) {
    }
}
