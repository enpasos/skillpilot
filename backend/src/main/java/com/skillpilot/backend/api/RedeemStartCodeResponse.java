package com.skillpilot.backend.api;

import java.time.Instant;

public record RedeemStartCodeResponse(
        String chatSessionToken,
        Instant expiresAt,
        UnifiedLearnerStateResponse state,
        String assistantResponsePrefixMarkdown) {

    public RedeemStartCodeResponse(
            String chatSessionToken,
            Instant expiresAt,
            UnifiedLearnerStateResponse state) {
        this(chatSessionToken, expiresAt, state, responsePrefixMarkdown(state));
    }

    private static String responsePrefixMarkdown(UnifiedLearnerStateResponse state) {
        if (state == null || state.stateMachine() == null) {
            return null;
        }
        return state.stateMachine().activeGoalVisualizationMarkdown();
    }
}
