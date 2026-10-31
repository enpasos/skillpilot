package com.skillpilot.backend.completion;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** Linear work-discharge evaluation over one immutable compiled context and binary mastery. */
public final class CompletionEvaluator {
    /**
     * Open assessments retain direct prerequisite demand. Mastered nodes stop
     * that demand, so no transitive consumer relation is precomputed or applied.
     * Every remaining unmastered ordinary node is implicitly complete in this
     * context, even when no mastery or assessment exists in the context.
     */
    public CompletionEvaluation evaluateAutomatic(CompiledAutomaticCompletion graph, Set<String> mastery) {
        return evaluateAutomaticGraph(graph, mastery);
    }

    private CompletionEvaluation evaluateAutomaticGraph(CompiledCompletionGraph graph, Set<String> mastery) {
        Objects.requireNonNull(graph, "graph");
        Objects.requireNonNull(mastery, "mastery");
        boolean[] mastered = new boolean[graph.size()];
        boolean[] needed = new boolean[graph.size()];
        int[] blockingAssessment = new int[graph.size()];
        java.util.Arrays.fill(blockingAssessment, -1);
        java.util.ArrayDeque<Integer> pending = new java.util.ArrayDeque<>();
        for (int i = 0; i < graph.size(); i++) {
            String id = graph.goalIds().get(i);
            mastered[i] = mastery.contains(id);
            if (!mastered[i] && graph.assessmentGoalIds().contains(id)) {
                needed[i] = true;
                blockingAssessment[i] = i;
                pending.addLast(i);
            }
        }
        while (!pending.isEmpty()) {
            int consumer = pending.removeFirst();
            for (int prerequisite : graph.prerequisiteIndices(consumer)) {
                if (mastered[prerequisite] || needed[prerequisite]) continue;
                needed[prerequisite] = true;
                blockingAssessment[prerequisite] = blockingAssessment[consumer];
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
            else if (!needed[i]) {
                waivedIds.add(id);
                reasons.put(id, reason);
            } else if (!graph.assessmentGoalIds().contains(id)) {
                blockers.put(id, graph.goalIds().get(blockingAssessment[i]));
            }
            if (graph.targetGoalIds().contains(id)) {
                if (mastered[i]) masteredTargetCount++;
                else if (!needed[i]) waivedTargetCount++;
                else pendingTargets.add(id);
            }
            if (mastered[i] && graph.assessmentGoalIds().contains(id)) passedAssessments.add(id);
        }
        return new CompletionEvaluation(masteredIds, waivedIds, pendingTargets, passedAssessments, reasons, blockers,
                pendingTargets.isEmpty() && passedAssessments.size() == graph.assessmentGoalIds().size(),
                graph.targetGoalIds().size(), masteredTargetCount, waivedTargetCount, graph.assessmentGoalIds().size());
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
