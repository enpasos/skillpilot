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
        // The raw URI is preferred because framework wrappers can rewrite the path. When it cannot
        // be resolved, fall back to the container URI rather than filtering every request: the
        // browser-facing /connect flow carries a normal same-origin Origin header that is not an
        // allowed MCP origin, and would otherwise be rejected here.
        String rawUri = RawHttpServletRequest.requestUri(request);
        String uri = rawUri != null ? rawUri : request.getRequestURI();
        return !ClaudeV1Contract.INTERNAL_MCP_PATH.equals(uri);
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
