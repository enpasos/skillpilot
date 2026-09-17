package com.skillpilot.backend.api;

import com.skillpilot.backend.service.learningplan.PeriodBasis;

public record PreferencesRequest(
                String learningStrategy,
                Boolean autoPilot,
                Boolean strictMode,
                Boolean showGoalVisualizationsInChat,
                Boolean followLearningPlans,
                PeriodBasis learningPlanPeriodBasis) {

    public PreferencesRequest(
            String learningStrategy,
            Boolean autoPilot,
            Boolean strictMode,
            Boolean showGoalVisualizationsInChat,
            Boolean followLearningPlans) {
        this(learningStrategy, autoPilot, strictMode, showGoalVisualizationsInChat, followLearningPlans, null);
    }
}
