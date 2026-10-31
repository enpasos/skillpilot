package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

class AutomaticCompletionApplicationServiceTest {
    @Test void automaticScopeNeedsNeitherAnAuthoredProfileNorAnAssessmentAnchor() {
        var service = new CompletionApplicationService(new CompletionProfileCatalog(Map.of(), Map.of(), "generation"));
        var graph = graph();
        var compiled = service.compileAutomatic(definition("ordinary", "general-demand-v1"), "base", graph,
                Set.of("A1"), graph.keySet());
        assertThat(compiled.automatic()).isTrue();
        assertThat(compiled.assessmentGoalIds()).isEmpty();
        var result = service.evaluate(compiled, Map.of());
        assertThat(result.complete()).isTrue();
        assertThat(result.waivedGoalIds()).containsExactly("A1");
        assertThat(result.masteredGoalIds()).isEmpty();
    }

    @Test void targetMembershipIsBoundOnEveryCacheReadAndOutcomesAreNeverCached() {
        var service = service(32, 100, 100);
        var graph = graph();
        var definition = definition("scope", "general-demand-v1");
        Set<String> mutableTargets = new LinkedHashSet<>(Set.of("A1", "Q1"));
        var first = service.compileAutomatic(definition, "base", graph, mutableTargets, graph.keySet());
        mutableTargets.add("Q2");
        assertThat(service.compileAutomatic(definition, "base", graph, Set.of("Q1", "A1"), graph.keySet()))
                .isSameAs(first);
        assertThat(service.evaluate(first, Map.of()).complete()).isFalse();
        assertThat(service.evaluate(first, Map.of("Q1", 1.0)).complete()).isTrue();
        assertThat(service.evaluate(first, Map.of()).complete()).isFalse();
        assertThatThrownBy(() -> service.compileAutomatic(definition, "base", graph,
                Set.of("A1", "Q1"), Set.of("A1")))
                .isInstanceOf(CompletionApplicationService.ScopeNotApplicableException.class);
        var expanded = service.compileAutomatic(definition, "base", graph, mutableTargets, graph.keySet());
        assertThat(expanded).isNotSameAs(first);
        assertThat(expanded.targetGoalIds()).containsExactlyInAnyOrder("A1", "Q1", "Q2");
        assertThat(service.evaluate(expanded, Map.of("Q1", 1.0)).complete()).isFalse();
    }

    @Test void identityRevisionAndBaseCannotAliasAnotherStaticCompilation() {
        var service = service(32, 100, 100);
        var graph = graph();
        var first = service.compileAutomatic(definition("scope", "general-demand-v1"), "base-A", graph,
                Set.of("A1", "Q1"), graph.keySet());
        var changedGraph = graph();
        changedGraph.get("Q1").setRequires(List.of("A1", "A2"));
        var otherBase = service.compileAutomatic(definition("scope", "general-demand-v1"), "base-B", changedGraph,
                Set.of("A1", "Q1"), graph.keySet());
        assertThat(otherBase).isNotSameAs(first);
        assertThat(otherBase.contextGoalIds()).contains("A2");
        assertThat(first.contextGoalIds()).doesNotContain("A2");
        assertThat(service.compileAutomatic(definition("scope", "general-demand-v2"), "base-A", graph,
                Set.of("A1", "Q1"), graph.keySet())).isNotSameAs(first);
        assertThat(service.compileAutomatic(definition("different", "general-demand-v1"), "base-A", graph,
                Set.of("A1", "Q1"), graph.keySet())).isNotSameAs(first);
    }

    @Test void automaticEvictionAndLazyBasesDoNotWeakenHistoricalReadinessBindings() {
        var service = service(1, 100, 100);
        var graph = graph();
        service.canonicalGraph("historical", () -> graph);
        var historical = service.compile("legacy", "historical", graph, graph.keySet());
        service.sealPreparedContexts(Map.of("historical", Set.of("legacy")));
        assertThat(service.automaticCanonicalGraph("historical", () -> {
            throw new AssertionError("Already prepared base must be reused");
        })).containsExactlyInAnyOrderEntriesOf(graph);
        assertThat(service.automaticCanonicalGraph("new-base", () -> graph)).containsExactlyInAnyOrderEntriesOf(graph);
        var first = service.compileAutomatic(definition("one", "general-demand-v1"), "new-base", graph,
                Set.of("A1", "Q1"), graph.keySet());
        service.compileAutomatic(definition("two", "general-demand-v1"), "new-base", graph,
                Set.of("A2", "Q2"), graph.keySet());
        assertThat(service.compileAutomatic(definition("one", "general-demand-v1"), "new-base", graph,
                Set.of("A1", "Q1"), graph.keySet())).isNotSameAs(first);
        assertThat(service.compile("legacy", "historical", Map.of(), graph.keySet())).isSameAs(historical);
        assertThatThrownBy(() -> service.canonicalGraph("new-base", () -> graph))
                .isInstanceOf(CompletionApplicationService.PreparedContextUnavailableException.class);
        assertThatThrownBy(() -> service.compile("legacy", "new-base", graph, graph.keySet()))
                .isInstanceOf(CompletionApplicationService.PreparedContextUnavailableException.class);
    }

