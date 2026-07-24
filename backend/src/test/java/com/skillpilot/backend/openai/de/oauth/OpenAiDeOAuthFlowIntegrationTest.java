package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.openai.de.OpenAiDeConfiguration;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
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
import java.time.Instant;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.aop.support.AopUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.data.jpa.autoconfigure.DataJpaRepositoriesAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(
        classes = OpenAiDeOAuthFlowIntegrationTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:openai-de-oauth;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.liquibase.enabled=true",
        "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "skillpilot.openai.de.enabled=true",
        "skillpilot.openai.de.oauth.enabled=true",
        "skillpilot.openai.de.mcp.enabled=false",
        "skillpilot.openai.de.secure-cookie=false",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.openai.de.mcp-url=https://skillpilot.test/api/openai/de/mcp",
        "skillpilot.openai.de.oauth.client-id=chatgpt-test-client",
        "skillpilot.openai.de.oauth.redirect-uris=https://chatgpt.com/connector/oauth/test-callback",
        "skillpilot.openai.de.oauth.protected-resource-metadata=https://skillpilot.test/api/openai/de/oauth/protected-resource"
})
class OpenAiDeOAuthFlowIntegrationTest {

    private static final String SKILLPILOT_ID = "SP-SECRET-MUST-NOT-LEAK";
    private static final String CONNECTION_SUBJECT = "spod_test-opaque-subject";
    private static final String BINDING_GRANT = "spodb_browser-only-grant";
    private static final String BROWSER_SESSION = "spobs_browser-session";
    private static final String CLIENT_ID = "chatgpt-test-client";
    private static final String CALLBACK = "https://chatgpt.com/connector/oauth/test-callback";
    private static final String VERIFIER = "a-secure-pkce-verifier-with-more-than-forty-three-characters-123";

    @LocalServerPort
    private int port;

    @Autowired
    private OpenAiDeCoachConnectionService connectionService;

    @Autowired
    @Qualifier("openAiDeRegisteredClientRepository")
    private RegisteredClientRepository registeredClients;

    @Autowired
    @Qualifier("openAiDeOpaqueTokenIntrospector")
    private OpaqueTokenIntrospector tokenIntrospector;

    @Autowired
    @Qualifier("openAiDeAuthorizationService")
    private OAuth2AuthorizationService authorizationService;

    @Autowired
    private JdbcOperations jdbcOperations;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private HttpClient client;

