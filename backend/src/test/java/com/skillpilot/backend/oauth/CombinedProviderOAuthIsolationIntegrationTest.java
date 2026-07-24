package com.skillpilot.backend.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.claude.mcp.ClaudeMcpServerConfiguration;
import com.skillpilot.backend.claude.oauth.ClaudeOAuthConfiguration;
import com.skillpilot.backend.mcp.SkillPilotStatelessMcpServerFactory;
import com.skillpilot.backend.openai.de.OpenAiDeConfiguration;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthConfiguration;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachMcpContract;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeMcpServerConfiguration;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.Principal;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
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
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2RefreshToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.test.context.TestPropertySource;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest(
        classes = CombinedProviderOAuthIsolationIntegrationTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:combined-provider-oauth;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.liquibase.enabled=true",
        "spring.liquibase.change-log=classpath:db/changelog/db.changelog-master.yaml",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.claude.enabled=true",
        "skillpilot.claude.mcp.enabled=true",
        "skillpilot.claude.secure-cookie=false",
        "skillpilot.claude.mcp-url=https://skillpilot.test/api/claude/mcp",
        "skillpilot.claude.oauth.protected-resource-metadata=https://skillpilot.test/api/claude/oauth/protected-resource",
        "skillpilot.openai.de.enabled=true",
        "skillpilot.openai.de.oauth.enabled=true",
        "skillpilot.openai.de.mcp.enabled=true",
        "skillpilot.openai.de.secure-cookie=false",
        "skillpilot.openai.de.mcp-url=https://skillpilot.test/api/openai/de/mcp",
        "skillpilot.openai.de.oauth.client-id=chatgpt-combined-test-client",
        "skillpilot.openai.de.oauth.redirect-uris=https://chatgpt.com/connector/oauth/combined-test-callback",
        "skillpilot.openai.de.oauth.protected-resource-metadata=https://skillpilot.test/api/openai/de/oauth/protected-resource"
})
class CombinedProviderOAuthIsolationIntegrationTest {

    private static final String OPENAI_CLIENT_ID = "chatgpt-combined-test-client";
    private static final String OPENAI_SUBJECT = "openai-combined-subject";
    private static final String CLAUDE_SUBJECT = "claude-combined-subject";

    @LocalServerPort
    private int port;

    @Autowired
    @Qualifier("openAiDeRegisteredClientRepository")
    private RegisteredClientRepository openAiClients;

    @Autowired
    @Qualifier("claudeRegisteredClientRepository")
    private RegisteredClientRepository claudeClients;

    @Autowired
    @Qualifier("openAiDeAuthorizationService")
    private OAuth2AuthorizationService openAiAuthorizations;

    @Autowired
    @Qualifier("claudeAuthorizationService")
    private OAuth2AuthorizationService claudeAuthorizations;

    @Autowired
    private OpenAiDeCoachConnectionService openAiConnections;

    @Autowired
    private ClaudeCoachConnectionService claudeConnections;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private HttpClient client;

