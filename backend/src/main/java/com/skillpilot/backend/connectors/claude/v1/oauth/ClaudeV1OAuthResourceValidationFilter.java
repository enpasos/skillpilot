package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Objects;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

/** Enforces RFC 8707 resource binding at both authorization and token endpoints. */
final class ClaudeV1OAuthResourceValidationFilter extends OncePerRequestFilter {

    private final String resource;

    ClaudeV1OAuthResourceValidationFilter(String resource) {
        this.resource = Objects.requireNonNull(resource, "resource");
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return !ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH.equals(uri)
                && !ClaudeV1Contract.INTERNAL_TOKEN_PATH.equals(uri);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String[] resources = request.getParameterValues("resource");
        if (resources == null || resources.length != 1 || !resource.equals(resources[0])) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
            response.setHeader(HttpHeaders.PRAGMA, "no-cache");
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"error\":\"invalid_target\",\"error_description\":\"The exact Claude v1 MCP resource is required.\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
