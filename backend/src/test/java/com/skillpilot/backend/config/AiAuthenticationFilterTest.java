package com.skillpilot.backend.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

class AiAuthenticationFilterTest {

    @Test
    void visibleActionRoute_requiresConfiguredBearerApiKey() throws Exception {
        AiAuthenticationFilter filter = new AiAuthenticationFilter();
        ReflectionTestUtils.setField(filter, "apiKey", "expected-key");
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET",
                "/api/ai/de/sessions/sps_visibleSecret/visible/state");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        assertThat(chain.getRequest()).isNull();
    }

    @Test
    void visibleActionRoute_acceptsConfiguredBearerApiKey() throws Exception {
        AiAuthenticationFilter filter = new AiAuthenticationFilter();
        ReflectionTestUtils.setField(filter, "apiKey", "expected-key");
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET",
                "/api/ai/de/sessions/sps_visibleSecret/visible/state");
        request.addHeader("Authorization", "Bearer expected-key");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(chain.getRequest()).isSameAs(request);
    }

    @Test
    void authenticationFailureLogPathDoesNotExposeVisibleSessionToken() {
        AiAuthenticationFilter filter = new AiAuthenticationFilter();

        String sanitized = filter.sanitizePathForLog(
                "/api/ai/de/sessions/sps_visibleSecret/visible/state");

        assertThat(sanitized)
                .isEqualTo("/api/ai/de/sessions/<chatSessionToken>/visible/state")
                .doesNotContain("sps_visibleSecret");
    }
}
