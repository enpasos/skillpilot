package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Durable receipt for one bounded export of public learning-goal feedback.
 *
 * <p>Deleting an export scrubs {@code payloadJson}, but preserves its digest,
 * record count and timestamps for audit and exact retry detection.</p>
 */
@Entity
@Table(name = "goal_feedback_export_batch")
public class GoalFeedbackExportBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private GoalFeedbackExportBatchStatus status = GoalFeedbackExportBatchStatus.OPEN;

    @Column(name = "payload_digest", nullable = false, updatable = false, length = 71)
    private String payloadDigest;

    @Column(name = "record_count", nullable = false, updatable = false)
    private int recordCount;

    @Column(name = "payload_json", columnDefinition = "TEXT")
    private String payloadJson;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public GoalFeedbackExportBatchStatus getStatus() {
        return status;
    }

    public void setStatus(GoalFeedbackExportBatchStatus status) {
        this.status = status;
    }

    public String getPayloadDigest() {
        return payloadDigest;
    }

    public void setPayloadDigest(String payloadDigest) {
        this.payloadDigest = payloadDigest;
    }

    public int getRecordCount() {
        return recordCount;
    }

    public void setRecordCount(int recordCount) {
        this.recordCount = recordCount;
    }

    public String getPayloadJson() {
        return payloadJson;
    }

    public void setPayloadJson(String payloadJson) {
        this.payloadJson = payloadJson;
    }

    public Instant getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(Instant deletedAt) {
        this.deletedAt = deletedAt;
    }
}
