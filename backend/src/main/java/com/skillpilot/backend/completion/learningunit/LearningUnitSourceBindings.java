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
        validateSource(definition, source, canonicalGoals, compositionViewDigests, true, true);
    }

    /** Today's unit semantics bind to the separately reviewed current offer views. */
    public static void validateCurrentUnit(LearningUnitDefinition definition, SkillLandscape source,
                                           Map<String, LearningGoal> canonicalGoals) {
        validateSource(definition, source, canonicalGoals, Map.of(), false, false);
    }

    private static void validateSource(LearningUnitDefinition definition, SkillLandscape source,
            Map<String, LearningGoal> canonicalGoals, Map<String, String> compositionViewDigests,
            boolean compareHistoricalViews, boolean compareAssessmentEvidence) {
        var binding = definition.sourceBinding();
        if (source == null || !Objects.equals(binding.landscapeId(), source.getLandscapeId())) fail("INVALID_SOURCE_BINDING", "Wrong source landscape");
        Map<String, ProgramUnit> programUnits = new TreeMap<>();
        if (source.getProgramUnits() != null) for (ProgramUnit candidate : source.getProgramUnits()) {
            if (candidate.getId() == null || candidate.getId().isBlank() || programUnits.putIfAbsent(candidate.getId(), candidate) != null) {
                fail("INVALID_SOURCE_BINDING", "Program unit IDs must be unique");
            }
        }
        ProgramUnit unit = programUnits.get(binding.programUnitId());
        var metadata = unit == null ? null : unit.getLearningUnit();
        if (metadata == null || !Objects.equals(metadata.contractId(), definition.contractId())
                || !Objects.equals(metadata.revision(), definition.revision())
                || !Objects.equals(metadata.placementRevision(), binding.placementRevision())
                || !Objects.equals(metadata.promise(), definition.promise())
                || !Objects.equals(metadata.introduction(), definition.introduction())) {
            fail("INVALID_SOURCE_BINDING", "Program unit does not name this exact reviewed contract");
        }
        if (compareHistoricalViews && !compositionViewDigests.entrySet().containsAll(binding.compositionViewDigests().entrySet())) {
            fail("STALE_COMPOSITION_BINDING", "Reviewed composition view differs");
        }
        Set<String> placedOwn = new LinkedHashSet<>();
        if (source.getGoalPlacements() != null) for (GoalPlacement placement : source.getGoalPlacements()) {
            if (!binding.programUnitId().equals(placement.getUnitId()) || !Boolean.TRUE.equals(placement.getAcquisition())) continue;
            if (!"primary".equals(placement.getRelation()) && !"assessed".equals(placement.getRelation())) {
                fail("INVALID_SOURCE_BINDING", "Acquisition needs an authored primary or assessed placement");
            }
            if (!placedOwn.add(placement.getGoalId())) fail("AMBIGUOUS_ACQUISITION_OWNER", "Duplicate active acquisition placement");
        }
        if (!placedOwn.equals(Set.copyOf(definition.ownGoalIds()))) fail("STALE_PLACEMENT_BINDING", "Own targets differ from acquisition placements");
        Set<LearningUnitDefinition.ContractRef> sourceChildren = new HashSet<>();
        if (metadata.requiredChildUnitIds() != null) {
            Set<String> childIds = new HashSet<>();
            for (String childId : metadata.requiredChildUnitIds()) {
                ProgramUnit child = programUnits.get(childId);
                if (!childIds.add(childId) || child == null || child.getLearningUnit() == null) {
                    fail("MISSING_CHILD_CONTRACT", "Explicit child unit is unknown, duplicated or has no contract");
                }
                sourceChildren.add(new LearningUnitDefinition.ContractRef(child.getLearningUnit().contractId(), child.getLearningUnit().revision()));
            }
        } else {
            for (ProgramUnit candidate : programUnits.values()) {
                if (!binding.programUnitId().equals(candidate.getParentUnitId()) || candidate.getLearningUnit() == null) continue;
                sourceChildren.add(new LearningUnitDefinition.ContractRef(candidate.getLearningUnit().contractId(), candidate.getLearningUnit().revision()));
            }
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
            if (!resolvedKind(goal).equals(definition.ownResolvedKinds().get(id))) fail("INVALID_UNIT_PARTITION", "Source resolved kind differs: " + id);
            if (compareAssessmentEvidence && definition.ownAssessmentGoalIds().contains(id)) {
                var claim = definition.assessmentClaims().get(id);
                var exam = goal.getExamData();
                Set<String> canonicalClaim = exam == null || exam.getCoveredGoalIds() == null ? Set.of() : Set.copyOf(exam.getCoveredGoalIds());
                if (!canonicalClaim.equals(Set.copyOf(claim.coveredGoalIds()))) {
                    fail("ASSESSMENT_CLAIM_CONFLICT", "Unit claim differs from the frozen canonical assessment claim: " + id);
                }
                if (!assessmentClaimMatches(claim, exam)) {
                    if (exam != null && (exam.getTaskContentEn() != null && !exam.getTaskContentEn().isBlank()
                            || exam.getSolutionContentEn() != null && !exam.getSolutionContentEn().isBlank())
                            && !claim.taskVariants().containsKey("en")) {
                        fail("ASSESSMENT_VARIANT_REVIEW_REQUIRED", "Every delivered translated task variant needs a binding: " + id);
                    }
                    fail("STALE_ASSESSMENT_BINDING", "Active normal task, canonical claim, rubric or reviewed variant differs: " + id);
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

    /** Result-identity check for normal assessment routes, independent of current placement/view readiness. */
    public static boolean assessmentClaimMatches(LearningUnitDefinition.AssessmentClaim claim,
                                                 com.skillpilot.backend.landscape.ExamData exam) {
        return LearningUnitAssessmentVariants.matches(claim, exam);
    }

    /** Fixed meaning fields, sorted JSON keys, UTF-8, explicit nulls; excludes QA and visualization. */
    public static String meaningDigest(LearningGoal goal) {
        return canonicalDigest(meaning(goal));
    }

    public static LearningUnitDefinition.GoalMeaning meaning(LearningGoal goal) {
        return new LearningUnitDefinition.GoalMeaning(goal.getId(), goal.getTitle(), goal.getTitleEn(),
                goal.getDescription(), goal.getDescriptionEn(), goal.getType(), goal.getNodeKind(), goal.getSemanticKind());
    }

    public static String resolvedKind(LearningGoal goal) {
        if (CompletionProfileCompiler.isAssessment(goal)) return "assessment";
        if (CompletionProfileCompiler.isMemory(goal)) return "memory";
        if (CompletionProfileCompiler.isOrientation(goal)) return "orientation";
        return "ordinary";
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
