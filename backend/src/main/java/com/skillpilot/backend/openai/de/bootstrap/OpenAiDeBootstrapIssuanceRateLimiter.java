package com.skillpilot.backend.openai.de.bootstrap;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.time.Clock;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Per-instance issuance budget keyed by a pseudonymized OAuth authorization,
 * contract major, and confidential client.
 *
 * <p>A trusted gateway must additionally enforce a shared aggregate budget in
 * multi-instance deployments.</p>
 */
@Component
@ConditionalOnProperty(
        name = {
            "skillpilot.openai.coach.v1.enabled",
            "skillpilot.openai.coach.v1.oauth.enabled"
        },
        havingValue = "true")
public final class OpenAiDeBootstrapIssuanceRateLimiter {

    private static final String GLOBAL_BUCKET = "bootstrap-issuer:global";
    private static final String OVERFLOW_BUCKET = "overflow";

    private final OpenAiDeProperties.RateLimit properties;
    private final OpenAiDeBootstrapCrypto crypto;
    private final Clock clock;
    private final Map<String, WindowCounter> counters = new ConcurrentHashMap<>();

    @Autowired
    public OpenAiDeBootstrapIssuanceRateLimiter(
            OpenAiDeProperties properties,
            OpenAiDeBootstrapCrypto crypto) {
        this(properties.getRateLimit(), crypto, Clock.systemUTC());
    }

    OpenAiDeBootstrapIssuanceRateLimiter(
            OpenAiDeProperties.RateLimit properties,
            OpenAiDeBootstrapCrypto crypto,
            Clock clock) {
        this.properties = properties;
        this.crypto = crypto;
        this.clock = clock;
    }

    public void requirePermit(
            String oauthAuthorizationReference,
            int contractMajor,
            String oauthClientId) {
        long now = clock.millis();
        long window = windowMillis();
        String authorizationBucket = boundedAuthorizationBucket(
                oauthAuthorizationReference,
                contractMajor,
                oauthClientId,
                now);
        long retryAfterMillis = acquire(
                authorizationBucket,
                now,
                window,
                properties.getBootstrapIssuerRequests());
        if (retryAfterMillis <= 0) {
            retryAfterMillis = acquire(
                    GLOBAL_BUCKET,
                    now,
                    window,
                    properties.getBootstrapIssuerProcessGlobalRequests());
        }
        if (retryAfterMillis > 0) {
            throw new OpenAiDeBootstrapException(OpenAiDeBootstrapErrorCode.RATE_LIMITED);
        }
    }

    private String boundedAuthorizationBucket(
            String oauthAuthorizationReference,
            int contractMajor,
            String oauthClientId,
            long now) {
        int maximum = Math.max(1, properties.getMaxClientBuckets());
        if (counters.size() >= maximum) {
            counters.entrySet().removeIf(entry -> entry.getValue().expired(now));
        }
        String candidate = crypto.issuerRateLimitPseudonym(
                        oauthAuthorizationReference,
                        contractMajor,
                        oauthClientId)
                .value();
        String bounded = counters.size() >= maximum ? OVERFLOW_BUCKET : candidate;
        return "bootstrap-issuer:" + bounded;
    }

    private long acquire(String key, long now, long window, int limit) {
        if (limit <= 0) {
            return window;
        }
        WindowCounter counter =
                counters.computeIfAbsent(key, ignored -> new WindowCounter(now + window));
        return counter.acquire(now, window, limit);
    }

    private long windowMillis() {
        Duration configured = properties.getWindow();
        if (configured == null || configured.isZero() || configured.isNegative()) {
            return Duration.ofMinutes(1).toMillis();
        }
        return configured.toMillis();
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
