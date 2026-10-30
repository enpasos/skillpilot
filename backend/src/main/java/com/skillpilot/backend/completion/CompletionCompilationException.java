package com.skillpilot.backend.completion;

/** An authoring/input error, distinct from missing mastery and technical unavailability. */
public final class CompletionCompilationException extends IllegalArgumentException {
    private final String code;

    public CompletionCompilationException(String code, String detail) {
        super(detail);
        this.code = code;
    }

    public String code() {
        return code;
    }
}
