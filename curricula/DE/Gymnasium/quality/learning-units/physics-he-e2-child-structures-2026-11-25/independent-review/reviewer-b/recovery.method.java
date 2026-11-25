    @ParameterizedTest
    @CsvSource({"GK,false","GK,true","LK,false","LK,true"})
    void publishedChatRecovery(String course, boolean pilot) throws Exception {
        String gravity="eb0ffdea-c12d-56df-b7e8-c0297d2f8aff";
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String e2=selectHessianMotionUnit("G9","SekII",course)
                    .replace(":structure:physics-e1-motion",":structure:physics-e2-newton-and-conservation");
            learners.setPlannedGoals(learnerId, java.util.Set.of(e2));
            var learner=learnerRepository.findById(learnerId).orElseThrow();
            var gravityNeeds=new CompletionProfileCompiler().normalizePrerequisites(learners.getLearningPlanCompletionContext(learnerId).canonicalGoals()).transitivePrerequisites(gravity);
            masteryRepository.saveAllAndFlush(gravityNeeds.stream().map(id->new Mastery(learner,id,1.0)).toList());
            var beforeSettings=learner.getPersonalCurriculum();
            session=sessions.createFirstPartyLaunch(learnerId,new ClaudeV1CoachStartRequest("de","web-start")).learningSessionId();
            authenticate();
            successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,Map.of("receiptCapability",map(context(),"completionContract").get("receiptCapability")));
            var stored=learnerRepository.findById(learnerId).orElseThrow();
            stored.setActiveGoalId(gravity);
            stored.setLearningState(LearningState.TEACHING);
            learnerRepository.saveAndFlush(stored);
            var reconciled=learners.getLearnerState(learnerId);
            var result=new java.util.LinkedHashMap<String,Object>();
            result.put("course",course);result.put("pilot",pilot);
            result.put("activeAfterReconcile",reconciled.activeGoal()==null?null:reconciled.activeGoal().id());
            var failure=call(ClaudeV1Contract.TOOL_SET_ACTIVE_GOAL,writeArgs("same-e2-selection",version(),Map.of("goalId",gravity)));
            result.put("originalFocusSelectionError",failure.isError());
            var nav=mapper.valueToTree(successful(ClaudeV1Contract.TOOL_GET_NAVIGATION_OPTIONS,Map.of())).path("navigationOptions");
            var choices=new java.util.ArrayList<String>();
            com.fasterxml.jackson.databind.JsonNode selected=null;
            String e5=e2.replace(":structure:physics-e2-newton-and-conservation",":structure:he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089");
            for(var option:nav){
                String id=option.path("id").asText();
                choices.add(id);
                if(id.equals(e5) || (selected==null && id.contains(":structure:physics-e-phase")))selected=option;
            }
            if(selected==null && nav.size()>0)selected=nav.get(0);
            result.put("publishedOptions",choices);
            result.put("e5PublishedDirectly",choices.contains(e5));
            if(selected!=null){
                var goalIds=mapper.convertValue(selected.path("goalIds"),new TypeReference<List<String>>(){});
                result.put("chosenPublishedFocus",goalIds);
                var changed=call(ClaudeV1Contract.TOOL_SET_FOCUS,writeArgs("select-published-wider-scope",version(),Map.of("goalIds",goalIds)));
                result.put("focusWriteOK",!Boolean.TRUE.equals(changed.isError()));
                var wider=mapper.valueToTree(context());
                var visible=new java.util.ArrayList<String>();for(var item:wider.path("frontier"))visible.add(item.path("id").asText());
                result.put("gravityNowPublished",visible.contains(gravity));
                result.put("frontierCountAfterFocusChange",visible.size());
                var restarted=call(ClaudeV1Contract.TOOL_SET_ACTIVE_GOAL,writeArgs("choose-gravity-after-focus-change",version(),Map.of("goalId",gravity)));
                result.put("restartOK",!Boolean.TRUE.equals(restarted.isError()));
                var finalContext=mapper.valueToTree(context());
                result.put("active",finalContext.path("activeGoal").path("id"));
                result.put("action",finalContext.path("stateMachine").path("requiredAction"));
                result.put("paths",finalContext.path("activeGoalContext").path("unitPaths"));
            }
            result.put("personalCurriculumUnchanged",beforeSettings.equals(learnerRepository.findById(learnerId).orElseThrow().getPersonalCurriculum()));
            System.out.println("REVIEWBRECOVERY "+mapper.writeValueAsString(result));
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        }
    }
