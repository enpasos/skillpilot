package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.config.RawHttpServletRequest;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Enumeration;
import org.springframework.web.filter.OncePerRequestFilter;

/** Enforces the Streamable HTTP Origin check before bearer-token processing. */
final class ClaudeV1McpOriginFilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String rawUri = RawHttpServletRequest.requestUri(request);
        return rawUri != null && !ClaudeV1Contract.INTERNAL_MCP_PATH.equals(rawUri);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        Enumeration<String> origins = request.getHeaders("Origin");
        if (origins == null || !origins.hasMoreElements()) {
            // Remote MCP clients, including Anthropic's cloud broker and Claude Code, are not
            // browsers and normally send no Origin header. MCP permits that case.
            filterChain.doFilter(request, response);
            return;
        }

        String origin = origins.nextElement();
        boolean multipleValues = origins.hasMoreElements() || (origin != null && origin.contains(","));
        if (!multipleValues && (origin == null || origin.isBlank())) {
            // Match the MCP SDK rule: an absent or empty Origin is the non-browser case.
            filterChain.doFilter(request, response);
            return;
        }
        if (!multipleValues && ClaudeV1Contract.ALLOWED_MCP_ORIGINS.contains(origin)) {
            filterChain.doFilter(request, response);
            return;
        }

        response.sendError(HttpServletResponse.SC_FORBIDDEN);
    }
}
