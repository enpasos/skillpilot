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
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.LearnerPlanTodayStatusFixtures;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
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
                        LearnerPlanTodayStatusFixtures.ambiguousSubject(
                                List.of("private-math-a", "private-math-b"), "Mathematik\n",
                                9, 5, 3, 3, true),
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
                "dueToday", "completedToday", "openToday", "openOverdue", "extraCompletedToday")) {
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
