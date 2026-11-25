    @Test void observeHistoricalTwoEditRefocusing() throws Exception {
        String e1 = selectHessianMotionUnit("G9", "SekII", "GK");
        String other = e1.replace(":structure:physics-e1-motion", ":structure:physics-current-magnetic-fields-0bd4a459");
        String goal = "4a2bf015-052b-4af0-aed7-324259fa1a8a";
        String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
        var today = java.time.LocalDate.now(java.time.ZoneId.of("Europe/Berlin"));
        var day = today.with(java.time.DayOfWeek.MONDAY);
        var current = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(e1));
        var others = learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(other));
        assertThat(current).isNotEmpty().doesNotContain(goal);
        assertThat(others).isNotEmpty().doesNotContain(goal);
        var out = new java.util.LinkedHashMap<String,Object>();
        out.put("test","historical-two-edit-refocusing"); out.put("goal",goal); out.put("e1",e1);
        out.put("newC",other); out.put("underE1Now",current.contains(goal)); out.put("underCNow",others.contains(goal));
        out.put("cCurrentAtoms",others);
        java.util.function.Function<List<String>,List<LearnerLearningPlanApi.Block>> make = roots -> List.of(
                new LearnerLearningPlanApi.Block("former-e1", "learning", roots.getFirst(), "Abschnitt", day, day,
                        null, List.of(goal), roots, true));
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L,"Neu unter C",make.apply(List.of(other))),today))
                .hasMessageContaining("not a subject-local ancestor");
        out.put("newPlanCOnly","rejected");
        var fresh=learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(0L,"E.1",List.of(new LearnerLearningPlanApi.Block(
                        "former-e1","learning",e1,"E.1",day,day,null,current,List.of(e1),true))),today);
        var stored=storedPlans.findByLearner_SkillpilotIdAndLandscapeId(learnerId,physics).orElseThrow();
        stored.setBlocksJson(mapper.writeValueAsString(make.apply(List.of(e1)))); storedPlans.saveAndFlush(stored);
        var oldView=learningPlans.getPlan(learnerId,physics,today);
        assertThat(oldView.stale()).isFalse(); out.put("originalRevision",oldView.revision());
        assertThatThrownBy(() -> learningPlans.upsert(learnerId, physics,
                new LearnerLearningPlanApi.UpsertRequest(oldView.revision(),"Nur C",make.apply(List.of(other))),today))
                .hasMessageContaining("not a subject-local ancestor");
        out.put("directHistoricalToCOnly","rejected");
        out.put("afterDirectRefusalRevision",learningPlans.getPlan(learnerId,physics,today).revision());
        var mixed=learningPlans.upsert(learnerId,physics,
                new LearnerLearningPlanApi.UpsertRequest(oldView.revision(),"E.1 und C",make.apply(List.of(e1,other))),today);
        out.put("afterAddingCRevision",mixed.revision()); out.put("addedFoci",mixed.blocks().getFirst().focusGoalIds());
        try {
            var end=learningPlans.upsert(learnerId,physics,
                    new LearnerLearningPlanApi.UpsertRequest(mixed.revision(),"Allein C",make.apply(List.of(other))),today);
            var read=learningPlans.getPlan(learnerId,physics,today);
            out.put("sequentialCOnly","accepted"); out.put("finalRevision",end.revision());
            out.put("persistedFoci",read.blocks().getFirst().focusGoalIds());
            out.put("persistedAtoms",read.blocks().getFirst().atomicGoalIds()); out.put("stale",read.stale());
        } catch (org.springframework.web.server.ResponseStatusException refusal) {
            out.put("sequentialCOnly","rejected"); out.put("reason",refusal.getReason());
        }
        System.out.println("REGROUP_OBSERVATION " + mapper.writeValueAsString(out));
    }
