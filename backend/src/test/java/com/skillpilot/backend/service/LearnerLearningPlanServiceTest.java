package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanningScopeResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearnerLearningPlan;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerLearningPlanRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class LearnerLearningPlanServiceTest {

    @Test
    void previewUsesBerlinTodayAndOnlyUnlockedRepositoryReads() {
        LearnerLearningPlanRepository plans = mock(LearnerLearningPlanRepository.class);
        LearnerService learners = mock(LearnerService.class);
        ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);
        LearnerLearningPlanService service = new LearnerLearningPlanService(
                plans, learners, new ObjectMapper().findAndRegisterModules(), events,
                mock(LandscapeService.class),
                Clock.fixed(Instant.parse("2026-09-03T23:30:00Z"), ZoneId.of("UTC")));
        Learner learner = new Learner();
        learner.setSkillpilotId("preview-learner");
        when(learners.getLearner("preview-learner")).thenReturn(learner);
        when(learners.getPlanningScope("preview-learner", "math"))
                .thenReturn(new LearnerPlanningScopeResponse("curriculum", "math",
                        List.of("atom-a"), 1, 0, List.of("atom-a"), Instant.parse("2026-09-03T23:30:00Z")));
        when(learners.orderLearningPlanBlocksByPrerequisites(eq("preview-learner"), any()))
                .thenAnswer(invocation -> invocation.getArgument(1));
        when(learners.learningPlanFingerprint(eq("preview-learner"), eq("math"), any())).thenReturn("current");
        when(learners.getMastery("preview-learner")).thenReturn(Map.of());
        var plan = new LearnerLearningPlanApi.ActivationPlan("math", 0L, "Draft",
                List.of(learningBlock("block", "2026-09-04", "2026-09-04", List.of("atom-a"))));

        var preview = service.previewPlans("preview-learner",
                new LearnerLearningPlanApi.ActivateRequest(null, List.of(plan)));

        assertThat(preview.asOf()).isEqualTo(LocalDate.parse("2026-09-04"));
        assertThat(preview.days()).hasSize(7);
        assertThat(preview.days().get(0).totals().dueToday()).isEqualTo(1);
        assertThatThrownBy(() -> service.previewPlans("preview-learner",
                new LearnerLearningPlanApi.ActivateRequest(LocalDate.parse("2026-09-03"), List.of(plan))))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
        verify(plans).findByLearner_SkillpilotIdOrderByLandscapeIdAsc("preview-learner");
        verify(plans).findByLearner_SkillpilotIdAndLandscapeId("preview-learner", "math");
        verifyNoMoreInteractions(plans);
        verify(learners, never()).acquireLearningPlanMutationLock(any());
        verify(learners).getMastery("preview-learner");
        verifyNoInteractions(events);
    }

    @Test
    void globalDueSlotsStayMonotoneAcrossIdenticalOverlappingBlocks() {
        var first = learningBlock(
                "first-block",
                "2026-09-07",
                "2026-09-10",
                List.of("first-goal"));
        var second = learningBlock(
                "second-block",
                "2026-09-07",
                "2026-09-10",
                List.of("second-goal"));
        List<LearnerLearningPlanApi.Block> blocks = List.of(first, second);

        List<String> monday = LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                blocks, LocalDate.parse("2026-09-07"));
        List<String> tuesday = LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                blocks, LocalDate.parse("2026-09-08"));
        List<String> wednesday = LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                blocks, LocalDate.parse("2026-09-09"));
        List<String> thursday = LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                blocks, LocalDate.parse("2026-09-10"));

        assertThat(monday).containsExactly("first-goal");
        assertThat(tuesday).containsExactlyElementsOf(monday);
        assertThat(wednesday).containsExactly("first-goal", "second-goal");
        assertThat(thursday).containsExactlyElementsOf(wednesday);
        assertThat(List.of(monday.size(), tuesday.size(), wednesday.size(), thursday.size()))
                .containsExactly(1, 1, 2, 2);
        assertThat(LearnerLearningPlanService.scheduledAtomicGoalDueDatesForSchedule(blocks))
                .containsExactlyInAnyOrderEntriesOf(Map.of(
                        "first-goal", LocalDate.parse("2026-09-07"),
                        "second-goal", LocalDate.parse("2026-09-09")));
    }

    @Test
    void globalDueSlotsPrioritizeLaterStartingEarlierDeadlineWithoutMissingEitherBlock() {
        var longBlock = learningBlock(
                "long-block",
                "2026-09-07",
                "2026-09-11",
                List.of("long-1", "long-2"));
        var shortBlock = learningBlock(
                "short-block",
                "2026-09-08",
                "2026-09-09",
                List.of("short-1", "short-2"));
        List<LearnerLearningPlanApi.Block> blocks = List.of(longBlock, shortBlock);

        Map<String, LocalDate> dueDates = LearnerLearningPlanService
                .scheduledAtomicGoalDueDatesForSchedule(blocks);

        assertThat(dueDates).containsExactlyInAnyOrderEntriesOf(Map.of(
                "short-1", LocalDate.parse("2026-09-08"),
                "short-2", LocalDate.parse("2026-09-08"),
                "long-1", LocalDate.parse("2026-09-09"),
                "long-2", LocalDate.parse("2026-09-10")));
        assertThat(LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                        blocks, LocalDate.parse("2026-09-08")))
                .containsExactly("short-1", "short-2");
        assertThat(LearnerLearningPlanService.dueAtomicGoalIdsForSchedule(
                        blocks, LocalDate.parse("2026-09-11")))
                .containsExactly("long-1", "long-2", "short-1", "short-2");
    }

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
                mock(LandscapeService.class),
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

    private static LearnerLearningPlanApi.Block learningBlock(
            String id,
            String startDate,
            String endDate,
            List<String> atomicGoalIds) {
        return new LearnerLearningPlanApi.Block(
                id,
                "learning",
                null,
                id,
                LocalDate.parse(startDate),
                LocalDate.parse(endDate),
                null,
                atomicGoalIds);
    }
}
