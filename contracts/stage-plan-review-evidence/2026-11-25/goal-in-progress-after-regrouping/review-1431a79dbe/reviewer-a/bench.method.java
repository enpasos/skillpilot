
    @ParameterizedTest
    @ValueSource(booleans = {false,true})
    void independentReadCost(boolean pilot) throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        String section = selectHessianMotionUnit("G9", "SekII", "GK");
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, Map.of("receiptCapability", map(context(), "completionContract").get("receiptCapability")));
        var model = new CompletionProfileCompiler().normalizePrerequisites(learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
        var cases = new LinkedHashMap<String,String>();
        cases.put("ordinary", "262f807a-30d0-503e-986f-856cbd048e8e");
        cases.put("moved-traffic", "4a2bf015-052b-4af0-aed7-324259fa1a8a");
        cases.put("moved-reference", "68c90ba6-c438-463c-9a53-cf61062d416a");
        cases.put("absent", null);
        for (var scenario : cases.entrySet()) {
            masteryRepository.deleteAll(masteryRepository.findByLearner_SkillpilotId(learnerId));
            if (scenario.getValue() != null) {
                var learner = learnerRepository.findById(learnerId).orElseThrow();
                masteryRepository.saveAllAndFlush(model.transitivePrerequisites(scenario.getValue()).stream()
                        .filter(id -> !id.equals(scenario.getValue())).map(id -> new Mastery(learner,id,1.0)).toList());
            }
            for (String reader : List.of("state","mcp")) {
                var elapsed = new java.util.ArrayList<Double>();
                Object last = null;
                int sampleCount=Integer.parseInt(System.getenv().getOrDefault("REVIEW_A_SAMPLES","48"));
                for (int i = -16; i < sampleCount; i++) {
                    var stored = learnerRepository.findById(learnerId).orElseThrow();
                    stored.setActiveGoalId(scenario.getValue());
                    stored.setLearningState(scenario.getValue()==null ? LearningState.FRONTIER : LearningState.TEACHING);
                    learnerRepository.saveAndFlush(stored);
                    long started = System.nanoTime();
                    last = reader.equals("state") ? learners.getLearnerState(learnerId) : context();
                    double ms = (System.nanoTime()-started)/1e6;
                    if(i>=0) elapsed.add(ms);
                }
                var out = new LinkedHashMap<String,Object>();
                out.put("variant",System.getenv("RUN_VARIANT")); out.put("repeat",System.getenv("RUN_REPEAT"));
                out.put("pilot",pilot);out.put("scenario",scenario.getKey());out.put("reader",reader);out.put("ms",elapsed);
                var json=mapper.valueToTree(last);
                out.put("activeGoal",json.path("activeGoal").path("id")); out.put("learningState",json.path("learningState"));
                out.put("stateMachine",json.path("stateMachine"));
                out.put("focus",json.path("goals").path("planned"));
                out.put("storedActive",learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId());
                out.put("storedFocus",focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).toList());
                System.out.println("REVIEW_A_BENCH "+mapper.writeValueAsString(out));
            }
        }
    }

    @ParameterizedTest
    @ValueSource(booleans = {false,true})
    void expiredDirectAssessmentOrigin(boolean global) throws Exception {
        returnToOrdinaryLearning();
        String examId = global ? "6eb917e6-a204-5150-833f-a4455c8a05b0" : EXAM;
        learners.startCompletionAssessment(learnerId,
            new CompletionAssessmentStart(PROFILE,examId,version()), "claude", "independent-a", java.time.Instant.now().plusSeconds(3600));
        var before = learners.getCoachLearnerState(learnerId);
        assertThat(before.activeGoal()).isNotNull();
        var stored = learnerRepository.findById(learnerId).orElseThrow();
        var wf = mapper.readValue(stored.getCompletionWorkflow(), com.skillpilot.backend.completion.CompletionWorkflowState.class);
        var old = wf.directAssessment();
        stored.setCompletionWorkflow(mapper.writeValueAsString(wf.withDirectAssessment(
            new com.skillpilot.backend.completion.CompletionWorkflowState.DirectAssessmentContext(
                old.provider(),old.sessionBinding(),old.goalId(), java.time.Instant.now().minusSeconds(1)))));
        learnerRepository.saveAndFlush(stored);
        var coach = learners.getCoachLearnerState(learnerId);
        var state = learners.getLearnerState(learnerId);
        var out = new LinkedHashMap<String,Object>();out.put("variant",System.getenv("RUN_VARIANT"));out.put("global",global);
        out.put("exam",examId);out.put("coachState",coach.learningState());out.put("state",state.learningState());
        out.put("coachActive",coach.activeGoal()==null?null:coach.activeGoal().id());out.put("stateActive",state.activeGoal()==null?null:state.activeGoal().id());
        out.put("directRunning",state.levelCompletion().directAssessmentRunning());out.put("notice",state.levelCompletion().notice());
        out.put("effectiveFocus",learners.getPlannedGoals(learnerId));
        out.put("storedActive",learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId());
        System.out.println("REVIEW_A_ORIGIN "+mapper.writeValueAsString(out));
    }
