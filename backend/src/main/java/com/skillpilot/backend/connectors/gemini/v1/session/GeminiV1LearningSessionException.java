package com.skillpilot.backend.connectors.gemini.v1.session;

/** Fail-closed signal for a missing, malformed, unknown or expired learning session. */
public final class GeminiV1LearningSessionException extends RuntimeException {

    public enum Reason {
        REQUIRED,
        EXPIRED
    }

    private final Reason reason;

    public GeminiV1LearningSessionException(Reason reason) {
        super(reason == Reason.EXPIRED
                ? "The Gemini v1 learning session has expired."
                : "A current Gemini v1 learning session is required.");
        this.reason = reason;
    }

    public Reason reason() {
        return reason;
    }
}
