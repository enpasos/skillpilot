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
        List<WaiverDetail> waiverDetails,
        UnitAssessmentResponse unitAssessment,
        List<String> planningCreditGoalIds) {
    public LevelCompletionResponse {
        waiverDetails = waiverDetails == null ? List.of() : List.copyOf(waiverDetails);
        planningCreditGoalIds = planningCreditGoalIds == null ? List.of() : List.copyOf(planningCreditGoalIds);
    }

    public LevelCompletionResponse(String calculationStatus, String contextRef, String profileId,
            String profileRevision, String curriculumGeneration, long learnerRevision, Map<String, String> title,
            Boolean complete, int masteredTargetCount, int waivedTargetCount, int pendingTargetCount, int targetCount,
            int masteredAssessmentCount, int requiredAssessmentCount, List<String> waivedTargetGoalIds,
            List<Assessment> assessments, List<ProfileOption> profileOptions, String navigationIntent,
            boolean directAssessmentRunning, String notice, List<Action> actions, List<WaiverDetail> waiverDetails,
            UnitAssessmentResponse unitAssessment) {
        this(calculationStatus, contextRef, profileId, profileRevision, curriculumGeneration, learnerRevision,
                title, complete, masteredTargetCount, waivedTargetCount, pendingTargetCount, targetCount,
                masteredAssessmentCount, requiredAssessmentCount, waivedTargetGoalIds, assessments, profileOptions,
                navigationIntent, directAssessmentRunning, notice, actions, waiverDetails, unitAssessment, List.of());
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
                navigationIntent, directAssessmentRunning, notice, actions, List.of(), null);
    }

    public LevelCompletionResponse withWaiverDetails(List<WaiverDetail> details) {
        return new LevelCompletionResponse(calculationStatus, contextRef, profileId, profileRevision,
                curriculumGeneration, learnerRevision, title, complete, masteredTargetCount, waivedTargetCount,
                pendingTargetCount, targetCount, masteredAssessmentCount, requiredAssessmentCount,
                waivedTargetGoalIds, assessments, profileOptions, navigationIntent, directAssessmentRunning,
                notice, actions, details, unitAssessment, planningCreditGoalIds);
    }

    public LevelCompletionResponse withUnitAssessment(UnitAssessmentResponse result) {
        return new LevelCompletionResponse(calculationStatus, contextRef, profileId, profileRevision,
                curriculumGeneration, learnerRevision, title, complete, masteredTargetCount, waivedTargetCount,
                pendingTargetCount, targetCount, masteredAssessmentCount, requiredAssessmentCount,
                waivedTargetGoalIds, assessments, profileOptions, navigationIntent, directAssessmentRunning,
                notice, actions, waiverDetails, result, planningCreditGoalIds);
    }

    public LevelCompletionResponse withPlanningCreditGoalIds(List<String> ids) {
        return new LevelCompletionResponse(calculationStatus, contextRef, profileId, profileRevision,
                curriculumGeneration, learnerRevision, title, complete, masteredTargetCount, waivedTargetCount,
                pendingTargetCount, targetCount, masteredAssessmentCount, requiredAssessmentCount,
                waivedTargetGoalIds, assessments, profileOptions, navigationIntent, directAssessmentRunning,
                notice, actions, waiverDetails, unitAssessment, ids);
    }

    /** Bounded explanation of the current derived scope result; never a historical evidence record. */
    public record WaiverDetail(String goalId, Map<String, String> title, String ruleId,
                              List<AssessmentReference> assessments, int assessmentCount) { }
    public record AssessmentReference(String goalId, Map<String, String> title) { }
    public record Assessment(String goalId, Map<String, String> title, boolean mastered,
                             boolean startAvailable, String unavailableReason,
                             @JsonInclude(JsonInclude.Include.NON_NULL) Boolean voluntary) {
        public Assessment(String goalId, Map<String, String> title, boolean mastered,
                boolean startAvailable, String unavailableReason) {
            this(goalId, title, mastered, startAvailable, unavailableReason, null);
        }
    }
    public record ProfileOption(String profileId, Map<String, String> title,
                                Integer targetCount, Integer requiredAssessmentCount,
                                List<Assessment> assessments) {
        public ProfileOption {
            assessments = assessments == null ? List.of() : List.copyOf(assessments);
        }
        public ProfileOption(String profileId, Map<String, String> title,
                             Integer targetCount, Integer requiredAssessmentCount) {
            this(profileId, title, targetCount, requiredAssessmentCount, List.of());
        }
        public ProfileOption(String profileId, Map<String, String> title) {
            this(profileId, title, null, null);
        }
    }
    public record PracticePrerequisite(String goalId, Map<String, String> title) { }
    public record PracticeStep(String startGoalId, List<PracticePrerequisite> openPrerequisites,
            @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
            String orientationGoalId) {
        public PracticeStep(String startGoalId, List<PracticePrerequisite> openPrerequisites) {
            this(startGoalId, openPrerequisites, null);
        }
    }
    public record Action(String action, String goalId, Map<String, String> title, String intent, PracticeStep practice) {
        public Action(String action, String goalId, Map<String, String> title, String intent) {
            this(action, goalId, title, intent, null);
        }
    }
}
