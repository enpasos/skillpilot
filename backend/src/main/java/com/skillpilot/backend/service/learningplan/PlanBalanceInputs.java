package com.skillpilot.backend.service.learningplan;

/**
 * Validated inputs for the quantitative plan balance of a single subject.
 *
 * <p>All counts refer to the verified, consolidated plan goal set of the subject,
 * excluding pre-existing baseline mastery.</p>
 *
 * @param s Total plan goals scheduled through the end of the current period.
 * @param p Plan goals due within the current period (the daily or weekly quota).
 * @param i Currently mastered plan goals, independent of scheduled date.
 * @param h Distinct plan goals reliably completed within the current period and
 *          still currently mastered.
 */
public record PlanBalanceInputs(int s, int p, int i, int h) {

    public PlanBalanceInputs {
        if (s < 0) throw new IllegalArgumentException("S must not be negative: " + s);
        if (p < 0) throw new IllegalArgumentException("P must not be negative: " + p);
        if (i < 0) throw new IllegalArgumentException("I must not be negative: " + i);
        if (h < 0) throw new IllegalArgumentException("H must not be negative: " + h);
        if (p > s) throw new IllegalArgumentException("P (" + p + ") cannot exceed S (" + s + ")");
        if (h > i) throw new IllegalArgumentException("H (" + h + ") cannot exceed I (" + i + ")");
    }
}
