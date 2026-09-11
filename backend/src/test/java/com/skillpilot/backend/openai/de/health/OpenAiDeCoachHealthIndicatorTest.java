package com.skillpilot.backend.openai.de.health;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.oauth.AuthenticatedClientPolicy;
import com.skillpilot.backend.oauth.OAuthClientSecurityTestDatabase;
import com.skillpilot.backend.openai.de.OpenAiDeConfiguration;
import com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.OpenAiDeProperties.MtlsEdgeMode;
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
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.boot.health.actuate.endpoint.HealthEndpoint;
import org.springframework.boot.health.actuate.endpoint.HealthEndpointGroups;
import org.springframework.boot.health.autoconfigure.actuate.endpoint.HealthEndpointAutoConfiguration;
import org.springframework.boot.health.autoconfigure.registry.HealthContributorRegistryAutoConfiguration;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.oauth2.server.authorization.InMemoryOAuth2AuthorizationService;

class OpenAiDeCoachHealthIndicatorTest {

    private static final String TEST_CLIENT_SECRET =
            "test-client-secret-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    @Test
    void productionReadinessGroupsKeepJwtMetadataOutageSeparateFromSharedAppAndBasic() {
        var properties = strictProperties();
        var basic = properties.getOauth().getTransitionalBasic();
        basic.setEnabled(true);
        basic.setClientId("synthetic-existing-basic");
        basic.setClientSecret(TEST_CLIENT_SECRET);
        basic.setRedirectUris(List.of("https://chatgpt.com/connector/oauth/previous"));
        var databaseReady = new java.util.concurrent.atomic.AtomicBoolean(true);
        try (var metadata = new com.skillpilot.backend.openai.de.oauth.OpenAiDeCimdMetadataGate(() -> {})) {
            var indicator = new OpenAiDeCoachHealthIndicator(properties, Optional.of(contract()),
                    Optional.of(curriculumRevisionProvider()), true, false,
                    Optional.of(mock(AuthenticatedClientPolicy.class)), Optional.of(metadata));
            productionHealthRunner(databaseReady)
                    .withBean("openAiDeCoach", HealthIndicator.class, () -> indicator)
                    .run(context -> {
                        assertThat(context).hasNotFailed();
                        var groups = context.getBean(HealthEndpointGroups.class);
                        assertThat(groups.get("readiness").isMember("openAiDeCoach")).isFalse();
                        assertThat(groups.get("openaiReadiness").isMember("openAiDeCoach")).isTrue();
                        var endpoint = context.getBean(HealthEndpoint.class);
                        // The real OpenAI indicator is DOWN while its JWT metadata has no verified cache.
                        assertThat(indicator.health().getDetails()).containsEntry("clientMetadataReady", false)
                                .containsEntry("authenticationProfilesActive", java.util.Map.of(
                                        "chatgpt-cimd-jwt", false, "chatgpt-basic-transition", true));
                        assertThat(endpoint.healthForPath("readiness").getStatus()).isEqualTo(Status.UP);
                        assertThat(endpoint.healthForPath("openaiReadiness").getStatus()).isEqualTo(Status.DOWN);
                        assertThat(endpoint.health().getStatus()).isEqualTo(Status.DOWN);

                        metadata.initialRefresh();
                        assertThat(endpoint.healthForPath("readiness").getStatus()).isEqualTo(Status.UP);
                        assertThat(endpoint.healthForPath("openaiReadiness").getStatus()).isEqualTo(Status.UP);

                        databaseReady.set(false);
                        assertThat(endpoint.healthForPath("readiness").getStatus()).isEqualTo(Status.DOWN);
                        assertThat(endpoint.healthForPath("openaiReadiness").getStatus()).isEqualTo(Status.DOWN);
                    });
        }
    }

    @Test
    void sharedReadinessRemainsValidWhenOptionalOpenAiProviderIsDisabled() {
        productionHealthRunner(new java.util.concurrent.atomic.AtomicBoolean(true)).run(context -> {
            assertThat(context).hasNotFailed();
            assertThat(context).doesNotHaveBean("openAiDeCoach");
            assertThat(context.getBean(HealthEndpoint.class).healthForPath("readiness").getStatus())
                    .isEqualTo(Status.UP);
        });
    }

