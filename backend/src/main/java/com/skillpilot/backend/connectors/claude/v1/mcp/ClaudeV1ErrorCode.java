package com.skillpilot.backend.connectors.claude.v1.mcp;

/**
 * Machine-readable error codes returned by Claude v1 tools.
 *
 * <p>Tool errors report one of these codes plus a fixed, non-reflective message. Internal
 * exception text never reaches the client: it can carry connection identifiers, SQL fragments or
 * learner references, none of which belong in a model-visible response.</p>
 */
public enum ClaudeV1ErrorCode {

    /** Arguments were missing, malformed or outside the allowed set. */
    INVALID_INPUT,

    /** No usable connection, or the presented scope does not cover this tool. */
    UNAUTHORIZED,

    /** The learner state does not permit this operation right now. */
    CONFLICT,

    /** {@code expectedStateVersion} no longer matches the canonical revision. */
    STALE_STATE,

    /** A capability was missing, expired, forged, or bound to a different context. */
    CAPABILITY_MISMATCH,

    /** The caller exceeded the configured request budget. */
    RATE_LIMITED,

    /** The operation failed for a reason the caller cannot act on. */
    INTERNAL_ERROR
}
