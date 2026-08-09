package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry.Event;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;

/** Validates token activity, predefined app client, audience and scopes. */
public final class OpenAiDeOpaqueTokenIntrospector implements OpaqueTokenIntrospector {

    private final OAuth2AuthorizationService authorizationService;
    private final RegisteredClientRepository registeredClients;
    private final OpenAiDeOperationalTelemetry telemetry;
    private final String clientId;
    private final String mcpUrl;

    public OpenAiDeOpaqueTokenIntrospector(
            OAuth2AuthorizationService authorizationService,
            RegisteredClientRepository registeredClients,
            OpenAiDeOperationalTelemetry telemetry,
            String clientId,
            String mcpUrl) {
        this.authorizationService = authorizationService;
        this.registeredClients = registeredClients;
        this.telemetry = telemetry;
        this.clientId = clientId;
        this.mcpUrl = mcpUrl;
    }

    @Override
    public OAuth2AuthenticatedPrincipal introspect(String token) {
        OAuth2Authorization authorization = authorizationService.findByToken(token, OAuth2TokenType.ACCESS_TOKEN);
        if (authorization == null
                || authorization.getAccessToken() == null
                || !authorization.getAccessToken().isActive()) {
            throw new BadOpaqueTokenException("Invalid or expired access token.");
        }
        RegisteredClient expectedClient = registeredClients.findByClientId(clientId);
        if (expectedClient == null || !expectedClient.getId().equals(authorization.getRegisteredClientId())) {
            telemetry.record(Event.CROSS_PROVIDER_REJECTED);
            throw new BadOpaqueTokenException("Access token was issued for another provider client.");
        }
        OAuth2AuthorizationRequest authorizationRequest =
                authorization.getAttribute(OAuth2AuthorizationRequest.class.getName());
        Object resource = authorizationRequest == null
                ? null
                : authorizationRequest.getAdditionalParameters().get("resource");
        if (!(resource instanceof String value) || !mcpUrl.equals(value)) {
            throw new BadOpaqueTokenException("Access token was issued for another protected resource.");
        }
        Set<String> accessTokenScopes = authorization.getAccessToken().getToken().getScopes();
        if (!accessTokenScopes.contains(OpenAiDeOAuthConfiguration.READ_SCOPE)) {
            throw new BadOpaqueTokenException("Required OpenAI Coach V1 read scope is missing.");
        }

        String subject = authorization.getPrincipalName();
        List<GrantedAuthority> authorities = new ArrayList<>();
        accessTokenScopes.forEach(scope ->
                authorities.add(new SimpleGrantedAuthority("SCOPE_" + scope)));
        Map<String, Object> attributes = new LinkedHashMap<>();
        attributes.put("sub", subject);
        // Stable across access-token refresh/rotation and used only to bind a
        // short-lived bootstrap capability to this exact OAuth authorization.
        // It never selects a learner or learning session.
        attributes.put("authorization_id", authorization.getId());
        attributes.put("client_id", clientId);
        attributes.put("scope", accessTokenScopes);
        attributes.put("aud", List.of(mcpUrl));
        if (authorization.getAccessToken().getToken().getIssuedAt() != null) {
            attributes.put("iat", authorization.getAccessToken().getToken().getIssuedAt());
        }
        Instant expiresAt = authorization.getAccessToken().getToken().getExpiresAt();
        if (expiresAt != null) {
            attributes.put("exp", expiresAt);
        }
        return new DefaultOAuth2AuthenticatedPrincipal(subject, attributes, authorities);
    }
}
