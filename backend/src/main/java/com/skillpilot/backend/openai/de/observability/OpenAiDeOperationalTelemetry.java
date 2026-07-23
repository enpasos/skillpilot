package com.skillpilot.backend.openai.de.observability;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.util.EnumMap;
import java.util.Map;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Privacy-safe counters for the bounded OpenAI-DE operational event set. */
@Component
@ConditionalOnProperty(name = "skillpilot.openai.de.enabled", havingValue = "true")
public final class OpenAiDeOperationalTelemetry {

    public static final String EVENT_METRIC = "skillpilot.openai.de.operational.event";

    public enum Event {
        OAUTH_FAILURE("oauth_failure"),
        REFRESH_FAILURE("refresh_failure"),
        UNAUTHORIZED("http_401"),
        FORBIDDEN("http_403"),
        CONFLICT("http_409"),
        RATE_LIMITED("http_429"),
        TIMEOUT("timeout"),
        REPLAY_REJECTED("replay_rejected"),
        CROSS_PROVIDER_REJECTED("cross_provider_rejected"),
        TOOL_EXCEPTION("tool_exception");

        private final String tag;

        Event(String tag) {
            this.tag = tag;
        }

        public String tag() {
            return tag;
        }
    }

    private final Map<Event, Counter> counters;

    public OpenAiDeOperationalTelemetry(MeterRegistry meterRegistry) {
        Map<Event, Counter> registered = new EnumMap<>(Event.class);
        for (Event event : Event.values()) {
            registered.put(event, Counter.builder(EVENT_METRIC)
                    .description("Bounded operational events for the German OpenAI coach")
                    .tag("event", event.tag())
                    .register(meterRegistry));
        }
        this.counters = Map.copyOf(registered);
    }

    public void record(Event event) {
        if (event != null) {
            counters.get(event).increment();
        }
    }

    public void recordHttpStatus(int status) {
        switch (status) {
            case 401 -> record(Event.UNAUTHORIZED);
            case 403 -> record(Event.FORBIDDEN);
            case 409 -> record(Event.CONFLICT);
            case 429 -> record(Event.RATE_LIMITED);
            default -> {
                // Only the intentionally bounded status set is a metric dimension.
            }
        }
    }
}