    @BeforeEach
    void setUp() {
        reset(connectionService);
        when(connectionService.consumeBindingGrant(BINDING_GRANT, BROWSER_SESSION)).thenReturn(CONNECTION_SUBJECT);
        when(connectionService.resolveConnectedSkillpilotId(CONNECTION_SUBJECT)).thenReturn(SKILLPILOT_ID);
        CookieManager cookies = new CookieManager(null, CookiePolicy.ACCEPT_ALL);
        client = HttpClient.newBuilder()
                .cookieHandler(cookies)
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Test
    void publishesProviderMetadataAndCompletesPkceRefreshAndRevocation() throws Exception {
        JsonNode protectedResource = json(get(OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_METADATA_PATH));
        assertThat(protectedResource.path("resource").asText())
                .isEqualTo("https://skillpilot.test/api/openai/de/mcp");
        assertThat(protectedResource.path("authorization_servers").get(0).asText())
                .isEqualTo("https://skillpilot.test/api/openai/de");
        assertThat(protectedResource.path("scopes_supported"))
                .anySatisfy(scope -> assertThat(scope.asText()).isEqualTo(OpenAiDeOAuthConfiguration.READ_SCOPE))
                .anySatisfy(scope -> assertThat(scope.asText()).isEqualTo(OpenAiDeOAuthConfiguration.WRITE_SCOPE));

        JsonNode protectedResourceAlias = json(get(
                OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_WELL_KNOWN_PATH));
        assertThat(protectedResourceAlias).isEqualTo(protectedResource);

        JsonNode authorizationMetadata = json(get(
                OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH));
        assertThat(authorizationMetadata.path("issuer").asText())
                .isEqualTo("https://skillpilot.test/api/openai/de");
        assertThat(authorizationMetadata.path("authorization_endpoint").asText())
                .isEqualTo("https://skillpilot.test/api/openai/de/oauth2/authorize");
        assertThat(authorizationMetadata.path("token_endpoint").asText())
                .isEqualTo("https://skillpilot.test/api/openai/de/oauth2/token");
        assertThat(authorizationMetadata.path("client_id_metadata_document_supported").isMissingNode()).isTrue();
        assertThat(authorizationMetadata.path("registration_endpoint").isMissingNode()).isTrue();
        assertThat(authorizationMetadata.path("token_endpoint_auth_methods_supported"))
                .anySatisfy(method -> assertThat(method.asText()).isEqualTo("none"));
        assertThat(registeredClients.findByClientId(CLIENT_ID).getRedirectUris()).containsExactly(CALLBACK);

        HttpResponse<String> unauthorizedMcp = postJson("/api/openai/de/mcp", "{}", Map.of());
        assertThat(unauthorizedMcp.statusCode()).isEqualTo(401);
        assertThat(unauthorizedMcp.headers().firstValue(HttpHeaders.WWW_AUTHENTICATE))
                .hasValueSatisfying(value -> assertThat(value)
                        .contains("resource_metadata=\"https://skillpilot.test/api/openai/de/oauth/protected-resource\"")
                        .contains(OpenAiDeOAuthConfiguration.READ_SCOPE)
                        .contains(OpenAiDeOAuthConfiguration.WRITE_SCOPE));

        String externalState = "state-kept-by-chatgpt";
        String authorizePath = OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT + "?" + form(Map.ofEntries(
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

        HttpResponse<String> noResource = get(withoutQueryParameter(authorizePath, "resource"));
        assertThat(noResource.statusCode()).isEqualTo(400);
        assertThat(objectMapper.readTree(noResource.body()).path("error").asText()).isEqualTo("invalid_target");

        HttpResponse<String> trailingSlashResource = get(authorizePath.replace(
                encode("https://skillpilot.test/api/openai/de/mcp"),
                encode("https://skillpilot.test/api/openai/de/mcp/")));
        assertThat(trailingSlashResource.statusCode()).isEqualTo(400);
        assertThat(objectMapper.readTree(trailingSlashResource.body()).path("error").asText())
                .isEqualTo("invalid_target");

        HttpResponse<String> whitespaceResource = get(authorizePath.replace(
                encode("https://skillpilot.test/api/openai/de/mcp"),
                encode(" https://skillpilot.test/api/openai/de/mcp")));
        assertThat(whitespaceResource.statusCode()).isEqualTo(400);
        assertThat(objectMapper.readTree(whitespaceResource.body()).path("error").asText())
                .isEqualTo("invalid_target");

        HttpResponse<String> authorize = get(authorizePath, Map.of(
                HttpHeaders.COOKIE,
                OpenAiDeCoachConnectionService.BINDING_COOKIE_NAME + "=" + BINDING_GRANT
                        + "; " + OpenAiDeCoachConnectionService.BROWSER_SESSION_COOKIE_NAME
                        + "=" + BROWSER_SESSION));
        assertThat(authorize.statusCode()).isEqualTo(302);
        URI consentUri = URI.create(authorize.headers().firstValue(HttpHeaders.LOCATION).orElseThrow());
        assertThat(consentUri.getPath()).isEqualTo(OpenAiDeOAuthConfiguration.CONSENT_ENDPOINT);
        String consentState = parseQuery(consentUri.getRawQuery()).get("state");
        assertThat(consentState).isNotBlank();
        verify(connectionService).consumeBindingGrant(BINDING_GRANT, BROWSER_SESSION);

        HttpResponse<String> consent = get(consentUri.toString());
        assertThat(consent.statusCode()).isEqualTo(200);
        assertThat(consent.body())
                .contains("ChatGPT mit SkillPilot verbinden")
                .contains(OpenAiDeOAuthConfiguration.READ_SCOPE)
                .doesNotContain(SKILLPILOT_ID)
                .doesNotContain(BINDING_GRANT);

        HttpResponse<String> approval = postForm(OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT, List.of(
                Map.entry("client_id", CLIENT_ID),
                Map.entry("state", consentState),
                Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE),
                Map.entry("scope", OpenAiDeOAuthConfiguration.WRITE_SCOPE),
                Map.entry("scope", OpenAiDeOAuthConfiguration.OFFLINE_SCOPE)));
        assertThat(approval.statusCode()).isEqualTo(302);
        URI callback = URI.create(approval.headers().firstValue(HttpHeaders.LOCATION).orElseThrow());
        assertThat(callback.getScheme() + "://" + callback.getHost() + callback.getPath()).isEqualTo(CALLBACK);
        Map<String, String> callbackQuery = parseQuery(callback.getRawQuery());
        assertThat(callbackQuery.get("state")).isEqualTo(externalState);

        HttpResponse<String> token = postForm(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, List.of(
                Map.entry("grant_type", "authorization_code"),
                Map.entry("client_id", CLIENT_ID),
                Map.entry("redirect_uri", CALLBACK),
                Map.entry("code", callbackQuery.get("code")),
                Map.entry("code_verifier", VERIFIER),
                Map.entry("resource", "https://skillpilot.test/api/openai/de/mcp")));
        assertThat(token.statusCode()).withFailMessage(token.body()).isEqualTo(200);
        assertThat(token.body()).doesNotContain(SKILLPILOT_ID).doesNotContain(CONNECTION_SUBJECT);
        JsonNode tokenBody = objectMapper.readTree(token.body());
        String refreshToken = tokenBody.path("refresh_token").asText();
        assertThat(tokenBody.path("access_token").asText()).isNotBlank();
        assertThat(refreshToken).isNotBlank();
        verify(connectionService, atLeastOnce()).markOAuthConnected(
                org.mockito.ArgumentMatchers.eq(CONNECTION_SUBJECT),
                org.mockito.ArgumentMatchers.any(Instant.class));

        HttpResponse<String> refresh = postForm(OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT, List.of(
                Map.entry("grant_type", "refresh_token"),
                Map.entry("client_id", CLIENT_ID),
                Map.entry("refresh_token", refreshToken),
                Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE),
                Map.entry("resource", "https://skillpilot.test/api/openai/de/mcp")));
        assertThat(refresh.statusCode()).withFailMessage(refresh.body()).isEqualTo(200);
        JsonNode refreshBody = objectMapper.readTree(refresh.body());
        String downscopedAccessToken = refreshBody.path("access_token").asText();
        String rotatedRefreshToken = refreshBody.path("refresh_token").asText();
        assertThat(refreshBody.path("scope").asText()).isEqualTo(OpenAiDeOAuthConfiguration.READ_SCOPE);
        assertThat(rotatedRefreshToken).isNotBlank().isNotEqualTo(refreshToken);
        verify(connectionService, never()).revokeConnectionSubject(CONNECTION_SUBJECT);
        var downscopedPrincipal = tokenIntrospector.introspect(downscopedAccessToken);
        assertThat(downscopedPrincipal.getAuthorities())
                .extracting(GrantedAuthority::getAuthority)
                .containsExactly("SCOPE_" + OpenAiDeOAuthConfiguration.READ_SCOPE);
        assertThat(downscopedPrincipal.<Set<String>>getAttribute("scope"))
                .containsExactly(OpenAiDeOAuthConfiguration.READ_SCOPE);
        assertThat(downscopedPrincipal.<List<String>>getAttribute("aud"))
                .containsExactly("https://skillpilot.test/api/openai/de/mcp");

        HttpResponse<String> revocation = postForm(OpenAiDeOAuthConfiguration.REVOCATION_ENDPOINT, List.of(
                Map.entry("client_id", CLIENT_ID),
                Map.entry("token", rotatedRefreshToken),
                Map.entry("token_type_hint", "refresh_token")));
        assertThat(revocation.statusCode()).withFailMessage(revocation.body()).isEqualTo(200);
        verify(connectionService).revokeConnectionSubject(CONNECTION_SUBJECT);
    }

    @Test
    void unauthenticatedAuthorizationRedirectsToConnectStartRegardlessOfAcceptHeader() throws Exception {
        String authorizePath = OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT + "?" + form(Map.ofEntries(
                Map.entry("response_type", "code"),
                Map.entry("client_id", CLIENT_ID),
                Map.entry("redirect_uri", CALLBACK),
                Map.entry("scope", OpenAiDeOAuthConfiguration.READ_SCOPE),
                Map.entry("state", "accept-header-test"),
                Map.entry("code_challenge", challenge(VERIFIER)),
                Map.entry("code_challenge_method", "S256"),
                Map.entry("resource", "https://skillpilot.test/api/openai/de/mcp")));

        for (String accept : List.of("application/json", "text/html", "*/*")) {
            HttpResponse<String> response = get(authorizePath, Map.of(HttpHeaders.ACCEPT, accept));

            assertThat(response.statusCode()).as("Accept %s", accept).isEqualTo(302);
            assertThat(response.headers().firstValue(HttpHeaders.LOCATION))
                    .as("Accept %s", accept)
                    .hasValueSatisfying(location -> assertThat(location)
                            .endsWith(OpenAiDeOAuthConfiguration.CONNECT_REQUIRED_ENDPOINT));
        }
        verify(connectionService, never()).consumeBindingGrant(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void accessTokenAndConnectionActivationRollbackTogetherWhenInitialIntentApplyFails() {
        String suffix = java.util.UUID.randomUUID().toString();
        String learnerId = "rollback-learner-" + suffix;
        String connectionSubject = "spod_rollback-" + suffix;
        String authorizationId = "rollback-authorization-" + suffix;
        String accessTokenValue = "rollback-access-token-" + suffix;
        jdbcOperations.update(
                "INSERT INTO learner (skillpilot_id, created_at) VALUES (?, CURRENT_TIMESTAMP)",
                learnerId);
        jdbcOperations.update(
                "INSERT INTO openai_de_connection "
                        + "(subject, learner_skillpilot_id, created_at, last_authorized_at) "
                        + "VALUES (?, ?, CURRENT_TIMESTAMP, NULL)",
                connectionSubject,
                learnerId);
        doAnswer(invocation -> {
            jdbcOperations.update(
                    "UPDATE openai_de_connection SET last_authorized_at = CURRENT_TIMESTAMP WHERE subject = ?",
                    connectionSubject);
            throw new IllegalStateException("synthetic initial intent apply failure");
        }).when(connectionService).markOAuthConnected(
                org.mockito.ArgumentMatchers.eq(connectionSubject),
                org.mockito.ArgumentMatchers.any(Instant.class));

        var registeredClient = registeredClients.findByClientId(CLIENT_ID);
        Instant issuedAt = Instant.now();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                accessTokenValue,
                issuedAt,
                issuedAt.plusSeconds(300),
                Set.of(OpenAiDeOAuthConfiguration.READ_SCOPE));
        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(registeredClient)
                .id(authorizationId)
                .principalName(connectionSubject)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizedScopes(Set.of(OpenAiDeOAuthConfiguration.READ_SCOPE))
                .accessToken(accessToken)
                .build();

        assertThat(AopUtils.isAopProxy(authorizationService)).isTrue();
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> authorizationService.save(authorization))
                .withMessageContaining("synthetic initial intent apply failure");

        assertThat(jdbcOperations.queryForObject(
                "SELECT COUNT(*) FROM oauth2_authorization WHERE id = ?",
                Integer.class,
                authorizationId)).isZero();
        assertThat(jdbcOperations.queryForObject(
                "SELECT last_authorized_at FROM openai_de_connection WHERE subject = ?",
                java.sql.Timestamp.class,
                connectionSubject)).isNull();
        verify(connectionService).markOAuthConnected(
                org.mockito.ArgumentMatchers.eq(connectionSubject),
                org.mockito.ArgumentMatchers.any(Instant.class));
    }

    private JsonNode json(HttpResponse<String> response) throws Exception {
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(200);
        return objectMapper.readTree(response.body());
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
            URI external = URI.create(path);
            String local = external.getRawPath() + (external.getRawQuery() == null ? "" : "?" + external.getRawQuery());
            return URI.create("http://127.0.0.1:" + port + local);
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
    @Import({
            OpenAiDeConfiguration.class,
            OpenAiDeOAuthConfiguration.class,
            OpenAiDeOAuthMetadataController.class
    })
    static class TestApplication {

        @Bean
        OpenAiDeCoachConnectionService openAiDeCoachConnectionService() {
            return Mockito.mock(OpenAiDeCoachConnectionService.class);
        }

        @Bean
        OpenAiDeOperationalTelemetry openAiDeOperationalTelemetry() {
            return new OpenAiDeOperationalTelemetry(new SimpleMeterRegistry());
        }

        @Bean
        @Order(10)
        SecurityFilterChain publicTestEndpoints(HttpSecurity http) throws Exception {
            return http
                    .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll())
                    .csrf(csrf -> csrf.disable())
                    .build();
        }
    }
}
