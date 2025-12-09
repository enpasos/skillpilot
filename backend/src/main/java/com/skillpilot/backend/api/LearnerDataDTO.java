package com.skillpilot.backend.api;

import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.domain.Learner;
import java.util.List;
import java.util.Map;
import java.util.Set;

public record LearnerDataDTO(
                Learner learner,
                Map<String, Double> mastery,
                List<String> plannedGoals,
                Set<CopySource> copySources) {
}
