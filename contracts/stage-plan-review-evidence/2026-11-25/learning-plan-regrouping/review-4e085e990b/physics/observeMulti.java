    @Test void compareDirectAndSequentialRefocusing() throws Exception {
        String e1 = selectHessianMotionUnit("G9", "SekII", "GK");
        String e2 = e1.replace(":structure:physics-e1-motion", ":structure:physics-e2-newton-and-conservation");
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var day = today.with(java.time.DayOfWeek.MONDAY);
        var e1Ids = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(e1));
        var e2Ids = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(e2));
        String target = e1Ids.stream().filter(id -> !e2Ids.contains(id))
                .filter(id -> {
                    var goal = landscapeDefinitions.getGoalDefinition(id);
                    return !CompletionProfileCompiler.isAssessment(goal) && !CompletionProfileCompiler.isMemory(goal)
                            && !CompletionProfileCompiler.isOrientation(goal);
                }).findFirst().orElseThrow();
        assertThat(e1Ids).contains(target);
        assertThat(e2Ids).doesNotContain(target);
        java.util.function.Function<List<String>, List<LearnerLearningPlanApi.Block>> make = roots -> List.of(
                new LearnerLearningPlanApi.Block("work", "learning", roots.getFirst(), "Abschnitt", day, day,
                        null, List.of(target), roots, true));
        var start = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L, "Ziel unter E.1", make.apply(List.of(e1))), today);
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(start.revision(), "Nur E.2", make.apply(List.of(e2))), today))
                .hasMessageContaining("not a subject-local ancestor");
        var mixed = learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(start.revision(), "E.1 und E.2", make.apply(List.of(e1,e2))), today);
        var out = new java.util.LinkedHashMap<String,Object>();
        out.put("test", "mixed-focus-substitution"); out.put("goal", target);
        out.put("e1", e1); out.put("e2", e2);
        out.put("itemUnderE1", e1Ids.contains(target)); out.put("itemUnderE2", e2Ids.contains(target));
        out.put("directE1ToE2", "rejected"); out.put("addedSecondFocus", mixed.blocks().getFirst().focusGoalIds());
        try {
            var end = learningPlans.upsert(learnerId, physics,
                    new LearnerLearningPlanApi.UpsertRequest(mixed.revision(), "Nur E.2", make.apply(List.of(e2))), today);
            var reread = learningPlans.getPlan(learnerId, physics, today);
            out.put("sequentialE1ToE2", "accepted"); out.put("persistedGoals", reread.blocks().getFirst().atomicGoalIds());
            out.put("persistedFoci", reread.blocks().getFirst().focusGoalIds()); out.put("stale", reread.stale());
            assertThat(end.blocks().getFirst().atomicGoalIds()).containsExactly(target);
        } catch (org.springframework.web.server.ResponseStatusException refusal) {
            out.put("sequentialE1ToE2", "rejected"); out.put("reason", refusal.getReason());
        }
        System.out.println("REGROUP_OBSERVATION " + mapper.writeValueAsString(out));
    }
