package com.skillpilot.backend.openai.de.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthMetadataController;
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
        properties.getRateLimit().setBootstrapRequests(2);
        properties.getRateLimit().setBootstrapCapabilityRequests(1);
        properties.getRateLimit().setBootstrapProcessGlobalRequests(3);
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
        MockHttpServletRequest firstRequest = request("/api/openai/v1/oauth2/token", "192.0.2.11");
        firstRequest.addHeader("X-Forwarded-For", "198.51.100.1");
        MockHttpServletResponse first = invoke(firstRequest);
        MockHttpServletRequest rejectedRequest = request("/api/openai/v1/oauth2/token", "192.0.2.11");
        rejectedRequest.addHeader("X-Forwarded-For", "203.0.113.9");
        MockHttpServletResponse rejected = invoke(rejectedRequest);
        MockHttpServletResponse otherClient = invoke("/api/openai/v1/oauth2/token", "192.0.2.12");
        MockHttpServletResponse sameClientOtherGroup =
                invoke(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH, "192.0.2.11");

        assertThat(first.getStatus()).isEqualTo(200);
        assertThat(rejected.getStatus()).isEqualTo(429);
        assertThat(otherClient.getStatus()).isEqualTo(200);
        assertThat(sameClientOtherGroup.getStatus()).isEqualTo(200);
    }

    @Test
    void rateLimitsLanguageNeutralV1LaunchPathAsUiTraffic() throws Exception {
        String path = "/api/ui/learners/learner-42/openai/v1/launch";

        assertThat(invoke(path, "192.0.2.13").getStatus()).isEqualTo(200);
        assertThat(invoke(path, "192.0.2.13").getStatus()).isEqualTo(429);
    }

    @Test
    void rateLimitsIssuerRelativeDiscoveryAsMetadataTraffic() throws Exception {
        String path = OpenAiDeOAuthMetadataController.OPENID_CONFIGURATION_PATH;

        assertThat(invoke(path, "192.0.2.14").getStatus()).isEqualTo(200);
        assertThat(invoke(path, "192.0.2.14").getStatus()).isEqualTo(429);
    }

    @Test
    void rateLimitsBootstrapByOpaqueCapabilityWithoutLeakingItAndUsesClosedErrorEnvelope()
            throws Exception {
        String capability = "spc_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        MockHttpServletRequest first = request(
                OpenAiDeV1ContractMetadata.BOOTSTRAP_LAUNCH_PATH,
                "192.0.2.20");
        first.addHeader("Authorization", "SkillPilotSetup " + capability);
        first.addHeader("Origin", OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
        MockHttpServletRequest repeated = request(
                OpenAiDeV1ContractMetadata.BOOTSTRAP_LAUNCH_PATH,
                "192.0.2.21");
        repeated.addHeader("Authorization", "SkillPilotSetup " + capability);
        repeated.addHeader("Origin", OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);

        assertThat(invoke(first).getStatus()).isEqualTo(200);
        MockHttpServletResponse rejected = invoke(repeated);

        assertThat(rejected.getStatus()).isEqualTo(429);
        assertThat(rejected.getHeader("Retry-After")).isEqualTo("60");
        assertThat(rejected.getHeader("Access-Control-Allow-Origin"))
                .isEqualTo(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
        assertThat(rejected.getHeader("Vary")).isEqualTo("Origin");
        assertThat(rejected.getHeader("Referrer-Policy")).isEqualTo("no-referrer");
        assertThat(rejected.getHeader("X-Content-Type-Options")).isEqualTo("nosniff");
        assertThat(rejected.getContentType()).startsWith("application/json");
        assertThat(rejected.getContentAsString())
                .isEqualTo("{\"schemaVersion\":1,\"status\":\"TEMPORARILY_UNAVAILABLE\","
                        + "\"fallbackUrl\":\"https://skillpilot.com/\"}")
                .doesNotContain(capability);
    }

    @Test
    void bootstrapPreflightDoesNotConsumeTheCapabilityOrAggregateBudget() throws Exception {
        MockHttpServletRequest preflight = new MockHttpServletRequest(
                "OPTIONS",
                OpenAiDeV1ContractMetadata.BOOTSTRAP_LAUNCH_PATH);
        preflight.setRemoteAddr("192.0.2.22");
        preflight.addHeader("Origin", OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);

        assertThat(invoke(preflight).getStatus()).isEqualTo(200);
        assertThat(invokeBootstrap(
                                "spc_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                "192.0.2.22")
                        .getStatus())
                .isEqualTo(200);
    }

    @Test
    void bootstrapRejectionDoesNotAuthorizeAnUntrustedOrigin() throws Exception {
        String capability = "spc_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
        assertThat(invokeBootstrap(capability, "192.0.2.23").getStatus()).isEqualTo(200);
        MockHttpServletRequest repeated = request(
                OpenAiDeV1ContractMetadata.BOOTSTRAP_LAUNCH_PATH,
                "192.0.2.24");
        repeated.addHeader("Authorization", "SkillPilotSetup " + capability);
        repeated.addHeader("Origin", "https://example.invalid");

        MockHttpServletResponse rejected = invoke(repeated);

        assertThat(rejected.getStatus()).isEqualTo(429);
        assertThat(rejected.getHeader("Access-Control-Allow-Origin")).isNull();
        assertThat(rejected.getHeader("Vary")).isNull();
    }

    @Test
    void invalidCapabilityHeadersShareOneBoundedBucket() throws Exception {
        MockHttpServletRequest first = request(
                OpenAiDeV1ContractMetadata.BOOTSTRAP_LAUNCH_PATH,
                "192.0.2.25");
        first.addHeader("Authorization", "SkillPilotSetup invalid-a");
        MockHttpServletRequest second = request(
                OpenAiDeV1ContractMetadata.BOOTSTRAP_LAUNCH_PATH,
                "192.0.2.26");
        second.addHeader("Authorization", "SkillPilotSetup invalid-b");

        assertThat(invoke(first).getStatus()).isEqualTo(200);
        assertThat(invoke(second).getStatus()).isEqualTo(429);
    }

    @Test
    void differentCapabilitiesCannotBypassTheClientAddressBudget() throws Exception {
        String remoteAddress = "192.0.2.27";
        assertThat(invokeBootstrap(
                                "spc_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                remoteAddress)
                        .getStatus())
                .isEqualTo(200);
        assertThat(invokeBootstrap(
                                "spc_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
                                remoteAddress)
                        .getStatus())
                .isEqualTo(200);
        assertThat(invokeBootstrap(
                                "spc_CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
                                remoteAddress)
                        .getStatus())
                .isEqualTo(429);
    }

    @Test
    void appliesAnAggregateBootstrapBudgetAcrossCapabilitiesAndClients() throws Exception {
        assertThat(invokeBootstrap(
                                "spc_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
                                "192.0.2.30")
                        .getStatus())
                .isEqualTo(200);
        assertThat(invokeBootstrap(
                                "spc_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB",
                                "192.0.2.31")
                        .getStatus())
                .isEqualTo(200);
        assertThat(invokeBootstrap(
                                "spc_CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
                                "192.0.2.32")
                        .getStatus())
                .isEqualTo(200);

        assertThat(invokeBootstrap(
                                "spc_DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD",
                                "192.0.2.33")
                        .getStatus())
                .isEqualTo(429);
    }

    private MockHttpServletResponse invokeBootstrap(String capability, String remoteAddress)
            throws Exception {
        MockHttpServletRequest request = request(
                OpenAiDeV1ContractMetadata.BOOTSTRAP_LAUNCH_PATH,
                remoteAddress);
        request.addHeader("Authorization", "SkillPilotSetup " + capability);
        return invoke(request);
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
