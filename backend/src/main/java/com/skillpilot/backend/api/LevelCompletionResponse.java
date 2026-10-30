package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;
import java.util.Map;

/** Contextual work completion; never substitutes for a learning goal's mastery. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record LevelCompletionResponse(
        String calculationStatus,
        String contextRef,
        String profileId,
        String profileRevision,
        String curriculumGeneration,
        long learnerRevision,
        Map<String, String> title,
        Boolean complete,
        int masteredTargetCount,
        int waivedTargetCount,
        int pendingTargetCount,
        int targetCount,
        int masteredAssessmentCount,
        int requiredAssessmentCount,
        List<String> waivedTargetGoalIds,
        List<Assessment> assessments,
        List<ProfileOption> profileOptions,
        String navigationIntent,
        boolean directAssessmentRunning,
        String notice,
        List<Action> actions,
        List<WaiverDetail> waiverDetails) {
    public LevelCompletionResponse {
        waiverDetails = waiverDetails == null ? List.of() : List.copyOf(waiverDetails);
    }

    public LevelCompletionResponse(String calculationStatus, String contextRef, String profileId,
            String profileRevision, String curriculumGeneration, long learnerRevision, Map<String, String> title,
            Boolean complete, int masteredTargetCount, int waivedTargetCount, int pendingTargetCount, int targetCount,
            int masteredAssessmentCount, int requiredAssessmentCount, List<String> waivedTargetGoalIds,
            List<Assessment> assessments, List<ProfileOption> profileOptions, String navigationIntent,
            boolean directAssessmentRunning, String notice, List<Action> actions) {
        this(calculationStatus, contextRef, profileId, profileRevision, curriculumGeneration, learnerRevision,
                title, complete, masteredTargetCount, waivedTargetCount, pendingTargetCount, targetCount,
                masteredAssessmentCount, requiredAssessmentCount, waivedTargetGoalIds, assessments, profileOptions,
                navigationIntent, directAssessmentRunning, notice, actions, List.of());
    }

    public LevelCompletionResponse withWaiverDetails(List<WaiverDetail> details) {
        return new LevelCompletionResponse(calculationStatus, contextRef, profileId, profileRevision,
                curriculumGeneration, learnerRevision, title, complete, masteredTargetCount, waivedTargetCount,
                pendingTargetCount, targetCount, masteredAssessmentCount, requiredAssessmentCount,
                waivedTargetGoalIds, assessments, profileOptions, navigationIntent, directAssessmentRunning,
                notice, actions, details);
    }

    /** Bounded explanation of the current derived scope result; never a historical evidence record. */
    public record WaiverDetail(String goalId, Map<String, String> title, String ruleId,
                              List<AssessmentReference> assessments, int assessmentCount) { }
    public record AssessmentReference(String goalId, Map<String, String> title) { }
    public record Assessment(String goalId, Map<String, String> title, boolean mastered,
                             boolean startAvailable, String unavailableReason) { }
    public record ProfileOption(String profileId, Map<String, String> title,
                                Integer targetCount, Integer requiredAssessmentCount) {
        public ProfileOption(String profileId, Map<String, String> title) {
            this(profileId, title, null, null);
        }
    }
    public record Action(String action, String goalId, Map<String, String> title, String intent) { }
}
