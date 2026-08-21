package com.skillpilot.backend.connectors.claude.v1;

import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.core.env.Environment;

/**
 * Validates Claude Connector v1 configuration and enforces fail-closed startup invariants.
 *
 * <p>Secrets are resolved from the connector's own property prefix only. There is deliberately no
 * fallback to an application-wide secret: the capability encryption key must be a Claude v1 key so that
 * a capability minted for this lane can never be verified by, or forged from, another lane.</p>
 */
public final class ClaudeV1RuntimeValidation {

    public static final int MINIMUM_SECRET_LENGTH = 32;
    private static final Duration MAX_ACCESS_TOKEN_TTL = Duration.ofHours(1);
    private static final Duration MAX_REFRESH_TOKEN_TTL = Duration.ofDays(30);
    private static final Duration MAX_BINDING_TTL = Duration.ofMinutes(10);
    private static final Duration MAX_CAPABILITY_TTL = Duration.ofMinutes(10);
    private static final Duration MAX_IDEMPOTENCY_TTL = Duration.ofHours(24);

    public record ValidationResult(boolean valid, List<String> violations) {
        public static ValidationResult success() {
            return new ValidationResult(true, List.of());
        }

        public static ValidationResult failure(List<String> violations) {
            return new ValidationResult(false, List.copyOf(violations));
        }
    }

    public static ValidationResult inspect(ClaudeV1Properties properties, Environment environment) {
        Objects.requireNonNull(properties, "properties");
        Objects.requireNonNull(environment, "environment");

        if (!properties.isEnabled()) {
            return ValidationResult.success();
        }

        List<String> violations = new ArrayList<>();

        boolean legacyBetaEnabled = Boolean.parseBoolean(
                environment.getProperty(ClaudeV1Contract.LEGACY_BETA_ENABLED_PROPERTY, "false"));
        if (legacyBetaEnabled) {
            violations.add("'" + ClaudeV1Contract.LEGACY_BETA_ENABLED_PROPERTY + "' and '"
                    + ClaudeV1Contract.ENABLED_PROPERTY + "' must not both be true.");
        }

        validateSecrets(properties, violations);
        validatePublicIdentifiers(properties, violations);
        validateTtls(properties, violations);
        validateLimits(properties, violations);

        return violations.isEmpty() ? ValidationResult.success() : ValidationResult.failure(violations);
    }

    private static void validateSecrets(ClaudeV1Properties properties, List<String> violations) {
        if (!isValidSecret(properties.getSigningSecret())) {
            violations.add("Property '" + ClaudeV1Contract.PROPERTY_PREFIX + ".signing-secret' must provide at least "
                    + MINIMUM_SECRET_LENGTH + " non-whitespace characters.");
        }
        if (!isValidSecret(properties.getCapabilitySecret())) {
            violations.add("Property '" + ClaudeV1Contract.PROPERTY_PREFIX + ".capability-secret' must provide at least "
                    + MINIMUM_SECRET_LENGTH + " non-whitespace characters.");
        }
        if (isValidSecret(properties.getSigningSecret())
                && isValidSecret(properties.getCapabilitySecret())
                && properties.getSigningSecret().equals(properties.getCapabilitySecret())) {
            violations.add("The capability secret must differ from the signing secret.");
        }
    }

    private static void validatePublicIdentifiers(ClaudeV1Properties properties, List<String> violations) {
        String origin = properties.getPublicOrigin();
        if (!isStrictHttpsOrigin(origin)) {
            violations.add("publicBaseUrl must be an absolute HTTPS origin without path, query, fragment or user info.");
        }
        if (properties.getPublicHost() == null) {
            violations.add("publicBaseUrl must contain a resolvable host authority.");
        }

        // The MCP resource identifier is compared verbatim against the token audience, so it must
        // be exactly the public origin plus the MCP path.
        String expectedResource = origin == null ? null : origin + ClaudeV1Contract.PUBLIC_PATH_MCP;
        if (!isHttpsUrl(properties.getPublicMcpUrl())
                || !Objects.equals(properties.getPublicMcpUrl(), expectedResource)) {
            violations.add("publicMcpUrl must be exactly publicBaseUrl + '" + ClaudeV1Contract.PUBLIC_PATH_MCP + "'.");
        }
        String expectedResourceMetadata =
                origin == null ? null : origin + ClaudeV1Contract.PUBLIC_PATH_PROTECTED_RESOURCE_METADATA;
        if (!Objects.equals(properties.getPublicResourceMetadataUrl(), expectedResourceMetadata)) {
            violations.add("publicResourceMetadataUrl must be exactly publicBaseUrl + '"
                    + ClaudeV1Contract.PUBLIC_PATH_PROTECTED_RESOURCE_METADATA + "'.");
        }
        String expectedAuthServerMetadata =
                origin == null ? null : origin + ClaudeV1Contract.PUBLIC_PATH_AUTH_SERVER_METADATA;
        if (!Objects.equals(properties.getPublicAuthServerMetadataUrl(), expectedAuthServerMetadata)) {
            violations.add("publicAuthServerMetadataUrl must be exactly publicBaseUrl + '"
                    + ClaudeV1Contract.PUBLIC_PATH_AUTH_SERVER_METADATA + "'.");
        }
        if (!isHttpsUrl(properties.getPublicDocumentationUrl())) {
            violations.add("publicDocumentationUrl must be an absolute HTTPS URL.");
        }

        String internalBasePath = properties.getInternalBasePath();
        if (internalBasePath == null || !internalBasePath.startsWith("/") || internalBasePath.endsWith("/")) {
            violations.add("internalBasePath must start with '/' and must not end with '/'.");
        } else if (!ClaudeV1Contract.INTERNAL_BASE_PATH.equals(internalBasePath)) {
            // The routes are compiled into ClaudeV1Contract; a diverging property would silently
            // publish paths the security matchers do not cover.
            violations.add("internalBasePath must be '" + ClaudeV1Contract.INTERNAL_BASE_PATH + "'.");
        }
    }