    @BeforeEach
    void setUp() {
        reset(openAiConnections, claudeConnections);
        when(openAiConnections.resolveConnectedSkillpilotId(OPENAI_SUBJECT)).thenReturn("SP-OPENAI-COMBINED");
        when(claudeConnections.resolveSkillpilotId(CLAUDE_SUBJECT)).thenReturn("SP-CLAUDE-COMBINED");
        client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Test
    void keepsAccessRefreshAndRevocationTokensInsideTheirProviderBoundary() throws Exception {
        RegisteredClient openAiClient = openAiClients.findByClientId(OPENAI_CLIENT_ID);
        RegisteredClient claudeClient = claudeClients.findByClientId(ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID);
        assertThat(openAiClient).isNotNull();
        assertThat(claudeClient).isNotNull();

        IssuedTokens openAiTokens = issue(
                openAiAuthorizations,
                openAiClient,
                OPENAI_SUBJECT,
                "https://skillpilot.test/api/openai/de/mcp",
                Set.of(
                        OpenAiDeOAuthConfiguration.READ_SCOPE,
                        OpenAiDeOAuthConfiguration.WRITE_SCOPE,
                        OpenAiDeOAuthConfiguration.OFFLINE_SCOPE));
        IssuedTokens claudeTokens = issue(
                claudeAuthorizations,
                claudeClient,
                CLAUDE_SUBJECT,
                "https://skillpilot.test/api/claude/mcp",
                Set.of(
                        ClaudeOAuthConfiguration.READ_SCOPE,
                        ClaudeOAuthConfiguration.WRITE_SCOPE,
                        ClaudeOAuthConfiguration.OFFLINE_SCOPE));

        assertThat(authorizedToolNames("/api/openai/de/mcp", openAiTokens.accessToken()))
                .containsExactly("openai_security_context_probe");
        assertThat(authorizedToolNames("/api/claude/mcp", claudeTokens.accessToken()))
                .containsExactly("claude_security_context_probe");

        JsonNode openAiProbe = authorizedMcpCall(
                "/api/openai/de/mcp",
                openAiTokens.accessToken(),
                "openai_security_context_probe");
        assertThat(openAiProbe.path("result").path("structuredContent").path("provider").asText())
                .isEqualTo("openai");
        assertThat(openAiProbe.path("result").path("structuredContent").path("subject").asText())
                .isEqualTo(OPENAI_SUBJECT);
        JsonNode claudeProbe = authorizedMcpCall(
                "/api/claude/mcp",
                claudeTokens.accessToken(),
                "claude_security_context_probe");
        assertThat(claudeProbe.path("result").toString())
                .contains("claude", CLAUDE_SUBJECT);

        assertThat(postMcp(
                        "/api/openai/de/mcp",
                        claudeTokens.accessToken(),
                        "openai_security_context_probe").statusCode())
                .isEqualTo(401);
        assertThat(postMcp(
                        "/api/claude/mcp",
                        openAiTokens.accessToken(),
                        "claude_security_context_probe").statusCode())
                .isEqualTo(401);

        HttpResponse<String> openAiForeignRefresh = postForm(
                OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT,
                List.of(
                        Map.entry("grant_type", "refresh_token"),
                        Map.entry("client_id", OPENAI_CLIENT_ID),
                        Map.entry("refresh_token", claudeTokens.refreshToken()),
                        Map.entry("resource", "https://skillpilot.test/api/openai/de/mcp")));
        assertInvalidGrant(openAiForeignRefresh);

        HttpResponse<String> claudeForeignRefresh = postForm(
                "/oauth2/token",
                List.of(
                        Map.entry("grant_type", "refresh_token"),
                        Map.entry("client_id", ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID),
                        Map.entry("refresh_token", openAiTokens.refreshToken()),
                        Map.entry("resource", "https://skillpilot.test/api/claude/mcp")));
        assertInvalidGrant(claudeForeignRefresh);

        HttpResponse<String> openAiForeignRevocation = postForm(
                OpenAiDeOAuthConfiguration.REVOCATION_ENDPOINT,
                List.of(
                        Map.entry("client_id", OPENAI_CLIENT_ID),
                        Map.entry("token", claudeTokens.refreshToken()),
                        Map.entry("token_type_hint", "refresh_token")));
        assertThat(openAiForeignRevocation.statusCode())
                .withFailMessage(openAiForeignRevocation.body())
                .isEqualTo(200);
        assertThat(claudeAuthorizations.findByToken(
                        claudeTokens.refreshToken(), OAuth2TokenType.REFRESH_TOKEN))
                .isNotNull();

        HttpResponse<String> claudeForeignRevocation = postForm(
                "/oauth2/revoke",
                List.of(
                        Map.entry("client_id", ClaudeOAuthConfiguration.CLAUDE_HOSTED_CLIENT_ID),
                        Map.entry("token", openAiTokens.refreshToken()),
                        Map.entry("token_type_hint", "refresh_token")));
        assertThat(claudeForeignRevocation.statusCode())
                .withFailMessage(claudeForeignRevocation.body())
                .isEqualTo(200);
        assertThat(openAiAuthorizations.findByToken(
                        openAiTokens.refreshToken(), OAuth2TokenType.REFRESH_TOKEN))
                .isNotNull();
    }

    private IssuedTokens issue(
            OAuth2AuthorizationService authorizations,
            RegisteredClient registeredClient,
            String subject,
            String resource,
            Set<String> authorizedScopes) {
        Instant issuedAt = Instant.now();
        String accessTokenValue = "access-" + UUID.randomUUID();
        String refreshTokenValue = "refresh-" + UUID.randomUUID();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                accessTokenValue,
                issuedAt,
                issuedAt.plus(Duration.ofHours(1)),
                authorizedScopes);
        OAuth2RefreshToken refreshToken = new OAuth2RefreshToken(
                refreshTokenValue,
                issuedAt,
                issuedAt.plus(Duration.ofDays(30)));
        Authentication principal = org.springframework.security.authentication.UsernamePasswordAuthenticationToken
                .authenticated(subject, "N/A", List.of());
        OAuth2AuthorizationRequest authorizationRequest = OAuth2AuthorizationRequest.authorizationCode()
                .authorizationUri("https://skillpilot.test/authorize")
                .clientId(registeredClient.getClientId())
                .redirectUri(registeredClient.getRedirectUris().iterator().next())
                .scopes(authorizedScopes)
                .additionalParameters(Map.of("resource", resource))
                .build();
        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(registeredClient)
                .id(UUID.randomUUID().toString())
                .principalName(subject)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizedScopes(authorizedScopes)
                .attribute(Principal.class.getName(), principal)
                .attribute(OAuth2AuthorizationRequest.class.getName(), authorizationRequest)
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build();
        authorizations.save(authorization);
        return new IssuedTokens(accessTokenValue, refreshTokenValue);
    }

