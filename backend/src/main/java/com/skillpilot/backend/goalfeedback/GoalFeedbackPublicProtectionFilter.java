package com.skillpilot.backend.goalfeedback;

import com.skillpilot.backend.config.RawHttpServletRequest;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ReadListener;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletInputStream;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.util.Arrays;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Bounded same-site intake boundary; no client network metadata is persisted. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
@ConditionalOnExpression("${skillpilot.goal-feedback.enabled:${SKILLPILOT_GOAL_FEEDBACK_ENABLED:false}}")
public class GoalFeedbackPublicProtectionFilter extends OncePerRequestFilter {

    public static final String SUBMISSION_PATH = "/api/public/goal-feedback/v1/submissions";
    private static final String OVERFLOW_BUCKET = "overflow";

    private final Set<String> allowedOrigins;
    private final int requestsPerWindow;
    private final long windowMillis;
    private final int maxClientBuckets;
    private final Clock clock;
    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Autowired
    public GoalFeedbackPublicProtectionFilter(
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl,
            @Value("${cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}") String corsOrigins,
            @Value("${skillpilot.goal-feedback.public.rate-limit.requests:${SKILLPILOT_GOAL_FEEDBACK_PUBLIC_REQUESTS_PER_WINDOW:10}}")
                    int requestsPerWindow,
            @Value("${skillpilot.goal-feedback.public.rate-limit.window:${SKILLPILOT_GOAL_FEEDBACK_PUBLIC_RATE_WINDOW:PT1M}}")
                    Duration window,
            @Value("${skillpilot.goal-feedback.public.rate-limit.max-client-buckets:${SKILLPILOT_GOAL_FEEDBACK_PUBLIC_MAX_CLIENT_BUCKETS:10000}}")
                    int maxClientBuckets) {
        this(publicBaseUrl, corsOrigins, requestsPerWindow, window, maxClientBuckets, Clock.systemUTC());
    }

    GoalFeedbackPublicProtectionFilter(
            String publicBaseUrl,
            String corsOrigins,
            int requestsPerWindow,
            Duration window,
            int maxClientBuckets,
            Clock clock) {
        Set<String> origins = new HashSet<>();
        addOrigin(origins, publicBaseUrl);
        if (corsOrigins != null) {
            Arrays.stream(corsOrigins.split(",")).map(String::trim).forEach(value -> addOrigin(origins, value));
        }
        this.allowedOrigins = Set.copyOf(origins);
        this.requestsPerWindow = Math.max(1, requestsPerWindow);
        this.windowMillis = window == null || window.isZero() || window.isNegative()
                ? Duration.ofMinutes(1).toMillis()
                : window.toMillis();
        this.maxClientBuckets = Math.max(1, maxClientBuckets);
        this.clock = clock;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = RawHttpServletRequest.requestUri(request);
        return path == null || !"POST".equals(request.getMethod()) || !SUBMISSION_PATH.equals(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        String origin = singleHeader(request, HttpHeaders.ORIGIN);
        if (origin == null || !allowedOrigins.contains(normalizeOrigin(origin))) {
            reject(response, HttpServletResponse.SC_FORBIDDEN, "origin_not_allowed", null);
            return;
        }
        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(request.getContentType());
        } catch (RuntimeException exception) {
            reject(response, HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE, "json_content_type_required", null);
            return;
        }
        if (!MediaType.APPLICATION_JSON.isCompatibleWith(mediaType)) {
            reject(response, HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE, "json_content_type_required", null);
            return;
        }
        long retryAfter = acquire(request.getRemoteAddr());
        if (retryAfter > 0) {
            reject(response, 429, "rate_limited", retryAfter);
            return;
        }
        if (request.getContentLengthLong() > GoalFeedbackSubmissionService.MAX_BODY_BYTES) {
            reject(response, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "request_too_large", null);
            return;
        }
        byte[] body = request.getInputStream().readNBytes(GoalFeedbackSubmissionService.MAX_BODY_BYTES + 1);
        if (body.length > GoalFeedbackSubmissionService.MAX_BODY_BYTES) {
            reject(response, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "request_too_large", null);
            return;
        }
        filterChain.doFilter(new CachedBodyRequest(request, body), response);
    }

