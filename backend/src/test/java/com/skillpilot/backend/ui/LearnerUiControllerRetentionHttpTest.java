package com.skillpilot.backend.ui;

import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.skillpilot.backend.api.LearnerRetentionResponse;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

class LearnerUiControllerRetentionHttpTest {

    private static final String LEARNER_ID = "retention-http-learner";
    private static final Instant LAST_ACTIVITY = Instant.parse("2026-08-13T08:30:00Z");
    private static final Instant SCHEDULED_DELETION = Instant.parse("2027-08-13T08:30:00Z");

    private LearnerLifecycleService lifecycle;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        lifecycle = mock(LearnerLifecycleService.class);
        LearnerUiController controller = new LearnerUiController(
                mock(LearnerService.class),
                mock(ChatSessionService.class),
                lifecycle);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void resumeReturnsTheRetentionBoundaryAndDisablesCaching() throws Exception {
        when(lifecycle.resume(LEARNER_ID)).thenReturn(retention());

        mockMvc.perform(post("/api/ui/learners/{skillpilotId}/resume", LEARNER_ID))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.lastActivityAt").value(LAST_ACTIVITY.toString()))
                .andExpect(jsonPath("$.scheduledDeletionAt").value(SCHEDULED_DELETION.toString()));

        verify(lifecycle).resume(LEARNER_ID);
    }

    @Test
    void retentionReturnsTheCurrentBoundaryWithoutRecordingActivity() throws Exception {
        when(lifecycle.retention(LEARNER_ID)).thenReturn(retention());

        mockMvc.perform(get("/api/ui/learners/{skillpilotId}/retention", LEARNER_ID))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.lastActivityAt").value(LAST_ACTIVITY.toString()))
                .andExpect(jsonPath("$.scheduledDeletionAt").value(SCHEDULED_DELETION.toString()));

        verify(lifecycle).retention(LEARNER_ID);
    }

    @Test
    void unknownLearnerReturnsNotFoundThroughTheMvcExceptionMapping() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner not found"))
                .when(lifecycle)
                .retention(LEARNER_ID);

        mockMvc.perform(get("/api/ui/learners/{skillpilotId}/retention", LEARNER_ID))
                .andExpect(status().isNotFound())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));
    }

    @Test
    void exactJsonConfirmationDeletesTheLearnerAndDisablesCaching() throws Exception {
        mockMvc.perform(delete("/api/ui/learners/{skillpilotId}", LEARNER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"confirmationSkillpilotId":"retention-http-learner"}
                                """))
                .andExpect(status().isNoContent())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));

        verify(lifecycle).deleteConfirmed(LEARNER_ID, LEARNER_ID);
    }

    @Test
    void mismatchedJsonConfirmationReturnsBadRequest() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "confirmation mismatch"))
                .when(lifecycle)
                .deleteConfirmed(LEARNER_ID, "different-learner");

        mockMvc.perform(delete("/api/ui/learners/{skillpilotId}", LEARNER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                .content("""
                                {"confirmationSkillpilotId":"different-learner"}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));
    }

    @Test
    void missingConfirmationBodyReturnsBadRequest() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, "confirmation required"))
                .when(lifecycle)
                .deleteConfirmed(org.mockito.ArgumentMatchers.eq(LEARNER_ID), isNull());

        mockMvc.perform(delete("/api/ui/learners/{skillpilotId}", LEARNER_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));
    }

    @Test
    void confirmedUnknownLearnerReturnsNotFound() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Learner not found"))
                .when(lifecycle)
                .deleteConfirmed(LEARNER_ID, LEARNER_ID);

        mockMvc.perform(delete("/api/ui/learners/{skillpilotId}", LEARNER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"confirmationSkillpilotId":"retention-http-learner"}
                                """))
                .andExpect(status().isNotFound())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));
    }

    private static LearnerRetentionResponse retention() {
        return new LearnerRetentionResponse(LAST_ACTIVITY, SCHEDULED_DELETION);
    }
}
