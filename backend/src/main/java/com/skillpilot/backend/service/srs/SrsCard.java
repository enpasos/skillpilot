package com.skillpilot.backend.service.srs;

import java.util.List;

/**
 * One immutable card of a parsed deck.
 *
 * <p>{@code tags} keeps the authored list or {@code null} when the card has none;
 * goal selection tags ({@code select:*}) distinguish the two cases. The
 * understanding goals are the authored {@code originGoalIds} or, for decks that
 * do not carry that field yet, the {@code goal:<id>} tags.</p>
 */
public record SrsCard(
        String id,
        String front,
        String back,
        String category,
        List<String> tags,
        List<String> understandingGoalIds) {

    public SrsCard {
        tags = tags == null ? null : List.copyOf(tags);
        understandingGoalIds = understandingGoalIds == null ? List.of() : List.copyOf(understandingGoalIds);
    }
}
