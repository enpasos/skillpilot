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
@Table(name = "openai_de_pending_launch")
public class OpenAiDePendingLaunch {

    @Id
    @Column(name = "id", nullable = false, updatable = false, length = 48)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_skillpilot_id", nullable = false)
    private Learner learner;

    @Column(name = "connection_subject", nullable = false, updatable = false, length = 96)
    private String connectionSubject;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "selected_curriculum")
    private String selectedCurriculum;

    @Column(name = "client", length = 64)
    private String client;

    @Column(name = "launch_intent_type", length = 32)
    private String launchIntentType;

    @Column(name = "launch_goal_id", length = 255)
    private String launchGoalId;

    @Column(name = "launch_batch_size")
    private Integer launchBatchSize;

    @Column(name = "launch_course_level", length = 8)
    private String launchCourseLevel;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Learner getLearner() { return learner; }
    public void setLearner(Learner learner) { this.learner = learner; }
    public String getConnectionSubject() { return connectionSubject; }
    public void setConnectionSubject(String connectionSubject) { this.connectionSubject = connectionSubject; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
    public Instant getConsumedAt() { return consumedAt; }
    public void setConsumedAt(Instant consumedAt) { this.consumedAt = consumedAt; }
    public String getSelectedCurriculum() { return selectedCurriculum; }
    public void setSelectedCurriculum(String selectedCurriculum) { this.selectedCurriculum = selectedCurriculum; }
    public String getClient() { return client; }
    public void setClient(String client) { this.client = client; }
    public String getLaunchIntentType() { return launchIntentType; }
    public void setLaunchIntentType(String launchIntentType) { this.launchIntentType = launchIntentType; }
    public String getLaunchGoalId() { return launchGoalId; }
    public void setLaunchGoalId(String launchGoalId) { this.launchGoalId = launchGoalId; }
    public Integer getLaunchBatchSize() { return launchBatchSize; }
    public void setLaunchBatchSize(Integer launchBatchSize) { this.launchBatchSize = launchBatchSize; }
    public String getLaunchCourseLevel() { return launchCourseLevel; }
    public void setLaunchCourseLevel(String launchCourseLevel) { this.launchCourseLevel = launchCourseLevel; }
}
