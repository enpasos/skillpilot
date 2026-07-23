package com.skillpilot.backend.oauth;

import java.util.Objects;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

/**
 * Restricts an OAuth authorization service to authorizations issued for one provider client.
 *
 * <p>The underlying JDBC service deliberately uses the unscoped registered-client repository so
 * its row mapper can deserialize authorizations belonging to any provider in the shared OAuth
 * tables. This wrapper applies the provider boundary after deserialization. Foreign tokens and
 * authorization IDs therefore behave as absent instead of surfacing a row-mapping failure.</p>
 */
public final class ProviderScopedOAuth2AuthorizationService implements OAuth2AuthorizationService {

    private final OAuth2AuthorizationService delegate;
    private final RegisteredClientRepository providerClients;

    public ProviderScopedOAuth2AuthorizationService(
            OAuth2AuthorizationService delegate,
            RegisteredClientRepository providerClients) {
        this.delegate = Objects.requireNonNull(delegate, "delegate");
        this.providerClients = Objects.requireNonNull(providerClients, "providerClients");
    }

    @Override
    public void save(OAuth2Authorization authorization) {
        Objects.requireNonNull(authorization, "authorization");
        requireProviderAuthorization(authorization);
        delegate.save(authorization);
    }

    @Override
    public void remove(OAuth2Authorization authorization) {
        Objects.requireNonNull(authorization, "authorization");
        requireProviderAuthorization(authorization);
        delegate.remove(authorization);
    }

    @Override
    public OAuth2Authorization findById(String id) {
        return keepProviderAuthorization(delegate.findById(id));
    }

    @Override
    public OAuth2Authorization findByToken(String token, OAuth2TokenType tokenType) {
        return keepProviderAuthorization(delegate.findByToken(token, tokenType));
    }

    private OAuth2Authorization keepProviderAuthorization(OAuth2Authorization authorization) {
        return authorization != null && belongsToProvider(authorization) ? authorization : null;
    }

    private void requireProviderAuthorization(OAuth2Authorization authorization) {
        if (!belongsToProvider(authorization)) {
            throw new IllegalArgumentException("OAuth authorization does not belong to this provider boundary.");
        }
    }

    private boolean belongsToProvider(OAuth2Authorization authorization) {
        return providerClients.findById(authorization.getRegisteredClientId()) != null;
    }
}
