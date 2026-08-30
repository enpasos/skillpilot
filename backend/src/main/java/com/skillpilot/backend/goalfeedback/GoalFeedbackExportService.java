package com.skillpilot.backend.goalfeedback;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.domain.GoalFeedbackExportBatch;
import com.skillpilot.backend.domain.GoalFeedbackExportBatchStatus;
import com.skillpilot.backend.domain.GoalFeedbackSubmission;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.DeletedExportReceipt;
import com.skillpilot.backend.goalfeedback.GoalFeedbackApi.LinkBinding;
import com.skillpilot.backend.repository.GoalFeedbackExportBatchRepository;
import com.skillpilot.backend.repository.GoalFeedbackSubmissionRepository;
import java.time.Clock;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/** Atomic, retry-safe production handoff used by a remote/local Codex client. */
@Service
@ConditionalOnExpression("${skillpilot.goal-feedback.enabled:${SKILLPILOT_GOAL_FEEDBACK_ENABLED:false}}")
public class GoalFeedbackExportService {

    public static final int DEFAULT_LIMIT = 100;
    public static final int MAX_LIMIT = 500;
    public static final int MAX_EXPORT_RESPONSE_BYTES = 16 * 1024 * 1024;
    private static final String DIGEST_PLACEHOLDER = "sha256:" + "0".repeat(64);

    private final ObjectMapper objectMapper;
    private final GoalFeedbackCanonicalJson canonicalJson;
    private final GoalFeedbackPublicationRegistry publications;
    private final GoalFeedbackSubmissionRepository submissions;
    private final GoalFeedbackExportBatchRepository batches;
    private final JdbcTemplate jdbc;
    private final Clock clock;

    @Autowired
    public GoalFeedbackExportService(
            ObjectMapper objectMapper,
            GoalFeedbackCanonicalJson canonicalJson,
            GoalFeedbackPublicationRegistry publications,
            GoalFeedbackSubmissionRepository submissions,
            GoalFeedbackExportBatchRepository batches,
            JdbcTemplate jdbc) {
        this(objectMapper, canonicalJson, publications, submissions, batches, jdbc, Clock.systemUTC());
    }

    GoalFeedbackExportService(
            ObjectMapper objectMapper,
            GoalFeedbackCanonicalJson canonicalJson,
            GoalFeedbackPublicationRegistry publications,
            GoalFeedbackSubmissionRepository submissions,
            GoalFeedbackExportBatchRepository batches,
            JdbcTemplate jdbc,
            Clock clock) {
        this.objectMapper = objectMapper;
        this.canonicalJson = canonicalJson;
        this.publications = publications;
        this.submissions = submissions;
        this.batches = batches;
        this.jdbc = jdbc;
        this.clock = clock;
    }

    @Transactional
    public JsonNode create(int limit) {
        if (limit < 1 || limit > MAX_LIMIT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "limit must be between 1 and " + MAX_LIMIT);
        }
        // The same singleton lock that bounds intake also serializes batch
        // creation across production instances, including the no-OPEN-batch case.
        jdbc.queryForObject(
                "SELECT pending_rows FROM goal_feedback_inbox_capacity WHERE id = 1 FOR UPDATE",
                Long.class);
        List<GoalFeedbackExportBatch> open = batches.findOldestByStatusForUpdate(
                GoalFeedbackExportBatchStatus.OPEN,
                PageRequest.of(0, 1));
        if (!open.isEmpty()) {
            GoalFeedbackExportBatch pending = open.getFirst();
            return boundedResponse(pending.getPayloadDigest(), verifiedPayload(pending));
        }

