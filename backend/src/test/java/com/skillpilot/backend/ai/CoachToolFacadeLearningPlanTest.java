package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
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
        when(learningPlans.reconcile(
                        eq(LEARNER_ID),
                        eq(new LearnerLearningPlanApi.ReconcileRequest(null))))
                .thenReturn(transition);

        assertThat(facade.resumeLearningPlan(LEARNER_ID, "de-DE"))
                .isSameAs(transition);

        verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        verify(learningPlans).reconcile(
                LEARNER_ID,
                new LearnerLearningPlanApi.ReconcileRequest(null));
    }

    @Test
    void resumeRejectsANoopWithoutCallingReconcile() {
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status(false));

        assertThatThrownBy(() -> facade.resumeLearningPlan(LEARNER_ID, "de-DE"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        verify(learningPlans, never()).reconcile(
                eq(LEARNER_ID),
                eq(new LearnerLearningPlanApi.ReconcileRequest(null)));
    }

    @Test
    void resumeRejectsAnUnexpectedSuccessfulReconcileNoop() {
        when(learningPlans.getTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status(true));
        when(learningPlans.reconcile(
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
                new LearnerPlanTodayStatus.SubjectStatus(
                        "math-landscape", "Mathematik", 3, 1, 2, 0),
                new LearnerPlanTodayStatus.SubjectStatus(
                        "physics-landscape", "Physik", 2, 0, 2, 1));
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
    }

    @Test
    void subjectSwitchFailsClosedForUnknownOrAmbiguousNamesWithoutSelectingAPlan() {
        LearnerPlanTodayStatus duplicateSubjects = status(
                true,
                new LearnerPlanTodayStatus.SubjectStatus(
                        "physics-one", "Physik", 1, 0, 1, 0),
                new LearnerPlanTodayStatus.SubjectStatus(
                        "physics-two", "Physik", 2, 0, 2, 0));
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
                new LearnerPlanTodayStatus.SubjectStatus(
                        "physics-landscape", "Physik", 1, 0, 1, 0)));
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
        return new LearnerPlanTodayStatus(
                LocalDate.parse("2026-09-04"),
                true,
                resumeAvailable,
                List.of(),
                new LearnerPlanTodayStatus.Totals(0, 0, 0, 0),
                0);
    }

    private static LearnerPlanTodayStatus status(
            boolean followLearningPlans,
            LearnerPlanTodayStatus.SubjectStatus... subjects) {
        int dueToday = java.util.Arrays.stream(subjects)
                .mapToInt(LearnerPlanTodayStatus.SubjectStatus::dueToday)
                .sum();
        int completedToday = java.util.Arrays.stream(subjects)
                .mapToInt(LearnerPlanTodayStatus.SubjectStatus::completedToday)
                .sum();
        int openToday = java.util.Arrays.stream(subjects)
                .mapToInt(LearnerPlanTodayStatus.SubjectStatus::openToday)
                .sum();
        int openOverdue = java.util.Arrays.stream(subjects)
                .mapToInt(LearnerPlanTodayStatus.SubjectStatus::openOverdue)
                .sum();
        return new LearnerPlanTodayStatus(
                LocalDate.parse("2026-09-04"),
                followLearningPlans,
                false,
                List.of(subjects),
                new LearnerPlanTodayStatus.Totals(
                        dueToday, completedToday, openToday, openOverdue),
                0);
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
