package com.skillpilot.backend.completion.learningunit;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

/** Pure recognition: local demand uses explicit results only; its union has global effect. */
public final class LearningUnitEvaluator {
    public LearningUnitEvaluation evaluate(CompiledLearningUnits compiled, Set<String> explicitMastery) {
        return evaluate(compiled, explicitMastery, null, null).evaluation();
    }

    EvaluationState evaluate(CompiledLearningUnits compiled, Set<String> explicitMastery,
                            Set<String> previousMastery, List<Set<String>> previousCandidates) {
        Objects.requireNonNull(compiled, "compiled contracts");
        Objects.requireNonNull(explicitMastery, "explicit mastery");
        Set<Integer> changed = new LinkedHashSet<>();
        if (previousMastery == null || previousCandidates == null) {
            for (int i = 0; i < compiled.units().size(); i++) changed.add(i);
        } else {
            for (var entry : compiled.contractsByProtectedGoal().entrySet()) {
                if (explicitMastery.contains(entry.getKey()) != previousMastery.contains(entry.getKey())) changed.addAll(entry.getValue());
            }
        }
        List<Set<String>> candidates = previousCandidates == null ? new ArrayList<>() : new ArrayList<>(previousCandidates);
        if (previousCandidates == null) for (int i = 0; i < compiled.units().size(); i++) candidates.add(Set.of());
        for (int index : changed) {
            var unit = compiled.units().get(index);
            Set<String> open = new LinkedHashSet<>(unit.protectedGoalIds());
            open.removeAll(explicitMastery);
            Set<String> needed = LearningUnitCompiler.reach(unit.prerequisites(), open);
            Set<String> recognized = new LinkedHashSet<>(unit.ownGoalIds());
            recognized.removeAll(unit.protectedGoalIds());
            recognized.removeAll(needed);
            // Do not remove explicit ordinary mastery here: only protected result
            // changes affect demand, so these candidates are safe to reuse.
            candidates.set(index, Set.copyOf(recognized));
        }
        Set<String> implicit = new LinkedHashSet<>();
        candidates.forEach(implicit::addAll);
        implicit.removeAll(explicitMastery);
        Set<String> effective = new LinkedHashSet<>(explicitMastery);
        effective.addAll(implicit);
        Map<LearningUnitDefinition.ContractRef, LearningUnitEvaluation.UnitResult> results = new LinkedHashMap<>();
        for (int index : compiled.childrenFirst()) {
            var unit = compiled.units().get(index);
            Set<String> pending = new LinkedHashSet<>(unit.targetGoalIds());
            pending.removeAll(effective);
            boolean childrenComplete = unit.definition().requiredChildContractRefs().stream()
                    .allMatch(ref -> results.get(ref).complete());
            Set<String> localImplicit = new LinkedHashSet<>(candidates.get(index));
            localImplicit.removeAll(explicitMastery);
            int explicitCount = 0;
            int recognizedCount = 0;
            for (String id : unit.targetGoalIds()) {
                if (explicitMastery.contains(id)) explicitCount++;
                else if (implicit.contains(id)) recognizedCount++;
            }
            results.put(unit.definition().ref(), new LearningUnitEvaluation.UnitResult(
                    pending.isEmpty() && childrenComplete, localImplicit, pending,
                    unit.targetGoalIds().size(), explicitCount, recognizedCount));
        }
        return new EvaluationState(new LearningUnitEvaluation(explicitMastery, implicit, effective, results), List.copyOf(candidates));
    }

    record EvaluationState(LearningUnitEvaluation evaluation, List<Set<String>> candidates) { }
}
