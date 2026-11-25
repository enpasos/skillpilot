    @ParameterizedTest
    @CsvSource({"GK,false","GK,true","LK,false","LK,true"})
    void readStoredFocusAcrossE2Cut(String course, boolean pilot) throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            String gravity = "eb0ffdea-c12d-56df-b7e8-c0297d2f8aff";
            String traffic = "4a2bf015-052b-4af0-aed7-324259fa1a8a";
            String friction = "5fd45dbc-0eb1-591b-99a9-7386336f1456";
            String e2 = selectHessianMotionUnit("G9", "SekII", course)
                    .replace(":structure:physics-e1-motion", ":structure:physics-e2-newton-and-conservation");
            learners.setPlannedGoals(learnerId, java.util.Set.of(e2));
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            learner.setActiveGoalId(null);
            learner.setLearningState(LearningState.FRONTIER);
            learnerRepository.saveAndFlush(learner);
            var model = new CompletionProfileCompiler().normalizePrerequisites(
                    learners.getLearningPlanCompletionContext(learnerId).canonicalGoals());
            var unlocked = new java.util.LinkedHashSet<String>(model.transitivePrerequisites(traffic));
            unlocked.addAll(model.transitivePrerequisites(gravity));
            assertThat(unlocked).doesNotContain(friction);
            masteryRepository.saveAllAndFlush(unlocked.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
            session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
            authenticate();
            successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                    Map.of("receiptCapability", map(context(), "completionContract").get("receiptCapability")));
            var focusGoals = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(e2));
            var e2frontier = learners.getUncompactedRichFrontierForFocus(learnerId, List.of(e2))
                    .stream().map(goal -> goal.id()).toList();
            assertThat(e2frontier).contains(traffic);
            var moved = List.of(gravity, "a42f91a4-0d21-5aa9-ae11-f48be6f2e431",
                    "594f7f21-6b8a-531c-8424-5f1dcbaf0f23", "e359f8bb-6106-44aa-9edf-694528d2d2a9");
            for (String active : List.of("none", gravity, traffic)) {
                var stored = learnerRepository.findById(learnerId).orElseThrow();
                stored.setActiveGoalId("none".equals(active) ? null : active);
                stored.setLearningState("none".equals(active) ? LearningState.FRONTIER : LearningState.TEACHING);
                learnerRepository.saveAndFlush(stored);
                var before = version();
                var ctx = mapper.valueToTree(context());
                var status = new java.util.LinkedHashMap<String,Object>();
                status.put("course", course);
                status.put("pilot", pilot);
                status.put("case", active);
                status.put("storedFocus", focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).toList());
                status.put("storedActive", learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId());
                status.put("versionUnchanged", before == version());
                status.put("masteryUnchanged", masteryRepository.findByLearner_SkillpilotId(learnerId).size() == unlocked.size());
                status.put("e2ScopeSize", focusGoals.size());
                status.put("e2ScopeMoved", moved.stream().filter(focusGoals::contains).toList());
                status.put("e2Frontier", e2frontier);
                status.put("focusContext", ctx.path("focusedUnitContext"));
                status.put("activeGoal", ctx.path("activeGoal").path("id"));
                var detail = ctx.path("activeGoalContext");
                status.put("activePaths", detail.path("unitPaths"));
                var keys = new java.util.ArrayList<String>();
                detail.fieldNames().forEachRemaining(keys::add);
                status.put("activeDetailKeys", keys);
                status.put("stateMachine", ctx.path("stateMachine"));
                var frontier = new java.util.ArrayList<String>();
                for(var goal :ctx.path("frontier")) frontier.add(goal.path("id").asText());
                status.put("coachFrontier", frontier);
                status.put("cardStep", ctx.has("cardStep"));
                status.put("activeProfile",ctx.path("levelCompletion").path("activeProfile"));
                System.out.println("REVIEWB " + mapper.writeValueAsString(status));
                assertThat(before).isEqualTo(version());
            }
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        }
    }
