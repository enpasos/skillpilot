package com.skillpilot.backend.ai.visiblesession;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import java.util.List;

/**
 * Visible-session compatibility adapter for the shared AI-safe state projection.
 */
final class VisibleSessionAiStatePreparer {

    private final CoachStateProjection projection;

    VisibleSessionAiStatePreparer(String publicBaseUrl) {
        this.projection = new CoachStateProjection(publicBaseUrl);
    }

    UnifiedLearnerStateResponse prepare(UnifiedLearnerStateResponse state) {
        return projection.project(state);
    }

    List<FrontierGoal> prepareNavigationGoals(List<FrontierGoal> goals) {
        return projection.projectNavigationGoals(goals);
    }
}
