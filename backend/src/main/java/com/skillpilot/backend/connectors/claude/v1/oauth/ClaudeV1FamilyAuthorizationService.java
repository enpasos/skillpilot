package com.skillpilot.backend.connectors.claude.v1.oauth;

import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

/** Applies family revocation to refresh AND access lookup without changing learner/session state. */
final class ClaudeV1FamilyAuthorizationService implements OAuth2AuthorizationService {
    private final OAuth2AuthorizationService delegate;
    private final RegisteredClientRepository clients;
    private final ClaudeV1RefreshTokenFamilies families;
    ClaudeV1FamilyAuthorizationService(OAuth2AuthorizationService delegate, RegisteredClientRepository clients,
            ClaudeV1RefreshTokenFamilies families) {
        this.delegate = delegate; this.clients = clients; this.families = families;
    }
    public void save(OAuth2Authorization authorization) {
        families.transaction(() -> {
            if (isPublic(authorization)) families.record(authorization);
            delegate.save(authorization);
            return null;
        });
    }
    public void remove(OAuth2Authorization authorization) {
        families.transaction(() -> { if (isPublic(authorization)) families.revoke(authorization.getId()); delegate.remove(authorization); return null; });
    }
    public OAuth2Authorization findById(String id) { return keep(delegate.findById(id)); }
    public OAuth2Authorization findByToken(String token, OAuth2TokenType type) { return keep(delegate.findByToken(token, type)); }
    private OAuth2Authorization keep(OAuth2Authorization candidate) {
        return candidate != null && (!isPublic(candidate) || families.permits(candidate)) ? candidate : null;
    }
    private boolean isPublic(OAuth2Authorization authorization) {
        var client = clients.findById(authorization.getRegisteredClientId());
        return client != null && client.getClientAuthenticationMethods().contains(ClientAuthenticationMethod.NONE);
    }
}
