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
        List<PrerequisiteBlocker> prerequisiteBlockers) {

    public StateMachineInfo {
        prerequisiteBlockers = prerequisiteBlockers == null ? List.of() : List.copyOf(prerequisiteBlockers);
    }

    public StateMachineInfo(
            String state,
            String requiredAction,
            List<FrontierGoal> goalOptions,
            List<LandscapeSummary> curriculumOptions,
            FrontierGoal activeGoal,
            List<LearningModeOption> modeOptions) {
        this(state, requiredAction, goalOptions, curriculumOptions, activeGoal, modeOptions, List.of());
    }

    public StateMachineInfo(
            String state,
            String requiredAction,
            List<FrontierGoal> goalOptions,
            List<LandscapeSummary> curriculumOptions,
            FrontierGoal activeGoal) {
        this(state, requiredAction, goalOptions, curriculumOptions, activeGoal, List.of());
    }

}
