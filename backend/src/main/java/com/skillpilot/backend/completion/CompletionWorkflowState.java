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
        DirectAssessmentContext directAssessment,
        AssessmentStart assessmentStart) {

    /** Existing routes remain readable; unbound historical exams need deliberate confirmation. */
    public CompletionWorkflowState(String profileId, String profileRevision, String curriculumGeneration,
            String curriculumId, String personalCurriculumDigest, String navigationIntent,
            String currentGoalId, DirectAssessmentContext directAssessment) {
        this(profileId, profileRevision, curriculumGeneration, curriculumId, personalCurriculumDigest,
                navigationIntent, currentGoalId, directAssessment, null);
    }

    /** One current task association, never a result, score, history or submission receipt. */
    public record AssessmentStart(String goalId, String taskFingerprint) {
        public boolean valid() {
            return goalId != null && !goalId.isBlank() && taskFingerprint != null
                    && taskFingerprint.matches("sha256:[0-9a-f]{64}");
        }
    }

    public static CompletionWorkflowState normalAssessmentStart(AssessmentStart start) {
        return new CompletionWorkflowState(null, null, null, null, null, null, null, null, start);
    }

    public CompletionWorkflowState withAssessmentStart(AssessmentStart start) {
        return new CompletionWorkflowState(profileId, profileRevision, curriculumGeneration,
                curriculumId, personalCurriculumDigest, navigationIntent, currentGoalId, directAssessment, start);
    }

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
