package com.skillpilot.backend.openai.de.bootstrap;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;

/** Complete immutable response encrypted in the delivery record. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record OpenAiDeBootstrapLaunchResponse(
        int schemaVersion,
        String status,
        String communicationLocale,
        Instant expiresAt,
        String startMessage,
        String createdSkillpilotId) {
}
