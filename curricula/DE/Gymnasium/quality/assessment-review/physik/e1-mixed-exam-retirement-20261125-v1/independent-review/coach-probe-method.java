    @Test void observeRetiredExamInOrdinaryCoachChat() throws Exception {
        String retired = "a9562b05-c54d-5635-9244-3f7dd24a8642";
        String child = "8aff7aac-321b-5172-ac55-877876bfd2cd";
        selectHessianMotionUnit("G9", "SekII", "GK");
        completeHessianOpeningFixtures();
        var learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAndFlush(new Mastery(learner, "09029573-864f-40ca-bf8a-cee7bf6dcb73", 1.0));
        session = sessions.createFirstPartyLaunch(learnerId, new ClaudeV1CoachStartRequest("de", "web-start")).learningSessionId();
        authenticate();
        var first = context();
        if (first.containsKey("completionContract")) successful(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM,
                Map.of("receiptCapability", map(first, "completionContract").get("receiptCapability")));
        for (String state : List.of("ordinary-parent", "retired-active", "ordinary-child", "retired-only-focus")) {
            learner = learnerRepository.findById(learnerId).orElseThrow();
            learner.setActiveGoalId(switch(state) {
                case "retired-active" -> retired;
                case "ordinary-child" -> child;
                default -> null;
            });
            learnerRepository.saveAndFlush(learner);
            if (state.equals("retired-only-focus")) {
                focus.deleteAll(focus.findByLearner_SkillpilotId(learnerId));
                focus.saveAndFlush(new PlannedGoal(learner, retired));
            }
            long before = version();
            var raw = context();
            var storedAfter = learnerRepository.findById(learnerId).orElseThrow().getActiveGoalId();
            assertThat(version()).isEqualTo(before);
            assertThat(storedAfter).isEqualTo(learner.getActiveGoalId());
            var c = mapper.valueToTree(raw);
            if (state.equals("ordinary-parent") || state.equals("retired-active")) {
                assertThat(c.get("activeGoal").isNull()).isTrue();
                assertThat(c.path("focusedUnitContext").path("unitIntroduction").path("sectionTitle").asText())
                        .isEqualTo("E.1 Bewegungen und ihre Beschreibung");
                assertThat(c.path("focusedUnitContext").path("activities").findValuesAsText("route"))
                        .containsExactly("unitPractice");
            }
            if (state.equals("ordinary-child")) {
                assertThat(c.path("activeGoalContext").path("activities").findValuesAsText("route"))
                        .containsExactly("unitPractice", "directAssessment");
                assertThat(c.path("activeGoalContext").path("activities").findValuesAsText("goalId"))
                        .contains("f13ca187-b680-5f47-b4ad-76bd474bd8a2");
            }
            System.out.println("RETIREMENT_CONTEXT " + state + " " +
                    mapper.writeValueAsString(Map.of("hasActive", c.hasNonNull("activeGoal"),
                            "hasUnit", c.hasNonNull("focusedUnitContext"),
                            "parentRoutes", c.path("focusedUnitContext").path("activities").findValuesAsText("route"),
                            "activeRoutes", c.path("activeGoalContext").path("activities").findValuesAsText("route"),
                            "activeIds", c.path("activeGoalContext").path("activities").findValuesAsText("goalId"),
                            "fields", raw.keySet(), "requiredAction", c.path("stateMachine").path("requiredAction").asText(),
                            "storedActive", String.valueOf(storedAfter), "mentionsRetired", c.toString().contains(retired))));
        }
    }

