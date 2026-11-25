    private List<String> mathProbeFrontier(List<String> roots) {
        return learnerService.getUncompactedRichFrontierForFocus(learnerId, roots).stream()
            .map(FrontierGoal::id).toList();
    }

    private void mathProbe(boolean exam, boolean pilot) throws Exception {
        ReflectionTestUtils.setField(learnerService,"unitAssessmentPilotEnabled",pilot);
        var log=new java.util.LinkedHashMap<String,Object>();
        log.put("type",exam?"exam":"handoff");log.put("pilot",pilot);
        try {
            prepareRepresentationLearningPlan();
            var day=LocalDate.parse("2026-09-02");
            var clock=Clock.fixed(day.atStartOfDay(ZoneId.of("Europe/Berlin")).toInstant(), ZoneId.of("Europe/Berlin"));
            ReflectionTestUtils.setField(learnerLearningPlanService,"clock",clock);
            String choose=CANONICAL_CHOOSE_REPRESENTATION_ID, create=CANONICAL_CREATE_REPRESENTATION_ID,
              orient=CANONICAL_MATH_SEK_ONE_ORIENTATION_ID, subject=CANONICAL_MATH_LANDSCAPE_ID;
            var other=java.util.stream.Stream.of(COMPOSITION_J10_SCOPE_ID,COMPOSITION_J9_SCOPE_ID,COMPOSITION_J8_SCOPE_ID)
              .filter(root->{var ids=learnerService.getLearningPlanFocusAtomicGoalIds(learnerId,subject,List.of(root));
                return ids!=null && !ids.isEmpty() && !ids.contains(create) && !ids.contains(choose);}).findFirst().orElseThrow();
            log.put("former",other);
            var blocks=new java.util.ArrayList<LearnerLearningPlanApi.Block>();
            blocks.add(new LearnerLearningPlanApi.Block("first","learning",CANONICAL_REPRESENTATION_CLUSTER_ID,"Erste",day,day,null,List.of(choose),List.of(CANONICAL_REPRESENTATION_CLUSTER_ID),true));
            blocks.add(new LearnerLearningPlanApi.Block("kept","learning",other,"Zweite",day,day,null,List.of(create),List.of(other),true));
            if(exam){
                blocks.add(new LearnerLearningPlanApi.Block("exam","milestone",null,"Klausur",null,null,day.plusDays(3),null,List.of(choose,create),true));
            }else{
                blocks.add(new LearnerLearningPlanApi.Block("later","learning",orient,"Orientierung",day.plusDays(7),day.plusDays(7),null,List.of(orient),List.of(orient),true));
            }
            var record=learnerLearningPlanRepository.findByLearner_SkillpilotIdAndLandscapeId(learnerId,subject).orElseThrow();
            record.setBlocksJson(objectMapper.writeValueAsString(blocks));
            learnerLearningPlanRepository.saveAndFlush(record);
            var plan=learnerLearningPlanService.getPlan(learnerId,subject,day);
            log.put("stale",plan.stale()); log.put("ownInitially",mathProbeFrontier(List.of(create)));
            if(exam){
                learnerService.setPlannedGoals(learnerId,Set.of(create));
                learnerService.setActiveGoal(learnerId,create);
                log.put("previousActive",learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId());
                log.put("examFrontier",mathProbeFrontier(List.of(choose,create)));
                var result=learnerLearningPlanService.activatePlans(learnerId,new LearnerLearningPlanApi.ActivateRequest(day,List.of(new LearnerLearningPlanApi.ActivationPlan(subject,plan.revision(),"Altplan",blocks))));
                log.put("activated",result.activeGoalId());
            }else{
                learnerService.setPreferences(learnerId,"SEQUENTIAL",false,null,null,true);
                learnerService.setPlannedGoals(learnerId,Set.of(choose));
                learnerService.setActiveGoal(learnerId,choose);
                var result=learnerService.setMastery(learnerId,new MasteryUpdateRequest(Map.of(choose,1.0),choose));
                log.put("masteredAnchor",learnerService.getMastery(learnerId).get(choose));
                log.put("handoff",learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId());
                log.put("ownAfter",mathProbeFrontier(List.of(create)));
                log.put("scopeAfter",mathProbeFrontier(List.of(choose,create,orient)));
                var after=learnerLearningPlanService.getPlan(learnerId,subject,day);
                log.put("next",after.nextEligibleGoal());log.put("resume",after.canContinue());
                var r=learnerLearningPlanService.reconcile(learnerId,new LearnerLearningPlanApi.ReconcileRequest(day));
                log.put("reconciledGoal",r.activeGoalId());log.put("focus",r.focusGoalId());
            }
        }catch(ResponseStatusException e){log.put("http",e.getStatusCode().value());log.put("reason",e.getReason());}
        finally{ReflectionTestUtils.setField(learnerService,"unitAssessmentPilotEnabled",true);
           System.out.println("MATH_REGROUP "+objectMapper.writeValueAsString(log));}
    }
    @Test void mathHandoffOff() throws Exception {mathProbe(false,false);}
    @Test void mathHandoffOn() throws Exception {mathProbe(false,true);}
    @Test void mathExamOff() throws Exception {mathProbe(true,false);}
    @Test void mathExamOn() throws Exception {mathProbe(true,true);}
