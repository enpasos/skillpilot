package com.skillpilot.backend.openai.de.bootstrap;

/** Deliberately contains no request identifiers or secret material. */
public final class OpenAiDeBootstrapException extends RuntimeException {

    private final OpenAiDeBootstrapErrorCode code;

    public OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode code) {
        super(code.name());
        this.code = code;
    }

    public OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode code, Throwable cause) {
        super(code.name(), cause);
        this.code = code;
    }

    public OpenAiDeBootstrapErrorCode code() {
        return code;
    }
}
