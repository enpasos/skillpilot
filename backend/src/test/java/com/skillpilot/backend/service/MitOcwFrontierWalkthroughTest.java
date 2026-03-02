package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
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

    private static final String FOUNDATIONS_WHY_ID = "9c136002-6239-5228-84be-2956c8f597a0";
    private static final String ENTRY_18_01SC_ID = "0e52f435-f9b7-4e7b-84da-1a964e68ef84";
    private static final String ENTRY_18_02SC_ID = "01f3b897-8a16-4432-a8b6-23abc100179c";
    private static final String ENTRY_18_05_ID = "097042b8-a7fc-4e1b-96ea-5fc6c45cfe79";
    private static final String ENTRY_18_06_ID = "814257f7-9324-5893-962f-66d28ebd90e9";
    private static final String ENTRY_6_100L_ID = "acc2b340-1489-4742-b038-c8e6508a601b";
    private static final String ENTRY_6_0002_ID = "b2989c72-6428-4bce-8502-820ad893a284";
    private static final String ENTRY_6_006_ID = "e02d20de-8049-4d61-8b66-24a4274898b4";

    private static ObjectMapper objectMapper;
    private static LandscapeService landscapeService;

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
    void frontierStartsWithFoundationThenUnlocksTrackEntryModules() {
        setMasteredGoals(Set.of());
        Set<String> frontierBeforeFoundation = frontierIds();

        assertThat(frontierBeforeFoundation).contains(FOUNDATIONS_WHY_ID);
        assertThat(frontierBeforeFoundation).doesNotContain(ENTRY_18_01SC_ID, ENTRY_6_100L_ID);

        setMasteredGoals(Set.of(FOUNDATIONS_WHY_ID));
        Set<String> frontierAfterFoundation = frontierIds();

        assertThat(frontierAfterFoundation).contains(ENTRY_18_01SC_ID, ENTRY_6_100L_ID);
        assertThat(frontierAfterFoundation).doesNotContain(
                ENTRY_18_02SC_ID,
                ENTRY_18_05_ID,
                ENTRY_18_06_ID,
                ENTRY_6_0002_ID,
                ENTRY_6_006_ID);
    }

    @Test
    void mathTrackSequenceIsCoherentForFirstModuleTransitions() {
        Set<String> masteryAfter1801 = new HashSet<>();
        masteryAfter1801.add(FOUNDATIONS_WHY_ID);
        masteryAfter1801.add(ENTRY_18_01SC_ID);
        masteryAfter1801.addAll(atomicGoalIdsForLandscape(LANDSCAPE_18_01SC));

        setMasteredGoals(masteryAfter1801);
        Set<String> frontierAfter1801 = frontierIds();

        assertThat(frontierAfter1801).contains(ENTRY_18_02SC_ID, ENTRY_18_06_ID);
        assertThat(frontierAfter1801).doesNotContain(ENTRY_18_05_ID);

        Set<String> masteryAfter1802 = new HashSet<>(masteryAfter1801);
        masteryAfter1802.add(ENTRY_18_02SC_ID);
        masteryAfter1802.addAll(atomicGoalIdsForLandscape(LANDSCAPE_18_02SC));

        setMasteredGoals(masteryAfter1802);
        Set<String> frontierAfter1802 = frontierIds();

        assertThat(frontierAfter1802).contains(ENTRY_18_05_ID);
    }

    @Test
    void csTrackSequenceUnlocks60002And6006After6100l() {
        setMasteredGoals(Set.of(FOUNDATIONS_WHY_ID));
        Set<String> frontierAfterFoundation = frontierIds();

        assertThat(frontierAfterFoundation).doesNotContain(ENTRY_6_0002_ID, ENTRY_6_006_ID);

        Set<String> masteryAfter6100l = new HashSet<>();
        masteryAfter6100l.add(FOUNDATIONS_WHY_ID);
        masteryAfter6100l.add(ENTRY_6_100L_ID);
        masteryAfter6100l.addAll(atomicGoalIdsForLandscape(LANDSCAPE_6_100L));
        setMasteredGoals(masteryAfter6100l);

        Set<String> frontierAfter6100l = frontierIds();
        assertThat(frontierAfter6100l).contains(ENTRY_6_0002_ID, ENTRY_6_006_ID);
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
