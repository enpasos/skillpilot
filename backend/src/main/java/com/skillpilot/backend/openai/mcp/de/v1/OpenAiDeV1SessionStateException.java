package com.skillpilot.backend.openai.mcp.de.v1;

/** Stable V1 state errors that callers can recover from without parsing prose. */
public final class OpenAiDeV1SessionStateException extends RuntimeException {

    public enum Code {
        STATE_VERSION_CONFLICT,
        IDEMPOTENCY_KEY_REUSED,
        SESSION_VERSION_UNAVAILABLE,
        SESSION_RENEWAL_REQUIRED
    }

    private final Code code;
    private final OpenAiDeV1SessionMetadata metadata;

    public OpenAiDeV1SessionStateException(
            Code code,
            OpenAiDeV1SessionMetadata metadata,
            String message) {
        super(message);
        this.code = code;
        this.metadata = metadata;
    }

    public Code code() {
        return code;
    }

    public OpenAiDeV1SessionMetadata metadata() {
        return metadata;
    }
}
