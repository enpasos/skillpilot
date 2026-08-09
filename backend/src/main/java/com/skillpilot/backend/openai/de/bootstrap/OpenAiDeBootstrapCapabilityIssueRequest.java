package com.skillpilot.backend.openai.de.bootstrap;

/** Model-independent input to the app-only capability issuer. */
public record OpenAiDeBootstrapCapabilityIssueRequest(
        String providerNoticeVersion,
        Boolean providerEligibilityConfirmed,
        String sourceMajorDecision) {
}
