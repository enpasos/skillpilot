package com.skillpilot.backend.openai.de.oauth;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachIdentityResolver;
import com.skillpilot.backend.service.OpenAiDeCoachConnectionService;
import io.modelcontextprotocol.common.McpTransportContext;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/** Resolves MCP calls exclusively from the bearer-authenticated request. */
@Component
@ConditionalOnProperty(
        name = {"skillpilot.openai.de.enabled", "skillpilot.openai.de.oauth.enabled"},
        havingValue = "true")
public final class OpenAiDeCoachIdentityResolverAdapter implements OpenAiDeCoachIdentityResolver {

    private final OpenAiDeCoachConnectionService connectionService;
    private final OpenAiDeProperties properties;

    public OpenAiDeCoachIdentityResolverAdapter(
            OpenAiDeCoachConnectionService connectionService,
            OpenAiDeProperties properties) {
        this.connectionService = connectionService;
        this.properties = properties;
    }

    @Override
    public String resolveSkillpilotId(McpTransportContext transportContext) {
        Authentication authentication = requireAuthentication();
        requireAuthority(authentication, "SCOPE_" + OpenAiDeOAuthConfiguration.READ_SCOPE);
        String subject = authentication.getName();
        return connectionService.resolveActiveLearningSessionSkillpilotId(subject);
    }

    @Override
    public void requireWriteAccess(McpTransportContext transportContext) {
        if (!properties.isWritesEnabled()) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Schreibende SkillPilot-Aktionen sind vorübergehend deaktiviert. "
                            + "Die Verbindung bleibt gültig; bitte versuche es später erneut.");
        }
        requireAuthority(
                requireAuthentication(),
                "SCOPE_" + OpenAiDeOAuthConfiguration.WRITE_SCOPE);
    }

    @Override
    public String authenticationChallenge() {
        return OpenAiDeOAuthConfiguration.authenticationChallenge(properties);
    }

    @Override
    public String insufficientScopeChallenge() {
        return OpenAiDeOAuthConfiguration.insufficientScopeChallenge(properties);
    }

    private Authentication requireAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException("OpenAI-DE authentication is required.");
        }
        return authentication;
    }

    private void requireAuthority(Authentication authentication, String requiredAuthority) {
        boolean granted = authentication.getAuthorities().stream()
                .anyMatch(authority -> requiredAuthority.equals(authority.getAuthority()));
        if (!granted) {
            throw new AccessDeniedException("Required OpenAI-DE scope is missing.");
        }
    }
}
