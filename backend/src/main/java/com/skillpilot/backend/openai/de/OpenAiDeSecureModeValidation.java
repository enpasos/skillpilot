package com.skillpilot.backend.openai.de;

import java.net.URI;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Shared fail-closed validation for the OpenAI Coach V1 production security profile. */
public final class OpenAiDeSecureModeValidation {

    public static final int MINIMUM_CLIENT_SECRET_LENGTH = 32;
    public static final int MINIMUM_SIGNING_SECRET_LENGTH = 32;

    private static final int MINIMUM_SIGNING_SECRET_DISTINCT_CODE_POINTS = 12;
    private static final double MINIMUM_SIGNING_SECRET_ESTIMATED_BITS = 100.0d;
    private static final Set<String> INSECURE_SIGNING_SECRET_VALUES = Set.of(
            "default-insecure-secret-change-me",
            "change-me",
            "changeme");

    private static final Set<String> ASYMMETRIC_JWS_ALGORITHMS = Set.of(
            "RS256", "RS384", "RS512",
            "PS256", "PS384", "PS512",
            "ES256", "ES384", "ES512");
    private OpenAiDeSecureModeValidation() {}

    public static Result inspect(OpenAiDeProperties properties) {
        boolean secureMode = properties.getSecurity().isSecureMode();
        boolean oauthEnabled = properties.getOauth().isEnabled();
        String authenticationMethod = normalizedAuthenticationMethod(properties);
        boolean publicClient = "none".equals(authenticationMethod);
        boolean clientSecretBasic = "client_secret_basic".equals(authenticationMethod);
        boolean privateKeyJwt = "private_key_jwt".equals(authenticationMethod);
        boolean clientAuthenticationSupported = clientSecretBasic;
        boolean clientIdConfigured = hasText(properties.getOauth().getClientId());
        boolean clientSecretConfigured = isValidClientSecret(
                properties.getOauth().getClientSecret());
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
            if (clientSecretBasic) {
                addViolation(violations, clientSecretConfigured, "oauth.client-secret");
            }
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
        }

        return new Result(
                secureMode,
                oauthEnabled,
                clientAuthenticationSupported,
                publicClient,
                clientSecretBasic,
                privateKeyJwt,
                clientIdConfigured,
                clientSecretConfigured,
                redirectUrisConfigured,
                cimdHttpsDocument,
                jwksHttpsSameOrigin,
                asymmetricAlgorithm,
                replayCacheConfigured,
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
     * Returns whether the static confidential-client secret meets the
     * production baseline without normalizing or exposing it.
     */
    public static boolean isValidClientSecret(String value) {
        return value != null
                && value.length() >= MINIMUM_CLIENT_SECRET_LENGTH
                && value.codePoints().noneMatch(Character::isWhitespace);
    }

    /**
     * Validates the HMAC signing secret without normalizing or exposing it.
     *
     * <p>The frequency-based entropy floor is deliberately only a structural
     * safeguard. Production secrets must still be generated by a
     * cryptographically secure random generator.</p>
     */
    public static boolean isValidSigningSecret(String value) {
        if (value == null
                || INSECURE_SIGNING_SECRET_VALUES.stream()
                        .anyMatch(insecureValue -> insecureValue.equalsIgnoreCase(value))) {
            return false;
        }
        int[] codePoints = value.codePoints().toArray();
        if (codePoints.length < MINIMUM_SIGNING_SECRET_LENGTH) {
            return false;
        }
        Map<Integer, Integer> frequencies = new HashMap<>();
        for (int codePoint : codePoints) {
            if (Character.isWhitespace(codePoint) || Character.isISOControl(codePoint)) {
                return false;
            }
            frequencies.merge(codePoint, 1, Integer::sum);
        }
        if (frequencies.size() < MINIMUM_SIGNING_SECRET_DISTINCT_CODE_POINTS) {
            return false;
        }
        double estimatedBits = 0.0d;
        for (int frequency : frequencies.values()) {
            double probability = (double) frequency / codePoints.length;
            estimatedBits -= frequency * (Math.log(probability) / Math.log(2.0d));
        }
        return estimatedBits >= MINIMUM_SIGNING_SECRET_ESTIMATED_BITS;
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

    public record Result(
            boolean secureMode,
            boolean oauthEnabled,
            boolean clientAuthenticationSupported,
            boolean publicClient,
            boolean clientSecretBasic,
            boolean privateKeyJwt,
            boolean clientIdConfigured,
            boolean clientSecretConfigured,
            boolean redirectUrisConfigured,
            boolean cimdHttpsDocument,
            boolean jwksHttpsSameOrigin,
            boolean asymmetricAlgorithm,
            boolean replayCacheConfigured,
            List<String> violations) {

        public boolean valid() {
            return violations.isEmpty();
        }
    }
}
