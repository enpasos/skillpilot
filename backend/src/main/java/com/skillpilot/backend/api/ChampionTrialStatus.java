package com.skillpilot.backend.api;

/** Public projection: no learner identity, individual goal events, or private scope configuration. */
public record ChampionTrialStatus(
        String state, String scopeLabel, String scopeCoverage,
        int requiredGoals, int practicedGoals, int blockingFindings,
        boolean canStart, boolean canComplete, boolean findingsAvailable) {
}
