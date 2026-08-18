package com.skillpilot.backend.connectors.claude.v1.observability;

import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Provider-bounded telemetry recording operation counters and latencies for Claude v1
 * without storing learner IDs, tokens, or prompt content.
 */
@Component
@ConditionalOnClaudeV1Enabled
public class ClaudeV1Telemetry {

    private static final Logger LOGGER = LoggerFactory.getLogger(ClaudeV1Telemetry.class);

    private final ConcurrentHashMap<String, AtomicLong> operationCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, AtomicLong> errorCounts = new ConcurrentHashMap<>();

    public void recordOperation(String operationName, long durationMillis, boolean success) {
        if (operationName == null || operationName.isBlank()) {
            return;
        }
        operationCounts.computeIfAbsent(operationName, k -> new AtomicLong(0)).incrementAndGet();
        if (!success) {
            errorCounts.computeIfAbsent(operationName, k -> new AtomicLong(0)).incrementAndGet();
            LOGGER.warn("Claude v1 operation '{}' completed with error in {} ms", operationName, durationMillis);
        } else {
            LOGGER.debug("Claude v1 operation '{}' succeeded in {} ms", operationName, durationMillis);
        }
    }

    public long getOperationCount(String operationName) {
        AtomicLong counter = operationCounts.get(operationName);
        return counter != null ? counter.get() : 0L;
    }

    public long getErrorCount(String operationName) {
        AtomicLong counter = errorCounts.get(operationName);
        return counter != null ? counter.get() : 0L;
    }
}
