package com.skillpilot.backend.completion;

import com.skillpilot.backend.landscape.LearningGoal;
import java.util.ArrayDeque;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/**
 * Immutable personal learning basis from already resolved canonical atomic seeds.
 * Seed eligibility belongs to the caller; mastery, focus and source filters do not
 * change this closure. Only existing normalized canonical prerequisite edges are used.
 */
public record PersonalCurriculumLearningScope(
        Set<String> seedAtomicGoalIds,
        Set<String> learningAtomicGoalIds,
        Map<String, List<String>> requiredByPaths) {

    public PersonalCurriculumLearningScope {
        seedAtomicGoalIds = Collections.unmodifiableSet(new LinkedHashSet<>(seedAtomicGoalIds));
        learningAtomicGoalIds = Collections.unmodifiableSet(new LinkedHashSet<>(learningAtomicGoalIds));
        Map<String, List<String>> paths = new LinkedHashMap<>();
        requiredByPaths.forEach((id, path) -> paths.put(id, List.copyOf(path)));
        requiredByPaths = Collections.unmodifiableMap(paths);
    }

    /**
     * Computes seeds plus every effective transitive atomic prerequisite. Derived
     * atoms receive one shortest normalized seed-to-prerequisite witness; sorted
     * seeds and edges resolve ties deterministically. The closure traversal is one
     * multi-source BFS; materializing witnesses additionally costs their output size.
     */
    public static PersonalCurriculumLearningScope compile(
            Map<String, LearningGoal> canonicalGoals, Set<String> seedAtomicGoalIds) {
        if (seedAtomicGoalIds == null || seedAtomicGoalIds.isEmpty()) {
            throw new CompletionCompilationException("EMPTY_SCOPE", "Empty personal curriculum seed scope");
        }
        Set<String> seeds = new TreeSet<>();
        for (String id : seedAtomicGoalIds) {
            if (id == null || id.isBlank()) {
                throw new CompletionCompilationException("MISSING_REFERENCE", "Empty seed reference");
            }
            seeds.add(id);
        }

        var topology = new CompletionProfileCompiler().normalizePrerequisites(canonicalGoals);
        for (String id : seeds) {
            LearningGoal seed = canonicalGoals.get(id);
            if (seed == null) {
                throw new CompletionCompilationException("MISSING_REFERENCE", "Unknown seed " + id);
            }
            if (seed.getContains() != null && !seed.getContains().isEmpty()) {
                throw new CompletionCompilationException("TARGET_NOT_ATOMIC", "Seed is a cluster: " + id);
            }
        }
        topology.validateContext(seeds);

        Set<String> learning = new LinkedHashSet<>(seeds);
        Map<String, String> predecessor = new LinkedHashMap<>();
        ArrayDeque<String> pending = new ArrayDeque<>(seeds);
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            for (String prerequisite : topology.directPrerequisites(id)) {
                if (learning.add(prerequisite)) {
                    predecessor.put(prerequisite, id);
                    pending.addLast(prerequisite);
                }
            }
        }

        Map<String, List<String>> paths = new LinkedHashMap<>();
        for (String derived : predecessor.keySet()) {
            ArrayDeque<String> witness = new ArrayDeque<>();
            String cursor = derived;
            while (cursor != null) {
                witness.addFirst(cursor);
                cursor = predecessor.get(cursor);
            }
            paths.put(derived, List.copyOf(witness));
        }
        return new PersonalCurriculumLearningScope(seeds, learning, paths);
    }
}
