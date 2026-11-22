package com.skillpilot.backend.completion;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.LinkedHashSet;

/** Ephemeral result. Waivers are never written to mastery or retained as learner outcomes. */
public record CompletionEvaluation(
        Set<String> masteredGoalIds,
        Set<String> waivedGoalIds,
        Set<String> pendingTargetGoalIds,
        Set<String> masteredAssessmentGoalIds,
        Map<String, WaiverReason> waiverReasons,
        Map<String, String> blockedByGoalIds,
        boolean complete,
        int targetCount,
        int masteredTargetCount,
        int waivedTargetCount,
        int requiredAssessmentCount) {
    public CompletionEvaluation {
        masteredGoalIds = CompiledCompletionProfile.immutableSet(masteredGoalIds);
        waivedGoalIds = CompiledCompletionProfile.immutableSet(waivedGoalIds);
        pendingTargetGoalIds = CompiledCompletionProfile.immutableSet(pendingTargetGoalIds);
        masteredAssessmentGoalIds = CompiledCompletionProfile.immutableSet(masteredAssessmentGoalIds);
        waiverReasons = Collections.unmodifiableMap(new LinkedHashMap<>(waiverReasons));
        blockedByGoalIds = Collections.unmodifiableMap(new LinkedHashMap<>(blockedByGoalIds));
    }

    public int pendingTargetCount() { return pendingTargetGoalIds.size(); }
    public int masteredAssessmentCount() { return masteredAssessmentGoalIds.size(); }

    /** Apply current, individually bound planning grants without changing any learner mastery. */
    public CompletionEvaluation withPlanningCredits(Map<String, WaiverReason> credits, Set<String> context,
            Set<String> targets, Set<String> protectedGoals) {
        if (credits.isEmpty()) return this;
        Set<String> waived = new LinkedHashSet<>(waivedGoalIds);
        Set<String> pending = new LinkedHashSet<>(pendingTargetGoalIds);
        Map<String, WaiverReason> reasons = new LinkedHashMap<>(waiverReasons);
        Map<String, String> blockers = new LinkedHashMap<>(blockedByGoalIds);
        for (var credit : credits.entrySet()) {
            String id = credit.getKey();
            if (!context.contains(id) || protectedGoals.contains(id) || masteredGoalIds.contains(id)) continue;
            waived.add(id);
            pending.remove(id);
            reasons.put(id, credit.getValue());
            blockers.remove(id);
        }
        int waivedTargets = (int) waived.stream().filter(targets::contains).count();
        return new CompletionEvaluation(masteredGoalIds, waived, pending, masteredAssessmentGoalIds, reasons, blockers,
                pending.isEmpty() && protectedGoals.stream().allMatch(masteredGoalIds::contains), targetCount,
                masteredTargetCount, waivedTargets, requiredAssessmentCount);
    }

    public record WaiverReason(String ruleId, List<String> assessmentGoalIds) {
        public WaiverReason { assessmentGoalIds = List.copyOf(assessmentGoalIds); }
    }
}
