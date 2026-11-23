package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

/** Key of one stored card state: learner, deck goal node and card. */
@Embeddable
public class LearnerCardStateId implements Serializable {

    @Column(name = "skillpilot_id", nullable = false, length = 80)
    private String skillpilotId;

    @Column(name = "node_id", nullable = false, length = 255)
    private String nodeId;

    @Column(name = "card_id", nullable = false, length = 255)
    private String cardId;

    public LearnerCardStateId() {
    }

    public LearnerCardStateId(String skillpilotId, String nodeId, String cardId) {
        this.skillpilotId = skillpilotId;
        this.nodeId = nodeId;
        this.cardId = cardId;
    }

    public String getSkillpilotId() {
        return skillpilotId;
    }

    public String getNodeId() {
        return nodeId;
    }

    public String getCardId() {
        return cardId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof LearnerCardStateId that)) return false;
        return Objects.equals(skillpilotId, that.skillpilotId)
                && Objects.equals(nodeId, that.nodeId)
                && Objects.equals(cardId, that.cardId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(skillpilotId, nodeId, cardId);
    }
}
