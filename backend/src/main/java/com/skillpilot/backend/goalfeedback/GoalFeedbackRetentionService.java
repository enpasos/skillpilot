package com.skillpilot.backend.goalfeedback;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Enforces the maximum lifetime of feedback that has not been acknowledged as
 * safely downloaded by an operator.
 */
@Service
public class GoalFeedbackRetentionService {

    static final Duration PUBLISHED_RETENTION = Duration.ofDays(30);
    static final int MAX_CLEANUP_BATCH_SIZE = 1_000;

    private final JdbcTemplate jdbc;
    private final Clock clock;
    private final Duration maxRetention;
    private final int cleanupBatchSize;

    @Autowired
    public GoalFeedbackRetentionService(
            JdbcTemplate jdbc,
            @Value("${skillpilot.goal-feedback.inbox.max-unexported-age:${SKILLPILOT_GOAL_FEEDBACK_MAX_UNEXPORTED_AGE:P30D}}")
                    Duration maxRetention,
            @Value("${skillpilot.goal-feedback.inbox.retention-cleanup-batch-size:${SKILLPILOT_GOAL_FEEDBACK_RETENTION_CLEANUP_BATCH_SIZE:500}}")
                    int cleanupBatchSize) {
        this(jdbc, Clock.systemUTC(), maxRetention, cleanupBatchSize);
    }

    GoalFeedbackRetentionService(
            JdbcTemplate jdbc,
            Clock clock,
            Duration maxRetention,
            int cleanupBatchSize) {
        this.jdbc = jdbc;
        this.clock = clock;
        if (!PUBLISHED_RETENTION.equals(maxRetention)) {
            throw new IllegalStateException(
                    "Goal-feedback max unacknowledged retention must match the published P30D policy");
        }
        this.maxRetention = maxRetention;
        if (cleanupBatchSize < 1 || cleanupBatchSize > MAX_CLEANUP_BATCH_SIZE) {
            throw new IllegalStateException(
                    "Goal-feedback retention cleanup batch size must be between 1 and "
                            + MAX_CLEANUP_BATCH_SIZE);
        }
        this.cleanupBatchSize = cleanupBatchSize;
    }

