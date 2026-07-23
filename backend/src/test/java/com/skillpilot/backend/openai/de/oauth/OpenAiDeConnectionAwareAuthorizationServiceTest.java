package com.skillpilot.backend.openai.de.oauth;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import java.time.Instant;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;

class OpenAiDeConnectionAwareAuthorizationServiceTest {

    private static final String SUBJECT = "spod_connection-subject";

    private final OAuth2AuthorizationService delegate = mock(OAuth2AuthorizationService.class);
    private final OpenAiDeCoachConnectionService connections = mock(OpenAiDeCoachConnectionService.class);
    private final OpenAiDeConnectionAwareAuthorizationService service =
            new OpenAiDeConnectionAwareAuthorizationService(delegate, connections);

    @Test
    void explicitSameTokenInvalidationRevokesConnectionLifecycle() {
        Instant now = Instant.now();
        OAuth2AccessToken accessToken = accessToken("access-token", now, now.plusSeconds(300));
        OAuth2Authorization existing = authorization("authorization", accessToken, null);
        OAuth2Authorization revoked = OAuth2Authorization.from(existing)
                .invalidate(accessToken)
                .build();
        when(delegate.findById(existing.getId())).thenReturn(existing);

        service.save(revoked);

        verify(delegate).save(revoked);
        verify(connections).revokeConnectionSubject(SUBJECT);
        verify(connections, never()).markOAuthConnected(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(Instant.class));
        verify(connections, never()).updateOAuthAuthorizationExpiry(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(Instant.class));
    }

    @Test
    void refreshRotationUpdatesExpiryWithoutTreatingReplacedTokenAsRevocation() {
        Instant now = Instant.now();
        OAuth2Authorization existing = authorization(
                "authorization",
                accessToken("old-access", now, now.plusSeconds(300)),
                new OAuth2RefreshToken("old-refresh", now, now.plusSeconds(3600)));
        Instant rotatedExpiry = now.plusSeconds(7200);
        OAuth2Authorization rotated = authorization(
                "authorization",
                accessToken("new-access", now.plusSeconds(1), now.plusSeconds(301)),
                new OAuth2RefreshToken("new-refresh", now.plusSeconds(1), rotatedExpiry));
        when(delegate.findById(existing.getId())).thenReturn(existing);

        service.save(rotated);

        verify(delegate).save(rotated);
        verify(connections).updateOAuthAuthorizationExpiry(SUBJECT, rotatedExpiry);
        verify(connections, never()).revokeConnectionSubject(SUBJECT);
        verify(connections, never()).markOAuthConnected(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.any(Instant.class));
    }

    @Test
    void removingAuthorizationAlsoRevokesConnectionLifecycle() {
        OAuth2Authorization authorization = authorization(
                "authorization",
                accessToken("access", Instant.now(), Instant.now().plusSeconds(300)),
                null);

        service.remove(authorization);

        verify(delegate).remove(authorization);
        verify(connections).revokeConnectionSubject(SUBJECT);
    }

    private OAuth2Authorization authorization(
            String id,
            OAuth2AccessToken accessToken,
            OAuth2RefreshToken refreshToken) {
        OAuth2Authorization.Builder builder = OAuth2Authorization.withRegisteredClient(registeredClient())
                .id(id)
                .principalName(SUBJECT)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizedScopes(Set.of(OpenAiDeOAuthConfiguration.READ_SCOPE))
                .accessToken(accessToken);
        if (refreshToken != null) {
            builder.refreshToken(refreshToken);
        }
        return builder.build();
    }

    private OAuth2AccessToken accessToken(String value, Instant issuedAt, Instant expiresAt) {
        return new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                value,
                issuedAt,
                expiresAt,
                Set.of(OpenAiDeOAuthConfiguration.READ_SCOPE));
    }

    private RegisteredClient registeredClient() {
        return RegisteredClient.withId("registered-client")
                .clientId("client")
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://chatgpt.test/callback")
                .scope(OpenAiDeOAuthConfiguration.READ_SCOPE)
                .build();
    }
}