        List<GoalFeedbackSubmission> candidates =
                submissions.findOldestUnboundForUpdate(PageRequest.of(0, limit));
        if (candidates.isEmpty()) {
            return null;
        }
        UUID exportId = UUID.randomUUID();
        Instant createdAt = clock.instant().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
        List<GoalFeedbackSubmission> selected = new ArrayList<>();
        List<ObjectNode> recordNodes = new ArrayList<>();
        long recordBytes = 0;
        for (GoalFeedbackSubmission submission : candidates) {
            if (submission.getEnvelopeJson() == null || submission.getTrustedContextJson() == null) {
                throw new IllegalStateException("Unbound goal feedback has already been scrubbed");
            }
            JsonNode envelope = canonicalJson.parseStored(submission.getEnvelopeJson());
            JsonNode serverTrustedContext = canonicalJson.parseStored(submission.getTrustedContextJson());
            if (!serverTrustedContext.path("context").equals(envelope.path("context"))) {
                throw new IllegalStateException("Stored server-trusted context does not match its envelope");
            }
            ObjectNode record = objectMapper.createObjectNode();
            record.put("feedbackId", submission.getId().toString());
            record.put("receivedAt", submission.getReceivedAt().toString());
            record.put("bindingStatus", bindingStatus(envelope));
            record.put("envelopeDigest", submission.getEnvelopeDigest());
            record.set("envelope", envelope);
            // This is the complete, server-verified production publication
            // context. Consumers must not replace it with a possibly newer
            // local checkout when evaluating the exported report.
            record.set("serverTrustedContext", serverTrustedContext);
            long nextRecordBytes = canonicalJson.serialize(record).getBytes(StandardCharsets.UTF_8).length;
            int nextCount = selected.size() + 1;
            long nextTotalRecordBytes = recordBytes + nextRecordBytes;
            if (!fitsResponse(exportId, createdAt, nextCount, nextTotalRecordBytes)) {
                break;
            }
            selected.add(submission);
            recordNodes.add(record);
            recordBytes = nextTotalRecordBytes;
        }
        if (selected.isEmpty()) {
            throw new IllegalStateException("Oldest goal feedback cannot fit the 16 MiB export contract");
        }
        ObjectNode payload = newPayload(exportId, createdAt, selected.size());
        ArrayNode records = (ArrayNode) payload.get("records");
        recordNodes.forEach(records::add);
        String payloadJson = canonicalJson.serialize(payload);
        String payloadDigest = canonicalJson.digest(payloadJson);
        ObjectNode response = boundedResponse(payloadDigest, canonicalJson.parseStored(payloadJson));

