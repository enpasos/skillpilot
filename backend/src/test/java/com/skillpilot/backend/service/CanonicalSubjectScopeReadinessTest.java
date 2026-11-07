package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.repository.*;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.PlatformTransactionManager;

class CanonicalSubjectScopeReadinessTest {
    private static final String ID = "readiness-learner";
    private static final String OWNER = "canonical-subject";
    private final LearnerRepository learners = mock(LearnerRepository.class);
    private final MasteryRepository mastery = mock(MasteryRepository.class);
    private final LandscapeService landscapes = mock(LandscapeService.class);
    private final CompositionViewService views = mock(CompositionViewService.class);
    private final Learner learner = new Learner();
    private final SkillLandscape owner = new SkillLandscape();
    private LearnerService service;

    @BeforeEach
    void setUp() {
        learner.setSkillpilotId(ID);
        learner.setSelectedCurriculum(OWNER);
        owner.setLandscapeId(OWNER);
        owner.setFrameworkId("canonical-gymnasium-informatics");
        when(learners.findById(ID)).thenReturn(Optional.of(learner));
        when(landscapes.getById(OWNER)).thenReturn(owner);
        service = new LearnerService(learners, mock(LearnerClientStateRepository.class), mastery,
                mock(PlannedGoalRepository.class), landscapes, mock(GoalMappingService.class), null,
                views, new ObjectMapper(), mock(ApplicationEventPublisher.class), mock(PlatformTransactionManager.class));
    }

    private PersonalizationPlan plan(String pc) {
        learner.setPersonalCurriculum(pc);
        var plan = service.getCoachPersonalizationPlan(ID);
        assertThat(learner.getPersonalCurriculum()).isEqualTo(pc);
        verifyNoInteractions(mastery);
        return plan;
    }

    @Test
    void noFlowDoesNotCompleteAnUnresolvedCanonicalSubject() {
        var plan = plan("{}");
        assertThat(plan.stage()).isEqualTo(PersonalizationPlan.Stage.INVALID);
        assertThat(plan.problemCode()).isEqualTo("canonical-subject-scope-unresolved");
        verify(views, never()).findDefaultView(anyString());
    }

    @Test
    void courseProfileNeverInfersTheMissingStage() {
        var plan = plan("{\"canonical-subject\":{\"selected\":true,\"filterId\":\"LK\"}}");
        assertThat(plan.valid()).isFalse();
        verify(views, never()).findLearnerScopeView(anyString(), anyMap());
    }

    @Test
    void explicitScopeUsesTheExistingLearnerViewResolver() {
        var scope = Map.of("schoolForm", "Gymnasium", "stage", "CrossStage", "courseProfile", "GK");
        when(views.findLearnerScopeView(OWNER, scope)).thenReturn(Map.of("viewId", "reviewed-view"));
        assertThat(plan("{\"canonical-subject\":{\"selected\":true,\"filterId\":\"GK\",\"stage\":\"CrossStage\"}}")
                .stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        verify(views).findLearnerScopeView(OWNER, scope);
    }

    @Test
    void anExplicitStageWithoutAnExistingMatchingViewRemainsUnresolved() {
        assertThat(plan("{\"canonical-subject\":{\"selected\":true,\"filterId\":\"GK\",\"stage\":\"CrossStage\"}}")
                .valid()).isFalse();
    }

    @Test
    void ordinaryStandaloneNoFlowDomainsKeepTheirContract() {
        owner.setFrameworkId("cefr-language");
        assertThat(plan("{}").stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        verifyNoInteractions(views);
    }

    @Test
    void explicitlyClassifiedCompatibilityResumeIsPreserved() {
        when(landscapes.isCompatibilityOnlyLandscape(OWNER)).thenReturn(true);
        assertThat(plan("{}").stage()).isEqualTo(PersonalizationPlan.Stage.COMPLETE);
        verifyNoInteractions(views);
    }
}
