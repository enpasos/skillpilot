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
                LearnerGoals goals,
                @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
                LevelCompletionResponse levelCompletion) {

        public MasteryUpdateResponse(Boolean saved, String savedGoalId, Double savedMastery,
                        List<FrontierGoal> frontier, List<String> nextAllowedActions, String learningState,
                        FrontierGoal activeGoal, StateMachineInfo stateMachine, LearnerGoals goals) {
                this(saved, savedGoalId, savedMastery, frontier, nextAllowedActions, learningState,
                        activeGoal, stateMachine, goals, null);
        }

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
