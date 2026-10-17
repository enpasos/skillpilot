package com.skillpilot.backend.service;

import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Explicit stored preparation for tests of legacy projection, never a frontier oracle. */
public final class CanonicalPrerequisiteTestContext {
    private CanonicalPrerequisiteTestContext() {}

    public static List<String> withStoredPrerequisites(
            LandscapeService landscapes,
            List<String> targetIds,
            List<String> storedIds,
            Set<String> suppliedByLegacyProjection) {
        Map<String, LearningGoal> goals = new LinkedHashMap<>();
        for (String landscapeId : List.of(
                "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a",
                "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced")) {
            landscapes.getById(landscapeId).getGoals().forEach(goal -> goals.put(goal.getId(), goal));
        }
        Map<String, Set<String>> requirements = new LinkedHashMap<>();
        goals.forEach((id, goal) -> requirements.put(id,
                new LinkedHashSet<>(goal.getRequires() == null ? List.of() : goal.getRequires())));
        boolean changed;
        do {
            changed = false;
            for (LearningGoal parent : goals.values()) {
                for (String child : parent.getContains() == null ? List.<String>of() : parent.getContains()) {
                    if (requirements.containsKey(child)) {
                        changed |= requirements.get(child).addAll(requirements.get(parent.getId()));
                        requirements.get(child).remove(child);
                    }
                }
            }
        } while (changed);
        Set<String> reached = new LinkedHashSet<>();
        List<String> pending = new ArrayList<>(targetIds);
        for (int i = 0; i < pending.size(); i++) {
            String id = pending.get(i);
            if (!goals.containsKey(id)) throw new IllegalArgumentException("Unknown fixture goal " + id);
            if (!reached.add(id)) continue;
            pending.addAll(requirements.get(id));
            // A required cluster also needs its existing constituent competencies.
            if (!targetIds.contains(id) && goals.get(id).getContains() != null) {
                pending.addAll(goals.get(id).getContains());
            }
        }
        reached.removeAll(targetIds);
        reached.removeAll(suppliedByLegacyProjection);
        Set<String> stored = new LinkedHashSet<>(storedIds);
        stored.addAll(reached);
        if (targetIds.stream().anyMatch(stored::contains)) {
            throw new IllegalArgumentException("The fixture must leave the tested targets unmastered.");
        }
        return List.copyOf(stored);
    }
}
