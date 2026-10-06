package com.skillpilot.backend.connectors.gemini.v1;

import java.net.URI;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.core.env.Environment;

/** Fail-closed validation for the isolated Gemini gateway and learner-session lane. */
public final class GeminiV1RuntimeValidation {

    public static final int MINIMUM_SECRET_LENGTH = 32;

    public record ValidationResult(boolean valid, List<String> violations) {
        public ValidationResult {
            violations = List.copyOf(violations);
        }
    }

    public static ValidationResult inspect(GeminiV1Properties properties, Environment environment) {
        Objects.requireNonNull(properties, "properties");
        Objects.requireNonNull(environment, "environment");
        if (!properties.isEnabled()) {
            return new ValidationResult(true, List.of());
        }

        List<String> violations = new ArrayList<>();
        String[] keys = {properties.getSigningSecret(), properties.getCapabilitySecret(), properties.getGatewaySecret()};
        String[] names = {"signing-secret", "capability-secret", "gateway-secret"};
        for (int i = 0; i < keys.length; i++) {
            if (!isValidSecret(keys[i])) {
                violations.add(names[i] + " must provide 32 to 4096 non-whitespace characters.");
            }
            for (int j = 0; j < i; j++) {
                if (keys[i] != null && keys[i].equals(keys[j])) {
                    violations.add(names[i] + " must differ from other Gemini keys.");
                }
            }
            for (String providerKey : List.of(
                    "skillpilot.security.signing-secret",
                    "skillpilot.claude.connector.v1.signing-secret",
                    "skillpilot.claude.connector.v1.capability-secret",
                    "skillpilot.openai.coach.v1.signing-secret",
                    "skillpilot.openai.coach.v1.capability-secret")) {
                if (keys[i] != null && keys[i].equals(environment.getProperty(providerKey))) {
                    violations.add(names[i] + " must use an independent Gemini key.");
                }
            }
        }

        String origin = properties.getPublicOrigin();
        if (!isStrictHttpsOrigin(origin)) {
            violations.add("public-base-url must be an HTTPS origin without path, query, fragment or user info.");
        }
        exactUrl(properties.getPublicMcpUrl(), origin, GeminiV1Contract.PUBLIC_PATH_MCP, "public-mcp-url", violations);
        exactUrl(properties.getPublicResourceMetadataUrl(), origin,
                GeminiV1Contract.PUBLIC_PATH_PROTECTED_RESOURCE_METADATA, "public-resource-metadata-url", violations);
        exactUrl(properties.getPublicAuthServerMetadataUrl(), origin,
                GeminiV1Contract.PUBLIC_PATH_AUTH_SERVER_METADATA, "public-auth-server-metadata-url", violations);
        if (!Objects.equals(properties.getGatewayAudience(), properties.getPublicMcpUrl())) {
            violations.add("gateway-audience must equal the exact public-mcp-url.");
        }
        if (!GeminiV1Contract.INTERNAL_BASE_PATH.equals(properties.getInternalBasePath())) {
            violations.add("internal-base-path must equal the compiled Gemini v1 route prefix.");
        }
        if (!isHttpsUrl(properties.getPublicDocumentationUrl())) {
            violations.add("public-documentation-url must be an absolute HTTPS URL.");
        }
        range(properties.getCapabilityTtl(), "capability-ttl", Duration.ofSeconds(30), Duration.ofMinutes(10), violations);
        range(properties.getIdempotencyTtl(), "idempotency-ttl", Duration.ofMinutes(1), Duration.ofHours(24), violations);
        range(properties.getRequestTimeout(), "request-timeout", Duration.ofSeconds(1), Duration.ofSeconds(60), violations);
        range(properties.getMaxRequestBodyBytes(), "max-request-body-bytes", 4096, 1_048_576, violations);
        range(properties.getMaxResponseBytes(), "max-response-bytes", 4096, 1_048_576, violations);
        range(properties.getMaxToolCallsPerConnectionPerMinute(), "max-tool-calls-per-connection-per-minute", 1, 600, violations);
        return new ValidationResult(violations.isEmpty(), violations);
    }

    private static void exactUrl(String value, String origin, String path, String name, List<String> violations) {
        if (origin == null || !Objects.equals(value, origin + path)) {
            violations.add(name + " must equal public-base-url plus its compiled public path.");
        }
    }

    private static boolean isHttpsUrl(String value) {
        try {
            URI uri = URI.create(Objects.toString(value, ""));
            return "https".equals(uri.getScheme()) && uri.getHost() != null
                    && uri.getRawUserInfo() == null && uri.getRawFragment() == null;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private static boolean isStrictHttpsOrigin(String value) {
        if (!isHttpsUrl(value)) {
            return false;
        }
        URI uri = URI.create(value);
        return (uri.getRawPath() == null || uri.getRawPath().isEmpty()) && uri.getRawQuery() == null
                && (uri.getPort() == -1 || uri.getPort() == 443);
    }

    public static boolean isValidSecret(String secret) {
        return secret != null && secret.length() >= MINIMUM_SECRET_LENGTH && secret.length() <= 4096
                && secret.chars().noneMatch(Character::isWhitespace);
    }

    private static void range(Duration value, String name, Duration minimum, Duration maximum, List<String> violations) {
        if (value == null || value.compareTo(minimum) < 0 || value.compareTo(maximum) > 0) {
            violations.add(name + " is outside its permitted range.");
        }
    }

    private static void range(int value, String name, int minimum, int maximum, List<String> violations) {
        if (value < minimum || value > maximum) {
            violations.add(name + " is outside its permitted range.");
        }
    }

    private GeminiV1RuntimeValidation() {}
}
