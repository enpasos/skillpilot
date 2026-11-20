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
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

/** The first verified passing score for one learner, exam and material revision. */
@Entity
@Table(name = "verified_exam_pass", uniqueConstraints = @UniqueConstraint(
        name = "uq_verified_exam_pass_material", columnNames = {"learner_id", "goal_id", "material_fingerprint"}))
public class VerifiedExamPass {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learner_id", nullable = false, updatable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Learner learner;

    @Column(name = "goal_id", nullable = false, updatable = false, length = 255)
    private String goalId;

    @Column(name = "task_revision", nullable = false, updatable = false, length = 71)
    private String taskRevision;

    @Column(name = "rubric_revision", nullable = false, updatable = false, length = 71)
    private String rubricRevision;

    @Column(name = "material_fingerprint", nullable = false, updatable = false, length = 71)
    private String fingerprint;

    @Column(name = "earned_points", nullable = false)
    private double earnedPoints;

    @Column(name = "max_points", nullable = false, updatable = false)
    private double maxPoints;

    @Column(name = "passing_points", nullable = false, updatable = false)
    private double passingPoints;

    @Column(name = "passed_at", nullable = false)
    private Instant passedAt;

    protected VerifiedExamPass() {}

    public VerifiedExamPass(Learner learner, String goalId, String taskRevision, String rubricRevision,
            String fingerprint, double earnedPoints, double maxPoints, double passingPoints, Instant passedAt) {
        this.learner = learner;
        this.goalId = goalId;
        this.taskRevision = taskRevision;
        this.rubricRevision = rubricRevision;
        this.fingerprint = fingerprint;
        this.earnedPoints = earnedPoints;
        this.maxPoints = maxPoints;
        this.passingPoints = passingPoints;
        this.passedAt = passedAt;
    }

    /** A restored database may already hold a later attempt for the same material. */
    public void retainEarliestPass(Instant earlier, double score) {
        if (earlier.isBefore(passedAt)) {
            passedAt = earlier;
            earnedPoints = score;
        }
    }

    public String getGoalId() { return goalId; }
    public String getTaskRevision() { return taskRevision; }
    public String getRubricRevision() { return rubricRevision; }
    public String getFingerprint() { return fingerprint; }
    public double getEarnedPoints() { return earnedPoints; }
    public double getMaxPoints() { return maxPoints; }
    public double getPassingPoints() { return passingPoints; }
    public Instant getPassedAt() { return passedAt; }
}
