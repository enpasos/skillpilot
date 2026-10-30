package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CompletionApplicationServiceTest {
    @Test
    void cachesOnlyStaticCompilationAndRejectsChangedScopeEvenOnCacheHit() {
        var graph = graph();
        var service = service(32, 500_000, 100_000);
        var compiled = service.compile("p1", "base", graph, graph.keySet());
        assertThat(service.compile("p1", "base", graph, graph.keySet())).isSameAs(compiled);
        assertThat(service.evaluate(compiled, Map.of()).complete()).isFalse();
        assertThat(service.evaluate(compiled, Map.of("Q1", 1.0)).complete()).isTrue();
        assertThat(service.evaluate(compiled, Map.of()).complete()).isFalse();
        assertThatThrownBy(() -> service.compile("p1", "base", graph, Set.of("A1")))
                .isInstanceOf(CompletionApplicationService.ScopeNotApplicableException.class);
        assertThat(service.compile("p1", "base", graph, graph.keySet())).isSameAs(compiled);
    }

    @Test
    void differentCanonicalBasesCannotShareInheritedPrerequisiteCompilation() {
        var firstGraph = graph();
        firstGraph.get("A2").setRequires(List.of("A1"));
        var secondGraph = graph();
        secondGraph.get("A2").setRequires(List.of("A1"));
        LearningGoal parent = new LearningGoal();
        parent.setId("parent"); parent.setContains(List.of("Q1")); parent.setRequires(List.of("A2"));
        secondGraph.put(parent.getId(), parent);
        var service = service(32, 500_000, 100_000);
        var first = service.compile("p1", "base-A", firstGraph, firstGraph.keySet());
        var second = service.compile("p1", "base-B", secondGraph, secondGraph.keySet());
        assertThat(second).isNotSameAs(first);
        assertThat(service.evaluate(first, Map.of("Q1", 1.0)).complete()).isTrue();
        assertThat(service.evaluate(second, Map.of("Q1", 1.0)).complete()).isFalse();
        assertThat(service.compile("p1", "base-A", firstGraph, firstGraph.keySet())).isSameAs(first);
        assertThat(service.compile("p1", "base-B", secondGraph, secondGraph.keySet())).isSameAs(second);
    }

    @Test
    void contextCountEdgeAndNodeBudgetsEvictTheLeastRecentlyUsedCompilation() {
        var graph = graph();
        for (var service : List.of(service(1, 10, 10), service(10, 1, 10), service(10, 10, 2))) {
            var first = service.compile("p1", "base", graph, graph.keySet());
            service.compile("p2", "base", graph, graph.keySet());
            assertThat(service.compile("p1", "base", graph, graph.keySet())).isNotSameAs(first);
        }
    }

    @Test
    void oversizedSingleContextIsRejectedWithoutTruncatingRequirements() {
        var graph = graph();
        graph.get("A1").setRequires(List.of("A2"));
        var service = service(10, 1, 10);
        assertThatThrownBy(() -> service.compile("p1", "base", graph, graph.keySet()))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("graph budget");
        assertThat(service.compile("p2", "base", graph, graph.keySet()).contextGoalIds()).containsExactly("A2", "Q2");
    }

    @Test
    void legacyThresholdUsesCurrentProjectedOutcomeAndNeverCreatesPartialMastery() {
        var graph = graph();
        var service = service(2, 10, 10);
        var compiled = service.compile("p1", "base", graph, graph.keySet());
        assertThat(service.evaluate(compiled, Map.of("Q1", .9)).complete()).isTrue();
        assertThat(service.evaluate(compiled, Map.of("Q1", .899)).complete()).isFalse();
        assertThat(service.evaluate(compiled, Map.of("Q1", Double.NaN)).complete()).isFalse();
        assertThat(service.evaluate(compiled, Map.of("Q1", Double.POSITIVE_INFINITY)).complete()).isFalse();
    }

    @Test
    void preparedStaticInputsCannotLoadOrCompileColdWorkAfterReadiness() {
        var graph = graph();
        var service = service(32, 500_000, 100_000);
        service.canonicalGraph("prepared", () -> graph);
        var original = service.compile("p1", "prepared", graph, graph.keySet());
        Map<String, Set<String>> expected = new LinkedHashMap<>();
        Set<String> profiles = new LinkedHashSet<>(Set.of("p1"));
        expected.put("prepared", profiles);
        service.sealPreparedContexts(expected);
        profiles.add("p2"); expected.put("cold", Set.of("p1"));
        assertThat(service.canonicalGraph("prepared", () -> { throw new AssertionError("Cold graph load"); }))
                .containsExactlyInAnyOrderEntriesOf(graph);
        assertThat(service.compile("p1", "prepared", Map.of(), graph.keySet())).isSameAs(original);
        assertThatThrownBy(() -> service.canonicalGraph("cold", () -> { throw new AssertionError("Cold graph load"); }))
                .isInstanceOf(CompletionApplicationService.PreparedContextUnavailableException.class);
        assertThatThrownBy(() -> service.compile("p1", "cold", Map.of(), graph.keySet()))
                .isInstanceOf(CompletionApplicationService.PreparedContextUnavailableException.class);
        assertThatThrownBy(() -> service.compile("p2", "prepared", Map.of(), graph.keySet()))
                .isInstanceOf(CompletionApplicationService.PreparedContextUnavailableException.class);
        assertThatThrownBy(() -> service.compile("p1", "prepared", Map.of(), Set.of("A1")))
                .isInstanceOf(CompletionApplicationService.ScopeNotApplicableException.class);
    }

    private static CompletionApplicationService service(int maximumContexts, long maximumEdges, long maximumNodes) {
        Map<String, CompletionProfileDefinition> profiles = new LinkedHashMap<>();
        Map<String, CompletionScopeDefinition> scopes = new LinkedHashMap<>();
        for (int i = 1; i <= 2; i++) {
            String id = "p" + i;
            var profile = new CompletionProfileDefinition(1, id, "1", Map.of("de", "Abschnitt", "en", "Scope"),
                    id, Map.of(), List.of(), new CompletionProfileDefinition.Review("test", "s1", "t1", "r1"),
                    List.of(new CompletionProfileDefinition.WaiverRule("rule", List.of("Q" + i), List.of("A" + i), "test", "test")));
            profiles.put(id, profile);
            scopes.put(id, new CompletionScopeDefinition(1, id, "1", profile.title(), List.of("Q" + i, "A" + i)));
        }
        return new CompletionApplicationService(new CompletionProfileCatalog(profiles, scopes, "generation-1"),
                maximumContexts, maximumEdges, maximumNodes);
    }

    private static Map<String, LearningGoal> graph() {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        for (int i = 1; i <= 2; i++) {
            LearningGoal a = new LearningGoal();
            a.setId("A" + i); a.setTitle(a.getId()); a.setContains(List.of()); a.setRequires(List.of());
            LearningGoal q = new LearningGoal();
            q.setId("Q" + i); q.setTitle(q.getId()); q.setNodeKind("exam"); q.setContains(List.of());
            q.setRequires(List.of(a.getId()));
            graph.put(a.getId(), a); graph.put(q.getId(), q);
        }
        return graph;
    }
}
