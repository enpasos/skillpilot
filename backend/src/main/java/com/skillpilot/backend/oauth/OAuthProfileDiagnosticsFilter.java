package com.skillpilot.backend.oauth;

import com.skillpilot.backend.config.RawHttpServletRequest;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Set;
import org.springframework.web.filter.OncePerRequestFilter;

/** Dedicated OAuth/MCP chains only; does not record request bodies, secrets, IDs, or inbound correlation headers. */
public final class OAuthProfileDiagnosticsFilter extends OncePerRequestFilter {
    public static final String CORRELATION_HEADER = "X-SkillPilot-Request-ID";
    private static final Set<String> OPENAI_PATHS = Set.of("/api/openai/v1/oauth2/authorize", "/api/openai/v1/oauth2/token",
            "/api/openai/v1/oauth2/revoke", "/api/openai/v1/oauth2/introspect", "/internal/openai/v1/mcp");
    private static final Set<String> CLAUDE_PATHS = Set.of("/oauth2/authorize", "/oauth2/token", "/oauth2/revoke", "/mcp",
            "/internal/connectors/claude/v1/oauth2/authorize", "/internal/connectors/claude/v1/oauth2/token",
            "/internal/connectors/claude/v1/oauth2/revoke", "/internal/connectors/claude/v1/oauth2/introspect",
            "/internal/connectors/claude/v1/mcp");
    private final String provider;

    public OAuthProfileDiagnosticsFilter(String provider) {
        if (!Set.of("openai", "claude").contains(provider)) throw new IllegalArgumentException("Unknown diagnostics provider.");
        this.provider = provider;
    }

    @Override protected boolean shouldNotFilter(HttpServletRequest request) {
        HttpServletRequest raw = RawHttpServletRequest.unwrap(request);
        String uri = raw == null ? null : raw.getRequestURI();
        return uri == null || !("openai".equals(provider) ? OPENAI_PATHS : CLAUDE_PATHS).contains(uri);
    }

    @Override protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException {
        if (OAuthProfileDiagnostics.hasContext()) {
            chain.doFilter(request, response);
            return;
        }
        String correlation = OAuthProfileDiagnostics.begin(provider);
        boolean threw = false;
        try {
            response.setHeader(CORRELATION_HEADER, correlation);
            chain.doFilter(request, response);
        } catch (IOException | ServletException | RuntimeException | Error failure) {
            threw = true;
            OAuthProfileDiagnostics.markReasonIfAbsent(OAuthProfileDiagnostics.Reason.INTERNAL_ERROR);
            throw failure; // Never pass throwable or message to the logger.
        } finally {
            OAuthProfileDiagnostics.finish(threw ? 500 : response.getStatus());
        }
    }
}
