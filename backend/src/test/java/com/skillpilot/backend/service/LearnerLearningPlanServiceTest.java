package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanningScopeResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerLearningPlan;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class LearnerLearningPlanServiceTest {

    @Test
    void concurrentFirstCreateIsReportedAsRevisionConflict() {
        LearnerLearningPlanRepository plans = mock(LearnerLearningPlanRepository.class);
        LearnerService learners = mock(LearnerService.class);
        ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
        ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
        ZoneId zone = ZoneId.of("Europe/Berlin");
        LearnerLearningPlanService service = new LearnerLearningPlanService(
                plans,
                learners,
                objectMapper,
                events,
                Clock.fixed(Instant.parse("2026-09-04T08:00:00Z"), zone));

        Learner learner = new Learner();
        learner.setSkillpilotId("learner-race");
        when(learners.getLearner("learner-race")).thenReturn(learner);
        when(learners.getPlanningScope("learner-race", "math"))
                .thenReturn(new LearnerPlanningScopeResponse(
                        "curriculum",
                        "math",
                        List.of("atom-a"),
                        1,
                        0,
                        List.of("atom-a"),
                        Instant.parse("2026-09-04T08:00:00Z")));
        when(plans.findForUpdate("learner-race", "math")).thenReturn(Optional.empty());
        when(learners.orderLearningPlanBlocksByPrerequisites(any(), any()))
                .thenAnswer(invocation -> invocation.getArgument(1));
        when(plans.saveAndFlush(any(LearnerLearningPlan.class)))
                .thenThrow(new DataIntegrityViolationException("concurrent unique row"));

        var request = new LearnerLearningPlanApi.UpsertRequest(
                0L,
                null,
                List.of(new LearnerLearningPlanApi.Block(
                        "section",
                        "learning",
                        "math-focus",
                        null,
                        LocalDate.parse("2026-09-01"),
                        LocalDate.parse("2026-09-04"),
                        null,
                        List.of("atom-a"))));

        assertThatThrownBy(() -> service.upsert(
                        "learner-race",
                        "math",
                        request,
                        LocalDate.parse("2026-09-04")))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
        verify(events, never()).publishEvent(any());
    }
}
