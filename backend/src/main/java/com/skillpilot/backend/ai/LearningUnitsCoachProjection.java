package com.skillpilot.backend.ai;

import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.LearningUnitsReadModel;
import java.util.LinkedHashMap;
import java.util.Map;

/** Bounded presentation only; recognition and continuation remain server-owned. */
public final class LearningUnitsCoachProjection {
    private LearningUnitsCoachProjection() { }

    public static Map<String, Object> project(LearningUnitsReadModel units, FrontierGoal activeGoal) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("calculationStatus", units.calculationStatus());
        result.put("semantics", units.semantics());
        result.put("recognizedGoalCount", units.recognizedGoalIds().size());
        result.put("globallyEffective", true);
        if (activeGoal != null) {
            result.put("activeGoalRecognized", units.recognizedGoalIds().contains(activeGoal.id()));
            result.put("activeGoalVoluntaryRepetition", units.voluntaryGoalIds().contains(activeGoal.id()));
            result.put("units", units.units().stream().filter(unit -> unit.ownGoalIds().contains(activeGoal.id())
                    || unit.programUnitId().equals(activeGoal.id())).limit(3).map(unit -> Map.of(
                    "contractId", unit.contractId(), "revision", unit.revision(), "title", unit.title(),
                    "promise", unit.promise(), "complete", unit.complete(), "targetCount", unit.targetCount(),
                    "explicitTargetCount", unit.explicitTargetCount(), "recognizedTargetCount", unit.recognizedTargetCount())).toList());
        }
        return result;
    }
}
