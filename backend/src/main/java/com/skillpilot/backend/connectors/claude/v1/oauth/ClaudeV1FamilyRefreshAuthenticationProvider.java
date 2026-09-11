package com.skillpilot.backend.connectors.claude.v1.oauth;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2RefreshTokenAuthenticationToken;

/** Serializes public refresh exchanges across all application instances using the database family lock. */
final class ClaudeV1FamilyRefreshAuthenticationProvider implements AuthenticationProvider {
    private final AuthenticationProvider delegate;
    private final ClaudeV1RefreshTokenFamilies families;
    ClaudeV1FamilyRefreshAuthenticationProvider(AuthenticationProvider delegate, ClaudeV1RefreshTokenFamilies families) {
        this.delegate = delegate; this.families = families;
    }
    public Authentication authenticate(Authentication authentication) {
        var refresh = (OAuth2RefreshTokenAuthenticationToken) authentication;
        if (refresh.getPrincipal() instanceof OAuth2ClientAuthenticationToken client && client.isAuthenticated()
                && ClientAuthenticationMethod.NONE.equals(client.getClientAuthenticationMethod()) && client.getRegisteredClient() != null) {
            return families.refresh(refresh.getRefreshToken(), client.getRegisteredClient().getId(), () -> delegate.authenticate(authentication));
        }
        return delegate.authenticate(authentication);
    }
    public boolean supports(Class<?> type) { return delegate.supports(type); }
}