    private JsonNode authorizedMcpCall(String path, String accessToken, String toolName) throws Exception {
        HttpResponse<String> response = postMcp(path, accessToken, toolName);
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(200);
        return objectMapper.readTree(response.body());
    }

    private List<String> authorizedToolNames(String path, String accessToken) throws Exception {
        HttpResponse<String> response = postMcpRequest(
                path,
                accessToken,
                """
                {"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
                """);
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(200);
        return objectMapper.readTree(response.body())
                .path("result")
                .path("tools")
                .valueStream()
                .map(tool -> tool.path("name").asText())
                .toList();
    }

    private HttpResponse<String> postMcp(String path, String accessToken, String toolName) throws Exception {
        String requestBody = """
                {"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"%s","arguments":{}}}
                """.formatted(toolName);
        return postMcpRequest(path, accessToken, requestBody);
    }

    private HttpResponse<String> postMcpRequest(String path, String accessToken, String requestBody)
            throws Exception {
        return client.send(
                HttpRequest.newBuilder(localUri(path))
                        .header(HttpHeaders.CONTENT_TYPE, "application/json")
                        .header(HttpHeaders.ACCEPT, "application/json, text/event-stream")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                        .header("MCP-Protocol-Version", "2025-11-25")
                        .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                        .build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postForm(String path, List<Map.Entry<String, String>> parameters)
            throws Exception {
        return client.send(
                HttpRequest.newBuilder(localUri(path))
                        .header(HttpHeaders.CONTENT_TYPE, "application/x-www-form-urlencoded")
                        .POST(HttpRequest.BodyPublishers.ofString(form(parameters)))
                        .build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private void assertInvalidGrant(HttpResponse<String> response) throws Exception {
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(400);
        assertThat(objectMapper.readTree(response.body()).path("error").asText()).isEqualTo("invalid_grant");
    }

    private URI localUri(String path) {
        return URI.create("http://127.0.0.1:" + port + path);
    }

    private String form(List<Map.Entry<String, String>> parameters) {
        return parameters.stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .collect(Collectors.joining("&"));
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private record IssuedTokens(String accessToken, String refreshToken) {
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
            ClaudeOAuthConfiguration.class,
            SkillPilotStatelessMcpServerFactory.class,
            OpenAiDeMcpServerConfiguration.class,
            ClaudeMcpServerConfiguration.class
    })
    static class TestApplication {

        @Bean
        JsonMapper jsonMapper() {
            return JsonMapper.builder().build();
        }

        @Bean
        OpenAiDeCoachConnectionService openAiDeCoachConnectionService() {
            return Mockito.mock(OpenAiDeCoachConnectionService.class);
        }

        @Bean
        OpenAiDeOperationalTelemetry openAiDeOperationalTelemetry() {
            return new OpenAiDeOperationalTelemetry(new SimpleMeterRegistry());
        }

        @Bean
        ClaudeCoachConnectionService claudeCoachConnectionService() {
            return mock(ClaudeCoachConnectionService.class);
        }

        @Bean
        OpenAiDeCoachMcpContract openAiDeCoachMcpContract() {
            OpenAiDeCoachMcpContract contract = mock(OpenAiDeCoachMcpContract.class);
            when(contract.serverInstructions()).thenReturn("Combined provider OAuth/MCP integration test.");
            when(contract.toolSpecifications()).thenReturn(List.of(openAiSecurityContextTool()));
            return contract;
        }

        @Bean(name = "claudeCoachMcpToolCallbacks")
        ToolCallbackProvider claudeCoachMcpToolCallbacks() {
            return MethodToolCallbackProvider.builder()
                    .toolObjects(new ClaudeSecurityContextTool())
                    .build();
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

    static class ClaudeSecurityContextTool {

        @Tool(
                name = "claude_security_context_probe",
                description = "Returns the authenticated integration-test subject.")
        public Map<String, String> probe() {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            return Map.of("provider", "claude", "subject", authentication.getName());
        }
    }

    private static McpStatelessServerFeatures.SyncToolSpecification openAiSecurityContextTool() {
        McpSchema.Tool tool = McpSchema.Tool.builder("openai_security_context_probe")
                .description("Returns the authenticated integration-test subject.")
                .inputSchema(Map.of(
                        "type", "object",
                        "properties", Map.of(),
                        "additionalProperties", false))
                .outputSchema(Map.of(
                        "type", "object",
                        "properties", Map.of(
                                "provider", Map.of("type", "string"),
                                "subject", Map.of("type", "string")),
                        "required", List.of("provider", "subject"),
                        "additionalProperties", false))
                .build();
        return McpStatelessServerFeatures.SyncToolSpecification.builder()
                .tool(tool)
                .callHandler((context, request) -> {
                    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                    Map<String, Object> result = Map.of(
                            "provider", "openai",
                            "subject", authentication.getName());
                    return McpSchema.CallToolResult.builder()
                            .isError(false)
                            .addTextContent("Authenticated OpenAI integration probe.")
                            .structuredContent(result)
                            .build();
                })
                .build();
    }
}
