package com.skillpilot.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.domain.PlannedGoal;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.LearnerService;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class LearnerControllerIntegrationTest {

    private static final String CANONICAL_GYMNASIUM_ROOT_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CANONICAL_MATH_PILOT_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_MATH_ROOT_ID = "c01b1ce9-a667-4a46-b251-ec33ae602b15";
    private static final String CANONICAL_PHYSICS_PILOT_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String CANONICAL_PHYSICS_ROOT_ID = "bf980fff-b62b-4ea4-a20d-31681a7ad785";
    private static final String CANONICAL_CHEMISTRY_ID = "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0";
    private static final String CANONICAL_BIOLOGY_ID = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    private static final String CANONICAL_INFORMATICS_ID = "7d51b38c-a149-5407-bddc-d2ce7878b020";
    private static final String CANONICAL_HISTORY_ID = "92406d94-e3c1-58ec-b7c6-12122278d25a";
    private static final String CANONICAL_GERMAN_ID = "67bd301b-e11a-582d-94ba-4f4b1a4cefff";
    private static final String CANONICAL_POLITICS_ECONOMICS_ID = "51b60137-46e8-5498-973e-ea38bb32f327";
    private static final String CANONICAL_ENGLISH_ID = "c8c84073-46ae-57ec-898a-882d08d7a72f";
    private static final String CANONICAL_FRENCH_ID = "96a915cc-4fd6-5dc2-8cee-aaf3ab8c2977";
    private static final String CANONICAL_LATIN_ID = "668cf206-941e-51f8-8704-3e8938631235";
    private static final String HESSEN_GYMNASIUM_UPPER_ROOT_ID = "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da";
    private static final String HESSEN_GYMNASIUM_UPPER_MATH_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
    private static final String HESSEN_GYMNASIUM_UPPER_PHYSICS_ID = "24f2ca0f-b94a-444e-bb70-677cb6f85c02";
    private static final String HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID = "2f391ba2-ba1e-40e4-a8d2-dff049516c13";
    private static final String HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID = "3e56aa75-c76c-4de5-883b-0aac98297846";
    private static final String HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID = "c1a02ddd-736d-4975-920b-18b03aff147f";
    private static final String HESSEN_GYMNASIUM_UPPER_HISTORY_ID = "bdc89685-73d3-446c-af5a-eaf642c07463";
    private static final String HESSEN_GYMNASIUM_UPPER_GERMAN_ID = "f1ba2118-853f-4aa0-bef5-4f749bc621ed";
    private static final String HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID = "1d0e9f8f-0087-49e4-8ea2-976e5a89b165";
    private static final String HESSEN_GYMNASIUM_UPPER_ENGLISH_ID = "bc2124fa-2974-46cc-85e7-2392e61250e1";
    private static final String HESSEN_GYMNASIUM_UPPER_FRENCH_ID = "30acd190-609c-4109-8ee7-06fc5594af19";
    private static final String HESSEN_GYMNASIUM_UPPER_LATIN_ID = "fe28bda8-03f3-4c4a-8286-7fcfce4eeac1";
    private static final String CANONICAL_PHYSICS_GK_PERSONAL_CONFIG = """
            {
              "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a": {"selected": true, "filterId": "GK"}
            }
            """;
    private static final String CANONICAL_MATH_ANALYSIS_CLUSTER_ID = "a668ea17-9226-4074-8f8e-051acbe839eb";
    private static final String CANONICAL_MATH_CALCULATE_VALUES_ID = "c65ecabf-d00b-4e2d-99ae-b64692325ffb";
    private static final String CANONICAL_MATH_READ_VALUES_ID = "a8c42ee9-2898-4247-819f-c235032ac78a";
    private static final String CANONICAL_MATH_SYMMETRY_ID = "d8c9eb57-1614-4c1d-829a-618134def352";
    private static final String CANONICAL_PHYSICS_CLUSTER_ID = "65ddd780-0323-45d1-8f94-5e31bf28da23";
    private static final String CANONICAL_PHYSICS_E3_CLUSTER_ID = "287739a3-6143-55d0-abe7-1a08889e9b49";
    private static final String CANONICAL_PHYSICS_E2_CLUSTER_ID = "9340e894-bb0d-45a4-91f2-b90a63ad50a8";
    private static final String CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID = "e9d616d8-685f-4129-a36f-dae7a280bae7";
    private static final String CANONICAL_PHYSICS_DIAGRAMS_ID = "ce431132-dfc4-42c2-aff6-bd72035190f8";
    private static final String CANONICAL_PHYSICS_UNIFORM_MOTION_ID = "971beafa-6ba5-4c82-ac8b-7ebf66eec3dd";
    private static final String CANONICAL_PHYSICS_SUPERPOSITION_ID = "68c90ba6-c438-463c-9a53-cf61062d416a";
    private static final String CANONICAL_PHYSICS_FIRST_LAW_ID = "31a2ef52-114b-4d2c-a720-6ef5a390b6dc";
    private static final String CANONICAL_PHYSICS_SIMPLE_COLLISIONS_ID = "2eecd0e2-a7ca-4568-9b12-3d47706c65fb";
    private static final String CANONICAL_PHYSICS_INELASTIC_COLLISIONS_ID = "0da13365-02c2-44f1-8a81-d524ca0ac3ae";
    private static final String CANONICAL_CHEMISTRY_E_PHASE_CLUSTER_ID = "323a222e-5db8-53c5-b2dc-6f9c1d0d277c";
    private static final String CANONICAL_CHEMISTRY_REDOX_TERMS_ID = "04fa0ba1-eb6e-53c8-93d4-dfa28bb4b162";
    private static final String CANONICAL_CHEMISTRY_OXIDATION_NUMBERS_ID = "4961130b-1ee8-58f2-a319-dff0a864db6a";
    private static final String CANONICAL_BIOLOGY_E_PHASE_CLUSTER_ID = "78370970-54ec-579e-ab99-d16cce22e27d";
    private static final String CANONICAL_BIOLOGY_LIFE_CHARACTERISTICS_ID = "11e90f71-a9a4-5a57-b619-ad5d81e81f96";
    private static final String CANONICAL_BIOLOGY_CELL_TYPES_ID = "7c6bf0cc-6ed8-56b1-b44a-642f7a069a5f";
    private static final String CANONICAL_INFORMATICS_E_PHASE_CLUSTER_ID = "eaf62c0d-5e76-5467-94e0-bd100f3cb7e1";
    private static final String CANONICAL_INFORMATICS_NETWORKS_ID = "ca07458c-1fc1-5ca1-b226-69f59e2d62d3";
    private static final String CANONICAL_INFORMATICS_TCP_IP_ID = "6539320a-aa0e-59e5-a34a-55f1a8b78337";
    private static final String CANONICAL_HISTORY_E_PHASE_CLUSTER_ID = "abed1f19-6cf8-54a4-aae2-d7691f97c2cf";
    private static final String CANONICAL_HISTORY_FORMS_OF_RULE_ID = "3537a9c4-d336-5603-baf0-c428a7b20002";
    private static final String CANONICAL_HISTORY_INTERCULTURAL_ID = "1bd17323-6be0-5391-967b-491a4e6ae43e";
    private static final String CANONICAL_GERMAN_E_PHASE_CLUSTER_ID = "bbcabb0c-b319-5622-a5b7-a0259f7de255";
    private static final String CANONICAL_GERMAN_GRAMMAR_ID = "abf6d684-791e-5e0d-90bf-3466087dc937";
    private static final String CANONICAL_GERMAN_TEXT_TYPE_ID = "bc28576e-243e-5bff-aca0-872e174d59e5";
    private static final String CANONICAL_ENGLISH_E_PHASE_CLUSTER_ID = "8d4bc24e-8eb1-5167-9bd3-dda9845277c9";
    private static final String CANONICAL_ENGLISH_GROWING_UP_ID = "aefe30a8-cb8e-54dc-b1db-da7634f32584";
    private static final String CANONICAL_ENGLISH_TEXT_COMPREHENSION_ID = "4ba50e17-1a1c-5ea3-a615-ceb4229844c9";
    private static final String CANONICAL_ENGLISH_MAKING_A_DIFFERENCE_ID = "aeacdf33-3be6-5a7f-adae-d2b490f81a0a";
    private static final String CANONICAL_FRENCH_ROOT_ID = "3cdb4109-e977-54f3-b662-0800e2f043d3";
    private static final String CANONICAL_FRENCH_READ_FAMILY_ID = "5f0b8adf-e7af-5cdd-a50c-0a721662b54c";
    private static final String CANONICAL_FRENCH_READ_YOUTH_ID = "a39ca386-25f4-53ee-9fb7-f4e787cb218a";
    private static final String CANONICAL_LATIN_E_PHASE_CLUSTER_ID = "415d72d7-34e2-5321-94c6-1d7a9a04404c";
    private static final String CANONICAL_LATIN_GRAMMAR_ID = "1476af3f-0ff9-59c0-8a1a-e81dfc011ae2";
    private static final String CANONICAL_LATIN_INTERPRETATION_ID = "662680a7-6018-5721-9166-2f73a7ea92c6";
    private static final String CANONICAL_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID = "bb341613-10ba-5d25-a331-36831bf766e3";
    private static final String CANONICAL_POLITICS_ECONOMICS_SOCIETY_CLUSTER_ID = "56cc2051-994e-57cc-8cbf-2d60bcad16a3";
    private static final String CANONICAL_POLITICS_ECONOMICS_ECONOMY_CLUSTER_ID = "7fbc5949-2c8c-53e5-a97f-af3cedf020c9";
    private static final String CANONICAL_POLITICS_ECONOMICS_SOCIETY_SYSTEMS_ID =
            "af5870d3-ceb7-59cb-a038-ee9f273f9847";
    private static final String CANONICAL_POLITICS_ECONOMICS_MARKET_FOUNDATIONS_ID =
            "4b5b33cf-cc5e-566d-b27b-d8fef97bdd5b";
    private static final String LEGACY_PHYSICS_CLUSTER_ID = "af70212d-e318-462d-a53f-fee8f05697d6";
    private static final String LEGACY_PHYSICS_E3_CLUSTER_ID = "0f3f9df2-37ee-4fd9-95b6-8786367d3794";
    private static final String LEGACY_PHYSICS_E2_CLUSTER_ID = "52c3d2e8-6634-4806-b84b-3709e3c4aef1";
    private static final String LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID = "e26447c4-36a3-43ef-b400-ca918754f3b0";
    private static final String LEGACY_PHYSICS_ACCELERATED_ID = "d00d74e7-4fce-48e2-9d00-49f52082f8e6";
    private static final String LEGACY_PHYSICS_ENERGY_CONSERVATION_ID = "9aeaf941-baef-43fb-8077-50d37e600c26";
    private static final String LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID = "0436c8fc-b849-4cab-84d7-32e92c0d94a9";
    private static final String LEGACY_PHYSICS_WHY_ID = "4b56b5c6-0e7b-4486-aa8f-7d5be7f085a5";
    private static final String LEGACY_PHYSICS_DIAGRAMS_ID = "e8160c09-a013-4146-80e6-b0e5dedd8fc6";
    private static final String LEGACY_CHEMISTRY_E_PHASE_CLUSTER_ID = "a72207c1-0803-44c6-90be-2835121bbd18";
    private static final String LEGACY_CHEMISTRY_WHY_ID = "9058eb3b-3198-4fa0-8d0b-7249cf1bbcd0";
    private static final String LEGACY_BIOLOGY_E_PHASE_CLUSTER_ID = "b126e678-4432-4ab3-a347-4cfd936ad8de";
    private static final String LEGACY_BIOLOGY_WHY_ID = "f56ab9a6-a04d-4dce-bb62-68bd1c9f3564";
    private static final String LEGACY_INFORMATICS_E_PHASE_CLUSTER_ID = "9037d005-eea9-45b3-b5ed-23cea87312e7";
    private static final String LEGACY_INFORMATICS_WHY_ID = "db2d4785-9a69-468f-ba42-ac4be2bcfdb3";
    private static final String LEGACY_HISTORY_E_PHASE_CLUSTER_ID = "175a9c63-e86d-48d9-a4a0-eb818b2683dc";
    private static final String LEGACY_HISTORY_WHY_ID = "af666eb2-0845-42e9-baa7-d951df9cbc6d";
    private static final String LEGACY_GERMAN_E_PHASE_CLUSTER_ID = "da121f0a-946a-4f64-b322-89016916488c";
    private static final String LEGACY_GERMAN_WHY_ID = "572f8e34-c116-40bf-b7ee-4fc6bea1c4d4";
    private static final String LEGACY_ENGLISH_E_PHASE_CLUSTER_ID = "90ac9109-a708-4e9e-a112-6ba1fc9a8eb1";
    private static final String LEGACY_ENGLISH_WHY_ID = "27b96d3f-d705-419c-a757-b557bbe1ad59";
    private static final String LEGACY_FRENCH_ROOT_ID = "35cf060b-92dd-4b7b-b066-e95a51dc31d1";
    private static final String LEGACY_FRENCH_WHY_ID = "24216866-f18f-4db6-bdc3-05e81397c6c9";
    private static final String LEGACY_LATIN_E_PHASE_CLUSTER_ID = "90831aaf-1d6b-48ef-800a-f89163ad2728";
    private static final String LEGACY_LATIN_WHY_ID = "735abeb1-41ab-4e65-8be8-865731853213";
    private static final String LEGACY_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID = "e8dcf1ec-fdda-4528-ab67-212810d973a9";
    private static final String LEGACY_POLITICS_ECONOMICS_WHY_ID = "3bee27bb-2277-4a7a-a66e-5038d6ee1781";
    private static final String LEGACY_MATH_ANALYSIS_CLUSTER_ID = "a6ee6304-8c26-4eda-b56e-676655e703c2";
    private static final String LEGACY_MATH_FUNCTION_CONCEPT_ID = "0903db01-4377-4a79-8f29-aceffea68f24";
    private static final String LEGACY_MATH_READ_VALUES_ID = "cd46ce36-883e-4e68-8bfd-2bbdc0ecce9d";
    private static final String LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID =
            "6be922a1-e60a-5317-b910-b6fea632f0fb";
    private static final String LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID =
            "aac4b09e-73e1-51a7-a3ae-f9e9bfa5481b";
    private static final String LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID =
            "d91f9aba-814a-573e-a09e-ebeb3b9f2bf5";
    private static final String LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID =
            "f7f4e1f0-3c48-5f1c-a474-4a41ca6296b6";
    private static final String LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID =
            "f431504c-3f62-562b-9af2-1475a3eaeed8";
    private static final String LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID =
            "3d13ecad-1fab-527e-a833-5596edaa23c5";
    private static final String LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID =
            "0074dc7c-b4ab-5bfb-b1b7-a8f5cdb9accc";
    private static final String LEGACY_BAYERN_PHYSICS_MOMENTUM_CONSERVATION_ID =
            "713ad139-bcb8-5a71-a520-3f194a0f8754";
    private static final String LEGACY_SEK1_LINEAR_FUNCTIONS_ID = "faafd111-21a1-4f67-945a-6bff60b3e19b";

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private PlannedGoalRepository plannedGoalRepository;

    @Autowired
    private MasteryRepository masteryRepository;

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private ObjectMapper objectMapper;

    @LocalServerPort
    private int port;

    private String learnerId;

    @BeforeEach
    void setUp() {
        masteryRepository.deleteAll();
        plannedGoalRepository.deleteAll();
        learnerRepository.deleteAll();

        Learner learner = new Learner();
        learner.setSkillpilotId("idempotent-learner");
        learnerRepository.save(learner);
        learnerId = learner.getSkillpilotId();
    }

    @Test
    void putPlannedGoals_isIdempotent() throws Exception {
        learnerService.setPlannedGoals(learnerId, Set.of("PHYS_Q1"));
        learnerService.setPlannedGoals(learnerId, Set.of("PHYS_Q1"));

        assertThat(plannedGoalRepository.findByLearner_SkillpilotId(learnerId))
                .hasSize(1)
                .first()
                .extracting(pg -> pg.getGoalId())
                .isEqualTo("PHYS_Q1");
    }

    @Test
    void getLearnerStateHttpCollapsesMixedLegacyMotionScopesIntoSingleCanonicalPlannedGoal() throws Exception {
        String responseBody = getLearnerStateBodyForPlannedGoals(
                LEGACY_PHYSICS_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID);

        JsonNode planned = objectMapper.readTree(responseBody).path("goals").path("planned");
        assertThat(planned.isArray()).isTrue();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_CLUSTER_ID);
        assertThat(responseBody)
                .doesNotContain(LEGACY_PHYSICS_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID);
    }

    @Test
    void getLearnerStateHttpCollapsesMixedLegacyE3ScopesIntoSingleCanonicalPlannedGoal() throws Exception {
        String responseBody = getLearnerStateBodyForPlannedGoals(
                LEGACY_PHYSICS_E3_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID,
                LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID);

        JsonNode planned = objectMapper.readTree(responseBody).path("goals").path("planned");
        assertThat(planned.isArray()).isTrue();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_E3_CLUSTER_ID);
        assertThat(responseBody)
                .doesNotContain(LEGACY_PHYSICS_E3_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID);
    }

    @Test
    void getLearnerStateHttpCollapsesMixedLegacyE2ScopesIntoSingleCanonicalPlannedGoal() throws Exception {
        String responseBody = getLearnerStateBodyForPlannedGoals(
                LEGACY_PHYSICS_E2_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);

        JsonNode planned = objectMapper.readTree(responseBody).path("goals").path("planned");
        assertThat(planned.isArray()).isTrue();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_E2_CLUSTER_ID);
        assertThat(responseBody)
                .doesNotContain(LEGACY_PHYSICS_E2_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);
    }

    @Test
    void getLearnerStateHttpCollapsesMixedLegacyConservationScopesIntoSingleCanonicalPlannedGoal() throws Exception {
        String responseBody = getLearnerStateBodyForPlannedGoals(
                LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID,
                LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);

        JsonNode planned = objectMapper.readTree(responseBody).path("goals").path("planned");
        assertThat(planned.isArray()).isTrue();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID);
        assertThat(responseBody)
                .doesNotContain(LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID)
                .doesNotContain(LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);
    }

    @Test
    void getLearnerStateHttpTurnsMixedLegacyConservationPlanAndMasteryIntoCanonicalFrontier() throws Exception {
        String responseBody = getLearnerStateBody(
                List.of(
                        LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID),
                List.of(
                        LEGACY_PHYSICS_ENERGY_CONSERVATION_ID,
                        LEGACY_BAYERN_PHYSICS_MOMENTUM_CONSERVATION_ID));

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode planned = root.path("goals").path("planned");
        JsonNode goalOptions = root.path("stateMachine").path("goalOptions");
        JsonNode frontier = root.path("frontier");

        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID);
        assertThat(root.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_SIMPLE_COLLISIONS_ID, CANONICAL_PHYSICS_INELASTIC_COLLISIONS_ID)
                .doesNotContain(
                        LEGACY_PHYSICS_ENERGY_CONSERVATION_ID,
                        LEGACY_BAYERN_PHYSICS_MOMENTUM_CONSERVATION_ID,
                        LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_PHYSICS_SIMPLE_COLLISIONS_ID, CANONICAL_PHYSICS_INELASTIC_COLLISIONS_ID);
    }

    @Test
    void getLearnerStateHttpTurnsMixedLegacyMotionPlanAndMasteryIntoCanonicalFrontier() throws Exception {
        String responseBody = getLearnerStateBody(
                List.of(
                        LEGACY_PHYSICS_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID),
                List.of(
                        LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID,
                        LEGACY_SEK1_LINEAR_FUNCTIONS_ID));

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode planned = root.path("goals").path("planned");
        JsonNode goalOptions = root.path("stateMachine").path("goalOptions");
        JsonNode frontier = root.path("frontier");

        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_CLUSTER_ID);
        assertThat(root.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_UNIFORM_MOTION_ID)
                .doesNotContain(
                        LEGACY_BAYERN_PHYSICS_DIAGRAMS_ID,
                        LEGACY_SEK1_LINEAR_FUNCTIONS_ID,
                        LEGACY_PHYSICS_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOTION_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOTION_MODELING_ID);
        assertThat(jsonIds(frontier)).contains(CANONICAL_PHYSICS_UNIFORM_MOTION_ID);
    }

    @Test
    void getLearnerStateHttpTurnsMixedLegacyE3PlanAndMasteryIntoCanonicalSuperpositionFrontier() throws Exception {
        String responseBody = getLearnerStateBody(
                List.of(
                        LEGACY_PHYSICS_E3_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID,
                        LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID),
                List.of(LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID));

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode planned = root.path("goals").path("planned");
        JsonNode goalOptions = root.path("stateMachine").path("goalOptions");
        JsonNode frontier = root.path("frontier");

        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_E3_CLUSTER_ID);
        assertThat(root.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_SUPERPOSITION_ID)
                .doesNotContain(
                        LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID,
                        LEGACY_PHYSICS_E3_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_HYPOTHESES_ID,
                        LEGACY_BAYERN_PHYSICS_HORIZONTAL_THROW_ANALYSIS_ID);
        assertThat(jsonIds(frontier)).contains(CANONICAL_PHYSICS_SUPERPOSITION_ID);
    }

    @Test
    void getLearnerStateHttpTurnsLegacyE3PlanAndMasteryIntoCanonicalSuperpositionFrontier() throws Exception {
        String responseBody = getLearnerStateBody(
                List.of(LEGACY_PHYSICS_E3_CLUSTER_ID),
                List.of(LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID));

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode planned = root.path("goals").path("planned");
        JsonNode goalOptions = root.path("stateMachine").path("goalOptions");
        JsonNode frontier = root.path("frontier");

        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_E3_CLUSTER_ID);
        assertThat(root.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_SUPERPOSITION_ID)
                .doesNotContain(LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID, LEGACY_PHYSICS_E3_CLUSTER_ID);
        assertThat(jsonIds(frontier)).contains(CANONICAL_PHYSICS_SUPERPOSITION_ID);
    }

    @Test
    void getLearnerStateHttpTurnsMixedLegacyE2PlanAndMasteryIntoCanonicalNewtonFrontier() throws Exception {
        String responseBody = getLearnerStateBody(
                List.of(
                        LEGACY_PHYSICS_E2_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID),
                List.of(LEGACY_PHYSICS_ACCELERATED_ID));

        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode planned = root.path("goals").path("planned");
        JsonNode goalOptions = root.path("stateMachine").path("goalOptions");
        JsonNode frontier = root.path("frontier");

        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_E2_CLUSTER_ID);
        assertThat(root.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_FIRST_LAW_ID)
                .doesNotContain(
                        LEGACY_PHYSICS_ACCELERATED_ID,
                        LEGACY_PHYSICS_E2_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_ENERGY_CLUSTER_ID,
                        LEGACY_BAYERN_PHYSICS_MOMENTUM_CLUSTER_ID);
        assertThat(jsonIds(frontier)).contains(CANONICAL_PHYSICS_FIRST_LAW_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenMathLearnerToCanonicalGymnasiumRoot() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_MATH_ID);
        learner.setPersonalCurriculum("""
                {
                  "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3": {"selected": true, "filterId": "LK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_MATH_ANALYSIS_CLUSTER_ID));
        masteryRepository.save(new Mastery(learner, LEGACY_MATH_FUNCTION_CONCEPT_ID, 1.0));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_MATH_ANALYSIS_CLUSTER_ID);
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_MATH_CALCULATE_VALUES_ID, CANONICAL_MATH_READ_VALUES_ID, CANONICAL_MATH_SYMMETRY_ID)
                .doesNotContain(LEGACY_MATH_FUNCTION_CONCEPT_ID, LEGACY_MATH_ANALYSIS_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_MATH_CALCULATE_VALUES_ID, CANONICAL_MATH_READ_VALUES_ID, CANONICAL_MATH_SYMMETRY_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_MATH_FUNCTION_CONCEPT_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenPhysicsLearnerToCanonicalGymnasiumRootWithMathBridge() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_PHYSICS_ID);
        learner.setPersonalCurriculum("""
                {
                  "24f2ca0f-b94a-444e-bb70-677cb6f85c02": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_PHYSICS_CLUSTER_ID));
        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_PHYSICS_WHY_ID, 1.0),
                new Mastery(learner, LEGACY_MATH_FUNCTION_CONCEPT_ID, 1.0),
                new Mastery(learner, LEGACY_MATH_READ_VALUES_ID, 1.0)));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_PHYSICS_CLUSTER_ID);
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_PHYSICS_DIAGRAMS_ID)
                .doesNotContain(LEGACY_PHYSICS_WHY_ID, LEGACY_MATH_FUNCTION_CONCEPT_ID, LEGACY_MATH_READ_VALUES_ID);
        assertThat(jsonIds(frontier)).contains(CANONICAL_PHYSICS_DIAGRAMS_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_PHYSICS_WHY_ID)
                .doesNotContain(LEGACY_MATH_FUNCTION_CONCEPT_ID)
                .doesNotContain(LEGACY_MATH_READ_VALUES_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenChemistryLearnerToCanonicalGymnasiumRoot() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_CHEMISTRY_ID);
        learner.setPersonalCurriculum("""
                {
                  "2f391ba2-ba1e-40e4-a8d2-dff049516c13": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_CHEMISTRY_E_PHASE_CLUSTER_ID));
        masteryRepository.save(new Mastery(learner, LEGACY_CHEMISTRY_WHY_ID, 1.0));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_CHEMISTRY_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_CHEMISTRY_REDOX_TERMS_ID, CANONICAL_CHEMISTRY_OXIDATION_NUMBERS_ID)
                .doesNotContain(LEGACY_CHEMISTRY_WHY_ID, LEGACY_CHEMISTRY_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_CHEMISTRY_REDOX_TERMS_ID, CANONICAL_CHEMISTRY_OXIDATION_NUMBERS_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_CHEMISTRY_WHY_ID)
                .doesNotContain(LEGACY_CHEMISTRY_E_PHASE_CLUSTER_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenBiologyLearnerToCanonicalGymnasiumRoot() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_BIOLOGY_ID);
        learner.setPersonalCurriculum("""
                {
                  "3e56aa75-c76c-4de5-883b-0aac98297846": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_BIOLOGY_E_PHASE_CLUSTER_ID));
        masteryRepository.save(new Mastery(learner, LEGACY_BIOLOGY_WHY_ID, 1.0));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_BIOLOGY_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_BIOLOGY_LIFE_CHARACTERISTICS_ID, CANONICAL_BIOLOGY_CELL_TYPES_ID)
                .doesNotContain(LEGACY_BIOLOGY_WHY_ID, LEGACY_BIOLOGY_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_BIOLOGY_LIFE_CHARACTERISTICS_ID, CANONICAL_BIOLOGY_CELL_TYPES_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_BIOLOGY_WHY_ID)
                .doesNotContain(LEGACY_BIOLOGY_E_PHASE_CLUSTER_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenInformaticsLearnerToCanonicalGymnasiumRoot() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_INFORMATICS_ID);
        learner.setPersonalCurriculum("""
                {
                  "c1a02ddd-736d-4975-920b-18b03aff147f": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_INFORMATICS_E_PHASE_CLUSTER_ID));
        masteryRepository.save(new Mastery(learner, LEGACY_INFORMATICS_WHY_ID, 1.0));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_INFORMATICS_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_INFORMATICS_NETWORKS_ID, CANONICAL_INFORMATICS_TCP_IP_ID)
                .doesNotContain(LEGACY_INFORMATICS_WHY_ID, LEGACY_INFORMATICS_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_INFORMATICS_NETWORKS_ID, CANONICAL_INFORMATICS_TCP_IP_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_INFORMATICS_WHY_ID)
                .doesNotContain(LEGACY_INFORMATICS_E_PHASE_CLUSTER_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenHistoryLearnerToCanonicalGymnasiumRoot() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_HISTORY_ID);
        learner.setPersonalCurriculum("""
                {
                  "bdc89685-73d3-446c-af5a-eaf642c07463": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_HISTORY_E_PHASE_CLUSTER_ID));
        masteryRepository.save(new Mastery(learner, LEGACY_HISTORY_WHY_ID, 1.0));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_HISTORY_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_HISTORY_FORMS_OF_RULE_ID, CANONICAL_HISTORY_INTERCULTURAL_ID)
                .doesNotContain(LEGACY_HISTORY_WHY_ID, LEGACY_HISTORY_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_HISTORY_FORMS_OF_RULE_ID, CANONICAL_HISTORY_INTERCULTURAL_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_HISTORY_WHY_ID)
                .doesNotContain(LEGACY_HISTORY_E_PHASE_CLUSTER_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenGermanLearnerToCanonicalGymnasiumRoot() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_GERMAN_ID);
        learner.setPersonalCurriculum("""
                {
                  "f1ba2118-853f-4aa0-bef5-4f749bc621ed": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_GERMAN_E_PHASE_CLUSTER_ID));
        masteryRepository.save(new Mastery(learner, LEGACY_GERMAN_WHY_ID, 1.0));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_GERMAN_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_GERMAN_GRAMMAR_ID, CANONICAL_GERMAN_TEXT_TYPE_ID)
                .doesNotContain(LEGACY_GERMAN_WHY_ID, LEGACY_GERMAN_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_GERMAN_GRAMMAR_ID, CANONICAL_GERMAN_TEXT_TYPE_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_GERMAN_WHY_ID)
                .doesNotContain(LEGACY_GERMAN_E_PHASE_CLUSTER_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenEnglishLearnerToCanonicalGymnasiumRoot() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_ENGLISH_ID);
        learner.setPersonalCurriculum("""
                {
                  "bc2124fa-2974-46cc-85e7-2392e61250e1": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_ENGLISH_E_PHASE_CLUSTER_ID));
        masteryRepository.save(new Mastery(learner, LEGACY_ENGLISH_WHY_ID, 1.0));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_ENGLISH_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_ENGLISH_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_POLITICS_ECONOMICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_ENGLISH_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_ENGLISH_GROWING_UP_ID, CANONICAL_ENGLISH_MAKING_A_DIFFERENCE_ID)
                .doesNotContain(LEGACY_ENGLISH_WHY_ID, LEGACY_ENGLISH_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_ENGLISH_GROWING_UP_ID, CANONICAL_ENGLISH_MAKING_A_DIFFERENCE_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_ENGLISH_WHY_ID)
                .doesNotContain(LEGACY_ENGLISH_E_PHASE_CLUSTER_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenFrenchLearnerToCanonicalGymnasiumRoot() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_FRENCH_ID);
        learner.setPersonalCurriculum("""
                {
                  "30acd190-609c-4109-8ee7-06fc5594af19": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_FRENCH_ROOT_ID));
        masteryRepository.save(new Mastery(learner, LEGACY_FRENCH_WHY_ID, 1.0));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_FRENCH_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_FRENCH_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_POLITICS_ECONOMICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_ENGLISH_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_FRENCH_ROOT_ID);
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_FRENCH_READ_FAMILY_ID, CANONICAL_FRENCH_READ_YOUTH_ID)
                .doesNotContain(LEGACY_FRENCH_WHY_ID, LEGACY_FRENCH_ROOT_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_FRENCH_READ_FAMILY_ID, CANONICAL_FRENCH_READ_YOUTH_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_FRENCH_WHY_ID)
                .doesNotContain(LEGACY_FRENCH_ROOT_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenLatinLearnerToCanonicalGymnasiumRoot() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_LATIN_ID);
        learner.setPersonalCurriculum("""
                {
                  "fe28bda8-03f3-4c4a-8286-7fcfce4eeac1": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_LATIN_E_PHASE_CLUSTER_ID));
        masteryRepository.save(new Mastery(learner, LEGACY_LATIN_WHY_ID, 1.0));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_LATIN_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_LATIN_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_POLITICS_ECONOMICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_ENGLISH_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_FRENCH_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_LATIN_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(goalOptions))
                .contains(CANONICAL_LATIN_GRAMMAR_ID, CANONICAL_LATIN_INTERPRETATION_ID)
                .doesNotContain(LEGACY_LATIN_WHY_ID, LEGACY_LATIN_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(CANONICAL_LATIN_GRAMMAR_ID, CANONICAL_LATIN_INTERPRETATION_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_LATIN_WHY_ID)
                .doesNotContain(LEGACY_LATIN_E_PHASE_CLUSTER_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenOverviewLearnerToCanonicalGymnasiumRootWithBothSubjects() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3": {"selected": true, "filterId": "LK"},
                  "24f2ca0f-b94a-444e-bb70-677cb6f85c02": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.saveAll(List.of(
                new PlannedGoal(learner, LEGACY_MATH_ANALYSIS_CLUSTER_ID),
                new PlannedGoal(learner, LEGACY_PHYSICS_CLUSTER_ID)));
        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_MATH_FUNCTION_CONCEPT_ID, 1.0),
                new Mastery(learner, LEGACY_MATH_READ_VALUES_ID, 1.0),
                new Mastery(learner, LEGACY_PHYSICS_WHY_ID, 1.0)));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(planned).hasSize(2);
        assertThat(jsonIds(planned))
                .containsExactlyInAnyOrder(CANONICAL_MATH_ANALYSIS_CLUSTER_ID, CANONICAL_PHYSICS_CLUSTER_ID);
        assertThat(body.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(
                        CANONICAL_MATH_CALCULATE_VALUES_ID,
                        CANONICAL_MATH_SYMMETRY_ID,
                        CANONICAL_PHYSICS_DIAGRAMS_ID)
                .doesNotContain(
                        CANONICAL_MATH_READ_VALUES_ID,
                        LEGACY_MATH_ANALYSIS_CLUSTER_ID,
                        LEGACY_PHYSICS_CLUSTER_ID,
                        LEGACY_MATH_FUNCTION_CONCEPT_ID,
                        LEGACY_MATH_READ_VALUES_ID,
                        LEGACY_PHYSICS_WHY_ID);
        assertThat(jsonIds(frontier))
                .contains(
                        CANONICAL_MATH_CALCULATE_VALUES_ID,
                        CANONICAL_MATH_SYMMETRY_ID,
                        CANONICAL_PHYSICS_DIAGRAMS_ID)
                .doesNotContain(CANONICAL_MATH_READ_VALUES_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_MATH_ANALYSIS_CLUSTER_ID)
                .doesNotContain(LEGACY_PHYSICS_CLUSTER_ID)
                .doesNotContain(LEGACY_MATH_FUNCTION_CONCEPT_ID)
                .doesNotContain(LEGACY_MATH_READ_VALUES_ID)
                .doesNotContain(LEGACY_PHYSICS_WHY_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenOverviewLearnerToCanonicalGymnasiumRootWithChemistryAndBiology() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "2f391ba2-ba1e-40e4-a8d2-dff049516c13": {"selected": true, "filterId": "GK"},
                  "3e56aa75-c76c-4de5-883b-0aac98297846": {"selected": true, "filterId": "LK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.saveAll(List.of(
                new PlannedGoal(learner, LEGACY_CHEMISTRY_E_PHASE_CLUSTER_ID),
                new PlannedGoal(learner, LEGACY_BIOLOGY_E_PHASE_CLUSTER_ID)));
        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_CHEMISTRY_WHY_ID, 1.0),
                new Mastery(learner, LEGACY_BIOLOGY_WHY_ID, 1.0)));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(2);
        assertThat(jsonIds(planned))
                .containsExactlyInAnyOrder(CANONICAL_CHEMISTRY_E_PHASE_CLUSTER_ID, CANONICAL_BIOLOGY_E_PHASE_CLUSTER_ID);
        assertThat(body.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(
                        CANONICAL_CHEMISTRY_REDOX_TERMS_ID,
                        CANONICAL_CHEMISTRY_OXIDATION_NUMBERS_ID,
                        CANONICAL_BIOLOGY_LIFE_CHARACTERISTICS_ID,
                        CANONICAL_BIOLOGY_CELL_TYPES_ID)
                .doesNotContain(
                        LEGACY_CHEMISTRY_E_PHASE_CLUSTER_ID,
                        LEGACY_BIOLOGY_E_PHASE_CLUSTER_ID,
                        LEGACY_CHEMISTRY_WHY_ID,
                        LEGACY_BIOLOGY_WHY_ID);
        assertThat(jsonIds(frontier))
                .contains(
                        CANONICAL_CHEMISTRY_REDOX_TERMS_ID,
                        CANONICAL_CHEMISTRY_OXIDATION_NUMBERS_ID,
                        CANONICAL_BIOLOGY_LIFE_CHARACTERISTICS_ID,
                        CANONICAL_BIOLOGY_CELL_TYPES_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_CHEMISTRY_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_BIOLOGY_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_CHEMISTRY_WHY_ID)
                .doesNotContain(LEGACY_BIOLOGY_WHY_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenOverviewLearnerToCanonicalGymnasiumRootWithInformaticsAndHistory() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "c1a02ddd-736d-4975-920b-18b03aff147f": {"selected": true, "filterId": "GK"},
                  "bdc89685-73d3-446c-af5a-eaf642c07463": {"selected": true, "filterId": "LK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.saveAll(List.of(
                new PlannedGoal(learner, LEGACY_INFORMATICS_E_PHASE_CLUSTER_ID),
                new PlannedGoal(learner, LEGACY_HISTORY_E_PHASE_CLUSTER_ID)));
        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_INFORMATICS_WHY_ID, 1.0),
                new Mastery(learner, LEGACY_HISTORY_WHY_ID, 1.0)));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(2);
        assertThat(jsonIds(planned))
                .containsExactlyInAnyOrder(CANONICAL_INFORMATICS_E_PHASE_CLUSTER_ID, CANONICAL_HISTORY_E_PHASE_CLUSTER_ID);
        assertThat(body.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(
                        CANONICAL_INFORMATICS_NETWORKS_ID,
                        CANONICAL_INFORMATICS_TCP_IP_ID,
                        CANONICAL_HISTORY_FORMS_OF_RULE_ID,
                        CANONICAL_HISTORY_INTERCULTURAL_ID)
                .doesNotContain(
                        LEGACY_INFORMATICS_E_PHASE_CLUSTER_ID,
                        LEGACY_HISTORY_E_PHASE_CLUSTER_ID,
                        LEGACY_INFORMATICS_WHY_ID,
                        LEGACY_HISTORY_WHY_ID);
        assertThat(jsonIds(frontier))
                .contains(
                        CANONICAL_INFORMATICS_NETWORKS_ID,
                        CANONICAL_INFORMATICS_TCP_IP_ID,
                        CANONICAL_HISTORY_FORMS_OF_RULE_ID,
                        CANONICAL_HISTORY_INTERCULTURAL_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_INFORMATICS_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_HISTORY_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_INFORMATICS_WHY_ID)
                .doesNotContain(LEGACY_HISTORY_WHY_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenOverviewLearnerToCanonicalGymnasiumRootWithHistoryAndGerman() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "bdc89685-73d3-446c-af5a-eaf642c07463": {"selected": true, "filterId": "LK"},
                  "f1ba2118-853f-4aa0-bef5-4f749bc621ed": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.saveAll(List.of(
                new PlannedGoal(learner, LEGACY_HISTORY_E_PHASE_CLUSTER_ID),
                new PlannedGoal(learner, LEGACY_GERMAN_E_PHASE_CLUSTER_ID)));
        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_HISTORY_WHY_ID, 1.0),
                new Mastery(learner, LEGACY_GERMAN_WHY_ID, 1.0)));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(2);
        assertThat(jsonIds(planned))
                .containsExactlyInAnyOrder(CANONICAL_HISTORY_E_PHASE_CLUSTER_ID, CANONICAL_GERMAN_E_PHASE_CLUSTER_ID);
        assertThat(body.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(
                        CANONICAL_HISTORY_FORMS_OF_RULE_ID,
                        CANONICAL_HISTORY_INTERCULTURAL_ID,
                        CANONICAL_GERMAN_GRAMMAR_ID,
                        CANONICAL_GERMAN_TEXT_TYPE_ID)
                .doesNotContain(
                        LEGACY_HISTORY_E_PHASE_CLUSTER_ID,
                        LEGACY_GERMAN_E_PHASE_CLUSTER_ID,
                        LEGACY_HISTORY_WHY_ID,
                        LEGACY_GERMAN_WHY_ID);
        assertThat(jsonIds(frontier))
                .contains(
                        CANONICAL_HISTORY_FORMS_OF_RULE_ID,
                        CANONICAL_HISTORY_INTERCULTURAL_ID,
                        CANONICAL_GERMAN_GRAMMAR_ID,
                        CANONICAL_GERMAN_TEXT_TYPE_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_HISTORY_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_GERMAN_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_HISTORY_WHY_ID)
                .doesNotContain(LEGACY_GERMAN_WHY_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenOverviewLearnerToCanonicalGymnasiumRootWithGermanAndEnglish() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "f1ba2118-853f-4aa0-bef5-4f749bc621ed": {"selected": true, "filterId": "LK"},
                  "bc2124fa-2974-46cc-85e7-2392e61250e1": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.saveAll(List.of(
                new PlannedGoal(learner, LEGACY_GERMAN_E_PHASE_CLUSTER_ID),
                new PlannedGoal(learner, LEGACY_ENGLISH_E_PHASE_CLUSTER_ID)));
        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_GERMAN_WHY_ID, 1.0),
                new Mastery(learner, LEGACY_ENGLISH_WHY_ID, 1.0)));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persistedConfig.path(CANONICAL_ENGLISH_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_ENGLISH_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_POLITICS_ECONOMICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(2);
        assertThat(jsonIds(planned))
                .containsExactlyInAnyOrder(CANONICAL_GERMAN_E_PHASE_CLUSTER_ID, CANONICAL_ENGLISH_E_PHASE_CLUSTER_ID);
        assertThat(body.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(
                        CANONICAL_GERMAN_GRAMMAR_ID,
                        CANONICAL_GERMAN_TEXT_TYPE_ID,
                        CANONICAL_ENGLISH_GROWING_UP_ID,
                        CANONICAL_ENGLISH_MAKING_A_DIFFERENCE_ID)
                .doesNotContain(
                        LEGACY_GERMAN_E_PHASE_CLUSTER_ID,
                        LEGACY_ENGLISH_E_PHASE_CLUSTER_ID,
                        LEGACY_GERMAN_WHY_ID,
                        LEGACY_ENGLISH_WHY_ID);
        assertThat(jsonIds(frontier))
                .contains(
                        CANONICAL_GERMAN_GRAMMAR_ID,
                        CANONICAL_GERMAN_TEXT_TYPE_ID,
                        CANONICAL_ENGLISH_GROWING_UP_ID,
                        CANONICAL_ENGLISH_MAKING_A_DIFFERENCE_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_GERMAN_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_ENGLISH_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_GERMAN_WHY_ID)
                .doesNotContain(LEGACY_ENGLISH_WHY_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenOverviewLearnerToCanonicalGymnasiumRootWithGermanAndFrench() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "f1ba2118-853f-4aa0-bef5-4f749bc621ed": {"selected": true, "filterId": "LK"},
                  "30acd190-609c-4109-8ee7-06fc5594af19": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.saveAll(List.of(
                new PlannedGoal(learner, LEGACY_GERMAN_E_PHASE_CLUSTER_ID),
                new PlannedGoal(learner, LEGACY_FRENCH_ROOT_ID)));
        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_GERMAN_WHY_ID, 1.0),
                new Mastery(learner, LEGACY_FRENCH_WHY_ID, 1.0)));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persistedConfig.path(CANONICAL_FRENCH_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_FRENCH_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_POLITICS_ECONOMICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_ENGLISH_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(2);
        assertThat(jsonIds(planned))
                .containsExactlyInAnyOrder(CANONICAL_GERMAN_E_PHASE_CLUSTER_ID, CANONICAL_FRENCH_ROOT_ID);
        assertThat(body.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(
                        CANONICAL_GERMAN_GRAMMAR_ID,
                        CANONICAL_GERMAN_TEXT_TYPE_ID,
                        CANONICAL_FRENCH_READ_FAMILY_ID,
                        CANONICAL_FRENCH_READ_YOUTH_ID)
                .doesNotContain(
                        LEGACY_GERMAN_E_PHASE_CLUSTER_ID,
                        LEGACY_FRENCH_ROOT_ID,
                        LEGACY_GERMAN_WHY_ID,
                        LEGACY_FRENCH_WHY_ID);
        assertThat(jsonIds(frontier))
                .contains(
                        CANONICAL_GERMAN_GRAMMAR_ID,
                        CANONICAL_GERMAN_TEXT_TYPE_ID,
                        CANONICAL_FRENCH_READ_FAMILY_ID,
                        CANONICAL_FRENCH_READ_YOUTH_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_GERMAN_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_FRENCH_ROOT_ID)
                .doesNotContain(LEGACY_GERMAN_WHY_ID)
                .doesNotContain(LEGACY_FRENCH_WHY_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenOverviewLearnerToCanonicalGymnasiumRootWithGermanAndLatin() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "f1ba2118-853f-4aa0-bef5-4f749bc621ed": {"selected": true, "filterId": "LK"},
                  "fe28bda8-03f3-4c4a-8286-7fcfce4eeac1": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.saveAll(List.of(
                new PlannedGoal(learner, LEGACY_GERMAN_E_PHASE_CLUSTER_ID),
                new PlannedGoal(learner, LEGACY_LATIN_E_PHASE_CLUSTER_ID)));
        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_GERMAN_WHY_ID, 1.0),
                new Mastery(learner, LEGACY_LATIN_WHY_ID, 1.0)));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persistedConfig.path(CANONICAL_LATIN_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_LATIN_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_POLITICS_ECONOMICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_ENGLISH_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_FRENCH_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(2);
        assertThat(jsonIds(planned))
                .containsExactlyInAnyOrder(CANONICAL_GERMAN_E_PHASE_CLUSTER_ID, CANONICAL_LATIN_E_PHASE_CLUSTER_ID);
        assertThat(body.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(
                        CANONICAL_GERMAN_GRAMMAR_ID,
                        CANONICAL_GERMAN_TEXT_TYPE_ID,
                        CANONICAL_LATIN_GRAMMAR_ID,
                        CANONICAL_LATIN_INTERPRETATION_ID)
                .doesNotContain(
                        LEGACY_GERMAN_E_PHASE_CLUSTER_ID,
                        LEGACY_LATIN_E_PHASE_CLUSTER_ID,
                        LEGACY_GERMAN_WHY_ID,
                        LEGACY_LATIN_WHY_ID);
        assertThat(jsonIds(frontier))
                .contains(
                        CANONICAL_GERMAN_GRAMMAR_ID,
                        CANONICAL_GERMAN_TEXT_TYPE_ID,
                        CANONICAL_LATIN_GRAMMAR_ID,
                        CANONICAL_LATIN_INTERPRETATION_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_GERMAN_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_LATIN_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_GERMAN_WHY_ID)
                .doesNotContain(LEGACY_LATIN_WHY_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenPoliticsEconomicsLearnerToCanonicalGymnasiumRoot() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_POLITICS_ECONOMICS_ID);
        learner.setPersonalCurriculum("""
                {
                  "1d0e9f8f-0087-49e4-8ea2-976e5a89b165": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.save(new PlannedGoal(learner, LEGACY_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID));
        masteryRepository.save(new Mastery(learner, LEGACY_POLITICS_ECONOMICS_WHY_ID, 1.0));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_POLITICS_ECONOMICS_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_POLITICS_ECONOMICS_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(1);
        assertThat(planned.get(0).path("id").asText()).isEqualTo(CANONICAL_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(goalOptions))
                .contains(
                        CANONICAL_POLITICS_ECONOMICS_SOCIETY_SYSTEMS_ID,
                        CANONICAL_POLITICS_ECONOMICS_MARKET_FOUNDATIONS_ID)
                .doesNotContain(LEGACY_POLITICS_ECONOMICS_WHY_ID, LEGACY_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID);
        assertThat(jsonIds(frontier))
                .contains(
                        CANONICAL_POLITICS_ECONOMICS_SOCIETY_SYSTEMS_ID,
                        CANONICAL_POLITICS_ECONOMICS_MARKET_FOUNDATIONS_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_POLITICS_ECONOMICS_WHY_ID)
                .doesNotContain(LEGACY_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID);
    }

    @Test
    void cutoverEndpointMigratesLegacyHessenOverviewLearnerToCanonicalGymnasiumRootWithPoliticsEconomicsAndHistory() throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_ROOT_ID);
        learner.setPersonalCurriculum("""
                {
                  "1d0e9f8f-0087-49e4-8ea2-976e5a89b165": {"selected": true, "filterId": "GK"},
                  "bdc89685-73d3-446c-af5a-eaf642c07463": {"selected": true, "filterId": "LK"}
                }
                """);
        learnerRepository.save(learner);

        plannedGoalRepository.saveAll(List.of(
                new PlannedGoal(learner, LEGACY_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID),
                new PlannedGoal(learner, LEGACY_HISTORY_E_PHASE_CLUSTER_ID)));
        masteryRepository.saveAll(List.of(
                new Mastery(learner, LEGACY_POLITICS_ECONOMICS_WHY_ID, 1.0),
                new Mastery(learner, LEGACY_HISTORY_WHY_ID, 1.0)));

        HttpResponse<String> response = postCutover();

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        Learner migratedLearner = learnerRepository.findById(learnerId).orElseThrow();
        JsonNode persistedConfig = objectMapper.readTree(migratedLearner.getPersonalCurriculum());
        JsonNode body = objectMapper.readTree(response.body());
        JsonNode planned = body.path("goals").path("planned");
        JsonNode goalOptions = body.path("stateMachine").path("goalOptions");
        JsonNode frontier = body.path("frontier");

        assertThat(migratedLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(body.path("curriculum").path("curriculumId").asText()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(persistedConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(persistedConfig.path(CANONICAL_POLITICS_ECONOMICS_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_POLITICS_ECONOMICS_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("selected").asBoolean()).isTrue();
        assertThat(persistedConfig.path(CANONICAL_HISTORY_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(persistedConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_CHEMISTRY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_BIOLOGY_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_INFORMATICS_ID).path("selected").asBoolean()).isFalse();
        assertThat(persistedConfig.path(CANONICAL_GERMAN_ID).path("selected").asBoolean()).isFalse();
        assertThat(planned).hasSize(2);
        assertThat(jsonIds(planned))
                .containsExactlyInAnyOrder(CANONICAL_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID, CANONICAL_HISTORY_E_PHASE_CLUSTER_ID);
        assertThat(body.path("stateMachine").path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(jsonIds(goalOptions))
                .contains(
                        CANONICAL_POLITICS_ECONOMICS_SOCIETY_SYSTEMS_ID,
                        CANONICAL_HISTORY_FORMS_OF_RULE_ID,
                        CANONICAL_HISTORY_INTERCULTURAL_ID)
                .doesNotContain(
                        LEGACY_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID,
                        LEGACY_HISTORY_E_PHASE_CLUSTER_ID,
                        LEGACY_POLITICS_ECONOMICS_WHY_ID,
                        LEGACY_HISTORY_WHY_ID);
        assertThat(jsonIds(frontier))
                .contains(
                        CANONICAL_POLITICS_ECONOMICS_SOCIETY_SYSTEMS_ID,
                        CANONICAL_HISTORY_FORMS_OF_RULE_ID,
                        CANONICAL_HISTORY_INTERCULTURAL_ID);

        assertThat(response.body())
                .doesNotContain(LEGACY_POLITICS_ECONOMICS_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_HISTORY_E_PHASE_CLUSTER_ID)
                .doesNotContain(LEGACY_POLITICS_ECONOMICS_WHY_ID)
                .doesNotContain(LEGACY_HISTORY_WHY_ID);
    }

    @Test
    void bulkCutoverEndpointDryRunReportsEligibleAndSkippedLearners() throws Exception {
        Learner eligibleLearner = new Learner();
        eligibleLearner.setSkillpilotId("bulk-eligible");
        eligibleLearner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_MATH_ID);
        eligibleLearner.setPersonalCurriculum("""
                {
                  "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3": {"selected": true, "filterId": "LK"}
                }
                """);
        learnerRepository.save(eligibleLearner);
        plannedGoalRepository.save(new PlannedGoal(eligibleLearner, LEGACY_MATH_ANALYSIS_CLUSTER_ID));

        Learner canonicalLearner = new Learner();
        canonicalLearner.setSkillpilotId("bulk-canonical");
        canonicalLearner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        canonicalLearner.setPersonalCurriculum("""
                {
                  "a0e13c56-c25f-4742-9272-3a1a603ee52e": {"selected": true, "filterId": "DE-HE"}
                }
                """);
        learnerRepository.save(canonicalLearner);

        Learner unsupportedLearner = new Learner();
        unsupportedLearner.setSkillpilotId("bulk-unsupported");
        unsupportedLearner.setSelectedCurriculum("unsupported-curriculum");
        learnerRepository.save(unsupportedLearner);

        Learner noCurriculumLearner = new Learner();
        noCurriculumLearner.setSkillpilotId("bulk-no-curriculum");
        learnerRepository.save(noCurriculumLearner);

        HttpResponse<String> response = postBulkCutover("""
                {
                  "skillpilotIds": [
                    "bulk-eligible",
                    "bulk-canonical",
                    "bulk-unsupported",
                    "bulk-no-curriculum",
                    "bulk-missing"
                  ],
                  "dryRun": true
                }
                """);

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        JsonNode body = objectMapper.readTree(response.body());
        JsonNode results = body.path("results");

        assertThat(body.path("dryRun").asBoolean()).isTrue();
        assertThat(body.path("requestedCount").asInt()).isEqualTo(5);
        assertThat(body.path("eligibleCount").asInt()).isEqualTo(1);
        assertThat(body.path("alreadyCanonicalCount").asInt()).isEqualTo(1);
        assertThat(body.path("unsupportedCount").asInt()).isEqualTo(1);
        assertThat(body.path("noCurriculumCount").asInt()).isEqualTo(1);
        assertThat(body.path("notFoundCount").asInt()).isEqualTo(1);
        assertThat(body.path("migratedCount").asInt()).isEqualTo(0);
        assertThat(body.path("errorCount").asInt()).isEqualTo(0);
        assertThat(results).hasSize(5);

        assertThat(findResultStatus(results, "bulk-eligible")).isEqualTo("eligible");
        assertThat(findResultStatus(results, "bulk-canonical")).isEqualTo("already_canonical");
        assertThat(findResultStatus(results, "bulk-unsupported")).isEqualTo("unsupported_curriculum");
        assertThat(findResultStatus(results, "bulk-no-curriculum")).isEqualTo("no_curriculum");
        assertThat(findResultStatus(results, "bulk-missing")).isEqualTo("not_found");

        assertThat(learnerRepository.findById("bulk-eligible").orElseThrow().getSelectedCurriculum())
                .isEqualTo(HESSEN_GYMNASIUM_UPPER_MATH_ID);
    }

    @Test
    void bulkCutoverEndpointMigratesMultipleLegacyHessenLearners() throws Exception {
        Learner mathLearner = new Learner();
        mathLearner.setSkillpilotId("bulk-math");
        mathLearner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_MATH_ID);
        mathLearner.setPersonalCurriculum("""
                {
                  "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3": {"selected": true, "filterId": "LK"}
                }
                """);
        learnerRepository.save(mathLearner);
        plannedGoalRepository.save(new PlannedGoal(mathLearner, LEGACY_MATH_ANALYSIS_CLUSTER_ID));
        masteryRepository.save(new Mastery(mathLearner, LEGACY_MATH_FUNCTION_CONCEPT_ID, 1.0));

        Learner physicsLearner = new Learner();
        physicsLearner.setSkillpilotId("bulk-physics");
        physicsLearner.setSelectedCurriculum(HESSEN_GYMNASIUM_UPPER_PHYSICS_ID);
        physicsLearner.setPersonalCurriculum("""
                {
                  "24f2ca0f-b94a-444e-bb70-677cb6f85c02": {"selected": true, "filterId": "GK"}
                }
                """);
        learnerRepository.save(physicsLearner);
        plannedGoalRepository.save(new PlannedGoal(physicsLearner, LEGACY_PHYSICS_CLUSTER_ID));
        masteryRepository.saveAll(List.of(
                new Mastery(physicsLearner, LEGACY_PHYSICS_WHY_ID, 1.0),
                new Mastery(physicsLearner, LEGACY_MATH_FUNCTION_CONCEPT_ID, 1.0),
                new Mastery(physicsLearner, LEGACY_MATH_READ_VALUES_ID, 1.0)));

        HttpResponse<String> response = postBulkCutover("""
                {
                  "skillpilotIds": [
                    "bulk-math",
                    "bulk-physics"
                  ],
                  "dryRun": false
                }
                """);

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());

        JsonNode body = objectMapper.readTree(response.body());
        JsonNode results = body.path("results");

        assertThat(body.path("dryRun").asBoolean()).isFalse();
        assertThat(body.path("requestedCount").asInt()).isEqualTo(2);
        assertThat(body.path("migratedCount").asInt()).isEqualTo(2);
        assertThat(body.path("eligibleCount").asInt()).isEqualTo(0);
        assertThat(body.path("errorCount").asInt()).isEqualTo(0);
        assertThat(findResultStatus(results, "bulk-math")).isEqualTo("migrated");
        assertThat(findResultStatus(results, "bulk-physics")).isEqualTo("migrated");

        Learner migratedMathLearner = learnerRepository.findById("bulk-math").orElseThrow();
        Learner migratedPhysicsLearner = learnerRepository.findById("bulk-physics").orElseThrow();

        assertThat(migratedMathLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);
        assertThat(migratedPhysicsLearner.getSelectedCurriculum()).isEqualTo(CANONICAL_GYMNASIUM_ROOT_ID);

        JsonNode mathConfig = objectMapper.readTree(migratedMathLearner.getPersonalCurriculum());
        JsonNode physicsConfig = objectMapper.readTree(migratedPhysicsLearner.getPersonalCurriculum());

        assertThat(mathConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(mathConfig.path(CANONICAL_MATH_PILOT_ID).path("filterId").asText()).isEqualTo("LK");
        assertThat(physicsConfig.path(CANONICAL_GYMNASIUM_ROOT_ID).path("filterId").asText()).isEqualTo("DE-HE");
        assertThat(physicsConfig.path(CANONICAL_PHYSICS_PILOT_ID).path("filterId").asText()).isEqualTo("GK");
        assertThat(physicsConfig.path(CANONICAL_MATH_PILOT_ID).path("selected").asBoolean()).isTrue();

        assertThat(plannedGoalRepository.findByLearner_SkillpilotId("bulk-math"))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_MATH_ANALYSIS_CLUSTER_ID);
        assertThat(plannedGoalRepository.findByLearner_SkillpilotId("bulk-physics"))
                .extracting(PlannedGoal::getGoalId)
                .containsExactly(CANONICAL_PHYSICS_CLUSTER_ID);
    }

    private String getLearnerStateBodyForPlannedGoals(String... goalIds) throws Exception {
        return getLearnerStateBody(List.of(goalIds), List.of());
    }

    private String getLearnerStateBody(List<String> plannedGoalIds, List<String> masteredGoalIds) throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_PHYSICS_PILOT_ID);
        learner.setPersonalCurriculum(CANONICAL_PHYSICS_GK_PERSONAL_CONFIG);
        learnerRepository.save(learner);

        masteryRepository.deleteAll();
        plannedGoalRepository.deleteAll();
        plannedGoalRepository.saveAll(
                plannedGoalIds.stream().map(goalId -> new PlannedGoal(learner, goalId)).toList());
        masteryRepository.saveAll(
                masteredGoalIds.stream().map(goalId -> new Mastery(learner, goalId, 1.0)).toList());

        HttpResponse<String> response = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:" + port + "/api/ui/learners/" + learnerId + "/state"))
                        .GET()
                        .build(),
                HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
        return response.body();
    }

    private String fetchLearnerStateBody() throws Exception {
        HttpResponse<String> response = HttpClient.newHttpClient().send(
                HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:" + port + "/api/ui/learners/" + learnerId + "/state"))
                        .GET()
                        .build(),
                HttpResponse.BodyHandlers.ofString());

        assertThat(response.statusCode()).isEqualTo(HttpStatus.OK.value());
        return response.body();
    }

    private HttpResponse<String> postCutover() throws Exception {
        return HttpClient.newHttpClient().send(
                HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:" + port + "/api/ui/learners/" + learnerId
                                + "/cutover/canonical-gymnasium"))
                        .POST(HttpRequest.BodyPublishers.noBody())
                        .build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> postBulkCutover(String body) throws Exception {
        return HttpClient.newHttpClient().send(
                HttpRequest.newBuilder()
                        .uri(URI.create("http://localhost:" + port + "/api/ui/learners/cutover/canonical-gymnasium/bulk"))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(body))
                        .build(),
                HttpResponse.BodyHandlers.ofString());
    }

    private String findResultStatus(JsonNode results, String skillpilotId) {
        for (JsonNode result : results) {
            if (skillpilotId.equals(result.path("skillpilotId").asText())) {
                return result.path("status").asText();
            }
        }
        return null;
    }

    private List<String> jsonIds(JsonNode nodes) {
        List<String> ids = new ArrayList<>();
        if (nodes == null || !nodes.isArray()) {
            return ids;
        }
        for (JsonNode node : nodes) {
            ids.add(node.path("id").asText());
        }
        return ids;
    }

}
