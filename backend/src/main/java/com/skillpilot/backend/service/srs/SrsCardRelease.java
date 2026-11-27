package com.skillpilot.backend.service.srs;

import java.util.List;
import java.util.Set;

/**
 * The release rule of issue #85 for one learner and request.
 *
 * <p>A card enters the box only when every one of its understanding goals that
 * counts for the learner is passed. Counted goals are the learner-facing
 * targets of the current projection and extension goals still required as preparations.
 * Passed goals are the learner's own stored mastery at the existing threshold
 * and the evidence-backed unit planning credits (gray check). A learner's
 * extension choice can exclude a card whose understanding goals were all
 * removed by that choice. Cards without understanding goals stay in the deck.</p>
 */
public record SrsCardRelease(Set<String> countedGoalIds, Set<String> passedGoalIds,
        Set<String> removedOriginGoalIds) {

    private static final SrsCardRelease ALL = new SrsCardRelease(Set.of(), Set.of());

    public SrsCardRelease {
        countedGoalIds = countedGoalIds == null ? Set.of() : countedGoalIds;
        passedGoalIds = passedGoalIds == null ? Set.of() : passedGoalIds;
        removedOriginGoalIds = removedOriginGoalIds == null ? Set.of() : removedOriginGoalIds;
    }

    public SrsCardRelease(Set<String> countedGoalIds, Set<String> passedGoalIds) {
        this(countedGoalIds, passedGoalIds, Set.of());
    }

    /** Releases every card; used where the learner has no curriculum projection. */
    public static SrsCardRelease all() {
        return ALL;
    }

    public SrsCardRelease excludingRemovedOrigins(Set<String> removedGoalIds) {
        return new SrsCardRelease(countedGoalIds, passedGoalIds, removedGoalIds);
    }

    public boolean countsCard(SrsCard card) {
        if (card == null) return false;
        List<String> origins = card.understandingGoalIds();
        return origins.isEmpty() || !removedOriginGoalIds.containsAll(origins);
    }

    /** Deck order is retained for practice, recall and the derived mastery outcome. */
    public List<SrsCard> countedCards(List<SrsCard> cards) {
        return removedOriginGoalIds.isEmpty() ? cards : cards.stream().filter(this::countsCard).toList();
    }

    public boolean isReleased(SrsCard card) {
        if (!countsCard(card)) {
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
