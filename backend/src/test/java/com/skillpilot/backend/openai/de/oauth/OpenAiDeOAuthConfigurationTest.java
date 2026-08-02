package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.openai.de.OpenAiDeConfiguration;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1PublicContractValidation;
import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.UnaryOperator;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.OAuth2TokenFormat;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;

class OpenAiDeOAuthConfigurationTest {

    private static final String TEST_CLIENT_SECRET =
            "test-client-secret-0123456789-ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String TEST_SIGNING_SECRET =
            "7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg";

    private final OpenAiDeOAuthConfiguration configuration = new OpenAiDeOAuthConfiguration();

    @Test
    void defaultsUseConfidentialAuthenticationButDoNotGuessClientCredentialsOrCallback() {
        OpenAiDeProperties properties = new OpenAiDeProperties();

        assertThat(properties.getOauth().getClientAuthenticationMethod())
                .isEqualTo("client_secret_basic");
        assertThat(properties.getOauth().getClientId()).isEmpty();
        assertThat(properties.getOauth().getClientSecret()).isEmpty();
        assertThat(properties.getOauth().getRedirectUris()).isEmpty();
        assertThat(properties.getOauth().getProtectedResourceMetadata())
                .isEqualTo(OpenAiDeV1ContractMetadata.PROTECTED_RESOURCE_METADATA_ENDPOINT);
    }

