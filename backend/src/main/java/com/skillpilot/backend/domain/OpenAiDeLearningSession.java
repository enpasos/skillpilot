package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Absolute, server-side learning session for one German OpenAI connection.
 *
 * <p>The primary key is the opaque OAuth connection subject. It is never sent
 * to the model or accepted as a tool argument. Reusing the primary key makes a
 * new explicit SkillPilot launch replace the previous learning session
 * atomically.</p>
 */
@Entity
@Table(name = "openai_de_learning_session")
public class OpenAiDeLearningSession {

    @Id
    @Column(name = "connection_subject", nullable = false, updatable = false, length = 96)
    private String connectionSubject;

    @Column(name = "started_at", nullable = false)
    private Instant startedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    public String getConnectionSubject() {
        return connectionSubject;
    }

    public void setConnectionSubject(String connectionSubject) {
        this.connectionSubject = connectionSubject;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
}
