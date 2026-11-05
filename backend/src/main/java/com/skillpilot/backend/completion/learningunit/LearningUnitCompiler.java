package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.skillpilot.backend.completion.CompletionCompilationException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/** Validates frozen, reviewed contracts independently of current learner scope and outcomes. */
public final class LearningUnitCompiler {
    private final Set<LearningUnitDefinition> validated = java.util.Collections.newSetFromMap(new java.util.IdentityHashMap<>());
    public CompiledLearningUnits compile(Collection<LearningUnitDefinition> definitions) {
        if (definitions == null || definitions.isEmpty()) fail("EMPTY_UNIT_CATALOG", "No learning-unit contracts");
        Map<LearningUnitDefinition.ContractRef, LearningUnitDefinition> ordered = new TreeMap<>();
        Map<String, String> meanings = new HashMap<>();
        Map<String, LearningUnitDefinition.AssessmentClaim> assessments = new HashMap<>();
        Map<String, String> kinds = new HashMap<>();
        for (LearningUnitDefinition definition : definitions) {
            validate(definition);
            if (ordered.putIfAbsent(definition.ref(), definition) != null) fail("DUPLICATE_CONTRACT", "Duplicate " + definition.ref());
            for (String id : definition.ownGoalIds()) {
                String digest = definition.ownGoalMeaningDigests().get(id);
                String previous = meanings.putIfAbsent(id, digest);
                if (previous != null && !previous.equals(digest)) fail("GOAL_MEANING_CONFLICT", "Canonical goal meaning changed: " + id);
                String kind = definition.ownAssessmentGoalIds().contains(id) ? "assessment"
                        : definition.ownRecallGoalIds().contains(id) ? "recall"
                        : definition.ownOrientationGoalIds().contains(id) ? "orientation" : "ordinary";
                String previousKind = kinds.putIfAbsent(id, kind);
                if (previousKind != null && !previousKind.equals(kind)) fail("GOAL_MEANING_CONFLICT", "Canonical goal role changed: " + id);
            }
            definition.assessmentClaims().forEach((id, claim) -> {
                LearningUnitDefinition.AssessmentClaim previous = assessments.putIfAbsent(id, claim);
                if (previous != null && !sameClaim(previous, claim)) {
                    if (new HashSet<>(previous.coveredGoalIds()).equals(new HashSet<>(claim.coveredGoalIds()))) {
                        fail("ASSESSMENT_VARIANT_REVIEW_REQUIRED", "Equivalent task/rubric variant needs explicit review support: " + id);
                    }
                    fail("ASSESSMENT_MEANING_CONFLICT", "Canonical assessment claim changed: " + id);
                }
            });
        }

        List<LearningUnitDefinition.ContractRef> refs = List.copyOf(ordered.keySet());
        Map<LearningUnitDefinition.ContractRef, Set<LearningUnitDefinition.ContractRef>> children = new TreeMap<>();
        ordered.forEach((ref, definition) -> {
            Set<LearningUnitDefinition.ContractRef> required = new TreeSet<>();
            for (var child : definition.requiredChildContractRefs()) {
                if (child == null || !text(child.contractId()) || !text(child.revision()) || !required.add(child)
                        || !ordered.containsKey(child)) fail("MISSING_CHILD_CONTRACT", "Unknown/duplicate child of " + ref);
            }
            children.put(ref, required);
        });
        List<LearningUnitDefinition.ContractRef> parentsFirst = topological(children, "UNIT_CYCLE");
        Map<LearningUnitDefinition.ContractRef, Map<String, LearningUnitDefinition.ContractRef>> owners = new HashMap<>();
        for (int i = parentsFirst.size() - 1; i >= 0; i--) {
            var ref = parentsFirst.get(i);
            Map<String, LearningUnitDefinition.ContractRef> own = new TreeMap<>();
            for (String id : ordered.get(ref).ownGoalIds()) own.put(id, ref);
            for (var child : children.get(ref)) {
                owners.get(child).forEach((id, owner) -> {
                    var previous = own.putIfAbsent(id, owner);
                    if (previous != null && !previous.equals(owner)) fail("AMBIGUOUS_ACQUISITION_OWNER", "Multiple owners for " + id + " within " + ref);
                });
            }
            if (own.isEmpty()) fail("EMPTY_UNIT", "No own or required child targets: " + ref);
            owners.put(ref, own);
        }
        List<CompiledLearningUnits.Unit> compiled = new ArrayList<>();
        for (var ref : refs) {
            var definition = ordered.get(ref);
            Set<String> protectedIds = new TreeSet<>(definition.ownAssessmentGoalIds());
            protectedIds.addAll(definition.ownRecallGoalIds());
            compiled.add(new CompiledLearningUnits.Unit(definition, Set.copyOf(definition.ownGoalIds()),
                    Set.copyOf(protectedIds), definition.atomicPrerequisites(), Set.copyOf(owners.get(ref).keySet())));
        }
        Map<LearningUnitDefinition.ContractRef, Integer> indices = new HashMap<>();
        for (int i = 0; i < refs.size(); i++) indices.put(refs.get(i), i);
        int[] childrenFirst = new int[parentsFirst.size()];
        for (int i = 0; i < childrenFirst.length; i++) childrenFirst[i] = indices.get(parentsFirst.get(parentsFirst.size() - 1 - i));
        return new CompiledLearningUnits(digest(ordered.values()), compiled, childrenFirst);
    }

