package com.skillpilot.backend.ui;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.CurriculaSnapshot;
import com.skillpilot.backend.api.CurriculumOverview;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.service.CurriculaService;
import com.skillpilot.backend.service.ChatSessionService;
import com.skillpilot.backend.service.LearnerLifecycleService;
import com.skillpilot.backend.service.LearnerService;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class CurriculumQualityUiAdviceTest {
    private CurriculaService curricula;
    private CurriculumQualityUiAdvice advice;
    private MockMvc mvc;

    @BeforeEach
    void setup() throws Exception {
        curricula = mock(CurriculaService.class);
        ObjectMapper mapper = new ObjectMapper().findAndRegisterModules();
        advice = new CurriculumQualityUiAdvice(curricula, mapper);
        when(curricula.publicQualityRevision()).thenReturn("report-v5:assignment-1");
        var overview = mapper.readValue("""
                {"curriculumId":"curriculum","title":"Math","subject":"Math","qualityMaturity":"M6",
                 "qualityStatus":"human_trial_completed","humanTrialSubjectCount":0,"subjectQuality":[],
                 "humanTrial":{"state":"completed","scopeLabel":"All Math","scopeCoverage":"full","requiredGoals":2,"practicedGoals":2},
                 "champions":[{"id":"champion","githubId":"private-owner-marker","skillpilotIdMasked":"private-mask-marker"}]}
                """, CurriculumOverview.class);
        when(curricula.getSnapshot()).thenReturn(new CurriculaSnapshot(List.of(overview), "curriculum", Instant.now()));
        advice.refreshProjection();
        clearInvocations(curricula);

        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getOverview(anyString(), anyBoolean())).thenReturn(new LandscapeOverviewResponse(
                List.of(new LandscapeSummary("curriculum", "Math", "Description", "DE", null, "curriculum", "Math", "de", List.of())), Map.of()));
        LearnerService learners = mock(LearnerService.class);
        when(learners.getPersonalizationPlan("private-learner-id")).thenReturn(new PersonalizationPlan(
                PersonalizationPlan.Stage.SELECTION,
                List.of(new PersonalizationPlan.Option("opaque-option", "stage", "group", "instance", "curriculum", "Math", null, null)),
                List.of()));
        mvc = MockMvcBuilders.standaloneSetup(new LandscapeUiController(landscapes),
                new LearnerUiController(learners, mock(ChatSessionService.class), mock(LearnerLifecycleService.class)))
                .setControllerAdvice(advice).build(); // Deliberately use MVC's actual default JSON converter.
    }

    @Test
    void actualHttpBodiesUseOnePreparedProjectionWithoutScanningLearnersOrLeakingChampionData() throws Exception {
        String landscape = mvc.perform(get("/api/ui/landscapes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summaries[0].qualityMaturity").value("M6"))
                .andExpect(jsonPath("$.summaries[0].qualityStatus").value("human_trial_completed"))
                .andExpect(jsonPath("$.summaries[0].champions").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        String plan = mvc.perform(get("/api/ui/learners/private-learner-id/personalization-plan"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.options[0].optionId").value("opaque-option"))
                .andExpect(jsonPath("$.options[0].qualityMaturity").value("M6"))
                .andExpect(jsonPath("$.options[0].humanTrial.scopeLabel").value("All Math"))
                .andExpect(jsonPath("$.options[0].champions").doesNotExist())
                .andReturn().getResponse().getContentAsString();
        assertThat(landscape + plan).doesNotContain("private-owner-marker", "private-mask-marker", "trialScopeJson", "personalCurriculum", "practiceEvidence");
        verify(curricula, never()).getSnapshot();
        verify(curricula, times(2)).publicQualityRevision();
    }

    @Test
    void changedSourceAndExpiredProjectionReturnUnknownInsteadOfStaleGreen() throws Exception {
        when(curricula.publicQualityRevision()).thenReturn("changed-report");
        mvc.perform(get("/api/ui/landscapes"))
                .andExpect(jsonPath("$.summaries[0].qualityStatus").isEmpty())
                .andExpect(jsonPath("$.summaries[0].qualityMaturity").isEmpty());
        when(curricula.publicQualityRevision()).thenReturn("report-v5:assignment-1");
        ReflectionTestUtils.setField(advice, "validUntilMillis", 0L);
        mvc.perform(get("/api/ui/learners/private-learner-id/personalization-plan"))
                .andExpect(jsonPath("$.options[0].qualityStatus").isEmpty());
        verify(curricula, never()).getSnapshot();
    }

    @Test
    void failedBackgroundRefreshInvalidatesPreviousSuccess() throws Exception {
        when(curricula.getSnapshot()).thenThrow(new IllegalStateException("unavailable"));
        assertThatThrownBy(advice::refreshProjection).isInstanceOf(IllegalStateException.class);
        mvc.perform(get("/api/ui/landscapes"))
                .andExpect(jsonPath("$.summaries[0].qualityStatus").isEmpty());
    }
}
