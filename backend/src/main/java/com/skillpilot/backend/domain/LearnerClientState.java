package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "learner_client_state")
public class LearnerClientState {

    @EmbeddedId
    private LearnerClientStateId id;

    @MapsId("skillpilotId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skillpilot_id", nullable = false)
    private Learner learner;

    @Column(name = "client_state", columnDefinition = "TEXT")
    private String clientState;

    @Column(name = "client_state_updated_at")
    private Instant clientStateUpdatedAt;

    public LearnerClientState() {
    }

    public LearnerClientState(Learner learner, String nodeId, String clientState, Instant updatedAt) {
        this.learner = learner;
        this.id = new LearnerClientStateId(learner.getSkillpilotId(), nodeId);
        this.clientState = clientState;
        this.clientStateUpdatedAt = updatedAt;
    }

    public LearnerClientStateId getId() {
        return id;
    }

    public void setId(LearnerClientStateId id) {
        this.id = id;
    }

    public Learner getLearner() {
        return learner;
    }

    public void setLearner(Learner learner) {
        this.learner = learner;
    }

    public String getClientState() {
        return clientState;
    }

    public void setClientState(String clientState) {
        this.clientState = clientState;
    }

    public Instant getClientStateUpdatedAt() {
        return clientStateUpdatedAt;
    }

    public void setClientStateUpdatedAt(Instant clientStateUpdatedAt) {
        this.clientStateUpdatedAt = clientStateUpdatedAt;
    }
}
