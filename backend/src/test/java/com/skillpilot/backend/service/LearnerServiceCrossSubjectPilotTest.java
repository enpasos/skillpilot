package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
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
import com.skillpilot.backend.landscape.SkillLandscape;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import java.lang.reflect.Method;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.SimpleTransactionStatus;

class LearnerServiceCrossSubjectPilotTest {

    private static final String LEARNER_ID = "cross-subject-pilot-learner";
    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CANONICAL_PHYSICS_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String CANONICAL_PHYSICS_ROOT_ID = "bf980fff-b62b-4ea4-a20d-31681a7ad785";
    private static final String CANONICAL_PHYSICS_WHY_ID = "5c44b9ba-9b05-4774-95d5-073230d3fc4f";
    private static final String CANONICAL_PHYSICS_GK_PERSONAL_CONFIG = """
            {
              "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {
                "selected": true,
                "filterId": "GK",
                "stage": "CrossStage"
              }
            }
            """;
    private static final String HESSEN_PHYSICS_LANDSCAPE_ID = "24f2ca0f-b94a-444e-bb70-677cb6f85c02";
    private static final String BAYERN_PHYSICS_LANDSCAPE_ID = "42c2f7e3-91b4-5de8-bef0-d563440e9d52";
    private static final String CANONICAL_PHYSICS_CLUSTER_ID = "65ddd780-0323-45d1-8f94-5e31bf28da23";
    private static final String CANONICAL_PHYSICS_E3_CLUSTER_ID = "287739a3-6143-55d0-abe7-1a08889e9b49";
    private static final String CANONICAL_PHYSICS_HORIZONTAL_THROW_CLUSTER_ID = "82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3";
    private static final String CANONICAL_PHYSICS_E2_CLUSTER_ID = "9340e894-bb0d-45a4-91f2-b90a63ad50a8";
    private static final String CANONICAL_PHYSICS_STANDING_WAVES_ID = "d5772db3-120c-5c37-ab46-2336d02236b0";
    private static final String CANONICAL_PHYSICS_INTERFERENCE_PATTERNS_ID = "2c6af966-7703-4176-a117-5ddb8295bedf";
    private static final String CANONICAL_PHYSICS_DOUBLE_SLIT_INTERFERENCE_ID = "6270e558-d657-5363-a6b2-e49a032a453b";
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
    private static final String LEGACY_SEK1_PHYSICS_HEAT_CLUSTER_ID = "16100fe0-3569-4290-94df-e14c472cbd6e";
    private static final String LEGACY_SEK1_PHYSICS_TEMPERATURE_ID = "f9ae3721-ff6d-40fe-94e0-3ed12264d044";
    private static final String LEGACY_SEK1_PHYSICS_EXPANSION_ID = "6866bdd0-1015-4a9d-9be3-91535d66cf97";
    private static final String LEGACY_SEK1_PHYSICS_PARTICLE_MODEL_ID = "15e2d789-f003-4934-a73c-e01d3f22e7f1";
    private static final String LEGACY_SEK1_PHYSICS_HEAT_TRANSFER_ID = "46717be6-c3b6-40d4-9f21-1bac1a1b05e7";
    private static final String LEGACY_SEK1_PHYSICS_PRESSURE_CLUSTER_ID = "bdfe02d7-0792-454b-8a00-684c8f4ac11d";
    private static final String LEGACY_SEK1_PHYSICS_PRESSURE_ID = "6c0b16ef-94d3-417b-8ba8-0da48aa2e989";
    private static final String LEGACY_SEK1_PHYSICS_PRESSURE_TEMPERATURE_ID = "dffc852e-d7a3-42b9-968e-19575a52bd1e";
    private static final String LEGACY_SEK1_PHYSICS_BUOYANCY_ID = "f6f2eaca-e635-402b-ba7a-5bac7de925e4";
    private static final String LEGACY_SEK1_PHYSICS_FLIGHT_ID = "ddb0a146-de79-44ce-832a-81295f7c4b8d";
    private static final String LEGACY_SEK1_PHYSICS_ACOUSTICS_CLUSTER_ID = "7d8f00d0-311a-42a3-a5ad-bb9904ebecc8";
    private static final String LEGACY_SEK1_PHYSICS_SOUND_SOURCES_ID = "e5e63e4e-6b2c-4474-b6d7-3f0fde2834fb";
    private static final String LEGACY_SEK1_PHYSICS_SOUND_PROPAGATION_ID = "4e05720e-2009-420f-a2d3-5c2d3489e809";
    private static final String LEGACY_SEK1_PHYSICS_SOUND_CHARACTERIZATION_ID = "2b396054-8508-4f4d-80ef-2c89cc64ec7f";
    private static final String LEGACY_SEK1_PHYSICS_HEARING_ID = "28dfd9ce-59b3-4d32-8d28-f7dd22cb08c4";
    private static final String LEGACY_SEK1_PHYSICS_SOUND_MUSIC_ID = "9e98a602-fddd-4aad-b55a-cff4900097e4";
    private static final String LEGACY_SEK1_PHYSICS_COLORS_CLUSTER_ID = "cc82aa80-b71d-46b8-8ebe-cee49531f907";
    private static final String LEGACY_SEK1_PHYSICS_COLOR_ORIGIN_ID = "39fd7151-c6ee-4d60-84e3-e762d3cac33e";
    private static final String LEGACY_SEK1_PHYSICS_COLOR_MIXING_ID = "503f87c1-9e30-4731-8753-6a382f0ce31d";
    private static final String LEGACY_SEK1_PHYSICS_COLOR_PERCEPTION_ID = "27a7deb7-f195-4a65-a064-74d170f181fc";
    private static final String LEGACY_SEK1_PHYSICS_COLOR_TECH_ID = "2ac88d02-ef92-4968-9df3-e4c22e7e4749";
    private static final String LEGACY_SEK1_PHYSICS_RADIOACTIVITY_CLUSTER_ID = "facfd62d-9240-47bf-b2a5-919ada412987";
    private static final String LEGACY_SEK1_PHYSICS_ATOM_ID = "f882cc85-6225-4f63-98f7-2349d2c7385c";
    private static final String LEGACY_SEK1_PHYSICS_RADIATION_ID = "24350b45-cd48-4c91-b0c6-71480fa1681f";
    private static final String LEGACY_SEK1_PHYSICS_RADIATION_APPLICATIONS_ID = "89e717eb-c36a-4945-872c-5da7b1292b5c";
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
    private static final String CANONICAL_MATH_FUNCTION_CONCEPT_ID = "09f47964-2cd0-410e-93ee-9632b582fc91";
    private static final String CANONICAL_MATH_READ_VALUES_ID = "a8c42ee9-2898-4247-819f-c235032ac78a";
    private static final String LEGACY_SEK1_LINEAR_FUNCTIONS_ID = "faafd111-21a1-4f67-945a-6bff60b3e19b";
    private static final String CANONICAL_PHYSICS_SEK1_MECHANICS_CLUSTER_ID = "9645f0d8-43a3-5f29-873c-daa5ace638db";
    private static final String CANONICAL_PHYSICS_SEK1_DENSITY_ID = "e41356c1-968b-435a-af25-b663f080ae5a";
    private static final String CANONICAL_PHYSICS_SEK1_MASS_MEASUREMENT_ID = "af0e2efb-f634-5f2d-abea-b2e1a67a2894";
    private static final String CANONICAL_PHYSICS_SEK1_VOLUME_CLUSTER_ID = "7c996528-5fae-5353-b8fb-d59382e225c6";
    private static final String CANONICAL_PHYSICS_SEK1_DENSITY_DETERMINATION_ID = "c2d6bdf1-8077-50fb-a8b5-2f0b7e3493f0";
    private static final String CANONICAL_PHYSICS_SEK1_MOTION_ID = "ae67bcf1-f3ee-50d6-9a12-25a159dff659";
    private static final String CANONICAL_PHYSICS_SEK1_FORCES_ID = "5ea765ac-c279-551a-8a94-a07da2381e5b";
    private static final String CANONICAL_PHYSICS_SEK1_FORCE_PROPERTIES_ID = "10bb8262-fb0f-40cf-94ef-408420ec7cf2";
    private static final String CANONICAL_PHYSICS_SEK1_FORCE_EFFECTS_ID = "41d35667-0296-5f84-bc12-202ffc440be0";
    private static final String CANONICAL_PHYSICS_SEK1_FORCE_REPRESENTATION_ID = "67ffd0f0-a5ab-518f-8c45-4c0e7eb18390";
    private static final String CANONICAL_PHYSICS_SEK1_FORCE_ADDITION_ID = "45bbdf6b-6372-5b6a-b7e4-be15a0eb4b83";
    private static final String CANONICAL_PHYSICS_SEK1_FRICTION_ID = "581c0766-b84b-54cb-b8b6-375310329a41";
    private static final String CANONICAL_PHYSICS_SEK1_WORK_ENERGY_CLUSTER_ID = "cd4fe3f9-a04d-4dcc-9c0b-db214daa72ba";
    private static final String CANONICAL_PHYSICS_SEK1_ENERGY_ID = "722857cf-f327-5740-8151-64eb92195ec8";
    private static final String CANONICAL_PHYSICS_SEK1_HEAT_ENERGY_ID = "eeba6bf8-a2b9-4d7d-a1d6-67286c923cef";
    private static final String CANONICAL_PHYSICS_SEK1_ELECTRICAL_ENERGY_ID = "cbb26ed2-6979-46f6-a4ae-128f5c5d9d76";
    private static final String CANONICAL_PHYSICS_SEK1_HEAT_CLUSTER_ID = "2d3d42ae-492b-4795-a22f-eeca03aaed38";
    private static final String CANONICAL_PHYSICS_SEK1_TEMPERATURE_ID = "940978fa-1f2d-4e54-9c28-081a6df9b76f";
    private static final String CANONICAL_PHYSICS_SEK1_EXPANSION_ID = "d27c8860-12a4-4d7d-9849-ccd8b7caca48";
    private static final String CANONICAL_PHYSICS_SEK1_THERMOMETER_MEASUREMENT_ID = "51de4fd9-6827-5b3d-b2ca-5e27ba961a7f";
    private static final String CANONICAL_PHYSICS_SEK1_HEATING_COOLING_ID = "b60f63b6-e70b-5557-9f54-86d42fa80325";
    private static final String CANONICAL_PHYSICS_SEK1_PARTICLE_MODEL_ID = "9ac4973a-21d5-48a5-90b4-eb90e10391ae";
    private static final String CANONICAL_PHYSICS_SEK1_HEAT_TRANSFER_ID = "fbe0faae-7fba-482b-888e-341f926770f3";
    private static final String CANONICAL_PHYSICS_SEK1_PRESSURE_CLUSTER_ID = "84096c02-0767-4725-8956-37ce7e4b9bbf";
    private static final String CANONICAL_PHYSICS_SEK1_PRESSURE_ID = "5308de76-79f0-44f4-8cb7-fc9de4772217";
    private static final String CANONICAL_PHYSICS_SEK1_PRESSURE_TEMPERATURE_ID = "310b4f62-e261-46be-bb1b-1f125fc1699a";
    private static final String CANONICAL_PHYSICS_SEK1_BUOYANCY_ID = "e11b2ee9-e528-4857-9ecd-59bd460fba81";
    private static final String CANONICAL_PHYSICS_SEK1_FLIGHT_ID = "24b4686a-e8a6-4583-8952-33e6f653c2a3";
    private static final String CANONICAL_PHYSICS_SEK1_ACOUSTICS_CLUSTER_ID = "41fd5575-b1a6-40e7-8ea2-66b75a597a79";
    private static final String CANONICAL_PHYSICS_SEK1_SOUND_SOURCES_ID = "c1006f55-0406-48cc-92d4-0d8345897cf4";
    private static final String CANONICAL_PHYSICS_SEK1_SOUND_PROPAGATION_ID = "3c82510a-1f12-4eaa-81c2-8599437a5b85";
    private static final String CANONICAL_PHYSICS_SEK1_SOUND_SPEED_MEDIA_ID = "a24c41ce-68c5-56a7-8235-ef9a7dba7042";
    private static final String CANONICAL_PHYSICS_SEK1_SOUND_CHARACTERIZATION_ID = "10aad90e-a1db-42b6-8d1e-1d856e14b47d";
    private static final String CANONICAL_PHYSICS_SEK1_HEARING_ID = "3e33813d-db75-4571-8345-3845b02b956d";
    private static final String CANONICAL_PHYSICS_SEK1_HEARING_PROCESS_ID = "2a6ad2c6-3e1b-57a9-82a1-e6620a532f5c";
    private static final String CANONICAL_PHYSICS_SEK1_NOISE_EXPOSURE_ID = "da0837c7-95a7-5a6a-81db-f33cb7f42d85";
    private static final String CANONICAL_PHYSICS_SEK1_SOUND_MUSIC_ID = "e62e48bc-2387-4b2b-8d6f-7a06c8e7580e";
    private static final String CANONICAL_PHYSICS_SEK1_COLORS_CLUSTER_ID = "48fb4a0b-62a0-4c8f-9792-3aeef6316885";
    private static final String CANONICAL_PHYSICS_SEK1_COLOR_ORIGIN_ID = "a4681378-ade4-4f20-bf77-fb020469510f";
    private static final String CANONICAL_PHYSICS_SEK1_COLOR_MIXING_ID = "cdab9fd1-5054-4a7e-8c9a-4474062ddd23";
    private static final String CANONICAL_PHYSICS_SEK1_COLOR_PERCEPTION_ID = "1c8dd14c-0fbf-44a5-85a3-25c8e3bd0075";
    private static final String CANONICAL_PHYSICS_SEK1_COLOR_TECH_ID = "cc9eea77-2a7f-4f35-ac22-6c230c0d6fa5";
    private static final String CANONICAL_PHYSICS_SEK1_RADIOACTIVITY_CLUSTER_ID = "8917c71a-bfcb-4003-971c-188a69446b60";
    private static final String CANONICAL_PHYSICS_SEK1_ATOM_ID = "2a6703e0-2a6f-4ebf-a5c6-7aa05a4b86eb";
    private static final String CANONICAL_PHYSICS_SEK1_RADIATION_CLUSTER_ID = "f6f646db-3544-49ed-8f55-67bc684e80ce";
    private static final String CANONICAL_PHYSICS_SEK1_RADIATION_TYPES_ID = "1593d95c-2aac-504c-8527-37cb61877da9";
    private static final String CANONICAL_PHYSICS_SEK1_RADIATION_DETECTION_ID = "25d91cc0-d84c-5522-86b5-fdff73264f08";
    private static final String CANONICAL_PHYSICS_SEK1_RADIATION_EFFECTS_ID = "861ba00a-e89c-5b3d-8c76-8ff0bcb0f1cd";
    private static final String CANONICAL_PHYSICS_SEK1_RADIATION_APPLICATIONS_ID = "979e0d0d-8933-4ace-814f-f28060ad280f";
    private static final String CANONICAL_PHYSICS_SEK1_LIGHT_CLUSTER_ID = "051cedc5-d380-4716-9751-b18f2e67a912";
    private static final String CANONICAL_PHYSICS_SEK1_LIGHT_PROPAGATION_ID = "dd7cdcea-0950-461b-96ac-ce49989fca47";
    private static final String CANONICAL_PHYSICS_SEK1_RAY_MODEL_ID = "79cb1695-f985-443a-b93e-27b57ab474b7";
    private static final String CANONICAL_PHYSICS_SEK1_REFLECTION_ID = "b57427c9-1af5-5daa-8c65-b84a4cc20785";
    private static final String CANONICAL_PHYSICS_SEK1_ELECTRICITY_CLUSTER_ID = "4924d83e-5e4b-4819-9d70-86cda3496195";
    private static final String CANONICAL_PHYSICS_SEK1_MAGNETS_ID = "f778a659-1467-4aa7-97b2-bed78c530634";
    private static final String CANONICAL_PHYSICS_SEK1_SIMPLE_CIRCUITS_ID = "75bdf5ca-cda4-4658-9ec7-84c77b3759db";
    private static final String CANONICAL_PHYSICS_SEK1_OPEN_CLOSED_CIRCUITS_ID = "7ca44ba0-b77e-52bf-8562-f67b44767172";
    private static final String CANONICAL_PHYSICS_SEK1_CIRCUIT_DIAGRAM_TRANSLATION_ID = "69f8f59c-b0c3-5b0b-82db-834a0e655736";
    private static final String CANONICAL_PHYSICS_SEK1_CONDUCTIVITY_ID = "baa2bf3c-798a-5ec3-a667-031bf062d96c";
    private static final String CANONICAL_PHYSICS_SEK1_CURRENT_EFFECTS_ID = "a5f652cc-e091-4c90-bec2-c357ae54fcf1";
    private static final String CANONICAL_PHYSICS_SEK1_CURRENT_MEASUREMENT_ID = "f1a078ae-6262-4444-a4bc-a5ab275621cf";
    private static final String CANONICAL_PHYSICS_SEK1_VOLTAGE_CLUSTER_ID = "bbabac7c-9613-4c7e-877e-d7dc3df5300f";
    private static final String CANONICAL_PHYSICS_SEK1_STATIC_ELECTRICITY_ID = "32111497-d5ca-453e-906d-d352f885b126";
    private static final String CANONICAL_PHYSICS_SEK1_CHARGE_SEPARATION_ID = "dc7dd287-6eac-574d-818d-65cfb23a2d94";
    private static final String CANONICAL_PHYSICS_SEK1_VOLTAGE_MEASUREMENT_ID = "28237994-9c24-5a06-82fe-be1f494768ba";
    private static final String CANONICAL_PHYSICS_SEK1_CAPACITOR_ID = "80dd0a2b-1422-5b00-89ff-ec4d0faa047e";
    private static final String CANONICAL_PHYSICS_SEK1_VOLTAGE_CURRENT_ID = "53196a71-9dbd-4835-b2f9-ff21b8a8962c";
    private static final String CANONICAL_PHYSICS_SEK1_RESISTOR_CIRCUITS_ID = "01bebdfc-5819-4610-a03e-ea5e794fc954";
    private static final String CANONICAL_PHYSICS_SEK1_KIRCHHOFF_BALANCES_ID = "8a84de16-2fde-58ec-827a-f803e2ce8564";
    private static final String CANONICAL_PHYSICS_SEK1_RESISTANCE_EFFECTS_ID = "8f833b36-4126-52db-b210-79fb0023c7d9";
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
    private static final String CANONICAL_PHYSICS_UPPER_SECONDARY_RADIATION_ID = "e5c08365-a0d3-592c-ad8e-d2c2c6e2b717";
    private static final String CANONICAL_PHYSICS_HARMONIC_WAVES_ID = "cb0ced6d-b7c1-5b7d-9922-8c394f6030e8";
    private static final String CANONICAL_PHYSICS_EM_SPECTRUM_ID = "4a7cbe83-b694-57d3-85ce-1eeca418daaf";

