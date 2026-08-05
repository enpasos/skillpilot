package com.skillpilot.backend.openai.de.health;

import com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.OpenAiDeSecureModeValidation;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1PublicContractValidation;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

/** Readiness contribution for the OpenAI Coach V1 MCP provider boundary. */
@Component("openAiDeCoach")
@ConditionalOnProperty(name = "skillpilot.openai.coach.v1.enabled", havingValue = "true")
public final class OpenAiDeCoachHealthIndicator implements HealthIndicator {

    public static final String CONTRIBUTOR_NAME = "openAiDeCoach";
    public static final int EXPECTED_TOOL_COUNT = 14;

    private final OpenAiDeProperties properties;
    private final boolean contractAvailable;
    private final int contractToolCount;
    private final String contractHash;
    private final String curriculumRevision;
    private final boolean mcpEnabled;

    public OpenAiDeCoachHealthIndicator(
            OpenAiDeProperties properties,
            Optional<OpenAiDeV1McpContractAdapter> contract,
            Optional<OpenAiDeCurriculumRevisionProvider> curriculumRevisionProvider,
            @Value("${skillpilot.openai.coach.v1.mcp.enabled:false}") boolean mcpEnabled) {
        this.properties = properties;
        this.contractAvailable = contract.isPresent();
        this.contractToolCount = contract.map(value -> value.toolSpecifications().size()).orElse(0);
        this.contractHash = contract.map(OpenAiDeCoachContractFingerprint::sha256).orElse("unavailable");
        this.curriculumRevision = curriculumRevisionProvider
                .map(OpenAiDeCurriculumRevisionProvider::currentRevision)
                .filter(value -> !value.isBlank())
                .orElse("unavailable");
        this.mcpEnabled = mcpEnabled;
    }

    @Override
    public Health health() {
        boolean oauthEnabled = properties.getOauth().isEnabled();
        OpenAiDeSecureModeValidation.Result secureMode =
                OpenAiDeSecureModeValidation.inspect(properties);
        boolean clientIdConfigured = secureMode.clientIdConfigured();
        String clientAuthenticationMethod =
                properties.getOauth().getClientAuthenticationMethod() == null
                        ? ""
                        : properties.getOauth().getClientAuthenticationMethod().trim().toLowerCase();
        boolean clientAuthenticationConfigured = secureMode.clientAuthenticationSupported()
                && secureMode.clientSecretBasic()
                && secureMode.clientSecretConfigured();
        List<String> redirectUris = properties.getOauth().getRedirectUris();
        boolean redirectUrisConfigured = redirectUris != null
                && !redirectUris.isEmpty()
                && redirectUris.stream().allMatch(OpenAiDeSecureModeValidation::isStrictHttpsUri);
        boolean mcpUrlHttps = OpenAiDeSecureModeValidation.isStrictHttpsUri(properties.getMcpUrl());
        boolean oauthResourceHttps =
                OpenAiDeSecureModeValidation.isStrictHttpsUri(properties.getOauthResource());
        boolean protectedResourceMetadataHttps = OpenAiDeSecureModeValidation.isStrictHttpsUri(
                properties.getOauth().getProtectedResourceMetadata());
        OpenAiDeV1PublicContractValidation.Result publicContract =
                OpenAiDeV1PublicContractValidation.inspect(properties);
        boolean rateLimitEnabled = properties.getRateLimit().isEnabled();
        boolean rateLimitConfigured = validRateLimit(properties.getRateLimit());
        boolean contractReady = contractToolCount == EXPECTED_TOOL_COUNT;
        boolean serverBuildConfigured = properties.getServerBuild() != null
                && !properties.getServerBuild().isBlank()
                && !OpenAiDeV1ContractMetadata.DEFAULT_SERVER_BUILD.equals(
                        properties.getServerBuild().trim());
        boolean curriculumRevisionAvailable = !"unavailable".equals(curriculumRevision);
        boolean ready = oauthEnabled
                && mcpEnabled
                && clientIdConfigured
                && clientAuthenticationConfigured
                && redirectUrisConfigured
                && mcpUrlHttps
                && oauthResourceHttps
                && protectedResourceMetadataHttps
                && publicContract.valid()
                && serverBuildConfigured
                && curriculumRevisionAvailable
                && rateLimitEnabled
                && rateLimitConfigured
                && contractReady
                && secureMode.valid();

        Health.Builder health = ready ? Health.up() : Health.down();
        health.withDetail("provider", "openai")
                .withDetail("localeBinding", "learning-session")
                .withDetail("communicationLanguages", List.of("de", "en"))
                .withDetail("pluginLine", OpenAiDeV1ContractMetadata.PLUGIN_IDENTITY)
                .withDetail("pluginVersion", OpenAiDeV1ContractMetadata.PLUGIN_VERSION)
                .withDetail("contractMajor", OpenAiDeV1ContractMetadata.CONTRACT_MAJOR)
                .withDetail("serverBuild", properties.getServerBuild())
                .withDetail("serverBuildConfigured", serverBuildConfigured)
                .withDetail("curriculumRevision", curriculumRevision)
                .withDetail("curriculumRevisionAvailable", curriculumRevisionAvailable)
                .withDetail("mcpEnabled", mcpEnabled)
                .withDetail("oauthEnabled", oauthEnabled)
                .withDetail("writesEnabled", properties.isWritesEnabled())
                .withDetail("clientIdConfigured", clientIdConfigured)
                .withDetail("clientAuthenticationMethod", clientAuthenticationMethod)
                .withDetail("clientAuthenticationConfigured", clientAuthenticationConfigured)
                .withDetail("redirectUrisConfigured", redirectUrisConfigured)
                .withDetail("redirectUriCount", redirectUris == null ? 0 : redirectUris.size())
                .withDetail("mcpUrlHttps", mcpUrlHttps)
                .withDetail("oauthResourceHttps", oauthResourceHttps)
                .withDetail("protectedResourceMetadataHttps", protectedResourceMetadataHttps)
                .withDetail("v1McpEndpointExact", publicContract.mcpEndpointExact())
                .withDetail("v1OauthResourceExact", publicContract.oauthResourceExact())
                .withDetail(
                        "v1ProtectedResourceMetadataExact",
                        publicContract.protectedResourceMetadataExact())
                .withDetail("rateLimitEnabled", rateLimitEnabled)
                .withDetail("rateLimitConfigured", rateLimitConfigured)
                .withDetail("secureMode", secureMode.secureMode())
                .withDetail("secureConfigurationValid", secureMode.valid())
                .withDetail("secureOAuthEnabled", secureMode.oauthEnabled())
                .withDetail(
                        "clientAuthenticationSupported",
                        secureMode.clientAuthenticationSupported())
                .withDetail("publicClientConfigured", secureMode.publicClient())
                .withDetail("clientSecretBasicConfigured", secureMode.clientSecretBasic())
                .withDetail("clientSecretConfigured", secureMode.clientSecretConfigured())
                .withDetail("privateKeyJwtConfigured", secureMode.privateKeyJwt())
                .withDetail(
                        "secureRedirectUrisConfigured",
                        secureMode.redirectUrisConfigured())
                .withDetail("cimdHttpsDocumentConfigured", secureMode.cimdHttpsDocument())
                .withDetail("sameOriginHttpsJwksConfigured", secureMode.jwksHttpsSameOrigin())
                .withDetail("asymmetricClientAssertionAlgorithm", secureMode.asymmetricAlgorithm())
                .withDetail("clientAssertionReplayCacheConfigured", secureMode.replayCacheConfigured())
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

}
