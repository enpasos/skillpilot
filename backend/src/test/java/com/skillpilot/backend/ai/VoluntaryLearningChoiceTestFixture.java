package com.skillpilot.backend.ai;

import com.skillpilot.backend.api.*;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Synthetic response fixture for transport fidelity, never a real curriculum audit. */
public final class VoluntaryLearningChoiceTestFixture {
    private VoluntaryLearningChoiceTestFixture() { }

    public static UnifiedLearnerStateResponse choice(String description) {
        var goal = new FrontierGoal("A", "Goal A", description, "atomic", "tutor", "curricularAtomic",
                "Freiwillig verfügbar", List.of(), List.of(), null, null, null, null);
        var completion = new LevelCompletionResponse("invalid", "test", "automatic:personal-curriculum",
                "test", "test-generation", 0, Map.of(), null, 0, 0, 0, 0, 0, 0,
                List.of(), List.of(), List.of(), null, false, "completion_target_routes_uncovered", List.of());
        return new UnifiedLearnerStateResponse("fixture", null, List.of(), null, List.of("setActiveGoal"),
                List.of(), Set.of(), "FRONTIER", null,
                new StateMachineInfo("FRONTIER", "setActiveGoal", List.of(goal), List.of(), null), completion);
    }
}
