package com.skillpilot.backend.service.learningplan;

/**
 * Deterministic calculation engine for the unified learning plan status.
 *
 * <p>Implements the authoritative calculation rules from section 5 of the concept:</p>
 * <pre>{@code
 * Rohsaldo               = I - S
 * Noch zu deckendes Soll = max(0, -Rohsaldo)
 * Offenes Periodenpensum = min(Noch zu deckendes Soll, max(0, P - H))
 * Rückstand              = Noch zu deckendes Soll - Offenes Periodenpensum
 * Vorsprung              = max(0, Rohsaldo)
 * Erfülltes Periodenziel = P - Offenes Periodenpensum
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
        int offenesPeriodenpensum = Math.min(nochZuDeckendesSoll, Math.max(0, p - h));
        int rueckstand = nochZuDeckendesSoll - offenesPeriodenpensum;
        int vorsprung = Math.max(0, rohsaldo);
        int erfuelltesPeriodenziel = p - offenesPeriodenpensum;

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
