package com.skillpilot.backend.api;

/** One champion's coverage, never a union of different people's partial runs. */
public record HumanTrialSummary(
        String state, String scopeLabel, String scopeCoverage, int requiredGoals, int practicedGoals) {
}
