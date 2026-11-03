package com.skillpilot.backend.completion;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** Linear work-discharge evaluation over one immutable compiled context and binary mastery. */
public final class CompletionEvaluator {
    /**
     * Open selected assessments and memory goals root direct prerequisite demand.
     * Mastered nodes stop that demand, so no transitive consumer relation is stored.
     * Unneeded ordinary nodes are implicitly complete; protected support is never
     * implicit and does not independently enlarge the selected completion contract.
     */
    public CompletionEvaluation evaluateAutomatic(CompiledAutomaticCompletion graph, Set<String> mastery) {
        return evaluateAutomaticGraph(graph, mastery);
    }

    private CompletionEvaluation evaluateAutomaticGraph(CompiledCompletionGraph graph, Set<String> mastery) {
        Objects.requireNonNull(graph, "graph");
        Objects.requireNonNull(mastery, "mastery");
        if (!AutomaticCompletionIntegrity.uncoveredTargets(graph).isEmpty()) {
            // Authoring faults must not create implicit credit. Known explicit
            // target results remain true independently of graph-quality approval.
            if (mastery.containsAll(graph.targetGoalIds())) return evaluateExplicitTargets(graph, mastery);
            AutomaticCompletionIntegrity.requireCoveredTargets(graph);
        }
        boolean[] mastered = new boolean[graph.size()];
        boolean[] needed = new boolean[graph.size()];
        int[] blockingObligation = new int[graph.size()];
        java.util.Arrays.fill(blockingObligation, -1);
        java.util.ArrayDeque<Integer> pending = new java.util.ArrayDeque<>();
        for (int i = 0; i < graph.size(); i++) {
            String id = graph.goalIds().get(i);
            mastered[i] = mastery.contains(id);
            if (!mastered[i] && graph.protectedTargetGoalIds().contains(id)) {
                needed[i] = true;
                blockingObligation[i] = i;
                pending.addLast(i);
            }
        }
        while (!pending.isEmpty()) {
            int consumer = pending.removeFirst();
            for (int prerequisite : graph.prerequisiteIndices(consumer)) {
                if (mastered[prerequisite] || needed[prerequisite]) continue;
                needed[prerequisite] = true;
                blockingObligation[prerequisite] = blockingObligation[consumer];
                pending.addLast(prerequisite);
            }
        }

        Set<String> masteredIds = new LinkedHashSet<>();
        Set<String> waivedIds = new LinkedHashSet<>();
        Set<String> pendingTargets = new LinkedHashSet<>();
        Set<String> passedAssessments = new LinkedHashSet<>();
        Map<String, CompletionEvaluation.WaiverReason> reasons = new LinkedHashMap<>();
        Map<String, String> blockers = new LinkedHashMap<>();
        var reason = new CompletionEvaluation.WaiverReason("no_remaining_demand", java.util.List.of());
        int masteredTargetCount = 0;
        int waivedTargetCount = 0;
        for (int i = 0; i < graph.size(); i++) {
            String id = graph.goalIds().get(i);
            if (mastered[i]) masteredIds.add(id);
            else if (!needed[i] && !graph.protectedGoalIds().contains(id)) {
                waivedIds.add(id);
                reasons.put(id, reason);
            } else if (!graph.protectedGoalIds().contains(id)) {
                blockers.put(id, graph.goalIds().get(blockingObligation[i]));
            }
            if (graph.targetGoalIds().contains(id)) {
                if (mastered[i]) masteredTargetCount++;
                else if (waivedIds.contains(id)) waivedTargetCount++;
                else pendingTargets.add(id);
            }
            if (mastered[i] && graph.assessmentGoalIds().contains(id)) passedAssessments.add(id);
        }
        return new CompletionEvaluation(masteredIds, waivedIds, pendingTargets, passedAssessments, reasons, blockers,
                pendingTargets.isEmpty(),
                graph.targetGoalIds().size(), masteredTargetCount, waivedTargetCount, graph.assessmentGoalIds().size());
    }

