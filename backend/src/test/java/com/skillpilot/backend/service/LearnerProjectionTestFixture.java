package com.skillpilot.backend.service;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LandscapeOverviewResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.PlatformTransactionManager;

/** A learner and catalog with real scope computation and a caller-supplied repository or package view reader. */
public final class LearnerProjectionTestFixture {
    static final String LEARNER = "role-boundary-learner";
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private LearnerProjectionTestFixture() { }

    static String personalCurriculum(String landscapeId) {
        return "{\"" + landscapeId + "\":{\"selected\":true,\"filterId\":\"LK\",\"stage\":\"CrossStage\"}}";
    }

    public static LearnerService service(SkillLandscape primary, List<SkillLandscape> catalog, CompositionViewService views) {
        Map<String, SkillLandscape> byLandscape = new LinkedHashMap<>();
        Map<String, LearningGoal> byGoal = new LinkedHashMap<>();
        Map<String, String> owners = new LinkedHashMap<>();
        for (SkillLandscape landscape : catalog) {
            byLandscape.put(landscape.getLandscapeId(), landscape);
            for (LearningGoal goal : landscape.getGoals()) {
                byGoal.put(goal.getId(), goal);
                owners.put(goal.getId(), landscape.getLandscapeId());
            }
        }
        LandscapeService landscapes = mock(LandscapeService.class);
        when(landscapes.getAll()).thenReturn(catalog);
        when(landscapes.getById(anyString())).thenAnswer(i -> byLandscape.get(i.getArgument(0)));
        when(landscapes.getGoalDefinition(anyString())).thenAnswer(i -> byGoal.get(i.getArgument(0)));
        when(landscapes.getLandscapeIdForGoal(anyString())).thenAnswer(i -> owners.get(i.getArgument(0)));
        when(landscapes.getClosure(anyString())).thenAnswer(i -> List.of(byLandscape.get(i.getArgument(0))));
        when(landscapes.getClosure(anyString(), anyString())).thenAnswer(i -> List.of(byLandscape.get(i.getArgument(0))));
        when(landscapes.getOverview("de", true)).thenReturn(new LandscapeOverviewResponse(List.of(), Map.of()));
        Learner learner = new Learner();
        learner.setSkillpilotId(LEARNER);
        learner.setSelectedCurriculum(primary.getLandscapeId());
        learner.setPersonalCurriculum(personalCurriculum(primary.getLandscapeId()));
        LearnerRepository learners = mock(LearnerRepository.class);
        when(learners.findById(LEARNER)).thenReturn(Optional.of(learner));
        return new LearnerService(learners, mock(LearnerClientStateRepository.class), mock(MasteryRepository.class),
                mock(PlannedGoalRepository.class), landscapes, mock(GoalMappingService.class),
                mock(DeckResourceService.class), views, MAPPER, mock(ApplicationEventPublisher.class),
                mock(PlatformTransactionManager.class));
    }

}
