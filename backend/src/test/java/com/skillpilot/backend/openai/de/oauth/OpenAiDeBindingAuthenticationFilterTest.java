package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;

class OpenAiDeBindingAuthenticationFilterTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authorizationRequestCreatesOnlyTechnicalAppPrincipal() throws Exception {
        SecurityContextRepository contextRepository = mock(SecurityContextRepository.class);
        OpenAiDeBindingAuthenticationFilter filter =
                new OpenAiDeBindingAuthenticationFilter(contextRepository);
        MockHttpServletRequest request =
                new MockHttpServletRequest("GET", OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, new MockFilterChain());

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication).isNotNull();
        assertThat(authentication.getName()).startsWith("spoa_");
        assertThat(authentication.getAuthorities())
                .extracting(Object::toString)
                .containsExactly(OpenAiDeBindingAuthenticationFilter.CONNECTION_AUTHORITY);
        verify(contextRepository).saveContext(any(), any(), any());
    }

    @Test
    void unrelatedRequestDoesNotCreatePrincipal() throws Exception {
        SecurityContextRepository contextRepository = mock(SecurityContextRepository.class);
        OpenAiDeBindingAuthenticationFilter filter =
                new OpenAiDeBindingAuthenticationFilter(contextRepository);

        filter.doFilter(
                new MockHttpServletRequest("GET", OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH),
                new MockHttpServletResponse(),
                new MockFilterChain());

        assertThat(SecurityContextHolder.getContext().getAuthentication()).isNull();
        verify(contextRepository, never()).saveContext(any(), any(), any());
    }
}
