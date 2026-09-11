package com.skillpilot.backend.openai.de.oauth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;

/** Remote readiness belongs only to the JWT profile. Lookups read cached state and never perform network I/O. */
public final class OpenAiDeCimdMetadataGate implements AutoCloseable {
    static final Duration CACHE_TTL = Duration.ofMinutes(5);
    static final Duration RETRY_INTERVAL = Duration.ofSeconds(30);
    static final Duration ATTEMPT_BUDGET = Duration.ofSeconds(6);
    private static final Logger LOG = LoggerFactory.getLogger(OpenAiDeCimdMetadataGate.class);
    private final Runnable validate;
    private final Clock clock;
    private final Duration budget;
    private volatile Instant validUntil = Instant.EPOCH;
    private Instant nextAttempt = Instant.EPOCH;
    private Thread worker;
    private CompletableFuture<Boolean> running = CompletableFuture.completedFuture(false);
    private boolean closed;

    public OpenAiDeCimdMetadataGate(Runnable validate) { this(validate, Clock.systemUTC(), ATTEMPT_BUDGET); }

    OpenAiDeCimdMetadataGate(Runnable validate, Clock clock, Duration budget) {
        if (budget.isNegative() || budget.isZero() || budget.compareTo(ATTEMPT_BUDGET) > 0) {
            throw new IllegalArgumentException("CIMD readiness attempts require a bounded positive deadline.");
        }
        this.validate = validate; this.clock = clock; this.budget = budget;
    }

    public boolean isReady() { return clock.instant().isBefore(validUntil); }

    /** Startup waits at most the fixed budget; an unavailable remote document never stops other profiles. */
    public void initialRefresh() {
        CompletableFuture<Boolean> attempt = startAttempt();
        try {
            attempt.get(budget.toMillis(), TimeUnit.MILLISECONDS);
        } catch (InterruptedException interrupted) {
            Thread.currentThread().interrupt();
            invalidateAndInterrupt();
        } catch (java.util.concurrent.ExecutionException | java.util.concurrent.TimeoutException unavailable) {
            invalidateAndInterrupt();
        }
    }

    /** Reuses Spring scheduling; the scheduler never blocks on HTTP or DNS. One bounded worker per gate maximum. */
    @Scheduled(fixedDelay = 30_000, initialDelay = 30_000)
    public void retry() { startAttempt(); }

    private synchronized CompletableFuture<Boolean> startAttempt() {
        if (closed || (worker != null && worker.isAlive()) || clock.instant().isBefore(nextAttempt)) return running;
        nextAttempt = clock.instant().plus(RETRY_INTERVAL);
        var outcome = new CompletableFuture<Boolean>();
        running = outcome;
        worker = Thread.ofVirtual().name("openai-cimd-readiness").unstarted(() -> {
            long started = System.nanoTime();
            boolean validated = false;
            try {
                validate.run();
                validated = !Thread.currentThread().isInterrupted()
                        && System.nanoTime() - started <= budget.toNanos();
            } catch (RuntimeException unavailable) {
                // No exception message, fetched content, URL, credentials or claims enter diagnostics.
            }
            synchronized (this) {
                validated = validated && !closed;
                validUntil = validated ? clock.instant().plus(CACHE_TTL) : Instant.EPOCH;
                worker = null;
            }
            if (!validated) {
                LOG.warn("oauth_profile provider=openai profile=chatgpt-cimd-jwt result=unavailable reason=METADATA_UNAVAILABLE correlation_id={}",
                        UUID.randomUUID());
            }
            outcome.complete(validated);
        });
        worker.start();
        return outcome;
    }

    private synchronized void invalidateAndInterrupt() {
        validUntil = Instant.EPOCH;
        if (worker != null) worker.interrupt();
    }

    @Override public synchronized void close() {
        closed = true; invalidateAndInterrupt();
    }
}
