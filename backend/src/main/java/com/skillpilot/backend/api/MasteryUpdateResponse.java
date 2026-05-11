package com.skillpilot.backend.api;

import java.util.List;

public record MasteryUpdateResponse(
                Boolean saved,
                String savedGoalId,
                Double savedMastery,
                List<FrontierGoal> frontier,
                List<String> nextAllowedActions,
                String learningState,
                FrontierGoal activeGoal,
                StateMachineInfo stateMachine,
                LearnerGoals goals) {

        public MasteryUpdateResponse(
                        List<FrontierGoal> frontier,
                        List<String> nextAllowedActions,
                        String learningState,
                        FrontierGoal activeGoal,
                        StateMachineInfo stateMachine,
                        LearnerGoals goals) {
                this(null, null, null, frontier, nextAllowedActions, learningState, activeGoal, stateMachine, goals);
        }
}
