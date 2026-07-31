package com.skillpilot.backend.openai.de.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class OpenAiDeRateLimitFilterTest {

    private SimpleMeterRegistry registry;
    private OpenAiDeRateLimitFilter filter;

    @BeforeEach
    void setUp() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.getRateLimit().setMcpRequests(2);
        properties.getRateLimit().setOauthRequests(1);
        properties.getRateLimit().setUiRequests(1);
        properties.getRateLimit().setMetadataRequests(1);
        registry = new SimpleMeterRegistry();
        filter = new OpenAiDeRateLimitFilter(
                properties.getRateLimit(),
                new OpenAiDeOperationalTelemetry(registry),
                Clock.fixed(Instant.parse("2026-07-22T12:00:00Z"), ZoneOffset.UTC));
    }

    @Test
    void returns429AndRetryAfterWhenMcpBurstExceedsLimit() throws Exception {
        MockHttpServletResponse first =
                invoke(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH, "192.0.2.10");
        MockHttpServletResponse second =
                invoke(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH, "192.0.2.10");
        MockHttpServletResponse rejected =
                invoke(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH, "192.0.2.10");

        assertThat(first.getStatus()).isEqualTo(200);
        assertThat(second.getStatus()).isEqualTo(200);
        assertThat(rejected.getStatus()).isEqualTo(429);
        assertThat(rejected.getHeader("Retry-After")).isEqualTo("60");
        assertThat(rejected.getContentAsString())
                .contains("rate_limited")
                .doesNotContain("192.0.2.10");
        assertThat(registry.get(OpenAiDeOperationalTelemetry.EVENT_METRIC)
                .tag("event", "http_429")
                .counter()
                .count()).isEqualTo(1.0);
    }

    @Test
    void isolatesServletRemoteAddressAndEndpointGroupsWithoutParsingForwardedHeaders() throws Exception {
        MockHttpServletRequest firstRequest = request("/api/openai/de/oauth2/token", "192.0.2.11");
        firstRequest.addHeader("X-Forwarded-For", "198.51.100.1");
        MockHttpServletResponse first = invoke(firstRequest);
        MockHttpServletRequest rejectedRequest = request("/api/openai/de/oauth2/token", "192.0.2.11");
        rejectedRequest.addHeader("X-Forwarded-For", "203.0.113.9");
        MockHttpServletResponse rejected = invoke(rejectedRequest);
        MockHttpServletResponse otherClient = invoke("/api/openai/de/oauth2/token", "192.0.2.12");
        MockHttpServletResponse sameClientOtherGroup =
                invoke(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH, "192.0.2.11");

        assertThat(first.getStatus()).isEqualTo(200);
        assertThat(rejected.getStatus()).isEqualTo(429);
        assertThat(otherClient.getStatus()).isEqualTo(200);
        assertThat(sameClientOtherGroup.getStatus()).isEqualTo(200);
    }

    private MockHttpServletResponse invoke(String path, String remoteAddress) throws Exception {
        return invoke(request(path, remoteAddress));
    }

    private MockHttpServletResponse invoke(MockHttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    private static MockHttpServletRequest request(String path, String remoteAddress) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        request.setRemoteAddr(remoteAddress);
        return request;
    }
}