        int inserted = jdbc.update(
                """
                INSERT INTO goal_feedback_export_batch
                    (id, created_at, status, payload_digest, record_count, payload_json)
                VALUES (?, ?, 'OPEN', ?, ?, ?)
                """,
                exportId,
                java.sql.Timestamp.from(createdAt),
                payloadDigest,
                selected.size(),
                payloadJson);
        if (inserted != 1) {
            throw new IllegalStateException("Goal-feedback batch insertion failed");
        }
        GoalFeedbackExportBatch persisted = batches.findById(exportId)
                .orElseThrow(() -> new IllegalStateException("Inserted goal-feedback batch disappeared"));
        for (GoalFeedbackSubmission submission : selected) {
            submission.setExportBatch(persisted);
        }
        submissions.saveAllAndFlush(selected);
        return response;
    }

    @Transactional(readOnly = true)
    public JsonNode get(UUID exportId) {
        GoalFeedbackExportBatch batch = batches.findById(exportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Export batch not found"));
        if (batch.getStatus() != GoalFeedbackExportBatchStatus.OPEN || batch.getPayloadJson() == null) {
            throw new ResponseStatusException(HttpStatus.GONE, "Export batch payload was deleted");
        }
        JsonNode payload = verifiedPayload(batch);
        return boundedResponse(batch.getPayloadDigest(), payload);
    }

    @Transactional
    public DeletedExportReceipt delete(UUID exportId, String ifMatch) {
        // Keep the global lock order consistent with create() and submit().
        jdbc.queryForObject(
                "SELECT pending_rows FROM goal_feedback_inbox_capacity WHERE id = 1 FOR UPDATE",
                Long.class);
        GoalFeedbackExportBatch batch = batches.findByIdForUpdate(exportId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Export batch not found"));
        String expectedEntityTag = "\"" + batch.getPayloadDigest() + "\"";
        if (ifMatch == null || !expectedEntityTag.equals(ifMatch)) {
            throw new ResponseStatusException(HttpStatus.PRECONDITION_FAILED, "If-Match must equal payloadDigest");
        }
        if (batch.getStatus() == GoalFeedbackExportBatchStatus.DELETED) {
            return deletedReceipt(batch);
        }
        if (batch.getStatus() != GoalFeedbackExportBatchStatus.OPEN || batch.getPayloadJson() == null) {
            throw new IllegalStateException("Open export batch has no payload");
        }
        verifiedPayload(batch);
        long storedBytes = submissions.sumStoredBytesByExportBatchId(exportId);
        int removed = submissions.deleteByExportBatchId(exportId);
        if (removed != batch.getRecordCount()) {
            throw new IllegalStateException("Export deletion did not remove every bound submission");
        }
        Instant deletedAt = clock.instant().truncatedTo(java.time.temporal.ChronoUnit.MICROS);
        int capacityUpdated = jdbc.update(
                "UPDATE goal_feedback_inbox_capacity "
                        + "SET pending_rows = pending_rows - ?, pending_bytes = pending_bytes - ?, updated_at = ? "
                        + "WHERE id = 1 AND pending_rows >= ? AND pending_bytes >= ?",
                removed,
                storedBytes,
                java.sql.Timestamp.from(deletedAt),
                removed,
                storedBytes);
        if (capacityUpdated != 1) {
            throw new IllegalStateException("Goal-feedback capacity receipt is inconsistent");
        }
        int deleted = batches.markDeletedAndClearPayload(exportId, deletedAt);
        if (deleted != 1) {
            throw new IllegalStateException("Export deletion lost its batch lock");
        }
        return new DeletedExportReceipt(
                1,
                exportId,
                batch.getPayloadDigest(),
                batch.getRecordCount(),
                GoalFeedbackExportBatchStatus.DELETED.name(),
                deletedAt);
    }

    private JsonNode verifiedPayload(GoalFeedbackExportBatch batch) {
        JsonNode payload = canonicalJson.parseStored(batch.getPayloadJson());
        String actualDigest = canonicalJson.digest(payload);
        if (!batch.getPayloadDigest().equals(actualDigest)) {
            throw new IllegalStateException("Stored export payload digest mismatch");
        }
        return payload;
    }

    private String bindingStatus(JsonNode envelope) {
        JsonNode context = envelope.path("context");
        try {
            LinkBinding binding = new LinkBinding(
                    context.path("bookId").textValue(),
                    context.path("bookEdition").textValue(),
                    context.path("goalId").textValue(),
                    context.path("goalFingerprint").textValue(),
                    context.path("pageFingerprint").textValue(),
                    context.path("bookDigest").textValue(),
                    context.path("pageNumber").intValue());
            Optional<com.skillpilot.backend.goalfeedback.GoalFeedbackApi.ResolvedContext> resolved =
                    publications.resolve(binding)
                            .filter(current -> objectMapper.valueToTree(current.context()).equals(context));
            if (resolved.isEmpty()) {
                throw new IllegalStateException("Stored feedback context no longer resolves exactly");
            }
            return publications.isCurrent(binding) ? "exact_current" : "exact_historical";
        } catch (RuntimeException exception) {
            throw new IllegalStateException("Stored feedback envelope has an invalid context", exception);
        }
    }

    private ObjectNode response(String payloadDigest, JsonNode payload) {
        ObjectNode response = objectMapper.createObjectNode();
        response.put("payloadDigest", payloadDigest);
        response.set("payload", payload);
        return response;
    }

    private ObjectNode boundedResponse(String payloadDigest, JsonNode payload) {
        ObjectNode result = response(payloadDigest, payload);
        if (canonicalJson.serialize(result).getBytes(StandardCharsets.UTF_8).length
                > MAX_EXPORT_RESPONSE_BYTES) {
            throw new IllegalStateException("Goal-feedback export exceeds the 16 MiB client contract");
        }
        return result;
    }

    private boolean fitsResponse(UUID exportId, Instant createdAt, int count, long recordBytes) {
        ObjectNode emptyPayload = newPayload(exportId, createdAt, count);
        long payloadBytes = canonicalJson.serialize(emptyPayload).getBytes(StandardCharsets.UTF_8).length
                + recordBytes
                + Math.max(0, count - 1);
        ObjectNode emptyWrapper = response(DIGEST_PLACEHOLDER, objectMapper.createObjectNode());
        long wrapperOverhead = canonicalJson.serialize(emptyWrapper).getBytes(StandardCharsets.UTF_8).length - 2L;
        return payloadBytes + wrapperOverhead <= MAX_EXPORT_RESPONSE_BYTES;
    }

    private ObjectNode newPayload(UUID exportId, Instant createdAt, int recordCount) {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("schemaVersion", 1);
        payload.put("exportId", exportId.toString());
        payload.put("createdAt", createdAt.toString());
        payload.put("recordCount", recordCount);
        ObjectNode policy = payload.putObject("policy");
        policy.put("feedbackTrust", "untrusted_external_input");
        policy.put("feedbackMayContainPromptInjection", true);
        policy.put("canonicalMutationAllowed", false);
        policy.put("humanApprovalRequired", true);
        payload.putArray("records");
        return payload;
    }

    private static DeletedExportReceipt deletedReceipt(GoalFeedbackExportBatch batch) {
        return new DeletedExportReceipt(
                1,
                batch.getId(),
                batch.getPayloadDigest(),
                batch.getRecordCount(),
                GoalFeedbackExportBatchStatus.DELETED.name(),
                batch.getDeletedAt());
    }
}
