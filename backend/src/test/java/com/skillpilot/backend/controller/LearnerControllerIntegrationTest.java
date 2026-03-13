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
    private static final String HESSEN_GYMNASIUM_UPPER_ROOT_ID = "bbbf39f3-4a5b-46cf-9edd-48f2c54ae0da";
    private static final String HESSEN_GYMNASIUM_UPPER_MATH_ID = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
    private static final String HESSEN_GYMNASIUM_UPPER_PHYSICS_ID = "24f2ca0f-b94a-444e-bb70-677cb6f85c02";
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
    private static final String LEGACY_PHYSICS_CLUSTER_ID = "af70212d-e318-462d-a53f-fee8f05697d6";
    private static final String LEGACY_PHYSICS_E3_CLUSTER_ID = "0f3f9df2-37ee-4fd9-95b6-8786367d3794";
    private static final String LEGACY_PHYSICS_E2_CLUSTER_ID = "52c3d2e8-6634-4806-b84b-3709e3c4aef1";
    private static final String LEGACY_PHYSICS_CONSERVATION_CLUSTER_ID = "e26447c4-36a3-43ef-b400-ca918754f3b0";
    private static final String LEGACY_PHYSICS_ACCELERATED_ID = "d00d74e7-4fce-48e2-9d00-49f52082f8e6";
    private static final String LEGACY_PHYSICS_ENERGY_CONSERVATION_ID = "9aeaf941-baef-43fb-8077-50d37e600c26";
    private static final String LEGACY_PHYSICS_APPLY_F_EQUALS_M_A_ID = "0436c8fc-b849-4cab-84d7-32e92c0d94a9";
    private static final String LEGACY_PHYSICS_WHY_ID = "4b56b5c6-0e7b-4486-aa8f-7d5be7f085a5";
    private static final String LEGACY_PHYSICS_DIAGRAMS_ID = "e8160c09-a013-4146-80e6-b0e5dedd8fc6";
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
