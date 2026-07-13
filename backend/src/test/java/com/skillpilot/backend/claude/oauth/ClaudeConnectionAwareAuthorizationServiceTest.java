package com.skillpilot.backend.claude.oauth;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;

class ClaudeConnectionAwareAuthorizationServiceTest {

    @Test
    void marksConnectionOnlyForTheFirstActiveAccessToken() {
        OAuth2AuthorizationService delegate = mock(OAuth2AuthorizationService.class);
        ClaudeCoachConnectionService connections = mock(ClaudeCoachConnectionService.class);
        ClaudeConnectionAwareAuthorizationService service =
                new ClaudeConnectionAwareAuthorizationService(delegate, connections);
        OAuth2Authorization authorization = mock(OAuth2Authorization.class);
        @SuppressWarnings("unchecked")
        OAuth2Authorization.Token<org.springframework.security.oauth2.core.OAuth2AccessToken> accessToken =
                mock(OAuth2Authorization.Token.class);
        when(authorization.getId()).thenReturn("authorization-id");
        when(authorization.getPrincipalName()).thenReturn("spc_subject");
        when(authorization.getAccessToken()).thenReturn(accessToken);
        when(accessToken.isActive()).thenReturn(true);
        when(delegate.findById("authorization-id")).thenReturn(null);

        service.save(authorization);

        verify(delegate).save(authorization);
        verify(connections).markOAuthConnected("spc_subject");
    }

    @Test
    void refreshOrRevocationSaveDoesNotReactivateConnection() {
        OAuth2AuthorizationService delegate = mock(OAuth2AuthorizationService.class);
        ClaudeCoachConnectionService connections = mock(ClaudeCoachConnectionService.class);
        ClaudeConnectionAwareAuthorizationService service =
                new ClaudeConnectionAwareAuthorizationService(delegate, connections);
        OAuth2Authorization authorization = mock(OAuth2Authorization.class);
        OAuth2Authorization existing = mock(OAuth2Authorization.class);
        @SuppressWarnings("unchecked")
        OAuth2Authorization.Token<org.springframework.security.oauth2.core.OAuth2AccessToken> accessToken =
                mock(OAuth2Authorization.Token.class);
        when(authorization.getId()).thenReturn("authorization-id");
        when(authorization.getAccessToken()).thenReturn(accessToken);
        when(accessToken.isActive()).thenReturn(true);
        when(existing.getAccessToken()).thenReturn(accessToken);
        when(delegate.findById("authorization-id")).thenReturn(existing);

        service.save(authorization);

        verify(delegate).save(authorization);
        verify(connections, never()).markOAuthConnected(org.mockito.ArgumentMatchers.anyString());
    }
}
