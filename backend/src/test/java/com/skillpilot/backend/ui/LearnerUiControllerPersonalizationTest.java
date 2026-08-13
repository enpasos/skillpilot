package com.skillpilot.backend.ui;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.PersonalizationRewindRequest;
import com.skillpilot.backend.api.PlannedGoalsMutationResponse;
import com.skillpilot.backend.api.PlannedGoalsRequest;
import com.skillpilot.backend.api.PreferencesRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.service.LearnerLifecycleService;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Supplier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class LearnerUiControllerPersonalizationTest {

    private static final String LEARNER_ID = "learner-level-2";

    private LearnerService learnerService;
    private LearnerLifecycleService learnerLifecycle;
    private LearnerUiController controller;

    @BeforeEach
    void setUp() {
        learnerService = mock(LearnerService.class);
        learnerLifecycle = mock(LearnerLifecycleService.class);
        doAnswer(invocation -> ((Supplier<?>) invocation.getArgument(1)).get())
                .when(learnerLifecycle)
                .withActivity(org.mockito.ArgumentMatchers.eq(LEARNER_ID),
                        org.mockito.ArgumentMatchers.<Supplier<Object>>any());
        doAnswer(invocation -> {
                    ((Runnable) invocation.getArgument(1)).run();
                    return null;
                })
                .when(learnerLifecycle)
                .withActivity(org.mockito.ArgumentMatchers.eq(LEARNER_ID),
                        org.mockito.ArgumentMatchers.any(Runnable.class));
        controller = new LearnerUiController(
                learnerService,
                mock(ChatSessionService.class),
                learnerLifecycle);
    }

    @Test
    void personalizationPlanReturnsTheCurrentProviderNeutralPlan() {
        PersonalizationPlan plan = PersonalizationPlan.complete(List.of());
        when(learnerService.getPersonalizationPlan(LEARNER_ID)).thenReturn(plan);

        PersonalizationPlan response = controller.getPersonalizationPlan(LEARNER_ID);

        assertThat(response).isSameAs(plan);
        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertActiveLearnerRouteAccess(LEARNER_ID);
        ordered.verify(learnerService).getPersonalizationPlan(LEARNER_ID);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void preferencesForwardTheOptionalChatVisualizationSetting() {
        controller.updatePreferences(
                LEARNER_ID,
                new PreferencesRequest(null, null, null, false));

        verify(learnerService).setPreferences(
                LEARNER_ID,
                null,
                null,
                null,
                false);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void plannedFocusMutationReturnsTheAuthoritativeLearnerState() {
        PlannedGoalsRequest request = new PlannedGoalsRequest(Set.of("focus-root"));
        UnifiedLearnerStateResponse state = mock(UnifiedLearnerStateResponse.class);
        PlannedGoalsMutationResponse mutation = new PlannedGoalsMutationResponse(
                List.of("focus-root"),
                state);
        when(learnerService.setPlannedGoalsAndGetState(LEARNER_ID, request.goals()))
                .thenReturn(mutation);

        PlannedGoalsMutationResponse response = controller.setPlanned(LEARNER_ID, request);

        assertThat(response).isSameAs(mutation);
        assertThat(response.goals()).containsExactly("focus-root");
        assertThat(response.state()).isSameAs(state);
        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        ordered.verify(learnerService).setPlannedGoalsAndGetState(LEARNER_ID, request.goals());
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void scopeMutationReturnsTheAuthoritativeLearnerState() {
        ScopeRequest request = new ScopeRequest(List.of("focus-root"));
        UnifiedLearnerStateResponse state = mock(UnifiedLearnerStateResponse.class);
        when(learnerService.setScope(LEARNER_ID, request.goalIds())).thenReturn(state);

        UnifiedLearnerStateResponse response = controller.setScope(LEARNER_ID, request);

        assertThat(response).isSameAs(state);
        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        ordered.verify(learnerService).setScope(LEARNER_ID, request.goalIds());
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void personalizationOptionForwardsTheOpaqueOptionAndReturnsTheRefreshedPlan() {
        PersonalizationRequest request =
                new PersonalizationRequest(Map.of(), List.of(), List.of(), "opaque-option-7");
        PersonalizationPlan refreshed = PersonalizationPlan.complete(List.of());
        when(learnerService.getPersonalizationPlan(LEARNER_ID)).thenReturn(refreshed);

        PersonalizationPlan response =
                controller.applyPersonalizationOption(LEARNER_ID, request);

        assertThat(response).isSameAs(refreshed);
        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        ordered.verify(learnerService).patchPersonalCurriculum(
                LEARNER_ID,
                request.config(),
                request.goalIds(),
                request.filters(),
                "opaque-option-7");
        ordered.verify(learnerService).getPersonalizationPlan(LEARNER_ID);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void personalizationOptionRequiresAnOpaqueOptionReference() {
        PersonalizationRequest request =
                new PersonalizationRequest(Map.of(), List.of(), List.of(), null);

        assertThatThrownBy(() ->
                        controller.applyPersonalizationOption(LEARNER_ID, request))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));

        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void personalizationRestartDelegatesToTheScopedServiceOperation() {
        PersonalizationPlan restarted = PersonalizationPlan.selection(
                "stage-region",
                "Region",
                "group-region",
                "Bundesland",
                "root",
                1,
                1,
                0,
                List.of(),
                List.of());
        when(learnerService.restartPersonalization(LEARNER_ID))
                .thenReturn(restarted);

        PersonalizationPlan response =
                controller.restartPersonalization(LEARNER_ID);

        assertThat(response).isSameAs(restarted);
        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        ordered.verify(learnerService).restartPersonalization(LEARNER_ID);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void migratedPersonalizationReopenDelegatesToThePreservingServiceOperation() {
        PersonalizationPlan reopened = PersonalizationPlan.selection(
                "stage-region",
                "Region",
                "group-region",
                "Bundesland",
                "root",
                1,
                1,
                0,
                List.of(),
                List.of());
        when(learnerService.reopenMigratedPersonalization(LEARNER_ID))
                .thenReturn(reopened);

        PersonalizationPlan response =
                controller.reopenMigratedPersonalization(LEARNER_ID);

        assertThat(response).isSameAs(reopened);
        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        ordered.verify(learnerService).reopenMigratedPersonalization(LEARNER_ID);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void personalizationRewindDelegatesTheOpaqueReferenceToTheScopedServiceOperation() {
        PersonalizationPlan rewound = PersonalizationPlan.selection(
                "stage-region",
                "Region",
                "group-region",
                "Bundesland",
                "root",
                1,
                1,
                0,
                List.of(),
                List.of());
        when(learnerService.rewindPersonalization(LEARNER_ID, "opaque-rewind-9"))
                .thenReturn(rewound);

        PersonalizationPlan response = controller.rewindPersonalization(
                LEARNER_ID,
                new PersonalizationRewindRequest("opaque-rewind-9"));

        assertThat(response).isSameAs(rewound);
        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        ordered.verify(learnerService)
                .rewindPersonalization(LEARNER_ID, "opaque-rewind-9");
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void personalizationRewindRequiresAnOpaqueReference() {
        assertThatThrownBy(() ->
                        controller.rewindPersonalization(
                                LEARNER_ID,
                                new PersonalizationRewindRequest(" ")))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));

        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        verifyNoMoreInteractions(learnerService);
    }

    @Test
    void personalizationRewindRequiresARequestBody() {
        assertThatThrownBy(() ->
                        controller.rewindPersonalization(LEARNER_ID, null))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(error -> assertThat(
                                ((ResponseStatusException) error).getStatusCode())
                        .isEqualTo(HttpStatus.BAD_REQUEST));

        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertWritableLearningSession(LEARNER_ID);
        verifyNoMoreInteractions(learnerService);
    }
}
