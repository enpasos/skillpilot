package com.skillpilot.backend.connectors.claude.v1.oauth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.oauth.AuthenticatedClientPolicy;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.client.InMemoryRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;

class ClaudeV1ClientPolicyTest {
    @Test
    void publicAndCustomProfilesCoexistWithoutAnyMethodFallback() throws Exception {
        ClaudeV1Properties properties = strictProperties();
        properties.getOauth().setClientAuthenticationMode(ClaudeV1Properties.OAuth.CUSTOM_PROFILE);
        properties.getOauth().setPublicCimdEnabled(true);
        var delegate = new InMemoryRegisteredClientRepository(publicClient("unrelated-row", "unrelated-client"));
        var repository = new ClaudeV1RegisteredClientRepository(delegate, properties);
        new ClaudeV1OAuthConfiguration().claudeV1ClientRegistrar(repository, properties, mock(AuthenticatedClientPolicy.class)).afterPropertiesSet();
        var custom = repository.findByClientId(properties.getOauth().getClientId());
        var hosted = repository.findByClientId(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID);
        assertNotNull(custom);
        assertNotNull(hosted);
        assertEquals(ClaudeV1Properties.OAuth.CUSTOM_PROFILE, ClaudeV1ClientPolicy.profileId(properties, custom));
        assertEquals(ClaudeV1Properties.OAuth.PUBLIC_PROFILE, ClaudeV1ClientPolicy.profileId(properties, hosted));
        assertEquals(java.util.Set.of(ClientAuthenticationMethod.NONE), hosted.getClientAuthenticationMethods());
        assertFalse(custom.getClientAuthenticationMethods().contains(ClientAuthenticationMethod.NONE));
        delegate.save(RegisteredClient.from(custom).clientAuthenticationMethods(methods -> {
            methods.clear(); methods.add(ClientAuthenticationMethod.NONE);
        }).build());
        assertNull(repository.findByClientId(custom.getClientId()));
        assertNotNull(repository.findByClientId(hosted.getClientId()));
        var metadata = new ClaudeV1OAuthMetadataController(properties).getAuthorizationServerMetadata().getBody();
        assertEquals(java.util.List.of("none", "client_secret_basic"), metadata.get("token_endpoint_auth_methods_supported"));
        assertFalse(metadata.containsKey("registration_endpoint"));
    }

