package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.openai.de.mtls.OpenAiDeMtlsEdgeClassificationFilter;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(
        classes = OpenAiDeOAuthDiscoveryBootstrapIntegrationTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "skillpilot.openai.coach.v1.enabled=false",
        "skillpilot.openai.coach.v1.bootstrap-enabled=true",
        "skillpilot.openai.coach.v1.oauth.enabled=false",
        "skillpilot.openai.coach.v1.mcp.enabled=false",
        "skillpilot.openai.coach.v1.mtls-edge-mode=observe",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.openai.coach.v1.mcp-url=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth-resource=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth.protected-resource-metadata=https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp"
})
@Import(OpenAiDeMtlsEdgeClassificationFilter.class)
class OpenAiDeMtlsEdgeIntegrationTest {

    @LocalServerPort
    private int port;

    @Test
    void edgeAssertionRunsBeforeOAuthAndCannotBeHiddenByForwarding() throws Exception {
        assertThat(request(
                        "POST",
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                        Map.of()).status())
                .isEqualTo(403);

        RawResponse noCertificate = request(
                "POST",
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                Map.of(
                        OpenAiDeMtlsEdgeClassificationFilter.MODE_HEADER, "observe",
                        OpenAiDeMtlsEdgeClassificationFilter.CLASSIFICATION_HEADER,
                        "OBSERVE_NO_CERT"));
        assertThat(noCertificate.status()).isEqualTo(401);
        assertThat(noCertificate.headers().get("www-authenticate"))
                .contains("resource_metadata=\"")
                .contains(OpenAiDeV1ContractMetadata.PROTECTED_RESOURCE_METADATA_ENDPOINT);

        RawResponse verified = request(
                "POST",
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                Map.of(
                        OpenAiDeMtlsEdgeClassificationFilter.MODE_HEADER, "observe",
                        OpenAiDeMtlsEdgeClassificationFilter.CLASSIFICATION_HEADER, "VERIFIED",
                        OpenAiDeMtlsEdgeClassificationFilter.SAN_HEADER,
                        OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_OPENAI_SAN));
        assertThat(verified.status()).isEqualTo(401);

        assertThat(request(
                        "POST",
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                        Map.of("X-Forwarded-Prefix", "/untrusted-prefix")).status())
                .isEqualTo(403);
    }

    @Test
    void internalSupportPathsStayPublicButNormalizedMcpVariantsStayFailClosed()
            throws Exception {
        assertThat(request(
                        "GET",
                        OpenAiDeV1ContractMetadata.INTERNAL_PROTECTED_RESOURCE_METADATA_PATH,
                        Map.of()).status())
                .isEqualTo(200);

        for (String path : new String[] {
                "/internal/openai/v1/mcp;x=1",
                "/internal/openai/v1/%6dcp",
                "/%69nternal/openai/v1/mcp"
        }) {
            assertThat(request("POST", path, Map.of()).status())
                    .as(path)
                    .isIn(400, 403, 404);
        }
    }

    private RawResponse request(String method, String path, Map<String, String> headers)
            throws Exception {
        try (Socket socket = new Socket("127.0.0.1", port);
                OutputStreamWriter writer = new OutputStreamWriter(
                        socket.getOutputStream(), StandardCharsets.US_ASCII);
                BufferedReader reader = new BufferedReader(new InputStreamReader(
                        socket.getInputStream(), StandardCharsets.UTF_8))) {
            writer.write(method + " " + path + " HTTP/1.1\r\n");
            writer.write("Host: " + OpenAiDeMtlsEdgeClassificationFilter.EXPECTED_EDGE_HOST + "\r\n");
            writer.write("Connection: close\r\n");
            if (!"GET".equals(method)) {
                writer.write("Content-Type: application/json\r\n");
                writer.write("Content-Length: 2\r\n");
            }
            for (Map.Entry<String, String> header : headers.entrySet()) {
                writer.write(header.getKey() + ": " + header.getValue() + "\r\n");
            }
            writer.write("\r\n");
            if (!"GET".equals(method)) {
                writer.write("{}");
            }
            writer.flush();

            String statusLine = reader.readLine();
            assertThat(statusLine).isNotNull();
            int status = Integer.parseInt(statusLine.split(" ", 3)[1]);
            Map<String, String> responseHeaders = new LinkedHashMap<>();
            String line;
            while ((line = reader.readLine()) != null && !line.isEmpty()) {
                int separator = line.indexOf(':');
                if (separator > 0) {
                    responseHeaders.put(
                            line.substring(0, separator).toLowerCase(),
                            line.substring(separator + 1).trim());
                }
            }
            return new RawResponse(status, responseHeaders);
        }
    }

    private record RawResponse(int status, Map<String, String> headers) {
    }
}
