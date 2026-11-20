package com.skillpilot.backend.ui;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.skillpilot.backend.api.VerifiedExamPassResponse;
import com.skillpilot.backend.SkillpilotApplication;
import com.skillpilot.backend.service.LearnerService;
import com.skillpilot.backend.service.VerifiedExamPassService;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

class LearnerExamPassControllerTest {
    private static final String ROUTE = "/api/ui/learners/{skillpilotId}/exam-passes/{goalId}";
    private final LearnerService learners = mock(LearnerService.class);
    private final VerifiedExamPassService passes = mock(VerifiedExamPassService.class);
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new LearnerExamPassController(learners, passes))
            .setMessageConverters(new MappingJackson2HttpMessageConverter(new SkillpilotApplication().objectMapper()))
            .build();

    @Test
    void readsOnlyTheRequestedLearnerAndGoalWithTheScoresOfEachPassedVersion() throws Exception {
        var recent = new VerifiedExamPassResponse(Instant.parse("2026-11-20T10:00:00Z"),
                8.5, 10, 8, "task2", "rubric2", "material2");
        var earlier = new VerifiedExamPassResponse(Instant.parse("2026-10-12T10:00:00Z"),
                5, 6, 4, "task1", "rubric1", "material1");
        when(passes.findForGoal("learner", "exam")).thenReturn(List.of(recent, earlier));

        mvc.perform(get(ROUTE, "learner", "exam"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].passedAt").value("2026-11-20T10:00:00Z"))
                .andExpect(jsonPath("$[0].earnedPoints").value(8.5))
                .andExpect(jsonPath("$[1].maxPoints").value(6))
                .andExpect(jsonPath("$[1].passingPoints").value(4))
                .andExpect(jsonPath("$[1].fingerprint").value("material1"))
                .andExpect(jsonPath("$[0].length()").value(7));

        var reads = inOrder(learners, passes);
        reads.verify(learners).assertActiveLearnerRouteAccess("learner");
        reads.verify(passes).findForGoal("learner", "exam");

        mvc.perform(get(ROUTE, "another-learner", "exam")).andExpect(content().json("[]"));
        mvc.perform(get(ROUTE, "learner", "another-exam")).andExpect(content().json("[]"));
    }

    @Test
    void deniedProfileNeverReadsThePassLedger() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.CONFLICT))
                .when(learners).assertActiveLearnerRouteAccess("retired");
        mvc.perform(get(ROUTE, "retired", "exam"))
                .andExpect(status().isConflict())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"));
        verifyNoInteractions(passes);
    }
}
