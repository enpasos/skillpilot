package com.skillpilot.backend.openai.de.bootstrap;

import java.time.Instant;

/** Complete immutable response encrypted in the delivery record. */
public record OpenAiDeBootstrapLaunchResponse(
        int schemaVersion,
        String status,
        String communicationLocale,
        Instant expiresAt,
        String startMessage) {
}
