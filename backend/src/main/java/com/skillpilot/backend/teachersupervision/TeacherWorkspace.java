package com.skillpilot.backend.teachersupervision;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "teacher_workspace")
public class TeacherWorkspace {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "access_token_hash", nullable = false, updatable = false, length = 64, unique = true)
    private String accessTokenHash;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    protected TeacherWorkspace() {
    }

    TeacherWorkspace(String accessTokenHash) {
        this.id = UUID.randomUUID();
        this.accessTokenHash = accessTokenHash;
        this.createdAt = Instant.now();
    }

    @PrePersist
    void initialize() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public String getAccessTokenHash() {
        return accessTokenHash;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }
}
