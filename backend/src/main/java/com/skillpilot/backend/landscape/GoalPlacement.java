package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;

/**
 * One placement of a goal in a program unit. Relation {@code own} (runtime contract 1.2) is the
 * direct ownership of an atomic goal by a learning unit and carries no context.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoalPlacement {
    public static final String OWN_RELATION = "own";

    private String goalId;
    private String unitId;
    private String relation;
    private Map<String, String> context;

    public String getGoalId() {
        return goalId;
    }

    public void setGoalId(String goalId) {
        this.goalId = goalId;
    }

    public String getUnitId() {
        return unitId;
    }

    public void setUnitId(String unitId) {
        this.unitId = unitId;
    }

    public String getRelation() {
        return relation;
    }

    public void setRelation(String relation) {
        this.relation = relation;
    }

    public Map<String, String> getContext() {
        return context;
    }

    public void setContext(Map<String, String> context) {
        this.context = context;
    }

    @JsonIgnore
    public boolean isOwnership() {
        return OWN_RELATION.equals(relation);
    }
}
