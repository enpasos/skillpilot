package com.skillpilot.backend.openai.de.oauth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;

class OpenAiDeOpaqueTokenIntrospectorTest {

    private static final String CLIENT_ID = "chatgpt-client";
    private static final String MCP_URL = "https://mcp-coach-v1.skillpilot.test/mcp";
    private static final String TOKEN = "opaque-access-token";
    private static final String SUBJECT = "spod_subject";

    @Test
    void acceptsOnlyPersistedExactResourceAndPublishesItAsAudience() {
        Fixture fixture = fixture(MCP_URL, true);

        var principal = fixture.introspector().introspect(TOKEN);

        assertThat(principal.<List<String>>getAttribute("aud")).containsExactly(MCP_URL);
        assertThat(principal.getName()).isEqualTo(SUBJECT);
    }

    @Test
    void rejectsTokenWhosePersistedAuthorizationResourceDiffers() {
        Fixture fixture = fixture(MCP_URL + "/", true);

        assertThatExceptionOfType(BadOpaqueTokenException.class)
                .isThrownBy(() -> fixture.introspector().introspect(TOKEN))
                .withMessageContaining("protected resource");
    }

    @Test
    void rejectsTokenWithoutPersistedAuthorizationResource() {
        Fixture fixture = fixture(null, false);

        assertThatExceptionOfType(BadOpaqueTokenException.class)
                .isThrownBy(() -> fixture.introspector().introspect(TOKEN))
                .withMessageContaining("protected resource");
    }

    @Test
    void recordsBoundedCrossProviderRejectionWithoutResolvingLearner() {
        Fixture fixture = fixture(MCP_URL, true, "another-registered-client-id");

        assertThatExceptionOfType(BadOpaqueTokenException.class)
                .isThrownBy(() -> fixture.introspector().introspect(TOKEN))
                .withMessageContaining("another provider client");
        assertThat(fixture.registry()
                        .get(OpenAiDeOperationalTelemetry.EVENT_METRIC)
                        .tag("event", "cross_provider_rejected")
                        .counter()
                        .count())
                .isEqualTo(1);
    }

    private Fixture fixture(String resource, boolean includeResource) {
        return fixture(resource, includeResource, "registered-client-id");
    }

    private Fixture fixture(String resource, boolean includeResource, String authorizationClientId) {
        OAuth2AuthorizationService authorizations = mock(OAuth2AuthorizationService.class);
        RegisteredClientRepository clients = mock(RegisteredClientRepository.class);
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeOperationalTelemetry telemetry = new OpenAiDeOperationalTelemetry(registry);
        RegisteredClient client = RegisteredClient.withId("registered-client-id")
                .clientId(CLIENT_ID)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://chatgpt.com/connector/oauth/callback")
                .scope(OpenAiDeOAuthConfiguration.READ_SCOPE)
                .build();
        OAuth2AuthorizationRequest.Builder request = OAuth2AuthorizationRequest.authorizationCode()
                .authorizationUri("https://skillpilot.test/api/openai/v1/oauth2/authorize")
                .clientId(CLIENT_ID)
                .redirectUri("https://chatgpt.com/connector/oauth/callback")
                .scopes(Set.of(OpenAiDeOAuthConfiguration.READ_SCOPE));
        if (includeResource) {
            request.additionalParameters(Map.of("resource", resource));
        }
        Instant issuedAt = Instant.now();
        OAuth2AccessToken accessToken = new OAuth2AccessToken(
                OAuth2AccessToken.TokenType.BEARER,
                TOKEN,
                issuedAt,
                issuedAt.plusSeconds(300),
                Set.of(OpenAiDeOAuthConfiguration.READ_SCOPE));
        RegisteredClient authorizationClient = RegisteredClient.withId(authorizationClientId)
                .clientId(CLIENT_ID + "-authorization")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("https://chatgpt.com/connector/oauth/callback")
                .scope(OpenAiDeOAuthConfiguration.READ_SCOPE)
                .build();
        OAuth2Authorization authorization = OAuth2Authorization.withRegisteredClient(authorizationClient)
                .id("authorization-id")
                .principalName(SUBJECT)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizedScopes(Set.of(OpenAiDeOAuthConfiguration.READ_SCOPE))
                .attribute(OAuth2AuthorizationRequest.class.getName(), request.build())
                .accessToken(accessToken)
                .build();
        when(authorizations.findByToken(TOKEN, OAuth2TokenType.ACCESS_TOKEN)).thenReturn(authorization);
        when(clients.findByClientId(CLIENT_ID)).thenReturn(client);
        return new Fixture(
                new OpenAiDeOpaqueTokenIntrospector(
                        authorizations,
                        clients,
                        telemetry,
                        CLIENT_ID,
                        MCP_URL),
                registry);
    }

    private record Fixture(
            OpenAiDeOpaqueTokenIntrospector introspector,
            SimpleMeterRegistry registry) {
    }
}
