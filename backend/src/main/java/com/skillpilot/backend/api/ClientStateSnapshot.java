package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * The Cockpit's card state of one deck goal.
 *
 * @param lockedCardIds ids of the deck goal's cards that the release rule keeps out of the learner's
 *        box. Always present, empty when none.
 * @param excludedCardIds cards that do not count toward this deck for the learner's explicit subject scope
 */
public record ClientStateSnapshot(
        Instant updatedAt,
        Map<String, Object> srsState,
        List<String> lockedCardIds,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) List<String> excludedCardIds) {

    public ClientStateSnapshot {
        lockedCardIds = lockedCardIds == null ? List.of() : List.copyOf(lockedCardIds);
        excludedCardIds = excludedCardIds == null ? List.of() : List.copyOf(excludedCardIds);
    }

    public ClientStateSnapshot(Instant updatedAt, Map<String, Object> srsState, List<String> lockedCardIds) {
        this(updatedAt, srsState, lockedCardIds, List.of());
    }

    public ClientStateSnapshot(Instant updatedAt, Map<String, Object> srsState) {
        this(updatedAt, srsState, List.of());
    }
}
