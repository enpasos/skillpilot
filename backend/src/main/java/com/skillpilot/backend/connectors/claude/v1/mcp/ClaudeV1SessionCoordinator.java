package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import com.skillpilot.backend.connectors.claude.v1.persistence.ClaudeV1IdempotencyRecord;
import com.skillpilot.backend.connectors.claude.v1.persistence.ClaudeV1IdempotencyRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSession;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionException;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1SessionTokenCodec;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;
import java.util.function.LongSupplier;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Coordinates Claude v1 operations for one short-lived learning session.
 *
 * <p>The reusable OAuth principal never selects a learner. Every operation hashes the explicit
 * {@code learningSessionId}, locks the canonical learner and its provider-specific session, checks
 * the absolute expiry, and scopes replay protection to that session hash.</p>
 */
@Component
@ConditionalOnClaudeV1Enabled
public class ClaudeV1SessionCoordinator {

    public static class StaleStateException extends RuntimeException {
        private final long currentStateVersion;

        StaleStateException(long expected, long current) {
            super("State version conflict: expected " + expected + ", current " + current + ".");
            this.currentStateVersion = current;
        }

        public long currentStateVersion() {
            return currentStateVersion;
        }
    }

    public static class IdempotencyConflictException extends RuntimeException {
        IdempotencyConflictException() {
            super("This clientRequestId was already used with a different request payload.");
        }
    }

    public record ReadContext(
            String sessionBinding,
            String skillpilotId,
            long stateVersion,
            String communicationLocale) {
    }

    public static final class MutateContext {
        private final String sessionBinding;
        private final String skillpilotId;
        private final long stateVersion;
        private final String communicationLocale;
        private final LongSupplier currentStateVersion;

        private MutateContext(
                String sessionBinding,
                String skillpilotId,
                long stateVersion,
                String communicationLocale,
                LongSupplier currentStateVersion) {
            this.sessionBinding = sessionBinding;
            this.skillpilotId = skillpilotId;
            this.stateVersion = stateVersion;
            this.communicationLocale = communicationLocale;
            this.currentStateVersion = currentStateVersion;
        }

        public String sessionBinding() {
            return sessionBinding;
        }

        public String skillpilotId() {
            return skillpilotId;
        }

        public long stateVersion() {
            return stateVersion;
        }

        public String communicationLocale() {
            return communicationLocale;
        }

        public long currentStateVersion() {
            return currentStateVersion.getAsLong();
        }
    }

    public record Outcome<T>(T value, long stateVersion) {
    }

    private record LockedSession(
            String tokenHash,
            ClaudeV1LearningSession session,
            Learner learner) {
    }

    private final LearnerRepository learners;
    private final ClaudeV1LearningSessionRepository sessions;
    private final ClaudeV1IdempotencyRepository idempotency;
    private final ClaudeV1SessionTokenCodec tokenCodec;
    private final ClaudeV1Properties properties;
    private final ObjectMapper objectMapper;
    private final ObjectMapper canonicalObjectMapper;

