package com.skillpilot.backend.domain;

/** Monotone lifecycle of one opaque direct-start capability. */
public enum OpenAiDeBootstrapCapabilityStatus {
    ISSUED,
    BOUND,
    CONSUMED,
    INVALIDATED_TERMINAL
}
