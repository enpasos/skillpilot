package com.skillpilot.backend.ui;

import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.skillpilot.backend.api.LearnerPlanningScopeResponse;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InOrder;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class LearnerUiControllerPlanningScopeHttpTest {

    private static final String LEARNER_ID = "planning-http-learner";
    private static final String CURRICULUM_ID = "curriculum-1";
    private static final String LANDSCAPE_ID = "math-1";
    private static final Instant CAPTURED_AT = Instant.parse("2026-09-01T08:15:30Z");

    private LearnerService learnerService;
    private LearnerLifecycleService learnerLifecycle;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        learnerService = mock(LearnerService.class);
        learnerLifecycle = mock(LearnerLifecycleService.class);
        LearnerUiController controller = new LearnerUiController(
                learnerService,
                mock(ChatSessionService.class),
                learnerLifecycle);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void planningScopeIsNoStoreAndDelegatesOnlyToTheReadBoundary() throws Exception {
        LearnerPlanningScopeResponse snapshot = new LearnerPlanningScopeResponse(
                CURRICULUM_ID,
                LANDSCAPE_ID,
                List.of("goal-1", "goal-2"),
                2,
                1,
                List.of("goal-2"),
                CAPTURED_AT);
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(snapshot);

        mockMvc.perform(get("/api/ui/learners/{skillpilotId}/planning-scope", LEARNER_ID)
                        .queryParam("landscapeId", LANDSCAPE_ID))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.curriculumId").value(CURRICULUM_ID))
                .andExpect(jsonPath("$.landscapeId").value(LANDSCAPE_ID))
                .andExpect(jsonPath("$.focusGoalIds").doesNotExist())
                .andExpect(jsonPath("$.scopeAtomicGoalIds.length()").value(2))
                .andExpect(jsonPath("$.totalAtomicGoalCount").value(2))
                .andExpect(jsonPath("$.masteredAtomicGoalCount").value(1))
                .andExpect(jsonPath("$.openAtomicGoalIds[0]").value("goal-2"))
                .andExpect(jsonPath("$.capturedAt").value(CAPTURED_AT.toString()));

        InOrder ordered = inOrder(learnerService);
        ordered.verify(learnerService).assertActiveLearnerRouteAccess(LEARNER_ID);
        ordered.verify(learnerService).getPlanningScope(LEARNER_ID, LANDSCAPE_ID);
        verifyNoInteractions(learnerLifecycle);
    }

    @Test
    void landscapeIdIsRequired() throws Exception {
        LearnerPlanningScopeResponse snapshot = new LearnerPlanningScopeResponse(
                CURRICULUM_ID,
                LANDSCAPE_ID,
                List.of("goal-1"),
                1,
                0,
                List.of("goal-1"),
                CAPTURED_AT);
        when(learnerService.getPlanningScope(LEARNER_ID, LANDSCAPE_ID))
                .thenReturn(snapshot);

        mockMvc.perform(get("/api/ui/learners/{skillpilotId}/planning-scope", LEARNER_ID)
                        .queryParam("landscapeId", LANDSCAPE_ID))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.scopeAtomicGoalIds[0]").value("goal-1"));

        mockMvc.perform(get("/api/ui/learners/{skillpilotId}/planning-scope", LEARNER_ID))
                .andExpect(status().isBadRequest());
    }
}
