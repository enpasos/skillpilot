package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class LearnerClientStateId implements Serializable {

    @Column(name = "skillpilot_id", nullable = false, length = 80)
    private String skillpilotId;

    @Column(name = "node_id", nullable = false, length = 255)
    private String nodeId;

    public LearnerClientStateId() {
    }

    public LearnerClientStateId(String skillpilotId, String nodeId) {
        this.skillpilotId = skillpilotId;
        this.nodeId = nodeId;
    }

    public String getSkillpilotId() {
        return skillpilotId;
    }

    public void setSkillpilotId(String skillpilotId) {
        this.skillpilotId = skillpilotId;
    }

    public String getNodeId() {
        return nodeId;
    }

    public void setNodeId(String nodeId) {
        this.nodeId = nodeId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        LearnerClientStateId that = (LearnerClientStateId) o;
        return Objects.equals(skillpilotId, that.skillpilotId)
                && Objects.equals(nodeId, that.nodeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(skillpilotId, nodeId);
    }
}
