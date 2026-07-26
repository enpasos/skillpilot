package com.skillpilot.backend.openai.de;

import java.net.InetAddress;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/** Shared fail-closed validation for the OpenAI-DE production security profile. */
public final class OpenAiDeSecureModeValidation {

    private static final Set<String> ASYMMETRIC_JWS_ALGORITHMS = Set.of(
            "RS256", "RS384", "RS512",
            "PS256", "PS384", "PS512",
            "ES256", "ES384", "ES512");
    private static final Pattern IPV4_COMPONENT = Pattern.compile("[0-9]{1,3}");
    private static final Pattern IPV6_LITERAL = Pattern.compile("[0-9a-fA-F:.]+");

    private OpenAiDeSecureModeValidation() {}

    public static Result inspect(OpenAiDeProperties properties) {
        boolean secureMode = properties.getSecurity().isSecureMode();
        boolean oauthEnabled = properties.getOauth().isEnabled();
        String authenticationMethod = normalizedAuthenticationMethod(properties);
        boolean publicClient = "none".equals(authenticationMethod);
        boolean privateKeyJwt = "private_key_jwt".equals(authenticationMethod);
        boolean clientAuthenticationSupported = publicClient || privateKeyJwt;
        boolean clientIdConfigured = hasText(properties.getOauth().getClientId());
        List<String> redirectUris = properties.getOauth().getRedirectUris();
        boolean redirectUrisConfigured = redirectUris != null
                && !redirectUris.isEmpty()
                && redirectUris.stream().allMatch(OpenAiDeSecureModeValidation::isStrictHttpsUri);
        boolean cimdHttpsDocument = isStrictHttpsDocumentUri(properties.getOauth().getClientId());
        boolean jwksHttpsSameOrigin = isStrictHttpsDocumentUri(properties.getOauth().getClientJwkSetUri())
                && haveSameStrictHttpsOrigin(
                        properties.getOauth().getClientId(),
                        properties.getOauth().getClientJwkSetUri());
        boolean asymmetricAlgorithm = ASYMMETRIC_JWS_ALGORITHMS.contains(
                normalizedAlgorithm(properties));
        boolean replayCacheConfigured =
                properties.getOauth().getClientAssertionReplayCacheSize() > 0;
        boolean mtlsEdgeEnabled = properties.getMtlsEdge().isEnabled();
        List<String> trustedProxies = properties.getMtlsEdge().getTrustedProxies();
        int trustedProxyCount = trustedProxies == null ? 0 : trustedProxies.size();
        boolean trustedProxiesConfigured = trustedProxyCount > 0
                && trustedProxies.stream().allMatch(OpenAiDeSecureModeValidation::isNumericIpLiteral);

        List<String> violations = new ArrayList<>();
        addViolation(violations, secureMode, "security.secure-mode");
        if (secureMode) {
            addViolation(violations, oauthEnabled, "oauth.enabled");
            addViolation(
                    violations,
                    clientAuthenticationSupported,
                    "oauth.client-authentication-method");
            addViolation(violations, clientIdConfigured, "oauth.client-id");
            addViolation(violations, redirectUrisConfigured, "oauth.redirect-uris");
            if (privateKeyJwt) {
                addViolation(violations, cimdHttpsDocument, "oauth.client-id-cimd-document");
                addViolation(violations, jwksHttpsSameOrigin, "oauth.client-jwk-set-uri-same-origin");
                addViolation(
                        violations,
                        asymmetricAlgorithm,
                        "oauth.client-assertion-signing-algorithm");
                addViolation(
                        violations,
                        replayCacheConfigured,
                        "oauth.client-assertion-replay-cache-size");
            }
            if (mtlsEdgeEnabled) {
                addViolation(violations, trustedProxiesConfigured, "mtls-edge.trusted-proxies");
            }
        }

        return new Result(
                secureMode,
                oauthEnabled,
                clientAuthenticationSupported,
                publicClient,
                privateKeyJwt,
                clientIdConfigured,
                redirectUrisConfigured,
                cimdHttpsDocument,
                jwksHttpsSameOrigin,
                asymmetricAlgorithm,
                replayCacheConfigured,
                mtlsEdgeEnabled,
                trustedProxiesConfigured,
                trustedProxyCount,
                List.copyOf(violations));
    }

