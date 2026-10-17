package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

class LearnerStateMachineFrontierFallbackTest {

    @Test
    void emptyAtomicFrontierIsNotExposedAsScopeOptions() {
        StateMachineInfo stateMachine = ReflectionTestUtils.invokeMethod(
                learnerService(),
                "buildStateMachineInfo",
                "curriculum",
                List.of(),
                null,
                false,
                LearningState.FRONTIER,
                false,
                List.of());

        assertThat(stateMachine).isNotNull();
        assertThat(stateMachine.requiredAction()).isEqualTo("getFrontier");
        assertThat(stateMachine.goalOptions()).isEmpty();
    }

    @Test
    void explicitScopeExpansionRemainsTheOnlySetScopeFallback() {
        FrontierGoal expansion = frontierGoal("J8", "cluster");

        StateMachineInfo stateMachine = ReflectionTestUtils.invokeMethod(
                learnerService(),
                "buildStateMachineInfo",
                "curriculum",
                List.of(),
                null,
                false,
                LearningState.FRONTIER,
                false,
                List.of(expansion));

        assertThat(stateMachine).isNotNull();
        assertThat(stateMachine.requiredAction()).isEqualTo("setScope");
        assertThat(stateMachine.goalOptions()).containsExactly(expansion);
    }

    private LearnerService learnerService() {
        return new LearnerService(
                mock(LearnerRepository.class),
                mock(LearnerClientStateRepository.class),
                mock(MasteryRepository.class),
                mock(PlannedGoalRepository.class),
                mock(LandscapeService.class),
                mock(GoalMappingService.class),
                mock(DeckResourceService.class),
                new ObjectMapper(),
                mock(ApplicationEventPublisher.class));
    }

    private FrontierGoal frontierGoal(String id, String type) {
        return new FrontierGoal(
                id,
                id,
                "",
                type,
                null,
                null,
                "Available",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
    }
}
