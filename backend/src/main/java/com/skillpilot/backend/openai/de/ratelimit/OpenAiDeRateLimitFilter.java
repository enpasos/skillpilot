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
        return !properties.isEnabled() || limitFor(request.getRequestURI()) == null;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        Limit limit = limitFor(request.getRequestURI());
        if (limit == null || limit.requests() <= 0) {
            reject(response, windowMillis());
            return;
        }

        long now = clock.millis();
        long window = windowMillis();
        String clientKey = clientKey(limit.name(), request.getRemoteAddr(), now);
        WindowCounter counter = counters.computeIfAbsent(clientKey, ignored -> new WindowCounter(now + window));
        long retryAfterMillis = counter.acquire(now, window, limit.requests());
        if (retryAfterMillis > 0) {
            reject(response, retryAfterMillis);
            return;
        }
        filterChain.doFilter(request, response);
    }

    private String clientKey(String group, String remoteAddress, long now) {
        int maximum = Math.max(1, properties.getMaxClientBuckets());
        if (counters.size() >= maximum) {
            counters.entrySet().removeIf(entry -> entry.getValue().expired(now));
        }
        String addressBucket = counters.size() >= maximum
                ? OVERFLOW_BUCKET
                : digest(remoteAddress == null ? "unknown" : remoteAddress);
        return group + ':' + addressBucket;
    }

    private void reject(HttpServletResponse response, long retryAfterMillis) throws IOException {
        telemetry.record(Event.RATE_LIMITED);
        response.setStatus(429);
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader(HttpHeaders.PRAGMA, "no-cache");
        response.setHeader(HttpHeaders.RETRY_AFTER, Long.toString(Math.max(1, (retryAfterMillis + 999) / 1000)));
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"error\":\"rate_limited\",\"error_description\":\"Too many requests. Retry later.\"}");
    }

    private long windowMillis() {
        Duration configured = properties.getWindow();
        if (configured == null || configured.isZero() || configured.isNegative()) {
            return Duration.ofMinutes(1).toMillis();
        }
        return configured.toMillis();
    }

    private Limit limitFor(String path) {
        if (path == null) {
            return null;
        }
        if (path.equals(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH)
                || path.startsWith(OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH + "/")) {
            return new Limit("mcp", properties.getMcpRequests());
        }
        if (OpenAiDeOAuthMetadataController.AUTHORIZATION_SERVER_WELL_KNOWN_PATH.equals(path)
                || OpenAiDeOAuthMetadataController.OPENID_CONFIGURATION_PATH.equals(path)
                || OpenAiDeOAuthMetadataController.PROTECTED_RESOURCE_METADATA_PATH.equals(path)
                || OpenAiAppsChallengeController.PATH.equals(path)) {
            return new Limit("metadata", properties.getMetadataRequests());
        }
        if (path.startsWith("/api/openai/v1/oauth")) {
            return new Limit("oauth", properties.getOauthRequests());
        }
        if (path.startsWith("/api/ui/learners/") && path.contains("/openai/v1/")) {
            return new Limit("ui", properties.getUiRequests());
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

    private record Limit(String name, int requests) {
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
