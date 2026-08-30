package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.GoalFeedbackExportBatch;
import java.time.Instant;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.util.List;
import com.skillpilot.backend.domain.GoalFeedbackExportBatchStatus;

public interface GoalFeedbackExportBatchRepository
        extends JpaRepository<GoalFeedbackExportBatch, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select batch from GoalFeedbackExportBatch batch where batch.id = :exportBatchId")
    java.util.Optional<GoalFeedbackExportBatch> findByIdForUpdate(
            @Param("exportBatchId") UUID exportBatchId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select batch from GoalFeedbackExportBatch batch
            where batch.status = :status
            order by batch.createdAt asc, batch.id asc
            """)
    List<GoalFeedbackExportBatch> findOldestByStatusForUpdate(
            @Param("status") GoalFeedbackExportBatchStatus status,
            Pageable pageable);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = """
            update goal_feedback_export_batch
            set status = 'DELETED',
                payload_json = null,
                deleted_at = :deletedAt
            where id = :exportBatchId
              and status = 'OPEN'
            """, nativeQuery = true)
    int markDeletedAndClearPayload(
            @Param("exportBatchId") UUID exportBatchId,
            @Param("deletedAt") Instant deletedAt);
}
