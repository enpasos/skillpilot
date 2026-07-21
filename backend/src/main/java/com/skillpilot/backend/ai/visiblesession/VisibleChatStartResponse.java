package com.skillpilot.backend.ai.visiblesession;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.time.Instant;

@JsonPropertyOrder({ "chatSessionToken", "expiresAt", "prompt" })
public record VisibleChatStartResponse(
        String chatSessionToken,
        Instant expiresAt,
        String prompt) {
}
