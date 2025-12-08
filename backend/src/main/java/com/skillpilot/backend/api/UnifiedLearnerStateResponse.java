package com.skillpilot.backend.api;

import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;

public record UnifiedLearnerStateResponse(
                String skillpilotId,
                LandscapeSummary curriculum,
                List<FrontierGoal> frontier,
                LearnerGoals goals,
                List<String> nextAllowedActions) {
}
