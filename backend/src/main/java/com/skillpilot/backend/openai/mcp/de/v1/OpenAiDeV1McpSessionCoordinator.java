package com.skillpilot.backend.openai.mcp.de.v1;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeIdempotencyKey;
import com.skillpilot.backend.domain.OpenAiDeIdempotencyRecord;
import com.skillpilot.backend.domain.OpenAiDeLearningSession;
import com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeIdempotencyRecordRepository;
import com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository;
import com.skillpilot.backend.service.OpenAiDeLearningSessionRequiredException;
import io.modelcontextprotocol.spec.McpSchema;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serializes operations for one opaque V1 learning session while comparing
 * writes against the canonical learner-scoped state revision. The latter is
 * shared by all learning sessions and the web UI, so a successful mutation on
 * any transport invalidates stale writes on every other transport.
 */
@Component
@ConditionalOnProperty(
        name = {"skillpilot.openai.de.enabled", "skillpilot.openai.de.oauth.enabled"},
        havingValue = "true")
public class OpenAiDeV1McpSessionCoordinator {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final ObjectMapper CANONICAL_JSON = new ObjectMapper()
            .enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS);

    private final OpenAiDeLearningSessionRepository sessions;
    private final LearnerRepository learners;
    private final OpenAiDeIdempotencyRecordRepository requests;
    private final OpenAiDeProperties properties;
    private final OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider;
    private final byte[] hashSecret;

    public OpenAiDeV1McpSessionCoordinator(
            OpenAiDeLearningSessionRepository sessions,
            LearnerRepository learners,
            OpenAiDeIdempotencyRecordRepository requests,
            OpenAiDeProperties properties,
            OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider,
            @Value("${skillpilot.security.signing-secret:default-insecure-secret-change-me}")
                    String hashSecret) {
        this.sessions = sessions;
        this.learners = learners;
        this.requests = requests;
        this.properties = properties;
        this.curriculumRevisionProvider = curriculumRevisionProvider;
        this.hashSecret = hashSecret.getBytes(StandardCharsets.UTF_8);
    }

    @Transactional
    public McpSchema.CallToolResult read(
            String learningSessionId,
            Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult> operation) {
        LockedSession locked = requireCurrentSession(learningSessionId);
        McpSchema.CallToolResult result = operation.apply(metadata(locked));
        return withCurrentMetadata(result, metadata(locked));
    }

    @Transactional
    public McpSchema.CallToolResult write(
            String learningSessionId,
            String toolName,
            long expectedStateVersion,
            String clientRequestId,
            Map<String, Object> arguments,
            Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult> operation) {
        LockedSession locked = requireCurrentSession(learningSessionId);
        OpenAiDeLearningSession session = locked.session();
        Learner learner = locked.learner();
        UUID requestId = requireRequestId(clientRequestId);
        String requestHash = requestHash(toolName, arguments);
        OpenAiDeIdempotencyKey key =
                new OpenAiDeIdempotencyKey(session.getTokenHash(), requestId.toString());
        OpenAiDeIdempotencyRecord previous = requests.findById(key).orElse(null);
        if (previous != null) {
            if (!toolName.equals(previous.getToolName())
                    || !requestHash.equals(previous.getRequestHash())) {
                throw new OpenAiDeV1SessionStateException(
                        OpenAiDeV1SessionStateException.Code.IDEMPOTENCY_KEY_REUSED,
                        metadata(locked),
                        "clientRequestId was already used for a different V1 request.");
            }
            return replay(previous);
        }
        if (expectedStateVersion != learner.getCoachStateRevision()) {
            throw new OpenAiDeV1SessionStateException(
                    OpenAiDeV1SessionStateException.Code.STATE_VERSION_CONFLICT,
                    metadata(locked),
                    "expectedStateVersion does not match the current canonical learner-state revision.");
        }

        McpSchema.CallToolResult result = operation.apply(metadata(locked));
        if (result == null || Boolean.TRUE.equals(result.isError())) {
            throw new OpenAiDeV1SessionStateException(
                    OpenAiDeV1SessionStateException.Code.STATE_VERSION_CONFLICT,
                    metadataWithStateVersion(session, expectedStateVersion),
                    "The state mutation was not confirmed and must not advance stateVersion.");
        }

        // Every common service write advances this canonical revision. Keep a
        // defensive fallback for a newly added V1 write adapter that forgot to
        // mark its shared mutation; the transaction still advances exactly one
        // revision instead of silently accepting an unversioned write.
        if (learner.getCoachStateRevision() == expectedStateVersion) {
            learner.setCoachStateRevision(Math.addExact(expectedStateVersion, 1L));
            learners.save(learner);
        }
        long resultingStateVersion = learner.getCoachStateRevision();
        session.setStateVersion(resultingStateVersion);
        sessions.save(session);
        OpenAiDeV1SessionMetadata completedMetadata =
                metadataWithStateVersion(session, resultingStateVersion);
        McpSchema.CallToolResult completedResult =
                withCurrentMetadata(result, completedMetadata);

        OpenAiDeIdempotencyRecord completed = new OpenAiDeIdempotencyRecord();
        completed.setId(key);
        completed.setToolName(toolName);
        completed.setRequestHash(requestHash);
        completed.setCompletedStateVersion(resultingStateVersion);
        completed.setResponseText(firstText(completedResult));
        completed.setResponseJson(writeJson(completedResult.structuredContent()));
        completed.setCreatedAt(Instant.now());
        requests.save(completed);
        return completedResult;
    }

    private LockedSession requireCurrentSession(String learningSessionId) {
        OpenAiDeLearningSession session = sessions
                .findByTokenHashForUpdate(hash(learningSessionId))
                .orElseThrow(OpenAiDeLearningSessionRequiredException::new);
        if (!session.getExpiresAt().isAfter(Instant.now())) {
            throw new OpenAiDeLearningSessionRequiredException();
        }
        Learner learner = learners
                .findBySkillpilotIdForUpdate(session.getLearner().getSkillpilotId())
                .orElseThrow(OpenAiDeLearningSessionRequiredException::new);
        LockedSession locked = new LockedSession(session, learner);
        if (session.getContractMajor() != OpenAiDeV1ContractMetadata.CONTRACT_MAJOR
                || session.getStateSchemaVersion() != OpenAiDeV1ContractMetadata.STATE_SCHEMA_VERSION
                || !properties.getWorkflowVersion().equals(session.getWorkflowVersion())
                || !curriculumRevisionProvider.currentRevision().equals(
                        session.getCurriculumRevision())) {
            throw new OpenAiDeV1SessionStateException(
                    OpenAiDeV1SessionStateException.Code.SESSION_VERSION_UNAVAILABLE,
                    metadata(locked),
                    "The pinned workflow or curriculum revision is not available in this server build.");
        }
        return locked;
    }

    private OpenAiDeV1SessionMetadata metadata(LockedSession locked) {
        return metadataWithStateVersion(
                locked.session(),
                locked.learner().getCoachStateRevision());
    }

    private OpenAiDeV1SessionMetadata metadataWithStateVersion(
            OpenAiDeLearningSession session,
            long stateVersion) {
        return new OpenAiDeV1SessionMetadata(
                session.getContractMajor(),
                stateVersion,
                session.getStateSchemaVersion(),
                session.getWorkflowVersion(),
                session.getCurriculumRevision(),
                Map.of());
    }

    private McpSchema.CallToolResult withCurrentMetadata(
            McpSchema.CallToolResult result,
            OpenAiDeV1SessionMetadata metadata) {
        if (result == null || Boolean.TRUE.equals(result.isError())) {
            return result;
        }
        Map<String, Object> structured = new LinkedHashMap<>();
        if (result.structuredContent() instanceof Map<?, ?> existing) {
            existing.forEach((key, value) -> {
                if (key instanceof String name) {
                    structured.put(name, value);
                }
            });
        }
        structured.put("contractMajor", metadata.contractMajor());
        structured.put("stateVersion", metadata.stateVersion());
        structured.put("stateSchemaVersion", metadata.stateSchemaVersion());
        structured.put("workflowVersion", metadata.workflowVersion());
        structured.put("curriculumRevision", metadata.curriculumRevision());
        structured.put("extensions", metadata.extensions());
        return McpSchema.CallToolResult.builder()
                .content(result.content())
                .isError(result.isError())
                .structuredContent(structured)
                .meta(result.meta())
                .build();
    }

    private McpSchema.CallToolResult replay(OpenAiDeIdempotencyRecord previous) {
        return McpSchema.CallToolResult.builder()
                .isError(false)
                .addTextContent(previous.getResponseText())
                .structuredContent(readJson(previous.getResponseJson()))
                .build();
    }

    private String requestHash(String toolName, Map<String, Object> arguments) {
        Map<String, Object> canonical = new LinkedHashMap<>();
        canonical.put("tool", toolName);
        canonical.put("arguments", arguments == null ? Map.of() : arguments);
        try {
            byte[] payload = CANONICAL_JSON.writeValueAsBytes(canonical);
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(payload));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not hash the OpenAI-DE V1 request.", exception);
        }
    }

    private String hash(String value) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(hashSecret, HMAC_ALGORITHM));
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not hash the OpenAI-DE learning session.", exception);
        }
    }

    private UUID requireRequestId(String value) {
        try {
            return UUID.fromString(value);
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("clientRequestId muss eine UUID sein.", exception);
        }
    }

    private String writeJson(Object value) {
        try {
            return CANONICAL_JSON.writeValueAsString(value);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not persist the idempotent V1 result.", exception);
        }
    }

    private Object readJson(String value) {
        try {
            return CANONICAL_JSON.readValue(value, Object.class);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not restore the idempotent V1 result.", exception);
        }
    }

    private String firstText(McpSchema.CallToolResult result) {
        if (result.content() == null || result.content().isEmpty()) {
            return "SkillPilot-Zustand unverändert wiederverwendet.";
        }
        Object first = result.content().getFirst();
        if (first instanceof McpSchema.TextContent text && text.text() != null) {
            return text.text();
        }
        return "SkillPilot-Zustand unverändert wiederverwendet.";
    }

    private record LockedSession(
            OpenAiDeLearningSession session,
            Learner learner) {
    }
}
