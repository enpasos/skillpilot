package com.skillpilot.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Enumerated;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@Table(name = "learner")
@DynamicUpdate
public class Learner {

    private static final String DEFAULT_LEARNING_STRATEGY = "SEQUENTIAL";
    private static final boolean DEFAULT_AUTO_PILOT = true;

    @Id
    @Column(name = "skillpilot_id", nullable = false, updatable = false, length = 80)
    private String skillpilotId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    /** Server-authoritative retention timestamp; never restored from backups. */
    @JsonIgnore
    @Column(name = "last_activity_at", nullable = false)
    private Instant lastActivityAt;

    @Column(name = "selected_curriculum")
    private String selectedCurriculum;

    @Column(name = "personal_curriculum", columnDefinition = "TEXT")
    private String personalCurriculum;

    @Column(name = "client_state", columnDefinition = "TEXT")
    private String clientState;

    @Column(name = "client_state_updated_at")
    private Instant clientStateUpdatedAt;

    @Column(name = "active_goal_id")
    private String activeGoalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "learning_state")
    private LearningState learningState = LearningState.FRONTIER;

    @Column(name = "learning_strategy", nullable = false)
    private String learningStrategy = DEFAULT_LEARNING_STRATEGY;

    @Column(name = "auto_pilot", nullable = false)
    private Boolean autoPilot = DEFAULT_AUTO_PILOT;

    @Column(name = "strict_mode")
    private Boolean strictMode = false;

    @Column(name = "show_goal_visualizations_in_chat", nullable = false)
    private Boolean showGoalVisualizationsInChat = true;

    /**
     * Monotone revision of the learner state shared by the cockpit and all
     * coach transports. This is deliberately learner-scoped rather than
     * learning-session-scoped so stale writes are detected across browser and
     * MCP sessions.
     */
    @Column(name = "coach_state_revision", nullable = false)
    private long coachStateRevision;

    @jakarta.persistence.ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    @jakarta.persistence.CollectionTable(name = "learner_copy_sources", joinColumns = @jakarta.persistence.JoinColumn(name = "learner_id"))
    private java.util.Set<CopySource> copySources = new java.util.HashSet<>();

    public String getSkillpilotId() {
        return skillpilotId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getLastActivityAt() {
        return lastActivityAt;
    }

    public void setLastActivityAt(Instant lastActivityAt) {
        this.lastActivityAt = lastActivityAt;
    }

    public String getSelectedCurriculum() {
        return selectedCurriculum;
    }

    public void setSelectedCurriculum(String selectedCurriculum) {
        this.selectedCurriculum = selectedCurriculum;
    }

    public String getPersonalCurriculum() {
        return personalCurriculum;
    }

    public void setPersonalCurriculum(String personalCurriculum) {
        this.personalCurriculum = personalCurriculum;
    }

    public String getClientState() {
        return clientState;
    }

    public void setClientState(String clientState) {
        this.clientState = clientState;
    }

    public Instant getClientStateUpdatedAt() {
        return clientStateUpdatedAt;
    }

    public void setClientStateUpdatedAt(Instant clientStateUpdatedAt) {
        this.clientStateUpdatedAt = clientStateUpdatedAt;
    }

    public java.util.Set<CopySource> getCopySources() {
        return copySources;
    }

    public void setCopySources(java.util.Set<CopySource> copySources) {
        this.copySources = copySources;
    }

    public String getActiveGoalId() {
        return activeGoalId;
    }

    public void setActiveGoalId(String activeGoalId) {
        this.activeGoalId = activeGoalId;
    }

    public LearningState getLearningState() {
        return learningState;
    }

    public void setLearningState(LearningState learningState) {
        this.learningState = learningState;
    }

    public String getLearningStrategy() {
        return learningStrategy != null ? learningStrategy : DEFAULT_LEARNING_STRATEGY;
    }

    public void setLearningStrategy(String learningStrategy) {
        this.learningStrategy = learningStrategy;
    }

    public Boolean getAutoPilot() {
        return autoPilot != null ? autoPilot : DEFAULT_AUTO_PILOT;
    }

    public void setAutoPilot(Boolean autoPilot) {
        this.autoPilot = autoPilot;
    }

    public Boolean getStrictMode() {
        return strictMode;
    }

    public void setStrictMode(Boolean strictMode) {
        this.strictMode = strictMode;
    }

    public Boolean getShowGoalVisualizationsInChat() {
        return showGoalVisualizationsInChat;
    }

    public void setShowGoalVisualizationsInChat(Boolean showGoalVisualizationsInChat) {
        this.showGoalVisualizationsInChat = showGoalVisualizationsInChat;
    }

    public long getCoachStateRevision() {
        return coachStateRevision;
    }

    public void setCoachStateRevision(long coachStateRevision) {
        this.coachStateRevision = coachStateRevision;
    }

    // Needed for JPA toolchain to set generated ID
    public void setSkillpilotId(String skillpilotId) {
        this.skillpilotId = skillpilotId;
    }

    @PrePersist
    @PreUpdate
    void ensureId() {
        if (this.skillpilotId == null || this.skillpilotId.isBlank()) {
            this.skillpilotId = UUID.randomUUID().toString();
        }
        if (this.lastActivityAt == null) {
            this.lastActivityAt = Instant.now();
        }
        if (this.learningState == null) {
            this.learningState = LearningState.FRONTIER;
        }
        if (this.learningStrategy == null) {
            this.learningStrategy = DEFAULT_LEARNING_STRATEGY;
        }
        if (this.autoPilot == null) {
            this.autoPilot = DEFAULT_AUTO_PILOT;
        }
        if (this.strictMode == null) {
            this.strictMode = false;
        }
        if (this.showGoalVisualizationsInChat == null) {
            this.showGoalVisualizationsInChat = true;
        }
    }
}
