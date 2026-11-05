package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.skillpilot.backend.completion.CompletionCompilationException;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.landscape.GoalPlacement;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ProgramUnit;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeMap;

/** Authoring/activation checks. Historical recognition reads its frozen graph, never today's scope. */
public final class LearningUnitSourceBindings {
    private LearningUnitSourceBindings() { }

    public static void validateActiveSource(LearningUnitDefinition definition, SkillLandscape source,
                                            Map<String, LearningGoal> canonicalGoals,
                                            Map<String, String> compositionViewDigests) {
        var binding = definition.sourceBinding();
        if (source == null || !Objects.equals(binding.landscapeId(), source.getLandscapeId())) fail("INVALID_SOURCE_BINDING", "Wrong source landscape");
        ProgramUnit unit = source.getProgramUnits() == null ? null : source.getProgramUnits().stream()
                .filter(candidate -> binding.programUnitId().equals(candidate.getId())).findFirst().orElse(null);
        var metadata = unit == null ? null : unit.getLearningUnit();
        if (metadata == null || !Objects.equals(metadata.contractId(), definition.contractId())
                || !Objects.equals(metadata.revision(), definition.revision())
                || !Objects.equals(metadata.placementRevision(), binding.placementRevision())
                || !Objects.equals(metadata.promise(), definition.promise())
                || !Objects.equals(metadata.introduction(), definition.introduction())) {
            fail("INVALID_SOURCE_BINDING", "Program unit does not name this exact reviewed contract");
        }
        if (!compositionViewDigests.entrySet().containsAll(binding.compositionViewDigests().entrySet())) {
            fail("STALE_COMPOSITION_BINDING", "Reviewed composition view differs");
        }
        Set<String> placedOwn = new LinkedHashSet<>();
        if (source.getGoalPlacements() != null) for (GoalPlacement placement : source.getGoalPlacements()) {
            if (!binding.programUnitId().equals(placement.getUnitId()) || !Boolean.TRUE.equals(placement.getAcquisition())) continue;
            if (!placedOwn.add(placement.getGoalId())) fail("AMBIGUOUS_ACQUISITION_OWNER", "Duplicate active acquisition placement");
        }
        if (!placedOwn.equals(Set.copyOf(definition.ownGoalIds()))) fail("STALE_PLACEMENT_BINDING", "Own targets differ from acquisition placements");
        Set<LearningUnitDefinition.ContractRef> sourceChildren = new HashSet<>();
        if (source.getProgramUnits() != null) for (ProgramUnit candidate : source.getProgramUnits()) {
            if (!binding.programUnitId().equals(candidate.getParentUnitId()) || candidate.getLearningUnit() == null) continue;
            sourceChildren.add(new LearningUnitDefinition.ContractRef(candidate.getLearningUnit().contractId(), candidate.getLearningUnit().revision()));
        }
        if (!sourceChildren.equals(Set.copyOf(definition.requiredChildContractRefs()))) fail("STALE_CHILD_BINDING", "Required children differ from authored program units");
        for (String id : definition.ownGoalIds()) {
            LearningGoal goal = canonicalGoals.get(id);
            if (goal == null || goal.getContains() != null && !goal.getContains().isEmpty()) fail("TARGET_NOT_ATOMIC", "Unit Own must contain actual canonical atoms: " + id);
            if (!Objects.equals(meaningDigest(goal), definition.ownGoalMeaningDigests().get(id))) fail("GOAL_MEANING_CONFLICT", "Active own goal meaning changed: " + id);
            if (CompletionProfileCompiler.isAssessment(goal) != definition.ownAssessmentGoalIds().contains(id)
                    || CompletionProfileCompiler.isMemory(goal) != definition.ownRecallGoalIds().contains(id)
                    || CompletionProfileCompiler.isOrientation(goal) != definition.ownOrientationGoalIds().contains(id)) {
                fail("INVALID_UNIT_PARTITION", "Active source goal classification differs: " + id);
            }
            if (definition.ownAssessmentGoalIds().contains(id)) {
                var claim = definition.assessmentClaims().get(id);
                var exam = goal.getExamData();
                if (exam == null || !Objects.equals(claim.taskRevision(), canonicalDigest(Map.of(
                        "taskContent", exam.getTaskContent(), "solutionContent", exam.getSolutionContent())))
                        || !Objects.equals(claim.rubricRevision(), canonicalDigest(exam.getScoring()))) {
                    fail("STALE_ASSESSMENT_BINDING", "Active normal task or rubric differs: " + id);
                }
                if (exam.getTaskContentEn() != null || exam.getSolutionContentEn() != null) {
                    fail("ASSESSMENT_VARIANT_REVIEW_REQUIRED", "Every delivered translated task variant needs a binding: " + id);
                }
            }
        }
        if (!definition.ownGoalIds().isEmpty()) {
            var actual = new CompletionProfileCompiler().compileAtomicPrerequisites(canonicalGoals, Set.copyOf(definition.ownGoalIds()));
            if (!actual.equals(definition.atomicPrerequisites())) fail("STALE_REQUIREMENTS_BINDING", "Frozen atomic requirements differ from active source");
        } else if (!definition.atomicPrerequisites().isEmpty()) {
            fail("STALE_REQUIREMENTS_BINDING", "An aggregate cannot own an unrelated atomic snapshot");
        }
    }

    /** Fixed meaning fields, sorted JSON keys, UTF-8, explicit nulls; excludes QA and visualization. */
    public static String meaningDigest(LearningGoal goal) {
        return canonicalDigest(meaning(goal));
    }

    public static LearningUnitDefinition.GoalMeaning meaning(LearningGoal goal) {
        return new LearningUnitDefinition.GoalMeaning(goal.getId(), goal.getTitle(), goal.getTitleEn(),
                goal.getDescription(), goal.getDescriptionEn(), goal.getType(), goal.getNodeKind(), goal.getSemanticKind());
    }

    public static String canonicalDigest(Object value) {
        try {
            ObjectMapper mapper = new ObjectMapper().enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS);
            byte[] bytes = mapper.writeValueAsBytes(canonicalValue(mapper.valueToTree(value)));
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (JsonProcessingException | NoSuchAlgorithmException e) {
            throw new IllegalStateException("Cannot fingerprint learning-unit source", e);
        }
    }

    private static Object canonicalValue(JsonNode node) {
        if (node == null || node.isNull()) return null;
        if (node.isObject()) {
            Map<String, Object> fields = new TreeMap<>();
            node.fields().forEachRemaining(entry -> fields.put(entry.getKey(), canonicalValue(entry.getValue())));
            return fields;
        }
        if (node.isArray()) {
            java.util.List<Object> values = new ArrayList<>();
            node.forEach(item -> values.add(canonicalValue(item)));
            return values;
        }
        if (node.isNumber()) {
            var decimal = node.decimalValue().stripTrailingZeros();
            return decimal.scale() <= 0 ? decimal.toBigIntegerExact() : decimal;
        }
        if (node.isBoolean()) return node.booleanValue();
        return node.textValue();
    }

    private static void fail(String code, String detail) { throw new CompletionCompilationException(code, detail); }
}
