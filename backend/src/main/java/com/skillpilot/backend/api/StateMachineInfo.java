package com.skillpilot.backend.api;

import com.skillpilot.backend.landscape.LandscapeSummary;
import java.util.List;

public record StateMachineInfo(
        String state,
        String requiredAction,
        List<FrontierGoal> goalOptions,
        List<LandscapeSummary> curriculumOptions,
        FrontierGoal activeGoal) {
}
