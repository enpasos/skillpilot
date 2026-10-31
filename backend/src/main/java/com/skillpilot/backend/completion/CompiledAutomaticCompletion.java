package com.skillpilot.backend.completion;

import java.util.List;
import java.util.Set;

/** Immutable automatic completion context; no manual profile or coverage grant is required. */
public final class CompiledAutomaticCompletion extends CompiledCompletionGraph {
    private final String curriculumGeneration;

    CompiledAutomaticCompletion(CompiledCompletionGraph graph, Set<String> assessments,
            String curriculumGeneration) {
        super(graph.goalIds(), java.util.stream.IntStream.range(0, graph.size())
                        .mapToObj(graph::prerequisiteIndices).toArray(int[][]::new),
                graph.order(), graph.targetGoalIds(), assessments, assessments, List.of());
        this.curriculumGeneration = curriculumGeneration;
    }

    public String curriculumGeneration() { return curriculumGeneration; }
}
