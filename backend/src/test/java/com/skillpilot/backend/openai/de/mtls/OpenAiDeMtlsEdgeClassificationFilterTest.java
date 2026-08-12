package com.skillpilot.backend.openai.de.mtls;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.openai.de.OpenAiAppsChallengeController;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.OpenAiDeProperties.MtlsEdgeMode;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthConfiguration;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthMetadataController;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class OpenAiDeMtlsEdgeClassificationFilterTest {

    private SimpleMeterRegistry registry;

    @BeforeEach
    void setUp() {
        registry = new SimpleMeterRegistry();
    }

    @Test
    void observeAcceptsVerifiedOrExplicitNoCertificateOnly() throws Exception {
        OpenAiDeMtlsEdgeClassificationFilter filter = filter(MtlsEdgeMode.OBSERVE);

        assertThat(invoke(filter, request(
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                        "127.0.0.1",
                        "observe",
                        OpenAiDeMtlsEdgeClassificationFilter.VERIFIED,
                        OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN))
                .getStatus()).isEqualTo(200);
        assertThat(invoke(filter, request(
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                        "::1",
                        "observe",
                        OpenAiDeMtlsEdgeClassificationFilter.OBSERVE_NO_CERT,
                        null))
                .getStatus()).isEqualTo(200);
        assertThat(count("mtls_edge_observed_no_cert")).isEqualTo(1.0);
        assertThat(count("mtls_edge_verified")).isEqualTo(1.0);

        assertRejected(filter, request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "observe",
                OpenAiDeMtlsEdgeClassificationFilter.LOCAL_OPERATOR,
                null));
        assertRejected(filter, request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "observe",
                OpenAiDeMtlsEdgeClassificationFilter.OBSERVE_NO_CERT,
                OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN));
    }

    @Test
    void enforceAcceptsVerifiedOrLocalOperatorAndRejectsObserveFallback() throws Exception {
        OpenAiDeMtlsEdgeClassificationFilter filter = filter(MtlsEdgeMode.ENFORCE);

        assertThat(invoke(filter, request(
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                        "127.0.0.1",
                        "enforce",
                        OpenAiDeMtlsEdgeClassificationFilter.VERIFIED,
                        OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN))
                .getStatus()).isEqualTo(200);
        assertThat(count("mtls_edge_verified")).isEqualTo(1.0);
        assertThat(invoke(filter, request(
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH + "/",
                        "0:0:0:0:0:0:0:1",
                        "enforce",
                        OpenAiDeMtlsEdgeClassificationFilter.LOCAL_OPERATOR,
                        null))
                .getStatus()).isEqualTo(200);
        assertThat(count("mtls_edge_local_operator")).isEqualTo(1.0);

        assertRejected(filter, request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "enforce",
                OpenAiDeMtlsEdgeClassificationFilter.OBSERVE_NO_CERT,
                null));
    }

    @Test
    void rejectsMissingDuplicateDriftedOrMalformedEdgeAssertions() throws Exception {
        OpenAiDeMtlsEdgeClassificationFilter filter = filter(MtlsEdgeMode.OBSERVE);

        assertRejected(filter, request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                null,
                null,
                null));
        assertRejected(filter, request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "enforce",
                OpenAiDeMtlsEdgeClassificationFilter.VERIFIED,
                OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN));
        assertRejected(filter, request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "observe",
                "verified",
                OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN));
        assertRejected(filter, request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "observe",
                OpenAiDeMtlsEdgeClassificationFilter.VERIFIED,
                null));
        assertRejected(filter, request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "observe",
                OpenAiDeMtlsEdgeClassificationFilter.VERIFIED,
                "wrong.example"));

        MockHttpServletRequest duplicate = request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "observe",
                OpenAiDeMtlsEdgeClassificationFilter.OBSERVE_NO_CERT,
                null);
        duplicate.addHeader(
                OpenAiDeMtlsEdgeClassificationFilter.CLASSIFICATION_HEADER,
                OpenAiDeMtlsEdgeClassificationFilter.VERIFIED);
        assertRejected(filter, duplicate);
    }

    @Test
    void trustsOnlyTheRawLoopbackTransportPeerDespiteForwardingWrappers() throws Exception {
        OpenAiDeMtlsEdgeClassificationFilter filter = filter(MtlsEdgeMode.ENFORCE);
        MockHttpServletRequest external = request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "198.51.100.20",
                "enforce",
                OpenAiDeMtlsEdgeClassificationFilter.VERIFIED,
                OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN);
        external.addHeader("X-Forwarded-For", "127.0.0.1");

        assertRejected(filter, external);

        HttpServletRequest forwardingWrapper = new HttpServletRequestWrapper(external) {
            @Override
            public String getRemoteAddr() {
                return "127.0.0.1";
            }
        };
        assertRejected(filter, forwardingWrapper);
    }

    @Test
    void trustsOnlyTheRawDedicatedEdgeHost() throws Exception {
        OpenAiDeMtlsEdgeClassificationFilter filter = filter(MtlsEdgeMode.ENFORCE);
        MockHttpServletRequest mainOriginAlias = request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "enforce",
                OpenAiDeMtlsEdgeClassificationFilter.VERIFIED,
                OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN);
        mainOriginAlias.removeHeader("Host");
        mainOriginAlias.addHeader("Host", "skillpilot.com");
        assertRejected(filter, mainOriginAlias);

        HttpServletRequest spoofedWrapper = new HttpServletRequestWrapper(mainOriginAlias) {
            @Override
            public String getHeader(String name) {
                return HttpHeaders.HOST.equalsIgnoreCase(name)
                        ? OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_EDGE_HOST
                        : super.getHeader(name);
            }
        };
        assertRejected(filter, spoofedWrapper);

        MockHttpServletRequest duplicateHost = request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "enforce",
                OpenAiDeMtlsEdgeClassificationFilter.VERIFIED,
                OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN);
        duplicateHost.addHeader("Host", "skillpilot.com");
        assertRejected(filter, duplicateHost);
    }

    @Test
    void wrapperCannotHideTheRawInternalMcpPath() throws Exception {
        OpenAiDeMtlsEdgeClassificationFilter filter = filter(MtlsEdgeMode.ENFORCE);
        MockHttpServletRequest raw = request(
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                "127.0.0.1",
                "enforce",
                OpenAiDeMtlsEdgeClassificationFilter.VERIFIED,
                OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN);
        HttpServletRequest prefixedWrapper = new HttpServletRequestWrapper(raw) {
            @Override
            public String getRequestURI() {
                return "/untrusted-prefix" + super.getRequestURI();
            }
        };

        assertThat(invoke(filter, prefixedWrapper).getStatus()).isEqualTo(200);

        raw.removeHeader(OpenAiDeMtlsEdgeClassificationFilter.CLASSIFICATION_HEADER);
        assertRejected(filter, prefixedWrapper);
    }

    @Test
    void normalizedInternalVariantsCannotBypassTheGate() throws Exception {
        OpenAiDeMtlsEdgeClassificationFilter filter = filter(MtlsEdgeMode.ENFORCE);

        for (String path : new String[] {
                "/internal/openai/v1/mcp;x=1",
                "/internal/openai/v1/%6dcp",
                "/%69nternal/openai/v1/mcp",
                "/internal/openai/%76%31/mcp"
        }) {
            assertRejected(filter, request(path, "127.0.0.1", null, null, null));
        }
    }

    @Test
    void disabledModeAllowsHeaderlessMcpButRejectsAnyEdgeAssertion() throws Exception {
        OpenAiDeMtlsEdgeClassificationFilter disabled = filter(MtlsEdgeMode.DISABLED);
        assertThat(invoke(disabled, request(
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                        "198.51.100.21",
                        null,
                        null,
                        null))
                .getStatus()).isEqualTo(200);
        assertThat(invoke(disabled, request(
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                        "127.0.0.1",
                        null,
                        null,
                        null))
                .getStatus()).isEqualTo(200);

        for (String header : new String[] {
                OpenAiDeMtlsEdgeClassificationFilter.MODE_HEADER,
                OpenAiDeMtlsEdgeClassificationFilter.CLASSIFICATION_HEADER,
                OpenAiDeMtlsEdgeClassificationFilter.SAN_HEADER
        }) {
            MockHttpServletRequest request = request(
                    OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                    "127.0.0.1",
                    null,
                    null,
                    null);
            request.addHeader(header, "present");
            assertRejected(disabled, request);
        }
    }

    @Test
    void allNonMcpSurfacesRemainOutsideTheGate() throws Exception {

        OpenAiDeMtlsEdgeClassificationFilter enforce = filter(MtlsEdgeMode.ENFORCE);
        for (String path : new String[] {
                OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_METADATA_PATH,
                OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH,
                OpenAiAppsChallengeController.PATH,
                OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT,
                OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT,
                "/api/ui/learners/example/openai/v1/launch"
        }) {
            assertThat(invoke(enforce, request(path, "198.51.100.22", null, null, null))
                    .getStatus()).as(path).isEqualTo(200);
        }
    }

    private OpenAiDeMtlsEdgeClassificationFilter filter(MtlsEdgeMode mode) {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.setMtlsEdgeMode(mode);
        return new OpenAiDeMtlsEdgeClassificationFilter(
                properties,
                new OpenAiDeOperationalTelemetry(registry));
    }

    private void assertRejected(
            OpenAiDeMtlsEdgeClassificationFilter filter,
            HttpServletRequest request) throws Exception {
        MockHttpServletResponse response = invoke(filter, request);
        assertThat(response.getStatus()).isEqualTo(403);
        assertThat(response.getContentAsString())
                .isEqualTo("{\"error\":\"forbidden\"}")
                .doesNotContain(
                        "198.51.100",
                        OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN);
        assertThat(response.getHeader("Cache-Control")).isEqualTo("no-store");
        assertThat(response.getHeader("WWW-Authenticate")).isNull();
    }

    private MockHttpServletResponse invoke(
            OpenAiDeMtlsEdgeClassificationFilter filter,
            HttpServletRequest request) throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        filter.doFilter(request, response, new MockFilterChain());
        return response;
    }

    private static MockHttpServletRequest request(
            String path,
            String remoteAddress,
            String mode,
            String classification,
            String san) {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", path);
        request.setRemoteAddr(remoteAddress);
        request.addHeader("Host", OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_EDGE_HOST);
        Map.of(
                        OpenAiDeMtlsEdgeClassificationFilter.MODE_HEADER, mode == null ? "" : mode,
                        OpenAiDeMtlsEdgeClassificationFilter.CLASSIFICATION_HEADER,
                        classification == null ? "" : classification,
                        OpenAiDeMtlsEdgeClassificationFilter.SAN_HEADER, san == null ? "" : san)
                .forEach((name, value) -> {
                    if (!value.isEmpty()) {
                        request.addHeader(name, value);
                    }
                });
        return request;
    }

    private double count(String event) {
        return registry.get(OpenAiDeOperationalTelemetry.EVENT_METRIC)
                .tag("event", event)
                .counter()
                .count();
    }
}
