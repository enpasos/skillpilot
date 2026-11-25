    @ParameterizedTest
    @CsvSource({"GK,false","GK,true","LK,false","LK,true"})
    void nativeOldPlanAndScopeReconciliation(String course, boolean pilot) throws Exception {
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String gravity = "eb0ffdea-c12d-56df-b7e8-c0297d2f8aff";
        java.nio.file.Path nativeCapture = java.nio.file.Path.of(System.getenv("CUT_EVIDENCE"), "captured-"+course+"-"+pilot+".json");
        boolean base = "parent".equals(System.getenv("CUT_VARIANT"));
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String e2 = selectHessianMotionUnit("G9", "SekII", course)
                    .replace(":structure:physics-e1-motion", ":structure:physics-e2-newton-and-conservation");
            learners.setPlannedGoals(learnerId, java.util.Set.of(e2));
            var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
            var monday = today.with(java.time.DayOfWeek.MONDAY);
            var scope = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(e2));
            // Capture the actual version-1 saved block and entire scope fingerprint from the parent API.
            var initiallySaved=learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.2", List.of(
                    new LearnerLearningPlanApi.Block("section", "learning", e2, "E.2", monday, monday,
                            null, scope, List.of(e2), true))), today);
            var entity=storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
            if (base) {
                java.nio.file.Files.writeString(nativeCapture,mapper.writerWithDefaultPrettyPrinter().writeValueAsString(Map.of(
                        "storedBlockJson",entity.getBlocksJson(),"scopeFingerprint",entity.getScopeFingerprint(),"curriculumId",entity.getCurriculumId(),
                        "scope",scope,"revision",entity.getRevision(),"staleAtCapture",initiallySaved.stale())));
            } else {
                var capture=mapper.readTree(java.nio.file.Files.readString(nativeCapture));
                entity.setBlocksJson(capture.get("storedBlockJson").asText());
                entity.setScopeFingerprint(capture.get("scopeFingerprint").asText());
                entity.setCurriculumId(capture.get("curriculumId").asText());
                entity.setRevision(capture.get("revision").asLong());
                storedPlans.saveAndFlush(entity);
            }
            var reqs = new CompletionProfileCompiler().normalizePrerequisites(
                    learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            var gravityNeeds = reqs.transitivePrerequisites(gravity);
            masteryRepository.saveAllAndFlush(gravityNeeds.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
            learner.setActiveGoalId(gravity);
            learner.setLearningState(LearningState.TEACHING);
            learnerRepository.saveAndFlush(learner);
            var result = new java.util.LinkedHashMap<String,Object>();
            result.put("course", course);
            result.put("pilot", pilot);
            result.put("basis",base?"parent":"candidate");
            result.put("visibleBeforeReconcile",learners.getCoachLearnerState(learnerId).activeGoal()==null?null:learners.getCoachLearnerState(learnerId).activeGoal().id());
            result.put("persistedBeforeReconcile", learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId());
            var normal = learners.getLearnerState(learnerId);
            result.put("reconciledActive",normal.activeGoal()==null?null:normal.activeGoal().id());
            result.put("reconciledAction",normal.stateMachine().requiredAction());
            result.put("persistedAfterReconcile",learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId());
            try {
                learners.setActiveGoal(learnerId, gravity);
                result.put("resumeByChoosingInOriginalFocus", "ok");
            } catch(org.springframework.web.server.ResponseStatusException ex) {
                result.put("resumeByChoosingInOriginalFocus", ex.getStatusCode().value());
            }
            var e5=e2.replace(":structure:physics-e2-newton-and-conservation",":structure:he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089");
            result.put("frontierOfE5ContainsGravity",learners.getUncompactedRichFrontierForFocus(learnerId,List.of(e5)).stream().anyMatch(g->gravity.equals(g.id())));
            var saved=learningPlans.getPlan(learnerId,physics,today);
            var oldGoals=saved.blocks().getFirst().atomicGoalIds();
            var currentBlock=initiallySaved.blocks().getFirst().atomicGoalIds();
            result.put("oldGoalsRemovedFromCurrentSelection",oldGoals.stream().filter(id->!currentBlock.contains(id)).toList());
            result.put("newGoalsAddedToCurrentSelection",currentBlock.stream().filter(id->!oldGoals.contains(id)).toList());
            result.put("storedCount",oldGoals.size());
            result.put("currentCount",currentBlock.size());
            result.put("stale",saved.stale());
            var backup=learners.exportLearner(learnerId);
            learners.importLearner(learnerId,backup);
            var restored=learningPlans.getPlan(learnerId,physics,today);
            result.put("restoredStale",restored.stale());
            result.put("restorePreservesExactBlocks",restored.blocks().equals(saved.blocks()));
            // Every plan goal except gravity is already credited for this independent continuation control.
            var remaining=new java.util.LinkedHashSet<String>(oldGoals);
            remaining.remove(gravity);
            remaining.removeAll(gravityNeeds);
            var currentLearner=learnerRepository.findById(learnerId).orElseThrow();
            masteryRepository.saveAllAndFlush(remaining.stream().map(id->new Mastery(currentLearner,id,1.0)).toList());
            currentLearner.setActiveGoalId(null);
            currentLearner.setLearningState(LearningState.FRONTIER);
            learnerRepository.saveAndFlush(currentLearner);
            learners.setPreferences(learnerId,null,false,true,null,true);
            var next=learningPlans.getPlan(learnerId,physics,today);
            result.put("next",next.nextEligibleGoal()==null?null:next.nextEligibleGoal().goalId());
            result.put("canContinue",next.canContinue());
            var resumed=learningPlans.resumeExplicitly(learnerId,new LearnerLearningPlanApi.ReconcileRequest(today));
            result.put("resumedActive",resumed.activeGoalId());
            result.put("resumedFocus",resumed.focusGoalId());
            result.put("resumedState",resumed.state().stateMachine().requiredAction());
            System.out.println("REVIEWBPLAN "+mapper.writeValueAsString(result));
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        }
    }
