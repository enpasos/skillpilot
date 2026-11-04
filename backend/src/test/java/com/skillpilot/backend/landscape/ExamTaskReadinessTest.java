package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.function.Consumer;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

class ExamTaskReadinessTest {
    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "released", " RELEASED "})
    void concreteScoredTasksAllowReleasedOrUnspecifiedReviewStatus(String status) {
        var exam = task();
        exam.setReviewStatus(status);
        assertThat(ExamTaskReadiness.isReady(exam)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {"draft", "needs_review", "rejected", "in_review"})
    void explicitUnreleasedStatusPreventsSelection(String status) {
        var exam = task();
        exam.setReviewStatus(status);
        assertThat(ExamTaskReadiness.isReady(exam)).isFalse();
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\n\t"})
    void taskAndSolutionMustBothBePresent(String content) {
        var noTask = task();
        noTask.setTaskContent(content);
        assertThat(ExamTaskReadiness.isReady(noTask)).isFalse();
        var noSolution = task();
        noSolution.setSolutionContent(content);
        assertThat(ExamTaskReadiness.isReady(noSolution)).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "Eine materialgestützte J10-Übungsaufgabe für die ausgewählten Lernziele.",
            "Eine integrative Sek-I-Abschlussaufgabe zum Themenbereich.",
            "Diese Übungsaufgabe verbindet die ausgewählten Themen.",
            "Beurteile den Zusammenhang."
    })
    void prosePlaceholdersDoNotBecomeReadyFromHavingAScoringShell(String content) {
        var exam = task();
        exam.setTaskContent(content);
        exam.setSolutionContent("Die Lösung zeigt den erwarteten Zusammenhang.");
        assertThat(ExamTaskReadiness.isReady(exam)).isFalse();
    }

    @Test void concreteSubtasksKeepTheirLegitimateTaskWording() {
        var exam = task();
        exam.setTaskContent("1. Diese Übungsaufgabe verbindet mehrere Darstellungen: Berechne 2 + 3.");
        exam.setSolutionContent("Die Lösung zeigt 2 + 3 = 5.");
        assertThat(ExamTaskReadiness.isReady(exam)).isTrue();
    }

    @ParameterizedTest
    @MethodSource("missingScoringStructure")
    void readinessRequiresTheExistingScoringStructure(Consumer<ExamData> remove) {
        var exam = task();
        remove.accept(exam);
        assertThat(ExamTaskReadiness.isReady(exam)).isFalse();
    }

    static Stream<Consumer<ExamData>> missingScoringStructure() {
        return Stream.of(
                exam -> exam.setScoring(null),
                exam -> exam.getScoring().setMaxPoints(0),
                exam -> exam.getScoring().setPassingPoints(0),
                exam -> exam.getScoring().setSteps(null),
                exam -> exam.getScoring().setSteps(List.of()));
    }

    @Test void aMissingTaskObjectIsUnavailable() {
        assertThat(ExamTaskReadiness.isReady(null)).isFalse();
    }

    private static ExamData task() {
        var exam = new ExamData();
        exam.setTaskContent("1. Berechne 2 + 3.");
        exam.setSolutionContent("Das Ergebnis ist 5.");
        var scoring = new ExamData.Scoring();
        scoring.setMaxPoints(10);
        scoring.setPassingPoints(6);
        var step = new ExamData.Step();
        step.setId("answer");
        step.setPoints(10);
        step.setDescription("Richtiges Ergebnis mit Rechenweg.");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        return exam;
    }
}
