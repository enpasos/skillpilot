package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

/** Loads the pinned, unfiltered definition universe, independently of learner scope or transactions. */
@Component
public final class CompletionCanonicalGraphResolver {
    private final LandscapeService landscapes;
    private final ObjectMapper mapper;

    public CompletionCanonicalGraphResolver(LandscapeService landscapes, ObjectMapper mapper) {
        this.landscapes = landscapes;
        this.mapper = mapper;
    }

    /** Discover only current bases containing a complete reviewed scope; no learner data or graph copies. */
    public List<String> discoverCurriculumIds(Collection<CompletionScopeDefinition> scopes) {
        Set<String> candidates = new LinkedHashSet<>();
        for (var landscape : landscapes.getAll()) {
            String id = landscape.getLandscapeId();
            if (landscapes.isCompatibilityOnlyLandscape(id) || landscapes.isLegacyHiddenByDefaultLandscape(id)) continue;
            Set<String> goals = new LinkedHashSet<>();
            for (var member : landscapes.getClosure(id)) {
                if (member.getGoals() != null) member.getGoals().forEach(goal -> goals.add(goal.getId()));
            }
            if (scopes.stream().anyMatch(scope -> !scope.targetRootIds().isEmpty()
                    && goals.containsAll(scope.targetRootIds()))) candidates.add(id);
        }
        return candidates.stream().sorted().toList();
    }

    public Map<String, LearningGoal> load(String curriculumId) {
        Map<String, LearningGoal> graph = new LinkedHashMap<>();
        for (var landscape : landscapes.getClosure(curriculumId)) {
            if (landscape.getGoals() == null) continue;
            for (LearningGoal goal : landscape.getGoals()) {
                LearningGoal previous = graph.putIfAbsent(goal.getId(), goal);
                if (previous != null && previous != goal
                        && !mapper.valueToTree(previous).equals(mapper.valueToTree(goal))) {
                    throw new CompletionCompilationException("IDENTITY_CONFLICT", "Conflicting canonical goal: " + goal.getId());
                }
            }
        }
        Map<String, LearningGoal> normalized = new LinkedHashMap<>();
        for (LearningGoal goal : graph.values()) {
            LearningGoal copy = mapper.convertValue(goal, LearningGoal.class);
            copy.setContains(normalize(goal.getContains(), graph));
            copy.setRequires(normalize(goal.getRequires(), graph));
            normalized.put(copy.getId(), copy);
        }
        return normalized;
    }

