package com.skillpilot.backend.api;

import java.util.List;

public record PlannedGoalsMutationResponse(
        List<String> goals,
        UnifiedLearnerStateResponse state) {
}
