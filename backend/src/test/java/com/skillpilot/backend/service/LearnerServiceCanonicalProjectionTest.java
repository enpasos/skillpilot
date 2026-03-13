package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryEntryDTO;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.LearningState;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.MasteryId;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.events.LearnerStateChangedEvent;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

class LearnerServiceCanonicalProjectionTest {

    private static final String LEARNER_ID = "canonical-projection-learner";
    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String HESSEN_MATH_LANDSCAPE_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
    private static final String BAYERN_MATH_LANDSCAPE_ID = "c1600692-e543-5cf2-a399-6bd96e6b817f";
    private static final String CANONICAL_MATH_PILOT_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_MATH_ROOT_ID = "c01b1ce9-a667-4a46-b251-ec33ae602b15";
    private static final String CANONICAL_MATH_GK_PERSONAL_CONFIG = """
            {
              "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
            }
            """;
    private static final String LEGACY_SEK1_CLUSTER_ID = "86e86a3b-740b-44aa-b3ab-68cd3ee25def";
    private static final String CANONICAL_SEK1_CLUSTER_ID = "5c6b7342-0f67-4b4c-894d-fd83a6df64b3";
    private static final String LEGACY_SEK1_MAPPINGS_ID = "4261f57b-13c9-4733-a0dc-72f2dcd4726d";
    private static final String CANONICAL_SEK1_MAPPINGS_ID = "2bb4bb91-7929-483a-b735-44275f6b5cdc";
    private static final String LEGACY_SEK1_PROPORTIONAL_ID = "ed0c5283-b1b2-4562-9115-7336fca7a8d4";
    private static final String CANONICAL_SEK1_PROPORTIONAL_ID = "c1f50bcc-7848-4e49-b9de-0ec030cc6bca";
    private static final String LEGACY_SEK1_LINEAR_EQUATIONS_ID = "05b6a520-c23a-414a-842a-ba1c0e57b776";
    private static final String LEGACY_SEK1_BINOMIALS_ID = "172f1e73-b8fa-47be-b7af-50c93ce8cc7b";
    private static final String LEGACY_ANALYSIS_CLUSTER_ID = "a6ee6304-8c26-4eda-b56e-676655e703c2";
    private static final String CANONICAL_ANALYSIS_CLUSTER_ID = "a668ea17-9226-4074-8f8e-051acbe839eb";
    private static final String LEGACY_FUNCTION_CONCEPT_ID = "0903db01-4377-4a79-8f29-aceffea68f24";
    private static final String LEGACY_BAYERN_FUNCTION_CLUSTER_ID = "f9538605-8bf4-5279-b00a-c18786f9cc51";
    private static final String LEGACY_BAYERN_FUNCTION_CONCEPT_ID = "0042dc1e-859b-5c95-95a4-48aeff1bae63";
    private static final String LEGACY_BAYERN_LINEAR_ANALYSIS_ID = "edd3e6df-7f3d-5230-9377-dcf9d095c49c";
    private static final String LEGACY_BAYERN_QUADRATIC_VERTEX_ID = "6e7ff196-a9e4-5bac-afee-621801ec85c2";
    private static final String LEGACY_BAYERN_QUADRATIC_FORMS_ID = "cd991abf-058c-54a3-8690-a76ed51060f8";
    private static final String CANONICAL_FUNCTION_CONCEPT_ID = "09f47964-2cd0-410e-93ee-9632b582fc91";
    private static final String CANONICAL_LINEAR_ANALYSIS_ID = "e4f3a846-d2b8-4ee5-b0a2-4dc2833b2ecb";
    private static final String CANONICAL_QUADRATIC_VERTEX_ID = "c23705d2-57fc-4260-80d8-2d340203a173";
    private static final String CANONICAL_E1_CLUSTER_ID = "c9d92f32-167a-4006-a940-b8063a6ed434";
    private static final String CANONICAL_CALCULATE_VALUES_ID = "c65ecabf-d00b-4e2d-99ae-b64692325ffb";
    private static final String CANONICAL_READ_VALUES_ID = "a8c42ee9-2898-4247-819f-c235032ac78a";
    private static final String CANONICAL_SYMMETRY_ID = "d8c9eb57-1614-4c1d-829a-618134def352";

