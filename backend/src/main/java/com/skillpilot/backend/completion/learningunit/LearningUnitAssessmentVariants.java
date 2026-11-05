package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionCompilationException;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LearningGoal;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;

/** A finite served translation shares the canonical claim and the actual normal grading rubric. */
public final class LearningUnitAssessmentVariants {
    public static final String REVIEW_SEMANTICS = "assessment-task-variant-review-v1";
    private LearningUnitAssessmentVariants() { }

    public record VariantReview(int schemaVersion, String semantics, String assessmentGoalId, String locale,
                                List<String> coveredGoalIds, Map<String, String> coveredGoalMeaningDigests,
                                String taskRevision, String rubricRevision, String independentReviewer,
                                String decision) { }

    public static boolean matches(LearningUnitDefinition.AssessmentClaim claim, ExamData exam) {
        if (claim == null || exam == null || !text(exam.getTaskContent()) || !text(exam.getSolutionContent())
                || !Set.copyOf(claim.coveredGoalIds()).equals(Set.copyOf(exam.getCoveredGoalIds() == null ? List.of() : exam.getCoveredGoalIds()))
                || !Objects.equals(claim.taskRevision(), taskDigest(exam.getTaskContent(), exam.getSolutionContent()))
                || !Objects.equals(claim.rubricRevision(), LearningUnitSourceBindings.canonicalDigest(exam.getScoring()))
                || !Set.of("en").containsAll(claim.taskVariants().keySet())) return false;
        boolean translated = text(exam.getTaskContentEn()) || text(exam.getSolutionContentEn());
        var english = claim.taskVariants().get("en");
        if (!translated) return english == null;
        return english != null && Objects.equals(english.taskRevision(), taskDigest(
                text(exam.getTaskContentEn()) ? exam.getTaskContentEn() : exam.getTaskContent(),
                text(exam.getSolutionContentEn()) ? exam.getSolutionContentEn() : exam.getSolutionContent()))
                && Objects.equals(english.rubricRevision(), claim.rubricRevision()) && text(english.reviewRef());
    }

    public static void validateFrozen(String goalId, LearningUnitDefinition.AssessmentClaim claim,
            LearningUnitCatalog.AssessmentInputs paths, Map<String, byte[]> inputs,
            Map<String, LearningGoal> canonicalGoals, ObjectMapper strict) throws IOException {
        if (paths == null || !paths.taskVariants().keySet().equals(claim.taskVariants().keySet())) {
            fail("ASSESSMENT_VARIANT_REVIEW_REQUIRED", "Frozen task variants do not match the reviewed finite variants: " + goalId);
        }
        validatePair(claim.taskRevision(), claim.rubricRevision(), paths.taskPath(), paths.rubricPath(), inputs, strict);
        requireInput(inputs, LearningUnitCatalog.reviewPath(claim.reviewRef()));
        for (var entry : claim.taskVariants().entrySet()) {
            String locale = entry.getKey();
            var variant = entry.getValue();
            var variantPaths = paths.taskVariants().get(locale);
            if (!"en".equals(locale) || variant == null || !text(variant.reviewRef())
                    || !Objects.equals(variant.rubricRevision(), claim.rubricRevision())) {
                fail("ASSESSMENT_VARIANT_REVIEW_REQUIRED", "Only the reviewed EN variant of the actual shared normal rubric is supported");
            }
            validatePair(variant.taskRevision(), variant.rubricRevision(), variantPaths.taskPath(), variantPaths.rubricPath(), inputs, strict);
            VariantReview review = strict.readValue(requireInput(inputs, LearningUnitCatalog.reviewPath(variant.reviewRef())), VariantReview.class);
            Map<String, String> meanings = new TreeMap<>();
            for (String covered : claim.coveredGoalIds()) {
                LearningGoal goal = canonicalGoals.get(covered);
                if (goal == null || goal.getContains() != null && !goal.getContains().isEmpty()
                        || CompletionProfileCompiler.isAssessment(goal) || CompletionProfileCompiler.isMemory(goal)
                        || CompletionProfileCompiler.isOrientation(goal)) {
                    fail("ASSESSMENT_VARIANT_REVIEW_REQUIRED", "Variant claim must bind the frozen ordinary canonical goal meanings");
                }
                meanings.put(covered, LearningUnitSourceBindings.meaningDigest(goal));
            }
            if (review.schemaVersion() != 1 || !REVIEW_SEMANTICS.equals(review.semantics())
                    || !goalId.equals(review.assessmentGoalId()) || !locale.equals(review.locale())
                    || review.coveredGoalIds() == null || review.coveredGoalIds().size() != Set.copyOf(review.coveredGoalIds()).size()
                    || !Set.copyOf(claim.coveredGoalIds()).equals(Set.copyOf(review.coveredGoalIds()))
                    || !meanings.equals(review.coveredGoalMeaningDigests())
                    || !Objects.equals(variant.taskRevision(), review.taskRevision())
                    || !Objects.equals(variant.rubricRevision(), review.rubricRevision())
                    || !text(review.independentReviewer()) || !"same-claim-approved".equals(review.decision())) {
                fail("ASSESSMENT_VARIANT_REVIEW_REQUIRED", "Independent review does not approve this exact task, normal rubric and frozen claim: " + goalId);
            }
        }
    }

    private static void validatePair(String taskRevision, String rubricRevision, String taskPath, String rubricPath,
                                     Map<String, byte[]> inputs, ObjectMapper mapper) throws IOException {
        JsonNode task = mapper.readTree(requireInput(inputs, taskPath));
        if (!task.isObject() || task.size() != 2 || !task.path("taskContent").isTextual()
                || !task.path("solutionContent").isTextual()
                || !text(task.path("taskContent").textValue()) || !text(task.path("solutionContent").textValue())
                || !Objects.equals(taskRevision, LearningUnitSourceBindings.canonicalDigest(task))) {
            fail("STALE_ASSESSMENT_BINDING", "Frozen task/solution pair differs from the reviewed normal assessment");
        }
        JsonNode rubric = mapper.readTree(requireInput(inputs, rubricPath));
        if (!Objects.equals(rubricRevision, LearningUnitSourceBindings.canonicalDigest(rubric))) {
            fail("STALE_ASSESSMENT_BINDING", "Frozen normal rubric differs from the reviewed claim");
        }
    }
    public static String taskDigest(String task, String solution) {
        return LearningUnitSourceBindings.canonicalDigest(Map.of("taskContent", task, "solutionContent", solution));
    }
    private static byte[] requireInput(Map<String, byte[]> inputs, String path) {
        LearningUnitCatalog.checkedPath(path);
        byte[] bytes = inputs.get(path);
        if (bytes == null) fail("ASSESSMENT_VARIANT_REVIEW_REQUIRED", "Assessment input is not pinned: " + path);
        return bytes;
    }
    private static boolean text(String value) { return value != null && !value.isBlank(); }
    private static void fail(String code, String detail) { throw new CompletionCompilationException(code, detail); }
}
