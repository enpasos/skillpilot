package com.skillpilot.backend.service.srs;

import java.util.List;
import java.util.Set;

/**
 * The release rule of issue #85 for one learner and request.
 *
 * <p>A card enters the box only when every one of its understanding goals that
 * counts for the learner is passed. Counted goals are the learner-facing
 * target goals of the current projection (prerequisite-only entries excluded).
 * Passed goals are the learner's own stored mastery at the existing threshold
 * and the evidence-backed unit planning credits (gray check). A learner's
 * explicit extension choice limits the decks of that subject to cards
 * attached to at least one counted goal. Other decks keep their former
 * treatment of cards without origins or whose origins are outside scope.</p>
 */
public record SrsCardRelease(Set<String> countedGoalIds, Set<String> passedGoalIds,
        boolean restrictToCountedOrigins) {

    private static final SrsCardRelease ALL = new SrsCardRelease(Set.of(), Set.of());

    public SrsCardRelease {
        countedGoalIds = countedGoalIds == null ? Set.of() : countedGoalIds;
        passedGoalIds = passedGoalIds == null ? Set.of() : passedGoalIds;
    }

    public SrsCardRelease(Set<String> countedGoalIds, Set<String> passedGoalIds) {
        this(countedGoalIds, passedGoalIds, false);
    }

    /** Releases every card; used where the learner has no curriculum projection. */
    public static SrsCardRelease all() {
        return ALL;
    }

    /** Applies the explicit-extension policy to the deck of the affected subject. */
    public SrsCardRelease forExplicitExtensions() {
        return new SrsCardRelease(countedGoalIds, passedGoalIds, true);
    }

    public boolean countsCard(SrsCard card) {
        return card != null && (!restrictToCountedOrigins
                || card.understandingGoalIds().stream().anyMatch(countedGoalIds::contains));
    }

    /** Deck order is retained for practice, recall and the derived mastery outcome. */
    public List<SrsCard> countedCards(List<SrsCard> cards) {
        return restrictToCountedOrigins ? cards.stream().filter(this::countsCard).toList() : cards;
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