    private static void validateTtls(ClaudeV1Properties properties, List<String> violations) {
        requireRange(properties.getAccessTokenTtl(), "accessTokenTtl", Duration.ofMinutes(1), MAX_ACCESS_TOKEN_TTL, violations);
        requireRange(properties.getRefreshTokenTtl(), "refreshTokenTtl", Duration.ofHours(1), MAX_REFRESH_TOKEN_TTL, violations);
        requireRange(properties.getBindingTransactionTtl(), "bindingTransactionTtl", Duration.ofMinutes(1), MAX_BINDING_TTL, violations);
        requireRange(properties.getCapabilityTtl(), "capabilityTtl", Duration.ofSeconds(30), MAX_CAPABILITY_TTL, violations);
        requireRange(properties.getIdempotencyTtl(), "idempotencyTtl", Duration.ofMinutes(1), MAX_IDEMPOTENCY_TTL, violations);
        requireRange(properties.getRequestTimeout(), "requestTimeout", Duration.ofSeconds(1), Duration.ofSeconds(60), violations);
        requireRange(properties.getCimdConnectTimeout(), "cimdConnectTimeout", Duration.ofMillis(250), Duration.ofSeconds(5), violations);
        requireRange(properties.getCimdReadTimeout(), "cimdReadTimeout", Duration.ofMillis(250), Duration.ofSeconds(10), violations);
        requireRange(properties.getCimdCacheTtl(), "cimdCacheTtl", Duration.ofMinutes(1), Duration.ofHours(24), violations);
    }

    private static void validateLimits(ClaudeV1Properties properties, List<String> violations) {
        requireRange(properties.getMaxRequestBodyBytes(), "maxRequestBodyBytes", 4096, 1_048_576, violations);
        requireRange(properties.getMaxResponseBytes(), "maxResponseBytes", 4096, 1_048_576, violations);
        requireRange(
                properties.getMaxToolCallsPerConnectionPerMinute(),
                "maxToolCallsPerConnectionPerMinute",
                1,
                600,
                violations);
        requireRange(
                properties.getMaxOAuthRequestsPerCallerPerMinute(),
                "maxOAuthRequestsPerCallerPerMinute",
                1,
                300,
                violations);
    }

    private static void requireRange(
            Duration value,
            String name,
            Duration minimum,
            Duration maximum,
            List<String> violations) {
        if (value == null || value.compareTo(minimum) < 0 || value.compareTo(maximum) > 0) {
            violations.add(name + " must be between " + minimum + " and " + maximum + ".");
        }
    }

    private static void requireRange(int value, String name, int minimum, int maximum, List<String> violations) {
        if (value < minimum || value > maximum) {
            violations.add(name + " must be between " + minimum + " and " + maximum + ".");
        }
    }

    private static boolean isHttpsUrl(String value) {
        if (value == null || !value.startsWith("https://")) {
            return false;
        }
        try {
            return URI.create(value).getHost() != null;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private static boolean isStrictHttpsOrigin(String value) {
        if (!isHttpsUrl(value)) {
            return false;
        }
        try {
            URI uri = URI.create(value);
            String path = uri.getRawPath();
            return uri.getUserInfo() == null
                    && uri.getRawQuery() == null
                    && uri.getRawFragment() == null
                    && (path == null || path.isEmpty())
                    && (uri.getPort() == -1 || uri.getPort() == 443);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    public static boolean isValidSecret(String secret) {
        if (secret == null) {
            return false;
        }
        return secret.length() >= MINIMUM_SECRET_LENGTH
                && secret.length() <= 4096
                && secret.chars().noneMatch(Character::isWhitespace);
    }

    private ClaudeV1RuntimeValidation() {
    }
}
