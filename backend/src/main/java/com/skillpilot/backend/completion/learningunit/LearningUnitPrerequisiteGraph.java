package com.skillpilot.backend.completion.learningunit;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Static linear adjacency/topology; each mastery/focus snapshot needs one linear pass. */
public final class LearningUnitPrerequisiteGraph {
    private final Map<String, List<String>> prerequisites;
    private final List<String> prerequisiteFirst;

    public LearningUnitPrerequisiteGraph(Map<String, List<String>> prerequisites) {
        Map<String, List<String>> edges = new LinkedHashMap<>();
        prerequisites.forEach((id, values) -> edges.put(id, List.copyOf(values)));
        this.prerequisites = java.util.Collections.unmodifiableMap(edges);
        Map<String, Integer> remaining = new LinkedHashMap<>();
        Map<String, List<String>> consumers = new LinkedHashMap<>();
        edges.forEach((id, values) -> {
            remaining.put(id, values.size());
            for (String prerequisite : values) {
                if (!edges.containsKey(prerequisite)) throw new IllegalArgumentException("Missing atomic prerequisite");
                consumers.computeIfAbsent(prerequisite, ignored -> new ArrayList<>()).add(id);
            }
        });
        ArrayDeque<String> ready = new ArrayDeque<>();
        remaining.forEach((id, count) -> { if (count == 0) ready.addLast(id); });
        List<String> order = new ArrayList<>();
        while (!ready.isEmpty()) {
            String id = ready.removeFirst();
            order.add(id);
            for (String consumer : consumers.getOrDefault(id, List.of())) {
                if (remaining.compute(consumer, (key, count) -> count - 1) == 0) ready.addLast(consumer);
            }
        }
        if (order.size() != edges.size()) throw new IllegalArgumentException("Cyclic atomic prerequisites");
        prerequisiteFirst = List.copyOf(order);
    }

    public Map<String, Boolean> evaluate(Set<String> effectiveMastery, Set<String> endpointScope) {
        Map<String, Boolean> satisfied = new LinkedHashMap<>();
        for (String id : prerequisiteFirst) {
            boolean complete = true;
            for (String prerequisite : prerequisites.get(id)) {
                // Every prerequisite's own requirements are visited even when its
                // outcome is mastered or outside the current endpoint scope.
                complete &= Boolean.TRUE.equals(satisfied.get(prerequisite));
                complete &= endpointScope != null && !endpointScope.contains(prerequisite)
                        || effectiveMastery.contains(prerequisite);
            }
            satisfied.put(id, complete);
        }
        return java.util.Collections.unmodifiableMap(satisfied);
    }

    public Map<String, List<String>> prerequisites() { return prerequisites; }
    public int size() { return prerequisites.size(); }
    public long edgeCount() { return prerequisites.values().stream().mapToLong(List::size).sum(); }
}
