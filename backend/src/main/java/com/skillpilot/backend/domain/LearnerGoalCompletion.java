package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** One observed threshold crossing per goal and Berlin day, never a mastery snapshot. */
@Entity
@Table(name = "learner_goal_completion", uniqueConstraints = @UniqueConstraint(
        name = "uq_learner_goal_completion_day", columnNames = {"learner_id", "goal_id", "completion_date"}))
public class LearnerGoalCompletion {

    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learner_id", nullable = false, updatable = false)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private Learner learner;

    @Column(name = "goal_id", nullable = false, updatable = false, length = 255)
    private String goalId;

    @Column(name = "completion_date", nullable = false, updatable = false)
    private LocalDate completionDate;

    @Column(name = "occurred_at", nullable = false, updatable = false)
    private Instant occurredAt;

    @Column(name = "mastery_value", nullable = false, updatable = false)
    private double masteryValue;

    protected LearnerGoalCompletion() {
    }

    public LearnerGoalCompletion(
            Learner learner, String goalId, LocalDate completionDate, Instant occurredAt, double masteryValue) {
        this.id = UUID.randomUUID();
        this.learner = learner;
        this.goalId = goalId;
        this.completionDate = completionDate;
        this.occurredAt = occurredAt;
        this.masteryValue = masteryValue;
    }

    public UUID getId() { return id; }
    public Learner getLearner() { return learner; }
    public String getGoalId() { return goalId; }
    public LocalDate getCompletionDate() { return completionDate; }
    public Instant getOccurredAt() { return occurredAt; }
    public double getMasteryValue() { return masteryValue; }
}
