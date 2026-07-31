package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

/**
 * Audit record reserved for an explicit, server-side migration between
 * OpenAI contract majors.
 *
 * <p>V1 does not execute a V2 migration yet. This canonical record makes the
 * future operation idempotent and auditable without exposing or persisting
 * opaque learning-session handles.</p>
 */
@Entity
@Table(
        name = "openai_de_session_migration",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_openai_de_session_migration_source_target_major",
                columnNames = {"source_token_hash", "target_contract_major"}))
public class OpenAiDeSessionMigration {

    @Id
    @Column(name = "migration_id", nullable = false, updatable = false, length = 80)
    private String migrationId;

    @Column(name = "source_token_hash", nullable = false, updatable = false, length = 128)
    private String sourceTokenHash;

    @Column(name = "target_token_hash", length = 128)
    private String targetTokenHash;

    @Column(name = "source_contract_major", nullable = false, updatable = false)
    private int sourceContractMajor;

    @Column(name = "target_contract_major", nullable = false, updatable = false)
    private int targetContractMajor;

    @Column(name = "status", nullable = false, length = 32)
    private String status;

    @Column(name = "source_snapshot_json", nullable = false, updatable = false, columnDefinition = "TEXT")
    private String sourceSnapshotJson;

    @Column(name = "warnings_json", nullable = false, columnDefinition = "TEXT")
    private String warningsJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    public String getMigrationId() {
        return migrationId;
    }

    public void setMigrationId(String migrationId) {
        this.migrationId = migrationId;
    }

    public String getSourceTokenHash() {
        return sourceTokenHash;
    }

    public void setSourceTokenHash(String sourceTokenHash) {
        this.sourceTokenHash = sourceTokenHash;
    }

    public String getTargetTokenHash() {
        return targetTokenHash;
    }

    public void setTargetTokenHash(String targetTokenHash) {
        this.targetTokenHash = targetTokenHash;
    }

    public int getSourceContractMajor() {
        return sourceContractMajor;
    }

    public void setSourceContractMajor(int sourceContractMajor) {
        this.sourceContractMajor = sourceContractMajor;
    }

    public int getTargetContractMajor() {
        return targetContractMajor;
    }

    public void setTargetContractMajor(int targetContractMajor) {
        this.targetContractMajor = targetContractMajor;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSourceSnapshotJson() {
        return sourceSnapshotJson;
    }

    public void setSourceSnapshotJson(String sourceSnapshotJson) {
        this.sourceSnapshotJson = sourceSnapshotJson;
    }

    public String getWarningsJson() {
        return warningsJson;
    }

    public void setWarningsJson(String warningsJson) {
        this.warningsJson = warningsJson;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }
}
