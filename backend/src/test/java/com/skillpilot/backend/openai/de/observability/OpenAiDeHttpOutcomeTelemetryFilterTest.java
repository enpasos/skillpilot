package com.skillpilot.backend.openai.de.observability;

import static org.assertj.core.api.Assertions.assertThat;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class OpenAiDeHttpOutcomeTelemetryFilterTest {

    @Test
    void countsRefreshAndBoundedHttpFailuresWithoutRequestValuesAsTags() throws Exception {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeOperationalTelemetry telemetry = new OpenAiDeOperationalTelemetry(registry);
        OpenAiDeHttpOutcomeTelemetryFilter filter = new OpenAiDeHttpOutcomeTelemetryFilter(telemetry);
        MockHttpServletRequest request = new MockHttpServletRequest(
                "POST", "/api/openai/v1/oauth2/token");
        request.addParameter("grant_type", "refresh_token");
        request.addParameter("refresh_token", "SECRET-REFRESH-MARKER");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (ignoredRequest, downstreamResponse) ->
                ((MockHttpServletResponse) downstreamResponse).setStatus(401);

        filter.doFilter(request, response, chain);

        assertThat(count(registry, "refresh_failure")).isEqualTo(1.0);
        assertThat(count(registry, "oauth_failure")).isEqualTo(1.0);
        assertThat(count(registry, "http_401")).isEqualTo(1.0);
        assertThat(registry.getMeters().toString()).doesNotContain("SECRET-REFRESH-MARKER");
    }

    @Test
    void observesLanguageNeutralV1LaunchPath() {
        OpenAiDeHttpOutcomeTelemetryFilter filter = new OpenAiDeHttpOutcomeTelemetryFilter(
                new OpenAiDeOperationalTelemetry(new SimpleMeterRegistry()));

        assertThat(filter.shouldNotFilter(new MockHttpServletRequest(
                "POST",
                "/api/ui/learners/learner-42/openai/v1/launch"))).isFalse();
    }

    @Test
    void forwardingWrapperCannotHideTheRawOpenAiPath() {
        OpenAiDeHttpOutcomeTelemetryFilter filter = new OpenAiDeHttpOutcomeTelemetryFilter(
                new OpenAiDeOperationalTelemetry(new SimpleMeterRegistry()));
        MockHttpServletRequest raw = new MockHttpServletRequest(
                "POST",
                "/api/openai/v1/oauth2/token");
        HttpServletRequest wrapped = new HttpServletRequestWrapper(raw) {
            @Override
            public String getRequestURI() {
                return "/untrusted-prefix" + super.getRequestURI();
            }
        };

        assertThat(filter.shouldNotFilter(wrapped)).isFalse();
    }

    private static double count(SimpleMeterRegistry registry, String event) {
        return registry.get(OpenAiDeOperationalTelemetry.EVENT_METRIC)
                .tag("event", event)
                .counter()
                .count();
    }
}
