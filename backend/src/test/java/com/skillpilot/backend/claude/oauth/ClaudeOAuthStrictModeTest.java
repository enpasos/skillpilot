package com.skillpilot.backend.claude.oauth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.skillpilot.backend.oauth.AuthenticatedClientPolicy;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;

class ClaudeOAuthStrictModeTest {
    @Test
    void alreadyRunningLegacyTokenEndpointReturnsAnOAuthErrorAfterCutover() throws Exception {
        var request = new org.springframework.mock.web.MockHttpServletRequest("POST", "/oauth2/token");
        var response = new org.springframework.mock.web.MockHttpServletResponse();
        new ClaudeOAuthPolicyErrorFilter().doFilter(request, response,
                (ignoredRequest, ignoredResponse) -> {
                    throw new AuthenticatedClientPolicy.PolicyRejectedException("internal-policy-detail");
                });
        assertEquals(401, response.getStatus());
        assertEquals("{\"error\":\"invalid_client\"}", response.getContentAsString());
    }

    @Test
    void globalAuthenticatedPolicyClosesLegacyRegistrationAndAuthorizationService() {
        var policy = mock(AuthenticatedClientPolicy.class);
        when(policy.isRequired()).thenReturn(true);
        var clients = mock(RegisteredClientRepository.class);
        var connections = mock(ClaudeCoachConnectionService.class);
        var configuration = new ClaudeOAuthConfiguration();
        assertThrows(IllegalStateException.class, () -> configuration.registerClaudeCimdClient(
                clients, ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID, Duration.ofHours(1),
                Duration.ofDays(30), policy).afterPropertiesSet());
        assertThrows(IllegalStateException.class, () -> configuration.claudeAuthorizationService(
                mock(JdbcOperations.class), clients, connections, policy));
        verifyNoInteractions(clients, connections);
    }

    @Test
    void alreadyRunningLegacyProcessReturnsBearerFailureAfterPolicyCutover() {
        var service = mock(OAuth2AuthorizationService.class);
        when(service.findByToken("synthetic-token", OAuth2TokenType.ACCESS_TOKEN))
                .thenThrow(new AuthenticatedClientPolicy.PolicyRejectedException("internal-policy-detail"));
        var introspector = new SkillPilotOpaqueTokenIntrospector(service,
                mock(RegisteredClientRepository.class), mock(ClaudeCoachConnectionService.class),
                ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID, "https://example.test/mcp");
        var failure = assertThrows(BadOpaqueTokenException.class, () -> introspector.introspect("synthetic-token"));
        assertFalse(failure.getMessage().contains("internal-"));
    }
}
