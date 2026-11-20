package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.domain.Learner;
import java.util.List;
import java.util.Map;
import java.util.Set;

public record LearnerDataDTO(
        Learner learner,
        Map<String, MasteryEntryDTO> mastery,
        List<String> plannedGoals,
        Set<CopySource> copySources,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        List<LearnerLearningPlanApi.PortablePlan> learningPlans,
        @JsonInclude(JsonInclude.Include.NON_NULL)
        PortableSrsData srsData,
        @JsonInclude(JsonInclude.Include.NON_EMPTY)
        Map<String, List<VerifiedExamPassResponse>> verifiedExamPasses) {
    public LearnerDataDTO(Learner learner, Map<String, MasteryEntryDTO> mastery,
            List<String> plannedGoals, Set<CopySource> copySources,
            List<LearnerLearningPlanApi.PortablePlan> learningPlans, PortableSrsData srsData) {
        this(learner, mastery, plannedGoals, copySources, learningPlans, srsData, null);
    }

    public LearnerDataDTO(
            Learner learner,
            Map<String, MasteryEntryDTO> mastery,
            List<String> plannedGoals,
            Set<CopySource> copySources,
            List<LearnerLearningPlanApi.PortablePlan> learningPlans) {
        this(learner, mastery, plannedGoals, copySources, learningPlans, null);
    }
}
