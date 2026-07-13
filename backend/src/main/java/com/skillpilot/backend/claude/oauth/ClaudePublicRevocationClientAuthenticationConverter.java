package com.skillpilot.backend.claude.oauth;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.util.StringUtils;

/** Recognizes RFC 7009 revocation requests from the pre-registered public Claude client. */
final class ClaudePublicRevocationClientAuthenticationConverter implements AuthenticationConverter {

    static final String PUBLIC_REVOCATION_REQUEST = "skillpilot_public_revocation_request";

    @Override
    public Authentication convert(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod()) || !"/oauth2/revoke".equals(request.getRequestURI())) {
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
                Collections.singletonMap(PUBLIC_REVOCATION_REQUEST, Boolean.TRUE));
    }
}
