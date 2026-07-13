package com.skillpilot.backend.claude.oauth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

/** Enforces RFC 8707 resource binding for the single SkillPilot MCP resource. */
public final class ClaudeOAuthResourceValidationFilter extends OncePerRequestFilter {

    private final String mcpUrl;

    public ClaudeOAuthResourceValidationFilter(String mcpUrl) {
        this.mcpUrl = stripTrailingSlash(mcpUrl);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if ("/oauth2/token".equals(path)) {
            return false;
        }
        // The initial authorization request carries response_type and resource.
        // The subsequent consent POST carries only the server-issued state and
        // must be allowed to reuse the already validated request.
        return !"/oauth2/authorize".equals(path) || request.getParameter("response_type") == null;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String[] resources = request.getParameterValues("resource");
        if (resources == null
                || resources.length != 1
                || !mcpUrl.equals(stripTrailingSlash(resources[0]))) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
            response.setHeader(HttpHeaders.PRAGMA, "no-cache");
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"error\":\"invalid_target\",\"error_description\":\"The SkillPilot MCP resource is required.\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private static String stripTrailingSlash(String value) {
        String normalized = value == null ? "" : value.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }
}
