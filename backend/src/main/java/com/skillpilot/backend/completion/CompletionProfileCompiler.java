package com.skillpilot.backend.completion;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.PriorityQueue;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

/**
 * Strict canonical compilation. The caller resolves scope, identity aliases and qualified
 * references first; this compiler never silently repairs an unknown reference or self-edge.
 * References and contains/raw-requires cycles are checked globally. Other full-graph
 * authoring requirements remain the existing base-quality gates; compilation is not a
 * release approval. Expanded atomic cycles are checked only in the prerequisite-closed
 * context, so an unrelated expansion defect does not change this scope.
 */
public final class CompletionProfileCompiler {
    public CompiledCompletionProfile compile(
            CompletionProfileDefinition definition,
            Map<String, LearningGoal> canonicalGoals,
            Set<String> resolvedScopeTargetIds,
            Set<String> level2TargetIds,
            String curriculumGeneration) {
        validateDefinition(definition, curriculumGeneration);
        if (canonicalGoals == null || canonicalGoals.isEmpty()) fail("MISSING_REFERENCE", "No canonical goals");
        if (resolvedScopeTargetIds == null || resolvedScopeTargetIds.isEmpty()) fail("EMPTY_SCOPE", "Empty target scope");
        if (level2TargetIds == null) fail("FOREIGN_TARGET", "Missing authoritative Level-2 targets");

        Map<String, Node> nodes = snapshot(canonicalGoals);
        Map<String, Set<String>> contains = new TreeMap<>();
        Map<String, Set<String>> requires = new TreeMap<>();
        for (Node node : nodes.values()) {
            contains.put(node.id(), node.children());
            requires.put(node.id(), node.requires());
        }
        List<String> containsOrder = topologicalOrder(contains, "CONTAINS_CYCLE");
        topologicalOrder(requires, "REQUIRES_CYCLE");

        // Parent-before-child propagation follows every contains path, including multiple parents.
        Map<String, Set<String>> effective = new HashMap<>();
        for (Node node : nodes.values()) effective.put(node.id(), new TreeSet<>(node.requires()));
        for (String id : containsOrder) {
            for (String child : nodes.get(id).children()) effective.get(child).addAll(effective.get(id));
        }

        Map<String, Set<String>> atoms = new HashMap<>();
        for (int i = containsOrder.size() - 1; i >= 0; i--) {
            String id = containsOrder.get(i);
            Node node = nodes.get(id);
            Set<String> basis = new TreeSet<>();
            if (node.children().isEmpty()) basis.add(id);
            else for (String child : node.children()) basis.addAll(atoms.get(child));
            atoms.put(id, basis);
        }

        Set<String> targets = sorted(resolvedScopeTargetIds);
        Set<String> assessments = new TreeSet<>();
        for (String id : targets) {
            Node node = nodes.get(id);
            if (node == null) fail("MISSING_REFERENCE", "Unknown target " + id);
            if (!node.children().isEmpty()) fail("TARGET_NOT_ATOMIC", "Target is a cluster: " + id);
            if (!level2TargetIds.contains(id)) fail("FOREIGN_TARGET", "Target outside Personal Curriculum: " + id);
            if (node.assessment()) assessments.add(id);
        }
        if (assessments.isEmpty()) fail("NO_REQUIRED_ASSESSMENT", "Scope has no required assessment");

        Map<String, Set<String>> expanded = new TreeMap<>();
        Set<String> context = new TreeSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>(targets);
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (!context.add(id)) continue;
            Set<String> prerequisites = new TreeSet<>();
            for (String prerequisite : effective.get(id)) prerequisites.addAll(atoms.get(prerequisite));
            expanded.put(id, prerequisites);
            pending.addAll(prerequisites);
        }
        List<String> order = topologicalOrder(expanded, "ATOMIC_CYCLE");

        Set<String> protectedIds = new TreeSet<>();
        for (String id : context) if (nodes.get(id).protectedGoal()) protectedIds.add(id);
        for (String id : definition.protectedGoalIds()) {
            if (!context.contains(id)) fail("MISSING_REFERENCE", "Protected goal outside context: " + id);
            protectedIds.add(id);
        }

