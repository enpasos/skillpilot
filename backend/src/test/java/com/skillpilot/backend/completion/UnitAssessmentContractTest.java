package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.VerifiedExamPassResponse;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.service.UnitLearningMaterialService;
import java.nio.file.Path;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class UnitAssessmentContractTest {
    @Test
    void oneAssessmentCanProveAUnitWithoutGrantingAnyPlanningCredit() {
        var material = new AssessmentMaterialRevision("sha256:" + "a".repeat(64),
                "sha256:" + "b".repeat(64), "sha256:" + "c".repeat(64));
        var contract = new UnitAssessmentContract("seminar-v2", List.of("seminar"),
                List.of(new UnitAssessmentContract.Part("compare-algorithms", material)), List.of("estimate-cost"), List.of());
        var assessment = new LearningGoal();
        assessment.setId("compare-algorithms");
        assessment.setTitle("Suchverfahren vergleichen");
        assessment.setExamData(new ExamData());
        var graph = Map.of("compare-algorithms", assessment, "estimate-cost", new LearningGoal());
        var receipt = new VerifiedExamPassResponse(Instant.EPOCH, 7, 9, 7,
                material.taskRevision(), material.rubricRevision(), material.fingerprint());
        var result = contract.evaluate("algorithm-design", graph.keySet(), graph,
                Map.of("compare-algorithms", List.of(receipt)), Set.of()).orElseThrow();
        assertThat(result.passed()).isTrue();
        assertThat(result.parts()).hasSize(1);
        assertThat(result.planningCreditGoalIds()).isEmpty();
        assertThat(result.individuallyOpenGoalIds()).containsExactly("estimate-cost");
    }

    @Test
    void usesAllFourPublishedMaterialsWithoutDerivingPlanningCreditFromUnboundReceipts() throws Exception {
        var mapper = new ObjectMapper();
        var curricula = Path.of("../curricula");
        String view = "de-he-gym-physics-gk-g8";
        String section = "physics-e1-motion";
        var material = UnitLearningMaterialService.fromRepository(curricula, mapper)
                .find("7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", view, section).orElseThrow();
        var contract = material.assessmentContract();
        assertThat(contract.appliesTo(view)).isTrue();
        assertThat(contract.appliesTo("de-he-gym-physics-lk-g9")).isTrue();
        assertThat(contract.appliesTo("de-by-gym-physics-gk-g9")).isFalse();
        assertThat(contract.appliesTo("merged:" + view + "+de-by-gym-physics-gk-g9")).isFalse();

        var physics = mapper.readTree(curricula.resolve("DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json").toFile());
        Map<String, LearningGoal> graph = new HashMap<>();
        for (var source : physics.required("goals")) {
            var goal = new LearningGoal();
            goal.setId(source.required("id").textValue());
            goal.setTitle(source.required("title").textValue());
            if (source.hasNonNull("examData")) goal.setExamData(mapper.treeToValue(source.required("examData"), ExamData.class));
            graph.put(goal.getId(), goal);
        }
        assertThat(contract.parts()).hasSize(4);
        assertThat(contract.contentGoalIds()).hasSize(11);
        Map<String, List<VerifiedExamPassResponse>> receipts = new HashMap<>();
        for (var part : contract.parts()) {
            var exam = graph.get(part.goalId()).getExamData();
            var revision = AssessmentMaterialRevision.of(exam, AssessmentMaterialRevisionTest.evaluation(exam, part.goalId()));
            assertThat(revision).isEqualTo(part.material());
            var before = contract.evaluate(section, graph.keySet(), graph, receipts, Set.of()).orElseThrow();
            assertThat(before.passed()).isFalse();
            assertThat(before.planningCreditGoalIds()).isEmpty();
            receipts.put(part.goalId(), List.of(new VerifiedExamPassResponse(Instant.EPOCH,
                    exam.getScoring().getPassingPoints(), exam.getScoring().getMaxPoints(), exam.getScoring().getPassingPoints(),
                    revision.taskRevision(), revision.rubricRevision(), revision.fingerprint())));
        }
        var complete = contract.evaluate(section, graph.keySet(), graph, receipts, Set.of()).orElseThrow();
        assertThat(complete.passed()).isTrue();
        assertThat(contract.planningCredits().getFirst().goalIds()).hasSize(2);
        assertThat(complete.planningCreditGoalIds()).isEmpty();
        assertThat(complete.individuallyOpenGoalIds()).hasSize(11);

        var scope = Map.of("durationModel", "G8", "courseProfile", "GK", "stage", "SekII");
        String assignment = contract.assignmentFingerprint("physics", view, section, scope);
        var a = contract.parts().getFirst();
        var differentRubric = new AssessmentMaterialRevision(a.material().taskRevision(),
                "sha256:" + "a".repeat(64), a.material().fingerprint());
        var revisedParts = new java.util.ArrayList<>(contract.parts());
        revisedParts.set(0, new UnitAssessmentContract.Part(a.goalId(), differentRubric));
        var revised = new UnitAssessmentContract(contract.revision(), contract.viewIds(), revisedParts,
                contract.contentGoalIds(), contract.planningCredits());
        assertThat(revised.planningCredits()).isEqualTo(contract.planningCredits());
        assertThat(revised.assignmentFingerprint("physics", view, section, scope)).isNotEqualTo(assignment);
        assertThat(contract.assignmentFingerprint("physics", "de-he-gym-physics-gk-g9", section, scope)).isNotEqualTo(assignment);
        assertThat(contract.assignmentFingerprint("physics", view, section,
                Map.of("durationModel", "G9", "courseProfile", "GK", "stage", "SekII"))).isNotEqualTo(assignment);
        var withoutExtraCredit = new UnitAssessmentContract(contract.revision(), contract.viewIds(), contract.parts(),
                contract.contentGoalIds(), List.of());
        assertThat(withoutExtraCredit.assignmentFingerprint("physics", view, section, scope)).isEqualTo(assignment);

        var first = contract.parts().getFirst();
        var other = receipts.get(contract.parts().get(1).goalId());
        receipts.put(first.goalId(), other);
        var partial = contract.evaluate(section, graph.keySet(), graph, receipts, Set.of(contract.contentGoalIds().getFirst())).orElseThrow();
        assertThat(partial.passed()).isFalse();
        assertThat(partial.parts()).filteredOn(part -> !part.passed()).hasSize(1);
        assertThat(partial.planningCreditGoalIds()).isEmpty();
        assertThat(partial.individuallyOpenGoalIds()).hasSize(10);
        assertThat(contract.evaluate(section, Set.of(first.goalId()), graph, receipts, Set.of())).isEmpty();
    }
}
