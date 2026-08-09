package com.skillpilot.backend.openai.de.bootstrap;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthConfiguration;
import java.time.Instant;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

class OpenAiDeBootstrapOAuthAuthorizationVerifierTest {

    private static final String CLIENT_ID = "openai-v1-confidential-client";
    private static final String AUTHORIZATION_ID = "stable-authorization-id";

    @Test
    void validatesStableAuthorizationIdWithoutUsingSubjectOrTokenJti() {
        Fixture fixture = fixture(activeToken());

        assertThatCode(() -> fixture.verifier().requireActiveAuthorization(AUTHORIZATION_ID))
                .doesNotThrowAnyException();
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> fixture.verifier().requireActiveAuthorization("access-token-jti"))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);
    }

    @Test
    void revokedOrExpiredAuthorizationFailsClosed() {
        Instant expiredAt = Instant.now().minusSeconds(30);
        OAuth2AccessToken expired = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                "expired-token",
                expiredAt.minusSeconds(300),
                expiredAt,
                OpenAiDeBootstrapConstants.REQUIRED_SCOPES.stream().collect(java.util.stream.Collectors.toSet()));
        Fixture fixture = fixture(expired);

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> fixture.verifier().requireActiveAuthorization(AUTHORIZATION_ID))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.OAUTH_AUTHORIZATION_INVALID);
    }

    private static Fixture fixture(OAuth2AccessToken accessToken) {
        OAuth2AuthorizationService authorizations = mock(OAuth2AuthorizationService.class);
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        RegisteredClient client = RegisteredClient.withId("registered-client-id")
                .clientId(CLIENT_ID)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://chatgpt.com/connector/oauth/callback")
                .scope(OpenAiDeOAuthConfiguration.READ_SCOPE)
                .scope(OpenAiDeOAuthConfiguration.WRITE_SCOPE)
                .build();
        OAuth2AuthorizationRequest request = OAuth2AuthorizationRequest.authorizationCode()
                .authorizationUri("https://skillpilot.test/api/openai/v1/oauth2/authorize")
                .clientId(CLIENT_ID)
                .redirectUri("https://chatgpt.com/connector/oauth/callback")
                .scopes(Set.copyOf(OpenAiDeBootstrapConstants.REQUIRED_SCOPES))
                .additionalParameters(Map.of("resource", OpenAiDeBootstrapConstants.RESOURCE))
                .build();
        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(client)
                .id(AUTHORIZATION_ID)
                // Deliberately unrelated technical subject; it is never read.
                .principalName("provider-subject-that-is-not-a-learner")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizedScopes(Set.copyOf(OpenAiDeBootstrapConstants.REQUIRED_SCOPES))
                .attribute(OAuth2AuthorizationRequest.class.getName(), request)
                .accessToken(accessToken)
                .build();
        when(authorizations.findById(AUTHORIZATION_ID)).thenReturn(authorization);
        when(clients.findByClientId(CLIENT_ID)).thenReturn(client);

        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.getOauth().setClientId(CLIENT_ID);
        return new Fixture(new OpenAiDeBootstrapOAuthAuthorizationVerifier(
                authorizations,
                clients,
                properties));
    }

    private static OAuth2AccessToken activeToken() {
        Instant issuedAt = Instant.now();
        return new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                "opaque-access-token",
                issuedAt,
                issuedAt.plusSeconds(300),
                Set.copyOf(OpenAiDeBootstrapConstants.REQUIRED_SCOPES));
    }

    private record Fixture(OpenAiDeBootstrapOAuthAuthorizationVerifier verifier) {
    }
}