    @Test void automaticGraphCacheIsBoundedAndRejectsUnavailableGenerationsEvenOnHits() {
        var service = service(32, 100, 100);
        AtomicInteger firstLoads = new AtomicInteger();
        service.automaticCanonicalGraph("first", () -> { firstLoads.incrementAndGet(); return graph(); });
        for (int i = 0; i < 4; i++) service.automaticCanonicalGraph("base-" + i, AutomaticCompletionApplicationServiceTest::graph);
        service.automaticCanonicalGraph("first", () -> { firstLoads.incrementAndGet(); return graph(); });
        assertThat(firstLoads).hasValue(2);
        var graph = graph();
        service.compileAutomatic(definition("one", "general-demand-v1"), "first", graph,
                Set.of("A1", "Q1"), graph.keySet());
        ReflectionTestUtils.setField(service.catalog(), "available", false);
        assertThatThrownBy(() -> service.automaticCanonicalGraph("first", AutomaticCompletionApplicationServiceTest::graph))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("unavailable");
        assertThatThrownBy(() -> service.compileAutomatic(definition("one", "general-demand-v1"), "first", graph,
                Set.of("A1", "Q1"), graph.keySet()))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("unavailable");
    }

    @Test void automaticNodeAndEdgeBudgetsEvictButNeverTruncateAContext() {
        var graph = graph();
        for (var service : List.of(service(10, 1, 100), service(10, 100, 2))) {
            var first = service.compileAutomatic(definition("one", "general-demand-v1"), "base", graph,
                    Set.of("A1", "Q1"), graph.keySet());
            service.compileAutomatic(definition("two", "general-demand-v1"), "base", graph,
                    Set.of("A2", "Q2"), graph.keySet());
            assertThat(service.compileAutomatic(definition("one", "general-demand-v1"), "base", graph,
                    Set.of("A1", "Q1"), graph.keySet())).isNotSameAs(first);
            assertThatThrownBy(() -> service.compileAutomatic(definition("all", "general-demand-v1"), "base", graph,
                    graph.keySet(), graph.keySet())).isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("graph budget");
        }
    }

    private static CompletionApplicationService service(int contexts, long edges, long nodes) {
        var legacy = new CompletionProfileDefinition(1, "legacy", "1", Map.of("de", "Alt", "en", "Old"),
                "legacy", Map.of(), List.of(), new CompletionProfileDefinition.Review("review", "1", "1", "1"),
                List.of(new CompletionProfileDefinition.WaiverRule("rule", List.of("Q1"), List.of("A1"), "test", "review")));
        var scope = new CompletionScopeDefinition(1, "legacy", "1", legacy.title(), List.of("A1", "Q1"));
        return new CompletionApplicationService(new CompletionProfileCatalog(Map.of("legacy", legacy),
                Map.of("legacy", scope), "generation"), contexts, edges, nodes);
    }

    private static CompletionProfileDefinition definition(String scope, String revision) {
        return new CompletionProfileDefinition(1, "automatic:" + scope, revision,
                Map.of("de", "Abschnitt " + scope, "en", "Scope " + scope), scope,
                Map.of(), List.of(), null, List.of());
    }

    private static Map<String, LearningGoal> graph() {
        Map<String, LearningGoal> result = new LinkedHashMap<>();
        for (int i = 1; i <= 2; i++) {
            var preparation = new LearningGoal();
            preparation.setId("A" + i); preparation.setContains(List.of()); preparation.setRequires(List.of());
            var assessment = new LearningGoal();
            assessment.setId("Q" + i); assessment.setNodeKind("exam"); assessment.setContains(List.of());
            assessment.setRequires(List.of(preparation.getId()));
            result.put(preparation.getId(), preparation); result.put(assessment.getId(), assessment);
        }
        return result;
    }
}
