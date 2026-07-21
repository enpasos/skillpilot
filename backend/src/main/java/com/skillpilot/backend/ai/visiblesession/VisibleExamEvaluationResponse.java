package com.skillpilot.backend.ai.visiblesession;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({ "relayFooter", "goalId", "solutionContent", "scoring", "instruction" })
public record VisibleExamEvaluationResponse(
        String relayFooter,
        String goalId,
        String solutionContent,
        Scoring scoring,
        String instruction) {

    public record Scoring(
            double maxPoints,
            double passingPoints,
            List<ScoringStep> steps) {
    }

    public record ScoringStep(
            String id,
            double points,
            String description) {
    }
}
