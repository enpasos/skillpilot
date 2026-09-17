package com.skillpilot.backend.service.learningplan;

/**
 * Period basis for the unified learning plan status.
 *
 * <p>Saved per SkillPilot-ID in learner preferences. Default is {@link #DAY}.
 * The active basis applies uniformly to calculation, Cockpit, Chat, and plan-guided
 * goal selection.</p>
 */
public enum PeriodBasis {
    DAY,
    WEEK
}
