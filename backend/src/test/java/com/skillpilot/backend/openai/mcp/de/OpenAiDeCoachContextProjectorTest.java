package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class OpenAiDeCoachContextProjectorTest {

    @Test
    void exposesTrustedVisualizationForMatchingActiveAtomicGoal() {
        OpenAiDeCoachContextProjector projector = new OpenAiDeCoachContextProjector(
                new CoachStateProjection("https://skillpilot.test"),
                "https://skillpilot.test");
        GoalSourceLink image = new GoalSourceLink(
                "goal-visualization",
                "Visualisierung: Energie",
                "/assets/goal-visualizations/physik/goal-with-image/goal-with-image.jpg",
                "image",
                "SkillPilot",
                List.of(),
                "Didaktische Orientierung",
                "de",
                "AI-generated, SkillPilot-curated",
                "goal-with-image",
                "primary",
                "Skizze zur Energieerhaltung.",
                "approved");

        OpenAiDeCoachContext context = projector.project(goalVisualizationState("atomic", image));

        assertThat(context.goalVisualization()).isEqualTo(
                new OpenAiDeCoachContext.GoalVisualization(
                        "goal-with-image",
                        "Energie erhalten",
                        "Die lernende Person kann Energieerhaltung erklären.",
                        "https://skillpilot.test/assets/goal-visualizations/physik/"
                                + "goal-with-image/goal-with-image.jpg",
                        "Skizze zur Energieerhaltung.",
                        "https://skillpilot.test/?l=curriculum-public-id&goal=goal-with-image"));
        assertThat(context.nextAllowedTools())
                .contains(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);
        assertThat(context.resources())
                .singleElement()
                .satisfies(resource -> {
                    assertThat(resource.url())
                            .isEqualTo("https://skillpilot.test/?l=curriculum-public-id&goal=goal-with-image");
                    assertThat(resource.requiresCockpit()).isTrue();
                });
    }

    @Test
    void omitsVisualizationAndRenderToolWhenTheLearnerPreferenceIsDisabled() {
        OpenAiDeCoachContextProjector projector = new OpenAiDeCoachContextProjector(
                new CoachStateProjection("https://skillpilot.test"),
                "https://skillpilot.test");
        GoalSourceLink image = new GoalSourceLink(
                "goal-visualization",
                "Visualisierung: Energie",
                "/assets/goal-visualizations/physik/goal-with-image/goal-with-image.jpg",
                "image",
                "SkillPilot",
                List.of(),
                "Didaktische Orientierung",
                "de",
                "AI-generated, SkillPilot-curated",
                "goal-with-image",
                "primary",
                "Skizze zur Energieerhaltung.",
                "approved");

        OpenAiDeCoachContext context = projector.project(
                goalVisualizationState("atomic", image),
                PersonalizationPlan.complete(List.of()),
                false);

        assertThat(context.goalVisualization()).isNull();
        assertThat(context.nextAllowedTools())
                .doesNotContain(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);
    }

    @Test
    void omitsVisualizationForClustersMismatchedGoalIdsAndUntrustedAssetPaths() {
        OpenAiDeCoachContextProjector projector = new OpenAiDeCoachContextProjector(
                new CoachStateProjection("https://skillpilot.test"),
                "https://skillpilot.test");
        GoalSourceLink mismatched = new GoalSourceLink(
                "goal-visualization",
                "Falsche Zuordnung",
                "/assets/goal-visualizations/physik/other/other.jpg",
                "image",
                "SkillPilot",
                List.of(),
                null,
                "de",
                null,
                "other-goal",
                "primary",
                "Falsche Zuordnung",
                "approved");
        GoalSourceLink external = new GoalSourceLink(
                "goal-visualization",
                "Externes Bild",
                "https://untrusted.example/image.jpg",
                "image",
                "External",
                List.of(),
                null,
                "de",
                null,
                "goal-with-image",
                "primary",
                "Externes Bild",
                "approved");
        GoalSourceLink unrelatedRootPath = new GoalSourceLink(
                "goal-visualization",
                "Falscher Asset-Bereich",
                "/assets/private/goal-with-image.jpg",
                "image",
                "SkillPilot",
                List.of(),
                null,
                "de",
                null,
                "goal-with-image",
                "primary",
                "Falscher Asset-Bereich",
                "approved");
        GoalSourceLink traversal = new GoalSourceLink(
                "goal-visualization",
                "Pfadnavigation",
                "/assets/goal-visualizations/../private/goal-with-image.jpg",
                "image",
                "SkillPilot",
                List.of(),
                null,
                "de",
                null,
                "goal-with-image",
                "primary",
                "Pfadnavigation",
                "approved");
        GoalSourceLink encodedTraversal = new GoalSourceLink(
                "goal-visualization",
                "Kodierte Pfadnavigation",
                "/assets/goal-visualizations/%2e%2e/private/goal-with-image.jpg",
                "image",
                "SkillPilot",
                List.of(),
                null,
                "de",
                null,
                "goal-with-image",
                "primary",
                "Kodierte Pfadnavigation",
                "approved");

        assertThat(projector.project(goalVisualizationState("cluster", mismatched)).goalVisualization())
                .isNull();
        assertThat(projector.project(goalVisualizationState("atomic", mismatched)).goalVisualization())
                .isNull();
        assertThat(projector.project(goalVisualizationState("atomic", external)).goalVisualization())
                .isNull();
        assertThat(projector.project(goalVisualizationState("atomic", unrelatedRootPath)).goalVisualization())
                .isNull();
        assertThat(projector.project(goalVisualizationState("atomic", traversal)).goalVisualization())
                .isNull();
        assertThat(projector.project(goalVisualizationState("atomic", encodedTraversal)).goalVisualization())
                .isNull();
    }

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
    void motivationGoalUsesNonAssessingOrientationModeAndCompletionEvidence() {
        OpenAiDeCoachContextProjector projector = new OpenAiDeCoachContextProjector(
                new CoachStateProjection("https://skillpilot.test"),
                "https://skillpilot.test");

        OpenAiDeCoachContext context = projector.project(motivationState(
                "orientation",
                List.of("Motivation", "Orientation"),
                "orientActiveGoal"));

        assertThat(context.interactionMode()).isEqualTo("orientation");
        assertThat(context.activeGoal().semanticKind()).isEqualTo("orientation");
        assertThat(context.nextAllowedTools())
                .contains(OpenAiDeV1McpContractAdapter.SET_MASTERY);
        assertThat(context.instruction())
                .contains("Möglichkeiten", "positive", "neugierig", "keine Fachkompetenz")
                .doesNotContain("zwei unabhängigen Checks", "Transfer", "Feynman");
        assertThat(context.policies())
                .anySatisfy(policy -> assertThat(policy)
                        .contains("Prüfe weder Vorwissen", "Detailwissen")
                        .contains("keine Wissens-, Übungs-, Transfer-, Recall- oder Prüfungsaufgabe"))
                .anySatisfy(policy -> assertThat(policy)
                        .contains("sichtbaren Reaktion", "Interessenäußerung", "Weiterbereitschaft")
                        .contains("niemals fachliche Kompetenz"));
        assertThat(String.join("\n", context.policies()))
                .doesNotContain("Speichere Mastery nur nach zwei unabhängigen Checks");
    }

    @Test
    void authoritativeNonOrientationSemanticKindOverridesLegacyMotivationTags() {
        OpenAiDeCoachContextProjector projector = new OpenAiDeCoachContextProjector(
                new CoachStateProjection("https://skillpilot.test"),
                "https://skillpilot.test");

        OpenAiDeCoachContext context = projector.project(motivationState(
                "curricularAtomic",
                List.of("Motivation", "Orientation"),
                "teachActiveGoal"));

        assertThat(context.interactionMode()).isEqualTo("chat");
        assertThat(context.activeGoal().semanticKind()).isEqualTo("curricularAtomic");
        assertThat(context.instruction()).contains("zwei unabhängigen Checks");
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
                        .contains("Fehlt ein freigegebener Link, gib keinen Link aus")
                        .doesNotContain("verwende nur https://skillpilot.com"))
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

    private static UnifiedLearnerStateResponse motivationState(
            String semanticKind,
            List<String> tags,
            String requiredAction) {
        FrontierGoal active = new FrontierGoal(
                "motivation-public-id",
                "Warum Mathematik? – Denken, Muster & Zukunft",
                "Ein Überblick über Möglichkeiten von Analysis bis Stochastik.",
                "atomic",
                null,
                semanticKind,
                "Orientation required",
                tags,
                List.of(),
                null,
                null,
                null,
                null);
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-public-id",
                "Mathematik",
                "",
                "DE",
                "",
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
                List.of("setMastery"),
                List.of(),
                Set.of(),
                "learning",
                active,
                new StateMachineInfo("TEACHING", requiredAction, List.of(active), List.of(), active));
    }

    private static UnifiedLearnerStateResponse goalVisualizationState(
            String goalType,
            GoalSourceLink image) {
        FrontierGoal active = new FrontierGoal(
                "goal-with-image",
                "Energie erhalten",
                "Die lernende Person kann Energieerhaltung erklären.",
                goalType,
                null,
                "frontier",
                List.of(),
                List.of(image),
                null,
                null,
                null,
                null);
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-public-id",
                "Physik",
                "",
                "DE",
                "",
                "school",
                "Physik",
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
                Set.of(),
                "learning",
                active,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), active));
    }
}
