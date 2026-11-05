package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionCanonicalGraphResolver;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.landscape.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class LearningUnitRecursiveCatalogTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void archivedParentWaitsForLaterActiveChildAndKeepsItsOwnRecognition() throws Exception {
        var fixture = fixture(false);
        var catalog = LearningUnitCatalog.load(fixture.manifest(), fixture.files()::get, ignored -> {}, mapper);
        assertThat(catalog.quarantined()).isEmpty();
        assertThat(catalog.definitions()).hasSize(2);
        var result = new LearningUnitEvaluator().evaluate(catalog.compiled(), Set.of("P"));
        assertThat(result.recognizedGoalIds()).containsExactly("C").doesNotContain("A");
        assertThat(result.units().get(new LearningUnitDefinition.ContractRef("parent", "1")).complete()).isFalse();
        var complete = new LearningUnitEvaluator().evaluate(catalog.compiled(), Set.of("P", "Q"));
        assertThat(complete.recognizedGoalIds()).containsExactlyInAnyOrder("A", "C");
        assertThat(complete.units().get(new LearningUnitDefinition.ContractRef("parent", "1")).complete()).isTrue();
    }

    @Test void genuinelyUnknownChildQuarantinesParentWithoutWithdrawingValidChildResults() throws Exception {
        var fixture = fixture(true);
        var catalog = LearningUnitCatalog.load(fixture.manifest(), fixture.files()::get, ignored -> {}, mapper);
        assertThat(catalog.definitions()).singleElement().satisfies(unit -> assertThat(unit.contractId()).isEqualTo("unit"));
        assertThat(catalog.quarantined().values()).singleElement().asString().contains("MISSING_CHILD_CONTRACT");
        assertThat(new LearningUnitEvaluator().evaluate(catalog.compiled(), Set.of("P", "Q")).recognizedGoalIds()).containsExactly("A");
    }

    private LearningUnitCatalogTest.Archive fixture(boolean missingChild) throws Exception {
        var archive = new LearningUnitCatalogTest().archive("active");
        var childEntry = mapper.readValue(archive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        var child = mapper.readValue(archive.files().get(childEntry.path()), LearningUnitDefinition.class);
        var base = LearningUnitSourceBindingsTest.fixture();
        var c = goal("C"); var p = goal("P");
        p.setNodeKind("exam"); p.setSemanticKind("practiceAssessment"); p.setRequires(List.of("C", "Q"));
        ExamData exam = mapper.convertValue(base.goals().get("Q").getExamData(), ExamData.class);
        exam.setTaskContent("Apply C and A independently."); exam.setSolutionContent("Independent application of C and A.");
        exam.setCoveredGoalIds(List.of("A", "C"));
        exam.getScoring().getSteps().getFirst().setDescription("Applies both C and A independently."); p.setExamData(exam);
        var parentUnit = new ProgramUnit(); parentUnit.setId("parent");
        parentUnit.setLearningUnit(new ProgramUnit.LearningUnitMetadata("parent", "1", "parent-placements-1",
                child.promise(), child.introduction(), List.of(missingChild ? "missing-unit" : "unit")));
        List<ProgramUnit> units = new ArrayList<>(base.source().getProgramUnits()); units.add(parentUnit);
        if (missingChild) {
            var missing = new ProgramUnit(); missing.setId("missing-unit");
            missing.setLearningUnit(new ProgramUnit.LearningUnitMetadata("missing", "1", "missing-placements-1", child.promise(), child.introduction(), List.of()));
            units.add(missing);
        }
        base.source().setProgramUnits(units);
        List<LearningGoal> goals = new ArrayList<>(base.source().getGoals()); goals.add(c); goals.add(p); base.source().setGoals(goals);
        List<GoalPlacement> placements = new ArrayList<>(base.source().getGoalPlacements());
        for (String id : List.of("C", "P")) {
            var placement = new GoalPlacement(); placement.setGoalId(id); placement.setUnitId("parent");
            placement.setRelation("P".equals(id) ? "assessed" : "primary"); placement.setAcquisition(true); placements.add(placement);
        }
        base.source().setGoalPlacements(placements);
        var graph = CompletionCanonicalGraphResolver.normalizeDefinitions(List.of(base.source()), mapper);
        var parent = new LearningUnitDefinition(1, LearningUnitDefinition.SEMANTICS, "parent", "1",
                new LearningUnitDefinition.SourceBinding("math", "parent", "parent-placements-1", LearningUnitSourceBindingsTest.viewDigests()),
                child.title(), child.promise(), child.introduction(), List.of("C", "P"),
                List.of(missingChild ? new LearningUnitDefinition.ContractRef("missing", "1") : child.ref()),
                List.of("P"), List.of(), List.of(),
                Map.of("C", LearningUnitSourceBindings.meaning(c), "P", LearningUnitSourceBindings.meaning(p)),
                Map.of("C", "ordinary", "P", "assessment"),
                Map.of("C", LearningUnitSourceBindings.meaningDigest(c), "P", LearningUnitSourceBindings.meaningDigest(p)),
                new CompletionProfileCompiler().compileAtomicPrerequisites(graph, Set.of("C", "P")),
                Map.of("P", new LearningUnitDefinition.AssessmentClaim(List.of("A", "C"),
                        LearningUnitSourceBindings.canonicalDigest(Map.of("taskContent", exam.getTaskContent(), "solutionContent", exam.getSolutionContent())),
                        LearningUnitSourceBindings.canonicalDigest(exam.getScoring()), child.reviewRef())), child.reviewRef());
        String parentPath = "DE/Gymnasium/learning-units/contracts/parent/1.json";
        String taskPath = "DE/Gymnasium/learning-units/inputs/P.task.json";
        String rubricPath = "DE/Gymnasium/learning-units/inputs/P.rubric.json";
        archive.files().put(parentPath, mapper.writeValueAsBytes(parent));
        archive.files().put(taskPath, mapper.writeValueAsBytes(Map.of("taskContent", exam.getTaskContent(), "solutionContent", exam.getSolutionContent())));
        archive.files().put(rubricPath, mapper.writeValueAsBytes(exam.getScoring()));
        archive.files().put(childEntry.sourceSnapshotPath(), mapper.writeValueAsBytes(new LearningUnitCatalog.SourceSnapshot(
                1, "completion-goal-kinds-v1", List.of(base.source()), LearningUnitSourceBindingsTest.viewDigests())));
        Map<String, String> shared = new LinkedHashMap<>(childEntry.inputs());
        shared.put(childEntry.sourceSnapshotPath(), LearningUnitCatalogTest.hash(archive.files().get(childEntry.sourceSnapshotPath())));
        Map<String, String> parentInputs = new LinkedHashMap<>(shared);
        parentInputs.put(taskPath, LearningUnitCatalogTest.hash(archive.files().get(taskPath)));
        parentInputs.put(rubricPath, LearningUnitCatalogTest.hash(archive.files().get(rubricPath)));
        var parentEntry = new LearningUnitCatalog.Entry(parentPath, LearningUnitCatalogTest.hash(archive.files().get(parentPath)), "archived",
                childEntry.sourceSnapshotPath(), parentInputs, Map.of("P", new LearningUnitCatalog.AssessmentInputs(taskPath, rubricPath)), Map.of());
        var activeChild = new LearningUnitCatalog.Entry(childEntry.path(), childEntry.sha256(), "active", childEntry.sourceSnapshotPath(),
                shared, childEntry.assessmentInputs(), childEntry.recallInputs());
        return new LearningUnitCatalogTest.Archive(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(parentEntry, activeChild))), archive.files());
    }

    private static LearningGoal goal(String id) {
        var goal = new LearningGoal(); goal.setId(id); goal.setTitle("Goal " + id); goal.setDescription("Can apply " + id);
        goal.setType("atomic"); goal.setNodeKind("tutor"); goal.setSemanticKind("curricularAtomic");
        goal.setContains(List.of()); goal.setRequires(List.of()); return goal;
    }
}
