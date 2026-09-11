package com.skillpilot.backend.oauth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.InMemoryOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationCode;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2TokenRevocationAuthenticationProvider;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2TokenRevocationAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;

class OAuthTokenRevocationBoundaryTest {
    private final RegisteredClient client = RegisteredClient.withId("synthetic-client-row").clientId("synthetic-client")
            .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("https://example.com/callback").scope("read").build();
    private final OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(client)
            .principalName("synthetic-app").authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .attribute("state", "synthetic-consent-state")
            .token(new OAuth2AuthorizationCode("synthetic-code", Instant.now(), Instant.now().plusSeconds(60)))
            .accessToken(new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER,
                    "synthetic-access", Instant.now(), Instant.now().plusSeconds(300)))
            .refreshToken(new OAuth2RefreshToken("synthetic-refresh", Instant.now(), Instant.now().plusSeconds(600))).build();

    @Test void springRevocationCannotFindOrWriteAuthorizationCodesOrConsentState() {
        var storage = spy(new InMemoryOAuth2AuthorizationService(authorization));
        var provider = new OAuth2TokenRevocationAuthenticationProvider(new OAuthTokenRevocationBoundary(storage));
        for (String token : List.of("synthetic-code", "synthetic-consent-state")) {
            assertNotNull(provider.authenticate(request(token, client, null)));
            verify(storage).findByToken(token, OAuth2TokenType.ACCESS_TOKEN);
            verify(storage).findByToken(token, OAuth2TokenType.REFRESH_TOKEN);
        }
        verify(storage, never()).save(any());
        verify(storage, never()).remove(any());
        assertTrue(storage.findById(authorization.getId()).getToken(OAuth2AuthorizationCode.class).isActive());
    }

    @Test void accessAndRefreshStillRevokeEvenWithTheWrongHint() {
        for (String token : List.of("synthetic-access", "synthetic-refresh")) {
            var storage = new InMemoryOAuth2AuthorizationService(authorization);
            var provider = new OAuth2TokenRevocationAuthenticationProvider(new OAuthTokenRevocationBoundary(storage));
            assertNotNull(provider.authenticate(request(token, client, "authorization_code")));
            assertTrue(storage.findById(authorization.getId()).getToken(token).isInvalidated());
        }
    }

    @Test void foreignClientCannotRevokeEitherToken() {
        var storage = spy(new InMemoryOAuth2AuthorizationService(authorization));
        var provider = new OAuth2TokenRevocationAuthenticationProvider(new OAuthTokenRevocationBoundary(storage));
        var other = RegisteredClient.from(client).id("other-client-row").clientId("other-client").build();
        for (String token : List.of("synthetic-access", "synthetic-refresh")) {
            assertThrows(OAuth2AuthenticationException.class, () -> provider.authenticate(request(token, other, null)));
        }
        verify(storage, never()).save(any());
    }

    @Test void forbiddenExplicitTypesNeverReachStorage() {
        var storage = mock(OAuth2AuthorizationService.class);
        var boundary = new OAuthTokenRevocationBoundary(storage);
        Stream.of("code", "state", "id_token").forEach(type ->
                assertNull(boundary.findByToken("synthetic-value", new OAuth2TokenType(type))));
        verifyNoInteractions(storage);
    }

    @Test void unknownValuesNeverTriggerUntypedLookupOrWrites() {
        var storage = mock(OAuth2AuthorizationService.class);
        var boundary = new OAuthTokenRevocationBoundary(storage);
        assertNull(boundary.findByToken("unknown", null));
        verify(storage).findByToken("unknown", OAuth2TokenType.ACCESS_TOKEN);
        verify(storage).findByToken("unknown", OAuth2TokenType.REFRESH_TOKEN);
        verifyNoMoreInteractions(storage);
    }

    @Test void wiringReplacesOnlyTheRevocationProvider() {
        var storage = spy(new InMemoryOAuth2AuthorizationService(authorization));
        AuthenticationProvider untouched = mock(AuthenticationProvider.class);
        var original = new OAuth2TokenRevocationAuthenticationProvider(storage);
        List<AuthenticationProvider> providers = new ArrayList<>(List.of(untouched, original));
        OAuthTokenRevocationBoundary.restrict(providers, storage);
        assertSame(untouched, providers.getFirst());
        assertNotSame(original, providers.getLast());
        providers.getLast().authenticate(request("synthetic-code", client, null));
        verify(storage, never()).save(any());
    }

    private OAuth2TokenRevocationAuthenticationToken request(String token, RegisteredClient registered, String hint) {
        return new OAuth2TokenRevocationAuthenticationToken(token,
                new OAuth2ClientAuthenticationToken(registered, ClientAuthenticationMethod.CLIENT_SECRET_BASIC, null), hint);
    }
}
