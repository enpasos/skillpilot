package com.skillpilot.backend.service.srs;

import java.util.Set;

/**
 * The release rule of issue #85 for one learner and request.
 *
 * <p>A card enters the box only when every one of its understanding goals that
 * counts for the learner is passed. Counted goals are the learner-facing
 * target goals of the current projection (prerequisite-only entries excluded).
 * Passed goals are the learner's own stored mastery at the existing threshold
 * and the evidence-backed unit planning credits (gray check). A card without
 * an understanding goal, or with none that counts, is released, which keeps
 * language and legacy decks on their former behaviour.</p>
 */
public record SrsCardRelease(Set<String> countedGoalIds, Set<String> passedGoalIds) {

    private static final SrsCardRelease ALL = new SrsCardRelease(Set.of(), Set.of());

    public SrsCardRelease {
        countedGoalIds = countedGoalIds == null ? Set.of() : countedGoalIds;
        passedGoalIds = passedGoalIds == null ? Set.of() : passedGoalIds;
    }

    /** Releases every card; used where the learner has no curriculum projection. */
    public static SrsCardRelease all() {
        return ALL;
    }

    public boolean isReleased(SrsCard card) {
        if (card == null) {
            return false;
        }
        for (String goalId : card.understandingGoalIds()) {
            if (countedGoalIds.contains(goalId) && !passedGoalIds.contains(goalId)) {
                return false;
            }
        }
        return true;
    }
}
