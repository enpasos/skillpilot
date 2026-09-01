package com.skillpilot.backend.ui;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.service.LearnerLearningPlanService;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.function.Supplier;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class LearnerLearningPlanControllerHttpTest {

    private static final String LEARNER_ID = "plan-http-learner";
    private static final String LANDSCAPE_ID = "physics/sek-ii";
    private static final UUID PLAN_ID = UUID.fromString("2bcd497b-77f1-426b-a52d-1e9ad11fb771");
    private static final LocalDate AS_OF = LocalDate.parse("2026-09-04");

    private LearnerLearningPlanService learningPlans;
    private LearnerService learners;
    private LearnerLifecycleService lifecycle;
    private ObjectMapper objectMapper;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        learningPlans = mock(LearnerLearningPlanService.class);
        learners = mock(LearnerService.class);
        lifecycle = mock(LearnerLifecycleService.class);
        objectMapper = new ObjectMapper().findAndRegisterModules();
        doAnswer(invocation -> ((Supplier<?>) invocation.getArgument(1)).get())
                .when(lifecycle)
                .withActivity(eq(LEARNER_ID), org.mockito.ArgumentMatchers.<Supplier<Object>>any());
        mockMvc = MockMvcBuilders.standaloneSetup(
                        new LearnerLearningPlanController(learningPlans, learners, lifecycle))
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();
    }

    @Test
    void collectionGetIsNoStoreAndDoesNotTouchRetention() throws Exception {
        when(learningPlans.getPlans(LEARNER_ID, AS_OF)).thenReturn(
                new LearnerLearningPlanApi.CollectionResponse(AS_OF, false, List.of(summary())));

        mockMvc.perform(get("/api/ui/learners/{id}/learning-plans", LEARNER_ID)
                        .queryParam("asOf", AS_OF.toString()))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.asOf").value(AS_OF.toString()))
                .andExpect(jsonPath("$.followLearningPlans").value(false))
                .andExpect(jsonPath("$.plans[0].planId").value(PLAN_ID.toString()))
                .andExpect(jsonPath("$.plans[0].metrics.openDueThroughToday").value(1))
                .andExpect(jsonPath("$.plans[0].pace.reason")
                        .value("mastery-history-not-event-backed"));

        InOrder ordered = inOrder(learners, learningPlans);
        ordered.verify(learners).assertActiveLearnerRouteAccess(LEARNER_ID);
        ordered.verify(learningPlans).getPlans(LEARNER_ID, AS_OF);
        verifyNoInteractions(lifecycle);
    }

    @Test
    void detailGetUsesAQueryParameterSoLandscapeIdsMayContainSlashes() throws Exception {
        when(learningPlans.getPlan(LEARNER_ID, LANDSCAPE_ID, AS_OF)).thenReturn(detail());

        mockMvc.perform(get("/api/ui/learners/{id}/learning-plans/by-landscape", LEARNER_ID)
                        .queryParam("landscapeId", LANDSCAPE_ID)
                        .queryParam("asOf", AS_OF.toString()))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.landscapeId").value(LANDSCAPE_ID));

        verifyNoInteractions(lifecycle);
    }

    @Test
    void putUsesOwnerWriteBoundaryAndReturnsMaterializedDetail() throws Exception {
        LearnerLearningPlanApi.PlanDetail detail = detail();
        when(learningPlans.upsert(eq(LEARNER_ID), eq(LANDSCAPE_ID), any(), eq(AS_OF)))
                .thenReturn(detail);

        mockMvc.perform(put("/api/ui/learners/{id}/learning-plans/by-landscape", LEARNER_ID)
                        .queryParam("landscapeId", LANDSCAPE_ID)
                        .queryParam("asOf", AS_OF.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "expectedRevision": 0,
                                  "planLabel": "Physik",
                                  "blocks": [{
                                    "id": "b1",
                                    "kind": "learning",
                                    "startDate": "2026-09-01",
                                    "endDate": "2026-09-04",
                                    "atomicGoalIds": ["atom-1"]
                                  }]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.blocks[0].atomicGoalIds[0]").value("atom-1"));

        InOrder ordered = inOrder(learners, learningPlans);
        ordered.verify(learners).assertWritableLearningSession(LEARNER_ID);
        ordered.verify(learningPlans).upsert(eq(LEARNER_ID), eq(LANDSCAPE_ID), any(), eq(AS_OF));
    }

    @Test
    void continueUsesPlanIdAndReturnsTheAuthoritativeStateEnvelope() throws Exception {
        LearnerLearningPlanApi.ContinueResponse response = new LearnerLearningPlanApi.ContinueResponse(
                PLAN_ID,
                1,
                LANDSCAPE_ID,
                "atom-1",
                "atom-1",
                mock(com.skillpilot.backend.api.UnifiedLearnerStateResponse.class));
        when(learningPlans.continuePlan(eq(LEARNER_ID), eq(PLAN_ID), any())).thenReturn(response);

        mockMvc.perform(post("/api/ui/learners/{id}/learning-plans/{planId}/continue", LEARNER_ID, PLAN_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedRevision\":1,\"asOf\":\"2026-09-04\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.planId").value(PLAN_ID.toString()))
                .andExpect(jsonPath("$.focusGoalId").value("atom-1"))
                .andExpect(jsonPath("$.activeGoalId").value("atom-1"));
    }

    private static LearnerLearningPlanApi.PlanSummary summary() {
        return new LearnerLearningPlanApi.PlanSummary(
                PLAN_ID,
                1,
                LANDSCAPE_ID,
                "Physik",
                false,
                new LearnerLearningPlanApi.Period(
                        LocalDate.parse("2026-09-01"),
                        LocalDate.parse("2026-09-04")),
                null,
                null,
                new LearnerLearningPlanApi.Metrics(1, 0, 1, 1, 0, 1, 1),
                new LearnerLearningPlanApi.Buffer(0, 0),
                new LearnerLearningPlanApi.Pace("neutral", "mastery-history-not-event-backed"),
                new LearnerLearningPlanApi.NextEligibleGoal("atom-1"),
                "learning-plan-following-disabled",
                false);
    }

    private static LearnerLearningPlanApi.PlanDetail detail() {
        LearnerLearningPlanApi.PlanSummary summary = summary();
        return new LearnerLearningPlanApi.PlanDetail(
                summary.planId(),
                summary.revision(),
                summary.landscapeId(),
                summary.planLabel(),
                summary.stale(),
                summary.period(),
                summary.currentBlock(),
                summary.nextMilestone(),
                summary.metrics(),
                summary.buffer(),
                summary.pace(),
                summary.nextEligibleGoal(),
                summary.continueReason(),
                summary.canContinue(),
                List.of(new LearnerLearningPlanApi.Block(
                        "b1",
                        "learning",
                        null,
                        null,
                        LocalDate.parse("2026-09-01"),
                        LocalDate.parse("2026-09-04"),
                        null,
                        List.of("atom-1"))));
    }
}
