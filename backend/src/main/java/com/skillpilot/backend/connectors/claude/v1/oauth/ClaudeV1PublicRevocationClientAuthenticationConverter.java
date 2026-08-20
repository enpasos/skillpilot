package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.util.StringUtils;

/** Recognizes RFC 7009 requests from a pre-registered public Claude v1 client. */
final class ClaudeV1PublicRevocationClientAuthenticationConverter implements AuthenticationConverter {

    static final String PUBLIC_REVOCATION_REQUEST = "claude_v1_public_revocation";

    @Override
    public Authentication convert(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod())
                || !ClaudeV1Contract.INTERNAL_REVOKE_PATH.equals(request.getRequestURI())) {
            return null;
        }
        String clientId = single(request, "client_id");
        if (!StringUtils.hasText(clientId)
                || StringUtils.hasText(request.getHeader("Authorization"))
                || StringUtils.hasText(request.getParameter("client_secret"))
                || StringUtils.hasText(request.getParameter("client_assertion"))) {
            return null;
        }
        return new OAuth2ClientAuthenticationToken(
                clientId,
                ClientAuthenticationMethod.NONE,
                null,
                Collections.singletonMap(PUBLIC_REVOCATION_REQUEST, Boolean.TRUE));
    }

    private static String single(HttpServletRequest request, String name) {
        String[] values = request.getParameterValues(name);
        return values != null && values.length == 1 ? values[0] : null;
    }
}
