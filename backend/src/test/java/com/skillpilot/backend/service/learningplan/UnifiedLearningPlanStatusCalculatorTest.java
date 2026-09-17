package com.skillpilot.backend.service.learningplan;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class UnifiedLearningPlanStatusCalculatorTest {

    @DisplayName("Referenzfälle aus Konzept § 5.5")
    @ParameterizedTest(name = "{0}: S={1}, P={2}, I={3}, H={4} => erfuellt={5}, rueckstand={6}, vorsprung={7}, direction={8}")
    @CsvSource({
            "'Tagesbeginn ohne Rückstand',                    13, 3, 10, 0, 0, 0, 0, ON_TRACK",
            "'Rückstand, ein Ziel heute erledigt',            13, 3,  9, 1, 1, 2, 0, BEHIND",
            "'Tagesziel erreicht, Rest offen',                13, 3, 12, 4, 3, 1, 0, BEHIND",
            "'Über das Soll hinaus gelernt',                  13, 3, 15, 6, 3, 0, 2, AHEAD",
            "'Tagespensum bereits durch Vorarbeit abgedeckt', 13, 3, 13, 0, 3, 0, 0, ON_TRACK",
            "'Heute nichts geplant, Rückstand vorhanden',     10, 0,  8, 0, 0, 2, 0, BEHIND"
    })
    void matchesSection55ReferenceCases(
            String situation,
            int s,
            int p,
            int i,
            int h,
            int expectedErfuellt,
            int expectedRueckstand,
            int expectedVorsprung,
            StatusDirection expectedDirection) {
        PlanBalanceInputs inputs = new PlanBalanceInputs(s, p, i, h);
        PlanBalanceResult result = UnifiedLearningPlanStatusCalculator.calculate(inputs);

        assertThat(result.erfuelltesPeriodenziel())
                .as("erfuelltesPeriodenziel for " + situation)
                .isEqualTo(expectedErfuellt);
        assertThat(result.rueckstand())
                .as("rueckstand for " + situation)
                .isEqualTo(expectedRueckstand);
        assertThat(result.vorsprung())
                .as("vorsprung for " + situation)
                .isEqualTo(expectedVorsprung);
        assertThat(result.direction())
                .as("direction for " + situation)
                .isEqualTo(expectedDirection);
    }

    @Test
    void testInputValidation() {
        assertThatThrownBy(() -> new PlanBalanceInputs(-1, 0, 0, 0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new PlanBalanceInputs(5, 6, 0, 0))
                .isInstanceOf(IllegalArgumentException.class); // P > S
        assertThatThrownBy(() -> new PlanBalanceInputs(5, 3, 2, 3))
                .isInstanceOf(IllegalArgumentException.class); // H > I
    }

    @Test
    void testPartialVorarbeitCoveringPartofPeriodTarget() {
        // S = 10, P = 4, I = 8, H = 0.
        // Rohsaldo = 8 - 10 = -2.
        // Noch zu deckendes Soll = 2.
        // max(0, P - H) = 4.
        // Offenes Periodenpensum = min(2, 4) = 2.
        // Rückstand = 2 - 2 = 0.
        // Erfülltes Periodenziel = 4 - 2 = 2.
        // Status: Tagesziel 2 von 4 · im Plan.
        PlanBalanceInputs inputs = new PlanBalanceInputs(10, 4, 8, 0);
        PlanBalanceResult result = UnifiedLearningPlanStatusCalculator.calculate(inputs);

        assertThat(result.erfuelltesPeriodenziel()).isEqualTo(2);
        assertThat(result.offenesPeriodenpensum()).isEqualTo(2);
        assertThat(result.rueckstand()).isEqualTo(0);
        assertThat(result.vorsprung()).isEqualTo(0);
        assertThat(result.direction()).isEqualTo(StatusDirection.ON_TRACK);
    }

    @Test
    void testZeroPlanCompleted() {
        PlanBalanceInputs inputs = new PlanBalanceInputs(0, 0, 0, 0);
        PlanBalanceResult result = UnifiedLearningPlanStatusCalculator.calculate(inputs);

        assertThat(result.erfuelltesPeriodenziel()).isEqualTo(0);
        assertThat(result.rueckstand()).isEqualTo(0);
        assertThat(result.vorsprung()).isEqualTo(0);
        assertThat(result.direction()).isEqualTo(StatusDirection.ON_TRACK);
    }
}
