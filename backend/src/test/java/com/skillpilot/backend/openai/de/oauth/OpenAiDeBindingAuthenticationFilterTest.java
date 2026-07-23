package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.server.ResponseStatusException;

class OpenAiDeBindingAuthenticationFilterTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void consumedBindingRecordsOnlyBoundedReplayEventAndClearsCookie() throws Exception {
        OpenAiDeCoachConnectionService connectionService = mock(OpenAiDeCoachConnectionService.class);
        SecurityContextRepository contextRepository = mock(SecurityContextRepository.class);
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeOperationalTelemetry telemetry = new OpenAiDeOperationalTelemetry(registry);
        OpenAiDeBindingAuthenticationFilter filter = new OpenAiDeBindingAuthenticationFilter(
                connectionService,
                contextRepository,
                telemetry,
                false);
        MockHttpServletRequest request = new MockHttpServletRequest(
                "GET",
                OpenAiDeCoachConnectionService.AUTHORIZATION_PATH);
        request.setCookies(
                new Cookie(OpenAiDeCoachConnectionService.BINDING_COOKIE_NAME, "spodb_consumed"),
                new Cookie(OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_NAME, "spobs_browser"));
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(connectionService.consumeBindingGrant("spodb_consumed", "spobs_browser"))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "private replay detail"));

        filter.doFilter(request, response, new MockFilterChain());

        assertThat(response.getRedirectedUrl())
                .isEqualTo("/api/openai/de/oauth/connect-required?reason=expired");
        assertThat(response.getHeaders("Set-Cookie"))
                .anySatisfy(cookie -> assertThat(cookie)
                        .contains(OpenAiDeCoachConnectionService.BINDING_COOKIE_NAME + "=")
                        .contains("Max-Age=0"));
        assertThat(registry.get(OpenAiDeOperationalTelemetry.EVENT_METRIC)
                        .tag("event", "replay_rejected")
                        .counter()
                        .count())
                .isEqualTo(1);
        assertThat(registry.getMeters())
                .allSatisfy(meter -> assertThat(meter.getId().getTags())
                        .extracting(tag -> tag.getKey())
                        .containsExactly("event"));
        verify(connectionService).consumeBindingGrant("spodb_consumed", "spobs_browser");
    }
}
