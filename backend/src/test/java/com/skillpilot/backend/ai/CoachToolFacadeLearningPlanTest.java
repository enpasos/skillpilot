package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.LearnerPlanTodayStatusFixtures;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerLearningPlanService;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class CoachToolFacadeLearningPlanTest {

    private static final String LEARNER_ID = "learner-id";

    private LearnerService learnerService;
    private LearnerLearningPlanService learningPlans;
    private CoachToolFacade facade;

    @BeforeEach
    void setUp() {
        learnerService = mock(LearnerService.class);
        learningPlans = mock(LearnerLearningPlanService.class);
        facade = new CoachToolFacade(
                learnerService,
                mock(ChatSessionService.class),
                mock(CoachStateProjection.class),
                mock(LearnerLifecycleService.class),
                learningPlans);
    }

    @Test
    void dailyPlanReadUsesTheProviderNeutralServiceAndSessionLocale() {
        LearnerPlanTodayStatus status = status(true);
        when(learningPlans.getTodayStatus(LEARNER_ID, "en-GB")).thenReturn(status);

        assertThat(facade.getLearningPlanTodayStatus(LEARNER_ID, "en-GB"))
                .isSameAs(status);

        verify(learnerService).assertActiveLearnerRouteAccess(LEARNER_ID);
        verify(learningPlans).getTodayStatus(LEARNER_ID, "en-GB");
    }

    @Test
    void resumeDelegatesToServerDateReconcileOnlyAfterTheReadGate() {
        LearnerLearningPlanApi.TransitionResponse transition =
                new LearnerLearningPlanApi.TransitionResponse(
                        null,
                        null,
                        null,
                        null,
                        "goal-1",
                        true,
                        mock(UnifiedLearnerStateResponse.class));
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status(true));
        when(learningPlans.resumeExplicitly(
                        eq(LEARNER_ID),
                        eq(new LearnerLearningPlanApi.ReconcileRequest(null))))
                .thenReturn(transition);

        assertThat(facade.resumeLearningPlan(LEARNER_ID, "de-DE"))
                .isSameAs(transition);

        verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        verify(learningPlans).resumeExplicitly(
                LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(null));
    }

    @Test
    void resumeRejectsANoopWithoutCallingReconcile() {
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status(false));

        assertThatThrownBy(() -> facade.resumeLearningPlan(LEARNER_ID, "de-DE"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        verify(learningPlans, never()).resumeExplicitly(
                eq(LEARNER_ID),
                eq(new LearnerLearningPlanApi.ReconcileRequest(null)));
    }

    @Test
    void resumeRejectsAnUnexpectedSuccessfulReconcileNoop() {
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status(true));
        when(learningPlans.resumeExplicitly(
                        eq(LEARNER_ID),
                        eq(new LearnerLearningPlanApi.ReconcileRequest(null))))
                .thenReturn(new LearnerLearningPlanApi.TransitionResponse(
                        null,
                        null,
                        null,
                        null,
                        null,
                        false,
                        mock(UnifiedLearnerStateResponse.class)));

        assertThatThrownBy(() -> facade.resumeLearningPlan(LEARNER_ID, "de-DE"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void subjectSwitchResolvesOneFreshLocalizedNameAndUsesTheAuthoritativePlanSwitch() {
        LocalDate asOf = LocalDate.parse("2026-09-04");
        UUID planId = UUID.randomUUID();
        LearnerPlanTodayStatus today = status(
                true,
                subject("math-landscape", "Mathematik", 3, 1, 0, false, false),
                subject("physics-landscape", "Physik", 2, 0, 1, false, false));
        LearnerLearningPlanApi.PlanDetail physicsPlan = planDetail(
                planId, 9L, "physics-landscape", false);
        UnifiedLearnerStateResponse switchedState = stateWithActiveGoal("physics-goal");
        LearnerLearningPlanApi.TransitionResponse transition =
                new LearnerLearningPlanApi.TransitionResponse(
                        planId,
                        9L,
                        "physics-landscape",
                        "physics-focus",
                        "physics-goal",
                        true,
                        switchedState);
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(today);
        when(learningPlans.getPlan(LEARNER_ID, "physics-landscape", asOf))
                .thenReturn(physicsPlan);
        when(learningPlans.switchPlan(
                        LEARNER_ID,
                        planId,
                        new LearnerLearningPlanApi.ContinueRequest(9L, asOf)))
                .thenReturn(transition);

        assertThat(facade.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                .isSameAs(transition);

        verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        verify(learnerService).acquireLearningPlanMutationLock(LEARNER_ID);
        verify(learningPlans).getPlan(LEARNER_ID, "physics-landscape", asOf);
        verify(learningPlans).switchPlan(
                LEARNER_ID,
                planId,
                new LearnerLearningPlanApi.ContinueRequest(9L, asOf));
        verify(learningPlans, never()).switchPersonalCurriculumSubject(eq(LEARNER_ID), any());
    }

    @Test
    void subjectSwitchWithoutAStoredPlanUsesTheExactLocalizedPersonalSubjectWithoutAQuota() {
        LocalDate asOf = LocalDate.parse("2026-09-04");
        when(learningPlans.getTodayStatus(LEARNER_ID, "en-GB")).thenReturn(status(
                true,
                subject("math-landscape", "Mathematics", 2, 0, 0, false, false),
                subject("physics-landscape", "Physics", 0, 0, 0, false, true)));
        when(learningPlans.getPlan(LEARNER_ID, "physics-landscape", asOf))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "No stored plan"));
        LearnerLearningPlanApi.TransitionResponse transition = personalCurriculumTransition(
                true, "physics-goal", stateWithActiveGoal("physics-goal"));
        when(learningPlans.switchPersonalCurriculumSubject(LEARNER_ID, "physics-landscape"))
                .thenReturn(transition);

        assertThat(facade.switchLearningPlanSubject(LEARNER_ID, "en-GB", "Physics"))
                .isSameAs(transition);

        InOrder sequence = inOrder(learnerService, learningPlans);
        sequence.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        sequence.verify(learnerService).acquireLearningPlanMutationLock(LEARNER_ID);
        sequence.verify(learningPlans).getTodayStatus(LEARNER_ID, "en-GB");
        sequence.verify(learningPlans).getPlan(LEARNER_ID, "physics-landscape", asOf);
        sequence.verify(learningPlans).switchPersonalCurriculumSubject(LEARNER_ID, "physics-landscape");
        verify(learningPlans, never()).switchPlan(eq(LEARNER_ID), any(), any());
    }

    @Test
    void subjectSwitchWithAStalePlanUsesPersonalTargetsAfterTheDailyQuotaIsComplete() {
        LocalDate asOf = LocalDate.parse("2026-09-04");
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status(
                true,
                subject("physics-landscape", "Physik", 2, 2, 0, false, true)));
        when(learningPlans.getPlan(LEARNER_ID, "physics-landscape", asOf))
                .thenReturn(planDetail(UUID.randomUUID(), 9L, "physics-landscape", true));
        LearnerLearningPlanApi.TransitionResponse transition = personalCurriculumTransition(
                true, "physics-goal", stateWithActiveGoal("physics-goal"));
        when(learningPlans.switchPersonalCurriculumSubject(LEARNER_ID, "physics-landscape"))
                .thenReturn(transition);

        assertThat(facade.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                .isSameAs(transition);

        verify(learningPlans).switchPersonalCurriculumSubject(LEARNER_ID, "physics-landscape");
        verify(learningPlans, never()).switchPlan(eq(LEARNER_ID), any(), any());
    }

    @Test
    void subjectSwitchWithAnUnavailableStoredPlanUsesThePublishedPersonalContinuationCapability() {
        LocalDate asOf = LocalDate.parse("2026-09-04");
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(
                LearnerPlanTodayStatusFixtures.status(asOf, true, true, 1, null,
                        List.of(LearnerPlanTodayStatusFixtures.unevaluableSubject(
                                "physics-landscape", "Physik", false, true))));
        when(learningPlans.getPlan(LEARNER_ID, "physics-landscape", asOf))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Stored plan is corrupt"));
        LearnerLearningPlanApi.TransitionResponse transition = personalCurriculumTransition(
                true, "physics-goal", stateWithActiveGoal("physics-goal"));
        when(learningPlans.switchPersonalCurriculumSubject(LEARNER_ID, "physics-landscape"))
                .thenReturn(transition);

        assertThat(facade.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                .isSameAs(transition);

        InOrder sequence = inOrder(learnerService, learningPlans);
        sequence.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        sequence.verify(learnerService).acquireLearningPlanMutationLock(LEARNER_ID);
        sequence.verify(learningPlans).getTodayStatus(LEARNER_ID, "de-DE");
        sequence.verify(learningPlans).getPlan(LEARNER_ID, "physics-landscape", asOf);
        sequence.verify(learningPlans).switchPersonalCurriculumSubject(LEARNER_ID, "physics-landscape");
        verify(learningPlans, never()).switchPlan(eq(LEARNER_ID), any(), any());
    }

    @Test
    void subjectSwitchDoesNotUseAnUnavailablePlanWithoutAPublishedContinuationCapability() {
        LocalDate asOf = LocalDate.parse("2026-09-04");
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(
                LearnerPlanTodayStatusFixtures.status(asOf, true, false, 1, null,
                        List.of(LearnerPlanTodayStatusFixtures.unevaluableSubject(
                                "physics-landscape", "Physik", false, false))));
        when(learningPlans.getPlan(LEARNER_ID, "physics-landscape", asOf))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Stored plan is corrupt"));

        assertThatThrownBy(() -> facade.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        verify(learningPlans, never()).switchPlan(eq(LEARNER_ID), any(), any());
        verify(learningPlans, never()).switchPersonalCurriculumSubject(eq(LEARNER_ID), any());
    }

    @Test
    void subjectSwitchDoesNotTreatANameFromAnotherLocaleAsAPublishedPersonalSubject() {
        when(learningPlans.getTodayStatus(LEARNER_ID, "en-GB")).thenReturn(status(
                true,
                subject("physics-landscape", "Physics", 0, 0, 0, false, true)));

        assertThatThrownBy(() -> facade.switchLearningPlanSubject(LEARNER_ID, "en-GB", "Physik"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        verify(learningPlans, never()).getPlan(eq(LEARNER_ID), any(), any());
        verify(learningPlans, never()).switchPlan(eq(LEARNER_ID), any(), any());
        verify(learningPlans, never()).switchPersonalCurriculumSubject(eq(LEARNER_ID), any());
    }

    @Test
    void subjectSwitchNeverFallsBackForMalformedStoredPlansEvenWhenStale() {
        LocalDate asOf = LocalDate.parse("2026-09-04");
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status(
                true,
                subject("physics-landscape", "Physik", 0, 0, 0, false, true)));

        for (LearnerLearningPlanApi.PlanDetail malformedPlan :
                new LearnerLearningPlanApi.PlanDetail[] {
                    null,
                    planDetail(null, 9L, "physics-landscape", true),
                    planDetail(UUID.randomUUID(), 9L, "other-landscape", true)
                }) {
            when(learningPlans.getPlan(LEARNER_ID, "physics-landscape", asOf))
                    .thenReturn(malformedPlan);

            assertThatThrownBy(() -> facade.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                    .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                        assertThat(exception.getReason()).doesNotContain("physics-landscape", "other-landscape");
                    });
        }

        verify(learningPlans, never()).switchPlan(eq(LEARNER_ID), any(), any());
        verify(learningPlans, never()).switchPersonalCurriculumSubject(eq(LEARNER_ID), any());
    }

    @Test
    void subjectSwitchNeverFallsBackForPlanReadAuthorizationValidationOrServerFailures() {
        LocalDate asOf = LocalDate.parse("2026-09-04");

        for (HttpStatus failureStatus : List.of(
                HttpStatus.BAD_REQUEST, HttpStatus.UNAUTHORIZED, HttpStatus.FORBIDDEN,
                HttpStatus.CONFLICT, HttpStatus.INTERNAL_SERVER_ERROR, HttpStatus.SERVICE_UNAVAILABLE)) {
            boolean planEvaluable = failureStatus == HttpStatus.CONFLICT;
            when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(
                    LearnerPlanTodayStatusFixtures.status(asOf, true, true, planEvaluable ? 0 : 1, null,
                            List.of(planEvaluable
                                    ? subject("physics-landscape", "Physik", 0, 0, 0, false, true)
                                    : LearnerPlanTodayStatusFixtures.unevaluableSubject(
                                            "physics-landscape", "Physik", false, true))));
            ResponseStatusException failure = new ResponseStatusException(
                    failureStatus, "Internal plan detail: physics-landscape");
            doThrow(failure).when(learningPlans)
                    .getPlan(LEARNER_ID, "physics-landscape", asOf);

            assertThatThrownBy(() -> facade.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                    .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                        if (failureStatus.is5xxServerError()) {
                            assertThat(exception).isSameAs(failure);
                        } else {
                            assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                            assertThat(exception.getReason()).doesNotContain("physics-landscape");
                        }
                    });
        }

        verify(learningPlans, never()).switchPlan(eq(LEARNER_ID), any(), any());
        verify(learningPlans, never()).switchPersonalCurriculumSubject(eq(LEARNER_ID), any());
    }

    @Test
    void subjectSwitchChecksWriteAuthorizationBeforeResolvingPersonalSubjects() {
        ResponseStatusException forbidden = new ResponseStatusException(HttpStatus.FORBIDDEN);
        doThrow(forbidden).when(learnerService).assertWritableLearningSession(LEARNER_ID);

        assertThatThrownBy(() -> facade.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                .isSameAs(forbidden);

        verifyNoInteractions(learningPlans);
        verify(learnerService, never()).acquireLearningPlanMutationLock(LEARNER_ID);
    }

    @Test
    void personalSubjectSwitchRejectsNoopsAndMissingOrInconsistentActiveGoals() {
        LocalDate asOf = LocalDate.parse("2026-09-04");
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status(
                true,
                subject("physics-landscape", "Physik", 0, 0, 0, false, true)));
        when(learningPlans.getPlan(LEARNER_ID, "physics-landscape", asOf))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));
        UnifiedLearnerStateResponse activeState = stateWithActiveGoal("physics-goal");

        for (LearnerLearningPlanApi.TransitionResponse invalidTransition :
                new LearnerLearningPlanApi.TransitionResponse[] {
                    null,
                    personalCurriculumTransition(false, "physics-goal", activeState),
                    personalCurriculumTransition(true, "physics-goal", null),
                    personalCurriculumTransition(true, null, activeState),
                    personalCurriculumTransition(true, " ", activeState),
                    personalCurriculumTransition(true, "physics-goal", mock(UnifiedLearnerStateResponse.class)),
                    personalCurriculumTransition(true, "different-goal", activeState)
                }) {
            when(learningPlans.switchPersonalCurriculumSubject(LEARNER_ID, "physics-landscape"))
                    .thenReturn(invalidTransition);

            assertThatThrownBy(() -> facade.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                    .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                            assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        }

        verify(learningPlans, never()).switchPlan(eq(LEARNER_ID), any(), any());
    }

    @Test
    void personalSubjectSwitchPreservesDomainRejectionAndServerFailureHandling() {
        LocalDate asOf = LocalDate.parse("2026-09-04");
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status(
                true,
                subject("physics-landscape", "Physik", 0, 0, 0, false, true)));
        when(learningPlans.getPlan(LEARNER_ID, "physics-landscape", asOf))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND));

        for (HttpStatus failureStatus : List.of(HttpStatus.CONFLICT, HttpStatus.FORBIDDEN,
                HttpStatus.SERVICE_UNAVAILABLE)) {
            ResponseStatusException failure = new ResponseStatusException(
                    failureStatus, "Internal subject detail: physics-landscape");
            doThrow(failure).when(learningPlans)
                    .switchPersonalCurriculumSubject(LEARNER_ID, "physics-landscape");

            assertThatThrownBy(() -> facade.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                    .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                        if (failureStatus.is5xxServerError()) {
                            assertThat(exception).isSameAs(failure);
                        } else {
                            assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                            assertThat(exception.getReason()).doesNotContain("physics-landscape");
                        }
                    });
        }

        verify(learningPlans, never()).switchPlan(eq(LEARNER_ID), any(), any());
    }

    @Test
    void subjectSwitchFailsClosedForUnknownOrAmbiguousNamesWithoutSelectingAPlan() {
        LearnerPlanTodayStatus duplicateSubjects = status(
                true,
                subject("physics-one", "Physik", 1, 0, 0, false, false),
                subject("physics-two", "Physik", 2, 0, 0, false, false));
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(duplicateSubjects);

        assertThatThrownBy(() -> facade.switchLearningPlanSubject(
                        LEARNER_ID, "de-DE", "Physik"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getReason())
                            .doesNotContain("physics-one", "physics-two");
                });
        assertThatThrownBy(() -> facade.switchLearningPlanSubject(
                        LEARNER_ID, "de-DE", "Chemie"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
                    assertThat(exception.getReason())
                            .doesNotContain("physics-one", "physics-two");
                });

        verify(learningPlans, never()).getPlan(eq(LEARNER_ID), any(), any());
        verify(learningPlans, never()).switchPlan(eq(LEARNER_ID), any(), any());
        verify(learningPlans, never()).switchPersonalCurriculumSubject(eq(LEARNER_ID), any());
    }

    @Test
    void subjectSwitchRejectsNonExactProjectedNamesAndSuccessfulNoops() {
        assertThatThrownBy(() -> facade.switchLearningPlanSubject(
                        LEARNER_ID, "de-DE", " Physik"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));

        LocalDate asOf = LocalDate.parse("2026-09-04");
        UUID planId = UUID.randomUUID();
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status(
                true,
                subject("physics-landscape", "Physik", 1, 0, 0, false, false)));
        when(learningPlans.getPlan(LEARNER_ID, "physics-landscape", asOf))
                .thenReturn(planDetail(planId, 4L, "physics-landscape", false));
        when(learningPlans.switchPlan(
                        LEARNER_ID,
                        planId,
                        new LearnerLearningPlanApi.ContinueRequest(4L, asOf)))
                .thenReturn(new LearnerLearningPlanApi.TransitionResponse(
                        planId,
                        4L,
                        "physics-landscape",
                        "physics-focus",
                        "physics-goal",
                        false,
                        stateWithActiveGoal("physics-goal")));

        assertThatThrownBy(() -> facade.switchLearningPlanSubject(
                        LEARNER_ID, "de-DE", "Physik"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    private static LearnerPlanTodayStatus status(boolean resumeAvailable) {
        return LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-04"), true, resumeAvailable);
    }

    private static LearnerPlanTodayStatus status(
            boolean followLearningPlans,
            LearnerPlanTodayStatus.SubjectStatus... subjects) {
        return LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-04"), followLearningPlans, false, 0, null,
                List.of(subjects));
    }

    /** Mirrors the old count wording: a period target of {@code due} with {@code overdue} backlog. */
    private static LearnerPlanTodayStatus.SubjectStatus subject(
            String landscapeId, String label, int due, int completed, int overdue,
            boolean current, boolean canContinue) {
        return LearnerPlanTodayStatusFixtures.subject(
                landscapeId, label, due + overdue, due, completed, completed, current, canContinue);
    }

    private static LearnerLearningPlanApi.PlanDetail planDetail(
            UUID planId,
            long revision,
            String landscapeId,
            boolean stale) {
        return new LearnerLearningPlanApi.PlanDetail(
                planId,
                revision,
                landscapeId,
                null,
                stale,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                List.of());
    }

    private static LearnerLearningPlanApi.TransitionResponse personalCurriculumTransition(
            boolean changed,
            String activeGoalId,
            UnifiedLearnerStateResponse state) {
        return new LearnerLearningPlanApi.TransitionResponse(
                null, null, "physics-landscape", "physics-focus", activeGoalId, changed, state);
    }

    private static UnifiedLearnerStateResponse stateWithActiveGoal(String goalId) {
        FrontierGoal goal = new FrontierGoal(
                goalId,
                "Goal",
                "Description",
                "atomic",
                null,
                null,
                null,
                List.of(),
                List.of(),
                null,
                null,
                null,
                null,
                true,
                List.of());
        return new UnifiedLearnerStateResponse(
                null,
                null,
                List.of(goal),
                null,
                List.of("teachActiveGoal"),
                List.of(),
                java.util.Set.of(),
                "TEACHING",
                goal,
                new StateMachineInfo(
                        "TEACHING",
                        "teachActiveGoal",
                        List.of(goal),
                        List.of(),
                        goal,
                        List.of()));
    }
}
