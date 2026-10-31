package com.skillpilot.backend.api;

import com.skillpilot.backend.service.learningplan.PeriodBasis;

public record PreferencesRequest(
                String learningStrategy,
                Boolean autoPilot,
                Boolean strictMode,
                Boolean showGoalVisualizationsInChat,
                Boolean followLearningPlans,
                PeriodBasis learningPlanPeriodBasis,
                Boolean useAssessmentShortcuts) {

    public PreferencesRequest(String learningStrategy, Boolean autoPilot, Boolean strictMode,
            Boolean showGoalVisualizationsInChat, Boolean followLearningPlans, PeriodBasis learningPlanPeriodBasis) {
        this(learningStrategy, autoPilot, strictMode, showGoalVisualizationsInChat,
                followLearningPlans, learningPlanPeriodBasis, null);
    }

    public PreferencesRequest(
            String learningStrategy,
            Boolean autoPilot,
            Boolean strictMode,
            Boolean showGoalVisualizationsInChat,
            Boolean followLearningPlans) {
        this(learningStrategy, autoPilot, strictMode, showGoalVisualizationsInChat, followLearningPlans, null, null);
    }
}
