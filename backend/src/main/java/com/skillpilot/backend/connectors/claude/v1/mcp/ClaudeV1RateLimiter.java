package com.skillpilot.backend.connectors.claude.v1.mcp;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Fixed-window request budget per connection.
 *
 * <p>Deliberately a plain in-memory map rather than a scheduled sweeper: the Claude v1 lane is not
 * permitted to add executor or scheduler beans, so stale windows are dropped when they are next
 * touched and the map is bounded by the number of live connections.</p>
 */
final class ClaudeV1RateLimiter {

    private record Window(Instant startedAt, int count) {}

    private static final Duration WINDOW_LENGTH = Duration.ofMinutes(1);
    private static final int MAX_TRACKED_CONNECTIONS = 10_000;

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    /** @return {@code true} when the call fits inside the budget and may proceed */
    boolean tryAcquire(String key, int maxPerMinute) {
        if (key == null || key.isBlank()) {
            return false;
        }
        Instant now = Instant.now();
        if (!windows.containsKey(key) && windows.size() >= MAX_TRACKED_CONNECTIONS) {
            windows.entrySet().removeIf(entry ->
                    !now.isBefore(entry.getValue().startedAt().plus(WINDOW_LENGTH)));
            if (windows.size() >= MAX_TRACKED_CONNECTIONS) {
                return false;
            }
        }
        Window updated = windows.compute(key, (ignored, current) -> {
            if (current == null || !now.isBefore(current.startedAt().plus(WINDOW_LENGTH))) {
                return new Window(now, 1);
            }
            return new Window(current.startedAt(), current.count() + 1);
        });
        return updated.count() <= maxPerMinute;
    }
}
