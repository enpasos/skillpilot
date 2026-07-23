package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeBindingGrant;
import com.skillpilot.backend.domain.OpenAiDeConnection;
import com.skillpilot.backend.domain.OpenAiDePendingLaunch;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthConfiguration;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeBindingGrantRepository;
import com.skillpilot.backend.repository.OpenAiDeConnectionRepository;
import com.skillpilot.backend.repository.OpenAiDePendingLaunchRepository;
import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

/**
 * Vertical release gate for the German OpenAI coach.
 *
 * <p>The test starts the real application with H2 and drives the public browser-binding, OAuth and
 * MCP HTTP boundaries. Identity mapping, learner workflow services and repositories are deliberately
 * not mocked.</p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:openai-de-coach-e2e;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.liquibase.enabled=true",
        "spring.security.oauth2.client.registration.github.client-id=e2e-test-client",
        "spring.security.oauth2.client.registration.github.client-secret=e2e-test-secret",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.security.signing-secret=openai-de-e2e-signing-secret",
        "skillpilot.claude.enabled=false",
        "skillpilot.openai.de.enabled=true",
        "skillpilot.openai.de.writes-enabled=true",
        "skillpilot.openai.de.oauth.enabled=true",
        "skillpilot.openai.de.mcp.enabled=true",
        "skillpilot.openai.de.secure-cookie=false",
        "skillpilot.openai.de.mcp-url=https://skillpilot.test/api/openai/de/mcp",
        "skillpilot.openai.de.oauth.client-id=chatgpt-e2e-client",
        "skillpilot.openai.de.oauth.redirect-uris=https://chatgpt.com/connector/oauth/e2e-callback",
        "skillpilot.openai.de.oauth.protected-resource-metadata=https://skillpilot.test/api/openai/de/oauth/protected-resource"
})
class OpenAiDeCoachEndToEndIntegrationTest {

    private static final String PERMANENT_SKILLPILOT_ID = "SP-E2E-PERMANENT-ID-MUST-NOT-LEAK";
    private static final String CURRICULUM_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CLIENT_ID = "chatgpt-e2e-client";
    private static final String CALLBACK = "https://chatgpt.com/connector/oauth/e2e-callback";
    private static final String VERIFIER = "openai-de-e2e-pkce-verifier-with-more-than-forty-three-characters";

    @LocalServerPort
    private int port;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private OpenAiDeBindingGrantRepository bindingGrantRepository;

    @Autowired
    private OpenAiDeConnectionRepository connectionRepository;

    @Autowired
    private OpenAiDePendingLaunchRepository pendingLaunchRepository;

    @Autowired
    @Qualifier("openAiDeAuthorizationService")
    private OAuth2AuthorizationService authorizationService;

    @Autowired
    private JdbcOperations jdbcOperations;

    private HttpClient browser;

    @BeforeEach
    void setUp() {
        jdbcOperations.update("DELETE FROM oauth2_authorization_consent");
        jdbcOperations.update("DELETE FROM oauth2_authorization");
        pendingLaunchRepository.deleteAllInBatch();
        bindingGrantRepository.deleteAllInBatch();
        connectionRepository.deleteAllInBatch();
        Learner learner = learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseGet(() -> {
            Learner created = new Learner();
            created.setSkillpilotId(PERMANENT_SKILLPILOT_ID);
            return created;
        });
        learner.setSelectedCurriculum(null);
        learner.setPersonalCurriculum(null);
        learner.setActiveGoalId(null);
        learnerRepository.saveAndFlush(learner);

        CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        browser = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Test
    void providerEligibilityIsRequiredAtThePublicStartBoundaryBeforePersistence() throws Exception {
        String path = "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID)
                + "/openai/de/connect-start";

        HttpResponse<String> missing = postJson(path, "{\"language\":\"de\"}", Map.of());
        HttpResponse<String> rejected = postJson(
                path,
                "{\"language\":\"de\",\"providerEligibilityConfirmed\":false}",
                Map.of());
        HttpResponse<String> nullRequest = postJson(path, "", Map.of());

        assertThat(missing.statusCode()).withFailMessage(missing.body()).isEqualTo(403);
        assertThat(rejected.statusCode()).withFailMessage(rejected.body()).isEqualTo(403);
        assertThat(nullRequest.statusCode()).withFailMessage(nullRequest.body()).isEqualTo(403);
        assertThat(bindingGrantRepository.count()).isZero();
        assertThat(connectionRepository.count()).isZero();
        assertThat(pendingLaunchRepository.count()).isZero();

        HttpResponse<String> accepted = postJson(
                path,
                "{\"language\":\"de\",\"providerEligibilityConfirmed\":true}",
                Map.of());

        assertThat(accepted.statusCode()).withFailMessage(accepted.body()).isEqualTo(200);
        assertThat(bindingGrantRepository.count()).isEqualTo(1);
        assertThat(connectionRepository.count()).isZero();
        assertThat(pendingLaunchRepository.count()).isZero();
    }

    @Test
    void twoTabsInOneBrowserSessionCannotOpenTwoBindingGrants() throws Exception {
        String path = "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID)
                + "/openai/de/connect-start";
        HttpResponse<String> status = get(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/de/status");
        String browserSession = responseCookie(status, "skillpilot_openai_de_browser");
        HttpClient tabTransport = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        List<HttpResponse<String>> responses;
        try {
            var first = executor.submit(() -> postJson(
                    tabTransport,
                    path,
                    "{\"language\":\"de\",\"providerEligibilityConfirmed\":true}",
                    browserSession,
                    ready,
                    start));
            var second = executor.submit(() -> postJson(
                    tabTransport,
                    path,
                    "{\"language\":\"de\",\"providerEligibilityConfirmed\":true}",
                    browserSession,
                    ready,
                    start));
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            start.countDown();
            responses = List.of(
                    first.get(20, TimeUnit.SECONDS),
                    second.get(20, TimeUnit.SECONDS));
        } finally {
            executor.shutdownNow();
        }

        assertThat(responses).extracting(HttpResponse::statusCode).containsExactlyInAnyOrder(200, 409);
        assertThat(bindingGrantRepository.findAll()).singleElement().satisfies(grant -> {
            assertThat(grant.getConsumedAt()).isNull();
            assertThat(grant.getActiveBrowserSessionHash()).isNotBlank();
        });
        assertThat(connectionRepository.count()).isZero();
    }

    @Test
    void bindingGrantFromOneBrowserSessionIsRejectedInAnotherWithoutConsumption() throws Exception {
        HttpResponse<String> connectStart = postJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/de/connect-start",
                "{\"language\":\"de\",\"providerEligibilityConfirmed\":true}",
                Map.of());
        assertThat(connectStart.statusCode()).withFailMessage(connectStart.body()).isEqualTo(200);
        String bindingGrant = responseCookie(connectStart, "skillpilot_openai_de_binding");

        HttpClient otherBrowser = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
        HttpRequest request = HttpRequest.newBuilder(localUri(authorizePath("wrong-browser-state")))
                .header(
                        HttpHeaders.COOKIE,
                        "skillpilot_openai_de_binding=" + bindingGrant
                                + "; skillpilot_openai_de_browser=spobs_other-browser-session")
                .GET()
                .build();
        HttpResponse<String> authorize = otherBrowser.send(request, HttpResponse.BodyHandlers.ofString());

        assertThat(authorize.statusCode()).isEqualTo(302);
        assertThat(authorize.headers().firstValue(HttpHeaders.LOCATION))
                .hasValueSatisfying(location -> assertThat(location).contains("/connect-required?reason=expired"));
        assertThat(bindingGrantRepository.findAll()).singleElement().satisfies(grant -> {
            assertThat(grant.getConsumedAt()).isNull();
            assertThat(grant.getConnectionSubject()).isNull();
            assertThat(grant.getActiveBrowserSessionHash()).isNotBlank();
        });
        assertThat(connectionRepository.count()).isZero();
    }

    @Test
    void browserBindingOAuthAndMcpPersistLearnerStateWithoutExposingPermanentId() throws Exception {
        HttpResponse<String> connectStart = postJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/de/connect-start",
                """
                {"language":"de","client":"openai-de-e2e","providerEligibilityConfirmed":true}
                """,
                Map.of());
        assertThat(connectStart.statusCode()).withFailMessage(connectStart.body()).isEqualTo(200);
        assertThat(connectStart.headers().allValues(HttpHeaders.SET_COOKIE))
                .anySatisfy(cookie -> assertThat(cookie).contains("skillpilot_openai_de_binding="));
        assertThat(connectStart.body()).doesNotContain(PERMANENT_SKILLPILOT_ID);
        assertThat(bindingGrantRepository.count()).isEqualTo(1);

        String externalState = "chatgpt-e2e-state";
        String authorizePath = OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT + "?" + form(List.of(
                Map.entry("response_type", "code"),
                Map.entry("client_id", CLIENT_ID),
                Map.entry("redirect_uri", CALLBACK),
                Map.entry("scope", String.join(" ", List.of(
                        OpenAiDeOAuthConfiguration.READ_SCOPE,
                        OpenAiDeOAuthConfiguration.WRITE_SCOPE,
                        OpenAiDeOAuthConfiguration.OFFLINE_SCOPE))),
                Map.entry("state", externalState),
                Map.entry("code_challenge", challenge(VERIFIER)),
                Map.entry("code_challenge_method", "S256"),
                Map.entry("resource", "https://skillpilot.test/api/openai/de/mcp")));

        HttpResponse<String> authorize = get(authorizePath);
        assertThat(authorize.statusCode()).isEqualTo(302);
        URI consentUri = URI.create(authorize.headers().firstValue(HttpHeaders.LOCATION).orElseThrow());
        String consentState = parseQuery(consentUri.getRawQuery()).get("state");
        assertThat(consentState).isNotBlank();

        OpenAiDeBindingGrant consumedGrant = bindingGrantRepository.findAll().getFirst();
        assertThat(consumedGrant.getConsumedAt()).isNotNull();
        assertThat(consumedGrant.getConnectionSubject()).isNotBlank().isNotEqualTo(PERMANENT_SKILLPILOT_ID);
        OpenAiDeConnection createdConnection = connectionRepository
                .findById(consumedGrant.getConnectionSubject())
                .orElseThrow();
        assertThat(createdConnection.getLastAuthorizedAt()).isNull();
        assertThat(connectionRepository.findLearnerSkillpilotIdBySubject(createdConnection.getSubject()))
                .contains(PERMANENT_SKILLPILOT_ID);

        HttpResponse<String> consent = get(consentUri.toString());
        assertThat(consent.statusCode()).isEqualTo(200);
        assertThat(consent.body())
                .contains("ChatGPT mit SkillPilot verbinden")
                .doesNotContain(PERMANENT_SKILLPILOT_ID, createdConnection.getSubject());

        HttpResponse<String> approval = postForm(
                OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT,
                List.of(
                        Map.entry("client_id", CLIENT_ID),
                        Map.entry("state", consentState),
                        Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE),
                        Map.entry("scope", OpenAiDeOAuthConfiguration.WRITE_SCOPE),
                        Map.entry("scope", OpenAiDeOAuthConfiguration.OFFLINE_SCOPE)));
        assertThat(approval.statusCode()).withFailMessage(approval.body()).isEqualTo(302);
        URI callback = URI.create(approval.headers().firstValue(HttpHeaders.LOCATION).orElseThrow());
        Map<String, String> callbackQuery = parseQuery(callback.getRawQuery());
        assertThat(callbackQuery.get("state")).isEqualTo(externalState);

        HttpResponse<String> token = postForm(
                OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT,
                List.of(
                        Map.entry("grant_type", "authorization_code"),
                        Map.entry("client_id", CLIENT_ID),
                        Map.entry("redirect_uri", CALLBACK),
                        Map.entry("code", callbackQuery.get("code")),
                        Map.entry("code_verifier", VERIFIER),
                        Map.entry("resource", "https://skillpilot.test/api/openai/de/mcp")));
        assertThat(token.statusCode()).withFailMessage(token.body()).isEqualTo(200);
        assertThat(token.body()).doesNotContain(PERMANENT_SKILLPILOT_ID, createdConnection.getSubject());
        String accessToken = objectMapper.readTree(token.body()).path("access_token").asText();
        String refreshToken = objectMapper.readTree(token.body()).path("refresh_token").asText();
        assertThat(accessToken).isNotBlank();
        assertThat(refreshToken).isNotBlank();

        OpenAiDeConnection authorizedConnection = connectionRepository
                .findById(createdConnection.getSubject())
                .orElseThrow();
        assertThat(authorizedConnection.getLastAuthorizedAt()).isNotNull();
        assertThat(authorizedConnection.getOauthExpiresAt()).isAfter(java.time.Instant.now());
        OAuth2Authorization authorization = authorizationService.findByToken(
                accessToken,
                OAuth2TokenType.ACCESS_TOKEN);
        assertThat(authorization).isNotNull();
        assertThat(authorization.getPrincipalName())
                .isEqualTo(createdConnection.getSubject())
                .isNotEqualTo(PERMANENT_SKILLPILOT_ID);

        HttpResponse<String> tools = postMcp(accessToken, """
                {"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
                """);
        assertMcpPayloadDoesNotExposeIdentity(tools, createdConnection.getSubject());
        assertThat(toolNames(tools))
                .contains(OpenAiDeCoachMcpContract.GET_CONTEXT, OpenAiDeCoachMcpContract.SET_CURRICULUM);

        HttpResponse<String> initialRead = callTool(accessToken, 2, OpenAiDeCoachMcpContract.GET_CONTEXT, "{}");
        assertMcpPayloadDoesNotExposeIdentity(initialRead, createdConnection.getSubject());
        JsonNode initialContext = result(initialRead).path("structuredContent");
        assertThat(initialContext.path("requiredAction").asText()).isEqualTo("setCurriculum");
        assertThat(initialContext.path("curriculum").isMissingNode()).isTrue();

        HttpResponse<String> write = callTool(
                accessToken,
                3,
                OpenAiDeCoachMcpContract.SET_CURRICULUM,
                "{\"curriculumId\":\"" + CURRICULUM_ID + "\"}");
        assertMcpPayloadDoesNotExposeIdentity(write, createdConnection.getSubject());
        JsonNode writtenContext = result(write).path("structuredContent");
        assertThat(writtenContext.path("curriculum").path("curriculumId").asText())
                .isEqualTo(CURRICULUM_ID);

        Learner persistedAfterWrite = learnerRepository.findById(PERMANENT_SKILLPILOT_ID).orElseThrow();
        assertThat(persistedAfterWrite.getSelectedCurriculum()).isEqualTo(CURRICULUM_ID);

        HttpResponse<String> persistedRead = callTool(
                accessToken,
                4,
                OpenAiDeCoachMcpContract.GET_CONTEXT,
                "{}");
        assertMcpPayloadDoesNotExposeIdentity(persistedRead, createdConnection.getSubject());
        assertThat(result(persistedRead)
                        .path("structuredContent")
                        .path("curriculum")
                        .path("curriculumId")
                        .asText())
                .isEqualTo(CURRICULUM_ID);

        OpenAiDeConnection usedConnection = connectionRepository
                .findById(createdConnection.getSubject())
                .orElseThrow();
        assertThat(usedConnection.getLastUsedAt()).isNotNull();
        List<OpenAiDePendingLaunch> launches = pendingLaunchRepository.findAll();
        assertThat(launches).singleElement().satisfies(launch -> {
            assertThat(launch.getConnectionSubject()).isEqualTo(createdConnection.getSubject());
            assertThat(launch.getConsumedAt()).isNotNull();
        });

        HttpResponse<String> connectedStatus = get(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/de/status");
        assertThat(connectedStatus.statusCode()).isEqualTo(200);
        assertThat(objectMapper.readTree(connectedStatus.body()).path("connected").asBoolean()).isTrue();

        HttpResponse<String> revocation = postForm(
                OpenAiDeOAuthConfiguration.REVOCATION_ENDPOINT,
                List.of(
                        Map.entry("client_id", CLIENT_ID),
                        Map.entry("token", refreshToken),
                        Map.entry("token_type_hint", "refresh_token")));
        assertThat(revocation.statusCode()).withFailMessage(revocation.body()).isEqualTo(200);
        assertThat(connectionRepository.findById(createdConnection.getSubject()))
                .get()
                .extracting(OpenAiDeConnection::getRevokedAt)
                .isNotNull();
        assertThat(authorizationService.findByToken(accessToken, OAuth2TokenType.ACCESS_TOKEN)).isNull();
        assertThat(pendingLaunchRepository.count()).isZero();

        HttpResponse<String> disconnectedStatus = get(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/de/status");
        assertThat(disconnectedStatus.statusCode()).isEqualTo(200);
        assertThat(objectMapper.readTree(disconnectedStatus.body()).path("connected").asBoolean()).isFalse();

        HttpResponse<String> reconnect = postJson(
                "/api/ui/learners/" + encode(PERMANENT_SKILLPILOT_ID) + "/openai/de/connect-start",
                "{\"language\":\"de\",\"client\":\"openai-de-reconnect\","
                        + "\"providerEligibilityConfirmed\":true}",
                Map.of());
        assertThat(reconnect.statusCode()).withFailMessage(reconnect.body()).isEqualTo(200);
        assertThat(bindingGrantRepository.findAll())
                .filteredOn(grant -> grant.getConsumedAt() == null)
                .singleElement();
    }

    private HttpResponse<String> get(String path) throws Exception {
        return browser.send(
                HttpRequest.newBuilder(localUri(path)).GET().build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postJson(String path, String body, Map<String, String> headers) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(localUri(path))
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body));
        headers.forEach(request::header);
        return browser.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postJson(
            HttpClient client,
            String path,
            String body,
            String browserSession,
            CountDownLatch ready,
            CountDownLatch start) throws Exception {
        ready.countDown();
        if (!start.await(10, TimeUnit.SECONDS)) {
            throw new IllegalStateException("Parallel browser tabs did not start in time.");
        }
        HttpRequest request = HttpRequest.newBuilder(localUri(path))
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .header(
                        HttpHeaders.COOKIE,
                        "skillpilot_openai_de_browser=" + browserSession)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postForm(String path, List<Map.Entry<String, String>> parameters)
            throws Exception {
        HttpRequest request = HttpRequest.newBuilder(localUri(path))
                .header(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form(parameters)))
                .build();
        return browser.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postMcp(String accessToken, String body) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(localUri("/api/openai/de/mcp"))
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .header(HttpHeaders.ACCEPT, "application/json, text/event-stream")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .header("MCP-Protocol-Version", "2025-11-25")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        return browser.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> callTool(String accessToken, int id, String toolName, String arguments)
            throws Exception {
        return postMcp(accessToken, """
                {"jsonrpc":"2.0","id":%d,"method":"tools/call","params":{"name":"%s","arguments":%s}}
                """.formatted(id, toolName, arguments));
    }

    private String authorizePath(String state) throws Exception {
        return OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT + "?" + form(List.of(
                Map.entry("response_type", "code"),
                Map.entry("client_id", CLIENT_ID),
                Map.entry("redirect_uri", CALLBACK),
                Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE),
                Map.entry("state", state),
                Map.entry("code_challenge", challenge(VERIFIER)),
                Map.entry("code_challenge_method", "S256"),
                Map.entry("resource", "https://skillpilot.test/api/openai/de/mcp")));
    }

    private String responseCookie(HttpResponse<String> response, String name) {
        String prefix = name + "=";
        return response.headers().allValues(HttpHeaders.SET_COOKIE).stream()
                .filter(header -> header.startsWith(prefix))
                .map(header -> header.substring(prefix.length(), header.indexOf(';')))
                .findFirst()
                .orElseThrow();
    }

    private void assertMcpPayloadDoesNotExposeIdentity(
            HttpResponse<String> response,
            String connectionSubject) {
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(200);
        assertThat(response.body()).doesNotContain(PERMANENT_SKILLPILOT_ID, connectionSubject);
    }

    private JsonNode result(HttpResponse<String> response) throws Exception {
        JsonNode root = objectMapper.readTree(response.body());
        assertThat(root.path("error").isMissingNode()).withFailMessage(response.body()).isTrue();
        assertThat(root.path("result").path("isError").asBoolean()).withFailMessage(response.body()).isFalse();
        return root.path("result");
    }

    private List<String> toolNames(HttpResponse<String> response) throws Exception {
        return objectMapper.readTree(response.body())
                .path("result")
                .path("tools")
                .valueStream()
                .map(tool -> tool.path("name").asText())
                .toList();
    }

    private URI localUri(String path) {
        if (path.startsWith("http://") || path.startsWith("https://")) {
            URI external = URI.create(path);
            String local = external.getRawPath()
                    + (external.getRawQuery() == null ? "" : "?" + external.getRawQuery());
            return URI.create("http://127.0.0.1:" + port + local);
        }
        return URI.create("http://127.0.0.1:" + port + path);
    }

    private String form(List<Map.Entry<String, String>> parameters) {
        return parameters.stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private Map<String, String> parseQuery(String query) {
        return java.util.Arrays.stream(query.split("&"))
                .map(part -> part.split("=", 2))
                .collect(Collectors.toMap(
                        pair -> java.net.URLDecoder.decode(pair[0], StandardCharsets.UTF_8),
                        pair -> java.net.URLDecoder.decode(pair[1], StandardCharsets.UTF_8)));
    }

    private String challenge(String verifier) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest(verifier.getBytes(StandardCharsets.US_ASCII));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
