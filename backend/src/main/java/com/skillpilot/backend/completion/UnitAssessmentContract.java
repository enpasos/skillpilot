package com.skillpilot.backend.completion;

import com.skillpilot.backend.api.UnitAssessmentResponse;
import com.skillpilot.backend.api.VerifiedExamPassResponse;
import com.skillpilot.backend.landscape.LearningGoal;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/** Scoped representative assessment. Every part must have a passing receipt for the reviewed material. */
public record UnitAssessmentContract(String revision, List<String> viewIds, List<Part> parts, List<String> contentGoalIds,
        List<PlanningCredit> planningCredits) {
    private static final Pattern DIGEST = Pattern.compile("sha256:[a-f0-9]{64}");

    public record Part(String goalId, AssessmentMaterialRevision material) {
        public Part {
            if (goalId == null || goalId.isBlank() || material == null
                    || !validDigest(material.taskRevision()) || !validDigest(material.rubricRevision())
                    || !validDigest(material.fingerprint())) {
                throw new IllegalArgumentException("A unit assessment part requires an ID and bound material");
            }
        }

        private static boolean validDigest(String value) {
            return value != null && DIGEST.matcher(value).matches();
        }

        private boolean matches(VerifiedExamPassResponse pass) {
            return material.fingerprint().equals(pass.fingerprint())
                    && material.taskRevision().equals(pass.taskRevision())
                    && material.rubricRevision().equals(pass.rubricRevision());
        }
    }

    public record PlanningCredit(List<String> requiredPartIds, List<String> goalIds, UnitPlanningRelease release) {
        public PlanningCredit {
            requiredPartIds = checkedIds(requiredPartIds);
            goalIds = checkedIds(goalIds);
        }
        public PlanningCredit(List<String> requiredPartIds, List<String> goalIds) {
            this(requiredPartIds, goalIds, null);
        }
    }

    public UnitAssessmentContract {
        viewIds = checkedIds(viewIds);
        parts = List.copyOf(parts);
        contentGoalIds = checkedIds(contentGoalIds);
        planningCredits = List.copyOf(planningCredits);
        Set<String> examIds = new HashSet<>(checkedIds(parts.stream().map(Part::goalId).toList()));
        Set<String> contentIds = Set.copyOf(contentGoalIds);
        if (revision == null || revision.isBlank() || contentGoalIds.stream().anyMatch(examIds::contains)
                || planningCredits.stream().anyMatch(credit -> !examIds.containsAll(credit.requiredPartIds())
                        || !contentIds.containsAll(credit.goalIds()))) {
            throw new IllegalArgumentException("Unit assessment credit must use parts and content in its contract");
        }
    }

    public boolean appliesTo(String viewId) {
        if (viewId == null) return false;
        return viewId.startsWith("merged:")
                ? viewIds.containsAll(List.of(viewId.substring("merged:".length()).split("\\+", -1)))
                : viewIds.contains(viewId);
    }

    private static List<String> checkedIds(List<String> values) {
        List<String> ids = List.copyOf(values);
        if (ids.isEmpty() || ids.stream().anyMatch(String::isBlank) || new HashSet<>(ids).size() != ids.size()) {
            throw new IllegalArgumentException("Unit assessment IDs must be nonempty and unique");
        }
        return ids;
    }

    public Optional<UnitAssessmentResponse> evaluate(String sectionGoalId, Set<String> targetIds, Map<String, LearningGoal> graph,
            Map<String, List<VerifiedExamPassResponse>> receipts, Set<String> individuallyMastered) {
        if (!targetIds.containsAll(contentGoalIds) || !graph.keySet().containsAll(contentGoalIds)
                || parts.stream().anyMatch(part -> !targetIds.contains(part.goalId())
                        || graph.get(part.goalId()) == null || graph.get(part.goalId()).getExamData() == null)) {
            return Optional.empty();
        }
        List<UnitAssessmentResponse.Part> results = parts.stream().map(part -> new UnitAssessmentResponse.Part(
                part.goalId(), CompletionResponseProjection.titleFor(graph.get(part.goalId())),
                receipts.getOrDefault(part.goalId(), List.of()).stream().anyMatch(part::matches))).toList();
        Set<String> passed = results.stream().filter(UnitAssessmentResponse.Part::passed)
                .map(UnitAssessmentResponse.Part::goalId).collect(Collectors.toSet());
        // A material receipt alone has no planning-grant meaning. Only the shared runtime
        // projection may add credits from an approved release carried by the actual receipts.
        return Optional.of(new UnitAssessmentResponse(sectionGoalId, revision, passed.size() == parts.size(), results, List.of(),
                contentGoalIds.stream().filter(id -> !individuallyMastered.contains(id)).toList()));
    }
}
