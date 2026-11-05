package com.skillpilot.backend.completion.learningunit;

import java.util.Map;
import java.util.Set;

/** Derived snapshot only. No field is a stored learner qualification or completion event. */
public record LearningUnitEvaluation(
        Set<String> explicitMasteryGoalIds,
        Set<String> recognizedGoalIds,
        Set<String> effectiveMasteryGoalIds,
        Map<LearningUnitDefinition.ContractRef, UnitResult> units) {
    public LearningUnitEvaluation {
        explicitMasteryGoalIds = Set.copyOf(explicitMasteryGoalIds);
        recognizedGoalIds = Set.copyOf(recognizedGoalIds);
        effectiveMasteryGoalIds = Set.copyOf(effectiveMasteryGoalIds);
        units = Map.copyOf(units);
    }

    public record UnitResult(boolean complete, Set<String> ownRecognizedGoalIds, Set<String> pendingGoalIds,
                             int targetCount, int explicitTargetCount, int recognizedTargetCount) {
        public UnitResult {
            ownRecognizedGoalIds = Set.copyOf(ownRecognizedGoalIds);
            pendingGoalIds = Set.copyOf(pendingGoalIds);
        }
    }
}
