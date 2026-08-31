package com.skillpilot.backend.teachersupervision;

import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;

/** Removes terminal supervision metadata after the published bounded retention period. */
@Service
@ConditionalOnTeacherSupervisionEnabled
public class TeacherSupervisionRetentionCleanupJob {

    private static final Duration MAX_TERMINAL_RETENTION = Duration.ofDays(30);

    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;
    private final Duration terminalRetention;
    private final int batchSize;

    public TeacherSupervisionRetentionCleanupJob(
            JdbcTemplate jdbc,
            TransactionTemplate transactions,
            @Value("${skillpilot.teacher-supervision.retention.terminal:P30D}") Duration terminalRetention,
            @Value("${skillpilot.teacher-supervision.retention.batch-size:250}") int batchSize) {
        this.jdbc = jdbc;
        this.transactions = transactions;
        this.terminalRetention = boundedTerminalRetention(terminalRetention);
        this.batchSize = Math.max(1, batchSize);
    }

    @Scheduled(
            fixedDelayString = "${skillpilot.teacher-supervision.retention.cleanup-interval-ms:86400000}",
            initialDelayString = "${skillpilot.teacher-supervision.retention.initial-delay-ms:60000}")
    public void cleanupTerminalRecords() {
        CleanupBatch batch;
        do {
            batch = transactions.execute(status -> cleanupBatch(Instant.now().minus(terminalRetention)));
        } while (batch != null && batch.hasFullPage(batchSize));
    }

    private CleanupBatch cleanupBatch(Instant cutoff) {
        Timestamp cutoffTimestamp = Timestamp.from(cutoff);
        int memberships = jdbc.update("""
                DELETE FROM teacher_membership
                WHERE member_id IN (
                    SELECT member_id
                    FROM teacher_membership
                    WHERE (status = 'REVOKED' AND revoked_at < ?)
                       OR (status = 'PENDING' AND expires_at < ?)
                    ORDER BY COALESCE(revoked_at, expires_at), member_id
                    LIMIT ?
                )
                """, cutoffTimestamp, cutoffTimestamp, batchSize);
        int courses = jdbc.update("""
                DELETE FROM teacher_course
                WHERE id IN (
                    SELECT course.id
                    FROM teacher_course course
                    WHERE NOT EXISTS (
                        SELECT 1 FROM teacher_membership membership
                        WHERE membership.course_id = course.id
                    )
                      AND COALESCE(course.closed_at, course.created_at) < ?
                    ORDER BY COALESCE(course.closed_at, course.created_at), course.id
                    LIMIT ?
                )
                """, cutoffTimestamp, batchSize);
        int workspaces = jdbc.update("""
                DELETE FROM teacher_workspace
                WHERE id IN (
                    SELECT workspace.id
                    FROM teacher_workspace workspace
                    WHERE NOT EXISTS (
                        SELECT 1 FROM teacher_course course
                        WHERE course.workspace_id = workspace.id
                    )
                      AND COALESCE(workspace.revoked_at, workspace.created_at) < ?
                    ORDER BY COALESCE(workspace.revoked_at, workspace.created_at), workspace.id
                    LIMIT ?
                )
                """, cutoffTimestamp, batchSize);
        return new CleanupBatch(memberships, courses, workspaces);
    }

    private record CleanupBatch(int memberships, int courses, int workspaces) {
        boolean hasFullPage(int pageSize) {
            return memberships == pageSize || courses == pageSize || workspaces == pageSize;
        }
    }

    static Duration boundedTerminalRetention(Duration requested) {
        if (requested == null || requested.isNegative()) {
            return MAX_TERMINAL_RETENTION;
        }
        return requested.compareTo(MAX_TERMINAL_RETENTION) > 0
                ? MAX_TERMINAL_RETENTION
                : requested;
    }
}