    private void validate(LearningUnitDefinition definition) {
        if (validated.contains(definition)) return;
        if (definition == null || definition.schemaVersion() != 1 || !LearningUnitDefinition.SEMANTICS.equals(definition.semantics())
                || !text(definition.contractId()) || !text(definition.revision()) || !localized(definition.title())
                || !localized(definition.promise()) || !localized(definition.introduction()) || !text(definition.reviewRef())) {
            fail("INVALID_UNIT_CONTRACT", "Contract identity, semantics, promise, introduction and review are required");
        }
        var binding = definition.sourceBinding();
        if (binding == null || !text(binding.landscapeId()) || !text(binding.programUnitId()) || !text(binding.placementRevision())) {
            fail("INVALID_SOURCE_BINDING", "Authoritative landscape, program unit and placement revision are required");
        }
        binding.compositionViewDigests().forEach((id, digest) -> {
            if (!text(id) || !text(digest)) fail("INVALID_SOURCE_BINDING", "Invalid composition binding");
        });
        Set<String> own = unique(definition.ownGoalIds(), "own targets");
        Set<String> assessment = unique(definition.ownAssessmentGoalIds(), "own assessments");
        Set<String> recall = unique(definition.ownRecallGoalIds(), "own recall");
        Set<String> orientation = unique(definition.ownOrientationGoalIds(), "own orientation");
        Set<String> classified = new HashSet<>();
        for (Set<String> group : List.of(assessment, recall, orientation)) for (String id : group) {
            if (!own.contains(id) || !classified.add(id)) fail("INVALID_UNIT_PARTITION", "Own target roles overlap or refer outside Own: " + id);
        }
        if (!definition.ownGoalMeaningDigests().keySet().equals(own) || !definition.ownGoalMeanings().keySet().equals(own)
                || !definition.ownResolvedKinds().keySet().equals(own)) {
            fail("MISSING_GOAL_MEANING", "Every own target requires its immutable meaning and digest");
        }
        definition.ownGoalMeaningDigests().forEach((id, digest) -> {
            if (!text(digest)) fail("MISSING_GOAL_MEANING", "Empty own target semantic digest: " + id);
            var meaning = definition.ownGoalMeanings().get(id);
            if (meaning == null || !id.equals(meaning.id()) || !"atomic".equals(meaning.type())
                    || !digest.equals(LearningUnitSourceBindings.canonicalDigest(meaning))) {
                fail("GOAL_MEANING_CONFLICT", "Invalid frozen atomic meaning: " + id);
            }
            String resolvedKind = definition.ownResolvedKinds().get(id);
            if (!Set.of("ordinary", "assessment", "memory", "orientation").contains(resolvedKind)) {
                fail("INVALID_UNIT_PARTITION", "Unsupported resolved archived goal kind: " + id);
            }
            boolean rawQ = "exam".equals(meaning.nodeKind()) || "assessment".equals(meaning.semanticKind()) || "practiceAssessment".equals(meaning.semanticKind());
            boolean rawK = "memory".equals(meaning.nodeKind()) || "memory".equals(meaning.semanticKind()) || "memorization".equals(meaning.semanticKind());
            boolean rawO = "orientation".equals(meaning.semanticKind());
            boolean q = "assessment".equals(resolvedKind);
            boolean k = "memory".equals(resolvedKind);
            boolean o = "orientation".equals(resolvedKind);
            if (rawQ && !q || rawK && !k || rawO && !o || o && !rawO
                    || rawQ && (rawK || rawO) || rawK && rawO) {
                fail("INVALID_UNIT_PARTITION", "Resolved kind contradicts frozen explicit semantics: " + id);
            }
            if ((q ? 1 : 0) + (k ? 1 : 0) + (o ? 1 : 0) > 1
                    || q != assessment.contains(id) || k != recall.contains(id) || o != orientation.contains(id)) {
                fail("INVALID_UNIT_PARTITION", "Archived goal semantics disagree with own roles: " + id);
            }
        });
        Map<String, Set<String>> graph = new TreeMap<>();
        definition.atomicPrerequisites().forEach((id, prerequisites) -> {
            if (!text(id)) fail("MISSING_REFERENCE", "Empty archived atomic identity");
            graph.put(id, unique(prerequisites, "atomic prerequisites"));
        });
        if (!graph.keySet().containsAll(own)) fail("MISSING_REFERENCE", "Own targets missing from archived atomic graph");
        graph.forEach((id, prerequisites) -> {
            if (!graph.keySet().containsAll(prerequisites)) fail("MISSING_REFERENCE", "Unresolved archived atomic prerequisite of " + id);
        });
        topological(graph, "ATOMIC_CYCLE");
        if (!definition.assessmentClaims().keySet().equals(assessment)) fail("INVALID_ASSESSMENT_CLAIM", "Each own assessment requires exactly one immutable canonical claim");
        Set<String> covered = new HashSet<>();
        definition.assessmentClaims().forEach((id, claim) -> {
            if (claim == null || !text(claim.taskRevision()) || !text(claim.rubricRevision()) || !text(claim.reviewRef())) {
                fail("INVALID_ASSESSMENT_CLAIM", "Task, normal rubric and independent review revisions are required: " + id);
            }
            Set<String> claimed = unique(claim.coveredGoalIds(), "canonical assessment coverage");
            Set<String> reachable = reach(graph, Set.of(id));
            reachable.remove(id);
            if (!reachable.containsAll(claimed)) fail("CLAIM_NOT_PREREQUISITE", "Claim not supported by archived full requirements: " + id);
            covered.addAll(claimed);
        });
        Set<String> ordinary = new HashSet<>(own);
        ordinary.removeAll(classified);
        if (!covered.containsAll(ordinary)) {
            ordinary.removeAll(covered);
            fail("UNCOVERED_OWN_TARGET", "Own ordinary targets lack an own reviewed assessment: " + ordinary);
        }
        validated.add(definition);
    }

