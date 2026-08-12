package com.skillpilot.backend.openai.mcp.de;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry.Event;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ErrorCode;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.modelcontextprotocol.spec.McpSchema;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/** Privacy-safe, bounded-cardinality telemetry for the OpenAI Coach V1 MCP tools. */
@Component
@ConditionalOnProperty(name = "skillpilot.openai.coach.v1.enabled", havingValue = "true")
public final class OpenAiDeMcpTelemetry {

    private static final Logger LOGGER = LoggerFactory.getLogger(OpenAiDeMcpTelemetry.class);

    public static final String TOOL_DURATION_METRIC = "skillpilot.openai.coach.v1.mcp.tool.duration";
    public static final String RESOURCE_READ_DURATION_METRIC =
            "skillpilot.openai.coach.v1.mcp.resource.duration";

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String SUCCESS_RESULT_CODE = "OK";
    private static final String GENERIC_ERROR_RESULT_CODE = "ERROR";
    private static final String EXCEPTION_RESULT_CODE = "EXCEPTION";
    private static final String UNKNOWN_TOOL = "unknown";
    private static final String UNKNOWN_ARTIFACT = "unknown";
    private static final String ACTIVE_ARTIFACT_ROLE = "active";
    private static final String RETAINED_ARTIFACT_ROLE = "retained";
    private static final int ARTIFACT_FINGERPRINT_LENGTH = 12;
    private static final String UNAVAILABLE = "-";
    private static final int MAX_LOG_VALUE_LENGTH = 160;
    private static final int SESSION_FINGERPRINT_LENGTH = 22;
    private static final Set<String> KNOWN_TOOLS = Set.of(
            OpenAiDeV1McpContractAdapter.GET_CONTEXT,
            OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
            OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE,
            OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD,
            OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
            OpenAiDeV1McpContractAdapter.SET_SCOPE,
            OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL,
            OpenAiDeV1McpContractAdapter.SET_MASTERY,
            OpenAiDeV1McpContractAdapter.START_RECALL,
            OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS,
            OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
            OpenAiDeV1McpContractAdapter.GET_EXAM_EVALUATION);
    private static final Set<String> KNOWN_RESULT_CODES =
            java.util.Arrays.stream(OpenAiDeV1ErrorCode.values())
                    .map(OpenAiDeV1ErrorCode::code)
                    .collect(java.util.stream.Collectors.toUnmodifiableSet());

    private final MeterRegistry meterRegistry;
    private final OpenAiDeOperationalTelemetry operationalTelemetry;
    private final String serverBuild;
    private final byte[] privacyHashKey;

    public OpenAiDeMcpTelemetry(MeterRegistry meterRegistry) {
        this(meterRegistry, null, null, "openai-de-telemetry-test-key");
    }

    public OpenAiDeMcpTelemetry(
            MeterRegistry meterRegistry,
            OpenAiDeOperationalTelemetry operationalTelemetry) {
        this(meterRegistry, operationalTelemetry, null, "openai-de-telemetry-test-key");
    }

    public OpenAiDeMcpTelemetry(
            MeterRegistry meterRegistry,
            OpenAiDeOperationalTelemetry operationalTelemetry,
            OpenAiDeProperties properties) {
        this(meterRegistry, operationalTelemetry, properties, "openai-de-telemetry-test-key");
    }

    @Autowired
    public OpenAiDeMcpTelemetry(
            MeterRegistry meterRegistry,
            OpenAiDeOperationalTelemetry operationalTelemetry,
            OpenAiDeProperties properties,
            @Value("${skillpilot.security.signing-secret:default-insecure-secret-change-me}")
                    String signingSecret) {
        this.meterRegistry = meterRegistry;
        this.operationalTelemetry = operationalTelemetry;
        this.serverBuild = properties == null || properties.getServerBuild() == null
                ? OpenAiDeV1ContractMetadata.DEFAULT_SERVER_BUILD
                : properties.getServerBuild();
        if (signingSecret == null || signingSecret.isBlank()) {
            this.privacyHashKey = new byte[32];
            new SecureRandom().nextBytes(this.privacyHashKey);
        } else {
            this.privacyHashKey = signingSecret.getBytes(StandardCharsets.UTF_8);
        }
    }

    public McpSchema.CallToolResult record(
            String toolName,
            Supplier<McpSchema.CallToolResult> invocation) {
        return record(toolName, Map.of(), invocation);
    }