    @Test
    void livePolicyCutoverAndUnavailableStoreBecomeSanitizedBearerFailures() {
        var service = mock(OAuth2AuthorizationService.class);
        var clients = mock(org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository.class);
        var introspector = new ClaudeV1OpaqueTokenIntrospector(service, clients, strictProperties());
        when(service.findByToken("synthetic", OAuth2TokenType.ACCESS_TOKEN))
                .thenThrow(new IllegalStateException("internal-policy-detail"))
                .thenThrow(new org.springframework.dao.DataAccessResourceFailureException("internal-database-detail"));
        for (int i = 0; i < 2; i++) {
            var failure = assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect("synthetic"));
            assertFalse(failure.getMessage().contains("internal-"));
        }
    }

    @Test
    void aStrictRepositoryRejectsPublicForeignAndDowngradedStoredClients() throws Exception {
        ClaudeV1Properties properties = strictProperties();
        RegisteredClient publicClient = publicClient("old-public-row", ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID);
        var delegate = new InMemoryRegisteredClientRepository(publicClient);
        var scoped = new ClaudeV1RegisteredClientRepository(delegate, properties);
        assertNull(scoped.findById(publicClient.getId()));
        assertNull(scoped.findByClientId(publicClient.getClientId()));
        assertThrows(IllegalArgumentException.class, () -> scoped.save(publicClient));

        new ClaudeV1OAuthConfiguration().claudeV1ClientRegistrar(scoped, properties, mock(AuthenticatedClientPolicy.class))
                .afterPropertiesSet();
        RegisteredClient confidential = scoped.findByClientId(properties.getOauth().getClientId());
        assertNotNull(confidential);
        delegate.save(RegisteredClient.from(confidential).clientAuthenticationMethods(methods -> {
            methods.clear();
            methods.add(ClientAuthenticationMethod.NONE);
        }).build());
        assertNull(scoped.findByClientId(confidential.getClientId()));
        assertNull(scoped.findById(confidential.getId()));
    }

    @Test
    void registrarCannotTakeOverAnotherProvidersClientId() {
        ClaudeV1Properties properties = strictProperties();
        var scoped = new ClaudeV1RegisteredClientRepository(new InMemoryRegisteredClientRepository(
                publicClient("foreign-row", properties.getOauth().getClientId())), properties);
        assertThrows(IllegalStateException.class, () -> new ClaudeV1OAuthConfiguration()
                .claudeV1ClientRegistrar(scoped, properties, mock(AuthenticatedClientPolicy.class)).afterPropertiesSet());
    }

    @Test
    void secretRotationPreservesClientIdentityAndStoresOnlyPasswordHashes() throws Exception {
        ClaudeV1Properties properties = strictProperties();
        var scoped = new ClaudeV1RegisteredClientRepository(new InMemoryRegisteredClientRepository(
                publicClient("unrelated-row", "unrelated-client")), properties);
        var registrar = new ClaudeV1OAuthConfiguration().claudeV1ClientRegistrar(scoped, properties,
                mock(AuthenticatedClientPolicy.class));
        registrar.afterPropertiesSet();
        RegisteredClient first = scoped.findByClientId(properties.getOauth().getClientId());
        registrar.afterPropertiesSet();
        assertEquals(first.getClientSecret(), scoped.findByClientId(first.getClientId()).getClientSecret());
        String oldSecret = properties.getOauth().getClientSecret();
        properties.getOauth().setClientSecret("synthetic-rotated-claude-secret-9876543210");
        registrar.afterPropertiesSet();
        RegisteredClient rotated = scoped.findByClientId(first.getClientId());
        assertEquals(first.getId(), rotated.getId());
        var encoder = PasswordEncoderFactories.createDelegatingPasswordEncoder();
        assertFalse(encoder.matches(oldSecret, rotated.getClientSecret()));
        assertTrue(encoder.matches(properties.getOauth().getClientSecret(), rotated.getClientSecret()));
    }

    @Test
    void staleRegistrarCannotMakeAnotherRunningInstanceAcceptItsPolicyOrSecret() throws Exception {
        ClaudeV1Properties activeProperties = strictProperties();
        var delegate = new InMemoryRegisteredClientRepository(publicClient("unrelated-row", "unrelated-client"));
        var active = new ClaudeV1RegisteredClientRepository(delegate, activeProperties);
        var configuration = new ClaudeV1OAuthConfiguration();
        configuration.claudeV1ClientRegistrar(active, activeProperties, mock(AuthenticatedClientPolicy.class)).afterPropertiesSet();
        RegisteredClient originallyActive = active.findByClientId(activeProperties.getOauth().getClientId());
        assertNotNull(originallyActive);

        ClaudeV1Properties staleProperties = strictProperties();
        staleProperties.getOauth().setAuthorizationPolicyVersion("retired-test-v0");
        var stale = new ClaudeV1RegisteredClientRepository(delegate, staleProperties);
        configuration.claudeV1ClientRegistrar(stale, staleProperties, mock(AuthenticatedClientPolicy.class)).afterPropertiesSet();
        assertNull(active.findByClientId(activeProperties.getOauth().getClientId()));
        assertFalse(ClaudeV1ClientPolicy.permitsClient(activeProperties,
                delegate.findByClientId(activeProperties.getOauth().getClientId())));

        // Also deny an out-of-band old secret even if the nonsecret policy version was unchanged.
        delegate.save(RegisteredClient.from(originallyActive).clientSecret(
                PasswordEncoderFactories.createDelegatingPasswordEncoder().encode("synthetic-stale-secret-0123456789"))
                .build());
        assertNull(active.findByClientId(activeProperties.getOauth().getClientId()));
        assertNull(active.findById(originallyActive.getId()));
    }

    @Test
    void policyFingerprintContainsNoSecretAndChangesForAuthVersionMethodOrScopes() {
        ClaudeV1Properties properties = strictProperties();
        String initial = ClaudeV1ClientPolicy.fingerprint(properties);
        properties.getOauth().setClientSecret("synthetic-other-claude-client-secret-0123456789");
        assertEquals(initial, ClaudeV1ClientPolicy.fingerprint(properties));
        properties.getOauth().setAuthorizationPolicyVersion("test-v2");
        assertNotEquals(initial, ClaudeV1ClientPolicy.fingerprint(properties));
        properties.getOauth().setAuthorizationPolicyVersion("test-v1");
        properties.getOauth().setClientAuthenticationMethod("client_secret_post");
        assertNotEquals(initial, ClaudeV1ClientPolicy.fingerprint(properties));
        properties.getOauth().setClientAuthenticationMethod("client_secret_basic");
        properties.getOauth().setScopes(List.of(ClaudeV1Contract.SCOPE_READ));
        assertNotEquals(initial, ClaudeV1ClientPolicy.fingerprint(properties));
    }

    private static ClaudeV1Properties strictProperties() {
        ClaudeV1Properties properties = new ClaudeV1Properties();
        properties.getOauth().setClientAuthenticationMode("anthropic-credentials");
        properties.getOauth().setClientId("skillpilot-claude-unit-test");
        properties.getOauth().setClientSecret("synthetic-claude-client-secret-0123456789");
        properties.getOauth().setClientAuthenticationMethod("client_secret_basic");
        properties.getOauth().setAuthorizationPolicyVersion("test-v1");
        return properties;
    }

    private static RegisteredClient publicClient(String id, String clientId) {
        return RegisteredClient.withId(id).clientId(clientId).clientAuthenticationMethod(ClientAuthenticationMethod.NONE)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK).scope(ClaudeV1Contract.SCOPE_READ).build();
    }
}
