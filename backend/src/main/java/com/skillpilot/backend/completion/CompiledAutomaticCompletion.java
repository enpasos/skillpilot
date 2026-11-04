package com.skillpilot.backend.completion;

import java.util.List;
import java.util.Set;

/** Immutable automatic context; protected support is classified separately from selected obligations. */
public final class CompiledAutomaticCompletion extends CompiledCompletionGraph {
    private final String curriculumGeneration;

    CompiledAutomaticCompletion(CompiledCompletionGraph graph, Set<String> assessments, Set<String> protectedGoals,
            String curriculumGeneration) {
        super(graph.goalIds(), java.util.stream.IntStream.range(0, graph.size())
                        .mapToObj(graph::prerequisiteIndices).toArray(int[][]::new),
                graph.order(), graph.targetGoalIds(), assessments, protectedGoals, List.of());
        this.curriculumGeneration = curriculumGeneration;
    }

    public String curriculumGeneration() { return curriculumGeneration; }
}
