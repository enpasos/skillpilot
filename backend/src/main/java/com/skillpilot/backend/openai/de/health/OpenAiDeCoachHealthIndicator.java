package com.skillpilot.backend.openai.de.health;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.OpenAiDeSecureModeValidation;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachMcpContract;
import java.net.URI;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

/** Readiness contribution for the German OpenAI MCP provider boundary. */
@Component("openAiDeCoach")
@ConditionalOnProperty(name = "skillpilot.openai.de.enabled", havingValue = "true")
public final class OpenAiDeCoachHealthIndicator implements HealthIndicator {

    public static final String CONTRIBUTOR_NAME = "openAiDeCoach";
    public static final int EXPECTED_TOOL_COUNT = 11;

    private final OpenAiDeProperties properties;
    private final boolean contractAvailable;
    private final int contractToolCount;
    private final String contractHash;
    private final boolean mcpEnabled;
    private final boolean mtlsEdgeEnabled;

    public OpenAiDeCoachHealthIndicator(
            OpenAiDeProperties properties,
            Optional<OpenAiDeCoachMcpContract> contract,
            @Value("${skillpilot.openai.de.mcp.enabled:false}") boolean mcpEnabled,
            @Value("${skillpilot.openai.de.mtls-edge.enabled:false}") boolean mtlsEdgeEnabled) {
        this.properties = properties;
        this.contractAvailable = contract.isPresent();
        this.contractToolCount = contract.map(value -> value.toolSpecifications().size()).orElse(0);
        this.contractHash = contract.map(OpenAiDeCoachContractFingerprint::sha256).orElse("unavailable");
        this.mcpEnabled = mcpEnabled;
        this.mtlsEdgeEnabled = mtlsEdgeEnabled;
    }

    @Override
    public Health health() {
        boolean oauthEnabled = properties.getOauth().isEnabled();
        boolean clientIdConfigured = hasText(properties.getOauth().getClientId());
        String clientAuthenticationMethod =
                properties.getOauth().getClientAuthenticationMethod() == null
                        ? ""
                        : properties.getOauth().getClientAuthenticationMethod().trim().toLowerCase();
        boolean clientAuthenticationConfigured = "none".equals(clientAuthenticationMethod)
                || ("private_key_jwt".equals(clientAuthenticationMethod)
                        && isHttpsDocumentUri(properties.getOauth().getClientId())
                        && isHttpsUri(properties.getOauth().getClientJwkSetUri())
                        && sameOrigin(
                                properties.getOauth().getClientId(),
                                properties.getOauth().getClientJwkSetUri())
                        && hasText(properties.getOauth().getClientAssertionSigningAlgorithm())
                        && properties.getOauth().getClientAssertionReplayCacheSize() > 0);
        List<String> redirectUris = properties.getOauth().getRedirectUris();
        boolean redirectUrisConfigured = redirectUris != null
                && !redirectUris.isEmpty()
                && redirectUris.stream().allMatch(OpenAiDeCoachHealthIndicator::isHttpsUri);
        boolean mcpUrlHttps = isHttpsUri(properties.getMcpUrl());
        boolean protectedResourceMetadataHttps = isHttpsUri(properties.getOauth().getProtectedResourceMetadata());
        boolean rateLimitEnabled = properties.getRateLimit().isEnabled();
        boolean rateLimitConfigured = validRateLimit(properties.getRateLimit());
        boolean contractReady = contractToolCount == EXPECTED_TOOL_COUNT;
        OpenAiDeSecureModeValidation.Result secureMode =
                OpenAiDeSecureModeValidation.inspect(properties);
        boolean ready = oauthEnabled
                && mcpEnabled
                && clientIdConfigured
                && clientAuthenticationConfigured
                && redirectUrisConfigured
                && mcpUrlHttps
                && protectedResourceMetadataHttps
                && rateLimitEnabled
                && rateLimitConfigured
                && contractReady
                && secureMode.valid();

        Health.Builder health = ready ? Health.up() : Health.down();
        health.withDetail("provider", "openai")
                .withDetail("locale", "de")
                .withDetail("mcpEnabled", mcpEnabled)
                .withDetail("mtlsEdgeEnabled", mtlsEdgeEnabled)
                .withDetail("oauthEnabled", oauthEnabled)
                .withDetail("writesEnabled", properties.isWritesEnabled())
                .withDetail("clientIdConfigured", clientIdConfigured)
                .withDetail("clientAuthenticationMethod", clientAuthenticationMethod)
                .withDetail("clientAuthenticationConfigured", clientAuthenticationConfigured)
                .withDetail("redirectUrisConfigured", redirectUrisConfigured)
                .withDetail("redirectUriCount", redirectUris == null ? 0 : redirectUris.size())
                .withDetail("mcpUrlHttps", mcpUrlHttps)
                .withDetail("protectedResourceMetadataHttps", protectedResourceMetadataHttps)
                .withDetail("rateLimitEnabled", rateLimitEnabled)
                .withDetail("rateLimitConfigured", rateLimitConfigured)
                .withDetail("secureMode", secureMode.secureMode())
                .withDetail("secureConfigurationValid", secureMode.valid())
                .withDetail("privateKeyJwtConfigured", secureMode.privateKeyJwt())
                .withDetail("cimdHttpsDocumentConfigured", secureMode.cimdHttpsDocument())
                .withDetail("sameOriginHttpsJwksConfigured", secureMode.jwksHttpsSameOrigin())
                .withDetail("asymmetricClientAssertionAlgorithm", secureMode.asymmetricAlgorithm())
                .withDetail("clientAssertionReplayCacheConfigured", secureMode.replayCacheConfigured())
                .withDetail("trustedProxiesConfigured", secureMode.trustedProxiesConfigured())
                .withDetail("trustedProxyCount", secureMode.trustedProxyCount())
                .withDetail("secureConfigurationViolations", secureMode.violations())
                .withDetail("contractAvailable", contractAvailable)
                .withDetail("contractToolCount", contractToolCount)
                .withDetail("contractExpectedToolCount", EXPECTED_TOOL_COUNT)
                .withDetail("contractHash", contractHash);
        return health.build();
    }

    private static boolean validRateLimit(OpenAiDeProperties.RateLimit rateLimit) {
        return rateLimit != null
                && rateLimit.getWindow() != null
                && !rateLimit.getWindow().isZero()
                && !rateLimit.getWindow().isNegative()
                && rateLimit.getMcpRequests() > 0
                && rateLimit.getOauthRequests() > 0
                && rateLimit.getUiRequests() > 0
                && rateLimit.getMetadataRequests() > 0
                && rateLimit.getMaxClientBuckets() > 0;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private static boolean isHttpsUri(String value) {
        if (!hasText(value)) {
            return false;
        }
        try {
            URI uri = URI.create(value);
            return "https".equalsIgnoreCase(uri.getScheme())
                    && hasText(uri.getHost())
                    && uri.getUserInfo() == null;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private static boolean isHttpsDocumentUri(String value) {
        if (!isHttpsUri(value)) {
            return false;
        }
        String path = URI.create(value).getRawPath();
        return path != null && !path.isBlank() && !"/".equals(path);
    }

    private static boolean sameOrigin(String first, String second) {
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
}
