package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.util.LinkedHashMap;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.ArrayDeque;
import java.util.ArrayList;
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
        return load(curriculumId, Map.of());
    }

    /** Explicitly hydrated support remains lookup input, never an inferred target role. */
    public Map<String, LearningGoal> load(String curriculumId, Map<String, LearningGoal> supportDefinitions) {
        return load(curriculumId, null, supportDefinitions);
    }

    /** All Level-2 acquisition targets, independently of current focus or mastery. */
    public Map<String, LearningGoal> loadForTargets(String curriculumId, Set<String> level2AtomicTargets,
            Map<String, LearningGoal> supportDefinitions) {
        if (level2AtomicTargets == null || level2AtomicTargets.isEmpty()) {
            throw new CompletionCompilationException("EMPTY_SCOPE", "Empty Personal Curriculum target set");
        }
        return load(curriculumId, level2AtomicTargets, supportDefinitions);
    }

    private Map<String, LearningGoal> load(String curriculumId, Set<String> level2AtomicTargets,
            Map<String, LearningGoal> supportDefinitions) {
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
            // getClosure returns localized/presentation copies (including derived
            // applicability). They are not competing canonical identities.
            if (indexedLandscapes.add(landscape.getLandscapeId())) index(landscape, definitions, owners);
            if (level2AtomicTargets == null && landscape.getGoals() != null)
                landscape.getGoals().forEach(goal -> roots.add(goal.getId()));
        }
        if (level2AtomicTargets != null) roots.addAll(level2AtomicTargets);
        supportDefinitions.forEach((id, goal) -> {
            // An authored projection can intentionally collapse a canonical cluster.
            // Keep canonical structure here; the caller applies that explicit override.
            if (!definitions.containsKey(id)) definitions.put(id, new ArrayList<>(List.of(goal)));
            String owner = landscapes.getLandscapeIdForGoal(id);
            if (owner != null && !owner.isBlank()) owners.computeIfAbsent(id, ignored -> new LinkedHashSet<>()).add(owner);
        });
        Map<String, LearningGoal> catalog = new LinkedHashMap<>();
        definitions.forEach((id, variants) -> catalog.put(id, variants.getFirst()));
        Map<String, Set<String>> parents = new LinkedHashMap<>();
        catalog.forEach((id, goal) -> {
            if (goal.getContains() != null) for (String child : goal.getContains()) {
                String resolved = resolve(child, catalog, owners);
                parents.computeIfAbsent(resolved, ignored -> new LinkedHashSet<>()).add(id);
                // Retain failed qualification provenance if it claims an actual
                // child in this query. Unrelated malformed branches stay lookup-only.
                String candidate = qualifiedCandidate(child);
                if (!catalog.containsKey(resolved) && catalog.containsKey(candidate))
                    parents.computeIfAbsent(candidate, ignored -> new LinkedHashSet<>()).add(id);
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
                enqueue(resolve(ref, catalog, owners), true, full, pending);
            }
            if (includeChildren && goal.getContains() != null) for (String ref : goal.getContains()) {
                enqueue(resolve(ref, catalog, owners), true, full, pending);
            }
            for (String parent : parents.getOrDefault(id, Set.of())) enqueue(parent, false, full, pending);
        }
        Map<String, LearningGoal> normalized = new LinkedHashMap<>();
        for (String id : full.keySet()) {
            LearningGoal goal = catalog.get(id);
            LearningGoal copy = mapper.convertValue(goal, LearningGoal.class);
            List<String> children = normalize(goal.getContains(), catalog, owners);
            copy.setContains(full.get(id) ? children : children.stream().filter(child -> full.containsKey(child)
                    || !catalog.containsKey(child) && full.containsKey(qualifiedCandidate(child))).toList());
            copy.setRequires(normalize(goal.getRequires(), catalog, owners));
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

    private static String qualifiedCandidate(String reference) {
        if (reference == null) return null;
        int separator = reference.lastIndexOf(':');
        return separator < 0 ? null : reference.substring(separator + 1);
    }

    private List<String> normalize(List<String> references, Map<String, LearningGoal> graph,
            Map<String, Set<String>> owners) {
        return references == null ? List.of() : references.stream().map(ref -> resolve(ref, graph, owners)).toList();
    }

    private String resolve(String reference, Map<String, LearningGoal> graph, Map<String, Set<String>> owners) {
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
}
