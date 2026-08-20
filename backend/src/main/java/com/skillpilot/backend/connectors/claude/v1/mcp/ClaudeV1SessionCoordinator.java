package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1BindingService;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1Connection;
import com.skillpilot.backend.connectors.claude.v1.identity.ClaudeV1ConnectionRepository;
import com.skillpilot.backend.connectors.claude.v1.persistence.ClaudeV1IdempotencyRecord;
import com.skillpilot.backend.connectors.claude.v1.persistence.ClaudeV1IdempotencyRepository;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.repository.LearnerRepository;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import java.util.function.LongSupplier;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Coordinates read and mutation operations for Claude v1 sessions with optimistic concurrency
 * control, a pessimistic learner lock, and exact-once idempotency.
 *
 * <p>Mutations compare {@code expectedStateVersion} against the canonical revision under the lock,
 * before the operation runs, and confirm afterwards that the canonical domain rule advanced the
 * revision. The post-state revision is read back from the learner rather than assumed, so the
 * version Claude receives is the one a following write will be compared against.</p>
 */
@Component
@ConditionalOnClaudeV1Enabled
public class ClaudeV1SessionCoordinator {

    /** Raised when a caller supplies a stale {@code expectedStateVersion}. */
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

    /** Raised when one {@code clientRequestId} is reused with a different payload. */
    public static class IdempotencyConflictException extends RuntimeException {
        IdempotencyConflictException() {
            super("This clientRequestId was already used with a different request payload.");
        }
    }

    public record ReadContext(String connectionId, String skillpilotId, long stateVersion) {}

    public static final class MutateContext {
        private final String connectionId;
        private final String skillpilotId;
        private final long stateVersion;
        private final LongSupplier currentStateVersion;

        private MutateContext(
                String connectionId,
                String skillpilotId,
                long stateVersion,
                LongSupplier currentStateVersion) {
            this.connectionId = connectionId;
            this.skillpilotId = skillpilotId;
            this.stateVersion = stateVersion;
            this.currentStateVersion = currentStateVersion;
        }

        public String connectionId() {
            return connectionId;
        }

        public String skillpilotId() {
            return skillpilotId;
        }

        public long stateVersion() {
            return stateVersion;
        }

        /** Reads the canonical revision after the operation has performed its domain write. */
        public long currentStateVersion() {
            return currentStateVersion.getAsLong();
        }
    }

    /** A tool result plus the canonical revision that was in effect when it was produced. */
    public record Outcome<T>(T value, long stateVersion) {}

    private final LearnerRepository learnerRepository;
    private final ClaudeV1ConnectionRepository connectionRepository;
    private final ClaudeV1IdempotencyRepository idempotencyRepository;
    private final ClaudeV1Properties properties;
    private final ObjectMapper objectMapper;
    private final ObjectMapper canonicalObjectMapper;

