package com.skillpilot.backend.completion;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Immutable, non-personal compilation of one resolved scope and curriculum generation. */
public final class CompiledCompletionProfile {
    private final CompletionProfileDefinition definition;
    private final String curriculumGeneration;
    private final List<String> goalIds;
    private final Map<String, Integer> indices;
    private final int[][] prerequisites;
    private final int[] topologicalOrder;
    private final Set<String> targetGoalIds;
    private final Set<String> assessmentGoalIds;
    private final Set<String> protectedGoalIds;
    private final List<CompiledRule> rules;

    CompiledCompletionProfile(
            CompletionProfileDefinition definition,
            String curriculumGeneration,
            List<String> goalIds,
            int[][] prerequisites,
            int[] topologicalOrder,
            Set<String> targetGoalIds,
            Set<String> assessmentGoalIds,
            Set<String> protectedGoalIds,
            List<CompiledRule> rules) {
        this.definition = definition;
        this.curriculumGeneration = curriculumGeneration;
        this.goalIds = List.copyOf(goalIds);
        Map<String, Integer> index = new LinkedHashMap<>();
        for (int i = 0; i < goalIds.size(); i++) index.put(goalIds.get(i), i);
        this.indices = Collections.unmodifiableMap(index);
        this.prerequisites = new int[prerequisites.length][];
        for (int i = 0; i < prerequisites.length; i++) this.prerequisites[i] = prerequisites[i].clone();
        this.topologicalOrder = topologicalOrder.clone();
        this.targetGoalIds = immutableSet(targetGoalIds);
        this.assessmentGoalIds = immutableSet(assessmentGoalIds);
        this.protectedGoalIds = immutableSet(protectedGoalIds);
        this.rules = List.copyOf(rules);
    }

    static <T> Set<T> immutableSet(Set<T> values) {
        return Collections.unmodifiableSet(new LinkedHashSet<>(values));
    }

    public CompletionProfileDefinition definition() { return definition; }
    public CompletionProfileDefinition profile() { return definition; }
    public String curriculumGeneration() { return curriculumGeneration; }
    public List<String> goalIds() { return goalIds; }
    public Set<String> contextGoalIds() { return indices.keySet(); }
    public Set<String> targetGoalIds() { return targetGoalIds; }
    public Set<String> assessmentGoalIds() { return assessmentGoalIds; }
    public Set<String> requiredAssessmentGoalIds() { return assessmentGoalIds; }
    public Set<String> protectedGoalIds() { return protectedGoalIds; }
    public long expandedEdgeCount() {
        long count = 0;
        for (int[] row : prerequisites) count += row.length;
        return count;
    }

    /** Direct expanded edges; reachability is derived, not stored quadratically. */
    public List<String> directPrerequisites(String goalId) {
        Integer index = indices.get(goalId);
        if (index == null) return List.of();
        return java.util.Arrays.stream(prerequisites[index]).mapToObj(goalIds::get).toList();
    }

    int size() { return goalIds.size(); }
    int index(String id) { return indices.getOrDefault(id, -1); }
    int[] prerequisiteIndices(int index) { return prerequisites[index]; }
    int[] order() { return topologicalOrder; }
    List<CompiledRule> rules() { return rules; }

    record CompiledRule(String ruleId, List<Integer> assessmentIndices, List<Integer> waivableIndices,
                        List<String> assessmentGoalIds) {
        CompiledRule {
            assessmentIndices = List.copyOf(assessmentIndices);
            waivableIndices = List.copyOf(waivableIndices);
            assessmentGoalIds = List.copyOf(assessmentGoalIds);
        }
    }
}
