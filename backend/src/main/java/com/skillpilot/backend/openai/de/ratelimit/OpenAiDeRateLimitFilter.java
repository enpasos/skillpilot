package com.skillpilot.backend.openai.de.ratelimit;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.OpenAiAppsChallengeController;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry.Event;
import com.skillpilot.backend.openai.de.oauth.OpenAiDeOAuthMetadataController;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Bounded per-instance protection for the public OpenAI Coach V1 provider boundary.
 *
 * <p>The filter uses only the servlet container's normalized remote address
 * and never parses forwarding headers itself. Production must expose the
 * backend only through a trusted proxy which replaces untrusted forwarding
 * headers. Multi-instance deployments additionally need a shared gateway
 * limit.</p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 20)
@ConditionalOnExpression(
        "${skillpilot.openai.coach.v1.enabled:false} || "
                + "${skillpilot.openai.coach.v1.bootstrap-enabled:false}")
public final class OpenAiDeRateLimitFilter extends OncePerRequestFilter {

    private static final String OVERFLOW_BUCKET = "overflow";
    private static final String BOOTSTRAP_GROUP = "bootstrap";
    private static final String BOOTSTRAP_GLOBAL_BUCKET = BOOTSTRAP_GROUP + ":global";
    private static final String BOOTSTRAP_AUTHORIZATION_PREFIX = "SkillPilotSetup ";
    private static final Pattern BOOTSTRAP_AUTHORIZATION_PATTERN =
            Pattern.compile("^SkillPilotSetup spc_[A-Za-z0-9_-]{43}$");
    private static final String BOOTSTRAP_REJECTION_BODY =
            "{\"schemaVersion\":1,\"status\":\"TEMPORARILY_UNAVAILABLE\","
                    + "\"fallbackUrl\":\"https://skillpilot.com/\"}";
    private static final String DEFAULT_REJECTION_BODY =
            "{\"error\":\"rate_limited\","
                    + "\"error_description\":\"Too many requests. Retry later.\"}";

    private final OpenAiDeProperties.RateLimit properties;
    private final OpenAiDeOperationalTelemetry telemetry;
    private final Clock clock;
    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Autowired
    public OpenAiDeRateLimitFilter(
            OpenAiDeProperties properties,
            OpenAiDeOperationalTelemetry telemetry) {
        this(properties.getRateLimit(), telemetry, Clock.systemUTC());
    }

    OpenAiDeRateLimitFilter(
            OpenAiDeProperties.RateLimit properties,
            OpenAiDeOperationalTelemetry telemetry,
            Clock clock) {
        this.properties = properties;
        this.telemetry = telemetry;
        this.clock = clock;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !properties.isEnabled() || limitFor(request) == null;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Limit limit = limitFor(request);
        if (limit == null || limit.requests() <= 0) {
            reject(request, response, windowMillis(), limit != null && limit.bootstrap());
            return;
        }

        long now = clock.millis();
        long window = windowMillis();
        long retryAfterMillis = acquire(
                clientKey(limit.name(), request.getRemoteAddr(), now),
                now,
                window,
                limit.requests());
        if (limit.bootstrap() && retryAfterMillis <= 0) {
            retryAfterMillis = acquire(
                    bootstrapCapabilityKey(request, now),
                    now,
                    window,
                    properties.getBootstrapCapabilityRequests());
        }
        if (limit.bootstrap() && retryAfterMillis <= 0) {
            retryAfterMillis = acquire(
                    BOOTSTRAP_GLOBAL_BUCKET,
                    now,
                    window,
                    properties.getBootstrapProcessGlobalRequests());
        }
        if (retryAfterMillis > 0) {
            reject(request, response, retryAfterMillis, limit.bootstrap());
            return;
        }
        filterChain.doFilter(request, response);
    }

    private long acquire(String key, long now, long window, int limit) {
        if (limit <= 0) {
            return window;
        }
        WindowCounter counter =
                counters.computeIfAbsent(key, ignored -> new WindowCounter(now + window));
        return counter.acquire(now, window, limit);
    }

    private String bootstrapCapabilityKey(HttpServletRequest request, long now) {
        String authorization = request.getHeader(HttpHeaders.AUTHORIZATION);
        String opaqueBucket = "missing-or-invalid";
        if (authorization != null
                && authorization.startsWith(BOOTSTRAP_AUTHORIZATION_PREFIX)
                && BOOTSTRAP_AUTHORIZATION_PATTERN.matcher(authorization).matches()) {
            opaqueBucket = digest(authorization);
        }
        return boundedBucketKey(BOOTSTRAP_GROUP + "-capability", opaqueBucket, now);
    }

    private String clientKey(String group, String remoteAddress, long now) {
        return boundedBucketKey(
                group,
                digest(remoteAddress == null ? "unknown" : remoteAddress),
                now);
    }

    private String boundedBucketKey(String group, String candidate, long now) {
        int maximum = Math.max(1, properties.getMaxClientBuckets());
        if (counters.size() >= maximum) {
            counters.entrySet().removeIf(entry -> entry.getValue().expired(now));
        }
        String boundedBucket = counters.size() >= maximum ? OVERFLOW_BUCKET : candidate;
        return group + ':' + boundedBucket;
    }

    private void reject(
            HttpServletRequest request,
            HttpServletResponse response,
            long retryAfterMillis,
            boolean bootstrap) throws IOException {
        telemetry.record(Event.RATE_LIMITED);
        response.setStatus(429);
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader(HttpHeaders.PRAGMA, "no-cache");
        response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(Math.max(1, (retryAfterMillis + 999) / 1000)));
        response.setHeader("Referrer-Policy", "no-referrer");
        response.setHeader("X-Content-Type-Options", "nosniff");
        if (bootstrap
                && OpenAiDeV1ContractMetadata.WIDGET_DOMAIN.equals(
                        request.getHeader(HttpHeaders.ORIGIN))) {
            response.setHeader(
                    HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN,
                    OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
            response.setHeader(HttpHeaders.VARY, HttpHeaders.ORIGIN);
        }
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(bootstrap ? BOOTSTRAP_REJECTION_BODY : DEFAULT_REJECTION_BODY);
    }

    private long windowMillis() {
        Duration configured = properties.getWindow();
        if (configured == null || configured.isZero() || configured.isNegative()) {
            return Duration.ofMinutes(1).toMillis();
        }
        return configured.toMillis();
    }

    private Limit limitFor(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path == null) {
            return null;
        }
        if (path.equals(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH)
                || path.startsWith(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH + "/")) {
            return new Limit("mcp", properties.getMcpRequests(), false);
        }
        if (OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH.equals(path)
                || OpenAiDeOAuthMetadataController.OPENID_CONFIGURATION_PATH.equals(path)
                || OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_METADATA_PATH.equals(path)
                || OpenAiAppsChallengeController.PATH.equals(path)) {
            return new Limit("metadata", properties.getMetadataRequests(), false);
        }
        if (path.startsWith("/api/openai/v1/oauth")) {
            return new Limit("oauth", properties.getOauthRequests(), false);
        }
        if (path.startsWith("/api/ui/learners/") && path.contains("/openai/v1/")) {
            return new Limit("ui", properties.getUiRequests(), false);
        }
        if (OpenAiDeV1ContractMetadata.BOOTSTRAP_LAUNCH_PATH.equals(path)
                && "POST".equalsIgnoreCase(request.getMethod())) {
            return new Limit(BOOTSTRAP_GROUP, properties.getBootstrapRequests(), true);
        }
        return null;
    }

    private static String digest(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash, 0, 12);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private record Limit(String name, int requests, boolean bootstrap) {
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
}
