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
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.nio.file.Path;
import java.time.Instant;
import java.lang.reflect.Method;
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
    private static final String CANONICAL_CHEMISTRY_ID = "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0";
    private static final String CANONICAL_BIOLOGY_ID = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    private static final String CANONICAL_MATH_GK_PERSONAL_CONFIG = """
            {
              "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"}
            }
            """;
    private static final String LEGACY_SEK1_CLUSTER_ID = "86e86a3b-740b-44aa-b3ab-68cd3ee25def";
    private static final String CANONICAL_SEK1_CLUSTER_ID = "5c6b7342-0f67-4b4c-894d-fd83a6df64b3";
    private static final String LEGACY_SEK1_MAPPINGS_ID = "4261f57b-13c9-4733-a0dc-72f2dcd4726d";
    private static final String CANONICAL_SEK1_MAPPINGS_ID = "2bb4bb91-7929-483a-b735-44275f6b5cdc";
    private static final String LEGACY_SEK1_NUMBER_BASICS_ID = "d20fcef5-b5dd-4e97-945a-52f7b7d89306";
    private static final String LEGACY_SEK1_PROPORTIONAL_ID = "ed0c5283-b1b2-4562-9115-7336fca7a8d4";
    private static final String CANONICAL_SEK1_PROPORTIONAL_ID = "c1f50bcc-7848-4e49-b9de-0ec030cc6bca";
    private static final String LEGACY_SEK1_LINEAR_EQUATIONS_ID = "05b6a520-c23a-414a-842a-ba1c0e57b776";
    private static final String LEGACY_SEK1_BINOMIALS_ID = "172f1e73-b8fa-47be-b7af-50c93ce8cc7b";
    private static final String LEGACY_ANALYSIS_CLUSTER_ID = "a6ee6304-8c26-4eda-b56e-676655e703c2";
    private static final String CANONICAL_ANALYSIS_CLUSTER_ID = "a668ea17-9226-4074-8f8e-051acbe839eb";
    private static final String LEGACY_FUNCTION_CONCEPT_ID = "0903db01-4377-4a79-8f29-aceffea68f24";
    private static final String LEGACY_SEK1_CHEMISTRY_CLUSTER_ID = "8feb6b0f-d39c-4daf-9a13-9cb00413ff55";
    private static final String LEGACY_SEK1_CHEMISTRY_WHY_ID = "88c81951-4fbe-5e68-96b1-f5e9834e9c9d";
    private static final String LEGACY_SEK1_CHEMISTRY_WORKING_METHODS_ID = "8476c11a-9c9a-4d4c-b1eb-9977d9fe4558";
    private static final String LEGACY_SEK1_CHEMISTRY_SUBSTANCES_ID = "465935ab-3813-40a5-b1d8-51aa8fa0c6ec";
    private static final String LEGACY_SEK1_CHEMISTRY_STATES_ID = "6e9590a8-b99c-4808-aa30-184337053fbd";
    private static final String LEGACY_SEK1_CHEMISTRY_SOLUTIONS_ID = "745306f5-5d03-4cfd-bca8-5cb0c63d828c";
    private static final String LEGACY_SEK1_CHEMISTRY_ACID_BASE_ID = "0bfc34bc-9a17-4e86-ac62-b2bf4b967a43";
    private static final String LEGACY_SEK1_CHEMISTRY_HAZARDS_ID = "3b6a4f7c-178c-4b0a-b786-f7e11693ea6d";
    private static final String LEGACY_SEK1_CHEMISTRY_SEPARATION_ID = "474c73d9-d8bf-4fa3-9fbf-ee21207c2aab";
    private static final String LEGACY_SEK1_CHEMISTRY_REACTIONS_CLUSTER_ID = "13a84828-e2e6-4bde-9c26-f4b54eb90fd3";
    private static final String LEGACY_SEK1_CHEMISTRY_REACTION_CHARACTERISTICS_ID = "ff3db7ec-444f-44d6-bd8c-7e452de3f2a0";
    private static final String LEGACY_SEK1_CHEMISTRY_OXIDATION_REDUCTION_ID = "0b9ff7a1-3767-4942-8573-3474aa0fd572";
    private static final String LEGACY_SEK1_CHEMISTRY_COMBUSTION_ID = "8933dbfb-1d50-41fc-8e59-3ec9b65ed482";
    private static final String LEGACY_SEK1_CHEMISTRY_REACTION_ENERGY_ID = "b6808c45-970e-4918-b57e-294d03409ad7";
    private static final String LEGACY_SEK1_CHEMISTRY_MASS_CONSERVATION_ID = "4f94579b-7db0-4792-84f2-eb38df3327b3";
    private static final String LEGACY_SEK1_CHEMISTRY_SYMBOL_LANGUAGE_CLUSTER_ID = "ef2e2a68-566f-4059-acd4-9ed504c411b9";
    private static final String LEGACY_SEK1_CHEMISTRY_CONSTANT_PROPORTIONS_ID = "d902cc1b-fe62-4a4a-bbc1-d1dc54b34a54";
    private static final String LEGACY_SEK1_CHEMISTRY_DALTON_ID = "ae7e4674-eadc-4d75-a3a0-8466a5688e25";
    private static final String LEGACY_SEK1_CHEMISTRY_SYMBOLS_FORMULAS_ID = "aba0f8ad-06c3-4553-ad37-e060c38cb0ff";
    private static final String LEGACY_SEK1_CHEMISTRY_REACTION_EQUATIONS_ID = "877990c1-6534-4328-81aa-5351396eb3d1";
    private static final String LEGACY_SEK1_CHEMISTRY_REDOX_SCHEMES_ID = "343e6f57-6dcf-49c1-91c7-001dbe446c4e";
    private static final String LEGACY_SEK1_BIOLOGY_CLUSTER_ID = "09ada9f9-7ed6-454c-b1cf-105c3e803ddc";
    private static final String LEGACY_SEK1_BIOLOGY_WHY_ID = "93ce5d67-4d9b-5579-a695-38158b93df92";
    private static final String LEGACY_SEK1_BIOLOGY_SCIENCE_ID = "9f32781f-c0f1-4124-b06d-47210ae968bf";
    private static final String LEGACY_SEK1_BIOLOGY_CHARACTERISTICS_ID = "6829bc14-3ac9-4e99-a0ca-b73f2e126d1a";
    private static final String LEGACY_SEK1_BIOLOGY_CELL_CLUSTER_ID = "bce76162-9595-45b4-8508-29774c6445aa";
    private static final String LEGACY_SEK1_BIOLOGY_MICROSCOPE_ID = "cadd0abb-2f9e-4ab0-bd71-ddf81d719f44";
    private static final String LEGACY_SEK1_BIOLOGY_PLANT_CELL_ID = "b94ab326-156a-4baa-90e4-cb96df2620b7";
    private static final String LEGACY_SEK1_BIOLOGY_CELL_COMPARE_ID = "840b4079-1c5f-4b99-9c19-e603823ae462";
    private static final String LEGACY_SEK1_BIOLOGY_PHOTOSYNTHESIS_CLUSTER_ID = "29428ad4-de22-4020-ac98-001f9dfc777c";
    private static final String LEGACY_SEK1_BIOLOGY_LIGHT_ID = "d8d8a5ca-e4de-44cc-a714-f31a520a9bf1";
    private static final String LEGACY_SEK1_BIOLOGY_CO2_WATER_ID = "abfbab52-5799-4b46-b4e8-3e4d8ec8d905";
    private static final String LEGACY_SEK1_BIOLOGY_STARCH_OXYGEN_ID = "f9d964a4-b715-4bbe-b41c-33a4300b8b48";
    private static final String LEGACY_SEK1_BIOLOGY_WORD_EQUATION_ID = "e639c5a6-b114-4467-a466-f8e2fde6ac66";
    private static final String LEGACY_SEK1_BIOLOGY_IMPORTANCE_ID = "4ad0ecd3-7f20-400e-a12e-aeda5145541c";
    private static final String LEGACY_BAYERN_FUNCTION_CLUSTER_ID = "f9538605-8bf4-5279-b00a-c18786f9cc51";
    private static final String LEGACY_BAYERN_INTEGER_ARITHMETIC_ID = "1877cd7b-d4ce-5356-a938-f28ddd8d7f3c";
    private static final String LEGACY_BAYERN_FUNCTION_CONCEPT_ID = "0042dc1e-859b-5c95-95a4-48aeff1bae63";
    private static final String LEGACY_BAYERN_LINEAR_ANALYSIS_ID = "edd3e6df-7f3d-5230-9377-dcf9d095c49c";
    private static final String LEGACY_BAYERN_QUADRATIC_VERTEX_ID = "6e7ff196-a9e4-5bac-afee-621801ec85c2";
    private static final String LEGACY_BAYERN_QUADRATIC_FORMS_ID = "cd991abf-058c-54a3-8690-a76ed51060f8";
    private static final String CANONICAL_FUNCTION_CONCEPT_ID = "09f47964-2cd0-410e-93ee-9632b582fc91";
    private static final String CANONICAL_INTEGER_ARITHMETIC_BAYERN_ID = "4b67bed9-06da-40b2-a306-24e9e7dfd390";
    private static final String CANONICAL_NUMBER_BASICS_HE_ID = "cf474eab-1379-4877-907e-58b0892ce734";
    private static final String CANONICAL_LINEAR_ANALYSIS_ID = "e4f3a846-d2b8-4ee5-b0a2-4dc2833b2ecb";
    private static final String CANONICAL_LINEAR_ANALYSIS_BAYERN_ID = "ae772695-d55e-4cc5-81bc-6605272759b4";
    private static final String CANONICAL_LINEAR_EQUATIONS_HE_ID = "e6eb42c7-454f-49bf-b598-64d2935d2735";
    private static final String CANONICAL_QUADRATIC_VERTEX_ID = "c23705d2-57fc-4260-80d8-2d340203a173";
    private static final String CANONICAL_QUADRATIC_VERTEX_BAYERN_ID = "3e4032bd-4d8c-4e72-bfdd-64a34df053c9";
    private static final String CANONICAL_BINOMIALS_HE_ID = "e322310f-f33a-485d-bc23-2412a6b8fa12";
    private static final String CANONICAL_E1_CLUSTER_ID = "c9d92f32-167a-4006-a940-b8063a6ed434";
    private static final String CANONICAL_CALCULATE_VALUES_ID = "c65ecabf-d00b-4e2d-99ae-b64692325ffb";
    private static final String CANONICAL_READ_VALUES_ID = "a8c42ee9-2898-4247-819f-c235032ac78a";
    private static final String CANONICAL_SYMMETRY_ID = "d8c9eb57-1614-4c1d-829a-618134def352";
    private static final String CANONICAL_CHEMISTRY_SEK1_CLUSTER_ID = "3588c15e-adbe-5b81-b3a7-10da20574e3d";
    private static final String CANONICAL_CHEMISTRY_SEK1_HAZARDS_ID = "c7d4d9f7-d23f-44fc-bf22-3872e0f2b9a0";
    private static final String CANONICAL_CHEMISTRY_SEK1_SEPARATION_ID = "5a709938-e0f5-42b7-94f0-cfded08963a2";
    private static final String CANONICAL_CHEMISTRY_SEK1_STATES_ID = "326d45bf-9f77-57d5-a054-93e76b034dd5";
    private static final String CANONICAL_CHEMISTRY_SEK1_SOLUTIONS_ID = "53fd1bfd-facb-54ae-b2dc-f667ed1414fc";
    private static final String CANONICAL_CHEMISTRY_SEK1_ACID_BASE_ID = "d2ccd1d5-56f7-583f-9724-e97441367f91";
    private static final String CANONICAL_CHEMISTRY_SEK1_REACTIONS_CLUSTER_ID = "a00d302b-7762-4b9d-a6d7-de0c58b35540";
    private static final String CANONICAL_CHEMISTRY_SEK1_REACTION_CHARACTERISTICS_ID = "8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566";
    private static final String CANONICAL_CHEMISTRY_SEK1_OXIDATION_REDUCTION_ID = "bcf8b24b-3eed-4a36-8fb3-d6bffc1e193a";
    private static final String CANONICAL_CHEMISTRY_SEK1_COMBUSTION_ID = "bb707fda-504c-4699-a78c-d0a6c320658f";
    private static final String CANONICAL_CHEMISTRY_SEK1_REACTION_ENERGY_ID = "1286f2fe-89b7-4454-8e11-85b6abd6e278";
    private static final String CANONICAL_CHEMISTRY_SEK1_MASS_CONSERVATION_ID = "1bdaf7f2-ff3b-455a-a7fb-95a44642762a";
    private static final String CANONICAL_CHEMISTRY_SEK1_SYMBOL_LANGUAGE_CLUSTER_ID = "fb3bdf39-4baf-4510-a192-c8a12fbf5dba";
    private static final String CANONICAL_CHEMISTRY_SEK1_CONSTANT_PROPORTIONS_ID = "e0d05c36-eaac-4c75-8ead-3fd5bdafefca";
    private static final String CANONICAL_CHEMISTRY_SEK1_DALTON_ID = "9b5d6326-d27c-4ece-8c72-debda705464a";
    private static final String CANONICAL_CHEMISTRY_SEK1_SYMBOLS_FORMULAS_ID = "e7c363d4-e02d-4895-8750-ba62c2eb63fe";
    private static final String CANONICAL_CHEMISTRY_SEK1_REACTION_EQUATIONS_ID = "11bea4c6-7b8a-47e0-8293-2eb1ce34cf66";
    private static final String CANONICAL_CHEMISTRY_SEK1_REDOX_SCHEMES_ID = "22133f29-ef02-4408-8f8d-2bbea3275d91";
    private static final String CANONICAL_CHEMISTRY_E2_CLUSTER_ID = "f97b9c87-16d0-58fd-bcb2-c51574aa36d0";
    private static final String CANONICAL_CHEMISTRY_WHY_ID = "a9c22adc-b543-5b0c-a2d8-3189facdff08";
    private static final String CANONICAL_CHEMISTRY_OXIDATION_NUMBERS_ID = "4961130b-1ee8-58f2-a319-dff0a864db6a";
    private static final String CANONICAL_CHEMISTRY_ARRHENIUS_ID = "28bb9d15-f865-5843-a035-6066580fea64";
    private static final String CANONICAL_CHEMISTRY_PH_ID = "f1ed86f0-534d-57d7-8952-a004a331cc54";
    private static final String CANONICAL_CHEMISTRY_SIMPLE_REDOX_SERIES_ID = "16da6a4d-8e9c-5f5d-b69d-338d67a2d362";
    private static final String CANONICAL_BIOLOGY_SEK1_CLUSTER_ID = "b530a382-2786-5794-8821-3e01a62d88fd";
    private static final String CANONICAL_BIOLOGY_SEK1_SCIENCE_ID = "8d35381e-d646-512c-b0c2-bb90c4974208";
    private static final String CANONICAL_BIOLOGY_SEK1_CHARACTERISTICS_ID = "55bdfb1d-5c14-5b1c-bc8e-4ab428ef59ba";
    private static final String CANONICAL_BIOLOGY_SEK1_PLANT_CELL_ID = "e0d04e58-1591-5230-bfa6-5c685b56d25b";
    private static final String CANONICAL_BIOLOGY_SEK1_CELL_COMPARE_ID = "b1dff57f-329e-5264-b2b9-2db71a0b2172";
    private static final String CANONICAL_BIOLOGY_SEK1_PHOTOSYNTHESIS_CLUSTER_ID = "860c80f9-e463-598b-8ef8-79f65c12f235";
    private static final String CANONICAL_BIOLOGY_SEK1_WORD_EQUATION_ID = "576d59e2-397a-5654-b853-7c0c4870fbd3";
    private static final String CANONICAL_BIOLOGY_SEK1_IMPORTANCE_ID = "8678d0b5-8b74-5b01-8143-91bfea1e4482";
    private static final String CANONICAL_BIOLOGY_E1_CLUSTER_ID = "765df889-5828-564a-ab47-c10312c956f4";
    private static final String CANONICAL_BIOLOGY_WHY_ID = "2d451684-6e53-565e-a987-f362da919d2c";
    private static final String CANONICAL_BIOLOGY_LIFE_ID = "11e90f71-a9a4-5a57-b619-ad5d81e81f96";
    private static final String CANONICAL_BIOLOGY_CELL_TYPES_ID = "7c6bf0cc-6ed8-56b1-b44a-642f7a069a5f";
    private static final String CANONICAL_BIOLOGY_ORGANELLES_ID = "fc8c4b02-02f2-5ad6-b481-224d36121da1";
    private static final String CANONICAL_BIOLOGY_Q3_METABOLISM_CLUSTER_ID = "c7f2fc89-543d-5ad1-9875-d6fcedf0d1fb";
    private static final String CANONICAL_BIOLOGY_PHOTOSYNTHESIS_MODEL_ID = "32f47903-0788-5c27-ac88-7464f481f2f7";
    private static final String CANONICAL_BIOLOGY_CELL_RESPIRATION_ID = "135447a0-5d55-564a-afc3-3e3fbed77819";
    private static final String CANONICAL_BIOLOGY_ENZYME_CATALYSIS_ID = "0dbe758c-73c8-530b-bbbd-fb55540f942f";

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
    void getMasteryProjectsExactBavariaIntegerArithmeticMasteryIntoCanonicalPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_INTEGER_ARITHMETIC_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_INTEGER_ARITHMETIC_BAYERN_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_BAYERN_INTEGER_ARITHMETIC_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactBavariaLinearAnalysisMasteryIntoCanonicalPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_LINEAR_ANALYSIS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_LINEAR_ANALYSIS_BAYERN_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_BAYERN_LINEAR_ANALYSIS_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactBavariaQuadraticVertexMasteryIntoCanonicalPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_QUADRATIC_VERTEX_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_QUADRATIC_VERTEX_BAYERN_ID, 1.0);
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
    void getMasteryProjectsExactSek1ChemistryMasteryIntoCanonicalChemistryGoals() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_SOLUTIONS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_ACID_BASE_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_SOLUTIONS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_ACID_BASE_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactSek1ChemistrySafetyAndSeparationIntoCanonicalChemistryGoals() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_HAZARDS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_SEPARATION_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_HAZARDS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_SEPARATION_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactSek1ChemistryReactionMasteryIntoCanonicalChemistryGoals() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_REACTION_CHARACTERISTICS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_OXIDATION_REDUCTION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_COMBUSTION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_REACTION_ENERGY_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_MASS_CONSERVATION_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_REACTION_CHARACTERISTICS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_OXIDATION_REDUCTION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_COMBUSTION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_REACTION_ENERGY_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_MASS_CONSERVATION_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactSek1ChemistrySymbolLanguageMasteryIntoCanonicalChemistryGoals() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_CONSTANT_PROPORTIONS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_DALTON_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_SYMBOLS_FORMULAS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_REACTION_EQUATIONS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_REDOX_SCHEMES_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_CONSTANT_PROPORTIONS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_DALTON_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_SYMBOLS_FORMULAS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_REACTION_EQUATIONS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_CHEMISTRY_SEK1_REDOX_SCHEMES_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactSek1BiologyMasteryIntoCanonicalBiologyGoals() {
        learner.setSelectedCurriculum(CANONICAL_BIOLOGY_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_SCIENCE_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_CHARACTERISTICS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_CELL_COMPARE_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_BIOLOGY_SEK1_SCIENCE_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_BIOLOGY_SEK1_CHARACTERISTICS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_BIOLOGY_SEK1_CELL_COMPARE_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactSek1BiologyPhotosynthesisMasteryIntoCanonicalBiologyGoals() {
        learner.setSelectedCurriculum(CANONICAL_BIOLOGY_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_WORD_EQUATION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_IMPORTANCE_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_BIOLOGY_SEK1_WORD_EQUATION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_BIOLOGY_SEK1_IMPORTANCE_ID, 1.0);
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
    void canonicalChemistryFrontierUsesProjectedSek1ChemistryMastery() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_CHEMISTRY_E2_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_WHY_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_WORKING_METHODS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_SUBSTANCES_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_STATES_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_SOLUTIONS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_ACID_BASE_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_CHEMISTRY_ARRHENIUS_ID)
                .doesNotContain(CANONICAL_CHEMISTRY_WHY_ID, CANONICAL_CHEMISTRY_PH_ID, LEGACY_SEK1_CHEMISTRY_ACID_BASE_ID);
    }

    @Test
    void canonicalChemistrySek1FrontierUsesProjectedSafetyAndSubstanceMastery() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_CHEMISTRY_SEK1_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_WORKING_METHODS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_SUBSTANCES_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_CHEMISTRY_SEK1_HAZARDS_ID, CANONICAL_CHEMISTRY_SEK1_SEPARATION_ID, CANONICAL_CHEMISTRY_SEK1_STATES_ID)
                .doesNotContain(CANONICAL_CHEMISTRY_SEK1_SOLUTIONS_ID);
    }

    @Test
    void canonicalChemistrySek1ReactionFrontierUsesProjectedIntroReactionMastery() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_CHEMISTRY_SEK1_REACTIONS_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_CHEMISTRY_REACTION_CHARACTERISTICS_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(
                        CANONICAL_CHEMISTRY_SEK1_OXIDATION_REDUCTION_ID,
                        CANONICAL_CHEMISTRY_SEK1_COMBUSTION_ID,
                        CANONICAL_CHEMISTRY_SEK1_REACTION_ENERGY_ID,
                        CANONICAL_CHEMISTRY_SEK1_MASS_CONSERVATION_ID)
                .doesNotContain(CANONICAL_CHEMISTRY_SEK1_REACTION_CHARACTERISTICS_ID, LEGACY_SEK1_CHEMISTRY_REACTION_CHARACTERISTICS_ID);
    }

    @Test
    void canonicalChemistrySimpleRedoxSeriesDependsOnProjectedSek1RedoxBridge() {
        LearningGoal goal = landscapeService.getGoalDefinition(CANONICAL_CHEMISTRY_SIMPLE_REDOX_SERIES_ID);

        assertThat(goal).isNotNull();
        assertThat(goal.getRequires())
                .contains(CANONICAL_CHEMISTRY_OXIDATION_NUMBERS_ID, CANONICAL_CHEMISTRY_SEK1_OXIDATION_REDUCTION_ID);
    }

    @Test
    void canonicalChemistrySek1SymbolLanguageFrontierUsesProjectedEquationAndReactionMastery() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_CHEMISTRY_SEK1_SYMBOL_LANGUAGE_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_CONSTANT_PROPORTIONS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_DALTON_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_SYMBOLS_FORMULAS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_REACTION_EQUATIONS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_REACTION_CHARACTERISTICS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_CHEMISTRY_OXIDATION_REDUCTION_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_CHEMISTRY_SEK1_REDOX_SCHEMES_ID)
                .doesNotContain(
                        CANONICAL_CHEMISTRY_SEK1_CONSTANT_PROPORTIONS_ID,
                        CANONICAL_CHEMISTRY_SEK1_DALTON_ID,
                        CANONICAL_CHEMISTRY_SEK1_SYMBOLS_FORMULAS_ID,
                        CANONICAL_CHEMISTRY_SEK1_REACTION_EQUATIONS_ID,
                        LEGACY_SEK1_CHEMISTRY_REACTION_EQUATIONS_ID);
    }

    @Test
    void canonicalBiologyFrontierUsesProjectedSek1BiologyMastery() {
        learner.setSelectedCurriculum(CANONICAL_BIOLOGY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_BIOLOGY_E1_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_WHY_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_SCIENCE_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_CHARACTERISTICS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_MICROSCOPE_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_PLANT_CELL_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_CELL_COMPARE_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_BIOLOGY_LIFE_ID, CANONICAL_BIOLOGY_CELL_TYPES_ID)
                .doesNotContain(CANONICAL_BIOLOGY_WHY_ID, CANONICAL_BIOLOGY_ORGANELLES_ID, LEGACY_SEK1_BIOLOGY_CELL_COMPARE_ID);
    }

    @Test
    void canonicalBiologyQ3FrontierUsesProjectedSek1PhotosynthesisMastery() {
        learner.setSelectedCurriculum(CANONICAL_BIOLOGY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_BIOLOGY_Q3_METABOLISM_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, CANONICAL_BIOLOGY_ENZYME_CATALYSIS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_LIGHT_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_CO2_WATER_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_STARCH_OXYGEN_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_WORD_EQUATION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_BIOLOGY_IMPORTANCE_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_BIOLOGY_PHOTOSYNTHESIS_MODEL_ID)
                .doesNotContain(
                        CANONICAL_BIOLOGY_SEK1_WORD_EQUATION_ID,
                        CANONICAL_BIOLOGY_SEK1_IMPORTANCE_ID,
                        CANONICAL_BIOLOGY_CELL_RESPIRATION_ID,
                        LEGACY_SEK1_BIOLOGY_IMPORTANCE_ID);
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
    void canonicalGymnasiumRootStateFilterPrefersExplicitJurisdictionApplicability() throws Exception {
        LearningGoal goal = landscapeService.getGoalDefinition(CANONICAL_FUNCTION_CONCEPT_ID);
        assertThat(goal).isNotNull();

        Map<String, List<String>> originalApplicability = goal.getApplicability();
        goal.setApplicability(Map.of("jurisdiction", List.of("DE-HE")));
        try {
            Map<String, LearningGoal> filteredGoals = invokeGetFilteredGoals(
                    CANONICAL_GYMNASIUM_ROOT_ID,
                    """
                            {
                              "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-BY"},
                              "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": true, "filterId": "GK"},
                              "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": false, "filterId": "GK"}
                            }
                            """);

            assertThat(filteredGoals).containsKey(CANONICAL_MATH_ROOT_ID);
            assertThat(filteredGoals).doesNotContainKey(CANONICAL_FUNCTION_CONCEPT_ID);
        } finally {
            goal.setApplicability(originalApplicability);
        }
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
    void getPlannedGoalsProjectsLegacySek1ChemistryClusterForCanonicalView() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_CHEMISTRY_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_CHEMISTRY_SEK1_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacySek1ChemistryReactionsClusterForCanonicalView() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_CHEMISTRY_REACTIONS_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_CHEMISTRY_SEK1_REACTIONS_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacySek1ChemistrySymbolLanguageClusterForCanonicalView() {
        learner.setSelectedCurriculum(CANONICAL_CHEMISTRY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_CHEMISTRY_SYMBOL_LANGUAGE_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_CHEMISTRY_SEK1_SYMBOL_LANGUAGE_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacySek1BiologyClusterForCanonicalView() {
        learner.setSelectedCurriculum(CANONICAL_BIOLOGY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_BIOLOGY_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_BIOLOGY_SEK1_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacySek1BiologyPhotosynthesisClusterForCanonicalView() {
        learner.setSelectedCurriculum(CANONICAL_BIOLOGY_ID);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_BIOLOGY_PHOTOSYNTHESIS_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_BIOLOGY_SEK1_PHOTOSYNTHESIS_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacySek1LinearEquationsGoalForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_LINEAR_EQUATIONS_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_LINEAR_EQUATIONS_HE_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacySek1NumberBasicsGoalForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_NUMBER_BASICS_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_NUMBER_BASICS_HE_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacySek1BinomialGoalForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_SEK1_BINOMIALS_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_BINOMIALS_HE_ID);
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

    @SuppressWarnings("unchecked")
    private Map<String, LearningGoal> invokeGetFilteredGoals(String curriculumId, String personalCurriculumJson)
            throws Exception {
        Method method = LearnerService.class.getDeclaredMethod("getFilteredGoals", String.class, String.class);
        method.setAccessible(true);
        return (Map<String, LearningGoal>) method.invoke(learnerService, curriculumId, personalCurriculumJson);
    }
}
