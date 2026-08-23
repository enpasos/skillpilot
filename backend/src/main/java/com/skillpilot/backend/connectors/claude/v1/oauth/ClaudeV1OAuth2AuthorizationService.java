package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import java.util.Objects;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;

/**
 * Isolates Claude v1 authorizations even though the hosted Claude CIMD client id was previously
 * used by the paused beta lane in the shared OAuth tables.
 */
final class ClaudeV1OAuth2AuthorizationService implements OAuth2AuthorizationService {

    static final String PROVIDER_ATTRIBUTE = "skillpilot_provider";

    private final OAuth2AuthorizationService delegate;
    private final RegisteredClientRepository registeredClients;

    ClaudeV1OAuth2AuthorizationService(
            OAuth2AuthorizationService delegate,
            RegisteredClientRepository registeredClients) {
        this.delegate = Objects.requireNonNull(delegate, "delegate");
        this.registeredClients = Objects.requireNonNull(registeredClients, "registeredClients");
    }

    @Override
    public void save(OAuth2Authorization authorization) {
        Objects.requireNonNull(authorization, "authorization");
        requireClaudeClientAndAppPrincipal(authorization, true);
        Object marker = authorization.getAttribute(PROVIDER_ATTRIBUTE);
        if (marker != null && !ClaudeV1Contract.PROVIDER_ID.equals(marker)) {
            throw new IllegalArgumentException("OAuth authorization carries a foreign provider marker.");
        }
        OAuth2Authorization marked = ClaudeV1Contract.PROVIDER_ID.equals(marker)
                ? authorization
                : OAuth2Authorization.from(authorization)
                        .attribute(PROVIDER_ATTRIBUTE, ClaudeV1Contract.PROVIDER_ID)
                        .build();
        delegate.save(marked);
    }

    @Override
    public void remove(OAuth2Authorization authorization) {
        Objects.requireNonNull(authorization, "authorization");
        if (!hasClaudeV1Marker(authorization) || !isClaudeClient(authorization)) {
            throw new IllegalArgumentException("OAuth authorization does not belong to Claude v1.");
        }
        delegate.remove(authorization);
    }

    @Override
    public OAuth2Authorization findById(String id) {
        return keepClaudeV1(delegate.findById(id));
    }

    @Override
    public OAuth2Authorization findByToken(String token, OAuth2TokenType tokenType) {
        return keepClaudeV1(delegate.findByToken(token, tokenType));
    }

    private OAuth2Authorization keepClaudeV1(OAuth2Authorization candidate) {
        if (candidate == null || !hasClaudeV1Marker(candidate)) {
            return null;
        }
        return requireClaudeClientAndAppPrincipal(candidate, false) ? candidate : null;
    }

    private boolean hasClaudeV1Marker(OAuth2Authorization authorization) {
        return ClaudeV1Contract.PROVIDER_ID.equals(authorization.getAttribute(PROVIDER_ATTRIBUTE));
    }

    private boolean isClaudeClient(OAuth2Authorization authorization) {
        return registeredClients.findById(authorization.getRegisteredClientId()) != null;
    }

    private boolean requireClaudeClientAndAppPrincipal(OAuth2Authorization authorization, boolean throwOnFailure) {
        RegisteredClient client = registeredClients.findById(authorization.getRegisteredClientId());
        boolean valid = client != null
                && authorization.getPrincipalName() != null
                && authorization.getPrincipalName().startsWith(ClaudeV1AppAuthenticationFilter.APP_SUBJECT_PREFIX);
        if (!valid && throwOnFailure) {
            throw new IllegalArgumentException(
                    "OAuth authorization is not bound to a Claude v1 app principal.");
        }
        return valid;
    }
}
