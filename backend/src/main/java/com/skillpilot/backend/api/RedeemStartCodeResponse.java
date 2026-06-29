package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

@JsonPropertyOrder({
        "assistantMessage",
        "chatSessionToken",
        "expiresAt",
        "state"
})
public record RedeemStartCodeResponse(
        String chatSessionToken,
        Instant expiresAt,
        UnifiedLearnerStateResponse state,
        String assistantMessage) {

    public RedeemStartCodeResponse(
            String chatSessionToken,
            Instant expiresAt,
            UnifiedLearnerStateResponse state) {
        this(chatSessionToken, expiresAt, state, responseMessage(state, "https://skillpilot.com"));
    }

    public static RedeemStartCodeResponse fromState(
            String chatSessionToken,
            Instant expiresAt,
            UnifiedLearnerStateResponse state,
            String publicBaseUrl) {
        return new RedeemStartCodeResponse(
                chatSessionToken,
                expiresAt,
                state,
                responseMessage(state, publicBaseUrl));
    }

    private static String responseMessage(UnifiedLearnerStateResponse state, String publicBaseUrl) {
        String cockpitUrl = cockpitUrl(state, publicBaseUrl);
        if (cockpitUrl == null || cockpitUrl.isBlank()) {
            return "Dein Lernstand ist geladen.";
        }
        String title = activeGoalTitle(state);
        if (title == null || title.isBlank()) {
            return "Dein Lernstand ist geladen.\n\n[Im Cockpit öffnen](" + cockpitUrl + ")";
        }
        return "Dein Lernstand ist geladen.\n\nAktuelles Lernziel: **"
                + title
                + "** ([Cockpit]("
                + cockpitUrl
                + "))";
    }

    private static String cockpitUrl(UnifiedLearnerStateResponse state, String publicBaseUrl) {
        String goalId = activeGoalId(state);
        if (goalId == null || goalId.isBlank()) {
            return null;
        }
        String base = publicBaseUrl == null || publicBaseUrl.isBlank()
                ? "https://skillpilot.com"
                : publicBaseUrl.replaceAll("/+$", "");
        String curriculumId = state == null || state.curriculum() == null
                ? null
                : state.curriculum().getCurriculumId();
        StringBuilder url = new StringBuilder(base).append("/?");
        if (curriculumId != null && !curriculumId.isBlank()) {
            url.append("l=").append(queryValue(curriculumId)).append("&");
        }
        url.append("goal=").append(queryValue(goalId));
        return url.toString();
    }

    private static String activeGoalId(UnifiedLearnerStateResponse state) {
        if (state == null) {
            return "";
        }
        if (state.stateMachine() != null
                && state.stateMachine().activeGoal() != null
                && state.stateMachine().activeGoal().id() != null) {
            return state.stateMachine().activeGoal().id();
        }
        return state.activeGoal() == null || state.activeGoal().id() == null
                ? ""
                : state.activeGoal().id();
    }

    private static String activeGoalTitle(UnifiedLearnerStateResponse state) {
        if (state == null) {
            return "";
        }
        if (state.stateMachine() != null
                && state.stateMachine().activeGoal() != null
                && state.stateMachine().activeGoal().title() != null) {
            return state.stateMachine().activeGoal().title();
        }
        return state.activeGoal() == null || state.activeGoal().title() == null
                ? ""
                : state.activeGoal().title();
    }

    private static String queryValue(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