    public McpSchema.CallToolResult record(
            String toolName,
            Map<String, Object> arguments,
            Supplier<McpSchema.CallToolResult> invocation) {
        Timer.Sample sample = Timer.start(meterRegistry);
        String status = "exception";
        String resultCode = EXCEPTION_RESULT_CODE;
        McpSchema.CallToolResult result = null;
        try {
            result = invocation.get();
            status = result != null && !Boolean.TRUE.equals(result.isError()) ? "success" : "error";
            resultCode = resultCode(result, status);
            return result;
        } finally {
            String boundedToolName = KNOWN_TOOLS.contains(toolName) ? toolName : UNKNOWN_TOOL;
            long durationNanos = sample.stop(Timer.builder(TOOL_DURATION_METRIC)
                    .description("Duration and outcome of OpenAI Coach V1 MCP tool invocations")
                    .tag("tool", boundedToolName)
                    .tag("status", status)
                    .tag("result.code", resultCode)
                    .tag("contract.major", String.valueOf(OpenAiDeV1ContractMetadata.CONTRACT_MAJOR))
                    .tag("plugin.line", OpenAiDeV1ContractMetadata.PLUGIN_IDENTITY)
                    .register(meterRegistry));
            Map<?, ?> structuredContent = structuredContent(result);
            boolean goalVisualizationOffered = goalVisualizationOffered(
                    "success".equals(status) ? structuredContent : null);
            LOGGER.info(
                    "OpenAI Coach V1 MCP V1 tool invocation: contractMajor={} pluginLine={} serverBuild={} "
                            + "tool={} status={} resultCode={} latencyMs={} clientRequestId={} "
                            + "learningSessionHash={} stateVersion={} stateSchemaVersion={} "
                            + "workflowVersion={} curriculumRevision={} goalVisualizationOffered={}",
                    OpenAiDeV1ContractMetadata.CONTRACT_MAJOR,
                    OpenAiDeV1ContractMetadata.PLUGIN_IDENTITY,
                    safeLogValue(serverBuild),
                    boundedToolName,
                    status,
                    resultCode,
                    TimeUnit.NANOSECONDS.toMillis(durationNanos),
                    canonicalClientRequestId(arguments),
                    learningSessionFingerprint(arguments),
                    numericMetadata(structuredContent, "stateVersion"),
                    numericMetadata(structuredContent, "stateSchemaVersion"),
                    textMetadata(structuredContent, "workflowVersion"),
                    textMetadata(structuredContent, "curriculumRevision"),
                    goalVisualizationOffered);
        }
    }

    /** Records a bounded, privacy-safe observation for one MCP UI resource read. */
    public McpSchema.ReadResourceResult recordResourceRead(
            String resourceUri,
            Supplier<McpSchema.ReadResourceResult> read) {
        Timer.Sample sample = Timer.start(meterRegistry);
        String status = "exception";
        try {
            McpSchema.ReadResourceResult result = read.get();
            status = result == null ? "error" : "success";
            return result;
        } finally {
            ResourceArtifact artifact = ResourceArtifact.classify(resourceUri);
            long durationNanos = sample.stop(Timer.builder(RESOURCE_READ_DURATION_METRIC)
                    .description("Duration and outcome of OpenAI Coach V1 MCP UI resource reads")
                    .tag("artifact", artifact.fingerprint())
                    .tag("role", artifact.role())
                    .tag("status", status)
                    .tag("contract.major", String.valueOf(OpenAiDeV1ContractMetadata.CONTRACT_MAJOR))
                    .tag("plugin.line", OpenAiDeV1ContractMetadata.PLUGIN_IDENTITY)
                    .register(meterRegistry));
            LOGGER.info(
                    "OpenAI Coach V1 MCP V1 resource read: contractMajor={} pluginLine={} "
                            + "serverBuild={} uiArtifact={} artifactRole={} status={} latencyMs={}",
                    OpenAiDeV1ContractMetadata.CONTRACT_MAJOR,
                    OpenAiDeV1ContractMetadata.PLUGIN_IDENTITY,
                    safeLogValue(serverBuild),
                    artifact.fingerprint(),
                    artifact.role(),
                    status,
                    TimeUnit.NANOSECONDS.toMillis(durationNanos));
        }
    }

    public void recordOperational(Event event) {
        if (operationalTelemetry != null) {
            operationalTelemetry.record(event);
        }
    }

