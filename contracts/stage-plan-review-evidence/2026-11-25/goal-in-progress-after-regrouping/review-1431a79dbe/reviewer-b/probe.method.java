    private List<String> storedScope(String id) {
        return focus.findByLearner_SkillpilotId(id).stream().map(PlannedGoal::getGoalId).sorted().toList();
    }

    private void writeOldPointer(String id) {
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setActiveGoalId(id);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);
    }

    private Map<String, Object> coachSnapshot() throws Exception {
        var json = mapper.valueToTree(context());
        var record = new LinkedHashMap<String,Object>();
        record.put("active", json.path("activeGoal").path("id").asText(null));
        record.put("state", json.path("stateMachine").path("state").asText(null));
        record.put("action", json.path("stateMachine").path("requiredAction").asText(null));
        record.put("nextActions", json.path("nextAllowedActions"));
        record.put("focusedUnit", json.path("focusedUnitContext").path("sectionGoalId").asText(null));
        record.put("contract", json.has("completionContract"));
        return record;
    }

    private Map<String, Object> cockpitSnapshot(String id) {
        var state = learners.getLearnerState(id);
        var record = new LinkedHashMap<String,Object>();
        record.put("active",state.activeGoal()==null?null:state.activeGoal().id());
        record.put("state",state.learningState());
        record.put("action", state.stateMachine()==null?null:state.stateMachine().requiredAction());
        record.put("nextActions", state.nextAllowedActions());
        record.put("goalList",state.goals().planned().stream().map(item->item.id()).toList());
        record.put("storedActive",learnerRepository.findById(id).orElseThrow().getActiveGoalId());
        record.put("storedFocus", storedScope(id));
        return record;
    }

    private void confirmSession() throws Exception {
        authenticate();
        var c = context();
        if(c.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
            Map.of("receiptCapability",map(c,"completionContract").get("receiptCapability")));
    }

    private void reviewRecord(Map<String,Object> row) throws Exception {
        System.out.println("REVIEWB_TASK_E "+mapper.writeValueAsString(row));
    }

    @ParameterizedTest
    @CsvSource({"false,4a2bf015-052b-4af0-aed7-324259fa1a8a","true,4a2bf015-052b-4af0-aed7-324259fa1a8a",
                "false,68c90ba6-c438-463c-9a53-cf61062d416a","true,68c90ba6-c438-463c-9a53-cf61062d416a"})
    void reviewMoved(boolean pilot,String moved) throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",pilot);
        try {
            String e1=selectHessianMotionUnit("G9","SekII","GK");
            var learner=learnerRepository.findById(learnerId).orElseThrow();
            var required=new CompletionProfileCompiler().normalizePrerequisites(
                learners.getLearningPlanCompletionContext(learnerId).canonicalGoals()).transitivePrerequisites(moved);
            masteryRepository.saveAllAndFlush(required.stream().filter(id->!id.equals(moved)).map(id->new Mastery(learner,id,1.0)).toList());
            session=sessions.createFirstPartyLaunch(learnerId,new ClaudeV1CoachStartRequest("de","web-start")).learningSessionId();
            confirmSession();
            var row=new LinkedHashMap<String,Object>();
            row.put("case","moved");row.put("pilot",pilot);row.put("goal",moved);
            row.put("freshStartRejected",Boolean.TRUE.equals(call(ClaudeV1Contract.TOOL_SET_ACTIVE_GOAL,writeArgs("start-fresh",version(),Map.of("goalId",moved))).isError()));
            writeOldPointer(moved);
            row.put("storedBefore",storedScope(learnerId));row.put("activeBefore",learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId());
            long before=version();
            row.put("coach",coachSnapshot());row.put("coachRevisionDelta",version()-before);
            before=version();
            row.put("cockpit",cockpitSnapshot(learnerId));row.put("cockpitRevisionDelta",version()-before);
            var ordinaryPass=call(ClaudeV1Contract.TOOL_SET_MASTERY,writeArgs("pass-after-state-read",version(),Map.of("goalId",moved)));
            row.put("coachPassAfterCockpit",!Boolean.TRUE.equals(ordinaryPass.isError()));
            row.put("masteryAfterCockpitThenPass",learners.getMastery(learnerId).get(moved));
            row.put("afterPassAttempt",cockpitSnapshot(learnerId));
            if(!learners.getMastery(learnerId).containsKey(moved)) {
                writeOldPointer(moved);
                var immediate=call(ClaudeV1Contract.TOOL_SET_MASTERY,writeArgs("pass-before-state-read",version(),Map.of("goalId",moved)));
                row.put("coachPassWithOriginalStoredPointer",!Boolean.TRUE.equals(immediate.isError()));
                row.put("masteryWithOriginalStoredPointer",learners.getMastery(learnerId).get(moved));
            }
            reviewRecord(row);
        } finally {org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",true);}
    }

    @ParameterizedTest
    @ValueSource(booleans={false,true})
    void reviewDirectAndBackup(boolean pilot) throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",pilot);
        try {
            String e1=selectHessianMotionUnit("G9","SekII","GK");
            String child=e1.replace(":structure:physics-e1-motion",":structure:physics-e1-accelerated-and-free-fall");
            String exam="ee7d5f3d-858f-59d6-89b0-e5a7f437f458";
            learners.setPlannedGoals(learnerId, java.util.Set.of(child));
            assertThat(learners.resolveLearningPlanGoalIds(learnerId,"7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a",List.of(child))).doesNotContain(exam);
            String oldSession=session;
            var choice=learners.getLearnerState(learnerId).levelCompletion().profileOptions().stream()
                    .filter(option->option.assessments().stream().anyMatch(item->item.goalId().equals(exam)&&item.startAvailable()))
                    .filter(option->option.profileId().equals("automatic:"+e1)).findFirst().orElseThrow();
            session=sessions.createFirstPartyLaunch(learnerId,new ClaudeV1CoachStartRequest("de","web-start",
                    new CompletionAssessmentStart(choice.profileId(),exam,version()))).learningSessionId();
            String owner=session;
            confirmSession();
            var row=new LinkedHashMap<String,Object>();
            row.put("case","direct-and-backup");row.put("pilot",pilot);row.put("focus",child);row.put("goal",exam);
            row.put("owner",coachSnapshot());
            var archive=learners.exportLearner(learnerId);
            row.put("sourceStoredFocus",storedScope(learnerId));row.put("exportedFocus",archive.data().plannedGoals());
            var target=learners.createLearner().getSkillpilotId();
            learners.importLearner(target,mapper.readValue(mapper.writeValueAsBytes(archive),com.skillpilot.backend.api.SignedLearnerDataDTO.class));
            row.put("restoredFocus",storedScope(target));row.put("restoredActive",learnerRepository.findById(target).orElseThrow().getActiveGoalId());
            row.put("cockpit",cockpitSnapshot(learnerId));
            session=oldSession;confirmSession();
            row.put("foreign",coachSnapshot());
            row.put("foreignEvaluationDenied",Boolean.TRUE.equals(call(ClaudeV1Contract.TOOL_GET_EXAM_EVALUATION,Map.of("goalId",exam)).isError()));
            session=owner;authenticate();
            learners.chooseLevelCompletion(learnerId,new LevelCompletionActionRequest("leaveProfile",null,null,null,version()));
            row.put("afterLeave",cockpitSnapshot(learnerId));
            reviewRecord(row);
        } finally {org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",true);}
    }

    @ParameterizedTest
    @ValueSource(booleans={false,true})
    void reviewGlobalAndOrdinaryBackup(boolean pilot) throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",pilot);
        try {
            String e1=selectHessianMotionUnit("G9","SekII","GK");
            String traffic="4a2bf015-052b-4af0-aed7-324259fa1a8a";
            String global="26c1e946-e858-57ef-a19b-d6bb295c76f4";
            String physics="7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            session=sessions.createFirstPartyLaunch(learnerId,new ClaudeV1CoachStartRequest("de","web-start")).learningSessionId();
            confirmSession();
            var row=new LinkedHashMap<String,Object>();
            row.put("case","global-and-ordinary-backup");row.put("pilot",pilot);
            row.put("goal",global);row.put("explicitFocus",e1);
            row.put("globalVisible",learners.getLearningPlanCompletionContext(learnerId).level2TargetGoalIds().contains(global));
            row.put("globalUnderE1",learners.resolveLearningPlanGoalIds(learnerId,physics,List.of(e1)).contains(global));
            // A stored legacy pointer with no direct-assessment binding or current assessment focus.
            writeOldPointer(global);
            row.put("globalCoach",coachSnapshot());
            row.put("globalCockpit",cockpitSnapshot(learnerId));
            // A goal genuinely in progress before regrouping. Keep the normal E1 stored focus.
            writeOldPointer(traffic);
            var archive=learners.exportLearner(learnerId);
            row.put("storedFocusWhenBackedUp",storedScope(learnerId));row.put("exportedFocus",archive.data().plannedGoals());
            var target=learners.createLearner().getSkillpilotId();
            learners.importLearner(target,mapper.readValue(mapper.writeValueAsBytes(archive),com.skillpilot.backend.api.SignedLearnerDataDTO.class));
            row.put("restored",cockpitSnapshot(target));
            var nav=learners.getScopeNavigationOptions(learnerId);
            row.put("navigation",nav.stream().map(option->Map.of("id",option.id(),"selection",option.selectionGoalIds()==null?List.of(option.id()):option.selectionGoalIds())).toList());
            learners.setPlannedGoals(learnerId,java.util.Set.of(e1.replace(":structure:physics-e1-motion",":structure:physics-e1-accelerated-and-free-fall")));
            row.put("afterExplicitFocusChange",cockpitSnapshot(learnerId));
            reviewRecord(row);
        } finally {org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",true);}
    }
