package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Absolute, server-side learning session created by one explicit SkillPilot
 * "Start learning" action.
 *
 * <p>Only an HMAC of the opaque value carried by the ChatGPT start prompt is
 * persisted. OAuth authenticates the predefined ChatGPT app independently;
 * this entity selects the learner for one concrete, at most 24-hour learning
 * session.</p>
 */
@Entity
@Table(name = "openai_de_learning_session")
public class OpenAiDeLearningSession {

    @Id
    @Column(name = "token_hash", nullable = false, updatable = false, length = 128)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", nullable = false)
    private Learner learner;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "contract_major", nullable = false)
    private int contractMajor;

    @Column(name = "state_version", nullable = false)
    // Diagnostic snapshot only. Optimistic concurrency is based on the
    // learner-scoped coach_state_revision, never on this session row.
    private long stateVersion;

    @Column(name = "state_schema_version", nullable = false)
    private int stateSchemaVersion;

    @Column(name = "workflow_version", nullable = false, length = 80)
    private String workflowVersion;

    @Column(name = "curriculum_revision", nullable = false, length = 160)
    private String curriculumRevision;

    /** Authoritative BCP-47 communication locale for this short-lived session. */
    @Column(name = "communication_locale", nullable = false, length = 35)
    private String communicationLocale;

    /**
     * Hash of the successor session after an explicit cross-major migration.
     *
     * <p>The opaque learning-session handle is never persisted. Keeping only
     * the successor token hash preserves the existing privacy boundary while
     * allowing a future V2 migration service to resolve the mapping
     * server-side.</p>
     */
    @Column(name = "migrated_to_token_hash", length = 128)
    private String migratedToTokenHash;

    public String getTokenHash() {
        return tokenHash;
    }

    public void setTokenHash(String tokenHash) {
        this.tokenHash = tokenHash;
    }

    public Learner getLearner() {
        return learner;
    }

    public void setLearner(Learner learner) {
        this.learner = learner;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public int getContractMajor() {
        return contractMajor;
    }

    public void setContractMajor(int contractMajor) {
        this.contractMajor = contractMajor;
    }

    public long getStateVersion() {
        return stateVersion;
    }

    public void setStateVersion(long stateVersion) {
        this.stateVersion = stateVersion;
    }

    public int getStateSchemaVersion() {
        return stateSchemaVersion;
    }

    public void setStateSchemaVersion(int stateSchemaVersion) {
        this.stateSchemaVersion = stateSchemaVersion;
    }

    public String getWorkflowVersion() {
        return workflowVersion;
    }

    public void setWorkflowVersion(String workflowVersion) {
        this.workflowVersion = workflowVersion;
    }

    public String getCurriculumRevision() {
        return curriculumRevision;
    }

    public void setCurriculumRevision(String curriculumRevision) {
        this.curriculumRevision = curriculumRevision;
    }

    public String getCommunicationLocale() {
        return communicationLocale;
    }

    public void setCommunicationLocale(String communicationLocale) {
        this.communicationLocale = communicationLocale;
    }

    public String getMigratedToTokenHash() {
        return migratedToTokenHash;
    }

    public void setMigratedToTokenHash(String migratedToTokenHash) {
        this.migratedToTokenHash = migratedToTokenHash;
    }
}
