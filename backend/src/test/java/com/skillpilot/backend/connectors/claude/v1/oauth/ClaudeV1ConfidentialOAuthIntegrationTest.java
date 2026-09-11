package com.skillpilot.backend.connectors.claude.v1.oauth;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import java.net.URI;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

/** Synthetic loopback HTTP tests only; no request is sent to Claude or production SkillPilot. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
        "skillpilot.openai.enabled=false",
        "skillpilot.oauth.authenticated-clients-required=false",
        "skillpilot.claude.connector.v1.oauth.client-authentication-mode=anthropic-credentials",
        "skillpilot.claude.connector.v1.oauth.client-id=skillpilot-claude-directory-test",
        "skillpilot.claude.connector.v1.oauth.client-secret=synthetic-claude-directory-secret-0123456789",
        "skillpilot.claude.connector.v1.oauth.client-authentication-method=client_secret_basic",
        "skillpilot.claude.connector.v1.oauth.authorization-policy-version=confidential-test-v1",
        "skillpilot.claude.connector.v1.max-oauth-requests-per-caller-per-minute=300",
        "spring.datasource.url=jdbc:h2:mem:claude-confidential-basic;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
class ClaudeV1ConfidentialOAuthIntegrationTest {
    static final String CLIENT_ID = "skillpilot-claude-directory-test";
    static final String SECRET = "synthetic-claude-directory-secret-0123456789";
    static final String VERIFIER = "synthetic-pkce-verifier-for-claude-confidential-tests-0123456789";
    private static final ObjectMapper JSON = new ObjectMapper();

    @LocalServerPort private int port;
    @Autowired private ClaudeV1Properties properties;
    @Autowired private JdbcOperations jdbc;
    @Autowired @Qualifier("claudeV1RegisteredClientRepository") private RegisteredClientRepository clients;
    @Autowired @Qualifier("claudeV1AuthorizationService") private OAuth2AuthorizationService authorizations;
    @Autowired @Qualifier("claudeV1OpaqueTokenIntrospector") private OpaqueTokenIntrospector introspector;

    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5))
            .followRedirects(HttpClient.Redirect.NEVER).build();

    @Test
    void discoveryAndRegistrationHaveOnlyTheConfirmedConfidentialMethod() throws Exception {
        RegisteredClient client = clients.findByClientId(CLIENT_ID);
        assertNotNull(client);
        assertEquals(Set.of(new ClientAuthenticationMethod(method())), client.getClientAuthenticationMethods());
        assertEquals(300, properties.getMaxOAuthRequestsPerCallerPerMinute());
        assertTrue(client.getClientSettings().isRequireProofKey());
        assertEquals(Set.of(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK), client.getRedirectUris());
        assertNotEquals(SECRET, client.getClientSecret());
        assertTrue(PasswordEncoderFactories.createDelegatingPasswordEncoder().matches(SECRET, client.getClientSecret()));
        for (String publicId : ClaudeV1Contract.ALLOWED_CIMD_CLIENT_IDS) {
            assertNull(clients.findByClientId(publicId));
        }
        JsonNode metadata = JSON.readTree(send(request(ClaudeV1Contract.INTERNAL_AUTH_SERVER_METADATA_PATH).GET().build()).body());
        assertEquals(method(), metadata.path("token_endpoint_auth_methods_supported").get(0).asText());
        assertEquals(1, metadata.path("token_endpoint_auth_methods_supported").size());
        assertFalse(metadata.path("client_id_metadata_document_supported").asBoolean());
        assertFalse(metadata.has("registration_endpoint"));
        assertEquals("S256", metadata.path("code_challenge_methods_supported").get(0).asText());
    }

    @Test
    void codeExchangeRefreshRotationAndRevocationRequireTheConfirmedClientProof() throws Exception {
        JsonNode issued = successfulExchange();
        String access = issued.path("access_token").asText();
        String refresh = issued.path("refresh_token").asText();
        assertFalse(refresh.isBlank());
        assertEquals(CLIENT_ID, introspector.introspect(access).getAttribute("client_id"));
        assertEquals(200, mcp(access, null).statusCode());
        assertEquals(401, mcp(null, "MCP-session-is-not-client-authentication").statusCode());

        assertDenied(token(refreshForm(refresh), null, null));
        assertDenied(token(refreshForm(refresh), method(), "wrong-secret"));
        assertDenied(token(refreshForm(refresh), otherMethod(), SECRET));
        Map<String, String> copiedPublic = refreshForm(refresh);
        copiedPublic.put("client_id", ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID);
        assertDenied(token(copiedPublic, null, null));

        HttpResponse<String> renewed = token(refreshForm(refresh), method(), SECRET);
        assertEquals(200, renewed.statusCode());
        JsonNode renewal = JSON.readTree(renewed.body());
        String newRefresh = renewal.path("refresh_token").asText();
        assertFalse(newRefresh.isBlank());
        assertNotEquals(refresh, newRefresh);
        assertDenied(token(refreshForm(refresh), method(), SECRET));

        Map<String, String> revoke = new LinkedHashMap<>(Map.of("token", newRefresh, "token_type_hint", "refresh_token"));
        assertDenied(post(ClaudeV1Contract.INTERNAL_REVOKE_PATH, revoke, null, null));
        assertEquals(200, post(ClaudeV1Contract.INTERNAL_REVOKE_PATH, revoke, method(), SECRET).statusCode());
        assertEquals(401, mcp(renewal.path("access_token").asText(), "previous-session").statusCode());
        assertDenied(token(refreshForm(newRefresh), method(), SECRET));
    }

    @Test
    void copiedClientIdWrongSecretWrongMethodAndInvalidPkceCannotExchangeCodes() throws Exception {
        for (String attemptedMethod : new String[] {null, otherMethod()}) {
            assertDenied(token(codeForm(authorizeCode()), attemptedMethod, attemptedMethod == null ? null : SECRET));
        }
        assertDenied(token(codeForm(authorizeCode()), method(), "wrong-secret"));
        Map<String, String> badVerifier = codeForm(authorizeCode());
        badVerifier.put("code_verifier", "different-valid-length-verifier-that-cannot-match-0123456789");
        assertDenied(token(badVerifier, method(), SECRET));
        Map<String, String> badCallback = codeForm(authorizeCode());
        badCallback.put("redirect_uri", "https://attacker.example/callback");
        assertDenied(token(badCallback, method(), SECRET));
        Map<String, String> replay = codeForm(authorizeCode());
        assertEquals(200, token(replay, method(), SECRET).statusCode());
        assertDenied(token(replay, method(), SECRET));
    }

    @Test
    void authorizationRejectsPublicIdsLoopbackCallbacksUnknownScopesAndNonS256Pkce() throws Exception {
        for (String publicId : ClaudeV1Contract.ALLOWED_CIMD_CLIENT_IDS) {
            Map<String, String> parameters = authorizeForm();
            parameters.put("client_id", publicId);
            assertAuthorizationDenied(parameters);
        }
        for (Map.Entry<String, String> invalid : Map.of(
                "redirect_uri", "http://localhost:4567/callback", "scope", "skillpilot.read foreign.scope",
                "code_challenge_method", "plain").entrySet()) {
            Map<String, String> parameters = authorizeForm();
            parameters.put(invalid.getKey(), invalid.getValue());
            assertAuthorizationDenied(parameters);
        }
        Map<String, String> absent = authorizeForm();
        absent.remove("code_challenge");
        absent.remove("code_challenge_method");
        assertAuthorizationDenied(absent);
    }

    @Test
    void tokensPersistedBeforeCutoverCannotBeLaunderedThroughTheSameClientId() throws Exception {
        RegisteredClient client = clients.findByClientId(CLIENT_ID);
        Instant now = Instant.now();
        String access = "synthetic-old-access-" + UUID.randomUUID();
        String refresh = "synthetic-old-refresh-" + UUID.randomUUID();
        OAuth2Authorization old = OAuth2Authorization.withRegisteredClient(client)
                .principalName(ClaudeV1AppAuthenticationFilter.APP_SUBJECT_PREFIX + UUID.randomUUID())
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .attribute(ClaudeV1OAuth2AuthorizationService.PROVIDER_ATTRIBUTE, ClaudeV1Contract.PROVIDER_ID)
                .authorizedScopes(Set.of(ClaudeV1Contract.SCOPE_READ))
                .token(new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER, access, now, now.plusSeconds(3600),
                        Set.of(ClaudeV1Contract.SCOPE_READ)), metadata -> metadata.put(
                                OAuth2Authorization.Token.CLAIMS_METADATA_NAME,
                                new LinkedHashMap<>(Map.of("aud", new java.util.ArrayList<>(java.util.List.of(properties.getPublicMcpUrl())),
                                        "client_id", CLIENT_ID, "client_authentication_method", method()))))
                .refreshToken(new OAuth2RefreshToken(refresh, now, now.plusSeconds(86400)))
                .build();
        new JdbcOAuth2AuthorizationService(jdbc, new JdbcRegisteredClientRepository(jdbc)).save(old);
        assertNull(authorizations.findByToken(access, OAuth2TokenType.ACCESS_TOKEN));
        assertThrows(IllegalArgumentException.class, () -> authorizations.save(old));
        assertEquals(401, mcp(access, "old-established-session").statusCode());
        assertDenied(token(refreshForm(refresh), method(), SECRET));
    }

    private JsonNode successfulExchange() throws Exception {
        HttpResponse<String> response = token(codeForm(authorizeCode()), method(), SECRET);
        assertEquals(200, response.statusCode());
        return JSON.readTree(response.body());
    }

    private String authorizeCode() throws Exception {
        HttpResponse<String> response = send(request(ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH + "?" + form(authorizeForm())).GET().build());
        assertEquals(302, response.statusCode());
        URI callback = URI.create(response.headers().firstValue("Location").orElseThrow());
        assertEquals(ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK, callback.getScheme() + "://" + callback.getAuthority() + callback.getPath());
        for (String pair : callback.getRawQuery().split("&")) {
            if (pair.startsWith("code=")) {
                return URLDecoder.decode(pair.substring(5), StandardCharsets.UTF_8);
            }
        }
        fail("Authorization must return a code, never an OAuth error.");
        return null;
    }

    private Map<String, String> authorizeForm() throws Exception {
        return new LinkedHashMap<>(Map.of("response_type", "code", "client_id", CLIENT_ID,
                "redirect_uri", ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK,
                "scope", "skillpilot.read skillpilot.write offline_access", "state", UUID.randomUUID().toString(),
                "resource", properties.getPublicMcpUrl(), "code_challenge_method", "S256",
                "code_challenge", Base64.getUrlEncoder().withoutPadding().encodeToString(
                        MessageDigest.getInstance("SHA-256").digest(VERIFIER.getBytes(StandardCharsets.US_ASCII)))));
    }

    private Map<String, String> codeForm(String code) {
        return new LinkedHashMap<>(Map.of("grant_type", "authorization_code", "code", code, "code_verifier", VERIFIER,
                "redirect_uri", ClaudeV1Contract.HOSTED_CLAUDE_AUTH_CALLBACK, "resource", properties.getPublicMcpUrl()));
    }

    private Map<String, String> refreshForm(String refresh) {
        return new LinkedHashMap<>(Map.of("grant_type", "refresh_token", "refresh_token", refresh, "resource", properties.getPublicMcpUrl()));
    }

    private void assertAuthorizationDenied(Map<String, String> parameters) throws Exception {
        HttpResponse<String> response = send(request(ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH + "?" + form(parameters)).GET().build());
        assertTrue((response.statusCode() >= 400 && response.statusCode() < 500) || (response.statusCode() == 302
                && response.headers().firstValue("Location").orElse("").contains("error=")));
        assertFalse(response.headers().firstValue("Location").orElse("").contains("code="));
    }

    private HttpResponse<String> token(Map<String, String> parameters, String authMethod, String secret) throws Exception {
        return post(ClaudeV1Contract.INTERNAL_TOKEN_PATH, parameters, authMethod, secret);
    }

    private HttpResponse<String> post(String path, Map<String, String> parameters, String authMethod, String secret) throws Exception {
        Map<String, String> body = new LinkedHashMap<>(parameters);
        HttpRequest.Builder request = request(path).header("Content-Type", "application/x-www-form-urlencoded");
        if ("client_secret_basic".equals(authMethod)) {
            request.header("Authorization", "Basic " + Base64.getEncoder().encodeToString(
                    (CLIENT_ID + ":" + secret).getBytes(StandardCharsets.US_ASCII)));
        } else {
            body.putIfAbsent("client_id", CLIENT_ID);
            if ("client_secret_post".equals(authMethod)) {
                body.put("client_secret", secret);
            }
        }
        return send(request.POST(HttpRequest.BodyPublishers.ofString(form(body))).build());
    }

    private HttpResponse<String> mcp(String accessToken, String session) throws Exception {
        HttpRequest.Builder request = request(ClaudeV1Contract.INTERNAL_MCP_PATH)
                .header("Content-Type", "application/json").header("Accept", "application/json, text/event-stream");
        if (accessToken != null) request.header("Authorization", "Bearer " + accessToken);
        if (session != null) request.header("Mcp-Session-Id", session);
        return send(request.POST(HttpRequest.BodyPublishers.ofString("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}")).build());
    }

    private HttpRequest.Builder request(String path) {
        return HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path))
                .header("X-Forwarded-Host", "mcp-claude-v1.skillpilot.com").header("X-Forwarded-Proto", "https");
    }

    private HttpResponse<String> send(HttpRequest request) throws Exception {
        return http.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private String method() { return properties.getOauth().getClientAuthenticationMethod(); }
    private String otherMethod() { return "client_secret_basic".equals(method()) ? "client_secret_post" : "client_secret_basic"; }

    private static String form(Map<String, String> fields) {
        return fields.entrySet().stream().map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8)
                + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8)).collect(java.util.stream.Collectors.joining("&"));
    }

    private static void assertDenied(HttpResponse<String> response) {
        assertTrue(response.statusCode() >= 400 && response.statusCode() < 500);
    }
}
