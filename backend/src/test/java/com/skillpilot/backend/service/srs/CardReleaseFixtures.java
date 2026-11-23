package com.skillpilot.backend.service.srs;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.service.DeckResourceService;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Test fixtures for the card release rule of issue #85.
 *
 * <p>A card enters the learner's box only once its understanding goals are
 * passed. Scenarios that practise or check the cards of a deck goal therefore
 * first pass those understanding goals, exactly as a learner would before the
 * cards become available. The understanding goals are read with the backend's
 * own deck parse ({@code originGoalIds}, tag fallback), never hard-coded.</p>
 */
public final class CardReleaseFixtures {

    private static final SrsDeckCatalog CATALOG = new SrsDeckCatalog(new ObjectMapper());

    private CardReleaseFixtures() {
    }

    /** The understanding goals of every card of the deck goal's German and English deck, in deck order. */
    public static Set<String> understandingGoalIds(
            LandscapeService landscapes, DeckResourceService decks, String deckGoalId) {
        LearningGoal goal = landscapes.getGoalDefinition(deckGoalId);
        if (goal == null || goal.getExtendedData() == null) {
            throw new IllegalArgumentException("Not a deck goal: " + deckGoalId);
        }
        Map<String, Object> extended = goal.getExtendedData();
        Set<String> goalIds = new LinkedHashSet<>();
        for (String key : List.of("vocabularySource", "vocabularySourceEn")) {
            if (!(extended.get(key) instanceof String source) || source.isBlank()) {
                continue;
            }
            SrsDeck deck = CATALOG.deck(decks.resolveDeckResource(deckGoalId, source), null);
            for (SrsCard card : deck.cards(true)) {
                goalIds.addAll(card.understandingGoalIds());
            }
        }
        if (goalIds.isEmpty()) {
            throw new IllegalStateException("The deck of " + deckGoalId + " names no understanding goal.");
        }
        return goalIds;
    }

    /**
     * Stores a passed result for every understanding goal of the deck goal's
     * cards, so every card of the deck is released. No other goal is touched,
     * no completion event is recorded and the active goal stays as it is.
     */
    public static Set<String> passUnderstandingGoals(MasteryRepository masteryRepository, Learner learner,
            LandscapeService landscapes, DeckResourceService decks, String deckGoalId) {
        Set<String> goalIds = understandingGoalIds(landscapes, decks, deckGoalId);
        for (String goalId : goalIds) {
            masteryRepository.saveAndFlush(new Mastery(learner, goalId, 1.0));
        }
        return goalIds;
    }
}
