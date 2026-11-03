package com.skillpilot.backend.completion;

import com.skillpilot.backend.domain.Learner;
import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.StreamReadFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Set;

/** One derived plan/navigation decision; never overwrites the learner's preference. */
public final class CompletionNavigationPolicy {
    private static final ObjectMapper PRIVATE_READER = new ObjectMapper(JsonFactory.builder()
            .enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION).build())
            .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);
    private static final Set<String> FIELDS = Set.of("profileId", "profileRevision", "curriculumGeneration",
            "curriculumId", "personalCurriculumDigest", "navigationIntent", "currentGoalId", "directAssessment",
            "assessmentStart");
    private CompletionNavigationPolicy() { }

    /** Only this exact server-owned normal form is non-owning. Route remnants fail closed. */
    public static CompletionWorkflowState normalAssessmentProcess(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            JsonNode node = PRIVATE_READER.readTree(json);
            if (!node.isObject()) return null;
            var names = node.fieldNames();
            while (names.hasNext()) if (!FIELDS.contains(names.next())) return null;
            for (String field : FIELDS) {
                if (!"assessmentStart".equals(field) && node.hasNonNull(field)) return null;
            }
            JsonNode start = node.get("assessmentStart");
            if (start == null || !start.isObject() || start.size() != 2
                    || !start.path("goalId").isTextual() || !start.path("taskFingerprint").isTextual()) return null;
            var association = new CompletionWorkflowState.AssessmentStart(
                    start.get("goalId").textValue(), start.get("taskFingerprint").textValue());
            return association.valid() ? CompletionWorkflowState.normalAssessmentStart(association) : null;
        } catch (Exception invalid) { return null; }
    }
    public static boolean ownsNavigation(Learner learner) {
        return learner != null && learner.getUseAssessmentShortcuts() && learner.getCompletionWorkflow() != null
                && !learner.getCompletionWorkflow().isBlank()
                && normalAssessmentProcess(learner.getCompletionWorkflow()) == null;
    }
    public static boolean followsPlans(Learner learner) {
        return learner != null && Boolean.TRUE.equals(learner.getFollowLearningPlans()) && !ownsNavigation(learner);
    }
}
