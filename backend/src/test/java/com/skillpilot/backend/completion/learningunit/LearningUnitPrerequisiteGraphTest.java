package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import org.junit.jupiter.api.Test;

class LearningUnitPrerequisiteGraphTest {
    @Test void fullReachCrossesMasteredAndOutsideFocusIntermediatesBeforeSelectingEndpoints() {
        var graph = new LearningUnitPrerequisiteGraph(Map.of("Q", List.of("B"), "B", List.of("A"), "A", List.of()));
        assertThat(graph.evaluate(Set.of("B"), Set.of("Q", "A"))).containsEntry("Q", false);
        assertThat(graph.evaluate(Set.of("B"), Set.of("Q"))).containsEntry("Q", true);
        assertThat(graph.evaluate(Set.of("B"), null)).containsEntry("Q", false);
        assertThat(graph.evaluate(Set.of("A", "B"), null)).containsEntry("Q", true);
    }

    @Test void linearPassMatchesIndependentPerSourceBreadthFirstReference() {
        Random random = new Random(20261105);
        for (int attempt = 0; attempt < 60; attempt++) {
            int count = 5 + random.nextInt(35);
            Map<String, List<String>> edges = new LinkedHashMap<>();
            for (int i = 0; i < count; i++) {
                List<String> requirements = new ArrayList<>();
                for (int j = i + 1; j < count; j++) if (random.nextDouble() < .2) requirements.add("v" + j);
                edges.put("v" + i, requirements);
            }
            var graph = new LearningUnitPrerequisiteGraph(edges);
            for (int trial = 0; trial < 10; trial++) {
                Set<String> mastered = new HashSet<>(); Set<String> focus = new HashSet<>();
                edges.keySet().forEach(id -> { if (random.nextBoolean()) mastered.add(id); if (random.nextBoolean()) focus.add(id); });
                Set<String> endpoints = trial % 2 == 0 ? null : focus;
                Map<String, Boolean> actual = graph.evaluate(mastered, endpoints);
                for (String root : edges.keySet()) {
                    Set<String> reachable = new HashSet<>();
                    ArrayDeque<String> pending = new ArrayDeque<>(edges.get(root));
                    while (!pending.isEmpty()) {
                        String id = pending.removeFirst();
                        if (reachable.add(id)) pending.addAll(edges.get(id));
                    }
                    if (endpoints != null) reachable.retainAll(endpoints);
                    assertThat(actual.get(root)).isEqualTo(mastered.containsAll(reachable));
                }
            }
        }
    }

    @Test void deepGraphUsesLinearStaticStorageAndNoRecursiveCallStack() {
        Map<String, List<String>> edges = new LinkedHashMap<>();
        Set<String> mastered = new HashSet<>();
        int count = 30_000;
        for (int i = 0; i < count; i++) {
            edges.put("v" + i, i + 1 == count ? List.of() : List.of("v" + (i + 1)));
            if (i + 1 < count) mastered.add("v" + i);
        }
        var graph = new LearningUnitPrerequisiteGraph(edges);
        assertThat(graph.edgeCount()).isEqualTo(count - 1);
        assertThat(graph.evaluate(mastered, Set.of("v" + (count - 1)))).hasSize(count)
                .containsEntry("v0", false).containsEntry("v" + (count - 1), true);
        assertThat(graph.evaluate(mastered, Set.of()).values()).containsOnly(true);
    }

    @Test void malformedStaticAdjacencyCannotBecomeAnEmptySuccessfulContext() {
        assertThatThrownBy(() -> new LearningUnitPrerequisiteGraph(Map.of("A", List.of("missing"))))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new LearningUnitPrerequisiteGraph(Map.of("A", List.of("B"), "B", List.of("A"))))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
