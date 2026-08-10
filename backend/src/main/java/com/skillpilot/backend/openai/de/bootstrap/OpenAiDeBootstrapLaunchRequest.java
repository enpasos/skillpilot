package com.skillpilot.backend.openai.de.bootstrap;

/** Closed semantic input of the direct HTTPS launch endpoint. */
public record OpenAiDeBootstrapLaunchRequest(
        int schemaVersion,
        IdentityMode identityMode,
        String skillpilotId,
        String communicationLocale,
        LaunchIntent launchIntent,
        String providerNoticeVersion,
        String clientRequestId) {

    /** Closed identity choice interpreted only by the private HTTPS component flow. */
    public enum IdentityMode {
        EXISTING,
        CREATE
    }

    public record LaunchIntent(String type) {
    }
}
