package com.skillpilot.backend.claude.oauth;

import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;

/** Marks a browser binding as connected only after an OAuth access token was actually issued. */
final class ClaudeConnectionAwareAuthorizationService implements OAuth2AuthorizationService {

    private final OAuth2AuthorizationService delegate;
    private final ClaudeCoachConnectionService connectionService;

    ClaudeConnectionAwareAuthorizationService(
            OAuth2AuthorizationService delegate,
            ClaudeCoachConnectionService connectionService) {
        this.delegate = delegate;
        this.connectionService = connectionService;
    }

    @Override
    public void save(OAuth2Authorization authorization) {
        connectionService.withOAuthPersistenceLock(authorization.getPrincipalName(), () -> {
            OAuth2Authorization existing = delegate.findById(authorization.getId());
            boolean firstAccessTokenIssued = authorization.getAccessToken() != null
                    && authorization.getAccessToken().isActive()
                    && (existing == null || existing.getAccessToken() == null);
            delegate.save(authorization);
            if (firstAccessTokenIssued) {
                connectionService.markOAuthConnected(authorization.getPrincipalName());
            }
        });
    }

    @Override
    public void remove(OAuth2Authorization authorization) {
        delegate.remove(authorization);
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
