package com.skillpilot.backend.completion;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

    public record WaiverReason(String ruleId, List<String> assessmentGoalIds) {
        public WaiverReason { assessmentGoalIds = List.copyOf(assessmentGoalIds); }
    }
}
