package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "planned_goal")
public class PlannedGoal {

    @EmbeddedId
    private PlannedGoalId id;

    @MapsId("skillpilotId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skillpilot_id", nullable = false)
    private Learner learner;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public PlannedGoal() {}

    public PlannedGoal(Learner learner, String goalId) {
        this.learner = learner;
        this.id = new PlannedGoalId(learner.getSkillpilotId(), goalId);
    }

    public PlannedGoalId getId() {
        return id;
    }

    public Learner getLearner() {
        return learner;
    }

    public String getGoalId() {
        return id != null ? id.getGoalId() : null;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
