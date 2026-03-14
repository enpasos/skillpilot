package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
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
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LearningLandscape;
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

class LearnerServiceCrossSubjectPilotTest {

    private static final String LEARNER_ID = "cross-subject-pilot-learner";
    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CANONICAL_PHYSICS_PILOT_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String CANONICAL_PHYSICS_ROOT_ID = "bf980fff-b62b-4ea4-a20d-31681a7ad785";
    private static final String CANONICAL_PHYSICS_GK_PERSONAL_CONFIG = """
            {
              "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "GK"}
            }
            """;
    private static final String HESSEN_PHYSICS_LANDSCAPE_ID = "24f2ca0f-b94a-444e-bb70-677cb6f85c02";
    private static final String BAYERN_PHYSICS_LANDSCAPE_ID = "42c2f7e3-91b4-5de8-bef0-d563440e9d52";
    private static final String CANONICAL_PHYSICS_CLUSTER_ID = "65ddd780-0323-45d1-8f94-5e31bf28da23";
    private static final String CANONICAL_PHYSICS_E3_CLUSTER_ID = "287739a3-6143-55d0-abe7-1a08889e9b49";
    private static final String CANONICAL_PHYSICS_HORIZONTAL_THROW_CLUSTER_ID = "82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3";
    private static final String CANONICAL_PHYSICS_E2_CLUSTER_ID = "9340e894-bb0d-45a4-91f2-b90a63ad50a8";
    private static final String CANONICAL_PHYSICS_NEWTON_CLUSTER_ID = "4dc9a094-66d7-4d4d-9436-134aabe48f39";
    private static final String CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID = "e9d616d8-685f-4129-a36f-dae7a280bae7";
    private static final String LEGACY_PHYSICS_CLUSTER_ID = "af70212d-e318-462d-a53f-fee8f05697d6";
    private static final String LEGACY_PHYSICS_E3_CLUSTER_ID = "0f3f9df2-37ee-4fd9-95b6-8786367d3794";
    private static final String LEGACY_PHYSICS_HORIZONTAL_THROW_CLUSTER_ID = "b552ca1c-3f92-5e8d-91b7-359a2f190d5a";
    private static final String LEGACY_PHYSICS_SUPERPOSITION_ID = "3c1db2d2-6e30-4661-88bf-1da5f7ebe590";
    private static final String LEGACY_PHYSICS_HORIZONTAL_THROW_ID = "a0eaf01d-1e13-470e-8ee3-ba1d56c9e3c1";
    private static final String LEGACY_PHYSICS_E2_CLUSTER_ID = "52c3d2e8-6634-4806-b84b-3709e3c4aef1";
    private static final String LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID = "e26447c4-36a3-43ef-b400-ca918754f3b0";
    private static final String LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID = "6be922a1-e60a-5317-b910-b6fea632f0fb";
    private static final String LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID = "f431504c-3f62-562b-9af2-1475a3eaeed8";
    private static final String LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID = "3d13ecad-1fab-527e-a833-5596edaa23c5";
    private static final String LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID = "0074dc7c-b4ab-5bfb-b1b7-a8f5cdb9accc";
    private static final String LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID = "aac4b09e-73e1-51a7-a3ae-f9e9bfa5481b";
    private static final String LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID = "d91f9aba-814a-573e-a09e-ebeb3b9f2bf5";
    private static final String LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID = "f7f4e1f0-3c48-5f1c-a474-4a41ca6296b6";
    private static final String LEGACY_BAYERN_PHYSICS_TRAFFIC_ID = "21e25931-e2aa-58f1-be38-77563b11d5b7";
    private static final String LEGACY_BAYERN_PHYSICS_FIRST_LAW_ID = "3c283b9c-4a1a-5c7a-bd1b-e19a961b7710";
    private static final String LEGACY_BAYERN_PHYSICS_F_EQUALS_M_A_ID = "01d2730e-a8d4-5f21-adcf-ca9d0dc7edda";
    private static final String LEGACY_BAYERN_PHYSICS_ENERGY_CONSERVATION_ID = "7a9ae9a5-0763-5d41-aade-0a46e7908c90";
    private static final String LEGACY_BAYERN_PHYSICS_WORK_ID = "c1facc77-5590-5495-9257-48ff27195dd7";
    private static final String LEGACY_BAYERN_PHYSICS_MOMENTUM_CONSERVATION_ID = "713ad139-bcb8-5a71-a520-3f194a0f8754";
    private static final String LEGACY_BAYERN_PHYSICS_COLLISIONS_ID = "fe76e9bb-f2ce-5d9a-9ea2-d7ed7ea6ca8f";
    private static final String LEGACY_BAYERN_PHYSICS_THIRD_LAW_ID = "479784b2-511c-5b2a-a1a1-f9c7625fd5bb";
    private static final String LEGACY_PHYSICS_WHY_ID = "4b56b5c6-0e7b-4486-aa8f-7d5be7f085a5";
    private static final String LEGACY_PHYSICS_DIAGRAMS_ID = "e8160c09-a013-4146-80e6-b0e5dedd8fc6";
    private static final String LEGACY_PHYSICS_ACCELERATED_ID = "d00d74e7-4fce-48e2-9d00-49f52082f8e6";
    private static final String LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID = "0436c8fc-b849-4cab-84d7-32e92c0d94a9";
    private static final String LEGACY_PHYSICS_ENERGY_CONSERVATION_ID = "9aeaf941-baef-43fb-8077-50d37e600c26";
    private static final String LEGACY_PHYSICS_MOMENTUM_CONSERVATION_ID = "f9c16720-ee4e-4bd4-b4a5-e9c12b910fab";
    private static final String LEGACY_SEK1_PHYSICS_MOTION_ID = "d95d5a8b-8415-46d2-b8aa-568a7244f7a9";
    private static final String LEGACY_SEK1_PHYSICS_MECHANICS_CLUSTER_ID = "22f30637-5c9c-45c9-9c39-fd736ae565fb";
    private static final String LEGACY_SEK1_PHYSICS_DENSITY_ID = "e960edce-07a1-4678-b909-ca9889ae8f16";
    private static final String LEGACY_SEK1_PHYSICS_FORCES_ID = "93241d35-1d4f-4239-9116-87eacb985521";
    private static final String LEGACY_SEK1_PHYSICS_FORCE_PROPERTIES_ID = "73c87a76-9f85-48f4-8baa-bedb65ec4755";
    private static final String LEGACY_SEK1_PHYSICS_FRICTION_ID = "006d9fe7-ddd9-42c1-9d48-b4b723d033c2";
    private static final String LEGACY_SEK1_PHYSICS_WORK_ENERGY_CLUSTER_ID = "ac0b8d1b-294b-4faa-b407-e719b9f914c1";
    private static final String LEGACY_SEK1_PHYSICS_ENERGY_ID = "3ebf05d1-ddd5-4199-8899-9d2fe34cf484";
    private static final String LEGACY_SEK1_PHYSICS_HEAT_ENERGY_ID = "c4dd83af-0a29-401b-af0b-95d76d3470fa";
    private static final String LEGACY_SEK1_PHYSICS_ELECTRICAL_ENERGY_ID = "9a37d05c-e957-4900-b722-539e6cec4ca7";
    private static final String LEGACY_SEK1_PHYSICS_LIGHT_CLUSTER_ID = "9d0b0fea-c866-42da-8c26-9a9691977d35";
    private static final String LEGACY_SEK1_PHYSICS_LIGHT_PROPAGATION_ID = "c8a36d2b-19f9-4cbf-b564-537678388646";
    private static final String LEGACY_SEK1_PHYSICS_RAY_MODEL_ID = "cea91b60-1970-40bb-bbed-b0c142f26b0e";
    private static final String LEGACY_SEK1_PHYSICS_REFLECTION_ID = "10109c2a-788e-4969-9476-82d7cdd06f8f";
    private static final String LEGACY_SEK1_PHYSICS_ELECTRICITY_CLUSTER_ID = "800df877-c091-400c-ac88-2286b79524c0";
    private static final String LEGACY_SEK1_PHYSICS_MAGNETS_ID = "98906541-600f-4c98-9e90-b47c72f0ea18";
    private static final String LEGACY_SEK1_PHYSICS_SIMPLE_CIRCUITS_ID = "303d4fb2-00c8-41ce-99b4-4adac0105897";
    private static final String LEGACY_SEK1_PHYSICS_CURRENT_EFFECTS_ID = "fbe3078b-7c31-4531-9c6b-da46d98375d3";
    private static final String LEGACY_SEK1_PHYSICS_CURRENT_MEASUREMENT_ID = "5e56c17f-b5ce-4259-b525-10c636b0ffc6";
    private static final String LEGACY_SEK1_PHYSICS_VOLTAGE_CLUSTER_ID = "057a39fd-bcfd-4008-b30c-f91370b34007";
    private static final String LEGACY_SEK1_PHYSICS_STATIC_ELECTRICITY_ID = "1e84b1e2-6802-45d3-9cac-f124cdcc39d8";
    private static final String LEGACY_SEK1_PHYSICS_VOLTAGE_CURRENT_ID = "5e34edd7-75d0-46aa-8d10-954bde3a1166";
    private static final String LEGACY_SEK1_PHYSICS_RESISTOR_CIRCUITS_ID = "53801090-6ef2-4e61-8106-6833a348f701";
    private static final String LEGACY_SEK1_PHYSICS_ELECTRICAL_SAFETY_ID = "669d4da4-762a-40db-98b9-dab127d86346";
    private static final String LEGACY_SEK1_PHYSICS_OPTICS_CLUSTER_ID = "eb6bf9d8-943c-42af-85fc-1b3d08985b6f";
    private static final String LEGACY_SEK1_PHYSICS_LENSES_ID = "171b3ec7-1039-45a6-8dcb-be560f1517e5";
    private static final String LEGACY_SEK1_PHYSICS_VISION_ID = "1402524f-0965-44f1-b560-7a29690ae8a8";
    private static final String LEGACY_SEK1_PHYSICS_INSTRUMENTS_ID = "8690086e-dfbf-4dd1-a996-e34b7e7db712";
    private static final String LEGACY_MATH_FUNCTION_CONCEPT_ID = "0903db01-4377-4a79-8f29-aceffea68f24";
    private static final String LEGACY_MATH_READ_VALUES_ID = "cd46ce36-883e-4e68-8bfd-2bbdc0ecce9d";
    private static final String LEGACY_SEK1_LINEAR_FUNCTIONS_ID = "faafd111-21a1-4f67-945a-6bff60b3e19b";
    private static final String CANONICAL_PHYSICS_SEK1_MECHANICS_CLUSTER_ID = "9645f0d8-43a3-5f29-873c-daa5ace638db";
    private static final String CANONICAL_PHYSICS_SEK1_DENSITY_ID = "e41356c1-968b-435a-af25-b663f080ae5a";
    private static final String CANONICAL_PHYSICS_SEK1_MOTION_ID = "ae67bcf1-f3ee-50d6-9a12-25a159dff659";
    private static final String CANONICAL_PHYSICS_SEK1_FORCES_ID = "5ea765ac-c279-551a-8a94-a07da2381e5b";
    private static final String CANONICAL_PHYSICS_SEK1_FORCE_PROPERTIES_ID = "10bb8262-fb0f-40cf-94ef-408420ec7cf2";
    private static final String CANONICAL_PHYSICS_SEK1_FRICTION_ID = "581c0766-b84b-54cb-b8b6-375310329a41";
    private static final String CANONICAL_PHYSICS_SEK1_WORK_ENERGY_CLUSTER_ID = "cd4fe3f9-a04d-4dcc-9c0b-db214daa72ba";
    private static final String CANONICAL_PHYSICS_SEK1_ENERGY_ID = "722857cf-f327-5740-8151-64eb92195ec8";
    private static final String CANONICAL_PHYSICS_SEK1_HEAT_ENERGY_ID = "eeba6bf8-a2b9-4d7d-a1d6-67286c923cef";
    private static final String CANONICAL_PHYSICS_SEK1_ELECTRICAL_ENERGY_ID = "cbb26ed2-6979-46f6-a4ae-128f5c5d9d76";
    private static final String CANONICAL_PHYSICS_SEK1_LIGHT_CLUSTER_ID = "051cedc5-d380-4716-9751-b18f2e67a912";
    private static final String CANONICAL_PHYSICS_SEK1_LIGHT_PROPAGATION_ID = "dd7cdcea-0950-461b-96ac-ce49989fca47";
    private static final String CANONICAL_PHYSICS_SEK1_RAY_MODEL_ID = "79cb1695-f985-443a-b93e-27b57ab474b7";
    private static final String CANONICAL_PHYSICS_SEK1_REFLECTION_ID = "cca06d84-28fe-4b80-9bcd-968dda026e0e";
    private static final String CANONICAL_PHYSICS_SEK1_ELECTRICITY_CLUSTER_ID = "4924d83e-5e4b-4819-9d70-86cda3496195";
    private static final String CANONICAL_PHYSICS_SEK1_MAGNETS_ID = "f778a659-1467-4aa7-97b2-bed78c530634";
    private static final String CANONICAL_PHYSICS_SEK1_SIMPLE_CIRCUITS_ID = "75bdf5ca-cda4-4658-9ec7-84c77b3759db";
    private static final String CANONICAL_PHYSICS_SEK1_CURRENT_EFFECTS_ID = "a5f652cc-e091-4c90-bec2-c357ae54fcf1";
    private static final String CANONICAL_PHYSICS_SEK1_CURRENT_MEASUREMENT_ID = "f1a078ae-6262-4444-a4bc-a5ab275621cf";
    private static final String CANONICAL_PHYSICS_SEK1_VOLTAGE_CLUSTER_ID = "bbabac7c-9613-4c7e-877e-d7dc3df5300f";
    private static final String CANONICAL_PHYSICS_SEK1_STATIC_ELECTRICITY_ID = "32111497-d5ca-453e-906d-d352f885b126";
    private static final String CANONICAL_PHYSICS_SEK1_VOLTAGE_CURRENT_ID = "53196a71-9dbd-4835-b2f9-ff21b8a8962c";
    private static final String CANONICAL_PHYSICS_SEK1_RESISTOR_CIRCUITS_ID = "01bebdfc-5819-4610-a03e-ea5e794fc954";
    private static final String CANONICAL_PHYSICS_SEK1_ELECTRICAL_SAFETY_ID = "1911920e-b099-4310-82f2-b47f51a78b33";
    private static final String CANONICAL_PHYSICS_SEK1_OPTICS_CLUSTER_ID = "84b1bc70-dadf-449b-a8d4-8bcee1da1fea";
    private static final String CANONICAL_PHYSICS_SEK1_LENSES_ID = "078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5";
    private static final String CANONICAL_PHYSICS_SEK1_VISION_ID = "90e1e6cf-4092-41d6-81f7-5206f9d68f84";
    private static final String CANONICAL_PHYSICS_SEK1_INSTRUMENTS_ID = "6367d45e-919e-4c19-bcd9-7770a2d51139";
    private static final String CANONICAL_PHYSICS_DIAGRAMS_ID = "ce431132-dfc4-42c2-aff6-bd72035190f8";
    private static final String CANONICAL_PHYSICS_UNIFORM_MOTION_ID = "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd";
    private static final String CANONICAL_PHYSICS_FREE_FALL_ID = "230345f3-c360-4963-b390-ab94e3e2c864";
    private static final String CANONICAL_PHYSICS_MOTION_MODELING_ID = "d6dc0e02-831d-4894-a61a-852bcc74f147";
    private static final String CANONICAL_PHYSICS_SUPERPOSITION_ID = "68c90ba6-c438-463c-9a53-cf61062d416a";
    private static final String CANONICAL_PHYSICS_HORIZONTAL_THROW_ID = "89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2";
    private static final String CANONICAL_PHYSICS_FIRST_LAW_ID = "31a2ef52-114b-4d2c-a720-6ef5a390b6dc";
    private static final String CANONICAL_PHYSICS_F_EQUALS_M_A_ID = "5f289cdc-fda1-4058-b44f-041ba1398e79";
    private static final String CANONICAL_PHYSICS_WORK_AS_ENERGY_CHANGE_ID = "c1c71daa-042b-4f4c-8c31-0ac366f5149e";
    private static final String CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID = "91c49019-ea51-4ce5-a919-c91c45b25e83";
    private static final String CANONICAL_PHYSICS_SIMPLE_COLLISIONS_ID = "2eecd0e2-a7ca-4568-9b12-3d47706c65fb";
    private static final String CANONICAL_PHYSICS_INELASTIC_COLLISIONS_ID = "0da13365-02c2-44f1-8a81-d524ca0ac3ae";

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
        learner.setSelectedCurriculum(CANONICAL_PHYSICS_PILOT_ID);
        learner.setLearningState(LearningState.FRONTIER);
        learner.setPersonalCurriculum("{}");

