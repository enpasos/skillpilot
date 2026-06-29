package com.skillpilot.backend.api;

import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;

public record StateMachineInfo(
        String state,
        String requiredAction,
        List<FrontierGoal> goalOptions,
        List<LandscapeSummary> curriculumOptions,
        FrontierGoal activeGoal,
        List<LearningModeOption> modeOptions,
        GoalSourceLink activeGoalVisualization,
        String activeGoalVisualizationMarkdown) {

    public StateMachineInfo(
            String state,
            String requiredAction,
            List<FrontierGoal> goalOptions,
            List<LandscapeSummary> curriculumOptions,
            FrontierGoal activeGoal) {
        this(state, requiredAction, goalOptions, curriculumOptions, activeGoal, List.of(), null, null);
    }

    public StateMachineInfo(
            String state,
            String requiredAction,
            List<FrontierGoal> goalOptions,
            List<LandscapeSummary> curriculumOptions,
            FrontierGoal activeGoal,
            List<LearningModeOption> modeOptions) {
        this(state, requiredAction, goalOptions, curriculumOptions, activeGoal, modeOptions, null, null);
    }
}
