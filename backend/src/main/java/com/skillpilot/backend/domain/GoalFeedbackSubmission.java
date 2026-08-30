package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;

/**
 * Version-bound public feedback intake record.
 *
 * <p>The row exists only while feedback is pending or an OPEN export can still
 * be redownloaded. A digest-confirmed export acknowledgement or maximum-age
 * expiry deletes the whole submission row; only a content-free export-batch
 * receipt or expiry tombstone remains for a bound submission.</p>
 */
@Entity
@Table(
        name = "goal_feedback_submission",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_goal_feedback_submission_client_id",
                columnNames = "client_submission_id"))
public class GoalFeedbackSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "client_submission_id", nullable = false, updatable = false, unique = true)
    private UUID clientSubmissionId;

    @CreationTimestamp
    @Column(name = "received_at", nullable = false, updatable = false)
    private Instant receivedAt;

    @Column(name = "envelope_digest", nullable = false, updatable = false, length = 71)
    private String envelopeDigest;

    @Column(name = "exact_duplicate_key", length = 71)
    private String exactDuplicateKey;

    @Column(name = "envelope_json", columnDefinition = "TEXT")
    private String envelopeJson;

    @Column(name = "trusted_context_json", columnDefinition = "TEXT")
    private String trustedContextJson;

    @Column(name = "stored_bytes", nullable = false, updatable = false)
    private long storedBytes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "export_batch_id")
    private GoalFeedbackExportBatch exportBatch;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getClientSubmissionId() {
        return clientSubmissionId;
    }

    public void setClientSubmissionId(UUID clientSubmissionId) {
        this.clientSubmissionId = clientSubmissionId;
    }

    public Instant getReceivedAt() {
        return receivedAt;
    }

    public void setReceivedAt(Instant receivedAt) {
        this.receivedAt = receivedAt;
    }

    public String getEnvelopeDigest() {
        return envelopeDigest;
    }

    public void setEnvelopeDigest(String envelopeDigest) {
        this.envelopeDigest = envelopeDigest;
    }

    public String getExactDuplicateKey() {
        return exactDuplicateKey;
    }

    public void setExactDuplicateKey(String exactDuplicateKey) {
        this.exactDuplicateKey = exactDuplicateKey;
    }

    public String getEnvelopeJson() {
        return envelopeJson;
    }

    public void setEnvelopeJson(String envelopeJson) {
        this.envelopeJson = envelopeJson;
    }

    public String getTrustedContextJson() {
        return trustedContextJson;
    }

    public void setTrustedContextJson(String trustedContextJson) {
        this.trustedContextJson = trustedContextJson;
    }

    public long getStoredBytes() {
        return storedBytes;
    }

    public void setStoredBytes(long storedBytes) {
        this.storedBytes = storedBytes;
    }

    public GoalFeedbackExportBatch getExportBatch() {
        return exportBatch;
    }

    public void setExportBatch(GoalFeedbackExportBatch exportBatch) {
        this.exportBatch = exportBatch;
    }

    public UUID getExportBatchId() {
        return exportBatch == null ? null : exportBatch.getId();
    }
}