    private static void addViolation(List<String> violations, boolean valid, String property) {
        if (!valid) {
            violations.add(property);
        }
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static String normalizedAuthenticationMethod(OpenAiDeProperties properties) {
        String value = properties.getOauth().getClientAuthenticationMethod();
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizedAlgorithm(OpenAiDeProperties properties) {
        String value = properties.getOauth().getClientAssertionSigningAlgorithm();
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    /**
     * Returns whether {@code value} is an exact, absolute HTTPS URL suitable
     * for a protocol endpoint.
     *
     * <p>Protocol endpoint values are deliberately stricter than general web
     * links: surrounding whitespace, user-info, query strings, and fragments
     * are rejected.</p>
     */
    public static boolean isStrictHttpsUri(String value) {
        if (!hasText(value) || !value.equals(value.trim())) {
            return false;
        }
        try {
            URI uri = URI.create(value);
            return "https".equalsIgnoreCase(uri.getScheme())
                    && uri.getHost() != null
                    && !uri.getHost().isBlank()
                    && uri.getUserInfo() == null
                    && uri.getQuery() == null
                    && uri.getFragment() == null;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    /** Returns whether {@code value} is a strict HTTPS URL for a document. */
    public static boolean isStrictHttpsDocumentUri(String value) {
        if (!isStrictHttpsUri(value)) {
            return false;
        }
        try {
            URI uri = URI.create(value);
            String path = uri.getRawPath();
            return path != null
                    && !path.isBlank()
                    && !"/".equals(path);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    /** Returns whether two strict HTTPS documents share the same origin. */
    public static boolean haveSameStrictHttpsOrigin(String first, String second) {
        if (!isStrictHttpsDocumentUri(first) || !isStrictHttpsDocumentUri(second)) {
            return false;
        }
        try {
            URI firstUri = URI.create(first);
            URI secondUri = URI.create(second);
            return firstUri.getScheme().equalsIgnoreCase(secondUri.getScheme())
                    && firstUri.getHost().equalsIgnoreCase(secondUri.getHost())
                    && effectivePort(firstUri) == effectivePort(secondUri);
        } catch (IllegalArgumentException | NullPointerException exception) {
            return false;
        }
    }

    private static int effectivePort(URI uri) {
        return uri.getPort() >= 0 ? uri.getPort() : 443;
    }

    static boolean isNumericIpLiteral(String value) {
        if (value == null || value.isBlank() || !value.equals(value.trim())) {
            return false;
        }
        if (value.indexOf(':') >= 0) {
            if (!IPV6_LITERAL.matcher(value).matches()) {
                return false;
            }
            try {
                return InetAddress.getByName(value).getHostAddress().contains(":");
            } catch (Exception exception) {
                return false;
            }
        }
        String[] components = value.split("\\.", -1);
        if (components.length != 4) {
            return false;
        }
        for (String component : components) {
            if (!IPV4_COMPONENT.matcher(component).matches()) {
                return false;
            }
            try {
                if (Integer.parseInt(component) > 255) {
                    return false;
                }
            } catch (NumberFormatException exception) {
                return false;
            }
        }
        return true;
    }

    public record Result(
            boolean secureMode,
            boolean oauthEnabled,
            boolean clientAuthenticationSupported,
            boolean publicClient,
            boolean privateKeyJwt,
            boolean clientIdConfigured,
            boolean redirectUrisConfigured,
            boolean cimdHttpsDocument,
            boolean jwksHttpsSameOrigin,
            boolean asymmetricAlgorithm,
            boolean replayCacheConfigured,
            boolean mtlsEdgeEnabled,
            boolean trustedProxiesConfigured,
            int trustedProxyCount,
            List<String> violations) {

        public boolean valid() {
            return violations.isEmpty();
        }
    }
}
