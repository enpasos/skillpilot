package com.skillpilot.backend.teachersupervision;

import com.skillpilot.backend.domain.Learner;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "teacher_membership")
public class TeacherMembership {

    @Id
    @Column(name = "member_id", nullable = false, updatable = false)
    private UUID memberId;

    @Column(name = "invitation_id", nullable = false, unique = true)
    private UUID invitationId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false, updatable = false)
    private TeacherCourse course;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_id", nullable = false, updatable = false)
    private Learner learner;

    @Column(name = "invitation_token_hash", length = 64, unique = true)
    private String invitationTokenHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 16)
    private TeacherMembershipStatus status;

    @Column(name = "personal_curriculum_read", nullable = false)
    private boolean personalCurriculumRead;

    @Column(name = "mastery_read", nullable = false)
    private boolean masteryRead;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    protected TeacherMembership() {
    }

    TeacherMembership(
            TeacherCourse course,
            Learner learner,
            String invitationTokenHash,
            Instant expiresAt) {
        this.memberId = UUID.randomUUID();
        this.invitationId = UUID.randomUUID();
        this.course = course;
        this.learner = learner;
        this.invitationTokenHash = invitationTokenHash;
        this.status = TeacherMembershipStatus.PENDING;
        this.personalCurriculumRead = true;
        this.masteryRead = true;
        this.expiresAt = expiresAt;
        this.createdAt = Instant.now();
    }

    @PrePersist
    void initialize() {
        if (memberId == null) {
            memberId = UUID.randomUUID();
        }
        if (invitationId == null) {
            invitationId = UUID.randomUUID();
        }
        if (status == null) {
            status = TeacherMembershipStatus.PENDING;
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    void renewInvitation(String tokenHash, Instant newExpiry) {
        invitationId = UUID.randomUUID();
        invitationTokenHash = tokenHash;
        status = TeacherMembershipStatus.PENDING;
        personalCurriculumRead = true;
        masteryRead = true;
        expiresAt = newExpiry;
        acceptedAt = null;
        revokedAt = null;
    }

    void accept(Instant now) {
        status = TeacherMembershipStatus.ACTIVE;
        invitationTokenHash = null;
        acceptedAt = now;
        revokedAt = null;
    }

    void revoke(Instant now) {
        status = TeacherMembershipStatus.REVOKED;
        invitationTokenHash = null;
        revokedAt = now;
    }

    public UUID getMemberId() {
        return memberId;
    }

    public UUID getInvitationId() {
        return invitationId;
    }

    public TeacherCourse getCourse() {
        return course;
    }

    public Learner getLearner() {
        return learner;
    }

    public String getInvitationTokenHash() {
        return invitationTokenHash;
    }

    public TeacherMembershipStatus getStatus() {
        return status;
    }

    public boolean isPersonalCurriculumRead() {
        return personalCurriculumRead;
    }

    public boolean isMasteryRead() {
        return masteryRead;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getAcceptedAt() {
        return acceptedAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }
}
