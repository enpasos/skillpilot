package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class PrerequisiteTopologyReuseTest {
    @Test
    void equalContentReusesTopologyButInPlaceRequiresEditsRecomputeInheritance() {
        var compiler = new CompletionProfileCompiler();
        var graph = graph(atom("A"), atom("B", "A"), atom("C", "B"));
        var original = compiler.normalizePrerequisites(graph);
        assertThat(compiler.normalizePrerequisites(graph(atom("C", "B"), atom("B", "A"), atom("A"))))
                .isSameAs(original);
        graph.get("B").setRequires(List.of());
        var changed = compiler.normalizePrerequisites(graph);
        assertThat(changed).isNotSameAs(original);
        assertThat(changed.transitivePrerequisites("C")).containsExactly("B");
        assertThat(original.transitivePrerequisites("C")).containsExactly("A", "B");
        assertThatThrownBy(() -> original.transitivePrerequisites("C").clear())
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void containsChangesAndNewOrRemovedNodesInvalidateTheSnapshot() {
        var compiler = new CompletionProfileCompiler();
        var graph = graph(atom("A"), atom("B"), cluster("K", "A"), atom("T", "K"));
        var original = compiler.normalizePrerequisites(graph);
        assertThat(original.transitivePrerequisites("T")).containsExactly("A");
        graph.get("K").setContains(List.of("B"));
        var changed = compiler.normalizePrerequisites(graph);
        assertThat(changed).isNotSameAs(original);
        assertThat(changed.transitivePrerequisites("T")).containsExactly("B");
        graph.put("C", atom("C", "B"));
        var extended = compiler.normalizePrerequisites(graph);
        assertThat(extended).isNotSameAs(changed);
        assertThat(extended.transitivePrerequisites("C")).containsExactly("B");
        graph.remove("B");
        assertInvalid(compiler, graph, "MISSING_REFERENCE");
        graph.put("B", atom("B"));
        assertThat(compiler.normalizePrerequisites(graph)).isSameAs(extended);
    }

    @Test
    void invalidIdentityTypeReferencesAndCyclesCannotReuseAValidResult() {
        var compiler = new CompletionProfileCompiler();
        var graph = graph(atom("A"), atom("B", "A"));
        var original = compiler.normalizePrerequisites(graph);
        graph.get("B").setId("wrong");
        assertInvalid(compiler, graph, "IDENTITY_CONFLICT");
        graph.get("B").setId("B");
        graph.get("B").setType("cluster");
        assertInvalid(compiler, graph, "IDENTITY_CONFLICT");
        graph.get("B").setType("atomic");
        graph.get("B").setRequires(List.of("missing"));
        assertInvalid(compiler, graph, "MISSING_REFERENCE");
        graph.get("B").setRequires(List.of("A", "A"));
        assertInvalid(compiler, graph, "MISSING_REFERENCE");
        graph.get("B").setRequires(List.of("A"));
        graph.get("A").setRequires(List.of("B"));
        assertInvalid(compiler, graph, "REQUIRES_CYCLE");
        graph.get("A").setRequires(List.of());
        assertThat(compiler.normalizePrerequisites(graph)).isSameAs(original);
        assertInvalid(compiler, Map.of(), "MISSING_REFERENCE");
        assertInvalid(compiler, null, "MISSING_REFERENCE");
    }

    @Test
    void aNewSelectedContextStillChecksEffectiveCyclesOnAReusedTopology() {
        var compiler = new CompletionProfileCompiler();
        var graph = graph(atom("safe"), atom("A"), atom("B", "A"), cluster("K", "A"));
        graph.get("K").setRequires(List.of("B"));
        var topology = compiler.normalizePrerequisites(graph);
        topology.validateContext(Set.of("safe"));
        var reused = compiler.normalizePrerequisites(graph);
        assertThat(reused).isSameAs(topology);
        assertThatThrownBy(() -> reused.validateContext(Set.of("A")))
                .isInstanceOfSatisfying(CompletionCompilationException.class,
                        error -> assertThat(error.code()).isEqualTo("ATOMIC_CYCLE"));
        assertThatThrownBy(() -> reused.validateContext(Set.of("missing")))
                .isInstanceOfSatisfying(CompletionCompilationException.class,
                        error -> assertThat(error.code()).isEqualTo("MISSING_REFERENCE"));
    }

    @Test
    void concurrentDifferentGraphsNeverReturnAnotherGraphsRequirements() throws Exception {
        var compiler = new CompletionProfileCompiler();
        var left = graph(atom("A"), atom("B"), atom("T", "A"));
        var right = graph(atom("A"), atom("B"), atom("T", "B"));
        try (var executor = Executors.newFixedThreadPool(4)) {
            List<Callable<Boolean>> tasks = IntStream.range(0, 80).mapToObj(i -> (Callable<Boolean>) () -> {
                boolean useLeft = i % 2 == 0;
                var topology = compiler.normalizePrerequisites(useLeft ? left : right);
                return topology.transitivePrerequisites("T").equals(Set.of(useLeft ? "A" : "B"));
            }).toList();
            for (var result : executor.invokeAll(tasks, 10, TimeUnit.SECONDS)) assertThat(result.get()).isTrue();
        }
    }

    private static void assertInvalid(CompletionProfileCompiler compiler, Map<String, LearningGoal> graph, String code) {
        assertThatThrownBy(() -> compiler.normalizePrerequisites(graph))
                .isInstanceOfSatisfying(CompletionCompilationException.class,
                        error -> assertThat(error.code()).isEqualTo(code));
    }

    private static LearningGoal atom(String id, String... requires) {
        var goal = new LearningGoal();
        goal.setId(id);
        goal.setType("atomic");
        goal.setContains(List.of());
        goal.setRequires(List.of(requires));
        return goal;
    }

    private static LearningGoal cluster(String id, String... children) {
        var goal = atom(id);
        goal.setType("cluster");
        goal.setContains(List.of(children));
        return goal;
    }

    private static Map<String, LearningGoal> graph(LearningGoal... goals) {
        Map<String, LearningGoal> result = new LinkedHashMap<>();
        for (var goal : goals) result.put(goal.getId(), goal);
        return result;
    }
}
