package com.skillpilot.backend.claude.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
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
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.data.jpa.autoconfigure.DataJpaRepositoriesAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(
        classes = ClaudeOAuthFlowIntegrationTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:claude-oauth;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.liquibase.enabled=true",
        "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "skillpilot.claude.enabled=true",
        "skillpilot.claude.mcp.enabled=false",
        "skillpilot.claude.secure-cookie=false",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.claude.mcp-url=https://skillpilot.test/api/claude/mcp",
        "skillpilot.claude.oauth.protected-resource-metadata=https://skillpilot.test/api/claude/oauth/protected-resource"
})
class ClaudeOAuthFlowIntegrationTest {

    private static final String SKILLPILOT_ID = "SP-SECRET-MUST-NOT-LEAK";
    private static final String CONNECTION_SUBJECT = "spc_test-opaque-subject";
    private static final String BINDING_GRANT = "spcb_browser-only-grant";
    private static final String VERIFIER = "a-secure-pkce-verifier-with-more-than-forty-three-characters-123";

    @LocalServerPort
    private int port;

    @Autowired
    private ClaudeCoachConnectionService connectionService;

    @Autowired
    private RegisteredClientRepository registeredClientRepository;

    @Autowired
    @Qualifier("claudeOpaqueTokenIntrospector")
    private OpaqueTokenIntrospector tokenIntrospector;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private HttpClient client;