    /** Explicit-only evidence remains usable under static authoring faults; no support is discharged. */
    CompletionEvaluation evaluateExplicitTargets(CompiledCompletionGraph graph, Set<String> mastery) {
        if (!mastery.containsAll(graph.targetGoalIds())) {
            throw new IllegalArgumentException("Every selected target must be explicitly mastered");
        }
        Set<String> mastered = new LinkedHashSet<>(graph.contextGoalIds());
        mastered.retainAll(mastery);
        Set<String> assessments = new LinkedHashSet<>(graph.assessmentGoalIds());
        assessments.retainAll(mastery);
        return new CompletionEvaluation(mastered, Set.of(), Set.of(), assessments, Map.of(), Map.of(), true,
                graph.targetGoalIds().size(), graph.targetGoalIds().size(), 0, graph.assessmentGoalIds().size());
    }

    public CompletionEvaluation evaluate(CompiledCompletionProfile profile, Set<String> mastery) {
        Objects.requireNonNull(profile, "profile");
        return profile.automatic() ? evaluateAutomaticGraph(profile, mastery) : evaluateGraph(profile, mastery);
    }

    CompletionEvaluation evaluateGraph(CompiledCompletionGraph profile, Set<String> mastery) {
        Objects.requireNonNull(profile, "profile");
        Objects.requireNonNull(mastery, "mastery");
        int n = profile.size();
        boolean[] mastered = new boolean[n];
        boolean[] done = new boolean[n];
        boolean[] eligible = new boolean[n];
        int[] blocker = new int[n];
        java.util.Arrays.fill(blocker, -1);
        CompletionEvaluation.WaiverReason[] reason = new CompletionEvaluation.WaiverReason[n];
        for (int i = 0; i < n; i++) mastered[i] = mastery.contains(profile.goalIds().get(i));

        // Compiler sorts rules by ID: the first enabled reason is stable across input ordering.
        for (var rule : profile.rules()) {
            boolean enabled = true;
            for (int index : rule.assessmentIndices()) enabled &= mastered[index];
            if (!enabled) continue;
            var why = new CompletionEvaluation.WaiverReason(rule.ruleId(), rule.assessmentGoalIds());
            for (int index : rule.waivableIndices()) {
                eligible[index] = true;
                if (reason[index] == null) reason[index] = why;
            }
        }

        for (int v : profile.order()) {
            done[v] = mastered[v] || eligible[v] && blocker[v] == -1;
            int unresolved = blocker[v];
            if (!done[v] && profile.carriesDemand(profile.goalIds().get(v))) unresolved = minimum(unresolved, v);
            if (unresolved == -1) continue;
            for (int prerequisite : profile.prerequisiteIndices(v)) {
                // Carry open transitive consumers through mastered intermediate goals as well.
                blocker[prerequisite] = minimum(blocker[prerequisite], unresolved);
            }
        }

        Set<String> masteredIds = new LinkedHashSet<>();
        Set<String> waivedIds = new LinkedHashSet<>();
        Set<String> pending = new LinkedHashSet<>();
        Set<String> passedAssessments = new LinkedHashSet<>();
        Map<String, CompletionEvaluation.WaiverReason> reasons = new LinkedHashMap<>();
        Map<String, String> blockers = new LinkedHashMap<>();
        int masteredTargetCount = 0;
        int waivedTargetCount = 0;
        for (int i = 0; i < n; i++) {
            String id = profile.goalIds().get(i);
            if (mastered[i]) masteredIds.add(id);
            if (done[i] && !mastered[i]) {
                waivedIds.add(id);
                reasons.put(id, reason[i]);
            } else if (!mastered[i] && eligible[i] && blocker[i] >= 0) {
                blockers.put(id, profile.goalIds().get(blocker[i]));
            }
            if (profile.targetGoalIds().contains(id)) {
                if (mastered[i]) masteredTargetCount++;
                else if (done[i]) waivedTargetCount++;
                else pending.add(id);
            }
            if (profile.assessmentGoalIds().contains(id) && mastered[i]) passedAssessments.add(id);
        }
        boolean complete = pending.isEmpty() && passedAssessments.size() == profile.assessmentGoalIds().size();
        return new CompletionEvaluation(masteredIds, waivedIds, pending, passedAssessments, reasons, blockers,
                complete, profile.targetGoalIds().size(), masteredTargetCount, waivedTargetCount,
                profile.assessmentGoalIds().size());
    }

    private static int minimum(int a, int b) {
        if (a == -1) return b;
        if (b == -1) return a;
        return Math.min(a, b); // Indices follow canonical-ID order.
    }
}
