package com.skillpilot.backend.openai.de.oauth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

/** Enforces exact RFC 8707 resource binding for the OpenAI Coach V1 MCP endpoint. */
public final class OpenAiDeOAuthResourceValidationFilter extends OncePerRequestFilter {

    private final String mcpUrl;

    public OpenAiDeOAuthResourceValidationFilter(String mcpUrl) {
        this.mcpUrl = mcpUrl;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (OpenAiDeOAuthConfiguration.TOKEN_ENDPOINT.equals(path)) {
            return false;
        }
        return !OpenAiDeOAuthConfiguration.AUTHORIZATION_ENDPOINT.equals(path)
                || request.getParameter("response_type") == null;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String[] resources = request.getParameterValues("resource");
        if (resources == null || resources.length != 1 || !mcpUrl.equals(resources[0])) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
            response.setHeader(HttpHeaders.PRAGMA, "no-cache");
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.getWriter().write(
                    "{\"error\":\"invalid_target\",\"error_description\":\"The OpenAI Coach V1 MCP resource is required.\"}");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
