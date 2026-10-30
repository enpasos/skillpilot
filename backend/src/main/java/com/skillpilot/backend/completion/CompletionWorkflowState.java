package com.skillpilot.backend.completion;

import java.time.Instant;

/** Private navigation state. Contains no mastery, score, pass or waiver result. */
public record CompletionWorkflowState(
        String profileId,
        String profileRevision,
        String curriculumGeneration,
        String curriculumId,
        String personalCurriculumDigest,
        String navigationIntent,
        String currentGoalId,
        DirectAssessmentContext directAssessment) {

    public record DirectAssessmentContext(
            String provider,
            String sessionBinding,
            String goalId,
            Instant expiresAt) {
        public boolean live(Instant now) {
            return expiresAt != null && expiresAt.isAfter(now);
        }
    }

    public CompletionWorkflowState withNavigation(String intent, String goalId) {
        return new CompletionWorkflowState(profileId, profileRevision, curriculumGeneration,
                curriculumId, personalCurriculumDigest, intent, goalId, null);
    }

    public CompletionWorkflowState withDirectAssessment(DirectAssessmentContext context) {
        return new CompletionWorkflowState(profileId, profileRevision, curriculumGeneration,
                curriculumId, personalCurriculumDigest, "required", context.goalId(), context);
    }
}
