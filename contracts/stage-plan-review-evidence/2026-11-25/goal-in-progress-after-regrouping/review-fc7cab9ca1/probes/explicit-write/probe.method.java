    private List<String> explicitWriteStoredScope() {
        return focus.findByLearner_SkillpilotId(learnerId).stream().map(PlannedGoal::getGoalId).sorted().toList();
    }

    private void explicitWriteSyntheticPointer(String goalId) {
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setActiveGoalId(goalId);
        learner.setLearningState(LearningState.TEACHING);
        learnerRepository.saveAndFlush(learner);
    }

    private Map<String,Object> explicitWriteRead() {
        var state = learners.getLearnerState(learnerId);
        var row = new LinkedHashMap<String,Object>();
        row.put("active", state.activeGoal() == null ? null : state.activeGoal().id());
        row.put("storedActive", learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId());
        row.put("scope", explicitWriteStoredScope());
        row.put("state", state.learningState());
        return row;
    }

    @ParameterizedTest
    @ValueSource(booleans={false,true})
    void identicalExplicitFocusWriteEndsMovedOrdinaryGoal(boolean pilot) throws Exception {
        org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", pilot);
        try {
            String e1 = selectHessianMotionUnit("G9", "SekII", "GK");
            String physics = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
            String traffic = "4a2bf015-052b-4af0-aed7-324259fa1a8a";
            String deck = "69f0038a-6e2b-55b5-8ff0-d2ea8852e793";
            var learner = learnerRepository.findById(learnerId).orElseThrow();
            var required = new CompletionProfileCompiler().normalizePrerequisites(
                    learners.getLearningPlanCompletionContext(learnerId).canonicalGoals()).transitivePrerequisites(traffic);
            masteryRepository.saveAllAndFlush(required.stream().filter(id -> !id.equals(traffic))
                    .map(id -> new Mastery(learner, id, 1.0)).toList());
            assertThat(learners.resolveLearningPlanGoalIds(learnerId, physics, List.of(e1)))
                    .doesNotContain(traffic, deck);
            assertThat(explicitWriteStoredScope()).containsExactly(e1);
            var masteryBefore = new LinkedHashMap<>(learners.getMastery(learnerId));
            var row = new LinkedHashMap<String,Object>();
            row.put("pilot", pilot);
            row.put("autopilot", learner.getAutoPilot());
            row.put("focus", e1);
            row.put("traffic", traffic);
            row.put("setup", "synthetic persisted TEACHING pointer simulates ordinary goal begun before curriculum regrouping; prerequisites seeded as mastered");
            row.put("masteryCount", masteryBefore.size());

            explicitWriteSyntheticPointer(traffic);
            long readVersion = version();
            var read = explicitWriteRead();
            assertThat(read).containsEntry("active", traffic).containsEntry("storedActive", traffic);
            assertThat(explicitWriteStoredScope()).containsExactly(e1);
            assertThat(learners.getMastery(learnerId)).isEqualTo(masteryBefore);
            row.put("priorGet", read);
            row.put("priorGetRevisionDelta", version() - readVersion);

            long writeVersion = version();
            var returnedFocus = learners.setPlannedGoals(learnerId, java.util.Set.of(e1));
            String storedImmediatelyAfterWrite = learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId();
            assertThat(storedImmediatelyAfterWrite).isNull();
            assertThat(explicitWriteStoredScope()).containsExactly(e1);
            assertThat(returnedFocus).containsExactly(e1);
            assertThat(learners.getMastery(learnerId)).isEqualTo(masteryBefore);
            var after = explicitWriteRead();
            assertThat(after).containsEntry("active", null).containsEntry("storedActive", null);
            row.put("identicalExplicitSetPlannedGoals", Map.of("input", List.of(e1), "returned", returnedFocus));
            row.put("storedImmediatelyAfterWrite", storedImmediatelyAfterWrite);
            row.put("afterWriteGet", after);
            row.put("writeAndReadRevisionDelta", version() - writeVersion);
            row.put("masteryUnchangedAfterWrite", true);

            // Supplemental exclusion check. This is a synthetic persisted deck pointer,
            // not a deck started through the practice UI or evidence of SRS progress.
            assertThat(CompletionProfileCompiler.isMemory(landscapeDefinitions.getGoalDefinition(deck))).isTrue();
            explicitWriteSyntheticPointer(deck);
            var deckRead = explicitWriteRead();
            assertThat(deckRead).containsEntry("active", null).containsEntry("storedActive", null);
            assertThat(learners.getMastery(learnerId)).isEqualTo(masteryBefore);
            assertThat(explicitWriteStoredScope()).containsExactly(e1);
            row.put("deckSetup", "synthetic persisted TEACHING pointer to canonical Q1 deck outside E1; no SRS results seeded");
            row.put("deck", deck);
            row.put("deckRead", deckRead);
            row.put("masteryUnchangedAfterDeckRead", true);
            System.out.println("EXPLICIT_WRITE_TASK_E " + mapper.writeValueAsString(row));
        } finally {
            org.springframework.test.util.ReflectionTestUtils.setField(learners, "unitAssessmentPilotEnabled", true);
        }
    }
