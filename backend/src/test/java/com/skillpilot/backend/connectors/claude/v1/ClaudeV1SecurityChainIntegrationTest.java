package com.skillpilot.backend.connectors.claude.v1;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        ClaudeV1TestProperties.WEB_DATASOURCE
})
class ClaudeV1SecurityChainIntegrationTest {

    private static final String CLAUDE_HOST = "mcp-claude-v1.skillpilot.com";

    @LocalServerPort private int port;
    @Autowired private LearnerRepository learners;
    @Autowired private ClaudeV1LearningSessionRepository sessions;

    private final HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    @Test
    void unauthenticatedMcpCallIsChallengedWithResourceMetadata() throws Exception {
        HttpResponse<String> response = send(request(ClaudeV1Contract.INTERNAL_MCP_PATH)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}"))
                .build());
        assertEquals(401, response.statusCode());
        assertTrue(response.headers().firstValue("Cache-Control").orElse("").contains("no-store"));
        String challenge = response.headers().firstValue("WWW-Authenticate").orElse("");
        assertTrue(challenge.contains("resource_metadata="));
        assertFalse(challenge.contains("error="));
    }

    @Test
    void invalidBearerAndUntrustedOriginFailClosed() throws Exception {
        HttpResponse<String> invalidToken = send(request(ClaudeV1Contract.INTERNAL_MCP_PATH)
                .header("Authorization", "Bearer invalid")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{}"))
                .build());
        assertEquals(401, invalidToken.statusCode());
        assertTrue(invalidToken.headers().firstValue("Cache-Control").orElse("").contains("no-store"));
        assertTrue(invalidToken.headers().firstValue("WWW-Authenticate").orElse("")
                .contains("invalid_token"));

        HttpResponse<String> foreignOrigin = send(request(ClaudeV1Contract.INTERNAL_MCP_PATH)
                .header("Origin", "https://attacker.example")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{}"))
                .build());
        assertEquals(403, foreignOrigin.statusCode());
        assertTrue(foreignOrigin.headers().firstValue("Cache-Control").orElse("").contains("no-store"));
    }

    @Test
    void discoveryAndPrivacyRemainPublicButLegacyBindingRoutesAreGone() throws Exception {
        assertEquals(200, sendGet(ClaudeV1Contract.INTERNAL_PROTECTED_RESOURCE_METADATA_PATH).statusCode());
        assertEquals(200, sendGet(ClaudeV1Contract.INTERNAL_AUTH_SERVER_METADATA_PATH).statusCode());
        assertEquals(200, sendGet(ClaudeV1Contract.INTERNAL_PRIVACY_PATH).statusCode());
        String retiredConnectPath = ClaudeV1Contract.INTERNAL_BASE_PATH + "/connect";
        assertEquals(404, sendGet(retiredConnectPath).statusCode());
        assertEquals(404, sendGet(retiredConnectPath + "/details").statusCode());
        assertEquals(404, sendGet(retiredConnectPath + "/bind").statusCode());
    }

    @Test
    void firstPartyLaunchReturnsNoStoreAndNeverPlacesTokenInClaudeUrl() throws Exception {
        String learnerId = ClaudeV1TestFixtures.createBoundLearner(learners, sessions, 2L).learnerId();
        HttpRequest launch = HttpRequest.newBuilder(uri(
                        "/api/ui/learners/" + learnerId + "/claude/v1/launch"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "{\"communicationLocale\":\"de\",\"client\":\"web-start\"}"))
                .build();
        HttpResponse<String> response = send(launch);
        assertEquals(200, response.statusCode());
        assertTrue(response.headers().firstValue("Cache-Control").orElse("").contains("no-store"));
        assertTrue(response.body().contains("\"learningSessionId\":\"spc_"));
        assertTrue(response.body().contains("\"webUrl\":\"https://claude.ai/new\""));
        assertFalse(response.body().contains("https://claude.ai/new?"));
    }

    private HttpResponse<String> sendGet(String path) throws Exception {
        return send(request(path).GET().build());
    }

    private HttpResponse<String> send(HttpRequest request) throws Exception {
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpRequest.Builder request(String path) {
        return HttpRequest.newBuilder(uri(path))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https");
    }

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + port + path);
    }
}