    private long acquire(String remoteAddress) {
        long now = clock.millis();
        if (counters.size() >= maxClientBuckets) {
            counters.entrySet().removeIf(entry -> entry.getValue().expired(now));
        }
        String candidate = digest(remoteAddress == null ? "unknown" : remoteAddress);
        String key = counters.size() >= maxClientBuckets ? OVERFLOW_BUCKET : candidate;
        WindowCounter counter = counters.computeIfAbsent(key, ignored -> new WindowCounter(now + windowMillis));
        return counter.acquire(now, windowMillis, requestsPerWindow);
    }

    private static String singleHeader(HttpServletRequest request, String name) {
        Enumeration<String> values = request.getHeaders(name);
        if (values == null || !values.hasMoreElements()) {
            return null;
        }
        String value = values.nextElement();
        return values.hasMoreElements() ? null : value;
    }

    private static void addOrigin(Set<String> target, String value) {
        String origin = normalizeOrigin(value);
        if (origin != null) {
            target.add(origin);
        }
    }

    private static String normalizeOrigin(String value) {
        if (value == null || value.isBlank() || "*".equals(value) || "null".equals(value)) {
            return null;
        }
        try {
            URI uri = URI.create(value.trim());
            if (!uri.isAbsolute()
                    || !("https".equals(uri.getScheme()) || "http".equals(uri.getScheme()))
                    || uri.getHost() == null
                    || uri.getUserInfo() != null
                    || uri.getQuery() != null
                    || uri.getFragment() != null) {
                return null;
            }
            int port = uri.getPort();
            return uri.getScheme() + "://" + uri.getHost().toLowerCase()
                    + (port < 0 ? "" : ":" + port);
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private static String digest(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(hash, 0, 12);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private static void reject(HttpServletResponse response, int status, String code, Long retryAfter)
            throws IOException {
        response.setStatus(status);
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader("X-Content-Type-Options", "nosniff");
        if (retryAfter != null) {
            response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(Math.max(1, (retryAfter + 999) / 1_000)));
        }
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"" + code + "\"}");
    }

    private static final class WindowCounter {
        private long resetAt;
        private int requests;

        private WindowCounter(long resetAt) {
            this.resetAt = resetAt;
        }

        private synchronized long acquire(long now, long window, int limit) {
            if (now >= resetAt) {
                resetAt = now + window;
                requests = 0;
            }
            if (requests >= limit) {
                return Math.max(1, resetAt - now);
            }
            requests++;
            return 0;
        }

        private synchronized boolean expired(long now) {
            return now >= resetAt;
        }
    }

    private static final class CachedBodyRequest extends HttpServletRequestWrapper {
        private final byte[] body;

        private CachedBodyRequest(HttpServletRequest request, byte[] body) {
            super(request);
            this.body = body;
        }

        @Override
        public ServletInputStream getInputStream() {
            ByteArrayInputStream input = new ByteArrayInputStream(body);
            return new ServletInputStream() {
                @Override
                public boolean isFinished() {
                    return input.available() == 0;
                }

                @Override
                public boolean isReady() {
                    return true;
                }

                @Override
                public void setReadListener(ReadListener readListener) {
                    throw new UnsupportedOperationException("Asynchronous request reads are not supported");
                }

                @Override
                public int read() {
                    return input.read();
                }
            };
        }

        @Override
        public BufferedReader getReader() {
            return new BufferedReader(new InputStreamReader(getInputStream(), StandardCharsets.UTF_8));
        }

        @Override
        public int getContentLength() {
            return body.length;
        }

        @Override
        public long getContentLengthLong() {
            return body.length;
        }
    }
}
