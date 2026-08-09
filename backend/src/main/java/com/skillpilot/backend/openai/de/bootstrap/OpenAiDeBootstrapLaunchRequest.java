package com.skillpilot.backend.openai.de.bootstrap;

/** Closed semantic input of the direct HTTPS launch endpoint. */
public record OpenAiDeBootstrapLaunchRequest(
        int schemaVersion,
        String skillpilotId,
        String communicationLocale,
        LaunchIntent launchIntent,
        String providerNoticeVersion,
        String clientRequestId) {

    public record LaunchIntent(String type) {
    }
}
