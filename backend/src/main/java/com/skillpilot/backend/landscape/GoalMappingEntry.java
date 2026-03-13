package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GoalMappingEntry {

    private String legacyGoalId;
    private String canonicalGoalId;
    private String matchType;

    public String getLegacyGoalId() {
        return legacyGoalId;
    }

    public void setLegacyGoalId(String legacyGoalId) {
        this.legacyGoalId = legacyGoalId;
    }

    public String getCanonicalGoalId() {
        return canonicalGoalId;
    }

    public void setCanonicalGoalId(String canonicalGoalId) {
        this.canonicalGoalId = canonicalGoalId;
    }

    public String getMatchType() {
        return matchType;
    }

    public void setMatchType(String matchType) {
        this.matchType = matchType;
    }
}
