package com.skillpilot.backend.api;

import java.util.List;

public record MasteryUpdateResponse(
        List<FrontierGoal> frontier,
        List<FrontierGoal> frontierAtomic,
        List<String> nextAllowedActions,
        String learningState,
        FrontierGoal activeGoal) {
}
