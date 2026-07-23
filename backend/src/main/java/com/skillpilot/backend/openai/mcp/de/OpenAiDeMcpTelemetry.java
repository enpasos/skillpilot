package com.skillpilot.backend.openai.mcp.de;

import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry.Event;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.Set;
import java.util.function.Supplier;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Privacy-safe, bounded-cardinality telemetry for the German OpenAI MCP tools. */
@Component
@ConditionalOnProperty(name = "skillpilot.openai.de.enabled", havingValue = "true")
public final class OpenAiDeMcpTelemetry {

    public static final String TOOL_DURATION_METRIC = "skillpilot.openai.de.mcp.tool.duration";

    private static final String UNKNOWN_TOOL = "unknown";
    private static final Set<String> KNOWN_TOOLS = Set.of(
            OpenAiDeCoachMcpContract.GET_CONTEXT,
            OpenAiDeCoachMcpContract.GET_NAVIGATION,
            OpenAiDeCoachMcpContract.SET_CURRICULUM,
            OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
            OpenAiDeCoachMcpContract.SET_SCOPE,
            OpenAiDeCoachMcpContract.SET_ACTIVE_GOAL,
            OpenAiDeCoachMcpContract.SET_MASTERY,
            OpenAiDeCoachMcpContract.START_RECALL,
            OpenAiDeCoachMcpContract.GET_RECALL_ANSWER,
            OpenAiDeCoachMcpContract.RECORD_RECALL_RESULT,
            OpenAiDeCoachMcpContract.GET_EXAM_EVALUATION);

    private final MeterRegistry meterRegistry;
    private final OpenAiDeOperationalTelemetry operationalTelemetry;

    public OpenAiDeMcpTelemetry(MeterRegistry meterRegistry) {
        this(meterRegistry, null);
    }

    @Autowired
    public OpenAiDeMcpTelemetry(
            MeterRegistry meterRegistry,
            OpenAiDeOperationalTelemetry operationalTelemetry) {
        this.meterRegistry = meterRegistry;
        this.operationalTelemetry = operationalTelemetry;
    }

    McpSchema.CallToolResult record(
            String toolName,
            Supplier<McpSchema.CallToolResult> invocation) {
        Timer.Sample sample = Timer.start(meterRegistry);
        String status = "exception";
        try {
            McpSchema.CallToolResult result = invocation.get();
            status = result != null && !Boolean.TRUE.equals(result.isError()) ? "success" : "error";
            return result;
        } finally {
            sample.stop(Timer.builder(TOOL_DURATION_METRIC)
                    .description("Duration and outcome of German OpenAI MCP tool invocations")
                    .tag("tool", KNOWN_TOOLS.contains(toolName) ? toolName : UNKNOWN_TOOL)
                    .tag("status", status)
                    .register(meterRegistry));
        }
    }

    void recordOperational(Event event) {
        if (operationalTelemetry != null) {
            operationalTelemetry.record(event);
        }
    }

    void recordException(Throwable exception) {
        if (operationalTelemetry == null) {
            return;
        }
        operationalTelemetry.record(Event.TOOL_EXCEPTION);
        if (isTimeout(exception)) {
            operationalTelemetry.record(Event.TIMEOUT);
        }
    }

    private static boolean isTimeout(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof java.util.concurrent.TimeoutException) {
                return true;
            }
            if (current instanceof org.springframework.web.server.ResponseStatusException responseStatus
                    && (responseStatus.getStatusCode().value() == 408
                            || responseStatus.getStatusCode().value() == 504)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }
}
