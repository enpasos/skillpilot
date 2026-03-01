package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

class LearnerServiceMasteryCorrectionTest {

    private LearnerService learnerService;
    private LearnerRepository learnerRepository;
    private LearnerClientStateRepository learnerClientStateRepository;
    private MasteryRepository masteryRepository;
    private PlannedGoalRepository plannedGoalRepository;
    private LandscapeService landscapeService;
    private DeckResourceService deckResourceService;
    private ApplicationEventPublisher eventPublisher;

    private static final String LEARNER_ID = "learner-1";
    private static final String GOAL_ID = "goal-1";
    private Learner learner;
    private Mastery existingMastery;

    @BeforeEach
    void setUp() {
        learnerRepository = org.mockito.Mockito.mock(LearnerRepository.class);
        learnerClientStateRepository = org.mockito.Mockito.mock(LearnerClientStateRepository.class);
        masteryRepository = org.mockito.Mockito.mock(MasteryRepository.class);
        plannedGoalRepository = org.mockito.Mockito.mock(PlannedGoalRepository.class);
        landscapeService = org.mockito.Mockito.mock(LandscapeService.class);
        deckResourceService = org.mockito.Mockito.mock(DeckResourceService.class);
        eventPublisher = org.mockito.Mockito.mock(ApplicationEventPublisher.class);

        learnerService = new LearnerService(
                learnerRepository,
                learnerClientStateRepository,
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                deckResourceService,
                new ObjectMapper(),
                eventPublisher);

        learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setLearningState(LearningState.FRONTIER);
        learner.setActiveGoalId(null);

        existingMastery = new Mastery(learner, GOAL_ID, 1.0);

        when(learnerRepository.findById(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.existsById(LEARNER_ID)).thenReturn(true);
        when(learnerRepository.save(any(Learner.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of(existingMastery));
        when(masteryRepository.findById(new MasteryId(LEARNER_ID, GOAL_ID))).thenReturn(Optional.of(existingMastery));
        when(masteryRepository.save(any(Mastery.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());
    }

    @Test
    void setMastery_allowsExplicitDowngradeOutsideFrontier() {
        learnerService.setMastery(LEARNER_ID, new MasteryUpdateRequest(Map.of(GOAL_ID, 0.0), null));

        assertThat(existingMastery.getValue()).isEqualTo(0.0);
        verify(masteryRepository).save(existingMastery);
    }
}
