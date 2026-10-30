package com.skillpilot.backend.completion;

import com.skillpilot.backend.domain.Learner;

/** One derived plan/navigation decision; never overwrites the learner's preference. */
public final class CompletionNavigationPolicy {
    private CompletionNavigationPolicy() { }
    public static boolean ownsNavigation(Learner learner) {
        return learner != null && learner.getCompletionWorkflow() != null
                && !learner.getCompletionWorkflow().isBlank();
    }
    public static boolean followsPlans(Learner learner) {
        return learner != null && Boolean.TRUE.equals(learner.getFollowLearningPlans()) && !ownsNavigation(learner);
    }
}
