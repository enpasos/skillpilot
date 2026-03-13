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

    private static final String CANONICAL_PHYSICS_PILOT_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String CANONICAL_PHYSICS_CLUSTER_ID = "65ddd780-0323-45d1-8f94-5e31bf28da23";
    private static final String CANONICAL_PHYSICS_E3_CLUSTER_ID = "82b5df3d-b1a7-4c6f-bd62-18fbbbe097a3";
    private static final String CANONICAL_PHYSICS_E2_CLUSTER_ID = "9340e894-bb0d-45a4-91f2-b90a63ad50a8";
    private static final String CANONICAL_PHYSICS_CONSERVATION_CLUSTER_ID = "e9d616d8-685f-4129-a36f-dae7a280bae7";
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

    private String getLearnerStateBodyForPlannedGoals(String... goalIds) throws Exception {
        return getLearnerStateBody(List.of(goalIds), List.of());
    }

    private String getLearnerStateBody(List<String> plannedGoalIds, List<String> masteredGoalIds) throws Exception {
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_PHYSICS_PILOT_ID);
        learner.setPersonalCurriculum("{}");
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
