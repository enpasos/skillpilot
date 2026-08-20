package com.skillpilot.backend.connectors.claude.v1;

import java.net.CookieManager;
import java.net.CookiePolicy;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.Principal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1BindingService;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1ConnectionRepository;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Exercises the Claude v1 security boundary against a real embedded server.
 *
 * <p>Runs over HTTP rather than MockMvc so the actual filter chain order, the host boundary filter
 * and the {@code WWW-Authenticate} challenge are all observed as a client would see them.</p>
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
// This property set is used by exactly one class, so caching its context past the class
// only holds heap that the rest of the suite needs.
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
    private static final String PKCE_VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    private static final String PKCE_CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

    @LocalServerPort
    private int port;

    @Autowired
    @Qualifier("claudeV1AuthorizationService")
    private OAuth2AuthorizationService authorizationService;

    @Autowired
    @Qualifier("claudeV1RegisteredClientRepository")
    private RegisteredClientRepository registeredClientRepository;

    @Autowired
    private ClaudeV1ConnectionRepository connectionRepository;

    @Autowired
    private ClaudeV1BindingService bindingService;

    @Autowired
    private LearnerRepository learnerRepository;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    @Test
    void unauthenticatedMcpCallIsChallengedWithResourceMetadata() throws Exception {
        HttpResponse<String> response = post(
                ClaudeV1Contract.INTERNAL_MCP_PATH,
                "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}",
                CLAUDE_HOST);

        assertEquals(401, response.statusCode());
        String challenge = response.headers().firstValue("WWW-Authenticate").orElse("");
        assertTrue(challenge.contains("resource_metadata="), () -> "challenge was: " + challenge);
        assertTrue(challenge.contains(ClaudeV1Contract.DEFAULT_PUBLIC_RESOURCE_METADATA_URL));
        // No credential was presented, so the challenge must not claim the token was invalid.
        assertFalse(challenge.contains("error="));
    }

    @Test
    void invalidBearerTokenIsRejectedAsInvalidToken() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_MCP_PATH))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Authorization", "Bearer not-a-real-claude-token")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}"))
                .build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(401, response.statusCode());
        assertTrue(response.headers().firstValue("WWW-Authenticate").orElse("").contains("invalid_token"));
    }

    @Test
    void invalidMcpOriginIsRejectedBeforeAuthentication() throws Exception {
        HttpRequest invalidOrigin = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_MCP_PATH))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Origin", "https://attacker.example")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}"))
                .build();
        assertEquals(
                403,
                httpClient.send(invalidOrigin, HttpResponse.BodyHandlers.ofString()).statusCode());

        HttpRequest hostedClaudeOrigin = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_MCP_PATH))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Origin", "https://claude.ai")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}"))
                .build();
        HttpResponse<String> validOriginResponse =
                httpClient.send(hostedClaudeOrigin, HttpResponse.BodyHandlers.ofString());
        assertEquals(401, validOriginResponse.statusCode(),
                "A valid Origin is not an authentication signal");
        assertTrue(validOriginResponse.headers().allValues("Set-Cookie").stream()
                .noneMatch(cookie -> cookie.startsWith("JSESSIONID=")),
                "An unauthenticated MCP call must remain stateless");
    }

    @Test
    void discoveryDocumentsArePublicAndNamePublicUrlsOnly() throws Exception {
        HttpResponse<String> resourceMetadata =
                get(ClaudeV1Contract.INTERNAL_PROTECTED_RESOURCE_METADATA_PATH, CLAUDE_HOST);
        assertEquals(200, resourceMetadata.statusCode());
        assertTrue(resourceMetadata.body().contains(ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL));
        assertFalse(
                resourceMetadata.body().contains(ClaudeV1Contract.INTERNAL_BASE_PATH),
                "Discovery documents must never publish the internal prefix");

        HttpResponse<String> authServerMetadata =
                get(ClaudeV1Contract.INTERNAL_AUTH_SERVER_METADATA_PATH, CLAUDE_HOST);
        assertEquals(200, authServerMetadata.statusCode());
        assertTrue(authServerMetadata.body().contains("\"client_id_metadata_document_supported\":true"));
        assertTrue(authServerMetadata.body().contains("\"S256\""));
        assertFalse(authServerMetadata.body().contains(ClaudeV1Contract.INTERNAL_BASE_PATH));
        assertFalse(
                authServerMetadata.body().contains("registration_endpoint"),
                "Dynamic client registration must not be advertised");
    }

    @Test
    void connectAndPrivacyPagesAreServedWithoutInlineScript() throws Exception {
        HttpResponse<String> connectPage = get(ClaudeV1Contract.INTERNAL_CONNECT_PATH, CLAUDE_HOST);
        assertEquals(200, connectPage.statusCode());
        assertTrue(connectPage.headers().firstValue("Content-Type").orElse("").contains("text/html"));
        assertTrue(connectPage.body().contains("Content-Security-Policy"));
        assertFalse(
                connectPage.body().contains("<script type=\"module\">"),
                "The page's own CSP forbids inline script, so it must not contain one");
        assertTrue(connectPage.body().contains("src=\"/connect/connect.js\""));
        assertTrue(connectPage.body().contains("id=\"clientHost\""));
        assertTrue(connectPage.body().contains("id=\"redirectHost\""));

        assertEquals(200, get(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/connect.js", CLAUDE_HOST).statusCode());
        assertEquals(200, get(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/id-decrypt.js", CLAUDE_HOST).statusCode());
        assertEquals(200, get(ClaudeV1Contract.INTERNAL_PRIVACY_PATH, CLAUDE_HOST).statusCode());
    }

    @Test
    void internalPathsAreNotReachableThroughAnotherHost() throws Exception {
        for (String foreignHost : new String[] {"skillpilot.com", "mcp-coach-v1.skillpilot.com"}) {
            assertEquals(
                    404,
                    get(ClaudeV1Contract.INTERNAL_PROTECTED_RESOURCE_METADATA_PATH, foreignHost).statusCode(),
                    () -> "The internal prefix must not be an alias on " + foreignHost);
            assertEquals(
                    404,
                    get(ClaudeV1Contract.INTERNAL_CONNECT_PATH, foreignHost).statusCode());
            assertEquals(
                    404,
                    post(ClaudeV1Contract.INTERNAL_MCP_PATH, "{}", foreignHost).statusCode());
        }
    }

    @Test
    void unknownVersionsAndTheDisabledBetaPathAreNotServed() throws Exception {
        assertEquals(404, get("/internal/connectors/claude/v2/mcp", CLAUDE_HOST).statusCode());
        assertEquals(404, get(ClaudeV1Contract.INTERNAL_BASE_PATH + "/does-not-exist", CLAUDE_HOST).statusCode());
        // The paused beta endpoint is never an alias or fallback for v1.
        assertTrue(post("/api/claude/mcp", "{}", CLAUDE_HOST).statusCode() >= 400);
    }

    @Test
    void authorizeRejectsUnknownClientsAndWeakPkce() throws Exception {
        assertEquals(400, get(
                ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH
                        + "?response_type=code&client_id=https://evil.example/metadata"
                        + "&redirect_uri=https://evil.example/cb&state=s&code_challenge=c&code_challenge_method=S256",
                CLAUDE_HOST).statusCode());

        assertEquals(400, get(
                ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH
                        + "?response_type=code&client_id=" + enc(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID)
                        + "&redirect_uri=" + enc(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK)
                        + "&state=s&code_challenge=c&code_challenge_method=plain",
                CLAUDE_HOST).statusCode(), "PKCE plain must be refused");

        assertEquals(400, get(
                ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH
                        + "?response_type=code&client_id=" + enc(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID)
                        + "&redirect_uri=" + enc("https://attacker.example/cb")
                        + "&state=s&code_challenge=c&code_challenge_method=S256",
                CLAUDE_HOST).statusCode(), "A foreign redirect_uri must be refused");
    }

    @Test
    void authorizeRedirectsAnUnboundRequestToThePublicConnectPage() throws Exception {
        HttpResponse<String> response = get(
                ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH
                        + "?response_type=code&client_id=" + enc(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID)
                        + "&redirect_uri=" + enc(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK)
                        + "&state=state-" + System.nanoTime()
                        + "&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256"
                        + "&resource=" + enc(ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL),
                CLAUDE_HOST);

        assertEquals(302, response.statusCode());
        String location = response.headers().firstValue("Location").orElse("");
        assertTrue(location.startsWith(ClaudeV1Contract.DEFAULT_PUBLIC_BASE_URL + "/connect#handle="),
                () -> "Redirect must use the public origin, was: " + location);
        assertFalse(location.contains(ClaudeV1Contract.INTERNAL_BASE_PATH));
    }

    @Test
    void authorizeWithoutAScopeDoesNotGrantOfflineAccess() throws Exception {
        // Refresh-token issuance follows offline_access. A client that does not ask for it must not
        // receive it, so the omitted-scope default stays at read + write.
        HttpResponse<String> response = get(
                ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH
                        + "?response_type=code&client_id=" + enc(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID)
                        + "&redirect_uri=" + enc(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK)
                        + "&state=state-" + System.nanoTime()
                        + "&code_challenge=" + PKCE_CHALLENGE + "&code_challenge_method=S256"
                        + "&resource=" + enc(ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL),
                CLAUDE_HOST);

        assertEquals(302, response.statusCode());
        String location = response.headers().firstValue("Location").orElse("");
        String handle = location.substring(location.indexOf("#handle=") + "#handle=".length());

        String scope = bindingService.requirePendingTransaction(
                java.net.URLDecoder.decode(handle, java.nio.charset.StandardCharsets.UTF_8)).scope();

        assertEquals(
                ClaudeV1Contract.SCOPE_READ + " " + ClaudeV1Contract.SCOPE_WRITE,
                scope,
                "An omitted scope must not silently enable refresh tokens");
    }

    @Test
    void authorizeKeepsOfflineAccessWhenItIsExplicitlyRequested() throws Exception {
        String requested = ClaudeV1Contract.SCOPE_READ
                + " " + ClaudeV1Contract.SCOPE_WRITE
                + " " + ClaudeV1Contract.SCOPE_OFFLINE_ACCESS;
        HttpResponse<String> response = get(
                ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH
                        + "?response_type=code&client_id=" + enc(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID)
                        + "&redirect_uri=" + enc(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK)
                        + "&state=state-" + System.nanoTime()
                        + "&scope=" + enc(requested)
                        + "&code_challenge=" + PKCE_CHALLENGE + "&code_challenge_method=S256"
                        + "&resource=" + enc(ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL),
                CLAUDE_HOST);

        assertEquals(302, response.statusCode());
        String location = response.headers().firstValue("Location").orElse("");
        String handle = location.substring(location.indexOf("#handle=") + "#handle=".length());

        String scope = bindingService.requirePendingTransaction(
                java.net.URLDecoder.decode(handle, java.nio.charset.StandardCharsets.UTF_8)).scope();

        assertEquals(requested, scope);
    }

    @Test
    void bindEndpointRejectsCrossSiteSubmissions() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/bind"))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Content-Type", "application/json")
                .header("Origin", "https://attacker.example")
                .header("Sec-Fetch-Site", "cross-site")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "{\"handle\":\"deadbeef\",\"skillpilotId\":\"11111111-2222-3333-4444-555555555555\"}"))
                .build();
        assertEquals(403, httpClient.send(request, HttpResponse.BodyHandlers.ofString()).statusCode());

        HttpRequest detailsRequest = HttpRequest.newBuilder(
                        uri(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/details"))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Content-Type", "application/json")
                .header("Origin", "https://attacker.example")
                .header("Sec-Fetch-Site", "cross-site")
                .POST(HttpRequest.BodyPublishers.ofString("{\"handle\":\"deadbeef\"}"))
                .build();
        assertEquals(403, httpClient.send(detailsRequest, HttpResponse.BodyHandlers.ofString()).statusCode());
    }

    @Test
    void sameOriginBindingRequiresAndAcceptsTheServerIssuedCsrfToken() throws Exception {
        CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        HttpClient browser = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();

        HttpRequest tokenRequest = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/csrf"))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .GET()
                .build();
        HttpResponse<String> tokenResponse = browser.send(tokenRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, tokenResponse.statusCode());
        var csrf = new ObjectMapper().readTree(tokenResponse.body());
        String csrfCookie = cookiePair(tokenResponse, ClaudeV1Contract.CSRF_COOKIE_NAME);
        List<String> setCookies = tokenResponse.headers().allValues("Set-Cookie");
        assertTrue(setCookies.stream().noneMatch(cookie -> cookie.startsWith("JSESSIONID=")),
                "The public CSRF endpoint must not allocate an HTTP session");
        String csrfSetCookie = setCookies.stream()
                .filter(cookie -> cookie.startsWith(ClaudeV1Contract.CSRF_COOKIE_NAME + "="))
                .findFirst()
                .orElseThrow();
        assertTrue(csrfSetCookie.contains("Path=/"));
        assertTrue(csrfSetCookie.contains("Secure"));
        assertTrue(csrfSetCookie.contains("HttpOnly"));
        assertTrue(csrfSetCookie.contains("SameSite=Strict"));

        String body = "{\"handle\":\"" + "0".repeat(64)
                + "\",\"skillpilotId\":\"11111111-2222-3333-4444-555555555555\"}";
        HttpRequest withoutToken = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/bind"))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Origin", ClaudeV1Contract.DEFAULT_PUBLIC_BASE_URL)
                .header("Sec-Fetch-Site", "same-origin")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        assertEquals(403, browser.send(withoutToken, HttpResponse.BodyHandlers.ofString()).statusCode());

        HttpRequest withToken = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/bind"))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Origin", ClaudeV1Contract.DEFAULT_PUBLIC_BASE_URL)
                .header("Sec-Fetch-Site", "same-origin")
                .header("Content-Type", "application/json")
                .header(csrf.path("headerName").asText(), csrf.path("token").asText())
                // The embedded test server is HTTP, so Java correctly refuses to send the Secure
                // cookie automatically. Production is HTTPS; the explicit cookie keeps this test
                // focused on Spring's stateless double-submit validation.
                .header("Cookie", csrfCookie)
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        assertEquals(400, browser.send(withToken, HttpResponse.BodyHandlers.ofString()).statusCode(),
                "A valid CSRF token must reach domain validation; the all-zero handle is then invalid");
    }

    @Test
    void oversizedBindingBodyIsRejectedBeforeJsonDecoding() throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/bind"))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("x".repeat(70_000)))
                .build();
        assertEquals(413, httpClient.send(request, HttpResponse.BodyHandlers.ofString()).statusCode());
    }

    @Test
    void tokenEndpointRejectsJsonAndMissingResourceBeforeOAuthProcessing() throws Exception {
        HttpRequest json = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_TOKEN_PATH))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{}"))
                .build();
        assertEquals(415, httpClient.send(json, HttpResponse.BodyHandlers.ofString()).statusCode());

        HttpRequest noResource = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_TOKEN_PATH))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString("grant_type=refresh_token&client_id=x&refresh_token=x"))
                .build();
        assertEquals(400, httpClient.send(noResource, HttpResponse.BodyHandlers.ofString()).statusCode());

        HttpRequest lookalikeContentType = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_TOKEN_PATH))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Content-Type", "application/x-www-form-urlencoded-evil")
                .POST(HttpRequest.BodyPublishers.ofString("resource=x"))
                .build();
        assertEquals(
                415,
                httpClient.send(lookalikeContentType, HttpResponse.BodyHandlers.ofString()).statusCode());

        HttpRequest oversizedChunkedForm = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_TOKEN_PATH))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofInputStream(() ->
                        new java.io.ByteArrayInputStream("x".repeat(70_000).getBytes(
                                java.nio.charset.StandardCharsets.UTF_8))))
                .build();
        assertEquals(
                413,
                httpClient.send(oversizedChunkedForm, HttpResponse.BodyHandlers.ofString()).statusCode());
    }

    @Test
    void publicClientRefreshRotatesOnceAndRevocationEndsTheConnection() throws Exception {
        RefreshFixture fixture = issueRefreshableAuthorization();

        String refreshForm = "grant_type=refresh_token"
                + "&refresh_token=" + enc(fixture.refreshToken())
                + "&client_id=" + enc(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID)
                + "&resource=" + enc(ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL);
        HttpResponse<String> refreshed = postForm(ClaudeV1Contract.INTERNAL_TOKEN_PATH, refreshForm);
        assertEquals(200, refreshed.statusCode(), () -> "refresh response: " + refreshed.body());

        var tokenResponse = new ObjectMapper().readTree(refreshed.body());
        String newAccessToken = tokenResponse.path("access_token").asText();
        String newRefreshToken = tokenResponse.path("refresh_token").asText();
        assertFalse(newAccessToken.isBlank());
        assertFalse(newRefreshToken.isBlank());
        assertFalse(newRefreshToken.equals(fixture.refreshToken()), "Refresh tokens must rotate");
        assertTrue(authorizationService.findByToken(newAccessToken, OAuth2TokenType.ACCESS_TOKEN) != null);

        HttpResponse<String> replay = postForm(ClaudeV1Contract.INTERNAL_TOKEN_PATH, refreshForm);
        assertEquals(400, replay.statusCode(), () -> "rotated token replay: " + replay.body());
        assertTrue(replay.body().contains("invalid_grant"));

        String revokeForm = "token=" + enc(newAccessToken)
                + "&token_type_hint=access_token"
                + "&client_id=" + enc(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID);
        HttpResponse<String> revoked = postForm(ClaudeV1Contract.INTERNAL_REVOKE_PATH, revokeForm);
        assertEquals(200, revoked.statusCode(), () -> "revocation response: " + revoked.body());
        assertTrue(connectionRepository.findActiveConnectionById(fixture.connectionId()).isEmpty());
        var revokedConnection = connectionRepository.findConnectionById(fixture.connectionId()).orElseThrow();
        assertTrue(revokedConnection.skillpilotId().isBlank());
        assertTrue(revokedConnection.learnerIdHash().isBlank());
    }

    @Test
    void hostedAuthorizationCodeFlowBindsExchangesAndCallsMcpEndToEnd() throws Exception {
        String learnerId = UUID.randomUUID().toString();
        Learner learner = new Learner();
        learner.setSkillpilotId(learnerId);
        learner.setSelectedCurriculum("KC_HE_GYM_MATHE_2024");
        learner.setCoachStateRevision(1L);
        learnerRepository.save(learner);

        CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        HttpClient browser = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .followRedirects(HttpClient.Redirect.NEVER)
                .build();
        String state = "state-e2e-" + UUID.randomUUID();
        String authorizationRequest = ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH
                + "?response_type=code"
                + "&client_id=" + enc(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID)
                + "&redirect_uri=" + enc(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK)
                + "&scope=" + enc(String.join(" ",
                        ClaudeV1Contract.SCOPE_READ,
                        ClaudeV1Contract.SCOPE_WRITE,
                        ClaudeV1Contract.SCOPE_OFFLINE_ACCESS))
                + "&state=" + enc(state)
                + "&code_challenge=" + enc(PKCE_CHALLENGE)
                + "&code_challenge_method=S256"
                + "&resource=" + enc(ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL);

        HttpResponse<String> firstAuthorize = browserGet(browser, authorizationRequest);
        assertEquals(302, firstAuthorize.statusCode(), () -> "authorize response: " + firstAuthorize.body());
        URI connectRedirect = URI.create(firstAuthorize.headers().firstValue("Location").orElseThrow());
        String handle = parameter(connectRedirect.getRawFragment(), "handle");
        assertTrue(handle.matches("[0-9a-f]{64}"));

        HttpResponse<String> csrfResponse =
                browserGet(browser, ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/csrf");
        assertEquals(200, csrfResponse.statusCode());
        var csrf = new ObjectMapper().readTree(csrfResponse.body());
        String csrfCookie = cookiePair(csrfResponse, ClaudeV1Contract.CSRF_COOKIE_NAME);
        String detailsBody = new ObjectMapper().writeValueAsString(Map.of("handle", handle));
        HttpRequest detailsRequest = HttpRequest.newBuilder(
                        uri(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/details"))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Origin", ClaudeV1Contract.DEFAULT_PUBLIC_BASE_URL)
                .header("Sec-Fetch-Site", "same-origin")
                .header("Content-Type", "application/json")
                .header(csrf.path("headerName").asText(), csrf.path("token").asText())
                .header("Cookie", csrfCookie)
                .POST(HttpRequest.BodyPublishers.ofString(detailsBody))
                .build();
        HttpResponse<String> details = browser.send(detailsRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, details.statusCode(), () -> "details response: " + details.body());
        var detailsJson = new ObjectMapper().readTree(details.body());
        assertEquals("Claude.ai / Desktop / Mobile", detailsJson.path("clientName").asText());
        assertEquals("claude.ai", detailsJson.path("clientHost").asText());
        assertEquals("claude.ai", detailsJson.path("redirectHost").asText());
        assertFalse(details.body().contains(learnerId));

        String bindBody = new ObjectMapper().writeValueAsString(Map.of(
                "handle", handle,
                "skillpilotId", learnerId));
        HttpRequest bindRequest = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/bind"))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Origin", ClaudeV1Contract.DEFAULT_PUBLIC_BASE_URL)
                .header("Sec-Fetch-Site", "same-origin")
                .header("Content-Type", "application/json")
                .header(csrf.path("headerName").asText(), csrf.path("token").asText())
                .header("Cookie", csrfCookie)
                .POST(HttpRequest.BodyPublishers.ofString(bindBody))
                .build();
        HttpResponse<String> bound = browser.send(bindRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, bound.statusCode(), () -> "binding response: " + bound.body());
        URI resumedAuthorization = URI.create(
                new ObjectMapper().readTree(bound.body()).path("redirectUrl").asText());

        HttpResponse<String> authorized = browserGet(browser, localPathAndQuery(resumedAuthorization));
        assertEquals(302, authorized.statusCode(), () -> "resumed authorize response: " + authorized.body());
        URI callback = URI.create(authorized.headers().firstValue("Location").orElseThrow());
        assertEquals(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK,
                callback.getScheme() + "://" + callback.getAuthority() + callback.getPath());
        assertEquals(state, parameter(callback.getRawQuery(), "state"));
        String code = parameter(callback.getRawQuery(), "code");
        assertFalse(code.isBlank());

        String tokenForm = "grant_type=authorization_code"
                + "&code=" + enc(code)
                + "&redirect_uri=" + enc(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK)
                + "&client_id=" + enc(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID)
                + "&code_verifier=" + enc(PKCE_VERIFIER)
                + "&resource=" + enc(ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL);
        HttpResponse<String> tokenExchange = postForm(ClaudeV1Contract.INTERNAL_TOKEN_PATH, tokenForm);
        assertEquals(200, tokenExchange.statusCode(), () -> "token response: " + tokenExchange.body());
        var tokenJson = new ObjectMapper().readTree(tokenExchange.body());
        String accessToken = tokenJson.path("access_token").asText();
        assertFalse(accessToken.isBlank());
        assertFalse(tokenJson.path("refresh_token").asText().isBlank());

        OAuth2Authorization authorization =
                authorizationService.findByToken(accessToken, OAuth2TokenType.ACCESS_TOKEN);
        assertTrue(authorization != null);
        assertEquals(
                learnerId,
                connectionRepository.findActiveConnectionById(authorization.getPrincipalName())
                        .orElseThrow()
                        .skillpilotId());

        HttpRequest mcpRequest = HttpRequest.newBuilder(uri(ClaudeV1Contract.INTERNAL_MCP_PATH))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/json")
                .header("Accept", "application/json, text/event-stream")
                .header("MCP-Protocol-Version", "2025-11-25")
                .POST(HttpRequest.BodyPublishers.ofString(
                        "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\",\"params\":{}}"))
                .build();
        HttpResponse<String> mcpResponse = httpClient.send(mcpRequest, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, mcpResponse.statusCode(), () -> "MCP response: " + mcpResponse.body());
        assertTrue(mcpResponse.body().contains(ClaudeV1Contract.TOOL_GET_COACH_CONTEXT));
        assertFalse(mcpResponse.body().contains(learnerId));

        HttpResponse<String> revoked = postForm(
                ClaudeV1Contract.INTERNAL_REVOKE_PATH,
                "token=" + enc(accessToken)
                        + "&token_type_hint=access_token"
                        + "&client_id=" + enc(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID));
        assertEquals(200, revoked.statusCode());
    }

    private RefreshFixture issueRefreshableAuthorization() {
        String connectionId = ClaudeV1TestFixtures
                .createBoundLearner(learnerRepository, connectionRepository, 1L)
                .connectionId();
        RegisteredClient client = registeredClientRepository
                .findByClientId(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID);
        assertTrue(client != null, "Hosted Claude client must be registered");

        Instant now = Instant.now();
        Set<String> scopes = new LinkedHashSet<>(List.of(
                ClaudeV1Contract.SCOPE_READ,
                ClaudeV1Contract.SCOPE_WRITE,
                ClaudeV1Contract.SCOPE_OFFLINE_ACCESS));
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                "initial-access-" + UUID.randomUUID(),
                now,
                now.plusSeconds(3600),
                scopes);
        OAuth2RefreshToken refreshToken = new OAuth2RefreshToken(
                "initial-refresh-" + UUID.randomUUID(),
                now,
                now.plusSeconds(3600));

        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(client)
                .id(UUID.randomUUID().toString())
                .principalName(connectionId)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizedScopes(scopes)
                .attribute(
                        Principal.class.getName(),
                        new UsernamePasswordAuthenticationToken(connectionId, null, List.of()))
                .token(accessToken, metadata -> {
                    Map<String, Object> claims = new LinkedHashMap<>();
                    claims.put("aud", new ArrayList<>(List.of(ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL)));
                    metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, claims);
                })
                .refreshToken(refreshToken)
                .build();
        authorizationService.save(authorization);
        return new RefreshFixture(connectionId, refreshToken.getTokenValue());
    }

    private HttpResponse<String> postForm(String path, String body) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(path))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> browserGet(HttpClient browser, String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(path))
                .header("X-Forwarded-Host", CLAUDE_HOST)
                .header("X-Forwarded-Proto", "https")
                .GET()
                .build();
        return browser.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private static String localPathAndQuery(URI publicUri) {
        String localPath = ClaudeV1Contract.PUBLIC_PATH_AUTHORIZE.equals(publicUri.getRawPath())
                ? ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH
                : publicUri.getRawPath();
        return publicUri.getRawQuery() == null
                ? localPath
                : localPath + "?" + publicUri.getRawQuery();
    }

    private static String parameter(String encodedParameters, String name) {
        if (encodedParameters == null) {
            return "";
        }
        return java.util.Arrays.stream(encodedParameters.split("&"))
                .map(part -> part.split("=", 2))
                .filter(parts -> java.net.URLDecoder.decode(parts[0], java.nio.charset.StandardCharsets.UTF_8)
                        .equals(name))
                .map(parts -> parts.length == 2
                        ? java.net.URLDecoder.decode(parts[1], java.nio.charset.StandardCharsets.UTF_8)
                        : "")
                .findFirst()
                .orElse("");
    }

    private static String cookiePair(HttpResponse<?> response, String cookieName) {
        return response.headers().allValues("Set-Cookie").stream()
                .filter(cookie -> cookie.startsWith(cookieName + "="))
                .map(cookie -> cookie.split(";", 2)[0])
                .findFirst()
                .orElseThrow(() -> new AssertionError("Missing cookie " + cookieName));
    }

    private record RefreshFixture(String connectionId, String refreshToken) {}

    private HttpResponse<String> get(String path, String host) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(path))
                .header("X-Forwarded-Host", host)
                .header("X-Forwarded-Proto", "https")
                .GET()
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> post(String path, String body, String host) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(path))
                .header("X-Forwarded-Host", host)
                .header("X-Forwarded-Proto", "https")
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        return httpClient.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) {
        return URI.create("http://127.0.0.1:" + port + path);
    }

    private static String enc(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
