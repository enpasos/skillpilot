package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

class MitOcwFrontierWalkthroughTest {

    private static final String LEARNER_ID = "mit-ocw-frontier-learner";
    private static final String MIT_OCW_FOUNDATIONS_CURRICULUM_ID = "25df82ae-f6ab-518b-98f2-dc72bcdf2fcf";

    private static final String LANDSCAPE_18_01SC = "d9b5522f-50af-5f3d-8996-49fa5e818d62";
    private static final String LANDSCAPE_18_02SC = "d97e6cd9-34cf-5ac5-86c7-4fbe1f686b02";
    private static final String LANDSCAPE_18_05 = "76615ce1-8d87-5504-bc55-a6e6818f4ed4";
    private static final String LANDSCAPE_18_06 = "2735b190-d8f0-5122-98a3-2e876447b4f2";
    private static final String LANDSCAPE_6_100L = "157803a5-e13c-5ab9-9d9d-fd6a060e6023";

    private static final String MODULE_18_01SC_ID = "f9b9191b-5623-571b-a742-a628bc4b1f75";
    private static final String MODULE_18_02SC_ID = "2c4a2a63-d3ff-5660-8e8e-d0fa245925cf";
    private static final String MODULE_18_05_ID = "b9c6db12-600e-5f2b-993c-a1cb37c94122";
    private static final String MODULE_18_06_ID = "086d223e-6e8c-46aa-a2c5-a0f6004e37a4";
    private static final String MODULE_6_100L_ID = "ec426731-189b-5d35-b053-9b0c5417d069";
    private static final String MODULE_6_0002_ID = "502f3476-c8e1-5f70-9b6c-c1757cb6eb8b";
    private static final String MODULE_6_006_ID = "e005ee72-bf4e-5d18-8cbc-569a0ae753d8";

    private static ObjectMapper objectMapper;
    private static LandscapeService landscapeService;
    private static GoalMappingService goalMappingService;

    private LearnerService learnerService;
    private LearnerRepository learnerRepository;
    private LearnerClientStateRepository learnerClientStateRepository;
    private MasteryRepository masteryRepository;
    private PlannedGoalRepository plannedGoalRepository;
    private DeckResourceService deckResourceService;
    private ApplicationEventPublisher eventPublisher;
    private Learner learner;

    @BeforeAll
    static void initLandscapeService() {
        objectMapper = new ObjectMapper();
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(resolveCurriculaDir().toString());
        landscapeService = new LandscapeService(properties, objectMapper);
        goalMappingService = new GoalMappingService(properties, objectMapper);
    }

    @BeforeEach
    void setUp() {
        learnerRepository = mock(LearnerRepository.class);
        learnerClientStateRepository = mock(LearnerClientStateRepository.class);
        masteryRepository = mock(MasteryRepository.class);
        plannedGoalRepository = mock(PlannedGoalRepository.class);
        deckResourceService = mock(DeckResourceService.class);
        eventPublisher = mock(ApplicationEventPublisher.class);

        learnerService = new LearnerService(
                learnerRepository,
                learnerClientStateRepository,
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                goalMappingService,
                deckResourceService,
                objectMapper,
                eventPublisher);

        learner = new Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setSelectedCurriculum(MIT_OCW_FOUNDATIONS_CURRICULUM_ID);
        learner.setLearningState(LearningState.FRONTIER);
        learner.setPersonalCurriculum(null);

        when(learnerRepository.findById(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.existsById(LEARNER_ID)).thenReturn(true);
        when(learnerRepository.save(any(Learner.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());
    }

    @Test
    void frontierStartsWithDirectModules() {
        setMasteredGoals(Set.of());
        Set<String> frontierBeforeFoundation = frontierIds();

        assertThat(frontierBeforeFoundation).contains(
                MODULE_18_01SC_ID,
                MODULE_18_02SC_ID,
                MODULE_18_05_ID,
                MODULE_18_06_ID,
                MODULE_6_100L_ID,
                MODULE_6_0002_ID,
                MODULE_6_006_ID);
    }

    @Test
    void mastering1801ModuleRemovesItFromFrontierWhileKeepingOtherMathModules() {
        Set<String> masteryAfter1801 = new HashSet<>();
        masteryAfter1801.add(MODULE_18_01SC_ID);
        masteryAfter1801.addAll(atomicGoalIdsForLandscape(LANDSCAPE_18_01SC));

        setMasteredGoals(masteryAfter1801);
        Set<String> frontierAfter1801 = frontierIds();

        assertThat(frontierAfter1801).doesNotContain(MODULE_18_01SC_ID);
        assertThat(frontierAfter1801).contains(MODULE_18_02SC_ID, MODULE_18_05_ID, MODULE_18_06_ID);
    }

    @Test
    void mastering6100lModuleKeepsAdvancedCsModulesAvailable() {
        setMasteredGoals(Set.of());
        Set<String> frontierAfterFoundation = frontierIds();

        assertThat(frontierAfterFoundation).contains(MODULE_6_0002_ID, MODULE_6_006_ID);

        Set<String> masteryAfter6100l = new HashSet<>();
        masteryAfter6100l.add(MODULE_6_100L_ID);
        masteryAfter6100l.addAll(atomicGoalIdsForLandscape(LANDSCAPE_6_100L));
        setMasteredGoals(masteryAfter6100l);

        Set<String> frontierAfter6100l = frontierIds();
        assertThat(frontierAfter6100l).doesNotContain(MODULE_6_100L_ID);
        assertThat(frontierAfter6100l).contains(MODULE_6_0002_ID, MODULE_6_006_ID);
    }

    private void setMasteredGoals(Set<String> goalIds) {
        List<Mastery> entries = goalIds.stream()
                .map(goalId -> new Mastery(learner, goalId, 1.0))
                .toList();
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(entries);
    }

    private Set<String> frontierIds() {
        return new HashSet<>(learnerService.getFrontier(LEARNER_ID));
    }

    private static Set<String> atomicGoalIdsForLandscape(String landscapeId) {
        LearningLandscape landscape = landscapeService.getById(landscapeId);
        if (landscape == null || landscape.getGoals() == null) {
            throw new IllegalStateException("Landscape not found or without goals: " + landscapeId);
        }
        return landscape.getGoals().stream()
                .filter(MitOcwFrontierWalkthroughTest::isAtomicGoal)
                .map(LearningGoal::getId)
                .collect(Collectors.toSet());
    }

    private static boolean isAtomicGoal(LearningGoal goal) {
        if (goal == null) {
            return false;
        }
        if ("atomic".equalsIgnoreCase(goal.getType())) {
            return true;
        }
        return goal.getContains() == null || goal.getContains().isEmpty();
    }

    private static Path resolveCurriculaDir() {
        Path[] candidates = new Path[] { Path.of("..", "curricula"), Path.of("curricula") };
        for (Path candidate : candidates) {
            if (Files.isDirectory(candidate)) {
                return candidate.toAbsolutePath().normalize();
            }
        }
        throw new IllegalStateException("Could not locate curricula directory from test execution path.");
    }
}
