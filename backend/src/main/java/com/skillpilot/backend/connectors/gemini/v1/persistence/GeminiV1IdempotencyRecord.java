package com.skillpilot.backend.connectors.gemini.v1.persistence;

import java.time.Instant;
import java.util.Objects;

/**
 * One recorded write for exact-once replay.
 *
 * <p>{@code responsePayload} holds only the bounded state projection that was already returned to
 * the client — never chat content, learner answers, recall solutions or exam rubrics.
 * {@code stateVersion} is the canonical revision after the write, so a replay reports the same
 * version the original call did.</p>
 */
public record GeminiV1IdempotencyRecord(
        String tokenHash,
        String clientRequestId,
        String toolName,
        String requestHash,
        String responsePayload,
        long stateVersion,
        Instant createdAt,
        Instant expiresAt) {

    public GeminiV1IdempotencyRecord {
        Objects.requireNonNull(tokenHash, "tokenHash");
        Objects.requireNonNull(clientRequestId, "clientRequestId");
        Objects.requireNonNull(toolName, "toolName");
        Objects.requireNonNull(requestHash, "requestHash");
        Objects.requireNonNull(createdAt, "createdAt");
        Objects.requireNonNull(expiresAt, "expiresAt");
    }
}
