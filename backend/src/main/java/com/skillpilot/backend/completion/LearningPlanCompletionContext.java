package com.skillpilot.backend.completion;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Authoritative static inputs for plan fulfillment, independent of coach navigation. */
public record LearningPlanCompletionContext(
        String curriculumId,
        String generation,
        Map<String, LearningGoal> canonicalGoals,
        Set<String> level2TargetGoalIds,
        List<CompiledCompletionProfile> reviewedProfiles,
        Semantics semantics,
        Set<String> requiredRegularGoalIds) {
    public enum Semantics { REVIEWED_RULES, AUTOMATIC }

    public LearningPlanCompletionContext {
        canonicalGoals = Map.copyOf(canonicalGoals);
        level2TargetGoalIds = Set.copyOf(level2TargetGoalIds);
        reviewedProfiles = List.copyOf(reviewedProfiles);
        requiredRegularGoalIds = Set.copyOf(requiredRegularGoalIds);
        java.util.Objects.requireNonNull(semantics, "semantics");
    }

    public LearningPlanCompletionContext(String curriculumId, String generation,
            Map<String, LearningGoal> canonicalGoals, Set<String> level2TargetGoalIds,
            List<CompiledCompletionProfile> reviewedProfiles, Semantics semantics) {
        this(curriculumId, generation, canonicalGoals, level2TargetGoalIds, reviewedProfiles, semantics, Set.of());
    }

    /** Historical authored-profile callers retain their exact interpretation. */
    public LearningPlanCompletionContext(String curriculumId, String generation,
            Map<String, LearningGoal> canonicalGoals, Set<String> level2TargetGoalIds,
            List<CompiledCompletionProfile> reviewedProfiles) {
        this(curriculumId, generation, canonicalGoals, level2TargetGoalIds, reviewedProfiles, Semantics.REVIEWED_RULES, Set.of());
    }

    public static LearningPlanCompletionContext automatic(String curriculumId, String generation,
            Map<String, LearningGoal> canonicalGoals, Set<String> level2TargetGoalIds) {
        return automatic(curriculumId, generation, canonicalGoals, level2TargetGoalIds, Set.of());
    }

    public static LearningPlanCompletionContext automatic(String curriculumId, String generation,
            Map<String, LearningGoal> canonicalGoals, Set<String> level2TargetGoalIds, Set<String> requiredRegularGoalIds) {
        return new LearningPlanCompletionContext(curriculumId, generation, canonicalGoals, level2TargetGoalIds,
                List.of(), Semantics.AUTOMATIC, requiredRegularGoalIds);
    }
}
