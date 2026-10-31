package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;

class AutomaticLearningPlanCompletionProjectionTest {
    private final LearningPlanCompletionProjection projection = new LearningPlanCompletionProjection();

    @Test void planWithoutAnyProfileOrAssessmentUsesOneSnapshotAndCreditsOrdinaryTargets() {
        var context = context(atom("a"), atom("b", "a"));
        assertThat(context.reviewedProfiles()).isEmpty();
        var calls = new AtomicInteger();
        assertThat(projection.waivedGoals(context, Set.of("b"), ids -> {
            calls.incrementAndGet();
            assertThat(ids).containsExactlyInAnyOrder("a", "b");
            return Map.of();
        })).containsExactly("b");
        assertThat(calls).hasValue(1);
    }

    @Test void masteredIntermediateStopsDemandEvenWhenItsAssessmentIsOutsideTheDatedPlan() {
        var context = context(atom("a"), atom("b", "a"), exam("c", "b"));
        assertThat(waived(context, Set.of("a"), Map.of("b", 1.0))).containsExactly("a");
        assertThat(waived(context, Set.of("a"), Map.of())).isEmpty();
        assertThat(waived(context, Set.of("a"), Map.of("c", 1.0))).containsExactly("a");
    }

    @Test void preparationPlanRetainsDemandFromAnOpenPersonalCurriculumAssessmentOutsideItsSchedule() {
        var context = context(atom("a"), exam("unplanned", "a"));
        assertThat(waived(context, Set.of("a"), Map.of())).isEmpty();
        assertThat(waived(context, Set.of("a"), Map.of("unplanned", 1.0))).containsExactly("a");
        assertThat(waived(context, Set.of("a"), Map.of())).isEmpty();
    }

    @Test void independentSubjectGoalsDoNotBlockButGenuineCrossSubjectDemandRemains() {
        var independent = context(atom("a"), exam("math-exam", "a"), atom("physics"), exam("physics-exam", "physics"));
        assertThat(waived(independent, Set.of("a"), Map.of("math-exam", 1.0))).containsExactly("a");
        var crossSubject = context(atom("a"), exam("math-exam", "a"), exam("physics-exam", "a"));
        assertThat(waived(crossSubject, Set.of("a"), Map.of("math-exam", 1.0))).isEmpty();
        assertThat(waived(crossSubject, Set.of("a"), Map.of("math-exam", 1.0, "physics-exam", 1.0)))
                .containsExactly("a");
    }

    @Test void differentPlansShareOneFullCurriculumCompilationAndExcludeNavigationClusters() {
        var root = atom("root"); root.setContains(List.of("a", "b", "q"));
        var context = context(root, atom("a"), atom("b"), exam("q", "a"));
        assertThat(waived(context, Set.of("a"), Map.of("q", 1.0))).containsExactly("a");
        assertThat(waived(context, Set.of("b"), Map.of())).containsExactly("b");
        assertThat((Map<?, ?>) org.springframework.test.util.ReflectionTestUtils.getField(projection, "cache"))
                .hasSize(1);
    }

    @Test void automaticContextRetainsStrictMissingInputAndScopeValidation() {
        var context = context(atom("a"));
        assertThatThrownBy(() -> projection.waivedGoals(context, Set.of("a"), ids -> null))
                .isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> waived(context, Set.of("missing"), Map.of()))
                .isInstanceOf(CompletionCompilationException.class);
    }

    @Test void repeatedReadsNeverCacheLearnerResultsOrDoubleCountExplicitMastery() {
        var context = context(atom("a"), exam("q", "a"), exam("r", "a"));
        var obligations = Set.of("a", "q", "r");
        assertThat(waived(context, obligations, Map.of("q", 1.0, "r", 1.0))).containsExactly("a");
        assertThat(waived(context, obligations, Map.of("q", 1.0))).isEmpty();
        assertThat(waived(context, obligations, Map.of("q", 1.0, "r", 1.0, "a", 1.0))).isEmpty();
        assertThat(waived(context, obligations, Map.of())).isEmpty();
    }

    private Set<String> waived(LearningPlanCompletionContext context, Set<String> obligations,
            Map<String, Double> mastery) {
        return projection.waivedGoals(context, obligations, ids -> mastery);
    }

    private static LearningPlanCompletionContext context(LearningGoal... goals) {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        for (var goal : goals) graph.put(goal.getId(), goal);
        return LearningPlanCompletionContext.automatic("base", "generation", graph, graph.keySet());
    }

    private static LearningGoal atom(String id, String... requires) {
        var goal = new LearningGoal();
        goal.setId(id); goal.setTitle(id); goal.setRequires(List.of(requires)); goal.setContains(List.of());
        return goal;
    }

    private static LearningGoal exam(String id, String... requires) {
        var goal = atom(id, requires); goal.setNodeKind("exam"); return goal;
    }
}
