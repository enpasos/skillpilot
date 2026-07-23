package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "openai_de_binding_grant")
public class OpenAiDeBindingGrant {

    @Id
    @Column(name = "token_hash", nullable = false, updatable = false, length = 128)
    private String tokenHash;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_skillpilot_id", nullable = false)
    private Learner learner;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "browser_session_hash", nullable = false, updatable = false, length = 128)
    private String browserSessionHash;

    /**
     * Mirrors {@link #browserSessionHash} only while the grant is open. A
     * nullable unique database constraint on this column is the race-safe
     * exactly-one-open-grant guard for a browser session.
     */
    @Column(name = "active_browser_session_hash", length = 128)
    private String activeBrowserSessionHash;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "connection_subject", length = 96)
    private String connectionSubject;

    @Column(name = "client", length = 64)
    private String client;

    @Column(name = "selected_curriculum", length = 255)
    private String selectedCurriculum;

    @Column(name = "launch_intent_type", length = 32)
    private String launchIntentType;

    @Column(name = "launch_goal_id", length = 255)
    private String launchGoalId;

    @Column(name = "launch_batch_size")
    private Integer launchBatchSize;

    @Column(name = "launch_course_level", length = 8)
    private String launchCourseLevel;

    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }
    public Learner getLearner() { return learner; }
    public void setLearner(Learner learner) { this.learner = learner; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public String getBrowserSessionHash() { return browserSessionHash; }
    public void setBrowserSessionHash(String browserSessionHash) { this.browserSessionHash = browserSessionHash; }
    public String getActiveBrowserSessionHash() { return activeBrowserSessionHash; }
    public void setActiveBrowserSessionHash(String activeBrowserSessionHash) {
        this.activeBrowserSessionHash = activeBrowserSessionHash;
    }
    public Instant getConsumedAt() { return consumedAt; }
    public void setConsumedAt(Instant consumedAt) { this.consumedAt = consumedAt; }
    public String getConnectionSubject() { return connectionSubject; }
    public void setConnectionSubject(String connectionSubject) { this.connectionSubject = connectionSubject; }
    public String getClient() { return client; }
    public void setClient(String client) { this.client = client; }
    public String getSelectedCurriculum() { return selectedCurriculum; }
    public void setSelectedCurriculum(String selectedCurriculum) { this.selectedCurriculum = selectedCurriculum; }
    public String getLaunchIntentType() { return launchIntentType; }
    public void setLaunchIntentType(String launchIntentType) { this.launchIntentType = launchIntentType; }
    public String getLaunchGoalId() { return launchGoalId; }
    public void setLaunchGoalId(String launchGoalId) { this.launchGoalId = launchGoalId; }
    public Integer getLaunchBatchSize() { return launchBatchSize; }
    public void setLaunchBatchSize(Integer launchBatchSize) { this.launchBatchSize = launchBatchSize; }
    public String getLaunchCourseLevel() { return launchCourseLevel; }
    public void setLaunchCourseLevel(String launchCourseLevel) { this.launchCourseLevel = launchCourseLevel; }
}
