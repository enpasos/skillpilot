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
import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.util.Arrays;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.util.ServletRequestPathUtils;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;
import org.springframework.web.filter.OncePerRequestFilter;

/** Bounded same-site intake boundary; no client network metadata is persisted. */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
@ConditionalOnExpression("${skillpilot.goal-feedback.enabled:${SKILLPILOT_GOAL_FEEDBACK_ENABLED:false}}")
public class GoalFeedbackPublicProtectionFilter extends OncePerRequestFilter {

    public static final String CONTEXT_PATH = "/api/public/goal-feedback/v1/context";
    public static final String CURRENT_BINDING_PATH = "/api/public/goal-feedback/v1/current-binding";
    public static final String SUBMISSION_PATH = "/api/public/goal-feedback/v1/submissions";
    private static final String REAL_IP_HEADER = "X-Real-IP";
    private static final PathPattern CONTEXT_PATTERN =
            PathPatternParser.defaultInstance.parse(CONTEXT_PATH);
    private static final PathPattern CURRENT_BINDING_PATTERN =
            PathPatternParser.defaultInstance.parse(CURRENT_BINDING_PATH);
    private static final PathPattern SUBMISSION_PATTERN =
            PathPatternParser.defaultInstance.parse(SUBMISSION_PATH);
    private final Set<String> allowedOrigins;
    private final int requestsPerWindow;
    private final long windowMillis;
    private final Clock clock;
    private final BoundedClientCounters contextCounters;
    private final BoundedClientCounters submissionCounters;

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
        this.clock = clock;
        int boundedClients = Math.max(1, maxClientBuckets);
        long initialResetAt = clock.millis() + windowMillis;
        this.contextCounters = new BoundedClientCounters(boundedClients, initialResetAt);
        this.submissionCounters = new BoundedClientCounters(boundedClients, initialResetAt);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !isContextRequest(request) && !isCurrentBindingRequest(request) && !isSubmissionRequest(request);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        if (isContextRequest(request) || isCurrentBindingRequest(request)) {
            long retryAfter = acquire(contextCounters, rateLimitClient(request));
            if (retryAfter > 0) {
                reject(response, 429, "rate_limited", retryAfter);
                return;
            }
            filterChain.doFilter(request, response);
            return;
        }
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
        if (request.getContentLengthLong() > GoalFeedbackSubmissionService.MAX_BODY_BYTES) {
            reject(response, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "request_too_large", null);
            return;
        }
        byte[] body = request.getInputStream().readNBytes(GoalFeedbackSubmissionService.MAX_BODY_BYTES + 1);
        if (body.length > GoalFeedbackSubmissionService.MAX_BODY_BYTES) {
            reject(response, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "request_too_large", null);
            return;
        }
        long retryAfter = acquire(submissionCounters, rateLimitClient(request));
        if (retryAfter > 0) {
            reject(response, 429, "rate_limited", retryAfter);
            return;
        }
        filterChain.doFilter(new CachedBodyRequest(request, body), response);
    }

    private static boolean isContextRequest(HttpServletRequest request) {
        return ("GET".equals(request.getMethod()) || "HEAD".equals(request.getMethod()))
                && matchesControllerPath(request, CONTEXT_PATTERN);
    }

    private static boolean isCurrentBindingRequest(HttpServletRequest request) {
        return ("GET".equals(request.getMethod()) || "HEAD".equals(request.getMethod()))
                && matchesControllerPath(request, CURRENT_BINDING_PATTERN);
    }

    private static boolean isSubmissionRequest(HttpServletRequest request) {
        return "POST".equals(request.getMethod())
                && matchesControllerPath(request, SUBMISSION_PATTERN);
    }

    private static boolean matchesControllerPath(HttpServletRequest request, PathPattern pattern) {
        try {
            return pattern.matches(ServletRequestPathUtils.parse(request).pathWithinApplication());
        } catch (IllegalArgumentException exception) {
            // DispatcherServlet uses the same RequestPath parser and cannot route
            // a malformed path to the controller either.
            return false;
        }
    }

    private long acquire(BoundedClientCounters counters, String remoteAddress) {
        long now = clock.millis();
        String candidate = digest(remoteAddress == null ? "unknown" : remoteAddress);
        return counters.acquire(candidate, now, windowMillis, requestsPerWindow);
    }

    /**
     * Trusts a client address only across the verified local proxy hop. The
     * production proxy replaces X-Real-IP with its socket peer, while Spring's
     * forwarding wrapper may expose client-controlled X-Forwarded-For through
     * {@code getRemoteAddr()}; consequently only the raw request is inspected
     * and X-Forwarded-For is ignored completely. Missing, duplicate or invalid
     * X-Real-IP values fail closed to the raw transport peer's shared bucket.
     */
    private static String rateLimitClient(HttpServletRequest request) {
        HttpServletRequest rawRequest = RawHttpServletRequest.unwrap(request);
        if (rawRequest == null) {
            return null;
        }
        String rawPeer = rawRequest.getRemoteAddr();
        if (!isLoopbackIpLiteral(rawPeer)) {
            return rawPeer;
        }
        String realIp = normalizeIpLiteral(singleHeader(rawRequest, REAL_IP_HEADER));
        return realIp == null ? rawPeer : realIp;
    }

    private static boolean isLoopbackIpLiteral(String value) {
        String normalized = normalizeIpLiteral(value);
        if (normalized == null) {
            return false;
        }
        try {
            return InetAddress.getByName(normalized).isLoopbackAddress();
        } catch (UnknownHostException exception) {
            return false;
        }
    }

    /** Parses strict IPv4 and unscoped IPv6 literals without permitting DNS. */
    private static String normalizeIpLiteral(String value) {
        if (value == null || value.isBlank() || !value.equals(value.trim()) || value.length() > 45) {
            return null;
        }
        if (isStrictIpv4Literal(value)) {
            return value;
        }
        if (value.indexOf(':') < 0 || !containsOnlyIpv6LiteralCharacters(value)) {
            return null;
        }
        int dottedSuffix = value.lastIndexOf(':') + 1;
        if (value.indexOf('.') >= 0 && !isStrictIpv4Literal(value.substring(dottedSuffix))) {
            return null;
        }
        try {
            return InetAddress.getByName(value).getHostAddress();
        } catch (UnknownHostException exception) {
            return null;
        }
    }

    private static boolean isStrictIpv4Literal(String value) {
        String[] octets = value.split("\\.", -1);
        if (octets.length != 4) {
            return false;
        }
        for (String octet : octets) {
            if (octet.isEmpty()
                    || octet.length() > 3
                    || (octet.length() > 1 && octet.charAt(0) == '0')) {
                return false;
            }
            int number = 0;
            for (int index = 0; index < octet.length(); index++) {
                char digit = octet.charAt(index);
                if (digit < '0' || digit > '9') {
                    return false;
                }
                number = number * 10 + digit - '0';
            }
            if (number > 255) {
                return false;
            }
        }
        return true;
    }

    private static boolean containsOnlyIpv6LiteralCharacters(String value) {
        for (int index = 0; index < value.length(); index++) {
            char character = value.charAt(index);
            if (!(character == ':'
                    || character == '.'
                    || (character >= '0' && character <= '9')
                    || (character >= 'a' && character <= 'f')
                    || (character >= 'A' && character <= 'F'))) {
                return false;
            }
        }
        return true;
    }

    int contextClientBucketCount() {
        return contextCounters.clientCount();
    }

    int submissionClientBucketCount() {
        return submissionCounters.clientCount();
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

    /**
     * Strictly bounded client buckets plus one separate shared overflow counter.
     * Access-order makes expiry recovery O(1): only the eldest client is ever
     * considered for eviction, and known clients always retain their counter.
     */
    private static final class BoundedClientCounters {
        private final int maximumClients;
        private final LinkedHashMap<String, WindowCounter> clients =
                new LinkedHashMap<>(16, 0.75f, true);
        private final WindowCounter overflow;

        private BoundedClientCounters(int maximumClients, long initialResetAt) {
            this.maximumClients = maximumClients;
            this.overflow = new WindowCounter(initialResetAt);
        }

        private synchronized long acquire(
                String candidate,
                long now,
                long windowMillis,
                int requestsPerWindow) {
            WindowCounter counter = clients.get(candidate);
            if (counter == null) {
                if (clients.size() >= maximumClients) {
                    var eldest = clients.entrySet().iterator();
                    if (eldest.hasNext() && eldest.next().getValue().expired(now)) {
                        eldest.remove();
                    }
                }
                if (clients.size() < maximumClients) {
                    counter = new WindowCounter(now + windowMillis);
                    clients.put(candidate, counter);
                } else {
                    counter = overflow;
                }
            }
            return counter.acquire(now, windowMillis, requestsPerWindow);
        }

        private synchronized int clientCount() {
            return clients.size();
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
