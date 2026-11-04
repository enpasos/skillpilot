package com.skillpilot.backend.completion;

import java.util.ArrayDeque;
import java.util.Set;
import java.util.TreeSet;

/** Static demand coverage; compilation and direct examination access remain separate. */
public final class AutomaticCompletionIntegrity {
    private AutomaticCompletionIntegrity() { }

    /** Targets which would disappear at zero mastery because no protected root needs them. */
    public static Set<String> uncoveredTargets(CompiledAutomaticCompletion graph) {
        return uncoveredTargets((CompiledCompletionGraph) graph);
    }

    public static Set<String> uncoveredTargets(CompiledCompletionProfile graph) {
        return uncoveredTargets((CompiledCompletionGraph) graph);
    }

    static Set<String> uncoveredTargets(CompiledCompletionGraph graph) {
        boolean[] reached = new boolean[graph.size()];
        ArrayDeque<Integer> pending = new ArrayDeque<>();
        Set<String> roots = graph instanceof CompiledAutomaticCompletion
                || graph instanceof CompiledCompletionProfile profile && profile.automatic()
                        ? graph.protectedTargetGoalIds() : graph.protectedGoalIds();
        for (String root : roots) pending.add(graph.index(root));
        while (!pending.isEmpty()) {
            int goal = pending.removeFirst();
            if (reached[goal]) continue;
            reached[goal] = true;
            for (int prerequisite : graph.prerequisiteIndices(goal)) pending.addLast(prerequisite);
        }
        Set<String> uncovered = new TreeSet<>();
        for (String target : graph.targetGoalIds()) if (!reached[graph.index(target)]) uncovered.add(target);
        return Set.copyOf(uncovered);
    }

    static void requireCoveredTargets(CompiledCompletionGraph graph) {
        Set<String> uncovered = uncoveredTargets(graph);
        if (!uncovered.isEmpty()) throw new CompletionCompilationException("UNCOVERED_COMPLETION_TARGETS",
                "Personal Curriculum targets have no assessment or memory demand: "
                        + uncovered.stream().sorted().limit(8).toList() + " (" + uncovered.size() + " targets)");
    }
}
