package com.skillpilot.backend.claude.oauth;

import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.DefaultOAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.server.authorization.OAuth2Authorization;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2TokenType;
import org.springframework.security.oauth2.server.resource.introspection.BadOpaqueTokenException;
import org.springframework.security.oauth2.server.resource.introspection.OpaqueTokenIntrospector;

public final class SkillPilotOpaqueTokenIntrospector implements OpaqueTokenIntrospector {

    private final OAuth2AuthorizationService authorizationService;
    private final ClaudeCoachConnectionService connectionService;
    private final String mcpUrl;

    public SkillPilotOpaqueTokenIntrospector(
            OAuth2AuthorizationService authorizationService,
            ClaudeCoachConnectionService connectionService,
            String mcpUrl) {
        this.authorizationService = authorizationService;
        this.connectionService = connectionService;
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

        String subject = authorization.getPrincipalName();
        connectionService.resolveSkillpilotId(subject);

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorization.getAuthorizedScopes().forEach(scope ->
                authorities.add(new SimpleGrantedAuthority("SCOPE_" + scope)));

        Map<String, Object> attributes = new LinkedHashMap<>();
        attributes.put("sub", subject);
        attributes.put("client_id", authorization.getRegisteredClientId());
        attributes.put("scope", authorization.getAuthorizedScopes());
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
