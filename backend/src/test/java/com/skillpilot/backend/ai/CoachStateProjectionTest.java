package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.connectors.claude.v1.mcp.ClaudeV1CoachContextProjector;
import com.skillpilot.backend.connectors.gemini.v1.mcp.GeminiV1CoachContextProjector;
import com.skillpilot.backend.landscape.ExamData;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CoachStateProjectionTest {

    private final CoachStateProjection projection = new CoachStateProjection("https://skillpilot.test/");

    @Test
    void voluntaryChoiceKeepsItsFailureAndDoesNotBecomeRequiredFrontierOrActiveWork() {
        var raw = VoluntaryLearningChoiceTestFixture.choice("Unchanged complete goal description.");
        var state = projection.project(raw);
        assertThat(CoachStateProjection.isVoluntaryLearningChoice(state)).isTrue();
        assertThat(state.frontier()).isEmpty();
        assertThat(state.activeGoal()).isNull();
        assertThat(state.stateMachine().goalOptions()).singleElement().satisfies(goal -> {
            assertThat(goal.title()).isEqualTo("Goal A");
            assertThat(goal.description()).isEqualTo("Unchanged complete goal description.");
            assertThat(goal.reason()).contains("Freiwillig");
            assertThat(goal.examData()).isNull();
        });
        assertThat(state.levelCompletion()).isEqualTo(raw.levelCompletion());
        assertThat(state.levelCompletion().complete()).isNull();
        assertThat(state.levelCompletion().waivedTargetGoalIds()).isEmpty();
    }

    @Test
    void completeExisting632aTaskKeepsBothGivensAcrossSharedProvidersAndVisibleReaders() throws Exception {
        String id = "632a3837-7381-5701-9cfa-4ae15ccae8ba";
        var path = java.nio.file.Path.of("../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
        if (!java.nio.file.Files.exists(path)) {
            path = java.nio.file.Path.of("curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
        }
        var mapper = new ObjectMapper();
        var canonical = mapper.readTree(path.toFile());
        var originalGoal = java.util.stream.StreamSupport.stream(canonical.get("goals").spliterator(), false)
                .filter(goal -> id.equals(goal.get("id").asText())).findFirst().orElseThrow();
        var realExam = mapper.treeToValue(originalGoal.get("examData"), ExamData.class);
        var active = new FrontierGoal(id, originalGoal.get("title").asText(), originalGoal.get("description").asText(),
                "atomic", "exam", null, "test", List.of("ExamTask"), List.of(), null, null, null, realExam, true);
        String rawTask = active.examData().getTaskContent();
        String before = mapper.writeValueAsString(active.examData());
        assertThat(active.examData().getTaskContentEn()).isNull();
        String body = projection.projectReleasedEvaluationContent(rawTask
                .replace("![Gegebener Funktionsgraph f](/assets/assessment-materials/mathematik/" + id + "/given-function.svg)", "")
                .replace("![Gegebener Ableitungsgraph q Strich](/assets/assessment-materials/mathematik/" + id + "/given-derivative.svg)", "")
                .replaceAll("(?m)^\\s*$\\n?", "").trim());
        String header = "IMAGE_PATH: /ai-assets/assessment-materials/mathematik/" + id + "/given-function.svg\n"
                + "IMAGE_PATH: /ai-assets/assessment-materials/mathematik/" + id + "/given-derivative.svg\n\n";
        var source = new UnifiedLearnerStateResponse(
                "private-learner", null, List.of(), new LearnerGoals(List.of(active), 0, 1, null, null, false),
                List.of("teachActiveGoal"), List.of(), Set.of(), "learning", active,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), active));
        var facade = mock(CoachToolFacade.class);
        when(facade.getLearnerState("private-learner")).thenReturn(source);
        when(facade.getSessionState("session-token")).thenReturn(source);
        when(facade.getPersonalizationPlan("private-learner")).thenReturn(PersonalizationPlan.complete(List.of()));
        var claude = new ClaudeV1CoachContextProjector(projection, facade, "https://skillpilot.test");
        var gemini = new GeminiV1CoachContextProjector(projection, facade, "https://skillpilot.test");

        assertThat(projection.project(source).activeGoal().examData().getTaskContent()).isEqualTo(header + body);
        for (var context : List.of(claude.projectContext("private-learner", 1, "de"),
                gemini.projectContext("private-learner", 1, "de"))) {
            var exam = (Map<?, ?>) ((Map<?, ?>) context.get("activeGoal")).get("examData");
            assertThat(exam.get("taskDe")).isEqualTo(header + body);
            assertThat(exam.get("maxPoints")).isEqualTo(12.0);
            assertThat(mapper.writeValueAsString(context)).doesNotContain(
                    "solutionContent", "passingPoints", "sourceArtifactPath", "scoring");
        }
        var openai = new com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachContextProjector(
                projection, "https://skillpilot.test").project(source, PersonalizationPlan.complete(List.of()), true, "de");
        assertThat(openai.activeGoal().exam().taskContent()).isEqualTo(body);
        assertThat(openai.activeGoal().exam().hasImage()).isTrue();
        assertThat(openai.activeGoal().exam().maxPoints()).isEqualTo(12.0);
        var visible = new com.skillpilot.backend.ai.visiblesession.VisibleSessionService(facade, "https://skillpilot.test")
                .getState("session-token", "de");
        assertThat(visible.activeGoal().examData().taskContent()).isEqualTo(body);
        assertThat(visible.activeGoal().examData().hasImage()).isTrue();
        assertThat(visible.activeGoal().examData().maxPoints()).isEqualTo(12.0);
        assertThat(mapper.writeValueAsString(openai)).doesNotContain("IMAGE_PATH:", "solutionContent", "passingPoints");
        assertThat(mapper.writeValueAsString(visible)).doesNotContain("IMAGE_PATH:", "solutionContent", "passingPoints");
        assertThat(mapper.writeValueAsString(active.examData())).isEqualTo(before);
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {"task", "bc60e300-96be-599a-89b6-8fcca380803d", "68a262fc-43f4-5d23-af30-853870bfd45b"})
    void activeExamPreservesBothLanguagesAndAllImagesWithoutEvaluation(String id) throws Exception {
        var active = releasedExam(id);
        String images = "![bad](http://[)\n![one](/assets/one.svg)\n![same](/assets/one.svg)\n![two](/assets/two.png)\n";
        active.examData().setTaskContent(images + "Aufgabe $x$.\nZweiter Teil.");
        active.examData().setTaskContentEn(images + "Task $x$.\nSecond part.");
        var source = new UnifiedLearnerStateResponse(null, null, List.of(active), null, List.of(), List.of(), Set.of(),
                "TEACHING", active, new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), active));

        var projected = projection.project(source);

        for (String task : List.of(projected.activeGoal().examData().getTaskContent(),
                projected.activeGoal().examData().getTaskContentEn())) {
            assertThat(task).startsWith("IMAGE_PATH: /ai-assets/one.svg\nIMAGE_PATH: /ai-assets/two.png\n\n")
                    .contains("\\(x\\)").doesNotContain("![", "http://[", "$x$");
            assertThat(task.indexOf("IMAGE_PATH:", task.indexOf("IMAGE_PATH:") + 1))
                    .isEqualTo("IMAGE_PATH: /ai-assets/one.svg\n".length());
            if (!"task".equals(id)) {
                assertThat(task).contains("**Prüfungsmodus – Mathematik LK (Analysis)**", "Wenn du abbrechen möchtest");
            }
        }
        assertThat(projected.frontier().get(0).examData()).isNull();
        assertThat(new ObjectMapper().writeValueAsString(projected)).doesNotContain(
                "secret-solution", "secret-rubric", "secret-step", "passingPoints", "sourceArtifactPath");
        assertThat(active.examData().getTaskContent()).isEqualTo(images + "Aufgabe $x$.\nZweiter Teil.");
    }

    @Test
    void projectRemovesIdentityAndProtectedExamEvaluationFromNormalCoachState() throws Exception {
        FrontierGoal releasedExam = releasedExam("exam-1");
        FrontierGoal draftExam = draftExam("exam-draft");
        UnifiedLearnerStateResponse source = new UnifiedLearnerStateResponse(
                "permanent-skillpilot-id",
                null,
                List.of(releasedExam, draftExam),
                new LearnerGoals(List.of(releasedExam), 1, 3, null, null, false),
                List.of("teachActiveGoal"),
                List.of("scope-1"),
                Set.of(new CopySource("private-copy-source", Instant.parse("2026-07-22T08:00:00Z"))),
                "learning",
                releasedExam,
                new StateMachineInfo(
                        "ACTIVE",
                        "teachActiveGoal",
                        List.of(releasedExam, draftExam),
                        List.of(),
                        releasedExam,
                        List.of()));

        UnifiedLearnerStateResponse projected = projection.project(source);

        assertThat(projected.skillpilotId()).isNull();
        assertThat(projected.copySources()).isEmpty();
        assertThat(projected.frontier()).extracting(FrontierGoal::id).containsExactly("exam-1");
        assertThat(projected.frontier().getFirst().examData()).isNull();
        assertThat(projected.goals().planned().getFirst().examData()).isNull();
        assertThat(projected.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .containsExactly("exam-1");
        assertThat(projected.stateMachine().goalOptions().getFirst().examData()).isNull();

        assertTaskOnlyExam(projected.activeGoal());
        assertTaskOnlyExam(projected.stateMachine().activeGoal());
        assertThat(projected.activeGoal().resourceLinks().get(0).url())
                .isEqualTo("https://skillpilot.test/ai-assets/reference.pdf");
        assertThat(projected.activeGoal().resourceLinks()).hasSize(1);
        assertThat(projected.activeGoal().resourceLinks()).noneMatch(link -> "goal-visualization".equals(link.type()));
        assertThat(projected.stateMachine().activeGoal().resourceLinks()).hasSize(1);
        assertThat(source.activeGoal().resourceLinks()).hasSize(2);

        String json = new ObjectMapper().writeValueAsString(projected);
        assertThat(json)
                .contains("\"maxPoints\":10.0")
                .doesNotContain(
                        "permanent-skillpilot-id",
                        "private-copy-source",
                        "private/exam-source.json",
                        "secret-solution",
                        "solutionContent",
                        "passingPoints",
                        "\"steps\"");

        assertThat(source.activeGoal().examData().getSolutionContent()).isEqualTo("secret-solution $x=2$");
        assertThat(source.activeGoal().examData().getScoring().getPassingPoints()).isEqualTo(6);
        assertThat(source.activeGoal().examData().getScoring().getSteps()).hasSize(1);
    }

    @Test
    void projectSuppressesAnUnreleasedActiveExamCompletely() {
        FrontierGoal draft = draftExam("exam-draft");
        UnifiedLearnerStateResponse source = new UnifiedLearnerStateResponse(
                null,
                null,
                List.of(draft),
                null,
                List.of(),
                List.of(),
                Set.of(),
                "learning",
                draft,
                new StateMachineInfo("ACTIVE", "teachActiveGoal", List.of(draft), List.of(), draft, List.of()));

        UnifiedLearnerStateResponse projected = projection.project(source);

        assertThat(projected.activeGoal().nodeKind()).isEqualTo("exam");
        assertThat(projected.activeGoal().examData()).isNull();
        assertThat(projected.stateMachine().activeGoal().examData()).isNull();
        assertThat(projected.frontier()).isEmpty();
        assertThat(projected.stateMachine().goalOptions()).isEmpty();
    }

    @Test
    void projectKeepsOnlyInternallyValidatedExamSummariesWithoutExposingTheProof() throws Exception {
        FrontierGoal validated = examSummary("exam-ready", true);
        FrontierGoal unvalidated = examSummary("exam-unvalidated", false);
        FrontierGoal staleProof = exam("exam-stale-proof", "needs_review", true);
        UnifiedLearnerStateResponse source = new UnifiedLearnerStateResponse(
                null,
                null,
                List.of(validated, unvalidated, staleProof),
                new LearnerGoals(List.of(), 0, 3, null, null, false),
                List.of("setActiveGoal"),
                List.of(),
                Set.of(),
                "frontier",
                null,
                new StateMachineInfo(
                        "FRONTIER",
                        "setActiveGoal",
                        List.of(validated, unvalidated, staleProof),
                        List.of(),
                        null,
                        List.of()));

        UnifiedLearnerStateResponse projected = projection.project(source);

        assertThat(projected.frontier())
                .extracting(FrontierGoal::id)
                .containsExactly("exam-ready");
        assertThat(projected.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .containsExactly("exam-ready");
        assertThat(projected.frontier().getFirst().examData()).isNull();
        assertThat(new ObjectMapper().writeValueAsString(projected))
                .doesNotContain(
                        "examReadyForSelection",
                        "selectionGoalIds",
                        "taskContent",
                        "solutionContent",
                        "passingPoints");
    }

    @Test
    void projectReleasedEvaluationContentOnlyNormalizesAuthorizedContent() {
        String projected = projection.projectReleasedEvaluationContent(
                "Siehe [Material](/assets/exam.pdf). Lösung: $x=2$. $$y=3$$");

        assertThat(projected)
                .contains("https://skillpilot.test/ai-assets/exam.pdf")
                .contains("\\(x=2\\)")
                .contains("\\[\ny=3\n\\]")
                .doesNotContain("$x=2$", "$$y=3$$");
    }

    @Test
    void requiredSvgKeepsTheSharedImageHandoffAndTaskOnlyBoundaryForClaudeAndGemini() throws Exception {
        var active = releasedExam("hyperbola-task");
        String body = "1. Bestimme die Funktionsgleichung.\n2. Begründe den Verlauf.";
        String image = "/assets/assessment-materials/mathematik/hyperbola.svg";
        String task = "![Hyperbel](" + image + ")\n" + body;
        active.examData().setTaskContent(task);
        active.examData().setTaskContentEn(task);
        var source = new UnifiedLearnerStateResponse(
                "private-learner", null, List.of(), new LearnerGoals(List.of(active), 0, 1, null, null, false),
                List.of("teachActiveGoal"), List.of(), Set.of(), "learning", active,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), active));
        var facade = mock(CoachToolFacade.class);
        when(facade.getLearnerState("private-learner")).thenReturn(source);
        when(facade.getSessionState("session-token")).thenReturn(source);
        when(facade.showGoalVisualizationsInChat("private-learner")).thenReturn(true);
        when(facade.getPersonalizationPlan("private-learner")).thenReturn(PersonalizationPlan.complete(List.of()));
        var claude = new ClaudeV1CoachContextProjector(projection, facade, "https://skillpilot.test");
        var gemini = new GeminiV1CoachContextProjector(projection, facade, "https://skillpilot.test");
        String projectedTask = "IMAGE_PATH: /ai-assets/assessment-materials/mathematik/hyperbola.svg\n\n" + body;

        for (var context : List.of(claude.projectContext("private-learner", 1, "de"),
                gemini.projectContext("private-learner", 1, "de"))) {
            assertThat(context).doesNotContainKey("goalVisualization");
            var goal = (Map<?, ?>) context.get("activeGoal");
            var exam = (Map<?, ?>) goal.get("examData");
            assertThat(exam.get("taskDe")).isEqualTo(projectedTask);
            assertThat(exam.get("taskEn")).isEqualTo(projectedTask);
            assertThat(exam.get("maxPoints")).isEqualTo(10.0);
            assertThat(new ObjectMapper().writeValueAsString(context)).doesNotContain(
                    "secret-solution", "secret-rubric", "secret-step", "private/exam-source.json", "passingPoints");
        }
        var openai = new com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachContextProjector(
                projection, "https://skillpilot.test").project(source, PersonalizationPlan.complete(List.of()), true, "de");
        assertThat(openai.goalVisualization()).isNull();
        assertThat(openai.activeGoal().exam().hasImage()).isTrue();
        assertThat(openai.activeGoal().exam().taskContent()).isEqualTo(body);
        var visible = new com.skillpilot.backend.ai.visiblesession.VisibleSessionService(facade, "https://skillpilot.test")
                .getState("session-token", "de");
        assertThat(visible.activeGoal().examData().hasImage()).isTrue();
        assertThat(visible.activeGoal().examData().taskContent()).isEqualTo(body);
        assertThat(visible.resources()).noneMatch(resource -> "goal-visualization".equals(resource.type()));
        assertThat(active.examData().getTaskContent()).isEqualTo(task);
        assertThat(active.examData().getSolutionContent()).contains("secret-solution");
    }

    @Test
    void assessmentExecutionSuppressesOnlyWorkedGoalVisualizationsAndKeepsTaskMedia() {
        FrontierGoal raw = releasedExam("same-curricular-id");
        var state = new UnifiedLearnerStateResponse(null, null, List.of(), null, List.of(),
                List.of(), Set.of(), "TEACHING", raw,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), raw));
        var safe = projection.project(state).activeGoal();
        assertTaskOnlyExam(safe);
        assertThat(safe.resourceLinks()).singleElement().satisfies(link ->
                assertThat(link.url()).isEqualTo("https://skillpilot.test/ai-assets/reference.pdf"));
        assertThat(raw.resourceLinks()).hasSize(2);
        FrontierGoal ordinary = new FrontierGoal(raw.id(), raw.title(), raw.description(), raw.type(),
                "tutor", "curricularAtomic", raw.reason(), raw.tags(), raw.resourceLinks(),
                raw.sourceRef(), raw.sourceLicense(), raw.sourceLicenseUrl(), null, false);
        var ordinaryState = new UnifiedLearnerStateResponse(null, null, List.of(), null, List.of(),
                List.of(), Set.of(), "TEACHING", ordinary,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), ordinary));
        assertThat(projection.project(ordinaryState).activeGoal().resourceLinks()).hasSize(2);
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {"practiceAssessment", "assessment"})
    void compatibleAssessmentKindsDoNotOfferWorkedLearningVisualizations(String semanticKind) {
        FrontierGoal raw = releasedExam("legacy-assessment");
        FrontierGoal legacy = new FrontierGoal(raw.id(), raw.title(), raw.description(), raw.type(),
                "tutor", semanticKind, raw.reason(), raw.tags(), raw.resourceLinks(),
                raw.sourceRef(), raw.sourceLicense(), raw.sourceLicenseUrl(), null, true);
        var state = new UnifiedLearnerStateResponse(null, null, List.of(), null, List.of(),
                List.of(), Set.of(), "TEACHING", legacy,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), legacy));
        assertThat(projection.project(state).activeGoal().resourceLinks()).singleElement().satisfies(link ->
                assertThat(link.type()).isEqualTo("reference"));
    }

    private static void assertTaskOnlyExam(FrontierGoal goal) {
        assertThat(goal.examData()).isNotNull();
        assertThat(goal.examData().getTaskContent())
                .startsWith("IMAGE_PATH: /ai-assets/exam.png")
                .contains("\\(x\\)");
        assertThat(goal.examData().getTaskContentEn()).contains("\\(x\\)");
        assertThat(goal.examData().getSolutionContent()).isNull();
        assertThat(goal.examData().getSolutionContentEn()).isNull();
        assertThat(goal.examData().getSourceArtifactPath()).isNull();
        assertThat(goal.examData().getScoring()).isNotNull();
        assertThat(goal.examData().getScoring().getMaxPoints()).isEqualTo(10);
        assertThat(goal.examData().getScoring().getPassingPoints()).isZero();
        assertThat(goal.examData().getScoring().getSteps()).isNull();
    }

    private static FrontierGoal releasedExam(String id) {
        return exam(id, "released");
    }

    private static FrontierGoal draftExam(String id) {
        return exam(id, "needs_review");
    }

    private static FrontierGoal examSummary(String id, boolean readyForSelection) {
        return new FrontierGoal(
                id,
                "Prüfungsaufgabe",
                "Bearbeite die freigegebene Prüfungsaufgabe.",
                "atomic",
                "exam",
                null,
                "frontier",
                List.of("ExamTask"),
                List.of(),
                null,
                null,
                null,
                null,
                readyForSelection);
    }

    private static FrontierGoal exam(String id, String reviewStatus) {
        return exam(id, reviewStatus, false);
    }

    private static FrontierGoal exam(String id, String reviewStatus, boolean readyForSelection) {
        ExamData exam = new ExamData();
        exam.setReviewStatus(reviewStatus);
        exam.setSourceArtifactPath("private/exam-source.json");
        exam.setTaskContent("![Material](/assets/exam.png)\n\nSolve $x$.");
        exam.setTaskContentEn("Compute $x$.");
        exam.setSolutionContent("secret-solution $x=2$");
        exam.setSolutionContentEn("secret-solution-en $x=2$");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(10);
        scoring.setPassingPoints(6);
        ExamData.Step step = new ExamData.Step();
        step.setId("secret-step");
        step.setPoints(10);
        step.setDescription("secret-rubric");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        return new FrontierGoal(
                id,
                "Exam $x$",
                "Description $x$",
                "atomic",
                "exam",
                null,
                "test",
                List.of(),
                List.of(
                        new GoalSourceLink(
                                "reference", "Reference", "/assets/reference.pdf", "document",
                                "SkillPilot", List.of(), null, "de", null, id, null, null, "released"),
                        new GoalSourceLink(
                                "goal-visualization", "Visualization", "/assets/goal-visualizations/mathematik/" + id + "/" + id + ".jpg", "image",
                                "SkillPilot", List.of(), null, "de", null, id, "primary", "Diagram", "released")),
                null,
                null,
                null,
                exam,
                readyForSelection);
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {"de", "en"})
    void retainedAssessmentStartConfirmationIsExplicitAcrossAllFourReaders(String language) {
        FrontierGoal active = exam("current-task", "released", true);
        var state = new UnifiedLearnerStateResponse("learner", null, List.of(),
                new LearnerGoals(List.of(active), 0, 1, null, null, false), List.of("setActiveGoal"),
                List.of(), Set.of(), "TEACHING", active,
                new StateMachineInfo("TEACHING", "setActiveGoal", List.of(active), List.of(), active));
        assertThat(CoachStateProjection.requiresAssessmentStartConfirmation(projection.project(state))).isTrue();
        var facade = mock(CoachToolFacade.class);
        when(facade.getLearnerState("learner")).thenReturn(state);
        when(facade.getSessionState("token")).thenReturn(state);
        when(facade.getPersonalizationPlan("learner")).thenReturn(PersonalizationPlan.complete(List.of()));
        String instruction = CoachStateProjection.assessmentStartConfirmationInstruction(language);
        var claude = new ClaudeV1CoachContextProjector(projection, facade, "https://skillpilot.test");
        var gemini = new GeminiV1CoachContextProjector(projection, facade, "https://skillpilot.test");
        for (var context : List.of(claude.projectContext("learner", 1, language),gemini.projectContext("learner",1,language))) {
            assertThat(context.get("instruction")).isEqualTo(instruction);
            assertThat(context.get("presentationInstruction")).isEqualTo(instruction);
            assertThat(context).doesNotContainKey("toolPreparationInstruction");
        }
        var openai = new com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachContextProjector(projection,"https://skillpilot.test")
                .project(state,PersonalizationPlan.complete(List.of()),false,language);
        assertThat(openai.instruction()).isEqualTo(instruction);
        var visible = new com.skillpilot.backend.ai.visiblesession.VisibleSessionService(facade,"https://skillpilot.test")
                .getState("token",language);
        assertThat(visible.instruction()).isEqualTo(instruction);
        assertThat(visible.requiredAction()).isEqualTo("setActiveGoal");
        assertThat(projection.project(state).activeGoal().examData().getSolutionContent()).isNull();
    }
}
