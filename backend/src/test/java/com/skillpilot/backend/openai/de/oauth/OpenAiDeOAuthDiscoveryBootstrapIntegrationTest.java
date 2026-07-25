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
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachMcpContract;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeMcpServerConfiguration;
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
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(
        classes = OpenAiDeOAuthDiscoveryBootstrapIntegrationTest.TestApplication.class,
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestPropertySource(properties = {
        "skillpilot.openai.de.enabled=false",
        "skillpilot.openai.de.bootstrap-enabled=true",
        "skillpilot.openai.de.oauth.enabled=false",
        "skillpilot.openai.de.mcp.enabled=false",
        "skillpilot.public-base-url=https://skillpilot.test",
        "skillpilot.openai.de.mcp-url=https://skillpilot.test/api/openai/de/mcp",
        "skillpilot.openai.de.oauth.protected-resource-metadata=https://skillpilot.test/api/openai/de/oauth/protected-resource",
        "skillpilot.openai.de.rate-limit.mcp-requests=5"
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

        properties.setMcpUrl("http://skillpilot.test/api/openai/de/mcp");
        OpenAiDeOAuthDiscoveryBootstrapConfiguration configuration =
                new OpenAiDeOAuthDiscoveryBootstrapConfiguration();

        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> configuration.openAiDeOAuthDiscoveryBootstrapRouterFunction(
                        "https://skillpilot.test",
                        properties))
                .withMessageContaining("MCP resource")
                .withMessageContaining("HTTPS");

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
                OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_WELL_KNOWN_PATH));
        assertThat(protectedResource.path("resource").asText())
                .isEqualTo("https://skillpilot.test/api/openai/de/mcp");
        assertThat(protectedResource.path("authorization_servers").get(0).asText())
                .isEqualTo("https://skillpilot.test/api/openai/de");

        assertThat(json(get(OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_METADATA_PATH)))
                .isEqualTo(protectedResource);

        JsonNode authorizationServer = json(get(
                OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH));
        assertThat(authorizationServer.path("issuer").asText())
                .isEqualTo("https://skillpilot.test/api/openai/de");
        assertThat(authorizationServer.path("token_endpoint_auth_methods_supported"))
                .anySatisfy(method -> assertThat(method.asText()).isEqualTo("none"));
        assertThat(authorizationServer.path("code_challenge_methods_supported"))
                .anySatisfy(method -> assertThat(method.asText()).isEqualTo("S256"));
        assertThat(authorizationServer.path("registration_endpoint").isMissingNode()).isTrue();
        assertThat(authorizationServer.path("client_id_metadata_document_supported").isMissingNode()).isTrue();

        assertThat(json(get(OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_COMPATIBILITY_PATH)))
                .isEqualTo(authorizationServer);

        for (String method : new String[] {"GET", "POST", "DELETE", "OPTIONS"}) {
            HttpResponse<String> response = request(method, "/api/openai/de/mcp");
            assertThat(response.statusCode()).as(method).isEqualTo(401);
            assertThat(response.headers().firstValue(HttpHeaders.WWW_AUTHENTICATE))
                    .hasValueSatisfying(value -> assertThat(value)
                            .contains("resource_metadata=\"https://skillpilot.test/api/openai/de/oauth/protected-resource\"")
                            .contains(OpenAiDeOAuthConfiguration.READ_SCOPE)
                            .contains(OpenAiDeOAuthConfiguration.WRITE_SCOPE)
                            .doesNotContain("error="));
            assertThat(response.headers().firstValue(HttpHeaders.CACHE_CONTROL))
                    .contains("no-store");
            assertThat(response.body())
                    .isEqualTo("{\"error\":\"authentication_required\"}")
                    .doesNotContain("get_skillpilot_context_de")
                    .doesNotContain("skillpilotId");
        }

        HttpResponse<String> arbitraryBearer = request(
                "POST",
                "/api/openai/de/mcp",
                Map.of(HttpHeaders.AUTHORIZATION, "Bearer arbitrary-untrusted-value"));
        assertThat(arbitraryBearer.statusCode()).isEqualTo(401);
        assertThat(arbitraryBearer.headers().firstValue(HttpHeaders.WWW_AUTHENTICATE))
                .hasValueSatisfying(value -> assertThat(value)
                        .contains("error=\"invalid_token\""));

        assertThat(get(OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT).statusCode()).isEqualTo(404);
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
        assertThat(context.getBeansOfType(OpenAiDeCoachMcpContract.class)).isEmpty();
        assertThat(context.getBeansOfType(OpenAiDeRateLimitFilter.class)).hasSize(1);
        assertThat(context.getBeansOfType(OpenAiDeHttpOutcomeTelemetryFilter.class)).hasSize(1);
        assertThat(context.getBeansOfType(OpenAiDeOperationalTelemetry.class)).hasSize(1);

        HttpResponse<String> rateLimited = request("POST", "/api/openai/de/mcp");
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
                        "skillpilot.openai.de.bootstrap-enabled=true",
                        "skillpilot.openai.de.enabled=true")
                .run(result -> {
                    assertThat(result).hasFailed();
                    assertThat(result.getStartupFailure())
                            .hasRootCauseMessage(
                                    "skillpilot.openai.de.bootstrap-enabled and "
                                            + "skillpilot.openai.de.enabled must not both be true.");
                });
    }

    private JsonNode json(HttpResponse<String> response) throws Exception {
        assertThat(response.statusCode()).withFailMessage(response.body()).isEqualTo(200);
        assertThat(response.headers().firstValue(HttpHeaders.CACHE_CONTROL)).contains("no-store");
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
            OpenAiDeCoachMcpContract.class,
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