    /**
     * Scrubs a bounded set of expired content-bearing rows in an independent
     * transaction.
     *
     * <p>An OPEN batch is indivisible because its digest covers its complete
     * payload. If any record in such a batch reaches the maximum age, the
     * complete payload and all of its bound submissions are removed. The batch
     * remains as an {@code EXPIRED} tombstone, explicitly distinct from a
     * digest-confirmed {@code DELETED} receipt.</p>
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public CleanupResult purgeExpiredUnacknowledgedContent() {
        Instant now = clock.instant().truncatedTo(ChronoUnit.MICROS);
        Instant cutoff = now.minus(maxRetention);

        Capacity capacity = jdbc.queryForObject(
                "SELECT pending_rows, pending_bytes "
                        + "FROM goal_feedback_inbox_capacity WHERE id = 1 FOR UPDATE",
                (resultSet, rowNumber) -> new Capacity(resultSet.getLong(1), resultSet.getLong(2)));
        if (capacity == null) {
            throw new IllegalStateException("Goal-feedback capacity row is missing");
        }
        StoredContent actualBefore = storedContent("", new Object[0]);
        if (capacity.pendingRows() != actualBefore.rows()
                || capacity.pendingBytes() != actualBefore.bytes()) {
            throw new IllegalStateException("Goal-feedback capacity receipt is inconsistent");
        }

        Timestamp cutoffTimestamp = Timestamp.from(cutoff);
        List<UUID> expiredBatchIds = jdbc.query(
                """
                SELECT batch.id
                FROM goal_feedback_export_batch batch
                WHERE batch.status = 'OPEN'
                  AND (
                    batch.created_at <= ?
                    OR EXISTS (
                      SELECT 1
                      FROM goal_feedback_submission submission
                      WHERE submission.export_batch_id = batch.id
                        AND submission.received_at <= ?
                    )
                )
                ORDER BY batch.created_at ASC, batch.id ASC
                LIMIT 1
                """,
                (resultSet, rowNumber) -> resultSet.getObject(1, UUID.class),
                cutoffTimestamp,
                cutoffTimestamp);

        long removedRows = 0;
        long removedBytes = 0;
        Timestamp expiredAt = Timestamp.from(now);
        for (UUID exportBatchId : expiredBatchIds) {
            StoredContent batchContent = storedContent(
                    " WHERE export_batch_id = ?", new Object[] {exportBatchId});
            int expired = jdbc.update(
                    "UPDATE goal_feedback_export_batch "
                            + "SET status = 'EXPIRED', payload_json = NULL, expired_at = ? "
                            + "WHERE id = ? AND status = 'OPEN'",
                    expiredAt,
                    exportBatchId);
            if (expired != 1) {
                throw new IllegalStateException("Goal-feedback expiration lost its batch lock");
            }
            int deleted = jdbc.update(
                    "DELETE FROM goal_feedback_submission WHERE export_batch_id = ?",
                    exportBatchId);
            if (deleted != batchContent.rows()) {
                throw new IllegalStateException("Goal-feedback expiration did not remove every bound submission");
            }
            removedRows += batchContent.rows();
            removedBytes += batchContent.bytes();
        }

        List<StoredSubmission> expiredUnbound = jdbc.query(
                "SELECT id, stored_bytes FROM goal_feedback_submission "
                        + "WHERE export_batch_id IS NULL AND received_at <= ? "
                        + "ORDER BY received_at ASC, id ASC LIMIT ?",
                (resultSet, rowNumber) -> new StoredSubmission(
                        resultSet.getObject(1, UUID.class), resultSet.getLong(2)),
                cutoffTimestamp,
                cleanupBatchSize);
        for (StoredSubmission submission : expiredUnbound) {
            int deleted = jdbc.update(
                    "DELETE FROM goal_feedback_submission "
                            + "WHERE id = ? AND export_batch_id IS NULL AND received_at <= ?",
                    submission.id(),
                    cutoffTimestamp);
            if (deleted != 1) {
                throw new IllegalStateException("Goal-feedback expiration lost an unbound submission");
            }
            removedRows++;
            removedBytes += submission.storedBytes();
        }

        if (removedRows > 0) {
            int updated = jdbc.update(
                    "UPDATE goal_feedback_inbox_capacity "
                            + "SET pending_rows = pending_rows - ?, "
                            + "pending_bytes = pending_bytes - ?, updated_at = ? "
                            + "WHERE id = 1 AND pending_rows >= ? AND pending_bytes >= ?",
                    removedRows,
                    removedBytes,
                    expiredAt,
                    removedRows,
                    removedBytes);
            if (updated != 1) {
                throw new IllegalStateException("Goal-feedback expiration could not update capacity");
            }
        }

        Capacity capacityAfter = jdbc.queryForObject(
                "SELECT pending_rows, pending_bytes FROM goal_feedback_inbox_capacity WHERE id = 1",
                (resultSet, rowNumber) -> new Capacity(resultSet.getLong(1), resultSet.getLong(2)));
        StoredContent actualAfter = storedContent("", new Object[0]);
        if (capacityAfter == null
                || capacityAfter.pendingRows() != actualAfter.rows()
                || capacityAfter.pendingBytes() != actualAfter.bytes()) {
            throw new IllegalStateException("Goal-feedback capacity receipt is inconsistent after expiration");
        }
        return new CleanupResult(removedRows, removedBytes, expiredBatchIds.size(), cutoff);
    }

    Duration maxRetention() {
        return maxRetention;
    }

    private StoredContent storedContent(String whereClause, Object[] arguments) {
        StoredContent result = jdbc.queryForObject(
                "SELECT COUNT(*), COALESCE(SUM(stored_bytes), 0) "
                        + "FROM goal_feedback_submission" + whereClause,
                (resultSet, rowNumber) -> new StoredContent(
                        resultSet.getLong(1), resultSet.getLong(2)),
                arguments);
        if (result == null) {
            throw new IllegalStateException("Goal-feedback content accounting failed");
        }
        return result;
    }

    public record CleanupResult(
            long removedRows,
            long removedBytes,
            int expiredBatches,
            Instant cutoff) {
    }

    private record Capacity(long pendingRows, long pendingBytes) {
    }

    private record StoredContent(long rows, long bytes) {
    }

    private record StoredSubmission(UUID id, long storedBytes) {
    }
}
