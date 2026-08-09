package com.skillpilot.backend.openai.de.observability;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry.Event;
import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class OpenAiDeOperationalTelemetryTest {

    @Test
    void registersOnlyBoundedEventTagsAndNeverAcceptsSensitiveDimensions() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeOperationalTelemetry telemetry = new OpenAiDeOperationalTelemetry(registry);

        for (Event event : Event.values()) {
            telemetry.record(event);
        }

        Set<String> tags = registry.find(OpenAiDeOperationalTelemetry.EVENT_METRIC)
                .counters()
                .stream()
                .map(counter -> counter.getId().getTag("event"))
                .collect(Collectors.toSet());
        assertThat(tags).containsExactlyInAnyOrder(
                "oauth_failure",
                "refresh_failure",
                "session_required",
                "http_401",
                "http_403",
                "http_409",
                "http_429",
                "issuer_rate_limited",
                "timeout",
                "replay_rejected",
                "cross_provider_rejected",
                "tool_exception");
        assertThat(registry.getMeters())
                .allSatisfy(meter -> assertThat(meter.getId().getTags())
                        .extracting(tag -> tag.getKey())
                        .containsExactly("event"));
        assertThat(registry.getMeters())
                .extracting(Meter::getId)
                .extracting(Object::toString)
                .noneMatch(value -> value.contains("skillpilotId") || value.contains("token"));
    }
}
