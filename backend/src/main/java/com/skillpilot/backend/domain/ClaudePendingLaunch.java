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
@Table(name = "claude_pending_launch")
public class ClaudePendingLaunch {

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

    @Column(name = "language", length = 16)
    private String language;

    @Column(name = "selected_curriculum")
    private String selectedCurriculum;

    @Column(name = "client", length = 64)
    private String client;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Learner getLearner() {
        return learner;
    }

    public void setLearner(Learner learner) {
        this.learner = learner;
    }

    public String getConnectionSubject() {
        return connectionSubject;
    }

    public void setConnectionSubject(String connectionSubject) {
        this.connectionSubject = connectionSubject;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getConsumedAt() {
        return consumedAt;
    }

    public void setConsumedAt(Instant consumedAt) {
        this.consumedAt = consumedAt;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getSelectedCurriculum() {
        return selectedCurriculum;
    }

    public void setSelectedCurriculum(String selectedCurriculum) {
        this.selectedCurriculum = selectedCurriculum;
    }

    public String getClient() {
        return client;
    }

    public void setClient(String client) {
        this.client = client;
    }
}
