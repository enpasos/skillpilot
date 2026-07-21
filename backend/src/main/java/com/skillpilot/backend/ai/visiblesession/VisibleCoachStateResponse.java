package com.skillpilot.backend.ai.visiblesession;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.skillpilot.backend.landscape.ExamData;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({
        "relayFooter",
        "learningState",
        "requiredAction",
        "curriculum",
        "activeGoal",
        "selection",
        "allowedActions",
        "instruction"
})
public record VisibleCoachStateResponse(
        String relayFooter,
        String learningState,
        String requiredAction,
        CurriculumSummary curriculum,
        ActiveGoal activeGoal,
        Selection selection,
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
            ExamData examData) {
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
