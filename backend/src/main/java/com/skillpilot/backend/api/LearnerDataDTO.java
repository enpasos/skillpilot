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
        List<LearnerLearningPlanApi.PortablePlan> learningPlans) {
}