    public void recordException(Throwable exception) {
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

    private static String resultCode(McpSchema.CallToolResult result, String status) {
        if ("success".equals(status)) {
            return SUCCESS_RESULT_CODE;
        }
        Map<?, ?> structuredContent = structuredContent(result);
        Object candidate = structuredContent == null ? null : structuredContent.get("code");
        if (candidate instanceof String code && KNOWN_RESULT_CODES.contains(code)) {
            return code;
        }
        return GENERIC_ERROR_RESULT_CODE;
    }

    private static Map<?, ?> structuredContent(McpSchema.CallToolResult result) {
        return result != null && result.structuredContent() instanceof Map<?, ?> map ? map : null;
    }

    private static String canonicalClientRequestId(Map<String, Object> arguments) {
        Object candidate = arguments == null ? null : arguments.get(OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID);
        if (!(candidate instanceof String value) || value.isBlank()) {
            return UNAVAILABLE;
        }
        try {
            return UUID.fromString(value).toString();
        } catch (IllegalArgumentException exception) {
            return "invalid";
        }
    }

    private String learningSessionFingerprint(Map<String, Object> arguments) {
        Object candidate = arguments == null ? null : arguments.get(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID);
        if (!(candidate instanceof String value) || value.isBlank()) {
            return UNAVAILABLE;
        }
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(privacyHashKey, HMAC_ALGORITHM));
            String encoded = Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
            return "h1:" + encoded.substring(0, SESSION_FINGERPRINT_LENGTH);
        } catch (GeneralSecurityException | RuntimeException exception) {
            return UNAVAILABLE;
        }
    }

    private static String numericMetadata(Map<?, ?> structuredContent, String key) {
        if (structuredContent == null) {
            return UNAVAILABLE;
        }
        Object value = structuredContent.get(key);
        return value instanceof Number number ? number.toString() : UNAVAILABLE;
    }

    private static String textMetadata(Map<?, ?> structuredContent, String key) {
        if (structuredContent == null) {
            return UNAVAILABLE;
        }
        Object value = structuredContent.get(key);
        return value instanceof String text && !text.isBlank() ? safeLogValue(text) : UNAVAILABLE;
    }

    private static String safeLogValue(String value) {
        if (value == null || value.isBlank()) {
            return UNAVAILABLE;
        }
        String normalized = value.replaceAll("[\\r\\n\\t]", "_");
        return normalized.length() <= MAX_LOG_VALUE_LENGTH
                ? normalized
                : normalized.substring(0, MAX_LOG_VALUE_LENGTH);
    }

    /**
     * Bounded presentation telemetry derived only from a successful full-context result.
     * No value from the visualization or action payload is copied into the log.
     */
    private static boolean goalVisualizationOffered(Map<?, ?> structuredContent) {
        Map<?, ?> context = fullContext(structuredContent);
        return context != null && context.get("goalVisualization") instanceof Map<?, ?>;
    }

    private static Map<?, ?> fullContext(Map<?, ?> structuredContent) {
        if (structuredContent == null) {
            return null;
        }
        Object successor = structuredContent.get("context");
        if (successor instanceof Map<?, ?> successorContext && isFullContext(successorContext)) {
            return successorContext;
        }
        return isFullContext(structuredContent) ? structuredContent : null;
    }

    private static boolean isFullContext(Map<?, ?> candidate) {
        return candidate.containsKey("learningState")
                && candidate.containsKey("interactionMode")
                && candidate.get("nextAllowedTools") instanceof java.util.List<?>;
    }

    private record ResourceArtifact(String fingerprint, String role) {

        private static final ResourceArtifact ACTIVE_GOAL_VISUALIZATION = new ResourceArtifact(
                fingerprint(OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_ARTIFACT_SHA256),
                ACTIVE_ARTIFACT_ROLE);
        private static final ResourceArtifact ACTIVE_MEMORY_PRACTICE = new ResourceArtifact(
                fingerprint(OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_ARTIFACT_SHA256),
                ACTIVE_ARTIFACT_ROLE);
        private static final ResourceArtifact LEGACY_GOAL_VISUALIZATION = new ResourceArtifact(
                fingerprint(OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_ARTIFACT_SHA256),
                RETAINED_ARTIFACT_ROLE);
        private static final ResourceArtifact UNKNOWN =
                new ResourceArtifact(UNKNOWN_ARTIFACT, UNKNOWN_ARTIFACT);

        private static ResourceArtifact classify(String resourceUri) {
            if (OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI.equals(resourceUri)) {
                return ACTIVE_GOAL_VISUALIZATION;
            }
            if (OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI.equals(resourceUri)) {
                return ACTIVE_MEMORY_PRACTICE;
            }
            if (OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_RESOURCE_URI.equals(resourceUri)) {
                return LEGACY_GOAL_VISUALIZATION;
            }
            for (String sha256 : OpenAiDeV1ContractMetadata.RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S) {
                if (OpenAiDeV1ContractMetadata.goalVisualizationResourceUri(sha256).equals(resourceUri)) {
                    return new ResourceArtifact(fingerprint(sha256), RETAINED_ARTIFACT_ROLE);
                }
            }
            return UNKNOWN;
        }

        private static String fingerprint(String sha256) {
            return sha256.substring(0, ARTIFACT_FINGERPRINT_LENGTH);
        }
    }
}
