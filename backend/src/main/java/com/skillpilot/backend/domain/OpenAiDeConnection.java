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
@Table(name = "openai_de_connection")
public class OpenAiDeConnection {

    @Id
    @Column(name = "subject", nullable = false, updatable = false, length = 96)
    private String subject;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "learner_skillpilot_id", nullable = false)
    private Learner learner;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "last_authorized_at")
    private Instant lastAuthorizedAt;

    @Column(name = "oauth_expires_at")
    private Instant oauthExpiresAt;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public Learner getLearner() { return learner; }
    public void setLearner(Learner learner) { this.learner = learner; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getLastAuthorizedAt() { return lastAuthorizedAt; }
    public void setLastAuthorizedAt(Instant lastAuthorizedAt) { this.lastAuthorizedAt = lastAuthorizedAt; }
    public Instant getOauthExpiresAt() { return oauthExpiresAt; }
    public void setOauthExpiresAt(Instant oauthExpiresAt) { this.oauthExpiresAt = oauthExpiresAt; }
    public Instant getLastUsedAt() { return lastUsedAt; }
    public void setLastUsedAt(Instant lastUsedAt) { this.lastUsedAt = lastUsedAt; }
    public Instant getRevokedAt() { return revokedAt; }
    public void setRevokedAt(Instant revokedAt) { this.revokedAt = revokedAt; }
}
