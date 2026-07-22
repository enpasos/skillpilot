package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.landscape.ExamData;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class CoachStateProjectionTest {

    private final CoachStateProjection projection = new CoachStateProjection("https://skillpilot.test/");

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
        assertThat(projected.activeGoal().resourceLinks().get(1).url())
                .isEqualTo("/assets/private-visualization.png");

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
    void projectReleasedEvaluationContentOnlyNormalizesAuthorizedContent() {
        String projected = projection.projectReleasedEvaluationContent(
                "Siehe [Material](/assets/exam.pdf). Lösung: $x=2$. $$y=3$$");

        assertThat(projected)
                .contains("https://skillpilot.test/ai-assets/exam.pdf")
                .contains("\\(x=2\\)")
                .contains("\\[\ny=3\n\\]")
                .doesNotContain("$x=2$", "$$y=3$$");
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

    private static FrontierGoal exam(String id, String reviewStatus) {
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
                "test",
                List.of(),
                List.of(
                        new GoalSourceLink(
                                "reference", "Reference", "/assets/reference.pdf", "document",
                                "SkillPilot", List.of(), null, "de", null, id, null, null, "released"),
                        new GoalSourceLink(
                                "goal-visualization", "Visualization", "/assets/private-visualization.png", "image",
                                "SkillPilot", List.of(), null, "de", null, id, "primary", "Diagram", "released")),
                null,
                null,
                null,
                exam);
    }
}
