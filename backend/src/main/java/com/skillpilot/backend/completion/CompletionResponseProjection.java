package com.skillpilot.backend.completion;

import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.landscape.LearningGoal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/** Bounded presentation over one evaluator snapshot. It never infers coverage or stores results. */
public final class CompletionResponseProjection {
    public static final int MAX_WAIVER_DETAILS = 3;
    public static final int MAX_ASSESSMENT_REFERENCES = 3;
    private CompletionResponseProjection() { }

    public static LevelCompletionResponse withExplanations(LevelCompletionResponse response,
            CompletionEvaluation evaluation, Map<String, LearningGoal> graph) {
        if (response == null) return null;
        if (!"valid".equals(response.calculationStatus()) || evaluation == null) {
            return response.withWaiverDetails(List.of());
        }
        List<LevelCompletionResponse.WaiverDetail> details = new ArrayList<>();
        for (String id : response.waivedTargetGoalIds()) {
            var reason = evaluation.waiverReasons().get(id);
            if (!evaluation.waivedGoalIds().contains(id) || reason == null) continue;
            var assessments = reason.assessmentGoalIds().stream().limit(MAX_ASSESSMENT_REFERENCES)
                    .map(assessment -> new LevelCompletionResponse.AssessmentReference(assessment, titleFor(graph.get(assessment))))
                    .toList();
            details.add(new LevelCompletionResponse.WaiverDetail(id, titleFor(graph.get(id)), reason.ruleId(),
                    assessments, reason.assessmentGoalIds().size()));
            if (details.size() == MAX_WAIVER_DETAILS) break;
        }
        return response.withWaiverDetails(details);
    }

    public static Map<String, String> titleFor(LearningGoal goal) {
        if (goal == null) return Map.of();
        String de = goal.getTitle() == null || goal.getTitle().isBlank() ? goal.getId() : goal.getTitle();
        String en = goal.getTitleEn() == null || goal.getTitleEn().isBlank() ? de : goal.getTitleEn();
        return Map.of("de", de, "en", en);
    }
}
