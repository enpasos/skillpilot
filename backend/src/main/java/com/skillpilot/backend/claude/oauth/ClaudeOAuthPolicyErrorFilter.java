package com.skillpilot.backend.claude.oauth;

import com.skillpilot.backend.oauth.AuthenticatedClientPolicy;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.dao.DataAccessException;
import org.springframework.web.filter.OncePerRequestFilter;

/** Gives an already running legacy OAuth process a sanitized fail-closed cutover response. */
final class ClaudeOAuthPolicyErrorFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        try {
            chain.doFilter(request, response);
        } catch (AuthenticatedClientPolicy.PolicyRejectedException exception) {
            if (response.isCommitted()) throw exception;
            error(response, HttpServletResponse.SC_UNAUTHORIZED, "invalid_client");
        } catch (DataAccessException exception) {
            if (response.isCommitted()) throw exception;
            error(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE, "temporarily_unavailable");
        }
    }

    private static void error(HttpServletResponse response, int status, String code) throws IOException {
        response.resetBuffer();
        response.setStatus(status);
        response.setHeader("Cache-Control", "no-store");
        response.setContentType("application/json");
        response.getWriter().write("{\"error\":\"" + code + "\"}");
    }
}
