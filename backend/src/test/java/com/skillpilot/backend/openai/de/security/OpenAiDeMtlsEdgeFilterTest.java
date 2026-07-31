package com.skillpilot.backend.openai.de.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class OpenAiDeMtlsEdgeFilterTest {

    private final OpenAiDeMtlsEdgeFilter filter =
            new OpenAiDeMtlsEdgeFilter("127.0.0.1,::1");

    @Test
    void acceptsOnlyVerifiedOpenAiCertificateFromTrustedProxy() throws Exception {
        MockHttpServletRequest request = request("/internal/openai/de/v1/mcp", "127.0.0.1");
        request.addHeader(
                OpenAiDeMtlsEdgeFilter.VERIFIED_HEADER,
                OpenAiDeMtlsEdgeFilter.VERIFIED_VALUE);
        request.addHeader(
                OpenAiDeMtlsEdgeFilter.SAN_HEADER,
                OpenAiDeMtlsEdgeFilter.EXPECTED_SAN);
        MockFilterChain chain = new MockFilterChain();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain);

        assertThat(chain.getRequest()).isSameAs(request);
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void rejectsForgedHeadersFromUntrustedPeer() throws Exception {
        MockHttpServletRequest request = request("/internal/openai/de/v1/mcp", "192.0.2.10");
        request.addHeader(
                OpenAiDeMtlsEdgeFilter.VERIFIED_HEADER,
                OpenAiDeMtlsEdgeFilter.VERIFIED_VALUE);
        request.addHeader(
                OpenAiDeMtlsEdgeFilter.SAN_HEADER,
                OpenAiDeMtlsEdgeFilter.EXPECTED_SAN);

        MockHttpServletResponse response = invoke(request);

        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString()).contains("mcp_client_not_authorized");
    }

    @Test
    void rejectsMissingOrIncorrectVerificationData() throws Exception {
        assertThat(invoke(request("/internal/openai/de/v1/mcp", "127.0.0.1")).getStatus())
                .isEqualTo(403);

        MockHttpServletRequest wrongSan =
                request("/internal/openai/de/v1/mcp/messages", "127.0.0.1");
        wrongSan.addHeader(
                OpenAiDeMtlsEdgeFilter.VERIFIED_HEADER,
                OpenAiDeMtlsEdgeFilter.VERIFIED_VALUE);
        wrongSan.addHeader(OpenAiDeMtlsEdgeFilter.SAN_HEADER, "example.com");
        assertThat(invoke(wrongSan).getStatus()).isEqualTo(403);
    }

    @Test
    void leavesOAuthAndDiscoveryOutsideTheMtlsGate() throws Exception {
        for (String path : new String[] {
            "/api/openai/de/oauth2/authorize",
            "/.well-known/oauth-protected-resource",
            "/api/openai/de/.well-known/oauth-authorization-server"
        }) {
            MockHttpServletRequest request = request(path, "192.0.2.10");
            MockFilterChain chain = new MockFilterChain();
            MockHttpServletResponse response = new MockHttpServletResponse();
            filter.doFilter(request, response, chain);
            assertThat(chain.getRequest()).as(path).isSameAs(request);
        }
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
