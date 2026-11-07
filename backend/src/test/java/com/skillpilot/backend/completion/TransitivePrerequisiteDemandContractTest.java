package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

/** Main's full-transitivity contract, without a new recognition or learning-unit model. */
class TransitivePrerequisiteDemandContractTest {
    private final CompletionProfileCompiler compiler = new CompletionProfileCompiler();
    private final CompletionEvaluator evaluator = new CompletionEvaluator();

    @Test
    void openAssessmentRetainsPreparationThroughAnExplicitlyMasteredIntermediate() {
        var graph = graph(atom("A"), atom("B", "A"), exam("Q", "B"));

        var result = evaluator.evaluateAutomatic(compile(graph), Set.of("B"));

        assertThat(result.masteredGoalIds()).containsExactly("B");
        assertThat(result.waivedGoalIds()).doesNotContain("A");
        assertThat(result.pendingTargetGoalIds()).containsExactlyInAnyOrder("A", "Q");
    }

    @Test
    void removingAGoalEffectiveRedundantEdgePreservesAutomaticRequiredWork() {
        var withShortcut = graph(atom("A"), atom("B", "A"), exam("Q", "B", "A"));
        var withoutShortcut = graph(atom("A"), atom("B", "A"), exam("Q", "B"));

        var before = evaluator.evaluateAutomatic(compile(withShortcut), Set.of("B"));
        var after = evaluator.evaluateAutomatic(compile(withoutShortcut), Set.of("B"));

        assertThat(before.waivedGoalIds()).isEmpty();
        assertThat(after.waivedGoalIds()).isEqualTo(before.waivedGoalIds());
        assertThat(after.pendingTargetGoalIds()).isEqualTo(before.pendingTargetGoalIds());
    }

    @Test
    void requiredClusterKeepsItsAtomsTransitivePreparationAfterThoseAtomsAreMastered() {
        var cluster = atom("K");
        cluster.setContains(List.of("B"));
        var graph = graph(atom("A"), atom("B", "A"), cluster, exam("Q", "K"));
        var compiled = compile(graph);
        assertThat(compiled.directPrerequisites("Q")).containsExactly("B");
        assertThat(compiled.directPrerequisites("B")).containsExactly("A");

        var result = evaluator.evaluateAutomatic(compiled, Set.of("B"));

        assertThat(result.waivedGoalIds()).doesNotContain("A");
        assertThat(result.pendingTargetGoalIds()).containsExactlyInAnyOrder("A", "Q");
    }

    private CompiledAutomaticCompletion compile(Map<String, LearningGoal> graph) {
        Set<String> atoms = graph.values().stream()
                .filter(goal -> goal.getContains().isEmpty())
                .map(LearningGoal::getId).collect(Collectors.toSet());
        return compiler.compileAutomatic(graph, atoms, atoms, "main-transitive-demand-contract");
    }

    private static Map<String, LearningGoal> graph(LearningGoal... goals) {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        for (LearningGoal goal : goals) graph.put(goal.getId(), goal);
        return graph;
    }

    private static LearningGoal atom(String id, String... prerequisites) {
        var goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(id);
        goal.setContains(List.of());
        goal.setRequires(List.of(prerequisites));
        return goal;
    }

    private static LearningGoal exam(String id, String... prerequisites) {
        var goal = atom(id, prerequisites);
        goal.setNodeKind("exam");
        return goal;
    }
}
