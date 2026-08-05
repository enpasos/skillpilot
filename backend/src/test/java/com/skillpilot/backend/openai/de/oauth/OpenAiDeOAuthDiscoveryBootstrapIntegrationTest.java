package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.openai.de.OpenAiDeConfiguration;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.health.OpenAiDeCoachHealthIndicator;
import com.skillpilot.backend.openai.de.observability.OpenAiDeHttpOutcomeTelemetryFilter;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.de.ratelimit.OpenAiDeRateLimitFilter;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeMcpServerConfiguration;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringBootConfiguration;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.data.jpa.autoconfigure.DataJpaRepositoriesAutoConfiguration;
import org.springframework.boot.hibernate.autoconfigure.HibernateJpaAutoConfiguration;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.liquibase.autoconfigure.LiquibaseAutoConfiguration;
import org.springframework.boot.security.oauth2.client.autoconfigure.OAuth2ClientAutoConfiguration;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(
        classes = OpenAiDeOAuthDiscoveryBootstrapIntegrationTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "skillpilot.openai.coach.v1.enabled=false",
        "skillpilot.openai.coach.v1.bootstrap-enabled=true",
        "skillpilot.openai.coach.v1.oauth.enabled=false",
        "skillpilot.openai.coach.v1.mcp.enabled=false",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.openai.coach.v1.mcp-url=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth-resource=https://mcp-coach-v1.skillpilot.com/mcp",
        "skillpilot.openai.coach.v1.oauth.protected-resource-metadata=https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp",
        "skillpilot.openai.coach.v1.rate-limit.mcp-requests=5"
})
class OpenAiDeOAuthDiscoveryBootstrapIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private ApplicationContext context;

    private final HttpClient client = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void bootstrapIsOffByDefaultAndRejectsUnsafeDiscoveryUrls() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        assertThat(properties.isBootstrapEnabled()).isFalse();

        properties.setMcpUrl("http://mcp-coach-v1.skillpilot.test/mcp");
        OpenAiDeOAuthDiscoveryBootstrapConfiguration configuration =
                new OpenAiDeOAuthDiscoveryBootstrapConfiguration();

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> configuration.openAiDeOAuthDiscoveryBootstrapRouterFunction(
                        "https://skillpilot.test",
                        properties))
                .withMessageContaining("public MCP endpoint")
                .withMessageContaining("HTTPS");

        OpenAiDeProperties wrongContractProperties = new OpenAiDeProperties();
        wrongContractProperties.setMcpUrl("https://wrong.example/mcp");
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> configuration.openAiDeOAuthDiscoveryBootstrapRouterFunction(
                        "https://skillpilot.test",
                        wrongContractProperties))
                .withMessageContaining("public MCP endpoint must exactly match")
                .withMessageContaining(OpenAiDeV1ContractMetadata.PUBLIC_MCP_ENDPOINT);

        OpenAiDeProperties safeProperties = new OpenAiDeProperties();
        for (String unsafeBaseUrl : new String[] {
                "https://user@skillpilot.test",
                "https://skillpilot.test/prefix",
                "https://skillpilot.test?tenant=one"
        }) {
            assertThatExceptionOfType(IllegalStateException.class)
                    .as(unsafeBaseUrl)
                    .isThrownBy(() -> configuration.openAiDeOAuthDiscoveryBootstrapRouterFunction(
                            unsafeBaseUrl,
                            safeProperties));
        }
    }

    @Test
    void publishesOnlyDiscoveryAndAlwaysChallengesMcpRequests() throws Exception {
        JsonNode protectedResource = json(get(
                OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_METADATA_PATH));
        assertThat(protectedResource.path("resource").asText())
                .isEqualTo(OpenAiDeV1ContractMetadata.OAUTH_RESOURCE);
        assertThat(protectedResource.path("authorization_servers").get(0).asText())
                .isEqualTo("https://skillpilot.test/api/openai/v1");
        assertThat(get(OpenAiDeV1ContractMetadata.PROTECTED_RESOURCE_METADATA_PATH).statusCode())
                .isEqualTo(404);
        assertThat(get("/api/openai/v1/oauth/protected-resource").statusCode()).isEqualTo(404);

        JsonNode authorizationServer = json(get(
                OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH));
        assertThat(authorizationServer.path("issuer").asText())
                .isEqualTo("https://skillpilot.test/api/openai/v1");
        assertThat(authorizationServer.path("token_endpoint_auth_methods_supported"))
                .anySatisfy(method -> assertThat(method.asText()).isEqualTo("client_secret_basic"));
        assertThat(authorizationServer.path("code_challenge_methods_supported"))
                .anySatisfy(method -> assertThat(method.asText()).isEqualTo("S256"));
        assertThat(authorizationServer.path("registration_endpoint").isMissingNode()).isTrue();
        assertThat(authorizationServer.path("client_id_metadata_document_supported").isMissingNode()).isTrue();

        JsonNode issuerRelativeDiscovery = json(get(
                OpenAiDeOAuthMetadataController.OPENID_CONFIGURATION_PATH));
        assertThat(issuerRelativeDiscovery).isEqualTo(authorizationServer);

        assertThat(get("/api/openai/v1/.well-known/oauth-authorization-server").statusCode())
                .isEqualTo(404);

        for (String method : new String[] {"GET", "POST", "DELETE", "OPTIONS"}) {
            HttpResponse<String> response = request(method, OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH);
            assertThat(response.statusCode()).as(method).isEqualTo(401);
            assertThat(response.headers().firstValue(HttpHeaders.WWW_AUTHENTICATE))
                    .hasValueSatisfying(value -> assertThat(value)
                            .contains("resource_metadata=\""
                                    + OpenAiDeV1ContractMetadata.PROTECTED_RESOURCE_METADATA_ENDPOINT
                                    + "\"")
                            .contains(OpenAiDeOAuthConfiguration.READ_SCOPE)
                            .contains(OpenAiDeOAuthConfiguration.WRITE_SCOPE)
                            .doesNotContain("error="));
            assertThat(response.headers().firstValue(HttpHeaders.CACHE_CONTROL))
                    .contains("no-store");
            assertThat(response.body())
                    .isEqualTo("{\"error\":\"authentication_required\"}")
                    .doesNotContain("get_skillpilot_context")
                    .doesNotContain("skillpilotId");
        }

        HttpResponse<String> arbitraryBearer = request(
                "POST",
                OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                Map.of(HttpHeaders.AUTHORIZATION, "Bearer arbitrary-untrusted-value"));
        assertThat(arbitraryBearer.statusCode()).isEqualTo(401);
        assertThat(arbitraryBearer.headers().firstValue(HttpHeaders.WWW_AUTHENTICATE))
                .hasValueSatisfying(value -> assertThat(value)
                        .contains("error=\"invalid_token\""));

        assertThat(get(OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT).statusCode()).isEqualTo(404);
        assertThat(request("POST", "/api/openai/v1/mcp").statusCode()).isEqualTo(404);
        assertThat(request("POST", "/api/openai/v1/v1/mcp").statusCode()).isEqualTo(404);
        assertThat(request("POST", OpenAiDeV1ContractMetadata.PUBLIC_MCP_PATH).statusCode())
                .isEqualTo(404);
        for (String path : new String[] {
                OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT,
                OpenAiDeOAuthConfiguration.REVOCATION_ENDPOINT,
                OpenAiDeOAuthConfiguration.INTROSPECTION_ENDPOINT
        }) {
            assertThat(request("POST", path).statusCode()).as(path).isEqualTo(404);
        }

        assertThat(context.containsBean("openAiDeMcpServerRegistration")).isFalse();
        assertThat(context.containsBean("registerOpenAiDeClient")).isFalse();
        assertThat(context.containsBean("openAiDeCoach")).isFalse();
        assertThat(context.getBeansOfType(OpenAiDeV1McpContractAdapter.class)).isEmpty();
        assertThat(context.getBeansOfType(OpenAiDeRateLimitFilter.class)).hasSize(1);
        assertThat(context.getBeansOfType(OpenAiDeHttpOutcomeTelemetryFilter.class)).hasSize(1);
        assertThat(context.getBeansOfType(OpenAiDeOperationalTelemetry.class)).hasSize(1);

        HttpResponse<String> rateLimited =
                request("POST", OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH);
        assertThat(rateLimited.statusCode()).isEqualTo(429);
        assertThat(rateLimited.headers().firstValue(HttpHeaders.RETRY_AFTER)).isPresent();
        assertThat(rateLimited.body()).contains("\"error\":\"rate_limited\"");
    }

    @Test
    void bootstrapAndFullProviderFailFastWhenEnabledTogether() {
        new ApplicationContextRunner()
                .withUserConfiguration(
                        OpenAiDeConfiguration.class,
                        OpenAiDeOAuthDiscoveryBootstrapConfiguration.class)
                .withPropertyValues(
                        "skillpilot.openai.coach.v1.bootstrap-enabled=true",
                        "skillpilot.openai.coach.v1.enabled=true",
                        "skillpilot.security.signing-secret=7Vh2Kp9Qw4Rx8Mz3Tn6Yc1Fd5Js0LaEuBiOg")
                .run(result -> {
                    assertThat(result).hasFailed();
                    assertThat(result.getStartupFailure())
                            .hasRootCauseMessage(
                                    "skillpilot.openai.coach.v1.bootstrap-enabled and "
                                            + "skillpilot.openai.coach.v1.enabled must not both be true.");
                });
    }

    private JsonNode json(HttpResponse<String> response) throws Exception {
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(200);
        assertThat(response.headers().firstValue(HttpHeaders.CONTENT_TYPE))
                .hasValueSatisfying(value -> assertThat(value)
                        .startsWith(MediaType.APPLICATION_JSON_VALUE));
        assertThat(response.headers().firstValue(HttpHeaders.CACHE_CONTROL))
                .hasValueSatisfying(value -> assertThat(value).contains("no-store"));
        assertThat(response.headers().firstValue("X-Content-Type-Options")).contains("nosniff");
        return objectMapper.readTree(response.body());
    }

    private HttpResponse<String> get(String path) throws Exception {
        return request("GET", path);
    }

    private HttpResponse<String> request(String method, String path) throws Exception {
        return request(method, path, Map.of());
    }

    private HttpResponse<String> request(
            String method,
            String path,
            Map<String, String> headers) throws Exception {
        HttpRequest.BodyPublisher body = "GET".equals(method) || "OPTIONS".equals(method)
                ? HttpRequest.BodyPublishers.noBody()
                : HttpRequest.BodyPublishers.ofString("{}");
        HttpRequest.Builder request = HttpRequest.newBuilder(localUri(path))
                .method(method, body);
        headers.forEach(request::header);
        return client.send(request.build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI localUri(String path) {
        return URI.create("http://127.0.0.1:" + port + path);
    }

    @SpringBootConfiguration
    @EnableAutoConfiguration(exclude = {
            DataSourceAutoConfiguration.class,
            HibernateJpaAutoConfiguration.class,
            DataJpaRepositoriesAutoConfiguration.class,
            LiquibaseAutoConfiguration.class,
            OAuth2ClientAutoConfiguration.class
    })
    @Import({
            OpenAiDeConfiguration.class,
            OpenAiDeOAuthConfiguration.class,
            OpenAiDeOAuthDiscoveryBootstrapConfiguration.class,
            OpenAiDeMcpServerConfiguration.class,
            OpenAiDeV1McpContractAdapter.class,
            OpenAiDeCoachHealthIndicator.class,
            OpenAiDeOperationalTelemetry.class,
            OpenAiDeRateLimitFilter.class,
            OpenAiDeHttpOutcomeTelemetryFilter.class
    })
    static class TestApplication {

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
