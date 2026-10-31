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

class LearningPlanCompletionProjectionTest {
    private final LearningPlanCompletionProjection projection = new LearningPlanCompletionProjection();

    @Test void openConsumerInAnotherPlanBlocksThroughAMasteredIntermediate() {
        var graph = graph(atom("a"), atom("b", "a"), atom("c", "b"), exam("q", "a"));
        var context = context(graph, profile(graph, "review", Set.of("a", "q"), "q", "a"));
        assertThat(waived(context, Set.of("a", "q"), Map.of("q", 1.0, "b", 1.0)))
                .containsExactly("a");
        // c was excluded from the old G as already mastered, but its authored
        // obligation remains. Revocation reactivates demand through mastered b.
        assertThat(waived(context, Set.of("a", "q", "c"), Map.of("q", 1.0, "b", 1.0)))
                .isEmpty();
        assertThat(waived(context, Set.of("a", "q", "c"), Map.of("q", 1.0, "b", 1.0, "c", 1.0)))
                .containsExactly("a");
    }

    @Test void optionalUnpassedEvidenceDoesNotCreateAPlanObligation() {
        var graph = graph(atom("a"), exam("q", "a"), exam("r", "a"));
        var context = context(graph,
                profile(graph, "one", Set.of("a", "q"), "q", "a"),
                profile(graph, "two", Set.of("a", "r"), "r", "a"));
        assertThat(waived(context, Set.of("a"), Map.of("q", 1.0))).containsExactly("a");
        assertThat(waived(context, Set.of("a", "r"), Map.of("q", 1.0))).isEmpty();
        assertThat(waived(context, Set.of("a", "r"), Map.of("q", 1.0, "r", 1.0)))
                .containsExactly("a");
    }

    @Test void multipleReviewedProfilesAndRepeatedReadsNeverDoubleCountOrRetainOutcomes() {
        var graph = graph(atom("a"), exam("q", "a"), exam("r", "a"));
        var context = context(graph,
                profile(graph, "one", Set.of("a", "q"), "q", "a"),
                profile(graph, "two", Set.of("a", "r"), "r", "a"));
        assertThat(waived(context, Set.of("a"), Map.of("q", 1.0, "r", 1.0))).containsExactly("a");
        assertThat(waived(context, Set.of("a"), Map.of())).isEmpty();
        assertThat(waived(context, Set.of("a"), Map.of("a", 1.0, "q", 1.0))).isEmpty();
    }

    @Test void supportingWaiversDoNotExpandTheReviewedTargetScope() {
        var graph = graph(atom("support"), atom("a", "support"), exam("q", "a"));
        var context = context(graph, profile(graph, "review", Set.of("a", "q"), "q", "a", "support"));
        assertThat(waived(context, Set.of("a", "support"), Map.of("q", 1.0))).containsExactly("a");
    }

    @Test void reviewedSupportingIntermediateCanBeDischargedWithoutBecomingCountedWork() {
        var graph = graph(atom("a"), atom("b", "a"), atom("c", "b"), exam("q", "b"));
        var context = context(graph, profile(graph, "review", Set.of("a", "b", "q"), "q", "a", "b"));
        assertThat(waived(context, Set.of("a", "c"), Map.of("q", 1.0, "c", 1.0))).containsExactly("a");
    }

    @Test void importedMasteryCountsWithoutInventingAnEventAndUsesOneBulkSnapshot() {
        var graph = graph(atom("a"), atom("b"), exam("q", "a", "b"));
        var context = context(graph, profile(graph, "review", Set.of("a", "b", "q"), "q", "a", "b"));
        AtomicInteger calls = new AtomicInteger();
        assertThat(projection.waivedGoals(context, Set.of("a", "b"), ids -> {
            calls.incrementAndGet();
            assertThat(ids).contains("a", "b", "q");
            return Map.of("q", 1.0);
        })).containsExactlyInAnyOrder("a", "b");
        assertThat(calls).hasValue(1);
    }

    @Test void invalidOrMissingExpectedInputsFailInsteadOfReturningAnEmptyWaiverSet() {
        var graph = graph(atom("a"), exam("q", "a"));
        var profile = profile(graph, "review", Set.of("a", "q"), "q", "a");
        var stale = new LearningPlanCompletionContext("base", "other-generation", graph,
                graph.keySet(), List.of(profile));
        assertThatThrownBy(() -> waived(stale, Set.of("a"), Map.of("q", 1.0)))
                .isInstanceOf(CompletionCompilationException.class);
        assertThatThrownBy(() -> projection.waivedGoals(context(graph, profile), Set.of("a"), ids -> null))
                .isInstanceOf(NullPointerException.class);
        assertThat(projection.waivedGoals(null, Set.of("a"), ids -> {
            throw new AssertionError("No rules require no additional data");
        })).isEmpty();
    }

    @Test void aProtectedPlanGoalCannotBeWaivedByAnotherProfile() {
        var graph = graph(atom("a"), exam("q", "a"), exam("r", "a"));
        var first = profile(graph, "one", Set.of("a", "q"), "q", "a");
        var protectedDefinition = new CompletionProfileDefinition(1, "two", "1",
                Map.of("de", "Zwei", "en", "Two"), "scope", Map.of(), List.of("a"),
                review(), List.of());
        var second = new CompletionProfileCompiler().compile(protectedDefinition, graph,
                Set.of("a", "r"), graph.keySet(), "generation");
        assertThatThrownBy(() -> waived(context(graph, first, second), Set.of("a"), Map.of("q", 1.0)))
                .isInstanceOfSatisfying(CompletionCompilationException.class,
                        e -> assertThat(e.code()).isEqualTo("PROTECTED_GOAL"));
    }

    private Set<String> waived(LearningPlanCompletionContext context, Set<String> obligations,
            Map<String, Double> mastery) {
        return projection.waivedGoals(context, obligations, ids -> mastery);
    }

    private static LearningPlanCompletionContext context(Map<String, LearningGoal> graph,
            CompiledCompletionProfile... profiles) {
        return new LearningPlanCompletionContext("base", "generation", graph, graph.keySet(), List.of(profiles));
    }

    private static CompiledCompletionProfile profile(Map<String, LearningGoal> graph, String id,
            Set<String> targets, String exam, String... waivable) {
        var definition = new CompletionProfileDefinition(1, id, "1", Map.of("de", id, "en", id),
                "scope", Map.of(), List.of(), review(), List.of(new CompletionProfileDefinition.WaiverRule(
                        "rule", List.of(exam), List.of(waivable), "Reviewed coverage", "review.md")));
        return new CompletionProfileCompiler().compile(definition, graph, targets, graph.keySet(), "generation");
    }

    private static CompletionProfileDefinition.Review review() {
        return new CompletionProfileDefinition.Review("review.md", "scope-1", "task-1", "rubric-1");
    }

    private static Map<String, LearningGoal> graph(LearningGoal... goals) {
        Map<String, LearningGoal> result = new LinkedHashMap<>();
        for (var goal : goals) result.put(goal.getId(), goal);
        return result;
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