    static Set<String> reach(Map<String, ? extends Collection<String>> graph, Collection<String> roots) {
        Set<String> found = new LinkedHashSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>(roots);
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (found.add(id)) pending.addAll(graph.get(id));
        }
        return found;
    }

    private static <T extends Comparable<? super T>> List<T> topological(Map<T, Set<T>> graph, String code) {
        Map<T, Integer> incoming = new HashMap<>();
        graph.keySet().forEach(id -> incoming.put(id, 0));
        graph.values().forEach(edges -> edges.forEach(id -> incoming.merge(id, 1, Integer::sum)));
        PriorityQueue<T> ready = new PriorityQueue<>();
        incoming.forEach((id, count) -> { if (count == 0) ready.add(id); });
        List<T> result = new ArrayList<>();
        while (!ready.isEmpty()) {
            T id = ready.remove();
            result.add(id);
            for (T prerequisite : graph.get(id)) if (incoming.merge(prerequisite, -1, Integer::sum) == 0) ready.add(prerequisite);
        }
        if (result.size() != graph.size()) fail(code, "Cycle in archived learning-unit graph");
        return result;
    }

    private static boolean sameClaim(LearningUnitDefinition.AssessmentClaim left, LearningUnitDefinition.AssessmentClaim right) {
        return new HashSet<>(left.coveredGoalIds()).equals(new HashSet<>(right.coveredGoalIds()))
                && left.taskRevision().equals(right.taskRevision()) && left.rubricRevision().equals(right.rubricRevision());
    }

    private static Set<String> unique(List<String> ids, String kind) {
        Set<String> result = new TreeSet<>();
        for (String id : ids) if (!text(id) || !result.add(id)) fail("INVALID_UNIT_CONTRACT", "Invalid or duplicate " + kind);
        return result;
    }
    private static boolean text(String value) { return value != null && !value.isBlank(); }
    private static boolean localized(Map<String, String> values) { return text(values.get("de")) && text(values.get("en")); }
    private static void fail(String code, String message) { throw new CompletionCompilationException(code, message); }
    private static String digest(Collection<LearningUnitDefinition> definitions) {
        try {
            byte[] content = new ObjectMapper().enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS).writeValueAsBytes(definitions);
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        } catch (JsonProcessingException | NoSuchAlgorithmException e) {
            throw new IllegalStateException("Cannot fingerprint immutable unit contracts", e);
        }
    }
}
