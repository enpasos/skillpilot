package com.skillpilot.backend.connectors.claude.v1.oauth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.Executors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/** Real local HTTP/Spring flow; only external CIMD retrieval is a synthetic fixture. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
    ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
    ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
    "skillpilot.openai.enabled=false", "skillpilot.oauth.authenticated-clients-required=false",
    "skillpilot.claude.connector.v1.oauth.client-authentication-mode=claude-custom-confidential",
    "skillpilot.claude.connector.v1.oauth.public-cimd-enabled=true",
    "skillpilot.claude.connector.v1.oauth.client-id=skillpilot-claude-custom-test",
    "skillpilot.claude.connector.v1.oauth.client-secret=synthetic-claude-custom-secret-0123456789",
    "skillpilot.claude.connector.v1.oauth.client-authentication-method=client_secret_basic",
    "skillpilot.claude.connector.v1.oauth.authorization-policy-version=public-family-test-v1",
    "skillpilot.claude.connector.v1.max-oauth-requests-per-caller-per-minute=300",
    "spring.datasource.url=jdbc:h2:mem:claude-public-families;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
class ClaudeV1PublicRefreshFamilyIntegrationTest {
    private static final String CLIENT = ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID;
    private static final String CALLBACK = ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK;
    private static final String RESOURCE = ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL;
    private static final String VERIFIER = "synthetic-public-pkce-verifier-012345678901234567890123456789";
    private static final ObjectMapper JSON = new ObjectMapper();
    private final HttpClient http = HttpClient.newBuilder().followRedirects(HttpClient.Redirect.NEVER).build();
    @LocalServerPort int port;
    @MockitoBean ClaudeV1CimdMetadataValidator cimd;
    @Autowired @Qualifier("claudeV1OpaqueTokenIntrospector") OpaqueTokenIntrospector introspector;
    @Autowired @Qualifier("claudeV1AuthorizationService") org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService authorizations;
    @Autowired org.springframework.jdbc.core.JdbcOperations jdbc;

    @BeforeEach void metadataFixture() {
        when(cimd.isVerifiedClientId(CLIENT)).thenReturn(true);
        when(cimd.isValidRedirectUri(CLIENT, CALLBACK)).thenReturn(true);
    }

    @Test void rotatingThenReusingOldTokenRevokesNewestAccessAndRefreshButNotAnotherFamily() throws Exception {
        JsonNode first = connect();
        JsonNode independent = connect();
        HttpResponse<String> rotated = refresh(first.path("refresh_token").asText(), CLIENT);
        assertEquals(200, rotated.statusCode(), rotated.body());
        JsonNode second = JSON.readTree(rotated.body());
        assertNotEquals(first.path("refresh_token").asText(), second.path("refresh_token").asText());
        assertEquals("claude-cimd-public", introspector.introspect(second.path("access_token").asText()).getAttribute("client_profile"));
        assertEquals("none", introspector.introspect(second.path("access_token").asText()).getAttribute("client_authentication_method"));
        assertInvalidGrant(refresh(first.path("refresh_token").asText(), CLIENT));
        assertThrows(org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException.class,
                () -> introspector.introspect(second.path("access_token").asText()));
        assertInvalidGrant(refresh(second.path("refresh_token").asText(), CLIENT));
        assertNotNull(introspector.introspect(independent.path("access_token").asText()));
        assertEquals(200, refresh(independent.path("refresh_token").asText(), CLIENT).statusCode());
    }

    @Test void concurrentRefreshHasOneWinnerThenClosesTheCompromisedFamily() throws Exception {
        String token = connect().path("refresh_token").asText();
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> refresh(token, CLIENT));
            var second = executor.submit(() -> refresh(token, CLIENT));
            HttpResponse<String> a = first.get(); HttpResponse<String> b = second.get();
            assertEquals(1, java.util.stream.Stream.of(a,b).filter(r -> r.statusCode() == 200).count());
            HttpResponse<String> winner = a.statusCode() == 200 ? a : b;
            assertInvalidGrant(a.statusCode() == 200 ? b : a);
            JsonNode issued = JSON.readTree(winner.body());
            assertInvalidGrant(refresh(issued.path("refresh_token").asText(), CLIENT));
            assertThrows(org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException.class,
                    () -> introspector.introspect(issued.path("access_token").asText()));
        }
    }

    @Test void concurrentAuthorizationCodeExchangeHasOnlyOneWinner() throws Exception {
        String code = authorizationCode(CLIENT);
        Map<String,String> parameters = Map.of("grant_type", "authorization_code", "client_id", CLIENT,
                "code", code, "code_verifier", VERIFIER, "redirect_uri", CALLBACK, "resource", RESOURCE);
        try (var executor = Executors.newFixedThreadPool(2)) {
            var first = executor.submit(() -> post(ClaudeV1Contract.INTERNAL_TOKEN_PATH, parameters));
            var second = executor.submit(() -> post(ClaudeV1Contract.INTERNAL_TOKEN_PATH, parameters));
            var a = first.get(); var b = second.get();
            assertEquals(1, java.util.stream.Stream.of(a,b).filter(response -> response.statusCode() == 200).count());
            assertInvalidGrant(a.statusCode() == 200 ? b : a);
        }
    }

    @Test void codeRevocationIsANoOpEvenDuringCodeExchange() throws Exception {
        String code = authorizationCode(CLIENT);
        Map<String, String> revoke = Map.of("client_id", CLIENT, "token", code, "token_type_hint", "authorization_code");
        assertEquals(200, post(ClaudeV1Contract.INTERNAL_REVOKE_PATH, revoke).statusCode());
        try (var executor = Executors.newFixedThreadPool(2)) {
            var revoked = executor.submit(() -> post(ClaudeV1Contract.INTERNAL_REVOKE_PATH, revoke));
            var exchanged = executor.submit(() -> post(ClaudeV1Contract.INTERNAL_TOKEN_PATH,
                    Map.of("grant_type", "authorization_code", "client_id", CLIENT, "code", code,
                            "code_verifier", VERIFIER, "redirect_uri", CALLBACK, "resource", RESOURCE)));
            assertEquals(200, revoked.get(10, java.util.concurrent.TimeUnit.SECONDS).statusCode());
            var tokens = exchanged.get(10, java.util.concurrent.TimeUnit.SECONDS);
            assertEquals(200, tokens.statusCode(), tokens.body());
            assertNotNull(introspector.introspect(JSON.readTree(tokens.body()).path("access_token").asText()));
        }
    }

    @Test void wrongClientCannotConsumeOrRevokePublicFamilyAndSecretClientCannotFallbackToNone() throws Exception {
        JsonNode first = connect(); String token = first.path("refresh_token").asText();
        assertInvalidGrant(refresh(token, ClaudeV1Contract.CIMD_CLAUDE_CODE_CLIENT_ID));
        HttpResponse<String> denied = refresh(token, "skillpilot-claude-custom-test");
        assertTrue(denied.statusCode() == 400 || denied.statusCode() == 401);
        assertEquals(200, refresh(token, CLIENT).statusCode());
    }

    @Test void customSecretProfileWorksAlongsidePublicWithoutUpgradingPublicTokens() throws Exception {
        JsonNode custom = connect("skillpilot-claude-custom-test", "synthetic-claude-custom-secret-0123456789");
        assertEquals("claude-custom-confidential", introspector.introspect(custom.path("access_token").asText()).getAttribute("client_profile"));
        assertEquals("client_secret_basic", introspector.introspect(custom.path("access_token").asText()).getAttribute("client_authentication_method"));
        JsonNode publicTokens = connect();
        var swap = post(ClaudeV1Contract.INTERNAL_TOKEN_PATH, Map.of("grant_type", "refresh_token", "refresh_token", publicTokens.path("refresh_token").asText(),
                "resource", RESOURCE), "skillpilot-claude-custom-test", "synthetic-claude-custom-secret-0123456789");
        assertInvalidGrant(swap);
        assertEquals(200, refresh(publicTokens.path("refresh_token").asText(), CLIENT).statusCode());
        assertEquals(200, post(ClaudeV1Contract.INTERNAL_TOKEN_PATH, Map.of("grant_type", "refresh_token", "refresh_token", custom.path("refresh_token").asText(),
                "resource", RESOURCE), "skillpilot-claude-custom-test", "synthetic-claude-custom-secret-0123456789").statusCode());
    }

    @Test void explicitRevocationClosesWholePublicFamilyAndReconnectionIsIndependent() throws Exception {
        JsonNode first = connect();
        assertEquals(200, post(ClaudeV1Contract.INTERNAL_REVOKE_PATH, Map.of("client_id", CLIENT,
                "token", first.path("refresh_token").asText(), "token_type_hint", "refresh_token")).statusCode());
        assertInvalidGrant(refresh(first.path("refresh_token").asText(), CLIENT));
        assertThrows(org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException.class,
                () -> introspector.introspect(first.path("access_token").asText()));
        assertNotNull(introspector.introspect(connect().path("access_token").asText()));
    }

    @Test void expiredAccessCanRefreshButExpiredRefreshAndAuthorizationCodeAreRejected() throws Exception {
        JsonNode issued = connect(); String access = issued.path("access_token").asText();
        var authorization = authorizations.findByToken(access, org.springframework.security.oauth2.server.authorization.OAuth2TokenType.ACCESS_TOKEN);
        var oldAccess = authorization.getAccessToken();
        var expiredAccess = new org.springframework.security.oauth2.core.OAuth2AccessToken(org.springframework.security.oauth2.core.OAuth2AccessToken.TokenType.BEARER,
                access, java.time.Instant.now().minusSeconds(3600), java.time.Instant.now().minusSeconds(60), oldAccess.getToken().getScopes());
        authorizations.save(org.springframework.security.oauth2.server.authorization.OAuth2Authorization.from(authorization)
                .token(expiredAccess, metadata -> metadata.putAll(oldAccess.getMetadata())).build());
        assertThrows(org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException.class, () -> introspector.introspect(access));
        var renewed = refresh(issued.path("refresh_token").asText(), CLIENT);
        assertEquals(200, renewed.statusCode());
        JsonNode next = JSON.readTree(renewed.body());
        authorization = authorizations.findByToken(next.path("access_token").asText(), org.springframework.security.oauth2.server.authorization.OAuth2TokenType.ACCESS_TOKEN);
        authorizations.save(org.springframework.security.oauth2.server.authorization.OAuth2Authorization.from(authorization)
                .refreshToken(new org.springframework.security.oauth2.core.OAuth2RefreshToken(next.path("refresh_token").asText(),
                        java.time.Instant.now().minusSeconds(3600), java.time.Instant.now().minusSeconds(60))).build());
        assertInvalidGrant(refresh(next.path("refresh_token").asText(), CLIENT));
        String code = authorizationCode(CLIENT);
        authorization = authorizations.findByToken(code, new org.springframework.security.oauth2.server.authorization.OAuth2TokenType("code"));
        // Synthetic clock travel in this test database only. Production save deliberately
        // forbids replacing an issued code, including its original lifetime.
        jdbc.update("UPDATE oauth2_authorization SET authorization_code_issued_at = ?, authorization_code_expires_at = ? WHERE id = ?",
                java.sql.Timestamp.from(java.time.Instant.now().minusSeconds(3600)),
                java.sql.Timestamp.from(java.time.Instant.now().minusSeconds(60)), authorization.getId());
        assertInvalidGrant(post(ClaudeV1Contract.INTERNAL_TOKEN_PATH, Map.of("grant_type", "authorization_code", "client_id", CLIENT,
                "code", code, "code_verifier", VERIFIER, "redirect_uri", CALLBACK, "resource", RESOURCE)));
    }

    private JsonNode connect() throws Exception {
        return connect(CLIENT, null);
    }
    private JsonNode connect(String client, String secret) throws Exception {
        String code = authorizationCode(client);
        var result = post(ClaudeV1Contract.INTERNAL_TOKEN_PATH, Map.of("grant_type", "authorization_code", "client_id", client,
                "code", code, "code_verifier", VERIFIER, "redirect_uri", CALLBACK, "resource", RESOURCE), client, secret);
        assertEquals(200, result.statusCode(), result.body());
        return JSON.readTree(result.body());
    }
    private String authorizationCode(String client) throws Exception {
        Map<String,String> parameters = new LinkedHashMap<>(Map.of("response_type", "code", "client_id", client,
                "redirect_uri", CALLBACK, "scope", "skillpilot.read skillpilot.write offline_access", "resource", RESOURCE,
                "code_challenge_method", "S256", "code_challenge", Base64.getUrlEncoder().withoutPadding().encodeToString(
                        MessageDigest.getInstance("SHA-256").digest(VERIFIER.getBytes(StandardCharsets.US_ASCII)))));
        HttpResponse<String> authorization = http.send(request(ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH + "?" + form(parameters)).GET().build(), HttpResponse.BodyHandlers.ofString());
        assertEquals(302, authorization.statusCode(), authorization.body());
        URI callback = URI.create(authorization.headers().firstValue("location").orElseThrow());
        return java.util.Arrays.stream(callback.getRawQuery().split("&")).filter(v -> v.startsWith("code="))
                .map(v -> URLDecoder.decode(v.substring(5), StandardCharsets.UTF_8)).findFirst().orElseThrow();
    }
    private HttpResponse<String> refresh(String token, String client) throws Exception {
        return post(ClaudeV1Contract.INTERNAL_TOKEN_PATH, Map.of("grant_type", "refresh_token", "refresh_token", token,
                "client_id", client, "resource", RESOURCE));
    }
    private HttpResponse<String> post(String path, Map<String,String> parameters) throws Exception {
        return post(path, parameters, null, null);
    }
    private HttpResponse<String> post(String path, Map<String,String> parameters, String client, String secret) throws Exception {
        var builder = request(path);
        if (secret != null) builder.header("Authorization", "Basic " + Base64.getEncoder().encodeToString((client + ":" + secret).getBytes(StandardCharsets.US_ASCII)));
        return http.send(builder.header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form(parameters))).build(), HttpResponse.BodyHandlers.ofString());
    }
    private HttpRequest.Builder request(String path) {
        return HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .header("X-Forwarded-Host", "mcp-claude-v1.skillpilot.com").header("X-Forwarded-Proto", "https");
    }
    private static String form(Map<String,String> values) {
        return values.entrySet().stream().map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "="
                + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8)).collect(java.util.stream.Collectors.joining("&"));
    }
    private static void assertInvalidGrant(HttpResponse<String> response) throws Exception {
        assertEquals(400, response.statusCode(), response.body());
        assertEquals("invalid_grant", JSON.readTree(response.body()).path("error").asText());
    }
}
