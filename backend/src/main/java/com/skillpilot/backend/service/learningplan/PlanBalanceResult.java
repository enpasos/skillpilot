package com.skillpilot.backend.service.learningplan;

/**
 * Derived quantitative metrics and tri-state direction for a subject's plan balance.
 *
 * @param rohsaldo I - S
 * @param nochZuDeckendesSoll max(0, -rohsaldo)
 * @param offenesPeriodenpensum max(0, P - H)
 * @param rueckstand max(0, nochZuDeckendesSoll - offenesPeriodenpensum)
 * @param vorsprung max(0, rohsaldo)
 * @param erfuelltesPeriodenziel min(P, H), using only dated explicit completions
 * @param direction BEHIND if rueckstand > 0, AHEAD if vorsprung > 0, else ON_TRACK
 */
public record PlanBalanceResult(
        int rohsaldo,
        int nochZuDeckendesSoll,
        int offenesPeriodenpensum,
        int rueckstand,
        int vorsprung,
        int erfuelltesPeriodenziel,
        StatusDirection direction) {

    public StatusDirection statusDirection() {
        return direction;
    }
}
