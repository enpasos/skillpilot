package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;

/**
 * Validates opaque bearer access tokens against the Claude v1 authorization service.
 *
 * <p>Four independent conditions must hold: the token resolves inside the Claude v1 provider
 * boundary, it is still active, its audience is exactly the Claude v1 MCP resource identifier, and
 * it belongs to the technical Claude app principal. Anything else is a bad token.</p>
 */
public class ClaudeV1OpaqueTokenIntrospector implements OpaqueTokenIntrospector {

    private final OAuth2AuthorizationService authorizationService;
    private final RegisteredClientRepository registeredClients;
    private final ClaudeV1Properties properties;

    public ClaudeV1OpaqueTokenIntrospector(
            OAuth2AuthorizationService authorizationService,
            RegisteredClientRepository registeredClients,
            ClaudeV1Properties properties) {
        this.authorizationService = Objects.requireNonNull(authorizationService, "authorizationService");
        this.registeredClients = Objects.requireNonNull(registeredClients, "registeredClients");
        this.properties = Objects.requireNonNull(properties, "properties");
    }

    @Override
    public OAuth2AuthenticatedPrincipal introspect(String token) {
        if (token == null || token.isBlank()) {
            throw new BadOpaqueTokenException("Missing or empty token.");
        }

        OAuth2Authorization authorization = authorizationService.findByToken(token, OAuth2TokenType.ACCESS_TOKEN);
        if (authorization == null) {
            throw new BadOpaqueTokenException("Token not found or does not belong to Claude v1.");
        }

        OAuth2Authorization.Token<OAuth2AccessToken> accessToken = authorization.getAccessToken();
        if (accessToken == null || !accessToken.isActive()) {
            throw new BadOpaqueTokenException("Access token is inactive or expired.");
        }
        requireClaudeV1Audience(accessToken);

        String principalName = authorization.getPrincipalName();
        if (principalName == null || principalName.isBlank()) {
            throw new BadOpaqueTokenException("Authorization is missing its principal name.");
        }
        if (!principalName.startsWith(ClaudeV1AppAuthenticationFilter.APP_SUBJECT_PREFIX)) {
            throw new BadOpaqueTokenException("Authorization does not use a Claude v1 app principal.");
        }
        RegisteredClient client = registeredClients.findById(authorization.getRegisteredClientId());
        if (client == null) {
            throw new BadOpaqueTokenException("OAuth client is not registered for Claude v1.");
        }

        Set<String> scopes = accessToken.getToken().getScopes();
        if (scopes == null
                || !scopes.contains(com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract.SCOPE_READ)
                || !com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract.SUPPORTED_SCOPES.containsAll(scopes)) {
            throw new BadOpaqueTokenException("Access token carries an invalid Claude v1 scope set.");
        }
        Collection<GrantedAuthority> authorities = scopes.stream()
                .map(scope -> (GrantedAuthority) new SimpleGrantedAuthority("SCOPE_" + scope))
                .collect(Collectors.toSet());

        // The OAuth subject is technical and deliberately has no learner mapping.
        Map<String, Object> attributes = new LinkedHashMap<>();
        attributes.put("sub", principalName);
        attributes.put("client_id", client.getClientId());
        attributes.put("aud", List.of(properties.getPublicMcpUrl()));
        attributes.put("scope", scopes);

        return new DefaultOAuth2AuthenticatedPrincipal(principalName, attributes, authorities);
    }

    private void requireClaudeV1Audience(OAuth2Authorization.Token<OAuth2AccessToken> accessToken) {
        Object audience = accessToken.getClaims() == null ? null : accessToken.getClaims().get("aud");
        List<?> audiences = switch (audience) {
            case List<?> list -> list;
            case String single -> List.of(single);
            case null, default -> List.of();
        };
        if (audiences.size() != 1 || !properties.getPublicMcpUrl().equals(audiences.getFirst())) {
            throw new BadOpaqueTokenException("Access token was not issued for the Claude v1 resource.");
        }
    }
}
