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

class OpenAiDeOAuthConfigurationTest {

    private final OpenAiDeOAuthConfiguration configuration = new OpenAiDeOAuthConfiguration();

    @Test
    void defaultsDoNotGuessChatGptClientOrCallback() {
        OpenAiDeProperties properties = new OpenAiDeProperties();

        assertThat(properties.getOauth().getClientId()).isEmpty();
        assertThat(properties.getOauth().getRedirectUris()).isEmpty();
    }

    @Test
    void disabledProviderDoesNotCreateRegistrationInitializer() {
        new ApplicationContextRunner()
                .withUserConfiguration(OpenAiDeConfiguration.class, OpenAiDeOAuthConfiguration.class)
                .withPropertyValues(
                        secureProviderPropertiesWith(
                                "skillpilot.openai.de.enabled=false"))
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).doesNotHaveBean("openAiDeClientRegistrationInitializer");
                    assertThat(context).doesNotHaveBean(OpenAiDeProperties.class);
                });
    }

    @Test
    void learningSessionTtlAcceptsTheAbsoluteTwentyFourHourMaximum() {
        new ApplicationContextRunner()
                .withUserConfiguration(OpenAiDeConfiguration.class)
                .withPropertyValues(
                        secureProviderPropertiesWith(
                                "skillpilot.openai.de.learning-session-ttl=PT24H"))
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context.getBean(OpenAiDeProperties.class).getLearningSessionTtl())
                            .isEqualTo(java.time.Duration.ofHours(24));
                });
    }

    @Test
    void learningSessionTtlRejectsNonPositiveAndMoreThanTwentyFourHours() {
        for (String invalidTtl : List.of("PT0S", "-PT1S", "PT24H1S")) {
            new ApplicationContextRunner()
                    .withUserConfiguration(OpenAiDeConfiguration.class)
                    .withPropertyValues(
                            "skillpilot.openai.de.enabled=true",
                            "skillpilot.openai.de.learning-session-ttl=" + invalidTtl)
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
            "skillpilot.openai.de.mtls-edge.trusted-proxies[0]=127.0.0.1"
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
        staticClient.getOauth().setClientId("skillpilot-chatgpt-de-prod");
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
                        "https://skillpilot.test/api/openai/de",
                        legacy))
                .containsEntry("token_endpoint_auth_methods_supported", List.of("none"))
                .doesNotContainKey("client_id_metadata_document_supported");

        OpenAiDeProperties secure = configuredPrivateKeyJwtProperties();
        assertThat(OpenAiDeOAuthMetadataController.authorizationServerMetadata(
                        "https://skillpilot.test/api/openai/de",
                        secure))
                .containsEntry("token_endpoint_auth_methods_supported", List.of("private_key_jwt"))
                .containsEntry("revocation_endpoint_auth_methods_supported", List.of("private_key_jwt"))
                .containsEntry("client_id_metadata_document_supported", true)
                .containsEntry("token_endpoint_auth_signing_alg_values_supported", List.of("RS256"))
                .doesNotContainKey("registration_endpoint");
    }

    @Test
    void rejectsNonHttpsResourceAndCallbackConfiguration() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        properties.setMcpUrl("http://skillpilot.test/api/openai/de/mcp");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("MCP resource")
                .withMessageContaining("HTTPS");
    }

    @Test
    void rejectsWhitespaceAroundExactResourceConfiguration() {
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        OpenAiDeProperties properties = configuredProperties();
        properties.setMcpUrl(" https://skillpilot.test/api/openai/de/mcp");

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(configuration.registerOpenAiDeClient(clients, properties)::afterPropertiesSet)
                .withMessageContaining("MCP resource")
                .withMessageContaining("whitespace");
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
                "https://skillpilot.test/api/openai/de/oauth/protected-resource?tenant=one",
                "https://skillpilot.test/api/openai/de/oauth/protected-resource#fragment")) {
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
        properties.setMcpUrl("https://skillpilot.test/api/openai/de/mcp");
        properties.getOauth().setClientId("chatgpt-app-client-id");
        properties.getOauth().setRedirectUris(List.of(
                "https://chatgpt.com/connector/oauth/app-specific-callback"));
        properties.getOauth().setProtectedResourceMetadata(
                "https://skillpilot.test/api/openai/de/oauth/protected-resource");
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
}
