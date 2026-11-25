    @ParameterizedTest
    @ValueSource(booleans = {false, true})
    void observeDueRegroupedGoal(boolean wholeFormerSection) throws Exception {
        String section = selectHessianMotionUnit("G9", "SekII", "GK");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        String moved = "4a2bf015-052b-4af0-aed7-324259fa1a8a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var monday = today.with(java.time.DayOfWeek.MONDAY);
        var current = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(section));
        var currentBlock = new LearnerLearningPlanApi.Block("old-e1", "learning", section, "E.1",
                monday, monday, null, current, List.of(section), true);
        learningPlans.upsert(learnerId, physics, new LearnerLearningPlanApi.UpsertRequest(0L, "E.1", List.of(currentBlock)), today);
        var captured = new java.util.ArrayList<String>();
        if (wholeFormerSection) captured.addAll(current);
        captured.add(moved);
        var old = new LearnerLearningPlanApi.Block("old-e1", "learning", section, "E.1",
                monday, monday, null, captured, List.of(section), true);
        var stored = storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId, physics).orElseThrow();
        stored.setBlocksJson(mapper.writeValueAsString(List.of(old))); storedPlans.saveAndFlush(stored);
        learners.setPreferences(learnerId, null, false, true, null, false);
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        var model = learners.getLearningPlanCompletionContext(learnerId);
        var prerequisites = new CompletionProfileCompiler().normalizePrerequisites(model.canonicalGoals());
        var finished = new java.util.LinkedHashSet<String>(prerequisites.transitivePrerequisites(moved));
        finished.addAll(current); finished.remove(moved);
        masteryRepository.saveAllAndFlush(finished.stream().map(id -> new Mastery(learner, id, 1.0)).toList());
        var view = learningPlans.getPlan(learnerId, physics, today);
        var output = new java.util.LinkedHashMap<String, Object>();
        output.put("fixture", getClass().getSimpleName());
        output.put("wholeFormerSection", wholeFormerSection);
        output.put("assignedIds", captured);
        output.put("onlyUnmasteredCapturedGoal", moved);
        output.put("subjectEligible", learners.getUncompactedRichFrontierForFocus(learnerId, List.of(physics)).stream().anyMatch(g -> moved.equals(g.id())));
        output.put("oldSectionEligible", learners.getUncompactedRichFrontierForFocus(learnerId, List.of(section)).stream().anyMatch(g -> moved.equals(g.id())));
        output.put("directEligible", learners.getUncompactedRichFrontierForFocus(learnerId, List.of(moved)).stream().anyMatch(g -> moved.equals(g.id())));
        output.put("stale", view.stale()); output.put("next",view.nextEligibleGoal());
        output.put("canContinue",view.canContinue()); output.put("reason",view.continueReason());
        output.put("coachToday",learningPlans.getCoachTodayStatus(learnerId,"de"));
        if (view.canContinue()) {
            var resumed=learningPlans.continuePlan(learnerId, view.planId(),new LearnerLearningPlanApi.ContinueRequest(view.revision(),today));
            output.put("resumedFocus",resumed.focusGoalId()); output.put("resumedActive",resumed.activeGoalId());
        }
        System.out.println("REGROUP_OBSERVATION " + mapper.writeValueAsString(output));
        assertThat(view.stale()).isFalse();
    }
