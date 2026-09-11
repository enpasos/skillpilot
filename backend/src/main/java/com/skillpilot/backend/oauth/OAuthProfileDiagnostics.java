package com.skillpilot.backend.oauth;

import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Request-local, bounded diagnostics only. These labels never grant access or select a learner. */
public final class OAuthProfileDiagnostics {
    private static final Logger LOG = LoggerFactory.getLogger(OAuthProfileDiagnostics.class);
    private static final ThreadLocal<Context> CURRENT = new ThreadLocal<>();
    private static final Set<String> PROFILES = Set.of("chatgpt-cimd-jwt", "chatgpt-basic-transition",
            "claude-cimd-public", "claude-custom-confidential", "claude-anthropic-held");

    public enum Reason {
        NONE, POLICY_REJECTED, INVALID_PROVENANCE, PROFILE_SUPERSEDED, REFRESH_REUSED,
        CLIENT_AUTHENTICATION_REJECTED, INVALID_TOKEN, INSUFFICIENT_SCOPE,
        STORAGE_UNAVAILABLE, METADATA_UNAVAILABLE, HTTP_REJECTED, INTERNAL_ERROR
    }

    private OAuthProfileDiagnostics() {}

    /** Accept only known internal profile labels, never raw request names or client IDs. */
    public static void markProfile(String profile) {
        Context context = CURRENT.get();
        if (context != null && profile != null && PROFILES.contains(profile)) context.profile = profile;
    }

    public static void markReason(Reason reason) {
        Context context = CURRENT.get();
        if (context != null && reason != null && reason != Reason.NONE) context.reason = reason;
    }

    public static void markReasonIfAbsent(Reason reason) {
        Context context = CURRENT.get();
        if (context != null && context.reason == Reason.NONE) markReason(reason);
    }

    static boolean hasContext() { return CURRENT.get() != null; }

    static String begin(String provider) {
        if (!Set.of("openai", "claude").contains(provider) || CURRENT.get() != null) {
            throw new IllegalStateException("OAuth diagnostics requires an isolated known-provider context.");
        }
        String correlation = UUID.randomUUID().toString();
        CURRENT.set(new Context(provider, correlation));
        return correlation;
    }

    static void finish(int status) {
        Context context = CURRENT.get();
        CURRENT.remove(); // Clear even if a logging backend fails. Never modify or copy an existing MDC.
        if (context == null) return;
        boolean failed = status >= 400;
        Reason reason = context.reason;
        if (failed && reason == Reason.NONE) reason = status >= 500 ? Reason.INTERNAL_ERROR : Reason.HTTP_REJECTED;
        String result = failed ? "rejected" : "http_completed";
        String message = "oauth_profile provider={} profile={} result={} reason={} http_status={} correlation_id={}";
        if (failed) {
            LOG.warn(message, context.provider, context.profile, result, reason.name(), status, context.correlation);
        } else {
            LOG.debug(message, context.provider, context.profile, result, reason.name(), status, context.correlation);
        }
    }

    private static final class Context {
        final String provider;
        final String correlation;
        String profile = "unknown";
        Reason reason = Reason.NONE;
        Context(String provider, String correlation) { this.provider = provider; this.correlation = correlation; }
    }
}
