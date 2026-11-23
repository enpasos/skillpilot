package com.skillpilot.backend.api;

import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * The Cockpit's card state of one deck goal.
 *
 * @param lockedCardIds ids of the deck goal's cards that the release rule keeps out of the learner's
 *        box (issue #85): their understanding goals are not passed yet. Always present, empty when none.
 */
public record ClientStateSnapshot(
        Instant updatedAt,
        Map<String, Object> srsState,
        List<String> lockedCardIds) {

    public ClientStateSnapshot {
        lockedCardIds = lockedCardIds == null ? List.of() : List.copyOf(lockedCardIds);
    }

    public ClientStateSnapshot(Instant updatedAt, Map<String, Object> srsState) {
        this(updatedAt, srsState, List.of());
    }
}
