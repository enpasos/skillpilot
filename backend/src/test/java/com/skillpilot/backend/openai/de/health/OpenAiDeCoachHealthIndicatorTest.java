package com.skillpilot.backend.openai.de.health;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.openai.de.OpenAiDeConfiguration;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachIdentityResolver;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachMcpContract;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeMcpTelemetry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.health.contributor.Status;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class OpenAiDeCoachHealthIndicatorTest {

    @Test
    void reportsUpWithStableContractHashAndOnlyNonSecretConfigurationDetails() {
        OpenAiDeProperties properties = secureProperties();
        OpenAiDeCoachMcpContract contract = contract();
        OpenAiDeCoachHealthIndicator indicator = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract),
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
                .containsEntry("redirectUrisConfigured", true)
                .containsEntry("rateLimitEnabled", true)
                .containsEntry("rateLimitConfigured", true)
                .containsEntry("contractToolCount", OpenAiDeCoachHealthIndicator.EXPECTED_TOOL_COUNT)
                .doesNotContainKeys("clientId", "redirectUris", "mcpUrl", "protectedResourceMetadata");
        assertThat(first.getDetails().get("contractHash"))
                .isEqualTo(second.getDetails().get("contractHash"))
                .isEqualTo(OpenAiDeCoachContractFingerprint.sha256(contract()))
                .asString()
                .matches("[0-9a-f]{64}");
        assertThat(first.toString())
                .doesNotContain("chatgpt-app-client-id")
                .doesNotContain("app-specific-callback");
    }

    @Test
    void reportsUpForPinnedPublicClientWithNoAssertionReplayCache() {
        OpenAiDeProperties properties = publicSecureProperties();

        var health = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract()),
                true,
                true).health();

        assertThat(health.getStatus()).isEqualTo(Status.UP);
        assertThat(health.getDetails())
                .containsEntry("publicClientConfigured", true)
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
            OpenAiDeProperties properties = publicSecureProperties();
            properties.getOauth().setRedirectUris(List.of(unsafeRedirect));

            var health = new OpenAiDeCoachHealthIndicator(
                    properties,
                    Optional.of(contract()),
                    true,
                    true).health();

            assertThat(health.getStatus()).as(unsafeRedirect).isEqualTo(Status.DOWN);
            assertThat(health.getDetails())
                    .containsEntry("redirectUrisConfigured", false)
                    .containsEntry("secureRedirectUrisConfigured", false);
        }

        OpenAiDeProperties properties = publicSecureProperties();
        properties.setMcpUrl("https://skillpilot.test/api/openai/de/mcp?tenant=one");
        properties.getOauth().setProtectedResourceMetadata(
                "https://skillpilot.test/api/openai/de/oauth/protected-resource#fragment");

        var health = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract()),
                true,
                true).health();

        assertThat(health.getStatus()).isEqualTo(Status.DOWN);
        assertThat(health.getDetails())
                .containsEntry("mcpUrlHttps", false)
                .containsEntry("protectedResourceMetadataHttps", false);
    }

    @Test
    void reportsDownWhenProviderBoundaryRateLimitIsDisabledOrInvalid() {
        OpenAiDeProperties properties = readyProperties();
        properties.getRateLimit().setEnabled(false);
        properties.getRateLimit().setMcpRequests(0);

        var health = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract()),
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
                .containsEntry("contractHash", "unavailable");
    }

    @Test
    void reportsUpForTlsAndOauthWhenMtlsEdgeIsDisabled() {
        OpenAiDeProperties properties = secureProperties();
        properties.getMtlsEdge().setEnabled(false);

        var health = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract()),
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
                        "skillpilot.openai.de.security.secure-mode=true",
                        "skillpilot.openai.de.oauth.enabled=true",
                        "skillpilot.openai.de.oauth.client-authentication-method=private_key_jwt",
                        "skillpilot.openai.de.oauth.client-id=https://chatgpt.com/oauth/skillpilot/client.json",
                        "skillpilot.openai.de.oauth.redirect-uris[0]=https://chatgpt.com/connector/oauth/callback",
                        "skillpilot.openai.de.oauth.client-jwk-set-uri=https://chatgpt.com/oauth/jwks.json",
                        "skillpilot.openai.de.oauth.client-assertion-signing-algorithm=RS256",
                        "skillpilot.openai.de.oauth.client-assertion-replay-cache-size=10000",
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
        properties.setMcpUrl("https://skillpilot.test/api/openai/de/mcp");
        properties.getOauth().setEnabled(true);
        properties.getOauth().setClientId("chatgpt-app-client-id");
        properties.getOauth().setRedirectUris(List.of(
                "https://chatgpt.com/connector/oauth/app-specific-callback"));
        properties.getOauth().setProtectedResourceMetadata(
                "https://skillpilot.test/api/openai/de/oauth/protected-resource");
        return properties;
    }

    private static OpenAiDeProperties secureProperties() {
        OpenAiDeProperties properties = readyProperties();
        properties.getSecurity().setSecureMode(true);
        properties.getOauth().setClientAuthenticationMethod("private_key_jwt");
        properties.getOauth().setClientId("https://chatgpt.com/oauth/skillpilot/client.json");
        properties.getOauth().setClientJwkSetUri("https://chatgpt.com/oauth/jwks.json");
        properties.getOauth().setClientAssertionSigningAlgorithm("RS256");
        properties.getOauth().setClientAssertionReplayCacheSize(10_000);
        properties.getMtlsEdge().setEnabled(true);
        properties.getMtlsEdge().setTrustedProxies(List.of("127.0.0.1", "::1"));
        return properties;
    }

    private static OpenAiDeProperties publicSecureProperties() {
        OpenAiDeProperties properties = readyProperties();
        properties.getSecurity().setSecureMode(true);
        properties.getOauth().setClientAuthenticationMethod("none");
        properties.getOauth().setClientAssertionReplayCacheSize(0);
        properties.getMtlsEdge().setEnabled(true);
        properties.getMtlsEdge().setTrustedProxies(List.of("127.0.0.1", "::1"));
        return properties;
    }

    private static OpenAiDeCoachMcpContract contract() {
        return new OpenAiDeCoachMcpContract(
                mock(CoachToolFacade.class),
                new CoachStateProjection("https://skillpilot.test"),
                mock(OpenAiDeCoachIdentityResolver.class),
                new OpenAiDeMcpTelemetry(new SimpleMeterRegistry()),
                "https://skillpilot.test");
    }
}
