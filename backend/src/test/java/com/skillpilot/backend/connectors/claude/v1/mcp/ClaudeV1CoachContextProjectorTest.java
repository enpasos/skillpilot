package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalContext;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.LearnerPlanTodayStatusFixtures;
import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.VerifiedExamPassResponse;
import com.skillpilot.backend.completion.CompletionCallContext;
import com.skillpilot.backend.content.ContentMaterialResolver;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
import com.skillpilot.backend.landscape.LandscapeSummary;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class ClaudeV1CoachContextProjectorTest {

    @Test
    void unitOffersShowOnlyTheHistoricalScoreOfTheMatchingAssessment() {
        var facade = mock(CoachToolFacade.class);
        var projector = new ClaudeV1CoachContextProjector(new CoachStateProjection("https://skillpilot.com"), facade);
        when(facade.getLearnerState("learner")).thenReturn(state(null, List.of(), "setActiveGoal"));
        var exam = new ActiveGoalContext.Activity("exam", "Wurf", "assessment", "E.1", "cockpit", null);
        var memory = new ActiveGoalContext.Activity("cards", "Lernkarten", "memory", "E.1", "cockpit", null);
        when(facade.getActiveGoalContext("learner", null, 10, "de", Set.of(), true))
                .thenReturn(new ActiveGoalContext(null, "E", List.of(), List.of(), null, List.of(exam, memory)));
        var passedAt = java.time.Instant.parse("2026-11-19T12:30:00Z");
        when(facade.latestExamPass("learner", "exam")).thenReturn(java.util.Optional.of(
                new VerifiedExamPassResponse(passedAt, 22, 36, 22, "task", "rubric", "material")));
        var context = (Map<?, ?>) projector.projectContext("learner", 10, "de").get("focusedUnitContext");
        var activities = (List<?>) context.get("activities");
        assertEquals(Map.of("passedAt", passedAt.toString(), "earnedPoints", 22.0,
                        "maxPointsAtAssessment", 36.0, "passingPointsAtAssessment", 22.0),
                ((Map<?, ?>) activities.getFirst()).get("latestRecordedPass"));
        assertFalse(((Map<?, ?>) activities.getLast()).containsKey("latestRecordedPass"));
        org.mockito.Mockito.verify(facade, org.mockito.Mockito.never()).latestExamPass("learner", "cards");
    }

    @Test
    void activeUnitContextFollowsConfirmedGoalAndMasterySuccessor() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                new CoachStateProjection("https://skillpilot.com"), facade);
        FrontierGoal active = goal("active", List.of());
        when(facade.getLearnerState("learner")).thenReturn(stateWithActiveGoal(active));
        var path = new ActiveGoalContext.UnitPath(List.of("E.1 Bewegungen", "Einführungsphase"), true, false);
        var need = new ActiveGoalContext.Prerequisite("speed", "Geschwindigkeit aus Daten bestimmen", true);
        var introduction = new ActiveGoalContext.UnitIntroduction("E.1 Bewegungen", "Wo landet der Ball?", "Bewegungen vorhersagen");
        var exercise = new ActiveGoalContext.PracticeExercise("Wo muss die Bodenmarke liegen?", "Der Ball verlässt den Tisch waagerecht.");
        var cards = new ActiveGoalContext.Activity("cards", "Lernkarten E-Phase", "memory", "E.1 Bewegungen", "unitPractice", "physics-e1-motion");
        when(facade.getActiveGoalContext("learner", "active", 10, "de", Set.of(), true))
                .thenReturn(new ActiveGoalContext("active", "E", List.of(path), List.of(need), introduction, List.of(cards), exercise));

        Map<?, ?> block = (Map<?, ?>) projector.projectContext("learner", 10, "de").get("activeGoalContext");
        assertNotNull(block);
        assertEquals("active", block.get("goalId"));
        assertEquals(List.of(path), block.get("unitPaths"));
        assertEquals(List.of(Map.of("title", need.title(), "recorded", true)), block.get("prerequisites"));
        assertEquals(introduction, block.get("unitIntroduction"));
        assertEquals(exercise, block.get("practiceExercise"));
        Map<?, ?> cardOption = (Map<?, ?>) ((List<?>) block.get("activities")).getFirst();
        assertEquals(Map.of("tool", "start_skillpilot_memory_practice", "arguments", Map.of(
                "goalId", "cards", "expectedStateVersion", 10L, "practiceScopeId", "physics-e1-motion")), cardOption.get("action"));
        assertFalse(cardOption.containsKey("cockpitUrl"));

        FrontierGoal successor = goal("next", List.of());
        when(facade.getActiveGoalContext("learner", "next", 11, "de", Set.of(), true))
                .thenReturn(new ActiveGoalContext("next", "E", List.of(path), List.of(), null, List.of()));
        var update = new MasteryUpdateResponse(true, "active", 1.0, List.of(active, successor),
                List.of(), "TEACHING", successor, null, null);
        var nextContext = projector.projectMasteryContext("learner", 11, "de", null, update);
        assertEquals("next", ((Map<?, ?>) nextContext.get("activeGoalContext")).get("goalId"));
        assertEquals(List.of(), nextContext.get("frontier"));
        assertFalse(nextContext.get("activeGoalContext").toString().contains(need.title()));
    }

    @Test
    void unitAssessmentUsesOnlyItsUniquePublishedDirectChoiceOrOneOrdinaryRoute() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                new CoachStateProjection("https://skillpilot.com"), facade);
        FrontierGoal active = goal("active", List.of());
        var exam = new LevelCompletionResponse.Assessment("unit-exam", Map.of("de", "Bewegungsanalyse und freier Fall"),
                false, true, null);
        var other = new LevelCompletionResponse.Assessment("other-exam", Map.of("de", "Eine andere Prüfung"),
                false, true, null);
        var duplicate = new LevelCompletionResponse.Assessment("unit-exam", Map.of("de", "Dieselbe Prüfung im anderen Abschnitt"),
                false, true, null);
        var state = stateWithActiveGoal(active);
        when(facade.getLearnerState("learner")).thenReturn(
                withAssessmentChoices(state, 10, List.of(other, exam)),
                withAssessmentChoices(state, 10, List.of(other, exam, duplicate)),
                withAssessmentChoices(state, 9, List.of(exam)),
                withAssessmentChoices(state, 10, List.of(other)));
        var activity = new ActiveGoalContext.Activity("unit-exam", "Bewegungsanalyse und freier Fall", "assessment",
                "E.1 Bewegungen", "frontier", null);
        when(facade.getActiveGoalContext("learner", "active", 10, "de", Set.of(), true))
                .thenReturn(new ActiveGoalContext("active", "E", List.of(), List.of(), null, List.of(activity)));

        var direct = firstUnitActivity(CompletionCallContext.with(ClaudeV1CompletionProjectionTest.supported(),
                () -> projector.projectContext("learner", 10, "de")));
        assertEquals("directAssessment", direct.get("route"));
        assertEquals(Map.of("tool", "choose_skillpilot_completion_route", "arguments", Map.of(
                "choice", "Prüfung direkt versuchen: Bewegungsanalyse und freier Fall", "expectedStateVersion", 10L)),
                direct.get("action"));
        assertFalse(direct.containsKey("cockpitUrl"));

        for (int i = 0; i < 3; i++) {
            var fallback = firstUnitActivity(CompletionCallContext.with(ClaudeV1CompletionProjectionTest.supported(),
                    () -> projector.projectContext("learner", 10, "de")));
            assertEquals("frontier", fallback.get("route"));
            assertEquals(Map.of("tool", "set_skillpilot_active_goal", "arguments", Map.of(
                    "goalId", "unit-exam", "expectedStateVersion", 10L, "redirect", true)), fallback.get("action"));
            assertFalse(fallback.containsKey("cockpitUrl"));
        }

        when(facade.getLearnerState("learner")).thenReturn(withAssessmentChoices(state, 10, List.of(exam)));
        var cockpitActivity = new ActiveGoalContext.Activity(activity.goalId(), activity.title(), activity.kind(),
                activity.sectionTitle(), "cockpit", null);
        when(facade.getActiveGoalContext("learner", "active", 10, "de", Set.of(), true))
                .thenReturn(new ActiveGoalContext("active", "E", List.of(), List.of(), null, List.of(cockpitActivity)));
        var unsupported = firstUnitActivity(projector.projectContext("learner", 10, "de"));
        assertEquals("cockpit", unsupported.get("route"));
        assertTrue(unsupported.get("cockpitUrl").toString().contains("goal=unit-exam"));
        assertFalse(unsupported.containsKey("action"));
    }

    @Test
    void followingPlanKeepsExplicitUnitActionsWithAnActiveGoalAndNoExtraFrontier() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                new CoachStateProjection("https://skillpilot.com"), facade);
        var assessment = new LevelCompletionResponse.Assessment("unit-exam", Map.of("de", "Bewegungsanalyse und freier Fall"),
                false, true, null);
        var active = goal("active", List.of());
        var unrelated = goal("unrelated-frontier", List.of());
        when(facade.getLearnerState("learner")).thenReturn(
                withAssessmentChoices(state(active, List.of(unrelated), "teachActiveGoal"), 10, List.of(assessment)),
                withAssessmentChoices(state(null, List.of(unrelated), "setActiveGoal"), 11, List.of(assessment)));
        when(facade.getLearningPlanTodayStatus("learner", "de")).thenReturn(dailyStatus(true, false, 0, 0, 0));
        var flashcards = new ActiveGoalContext.Activity("cards", "Lernkarten E-Phase", "memory", "E.1", "unitPractice", "physics-e1-motion");
        var exam = new ActiveGoalContext.Activity("unit-exam", "Bewegungsanalyse und freier Fall", "assessment", "E.1", "cockpit", null);
        var unrelatedCockpitLink = new ActiveGoalContext.Activity("other", "Andere Prüfung", "assessment", "E.1", "cockpit", null);
        when(facade.getActiveGoalContext("learner", "active", 10, "de", Set.of(), true)).thenReturn(
                new ActiveGoalContext("active", "E", List.of(), List.of(), null, List.of(flashcards, exam, unrelatedCockpitLink)));

        var activeContext = CompletionCallContext.with(ClaudeV1CompletionProjectionTest.supported(),
                () -> projector.projectContext("learner", 10, "de"));
        assertEquals(List.of(), activeContext.get("frontier"));
        var unitContext = (Map<?, ?>) activeContext.get("activeGoalContext");
        List<?> activities = (List<?>) unitContext.get("activities");
        assertEquals(List.of("unitPractice", "directAssessment"), activities.stream()
                .map(option -> ((Map<?, ?>) option).get("route")).toList());

        var finishedContext = CompletionCallContext.with(ClaudeV1CompletionProjectionTest.supported(),
                () -> projector.projectContext("learner", 11, "de"));
        assertEquals(List.of(), finishedContext.get("frontier"));
        assertFalse(finishedContext.containsKey("activeGoalContext"));
        assertFalse(finishedContext.containsKey("focusedUnitContext"));
    }

    @Test
    void prerequisitesKeepStoredEvidenceAndExactRevisionScopedWaiversSeparate() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                new CoachStateProjection("https://skillpilot.com"), facade);
        var active = goal("active", List.of());
        var prerequisites = List.of(
                new ActiveGoalContext.Prerequisite("own-goal", "Einzelbeleg", true),
                new ActiveGoalContext.Prerequisite("no-demand-goal", "Offene Vorbereitung", false),
                new ActiveGoalContext.Prerequisite("assessed-goal", "Projektion", false),
                new ActiveGoalContext.Prerequisite("different-goal", "Projektion", false));
        var detail = new ActiveGoalContext("active", "E", List.of(), prerequisites, null, List.of());
        when(facade.getActiveGoalContext("learner", "active", 10, "de", Set.of(), true)).thenReturn(detail);
        when(facade.getActiveGoalContext("learner", "active", 10, "de", Set.of(), false)).thenReturn(detail);

        var noDemand = new LevelCompletionResponse.WaiverDetail("no-demand-goal", Map.of("de", "Offene Vorbereitung"),
                "no_remaining_demand", List.of(), 0);
        var assessment = new LevelCompletionResponse.AssessmentReference("passed-exam", Map.of("de", "Projektion prüfen"));
        var assessmentWaiver = new LevelCompletionResponse.WaiverDetail("assessed-goal", Map.of("de", "Projektion"),
                "reviewed-projection-rule", List.of(assessment), 1);
        var notPublished = new LevelCompletionResponse.WaiverDetail("different-goal", Map.of("de", "Projektion"),
                "reviewed-other-rule", List.of(assessment), 1);
        var automatic = new LevelCompletionResponse("valid", "scope-context", "automatic:overview", "1", "generation", 10,
                Map.of("de", "Mein Plan"), null, 1, 4, 2, 7, 0, 0,
                List.of("no-demand-goal", "other-waived-1", "other-waived-2", "different-goal"), List.of(), List.of(),
                null, false, null, List.of()).withWaiverDetails(List.of(noDemand));
        var reviewed = new LevelCompletionResponse("valid", "reviewed-context", "reviewed-section", "1", "generation", 10,
                Map.of("de", "Der geprüfte Abschnitt"), null, 1, 1, 2, 4, 1, 1, List.of("assessed-goal"), List.of(), List.of(),
                "required", false, null, List.of()).withWaiverDetails(List.of(assessmentWaiver, notPublished));
        var stale = new LevelCompletionResponse("valid", "stale-context", "automatic:overview", "1", "generation", 9,
                Map.of("de", "Alter Plan"), null, 1, 1, 2, 4, 0, 0, List.of("no-demand-goal"), List.of(), List.of(),
                null, false, null, List.of()).withWaiverDetails(List.of(noDemand));
        var state = stateWithActiveGoal(active);
        when(facade.getLearnerState("learner")).thenReturn(
                withCompletion(state, automatic), withCompletion(state, reviewed), withCompletion(state, stale));

        var recorded = Map.of("title", "Einzelbeleg", "recorded", true);
        var open = Map.of("title", "Offene Vorbereitung", "recorded", false);
        var ordinary = Map.of("title", "Projektion", "recorded", false);
        var noDemandEntry = Map.of("title", "Offene Vorbereitung", "recorded", false, "scopeWaiver",
                Map.of("reason", "no_remaining_demand", "sectionTitle", "Mein Plan"));
        var assessmentEntry = Map.of("title", "Projektion", "recorded", false, "scopeWaiver",
                Map.of("reason", "assessment", "sectionTitle", "Der geprüfte Abschnitt"));
        var withoutExplanation = Map.of("title", "Projektion", "recorded", false, "scopeWaiver",
                Map.of("sectionTitle", "Mein Plan"));
        assertEquals(List.of(recorded, noDemandEntry, ordinary, withoutExplanation),
                directPrerequisites(projector.projectContext("learner", 10, "de")));
        assertEquals(List.of(recorded, open, assessmentEntry, ordinary), directPrerequisites(CompletionCallContext.with(
                ClaudeV1CompletionProjectionTest.supported(), () -> projector.projectContext("learner", 10, "de"))));
        assertEquals(List.of(recorded, open, ordinary, ordinary),
                directPrerequisites(projector.projectContext("learner", 10, "de")));
    }

    private static Object directPrerequisites(Map<String, Object> context) {
        return ((Map<?, ?>) context.get("activeGoalContext")).get("prerequisites");
    }

    private static Map<?, ?> firstUnitActivity(Map<String, Object> context) {
        return (Map<?, ?>) ((List<?>) ((Map<?, ?>) context.get("activeGoalContext")).get("activities")).getFirst();
    }

    private static UnifiedLearnerStateResponse withAssessmentChoices(UnifiedLearnerStateResponse state, long revision,
            List<LevelCompletionResponse.Assessment> assessments) {
        var overview = new LevelCompletionResponse("valid", "context", "automatic:overview", "1", "generation", revision,
                Map.of("de", "Meine Lernziele"), false, 0, 0, 1, 1, 0, 1, List.of(), assessments, List.of(),
                null, false, null, List.of());
        return withCompletion(state, overview);
    }

    private static UnifiedLearnerStateResponse withCompletion(UnifiedLearnerStateResponse state, LevelCompletionResponse overview) {
        return new UnifiedLearnerStateResponse(state.skillpilotId(), state.curriculum(), state.frontier(), state.goals(),
                state.nextAllowedActions(), state.activeFilters(), state.copySources(), state.learningState(),
                state.activeGoal(), state.stateMachine(), overview);
    }

    @Test
    void examContextSuppressesAllInstructionalEnrichment() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                new CoachStateProjection("https://skillpilot.com"), facade);
        var exam = new FrontierGoal("exam", "Prüfung", "", "atomic", "exam", "Active",
                List.of(), List.of(), null, null, null, null);
        when(facade.getLearnerState("learner")).thenReturn(stateWithActiveGoal(exam));
        when(facade.getActiveGoalContext("learner", "exam", 10, "de", Set.of(), false))
                .thenReturn(new ActiveGoalContext("exam", "E", List.of(new ActiveGoalContext.UnitPath(List.of("vertraulich"), true, false)),
                        List.of(new ActiveGoalContext.Prerequisite("hidden", "vertraulicher Hinweis", true)),
                        new ActiveGoalContext.UnitIntroduction("E.1", "Frage", "Versprechen"), List.of(),
                        new ActiveGoalContext.PracticeExercise("Übung", "Aufgabenstellung")));

        assertEquals(Map.of("goalId", "exam", "phase", "E"),
                projector.projectContext("learner", 10, "de").get("activeGoalContext"));
    }

    @Test
    void verifiedFocusCanShowAnIntroductionBeforeAnyGoalIsActive() {
        CoachToolFacade facade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                new CoachStateProjection("https://skillpilot.com"), facade);
        when(facade.getLearnerState("learner")).thenReturn(state(null, List.of(), "setActiveGoal"));
        var intro = new ActiveGoalContext.UnitIntroduction("E.1", "Wo landet der Ball?", "Bewegungen vorhersagen");
        when(facade.getActiveGoalContext("learner", null, 10, "de", Set.of(), true))
                .thenReturn(new ActiveGoalContext(null, null, List.of(), List.of(), intro, List.of(),
                        new ActiveGoalContext.PracticeExercise("Übung", "Aufgabenstellung")));

        var focused = projector.projectContext("learner", 10, "de");
        assertNull(focused.get("activeGoal"));
        assertFalse(focused.containsKey("activeGoalContext"));
        assertEquals(Map.of("unitIntroduction", intro), focused.get("focusedUnitContext"));
        assertFalse(projector.projectContext("learner", 11, "de").containsKey("focusedUnitContext"));
    }

    @Test
    void optionalMaterialsAreActiveGoalOnlyAndDisappearImmediatelyAfterDeactivation() {
        CoachStateProjection projection = new CoachStateProjection("https://skillpilot.com");
        CoachToolFacade facade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(projection, facade);
        FrontierGoal activeGoal = goal("goal-1", List.of());
        when(facade.getLearnerState("internal-learner")).thenReturn(stateWithActiveGoal(activeGoal));
        when(facade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        var materials = List.of(new ContentMaterialResolver.ResolvedMaterial(
                "Ort-Zeit-Diagramme", "https://physikbuch.schule/motion-diagrams.html", "Physik Libre",
                "article", "de", List.of("Diagramme"), "public-link", "link-only"));
        when(facade.getAdditionalLearningMaterials("internal-learner", activeGoal, "en"))
                .thenReturn(materials, List.of());

        Map<String, Object> enabled = projector.projectContext("internal-learner", 1, "en");
        assertEquals(materials, enabled.get("additionalMaterials"));
        String instruction = (String) enabled.get("additionalMaterialsInstruction");
        assertTrue(instruction.contains("continue normal teaching"));
        assertTrue(instruction.contains("does not mean you have read"));
        assertTrue(instruction.contains("only in the SkillPilot cockpit"));
        assertFalse(enabled.toString().contains("internal-learner"));
        assertFalse(enabled.toString().contains("selectedPackageIds"));
        assertEquals(projector.formatGoal(activeGoal), enabled.get("activeGoal"));

        Map<String, Object> disabled = projector.projectContext("internal-learner", 2, "en");
        assertFalse(disabled.containsKey("additionalMaterials"));
        assertFalse(disabled.containsKey("additionalMaterialsInstruction"));
        assertEquals(enabled.get("activeGoal"), disabled.get("activeGoal"));
        assertEquals(enabled.get("frontier"), disabled.get("frontier"));
        assertEquals(enabled.get("progress"), disabled.get("progress"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void contextPublishesTheBindingStatusTextAndNoCountsAtAll() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                stateProjection,
                toolFacade,
                "https://skillpilot.com");
        UnifiedLearnerStateResponse state = state(null, List.of(), "setActiveGoal");
        LearnerPlanTodayStatus today = LearnerPlanTodayStatusFixtures.status(
                LocalDate.of(2026, 9, 4), true, true, 2, null,
                List.of(
                        LearnerPlanTodayStatusFixtures.withAchievement(
                                LearnerPlanTodayStatusFixtures.ambiguousSubject(
                                        List.of("private-math-a", "private-math-b"), "Mathematik\n",
                                        9, 5, 3, 3, true), 10, 364),
                        LearnerPlanTodayStatusFixtures.subject(
                                "private-physics", "Physik", 6, 4, 1, 1, false, true),
                        LearnerPlanTodayStatusFixtures.unevaluableSubject(
                                "private-invalid", "Private invalid subject", false, false)));
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(toolFacade.getLearningPlanTodayStatus("internal-learner", "de")).thenReturn(today);

        Map<String, Object> context = projector.projectContext("internal-learner", 12, "de");

        Map<String, Object> projected =
                (Map<String, Object>) context.get("learningPlanToday");
        assertEquals("2026-09-04", projected.get("asOf"));
        assertEquals(true, projected.get("followLearningPlans"));
        assertEquals(true, projected.get("resumeAvailable"));
        assertFalse(projected.containsKey("unavailablePlanCount"));
        assertFalse(projected.containsKey("statusDirection"));

        // The binding formulation is handed over verbatim, and nothing numeric accompanies it:
        // without a second data source the model has neither the means nor the task to recalculate.
        assertEquals(today.statusText(), projected.get("text"));
        assertFalse(projected.containsKey("totals"));
        for (String countField : List.of(
                "dueToday", "completedToday", "openToday", "openOverdue", "extraCompletedToday",
                "achievedGoalCount", "targetGoalCount", "balanceDialText")) {
            assertFalse(projected.toString().contains(countField), countField + " must not reach the model");
        }

        List<Map<String, Object>> subjects = (List<Map<String, Object>>) projected.get("subjects");
        assertEquals(List.of("Mathematik", "Physik", "Private invalid subject"),
                subjects.stream().map(subject -> subject.get("subject")).toList());
        assertEquals(false, subjects.get(0).get("canContinue"),
                "A subject backed by several plans must not authorize an ambiguous switch");
        assertEquals(true, subjects.get(1).get("canContinue"));
        assertEquals(false, subjects.get(2).get("evaluable"),
                "An unevaluable subject keeps its own state instead of a faked direction");
        assertNull(subjects.get(2).get("statusDirection"));
        assertFalse(projected.toString().contains("private-"));

        Map<String, Object> withActiveGoal = projector.projectLearningPlanToday(today, true);
        assertEquals(false, withActiveGoal.get("resumeAvailable"));
        List<Map<String, Object>> activeSubjects = (List<Map<String, Object>>) withActiveGoal.get("subjects");
        assertEquals(true, activeSubjects.getFirst().get("current"));
        assertEquals(false, activeSubjects.getFirst().get("canContinue"),
                "Merged equal subject names must not authorize an ambiguous switch");
    }

    @Test
    void activeGoalAnnouncementTravelsSeparatelyFromTheStatusTextAndOnlyWithAnActiveGoal() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class), "https://skillpilot.com");
        LearnerPlanTodayStatus status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.of(2026, 9, 4), true, false, 0,
                LearnerPlanTodayStatusFixtures.activeGoal("atom-a", "Potenzfunktionen beschreiben"),
                List.of(LearnerPlanTodayStatusFixtures.subject(
                        "math", "Mathematik", 13, 3, 9, 1, true, true)));

        assertEquals("Mathematik: Tagesziel 1 von 3 · 2 Lernziele im Rückstand", status.statusText(),
                "The status text holds only subject lines and never announces the active goal");

        Map<String, Object> withActiveGoal = projector.projectLearningPlanToday(status, true);
        assertEquals(status.statusText(), withActiveGoal.get("text"));
        assertEquals("Dein aktives Lernziel: Potenzfunktionen beschreiben",
                withActiveGoal.get("activeGoalAnnouncement"));
        assertFalse(((Map<?, ?>) withActiveGoal.get("guidance")).get("instruction").toString()
                .contains("Potenzfunktionen"), "Guidance carries instructions, not the announcement itself");

        Map<String, Object> withoutActiveGoal = projector.projectLearningPlanToday(status, false);
        assertFalse(withoutActiveGoal.containsKey("activeGoalAnnouncement"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void finishedDailyPlanEndsTheAssignmentInsteadOfOfferingFutureFrontierGoals() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade facade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(stateProjection, facade);
        UnifiedLearnerStateResponse state = state(null, List.of(goal("tomorrows-goal", List.of())), "setActiveGoal");
        when(facade.getLearnerState("learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(facade.getPersonalizationPlan("learner")).thenReturn(PersonalizationPlan.complete(List.of()));
        when(facade.getLearningPlanTodayStatus("learner", "de")).thenReturn(dailyStatus(true, false, 0, 0, 0));

        Map<String, Object> context = projector.projectContext("learner", 15, "de");

        assertEquals(List.of(), context.get("frontier"));
        assertEquals(Map.of("state", "learningPlan", "requiredAction", "complete"), context.get("stateMachine"));
        Map<String, Object> daily = (Map<String, Object>) context.get("learningPlanToday");
        Map<String, Object> guidance = (Map<String, Object>) daily.get("guidance");
        assertEquals("complete", guidance.get("state"));
        assertTrue(guidance.get("instruction").toString()
                .contains("Acknowledge only reached period targets named in the backend text"));
        assertFalse(context.toString().contains("tomorrows-goal"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void dailyGuidanceDistinguishesBacklogBlockedUnavailablePausedAndAvailableWork() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));
        List<LearnerPlanTodayStatus> snapshots = List.of(
                dailyStatus(true, false, 0, 0, 0),
                dailyStatus(true, false, 0, 2, 0),
                dailyStatus(true, false, 2, 0, 0),
                dailyStatus(true, false, 0, 0, 1),
                dailyStatus(false, true, 2, 0, 0),
                dailyStatus(true, true, 2, 0, 0));
        assertEquals(List.of("complete", "complete", "blocked", "unavailable", "paused", "resume"),
                snapshots.stream().map(status -> (Map<String, Object>) projector
                        .projectLearningPlanToday(status, false).get("guidance"))
                        .map(guidance -> guidance.get("state")).toList());
        assertEquals("continue", ((Map<String, Object>) projector
                .projectLearningPlanToday(snapshots.getFirst(), true).get("guidance")).get("state"),
                "A previously chosen active goal must not be silently discarded");
        LearnerPlanTodayStatus missingPlans = LearnerPlanTodayStatusFixtures.status(
                LocalDate.of(2026, 9, 4), true, false);
        assertEquals("unavailable", ((Map<String, Object>) projector
                .projectLearningPlanToday(missingPlans, false).get("guidance")).get("state"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void quotaCompletionKeepsExtraCapabilityAndBonusWithoutTurningBacklogIntoRequiredWork() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));
        // Today's target of two is done, three earlier goals were open, and four goals were
        // finished in total: the advance work nets against the backlog into a lead of one.
        LearnerPlanTodayStatus status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.of(2026, 9, 11), true, true, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                        "private-math", "Mathematik", 5, 2, 6, 6, false, true)));

        Map<String, Object> projected = projector.projectLearningPlanToday(status, false);
        Map<String, Object> guidance = (Map<String, Object>) projected.get("guidance");
        assertEquals("complete", guidance.get("state"));
        assertTrue(guidance.get("instruction").toString().contains("explicit request"));
        assertEquals(true, projected.get("resumeAvailable"));
        Map<String, Object> subject = ((List<Map<String, Object>>) projected.get("subjects")).getFirst();
        assertEquals(true, subject.get("canContinue"));
        assertEquals("ahead", subject.get("statusDirection"));
        assertTrue(status.statusText().contains("1 Lernziel vorgearbeitet"));
        assertFalse(projected.toString().contains("extraCompletedToday"));
    }

    @ParameterizedTest
    @CsvSource({"false, complete, true", "true, continue, false"})
    @SuppressWarnings("unchecked")
    void fulfilledMathQuotaAndZeroPhysicsQuotaRetainFiveAdditionalOpenPlanGoals(
            boolean hasActiveGoal, String expectedGuidance, boolean expectedResume) {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));
        // Maths met today's target of one but keeps three earlier goals open; physics has no
        // target today and two open. Both facts stand side by side in the one text.
        LearnerPlanTodayStatus status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.of(2026, 9, 14), true, true, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                                "private-math", "Mathematik", 4, 1, 1, 1, true, true),
                        LearnerPlanTodayStatusFixtures.subject(
                                "private-physics", "Physik", 2, 0, 0, 0, false, true)));

        Map<String, Object> projected = projector.projectLearningPlanToday(status, hasActiveGoal);

        assertEquals(List.of("Mathematik", "Physik"),
                ((List<Map<String, Object>>) projected.get("subjects")).stream()
                        .map(subject -> subject.get("subject")).toList());
        assertEquals(status.statusText(), projected.get("text"));
        assertTrue(status.statusText().contains("Mathematik: Tagesziel erreicht · 3 Lernziele im Rückstand"));
        assertTrue(status.statusText().contains("Physik: Heute kein Tagesziel · 2 Lernziele im Rückstand"));
        assertFalse(projected.containsKey("totals"));
        assertEquals(expectedResume, projected.get("resumeAvailable"));
        assertEquals(expectedGuidance,
                ((Map<String, Object>) projected.get("guidance")).get("state"),
                "Additional open plan goals do not enlarge the daily quota or authorize automatic extra work");
        assertFalse(projected.toString().contains("private-"));
    }

    @ParameterizedTest
    @CsvSource({"0, 0, true, 0", "1, 0, true, 0", "1, 3, true, 0",
            "0, 0, false, 0", "1, 3, false, 0", "0, 0, true, 1"})
    @SuppressWarnings("unchecked")
    void explicitExtraUsesBackendCapabilityRegardlessOfQuotaOrBacklog(
            int quota, int overdue, boolean available, int unavailablePlans) {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));
        LearnerPlanTodayStatus status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.of(2026, 9, 14), true, available, unavailablePlans, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                        "private-math", "Mathematik", quota + overdue, quota, quota, quota,
                        false, available)));

        Map<String, Object> projected = projector.projectLearningPlanToday(status, false);

        assertEquals(available, projected.get("resumeAvailable"));
        Map<String, Object> subject = ((List<Map<String, Object>>) projected.get("subjects")).getFirst();
        assertEquals(available, subject.get("canContinue"));
        Map<String, Object> guidance = (Map<String, Object>) projected.get("guidance");
        assertEquals(unavailablePlans == 0 ? "complete" : "unavailable", guidance.get("state"),
                "Extra capability must not automatically assign work or misrepresent unavailable plans");
        assertFalse(projected.containsKey("unavailablePlanCount"));
        assertFalse(projected.containsKey("statusDirection"));
        assertTrue(guidance.get("instruction").toString().contains(
                "Learning plans prioritize work and never limit learning within the Personal Curriculum"));
        assertTrue(guidance.get("instruction").toString().contains(unavailablePlans == 0
                ? "A fulfilled period target never revokes that capability"
                : "even if a plan is missing or outdated"));

        Map<String, Object> withActiveGoal = projector.projectLearningPlanToday(status, true);
        assertEquals(false, withActiveGoal.get("resumeAvailable"));
        assertEquals("continue", ((Map<String, Object>) withActiveGoal.get("guidance")).get("state"));
    }

    @ParameterizedTest
    @CsvSource({"false, blocked", "true, resume"})
    @SuppressWarnings("unchecked")
    void openQuotaDoesNotAuthorizeAutomaticExtraWhenOnlyPersonalFallbackIsAvailable(
            boolean automaticResumeAvailable, String expectedGuidance) {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));
        LearnerPlanTodayStatus status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.of(2026, 9, 14), PeriodBasis.DAY, "de", true, true,
                automaticResumeAvailable, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                        "private-math", "Mathematik", 4, 1, 0, 0, false, true)));

        Map<String, Object> projected = projector.projectLearningPlanToday(status, false);

        assertEquals(true, projected.get("resumeAvailable"), "Explicit personal learning remains available");
        assertEquals(true, ((List<Map<String, Object>>) projected.get("subjects")).getFirst().get("canContinue"));
        Map<String, Object> guidance = (Map<String, Object>) projected.get("guidance");
        assertEquals(expectedGuidance, guidance.get("state"));
        if (!automaticResumeAvailable) {
            assertTrue(guidance.get("instruction").toString().contains("An explicit learning request may still use"));
            assertTrue(guidance.get("instruction").toString().contains(
                    "Do not claim the period is complete or automatically resume extra work"));
        }
        assertFalse(projected.containsKey("automaticResumeAvailable"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void bonusBeforeItsOwnSubjectQuotaIsFilledMakesThatPlanUnavailable() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));
        LearnerPlanTodayStatus status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.of(2026, 9, 11), true, false, 1, null,
                List.of(LearnerPlanTodayStatusFixtures.unevaluableSubject(
                        "private-math", "Mathematik", false, false)));
        Map<String, Object> projected = projector.projectLearningPlanToday(status, false);
        assertFalse(projected.containsKey("unavailablePlanCount"));
        assertFalse(projected.containsKey("statusDirection"));
        assertEquals("unavailable", ((Map<String, Object>) projected.get("guidance")).get("state"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void disabledPlanGuidancePreservesOrdinaryLearningAndNavigation() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade facade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(stateProjection, facade);
        UnifiedLearnerStateResponse state = state(null, List.of(goal("regular-goal", List.of())), "setActiveGoal");
        when(facade.getLearnerState("learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(facade.getPersonalizationPlan("learner")).thenReturn(PersonalizationPlan.complete(List.of()));
        when(facade.getLearningPlanTodayStatus("learner", "de")).thenReturn(dailyStatus(false, false, 2, 0, 0));

        Map<String, Object> context = projector.projectContext("learner", 15, "de");

        List<Map<String, Object>> frontier = (List<Map<String, Object>>) context.get("frontier");
        assertEquals("regular-goal", frontier.getFirst().get("id"));
        assertEquals("setActiveGoal", ((Map<String, Object>) context.get("stateMachine")).get("requiredAction"));
        Map<String, Object> daily = (Map<String, Object>) context.get("learningPlanToday");
        Map<String, Object> guidance = (Map<String, Object>) daily.get("guidance");
        assertEquals("paused", guidance.get("state"));
        assertTrue(guidance.get("instruction").toString().contains(
                "For a normal learning request, continue the regular authoritative active goal or frontier"));
        assertEquals(false, daily.get("resumeAvailable"));
    }

    /** A day target of two goals, {@code openToday} of them still open, plus {@code overdue} backlog. */
    private static LearnerPlanTodayStatus dailyStatus(
            boolean enabled, boolean resumable, int openToday, int overdue, int unavailable) {
        return LearnerPlanTodayStatusFixtures.status(
                LocalDate.of(2026, 9, 4), enabled, resumable, unavailable, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                        "math", "Mathematik", 2 + overdue, 2, 2 - openToday, 2 - openToday,
                        false, resumable)));
    }

    @Test
    void orientationContextOmitsAnUnavailableOutlookInsteadOfPublishingNull() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);
        FrontierGoal activeGoal = orientationGoal();
        UnifiedLearnerStateResponse state = stateWithActiveGoal(activeGoal);
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(toolFacade.getOrientationOutlook("internal-learner", "de")).thenReturn(null);

        Map<String, Object> context = projector.projectContext("internal-learner", 7, "de");

        assertFalse(context.containsKey("orientationOutlook"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void orientationContextPublishesMotivationalContentWithoutTransitionIdentifiers() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);
        FrontierGoal activeGoal = orientationGoal();
        UnifiedLearnerStateResponse state = stateWithActiveGoal(activeGoal);
        OrientationOutlook outlook = new OrientationOutlook(
                activeGoal.id(),
                List.of(new OrientationOutlook.Path(
                        "internal-path-id",
                        "Technik verstehen",
                        "Du lernst, technische Systeme zu erklären.",
                        List.of("Smartphone"),
                        List.of(new OrientationOutlook.GoalReference(
                                "internal-goal-id", "Funkwellen untersuchen")),
                        List.of("internal-transition-goal"))));
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(toolFacade.getOrientationOutlook("internal-learner", "de")).thenReturn(outlook);

        Map<String, Object> context = projector.projectContext("internal-learner", 7, "de");

        Map<String, Object> projected = (Map<String, Object>) context.get("orientationOutlook");
        assertNotNull(projected);
        assertEquals(Set.of("paths"), projected.keySet());
        List<Map<String, Object>> paths = (List<Map<String, Object>>) projected.get("paths");
        assertEquals(1, paths.size());
        assertEquals(
                Set.of("title", "learningOutlook", "practicalContexts", "representativeGoals"),
                paths.getFirst().keySet());
        assertEquals(
                List.of(Map.of("title", "Funkwellen untersuchen")),
                paths.getFirst().get("representativeGoals"));
        String visibleProjection = projected.toString();
        assertFalse(visibleProjection.contains("internal-path-id"));
        assertFalse(visibleProjection.contains("internal-goal-id"));
        assertFalse(visibleProjection.contains("internal-transition-goal"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void normalContextKeepsEligibleRedirectGoalsButOmitsTheActiveDuplicate() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);
        FrontierGoal backendSelected = goal("backend-selected", List.of());
        FrontierGoal competingA = goal("competing-a", List.of());
        FrontierGoal competingB = goal("competing-b", List.of());
        UnifiedLearnerStateResponse state = state(
                backendSelected,
                List.of(backendSelected, competingA, competingB),
                "teachActiveGoal");
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));

        Map<String, Object> context = projector.projectContext("internal-learner", 11, "de");

        assertEquals("backend-selected", ((Map<String, Object>) context.get("activeGoal")).get("id"));
        List<Map<String, Object>> frontier = (List<Map<String, Object>>) context.get("frontier");
        assertEquals(List.of("competing-a", "competing-b"), frontier.stream()
                .map(item -> item.get("id").toString())
                .toList());
        assertEquals(
                "teachActiveGoal",
                ((Map<String, Object>) context.get("stateMachine")).get("requiredAction"));
        assertFalse(frontier.toString().contains("backend-selected"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void backendFrontierRemainsVisibleOnlyWhenNoGoalIsActive() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);
        FrontierGoal candidateA = goal("candidate-a", List.of());
        FrontierGoal candidateB = goal("candidate-b", List.of());
        UnifiedLearnerStateResponse state = state(
                null,
                List.of(candidateA, candidateB),
                "setActiveGoal");
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(state);
        when(stateProjection.project(state)).thenReturn(state);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));

        Map<String, Object> context = projector.projectContext("internal-learner", 12, "de");

        List<Map<String, Object>> frontier = (List<Map<String, Object>>) context.get("frontier");
        assertEquals(List.of("candidate-a", "candidate-b"), frontier.stream()
                .map(item -> item.get("id").toString())
                .toList());
        assertEquals(
                "setActiveGoal",
                ((Map<String, Object>) context.get("stateMachine")).get("requiredAction"));
    }

    @Test
    void contextOmitsMaintainerDescriptionFilterInventoryAndCompatibilityMetadata() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);

        LandscapeFilter courseFilter = new LandscapeFilter();
        courseFilter.setId("GK");
        courseFilter.setLabel("Grundkurs");
        LandscapeSummary curriculum = new LandscapeSummary(
                "internal-curriculum-id",
                "Gymnasium (DE)",
                "M5 is required; CI and QA must pass.",
                "DE",
                "ALL",
                "school",
                "Mathematik",
                "de-DE",
                List.of(courseFilter),
                true,
                true);
        FrontierGoal activeGoal = goal("goal-1", List.of("GK", "canonical", "srs-deck:private-deck"));
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                "permanent-skillpilot-id",
                curriculum,
                List.of(activeGoal),
                new LearnerGoals(List.of(activeGoal), 2, 10, null, null, false),
                List.of(),
                List.of("GK"),
                Set.of(),
                "TEACHING",
                activeGoal,
                null);
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(rawState);
        when(stateProjection.project(rawState)).thenReturn(rawState);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));

        Map<String, Object> context = projector.projectContext("internal-learner", 7, "de");

        @SuppressWarnings("unchecked")
        Map<String, Object> projectedCurriculum = (Map<String, Object>) context.get("curriculum");
        assertEquals(Map.of("title", "Gymnasium (DE)"), projectedCurriculum);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> frontier = (List<Map<String, Object>>) context.get("frontier");
        assertTrue(frontier.isEmpty(), "The active goal must not also be offered as a frontier candidate");

        String visibleProjection = context.toString();
        assertFalse(visibleProjection.contains("M5"));
        assertFalse(visibleProjection.contains("CI"));
        assertFalse(visibleProjection.contains("QA"));
        assertFalse(visibleProjection.contains("internal-curriculum-id"));
        assertFalse(visibleProjection.contains("permanent-skillpilot-id"));
        assertFalse(visibleProjection.contains("private-deck"));
        assertFalse(visibleProjection.contains("canonical"));
        assertFalse(visibleProjection.contains("filters"));
        assertFalse(visibleProjection.contains("compatibility"));
        assertFalse(visibleProjection.contains("subject=Mathematik"));
        assertFalse(context.containsKey("presentationInstruction"));
    }

    @Test
    void everyFreshVisualContextPublishesTheMandatoryPairBasedPresentationInstruction() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);

        FrontierGoal activeGoal = goalWithLinks(List.of(visualizationLink(
                "/assets/goal-visualizations/goal-1.png", "primary", "approved")));
        UnifiedLearnerStateResponse rawState = new UnifiedLearnerStateResponse(
                "permanent-skillpilot-id",
                curriculum(),
                List.of(activeGoal),
                new LearnerGoals(List.of(activeGoal), 1, 1, null, null, false),
                List.of(),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                null);
        when(toolFacade.getLearnerState("internal-learner")).thenReturn(rawState);
        when(stateProjection.project(rawState)).thenReturn(rawState);
        when(toolFacade.getPersonalizationPlan("internal-learner"))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(toolFacade.showGoalVisualizationsInChat("internal-learner")).thenReturn(true);

        Map<String, Object> first = projector.projectContext("internal-learner", 41, "de");
        Map<String, Object> afterWrite = projector.projectContext("internal-learner", 42, "de");

        assertEquals(41L, first.get("stateVersion"));
        assertEquals(42L, afterWrite.get("stateVersion"));
        assertEquals(first.get("goalVisualization"), afterWrite.get("goalVisualization"));
        assertEquals(
                ClaudeV1CoachContextProjector.GOAL_VISUALIZATION_PRESENTATION_INSTRUCTION,
                first.get("presentationInstruction"));
        assertEquals(
                ClaudeV1CoachContextProjector.GOAL_VISUALIZATION_PRESENTATION_INSTRUCTION,
                afterWrite.get("presentationInstruction"));
        String instruction = (String) afterWrite.get("presentationInstruction");
        assertTrue(instruction.contains("previously unseen pair"));
        assertTrue(instruction.contains("immediate next SkillPilot tool"));
        assertTrue(instruction.contains("completion write immediately after deciding"));
        assertTrue(instruction.contains("wait for explicit continuation before rendering"));
        assertTrue(instruction.contains("A repeated pair creates no automatic call"));
        assertTrue(instruction.contains("reload the current context once"));
        assertTrue(instruction.contains("Do not retry automatically"));
        assertTrue(instruction.contains("claim that the host displayed"));
        assertTrue(instruction.contains("including voice mode"));
        assertTrue(instruction.contains("never make it carry a task"));
        assertTrue(instruction.contains("assume it is visible"));
        assertTrue(instruction.contains("question that requires inspecting it"));
        assertTrue(instruction.contains("Never infer or request a client type"));
    }

    @Test
    void learningContextUsesLocalizedLabelsWithoutSetupProtocolIdentifiers() {
        CoachStateProjection stateProjection = mock(CoachStateProjection.class);
        CoachToolFacade toolFacade = mock(CoachToolFacade.class);
        ClaudeV1CoachContextProjector projector =
                new ClaudeV1CoachContextProjector(stateProjection, toolFacade);

        PersonalizationPlan.Option stage = option(
                "opaque-stage-option",
                "scope-stage-code",
                "Sekundarstufe II",
                "Upper secondary",
                null,
                null);
        PersonalizationPlan.Option subject = option(
                "opaque-subject-option",
                null,
                null,
                null,
                "Mathematik",
                "Mathematics");
        PersonalizationPlan plan = PersonalizationPlan.complete(
                List.of(),
                List.of(
                        decision("internal-stage-group", "Schulstufe", "School stage", stage),
                        decision("internal-subject-group", "Fach", "Subject", subject)));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> german = projector.projectLearningContext(plan, "de-DE");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> english = projector.projectLearningContext(plan, "en-US");

        assertEquals(
                List.of(
                        Map.of("label", "Schulstufe", "values", List.of("Sekundarstufe II")),
                        Map.of("label", "Fach", "values", List.of("Mathematik"))),
                german);
        assertEquals(
                List.of(
                        Map.of("label", "School stage", "values", List.of("Upper secondary")),
                        Map.of("label", "Subject", "values", List.of("Mathematics"))),
                english);

        String projection = english.toString();
        assertFalse(projection.contains("opaque"));
        assertFalse(projection.contains("internal"));
        assertFalse(projection.contains("scope-stage-code"));
    }

    @Test
    void goalProjectionKeepsLearningContentAndControlClassificationButNotRawTags() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));

        Map<String, Object> projected = projector.formatGoal(
                goal("goal-1", List.of("GK", "canonical", "srs-deck:private-deck")));

        assertEquals("Bogenmaß nutzen", projected.get("title"));
        assertEquals("Winkel im Bogenmaß verstehen und anwenden.", projected.get("description"));
        assertEquals("tutor", projected.get("nodeKind"));
        assertEquals("content", projected.get("semanticKind"));
        assertFalse(projected.containsKey("tags"));
        assertTrue(projected.containsKey("id"), "The opaque goal id remains available for tool calls");
    }

    @Test
    void goalVisualizationProjectionAcceptsOnlyTheExactCanonicalGoalAssetShape() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class),
                mock(CoachToolFacade.class),
                "https://skillpilot.com/");
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum with spaces",
                "Gymnasium (DE)",
                null,
                "DE",
                "ALL",
                "school",
                "Mathematik",
                "de-DE",
                List.of(),
                true,
                true);
        GoalSourceLink link = visualizationLink(
                "/assets/goal-visualizations/goal-1.png", "primary", "approved");
        FrontierGoal goal = goalWithLinks(List.of(link));

        assertEquals(
                Map.of(
                        "goalId", "goal-1",
                        "title", "Bogenmaß nutzen",
                        "imageUrl", "https://skillpilot.com/assets/goal-visualizations/goal-1.png",
                        "altText", "Ein Koordinatensystem zum Lernziel.",
                        "cockpitUrl", "https://skillpilot.com/?l=curriculum+with+spaces&goal=goal-1"),
                projector.projectGoalVisualization(curriculum, goal, "de"));

        GoalSourceLink traversal = visualizationLink(
                "/assets/goal-visualizations/../secret.png", "primary", "approved");
        assertNull(projector.projectGoalVisualization(curriculum, goalWithLinks(List.of(traversal)), "de"));
    }

    @Test
    void goalVisualizationProjectionAllowsOnlyCuratedReviewStatuses() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));

        for (String status : List.of(
                "pilot", "accepted", "approved", "release_approved", "released", " RELEASED ")) {
            assertNotNull(
                    projector.projectGoalVisualization(
                            curriculum(),
                            goalWithLinks(List.of(visualizationLink(
                                    "/assets/goal-visualizations/goal-1.png", "primary", status))),
                            "de"),
                    status);
        }

        for (String status : Arrays.asList(
                null, "", " ", "draft", "needs_review", "reviewed", "unknown")) {
            assertNull(
                    projector.projectGoalVisualization(
                            curriculum(),
                            goalWithLinks(List.of(visualizationLink(
                                    "/assets/goal-visualizations/goal-1.png", "primary", status))),
                            "de"),
                    String.valueOf(status));
        }
        assertNull(projector.projectGoalVisualization(
                curriculum(),
                goalWithLinks(List.of(visualizationLink(
                        "/assets/goal-visualizations/goal-1.png", null, "approved"))),
                "de"));
    }

    @Test
    void goalVisualizationProjectionFindsValidLinkAfterRejectedLink() {
        ClaudeV1CoachContextProjector projector = new ClaudeV1CoachContextProjector(
                mock(CoachStateProjection.class), mock(CoachToolFacade.class));
        GoalSourceLink draft = visualizationLink(
                "/assets/goal-visualizations/goal-1.png", "primary", "draft");
        GoalSourceLink approved = visualizationLink(
                "/assets/goal-visualizations/goal-1.png", "primary", "approved");

        assertNotNull(projector.projectGoalVisualization(
                curriculum(), goalWithLinks(List.of(draft, approved)), "de"));
    }

    private LandscapeSummary curriculum() {
        return new LandscapeSummary(
                "curriculum-1",
                "Gymnasium (DE)",
                null,
                "DE",
                "ALL",
                "school",
                "Mathematik",
                "de-DE",
                List.of(),
                true,
                true);
    }

    private GoalSourceLink visualizationLink(String url, String role, String reviewStatus) {
        return new GoalSourceLink(
                "goal-visualization",
                "Bild",
                url,
                "image",
                "SkillPilot",
                List.of(),
                null,
                "de",
                null,
                "goal-1",
                role,
                "Ein Koordinatensystem zum Lernziel.",
                reviewStatus);
    }

    private FrontierGoal goalWithLinks(List<GoalSourceLink> links) {
        return new FrontierGoal(
                "goal-1",
                "Bogenmaß nutzen",
                "Winkel im Bogenmaß verstehen und anwenden.",
                "atomic",
                "tutor",
                "content",
                null,
                List.of(),
                links,
                null,
                null,
                null,
                null,
                false);
    }

    private FrontierGoal goal(String id, List<String> tags) {
        return new FrontierGoal(
                id,
                "Bogenmaß nutzen",
                "Winkel im Bogenmaß verstehen und anwenden.",
                "atomic",
                "tutor",
                "content",
                null,
                tags,
                List.of(),
                null,
                null,
                null,
                null,
                false);
    }

    private FrontierGoal orientationGoal() {
        return new FrontierGoal(
                "orientation-goal",
                "Warum dieses Fach?",
                "Entdecke, was du in diesem Fach verstehen und gestalten kannst.",
                "atomic",
                "tutor",
                "orientation",
                null,
                List.of(),
                List.of(),
                null,
                null,
                null,
                null,
                false);
    }

    private UnifiedLearnerStateResponse stateWithActiveGoal(FrontierGoal activeGoal) {
        return new UnifiedLearnerStateResponse(
                null,
                curriculum(),
                List.of(activeGoal),
                new LearnerGoals(List.of(activeGoal), 1, 1, null, null, false),
                List.of("setMastery"),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                null);
    }

    private UnifiedLearnerStateResponse state(
            FrontierGoal activeGoal,
            List<FrontierGoal> frontier,
            String requiredAction) {
        return new UnifiedLearnerStateResponse(
                null,
                curriculum(),
                frontier,
                new LearnerGoals(frontier, 0, frontier.size(), null, null, false),
                List.of(),
                List.of(),
                Set.of(),
                "TEACHING",
                activeGoal,
                new StateMachineInfo(
                        "TEACHING",
                        requiredAction,
                        frontier,
                        List.of(),
                        activeGoal));
    }

    private PersonalizationPlan.CompletedDecision decision(
            String groupId,
            String groupLabel,
            String groupLabelEn,
            PersonalizationPlan.Option option) {
        return new PersonalizationPlan.CompletedDecision(
                "opaque-rewind",
                "internal-stage",
                "Kontext festlegen",
                groupId,
                groupLabel,
                "internal-instance",
                List.of(option),
                "Choose context",
                groupLabelEn);
    }

    private PersonalizationPlan.Option option(
            String optionId,
            String scopeValue,
            String scopeLabel,
            String scopeLabelEn,
            String landscapeLabel,
            String landscapeLabelEn) {
        return new PersonalizationPlan.Option(
                optionId,
                "internal-stage",
                "internal-group",
                "internal-instance",
                landscapeLabel == null ? null : "internal-landscape",
                landscapeLabel,
                null,
                null,
                scopeValue == null ? null : "stage",
                scopeValue,
                scopeLabel,
                PersonalizationPlan.OptionKind.VALUE,
                landscapeLabelEn,
                null,
                scopeLabelEn);
    }
}
