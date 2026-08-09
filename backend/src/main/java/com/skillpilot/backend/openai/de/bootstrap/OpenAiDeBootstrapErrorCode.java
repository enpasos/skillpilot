package com.skillpilot.backend.openai.de.bootstrap;

/** Identifier-free errors exposed by the bootstrap core. */
public enum OpenAiDeBootstrapErrorCode {
    INVALID_REQUEST,
    INVALID_CAPABILITY,
    OAUTH_AUTHORIZATION_INVALID,
    POLICY_UNAVAILABLE,
    RATE_LIMITED,
    IDEMPOTENCY_KEY_REUSED,
    PROFILE_UNAVAILABLE,
    RETRY_EXPIRED,
    DELIVERY_EXPIRED,
    DELIVERY_UNAVAILABLE
}
