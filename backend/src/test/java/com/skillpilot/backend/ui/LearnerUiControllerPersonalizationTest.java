package com.skillpilot.backend.ui;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerService;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class LearnerUiControllerPersonalizationTest {

    private static final String LEARNER_ID = "learner-level-2";

    private LearnerService learnerService;
    private LearnerUiController controller;

    @BeforeEach
    void setUp() {
        learnerService = mock(LearnerService.class);
        controller = new LearnerUiController(
                learnerService,
                mock(ChatSessionService.class));
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
}
