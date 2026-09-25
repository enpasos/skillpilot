package com.skillpilot.backend.service.learningplan;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class UnifiedLearningPlanStatusFormatterTest {

    @Test
    void missingOrInvalidBalanceCannotBecomeANormalStatusLine() {
        assertThatThrownBy(() -> UnifiedLearningPlanStatusFormatter.formatSubjectLine(
                "Mathematik", PeriodBasis.DAY, null, "de")).isInstanceOf(NullPointerException.class);
        assertThatThrownBy(() -> UnifiedLearningPlanStatusFormatter.formatPeriodText(
                PeriodBasis.DAY, -1, 0, "de")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> UnifiedLearningPlanStatusFormatter.formatPlanStatusText(1, 1, "de"))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(UnifiedLearningPlanStatusFormatter.formatUnavailableStatusNotice("en"))
                .isEqualTo("Learning plan status currently unavailable.");
    }

    @Test
    @DisplayName("German formatting matches Section 4.4 and 5")
    void testGermanFormatting() {
        // Tagesbeginn ohne Rückstand: 13, 3, 10, 0 => erfuellt=0, rueckstand=0, vorsprung=0
        PlanBalanceResult r1 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(13, 3, 10, 0));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematik", PeriodBasis.DAY, r1, 3, "de"))
                .isEqualTo("Mathematik: Tagesziel 0 von 3 · im Plan");

        // Rückstand, ein Ziel heute erledigt: 13, 3, 9, 1 => erfuellt=1, rueckstand=2
        PlanBalanceResult r2 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(13, 3, 9, 1));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematik", PeriodBasis.DAY, r2, 3, "de"))
                .isEqualTo("Mathematik: Tagesziel 1 von 3 · 2 Lernziele im Rückstand");

        // Tagesziel erreicht, Rest offen: 13, 3, 12, 4 => erfuellt=3, rueckstand=1 (singular)
        PlanBalanceResult r3 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(13, 3, 12, 4));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematik", PeriodBasis.DAY, r3, 3, "de"))
                .isEqualTo("Mathematik: Tagesziel erreicht · 1 Lernziel im Rückstand");

        // Über das Soll hinaus: 13, 3, 15, 6 => erfuellt=3, vorsprung=2
        PlanBalanceResult r4 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(13, 3, 15, 6));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematik", PeriodBasis.DAY, r4, 3, "de"))
                .isEqualTo("Mathematik: Tagesziel erreicht · 2 Lernziele vorgearbeitet");

        // Vorarbeit deckt Pensum ab: 13, 3, 13, 0 => erfuellt=3, im Plan
        PlanBalanceResult r5 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(13, 3, 13, 0));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematik", PeriodBasis.DAY, r5, 3, "de"))
                .isEqualTo("Mathematik: Tagesziel erreicht · im Plan");

        // Heute nichts geplant, Rückstand vorhanden: 10, 0, 8, 0 => erfuellt=0, rueckstand=2
        PlanBalanceResult r6 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(10, 0, 8, 0));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Physik", PeriodBasis.DAY, r6, 0, "de"))
                .isEqualTo("Physik: Heute kein Tagesziel · 2 Lernziele im Rückstand");
    }

    @Test
    @DisplayName("Week basis German formatting")
    void testWeekBasisGerman() {
        PlanBalanceResult r1 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(20, 5, 17, 2));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematik", PeriodBasis.WEEK, r1, 5, "de"))
                .isEqualTo("Mathematik: Wochenziel 2 von 5 · im Plan");

        PlanBalanceResult r2 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(20, 0, 18, 0));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematik", PeriodBasis.WEEK, r2, 0, "de"))
                .isEqualTo("Mathematik: Diese Woche kein Wochenziel · 2 Lernziele im Rückstand");

        PlanBalanceResult r3 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(20, 5, 20, 5));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematik", PeriodBasis.WEEK, r3, 5, "de"))
                .isEqualTo("Mathematik: Wochenziel erreicht · im Plan");
    }

    @Test
    @DisplayName("English formatting")
    void testEnglishFormatting() {
        PlanBalanceResult r1 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(13, 3, 10, 0));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematics", PeriodBasis.DAY, r1, 3, "en"))
                .isEqualTo("Mathematics: Daily target 0 of 3 · on track");

        PlanBalanceResult r2 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(13, 3, 9, 1));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematics", PeriodBasis.DAY, r2, 3, "en"))
                .isEqualTo("Mathematics: Daily target 1 of 3 · 2 learning goals behind");

        PlanBalanceResult r3 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(13, 3, 12, 4));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematics", PeriodBasis.DAY, r3, 3, "en"))
                .isEqualTo("Mathematics: Daily target reached · 1 learning goal behind");

        PlanBalanceResult r4 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(13, 3, 15, 6));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Mathematics", PeriodBasis.DAY, r4, 3, "en"))
                .isEqualTo("Mathematics: Daily target reached · 2 learning goals ahead");

        PlanBalanceResult r6 = UnifiedLearningPlanStatusCalculator.calculate(new PlanBalanceInputs(10, 0, 8, 0));
        assertThat(UnifiedLearningPlanStatusFormatter.formatSubjectLine("Physics", PeriodBasis.DAY, r6, 0, "en"))
                .isEqualTo("Physics: No daily target today · 2 learning goals behind");
    }

    @Test
    void compactBalanceDialTextKeepsFullChatStatusUnchanged() {
        PlanBalanceResult behind = UnifiedLearningPlanStatusCalculator.calculate(
                new PlanBalanceInputs(13, 3, 12, 4));
        PlanBalanceResult onTrack = UnifiedLearningPlanStatusCalculator.calculate(
                new PlanBalanceInputs(13, 3, 13, 0));
        PlanBalanceResult ahead = UnifiedLearningPlanStatusCalculator.calculate(
                new PlanBalanceInputs(13, 3, 15, 6));

        assertThat(UnifiedLearningPlanStatusFormatter.formatBalanceDialText(behind, "de"))
                .isEqualTo("1 im Rückstand");
        assertThat(UnifiedLearningPlanStatusFormatter.formatBalanceDialText(onTrack, "de"))
                .isEqualTo("im Plan");
        assertThat(UnifiedLearningPlanStatusFormatter.formatBalanceDialText(ahead, "de"))
                .isEqualTo("2 vorgearbeitet");
        assertThat(UnifiedLearningPlanStatusFormatter.formatBalanceDialText(behind, "en"))
                .isEqualTo("1 behind");
        assertThat(UnifiedLearningPlanStatusFormatter.formatBalanceDialText(onTrack, "en"))
                .isEqualTo("on track");
        assertThat(UnifiedLearningPlanStatusFormatter.formatBalanceDialText(ahead, "en"))
                .isEqualTo("2 ahead");
        assertThat(UnifiedLearningPlanStatusFormatter.formatPlanStatusText(behind, "de"))
                .isEqualTo("1 Lernziel im Rückstand");
    }

    @Test
    void testActiveGoalAnnouncement() {
        assertThat(UnifiedLearningPlanStatusFormatter.formatActiveGoalAnnouncement("Potenzfunktionen beschreiben", "de"))
                .isEqualTo("Dein aktives Lernziel: Potenzfunktionen beschreiben");
        assertThat(UnifiedLearningPlanStatusFormatter.formatActiveGoalAnnouncement("Describe power functions", "en"))
                .isEqualTo("Your active learning goal: Describe power functions");
        assertThat(UnifiedLearningPlanStatusFormatter.formatActiveGoalAnnouncement(null, "de")).isEmpty();
        assertThat(UnifiedLearningPlanStatusFormatter.formatActiveGoalAnnouncement("", "de")).isEmpty();
    }

    @Test
    void testUnavailableNotice() {
        assertThat(UnifiedLearningPlanStatusFormatter.formatUnavailableNotice(List.of("Physik"), "de"))
                .isEqualTo("1 Fachplan nicht auswertbar (Physik).");
        assertThat(UnifiedLearningPlanStatusFormatter.formatUnavailableNotice(List.of("Physik", "Chemie"), "de"))
                .isEqualTo("2 Fachpläne nicht auswertbar (Physik, Chemie).");
        assertThat(UnifiedLearningPlanStatusFormatter.formatUnavailableNotice(List.of("Physics"), "en"))
                .isEqualTo("1 subject plan unavailable (Physics).");
        assertThat(UnifiedLearningPlanStatusFormatter.formatUnavailableNotice(List.of(), "de")).isEmpty();
    }
}
