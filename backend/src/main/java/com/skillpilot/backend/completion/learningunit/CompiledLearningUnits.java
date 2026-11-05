package com.skillpilot.backend.completion.learningunit;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Shared static contracts; adjacency is linear in the archived graph, never all-pairs reachability. */
public final class CompiledLearningUnits {
    private final String digest;
    private final List<Unit> units;
    private final Map<LearningUnitDefinition.ContractRef, Integer> indices;
    private final Map<String, Set<Integer>> contractsByProtectedGoal;
    private final Set<String> ownedGoalIds;
    private final int[] childrenFirst;

    CompiledLearningUnits(String digest, List<Unit> units, int[] childrenFirst) {
        this.digest = digest;
        this.units = List.copyOf(units);
        this.childrenFirst = childrenFirst.clone();
        Map<LearningUnitDefinition.ContractRef, Integer> index = new LinkedHashMap<>();
        Map<String, Set<Integer>> reverse = new LinkedHashMap<>();
        Set<String> owned = new LinkedHashSet<>();
        for (int i = 0; i < units.size(); i++) {
            Unit unit = units.get(i);
            index.put(unit.definition().ref(), i);
            owned.addAll(unit.ownGoalIds());
            for (String id : unit.protectedGoalIds()) reverse.computeIfAbsent(id, ignored -> new LinkedHashSet<>()).add(i);
        }
        this.indices = Map.copyOf(index);
        Map<String, Set<Integer>> immutableReverse = new LinkedHashMap<>();
        reverse.forEach((id, contracts) -> immutableReverse.put(id, Set.copyOf(contracts)));
        this.contractsByProtectedGoal = Map.copyOf(immutableReverse);
        this.ownedGoalIds = Set.copyOf(owned);
    }

    public String digest() { return digest; }
    public List<LearningUnitDefinition> definitions() { return units.stream().map(Unit::definition).toList(); }
    public Set<String> ownedGoalIds() { return ownedGoalIds; }
    public Set<String> protectedGoalIds() { return contractsByProtectedGoal.keySet(); }
    public Set<String> targetGoalIds(LearningUnitDefinition.ContractRef ref) { return unit(ref).targetGoalIds(); }
    public long expandedEdgeCount() {
        return units.stream().mapToLong(unit -> unit.prerequisites().values().stream().mapToLong(List::size).sum()).sum();
    }

    Unit unit(LearningUnitDefinition.ContractRef ref) {
        Integer index = indices.get(ref);
        if (index == null) throw new IllegalArgumentException("Unknown learning-unit contract: " + ref);
        return units.get(index);
    }
    List<Unit> units() { return units; }
    int[] childrenFirst() { return childrenFirst; }
    Map<String, Set<Integer>> contractsByProtectedGoal() { return contractsByProtectedGoal; }

    record Unit(LearningUnitDefinition definition, Set<String> ownGoalIds, Set<String> protectedGoalIds,
                Map<String, List<String>> prerequisites, Set<String> targetGoalIds) { }
}
