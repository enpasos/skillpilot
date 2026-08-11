package com.skillpilot.backend.api;

/**
 * Provider-specific launch request for the language-neutral OpenAI MCP coach.
 *
 * <p>The request deliberately has no free-form prompt field. Special launch
 * flows cross the browser/backend boundary only as a small, validated intent
 * which can be persisted and audited without carrying hidden instructions.</p>
 *
 * <p>{@code providerEligibilityConfirmed} is intentionally boxed: an omitted
 * confirmation must remain distinguishable from an affirmative confirmation.
 * It is checked before the service reads or mutates learner state and is not
 * persisted as learner data.</p>
 *
 * <p>{@code diagnosticSessionTtlSeconds} is a gated, first-party live-test
 * input. It affects only the learning session created by this request and is
 * rejected unless the server has explicitly enabled the diagnostic.</p>
 */
public record OpenAiDeCoachStartRequest(
        String communicationLocale,
        String client,
        String selectedCurriculum,
        Boolean providerEligibilityConfirmed,
        LaunchIntent launchIntent,
        Integer diagnosticSessionTtlSeconds) {

    /** Convenience constructor for ordinary first-party launches. */
    public OpenAiDeCoachStartRequest(
            String communicationLocale,
            String client,
            String selectedCurriculum,
            Boolean providerEligibilityConfirmed,
            LaunchIntent launchIntent) {
        this(
                communicationLocale,
                client,
                selectedCurriculum,
                providerEligibilityConfirmed,
                launchIntent,
                null);
    }

    public enum LaunchIntentType {
        CURRENT_UNIT,
        VERIFIED_RECALL,
        ABI26_EXAM
    }

    public record LaunchIntent(
            LaunchIntentType type,
            String goalId,
            Integer batchSize,
            String courseLevel) {
    }
}
