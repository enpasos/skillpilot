package com.skillpilot.backend.claude.oauth;

import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsent;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationConsentService;

class ClaudeConnectionAwareAuthorizationConsentServiceTest {

    @Test
    void savesConsentOnlyInsideTheLearnerDeletionLock() {
        OAuth2AuthorizationConsentService delegate = mock(OAuth2AuthorizationConsentService.class);
        ClaudeCoachConnectionService connections = mock(ClaudeCoachConnectionService.class);
        OAuth2AuthorizationConsent consent = mock(OAuth2AuthorizationConsent.class);
        when(consent.getPrincipalName()).thenReturn("spc_subject");
        doAnswer(invocation -> {
            invocation.<Runnable>getArgument(1).run();
            return null;
        }).when(connections).withOAuthPersistenceLock(
                org.mockito.ArgumentMatchers.eq("spc_subject"),
                org.mockito.ArgumentMatchers.any(Runnable.class));
        ClaudeConnectionAwareAuthorizationConsentService service =
                new ClaudeConnectionAwareAuthorizationConsentService(delegate, connections);

        service.save(consent);

        verify(connections).withOAuthPersistenceLock(
                org.mockito.ArgumentMatchers.eq("spc_subject"),
                org.mockito.ArgumentMatchers.any(Runnable.class));
        verify(delegate).save(consent);
    }
}
