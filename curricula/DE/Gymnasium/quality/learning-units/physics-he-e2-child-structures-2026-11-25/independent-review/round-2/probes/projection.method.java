
    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(booleans = {false, true})
    void readWithStoredCursor(boolean explicitlyTeaching) throws Exception {
        assertThat(learner.getLearningState()).isEqualTo(LearningState.FRONTIER);
        if (explicitlyTeaching) learner.setLearningState(LearningState.TEACHING);
        learner.setActiveGoalId(CANONICAL_SEK1_COORDINATE_GEOMETRY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_ANALYSIS_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());
        String before = learner.getLearningState().name();
        var state = learnerService.getLearnerState(LEARNER_ID);
        var observed = new java.util.LinkedHashMap<String,Object>();
        observed.put("before",before);
        observed.put("responseState",state.learningState());
        observed.put("responseActive",state.activeGoal() == null ? null : state.activeGoal().id());
        observed.put("afterStoredState",learner.getLearningState());
        observed.put("afterStoredActive",learner.getActiveGoalId());
        observed.put("chosen",state.goals().planned().stream().map(FrontierGoal::id).toList());
        System.out.println("E2_PROJECTION=" + new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(observed));
    }
