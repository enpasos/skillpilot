package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import java.time.Instant;
import java.util.Objects;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.core.OAuth2Token;
import org.springframework.transaction.annotation.Transactional;

/** Marks a browser binding connected only after an access token was issued. */
class OpenAiDeConnectionAwareAuthorizationService implements OAuth2AuthorizationService {

    private final OAuth2AuthorizationService delegate;
    private final OpenAiDeCoachConnectionService connectionService;

    OpenAiDeConnectionAwareAuthorizationService(
            OAuth2AuthorizationService delegate,
            OpenAiDeCoachConnectionService connectionService) {
        this.delegate = delegate;
        this.connectionService = connectionService;
    }

    @Override
    @Transactional
    public void save(OAuth2Authorization authorization) {
        OAuth2Authorization existing = delegate.findById(authorization.getId());
        boolean firstAccessTokenIssued = authorization.getAccessToken() != null
                && authorization.getAccessToken().isActive()
                && (existing == null || existing.getAccessToken() == null);
        boolean explicitlyRevoked = tokenBecameInvalidated(
                        existing == null ? null : existing.getAccessToken(),
                        authorization.getAccessToken())
                || tokenBecameInvalidated(
                        existing == null ? null : existing.getRefreshToken(),
                        authorization.getRefreshToken());
        delegate.save(authorization);
        if (explicitlyRevoked) {
            connectionService.revokeConnectionSubject(authorization.getPrincipalName());
            return;
        }
        Instant credentialsExpireAt = latestActiveCredentialExpiry(authorization);
        if (firstAccessTokenIssued) {
            connectionService.markOAuthConnected(authorization.getPrincipalName(), credentialsExpireAt);
        } else if (credentialsExpireAt != null && authorization.getAccessToken() != null) {
            connectionService.updateOAuthAuthorizationExpiry(
                    authorization.getPrincipalName(), credentialsExpireAt);
        }
    }

    private boolean tokenBecameInvalidated(
            OAuth2Authorization.Token<? extends OAuth2Token> previous,
            OAuth2Authorization.Token<? extends OAuth2Token> current) {
        return previous != null
                && current != null
                && Objects.equals(previous.getToken().getTokenValue(), current.getToken().getTokenValue())
                && !previous.isInvalidated()
                && current.isInvalidated();
    }

    private Instant latestActiveCredentialExpiry(OAuth2Authorization authorization) {
        Instant accessExpiry = activeExpiry(authorization.getAccessToken());
        Instant refreshExpiry = activeExpiry(authorization.getRefreshToken());
        if (accessExpiry == null) {
            return refreshExpiry;
        }
        if (refreshExpiry == null) {
            return accessExpiry;
        }
        return accessExpiry.isAfter(refreshExpiry) ? accessExpiry : refreshExpiry;
    }

    private Instant activeExpiry(OAuth2Authorization.Token<? extends OAuth2Token> token) {
        return token != null && token.isActive() ? token.getToken().getExpiresAt() : null;
    }

    @Override
    @Transactional
    public void remove(OAuth2Authorization authorization) {
        delegate.remove(authorization);
        connectionService.revokeConnectionSubject(authorization.getPrincipalName());
    }

    @Override
    public OAuth2Authorization findById(String id) {
        return delegate.findById(id);
    }

    @Override
    public OAuth2Authorization findByToken(String token, OAuth2TokenType tokenType) {
        return delegate.findByToken(token, tokenType);
    }
}
