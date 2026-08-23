package com.skillpilot.backend.connectors.claude.v1.web;

import java.time.Instant;

/** One-time first-party launch material for a new Claude chat. */
public record ClaudeV1LaunchResponse(
        String prompt,
        String webUrl,
        String learningSessionId,
        Instant expiresAt) {
}

