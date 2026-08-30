package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;
import org.h2.jdbcx.JdbcDataSource;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

class GoalFeedbackRetentionServiceTest {

    private static final Instant NOW = Instant.parse("2026-09-01T12:00:00Z");

    private JdbcTemplate jdbc;

    @BeforeEach
    void createDatabase() {
        JdbcDataSource dataSource = new JdbcDataSource();
        dataSource.setURL("jdbc:h2:mem:goal-feedback-retention-" + UUID.randomUUID()
                + ";MODE=PostgreSQL;DB_CLOSE_DELAY=-1");
        jdbc = new JdbcTemplate(dataSource);
        jdbc.execute("""
                CREATE TABLE goal_feedback_export_batch (
                    id UUID PRIMARY KEY,
                    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                    status VARCHAR(16) NOT NULL,
                    payload_digest VARCHAR(71) NOT NULL,
                    record_count INTEGER NOT NULL,
                    payload_json TEXT,
                    deleted_at TIMESTAMP WITH TIME ZONE,
                    expired_at TIMESTAMP WITH TIME ZONE
                )
                """);
        jdbc.execute("""
                CREATE TABLE goal_feedback_submission (
                    id UUID PRIMARY KEY,
                    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
                    stored_bytes BIGINT NOT NULL,
                    export_batch_id UUID
                )
                """);
        jdbc.execute("""
                CREATE TABLE goal_feedback_inbox_capacity (
                    id SMALLINT PRIMARY KEY,
                    pending_rows BIGINT NOT NULL,
                    pending_bytes BIGINT NOT NULL,
                    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
                )
                """);
    }