    /** All authoritative Level-2 atomic targets, independently of current focus or mastery. */
    public Map<String, LearningGoal> loadForTargets(String curriculumId, Set<String> level2AtomicTargets,
            Map<String, LearningGoal> supportDefinitions) {
        if (level2AtomicTargets == null || level2AtomicTargets.isEmpty()) {
            throw new CompletionCompilationException("EMPTY_SCOPE", "Empty Personal Curriculum target set");
        }
        List<SkillLandscape> bases = landscapes.getClosure(curriculumId);
        Map<String, List<LearningGoal>> definitions = new LinkedHashMap<>();
        Map<String, Set<String>> owners = new LinkedHashMap<>();
        Set<String> roots = new LinkedHashSet<>();
        Set<String> indexedLandscapes = new LinkedHashSet<>();
        for (var landscape : landscapes.getAll()) {
            if (landscapes.isCompatibilityOnlyLandscape(landscape.getLandscapeId())
                    || landscapes.isLegacyHiddenByDefaultLandscape(landscape.getLandscapeId())) continue;
            index(landscape, definitions, owners);
            indexedLandscapes.add(landscape.getLandscapeId());
        }
        for (var landscape : bases) {
            // getClosure supplies membership only; its localized/presentation copies
            // (including derived applicability) are never canonical definitions.
            if (indexedLandscapes.add(landscape.getLandscapeId())) {
                SkillLandscape canonical = landscapes.getById(landscape.getLandscapeId());
                if (canonical != null) index(canonical, definitions, owners);
            }
        }
        roots.addAll(level2AtomicTargets);
        supportDefinitions.forEach((id, goal) -> {
            // An authored projection can intentionally collapse a canonical cluster.
            // Keep raw canonical variants for conflict checks; atomic target
            // structure is applied during closure resolution below.
            if (!definitions.containsKey(id)) definitions.put(id, new ArrayList<>(List.of(goal)));
            String owner = landscapes.getLandscapeIdForGoal(id);
            if (owner != null && !owner.isBlank()) owners.computeIfAbsent(id, ignored -> new LinkedHashSet<>()).add(owner);
        });
        Map<String, LearningGoal> catalog = new LinkedHashMap<>();
        definitions.forEach((id, variants) -> catalog.put(id, variants.getFirst()));
        Map<String, Set<String>> parents = new LinkedHashMap<>();
        definitions.forEach((id, variants) -> {
            // A direct authored goalEntry already makes this target atomic.
            // Its canonical children must not become inherited scope again.
            if (level2AtomicTargets.contains(id)) return;
            for (LearningGoal goal : variants) {
                if (goal.getContains() != null) for (String child : goal.getContains()) {
                    // Keep claims from every variant so a reached conflicting
                    // ancestor cannot disappear behind the first definition.
                    for (String candidate : containedGoalCandidates(child, catalog)) {
                        parents.computeIfAbsent(candidate, ignored -> new LinkedHashSet<>()).add(id);
                    }
                }
            }
        });

        // Full nodes contribute their children. Ancestor-only imports contribute
        // inheritance and requirements, without importing unrelated sibling branches.
        Map<String, Boolean> full = new LinkedHashMap<>();
        ArrayDeque<String> pending = new ArrayDeque<>();
        roots.forEach(id -> enqueue(id, true, full, pending));
        Map<String, Boolean> processed = new LinkedHashMap<>();
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            boolean includeChildren = full.get(id);
            if (processed.containsKey(id) && (processed.get(id) || !includeChildren)) continue;
            processed.put(id, includeChildren);
            LearningGoal goal = catalog.get(id);
            if (goal == null) throw new CompletionCompilationException("MISSING_REFERENCE", "Unknown canonical goal: " + id);
            for (LearningGoal variant : definitions.get(id)) {
                if (variant != goal && !mapper.valueToTree(goal).equals(mapper.valueToTree(variant))) {
                    throw new CompletionCompilationException("IDENTITY_CONFLICT", "Conflicting canonical goal: " + id);
                }
            }
            if (goal.getRequires() != null) for (String ref : goal.getRequires()) {
                enqueue(resolveOwned(ref, catalog, owners), true, full, pending);
            }
            if (includeChildren && !level2AtomicTargets.contains(id) && goal.getContains() != null) {
                for (String ref : goal.getContains()) {
                    enqueue(resolveOwned(ref, catalog, owners), true, full, pending);
                }
            }
            for (String parent : parents.getOrDefault(id, Set.of())) enqueue(parent, false, full, pending);
        }
        Map<String, LearningGoal> normalized = new LinkedHashMap<>();
        for (String id : full.keySet()) {
            LearningGoal goal = catalog.get(id);
            LearningGoal copy = mapper.convertValue(goal, LearningGoal.class);
            List<String> children = goal.getContains() == null ? List.of() : goal.getContains();
            if (level2AtomicTargets.contains(id) && !children.isEmpty()) {
                // Apply the existing authored atomic override before traversing
                // unused canonical children; own prerequisites remain unchanged.
                children = List.of();
                copy.setType("atomic");
            }
            if (!full.get(id)) children = children.stream().filter(child ->
                    containedGoalCandidates(child, catalog).stream().anyMatch(full::containsKey)).toList();
            copy.setContains(normalizeOwned(children, catalog, owners));
            copy.setRequires(normalizeOwned(goal.getRequires(), catalog, owners));
            normalized.put(copy.getId(), copy);
        }
        return normalized;
    }

    private static void index(SkillLandscape landscape, Map<String, List<LearningGoal>> definitions,
            Map<String, Set<String>> owners) {
        if (landscape.getGoals() == null) return;
        for (LearningGoal goal : landscape.getGoals()) {
            definitions.computeIfAbsent(goal.getId(), ignored -> new ArrayList<>()).add(goal);
            owners.computeIfAbsent(goal.getId(), ignored -> new LinkedHashSet<>()).add(landscape.getLandscapeId());
        }
    }

    private static void enqueue(String id, boolean includeChildren, Map<String, Boolean> full,
            ArrayDeque<String> pending) {
        if (id == null || id.isBlank()) throw new CompletionCompilationException("MISSING_REFERENCE", "Empty canonical reference");
        Boolean previous = full.get(id);
        if (previous == null || includeChildren && !previous) {
            full.put(id, includeChildren);
            pending.addLast(id);
        }
    }

    private static Set<String> containedGoalCandidates(String reference, Map<String, LearningGoal> graph) {
        if (reference == null || reference.isBlank()) return Set.of();
        if (graph.containsKey(reference)) return Set.of(reference);
        int separator = reference.lastIndexOf(':');
        if (separator >= 0) {
            String candidate = reference.substring(separator + 1);
            return graph.containsKey(candidate) ? Set.of(candidate) : Set.of();
        }
        Set<String> candidates = new LinkedHashSet<>();
        for (String id : graph.keySet()) {
            if (id != null && id.endsWith(":" + reference)) candidates.add(id);
        }
        return candidates;
    }

    private List<String> normalizeOwned(List<String> references, Map<String, LearningGoal> graph,
            Map<String, Set<String>> owners) {
        return references == null ? List.of() : references.stream().map(ref -> resolveOwned(ref, graph, owners)).toList();
    }

    private String resolveOwned(String reference, Map<String, LearningGoal> graph, Map<String, Set<String>> owners) {
        if (reference == null || graph.containsKey(reference)) return reference;
        int separator = reference.indexOf(':');
        if (separator >= 0) {
            if (separator == 0 || separator == reference.length() - 1
                    || reference.indexOf(':', separator + 1) >= 0) return reference;
            String owner = reference.substring(0, separator);
            String goal = reference.substring(separator + 1);
            return graph.containsKey(goal) && owners.getOrDefault(goal, Set.of()).contains(owner) ? goal : reference;
        }
        String resolved = null;
        for (String candidate : graph.keySet()) {
            if (!candidate.endsWith(":" + reference)) continue;
            if (resolved != null) throw new CompletionCompilationException("AMBIGUOUS_REFERENCE", "Ambiguous canonical reference: " + reference);
            resolved = candidate;
        }
        return resolved == null ? reference : resolved; // Compiler reports unresolved authored references.
    }

    private List<String> normalize(List<String> references, Map<String, LearningGoal> graph) {
        return references == null ? List.of() : references.stream().map(ref -> resolve(ref, graph)).toList();
    }

    private String resolve(String reference, Map<String, LearningGoal> graph) {
        if (reference == null || graph.containsKey(reference)) return reference;
        int separator = reference.indexOf(':');
        if (separator >= 0 && graph.containsKey(reference.substring(separator + 1))) {
            return reference.substring(separator + 1);
        }
        String resolved = null;
        for (String candidate : graph.keySet()) {
            if (!candidate.endsWith(":" + reference)) continue;
            if (resolved != null) throw new CompletionCompilationException("AMBIGUOUS_REFERENCE", "Ambiguous canonical reference: " + reference);
            resolved = candidate;
        }
        return resolved == null ? reference : resolved; // Compiler reports unresolved authored references.
    }
}
