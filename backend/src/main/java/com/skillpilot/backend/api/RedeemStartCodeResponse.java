package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.time.Instant;

@JsonPropertyOrder({
        "assistantNextMessageMarkdown",
        "assistantDisplayInstruction",
        "mandatoryFirstAssistantLineMarkdown",
        "assistantResponsePrefixMarkdown",
        "chatSessionToken",
        "expiresAt",
        "state"
})
public record RedeemStartCodeResponse(
        String chatSessionToken,
        Instant expiresAt,
        UnifiedLearnerStateResponse state,
        String assistantResponsePrefixMarkdown,
        String mandatoryFirstAssistantLineMarkdown,
        String assistantNextMessageMarkdown,
        String assistantDisplayInstruction) {

    public RedeemStartCodeResponse(
            String chatSessionToken,
            Instant expiresAt,
            UnifiedLearnerStateResponse state) {
        this(
                chatSessionToken,
                expiresAt,
                state,
                responsePrefixMarkdown(state),
                responsePrefixMarkdown(state),
                responsePrefixMarkdown(state),
                responseInstruction(state));
    }

    private static String responsePrefixMarkdown(UnifiedLearnerStateResponse state) {
        if (state == null || state.stateMachine() == null) {
            return null;
        }
        return state.stateMachine().activeGoalVisualizationMarkdown();
    }

    private static String responseInstruction(UnifiedLearnerStateResponse state) {
        return responsePrefixMarkdown(state) == null
                ? null
                : "Gib die Markdown-Bildzeile aus dieser Antwort jetzt als erste sichtbare Zeile wortgleich aus. Danach erst erklären.";
    }
}
