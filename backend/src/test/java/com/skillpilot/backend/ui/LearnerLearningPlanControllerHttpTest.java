package com.skillpilot.backend.ui;

import static org.hamcrest.Matchers.nullValue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.service.LearningPlanPrerequisiteScheduleConflictException;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

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
    void draftPreviewUsesReadAccessAndDoesNotTouchRetentionOrActivatePlans() throws Exception {
        LearnerLearningPlanApi.PreviewResponse response = new LearnerLearningPlanApi.PreviewResponse(
                AS_OF, java.util.stream.IntStream.range(0, 7)
                        .mapToObj(offset -> new LearnerLearningPlanApi.PreviewDay(AS_OF.plusDays(offset),
                                planStatus()))
                        .toList());
        when(learningPlans.previewPlans(eq(LEARNER_ID), any(), eq("en"))).thenReturn(response);

        mockMvc.perform(post("/api/ui/learners/{id}/learning-plans/preview", LEARNER_ID)
                        .queryParam("language", "en")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"asOf":"2026-09-04","plans":[{
                                  "landscapeId":"physics/sek-ii","expectedRevision":0,
                                  "planLabel":"Unsaved draft","blocks":[]
                                }]}
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.asOf").value(AS_OF.toString()))
                .andExpect(jsonPath("$.days.length()").value(7))
                .andExpect(jsonPath("$.days[6].date").value(AS_OF.plusDays(6).toString()))
                .andExpect(jsonPath("$.days[0].status.subjects[0].landscapeIds[0]").value(LANDSCAPE_ID))
                .andExpect(jsonPath("$.days[0].status.statusText").value(planStatus().statusText()))
                .andExpect(jsonPath("$.days[0].totals").doesNotExist())
                .andExpect(jsonPath("$.days[0].subjects").doesNotExist())
                .andExpect(jsonPath("$.followLearningPlans").doesNotExist())
                .andExpect(jsonPath("$.activeGoalId").doesNotExist());

        InOrder ordered = inOrder(learners, learningPlans);
        ordered.verify(learners).assertActiveLearnerRouteAccess(LEARNER_ID);
        ordered.verify(learningPlans).previewPlans(eq(LEARNER_ID), any(), eq("en"));
        ordered.verifyNoMoreInteractions();
        verifyNoInteractions(lifecycle);
    }

    @Test
    void draftPreviewRejectsUnauthorizedLearnerBeforeReadingDraftData() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "Not the active learner"))
                .when(learners).assertActiveLearnerRouteAccess(LEARNER_ID);

        mockMvc.perform(post("/api/ui/learners/{id}/learning-plans/preview", LEARNER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"asOf\":\"2026-09-04\",\"plans\":[]}"))
                .andExpect(status().isForbidden())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));

        verifyNoInteractions(learningPlans, lifecycle);
    }

    @Test
    void draftPreviewReturnsSafePrerequisiteConflictWithoutPlanOrLearnerDetails() throws Exception {
        when(learningPlans.previewPlans(eq(LEARNER_ID), any(), org.mockito.ArgumentMatchers.isNull()))
                .thenThrow(new LearningPlanPrerequisiteScheduleConflictException());

        mockMvc.perform(post("/api/ui/learners/{id}/learning-plans/preview", LEARNER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"asOf\":\"2026-09-04\",\"plans\":[]}"))
                .andExpect(status().isBadRequest())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(content().string("{\"errorCode\":\""
                        + LearnerLearningPlanApi.PREREQUISITE_SCHEDULE_CONFLICT_ERROR_CODE + "\"}"));

        verifyNoInteractions(lifecycle);
    }

    @Test
    void collectionGetIsNoStoreAndDoesNotTouchRetention() throws Exception {
        when(learningPlans.getPlans(LEARNER_ID, AS_OF, "en")).thenReturn(
                new LearnerLearningPlanApi.CollectionResponse(AS_OF, false, List.of(summary()), planStatus()));

        mockMvc.perform(get("/api/ui/learners/{id}/learning-plans", LEARNER_ID)
                        .queryParam("asOf", AS_OF.toString()).queryParam("language", "en"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.asOf").value(AS_OF.toString()))
                .andExpect(jsonPath("$.followLearningPlans").value(false))
                .andExpect(jsonPath("$.plans[0].planId").value(PLAN_ID.toString()))
                .andExpect(jsonPath("$.status.statusText").value(planStatus().statusText()))
                .andExpect(jsonPath("$.plans[0].metrics").doesNotExist())
                .andExpect(jsonPath("$.plans[0].pace").doesNotExist())
                .andExpect(jsonPath("$.status.statusDirection").doesNotExist());

        InOrder ordered = inOrder(learners, learningPlans);
        ordered.verify(learners).assertActiveLearnerRouteAccess(LEARNER_ID);
        ordered.verify(learningPlans).getPlans(LEARNER_ID, AS_OF, "en");
        verifyNoInteractions(lifecycle);
    }

    @Test
    void statusGetSerializesAuthoritativeGaugeValuesWithoutRawBalance() throws Exception {
        when(learningPlans.getTodayStatus(LEARNER_ID, "de")).thenReturn(planStatus());

        mockMvc.perform(get("/api/ui/learners/{id}/learning-plans/status", LEARNER_ID)
                        .queryParam("language", "de"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.subjects[0].periodGauge.completed").value(1))
                .andExpect(jsonPath("$.subjects[0].periodGauge.target").value(2))
                .andExpect(jsonPath("$.subjects[0].periodGauge.needlePosition").value(0.5))
                .andExpect(jsonPath("$.subjects[0].balanceGauge.net").value(-2))
                .andExpect(jsonPath("$.subjects[0].balanceGauge.typicalAmount").value(1))
                .andExpect(jsonPath("$.subjects[0].balanceGauge.scaleLimit").value(2))
                .andExpect(jsonPath("$.subjects[0].balanceGauge.severeBehind").value(false))
                .andExpect(jsonPath("$.subjects[0].balanceGauge.strongAhead").value(false))
                .andExpect(jsonPath("$.subjects[0].balance").doesNotExist());
    }

    @Test
    void statusGetKeepsUnevaluableGaugesNull() throws Exception {
        when(learningPlans.getTodayStatus(LEARNER_ID, "de")).thenReturn(
                com.skillpilot.backend.api.LearnerPlanTodayStatusFixtures.status(
                        AS_OF, false, false,
                        com.skillpilot.backend.api.LearnerPlanTodayStatusFixtures.unevaluableSubject(
                                LANDSCAPE_ID, "Physics", false, false)));

        mockMvc.perform(get("/api/ui/learners/{id}/learning-plans/status", LEARNER_ID)
                        .queryParam("language", "de"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subjects[0].evaluable").value(false))
                .andExpect(jsonPath("$.subjects[0].periodGauge").value(nullValue()))
                .andExpect(jsonPath("$.subjects[0].balanceGauge").value(nullValue()))
                .andExpect(jsonPath("$.subjects[0].balance").doesNotExist());
    }

    @Test
    void detailGetUsesAQueryParameterSoLandscapeIdsMayContainSlashes() throws Exception {
        when(learningPlans.getPlan(LEARNER_ID, LANDSCAPE_ID, AS_OF)).thenReturn(detail());

        mockMvc.perform(get("/api/ui/learners/{id}/learning-plans/by-landscape", LEARNER_ID)
                        .queryParam("landscapeId", LANDSCAPE_ID)
                        .queryParam("asOf", AS_OF.toString()).queryParam("language", "en"))
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
    void activateAcceptsMultipleSubjectsAndReturnsTheAutomaticallySelectedGoal() throws Exception {
        LearnerLearningPlanApi.ActivateResponse response = new LearnerLearningPlanApi.ActivateResponse(
                AS_OF,
                true,
                List.of(detail()),
                PLAN_ID,
                LANDSCAPE_ID,
                "physics-focus",
                "atom-1",
                mock(com.skillpilot.backend.api.UnifiedLearnerStateResponse.class));
        when(learningPlans.activatePlans(eq(LEARNER_ID), any())).thenReturn(response);

        mockMvc.perform(post("/api/ui/learners/{id}/learning-plans/activate", LEARNER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "asOf": "2026-09-04",
                                  "plans": [{
                                    "landscapeId": "physics/sek-ii",
                                    "expectedRevision": 0,
                                    "planLabel": "Physik",
                                    "blocks": [{
                                      "id": "b1",
                                      "kind": "learning",
                                      "goalId": "physics-focus",
                                      "startDate": "2026-09-01",
                                      "endDate": "2026-09-04",
                                      "atomicGoalIds": ["atom-1"]
                                    }]
                                  }]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.followLearningPlans").value(true))
                .andExpect(jsonPath("$.selectedLandscapeId").value(LANDSCAPE_ID))
                .andExpect(jsonPath("$.activeGoalId").value("atom-1"));

        InOrder ordered = inOrder(learners, learningPlans);
        ordered.verify(learners).assertWritableLearningSession(LEARNER_ID);
        ordered.verify(learningPlans).activatePlans(eq(LEARNER_ID), any());
    }

    @Test
    void activationReturnsWhitelistedCodeForPrerequisiteScheduleConflict() throws Exception {
        when(learningPlans.activatePlans(eq(LEARNER_ID), any()))
                .thenThrow(new LearningPlanPrerequisiteScheduleConflictException());

        mockMvc.perform(post("/api/ui/learners/{id}/learning-plans/activate", LEARNER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "asOf": "2026-09-04",
                                  "plans": [{
                                    "landscapeId": "physics/sek-ii",
                                    "expectedRevision": 0,
                                    "planLabel": "Physik",
                                    "blocks": []
                                  }]
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(content().string(
                        "{\"errorCode\":\""
                                + LearnerLearningPlanApi.PREREQUISITE_SCHEDULE_CONFLICT_ERROR_CODE
                                + "\"}"));
    }

    @Test
    void reconcileUsesAnExplicitPostAndMayReturnAnIdempotentNoOp() throws Exception {
        LearnerLearningPlanApi.TransitionResponse response =
                new LearnerLearningPlanApi.TransitionResponse(
                        null,
                        null,
                        null,
                        null,
                        null,
                        false,
                        mock(com.skillpilot.backend.api.UnifiedLearnerStateResponse.class));
        when(learningPlans.reconcile(eq(LEARNER_ID), any())).thenReturn(response);

        mockMvc.perform(post("/api/ui/learners/{id}/learning-plans/reconcile", LEARNER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"asOf\":\"2026-09-04\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.changed").value(false))
                .andExpect(jsonPath("$.planId").doesNotExist());
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

    @Test
    void switchUsesPlanIdAndReturnsTheNewSubjectPointer() throws Exception {
        LearnerLearningPlanApi.TransitionResponse response =
                new LearnerLearningPlanApi.TransitionResponse(
                        PLAN_ID,
                        1L,
                        LANDSCAPE_ID,
                        "physics-focus",
                        "atom-1",
                        true,
                        mock(com.skillpilot.backend.api.UnifiedLearnerStateResponse.class));
        when(learningPlans.switchPlan(eq(LEARNER_ID), eq(PLAN_ID), any())).thenReturn(response);

        mockMvc.perform(post("/api/ui/learners/{id}/learning-plans/{planId}/switch", LEARNER_ID, PLAN_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"expectedRevision\":1,\"asOf\":\"2026-09-04\"}"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.changed").value(true))
                .andExpect(jsonPath("$.landscapeId").value(LANDSCAPE_ID))
                .andExpect(jsonPath("$.activeGoalId").value("atom-1"));
    }

    private static com.skillpilot.backend.api.LearnerPlanTodayStatus planStatus() {
        return com.skillpilot.backend.api.LearnerPlanTodayStatusFixtures.status(AS_OF, false, false,
                com.skillpilot.backend.api.LearnerPlanTodayStatusFixtures.subject(
                        LANDSCAPE_ID, "Physics", 4, 2, 1, 1, false, false,
                        com.skillpilot.backend.service.learningplan.PeriodBasis.DAY, "en"));
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
                new LearnerLearningPlanApi.Buffer(0, 0),
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
                summary.buffer(),
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
