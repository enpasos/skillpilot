package com.skillpilot.backend.service.learningplan;

import java.util.List;
import java.util.Locale;

/**
 * Deterministic text generator for the unified learning plan status.
 *
 * <p>Implements the standard localization templates defined in section 5 of the concept.
 * Fixed templates for German ("de") and English ("en").</p>
 */
public final class UnifiedLearningPlanStatusFormatter {

    private UnifiedLearningPlanStatusFormatter() {}

    public static String formatPeriodText(PeriodBasis basis, int p, int erfuelltesPeriodenziel, String locale) {
        boolean english = isEnglish(locale);
        if (p == 0) {
            if (basis == PeriodBasis.WEEK) {
                return english ? "No weekly target this week" : "Diese Woche kein Wochenziel";
            }
            return english ? "No daily target today" : "Heute kein Tagesziel";
        }
        if (erfuelltesPeriodenziel >= p) {
            if (basis == PeriodBasis.WEEK) {
                return english ? "Weekly target reached" : "Wochenziel erreicht";
            }
            return english ? "Daily target reached" : "Tagesziel erreicht";
        }
        if (basis == PeriodBasis.WEEK) {
            return english
                    ? "Weekly target " + erfuelltesPeriodenziel + " of " + p
                    : "Wochenziel " + erfuelltesPeriodenziel + " von " + p;
        }
        return english
                ? "Daily target " + erfuelltesPeriodenziel + " of " + p
                : "Tagesziel " + erfuelltesPeriodenziel + " von " + p;
    }

    public static String formatPlanStatusText(int rueckstand, int vorsprung, String locale) {
        boolean english = isEnglish(locale);
        if (rueckstand > 0) {
            if (english) {
                return rueckstand == 1 ? "1 learning goal behind" : rueckstand + " learning goals behind";
            }
            return rueckstand == 1 ? "1 Lernziel im Rückstand" : rueckstand + " Lernziele im Rückstand";
        }
        if (vorsprung > 0) {
            if (english) {
                return vorsprung == 1 ? "1 learning goal ahead" : vorsprung + " learning goals ahead";
            }
            return vorsprung == 1 ? "1 Lernziel vorgearbeitet" : vorsprung + " Lernziele vorgearbeitet";
        }
        return english ? "on track" : "im Plan";
    }

    public static String formatPeriodText(PeriodBasis basis, PlanBalanceResult balance, String locale) {
        if (balance == null) {
            return formatPeriodText(basis, 0, 0, locale);
        }
        int p = balance.erfuelltesPeriodenziel() + balance.offenesPeriodenpensum();
        return formatPeriodText(basis, p, balance.erfuelltesPeriodenziel(), locale);
    }

    public static String formatPlanStatusText(PlanBalanceResult balance, String locale) {
        if (balance == null) {
            return formatPlanStatusText(0, 0, locale);
        }
        return formatPlanStatusText(balance.rueckstand(), balance.vorsprung(), locale);
    }

    public static String formatSubjectLine(
            String subjectLabel,
            PeriodBasis basis,
            PlanBalanceResult balance,
            int p,
            String locale) {
        String periodText = formatPeriodText(basis, p, balance.erfuelltesPeriodenziel(), locale);
        String planStatusText = formatPlanStatusText(balance.rueckstand(), balance.vorsprung(), locale);
        return subjectLabel + ": " + periodText + " · " + planStatusText;
    }

    public static String formatSubjectLine(
            String subjectLabel,
            PeriodBasis basis,
            PlanBalanceResult balance,
            String locale) {
        if (balance == null) {
            return subjectLabel + ": " + formatPeriodText(basis, 0, 0, locale) + " · " + formatPlanStatusText(0, 0, locale);
        }
        int p = balance.erfuelltesPeriodenziel() + balance.offenesPeriodenpensum();
        return formatSubjectLine(subjectLabel, basis, balance, p, locale);
    }

    public static String formatActiveGoalAnnouncement(String activeGoalTitle, String locale) {
        if (activeGoalTitle == null || activeGoalTitle.isBlank()) {
            return "";
        }
        boolean english = isEnglish(locale);
        return (english ? "Your active learning goal: " : "Dein aktives Lernziel: ") + activeGoalTitle.trim();
    }

    public static String formatUnavailableNotice(List<String> unavailableSubjectLabels, String locale) {
        if (unavailableSubjectLabels == null || unavailableSubjectLabels.isEmpty()) {
            return "";
        }
        boolean english = isEnglish(locale);
        int count = unavailableSubjectLabels.size();
        String list = String.join(", ", unavailableSubjectLabels);
        if (english) {
            return count == 1
                    ? "1 subject plan unavailable (" + list + ")."
                    : count + " subject plans unavailable (" + list + ").";
        }
        return count == 1
                ? "1 Fachplan nicht auswertbar (" + list + ")."
                : count + " Fachpläne nicht auswertbar (" + list + ").";
    }

    public static String formatNoPlansNotice(String locale) {
        return isEnglish(locale) ? "No learning plan set up." : "Kein Lernplan eingerichtet.";
    }

    /**
     * Joins the subject lines and any evaluation notice into {@code status.text}. The active
     * goal is deliberately not part of it; its announcement is published separately.
     */
    public static String formatCombinedStatusText(
            List<String> subjectLines,
            List<String> unavailableSubjectLabels,
            String locale) {
        StringBuilder sb = new StringBuilder();
        if (subjectLines != null && !subjectLines.isEmpty()) {
            for (String line : subjectLines) {
                if (line != null && !line.isBlank()) {
                    if (sb.length() > 0) {
                        sb.append("\n");
                    }
                    sb.append(line.trim());
                }
            }
        }
        if (unavailableSubjectLabels != null && !unavailableSubjectLabels.isEmpty()) {
            String notice = formatUnavailableNotice(unavailableSubjectLabels, locale);
            if (!notice.isBlank()) {
                if (sb.length() > 0) {
                    sb.append("\n");
                }
                sb.append(notice);
            }
        }
        if (sb.length() == 0) {
            return formatNoPlansNotice(locale);
        }
        return sb.toString();
    }

    private static boolean isEnglish(String locale) {
        return locale != null && locale.trim().toLowerCase(Locale.ROOT).startsWith("en");
    }
}
