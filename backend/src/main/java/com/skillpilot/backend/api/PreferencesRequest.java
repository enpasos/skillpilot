package com.skillpilot.backend.api;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.skillpilot.backend.service.learningplan.PeriodBasis;

@JsonIgnoreProperties("useAssessmentShortcuts") // Older cockpit clients still send the retired preference.
public record PreferencesRequest(
                String learningStrategy,
                Boolean autoPilot,
                Boolean strictMode,
                Boolean showGoalVisualizationsInChat,
                Boolean followLearningPlans,
                PeriodBasis learningPlanPeriodBasis,
                Boolean learningPlanCountOnlyExplicitGoals) {

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
