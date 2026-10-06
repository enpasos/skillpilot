package com.skillpilot.backend.connectors.gemini.v1.web;

/** Validated first-party request for one ordinary Gemini learning launch. */
public record GeminiV1CoachStartRequest(String communicationLocale, String client) {
}
