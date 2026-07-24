package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

class OpenAiDeMcpTelemetryTest {

    @Test
    void recordsOnlyBoundedToolAndStatusTagsForSuccessfulAndFailedResults() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeMcpTelemetry telemetry = new OpenAiDeMcpTelemetry(registry);

        telemetry.record(OpenAiDeCoachMcpContract.GET_CONTEXT, () -> result(false));
        telemetry.record(OpenAiDeCoachMcpContract.GET_CONTEXT, () -> result(true));
        telemetry.record("attacker-controlled-value", () -> result(false));

        assertThat(timer(registry, OpenAiDeCoachMcpContract.GET_CONTEXT, "success").count()).isEqualTo(1);
        assertThat(timer(registry, OpenAiDeCoachMcpContract.GET_CONTEXT, "error").count()).isEqualTo(1);
        assertThat(timer(registry, "unknown", "success").count()).isEqualTo(1);
        assertThat(registry.getMeters()).allSatisfy(meter -> assertThat(tagKeys(meter))
                .containsExactlyInAnyOrder("status", "tool"));
    }

    @Test
    void recordsUnexpectedExceptionsWithoutSwallowingThem() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeMcpTelemetry telemetry = new OpenAiDeMcpTelemetry(registry);

        assertThatThrownBy(() -> telemetry.record(
                        OpenAiDeCoachMcpContract.SET_MASTERY,
                        () -> {
                            throw new IllegalStateException("synthetic failure");
                        }))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("synthetic failure");

        assertThat(timer(registry, OpenAiDeCoachMcpContract.SET_MASTERY, "exception").count()).isEqualTo(1);
    }

    @Test
    void logsOnlyBoundedToolOutcomeAndDurationWithoutToolContent() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeMcpTelemetry telemetry = new OpenAiDeMcpTelemetry(registry);
        Logger logger = (Logger) LoggerFactory.getLogger(OpenAiDeMcpTelemetry.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            telemetry.record(
                    OpenAiDeCoachMcpContract.GET_CONTEXT,
                    () -> McpSchema.CallToolResult.builder()
                            .isError(false)
                            .addTextContent("private learner answer and secret token")
                            .build());
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }

        assertThat(appender.list)
                .singleElement()
                .extracting(ILoggingEvent::getFormattedMessage)
                .asString()
                .contains(
                        "tool=" + OpenAiDeCoachMcpContract.GET_CONTEXT,
                        "status=success",
                        "durationMs=")
                .doesNotContain("private learner answer", "secret token");
    }

    private static McpSchema.CallToolResult result(boolean error) {
        return McpSchema.CallToolResult.builder()
                .isError(error)
                .addTextContent("content must not become a metric tag")
                .build();
    }

    private static Timer timer(SimpleMeterRegistry registry, String tool, String status) {
        return registry.get(OpenAiDeMcpTelemetry.TOOL_DURATION_METRIC)
                .tags("tool", tool, "status", status)
                .timer();
    }

    private static Set<String> tagKeys(Meter meter) {
        return meter.getId().getTags().stream().map(tag -> tag.getKey()).collect(Collectors.toSet());
    }
}
