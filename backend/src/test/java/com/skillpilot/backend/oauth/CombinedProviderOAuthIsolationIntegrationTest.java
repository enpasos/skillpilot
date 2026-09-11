package com.skillpilot.backend.oauth;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthConfiguration;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeSecureOAuthTestServer;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;

/** Real simultaneous V1 HTTP/security chains. The retired Claude beta lane stays disabled. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED, ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET, ClaudeV1TestProperties.BETA_DISABLED,
        "spring.datasource.url=jdbc:h2:mem:combined-current-oauth;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE",
        "skillpilot.openai.coach.v1.enabled=true",
        "skillpilot.openai.coach.v1.server-build=test-build",
        "skillpilot.openai.coach.v1.oauth.enabled=true",
        "skillpilot.openai.coach.v1.oauth.redirect-uris=https://chatgpt.com/connector/oauth/combined-test-callback",
        "skillpilot.openai.coach.v1.mcp.enabled=true",
        "skillpilot.openai.coach.v1.mtls-edge-mode=disabled"
})
class CombinedProviderOAuthIsolationIntegrationTest {
    private static final String OPENAI_RESOURCE = "https://mcp-coach-v1.skillpilot.com/mcp";
    private static final String CLAUDE_RESOURCE = ClaudeV1Contract.DEFAULT_PUBLIC_MCP_URL;
    private static final ObjectMapper JSON = new ObjectMapper();
    @LocalServerPort private int port;
    @Autowired @Qualifier("openAiDeRegisteredClientRepository") private RegisteredClientRepository openAiClients;
    @Autowired @Qualifier("claudeV1RegisteredClientRepository") private RegisteredClientRepository claudeClients;
    @Autowired @Qualifier("openAiDeAuthorizationService") private OAuth2AuthorizationService openAiAuthorizations;
    @Autowired @Qualifier("claudeV1AuthorizationService") private OAuth2AuthorizationService claudeAuthorizations;
    @Autowired @Qualifier("openAiDeOpaqueTokenIntrospector") private OpaqueTokenIntrospector openAiIntrospector;
    @Autowired @Qualifier("claudeV1OpaqueTokenIntrospector") private OpaqueTokenIntrospector claudeIntrospector;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    @DynamicPropertySource static void secureProperties(DynamicPropertyRegistry registry) {
        OpenAiDeSecureOAuthTestServer.registerConfidentialSecureProperties(registry);
    }

    @Test
    void validTokensReachOnlyTheirRealMcpCatalogAndKeepTheirActualProfile() throws Exception {
        var openAi = issueOpenAi();
        var claude = issueClaude();
        assertThat(openAiIntrospector.introspect(openAi.access()).<String>getAttribute("client_profile"))
                .isEqualTo("chatgpt-basic-transition");
        assertThat(claudeIntrospector.introspect(claude.access()).<String>getAttribute("client_profile"))
                .isEqualTo("claude-cimd-public");
        assertThat(claudeIntrospector.introspect(claude.access()).<String>getAttribute("client_authentication_method"))
                .isEqualTo("none");
        assertCatalog("/internal/openai/v1/mcp", openAi.access());
        assertCatalog(ClaudeV1Contract.INTERNAL_MCP_PATH, claude.access());
        assertThat(mcp("/internal/openai/v1/mcp", claude.access()).statusCode()).isEqualTo(401);
        assertThat(mcp(ClaudeV1Contract.INTERNAL_MCP_PATH, openAi.access()).statusCode()).isEqualTo(401);
        assertThat(claudeClients.findByClientId(OpenAiDeSecureOAuthTestServer.confidentialClientId())).isNull();
        assertThat(openAiClients.findByClientId(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID)).isNull();
    }

    @Test
    void foreignRefreshAndRevocationCannotTouchAnotherProvidersTokens() throws Exception {
        var openAi = issueOpenAi();
        var claude = issueClaude();
        assertInvalidGrant(form(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, Map.of(
                "grant_type", "refresh_token", "refresh_token", claude.refresh(), "resource", OPENAI_RESOURCE), true));
        assertInvalidGrant(form(ClaudeV1Contract.INTERNAL_TOKEN_PATH, Map.of(
                "grant_type", "refresh_token", "client_id", ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                "refresh_token", openAi.refresh(), "resource", CLAUDE_RESOURCE), false));
        assertThat(form(OpenAiDeOAuthConfiguration.REVOCATION_ENDPOINT, Map.of(
                "token", claude.refresh(), "token_type_hint", "refresh_token"), true).statusCode()).isEqualTo(200);
        assertThat(form(ClaudeV1Contract.INTERNAL_REVOKE_PATH, Map.of(
                "client_id", ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID,
                "token", openAi.refresh(), "token_type_hint", "refresh_token"), false).statusCode()).isEqualTo(200);
        assertThat(openAiAuthorizations.findByToken(openAi.refresh(), OAuth2TokenType.REFRESH_TOKEN)).isNotNull();
        assertThat(claudeAuthorizations.findByToken(claude.refresh(), OAuth2TokenType.REFRESH_TOKEN)).isNotNull();
        assertCatalog("/internal/openai/v1/mcp", openAi.access());
        assertCatalog(ClaudeV1Contract.INTERNAL_MCP_PATH, claude.access());
    }

    private IssuedTokens issueOpenAi() {
        return issue(openAiAuthorizations, openAiClients.findByClientId(OpenAiDeSecureOAuthTestServer.confidentialClientId()),
                "synthetic-openai-app", OPENAI_RESOURCE);
    }

    private IssuedTokens issueClaude() {
        return issue(claudeAuthorizations, claudeClients.findByClientId(ClaudeV1Contract.CIMD_HOSTED_CLAUDE_CLIENT_ID),
                "spca_synthetic-claude-app", CLAUDE_RESOURCE);
    }

    private IssuedTokens issue(OAuth2AuthorizationService service, RegisteredClient client, String subject, String resource) {
        assertThat(client).isNotNull();
        String id = UUID.randomUUID().toString();
        var request = OAuth2AuthorizationRequest.authorizationCode()
                .authorizationUri("https://skillpilot.com/synthetic-authorize")
                .clientId(client.getClientId()).redirectUri(client.getRedirectUris().iterator().next())
                .scopes(client.getScopes()).additionalParameters(Map.of("resource", resource)).build();
        // Seed through the real profile wrapper BEFORE issuing synthetic tokens. Issuance itself
        // is covered by the separate complete HTTP OAuth suites, not claimed by this fixture.
        var authorization = OAuth2Authorization.withRegisteredClient(client).id(id).principalName(subject)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE).authorizedScopes(client.getScopes())
                .attribute(Principal.class.getName(), UsernamePasswordAuthenticationToken.authenticated(subject, null, List.of()))
                .attribute(OAuth2AuthorizationRequest.class.getName(), request).build();
        service.save(authorization);
        var now = Instant.now();
        var access = new OAuth2AccessToken(OAuth2AccessToken.TokenType.BEARER,
                "synthetic-access-" + id, now, now.plusSeconds(3600), client.getScopes());
        var refresh = new OAuth2RefreshToken("synthetic-refresh-" + id, now, now.plus(Duration.ofDays(1)));
        var claims = new java.util.LinkedHashMap<String, Object>();
        claims.put("aud", new ArrayList<>(List.of(resource)));
        claims.put("client_id", client.getClientId());
        claims.put("client_authentication_method", client.getClientAuthenticationMethods().iterator().next().getValue());
        service.save(OAuth2Authorization.from(service.findById(id))
                .token(access, metadata -> metadata.put(OAuth2Authorization.Token.CLAIMS_METADATA_NAME, claims))
                .refreshToken(refresh).build());
        return new IssuedTokens(access.getTokenValue(), refresh.getTokenValue());
    }

    private void assertCatalog(String path, String access) throws Exception {
        var response = mcp(path, access);
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(200);
        var tools = JSON.readTree(response.body()).path("result").path("tools");
        assertThat(tools.isArray()).isTrue();
        assertThat(tools.valueStream().map(tool -> tool.path("name").asText()).toList())
                .contains(path.equals(ClaudeV1Contract.INTERNAL_MCP_PATH)
                        ? ClaudeV1Contract.TOOL_GET_COACH_CONTEXT : "get_skillpilot_context");
    }

    private HttpResponse<String> mcp(String path, String token) throws Exception {
        return http.send(request(path).header("Authorization", "Bearer " + token)
                .header("Content-Type", "application/json").header("Accept", "application/json, text/event-stream")
                .header("MCP-Protocol-Version", "2025-11-25")
                .POST(HttpRequest.BodyPublishers.ofString("{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\",\"params\":{}}"))
                .build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> form(String path, Map<String, String> fields, boolean basic) throws Exception {
        String body = fields.entrySet().stream().map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
        var request = request(path).header("Content-Type", "application/x-www-form-urlencoded");
        if (basic) request.header("Authorization", OpenAiDeSecureOAuthTestServer.confidentialBasicAuthorization());
        return http.send(request.POST(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpRequest.Builder request(String path) {
        var request = HttpRequest.newBuilder(URI.create("http://127.0.0.1:" + port + path)).timeout(Duration.ofSeconds(15));
        if (path.startsWith(ClaudeV1Contract.INTERNAL_BASE_PATH)) {
            request.header("X-Forwarded-Host", "mcp-claude-v1.skillpilot.com").header("X-Forwarded-Proto", "https");
        }
        return request;
    }

    private static String encode(String value) { return URLEncoder.encode(value, StandardCharsets.UTF_8); }
    private static void assertInvalidGrant(HttpResponse<String> response) throws Exception {
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(400);
        assertThat(JSON.readTree(response.body()).path("error").asText()).isEqualTo("invalid_grant");
    }
    private record IssuedTokens(String access, String refresh) {}
}
