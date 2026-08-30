package com.skillpilot.backend.repository;

import com.skillpilot.backend.domain.GoalFeedbackSubmission;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GoalFeedbackSubmissionRepository
        extends JpaRepository<GoalFeedbackSubmission, UUID> {

    Optional<GoalFeedbackSubmission> findByClientSubmissionId(UUID clientSubmissionId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select submission
            from GoalFeedbackSubmission submission
            where submission.exportBatch is null
            order by submission.receivedAt asc, submission.id asc
            """)
    List<GoalFeedbackSubmission> findOldestUnboundForUpdate(Pageable pageable);

    @Query("""
            select coalesce(sum(submission.storedBytes), 0)
            from GoalFeedbackSubmission submission
            where submission.exportBatch.id = :exportBatchId
            """)
    long sumStoredBytesByExportBatchId(@Param("exportBatchId") UUID exportBatchId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from GoalFeedbackSubmission submission where submission.exportBatch.id = :exportBatchId")
    int deleteByExportBatchId(@Param("exportBatchId") UUID exportBatchId);
}
