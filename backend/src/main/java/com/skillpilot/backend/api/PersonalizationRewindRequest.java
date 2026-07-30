package com.skillpilot.backend.api;

/**
 * Opaque reference to one completed or partially selected authored
 * personalization decision.
 *
 * <p>The server resolves this reference against the learner's current plan and
 * atomically reopens that decision. Clients must not reconstruct it from
 * labels, stage IDs, group IDs or selected values.</p>
 */
public record PersonalizationRewindRequest(String rewindId) {
}
