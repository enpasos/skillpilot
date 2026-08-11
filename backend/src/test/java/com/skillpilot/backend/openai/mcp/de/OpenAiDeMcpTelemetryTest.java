package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ErrorCode;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import io.micrometer.core.instrument.Meter;
import io.micrometer.core.instrument.Timer;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

class OpenAiDeMcpTelemetryTest {

    @Test
    void recordsOnlyBoundedToolAndStatusTagsForSuccessfulAndFailedResults() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeMcpTelemetry telemetry = new OpenAiDeMcpTelemetry(registry);

        telemetry.record(OpenAiDeV1McpContractAdapter.GET_CONTEXT, () -> result(false));
        telemetry.record(OpenAiDeV1McpContractAdapter.GET_CONTEXT, () -> result(true));
        telemetry.record("attacker-controlled-value", () -> result(false));
        telemetry.record(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                () -> result(true, Map.of("code", OpenAiDeV1ErrorCode.STATE_VERSION_CONFLICT.code())));
        telemetry.record(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                () -> result(true, Map.of("code", "attacker-controlled-code")));

        assertThat(timer(
                                registry,
                                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                                "success",
                                "OK")
                        .count())
                .isEqualTo(1);
        assertThat(timer(
                                registry,
                                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                                "error",
                                "ERROR")
                        .count())
                .isEqualTo(1);
        assertThat(timer(registry, "unknown", "success", "OK").count()).isEqualTo(1);
        assertThat(timer(
                                registry,
                                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                                "error",
                                OpenAiDeV1ErrorCode.STATE_VERSION_CONFLICT.code())
                        .count())
                .isEqualTo(1);
        assertThat(timer(
                                registry,
                                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                                "error",
                                "ERROR")
                        .count())
                .isEqualTo(1);
        assertThat(registry.getMeters()).allSatisfy(meter -> assertThat(tagKeys(meter))
                .containsExactlyInAnyOrder(
                        "contract.major",
                        "plugin.line",
                        "result.code",
                        "status",
                        "tool"));
        assertThat(registry.getMeters())
                .allSatisfy(meter -> assertThat(meter.getId().getTag("server.build")).isNull());
    }

    @Test
    void recordsUnexpectedExceptionsWithoutSwallowingThem() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeMcpTelemetry telemetry = new OpenAiDeMcpTelemetry(registry);

        assertThatThrownBy(() -> telemetry.record(
                        OpenAiDeV1McpContractAdapter.SET_MASTERY,
                        () -> {
                            throw new IllegalStateException("synthetic failure");
                        }))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("synthetic failure");

        assertThat(timer(
                                registry,
                                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                                "exception",
                                "EXCEPTION")
                        .count())
                .isEqualTo(1);
    }

    @Test
    void logsVersionStateAndCorrelatorsWithoutSessionOrToolContent() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.setServerBuild("build-17");
        OpenAiDeMcpTelemetry telemetry =
                new OpenAiDeMcpTelemetry(registry, null, properties, "unit-test-privacy-hash-key");
        String requestId = "9653d158-6f5a-4f17-9e54-77651f343d9a";
        String rawLearningSession = "sps_private-learning-session-value";
        Logger logger = (Logger) LoggerFactory.getLogger(OpenAiDeMcpTelemetry.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            telemetry.record(
                    OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                    Map.of(
                            OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                            rawLearningSession,
                            OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID,
                            requestId,
                            "unrelatedPrivateArgument",
                            "must not be logged"),
                    () -> McpSchema.CallToolResult.builder()
                            .isError(false)
                            .addTextContent("private learner answer and secret token")
                            .structuredContent(Map.of(
                                    "contractMajor", OpenAiDeV1ContractMetadata.CONTRACT_MAJOR,
                                    "stateVersion", 42L,
                                    "stateSchemaVersion", 3,
                                    "workflowVersion", "coach@1.3",
                                    "curriculumRevision", "curriculum-package@sha256"))
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
                        "contractMajor=1",
                        "pluginLine=skillpilot-coach-v1",
                        "serverBuild=build-17",
                        "tool=" + OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                        "status=success",
                        "resultCode=OK",
                        "latencyMs=",
                        "clientRequestId=" + requestId,
                        "learningSessionHash=h1:",
                        "stateVersion=42",
                        "stateSchemaVersion=3",
                        "workflowVersion=coach@1.3",
                        "curriculumRevision=curriculum-package@sha256",
                        "goalVisualizationOffered=false")
                .doesNotContain(
                        rawLearningSession,
                        "private learner answer",
                        "secret token",
                        "must not be logged",
                        "unit-test-privacy-hash-key");
    }

    @Test
    void logsOnlyBooleanGoalVisualizationSignalForSuccessfulDirectFullContext() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeMcpTelemetry telemetry = new OpenAiDeMcpTelemetry(registry);
        String privateGoalId = "private-goal-id-must-not-be-logged";
        String privateImageUrl = "https://skillpilot.test/private-image-must-not-be-logged.jpg";
        String privateAltText = "private alt text must not be logged";
        Logger logger = (Logger) LoggerFactory.getLogger(OpenAiDeMcpTelemetry.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            telemetry.record(
                    OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                    () -> result(false, Map.of(
                            "learningState", "TEACHING",
                            "interactionMode", "chat",
                            "nextAllowedTools", List.of(
                                    OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION),
                            "goalVisualization", Map.of(
                                    "goalId", privateGoalId,
                                    "imageUrl", privateImageUrl,
                                    "altText", privateAltText))));
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }

        assertThat(appender.list)
                .singleElement()
                .extracting(ILoggingEvent::getFormattedMessage)
                .asString()
                .contains(
                        "status=success",
                        "goalVisualizationOffered=true")
                .doesNotContain(
                        privateGoalId,
                        privateImageUrl,
                        privateAltText);
    }

    @Test
    void readsNestedSuccessorContextButDoesNotMistakeUiReceiptForFullContext() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeMcpTelemetry telemetry = new OpenAiDeMcpTelemetry(registry);
        String privateSuccessorGoalId = "private-successor-goal-id-must-not-be-logged";
        String privateReceiptGoalId = "private-receipt-goal-id-must-not-be-logged";
        Logger logger = (Logger) LoggerFactory.getLogger(OpenAiDeMcpTelemetry.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            telemetry.record(
                    OpenAiDeV1McpContractAdapter.SET_MASTERY,
                    () -> result(false, Map.of(
                            "status", "UPDATED",
                            "context", Map.of(
                                    "learningState", "TEACHING",
                                    "interactionMode", "chat",
                                    "nextAllowedTools", List.of(
                                            OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION),
                                    "goalVisualization", Map.of("goalId", privateSuccessorGoalId)))));
            telemetry.record(
                    OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                    () -> result(false, Map.of(
                            "goalVisualization", Map.of("goalId", privateReceiptGoalId))));
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }

        assertThat(appender.list)
                .extracting(ILoggingEvent::getFormattedMessage)
                .anySatisfy(message -> assertThat(message)
                        .contains(
                                "tool=" + OpenAiDeV1McpContractAdapter.SET_MASTERY,
                                "goalVisualizationOffered=true"))
                .anySatisfy(message -> assertThat(message)
                        .contains(
                                "tool=" + OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                                "goalVisualizationOffered=false"))
                .allSatisfy(message -> assertThat(message)
                        .doesNotContain(privateSuccessorGoalId, privateReceiptGoalId));
    }

    @Test
    void normalizesUntrustedIdentifiersBeforeLogging() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeMcpTelemetry telemetry = new OpenAiDeMcpTelemetry(registry);
        Logger logger = (Logger) LoggerFactory.getLogger(OpenAiDeMcpTelemetry.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            telemetry.record(
                    "unknown\ninjected-tool",
                    Map.of(
                            OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                            "raw-session\nmust-not-leak",
                            OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID,
                            "not-a-uuid\nmust-not-leak"),
                    () -> result(true, Map.of("code", "unknown\nmust-not-leak")));
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }

        assertThat(appender.list)
                .singleElement()
                .extracting(ILoggingEvent::getFormattedMessage)
                .asString()
                .contains(
                        "tool=unknown",
                        "status=error",
                        "resultCode=ERROR",
                        "clientRequestId=invalid",
                        "learningSessionHash=h1:")
                .doesNotContain(
                        "injected-tool",
                        "raw-session",
                        "not-a-uuid",
                        "must-not-leak");
    }

    @Test
    void separatesActiveFromAllRetainedResourceReadsWithoutLoggingResourceContent() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeProperties properties = new OpenAiDeProperties();
        properties.setServerBuild("build-17");
        OpenAiDeMcpTelemetry telemetry =
                new OpenAiDeMcpTelemetry(registry, null, properties, "unit-test-privacy-hash-key");
        String activeUri = OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI;
        List<String> retainedSha256s =
                OpenAiDeV1ContractMetadata.RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S;
        List<String> retainedUris = Stream.of(
                        Stream.of(OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_RESOURCE_URI),
                        retainedSha256s.stream()
                                .map(OpenAiDeV1ContractMetadata::goalVisualizationResourceUri))
                .flatMap(stream -> stream)
                .toList();
        String untrustedUri = "ui://attacker/private-session-and-token";
        McpSchema.ReadResourceResult activeResult = readResult(activeUri);
        AtomicInteger successfulSupplierCalls = new AtomicInteger();
        IllegalStateException failure = new IllegalStateException("private exception payload");
        Logger logger = (Logger) LoggerFactory.getLogger(OpenAiDeMcpTelemetry.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            assertThat(telemetry.recordResourceRead(activeUri, () -> {
                        successfulSupplierCalls.incrementAndGet();
                        return activeResult;
                    }))
                    .isSameAs(activeResult);
            for (String retainedUri : retainedUris) {
                McpSchema.ReadResourceResult retainedResult = readResult(retainedUri);
                assertThat(telemetry.recordResourceRead(retainedUri, () -> {
                            successfulSupplierCalls.incrementAndGet();
                            return retainedResult;
                        }))
                        .isSameAs(retainedResult);
            }
            assertThatThrownBy(() -> telemetry.recordResourceRead(untrustedUri, () -> {
                        throw failure;
                    }))
                    .isSameAs(failure);
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }

        assertThat(successfulSupplierCalls)
                .hasValue(2 + retainedSha256s.size());

        String activeArtifact =
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_ARTIFACT_SHA256.substring(0, 12);
        assertThat(resourceTimer(registry, activeArtifact, "active", "success").count())
                .isEqualTo(1);
        for (String retainedSha256 : retainedSha256s) {
            assertThat(resourceTimer(
                                    registry,
                                    retainedSha256.substring(0, 12),
                                    "retained",
                                    "success")
                            .count())
                    .isEqualTo(1);
        }
        String legacyArtifact =
                OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_ARTIFACT_SHA256.substring(0, 12);
        assertThat(resourceTimer(registry, legacyArtifact, "retained", "success").count())
                .isEqualTo(1);
        assertThat(resourceTimer(registry, "unknown", "unknown", "exception").count())
                .isEqualTo(1);
        assertThat(registry.getMeters()).allSatisfy(meter -> assertThat(tagKeys(meter))
                .containsExactlyInAnyOrder(
                        "artifact", "contract.major", "plugin.line", "role", "status"));
        assertThat(registry.getMeters())
                .allSatisfy(meter -> assertThat(meter.getId().getTag("server.build")).isNull());

        assertThat(appender.list)
                .hasSize(3 + retainedSha256s.size());
        assertThat(appender.list)
                .extracting(ILoggingEvent::getFormattedMessage)
                .allSatisfy(message -> assertThat(message)
                        .contains(
                                "contractMajor=1",
                                "pluginLine=skillpilot-coach-v1",
                                "serverBuild=build-17",
                                "latencyMs=")
                        .doesNotContain(
                                "private resource contents",
                                untrustedUri,
                                "private exception payload",
                                activeUri,
                                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_ARTIFACT_SHA256));
        for (String retainedSha256 : retainedSha256s) {
            String retainedUri = OpenAiDeV1ContractMetadata.goalVisualizationResourceUri(
                    retainedSha256);
            assertThat(appender.list)
                    .extracting(ILoggingEvent::getFormattedMessage)
                    .allSatisfy(message -> assertThat(message)
                            .doesNotContain(retainedUri, retainedSha256));
        }
        assertThat(appender.list)
                .extracting(ILoggingEvent::getFormattedMessage)
                .allSatisfy(message -> assertThat(message)
                        .doesNotContain(
                                OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_RESOURCE_URI,
                                OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_ARTIFACT_SHA256));
        assertThat(appender.list)
                .extracting(ILoggingEvent::getFormattedMessage)
                .anySatisfy(message -> assertThat(message)
                        .contains(
                                "uiArtifact=" + activeArtifact,
                                "artifactRole=active",
                                "status=success"))
                .anySatisfy(message -> assertThat(message)
                        .contains(
                                "uiArtifact=unknown",
                                "artifactRole=unknown",
                                "status=exception"));
        for (String retainedSha256 : retainedSha256s) {
            assertThat(appender.list)
                    .extracting(ILoggingEvent::getFormattedMessage)
                    .anySatisfy(message -> assertThat(message)
                            .contains(
                                    "uiArtifact=" + retainedSha256.substring(0, 12),
                                    "artifactRole=retained",
                                    "status=success"));
        }
        assertThat(appender.list)
                .extracting(ILoggingEvent::getFormattedMessage)
                .anySatisfy(message -> assertThat(message)
                        .contains(
                                "uiArtifact=" + legacyArtifact,
                                "artifactRole=retained",
                                "status=success"));
    }

    @Test
    void doesNotClassifyNullResourceResultAsSuccess() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();
        OpenAiDeMcpTelemetry telemetry = new OpenAiDeMcpTelemetry(registry);

        assertThat(telemetry.recordResourceRead(
                        OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                        () -> null))
                .isNull();

        assertThat(resourceTimer(
                                registry,
                                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_ARTIFACT_SHA256
                                        .substring(0, 12),
                                "active",
                                "error")
                        .count())
                .isEqualTo(1);
    }

    private static McpSchema.CallToolResult result(boolean error) {
        return result(error, null);
    }

    private static McpSchema.CallToolResult result(boolean error, Object structuredContent) {
        if (structuredContent == null) {
            return McpSchema.CallToolResult.builder()
                    .isError(error)
                    .addTextContent("content must not become a metric tag")
                    .build();
        }
        return McpSchema.CallToolResult.builder()
                .isError(error)
                .addTextContent("content must not become a metric tag")
                .structuredContent(structuredContent)
                .build();
    }

    private static McpSchema.ReadResourceResult readResult(String uri) {
        return new McpSchema.ReadResourceResult(List.of(new McpSchema.TextResourceContents(
                uri,
                OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE,
                "<!doctype html><p>private resource contents</p>",
                Map.of())));
    }

    private static Timer timer(
            SimpleMeterRegistry registry,
            String tool,
            String status,
            String resultCode) {
        return registry.get(OpenAiDeMcpTelemetry.TOOL_DURATION_METRIC)
                .tags(
                        "tool", tool,
                        "status", status,
                        "result.code", resultCode)
                .timer();
    }

    private static Timer resourceTimer(
            SimpleMeterRegistry registry,
            String artifact,
            String role,
            String status) {
        return registry.get(OpenAiDeMcpTelemetry.RESOURCE_READ_DURATION_METRIC)
                .tags(
                        "artifact", artifact,
                        "role", role,
                        "status", status)
                .timer();
    }

    private static Set<String> tagKeys(Meter meter) {
        return meter.getId().getTags().stream().map(tag -> tag.getKey()).collect(Collectors.toSet());
    }
}