    @BeforeEach
    void setUp() {
        reset(connectionService);
        when(connectionService.consumeBindingGrant(BINDING_GRANT)).thenReturn(CONNECTION_SUBJECT);
        when(connectionService.resolveSkillpilotId(CONNECTION_SUBJECT)).thenReturn(SKILLPILOT_ID);
        CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        client = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Test
    void publishesDiscoveryAndCompletesPkceConsentAndRefreshWithoutLeakingLearnerId() throws Exception {
        HttpResponse<String> protectedResource = get("/api/claude/oauth/protected-resource");
        assertThat(protectedResource.statusCode()).isEqualTo(200);
        JsonNode resourceMetadata = objectMapper.readTree(protectedResource.body());
        assertThat(resourceMetadata.path("resource").asText())
                .isEqualTo("https://skillpilot.test/api/claude/mcp");
        assertThat(resourceMetadata.path("authorization_servers").get(0).asText())
                .isEqualTo("https://skillpilot.test");
        assertThat(resourceMetadata.path("scopes_supported"))
                .noneSatisfy(scope -> assertThat(scope.asText())
                        .isEqualTo(ClaudeOAuthConfiguration.OFFLINE_SCOPE));

        HttpResponse<String> authorizationMetadata = get("/.well-known/oauth-authorization-server");
        assertThat(authorizationMetadata.statusCode()).isEqualTo(200);
        JsonNode metadata = objectMapper.readTree(authorizationMetadata.body());
        assertThat(metadata.path("issuer").asText()).isEqualTo("https://skillpilot.test");
        assertThat(metadata.path("client_id_metadata_document_supported").asBoolean()).isTrue();
        assertThat(metadata.path("token_endpoint_auth_methods_supported"))
                .as(metadata.toPrettyString())
                .anySatisfy(method -> assertThat(method.asText()).isEqualTo("none"));
        assertThat(metadata.path("code_challenge_methods_supported"))
                .as(metadata.toPrettyString())
                .anySatisfy(method -> assertThat(method.asText()).isEqualTo("S256"));
        assertThat(registeredClientRepository
                        .findByClientId(ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID)
                        .getRedirectUris())
                .contains(
                        ClaudeOAuthConfiguration.CLAUDE_CALLBACK,
                        ClaudeOAuthConfiguration.CLAUDE_DOT_COM_CALLBACK);

        HttpResponse<String> unauthorizedMcp = postJson("/api/claude/mcp", "{}", Map.of());
        assertThat(unauthorizedMcp.statusCode()).isEqualTo(401);
        assertThat(unauthorizedMcp.headers().firstValue(HttpHeaders.WWW_AUTHENTICATE))
                .hasValueSatisfying(value -> assertThat(value)
                        .contains("resource_metadata=\"https://skillpilot.test/api/claude/oauth/protected-resource\"")
                        .contains("skillpilot.read")
                        .contains("skillpilot.write"));

        String state = "state-kept-by-client";
        String authorizePath = "/oauth2/authorize?" + form(Map.ofEntries(
                Map.entry("response_type", "code"),
                Map.entry("client_id", ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID),
                Map.entry("redirect_uri", ClaudeOAuthConfiguration.CLAUDE_CALLBACK),
                Map.entry("scope", String.join(" ", List.of(
                        ClaudeOAuthConfiguration.READ_SCOPE,
                        ClaudeOAuthConfiguration.WRITE_SCOPE,
                        ClaudeOAuthConfiguration.OFFLINE_SCOPE))),
                Map.entry("state", state),
                Map.entry("code_challenge", challenge(VERIFIER)),
                Map.entry("code_challenge_method", "S256"),
                Map.entry("resource", "https://skillpilot.test/api/claude/mcp")));

        HttpResponse<String> missingAuthorizationResource = get(
                withoutQueryParameter(authorizePath, "resource"));
        assertThat(missingAuthorizationResource.statusCode()).isEqualTo(400);
        assertThat(objectMapper.readTree(missingAuthorizationResource.body()).path("error").asText())
                .isEqualTo("invalid_target");

        HttpResponse<String> missingTokenResource = postForm("/oauth2/token", List.of(
                Map.entry("grant_type", "refresh_token"),
                Map.entry("client_id", ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID),
                Map.entry("refresh_token", "not-a-token")));
        assertThat(missingTokenResource.statusCode()).isEqualTo(400);
        assertThat(objectMapper.readTree(missingTokenResource.body()).path("error").asText())
                .isEqualTo("invalid_target");

        HttpResponse<String> authorize = get(authorizePath, Map.of(
                HttpHeaders.COOKIE,
                ClaudeCoachConnectionService.BINDING_COOKIE_NAME + "=" + BINDING_GRANT));
        assertThat(authorize.statusCode()).isEqualTo(302);
        String consentLocation = authorize.headers().firstValue(HttpHeaders.LOCATION).orElseThrow();
        URI consentUri = URI.create(consentLocation);
        assertThat(consentUri.getPath()).isEqualTo("/api/claude/oauth/consent");
        String consentState = parseQuery(consentUri.getRawQuery()).get("state");
        assertThat(consentState).isNotBlank();
        verify(connectionService).consumeBindingGrant(BINDING_GRANT);

        HttpResponse<String> consent = get(consentLocation);
        assertThat(consent.statusCode()).isEqualTo(200);
        assertThat(consent.body())
                .contains("Claude mit SkillPilot verbinden")
                .contains("skillpilot.read")
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain(BINDING_GRANT);

        HttpResponse<String> approval = postForm("/oauth2/authorize", List.of(
                Map.entry("client_id", ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID),
                Map.entry("state", consentState),
                Map.entry("scope", ClaudeOAuthConfiguration.READ_SCOPE),
                Map.entry("scope", ClaudeOAuthConfiguration.WRITE_SCOPE),
                Map.entry("scope", ClaudeOAuthConfiguration.OFFLINE_SCOPE)));
        assertThat(approval.statusCode()).isEqualTo(302);
        URI callback = URI.create(approval.headers().firstValue(HttpHeaders.LOCATION).orElseThrow());
        assertThat(callback.getScheme() + "://" + callback.getHost() + callback.getPath())
                .isEqualTo(ClaudeOAuthConfiguration.CLAUDE_CALLBACK);
        Map<String, String> callbackQuery = parseQuery(callback.getRawQuery());
        assertThat(callbackQuery.get("state")).isEqualTo(state);
        String code = callbackQuery.get("code");
        assertThat(code).isNotBlank();

        HttpResponse<String> token = postForm("/oauth2/token", List.of(
                Map.entry("grant_type", "authorization_code"),
                Map.entry("client_id", ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID),
                Map.entry("redirect_uri", ClaudeOAuthConfiguration.CLAUDE_CALLBACK),
                Map.entry("code", code),
                Map.entry("code_verifier", VERIFIER),
                Map.entry("resource", "https://skillpilot.test/api/claude/mcp")));
        assertThat(token.statusCode()).isEqualTo(200);
        assertThat(token.body()).doesNotContain(SKILLPILOT_ID).doesNotContain(CONNECTION_SUBJECT);
        JsonNode tokenBody = objectMapper.readTree(token.body());
        assertThat(tokenBody.path("token_type").asText()).isEqualToIgnoringCase("Bearer");
        assertThat(tokenBody.path("access_token").asText()).isNotBlank();
        String refreshToken = tokenBody.path("refresh_token").asText();
        assertThat(refreshToken).isNotBlank();
        verify(connectionService, atLeastOnce()).markOAuthConnected(CONNECTION_SUBJECT);

        HttpResponse<String> refresh = postForm("/oauth2/token", List.of(
                Map.entry("grant_type", "refresh_token"),
                Map.entry("client_id", ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID),
                Map.entry("refresh_token", refreshToken),
                Map.entry("scope", ClaudeOAuthConfiguration.READ_SCOPE),
                Map.entry("resource", "https://skillpilot.test/api/claude/mcp")));
        assertThat(refresh.statusCode())
                .withFailMessage("Refresh response: %s", refresh.body())
                .isEqualTo(200);
        JsonNode refreshBody = objectMapper.readTree(refresh.body());
        String downscopedAccessToken = refreshBody.path("access_token").asText();
        assertThat(downscopedAccessToken).isNotBlank();
        assertThat(refreshBody.path("scope").asText()).isEqualTo(ClaudeOAuthConfiguration.READ_SCOPE);
        String rotatedRefreshToken = refreshBody.path("refresh_token").asText();
        assertThat(rotatedRefreshToken).isNotBlank().isNotEqualTo(refreshToken);
        assertThat(refresh.body()).doesNotContain(SKILLPILOT_ID).doesNotContain(CONNECTION_SUBJECT);
        var downscopedPrincipal = tokenIntrospector.introspect(downscopedAccessToken);
        assertThat(downscopedPrincipal.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("SCOPE_" + ClaudeOAuthConfiguration.READ_SCOPE);
        assertThat(downscopedPrincipal.<Set<String>>getAttribute("scope"))
                .containsExactly(ClaudeOAuthConfiguration.READ_SCOPE);

        HttpResponse<String> reusedRefresh = postForm("/oauth2/token", List.of(
                Map.entry("grant_type", "refresh_token"),
                Map.entry("client_id", ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID),
                Map.entry("refresh_token", refreshToken),
                Map.entry("resource", "https://skillpilot.test/api/claude/mcp")));
        assertThat(reusedRefresh.statusCode()).isEqualTo(400);
        assertThat(objectMapper.readTree(reusedRefresh.body()).path("error").asText())
                .isEqualTo("invalid_grant");

        HttpResponse<String> revocation = postForm("/oauth2/revoke", List.of(
                Map.entry("client_id", ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID),
                Map.entry("token", rotatedRefreshToken),
                Map.entry("token_type_hint", "refresh_token")));
        assertThat(revocation.statusCode())
                .withFailMessage("Revocation response: %s", revocation.body())
                .isEqualTo(200);

        HttpResponse<String> revokedRefresh = postForm("/oauth2/token", List.of(
                Map.entry("grant_type", "refresh_token"),
                Map.entry("client_id", ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID),
                Map.entry("refresh_token", rotatedRefreshToken),
                Map.entry("resource", "https://skillpilot.test/api/claude/mcp")));
        assertThat(revokedRefresh.statusCode()).isEqualTo(400);
        assertThat(objectMapper.readTree(revokedRefresh.body()).path("error").asText())
                .isEqualTo("invalid_grant");
    }

    private HttpResponse<String> get(String path) throws Exception {
        return get(path, Map.of());
    }

    private HttpResponse<String> get(String path, Map<String, String> headers) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(localUri(path)).GET();
        headers.forEach(request::header);
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postJson(String path, String body, Map<String, String> headers) throws Exception {
        HttpRequest.Builder request = HttpRequest.newBuilder(localUri(path))
                .header(HttpHeaders.CONTENT_TYPE, "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body));
        headers.forEach(request::header);
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postForm(String path, List<Map.Entry<String, String>> entries) throws Exception {
        String body = entries.stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
        HttpRequest request = HttpRequest.newBuilder(localUri(path))
                .header(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private URI localUri(String path) {
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return URI.create(path);
        }
        return URI.create("http://127.0.0.1:" + port + path);
    }

    private String form(Map<String, String> values) {
        return values.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String withoutQueryParameter(String path, String parameter) {
        int queryStart = path.indexOf('?');
        if (queryStart < 0) {
            return path;
        }
        String encodedPrefix = encode(parameter) + "=";
        String filteredQuery = java.util.Arrays.stream(path.substring(queryStart + 1).split("&"))
                .filter(pair -> !pair.startsWith(encodedPrefix))
                .collect(Collectors.joining("&"));
        return path.substring(0, queryStart + 1) + filteredQuery;
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

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            HibernateJpaAutoConfiguration.class,
            DataJpaRepositoriesAutoConfiguration.class,
            OAuth2ClientAutoConfiguration.class
    })
    @Import({ClaudeOAuthConfiguration.class, ClaudeOAuthMetadataController.class})
    static class TestApplication {

        @Bean
        ClaudeCoachConnectionService claudeCoachConnectionService() {
            return Mockito.mock(ClaudeCoachConnectionService.class);
        }

        @Bean
        @Order(3)
        SecurityFilterChain publicTestEndpoints(HttpSecurity http) throws Exception {
            return http
                    .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll())
                    .csrf(csrf -> csrf.disable())
                    .build();
        }
    }
}
