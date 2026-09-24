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
        CLIENT_METHOD_REJECTED, CLIENT_REGISTRATION_NOT_FOUND, CLIENT_CREDENTIALS_MISSING,
        CLIENT_SECRET_REJECTED, AUTHORIZATION_CODE_REJECTED, PKCE_REJECTED,
        JWT_REGISTRATION_MISMATCH, JWT_DECODE_REJECTED, JWT_IDENTITY_REJECTED,
        JWT_AUDIENCE_REJECTED, JWT_AUDIENCE_USES_ISSUER, JWT_AUDIENCE_USES_TOKEN_ENDPOINT,
        JWT_TIME_REJECTED, JWT_HEADER_REJECTED,
        JWT_IDENTIFIER_REJECTED, JWT_REPLAY_OR_CAPACITY_REJECTED, JWT_REPLAY_STORAGE_UNAVAILABLE,
        STORAGE_UNAVAILABLE, METADATA_UNAVAILABLE, HTTP_REJECTED, INTERNAL_ERROR
    }

    private OAuthProfileDiagnostics() {}

    public enum ClientAuthMethod { UNKNOWN, NONE, SECRET_BASIC, SECRET_POST, JWT_ASSERTION, OTHER }

    /** A bounded transport classification only; never accept a request-supplied label. */
    public static void markClientAuthMethod(ClientAuthMethod method) {
        Context context = CURRENT.get();
        if (context != null && method != null) context.clientAuthMethod = method;
    }

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

    public enum Endpoint { AUTHORIZE, TOKEN, REVOKE, INTROSPECT, MCP }

    static String begin(String provider, Endpoint endpoint) {
        if (!Set.of("openai", "claude").contains(provider) || CURRENT.get() != null) {
            throw new IllegalStateException("OAuth diagnostics requires an isolated known-provider context.");
        }
        String correlation = UUID.randomUUID().toString();
        CURRENT.set(new Context(provider, endpoint, correlation));
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
        String message = "oauth_profile provider={} profile={} endpoint={} result={} reason={} client_auth_method={} http_status={} correlation_id={}";
        if (failed) {
            LOG.warn(message, context.provider, context.profile, context.endpoint, result, reason.name(),
                    context.clientAuthMethod, status, context.correlation);
        } else {
            LOG.debug(message, context.provider, context.profile, context.endpoint, result, reason.name(),
                    context.clientAuthMethod, status, context.correlation);
        }
    }

    private static final class Context {
        final String provider;
        final Endpoint endpoint;
        final String correlation;
        String profile = "unknown";
        Reason reason = Reason.NONE;
        ClientAuthMethod clientAuthMethod = ClientAuthMethod.UNKNOWN;
        Context(String provider, Endpoint endpoint, String correlation) {
            this.provider = provider; this.endpoint = endpoint; this.correlation = correlation;
        }
    }
}
