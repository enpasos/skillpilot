package com.skillpilot.backend.service.srs;

/** Technical input failure; it is never an unmastered learning-goal result. */
public final class SrsStateUnavailableException extends IllegalStateException {
    public SrsStateUnavailableException(String message) {
        super(message);
    }

    public SrsStateUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
