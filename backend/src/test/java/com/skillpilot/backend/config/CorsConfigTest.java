package com.skillpilot.backend.config;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.http.HttpServletResponse;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.DefaultCorsProcessor;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

class CorsConfigTest {

    private static final String VISUALIZATION_PATH =
            "/assets/goal-visualizations/mathematik/goal/goal.jpg";

    @Test
    void allowsOnlyReadOnlyVisualizationRequestsFromEverySandboxOrigin() {
        Map<String, CorsConfiguration> mappings = mappings();

        assertThat(mappings.keySet())
                .containsExactly(
                        "/assets/goal-visualizations/**",
                        "/**");

        CorsConfiguration visualization = mappings.get("/assets/goal-visualizations/**");
        assertThat(visualization).isNotNull();
        assertThat(visualization.checkOrigin("https://mcp-coach-v1.skillpilot.com"))
                .isEqualTo("*");
        assertThat(visualization.checkOrigin("https://example.web-sandbox.oaiusercontent.com"))
                .isEqualTo("*");
        assertThat(visualization.checkOrigin("null")).isEqualTo("*");
        assertThat(visualization.getAllowedMethods()).containsExactly("GET", "HEAD", "OPTIONS");
        assertThat(visualization.getAllowCredentials()).isFalse();

        CorsConfiguration application = mappings.get("/**");
        assertThat(application).isNotNull();
        assertThat(application.checkOrigin("https://example.web-sandbox.oaiusercontent.com"))
                .isNull();
    }

    @Test
    void theSpecificVisualizationMappingWinsForSimpleAndPreflightRequests() throws Exception {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.setCorsConfigurations(mappings());

        MockHttpServletRequest imageRequest = new MockHttpServletRequest("GET", VISUALIZATION_PATH);
        imageRequest.addHeader(
                HttpHeaders.ORIGIN,
                "https://example.web-sandbox.oaiusercontent.com");
        CorsConfiguration configuration = source.getCorsConfiguration(imageRequest);
        MockHttpServletResponse imageResponse = new MockHttpServletResponse();

        assertThat(configuration).isNotNull();
        assertThat(configuration.getAllowCredentials()).isFalse();
        DefaultCorsProcessor processor = new DefaultCorsProcessor();
        assertThat(processor.processRequest(configuration, imageRequest, imageResponse))
                .isTrue();
        assertThat(imageResponse.getStatus()).isEqualTo(HttpServletResponse.SC_OK);
        assertThat(imageResponse.getHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .isEqualTo("*");
        assertThat(imageResponse.getHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS)).isNull();

        MockHttpServletRequest preflightRequest = preflight("GET");
        MockHttpServletResponse preflightResponse = new MockHttpServletResponse();
        assertThat(processor.processRequest(configuration, preflightRequest, preflightResponse))
                .isTrue();
        assertThat(preflightResponse.getStatus()).isEqualTo(HttpServletResponse.SC_OK);
        assertThat(preflightResponse.getHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .isEqualTo("*");

        MockHttpServletRequest opaqueOriginRequest =
                new MockHttpServletRequest("GET", VISUALIZATION_PATH);
        opaqueOriginRequest.addHeader(HttpHeaders.ORIGIN, "null");
        MockHttpServletResponse opaqueOriginResponse = new MockHttpServletResponse();
        assertThat(processor.processRequest(
                        configuration, opaqueOriginRequest, opaqueOriginResponse))
                .isTrue();
        assertThat(opaqueOriginResponse.getStatus()).isEqualTo(HttpServletResponse.SC_OK);
        assertThat(opaqueOriginResponse.getHeader(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN))
                .isEqualTo("*");
    }

    @Test
    void rejectsWidgetWritesAndWidgetAccessToApplicationEndpoints() throws Exception {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.setCorsConfigurations(mappings());
        DefaultCorsProcessor processor = new DefaultCorsProcessor();

        MockHttpServletRequest writeRequest = preflight("POST");
        MockHttpServletResponse writeResponse = new MockHttpServletResponse();
        CorsConfiguration visualization = source.getCorsConfiguration(writeRequest);
        assertThat(visualization).isNotNull();
        assertThat(processor.processRequest(visualization, writeRequest, writeResponse)).isFalse();
        assertThat(writeResponse.getStatus()).isEqualTo(HttpServletResponse.SC_FORBIDDEN);

        MockHttpServletRequest apiRequest = new MockHttpServletRequest("GET", "/api/ui/goals");
        apiRequest.addHeader(
                HttpHeaders.ORIGIN,
                "https://example.web-sandbox.oaiusercontent.com");
        MockHttpServletResponse apiResponse = new MockHttpServletResponse();
        CorsConfiguration application = source.getCorsConfiguration(apiRequest);
        assertThat(application).isNotNull();
        assertThat(processor.processRequest(application, apiRequest, apiResponse)).isFalse();
        assertThat(apiResponse.getStatus()).isEqualTo(HttpServletResponse.SC_FORBIDDEN);
    }

    private static Map<String, CorsConfiguration> mappings() {
        CorsConfig config = new CorsConfig();
        ReflectionTestUtils.setField(config, "allowedOrigins", "http://localhost:5173");
        TestCorsRegistry registry = new TestCorsRegistry();
        config.corsConfigurer().addCorsMappings(registry);
        return registry.configurations();
    }

    private static MockHttpServletRequest preflight(String requestedMethod) {
        MockHttpServletRequest request = new MockHttpServletRequest("OPTIONS", VISUALIZATION_PATH);
        request.addHeader(
                HttpHeaders.ORIGIN,
                "https://example.web-sandbox.oaiusercontent.com");
        request.addHeader(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, requestedMethod);
        return request;
    }

    private static final class TestCorsRegistry extends CorsRegistry {
        Map<String, CorsConfiguration> configurations() {
            return super.getCorsConfigurations();
        }
    }
}