    @Test
    void disabledProviderDoesNotCreateRegistrationInitializer() {
        new ApplicationContextRunner()
                .withUserConfiguration(OpenAiDeConfiguration.class, OpenAiDeOAuthConfiguration.class)
                .withPropertyValues(
                        secureProviderPropertiesWith(
                                "skillpilot.openai.coach.v1.enabled=false"))
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).doesNotHaveBean("openAiDeClientRegistrationInitializer");
                    assertThat(context).doesNotHaveBean(OpenAiDeProperties.class);
                });
    }

    @Test
    void learningSessionTtlAcceptsExactlyTwentyFourHours() {
        new ApplicationContextRunner()
                .withUserConfiguration(OpenAiDeConfiguration.class)
                .withPropertyValues(
                        secureProviderPropertiesWith(
                                "skillpilot.openai.coach.v1.learning-session-ttl=PT24H"))
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context.getBean(OpenAiDeProperties.class).getLearningSessionTtl())
                            .isEqualTo(java.time.Duration.ofHours(24));
                });
    }

    @Test
    void learningSessionTtlRejectsAnythingOtherThanTwentyFourHours() {
        for (String invalidTtl : List.of("PT0S", "-PT1S", "PT1H", "PT23H59M59S", "PT24H1S")) {
            new ApplicationContextRunner()
                    .withUserConfiguration(OpenAiDeConfiguration.class)
                    .withPropertyValues(
                            "skillpilot.openai.coach.v1.enabled=true",
                            "skillpilot.security.signing-secret=" + TEST_SIGNING_SECRET,
                            "skillpilot.openai.coach.v1.learning-session-ttl=" + invalidTtl)
                    .run(context -> {
                        assertThat(context).hasFailed();
                        assertThat(context.getStartupFailure())
                                .hasRootCauseInstanceOf(IllegalStateException.class)
                                .rootCause()
                                .hasMessageContaining("learning-session-ttl");
                    });
        }
    }

    private static String[] secureProviderPropertiesWith(String override) {
        String[] baseline = new String[] {
            "skillpilot.openai.coach.v1.enabled=true",
            "skillpilot.security.signing-secret=" + TEST_SIGNING_SECRET,
            "skillpilot.openai.coach.v1.server-build=test-build",
            "skillpilot.openai.coach.v1.security.secure-mode=true",
            "skillpilot.openai.coach.v1.oauth.enabled=true",
            "skillpilot.openai.coach.v1.oauth.client-authentication-method=client_secret_basic",
            "skillpilot.openai.coach.v1.oauth.client-id=skillpilot-chatgpt-v1-prod",
            "skillpilot.openai.coach.v1.oauth.client-secret=" + TEST_CLIENT_SECRET,
            "skillpilot.openai.coach.v1.oauth.redirect-uris[0]=https://chatgpt.com/connector/oauth/callback",
            "skillpilot.openai.coach.v1.oauth.client-assertion-replay-cache-size=0"
        };
        String[] combined = java.util.Arrays.copyOf(baseline, baseline.length + 1);
        combined[baseline.length] = override;
        return combined;
    }

    @Test
    void enabledOauthFailsFastWithoutAppManagementValues() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = new OpenAiDeProperties();
        InitializingBean initializer = configuration.registerOpenAiDeClient(clients, properties);

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(initializer::afterPropertiesSet)
                .withMessageContaining("client-id")
                .withMessageContaining("ChatGPT app management");
    }

    @Test
    void enabledOauthFailsFastWithoutActualRedirectUri() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.getOauth().setClientId("configured-client-id");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("redirect-uris")
                .withMessageContaining("ChatGPT app management");
    }

    @Test
    void enabledOauthRejectsAnUnidentifiedServerBuild() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        properties.setServerBuild(OpenAiDeV1ContractMetadata.DEFAULT_SERVER_BUILD);

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("server-build")
                .withMessageContaining("must not be dev");
    }

    @Test
    void registersExactlyConfiguredPublicPkceClient() throws Exception {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        AtomicReference<RegisteredClient> persisted = new AtomicReference<>();
        when(clients.findByClientId("chatgpt-app-client-id"))
                .thenAnswer(invocation -> persisted.get());
        doAnswer(invocation -> {
                    persisted.set(invocation.getArgument(0));
                    return null;
                })
                .when(clients)
                .save(any(RegisteredClient.class));
        ArgumentCaptor<RegisteredClient> saved = ArgumentCaptor.forClass(RegisteredClient.class);

        configuration.registerOpenAiDeClient(clients, properties).afterPropertiesSet();

        verify(clients).save(saved.capture());
        RegisteredClient client = saved.getValue();
        assertThat(client.getClientId()).isEqualTo("chatgpt-app-client-id");
        assertThat(client.getRedirectUris()).containsExactly(
                "https://chatgpt.com/connector/oauth/app-specific-callback");
        assertThat(client.getClientAuthenticationMethods()).containsExactly(ClientAuthenticationMethod.NONE);
        assertThat(client.getAuthorizationGrantTypes()).containsExactlyInAnyOrder(
                AuthorizationGrantType.AUTHORIZATION_CODE,
                AuthorizationGrantType.REFRESH_TOKEN);
        assertThat(client.getScopes()).containsExactlyInAnyOrder(
                OpenAiDeOAuthConfiguration.READ_SCOPE,
                OpenAiDeOAuthConfiguration.WRITE_SCOPE,
                OpenAiDeOAuthConfiguration.OFFLINE_SCOPE);
        assertThat(client.getClientSettings().isRequireProofKey()).isTrue();
        assertThat(client.getClientSettings().isRequireAuthorizationConsent()).isTrue();
        assertThat(client.getTokenSettings().getAccessTokenFormat())
                .isEqualTo(OAuth2TokenFormat.REFERENCE);
        assertThat(client.getTokenSettings().getAccessTokenTimeToLive())
                .isEqualTo(properties.getOauth().getAccessTokenTtl());
        assertThat(client.getTokenSettings().getRefreshTokenTimeToLive())
                .isEqualTo(properties.getOauth().getRefreshTokenTtl());
        assertThat(client.getTokenSettings().isReuseRefreshTokens()).isFalse();
    }

    @Test
    void publicClientDoesNotRequirePrivateKeyJwtReplayCache() throws Exception {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        properties.getOauth().setClientAssertionReplayCacheSize(0);
        AtomicReference<RegisteredClient> persisted = new AtomicReference<>();
        when(clients.findByClientId("chatgpt-app-client-id"))
                .thenAnswer(invocation -> persisted.get());
        doAnswer(invocation -> {
                    persisted.set(invocation.getArgument(0));
                    return null;
                })
                .when(clients)
                .save(any(RegisteredClient.class));

        configuration.registerOpenAiDeClient(clients, properties).afterPropertiesSet();

        assertThat(persisted.get()).isNotNull();
        assertThat(persisted.get().getClientAuthenticationMethods())
                .containsExactly(ClientAuthenticationMethod.NONE);
    }

    @Test
    void registersExactlyConfiguredConfidentialPkceClientWithoutPersistingPlaintext()
            throws Exception {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredConfidentialProperties();
        AtomicReference<RegisteredClient> persisted = new AtomicReference<>();
        when(clients.findByClientId("skillpilot-chatgpt-v1-prod"))
                .thenAnswer(invocation -> persisted.get());
        doAnswer(invocation -> {
                    persisted.set(invocation.getArgument(0));
                    return null;
                })
                .when(clients)
                .save(any(RegisteredClient.class));

        configuration.registerOpenAiDeClient(clients, properties).afterPropertiesSet();

        RegisteredClient client = persisted.get();
        assertThat(client).isNotNull();
        assertThat(client.getClientId()).isEqualTo("skillpilot-chatgpt-v1-prod");
        assertThat(client.getClientAuthenticationMethods())
                .containsExactly(ClientAuthenticationMethod.CLIENT_SECRET_BASIC);
        assertThat(client.getClientSecret())
                .isNotBlank()
                .isNotEqualTo(TEST_CLIENT_SECRET);
        assertThat(PasswordEncoderFactories.createDelegatingPasswordEncoder()
                        .matches(TEST_CLIENT_SECRET, client.getClientSecret()))
                .isTrue();
        assertThat(client.getRedirectUris()).containsExactly(
                "https://chatgpt.com/connector/oauth/app-specific-callback");
        assertThat(client.getAuthorizationGrantTypes()).containsExactlyInAnyOrder(
                AuthorizationGrantType.AUTHORIZATION_CODE,
                AuthorizationGrantType.REFRESH_TOKEN);
        assertThat(client.getClientSettings().isRequireProofKey()).isTrue();
        assertThat(client.getClientSettings().isRequireAuthorizationConsent()).isTrue();
        assertThat(client.getTokenSettings().getAccessTokenFormat())
                .isEqualTo(OAuth2TokenFormat.REFERENCE);
    }

    @Test
    void confidentialClientRejectsMissingShortOrWhitespaceSecret() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);

        for (String invalidSecret : List.of(
                "",
                "too-short",
                "test-client-secret-0123456789 contains-whitespace")) {
            OpenAiDeProperties properties = configuredConfidentialProperties();
            properties.getOauth().setClientSecret(invalidSecret);

            assertThatExceptionOfType(IllegalStateException.class)
                    .as(invalidSecret)
                    .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                    .withMessageContaining("client-secret");
        }
    }

    @Test
    void registersPinnedCimdPrivateKeyJwtClient() throws Exception {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredPrivateKeyJwtProperties();
        String clientId = "https://chatgpt.com/oauth/skillpilot/client.json";
        AtomicReference<RegisteredClient> persisted = new AtomicReference<>();
        when(clients.findByClientId(clientId)).thenAnswer(invocation -> persisted.get());
        doAnswer(invocation -> {
                    persisted.set(invocation.getArgument(0));
                    return null;
                })
                .when(clients)
                .save(any(RegisteredClient.class));
        ArgumentCaptor<RegisteredClient> saved = ArgumentCaptor.forClass(RegisteredClient.class);

        configuration.registerOpenAiDeClient(clients, properties).afterPropertiesSet();

        verify(clients).save(saved.capture());
        RegisteredClient client = saved.getValue();
        assertThat(client.getClientId()).isEqualTo(clientId);
        assertThat(client.getClientAuthenticationMethods())
                .containsExactly(ClientAuthenticationMethod.PRIVATE_KEY_JWT);
        assertThat(client.getClientSettings().getJwkSetUrl())
                .isEqualTo("https://chatgpt.com/oauth/jwks.json");
        assertThat(client.getClientSettings().getTokenEndpointAuthenticationSigningAlgorithm())
                .isEqualTo(SignatureAlgorithm.RS256);
        assertThat(client.getClientSettings().isRequireProofKey()).isTrue();
        assertThat(client.getTokenSettings().getAccessTokenFormat())
                .isEqualTo(OAuth2TokenFormat.REFERENCE);
        assertThat(client.getTokenSettings().getAccessTokenTimeToLive())
                .isEqualTo(properties.getOauth().getAccessTokenTtl());
        assertThat(client.getTokenSettings().getRefreshTokenTimeToLive())
                .isEqualTo(properties.getOauth().getRefreshTokenTtl());
        assertThat(client.getTokenSettings().isReuseRefreshTokens()).isFalse();
    }

    @Test
    void startupRefusesPersistedTokenPolicyTampering() {
        OpenAiDeProperties properties = configuredProperties();
        Duration accessTtl = properties.getOauth().getAccessTokenTtl();
        Duration refreshTtl = properties.getOauth().getRefreshTokenTtl();

        for (TokenSettings tamperedSettings : List.of(
                tokenSettings(OAuth2TokenFormat.SELF_CONTAINED, accessTtl, refreshTtl, false),
                tokenSettings(
                        OAuth2TokenFormat.REFERENCE,
                        accessTtl.plusSeconds(1),
                        refreshTtl,
                        false),
                tokenSettings(
                        OAuth2TokenFormat.REFERENCE,
                        accessTtl,
                        refreshTtl.plusSeconds(1),
                        false),
                tokenSettings(OAuth2TokenFormat.REFERENCE, accessTtl, refreshTtl, true))) {
            assertPersistedRegistrationTamperingRejected(
                    properties,
                    client -> RegisteredClient.from(client)
                            .tokenSettings(tamperedSettings)
                            .build());
        }
    }

    @Test
    void startupRefusesPersistedPrivateJwtKeyBindingTampering() {
        OpenAiDeProperties properties = configuredPrivateKeyJwtProperties();

        assertPersistedRegistrationTamperingRejected(
                properties,
                client -> RegisteredClient.from(client)
                        .clientSettings(privateJwtClientSettings(
                                "https://chatgpt.com/oauth/other-jwks.json",
                                SignatureAlgorithm.RS256))
                        .build());
        assertPersistedRegistrationTamperingRejected(
                properties,
                client -> RegisteredClient.from(client)
                        .clientSettings(privateJwtClientSettings(
                                properties.getOauth().getClientJwkSetUri(),
                                SignatureAlgorithm.RS512))
                        .build());
    }

    @Test
    void startupRefusesPersistedConfidentialClientSecretTampering() {
        OpenAiDeProperties properties = configuredConfidentialProperties();

        assertPersistedRegistrationTamperingRejected(
                properties,
                client -> RegisteredClient.from(client)
                        .clientSecret("{noop}different-secret-value-that-is-long-enough")
                        .build());
    }

    @Test
    void startupRefusesUnverifiableCimdBeforeCutoverOrClientRegistration() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeOAuthLegacyClientCutover cutover =
                mock(OpenAiDeOAuthLegacyClientCutover.class);
        OpenAiDeProperties properties = configuredPrivateKeyJwtProperties();
        OpenAiDeCimdMetadataValidator validator =
                new OpenAiDeCimdMetadataValidator(
                        new ObjectMapper(),
                        ignored -> {
                            throw new IOException("offline");
                        });
        InitializingBean initializer =
                configuration.openAiDeClientRegistrationInitializer(
                        clients,
                        properties,
                        cutover,
                        validator);

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(initializer::afterPropertiesSet)
                .withMessageContaining("CIMD metadata could not be retrieved");
        verifyNoInteractions(cutover, clients);
    }

    @Test
    void privateKeyJwtRejectsStaticClientIdMissingJwksAndCrossOriginJwks() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);

        OpenAiDeProperties staticClient = configuredPrivateKeyJwtProperties();
        staticClient.getOauth().setClientId("skillpilot-chatgpt-v1-prod");
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, staticClient)::afterPropertiesSet)
                .withMessageContaining("CIMD client ID")
                .withMessageContaining("HTTPS");

        OpenAiDeProperties missingJwks = configuredPrivateKeyJwtProperties();
        missingJwks.getOauth().setClientJwkSetUri("");
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, missingJwks)::afterPropertiesSet)
                .withMessageContaining("client JWK Set URL");

        OpenAiDeProperties crossOriginJwks = configuredPrivateKeyJwtProperties();
        crossOriginJwks.getOauth().setClientJwkSetUri("https://attacker.example/oauth/jwks.json");
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, crossOriginJwks)::afterPropertiesSet)
                .withMessageContaining("same HTTPS origin");
    }

    @Test
    void privateKeyJwtRejectsUnsupportedAssertionAlgorithm() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredPrivateKeyJwtProperties();
        properties.getOauth().setClientAssertionSigningAlgorithm("HS256");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("signing algorithm");
    }

    @Test
    void discoveryAdvertisesOnlyConfiguredClientAuthenticationMode() {
        OpenAiDeProperties legacy = configuredProperties();
        assertThat(OpenAiDeOAuthMetadataController.authorizationServerMetadata(
                        "https://skillpilot.test/api/openai/v1",
                        legacy))
                .containsEntry("token_endpoint_auth_methods_supported", List.of("none"))
                .doesNotContainKey("client_id_metadata_document_supported");

        OpenAiDeProperties secure = configuredConfidentialProperties();
        assertThat(OpenAiDeOAuthMetadataController.authorizationServerMetadata(
                        "https://skillpilot.test/api/openai/v1",
                        secure))
                .containsEntry("token_endpoint_auth_methods_supported", List.of("client_secret_basic"))
                .containsEntry("revocation_endpoint_auth_methods_supported", List.of("client_secret_basic"))
                .containsEntry("code_challenge_methods_supported", List.of("S256"))
                .doesNotContainKey("client_id_metadata_document_supported")
                .doesNotContainKey("registration_endpoint");
    }

    @Test
    void rejectsNonHttpsResourceAndCallbackConfiguration() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        properties.setMcpUrl("http://mcp-coach-v1.skillpilot.test/mcp");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("public MCP endpoint")
                .withMessageContaining("HTTPS");
    }

    @Test
    void rejectsWhitespaceAroundExactResourceConfiguration() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        properties.setMcpUrl(" https://mcp-coach-v1.skillpilot.test/mcp");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("public MCP endpoint")
                .withMessageContaining("whitespace");
    }

    @Test
    void requiresThePathSpecificCanonicalOAuthResource() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        properties.setOauthResource("https://skillpilot.com");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("OAuth resource")
                .withMessageContaining(OpenAiDeV1ContractMetadata.OAUTH_RESOURCE);
    }

    @Test
    void rejectsPublicBaseUrlsThatAreNotHttpsOrigins() {
        for (String unsafeBaseUrl : List.of(
                "https://user@skillpilot.test",
                "https://skillpilot.test/prefix",
                "https://skillpilot.test?tenant=one")) {
            assertThatExceptionOfType(IllegalStateException.class)
                    .as(unsafeBaseUrl)
                    .isThrownBy(() -> configuration.openAiDeAuthorizationServerSettings(unsafeBaseUrl));
        }
    }

    @Test
    void rejectsQueryOrFragmentInProtocolEndpointConfiguration() {
        for (String unsafeMetadataUrl : List.of(
                "https://skillpilot.test/api/openai/v1/oauth/protected-resource?tenant=one",
                "https://skillpilot.test/api/openai/v1/oauth/protected-resource#fragment")) {
            RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
            OpenAiDeProperties properties = configuredProperties();
            properties.getOauth().setProtectedResourceMetadata(unsafeMetadataUrl);

            assertThatExceptionOfType(IllegalStateException.class)
                    .as(unsafeMetadataUrl)
                    .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                    .withMessageContaining("protected-resource metadata URL")
                    .withMessageContaining("query");
        }
    }

    private void assertPersistedRegistrationTamperingRejected(
            OpenAiDeProperties properties,
            UnaryOperator<RegisteredClient> tamper) {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        AtomicReference<RegisteredClient> persisted = new AtomicReference<>();
        String clientId = properties.getOauth().getClientId();
        when(clients.findByClientId(clientId)).thenAnswer(invocation -> persisted.get());
        doAnswer(invocation -> {
                    RegisteredClient saved = invocation.getArgument(0);
                    persisted.set(tamper.apply(saved));
                    return null;
                })
                .when(clients)
                .save(any(RegisteredClient.class));

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("key binding")
                .withMessageContaining("token policy");
    }

    private static TokenSettings tokenSettings(
            OAuth2TokenFormat accessTokenFormat,
            Duration accessTtl,
            Duration refreshTtl,
            boolean reuseRefreshTokens) {
        return TokenSettings.builder()
                .accessTokenFormat(accessTokenFormat)
                .accessTokenTimeToLive(accessTtl)
                .refreshTokenTimeToLive(refreshTtl)
                .reuseRefreshTokens(reuseRefreshTokens)
                .build();
    }

    private static ClientSettings privateJwtClientSettings(
            String jwkSetUrl,
            SignatureAlgorithm signingAlgorithm) {
        return ClientSettings.builder()
                .requireProofKey(true)
                .requireAuthorizationConsent(true)
                .jwkSetUrl(jwkSetUrl)
                .tokenEndpointAuthenticationSigningAlgorithm(signingAlgorithm)
                .build();
    }

    private OpenAiDeProperties configuredProperties() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.setMcpUrl(OpenAiDeV1ContractMetadata.PUBLIC_MCP_ENDPOINT);
        properties.setOauthResource(OpenAiDeV1ContractMetadata.OAUTH_RESOURCE);
        properties.setServerBuild("test-build");
        properties.getOauth().setClientAuthenticationMethod("none");
        properties.getOauth().setClientId("chatgpt-app-client-id");
        properties.getOauth().setRedirectUris(List.of(
                "https://chatgpt.com/connector/oauth/app-specific-callback"));
        properties.getOauth().setProtectedResourceMetadata(
                OpenAiDeV1PublicContractValidation.PROTECTED_RESOURCE_METADATA);
        return properties;
    }

    private OpenAiDeProperties configuredPrivateKeyJwtProperties() {
        OpenAiDeProperties properties = configuredProperties();
        properties.getOauth().setClientAuthenticationMethod("private_key_jwt");
        properties.getOauth().setClientId("https://chatgpt.com/oauth/skillpilot/client.json");
        properties.getOauth().setClientJwkSetUri("https://chatgpt.com/oauth/jwks.json");
        properties.getOauth().setClientAssertionSigningAlgorithm("RS256");
        return properties;
    }

    private OpenAiDeProperties configuredConfidentialProperties() {
        OpenAiDeProperties properties = configuredProperties();
        properties.getOauth().setClientAuthenticationMethod("client_secret_basic");
        properties.getOauth().setClientId("skillpilot-chatgpt-v1-prod");
        properties.getOauth().setClientSecret(TEST_CLIENT_SECRET);
        properties.getOauth().setClientAssertionReplayCacheSize(0);
        return properties;
    }
}
