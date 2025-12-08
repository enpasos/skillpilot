package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "mastery")
public class Mastery {

    @EmbeddedId
    private MasteryId id;

    @MapsId("skillpilotId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skillpilot_id", nullable = false)
    private Learner learner;

    @Column(name = "value", nullable = false)
    private double value;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Mastery() {}

    public Mastery(Learner learner, String goalKey, double value) {
        this.learner = learner;
        this.id = new MasteryId(learner.getSkillpilotId(), goalKey);
        this.value = value;
    }

    public MasteryId getId() {
        return id;
    }

    public Learner getLearner() {
        return learner;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public String getGoalKey() {
        return id != null ? id.getGoalKey() : null;
    }

    public void setLearner(Learner learner) {
        this.learner = learner;
        if (this.id != null) {
            this.id = new MasteryId(learner.getSkillpilotId(), id.getGoalKey());
        }
    }

    public void setId(MasteryId id) {
        this.id = id;
    }

    @PrePersist
    @PreUpdate
    void touch() {
        this.updatedAt = Instant.now();
    }
}