        List<String> ids = List.copyOf(context);
        Map<String, Integer> indices = new HashMap<>();
        for (int i = 0; i < ids.size(); i++) indices.put(ids.get(i), i);
        int[][] edges = new int[ids.size()][];
        for (int i = 0; i < ids.size(); i++) {
            edges[i] = expanded.get(ids.get(i)).stream().mapToInt(indices::get).toArray();
        }

        List<CompiledCompletionProfile.CompiledRule> rules = new ArrayList<>();
        Set<String> ruleIds = new HashSet<>();
        Map<String, Set<String>> reachabilityByAssessment = new HashMap<>();
        for (var rule : definition.rules().stream()
                .sorted(java.util.Comparator.comparing(CompletionProfileDefinition.WaiverRule::ruleId,
                        java.util.Comparator.nullsFirst(String::compareTo))).toList()) {
            if (rule == null || !text(rule.ruleId()) || !ruleIds.add(rule.ruleId())
                    || !text(rule.rationale()) || !text(rule.reviewRef()) || rule.assessmentGoalIds().isEmpty()) {
                fail("INVALID_RULE", "Missing/duplicate rule identity, review or supporting assessments");
            }
            Set<String> supporting = unique(rule.assessmentGoalIds(), "INVALID_RULE", "supporting assessments");
            Set<String> waivable = unique(rule.waivableGoalIds(), "INVALID_RULE", "waivable goals");
            if (!assessments.containsAll(supporting)) fail("INVALID_RULE", "Rule assessment is not required in this scope: " + rule.ruleId());
            for (String id : waivable) {
                if (!context.contains(id)) fail("MISSING_REFERENCE", "Waivable goal outside context: " + id);
                if (protectedIds.contains(id)) fail("PROTECTED_GOAL", "Rule waives a protected goal: " + id);
                boolean reachable = false;
                for (String assessment : supporting) {
                    Set<String> reachableIds = reachabilityByAssessment.computeIfAbsent(assessment,
                            key -> reachable(key, expanded));
                    if (reachableIds.contains(id)) { reachable = true; break; }
                }
                if (!reachable) fail("RULE_NOT_PREREQUISITE", "Waivable goal is not a strict assessment prerequisite: " + id);
            }
            rules.add(new CompiledCompletionProfile.CompiledRule(rule.ruleId(),
                    supporting.stream().map(indices::get).toList(), waivable.stream().map(indices::get).toList(),
                    List.copyOf(supporting)));
        }
        return new CompiledCompletionProfile(definition, curriculumGeneration, ids, edges,
                order.stream().mapToInt(indices::get).toArray(), targets, assessments, protectedIds, rules);
    }

    private static Map<String, Node> snapshot(Map<String, LearningGoal> goals) {
        Map<String, Node> nodes = new TreeMap<>();
        for (var entry : goals.entrySet()) {
            LearningGoal goal = entry.getValue();
            if (!text(entry.getKey()) || goal == null || !entry.getKey().equals(goal.getId())) {
                fail("IDENTITY_CONFLICT", "Canonical key must equal the nonempty goal ID");
            }
            Set<String> children = unique(goal.getContains(), "MISSING_REFERENCE", "contains references");
            Set<String> requires = unique(goal.getRequires(), "MISSING_REFERENCE", "requires references");
            if (goal.getType() != null && !goal.getType().isBlank()
                    && ("atomic".equalsIgnoreCase(goal.getType()) != children.isEmpty())) {
                fail("IDENTITY_CONFLICT", "Explicit atomic/cluster type disagrees with contains: " + goal.getId());
            }
            boolean assessment = isAssessment(goal);
            nodes.put(goal.getId(), new Node(goal.getId(), children, requires, assessment,
                    assessment || isOrientation(goal) || isMemory(goal)));
        }
        for (Node node : nodes.values()) {
            for (String ref : node.children()) if (!nodes.containsKey(ref)) fail("MISSING_REFERENCE", "Unknown contains reference " + ref);
            for (String ref : node.requires()) if (!nodes.containsKey(ref)) fail("MISSING_REFERENCE", "Unknown requires reference " + ref);
        }
        return nodes;
    }

    /** Shared completion type semantics, including current compatible legacy encodings. */
    public static boolean isAssessment(LearningGoal goal) {
        return goal != null && ("exam".equalsIgnoreCase(goal.getNodeKind()) || goal.getExamData() != null
                || "practiceAssessment".equalsIgnoreCase(goal.getSemanticKind())
                || "assessment".equalsIgnoreCase(goal.getSemanticKind()));
    }

    public static boolean isOrientation(LearningGoal goal) {
        if (goal == null) return false;
        if (text(goal.getSemanticKind())) return "orientation".equalsIgnoreCase(goal.getSemanticKind().trim());
        return goal.getTags() != null && goal.getTags().stream().anyMatch(tag -> tag != null
                && ("orientation".equalsIgnoreCase(tag.trim()) || "motivation".equalsIgnoreCase(tag.trim())));
    }

    public static boolean isMemory(LearningGoal goal) {
        if (goal == null) return false;
        if ("memory".equalsIgnoreCase(goal.getNodeKind()) || "memory".equalsIgnoreCase(goal.getSemanticKind())
                || "memorization".equalsIgnoreCase(goal.getSemanticKind())) return true;
        if (goal.getExtendedData() != null && goal.getExtendedData().get("vocabularySource") instanceof String) return true;
        return goal.getTags() != null && goal.getTags().stream().anyMatch(tag -> tag != null
                && (tag.startsWith("srs-deck") || "memorization".equals(tag)));
    }

    private static void validateDefinition(CompletionProfileDefinition definition, String generation) {
        if (definition == null || definition.schemaVersion() != 1 || !text(definition.id())
                || !text(definition.revision()) || !text(definition.levelScopeRef()) || !text(generation)
                || !text(definition.title().get("de")) || !text(definition.title().get("en"))) {
            fail("INVALID_PROFILE", "Profile identity, version, scope, titles and generation are required");
        }
        var review = definition.review();
        if (review == null || !text(review.reference()) || !text(review.scopeRevision())
                || !text(review.taskRevision()) || !text(review.rubricRevision())) {
            fail("INVALID_PROFILE", "Reviewed scope, task and rubric revisions are required");
        }
        for (var entry : definition.applicability().entrySet()) {
            if (!text(entry.getKey()) || entry.getValue().isEmpty()) fail("INVALID_PROFILE", "Empty applicability dimension");
            unique(entry.getValue(), "INVALID_PROFILE", "applicability values");
        }
        unique(definition.protectedGoalIds(), "INVALID_PROFILE", "protected goals");
    }

    private static Set<String> reachable(String source, Map<String, Set<String>> edges) {
        Set<String> found = new HashSet<>();
        ArrayDeque<String> queue = new ArrayDeque<>(edges.get(source));
        while (!queue.isEmpty()) {
            String id = queue.removeFirst();
            if (found.add(id)) queue.addAll(edges.get(id));
        }
        return found;
    }

    private static List<String> topologicalOrder(Map<String, Set<String>> edges, String cycleCode) {
        Map<String, Integer> incoming = new HashMap<>();
        edges.keySet().forEach(id -> incoming.put(id, 0));
        edges.values().forEach(refs -> refs.forEach(id -> incoming.merge(id, 1, Integer::sum)));
        PriorityQueue<String> ready = new PriorityQueue<>();
        incoming.forEach((id, count) -> { if (count == 0) ready.add(id); });
        List<String> order = new ArrayList<>();
        while (!ready.isEmpty()) {
            String id = ready.remove();
            order.add(id);
            for (String to : edges.get(id)) if (incoming.merge(to, -1, Integer::sum) == 0) ready.add(to);
        }
        if (order.size() != edges.size()) fail(cycleCode, "Cycle in " + cycleCode.toLowerCase(Locale.ROOT));
        return order;
    }

    private static Set<String> unique(List<String> values, String code, String kind) {
        Set<String> result = new TreeSet<>();
        if (values == null) return result;
        for (String value : values) {
            if (!text(value) || !result.add(value)) fail(code, "Invalid or duplicate " + kind);
        }
        return result;
    }

    private static Set<String> sorted(Set<String> values) {
        Set<String> result = new TreeSet<>();
        for (String value : values) {
            if (!text(value)) fail("MISSING_REFERENCE", "Empty target reference");
            result.add(value);
        }
        return result;
    }

    private static boolean text(String value) { return value != null && !value.isBlank(); }
    private static void fail(String code, String detail) { throw new CompletionCompilationException(code, detail); }
    private record Node(String id, Set<String> children, Set<String> requires, boolean assessment, boolean protectedGoal) { }
}
