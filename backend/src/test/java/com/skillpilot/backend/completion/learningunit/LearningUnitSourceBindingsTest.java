package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.completion.CompletionCompilationException;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.GoalPlacement;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ProgramUnit;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class LearningUnitSourceBindingsTest {
    @Test
    void activeContractMatchesExactSourcePlacementMeaningAndNormalTask() {
        var fixture = fixture();
        LearningUnitSourceBindings.validateActiveSource(fixture.definition(), fixture.source(), fixture.goals(), viewDigests());
        assertThat(new LearningUnitCompiler().compile(List.of(fixture.definition())).ownedGoalIds()).containsExactlyInAnyOrder("A", "Q");
    }

    @Test
    void labelingAnOrdinaryGoalAsOrientationCannotCreateZeroWorkCredit() {
        var fixture = fixture();
        var original = fixture.definition();
        var mislabeled = new LearningUnitDefinition(original.schemaVersion(), original.semantics(), original.contractId(),
                original.revision(), original.sourceBinding(), original.title(), original.promise(), original.introduction(),
                original.ownGoalIds(), original.requiredChildContractRefs(), original.ownAssessmentGoalIds(), original.ownRecallGoalIds(),
                List.of("A"), original.ownGoalMeanings(), original.ownResolvedKinds(), original.ownGoalMeaningDigests(), original.atomicPrerequisites(),
                original.assessmentClaims(), original.reviewRef());
        assertCode("INVALID_UNIT_PARTITION", () -> new LearningUnitCompiler().compile(List.of(mislabeled)));
        assertCode("INVALID_UNIT_PARTITION", () -> LearningUnitSourceBindings.validateActiveSource(mislabeled, fixture.source(), fixture.goals(), viewDigests()));
    }

    @Test
    void changedMeaningTaskPlacementOrViewCannotActivateAnOldContract() {
        var meaning = fixture();
        meaning.goals().get("A").setDescription("A stronger competence");
        assertCode("GOAL_MEANING_CONFLICT", () -> LearningUnitSourceBindings.validateActiveSource(meaning.definition(), meaning.source(), meaning.goals(), viewDigests()));
        var task = fixture();
        task.goals().get("Q").getExamData().setTaskContent("An easier question");
        assertCode("STALE_ASSESSMENT_BINDING", () -> LearningUnitSourceBindings.validateActiveSource(task.definition(), task.source(), task.goals(), viewDigests()));
        var placement = fixture();
        placement.source().getGoalPlacements().getFirst().setAcquisition(false);
        assertCode("STALE_PLACEMENT_BINDING", () -> LearningUnitSourceBindings.validateActiveSource(placement.definition(), placement.source(), placement.goals(), viewDigests()));
        var view = fixture();
        assertCode("STALE_COMPOSITION_BINDING", () -> LearningUnitSourceBindings.validateActiveSource(view.definition(), view.source(), view.goals(), Map.of("view", "changed")));
    }

    @Test void activeSourceMustKeepItsCanonicalAssessmentCoverageClaim() {
        var fixture = fixture();
        fixture.goals().get("Q").getExamData().setCoveredGoalIds(List.of("A", "outside-support"));
        assertCode("ASSESSMENT_CLAIM_CONFLICT", () -> LearningUnitSourceBindings.validateActiveSource(
                fixture.definition(), fixture.source(), fixture.goals(), viewDigests()));
    }

    @Test void aNewCurrentViewDoesNotReviseTheUnchangedFrozenUnitMeaning() {
        var fixture = fixture();
        String immutable = LearningUnitSourceBindings.canonicalDigest(fixture.definition());
        assertCode("STALE_COMPOSITION_BINDING", () -> LearningUnitSourceBindings.validateActiveSource(
                fixture.definition(), fixture.source(), fixture.goals(), Map.of("view", "new-reviewed-view")));
        LearningUnitSourceBindings.validateCurrentUnit(fixture.definition(), fixture.source(), fixture.goals());
        assertThat(LearningUnitSourceBindings.canonicalDigest(fixture.definition())).isEqualTo(immutable);
    }

    @Test void explicitEmptyRequiredChildrenOverridesProgramNavigationParentage() {
        var fixture = fixture();
        var parent = fixture.source().getProgramUnits().getFirst();
        var metadata = parent.getLearningUnit();
        parent.setLearningUnit(new ProgramUnit.LearningUnitMetadata(metadata.contractId(), metadata.revision(),
                metadata.placementRevision(), metadata.promise(), metadata.introduction(), List.of()));
        var navigationalChild = new ProgramUnit();
        navigationalChild.setId("navigation-child"); navigationalChild.setParentUnitId(parent.getId());
        navigationalChild.setLearningUnit(new ProgramUnit.LearningUnitMetadata("child", "1", "p", Map.of(), Map.of()));
        fixture.source().setProgramUnits(List.of(parent, navigationalChild));
        LearningUnitSourceBindings.validateActiveSource(fixture.definition(), fixture.source(), fixture.goals(), viewDigests());
    }

    static Map<String, String> viewDigests() { return Map.of("view", LearningUnitSourceBindings.canonicalDigest(Map.of("viewId", "view"))); }

    static Fixture fixture() {
        LearningGoal a = goal("A", "curricularAtomic", "tutor");
        LearningGoal q = goal("Q", "practiceAssessment", "exam");
        q.setRequires(List.of("A"));
        ExamData exam = new ExamData();
        exam.setTaskContent("Explain A independently.");
        exam.setSolutionContent("The complete application of A.");
        exam.setCoveredGoalIds(List.of("A"));
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(10);
        scoring.setPassingPoints(10);
        ExamData.Step step = new ExamData.Step();
        step.setId("application");
        step.setPoints(10);
        step.setDescription("Independently applies every essential part of A.");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        q.setExamData(exam);
        Map<String, LearningGoal> goals = Map.of("A", a, "Q", q);
        Map<String, String> title = Map.of("de", "Anwenden", "en", "Application");
        Map<String, String> promise = Map.of("de", "Du kannst A anwenden.", "en", "You can apply A.");
        Map<String, String> introduction = Map.of("de", "A ist für diese Aufgabe nützlich.", "en", "A is useful for this task.");
        var definition = new LearningUnitDefinition(1, LearningUnitDefinition.SEMANTICS, "unit", "1",
                new LearningUnitDefinition.SourceBinding("math", "unit", "placements-1", viewDigests()),
                title, promise, introduction, List.of("A", "Q"), List.of(), List.of("Q"), List.of(), List.of(),
                Map.of("A", LearningUnitSourceBindings.meaning(a), "Q", LearningUnitSourceBindings.meaning(q)),
                Map.of("A", "ordinary", "Q", "assessment"),
                Map.of("A", LearningUnitSourceBindings.meaningDigest(a), "Q", LearningUnitSourceBindings.meaningDigest(q)),
                Map.of("A", List.of(), "Q", List.of("A")),
                Map.of("Q", new LearningUnitDefinition.AssessmentClaim(List.of("A"),
                        LearningUnitSourceBindings.canonicalDigest(Map.of("taskContent", exam.getTaskContent(), "solutionContent", exam.getSolutionContent())),
                        LearningUnitSourceBindings.canonicalDigest(scoring), "quality/review.md")), "quality/review.md");
        SkillLandscape source = new SkillLandscape();
        source.setLandscapeId("math");
        ProgramUnit unit = new ProgramUnit();
        unit.setId("unit");
        unit.setLearningUnit(new ProgramUnit.LearningUnitMetadata("unit", "1", "placements-1", promise, introduction));
        source.setProgramUnits(List.of(unit));
        source.setGoals(List.of(a, q));
        source.setGoalPlacements(List.of(placement("A"), placement("Q")));
        return new Fixture(definition, source, goals);
    }

    private static GoalPlacement placement(String id) {
        GoalPlacement placement = new GoalPlacement();
        placement.setGoalId(id);
        placement.setUnitId("unit");
        placement.setRelation("Q".equals(id) ? "assessed" : "primary");
        placement.setAcquisition(true);
        return placement;
    }

    private static LearningGoal goal(String id, String semanticKind, String nodeKind) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle("Goal " + id);
        goal.setDescription("Can apply " + id);
        goal.setType("atomic");
        goal.setSemanticKind(semanticKind);
        goal.setNodeKind(nodeKind);
        goal.setRequires(List.of());
        goal.setContains(List.of());
        return goal;
    }

    private static void assertCode(String code, Runnable action) {
        assertThatThrownBy(action::run).isInstanceOfSatisfying(CompletionCompilationException.class,
                error -> assertThat(error.code()).isEqualTo(code));
    }

    record Fixture(LearningUnitDefinition definition, SkillLandscape source, Map<String, LearningGoal> goals) { }
}
