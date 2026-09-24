package com.skillpilot.backend.openai.de.oauth;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Collections;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.server.authorization.authentication.OAuth2ClientAuthenticationToken;
import org.springframework.security.web.authentication.AuthenticationConverter;
import org.springframework.util.StringUtils;

final class OpenAiDePublicRevocationClientAuthenticationConverter implements AuthenticationConverter {
    private final String expectedClientId;

    OpenAiDePublicRevocationClientAuthenticationConverter(String expectedClientId) {
        this.expectedClientId = expectedClientId;
    }

    static final String PUBLIC_REVOCATION_REQUEST = "skillpilot_openai_de_public_revocation_request";

    @Override
    public Authentication convert(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod())
                || !OpenAiDeOAuthConfiguration.REVOCATION_ENDPOINT.equals(request.getRequestURI())) {
            return null;
        }
        String clientId = request.getParameter("client_id");
        if (request.getHeader("Authorization") != null
                || request.getParameter("client_assertion") != null
                || request.getParameter("client_assertion_type") != null
                || !expectedClientId.equals(clientId)
                || !StringUtils.hasText(clientId)
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
