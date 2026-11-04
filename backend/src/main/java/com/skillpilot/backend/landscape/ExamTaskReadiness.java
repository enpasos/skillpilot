package com.skillpilot.backend.landscape;

import java.util.Locale;

/** Shared existing task-readiness contract for selection, coaching and completion audits. */
public final class ExamTaskReadiness {
    private ExamTaskReadiness() { }

    /** Missing review status remains allowed; an explicit status must be released. */
    public static boolean isReady(ExamData exam) {
        if (exam == null || hasBlockingReviewStatus(exam.getReviewStatus()) || containsPlaceholderText(exam)) {
            return false;
        }
        return hasScoringStructure(exam)
                && exam.getTaskContent() != null && !exam.getTaskContent().isBlank()
                && exam.getSolutionContent() != null && !exam.getSolutionContent().isBlank();
    }

    private static boolean hasBlockingReviewStatus(String reviewStatus) {
        return reviewStatus != null && !reviewStatus.isBlank()
                && !"released".equals(reviewStatus.trim().toLowerCase(Locale.ROOT));
    }

    private static boolean containsPlaceholderText(ExamData exam) {
        String task = normalizeForInspection(exam.getTaskContent());
        String solution = normalizeForInspection(exam.getSolutionContent());
        if (task.matches("^eine materialgestuetzte j\\d+[- ]uebungsaufgabe\\b.*")) return true;
        if (task.matches("^eine integrative sek[- ]i[- ]abschlussaufgabe\\b.*")) return true;
        if (task.contains("uebungsaufgabe verbindet") && !hasSubtaskMarkers(task)) return true;
        return solution.startsWith("die loesung zeigt ")
                && !hasSubtaskMarkers(task) && !task.matches(".*\\b\\d+[,.]?\\d*\\b.*");
    }

    private static boolean hasSubtaskMarkers(String normalizedTask) {
        return normalizedTask.matches("(?s).*(?:\\b1\\.|\\ba\\)|\\baufgabe\\s+1\\b|\\bteilaufgabe\\b).*");
    }

    private static String normalizeForInspection(String value) {
        if (value == null) return "";
        return value.toLowerCase(Locale.ROOT)
                .replace("ü", "ue").replace("ä", "ae").replace("ö", "oe").replace("ß", "ss")
                .replaceAll("\\s+", " ").trim();
    }

    private static boolean hasScoringStructure(ExamData exam) {
        ExamData.Scoring scoring = exam.getScoring();
        return scoring != null && scoring.getMaxPoints() > 0 && scoring.getPassingPoints() > 0
                && scoring.getSteps() != null && !scoring.getSteps().isEmpty();
    }
}
