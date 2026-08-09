package com.skillpilot.backend.openai.de.bootstrap;

import java.time.Instant;

/** Secret-bearing issuer result; adapters must place the capability only in result metadata. */
public record OpenAiDeBootstrapCapabilityIssueResult(
        String setupCapability,
        Instant expiresAt,
        int contractMajor,
        String providerNoticeVersion,
        long policyRevision,
        String sourceMajorDecision) {
}
