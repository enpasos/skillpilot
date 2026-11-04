package com.skillpilot.backend.service.learningplan;

/**
 * Deterministic calculation engine for the unified learning plan status.
 *
 * <p>Implements the authoritative calculation rules from section 5 of the concept:</p>
 * <pre>{@code
 * Rohsaldo               = I - S
 * Noch zu deckendes Soll = max(0, -Rohsaldo)
 * Offenes Periodenpensum = max(0, P - H)
 * Rückstand              = max(0, Noch zu deckendes Soll - Offenes Periodenpensum)
 * Vorsprung              = max(0, Rohsaldo)
 * Erfülltes Periodenziel = min(P, H)
 *
 * Statusrichtung:
 *   behind   bei Rückstand > 0
 *   ahead    bei Vorsprung > 0
 *   on_track ansonsten
 * }</pre>
 */
public final class UnifiedLearningPlanStatusCalculator {

    private UnifiedLearningPlanStatusCalculator() {}

    public static PlanBalanceResult calculate(PlanBalanceInputs inputs) {
        if (inputs == null) {
            throw new IllegalArgumentException("inputs must not be null");
        }
        int s = inputs.s();
        int p = inputs.p();
        int i = inputs.i();
        int h = inputs.h();

        int rohsaldo = i - s;
        int nochZuDeckendesSoll = Math.max(0, -rohsaldo);
        int offenesPeriodenpensum = Math.max(0, p - h);
        int rueckstand = Math.max(0, nochZuDeckendesSoll - offenesPeriodenpensum);
        int vorsprung = Math.max(0, rohsaldo);
        int erfuelltesPeriodenziel = Math.min(p, h);

        StatusDirection direction;
        if (rueckstand > 0) {
            direction = StatusDirection.BEHIND;
        } else if (vorsprung > 0) {
            direction = StatusDirection.AHEAD;
        } else {
            direction = StatusDirection.ON_TRACK;
        }

        return new PlanBalanceResult(
                rohsaldo,
                nochZuDeckendesSoll,
                offenesPeriodenpensum,
                rueckstand,
                vorsprung,
                erfuelltesPeriodenziel,
                direction);
    }
}
