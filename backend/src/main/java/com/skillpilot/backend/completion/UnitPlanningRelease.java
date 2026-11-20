package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.ProgramUnit;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Authored immutable meaning of a planning grant, distinct from the scored material alone. */
public record UnitPlanningRelease(int schemaVersion, String revision, String ownerUnitId, String ownerRevision,
        List<String> viewIds, Review review, Map<String, GoalDefinition> goalDefinitions, String fingerprint) {
    public record Review(String path, String sha256) { }
    public record GoalDefinition(String definition, String profileFingerprint) { }
    private static final ObjectMapper MAPPER = new ObjectMapper()
            .setSerializationInclusion(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL);
    private static final List<String> DEFINITION_FIELDS = List.of("id", "type", "nodeKind", "title", "titleEn",
            "description", "descriptionEn", "tags", "contains", "requires", "semanticAtomic", "dimensionTags",
            "examData", "extendedData", "release");

    public UnitPlanningRelease {
        viewIds = viewIds == null ? List.of() : List.copyOf(viewIds);
        goalDefinitions = goalDefinitions == null ? Map.of() : Map.copyOf(goalDefinitions);
    }

    public boolean appliesTo(String viewId) {
        if (viewId == null) return false;
        return viewId.startsWith("merged:")
                ? viewIds.containsAll(List.of(viewId.substring(7).split("\\+", -1))) : viewIds.contains(viewId);
    }

    /** R1/R2 evidence belongs to the dated canonical unit and its own assessments. */
    public boolean hasReviewedOwnership(SkillLandscape landscape, UnitAssessmentContract contract,
            UnitAssessmentContract.PlanningCredit rule) {
        if (blank(ownerUnitId) || blank(ownerRevision) || review == null || blank(review.path())
                || landscape == null || landscape.getProgramUnits() == null || landscape.getGoalPlacements() == null) return false;
        var owners = landscape.getProgramUnits().stream().filter(unit -> ownerUnitId.equals(unit.getId())).toList();
        if (owners.size() != 1) return false;
        ProgramUnit unit = owners.getFirst();
        if (!unit.isLearningUnit() || !ownerRevision.equals(unit.getRevision()) || unit.getCoverageReviews() == null) return false;

        Set<String> expected = new HashSet<>(rule.goalIds());
        expected.addAll(rule.requiredPartIds());
        Set<String> owned = new HashSet<>();
        for (var placement : landscape.getGoalPlacements()) {
            if (!placement.isOwnership() || !expected.contains(placement.getGoalId())) continue;
            if (!ownerUnitId.equals(placement.getUnitId()) || !owned.add(placement.getGoalId())) return false;
        }
        if (!owned.equals(expected)) return false;
        Set<String> covered = new HashSet<>();
        for (var part : contract.parts()) {
            if (!rule.requiredPartIds().contains(part.goalId())) continue;
            var reviews = unit.getCoverageReviews().stream()
                    .filter(row -> part.goalId().equals(row.getAssessmentGoalId())).toList();
            if (reviews.size() != 1) return false;
            var row = reviews.getFirst();
            if (!review.path().equals(row.getReference()) || !part.material().taskRevision().equals(row.getTaskRevision())
                    || !part.material().rubricRevision().equals(row.getRubricRevision())
                    || row.getGoalIds() == null || row.getGoalIds().isEmpty()) return false;
            covered.addAll(row.getGoalIds());
        }
        return covered.containsAll(rule.goalIds());
    }

    public boolean valid(String landscapeId, String compositionNodeId, UnitAssessmentContract contract,
            UnitAssessmentContract.PlanningCredit rule, String viewId, Map<String, LearningGoal> goals) {
        if (schemaVersion != 1 || blank(revision) || blank(ownerUnitId) || blank(ownerRevision)
                || viewIds.isEmpty() || viewIds.stream().anyMatch(UnitPlanningRelease::blank)
                || viewIds.size() != Set.copyOf(viewIds).size() || !appliesTo(viewId)
                || review == null || blank(review.path()) || review.path().startsWith("/")
                || List.of(review.path().split("/", -1)).contains("..") || !digest(review.sha256())
                || !goalDefinitions.keySet().equals(Set.copyOf(rule.goalIds()))
                || goalDefinitions.values().stream().anyMatch(value -> value == null
                        || !digest(value.definition()) || !digest(value.profileFingerprint()))
                || !digest(fingerprint)) return false;
        for (String id : rule.goalIds()) {
            if (!goalDefinitions.get(id).definition().equals(definitionFingerprint(goals.get(id)))) return false;
        }
        return fingerprint.equals(calculateFingerprint(landscapeId, compositionNodeId, contract, rule));
    }

    public String calculateFingerprint(String landscapeId, String compositionNodeId,
            UnitAssessmentContract contract, UnitAssessmentContract.PlanningCredit rule) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("schemaVersion", schemaVersion);
        payload.put("landscapeId", landscapeId);
        payload.put("compositionNodeId", compositionNodeId);
        payload.put("revision", revision);
        payload.put("ownerUnitId", ownerUnitId);
        payload.put("ownerRevision", ownerRevision);
        payload.put("viewIds", viewIds.stream().sorted().toList());
        payload.put("review", review);
        payload.put("parts", contract.parts().stream().filter(part -> rule.requiredPartIds().contains(part.goalId()))
                .sorted(java.util.Comparator.comparing(UnitAssessmentContract.Part::goalId)).toList());
        payload.put("goalDefinitions", goalDefinitions);
        return hash(payload);
    }

    /** Same semantic-normal-form-v1 field contract as the authoring gate. */
    public static String definitionFingerprint(LearningGoal goal) {
        if (goal == null) return "";
        var source = MAPPER.valueToTree(goal);
        List<Map<String, Object>> fields = new ArrayList<>();
        for (String key : DEFINITION_FIELDS) {
            if (!source.has(key)) fields.add(Map.of("path", "/" + key, "state", "missing"));
            else {
                Object value = MAPPER.convertValue(source.get(key), Object.class);
                if ("tags".equals(key) && value instanceof List<?> tags) {
                    value = tags.stream().map(String::valueOf).sorted().toList();
                }
                Map<String, Object> field = new LinkedHashMap<>();
                field.put("path", "/" + key); field.put("state", "value"); field.put("value", value);
                fields.add(field);
            }
        }
        String semantic = hash(Map.of("domain", "skillpilot:semantic-kind-source-fingerprint:v1", "fields", fields));
        if (!source.has("experimentData") && !source.has("examples")) return semantic;
        Map<String, Object> complete = new LinkedHashMap<>();
        complete.put("semanticKindFingerprint", semantic);
        if (source.has("experimentData")) complete.put("experimentData", source.get("experimentData"));
        if (source.has("examples")) complete.put("examples", source.get("examples"));
        return hash(complete);
    }

    private static String hash(Object value) {
        try { return CompletionReviewBindings.canonicalHash(MAPPER.valueToTree(value), MAPPER); }
        catch (Exception invalid) { throw new IllegalArgumentException("Cannot bind a planning release", invalid); }
    }
    private static boolean blank(String value) { return value == null || value.isBlank(); }
    private static boolean digest(String value) { return value != null && value.matches("sha256:[a-f0-9]{64}"); }
}
