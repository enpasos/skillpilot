package com.skillpilot.backend.service.srs;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Personal understanding evidence used for release, deck completion and unit recall. */
public record SrsCardRelease(Set<String> countedGoalIds, Set<String> regularGoalIds, Set<String> voluntaryGoalIds,
        Set<String> passedGoalIds, Map<String, Instant> savedDeckResults) {
    private static final SrsCardRelease ALL = new SrsCardRelease(Set.of(), Set.of());

    public SrsCardRelease(Set<String> countedGoalIds, Set<String> passedGoalIds) {
        this(countedGoalIds, countedGoalIds, Set.of(), passedGoalIds, Map.of());
    }

    public SrsCardRelease {
        countedGoalIds = countedGoalIds == null ? Set.of() : countedGoalIds;
        regularGoalIds = regularGoalIds == null ? Set.of() : regularGoalIds;
        voluntaryGoalIds = voluntaryGoalIds == null ? Set.of() : voluntaryGoalIds;
        passedGoalIds = passedGoalIds == null ? Set.of() : passedGoalIds;
        savedDeckResults = savedDeckResults == null ? Map.of() : savedDeckResults;
    }

    public static SrsCardRelease all() {
        return ALL;
    }

    private boolean belongsOnlyToOffers(SrsCard card) {
        return !voluntaryGoalIds.isEmpty()
                && card.understandingGoalIds().stream().anyMatch(voluntaryGoalIds::contains)
                && card.understandingGoalIds().stream().noneMatch(regularGoalIds::contains);
    }

    public boolean isReleased(SrsCard card) {
        if (card == null) return false;
        Set<String> relevant = belongsOnlyToOffers(card) ? voluntaryGoalIds : countedGoalIds;
        for (String id : card.understandingGoalIds()) {
            if (relevant.contains(id) && !passedGoalIds.contains(id)) return false;
        }
        return true;
    }

    /** A voluntary deck checks its released cards. Regular decks count their regular and legacy cards. */
    public List<SrsCard> countedDeckCards(String deckId, List<SrsCard> cards) {
        if (voluntaryGoalIds.isEmpty()) return cards;
        if (voluntaryGoalIds.contains(deckId)) return cards.stream().filter(this::isReleased).toList();
        return cards.stream().filter(card -> !belongsOnlyToOffers(card)).toList();
    }

    public boolean deckMastered(String deckId, List<SrsCard> countedCards, Map<String, SrsCardStateSummary> states) {
        if (states.isEmpty()) return false;
        Instant savedAt = savedDeckResults.get(deckId);
        if (savedAt != null) {
            // Verified Recall writes the same timestamp to the final card and the deck result.
            Instant savedMicros = savedAt.truncatedTo(ChronoUnit.MICROS);
            if (states.values().stream().anyMatch(state -> state.recallPassed() && state.recallTestedAt() != null
                    && state.recallTestedAt().truncatedTo(ChronoUnit.MICROS).equals(savedMicros))) return true;
        }
        return !countedCards.isEmpty() && countedCards.stream().allMatch(card -> {
            var state = states.get(card.id());
            return state != null && state.recallPassed();
        });
    }
}
