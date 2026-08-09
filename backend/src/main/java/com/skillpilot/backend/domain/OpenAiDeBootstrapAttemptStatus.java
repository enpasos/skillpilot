package com.skillpilot.backend.domain;

/** Recoverable and terminal states of one direct-start request binding. */
public enum OpenAiDeBootstrapAttemptStatus {
    BOUND,
    SUCCEEDED,
    FAILED_TERMINAL
}
