package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.ai.CoachToolFacade.ExamEvaluationResult;
import com.skillpilot.backend.ai.CoachToolFacade.ExamScoring;
import com.skillpilot.backend.ai.CoachToolFacade.ExamScoringStep;
import com.skillpilot.backend.landscape.ExamData;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatIllegalArgumentException;

class AssessmentMaterialRevisionTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void bothPhysicsChildExamsBindToTheirPublishedCoverageReviews() throws Exception {
        var file = Path.of("../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json");
        JsonNode physics = mapper.readTree(file.toFile());
        var unit = physics.path("programUnits").findParents("coverageReviews").stream()
                .filter(node -> "physics-constant-acceleration".equals(node.path("id").asText())).findFirst().orElseThrow();
        assertThat(unit.path("coverageReviews").size()).isEqualTo(2);
        for (var review : unit.path("coverageReviews")) {
            String goalId = review.path("assessmentGoalId").textValue();
            var goal = physics.path("goals").valueStream().filter(node -> goalId.equals(node.path("id").asText()))
                    .findFirst().orElseThrow();
            var exam = mapper.treeToValue(goal.required("examData"), ExamData.class);
            var revision = AssessmentMaterialRevision.of(exam, evaluation(exam, goalId));
            assertThat(revision.taskRevision()).isEqualTo(review.required("taskRevision").textValue());
            assertThat(revision.rubricRevision()).isEqualTo(review.required("rubricRevision").textValue());
        }
    }

    @Test
    void translationsAndAdditionalRubricFieldsArePartOfTheGradedMaterial() throws Exception {
        var json = (ObjectNode) mapper.readTree("""
                {"taskContent":"Aufgabe","solutionContent":"Lösung","taskContentEn":"Task","solutionContentEn":"Solution",
                 "scoring":{"steps":[{"id":"A","points":2.5,"description":"Erklären","descriptionEn":"Explain"}],
                 "passingPoints":1.5,"maxPoints":2.5}}
                """);
        var original = revision(json);
        var translated = revision(json.deepCopy().put("taskContentEn", "A different question"));
        assertThat(translated.taskRevision()).isEqualTo(original.taskRevision());
        assertThat(translated.fingerprint()).isNotEqualTo(original.fingerprint());
        assertThat(revision(json.deepCopy().put("solutionContentEn", "A different solution")).fingerprint())
                .isNotEqualTo(original.fingerprint());
        var differentRubric = json.deepCopy();
        ((ObjectNode) differentRubric.at("/scoring/steps/0")).put("descriptionEn", "Explain why");
        assertThat(revision(differentRubric).rubricRevision()).isNotEqualTo(original.rubricRevision());
        ((ObjectNode) json.at("/scoring/steps/0")).putArray("coveredGoalIds").add("velocity");
        assertThat(revision(json).rubricRevision()).isNotEqualTo(original.rubricRevision());
        assertThat(revision(json.deepCopy().put("reviewNote", "editorial note"))).isEqualTo(revision(json));
    }

    @Test
    void evaluationMustMatchTheMaterialThatTheCoachUses() throws Exception {
        var exam = mapper.readValue("""
                {"taskContent":"Aufgabe","solutionContent":"Lösung",
                 "scoring":{"steps":[{"id":"A","points":3,"description":"Erklären"}],"passingPoints":2,"maxPoints":3}}
                """, ExamData.class);
        var evaluation = evaluation(exam, "exam");
        exam.getScoring().getSteps().getFirst().setDescription("Anders bewerten");
        assertThatIllegalArgumentException().isThrownBy(() -> AssessmentMaterialRevision.of(exam, evaluation));
    }

    private AssessmentMaterialRevision revision(JsonNode json) throws Exception {
        var exam = mapper.treeToValue(json, ExamData.class);
        return AssessmentMaterialRevision.of(exam, evaluation(exam, "exam"));
    }

    private static ExamEvaluationResult evaluation(ExamData exam, String goalId) {
        var rubric = exam.getScoring();
        var steps = rubric.getSteps().stream()
                .map(step -> new ExamScoringStep(step.getId(), step.getPoints(), step.getDescription())).toList();
        return new ExamEvaluationResult(goalId, exam.getSolutionContent(), exam.getSolutionContentEn(),
                new ExamScoring(rubric.getMaxPoints(), rubric.getPassingPoints(), steps));
    }
}
