package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
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

    @Id
    @Column(name = "skillpilot_id", nullable = false, updatable = false, length = 80)
    private String skillpilotId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "selected_curriculum")
    private String selectedCurriculum;

    @Column(name = "personal_curriculum", columnDefinition = "TEXT")
    private String personalCurriculum;

    @Column(name = "active_goal_id")
    private String activeGoalId;

    @Enumerated(EnumType.STRING)
    @Column(name = "learning_state")
    private LearningState learningState = LearningState.FRONTIER;

    @jakarta.persistence.ElementCollection(fetch = jakarta.persistence.FetchType.EAGER)
    @jakarta.persistence.CollectionTable(name = "learner_copy_sources", joinColumns = @jakarta.persistence.JoinColumn(name = "learner_id"))
    private java.util.Set<CopySource> copySources = new java.util.HashSet<>();

    public String getSkillpilotId() {
        return skillpilotId;
    }

    public Instant getCreatedAt() {
        return createdAt;
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

    // Needed for JPA toolchain to set generated ID
    public void setSkillpilotId(String skillpilotId) {
        this.skillpilotId = skillpilotId;
    }

    @PrePersist
    void ensureId() {
        if (this.skillpilotId == null || this.skillpilotId.isBlank()) {
            this.skillpilotId = UUID.randomUUID().toString();
        }
        if (this.learningState == null) {
            this.learningState = LearningState.FRONTIER;
        }
    }
}
