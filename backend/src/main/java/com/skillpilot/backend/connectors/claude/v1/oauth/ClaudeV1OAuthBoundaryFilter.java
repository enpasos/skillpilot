package com.skillpilot.backend.connectors.claude.v1.oauth;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

/** Validates OAuth endpoint media types and applies a bounded fixed-window abuse budget. */
final class ClaudeV1OAuthBoundaryFilter extends OncePerRequestFilter {

    private record Window(Instant startedAt, int count) {}

    private static final Duration WINDOW = Duration.ofMinutes(1);
    private static final int MAX_TRACKED_CLIENTS = 10_000;

    private final int maxRequestsPerMinute;
    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    ClaudeV1OAuthBoundaryFilter(ClaudeV1Properties properties) {
        this.maxRequestsPerMinute = Objects.requireNonNull(properties, "properties")
                .getMaxAuthorizeRequestsPerClientPerMinute();
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return !ClaudeV1Contract.INTERNAL_AUTHORIZE_PATH.equals(uri)
                && !ClaudeV1Contract.INTERNAL_TOKEN_PATH.equals(uri)
                && !ClaudeV1Contract.INTERNAL_REVOKE_PATH.equals(uri)
                && !(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/csrf").equals(uri)
                && !(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/details").equals(uri)
                && !(ClaudeV1Contract.INTERNAL_CONNECT_PATH + "/bind").equals(uri);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        if (requiresFormEncoding(request) && !hasFormContentType(request)) {
            error(response, HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE, "invalid_content_type");
            return;
        }
        if (requiresFormEncoding(request)
                && request.getQueryString() != null
                && !request.getQueryString().isBlank()) {
            error(response, HttpServletResponse.SC_BAD_REQUEST, "invalid_request");
            return;
        }
        if (!tryAcquire(request.getRequestURI() + "|" + request.getRemoteAddr())) {
            response.setHeader(HttpHeaders.RETRY_AFTER, "60");
            error(response, 429, "rate_limited");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean requiresFormEncoding(HttpServletRequest request) {
        String uri = request.getRequestURI();
        return "POST".equals(request.getMethod())
                && (ClaudeV1Contract.INTERNAL_TOKEN_PATH.equals(uri)
                        || ClaudeV1Contract.INTERNAL_REVOKE_PATH.equals(uri));
    }

    private boolean hasFormContentType(HttpServletRequest request) {
        try {
            MediaType mediaType = MediaType.parseMediaType(request.getContentType());
            return MediaType.APPLICATION_FORM_URLENCODED.getType().equalsIgnoreCase(mediaType.getType())
                    && MediaType.APPLICATION_FORM_URLENCODED.getSubtype()
                            .equalsIgnoreCase(mediaType.getSubtype())
                    && (mediaType.getCharset() == null
                            || StandardCharsets.UTF_8.equals(mediaType.getCharset()));
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    private boolean tryAcquire(String key) {
        Instant now = Instant.now();
        if (!windows.containsKey(key) && windows.size() >= MAX_TRACKED_CLIENTS) {
            windows.entrySet().removeIf(entry -> !now.isBefore(entry.getValue().startedAt().plus(WINDOW)));
            if (windows.size() >= MAX_TRACKED_CLIENTS) {
                return false;
            }
        }
        Window updated = windows.compute(key, (ignored, current) -> {
            if (current == null || !now.isBefore(current.startedAt().plus(WINDOW))) {
                return new Window(now, 1);
            }
            return new Window(current.startedAt(), current.count() + 1);
        });
        return updated.count() <= maxRequestsPerMinute;
    }

    private void error(HttpServletResponse response, int status, String code) throws IOException {
        response.setStatus(status);
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"" + code + "\"}");
    }
}