    public ClaudeV1SessionCoordinator(
            LearnerRepository learnerRepository,
            ClaudeV1ConnectionRepository connectionRepository,
            ClaudeV1IdempotencyRepository idempotencyRepository,
            ClaudeV1Properties properties,
            ObjectMapper objectMapper) {
        this.learnerRepository = Objects.requireNonNull(learnerRepository, "learnerRepository");
        this.connectionRepository = Objects.requireNonNull(connectionRepository, "connectionRepository");
        this.idempotencyRepository = Objects.requireNonNull(idempotencyRepository, "idempotencyRepository");
        this.properties = Objects.requireNonNull(properties, "properties");
        this.objectMapper = Objects.requireNonNull(objectMapper, "objectMapper");
        this.canonicalObjectMapper = objectMapper.copy()
                .enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS);
    }

    /**
     * Runs a read against the canonical learner state.
     *
     * <p>Nothing is written here, not even a connection activity timestamp. The connection and
     * learner rows are nevertheless locked for the duration of the projection: several canonical
     * "read" facade calls use {@code SELECT FOR UPDATE}, and the returned state must not be mixed
     * with a revision from a concurrent write or a concurrently revoked connection.</p>
     */
    @Transactional
    public <T> Outcome<T> read(String connectionId, Function<ReadContext, T> operation) {
        if (connectionId == null || connectionId.isBlank()) {
            throw new IllegalArgumentException("Missing connection identifier.");
        }
        ClaudeV1Connection connection = connectionRepository.findActiveConnectionByIdForUpdate(connectionId)
                .orElseThrow(() -> new IllegalStateException("Connection is not active."));
        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(connection.skillpilotId())
                .orElseThrow(() -> new IllegalStateException("No learner is bound to this connection."));
        long stateVersion = learner.getCoachStateRevision();
        return new Outcome<>(
                operation.apply(new ReadContext(connectionId, connection.skillpilotId(), stateVersion)),
                stateVersion);
    }

    /**
     * Runs a mutation under the learner lock with optimistic concurrency and replay protection.
     *
     * @param expectedStateVersion the revision the caller believes is current; required
     */
    @Transactional
    public Outcome<Map<String, Object>> mutate(
            String connectionId,
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
        String requestHash = ClaudeV1BindingService.sha256Hex(serializePayload(Map.of(
                "tool", toolName,
                "arguments", requestPayload == null ? Map.of() : requestPayload)));

        // Locking the connection first serializes duplicate calls from one OAuth subject and makes
        // revocation atomic with respect to a state-changing operation.
        ClaudeV1Connection connection = connectionRepository.findActiveConnectionByIdForUpdate(connectionId)
                .orElseThrow(() -> new IllegalStateException("Connection is not active."));

        Learner learner = learnerRepository.findBySkillpilotIdForUpdate(connection.skillpilotId())
                .orElseThrow(() -> new IllegalStateException("No learner is bound to this connection."));

        long versionBefore = learner.getCoachStateRevision();
        Instant now = Instant.now();
        idempotencyRepository.deleteExpired(now);
        Optional<ClaudeV1IdempotencyRecord> existing =
                idempotencyRepository.findLive(connectionId, clientRequestId, now);
        if (existing.isPresent()) {
            ClaudeV1IdempotencyRecord record = existing.get();
            if (!record.requestHash().equals(requestHash)) {
                throw new IdempotencyConflictException();
            }
            if (versionBefore != record.stateVersion()) {
                throw new StaleStateException(record.stateVersion(), versionBefore);
            }
            // Deterministic replay is valid only while no later canonical write has superseded the
            // recorded result. Otherwise the caller must reload rather than receive stale context.
            return new Outcome<>(deserializeResult(record.responsePayload()), record.stateVersion());
        }
        if (expectedStateVersion != versionBefore) {
            throw new StaleStateException(expectedStateVersion, versionBefore);
        }

        Map<String, Object> result = operation.apply(new MutateContext(
                connectionId,
                connection.skillpilotId(),
                versionBefore,
                () -> currentStateVersion(connection.skillpilotId())));

        // Read the revision back instead of assuming an increment: the canonical domain rule owns
        // how far it advances, and the value returned to Claude must be the one the next write is
        // compared against.
        long versionAfter = currentStateVersion(connection.skillpilotId());
        if (versionAfter <= versionBefore) {
            throw new IllegalStateException(
                    "The canonical learner state revision did not advance during a write operation.");
        }

        connectionRepository.updateConnectionLastActivity(connectionId, Instant.now());

        String serializedResult = serializeResult(result);
        if (serializedResult.getBytes(java.nio.charset.StandardCharsets.UTF_8).length
                > properties.getMaxResponseBytes()) {
            throw new IllegalStateException("The idempotency replay projection exceeds its configured limit.");
        }
        idempotencyRepository.save(new ClaudeV1IdempotencyRecord(
                UUID.randomUUID().toString(),
                connectionId,
                clientRequestId,
                requestHash,
                serializedResult,
                versionAfter,
                now,
                replayExpiresAt(toolName, now)));

        return new Outcome<>(result, versionAfter);
    }

    private long currentStateVersion(String skillpilotId) {
        return learnerRepository.findById(skillpilotId)
                .map(Learner::getCoachStateRevision)
                .orElseThrow(() -> new IllegalStateException("Learner disappeared during the mutation."));
    }

    private Instant replayExpiresAt(String toolName, Instant createdAt) {
        // The recall result response can contain a freshly minted continuation capability. Never
        // replay that response after the capability itself could have expired; at that point the
        // old expected revision is stale and the client must reload instead.
        if (ClaudeV1Contract.TOOL_RECORD_VERIFIED_RECALL_RESULTS.equals(toolName)
                && properties.getCapabilityTtl().compareTo(properties.getIdempotencyTtl()) < 0) {
            return createdAt.plus(properties.getCapabilityTtl());
        }
        return createdAt.plus(properties.getIdempotencyTtl());
    }

    private String serializePayload(Object payload) {
        if (payload == null) {
            return "";
        }
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
}
