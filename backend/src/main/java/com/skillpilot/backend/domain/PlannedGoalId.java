package com.skillpilot.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PlannedGoalId implements Serializable {

    @Column(name = "skillpilot_id", nullable = false, length = 80)
    private String skillpilotId;

    @Column(name = "goal_id", nullable = false, length = 255)
    private String goalId;

    public PlannedGoalId() {}

    public PlannedGoalId(String skillpilotId, String goalId) {
        this.skillpilotId = skillpilotId;
        this.goalId = goalId;
    }

    public String getSkillpilotId() {
        return skillpilotId;
    }

    public String getGoalId() {
        return goalId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PlannedGoalId that = (PlannedGoalId) o;
        return Objects.equals(skillpilotId, that.skillpilotId) && Objects.equals(goalId, that.goalId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(skillpilotId, goalId);
    }
}
