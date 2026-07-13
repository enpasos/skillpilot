package com.skillpilot.backend.claude.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.server.ResponseStatusException;

class ClaudeBindingAuthenticationFilterTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void invalidNewBindingClearsPreviouslyPersistedClaudePrincipal() throws Exception {
        ClaudeCoachConnectionService connectionService = mock(ClaudeCoachConnectionService.class);
        SecurityContextRepository contextRepository = mock(SecurityContextRepository.class);
        ClaudeBindingAuthenticationFilter filter = new ClaudeBindingAuthenticationFilter(
                connectionService,
                contextRepository,
                false);
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        "spc_previous-subject",
                        null,
                        List.of(new SimpleGrantedAuthority(
                                ClaudeBindingAuthenticationFilter.CONNECTION_AUTHORITY))));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/oauth2/authorize");
        request.setCookies(new jakarta.servlet.http.Cookie(
                ClaudeCoachConnectionService.BINDING_COOKIE_NAME,
                "spcb_expired"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        when(connectionService.consumeBindingGrant("spcb_expired"))
                .thenThrow(new ResponseStatusException(HttpStatus.GONE));

        filter.doFilter(request, response, chain);

        ArgumentCaptor<SecurityContext> savedContext = ArgumentCaptor.forClass(SecurityContext.class);
        verify(contextRepository).saveContext(savedContext.capture(),
                org.mockito.ArgumentMatchers.same(request),
                org.mockito.ArgumentMatchers.same(response));
        assertThat(savedContext.getValue().getAuthentication()).isNull();
        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        assertThat(response.getRedirectedUrl())
                .isEqualTo("/api/claude/oauth/connect-required?reason=expired");
        assertThat(response.getHeaders("Set-Cookie"))
                .anySatisfy(cookie -> assertThat(cookie)
                        .contains(ClaudeCoachConnectionService.BINDING_COOKIE_NAME + "=")
                        .contains("Max-Age=0"));
        verify(connectionService).consumeBindingGrant("spcb_expired");
        verify(contextRepository, never()).containsContext(request);
    }
}
