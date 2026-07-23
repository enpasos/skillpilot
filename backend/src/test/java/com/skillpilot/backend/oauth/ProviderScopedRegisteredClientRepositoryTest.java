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
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

class ProviderScopedRegisteredClientRepositoryTest {

    @Test
    void neverDelegatesLookupForAnotherProviderClientId() {
        RegisteredClientRepository delegate = mock(RegisteredClientRepository.class);
        ProviderScopedRegisteredClientRepository repository =
                new ProviderScopedRegisteredClientRepository(delegate, "openai-client");

        assertThat(repository.findByClientId("claude-client")).isNull();

        verify(delegate, never()).findByClientId("claude-client");
    }

    @Test
    void filtersForeignClientReturnedByInternalIdLookup() {
        RegisteredClientRepository delegate = mock(RegisteredClientRepository.class);
        RegisteredClient foreign = client("internal-claude", "claude-client");
        when(delegate.findById("internal-claude")).thenReturn(foreign);
        ProviderScopedRegisteredClientRepository repository =
                new ProviderScopedRegisteredClientRepository(delegate, "openai-client");

        assertThat(repository.findById("internal-claude")).isNull();
    }

    @Test
    void permitsOnlyTheConfiguredProviderClient() {
        RegisteredClientRepository delegate = mock(RegisteredClientRepository.class);
        RegisteredClient expected = client("internal-openai", "openai-client");
        when(delegate.findByClientId("openai-client")).thenReturn(expected);
        ProviderScopedRegisteredClientRepository repository =
                new ProviderScopedRegisteredClientRepository(delegate, "openai-client");

        assertThat(repository.findByClientId("openai-client")).isSameAs(expected);
        repository.save(expected);
        verify(delegate).save(expected);

        assertThatIllegalArgumentException()
                .isThrownBy(() -> repository.save(client("internal-claude", "claude-client")))
                .withMessageContaining("provider boundary");
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
