package com.skillpilot.backend.connectors.claude.v1.web;

/** Validated first-party request for one ordinary Claude learning launch. */
public record ClaudeV1CoachStartRequest(String communicationLocale, String client,
        com.skillpilot.backend.api.CompletionAssessmentStart completionAssessment) {
    public ClaudeV1CoachStartRequest(String communicationLocale, String client) {
        this(communicationLocale, client, null);
    }
}

