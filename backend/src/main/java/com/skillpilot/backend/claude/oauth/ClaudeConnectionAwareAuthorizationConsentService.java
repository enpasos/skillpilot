package com.skillpilot.backend.claude.oauth;

import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsent;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;

/** Serializes Claude consent persistence with learner deletion. */
final class ClaudeConnectionAwareAuthorizationConsentService
        implements OAuth2AuthorizationConsentService {

    private final OAuth2AuthorizationConsentService delegate;
    private final ClaudeCoachConnectionService connectionService;

    ClaudeConnectionAwareAuthorizationConsentService(
            OAuth2AuthorizationConsentService delegate,
            ClaudeCoachConnectionService connectionService) {
        this.delegate = delegate;
        this.connectionService = connectionService;
    }

    @Override
    public void save(OAuth2AuthorizationConsent authorizationConsent) {
        connectionService.withOAuthPersistenceLock(
                authorizationConsent.getPrincipalName(),
                () -> delegate.save(authorizationConsent));
    }

    @Override
    public void remove(OAuth2AuthorizationConsent authorizationConsent) {
        delegate.remove(authorizationConsent);
    }

    @Override
    public OAuth2AuthorizationConsent findById(String registeredClientId, String principalName) {
        return delegate.findById(registeredClientId, principalName);
    }
}
