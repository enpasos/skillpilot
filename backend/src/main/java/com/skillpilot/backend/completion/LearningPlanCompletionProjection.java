package com.skillpilot.backend.completion;

import com.skillpilot.backend.domain.Mastery;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Function;

/** Evaluates complete plan obligations using authoritative semantics, never the active coach route. */
public final class LearningPlanCompletionProjection {
    private static final int MAX_CONTEXTS = 32;
    private static final long MAX_NODES = 100_000;
    private static final long MAX_EDGES = 500_000;
    private final CompletionProfileCompiler compiler = new CompletionProfileCompiler();
    private final CompletionEvaluator evaluator = new CompletionEvaluator();
    private final Map<Key, CompiledCompletionGraph> cache = new LinkedHashMap<>(16, .75f, true);
    private long nodes;
    private long edges;

    public Set<String> waivedGoals(LearningPlanCompletionContext context, Set<String> obligations,
            Function<Set<String>, Map<String, Double>> masterySnapshot) {
        if (context == null || obligations.isEmpty()
                || context.semantics() == LearningPlanCompletionContext.Semantics.REVIEWED_RULES
                        && context.reviewedProfiles().isEmpty()) return Set.of();
        CompiledCompletionGraph graph = compiled(context, obligations);
        Map<String, Double> mastery = java.util.Objects.requireNonNull(
                masterySnapshot.apply(graph.contextGoalIds()), "Plan completion mastery is unavailable");
        Set<String> mastered = new TreeSet<>();
        mastery.forEach((id, value) -> { if (Mastery.isMastered(value)) mastered.add(id); });
        CompletionEvaluation evaluation = graph instanceof CompiledAutomaticCompletion automatic
                ? evaluator.evaluateAutomatic(automatic, mastered) : evaluator.evaluateGraph(graph, mastered);
        Set<String> waived = new TreeSet<>(evaluation.waivedGoalIds());
        waived.retainAll(obligations);
        return Set.copyOf(waived);
    }

    private synchronized CompiledCompletionGraph compiled(LearningPlanCompletionContext context,
            Set<String> obligations) {
        boolean automatic = context.semantics() == LearningPlanCompletionContext.Semantics.AUTOMATIC;
        // A dated plan schedules work; it does not close the scope of its consumers.
        // Automatic demand therefore belongs to the full Personal Curriculum. Only
        // the returned result is restricted to this plan's obligations above.
        Set<String> targets = automatic ? automaticTargets(context) : Set.copyOf(obligations);
        if (automatic && !targets.containsAll(obligations)) {
            throw new CompletionCompilationException("FOREIGN_TARGET",
                    "Plan obligations must be atomic targets of the Personal Curriculum");
        }
        Key key = new Key(context.curriculumId(), context.generation(), targets,
                context.level2TargetGoalIds(), context.semantics(), context.reviewedProfiles().stream()
                        .map(p -> p.definition().id() + ":" + p.definition().revision()).sorted().toList());
        CompiledCompletionGraph graph = cache.get(key);
        if (graph != null) return graph;
        graph = automatic
                ? compiler.compileAutomatic(context.canonicalGoals(), targets, context.level2TargetGoalIds(),
                        context.generation())
                : compiler.compilePlan(context, obligations);
        if (graph.size() > MAX_NODES || graph.expandedEdgeCount() > MAX_EDGES) {
            throw new IllegalStateException("Learning-plan completion context exceeds its graph budget");
        }
        while (!cache.isEmpty() && (cache.size() >= MAX_CONTEXTS || nodes + graph.size() > MAX_NODES
                || edges + graph.expandedEdgeCount() > MAX_EDGES)) {
            CompiledCompletionGraph removed = cache.remove(cache.keySet().iterator().next());
            nodes -= removed.size();
            edges -= removed.expandedEdgeCount();
        }
        cache.put(key, graph);
        nodes += graph.size();
        edges += graph.expandedEdgeCount();
        return graph;
    }

    private Set<String> automaticTargets(LearningPlanCompletionContext context) {
        Set<String> targets = new TreeSet<>();
        for (String id : context.level2TargetGoalIds()) {
            var goal = context.canonicalGoals().get(id);
            if (goal == null) {
                throw new CompletionCompilationException("MISSING_REFERENCE", "Unknown Personal Curriculum target " + id);
            }
            if (goal.getContains() == null || goal.getContains().isEmpty()) targets.add(id);
        }
        return Set.copyOf(targets);
    }

    private record Key(String curriculumId, String generation, Set<String> obligations,
            Set<String> level2Targets, LearningPlanCompletionContext.Semantics semantics,
            java.util.List<String> reviewedProfiles) { }
}