    private static ObjectMapper objectMapper;
    private static LandscapeService landscapeService;
    private static GoalMappingService goalMappingService;
    private static CompositionViewService compositionViewService;

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
        compositionViewService = new CompositionViewService(properties, objectMapper);
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
        learner.setAutoPilot(false);
        learner.setSelectedCurriculum(CANONICAL_PHYSICS_ID);
        learner.setLearningState(LearningState.FRONTIER);
        learner.setPersonalCurriculum("{}");

        when(learnerRepository.findById(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learnerRepository.findBySkillpilotIdForUpdate(LEARNER_ID)).thenReturn(Optional.of(learner));
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
    void getMasteryDoesNotProjectAmbiguousLegacySek1PhysicsMeasurementAndForceSplits() {
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
        assertThat(mastery).containsEntry(LEGACY_SEK1_PHYSICS_DENSITY_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_SEK1_PHYSICS_FORCE_PROPERTIES_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_FORCES_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_FRICTION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_ENERGY_ID, 1.0);
        assertThat(mastery).doesNotContainKeys(
                CANONICAL_PHYSICS_SEK1_DENSITY_ID,
                CANONICAL_PHYSICS_SEK1_MASS_MEASUREMENT_ID,
                CANONICAL_PHYSICS_SEK1_VOLUME_CLUSTER_ID,
                CANONICAL_PHYSICS_SEK1_DENSITY_DETERMINATION_ID,
                CANONICAL_PHYSICS_SEK1_FORCE_PROPERTIES_ID,
                CANONICAL_PHYSICS_SEK1_FORCE_EFFECTS_ID,
                CANONICAL_PHYSICS_SEK1_FORCE_REPRESENTATION_ID,
                CANONICAL_PHYSICS_SEK1_FORCE_ADDITION_ID);
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
    void getMasteryDoesNotProjectAmbiguousLegacySek1PhysicsThermalSplit() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_TEMPERATURE_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_EXPANSION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_PARTICLE_MODEL_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_HEAT_TRANSFER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_TEMPERATURE_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_SEK1_PHYSICS_EXPANSION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_PARTICLE_MODEL_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_HEAT_TRANSFER_ID, 1.0);
        assertThat(mastery).doesNotContainKeys(
                CANONICAL_PHYSICS_SEK1_EXPANSION_ID,
                CANONICAL_PHYSICS_SEK1_THERMOMETER_MEASUREMENT_ID,
                CANONICAL_PHYSICS_SEK1_HEATING_COOLING_ID);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsHeatClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_HEAT_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_HEAT_CLUSTER_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsPressureMasteryIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_PRESSURE_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_PRESSURE_TEMPERATURE_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_BUOYANCY_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_FLIGHT_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_PRESSURE_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_PRESSURE_TEMPERATURE_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_BUOYANCY_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_FLIGHT_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsPressureClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_PRESSURE_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_PRESSURE_CLUSTER_ID, 1.0);
    }

    @Test
    void getMasteryDoesNotProjectAmbiguousLegacySek1PhysicsAcousticsSplit() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_SOUND_SOURCES_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_SOUND_PROPAGATION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_SOUND_CHARACTERIZATION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_HEARING_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_SOUND_MUSIC_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_SEK1_PHYSICS_SOUND_PROPAGATION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_SOUND_SOURCES_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_SOUND_CHARACTERIZATION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_HEARING_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_SOUND_MUSIC_ID, 1.0);
        assertThat(mastery).doesNotContainKeys(
                CANONICAL_PHYSICS_SEK1_SOUND_PROPAGATION_ID,
                CANONICAL_PHYSICS_SEK1_SOUND_SPEED_MEDIA_ID,
                CANONICAL_PHYSICS_SEK1_HEARING_PROCESS_ID,
                CANONICAL_PHYSICS_SEK1_NOISE_EXPOSURE_ID);
    }

    @Test
    void getMasteryKeepsRetainedPhysicsHearingClusterMasteryWithoutFanningOutToChildren() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, CANONICAL_PHYSICS_SEK1_HEARING_ID, 0.75)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_HEARING_ID, 0.75);
        assertThat(mastery).doesNotContainKeys(
                CANONICAL_PHYSICS_SEK1_HEARING_PROCESS_ID,
                CANONICAL_PHYSICS_SEK1_NOISE_EXPOSURE_ID);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsAcousticsClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_ACOUSTICS_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_ACOUSTICS_CLUSTER_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsColorsMasteryIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_COLOR_ORIGIN_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_COLOR_MIXING_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_COLOR_PERCEPTION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_COLOR_TECH_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_COLOR_ORIGIN_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_COLOR_MIXING_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_COLOR_PERCEPTION_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_COLOR_TECH_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsColorsClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_COLORS_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_COLORS_CLUSTER_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactRadioactivityMappingsButDoesNotFanOutPartialLegacyRadiationMapping() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_ATOM_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_RADIATION_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_RADIATION_APPLICATIONS_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_ATOM_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_RADIATION_APPLICATIONS_ID, 1.0);
        assertThat(mastery).doesNotContainKeys(
                CANONICAL_PHYSICS_SEK1_RADIATION_CLUSTER_ID,
                CANONICAL_PHYSICS_SEK1_RADIATION_TYPES_ID,
                CANONICAL_PHYSICS_SEK1_RADIATION_DETECTION_ID,
                CANONICAL_PHYSICS_SEK1_RADIATION_EFFECTS_ID);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsRadioactivityClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_RADIOACTIVITY_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_RADIOACTIVITY_CLUSTER_ID, 1.0);
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
    void getMasteryProjectsExactLegacySek1PhysicsElectricityGoalsButNotTheAmbiguousCircuitSplit() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_MAGNETS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_SIMPLE_CIRCUITS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_CURRENT_EFFECTS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_CURRENT_MEASUREMENT_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_SEK1_PHYSICS_SIMPLE_CIRCUITS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_MAGNETS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_CURRENT_EFFECTS_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_CURRENT_MEASUREMENT_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_SIMPLE_CIRCUITS_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_OPEN_CLOSED_CIRCUITS_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_CIRCUIT_DIAGRAM_TRANSLATION_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_CONDUCTIVITY_ID, 1.0);
    }

    @Test
    void getMasteryProjectsExactLegacySek1PhysicsElectricityClusterIntoCanonicalPhysicsBridgeGoals() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_ELECTRICITY_CLUSTER_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_ELECTRICITY_CLUSTER_ID, 1.0);
    }

    @Test
    void getMasteryProjectsOnlyExactLegacySek1PhysicsElectricityMappings() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_STATIC_ELECTRICITY_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_VOLTAGE_CURRENT_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_RESISTOR_CIRCUITS_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_ELECTRICAL_SAFETY_ID, 1.0)));

        Map<String, Double> mastery = learnerService.getMastery(LEARNER_ID);

        assertThat(mastery).containsEntry(LEGACY_SEK1_PHYSICS_STATIC_ELECTRICITY_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_SEK1_PHYSICS_RESISTOR_CIRCUITS_ID, 1.0);
        assertThat(mastery).containsEntry(LEGACY_SEK1_PHYSICS_ELECTRICAL_SAFETY_ID, 1.0);
        assertThat(mastery).containsEntry(CANONICAL_PHYSICS_SEK1_VOLTAGE_CURRENT_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_STATIC_ELECTRICITY_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_CHARGE_SEPARATION_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_VOLTAGE_MEASUREMENT_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_CAPACITOR_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_RESISTOR_CIRCUITS_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_KIRCHHOFF_BALANCES_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_RESISTANCE_EFFECTS_ID, 1.0);
        assertThat(mastery).doesNotContainEntry(CANONICAL_PHYSICS_SEK1_ELECTRICAL_SAFETY_ID, 1.0);
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
    void canonicalGymnasiumRootPropagatesBundeslandFilterIntoPhysicsChildLandscape() throws Exception {
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        String personalCurriculum = """
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-BY"},
                  "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced": {"selected": false, "filterId": "GK"},
                  "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "GK"}
                }
                """;
        learner.setPersonalCurriculum(personalCurriculum);

        Map<String, LearningGoal> filteredGoals = invokeGetFilteredGoals(CANONICAL_GYMNASIUM_ROOT_ID, personalCurriculum);

        assertThat(filteredGoals)
                .containsKeys(
                        CANONICAL_PHYSICS_ROOT_ID,
                        CANONICAL_PHYSICS_WHY_ID,
                        CANONICAL_PHYSICS_STANDING_WAVES_ID,
                        CANONICAL_PHYSICS_INTERFERENCE_PATTERNS_ID,
                        CANONICAL_PHYSICS_DOUBLE_SLIT_INTERFERENCE_ID);
    }

    @Test
    void projectedSek1PhysicsAndCanonicalMathMasteryUnlocksCanonicalPhysicsDiagramAnalysis() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_PHYSICS_WHY_ID, 1.0),
                        new Mastery(learner, CANONICAL_MATH_FUNCTION_CONCEPT_ID, 1.0),
                        new Mastery(learner, CANONICAL_MATH_READ_VALUES_ID, 1.0),
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
        learner.setPersonalCurriculum(CANONICAL_PHYSICS_GK_PERSONAL_CONFIG);

        List<FrontierGoal> frontier = compositionAwareLearnerService().getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .doesNotContain(CANONICAL_PHYSICS_DIAGRAMS_ID);
    }

    @Test
    void canonicalPhysicsPilotLearnerStateUnlocksDiagramGoalFromCanonicalMathAndProjectedPhysicsMastery() {
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_PHYSICS_WHY_ID, 1.0),
                        new Mastery(learner, CANONICAL_MATH_FUNCTION_CONCEPT_ID, 1.0),
                        new Mastery(learner, CANONICAL_MATH_READ_VALUES_ID, 1.0)));
        learner.setPersonalCurriculum(CANONICAL_PHYSICS_GK_PERSONAL_CONFIG);

        UnifiedLearnerStateResponse state = compositionAwareLearnerService().getLearnerState(LEARNER_ID);

        assertThat(state.curriculum()).isNotNull();
        assertThat(state.curriculum().getCurriculumId()).isEqualTo(CANONICAL_PHYSICS_ID);
        assertThat(state.stateMachine().requiredAction()).isEqualTo("setActiveGoal");
        assertThat(state.stateMachine().goalOptions())
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_DIAGRAMS_ID)
                .doesNotContain(LEGACY_PHYSICS_WHY_ID, LEGACY_MATH_FUNCTION_CONCEPT_ID, LEGACY_MATH_READ_VALUES_ID);
    }

    private LearnerService compositionAwareLearnerService() {
        PlatformTransactionManager transactionManager = mock(PlatformTransactionManager.class);
        when(transactionManager.getTransaction(any())).thenReturn(new SimpleTransactionStatus());
        return new LearnerService(
                learnerRepository,
                learnerClientStateRepository,
                masteryRepository,
                plannedGoalRepository,
                landscapeService,
                goalMappingService,
                deckResourceService,
                compositionViewService,
                objectMapper,
                eventPublisher,
                transactionManager);
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
    void canonicalPhysicsPilotFrontierKeepsAmbiguousLegacySimpleCircuitMasteryAtTheFirstAtomicStep() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_ELECTRICITY_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_SIMPLE_CIRCUITS_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SEK1_OPEN_CLOSED_CIRCUITS_ID)
                .doesNotContain(CANONICAL_PHYSICS_SEK1_CURRENT_EFFECTS_ID, CANONICAL_PHYSICS_SEK1_CURRENT_MEASUREMENT_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierKeepsVoltageCurrentRelationBlockedByAtomicMeasurementGoals() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_VOLTAGE_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_ELECTRICITY_CLUSTER_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_STATIC_ELECTRICITY_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SEK1_CURRENT_MEASUREMENT_ID, CANONICAL_PHYSICS_SEK1_VOLTAGE_MEASUREMENT_ID)
                .doesNotContain(
                        CANONICAL_PHYSICS_SEK1_VOLTAGE_CURRENT_ID,
                        CANONICAL_PHYSICS_SEK1_RESISTOR_CIRCUITS_ID,
                        CANONICAL_PHYSICS_SEK1_KIRCHHOFF_BALANCES_ID,
                        CANONICAL_PHYSICS_SEK1_RESISTANCE_EFFECTS_ID);
    }

    @Test
    void canonicalPhysicsPilotElectricalEnergyGoalDependsOnReviewedVoltageAtom() {
        SkillLandscape landscape = landscapeService.getById(CANONICAL_PHYSICS_ID);
        LearningGoal heatGoal = landscape.getGoals().stream()
                .filter(goal -> CANONICAL_PHYSICS_SEK1_HEAT_ENERGY_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        LearningGoal electricalGoal = landscape.getGoals().stream()
                .filter(goal -> CANONICAL_PHYSICS_SEK1_ELECTRICAL_ENERGY_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(heatGoal.getRequires())
                .containsExactly(CANONICAL_PHYSICS_SEK1_ENERGY_ID, CANONICAL_PHYSICS_SEK1_TEMPERATURE_ID);
        assertThat(electricalGoal.getRequires())
                .containsExactly(CANONICAL_PHYSICS_SEK1_ENERGY_ID, CANONICAL_PHYSICS_SEK1_VOLTAGE_CURRENT_ID);
    }

    @Test
    void canonicalPhysicsPilotPressureRouteDependsOnReviewedAtomicMechanicsAndHeatBridges() {
        SkillLandscape landscape = landscapeService.getById(CANONICAL_PHYSICS_ID);
        LearningGoal pressureCluster = landscape.getGoals().stream()
                .filter(goal -> CANONICAL_PHYSICS_SEK1_PRESSURE_CLUSTER_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        LearningGoal pressureGoal = landscape.getGoals().stream()
                .filter(goal -> CANONICAL_PHYSICS_SEK1_PRESSURE_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();
        LearningGoal pressureTemperatureGoal = landscape.getGoals().stream()
                .filter(goal -> CANONICAL_PHYSICS_SEK1_PRESSURE_TEMPERATURE_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(pressureCluster.getRequires()).isEmpty();
        assertThat(pressureGoal.getRequires()).containsExactly(CANONICAL_PHYSICS_SEK1_FORCES_ID);
        assertThat(pressureTemperatureGoal.getRequires())
                .containsExactly(CANONICAL_PHYSICS_SEK1_PRESSURE_ID, CANONICAL_PHYSICS_SEK1_TEMPERATURE_ID);
    }

    @Test
    void canonicalPhysicsPilotHarmonicWavesEntryDependsOnReviewedSek1SoundPropagationBridge() {
        SkillLandscape landscape = landscapeService.getById(CANONICAL_PHYSICS_ID);
        LearningGoal harmonicWavesGoal = landscape.getGoals().stream()
                .filter(goal -> CANONICAL_PHYSICS_HARMONIC_WAVES_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(harmonicWavesGoal.getRequires())
                .containsExactly("fcf8580c-ecfd-58ea-bbf5-a1b29c9ecf8e", CANONICAL_PHYSICS_SEK1_SOUND_PROPAGATION_ID);
    }

    @Test
    void canonicalPhysicsPilotElectromagneticSpectrumEntryDependsOnlyOnReviewedHarmonicWaves() {
        SkillLandscape landscape = landscapeService.getById(CANONICAL_PHYSICS_ID);
        LearningGoal electromagneticSpectrumGoal = landscape.getGoals().stream()
                .filter(goal -> CANONICAL_PHYSICS_EM_SPECTRUM_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(electromagneticSpectrumGoal.getRequires())
                .containsExactly(CANONICAL_PHYSICS_HARMONIC_WAVES_ID);
    }

    @Test
    void canonicalPhysicsPilotUpperSecondaryRadiationGoalDependsOnReviewedSek1RadiationAtom() {
        SkillLandscape landscape = landscapeService.getById(CANONICAL_PHYSICS_ID);
        LearningGoal upperSecondaryRadiationGoal = landscape.getGoals().stream()
                .filter(goal -> CANONICAL_PHYSICS_UPPER_SECONDARY_RADIATION_ID.equals(goal.getId()))
                .findFirst()
                .orElseThrow();

        assertThat(upperSecondaryRadiationGoal.getRequires())
                .containsExactly(
                        "5c44b9ba-9b05-4774-95d5-073230d3fc4f",
                        CANONICAL_PHYSICS_SEK1_RADIATION_TYPES_ID,
                        CANONICAL_PHYSICS_SEK1_RADIATION_DETECTION_ID,
                        CANONICAL_PHYSICS_SEK1_RADIATION_EFFECTS_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksHeatTransferFromProjectedLegacyParticleModelMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_HEAT_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_PARTICLE_MODEL_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SEK1_HEAT_TRANSFER_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksBuoyancyFromProjectedLegacyPressureAndDensityMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_PRESSURE_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_PRESSURE_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_DENSITY_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SEK1_BUOYANCY_ID)
                .doesNotContain(CANONICAL_PHYSICS_SEK1_FLIGHT_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksSoundPropagationFromProjectedLegacySoundSourceAndParticleModelMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_ACOUSTICS_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_SOUND_SOURCES_ID, 1.0),
                        new Mastery(learner, LEGACY_SEK1_PHYSICS_PARTICLE_MODEL_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SEK1_SOUND_PROPAGATION_ID)
                .doesNotContain(
                        CANONICAL_PHYSICS_SEK1_SOUND_SPEED_MEDIA_ID,
                        CANONICAL_PHYSICS_SEK1_SOUND_CHARACTERIZATION_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksColorMixingFromProjectedLegacyColorOriginMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_COLORS_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_COLOR_ORIGIN_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_PHYSICS_SEK1_COLOR_MIXING_ID)
                .doesNotContain(CANONICAL_PHYSICS_SEK1_COLOR_PERCEPTION_ID);
    }

    @Test
    void canonicalPhysicsPilotFrontierUnlocksRadiationDetectionFromProjectedLegacyAtomicStructureMastery() {
        when(plannedGoalRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new PlannedGoal(learner, CANONICAL_PHYSICS_SEK1_RADIOACTIVITY_CLUSTER_ID)));
        when(masteryRepository.findByLearner_SkillpilotId(LEARNER_ID))
                .thenReturn(List.of(new Mastery(learner, LEGACY_SEK1_PHYSICS_ATOM_ID, 1.0)));

        List<FrontierGoal> frontier = learnerService.getRichFrontier(LEARNER_ID);

        assertThat(frontier)
                .extracting(FrontierGoal::id)
                .contains(
                        CANONICAL_PHYSICS_SEK1_RADIATION_TYPES_ID,
                        CANONICAL_PHYSICS_SEK1_RADIATION_DETECTION_ID,
                        CANONICAL_PHYSICS_SEK1_RADIATION_EFFECTS_ID)
                .doesNotContain(CANONICAL_PHYSICS_SEK1_RADIATION_APPLICATIONS_ID);
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
        assertThat(state.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
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
        assertThat(state.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
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
        assertThat(state.stateMachine().requiredAction()).isEqualTo("teachActiveGoal");
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

    @SuppressWarnings("unchecked")
    private Map<String, LearningGoal> invokeGetFilteredGoals(String curriculumId, String personalCurriculumJson)
            throws Exception {
        Method method = LearnerService.class.getDeclaredMethod("getFilteredGoals", String.class, String.class);
        method.setAccessible(true);
        return (Map<String, LearningGoal>) method.invoke(learnerService, curriculumId, personalCurriculumJson);
    }

    private Mastery masteryEntry(String goalId, double value, Instant updatedAt) {
        Mastery mastery = new Mastery(learner, goalId, value);
        mastery.setUpdatedAt(updatedAt);
        return mastery;
    }
}
