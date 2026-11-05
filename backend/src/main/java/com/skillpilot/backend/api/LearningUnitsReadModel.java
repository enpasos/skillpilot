package com.skillpilot.backend.api;

import com.skillpilot.backend.completion.learningunit.LearningUnitDefinition;
import java.util.List;
import java.util.Map;

/** Presentation of a shared derived snapshot; explicit mastery remains the existing mastery map. */
public record LearningUnitsReadModel(
        String calculationStatus,
        String semantics,
        String contractDigest,
        List<String> recognizedGoalIds,
        List<Unit> units,
        @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_EMPTY)
        List<String> voluntaryGoalIds) {
    public LearningUnitsReadModel {
        recognizedGoalIds = List.copyOf(recognizedGoalIds);
        units = List.copyOf(units);
        voluntaryGoalIds = voluntaryGoalIds == null ? List.of() : List.copyOf(voluntaryGoalIds);
    }

    public LearningUnitsReadModel(String calculationStatus, String semantics, String contractDigest,
                                  List<String> recognizedGoalIds, List<Unit> units) {
        this(calculationStatus, semantics, contractDigest, recognizedGoalIds, units, List.of());
    }

    public LearningUnitsReadModel withVoluntaryGoalIds(List<String> ids) {
        return new LearningUnitsReadModel(calculationStatus, semantics, contractDigest, recognizedGoalIds, units, ids);
    }

    public record Unit(
            String contractId,
            String revision,
            String programUnitId,
            Map<String, String> title,
            Map<String, String> promise,
            Map<String, String> introduction,
            List<String> ownGoalIds,
            List<LearningUnitDefinition.ContractRef> requiredChildContractRefs,
            List<String> ownAssessmentGoalIds,
            List<String> ownRecallGoalIds,
            boolean complete,
            int targetCount,
            int explicitTargetCount,
            int recognizedTargetCount,
            List<String> ownRecognizedGoalIds,
            List<String> pendingGoalIds,
            @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
            String calculationStatus) { }
}
