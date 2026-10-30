package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.*;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.landscape.LearningGoal;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CompletionResponseProjectionTest {
    @Test void explanationsAreBoundedAndContainOnlyCurrentlyWaivedTargets() {
        List<String> exams = List.of("Q1", "Q2", "Q3", "Q4", "Q5");
        List<String> targets = List.of("A1", "A2", "A3", "A4");
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        Map<String, CompletionEvaluation.WaiverReason> reasons = new LinkedHashMap<>();
        for (String id : List.of("A1", "A2", "A3", "A4", "support")) {
            reasons.put(id, new CompletionEvaluation.WaiverReason("reviewed-rule", exams));
            graph.put(id, goal(id));
        }
        exams.forEach(id -> graph.put(id, goal(id)));
        var evaluation = new CompletionEvaluation(new LinkedHashSet<>(exams), reasons.keySet(), Set.of(),
                new LinkedHashSet<>(exams), reasons, Map.of(), true, 9, 5, 4, 5);
        var response = response("valid", targets);
        var projected = CompletionResponseProjection.withExplanations(response, evaluation, graph);
        assertThat(projected.waiverDetails()).extracting(LevelCompletionResponse.WaiverDetail::goalId)
                .containsExactly("A1", "A2", "A3");
        assertThat(projected.waiverDetails()).allSatisfy(detail -> {
            assertThat(detail.ruleId()).isEqualTo("reviewed-rule");
            assertThat(detail.title()).containsEntry("de", "Ziel " + detail.goalId());
            assertThat(detail.assessmentCount()).isEqualTo(5);
            assertThat(detail.assessments()).extracting(LevelCompletionResponse.AssessmentReference::goalId)
                    .containsExactly("Q1", "Q2", "Q3");
        });
        assertThat(projected.masteredTargetCount()).isEqualTo(response.masteredTargetCount());
        assertThat(projected.waivedTargetCount()).isEqualTo(response.waivedTargetCount());
    }

    @Test void missingOrInvalidSnapshotsNeverReuseAnEarlierExplanation() {
        var stale = response("unavailable", List.of()).withWaiverDetails(List.of(
                new LevelCompletionResponse.WaiverDetail("old", Map.of("de", "Alt"), "old-rule", List.of(), 1)));
        assertThat(CompletionResponseProjection.withExplanations(stale, null, Map.of()).waiverDetails()).isEmpty();
        var current = new CompletionEvaluation(Set.of(), Set.of(), Set.of("A1", "Q1"), Set.of(), Map.of(),
                Map.of(), false, 2, 0, 0, 1);
        assertThat(CompletionResponseProjection.withExplanations(response("valid", List.of()), current, Map.of()).waiverDetails()).isEmpty();
    }

    private LevelCompletionResponse response(String status, List<String> waived) {
        return new LevelCompletionResponse(status, "context", "profile", "1", "generation", 12,
                Map.of("de", "Abschnitt", "en", "Section"), "valid".equals(status) ? true : null,
                5, 4, 0, 9, 5, 5, waived, List.of(), List.of(), "required", false, null, List.of());
    }
    private LearningGoal goal(String id) {
        var goal = new LearningGoal(); goal.setId(id); goal.setTitle("Ziel " + id); goal.setTitleEn("Goal " + id); return goal;
    }
}
