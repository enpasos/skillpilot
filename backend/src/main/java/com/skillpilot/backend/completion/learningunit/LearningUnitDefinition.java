package com.skillpilot.backend.completion.learningunit;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Immutable published acquisition contract, compiled from authoritative placements. */
public record LearningUnitDefinition(
        int schemaVersion,
        String semantics,
        String contractId,
        String revision,
        SourceBinding sourceBinding,
        Map<String, String> title,
        Map<String, String> promise,
        Map<String, String> introduction,
        List<String> ownGoalIds,
        List<ContractRef> requiredChildContractRefs,
        List<String> ownAssessmentGoalIds,
        List<String> ownRecallGoalIds,
        List<String> ownOrientationGoalIds,
        Map<String, GoalMeaning> ownGoalMeanings,
        Map<String, String> ownResolvedKinds,
        Map<String, String> ownGoalMeaningDigests,
        Map<String, List<String>> atomicPrerequisites,
        Map<String, AssessmentClaim> assessmentClaims,
        String reviewRef) {

    public static final String SEMANTICS = "global-unit-recognition-v1";

    public LearningUnitDefinition {
        title = title == null ? Map.of() : Map.copyOf(title);
        promise = promise == null ? Map.of() : Map.copyOf(promise);
        introduction = introduction == null ? Map.of() : Map.copyOf(introduction);
        ownGoalIds = copy(ownGoalIds);
        requiredChildContractRefs = copy(requiredChildContractRefs);
        ownAssessmentGoalIds = copy(ownAssessmentGoalIds);
        ownRecallGoalIds = copy(ownRecallGoalIds);
        ownOrientationGoalIds = copy(ownOrientationGoalIds);
        ownGoalMeanings = ownGoalMeanings == null ? Map.of() : Map.copyOf(ownGoalMeanings);
        ownResolvedKinds = ownResolvedKinds == null ? Map.of() : Map.copyOf(ownResolvedKinds);
        ownGoalMeaningDigests = ownGoalMeaningDigests == null ? Map.of() : Map.copyOf(ownGoalMeaningDigests);
        Map<String, List<String>> prerequisites = new LinkedHashMap<>();
        if (atomicPrerequisites != null) atomicPrerequisites.forEach((id, edges) -> prerequisites.put(id, copy(edges)));
        atomicPrerequisites = java.util.Collections.unmodifiableMap(prerequisites);
        assessmentClaims = assessmentClaims == null ? Map.of() : Map.copyOf(assessmentClaims);
    }

    public ContractRef ref() { return new ContractRef(contractId, revision); }

    private static <T> List<T> copy(List<T> values) { return values == null ? List.of() : List.copyOf(values); }

    public record ContractRef(String contractId, String revision) implements Comparable<ContractRef> {
        @Override public int compareTo(ContractRef other) {
            int order = contractId.compareTo(other.contractId);
            return order == 0 ? revision.compareTo(other.revision) : order;
        }
        @Override public String toString() { return contractId + "@" + revision; }
    }

    public record SourceBinding(String landscapeId, String programUnitId, String placementRevision,
                                Map<String, String> compositionViewDigests) {
        public SourceBinding {
            compositionViewDigests = compositionViewDigests == null ? Map.of() : Map.copyOf(compositionViewDigests);
        }
    }

    public record GoalMeaning(String id, String title, String titleEn, String description, String descriptionEn,
                              String type, String nodeKind, String semanticKind) { }

    /** The full canonical assessment claim remains identical in every scope variant. */
    public record AssessmentClaim(List<String> coveredGoalIds, String taskRevision, String rubricRevision,
                                  String reviewRef) {
        public AssessmentClaim { coveredGoalIds = copy(coveredGoalIds); }
    }
}
