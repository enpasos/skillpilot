package com.skillpilot.backend.openai.mcp.de.v1;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.skillpilot.backend.completion.CompletionCallContext;
import com.skillpilot.backend.completion.CompletionNavigationPolicy;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.OpenAiDeIdempotencyKey;
import com.skillpilot.backend.domain.OpenAiDeIdempotencyRecord;
import com.skillpilot.backend.domain.OpenAiDeLearningSession;
import com.skillpilot.backend.openai.OpenAiCoachLocale;
import com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.OpenAiDeIdempotencyRecordRepository;
import com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository;
import com.skillpilot.backend.service.OpenAiDeLearningSessionRequiredException;
import io.modelcontextprotocol.spec.McpSchema;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Serializes operations for one opaque V1 learning session while comparing
 * writes against the canonical learner-scoped state revision. The latter is
 * shared by all learning sessions and the web UI, so a successful mutation on
 * any transport invalidates stale writes on every other transport.
 */
@Component
@ConditionalOnProperty(
        name = {"skillpilot.openai.coach.v1.enabled", "skillpilot.openai.coach.v1.oauth.enabled"},
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
    private final OpenAiDeV1CompletionContractRegistry completionContract;
    private final byte[] hashSecret;
    private final Clock clock;

    public OpenAiDeV1McpSessionCoordinator(
            OpenAiDeLearningSessionRepository sessions,
            LearnerRepository learners,
            OpenAiDeIdempotencyRecordRepository requests,
            OpenAiDeProperties properties,
            OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider,
            String hashSecret) {
        this(sessions, learners, requests, properties, curriculumRevisionProvider, null, hashSecret, Clock.systemUTC());
    }

    @Autowired
    public OpenAiDeV1McpSessionCoordinator(
            OpenAiDeLearningSessionRepository sessions,
            LearnerRepository learners,
            OpenAiDeIdempotencyRecordRepository requests,
            OpenAiDeProperties properties,
            OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider,
            OpenAiDeV1CompletionContractRegistry completionContract,
            @Value("${skillpilot.security.signing-secret:default-insecure-secret-change-me}")
                    String hashSecret) {
        this(
                sessions,
                learners,
                requests,
                properties,
                curriculumRevisionProvider,
                completionContract,
                hashSecret,
                Clock.systemUTC());
    }

    OpenAiDeV1McpSessionCoordinator(
            OpenAiDeLearningSessionRepository sessions,
            LearnerRepository learners,
            OpenAiDeIdempotencyRecordRepository requests,
            OpenAiDeProperties properties,
            OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider,
            String hashSecret,
            Clock clock) {
        this(sessions, learners, requests, properties, curriculumRevisionProvider, null, hashSecret, clock);
    }

    private OpenAiDeV1McpSessionCoordinator(
            OpenAiDeLearningSessionRepository sessions,
            LearnerRepository learners,
            OpenAiDeIdempotencyRecordRepository requests,
            OpenAiDeProperties properties,
            OpenAiDeCurriculumRevisionProvider curriculumRevisionProvider,
            OpenAiDeV1CompletionContractRegistry completionContract,
            String hashSecret,
            Clock clock) {
        this.sessions = sessions;
        this.learners = learners;
        this.requests = requests;
        this.properties = properties;
        this.curriculumRevisionProvider = curriculumRevisionProvider;
        this.completionContract = completionContract;
        this.hashSecret = hashSecret.getBytes(StandardCharsets.UTF_8);
        this.clock = clock;
    }

    @Transactional
    public McpSchema.CallToolResult read(
            String learningSessionId,
            Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult> operation) {
        LockedSession locked = requireCurrentSession(learningSessionId);
        requireMinimumRemaining(locked);
        requireCompletionContract(locked, false);
        return completeRead(locked, metadata(locked), operation);
    }

    @Transactional
    public McpSchema.CallToolResult readCoachContext(
            String learningSessionId,
            Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult> operation) {
        LockedSession locked = requireCurrentSession(learningSessionId);
        requireMinimumRemaining(locked);
        OpenAiDeV1SessionMetadata current = metadata(locked);
        String binding = completionContract == null ? null
                : completionContract.digestForPending(locked.session().getCompletionContract());
        return completeRead(locked, new OpenAiDeV1SessionMetadata(
                current.contractMajor(), current.stateVersion(), current.stateSchemaVersion(),
                current.workflowVersion(), current.curriculumRevision(), current.communicationLocale(),
                current.extensions(), current.recallDirective(),
                CompletionNavigationPolicy.ownsNavigation(locked.learner()) && !completionConfirmed(locked),
                binding == null ? null : receiptCapability(locked.session(), binding)), operation);
    }

    @Transactional
    public McpSchema.CallToolResult confirmCompletionContract(String learningSessionId, String receiptCapability) {
        LockedSession locked = requireCurrentSession(learningSessionId);
        requireMinimumRemaining(locked);
        String stamp = locked.session().getCompletionContract();
        String pending = completionContract == null ? null : completionContract.digestForPending(stamp);
        String active = pending != null || completionContract == null ? pending
                : completionContract.digestForConfirmed(stamp);
        if (active == null || !MessageDigest.isEqual(
                receiptCapability.getBytes(StandardCharsets.UTF_8),
                receiptCapability(locked.session(), active).getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "The completion contract receipt is unavailable.");
        }
        if (pending != null) {
            locked.session().setCompletionContract("confirmed:" + pending);
            sessions.save(locked.session());
        }
        String instruction = "Reload get_skillpilot_context silently before any teaching or action. "
                + "This technical receipt does not select a goal or record mastery.";
        return withCurrentMetadata(McpSchema.CallToolResult.builder()
                .content(List.of(new McpSchema.TextContent(instruction)))
                .structuredContent(Map.of("confirmed", true, "instruction", instruction))
                .isError(false)
                .build(), metadata(locked));
    }

    private McpSchema.CallToolResult completeRead(
            LockedSession locked,
            OpenAiDeV1SessionMetadata contextMetadata,
            Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult> operation) {
        McpSchema.CallToolResult result = CompletionCallContext.with(completionContext(locked),
                () -> operation.apply(contextMetadata));
        McpSchema.CallToolResult completed = withCurrentMetadata(result, metadata(locked));
        if (completed != null && !Boolean.TRUE.equals(completed.isError())) {
            touchActivity(locked.learner());
        }
        return completed;
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
        }
        requireMinimumRemaining(locked);
        requireCompletionContract(locked, OpenAiDeV1McpContractAdapter.CHOOSE_COMPLETION_ROUTE.equals(toolName));
        if (previous != null) {
            if (learner.getCoachStateRevision() != previous.getCompletedStateVersion()) {
                throw new OpenAiDeV1SessionStateException(
                        OpenAiDeV1SessionStateException.Code.STATE_VERSION_CONFLICT,
                        metadata(locked),
                        "The completed V1 request no longer represents the current canonical learner-state "
                                + "revision.");
            }
            McpSchema.CallToolResult replay = replay(previous);
            touchActivity(learner);
            return replay;
        }
        if (expectedStateVersion != learner.getCoachStateRevision()) {
            throw new OpenAiDeV1SessionStateException(
                    OpenAiDeV1SessionStateException.Code.STATE_VERSION_CONFLICT,
                    metadata(locked),
                    "expectedStateVersion does not match the current canonical learner-state revision.");
        }

        McpSchema.CallToolResult result = CompletionCallContext.with(completionContext(locked),
                () -> operation.apply(metadata(locked)));
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
        completed.setCreatedAt(clock.instant());
        requests.save(completed);
        touchActivity(learner);
        return completedResult;
    }

    private CompletionCallContext completionContext(LockedSession locked) {
        return new CompletionCallContext("openai", locked.session().getTokenHash(),
                locked.session().getExpiresAt(), completionConfirmed(locked));
    }

    private boolean completionConfirmed(LockedSession locked) {
        return completionContract != null
                && completionContract.digestForConfirmed(locked.session().getCompletionContract()) != null;
    }

    private void requireCompletionContract(LockedSession locked, boolean completionAction) {
        if ((completionAction || CompletionNavigationPolicy.ownsNavigation(locked.learner()))
                && !completionConfirmed(locked)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "The selected completion route requires the current coach session contract.");
        }
    }

    private String receiptCapability(OpenAiDeLearningSession session, String binding) {
        return hash("openai-completion-contract-receipt-v1\0" + session.getTokenHash() + "\0" + binding);
    }

    private void touchActivity(Learner learner) {
        learner.setLastActivityAt(clock.instant());
        learners.save(learner);
    }

    private LockedSession requireCurrentSession(String learningSessionId) {
        String tokenHash = hash(learningSessionId);
        String skillpilotId = sessions
                .findLearnerSkillpilotIdByTokenHash(tokenHash)
                .orElseThrow(OpenAiDeLearningSessionRequiredException::new);
        Learner learner = learners
                .findBySkillpilotIdForUpdate(skillpilotId)
                .orElseThrow(OpenAiDeLearningSessionRequiredException::new);
        OpenAiDeLearningSession session = sessions
                .findByTokenHashForUpdate(tokenHash)
                .orElseThrow(OpenAiDeLearningSessionRequiredException::new);
        if (!session.getExpiresAt().isAfter(clock.instant())) {
            throw new OpenAiDeLearningSessionRequiredException();
        }
        if (!learner.getSkillpilotId().equals(session.getLearner().getSkillpilotId())) {
            throw new OpenAiDeLearningSessionRequiredException();
        }
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

    private void requireMinimumRemaining(LockedSession locked) {
        Instant now = clock.instant();
        if (!locked.session().getExpiresAt().isAfter(now)) {
            throw new OpenAiDeLearningSessionRequiredException();
        }
        if (locked.session().getExpiresAt().isBefore(
                now.plus(OpenAiDeV1ContractMetadata.MINIMUM_ACTION_SESSION_REMAINING))) {
            throw new OpenAiDeV1SessionStateException(
                    OpenAiDeV1SessionStateException.Code.SESSION_RENEWAL_REQUIRED,
                    metadata(locked),
                    "The learning session has less than the required minimum remaining lifetime.");
        }
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
                OpenAiCoachLocale.normalize(session.getCommunicationLocale()),
                Map.of(),
                new OpenAiDeV1SessionMetadata.RecallDirective(
                        session.getVerifiedRecallBatchSize()));
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
        structured.put("communicationLocale", metadata.communicationLocale());
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
            throw new IllegalStateException("Could not hash the OpenAI Coach V1 request.", exception);
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
            throw new IllegalStateException("Could not hash the OpenAI Coach learning session.", exception);
        }
    }

    private UUID requireRequestId(String value) {
        try {
            return UUID.fromString(value);
        } catch (RuntimeException exception) {
            throw new IllegalArgumentException("clientRequestId must be a UUID.", exception);
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
            return "SkillPilot state reused unchanged.";
        }
        Object first = result.content().getFirst();
        if (first instanceof McpSchema.TextContent text && text.text() != null) {
            return text.text();
        }
        return "SkillPilot state reused unchanged.";
    }

    private record LockedSession(
            OpenAiDeLearningSession session,
            Learner learner) {
    }
}
