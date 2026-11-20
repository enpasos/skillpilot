package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.landscape.ExamData;

import java.math.BigDecimal;
import java.util.Objects;

/** A revision of the scored material. No learner answers or curriculum placement enter its identity. */
public record AssessmentMaterialRevision(String taskRevision, String rubricRevision, String fingerprint) {
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /** Internal comparison with the currently loaded scored material; exposes no evaluation to a learner. */
    public static AssessmentMaterialRevision of(ExamData exam) {
        Objects.requireNonNull(exam);
        var scoring = Objects.requireNonNull(exam.getScoring());
        return of(exam, new CoachToolFacade.ExamEvaluationResult(null, exam.getSolutionContent(),
                exam.getSolutionContentEn(), new CoachToolFacade.ExamScoring(scoring.getMaxPoints(),
                        scoring.getPassingPoints(), scoring.getSteps().stream().map(step ->
                                new CoachToolFacade.ExamScoringStep(step.getId(), step.getPoints(), step.getDescription())).toList())));
    }

    public static AssessmentMaterialRevision of(ExamData exam, CoachToolFacade.ExamEvaluationResult evaluation) {
        Objects.requireNonNull(exam);
        Objects.requireNonNull(evaluation);
        if (exam.getTaskContent() == null || exam.getTaskContent().isBlank()
                || evaluation.solutionContent() == null || evaluation.solutionContent().isBlank()
                || !Objects.equals(evaluation.solutionContent(), exam.getSolutionContent())
                || !Objects.equals(evaluation.solutionContentEn(), exam.getSolutionContentEn())) {
            throw new IllegalArgumentException("Exam materials must belong to one complete evaluation.");
        }
        // The two revision hashes use the same binding as the curriculum's coverage reviews.
        ObjectNode task = MAPPER.createObjectNode();
        task.put("taskContent", exam.getTaskContent());
        task.put("solutionContent", evaluation.solutionContent());
        String taskRevision = hash(task);
        String rubricRevision = hash(rubric(exam.getScoring(), evaluation.scoring()));

        ObjectNode binding = MAPPER.createObjectNode();
        binding.put("taskRevision", taskRevision);
        binding.put("rubricRevision", rubricRevision);
        if (exam.getTaskContentEn() != null) binding.put("taskContentEn", exam.getTaskContentEn());
        if (evaluation.solutionContentEn() != null) binding.put("solutionContentEn", evaluation.solutionContentEn());
        return new AssessmentMaterialRevision(taskRevision, rubricRevision, hash(binding));
    }

    private static ObjectNode rubric(ExamData.Scoring scoring, CoachToolFacade.ExamScoring evaluated) {
        if (scoring == null || evaluated == null || scoring.getSteps() == null || evaluated.steps() == null
                || scoring.getMaxPoints() != evaluated.maxPoints() || scoring.getPassingPoints() != evaluated.passingPoints()
                || scoring.getSteps().size() != evaluated.steps().size()) {
            throw new IllegalArgumentException("The evaluation does not match the exam rubric.");
        }
        ObjectNode result = MAPPER.createObjectNode();
        result.setAll(scoring.additionalReviewFields());
        result.set("maxPoints", number(scoring.getMaxPoints()));
        result.set("passingPoints", number(scoring.getPassingPoints()));
        var steps = result.putArray("steps");
        for (int i = 0; i < evaluated.steps().size(); i++) {
            var step = scoring.getSteps().get(i);
            var actual = evaluated.steps().get(i);
            if (!Objects.equals(step.getId(), actual.id()) || !Objects.equals(step.getDescription(), actual.description())
                    || step.getPoints() != actual.points()) {
                throw new IllegalArgumentException("The evaluation does not match the exam rubric.");
            }
            ObjectNode item = steps.addObject();
            item.setAll(step.additionalReviewFields());
            item.put("id", step.getId());
            item.set("points", number(step.getPoints()));
            item.put("description", step.getDescription());
        }
        return result;
    }

    private static JsonNode number(double points) {
        BigDecimal decimal = BigDecimal.valueOf(points).stripTrailingZeros();
        return decimal.scale() <= 0
                ? MAPPER.getNodeFactory().numberNode(decimal.toBigIntegerExact())
                : MAPPER.getNodeFactory().numberNode(decimal);
    }

    private static String hash(JsonNode value) {
        try {
            return CompletionReviewBindings.canonicalHash(value, MAPPER);
        } catch (Exception e) {
            throw new IllegalStateException("Cannot bind the exam material to a revision.", e);
        }
    }
}
