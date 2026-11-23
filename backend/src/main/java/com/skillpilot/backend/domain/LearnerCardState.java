package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PostLoad;
import jakarta.persistence.PostPersist;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.time.Instant;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.springframework.data.domain.Persistable;

/**
 * One row per learner, deck goal node and card (issue #85).
 *
 * <p>{@code cardState} holds the complete card state object exactly as the
 * former per-node JSON block held it. The typed columns are a projection of
 * that object for filtering ({@code SrsCardStateSummary}).</p>
 *
 * <p>The row with the reserved card identifier {@value #NODE_RECORD_CARD_ID}
 * (an empty string, never a valid card identifier) is the node record: it
 * carries the node's synchronization timestamp when no card row does, and the
 * damage marker of a former block that could not be migrated. Its
 * {@code cardState} is {@code null}.</p>
 */
@Entity
@Table(name = "learner_card_state")
public class LearnerCardState implements Persistable<LearnerCardStateId> {

    public static final String NODE_RECORD_CARD_ID = "";

    @EmbeddedId
    private LearnerCardStateId id;

    // Read-only association: it only declares the learner foreign key (cascading delete).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skillpilot_id", nullable = false, insertable = false, updatable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Learner learner;

    @Column(name = "card_state", columnDefinition = "TEXT")
    private String cardState;

    @Column(name = "recall_status", length = 16)
    private String recallStatus;

    @Column(name = "recall_tested_at")
    private Instant recallTestedAt;

    @Column(name = "next_review_at")
    private Long nextReviewAt;

    @Column(name = "practice_repetition", nullable = false)
    private int practiceRepetition;

    @Column(name = "invalid_reason", length = 16)
    private String invalidReason;

    @Column(name = "invalid_state", columnDefinition = "TEXT")
    private String invalidState;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // Assigned keys: a new row is inserted directly instead of being looked up first.
    @Transient
    private boolean newRow;

    protected LearnerCardState() {
    }

    public LearnerCardState(LearnerCardStateId id) {
        this.id = id;
        this.newRow = true;
    }

    @Override
    public LearnerCardStateId getId() {
        return id;
    }

    @Override
    public boolean isNew() {
        return newRow;
    }

    @PostLoad
    @PostPersist
    void markStored() {
        newRow = false;
    }

    public boolean isNodeRecord() {
        return NODE_RECORD_CARD_ID.equals(id.getCardId());
    }

    public String getCardState() {
        return cardState;
    }

    public void setCardState(String cardState) {
        this.cardState = cardState;
    }

    public String getRecallStatus() {
        return recallStatus;
    }

    public void setRecallStatus(String recallStatus) {
        this.recallStatus = recallStatus;
    }

    public Instant getRecallTestedAt() {
        return recallTestedAt;
    }

    public void setRecallTestedAt(Instant recallTestedAt) {
        this.recallTestedAt = recallTestedAt;
    }

    public Long getNextReviewAt() {
        return nextReviewAt;
    }

    public void setNextReviewAt(Long nextReviewAt) {
        this.nextReviewAt = nextReviewAt;
    }

    public int getPracticeRepetition() {
        return practiceRepetition;
    }

    public void setPracticeRepetition(int practiceRepetition) {
        this.practiceRepetition = practiceRepetition;
    }

    public String getInvalidReason() {
        return invalidReason;
    }

    public void setInvalidReason(String invalidReason) {
        this.invalidReason = invalidReason;
    }

    public String getInvalidState() {
        return invalidState;
    }

    public void setInvalidState(String invalidState) {
        this.invalidState = invalidState;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
