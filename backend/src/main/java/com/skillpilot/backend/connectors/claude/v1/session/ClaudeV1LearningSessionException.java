package com.skillpilot.backend.connectors.claude.v1.session;

/** Fail-closed signal for a missing, malformed, unknown or expired learning session. */
public final class ClaudeV1LearningSessionException extends RuntimeException {

    public enum Reason {
        REQUIRED,
        EXPIRED
    }

    private final Reason reason;

    public ClaudeV1LearningSessionException(Reason reason) {
        super(reason == Reason.EXPIRED
                ? "The Claude v1 learning session has expired."
                : "A current Claude v1 learning session is required.");
        this.reason = reason;
    }

    public Reason reason() {
        return reason;
    }
}

