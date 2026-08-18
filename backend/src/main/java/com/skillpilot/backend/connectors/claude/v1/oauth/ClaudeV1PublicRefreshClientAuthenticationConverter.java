package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.util.StringUtils;

/** Recognizes a refresh request from one of the two pre-registered public CIMD clients. */
final class ClaudeV1PublicRefreshClientAuthenticationConverter implements AuthenticationConverter {

    @Override
    public Authentication convert(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod())
                || !ClaudeV1Contract.INTERNAL_TOKEN_PATH.equals(request.getRequestURI())
                || !AuthorizationGrantType.REFRESH_TOKEN.getValue().equals(single(request, "grant_type"))) {
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
                Collections.singletonMap("grant_type", AuthorizationGrantType.REFRESH_TOKEN.getValue()));
    }

    private static String single(HttpServletRequest request, String name) {
        String[] values = request.getParameterValues(name);
        return values != null && values.length == 1 ? values[0] : null;
    }
}
