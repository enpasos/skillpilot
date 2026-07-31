package com.skillpilot.backend.openai.de.health;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.openai.de.OpenAiDeConfiguration;
import com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachIdentityResolver;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1PublicContractValidation;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeMcpTelemetry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.health.contributor.Status;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class OpenAiDeCoachHealthIndicatorTest {

    private static final String TEST_CLIENT_SECRET =
            "test-client-secret-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    @Test
    void reportsUpWithStableContractHashAndOnlyNonSecretConfigurationDetails() {
        OpenAiDeProperties properties = secureProperties();
        OpenAiDeV1McpContractAdapter contract = contract();
        OpenAiDeCoachHealthIndicator indicator = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract),
                Optional.of(curriculumRevisionProvider()),
                true,
                true);

        var first = indicator.health();
        var second = indicator.health();

        assertThat(first.getStatus()).isEqualTo(Status.UP);
        assertThat(first.getDetails())
                .containsEntry("provider", "openai")
                .containsEntry("locale", "de")
                .containsEntry("mcpEnabled", true)
                .containsEntry("mtlsEdgeEnabled", true)
                .containsEntry("oauthEnabled", true)
                .containsEntry("clientIdConfigured", true)
                .containsEntry("clientSecretBasicConfigured", true)
                .containsEntry("clientSecretConfigured", true)
                .containsEntry("redirectUrisConfigured", true)
                .containsEntry("rateLimitEnabled", true)
                .containsEntry("rateLimitConfigured", true)
                .containsEntry("curriculumRevision", "curricula-sha256@" + "a".repeat(64))
                .containsEntry("curriculumRevisionAvailable", true)
                .containsEntry("contractToolCount", OpenAiDeCoachHealthIndicator.EXPECTED_TOOL_COUNT)
                .doesNotContainKeys(
                        "clientId",
                        "clientSecret",
                        "redirectUris",
                        "mcpUrl",
                        "protectedResourceMetadata");
        assertThat(first.getDetails().get("contractHash"))
                .isEqualTo(second.getDetails().get("contractHash"))
                .isEqualTo(OpenAiDeCoachContractFingerprint.sha256(contract()))
                .asString()
                .matches("[0-9a-f]{64}");
        assertThat(first.toString())
                .doesNotContain("chatgpt-app-client-id")
                .doesNotContain("app-specific-callback")
                .doesNotContain(TEST_CLIENT_SECRET);
    }

    @Test
    void reportsUpForPinnedConfidentialClientWithNoAssertionReplayCache() {
        OpenAiDeProperties properties = secureProperties();

        var health = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract()),
                Optional.of(curriculumRevisionProvider()),
                true,
                true).health();

        assertThat(health.getStatus()).isEqualTo(Status.UP);
        assertThat(health.getDetails())
                .containsEntry("publicClientConfigured", false)
                .containsEntry("clientSecretBasicConfigured", true)
                .containsEntry("clientSecretConfigured", true)
                .containsEntry("privateKeyJwtConfigured", false)
                .containsEntry("clientAssertionReplayCacheConfigured", false)
                .containsEntry("secureConfigurationValid", true);
    }

    @Test
    void reportsDownForProtocolUrlsWithQueryFragmentOrWhitespace() {
        for (String unsafeRedirect : List.of(
                "https://chatgpt.com/connector/oauth/callback?tenant=one",
                "https://chatgpt.com/connector/oauth/callback#fragment",
                " https://chatgpt.com/connector/oauth/callback")) {
            OpenAiDeProperties properties = secureProperties();
            properties.getOauth().setRedirectUris(List.of(unsafeRedirect));

            var health = new OpenAiDeCoachHealthIndicator(
                    properties,
                    Optional.of(contract()),
                    Optional.of(curriculumRevisionProvider()),
                    true,
                    true).health();

            assertThat(health.getStatus()).as(unsafeRedirect).isEqualTo(Status.DOWN);
            assertThat(health.getDetails())
                    .containsEntry("redirectUrisConfigured", false)
                    .containsEntry("secureRedirectUrisConfigured", false);
        }

        OpenAiDeProperties properties = secureProperties();
        properties.setMcpUrl("https://skillpilot.test/internal/openai/de/v1/mcp?tenant=one");
        properties.getOauth().setProtectedResourceMetadata(
                "https://skillpilot.test/api/openai/de/oauth/protected-resource#fragment");

        var health = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract()),
                Optional.of(curriculumRevisionProvider()),
                true,
                true).health();

        assertThat(health.getStatus()).isEqualTo(Status.DOWN);
        assertThat(health.getDetails())
                .containsEntry("mcpUrlHttps", false)
                .containsEntry("protectedResourceMetadataHttps", false);
    }

    @Test
    void reportsDownWhenConfidentialClientSecretIsMissingOrInvalid() {
        for (String invalidSecret : List.of(
                "",
                "too-short",
                "test-client-secret-0123456789 contains-whitespace")) {
            OpenAiDeProperties properties = secureProperties();
            properties.getOauth().setClientSecret(invalidSecret);

            var health = new OpenAiDeCoachHealthIndicator(
                    properties,
                    Optional.of(contract()),
                    Optional.of(curriculumRevisionProvider()),
                    true,
                    true).health();

            assertThat(health.getStatus()).as(invalidSecret).isEqualTo(Status.DOWN);
            assertThat(health.getDetails())
                    .containsEntry("clientSecretBasicConfigured", true)
                    .containsEntry("clientSecretConfigured", false)
                    .containsEntry("secureConfigurationValid", false);
            if (!invalidSecret.isEmpty()) {
                assertThat(health.toString()).doesNotContain(invalidSecret);
            }
        }
    }

    @Test
    void reportsDownWhenProviderBoundaryRateLimitIsDisabledOrInvalid() {
        OpenAiDeProperties properties = readyProperties();
        properties.getRateLimit().setEnabled(false);
        properties.getRateLimit().setMcpRequests(0);

        var health = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract()),
                Optional.of(curriculumRevisionProvider()),
                true,
                true).health();

        assertThat(health.getStatus()).isEqualTo(Status.DOWN);
        assertThat(health.getDetails())
                .containsEntry("rateLimitEnabled", false)
                .containsEntry("rateLimitConfigured", false);
    }

    @Test
    void reportsDownWithExplicitStatusFlagsWhenRuntimeIsIncomplete() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.setEnabled(true);
        OpenAiDeCoachHealthIndicator indicator = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.empty(),
                Optional.empty(),
                false,
                false);

        var health = indicator.health();

        assertThat(health.getStatus()).isEqualTo(Status.DOWN);
        assertThat(health.getDetails())
                .containsEntry("mcpEnabled", false)
                .containsEntry("mtlsEdgeEnabled", false)
                .containsEntry("oauthEnabled", false)
                .containsEntry("clientIdConfigured", false)
                .containsEntry("redirectUrisConfigured", false)
                .containsEntry("contractAvailable", false)
                .containsEntry("curriculumRevisionAvailable", false)
                .containsEntry("contractHash", "unavailable");
    }

    @Test
    void reportsUpForTlsAndOauthWhenMtlsEdgeIsDisabled() {
        OpenAiDeProperties properties = secureProperties();
        properties.getMtlsEdge().setEnabled(false);

        var health = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract()),
                Optional.of(curriculumRevisionProvider()),
                true,
                false).health();

        assertThat(health.getStatus()).isEqualTo(Status.UP);
        assertThat(health.getDetails())
                .containsEntry("secureMode", true)
                .containsEntry("secureConfigurationValid", true)
                .containsEntry("mtlsEdgeEnabled", false)
                .containsEntry(
                        "secureConfigurationViolations",
                        List.of());
    }

    @Test
    void contributorExistsOnlyWhenOpenAiDeIsEnabled() {
        ApplicationContextRunner runner = new ApplicationContextRunner()
                .withUserConfiguration(OpenAiDeConfiguration.class, OpenAiDeCoachHealthIndicator.class);

        runner.run(context -> assertThat(context).doesNotHaveBean(OpenAiDeCoachHealthIndicator.class));
        runner.withPropertyValues(
                        "skillpilot.openai.de.enabled=true",
                        "skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg",
                        "skillpilot.openai.de.server-build=test-build",
                        "skillpilot.openai.de.security.secure-mode=true",
                        "skillpilot.openai.de.oauth.enabled=true",
                        "skillpilot.openai.de.oauth.client-authentication-method=client_secret_basic",
                        "skillpilot.openai.de.oauth.client-id=skillpilot-chatgpt-de-prod",
                        "skillpilot.openai.de.oauth.client-secret=" + TEST_CLIENT_SECRET,
                        "skillpilot.openai.de.oauth.redirect-uris[0]=https://chatgpt.com/connector/oauth/callback",
                        "skillpilot.openai.de.oauth.client-assertion-replay-cache-size=0",
                        "skillpilot.openai.de.mtls-edge.enabled=true",
                        "skillpilot.openai.de.mtls-edge.trusted-proxies=127.0.0.1,::1")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(OpenAiDeCoachHealthIndicator.class);
                    assertThat(context).hasBean(OpenAiDeCoachHealthIndicator.CONTRIBUTOR_NAME);
                });
    }

    private static OpenAiDeProperties readyProperties() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.setEnabled(true);
        properties.setWritesEnabled(false);
        properties.setMcpUrl(OpenAiDeV1ContractMetadata.PUBLIC_MCP_ENDPOINT);
        properties.setOauthResource(OpenAiDeV1ContractMetadata.OAUTH_RESOURCE);
        properties.setUiOrigin(OpenAiDeV1ContractMetadata.PUBLIC_UI_ORIGIN);
        properties.setServerBuild("test-build");
        properties.getOauth().setEnabled(true);
        properties.getOauth().setClientId("chatgpt-app-client-id");
        properties.getOauth().setRedirectUris(List.of(
                "https://chatgpt.com/connector/oauth/app-specific-callback"));
        properties.getOauth().setProtectedResourceMetadata(
                OpenAiDeV1PublicContractValidation.PROTECTED_RESOURCE_METADATA);
        return properties;
    }

    private static OpenAiDeProperties secureProperties() {
        OpenAiDeProperties properties = readyProperties();
        properties.getSecurity().setSecureMode(true);
        properties.getOauth().setClientAuthenticationMethod("client_secret_basic");
        properties.getOauth().setClientId("skillpilot-chatgpt-de-prod");
        properties.getOauth().setClientSecret(TEST_CLIENT_SECRET);
        properties.getOauth().setClientAssertionReplayCacheSize(0);
        properties.getMtlsEdge().setEnabled(true);
        properties.getMtlsEdge().setTrustedProxies(List.of("127.0.0.1", "::1"));
        return properties;
    }

    private static OpenAiDeV1McpContractAdapter contract() {
        return new OpenAiDeV1McpContractAdapter(
                mock(CoachToolFacade.class),
                new CoachStateProjection("https://skillpilot.test"),
                mock(OpenAiDeCoachIdentityResolver.class),
                new OpenAiDeMcpTelemetry(new SimpleMeterRegistry()),
                "https://skillpilot.test");
    }

    private static OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider() {
        OpenAiDeCurriculumRevisionProvider provider =
                mock(OpenAiDeCurriculumRevisionProvider.class);
        when(provider.currentRevision()).thenReturn("curricula-sha256@" + "a".repeat(64));
        return provider;
    }
}
