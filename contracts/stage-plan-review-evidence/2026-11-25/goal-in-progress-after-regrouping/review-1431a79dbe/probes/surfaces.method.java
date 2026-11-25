    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void navigationAndVisibleFocus(boolean pilot) throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",pilot);
        String section = selectHessianMotionUnit("G9", "SekII", "GK");
        String moved = "4a2bf015-052b-4af0-aed7-324259fa1a8a";
        var model = new CompletionProfileCompiler().normalizePrerequisites(
                learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAllAndFlush(model.transitivePrerequisites(moved).stream().filter(id -> !id.equals(moved))
                .map(id -> new Mastery(learner,id,1.0)).toList());
        session=sessions.createFirstPartyLaunch(learnerId,new ClaudeV1CoachStartRequest("de","web-start")).learningSessionId();
        authenticate();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability",map(context(),"completionContract").get("receiptCapability")));
        for (var cursor : List.of("none",moved)) {
            var fresh=learnerRepository.findById(learnerId).orElseThrow();
            fresh.setActiveGoalId(cursor.equals("none")? null : cursor);
            fresh.setLearningState(cursor.equals("none")? LearningState.FRONTIER : LearningState.TEACHING);
            learnerRepository.saveAndFlush(fresh);
            var stored=focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).toList();
            assertThat(stored).containsExactly(section);
            var state=learners.getCoachLearnerState(learnerId);
            var payload=context();
            var result=new java.util.LinkedHashMap<String,Object>();
            result.put("pilot",pilot);result.put("storedCursor",cursor);result.put("storedFocus",stored);
            result.put("effectiveFocus",learners.getPlannedGoals(learnerId));
            result.put("navigation",learners.getScopeNavigationOptions(learnerId).stream().map(g->g.id()).toList());
            result.put("learnerStateFocus",state.goals().planned().stream().map(g->g.id()).toList());
            result.put("coachState",payload.get("stateMachine"));
            result.put("completion",mapper.valueToTree(state.levelCompletion()));
            result.put("cardStep",payload.get("cardStep"));
            result.put("requiredOrientationForMoved",learners.getRequiredUnitOrientationGoalId(learnerId,moved));
            result.put("treeAfterRead",focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).toList());
            System.out.println("GOAL_SURFACE_MEASUREMENT="+mapper.writeValueAsString(result));
        }
    }
