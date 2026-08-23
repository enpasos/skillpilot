package com.skillpilot.backend.connectors.claude.v1.web;

/** Validated first-party request for one ordinary Claude learning launch. */
public record ClaudeV1CoachStartRequest(String communicationLocale, String client) {
}

