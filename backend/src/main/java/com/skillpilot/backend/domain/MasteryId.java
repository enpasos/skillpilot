package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class MasteryId implements Serializable {

    @Column(name = "skillpilot_id", nullable = false, length = 80)
    private String skillpilotId;

    @Column(name = "goal_key", nullable = false, length = 120)
    private String goalKey;

    public MasteryId() {}

    public MasteryId(String skillpilotId, String goalKey) {
        this.skillpilotId = skillpilotId;
        this.goalKey = goalKey;
    }

    public String getSkillpilotId() {
        return skillpilotId;
    }

    public String getGoalKey() {
        return goalKey;
    }

    public void setSkillpilotId(String skillpilotId) {
        this.skillpilotId = skillpilotId;
    }

    public void setGoalKey(String goalKey) {
        this.goalKey = goalKey;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MasteryId masteryId = (MasteryId) o;
        return Objects.equals(skillpilotId, masteryId.skillpilotId)
                && Objects.equals(goalKey, masteryId.goalKey);
    }

    @Override
    public int hashCode() {
        return Objects.hash(skillpilotId, goalKey);
    }
}
