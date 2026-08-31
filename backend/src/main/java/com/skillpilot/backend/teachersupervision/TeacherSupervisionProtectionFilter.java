package com.skillpilot.backend.teachersupervision;

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
import java.util.Enumeration;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ServletRequestPathUtils;
import org.springframework.web.util.pattern.PathPattern;
import org.springframework.web.util.pattern.PathPatternParser;

/**
 * Fail-closed HTTP boundary for the teacher-supervision capability API.
 * Client addresses are represented only by short-lived digests in bounded
 * memory and request bodies are retained only for the duration of the request.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
@ConditionalOnTeacherSupervisionEnabled
public class TeacherSupervisionProtectionFilter extends OncePerRequestFilter {

    static final int MAX_BODY_BYTES = 8 * 1024;
    static final int WORKSPACE_REQUESTS_PER_WINDOW = 10;
    static final int OTHER_REQUESTS_PER_WINDOW = 120;
    private static final int MAX_CLIENT_BUCKETS = 10_000;
    private static final Duration RATE_WINDOW = Duration.ofMinutes(1);
    private static final String REAL_IP_HEADER = "X-Real-IP";
    private static final PathPattern NAMESPACE_PATTERN =
            PathPatternParser.defaultInstance.parse(TeacherSupervisionApi.BASE_PATH + "/**");
    private static final PathPattern WORKSPACE_PATTERN =
            PathPatternParser.defaultInstance.parse(TeacherSupervisionApi.BASE_PATH + "/workspaces");

    private final Set<String> allowedOrigins;
    private final int workspaceRequestsPerWindow;
    private final int otherRequestsPerWindow;
    private final long windowMillis;
    private final Clock clock;
    private final BoundedClientCounters workspaceCounters;
    private final BoundedClientCounters otherCounters;

    @Autowired
    public TeacherSupervisionProtectionFilter(
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl,
            @Value("${cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")
                    String corsOrigins) {
        this(
                publicBaseUrl,
                corsOrigins,
                WORKSPACE_REQUESTS_PER_WINDOW,
                OTHER_REQUESTS_PER_WINDOW,
                RATE_WINDOW,
                MAX_CLIENT_BUCKETS,
                Clock.systemUTC());
    }

    TeacherSupervisionProtectionFilter(
            String publicBaseUrl,
            String corsOrigins,
            int workspaceRequestsPerWindow,
            int otherRequestsPerWindow,
            Duration window,
            int maxClientBuckets,
            Clock clock) {
        Set<String> origins = new HashSet<>();
        addOrigin(origins, publicBaseUrl);
        if (corsOrigins != null) {
            Arrays.stream(corsOrigins.split(","))
                    .map(String::trim)
                    .forEach(value -> addOrigin(origins, value));
        }
        this.allowedOrigins = Set.copyOf(origins);
        this.workspaceRequestsPerWindow = Math.max(1, workspaceRequestsPerWindow);
        this.otherRequestsPerWindow = Math.max(1, otherRequestsPerWindow);
        this.windowMillis = window == null || window.isZero() || window.isNegative()
                ? RATE_WINDOW.toMillis()
                : window.toMillis();
        this.clock = clock;
        int boundedClients = Math.max(1, maxClientBuckets);
        long initialResetAt = clock.millis() + windowMillis;
        this.workspaceCounters = new BoundedClientCounters(boundedClients, initialResetAt);
        this.otherCounters = new BoundedClientCounters(boundedClients, initialResetAt);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !isProtectedNamespace(request);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        noStore(response);

        boolean workspaceCreation = isWorkspaceCreation(request);
        long retryAfter = acquire(
                workspaceCreation ? workspaceCounters : otherCounters,
                rateLimitClient(request),
                workspaceCreation ? workspaceRequestsPerWindow : otherRequestsPerWindow);
        if (retryAfter > 0) {
            reject(response, 429, "rate_limited", retryAfter);
            return;
        }

        if ("POST".equals(request.getMethod()) || "DELETE".equals(request.getMethod())) {
            String origin = singleHeader(request, HttpHeaders.ORIGIN);
            if (origin == null || !allowedOrigins.contains(normalizeOrigin(origin))) {
                reject(response, HttpServletResponse.SC_FORBIDDEN, "origin_not_allowed", null);
                return;
            }
        }

        if ("POST".equals(request.getMethod()) && !hasJsonContentType(request)) {
            reject(response, HttpServletResponse.SC_UNSUPPORTED_MEDIA_TYPE, "json_content_type_required", null);
            return;
        }

        if (request.getContentLengthLong() > MAX_BODY_BYTES) {
            reject(response, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "request_too_large", null);
            return;
        }
        byte[] body = request.getInputStream().readNBytes(MAX_BODY_BYTES + 1);
        if (body.length > MAX_BODY_BYTES) {
            reject(response, HttpServletResponse.SC_REQUEST_ENTITY_TOO_LARGE, "request_too_large", null);
            return;
        }

        filterChain.doFilter(new CachedBodyRequest(request, body), response);
    }

    /** Shared with the generic logger so every routable matrix-parameter variant stays body-log free. */
    public static boolean isProtectedNamespace(HttpServletRequest request) {
        try {
            return NAMESPACE_PATTERN.matches(
                    ServletRequestPathUtils.parse(request).pathWithinApplication());
        } catch (IllegalArgumentException exception) {
            return rawNamespaceFallback(request);
        }
    }

    private static boolean isWorkspaceCreation(HttpServletRequest request) {
        if (!"POST".equals(request.getMethod())) {
            return false;
        }
        try {
            return WORKSPACE_PATTERN.matches(
                    ServletRequestPathUtils.parse(request).pathWithinApplication());
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private static boolean rawNamespaceFallback(HttpServletRequest request) {
        String requestUri = RawHttpServletRequest.requestUri(request);
        if (requestUri == null) {
            return false;
        }
        String contextPath = request.getContextPath();
        if (contextPath != null && !contextPath.isEmpty()) {
            if (!requestUri.startsWith(contextPath)) {
                return false;
            }
            requestUri = requestUri.substring(contextPath.length());
        }
        String[] expected = {"api", "ui", "teacher-supervision", "v1"};
        String[] actual = requestUri.split("/", -1);
        if (actual.length < expected.length + 1 || !actual[0].isEmpty()) {
            return false;
        }
        for (int index = 0; index < expected.length; index++) {
            String segment = actual[index + 1];
            int parameters = segment.indexOf(';');
            if (parameters >= 0) {
                segment = segment.substring(0, parameters);
            }
            if (!expected[index].equals(segment)) {
                return false;
            }
        }
        return true;
    }

    private static boolean hasJsonContentType(HttpServletRequest request) {
        try {
            return MediaType.APPLICATION_JSON.isCompatibleWith(
                    MediaType.parseMediaType(request.getContentType()));
        } catch (RuntimeException exception) {
            return false;
        }
    }

    private long acquire(BoundedClientCounters counters, String remoteAddress, int requestsPerWindow) {
        long now = clock.millis();
        String candidate = digest(remoteAddress == null ? "unknown" : remoteAddress);
        return counters.acquire(candidate, now, windowMillis, requestsPerWindow);
    }

    /**
     * Trusts X-Real-IP only across the verified local proxy hop. The raw
     * transport request is used so forwarding wrappers and X-Forwarded-For
     * cannot manufacture additional rate-limit buckets.
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

    int workspaceClientBucketCount() {
        return workspaceCounters.clientCount();
    }

    int otherClientBucketCount() {
        return otherCounters.clientCount();
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

    private static void noStore(HttpServletResponse response) {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader(HttpHeaders.PRAGMA, "no-cache");
    }

    private static void reject(HttpServletResponse response, int status, String code, Long retryAfter)
            throws IOException {
        response.setStatus(status);
        noStore(response);
        response.setHeader("X-Content-Type-Options", "nosniff");
        if (retryAfter != null) {
            response.setHeader(
                    HttpHeaders.RETRY_AFTER,
                    Long.toString(Math.max(1, (retryAfter + 999) / 1_000)));
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
