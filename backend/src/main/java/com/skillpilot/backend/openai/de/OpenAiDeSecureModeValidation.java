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
        boolean privateKeyJwt = "private_key_jwt".equals(normalizedAuthenticationMethod(properties));
        boolean cimdHttpsDocument = isHttpsDocumentUri(properties.getOauth().getClientId());
        boolean jwksHttpsSameOrigin = isHttpsDocumentUri(properties.getOauth().getClientJwkSetUri())
                && sameOrigin(
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
            addViolation(violations, privateKeyJwt, "oauth.client-authentication-method");
            addViolation(violations, cimdHttpsDocument, "oauth.client-id-cimd-document");
            addViolation(violations, jwksHttpsSameOrigin, "oauth.client-jwk-set-uri-same-origin");
            addViolation(violations, asymmetricAlgorithm, "oauth.client-assertion-signing-algorithm");
            addViolation(violations, replayCacheConfigured, "oauth.client-assertion-replay-cache-size");
            addViolation(violations, mtlsEdgeEnabled, "mtls-edge.enabled");
            addViolation(violations, trustedProxiesConfigured, "mtls-edge.trusted-proxies");
        }

        return new Result(
                secureMode,
                privateKeyJwt,
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

    private static String normalizedAuthenticationMethod(OpenAiDeProperties properties) {
        String value = properties.getOauth().getClientAuthenticationMethod();
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private static String normalizedAlgorithm(OpenAiDeProperties properties) {
        String value = properties.getOauth().getClientAssertionSigningAlgorithm();
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private static boolean isHttpsDocumentUri(String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        try {
            URI uri = URI.create(value);
            String path = uri.getRawPath();
            return "https".equalsIgnoreCase(uri.getScheme())
                    && uri.getHost() != null
                    && !uri.getHost().isBlank()
                    && uri.getUserInfo() == null
                    && uri.getFragment() == null
                    && path != null
                    && !path.isBlank()
                    && !"/".equals(path);
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private static boolean sameOrigin(String first, String second) {
        if (!isHttpsDocumentUri(first) || !isHttpsDocumentUri(second)) {
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
            boolean privateKeyJwt,
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
