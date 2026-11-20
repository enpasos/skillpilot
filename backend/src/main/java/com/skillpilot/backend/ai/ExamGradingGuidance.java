package com.skillpilot.backend.ai;

/** Shared by the coach adapters when they release the rubric for a submitted exam. */
public final class ExamGradingGuidance {
    private ExamGradingGuidance() {}

    public static final String DE =
            "Prüfe jedes Kriterium anhand der gesamten Abgabe und ausschließlich anhand sichtbar vorliegender Leistung. "
            + "Ein an anderer Stelle eindeutig erbrachter Nachweis zählt auch hier. Eindeutige Korrekturen "
            + "gelten in ihrer endgültigen Fassung. Die Musterlösung ist nur Referenz. Fachlich gleichwertige "
            + "Darstellungen, Rundungen, Begründungen und alternative Lösungswege zählen voll. Verlangt die Aufgabe "
            + "eine bestimmte Antwortform, muss diese vorliegen. Solche und andere ausdrückliche Anforderungen bleiben verbindlich. "
            + "Trenne die vorgesehenen Teilpunkte sauber und begründe jeden Abzug konkret. Ein Fehler betrifft nur die "
            + "Kriterien, deren Nachweis er beeinträchtigt. Benenne Unleserliches als solches und erfinde daraus "
            + "keinen konkreten fachlichen Fehler. Unterscheide im Feedback Gezeigtes, fehlende Belege und fachliche "
            + "Widersprüche. Entscheide ohne Rückfrage anhand der Punktsumme und der freigegebenen Bestehensgrenze.";

    public static final String EN =
            "Assess each criterion against the whole submission. Count evidence clearly demonstrated elsewhere in "
            + "the work and assess clearly corrected work in its final form. The sample solution is a reference only. "
            + "Give full credit for equivalent representations, rounding, explanations and methods. If the task calls "
            + "for a specific answer form, require it. Explicit requirements remain binding. Award the rubric's partial "
            + "credit and explain each deduction. Apply an error only to criteria whose evidence it actually affects. "
            + "Identify illegible work as such and never invent a specific subject error. Distinguish demonstrated "
            + "understanding, missing evidence and conflicting claims in feedback. Decide the result without follow-up "
            + "questions using the total score and released threshold.";
}