    private static ApplicationContextRunner productionHealthRunner(java.util.concurrent.atomic.AtomicBoolean databaseReady) {
        return new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(HealthContributorRegistryAutoConfiguration.class,
                        HealthEndpointAutoConfiguration.class))
                .withInitializer(context -> {
                    try {
                        // Bind the committed deployment groups, rather than duplicating their values in a test fixture.
                        for (var source : new YamlPropertySourceLoader().load("production-health-groups",
                                new ClassPathResource("application.yml"))) {
                            context.getEnvironment().getPropertySources().addLast(source);
                        }
                    } catch (java.io.IOException failure) {
                        throw new IllegalStateException("Production health configuration could not be loaded.", failure);
                    }
                })
                .withBean("readinessState", HealthIndicator.class, () -> () -> Health.up().build())
                .withBean("db", HealthIndicator.class,
                        () -> () -> (databaseReady.get() ? Health.up() : Health.down()).build());
    }

    @Test
    void basicTransitionAlsoRequiresAnAvailableProfilePolicyForReadiness() {
        var health = new OpenAiDeCoachHealthIndicator(secureProperties(), Optional.of(contract()),
                Optional.of(curriculumRevisionProvider()), true).health();
        assertThat(health.getStatus()).isEqualTo(Status.DOWN);
        assertThat(health.getDetails()).containsEntry("authenticationPolicyCompatible", false);
    }

    @Test
    void strictHealthRequiresARegisteredActivatedPolicyAndDoesNotExposePins() throws Exception {
        OpenAiDeProperties properties = strictProperties();
        assertThat(strictIndicator(properties, Optional.empty()).health().getStatus()).isEqualTo(Status.DOWN);
        var database = OAuthClientSecurityTestDatabase.create();
        var policy = AuthenticatedClientPolicy.independentProfiles(database.jdbc(), database.transactions());
        var indicator = strictIndicator(properties, Optional.of(policy));
        assertThat(indicator.health().getStatus()).isEqualTo(Status.DOWN);
        registerJwtProfile(policy, "synthetic-strict-profile-v1");
        assertThat(indicator.health().getStatus()).isEqualTo(Status.DOWN);
        policy.afterSingletonsInstantiated();

        var health = indicator.health();
        assertThat(health.getStatus()).isEqualTo(Status.UP);
        assertThat(health.getDetails())
                .containsEntry("authenticationProfile", "chatgpt-cimd-jwt")
                .containsEntry("authenticationPolicyCompatible", true)
                .containsEntry("clientAuthenticationConfigured", true)
                .containsEntry("privateKeyJwtConfigured", true)
                .containsEntry("clientSecretConfigured", false);
        assertThat(health.toString()).doesNotContain("synthetic-strict-profile-v1", "/oauth/client.json", "/oauth/jwks.json",
                properties.getOauth().getClientAssertionAudience(), "app-specific-callback");
    }

    @Test
    void runningStrictInstanceReportsDownAfterItsProviderProfileIsSuperseded() throws Exception {
        var database = OAuthClientSecurityTestDatabase.create();
        var oldPolicy = AuthenticatedClientPolicy.independentProfiles(database.jdbc(), database.transactions());
        registerJwtProfile(oldPolicy, "synthetic-old-profile");
        oldPolicy.afterSingletonsInstantiated();
        var oldIndicator = strictIndicator(strictProperties(), Optional.of(oldPolicy));
        assertThat(oldIndicator.health().getStatus()).isEqualTo(Status.UP);

        var nextPolicy = AuthenticatedClientPolicy.independentProfiles(database.jdbc(), database.transactions());
        registerJwtProfile(nextPolicy, "synthetic-current-profile");
        nextPolicy.afterSingletonsInstantiated();
        // The old floor-only check still succeeds: the profile-specific check is essential.
        oldPolicy.assertCompatible();
        var health = oldIndicator.health();
        assertThat(health.getStatus()).isEqualTo(Status.DOWN);
        assertThat(health.getDetails()).containsEntry("authenticationPolicyCompatible", false);
        assertThat(health.toString()).doesNotContain("synthetic-old-profile", "synthetic-current-profile", "superseded");
        assertThat(strictIndicator(strictProperties(), Optional.of(nextPolicy)).health().getStatus()).isEqualTo(Status.UP);
    }

    @Test
    void basicTransitionStaysReadyWhenIndependentJwtProfileIsActivated() throws Exception {
        var database = OAuthClientSecurityTestDatabase.create();
        var oldPolicy = AuthenticatedClientPolicy.independentProfiles(database.jdbc(), database.transactions());
        oldPolicy.protectProfiles(new InMemoryOAuth2AuthorizationService(), "openai", List.of(
                new AuthenticatedClientPolicy.Profile("chatgpt-basic-transition", "synthetic-basic", "client_secret_basic", true)),
                id -> "chatgpt-basic-transition");
        oldPolicy.afterSingletonsInstantiated();
        var oldIndicator = new OpenAiDeCoachHealthIndicator(secureProperties(), Optional.of(contract()),
                Optional.of(curriculumRevisionProvider()), true, false, Optional.of(oldPolicy));
        assertThat(oldIndicator.health().getStatus()).isEqualTo(Status.UP);
        var strictPolicy = AuthenticatedClientPolicy.independentProfiles(database.jdbc(), database.transactions());
        strictPolicy.protectProfiles(new InMemoryOAuth2AuthorizationService(), "openai", List.of(
                new AuthenticatedClientPolicy.Profile("chatgpt-basic-transition", "synthetic-basic", "client_secret_basic", true),
                new AuthenticatedClientPolicy.Profile("chatgpt-cimd-jwt", "synthetic-strict-profile", "private_key_jwt", false)),
                id -> "chatgpt-cimd-jwt");
        strictPolicy.afterSingletonsInstantiated();
        assertThat(oldIndicator.health().getStatus()).isEqualTo(Status.UP);
    }

    @Test
    void strictHealthRejectsWeakerAuthenticationAndMissingAssertionConfiguration() throws Exception {
        var database = OAuthClientSecurityTestDatabase.create();
        var policy = AuthenticatedClientPolicy.independentProfiles(database.jdbc(), database.transactions());
        registerJwtProfile(policy, "synthetic-strict-profile");
        policy.afterSingletonsInstantiated();
        for (String method : List.of("none", "client_secret_basic")) {
            var properties = strictProperties();
            properties.getOauth().setClientAuthenticationMethod(method);
            assertThat(strictIndicator(properties, Optional.of(policy)).health().getStatus()).isEqualTo(Status.DOWN);
        }
        var missingAudience = strictProperties();
        missingAudience.getOauth().setClientAssertionAudience("");
        assertThat(strictIndicator(missingAudience, Optional.of(policy)).health().getStatus()).isEqualTo(Status.DOWN);
        var excessiveLifetime = strictProperties();
        excessiveLifetime.getOauth().setClientAssertionMaxLifetime(java.time.Duration.ofMinutes(6));
        assertThat(strictIndicator(excessiveLifetime, Optional.of(policy)).health().getStatus()).isEqualTo(Status.DOWN);
    }

    @Test
    void strictHealthConvertsPolicyStorageFailuresToSanitizedDownStatus() {
        var policy = mock(AuthenticatedClientPolicy.class);
        doThrow(new org.springframework.dao.DataAccessResourceFailureException("internal-database-detail"))
                .when(policy).assertActiveProfile("openai", "chatgpt-cimd-jwt");
        var health = strictIndicator(strictProperties(), Optional.of(policy)).health();
        assertThat(health.getStatus()).isEqualTo(Status.DOWN);
        assertThat(health.getDetails()).containsEntry("authenticationPolicyCompatible", false);
        assertThat(health.toString()).doesNotContain("internal-database-detail");
    }

    private static OpenAiDeCoachHealthIndicator strictIndicator(OpenAiDeProperties properties,
            Optional<AuthenticatedClientPolicy> policy) {
        var metadata = new com.skillpilot.backend.openai.de.oauth.OpenAiDeCimdMetadataGate(() -> {});
        metadata.initialRefresh();
        return new OpenAiDeCoachHealthIndicator(properties, Optional.of(contract()),
                Optional.of(curriculumRevisionProvider()), true, false, policy, Optional.of(metadata));
    }

    private static void registerJwtProfile(AuthenticatedClientPolicy policy, String fingerprint) {
        policy.protectProfiles(new InMemoryOAuth2AuthorizationService(), "openai", List.of(
                new AuthenticatedClientPolicy.Profile("chatgpt-cimd-jwt", fingerprint, "private_key_jwt", false)),
                id -> "chatgpt-cimd-jwt");
    }

    private static OpenAiDeProperties strictProperties() {
        var properties = secureProperties();
        properties.getOauth().setClientAuthenticationMethod("private_key_jwt");
        properties.getOauth().setClientId("https://chatgpt.com/oauth/client.json");
        properties.getOauth().setClientJwkSetUri("https://chatgpt.com/oauth/jwks.json");
        properties.getOauth().setClientAssertionAudience("https://skillpilot.com/api/openai/v1/oauth2/token");
        properties.getOauth().setClientAssertionReplayCacheSize(1000);
        properties.getOauth().setClientSecret("");
        return properties;
    }

    @Test
    void reportsUpWithStableContractHashAndOnlyNonSecretConfigurationDetails() {
        assertThat(OpenAiDeCoachHealthIndicator.EXPECTED_TOOL_COUNT).isEqualTo(12);
        OpenAiDeProperties properties = secureProperties();
        properties.setMtlsEdgeMode(MtlsEdgeMode.OBSERVE);
        OpenAiDeV1McpContractAdapter contract = contract();
        OpenAiDeCoachHealthIndicator indicator = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract),
                Optional.of(curriculumRevisionProvider()),
                true, false, Optional.of(mock(AuthenticatedClientPolicy.class)));

        var first = indicator.health();
        var second = indicator.health();

        assertThat(first.getStatus()).isEqualTo(Status.UP);
        assertThat(first.getDetails())
                .containsEntry("provider", "openai")
                .containsEntry("localeBinding", "learning-session")
                .containsEntry("communicationLanguages", List.of("de", "en"))
                .containsEntry("mcpEnabled", true)
                .containsEntry("oauthEnabled", true)
                .containsEntry("mtlsEdgeMode", "observe")
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
                true, false, Optional.of(mock(AuthenticatedClientPolicy.class))).health();

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
                    true).health();

            assertThat(health.getStatus()).as(unsafeRedirect).isEqualTo(Status.DOWN);
            assertThat(health.getDetails())
                    .containsEntry("redirectUrisConfigured", false)
                    .containsEntry("secureRedirectUrisConfigured", false);
        }

        OpenAiDeProperties properties = secureProperties();
        properties.setMcpUrl("https://mcp-coach-v1.skillpilot.test/mcp?tenant=one");
        properties.getOauth().setProtectedResourceMetadata(
                "https://skillpilot.test/api/openai/v1/oauth/protected-resource#fragment");

        var health = new OpenAiDeCoachHealthIndicator(
                properties,
                Optional.of(contract()),
                Optional.of(curriculumRevisionProvider()),
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
                false);

        var health = indicator.health();

        assertThat(health.getStatus()).isEqualTo(Status.DOWN);
        assertThat(health.getDetails())
                .containsEntry("mcpEnabled", false)
                .containsEntry("oauthEnabled", false)
                .containsEntry("clientIdConfigured", false)
                .containsEntry("redirectUrisConfigured", false)
                .containsEntry("contractAvailable", false)
                .containsEntry("curriculumRevisionAvailable", false)
                .containsEntry("contractHash", "unavailable");
    }

    @Test
    void contributorExistsOnlyWhenOpenAiDeIsEnabled() {
        ApplicationContextRunner runner = new ApplicationContextRunner()
                .withUserConfiguration(OpenAiDeConfiguration.class, OpenAiDeCoachHealthIndicator.class);

        runner.run(context -> assertThat(context).doesNotHaveBean(OpenAiDeCoachHealthIndicator.class));
        runner.withPropertyValues(
                        "skillpilot.openai.coach.v1.enabled=true",
                        "skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg",
                        "skillpilot.openai.coach.v1.server-build=test-build",
                        "skillpilot.openai.coach.v1.security.secure-mode=true",
                        "skillpilot.openai.coach.v1.oauth.enabled=true",
                        "skillpilot.openai.coach.v1.oauth.client-authentication-method=client_secret_basic",
                        "skillpilot.openai.coach.v1.oauth.client-id=skillpilot-chatgpt-v1-prod",
                        "skillpilot.openai.coach.v1.oauth.client-secret=" + TEST_CLIENT_SECRET,
                        "skillpilot.openai.coach.v1.oauth.redirect-uris[0]=https://chatgpt.com/connector/oauth/callback",
                        "skillpilot.openai.coach.v1.oauth.client-assertion-replay-cache-size=0")
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
        properties.getOauth().setClientId("skillpilot-chatgpt-v1-prod");
        properties.getOauth().setClientSecret(TEST_CLIENT_SECRET);
        properties.getOauth().setClientAssertionReplayCacheSize(0);
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
