package com.skillpilot.backend.openai.de.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class OpenAiDeBootstrapIssuanceRateLimiterTest {

    private MutableClock clock;
    private OpenAiDeBootstrapIssuanceRateLimiter limiter;

    @BeforeEach
    void setUp() {
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.getRateLimit().setBootstrapIssuerRequests(1);
        properties.getRateLimit().setBootstrapIssuerProcessGlobalRequests(2);
        clock = new MutableClock(Instant.parse("2026-08-09T12:00:00Z"));
        limiter = new OpenAiDeBootstrapIssuanceRateLimiter(
                properties.getRateLimit(),
                new OpenAiDeBootstrapCrypto(
                        "issuer-rate-limit-test-secret".getBytes(StandardCharsets.UTF_8),
                        new SecureRandom()),
                clock);
    }

    @Test
    void limitsOneAuthorizationMajorAndClientTupleWithoutExposingIt() {
        limiter.requirePermit("authorization-secret", 1, "confidential-client");

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> limiter.requirePermit(
                        "authorization-secret",
                        1,
                        "confidential-client"))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.RATE_LIMITED);
    }

    @Test
    void appliesOneAggregateBudgetAcrossAuthorizationReferences() {
        limiter.requirePermit("authorization-a", 1, "confidential-client");
        limiter.requirePermit("authorization-b", 1, "confidential-client");

        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> limiter.requirePermit(
                        "authorization-c",
                        1,
                        "confidential-client"))
                .extracting(OpenAiDeBootstrapException::code)
                .isEqualTo(OpenAiDeBootstrapErrorCode.RATE_LIMITED);
    }

    @Test
    void resetsTheAuthorizationBudgetAfterTheConfiguredWindow() {
        limiter.requirePermit("authorization-secret", 1, "confidential-client");
        assertThatExceptionOfType(OpenAiDeBootstrapException.class)
                .isThrownBy(() -> limiter.requirePermit(
                        "authorization-secret",
                        1,
                        "confidential-client"));

        clock.advance(Duration.ofMinutes(1));

        limiter.requirePermit("authorization-secret", 1, "confidential-client");
    }

    private static final class MutableClock extends Clock {
        private Instant current;

        private MutableClock(Instant current) {
            this.current = current;
        }

        private void advance(Duration duration) {
            current = current.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return current;
        }
    }
}