        when(learnerRepository.findById(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.existsById(LEARNER_ID)).thenReturn(true);
        when(learnerRepository.save(org.mockito.ArgumentMatchers.any(Learner.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_CLUSTER_ID)));
        when(masteryRepository.save(org.mockito.ArgumentMatchers.any(Mastery.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void getMasteryProjectsExactLegacyPhysicsMasteryIntoCanonicalPhysicsPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_DIAGRAMS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_DIAGRAMS_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_PHYSICS_DIAGRAMS_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsMasteryIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_DENSITY_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_MOTION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_FORCES_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_FORCE_PROPERTIES_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_FRICTION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_ENERGY_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_MOTION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_DENSITY_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_FORCES_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_FORCE_PROPERTIES_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_FRICTION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_ENERGY_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsMechanicsClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_MECHANICS_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_MECHANICS_CLUSTER_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsWorkEnergyClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_WORK_ENERGY_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_WORK_ENERGY_CLUSTER_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsHeatAndElectricalEnergyIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_HEAT_ENERGY_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_ELECTRICAL_ENERGY_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_HEAT_ENERGY_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_ELECTRICAL_ENERGY_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsLightMasteryIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_LIGHT_PROPAGATION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_RAY_MODEL_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_REFLECTION_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_LIGHT_PROPAGATION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_RAY_MODEL_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_REFLECTION_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsLightClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_LIGHT_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_LIGHT_CLUSTER_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsElectricityMasteryIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_MAGNETS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_SIMPLE_CIRCUITS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_CURRENT_EFFECTS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_CURRENT_MEASUREMENT_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_MAGNETS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_SIMPLE_CIRCUITS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_CURRENT_EFFECTS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_CURRENT_MEASUREMENT_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsElectricityClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_ELECTRICITY_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_ELECTRICITY_CLUSTER_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsVoltageMasteryIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_STATIC_ELECTRICITY_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_VOLTAGE_CURRENT_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_RESISTOR_CIRCUITS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_ELECTRICAL_SAFETY_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_STATIC_ELECTRICITY_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_VOLTAGE_CURRENT_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_RESISTOR_CIRCUITS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_ELECTRICAL_SAFETY_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsVoltageClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_VOLTAGE_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_VOLTAGE_CLUSTER_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsOpticsMasteryIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_LENSES_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_VISION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_INSTRUMENTS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_LENSES_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_VISION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_INSTRUMENTS_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsOpticsClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_OPTICS_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_OPTICS_CLUSTER_ID, 1.0);
    }

    @Test
    void canonicalGymnasiumRootPropagatesBundeslandFilterIntoPhysicsChildLandscape() {
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-BY"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": false, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "GK"}
                }
                """);
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_ROOT_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_ROOT_ID, CANONICAL_PHYSICS_CLUSTER_ID, CANONICAL_PHYSICS_E2_CLUSTER_ID,
                        CANONICAL_PHYSICS_E3_CLUSTER_ID, "5c44b9ba-9b05-4774-95d5-073230d3fc4f");
    }

    @Test
    void projectedSek1PhysicsMasteryUnlocksCanonicalPhysicsDiagramAnalysis() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_PHYSICS_WHY_ID, 1.0),
                        new Mastery(learner, LEGACY_MATH_FUNCTION_CONCEPT_ID, 1.0),
                        new Mastery(learner, LEGACY_MATH_READ_VALUES_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_MOTION_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_DIAGRAMS_ID)
                .doesNotContain(LEGACY_SEK1_PHYSICS_MOTION_ID);
    }

    @Test
    void getMasteryProjectsExactBavariaPhysicsMasteryIntoCanonicalPhysicsPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_DIAGRAMS_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactBavariaPhysicsEnergyConservationIntoCanonicalPhysicsPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_PHYSICS_ENERGY_CONSERVATION_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_BAYERN_PHYSICS_ENERGY_CONSERVATION_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactBavariaPhysicsCollisionsIntoCanonicalPhysicsPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_PHYSICS_COLLISIONS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SIMPLE_COLLISIONS_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_BAYERN_PHYSICS_COLLISIONS_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactBavariaHorizontalThrowAnalysisIntoCanonicalPhysicsPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactBavariaMotionModelingIntoCanonicalPhysicsPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_MOTION_MODELING_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacyPhysicsHorizontalThrowIntoCanonicalPhysicsPilotGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_HORIZONTAL_THROW_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_PHYSICS_HORIZONTAL_THROW_ID, 1.0);
    }

    @Test
    void getMasteryKeepsHigherStoredCanonicalPhysicsMasteryThanLowerLegacyProjection() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        masteryEntry(LEGACY_PHYSICS_DIAGRAMS_ID, 0.5, Instant.parse("2026-03-10T08:00:00Z")),
                        masteryEntry(CANONICAL_PHYSICS_DIAGRAMS_ID, 1.0, Instant.parse("2026-03-11T08:00:00Z"))));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_PHYSICS_DIAGRAMS_ID, 0.5);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_DIAGRAMS_ID, 1.0);
    }

    @Test
    void getMasteryWithTimestampsUsesNewerLegacyPhysicsTimestampForEqualExactProjection() {
        Instant canonicalTs = Instant.parse("2026-03-10T08:00:00Z");
        Instant legacyTs = Instant.parse("2026-03-11T08:00:00Z");
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        masteryEntry(CANONICAL_PHYSICS_DIAGRAMS_ID, 1.0, canonicalTs),
                        masteryEntry(LEGACY_PHYSICS_DIAGRAMS_ID, 1.0, legacyTs)));

        Map<String, MasteryEntryDTO> mastery = learnerService.getMasteryWithTimestamps(LEARNER_ID);

        assertThat(mastery)
                .containsEntry(CANONICAL_PHYSICS_DIAGRAMS_ID, new MasteryEntryDTO(1.0, legacyTs))
                .containsEntry(LEGACY_PHYSICS_DIAGRAMS_ID, new MasteryEntryDTO(1.0, legacyTs));
    }

    @Test
    void getMasteryKeepsHigherStoredCanonicalPhysicsE2MasteryThanLowerLegacyProjection() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        masteryEntry(LEGACY_PHYSICS_ENERGY_CONSERVATION_ID, 0.5, Instant.parse("2026-03-10T08:00:00Z")),
                        masteryEntry(CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID, 1.0, Instant.parse("2026-03-11T08:00:00Z"))));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_PHYSICS_ENERGY_CONSERVATION_ID, 0.5);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID, 1.0);
    }

    @Test
    void getMasteryKeepsHigherStoredCanonicalPhysicsE3MasteryThanLowerLegacyProjection() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        masteryEntry(LEGACY_PHYSICS_HORIZONTAL_THROW_ID, 0.5, Instant.parse("2026-03-10T08:00:00Z")),
                        masteryEntry(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID, 1.0, Instant.parse("2026-03-11T08:00:00Z"))));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_PHYSICS_HORIZONTAL_THROW_ID, 0.5);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID, 1.0);
    }

    @Test
    void getMasteryWithTimestampsUsesNewerLegacyPhysicsE2TimestampForEqualExactProjection() {
        Instant canonicalTs = Instant.parse("2026-03-10T08:00:00Z");
        Instant legacyTs = Instant.parse("2026-03-11T08:00:00Z");
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        masteryEntry(CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID, 1.0, canonicalTs),
                        masteryEntry(LEGACY_PHYSICS_ENERGY_CONSERVATION_ID, 1.0, legacyTs)));

        Map<String, MasteryEntryDTO> mastery = learnerService.getMasteryWithTimestamps(LEARNER_ID);

        assertThat(mastery)
                .containsEntry(CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID, new MasteryEntryDTO(1.0, legacyTs))
                .containsEntry(LEGACY_PHYSICS_ENERGY_CONSERVATION_ID, new MasteryEntryDTO(1.0, legacyTs));
    }

    @Test
    void getMasteryWithTimestampsUsesNewerLegacyPhysicsE3TimestampForEqualExactProjection() {
        Instant canonicalTs = Instant.parse("2026-03-10T08:00:00Z");
        Instant legacyTs = Instant.parse("2026-03-11T08:00:00Z");
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        masteryEntry(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID, 1.0, canonicalTs),
                        masteryEntry(LEGACY_PHYSICS_HORIZONTAL_THROW_ID, 1.0, legacyTs)));

        Map<String, MasteryEntryDTO> mastery = learnerService.getMasteryWithTimestamps(LEARNER_ID);

        assertThat(mastery)
                .containsEntry(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID, new MasteryEntryDTO(1.0, legacyTs))
                .containsEntry(LEGACY_PHYSICS_HORIZONTAL_THROW_ID, new MasteryEntryDTO(1.0, legacyTs));
    }

    @Test
    void getPlannedGoalsProjectsLegacyPhysicsClusterForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_PHYSICS_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyPhysicsE2ClusterForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_PHYSICS_E2_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_E2_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyPhysicsConservationClusterForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyPhysicsE3ClusterForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_PHYSICS_E3_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_E3_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyPhysicsHorizontalThrowClusterForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_PHYSICS_HORIZONTAL_THROW_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_HORIZONTAL_THROW_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyBavariaPhysicsMotionClusterForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyBavariaPhysicsEnergyClusterForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly("feb70838-931c-4b45-b9a9-930605d93efa");
    }

    @Test
    void getPlannedGoalsProjectsLegacyBavariaPhysicsMomentumClusterForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly("912febf0-754a-4409-9f8b-7d66810edc08");
    }

    @Test
    void getPlannedGoalsProjectsLegacyBavariaHorizontalThrowHypothesesGoalForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_HORIZONTAL_THROW_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyBavariaHorizontalThrowAnalysisGoalForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyBavariaMotionModelingGoalForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_MOTION_MODELING_ID);
    }

    @Test
    void getPlannedGoalsCollapsesMixedHessenAndBavariaMotionScopesIntoCanonicalMotionCluster() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new PlannedGoal(learner, LEGACY_PHYSICS_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsCollapsesMixedHessenAndBavariaE3ScopesIntoCanonicalE3Cluster() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new PlannedGoal(learner, LEGACY_PHYSICS_E3_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_E3_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsCollapsesMixedHessenAndBavariaE2ScopesIntoCanonicalE2Cluster() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new PlannedGoal(learner, LEGACY_PHYSICS_E2_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_E2_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsCollapsesMixedConservationScopesIntoCanonicalConservationCluster() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new PlannedGoal(learner, LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID);
    }

    @Test
    void getPlannedGoalsProjectsLegacyBavariaPhysicsCollisionGoalForCanonicalView() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_COLLISIONS_ID)));

        List<String> plannedGoals = learnerService.getPlannedGoals(LEARNER_ID);

        assertThat(plannedGoals).containsExactly(CANONICAL_PHYSICS_SIMPLE_COLLISIONS_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierBlocksDiagramGoalUntilMathPrerequisitesAreMastered() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_WHY_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .doesNotContain(CANONICAL_PHYSICS_DIAGRAMS_ID);
    }

    @Test
    void canonicalPhysicsPilotLearnerStateUnlocksDiagramGoalFromProjectedLegacyMathAndPhysicsMastery() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_PHYSICS_WHY_ID, 1.0),
                        new Mastery(learner, LEGACY_MATH_FUNCTION_CONCEPT_ID, 1.0),
                        new Mastery(learner, LEGACY_MATH_READ_VALUES_ID, 1.0)));
        learner.setPersonalCurriculum(CANONICAL_PHYSICS_GK_PERSONAL_CONFIG);

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.curriculum()).isNotNull();
        assertThat(state.curriculum().getCurriculumId()).isEqualTo(CANONICAL_PHYSICS_PILOT_ID);
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(state.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_DIAGRAMS_ID)
                .doesNotContain(LEGACY_PHYSICS_WHY_ID, LEGACY_MATH_FUNCTION_CONCEPT_ID, LEGACY_MATH_READ_VALUES_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksUniformMotionFromProjectedLegacyPhysicsAndMathMastery() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_PHYSICS_DIAGRAMS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_LINEAR_FUNCTIONS_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_UNIFORM_MOTION_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksLensImagingFromProjectedLegacyRayModelMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_OPTICS_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_RAY_MODEL_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SEK1_LENSES_ID)
                .doesNotContain(CANONICAL_PHYSICS_SEK1_VISION_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksCurrentEffectsFromProjectedLegacySimpleCircuitMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_ELECTRICITY_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_SIMPLE_CIRCUITS_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SEK1_CURRENT_EFFECTS_ID, CANONICAL_PHYSICS_SEK1_CURRENT_MEASUREMENT_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksVoltageCurrentRelationFromProjectedLegacyElectricityAndStaticMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_VOLTAGE_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_ELECTRICITY_CLUSTER_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_STATIC_ELECTRICITY_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SEK1_VOLTAGE_CURRENT_ID)
                .doesNotContain(CANONICAL_PHYSICS_SEK1_RESISTOR_CIRCUITS_ID);
    }

    @Test
    void canonicalPhysicsPilotElectricalEnergyGoalDependsOnReviewedVoltageBridge() {
        LearningLandscape landscape = landscapeService.getById(CANONICAL_PHYSICS_PILOT_ID);
        LearningGoal heatGoal = landscape.getGoals().stream()
                .filter(goal -> CANONICAL_PHYSICS_SEK1_HEAT_ENERGY_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        LearningGoal electricalGoal = landscape.getGoals().stream()
                .filter(goal -> CANONICAL_PHYSICS_SEK1_ELECTRICAL_ENERGY_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(heatGoal.getRequires()).containsExactly(CANONICAL_PHYSICS_SEK1_ENERGY_ID);
        assertThat(electricalGoal.getRequires())
                .containsExactly(CANONICAL_PHYSICS_SEK1_ENERGY_ID, CANONICAL_PHYSICS_SEK1_VOLTAGE_CLUSTER_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksElectricalEnergyFromProjectedLegacyEnergyAndVoltageMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_WORK_ENERGY_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_FORCE_PROPERTIES_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_ENERGY_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_VOLTAGE_CLUSTER_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SEK1_ELECTRICAL_ENERGY_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksSuperpositionGoalFromProjectedLegacyFundamentalEquation() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_PHYSICS_E3_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SUPERPOSITION_ID)
                .doesNotContain(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksFirstLawFromProjectedLegacyAcceleratedMotion() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_NEWTON_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_ACCELERATED_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_FIRST_LAW_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksFirstLawFromProjectedLegacyE2Scope() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_PHYSICS_E2_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_ACCELERATED_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_FIRST_LAW_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksFundamentalEquationFromProjectedLegacyPhysicsAndMathMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_NEWTON_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_PHYSICS_ACCELERATED_ID, 1.0),
                        new Mastery(learner, LEGACY_PHYSICS_DIAGRAMS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_LINEAR_FUNCTIONS_ID, 1.0),
                        new Mastery(learner, "31b6e9ae-003a-474d-8055-e92f4fc3acc3", 1.0),
                        new Mastery(learner, "be89ee6a-d11d-4970-8c39-bb0c84edac56", 1.0),
                        new Mastery(learner, "ed0c5283-b1b2-4562-9115-7336fca7a8d4", 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_F_EQUALS_M_A_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksWorkGoalFromProjectedLegacyNewtonMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_WORK_AS_ENERGY_CHANGE_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksWorkGoalFromProjectedLegacyE2Scope() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_PHYSICS_E2_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_WORK_AS_ENERGY_CHANGE_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksInelasticCollisionsFromProjectedLegacyEnergyAndMomentumMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_PHYSICS_ENERGY_CONSERVATION_ID, 1.0),
                        new Mastery(learner, LEGACY_PHYSICS_MOMENTUM_CONSERVATION_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_INELASTIC_COLLISIONS_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksInelasticCollisionsFromProjectedBavariaEnergyAndMomentumMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_BAYERN_PHYSICS_ENERGY_CONSERVATION_ID, 1.0),
                        new Mastery(learner, LEGACY_BAYERN_PHYSICS_MOMENTUM_CONSERVATION_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_INELASTIC_COLLISIONS_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksSimpleCollisionGoalFromProjectedBavariaEnergyAndMomentumMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_BAYERN_PHYSICS_ENERGY_CONSERVATION_ID, 1.0),
                        new Mastery(learner, LEGACY_BAYERN_PHYSICS_MOMENTUM_CONSERVATION_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SIMPLE_COLLISIONS_ID);
    }

    @Test
    void canonicalPhysicsPilotLearnerStateProjectsLegacyActiveGoalToCanonicalGoal() {
        learner.setActiveGoalId(LEGACY_PHYSICS_DIAGRAMS_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.activeGoal()).isNotNull();
        assertThat(state.activeGoal().id()).isEqualTo(CANONICAL_PHYSICS_DIAGRAMS_ID);
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setMastery");
        assertThat(state.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .containsExactly(CANONICAL_PHYSICS_DIAGRAMS_ID);
    }

    @Test
    void canonicalPhysicsPilotLearnerStateProjectsLegacyE3ActiveGoalToCanonicalGoal() {
        learner.setActiveGoalId(LEGACY_PHYSICS_HORIZONTAL_THROW_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.activeGoal()).isNotNull();
        assertThat(state.activeGoal().id()).isEqualTo(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID);
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setMastery");
        assertThat(state.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .containsExactly(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID);
    }

    @Test
    void canonicalPhysicsPilotLearnerStateCollapsesMixedHessenAndBavariaMotionScopesIntoCanonicalMotionCluster() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new PlannedGoal(learner, LEGACY_PHYSICS_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.goals().planned())
                .extracting(FrontierGoal::id)
                .containsExactly(CANONICAL_PHYSICS_CLUSTER_ID);
    }

    @Test
    void canonicalPhysicsPilotLearnerStateCollapsesMixedHessenAndBavariaE3ScopesIntoCanonicalE3Cluster() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new PlannedGoal(learner, LEGACY_PHYSICS_E3_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.goals().planned())
                .extracting(FrontierGoal::id)
                .containsExactly(CANONICAL_PHYSICS_E3_CLUSTER_ID);
    }

    @Test
    void canonicalPhysicsPilotLearnerStateCollapsesMixedHessenAndBavariaE2ScopesIntoCanonicalE2Cluster() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new PlannedGoal(learner, LEGACY_PHYSICS_E2_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.goals().planned())
                .extracting(FrontierGoal::id)
                .containsExactly(CANONICAL_PHYSICS_E2_CLUSTER_ID);
    }

    @Test
    void canonicalPhysicsPilotLearnerStateCollapsesMixedConservationScopesIntoCanonicalConservationCluster() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new PlannedGoal(learner, LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID),
                        new PlannedGoal(learner, LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.goals().planned())
                .extracting(FrontierGoal::id)
                .containsExactly(CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID);
    }

    @Test
    void canonicalPhysicsPilotLearnerStateProjectsLegacyE2ActiveGoalToCanonicalGoal() {
        learner.setActiveGoalId(LEGACY_PHYSICS_ENERGY_CONSERVATION_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());

        UnifiedLearnerStateResponse state = learnerService.getLearnerState(LEARNER_ID);

        assertThat(state.activeGoal()).isNotNull();
        assertThat(state.activeGoal().id()).isEqualTo(CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID);
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setMastery");
        assertThat(state.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .containsExactly(CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID);
    }

    @Test
    void setMasteryUsesCanonicalPhysicsGoalKeyWhenLegacyActiveGoalIsMappedIntoCanonicalView() {
        learner.setActiveGoalId(LEGACY_PHYSICS_DIAGRAMS_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());
        when(masteryRepository.findById(new MasteryId(LEARNER_ID, CANONICAL_PHYSICS_DIAGRAMS_ID)))
                .thenReturn(Optional.empty());

        learnerService.setMastery(
                LEARNER_ID,
                new MasteryUpdateRequest(Map.of(CANONICAL_PHYSICS_DIAGRAMS_ID, 1.0), CANONICAL_PHYSICS_DIAGRAMS_ID));

        verify(masteryRepository).save(argThat(mastery ->
                mastery != null && CANONICAL_PHYSICS_DIAGRAMS_ID.equals(mastery.getGoalKey())));
    }

    @Test
    void setMasteryUsesCanonicalPhysicsE3GoalKeyWhenLegacyActiveGoalIsMappedIntoCanonicalView() {
        learner.setActiveGoalId(LEGACY_PHYSICS_HORIZONTAL_THROW_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());
        when(masteryRepository.findById(new MasteryId(LEARNER_ID, CANONICAL_PHYSICS_HORIZONTAL_THROW_ID)))
                .thenReturn(Optional.empty());

        learnerService.setMastery(
                LEARNER_ID,
                new MasteryUpdateRequest(
                        Map.of(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID, 1.0),
                        CANONICAL_PHYSICS_HORIZONTAL_THROW_ID));

        verify(masteryRepository).save(argThat(mastery ->
                mastery != null && CANONICAL_PHYSICS_HORIZONTAL_THROW_ID.equals(mastery.getGoalKey())));
    }

    @Test
    void setMasteryUsesCanonicalPhysicsE2GoalKeyWhenLegacyActiveGoalIsMappedIntoCanonicalView() {
        learner.setActiveGoalId(LEGACY_PHYSICS_ENERGY_CONSERVATION_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID)).thenReturn(List.of());
        when(masteryRepository.findById(new MasteryId(LEARNER_ID, CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID)))
                .thenReturn(Optional.empty());

        learnerService.setMastery(
                LEARNER_ID,
                new MasteryUpdateRequest(
                        Map.of(CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID, 1.0),
                        CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID));

        verify(masteryRepository).save(argThat(mastery ->
                mastery != null && CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID.equals(mastery.getGoalKey())));
    }

    @Test
    void legacyPhysicsCurriculumReadDoesNotProjectCanonicalPhysicsGoalsIntoLegacyView() {
        learner.setSelectedCurriculum(HESSEN_PHYSICS_LANDSCAPE_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_DIAGRAMS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_PHYSICS_DIAGRAMS_ID, 1.0);
        assertThat(mastery).doesNotContainKey(CANONICAL_PHYSICS_DIAGRAMS_ID);
    }

    @Test
    void legacyPhysicsCurriculumReadDoesNotProjectCanonicalPhysicsE3GoalsIntoLegacyView() {
        learner.setSelectedCurriculum(HESSEN_PHYSICS_LANDSCAPE_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_HORIZONTAL_THROW_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_PHYSICS_HORIZONTAL_THROW_ID, 1.0);
        assertThat(mastery).doesNotContainKey(CANONICAL_PHYSICS_HORIZONTAL_THROW_ID);
    }

    @Test
    void legacyPhysicsCurriculumReadDoesNotProjectCanonicalPhysicsE2GoalsIntoLegacyView() {
        learner.setSelectedCurriculum(HESSEN_PHYSICS_LANDSCAPE_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_PHYSICS_ENERGY_CONSERVATION_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_PHYSICS_ENERGY_CONSERVATION_ID, 1.0);
        assertThat(mastery).doesNotContainKey(CANONICAL_PHYSICS_ENERGY_CONSERVATION_ID);
    }

    @Test
    void bavariaPhysicsCurriculumReadDoesNotProjectCanonicalPhysicsGoalsIntoLegacyView() {
        learner.setSelectedCurriculum(BAYERN_PHYSICS_LANDSCAPE_ID);
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID, 1.0);
        assertThat(mastery).doesNotContainKey(CANONICAL_PHYSICS_DIAGRAMS_ID);
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
