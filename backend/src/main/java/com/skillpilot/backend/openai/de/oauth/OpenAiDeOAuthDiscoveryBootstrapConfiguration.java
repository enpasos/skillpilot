package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiAppsChallengeController;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1PublicContractValidation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.RouterFunctions;
import org.springframework.web.servlet.function.ServerResponse;

/**
 * Publishes only the OAuth discovery contract needed to configure the ChatGPT
 * app before its exact callback URI is known.
 *
 * <p>The bootstrap is deliberately mutually exclusive with the full provider
 * runtime. It registers no OAuth client, token endpoint, MCP tool, learner
 * service, or health contributor.</p>
 */
@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties(OpenAiDeProperties.class)
@ConditionalOnProperty(
        name = "skillpilot.openai.coach.v1.bootstrap-enabled",
        havingValue = "true")
@ConditionalOnProperty(
        name = "skillpilot.openai.coach.v1.enabled",
        havingValue = "false",
        matchIfMissing = true)
public class OpenAiDeOAuthDiscoveryBootstrapConfiguration {

    @Bean(name = "openAiDeOAuthDiscoveryBootstrapRouterFunction")
    RouterFunction<ServerResponse> openAiDeOAuthDiscoveryBootstrapRouterFunction(
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl,
            OpenAiDeProperties properties) {
        String normalizedPublicBaseUrl = OpenAiDeOAuthConfiguration.stripTrailingSlash(publicBaseUrl);
        String issuer = normalizedPublicBaseUrl + OpenAiDeOAuthConfiguration.ISSUER_PATH;
        validateDiscoverySettings(normalizedPublicBaseUrl, issuer, properties);

        return RouterFunctions.route()
                .GET(
                        OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_METADATA_PATH,
                        request -> metadataResponse(
                                OpenAiDeOAuthMetadataController.protectedResourceMetadata(
                                        issuer,
                                        properties)))
                .GET(
                        OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH,
                        request -> metadataResponse(
                                OpenAiDeOAuthMetadataController.authorizationServerMetadata(
                                        issuer,
                                        properties)))
                .GET(
                        OpenAiAppsChallengeController.PATH,
                        request -> challengeResponse(properties))
                .build();
    }

    @Bean
    @Order(4)
    SecurityFilterChain openAiDeOAuthDiscoveryBootstrapSecurityFilterChain(
            HttpSecurity http,
            OpenAiDeProperties properties) throws Exception {
        http.securityMatcher(
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH,
                        OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH + "/**")
                .authorizeHttpRequests(authorize -> authorize.anyRequest().denyAll())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .requestCache(cache -> cache.disable())
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) ->
                                writeAuthenticationRequired(request, response, properties))
                        .accessDeniedHandler((request, response, exception) ->
                                writeAuthenticationRequired(request, response, properties)));
        return http.build();
    }

    private static ServerResponse metadataResponse(Object metadata) {
        return ServerResponse.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header("X-Content-Type-Options", "nosniff")
                .body(metadata);
    }

    private static ServerResponse challengeResponse(OpenAiDeProperties properties) {
        String challenge = properties.getOpenAiAppsChallenge();
        if (challenge == null || challenge.isBlank()) {
            return ServerResponse.notFound().build();
        }
        return ServerResponse.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .header("X-Content-Type-Options", "nosniff")
                .body(challenge.trim());
    }

    private static void writeAuthenticationRequired(
            HttpServletRequest request,
            HttpServletResponse response,
            OpenAiDeProperties properties) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setHeader(
                HttpHeaders.WWW_AUTHENTICATE,
                OpenAiDeOAuthConfiguration.authenticationChallengeFor(
                        request.getHeader(HttpHeaders.AUTHORIZATION),
                        properties));
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"authentication_required\"}");
    }

    private static void validateDiscoverySettings(
            String publicBaseUrl,
            String issuer,
            OpenAiDeProperties properties) {
        OpenAiDeOAuthConfiguration.requireHttpsOrigin(
                publicBaseUrl,
                "OpenAI Coach V1 public base URL");
        OpenAiDeOAuthConfiguration.requireHttpsUri(
                issuer,
                "OpenAI Coach V1 OAuth issuer");
        OpenAiDeOAuthConfiguration.requireHttpsUri(
                properties.getMcpUrl(),
                "OpenAI Coach V1 public MCP endpoint");
        OpenAiDeOAuthConfiguration.requireHttpsUri(
                properties.getOauthResource(),
                "OpenAI Coach V1 OAuth resource");
        OpenAiDeOAuthConfiguration.requireHttpsUri(
                properties.getOauth().getProtectedResourceMetadata(),
                "OpenAI Coach V1 protected-resource metadata URL");
        OpenAiDeV1PublicContractValidation.requireExact(properties);
    }
}
