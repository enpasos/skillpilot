package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class OpenAiDeCoachContextProjectorTest {

    @Test
    void personalizationOrientationUsesConfirmedCurriculumAndAllAuthoredOpenQuestionsInOrder()
            throws Exception {
        OpenAiDeCoachContextProjector projector = new OpenAiDeCoachContextProjector(
                new CoachStateProjection("https://skillpilot.test"),
                "https://skillpilot.test");
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-orbit",
                "Werkstatt Orbit",
                "",
                "DE",
                "",
                "continuing-education",
                "Navigation",
                "de",
                List.of());
        PersonalizationPlan plan = PersonalizationPlan.selection(
                "stage-entry",
                "Einstieg",
                "group-setting",
                "Welche Lernumgebung passt?",
                "group-setting:curriculum-orbit",
                1,
                1,
                0,
                List.of(),
                List.of(),
                List.of(
                        new PersonalizationPlan.DecisionPrompt(
                                "Einstieg",
                                "Welche Lernumgebung passt?"),
                        new PersonalizationPlan.DecisionPrompt(
                                "Vertiefung",
                                "Welcher Schwerpunkt passt?"),
                        new PersonalizationPlan.DecisionPrompt(
                                "Abschluss",
                                "Welches Zielformat passt?")));

        OpenAiDeCoachContext.Orientation orientation =
                projector.personalizationOrientation(curriculum, plan);

        assertThat(orientation.establishedContext())
                .isEqualTo("Du bist im Curriculum „Werkstatt Orbit“.");
        assertThat(orientation.openQuestions()).containsExactly(
                new OpenAiDeCoachContext.OpenQuestion(
                        "Einstieg",
                        "Welche Lernumgebung passt?"),
                new OpenAiDeCoachContext.OpenQuestion(
                        "Vertiefung",
                        "Welcher Schwerpunkt passt?"),
                new OpenAiDeCoachContext.OpenQuestion(
                        "Abschluss",
                        "Welches Zielformat passt?"));
        assertThat(new ObjectMapper().writeValueAsString(orientation))
                .doesNotContain("Bundesland", "Fach");
    }

    @Test
    void imageExamRemovesPrivatePathAndRequiresExactCockpitLinkBeforeTask() throws Exception {
        OpenAiDeCoachContextProjector projector = new OpenAiDeCoachContextProjector(
                new CoachStateProjection("https://skillpilot.test"),
                "https://skillpilot.test");

        OpenAiDeCoachContext context = projector.project(imageExamState());

        assertThat(context.activeGoal().exam().hasImage()).isTrue();
        assertThat(context.activeGoal().exam().taskContent()).isEqualTo("Sichtbare Aufgabe mit Abbildung");
        assertThat(context.activeGoal().cockpitUrl())
                .isEqualTo("https://skillpilot.test/?l=curriculum-public-id&goal=exam-public-id");
        assertThat(context.instruction())
                .contains("notwendige Aufgabenabbildung")
                .contains("activeGoal.cockpitUrl")
                .contains("wortgetreu");
        assertThat(context.policies())
                .anySatisfy(policy -> assertThat(policy)
                        .contains("benötigt eine Abbildung")
                        .contains("activeGoal.cockpitUrl")
                        .contains("erfinde"));
        assertThat(new ObjectMapper().writeValueAsString(context))
                .doesNotContain("/private/exam-image.png", "IMAGE_PATH");
    }

    private static UnifiedLearnerStateResponse imageExamState() {
        ExamData exam = new ExamData();
        exam.setReviewStatus("released");
        exam.setTaskContent("IMAGE_PATH: /private/exam-image.png\n\nSichtbare Aufgabe mit Abbildung");
        exam.setSolutionContent("NICHT IM KONTEXT");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(4);
        scoring.setPassingPoints(2);
        ExamData.Step step = new ExamData.Step();
        step.setId("image-task");
        step.setPoints(4);
        step.setDescription("Aufgabe fachlich korrekt bearbeiten.");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        FrontierGoal active = new FrontierGoal(
                "exam-public-id",
                "Prüfungsaufgabe mit Abbildung",
                "Bearbeite die Aufgabe selbstständig.",
                "atomic",
                "exam",
                "frontier",
                List.of(),
                List.of(),
                null,
                null,
                null,
                exam);
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-public-id",
                "Mathematik Oberstufe Hessen",
                "",
                "DE",
                "HE",
                "school",
                "Mathematik",
                "de",
                List.of());
        LearnerGoals goals = new LearnerGoals(
                List.of(active),
                0,
                1,
                new GoalStats(0, 1),
                new GoalStats(0, 1),
                false);
        return new UnifiedLearnerStateResponse(
                "SECRET-LEARNER-ID",
                curriculum,
                List.of(active),
                goals,
                List.of("teachActiveGoal"),
                List.of(),
                Set.of(new CopySource("SECRET-COPY-SOURCE", Instant.parse("2026-07-22T00:00:00Z"))),
                "learning",
                active,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), active));
    }
}