    public ClaudeV1SessionCoordinator(
            LearnerRepository learners,
            ClaudeV1LearningSessionRepository sessions,
            ClaudeV1IdempotencyRepository idempotency,
            ClaudeV1SessionTokenCodec tokenCodec,
            ClaudeV1Properties properties,
            ObjectMapper objectMapper) {
        this.learners = Objects.requireNonNull(learners, "learners");
        this.sessions = Objects.requireNonNull(sessions, "sessions");
        this.idempotency = Objects.requireNonNull(idempotency, "idempotency");
        this.tokenCodec = Objects.requireNonNull(tokenCodec, "tokenCodec");
        this.properties = Objects.requireNonNull(properties, "properties");
        this.objectMapper = Objects.requireNonNull(objectMapper, "objectMapper");
        this.canonicalObjectMapper = objectMapper.copy()
                .enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS);
    }

    @Transactional
    public <T> Outcome<T> read(String learningSessionId, Function<ReadContext, T> operation) {
        LockedSession locked = requireCurrentSession(learningSessionId);
        Learner learner = locked.learner();
        long stateVersion = learner.getCoachStateRevision();
        return new Outcome<>(
                operation.apply(new ReadContext(
                        locked.tokenHash(),
                        learner.getSkillpilotId(),
                        stateVersion,
                        locked.session().communicationLocale())),
                stateVersion);
    }

    @Transactional
    public Outcome<Map<String, Object>> mutate(
            String learningSessionId,
            String toolName,
            String clientRequestId,
            long expectedStateVersion,
            Object requestPayload,
            Function<MutateContext, Map<String, Object>> operation) {
        if (toolName == null || toolName.isBlank()) {
            throw new IllegalArgumentException("Missing tool name for mutation replay isolation.");
        }
        if (clientRequestId == null || clientRequestId.isBlank()) {
            throw new IllegalArgumentException("Missing clientRequestId for mutation replay isolation.");
        }

        LockedSession locked = requireCurrentSession(learningSessionId);
        String tokenHash = locked.tokenHash();
        Learner learner = locked.learner();
        String requestHash = sha256Hex(serializePayload(Map.of(
                "tool", toolName,
                "arguments", requestPayload == null ? Map.of() : requestPayload)));

        long versionBefore = learner.getCoachStateRevision();
        Instant now = Instant.now();
        idempotency.deleteExpired(now);
        Optional<ClaudeV1IdempotencyRecord> existing =
                idempotency.findLive(tokenHash, clientRequestId, now);
        if (existing.isPresent()) {
            ClaudeV1IdempotencyRecord record = existing.get();
            if (!toolName.equals(record.toolName()) || !record.requestHash().equals(requestHash)) {
                throw new IdempotencyConflictException();
            }
            if (versionBefore != record.stateVersion()) {
                throw new StaleStateException(record.stateVersion(), versionBefore);
            }
            return new Outcome<>(deserializeResult(record.responsePayload()), record.stateVersion());
        }
        if (expectedStateVersion != versionBefore) {
            throw new StaleStateException(expectedStateVersion, versionBefore);
        }

        Map<String, Object> result = operation.apply(new MutateContext(
                tokenHash,
                learner.getSkillpilotId(),
                versionBefore,
                locked.session().communicationLocale(),
                () -> currentStateVersion(learner.getSkillpilotId())));

        long versionAfter = currentStateVersion(learner.getSkillpilotId());
        if (versionAfter <= versionBefore) {
            throw new IllegalStateException(
                    "The canonical learner state revision did not advance during a write operation.");
        }
        sessions.updateStateVersion(tokenHash, versionAfter);

        String serializedResult = serializeResult(result);
        if (serializedResult.getBytes(StandardCharsets.UTF_8).length > properties.getMaxResponseBytes()) {
            throw new IllegalStateException("The idempotency replay projection exceeds its configured limit.");
        }
        idempotency.save(new ClaudeV1IdempotencyRecord(
                tokenHash,
                clientRequestId,
                toolName,
                requestHash,
                serializedResult,
                versionAfter,
                now,
                replayExpiresAt(toolName, now, locked.session().expiresAt())));
        return new Outcome<>(result, versionAfter);
    }

    private LockedSession requireCurrentSession(String learningSessionId) {
        String tokenHash = tokenCodec.hash(learningSessionId);
        String learnerId = sessions.findLearnerIdByTokenHash(tokenHash)
                .orElseThrow(() -> new ClaudeV1LearningSessionException(
                        ClaudeV1LearningSessionException.Reason.REQUIRED));
        Learner learner = learners.findBySkillpilotIdForUpdate(learnerId)
                .orElseThrow(() -> new ClaudeV1LearningSessionException(
                        ClaudeV1LearningSessionException.Reason.REQUIRED));
        ClaudeV1LearningSession session = sessions.findByTokenHashForUpdate(tokenHash)
                .orElseThrow(() -> new ClaudeV1LearningSessionException(
                        ClaudeV1LearningSessionException.Reason.REQUIRED));
        if (!learner.getSkillpilotId().equals(session.learnerId())) {
            throw new ClaudeV1LearningSessionException(ClaudeV1LearningSessionException.Reason.REQUIRED);
        }
        if (!session.expiresAt().isAfter(Instant.now())) {
            throw new ClaudeV1LearningSessionException(ClaudeV1LearningSessionException.Reason.EXPIRED);
        }
        return new LockedSession(tokenHash, session, learner);
    }

    private long currentStateVersion(String skillpilotId) {
        return learners.findById(skillpilotId)
                .map(Learner::getCoachStateRevision)
                .orElseThrow(() -> new IllegalStateException("Learner disappeared during the mutation."));
    }

    private Instant replayExpiresAt(String toolName, Instant createdAt, Instant sessionExpiresAt) {
        Instant configuredExpiry;
        if (ClaudeV1Contract.TOOL_RECORD_VERIFIED_RECALL_RESULTS.equals(toolName)
                && properties.getCapabilityTtl().compareTo(properties.getIdempotencyTtl()) < 0) {
            configuredExpiry = createdAt.plus(properties.getCapabilityTtl());
        } else {
            configuredExpiry = createdAt.plus(properties.getIdempotencyTtl());
        }
        return configuredExpiry.isBefore(sessionExpiresAt) ? configuredExpiry : sessionExpiresAt;
    }

    private String serializePayload(Object payload) {
        try {
            return canonicalObjectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Request payload cannot be canonicalized for replay detection.", e);
        }
    }

    private String serializeResult(Object result) {
        try {
            return objectMapper.writeValueAsString(result);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize tool result for replay.", e);
        }
    }

    private Map<String, Object> deserializeResult(String json) {
        try {
            return objectMapper.readValue(json, new TypeReference<LinkedHashMap<String, Object>>() {});
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to deserialize the stored tool result.", e);
        }
    }

    private String sha256Hex(String value) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.GeneralSecurityException e) {
            throw new IllegalStateException("SHA-256 is unavailable.", e);
        }
    }
}
