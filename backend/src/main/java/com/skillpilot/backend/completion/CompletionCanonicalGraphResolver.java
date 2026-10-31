package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
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