    @Test
    void removesExpiredUnboundContentAndExpiresAnIndivisibleOpenBatch() {
        UUID expiredBatch = insertBatch(NOW.minus(Duration.ofDays(1)), "OPEN", 2, "sensitive-expired-payload");
        UUID currentBatch = insertBatch(NOW.minus(Duration.ofDays(1)), "OPEN", 1, "current-payload");
        insertSubmission(NOW.minus(Duration.ofDays(30)), 17, expiredBatch);
        insertSubmission(NOW.minus(Duration.ofDays(2)), 19, expiredBatch);
        insertSubmission(NOW.minus(Duration.ofDays(2)), 23, currentBatch);
        insertSubmission(NOW.minus(Duration.ofDays(31)), 11, null);
        insertSubmission(NOW.minus(Duration.ofDays(2)), 13, null);
        insertCapacity(5, 83);

        GoalFeedbackRetentionService service = service(Duration.ofDays(30));
        GoalFeedbackRetentionService.CleanupResult result =
                service.purgeExpiredUnacknowledgedContent();

        assertThat(result.removedRows()).isEqualTo(3);
        assertThat(result.removedBytes()).isEqualTo(47);
        assertThat(result.expiredBatches()).isOne();
        assertThat(result.cutoff()).isEqualTo(NOW.minus(Duration.ofDays(30)));
        assertThat(jdbc.queryForObject(
                "SELECT status FROM goal_feedback_export_batch WHERE id = ?",
                String.class,
                expiredBatch)).isEqualTo("EXPIRED");
        assertThat(jdbc.queryForObject(
                "SELECT payload_json FROM goal_feedback_export_batch WHERE id = ?",
                String.class,
                expiredBatch)).isNull();
        assertThat(jdbc.queryForObject(
                "SELECT expired_at FROM goal_feedback_export_batch WHERE id = ?",
                Instant.class,
                expiredBatch)).isEqualTo(NOW);
        assertThat(jdbc.queryForObject(
                "SELECT deleted_at FROM goal_feedback_export_batch WHERE id = ?",
                Instant.class,
                expiredBatch)).isNull();
        assertThat(jdbc.queryForObject(
                "SELECT status FROM goal_feedback_export_batch WHERE id = ?",
                String.class,
                currentBatch)).isEqualTo("OPEN");
        assertThat(jdbc.queryForObject(
                "SELECT payload_json FROM goal_feedback_export_batch WHERE id = ?",
                String.class,
                currentBatch)).isEqualTo("current-payload");
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM goal_feedback_submission",
                Long.class)).isEqualTo(2);
        assertThat(jdbc.queryForObject(
                "SELECT pending_rows FROM goal_feedback_inbox_capacity WHERE id = 1",
                Long.class)).isEqualTo(2);
        assertThat(jdbc.queryForObject(
                "SELECT pending_bytes FROM goal_feedback_inbox_capacity WHERE id = 1",
                Long.class)).isEqualTo(36);

        GoalFeedbackRetentionService.CleanupResult repeated =
                service.purgeExpiredUnacknowledgedContent();
        assertThat(repeated.removedRows()).isZero();
        assertThat(repeated.removedBytes()).isZero();
        assertThat(repeated.expiredBatches()).isZero();
    }

    @Test
    void failsClosedBeforeDeletionWhenCapacityReceiptIsInconsistent() {
        UUID batch = insertBatch(NOW.minus(Duration.ofDays(31)), "OPEN", 1, "must-survive-rollback");
        insertSubmission(NOW.minus(Duration.ofDays(31)), 17, batch);
        insertCapacity(0, 0);

        assertThatThrownBy(() -> service(Duration.ofDays(30))
                        .purgeExpiredUnacknowledgedContent())
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Goal-feedback capacity receipt is inconsistent");
        assertThat(jdbc.queryForObject(
                "SELECT status FROM goal_feedback_export_batch WHERE id = ?",
                String.class,
                batch)).isEqualTo("OPEN");
        assertThat(jdbc.queryForObject(
                "SELECT payload_json FROM goal_feedback_export_batch WHERE id = ?",
                String.class,
                batch)).isEqualTo("must-survive-rollback");
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM goal_feedback_submission",
                Long.class)).isOne();
    }

    @Test
    void limitsUnboundCleanupWorkPerTransaction() {
        insertSubmission(NOW.minus(Duration.ofDays(31)), 3, null);
        insertSubmission(NOW.minus(Duration.ofDays(31)), 5, null);
        insertSubmission(NOW.minus(Duration.ofDays(31)), 7, null);
        insertCapacity(3, 15);
        GoalFeedbackRetentionService service = new GoalFeedbackRetentionService(
                jdbc,
                Clock.fixed(NOW, ZoneOffset.UTC),
                Duration.ofDays(30),
                2);

        GoalFeedbackRetentionService.CleanupResult first =
                service.purgeExpiredUnacknowledgedContent();
        assertThat(first.removedRows()).isEqualTo(2);
        assertThat(jdbc.queryForObject(
                "SELECT pending_rows FROM goal_feedback_inbox_capacity WHERE id = 1",
                Long.class)).isOne();

        GoalFeedbackRetentionService.CleanupResult second =
                service.purgeExpiredUnacknowledgedContent();
        assertThat(second.removedRows()).isOne();
        assertThat(jdbc.queryForObject(
                "SELECT pending_rows FROM goal_feedback_inbox_capacity WHERE id = 1",
                Long.class)).isZero();
    }

    @Test
    void acceptsOnlyThePublishedThirtyDayRetention() {
        assertThat(service(Duration.ofDays(30)).maxRetention()).isEqualTo(Duration.ofDays(30));
        assertThatThrownBy(() -> service(Duration.ofDays(1)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("published P30D policy");
        assertThatThrownBy(() -> service(Duration.ofDays(90)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("published P30D policy");
        assertThatThrownBy(() -> service(null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("published P30D policy");
    }

    @Test
    void rejectsCleanupBatchSizesOutsideTheBoundedRange() {
        assertThatThrownBy(() -> new GoalFeedbackRetentionService(
                        jdbc,
                        Clock.fixed(NOW, ZoneOffset.UTC),
                        Duration.ofDays(30),
                        0))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("batch size must be between 1 and 1000");
        assertThatThrownBy(() -> new GoalFeedbackRetentionService(
                        jdbc,
                        Clock.fixed(NOW, ZoneOffset.UTC),
                        Duration.ofDays(30),
                        1_001))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("batch size must be between 1 and 1000");
    }

    private GoalFeedbackRetentionService service(Duration retention) {
        return new GoalFeedbackRetentionService(
                jdbc,
                Clock.fixed(NOW, ZoneOffset.UTC),
                retention,
                500);
    }

    private UUID insertBatch(Instant createdAt, String status, int recordCount, String payload) {
        UUID id = UUID.randomUUID();
        jdbc.update("""
                INSERT INTO goal_feedback_export_batch
                    (id, created_at, status, payload_digest, record_count, payload_json)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                id,
                Timestamp.from(createdAt),
                status,
                "sha256:" + "a".repeat(64),
                recordCount,
                payload);
        return id;
    }

    private void insertSubmission(Instant receivedAt, long storedBytes, UUID exportBatchId) {
        jdbc.update("""
                INSERT INTO goal_feedback_submission
                    (id, received_at, stored_bytes, export_batch_id)
                VALUES (?, ?, ?, ?)
                """,
                UUID.randomUUID(),
                Timestamp.from(receivedAt),
                storedBytes,
                exportBatchId);
    }

    private void insertCapacity(long rows, long bytes) {
        jdbc.update("""
                INSERT INTO goal_feedback_inbox_capacity
                    (id, pending_rows, pending_bytes, updated_at)
                VALUES (1, ?, ?, ?)
                """,
                rows,
                bytes,
                Timestamp.from(NOW.minus(Duration.ofDays(1))));
    }
}