    private static ObjectMapper objectMapper;
    private static LandscapeService landscapeService;
    private static GoalMappingService goalMappingService;

    private LearnerRepository learnerRepository;
    private LearnerClientStateRepository learnerClientStateRepository;
    private MasteryRepository masteryRepository;
    private PlannedGoalRepository plannedGoalRepository;
    private DeckResourceService deckResourceService;
    private ApplicationEventPublisher eventPublisher;
    private LearnerService learnerService;
    private Learner learner;

    @BeforeAll
    static void initServices() {
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
        learner.setSelectedCurriculum(CANONICAL_MATH_PILOT_ID);
        learner.setLearningState(LearningState.FRONTIER);
        learner.setPersonalCurriculum("{}");

        when(learnerRepository.findById(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.existsById(LEARNER_ID)).thenReturn(true);
        when(learnerRepository.save(any(Learner.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_E1_CLUSTER_ID)));
        when(masteryRepository.save(any(Mastery.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void getMasteryProjectsExactLegacyMasteryIntoCanonicalPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_FUNCTION_CONCEPT_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_FUNCTION_CONCEPT_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_FUNCTION_CONCEPT_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactBavariaLegacyMasteryIntoCanonicalPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_FUNCTION_CONCEPT_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_FUNCTION_CONCEPT_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_BAYERN_FUNCTION_CONCEPT_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactBavariaLinearAnalysisMasteryIntoCanonicalPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_LINEAR_ANALYSIS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_LINEAR_ANALYSIS_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_BAYERN_LINEAR_ANALYSIS_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactBavariaQuadraticVertexMasteryIntoCanonicalPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_QUADRATIC_VERTEX_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_QUADRATIC_VERTEX_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_BAYERN_QUADRATIC_VERTEX_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactSek1LegacyMasteryIntoCanonicalPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_MAPPINGS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_SEK1_MAPPINGS_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_SEK1_MAPPINGS_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactSek1ProportionalMasteryIntoCanonicalPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PROPORTIONAL_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_SEK1_PROPORTIONAL_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_SEK1_PROPORTIONAL_ID, 1.0);
    }

    @Test
    void canonicalPilotFrontierUsesProjectedLegacyMastery() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_FUNCTION_CONCEPT_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_CALCULATE_VALUES_ID, CANONICAL_READ_VALUES_ID, CANONICAL_SYMMETRY_ID)
                .doesNotContain(CANONICAL_FUNCTION_CONCEPT_ID);
    }

    @Test
    void canonicalPilotLearnerStateUsesProjectedMasteryWithoutLegacyLeakage() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_FUNCTION_CONCEPT_ID, 1.0)));
        learner.setPersonalCurriculum(CANONICAL_MATH_GK_PERSONAL_CONFIG);

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.curriculum()).isNotNull();
        assertThat(state.curriculum().getCurriculumId()).isEqualTo(CANONICAL_MATH_PILOT_ID);
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(state.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_CALCULATE_VALUES_ID, CANONICAL_READ_VALUES_ID, CANONICAL_SYMMETRY_ID)
                .doesNotContain(CANONICAL_FUNCTION_CONCEPT_ID, LEGACY_FUNCTION_CONCEPT_ID);
    }

    @Test
    void canonicalGymnasiumRootPropagatesBundeslandFilterIntoMathChildLandscape() {
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-BY"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": false, "filterId": "GK"}
                }
                """);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_MATH_ROOT_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_MATH_ROOT_ID, CANONICAL_SEK1_CLUSTER_ID)
                .doesNotContain(CANONICAL_ANALYSIS_CLUSTER_ID, CANONICAL_E1_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyScopeIdsForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_ANALYSIS_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_ANALYSIS_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyBavariaClusterIdsForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_FUNCTION_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_SEK1_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyBavariaQuadraticFormsGoalForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_QUADRATIC_FORMS_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_QUADRATIC_VERTEX_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacySek1LinearEquationsGoalForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_LINEAR_EQUATIONS_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_LINEAR_ANALYSIS_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacySek1BinomialGoalForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_BINOMIALS_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_QUADRATIC_VERTEX_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacySek1ClusterIdsForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_SEK1_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsCollapsesMixedLegacyScopesIntoCanonicalSubtrees() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new PlannedGoal(learner, LEGACY_ANALYSIS_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_FUNCTION_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_SEK1_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_ANALYSIS_CLUSTER_ID, CANONICAL_SEK1_CLUSTER_ID);
    }

    @Test
    void getMasteryKeepsHigherStoredCanonicalMasteryThanLowerLegacyProjection() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        masteryEntry(LEGACY_FUNCTION_CONCEPT_ID, 0.5, Instant.parse("2026-03-10T08:00:00Z")),
                        masteryEntry(CANONICAL_FUNCTION_CONCEPT_ID, 1.0, Instant.parse("2026-03-11T08:00:00Z"))));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_FUNCTION_CONCEPT_ID, 0.5);
        assertThat(mastery).containsEntry(CANONICAL_FUNCTION_CONCEPT_ID, 1.0);
    }

    @Test
    void getMasteryWithTimestampsUsesNewerLegacyTimestampForEqualExactProjection() {
        Instant canonicalTs = Instant.parse("2026-03-10T08:00:00Z");
        Instant legacyTs = Instant.parse("2026-03-11T08:00:00Z");
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        masteryEntry(CANONICAL_FUNCTION_CONCEPT_ID, 1.0, canonicalTs),
                        masteryEntry(LEGACY_FUNCTION_CONCEPT_ID, 1.0, legacyTs)));

        Map<String, MasteryEntryDTO> mastery = learnerService.getMasteryWithTimestamps(LEARNER_ID);

        assertThat(mastery)
                .containsEntry(CANONICAL_FUNCTION_CONCEPT_ID, new MasteryEntryDTO(1.0, legacyTs))
                .containsEntry(LEGACY_FUNCTION_CONCEPT_ID, new MasteryEntryDTO(1.0, legacyTs));
    }

    @Test
    void canonicalPilotLearnerStateProjectsLegacyActiveGoalToCanonicalGoal() {
        learner.setActiveGoalId(LEGACY_FUNCTION_CONCEPT_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.activeGoal()).isNotNull();
        assertThat(state.activeGoal().id()).isEqualTo(CANONICAL_FUNCTION_CONCEPT_ID);
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setMastery");
        assertThat(state.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .containsExactly(CANONICAL_FUNCTION_CONCEPT_ID);
    }

    @Test
    void setMasteryUsesCanonicalGoalKeyWhenLegacyActiveGoalIsMappedIntoCanonicalView() {
        learner.setActiveGoalId(LEGACY_FUNCTION_CONCEPT_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());
        when(masteryRepository.findById(new MasteryId(LEARNER_ID, CANONICAL_FUNCTION_CONCEPT_ID)))
                .thenReturn(Optional.empty());

        learnerService.setMastery(
                LEARNER_ID,
                new MasteryUpdateRequest(Map.of(CANONICAL_FUNCTION_CONCEPT_ID, 1.0), CANONICAL_FUNCTION_CONCEPT_ID));

        verify(masteryRepository).save(argThat(mastery ->
                mastery != null && CANONICAL_FUNCTION_CONCEPT_ID.equals(mastery.getGoalKey())));
    }

    @Test
    void legacyCurriculumReadDoesNotProjectCanonicalGoalsIntoLegacyView() {
        learner.setSelectedCurriculum(HESSEN_MATH_LANDSCAPE_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_FUNCTION_CONCEPT_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_FUNCTION_CONCEPT_ID, 1.0);
        assertThat(mastery).doesNotContainKey(CANONICAL_FUNCTION_CONCEPT_ID);
    }

    @Test
    void bavariaCurriculumReadDoesNotProjectCanonicalGoalsIntoLegacyView() {
        learner.setSelectedCurriculum(BAYERN_MATH_LANDSCAPE_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_FUNCTION_CONCEPT_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_BAYERN_FUNCTION_CONCEPT_ID, 1.0);
        assertThat(mastery).doesNotContainKey(CANONICAL_FUNCTION_CONCEPT_ID);
    }

    private static Path resolveCurriculaDir() {
        return Path.of("../curricula").toAbsolutePath().normalize();
    }

    private Mastery masteryEntry(String goalId, double value, Instant updatedAt) {
        Mastery mastery = new Mastery(learner, goalId, value);
        mastery.setUpdatedAt(updatedAt);
        return mastery;
    }
}
