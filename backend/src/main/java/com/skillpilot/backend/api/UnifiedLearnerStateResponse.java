package com.skillpilot.backend.api;

import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;
import java.util.Set;

public record UnifiedLearnerStateResponse(
        String skillpilotId,
        LandscapeSummary curriculum,
        List<FrontierGoal> frontier,
        LearnerGoals goals,
        List<String> nextAllowedActions,
        Set<CopySource> copySources) {
}
