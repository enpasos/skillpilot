package com.skillpilot.backend.api;

import java.time.Instant;
import java.util.List;

/**
 * Atomic assessment of one ordered, server-issued recall batch.
 *
 * <p>{@code cardIds} is the immutable authoritative batch. {@code results}
 * must contain exactly the same IDs in exactly the same order.</p>
 */
public record VerifiedRecallBatchResultRequest(
        String goalId,
        int configuredBatchSize,
        List<String> cardIds,
        Instant issuedAt,
        List<VerifiedRecallBatchCardResult> results) {
}
