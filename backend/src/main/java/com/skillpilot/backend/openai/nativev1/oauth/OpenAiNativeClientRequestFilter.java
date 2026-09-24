package com.skillpilot.backend.openai.nativev1.oauth;

import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthConfiguration;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.web.filter.OncePerRequestFilter;

/** A public native client never falls back from supplied confidential credentials. */
public final class OpenAiNativeClientRequestFilter extends OncePerRequestFilter {
    private final String clientId;
    public OpenAiNativeClientRequestFilter(String clientId) { this.clientId = clientId; }
    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (clientId.equals(request.getParameter("client_id"))) {
            for (String parameter : List.of("client_id", "redirect_uri", "code", "code_verifier", "grant_type", "resource", "state", "code_challenge", "code_challenge_method", "refresh_token", "token")) {
                var values = request.getParameterValues(parameter);
                if (values != null && values.length != 1) { reject(response); return; }
            }
            if ((OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT.equals(request.getRequestURI())
                    || OpenAiDeOAuthConfiguration.REVOCATION_ENDPOINT.equals(request.getRequestURI()))
                    && (request.getHeader("Authorization") != null || request.getParameter("client_secret") != null
                    || request.getParameter("client_assertion") != null)) { reject(response); return; }
        }
        chain.doFilter(request, response);
    }
    private static void reject(HttpServletResponse response) throws IOException {
        response.setStatus(400); response.setHeader("Cache-Control", "no-store"); response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"invalid_request\"}");
    }
}
