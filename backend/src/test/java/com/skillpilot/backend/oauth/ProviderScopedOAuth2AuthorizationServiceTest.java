package com.skillpilot.backend.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

class ProviderScopedOAuth2AuthorizationServiceTest {

    @Test
    void returnsProviderAuthorizationAndFiltersForeignAuthorization() {
        RegisteredClient expectedClient = client("internal-openai", "openai-client");
        RegisteredClient foreignClient = client("internal-claude", "claude-client");
        OAuth2Authorization expected = authorization(expectedClient, "expected-auth");
        OAuth2Authorization foreign = authorization(foreignClient, "foreign-auth");
        OAuth2AuthorizationService delegate = mock(OAuth2AuthorizationService.class);
        RegisteredClientRepository providerClients = mock(RegisteredClientRepository.class);
        when(providerClients.findById(expectedClient.getId())).thenReturn(expectedClient);
        when(delegate.findById(expected.getId())).thenReturn(expected);
        when(delegate.findById(foreign.getId())).thenReturn(foreign);
        when(delegate.findByToken("expected-token", OAuth2TokenType.ACCESS_TOKEN)).thenReturn(expected);
        when(delegate.findByToken("foreign-token", OAuth2TokenType.ACCESS_TOKEN)).thenReturn(foreign);
        ProviderScopedOAuth2AuthorizationService service =
                new ProviderScopedOAuth2AuthorizationService(delegate, providerClients);

        assertThat(service.findById(expected.getId())).isSameAs(expected);
        assertThat(service.findById(foreign.getId())).isNull();
        assertThat(service.findByToken("expected-token", OAuth2TokenType.ACCESS_TOKEN)).isSameAs(expected);
        assertThat(service.findByToken("foreign-token", OAuth2TokenType.ACCESS_TOKEN)).isNull();
    }

    @Test
    void rejectsSavingOrRemovingForeignAuthorization() {
        RegisteredClient foreignClient = client("internal-claude", "claude-client");
        OAuth2Authorization foreign = authorization(foreignClient, "foreign-auth");
        OAuth2AuthorizationService delegate = mock(OAuth2AuthorizationService.class);
        RegisteredClientRepository providerClients = mock(RegisteredClientRepository.class);
        ProviderScopedOAuth2AuthorizationService service =
                new ProviderScopedOAuth2AuthorizationService(delegate, providerClients);

        assertThatIllegalArgumentException()
                .isThrownBy(() -> service.save(foreign))
                .withMessageContaining("provider boundary");
        assertThatIllegalArgumentException()
                .isThrownBy(() -> service.remove(foreign))
                .withMessageContaining("provider boundary");
        verify(delegate, never()).save(foreign);
        verify(delegate, never()).remove(foreign);
    }

    private static OAuth2Authorization authorization(RegisteredClient client, String id) {
        return OAuth2Authorization.withRegisteredClient(client)
                .id(id)
                .principalName("provider-user")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .build();
    }

    private static RegisteredClient client(String id, String clientId) {
        return RegisteredClient.withId(id)
                .clientId(clientId)
                .clientName(clientId)
                .clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://client.example/callback")
                .build();
    }
}
