package com.skillpilot.backend.claude.oauth;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.util.StringUtils;

/** Recognizes a refresh request from a public CIMD client. */
final class ClaudePublicRefreshClientAuthenticationConverter implements AuthenticationConverter {

    @Override
    public Authentication convert(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod())
                || !AuthorizationGrantType.REFRESH_TOKEN.getValue().equals(request.getParameter("grant_type"))) {
            return null;
        }
        String clientId = request.getParameter("client_id");
        if (!StringUtils.hasText(clientId)
                || request.getParameterValues("client_id") == null
                || request.getParameterValues("client_id").length != 1
                || StringUtils.hasText(request.getParameter("client_secret"))) {
            return null;
        }
        return new OAuth2ClientAuthenticationToken(
                clientId,
                ClientAuthenticationMethod.NONE,
                null,
                Collections.singletonMap("grant_type", AuthorizationGrantType.REFRESH_TOKEN.getValue()));
    }
}
