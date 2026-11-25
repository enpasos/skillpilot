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
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/** A time plan owned exclusively by the learner identified by its SkillPilot ID. */
@Entity
@Table(
        name = "learner_learning_plan",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_learner_learning_plan_landscape",
                columnNames = {"learner_id", "landscape_id"}))
public class LearnerLearningPlan {
    /**
     * Stored instead of a curriculum id for a plan that a backup held but that cannot be read
     * against the learner's curriculum at restore time: a section or exam topic no longer resolves,
     * it names a goal the learner's scope does not know, nothing of it is left, or the catalog no
     * longer has its landscape. The backup does not carry the curriculum the plan was captured for.
     * Every reader of plans compares the captured curriculum with the learner's selected one, so
     * such a plan is outdated for all of them and behaves like every outdated plan: no next step,
     * obligation, credit or continuation. It becomes an ordinary plan when the learner saves it anew.
     */
    public static final String RESTORED_OUTDATED_CURRICULUM_ID = "restored-outdated-plan";

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", nullable = false, updatable = false)
    private Learner learner;

    @Column(name = "landscape_id", nullable = false, updatable = false, length = 255)
    private String landscapeId;

    @Column(name = "curriculum_id", nullable = false, length = 255)
    private String curriculumId;

    @Column(name = "scope_fingerprint", nullable = false, length = 71)
    private String scopeFingerprint;

    @Column(name = "revision", nullable = false)
    private long revision;

    @Column(name = "plan_label", length = 160)
    private String planLabel;

    @Column(name = "blocks_json", nullable = false, columnDefinition = "TEXT")
    private String blocksJson;

    @Column(name = "captured_at", nullable = false)
    private Instant capturedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Learner getLearner() {
        return learner;
    }

    public void setLearner(Learner learner) {
        this.learner = learner;
    }

    public String getLandscapeId() {
        return landscapeId;
    }

    public void setLandscapeId(String landscapeId) {
        this.landscapeId = landscapeId;
    }

    public String getCurriculumId() {
        return curriculumId;
    }

    public void setCurriculumId(String curriculumId) {
        this.curriculumId = curriculumId;
    }

    public String getScopeFingerprint() {
        return scopeFingerprint;
    }

    public void setScopeFingerprint(String scopeFingerprint) {
        this.scopeFingerprint = scopeFingerprint;
    }

    public long getRevision() {
        return revision;
    }

    public void setRevision(long revision) {
        this.revision = revision;
    }

    public String getPlanLabel() {
        return planLabel;
    }

    public void setPlanLabel(String planLabel) {
        this.planLabel = planLabel;
    }

    public String getBlocksJson() {
        return blocksJson;
    }

    public void setBlocksJson(String blocksJson) {
        this.blocksJson = blocksJson;
    }

    public Instant getCapturedAt() {
        return capturedAt;
    }

    public void setCapturedAt(Instant capturedAt) {
        this.capturedAt = capturedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
