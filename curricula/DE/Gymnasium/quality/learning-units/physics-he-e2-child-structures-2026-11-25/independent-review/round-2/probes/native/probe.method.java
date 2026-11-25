    private java.util.Map<String,Double> nativeMastery() {
        var result = new java.util.TreeMap<String,Double>();
        masteryRepository.findByLearner_SkillpilotId(learnerId).forEach(m -> result.put(m.getGoalKey(), m.getValue()));
        return result;
    }
    private java.util.List<String> nativeFocus() {
        return focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).sorted().toList();
    }
    private java.util.Map<String,Object> nativeState(com.skillpilot.backend.api.UnifiedLearnerStateResponse state) {
        var s = new java.util.LinkedHashMap<String,Object>();
        s.put("activeGoal", state.activeGoal() == null ? null : state.activeGoal().id());
        s.put("learningState", state.learningState());
        s.put("planned", state.goals().planned().stream().map(g -> g.id()).toList());
        s.put("stateMachine", state.stateMachine());
        s.put("storedFocus", nativeFocus());
        s.put("storedActive", learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId());
        s.put("mastery", nativeMastery());
        return s;
    }

    @ParameterizedTest
    @CsvSource({"GK,false","GK,true","LK,false","LK,true"})
    void independentStoredE2GoalReadAndAuthenticatedPass(String course, boolean pilot) throws Exception {
        Object pilotBefore = org.springframework.test.util.ReflectionTestUtils.getField(learners,"unitAssessmentPilotEnabled");
        org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",pilot);
        try {
            String physics="7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            String gravity="eb0ffdea-c12d-56df-b7e8-c0297d2f8aff";
            String e2=selectHessianMotionUnit("G9","SekII",course).replace(":structure:physics-e1-motion",":structure:physics-e2-newton-and-conservation");
            learners.setPlannedGoals(learnerId,java.util.Set.of(e2));
            var selected = learners.resolveLearningPlanGoalIds(learnerId,physics,List.of(e2));
            var planningScope = learners.getPlanningScope(learnerId,physics).scopeAtomicGoalIds();
            var projectedTargets = learners.getLearningPlanCompletionContext(learnerId).level2TargetGoalIds().stream().sorted().toList();
            var examined = new java.util.ArrayList<java.util.Map<String,Object>>();
            for(String id:List.of("22561c66-3957-5d55-b07a-25de1f359930","72649cf5-893c-5f03-88bd-a2497171d434")) examined.add(Map.of("goalId",id,"planningScope",planningScope.contains(id),"e2Selection",selected.contains(id),"personalCurriculumTarget",projectedTargets.contains(id)));
            var projectionRecord = Map.of("course",course,"unitPilot",pilot,"e2",e2,"examMembership",examined,"planningScopeAtomicGoalIds",planningScope,"e2SelectedGoalIds",selected,"personalCurriculumTargetGoalIds",projectedTargets);
            java.nio.file.Files.writeString(java.nio.file.Path.of(System.getenv("CUT_EVIDENCE"),"projection-"+course+"-"+pilot+".json"),mapper.writerWithDefaultPrettyPrinter().writeValueAsString(projectionRecord));
            System.out.println("NATIVE_PROJECTION "+mapper.writeValueAsString(projectionRecord));
            assertThat(selected).doesNotContain(gravity);
            var prereqs = new CompletionProfileCompiler().normalizePrerequisites(learners.getLearningPlanCompletionContext(learnerId).canonicalGoals()).transitivePrerequisites(gravity);
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            masteryRepository.saveAllAndFlush(prereqs.stream().map(id -> new Mastery(learner,id,1.0)).toList());
            learner.setActiveGoalId(gravity);
            learner.setLearningState(LearningState.TEACHING);
            learnerRepository.saveAndFlush(learner);
            var expectedBefore = nativeMastery();
            long readVersion = version();
            session=sessions.createFirstPartyLaunch(learnerId,new ClaudeV1CoachStartRequest("de","web-start")).learningSessionId();
            authenticate();
            var pending=context();
            if(pending.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,Map.of("receiptCapability",map(pending,"completionContract").get("receiptCapability")));
            var ctx=mapper.valueToTree(context());
            var coach=learners.getCoachLearnerState(learnerId);
            var normal=learners.getLearnerState(learnerId);
            var before=nativeState(normal);
            assertThat(ctx.path("activeGoal").path("id").asText()).isEqualTo(gravity);
            assertThat(coach.activeGoal().id()).isEqualTo(gravity);
            assertThat(normal.activeGoal().id()).isEqualTo(gravity);
            assertThat(normal.learningState()).isEqualTo("TEACHING");
            assertThat(normal.goals().planned()).extracting(g->g.id()).containsExactly(e2);
            assertThat(nativeFocus()).containsExactly(e2);
            assertThat(nativeMastery()).isEqualTo(expectedBefore);
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(gravity);
            assertThat(version()).isEqualTo(readVersion);
            var beforeWrite=version();
            var toolResult=successful(ClaudeV1Contract.TOOL_SET_MASTERY,writeArgs("native-e2-pass-"+course+"-"+pilot,beforeWrite,Map.of("goalId",gravity)));
            var afterCtx=mapper.valueToTree(context());
            var after=nativeState(learners.getLearnerState(learnerId));
            var expectedAfter=new java.util.TreeMap<String,Double>(expectedBefore);
            expectedAfter.put(gravity,1.0);
            assertThat(nativeMastery()).isEqualTo(expectedAfter);
            assertThat(nativeFocus()).containsExactly(e2);
            assertThat(learners.getLearnerState(learnerId).goals().planned()).extracting(g->g.id()).containsExactly(e2);
            assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isNull();
            assertThat(afterCtx.path("activeGoal").isMissingNode() || afterCtx.path("activeGoal").isNull()).isTrue();
            assertThat(version()).isEqualTo(beforeWrite+1);
            var result=new java.util.LinkedHashMap<String,Object>();
            result.put("case","active-gravitation");result.put("course",course);result.put("unitPilot",pilot);
            result.put("autopilot",learnerRepository.findById(learnerId).orElseThrow().getAutoPilot());
            result.put("selectedGoalIds",selected);result.put("prerequisiteCount",prereqs.size());
            result.put("before",before);result.put("coachBefore",ctx);result.put("passToolResult",toolResult);
            result.put("after",after);result.put("coachAfter",afterCtx);
            var selectedAfter=learners.resolveLearningPlanGoalIds(learnerId,physics,List.of(e2));assertThat(selectedAfter).containsExactlyElementsOf(selected);result.put("selectedGoalIdsAfter",selectedAfter);
            result.put("exactMasteryDelta",Map.of(gravity,1.0));result.put("versionBefore",beforeWrite);result.put("versionAfter",version());
            System.out.println("NATIVE_ACTIVE "+mapper.writeValueAsString(result));
        } finally { org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",pilotBefore); }
    }

    @ParameterizedTest
    @CsvSource({"GK,false","GK,true","LK,false","LK,true"})
    void independentDatedOldPlanCaptureAndReplay(String course, boolean pilot) throws Exception {
        Object pilotBefore=org.springframework.test.util.ReflectionTestUtils.getField(learners,"unitAssessmentPilotEnabled");
        org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",pilot);
        try {
            String physics="7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            String e2=selectHessianMotionUnit("G9","SekII",course).replace(":structure:physics-e1-motion",":structure:physics-e2-newton-and-conservation");
            learners.setPlannedGoals(learnerId,java.util.Set.of(e2));
            boolean predecessor="predecessor".equals(System.getenv("CUT_VARIANT"));
            var capture=mapper.readTree(java.nio.file.Files.readString(java.nio.file.Path.of(System.getenv("CUT_EVIDENCE"),"captured-"+course+"-"+pilot+".json")));
            var today=java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
            var monday=today.with(java.time.DayOfWeek.MONDAY);
            var currentScope=learners.resolveLearningPlanGoalIds(learnerId,physics,List.of(e2));
            var saved=learningPlans.upsert(learnerId,physics,new LearnerLearningPlanApi.UpsertRequest(0L,"E.2",List.of(new LearnerLearningPlanApi.Block("section","learning",e2,"E.2",monday,monday,null,currentScope,List.of(e2),true))),today);
            var entity=storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId,physics).orElseThrow();
            var actualCapture=new java.util.LinkedHashMap<String,Object>();
            actualCapture.put("storedBlockJson",entity.getBlocksJson());actualCapture.put("scopeFingerprint",entity.getScopeFingerprint());
            actualCapture.put("curriculumId",entity.getCurriculumId());actualCapture.put("scope",currentScope);actualCapture.put("revision",entity.getRevision());actualCapture.put("staleAtCapture",saved.stale());
            if(predecessor) {
                java.nio.file.Files.writeString(java.nio.file.Path.of(System.getenv("CUT_EVIDENCE"),"recaptured-"+course+"-"+pilot+".json"),mapper.writerWithDefaultPrettyPrinter().writeValueAsString(actualCapture));
                assertThat(mapper.readTree(entity.getBlocksJson())).isEqualTo(mapper.readTree(capture.path("storedBlockJson").asText()));
                assertThat(entity.getScopeFingerprint()).isEqualTo(capture.path("scopeFingerprint").asText());
            }
            entity.setBlocksJson(capture.path("storedBlockJson").asText());entity.setScopeFingerprint(capture.path("scopeFingerprint").asText());
            entity.setCurriculumId(capture.path("curriculumId").asText());entity.setRevision(capture.path("revision").asLong());storedPlans.saveAndFlush(entity);
            var plan=learningPlans.getPlan(learnerId,physics,today);
            var oldGoals=plan.blocks().getFirst().atomicGoalIds();
            var capturedScope=mapper.convertValue(capture.path("scope"),new TypeReference<java.util.List<String>>(){});
            assertThat(plan.stale()).isFalse();assertThat(oldGoals).hasSize(32).containsExactlyElementsOf(capturedScope).contains("9c328f68-41ed-55dd-9e02-34414a6246f2");
            assertThat((com.fasterxml.jackson.databind.JsonNode) mapper.valueToTree(plan.blocks())).isEqualTo(mapper.readTree(capture.path("storedBlockJson").asText()));
            var backup=learners.exportLearner(learnerId);learners.importLearner(learnerId,backup);
            var restored=learningPlans.getPlan(learnerId,physics,today);
            assertThat(restored.stale()).isFalse();assertThat(restored.blocks()).isEqualTo(plan.blocks());
            var moved=new java.util.ArrayList<>(List.of("eb0ffdea-c12d-56df-b7e8-c0297d2f8aff","a42f91a4-0d21-5aa9-ae11-f48be6f2e431","594f7f21-6b8a-531c-8424-5f1dcbaf0f23","9c328f68-41ed-55dd-9e02-34414a6246f2"));
            if("LK".equals(course))moved.add("e359f8bb-6106-44aa-9edf-694528d2d2a9");
            assertThat(oldGoals).containsAll(moved);
            if(predecessor)assertThat(currentScope).containsExactlyElementsOf(oldGoals);
            else assertThat(oldGoals.stream().filter(id->!currentScope.contains(id)).toList()).containsExactlyInAnyOrderElementsOf(moved);
            var prerequisites=new CompletionProfileCompiler().normalizePrerequisites(learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
            var offered=new java.util.ArrayList<java.util.Map<String,Object>>();
            for(String target:moved) {
                masteryRepository.deleteAllInBatch(masteryRepository.findByLearner_SkillpilotId(learnerId));
                var learner=learnerRepository.findById(learnerId).orElseThrow();
                learner.setActiveGoalId(null);learner.setLearningState(LearningState.FRONTIER);learnerRepository.saveAndFlush(learner);
                learners.setPlannedGoals(learnerId,java.util.Set.of(e2));
                var finished=new java.util.LinkedHashSet<String>(oldGoals);finished.remove(target);finished.addAll(prerequisites.transitivePrerequisites(target));
                masteryRepository.saveAllAndFlush(finished.stream().map(id->new Mastery(learner,id,1.0)).toList());
                learners.setPreferences(learnerId,null,false,true,null,true);
                var next=learningPlans.getPlan(learnerId,physics,today);
                assertThat(next.stale()).isFalse();assertThat(next.canContinue()).isTrue();assertThat(next.nextEligibleGoal()).isNotNull();assertThat(next.nextEligibleGoal().goalId()).isEqualTo(target);
                var transition=learningPlans.resumeExplicitly(learnerId,new LearnerLearningPlanApi.ReconcileRequest(today));
                var row=new java.util.LinkedHashMap<String,Object>();row.put("target",target);row.put("offered",next.nextEligibleGoal().goalId());row.put("canContinue",next.canContinue());
                row.put("reportedActive",transition.activeGoalId());row.put("reportedFocus",transition.focusGoalId());row.put("actual",nativeState(learners.getLearnerState(learnerId)));
                assertThat(learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId()).isEqualTo(target);
                assertThat(nativeMastery()).doesNotContainKey(target);offered.add(row);
            }
            var result=new java.util.LinkedHashMap<String,Object>();result.put("case","dated-predecessor-plan");result.put("course",course);result.put("unitPilot",pilot);result.put("variant",System.getenv("CUT_VARIANT"));
            result.put("datedBlock",plan.blocks());result.put("exactStoredCount",oldGoals.size());result.put("currentSelectionCount",currentScope.size());result.put("stale",plan.stale());result.put("restoredStale",restored.stale());
            result.put("storedFingerprint",capture.path("scopeFingerprint").asText());result.put("moved",moved);result.put("offeredAndStarted",offered);result.put("freshNativePredecessorCaptureMatchesOriginal",predecessor);
            System.out.println("NATIVE_PLAN "+mapper.writeValueAsString(result));
        } finally { org.springframework.test.util.ReflectionTestUtils.setField(learners,"unitAssessmentPilotEnabled",pilotBefore); }
    }

    @ParameterizedTest
    @ValueSource(strings={"GK","LK"})
    void independentActualUiClosure(String course) throws Exception {
        String e2=selectHessianMotionUnit("G9","SekII",course).replace(":structure:physics-e1-motion",":structure:physics-e2-newton-and-conservation");
        learners.setPlannedGoals(learnerId,java.util.Set.of(e2));
        String selectedRoot=learnerRepository.findById(learnerId).orElseThrow().getSelectedCurriculum();
        var closure=learners.getLearnerLandscapeClosure(learnerId,selectedRoot,"de");
        var path=java.nio.file.Path.of(System.getenv("CUT_EVIDENCE"),"../../raw/native/ui-closure-"+course+".json").normalize();
        java.nio.file.Files.writeString(path,mapper.writerWithDefaultPrettyPrinter().writeValueAsString(closure));
        var graph=closure.stream().flatMap(landscape->landscape.getGoals().stream()).collect(java.util.stream.Collectors.toMap(g->g.getId(),g->g,(a,b)->a));
        var membership=new java.util.ArrayList<java.util.Map<String,Object>>();
        for(String id:List.of("22561c66-3957-5d55-b07a-25de1f359930","72649cf5-893c-5f03-88bd-a2497171d434"))membership.add(Map.of("goalId",id,"presentInActualUiClosure",graph.containsKey(id)));
        var metadata=Map.of("course",course,"requestedRoot",selectedRoot,"language","de","landscapeIds",closure.stream().map(l->l.getLandscapeId()).toList(),"goalCount",graph.size(),"examMembership",membership,"goalIds",graph.keySet().stream().sorted().toList());
        java.nio.file.Files.writeString(java.nio.file.Path.of(System.getenv("CUT_EVIDENCE"),"ui-closure-metadata-"+course+".json"),mapper.writerWithDefaultPrettyPrinter().writeValueAsString(metadata));
        System.out.println("NATIVE_UI_CLOSURE "+mapper.writeValueAsString(metadata));
        assertThat(selectedRoot).isEqualTo(ROOT);assertThat(closure).isNotEmpty();
    }
