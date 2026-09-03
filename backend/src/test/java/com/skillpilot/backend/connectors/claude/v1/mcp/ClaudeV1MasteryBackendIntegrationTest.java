package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestFixtures;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1TestProperties;
import com.skillpilot.backend.connectors.claude.v1.session.ClaudeV1LearningSessionRepository;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.domain.Mastery;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.service.LearnerService;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

/**
 * Integration proof for the Claude 1.0.3 completion boundary.
 *
 * <p>The MCP adapter, {@code CoachToolFacade}, {@link LearnerService}, repositories and canonical
 * curriculum graph are all real. The test deliberately does not replace or spy on the canonical
 * service boundary: a successor is proven to be backend-selected because it is absent from the
 * request and appears identically in both canonical persistence and the returned Claude context.</p>
 */
@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        ClaudeV1TestProperties.ENABLED,
        ClaudeV1TestProperties.SIGNING_SECRET,
        ClaudeV1TestProperties.CAPABILITY_SECRET,
        ClaudeV1TestProperties.BETA_DISABLED,
        "spring.datasource.url=jdbc:h2:mem:claude-v1-mastery-backend-integration;"
                + "DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;NON_KEYWORDS=VALUE"
})
class ClaudeV1MasteryBackendIntegrationTest {

    private static final String CANONICAL_GYMNASIUM_ROOT_ID =
            "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CANONICAL_MATH_LANDSCAPE_ID =
            "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_MATH_ROOT_SCOPE_ID =
            "c01b1ce9-a667-4a46-b251-ec33ae602b15";
    private static final String CANONICAL_MATH_ORIENTATION_ID =
            "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
    private static final String CANONICAL_MATH_SEK_ONE_ORIENTATION_ID =
            "65365dce-f33f-49d8-9516-42f75883aa86";
    private static final String CANONICAL_REPRESENTATION_CLUSTER_ID =
            "34047d7c-3a92-59fa-91b4-354211ff36e1";
    private static final String CANONICAL_CHOOSE_REPRESENTATION_ID =
            "8dd9f210-2683-5902-acab-e3be22725232";
    private static final String CANONICAL_CREATE_REPRESENTATION_ID =
            "3f4d1340-1fbb-5109-b9c2-08fc61303133";

    @Autowired
    private ClaudeV1McpContractAdapter contractAdapter;

    @Autowired
    private LearnerService learnerService;

    @Autowired
    private LearnerRepository learnerRepository;

    @Autowired
    private MasteryRepository masteryRepository;

    @Autowired
    private ClaudeV1LearningSessionRepository sessionRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private String learnerId;
    private String learningSessionId;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void ordinaryCompletionWritesOnlyTheActiveGoalAndCanonicalAutopilotSelectsTheSuccessor()
            throws Exception {
        createConfiguredLearner(true);
        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        masteryRepository.saveAndFlush(new Mastery(learner, CANONICAL_MATH_ORIENTATION_ID, 1.0));
        learnerService.setPlannedGoals(learnerId, Set.of(CANONICAL_REPRESENTATION_CLUSTER_ID));
        assertThat(learnerService.getUncompactedRichFrontierForFocus(
                        learnerId,
                        List.of(CANONICAL_REPRESENTATION_CLUSTER_ID)))
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_CHOOSE_REPRESENTATION_ID);
        learnerService.setActiveGoal(learnerId, CANONICAL_CHOOSE_REPRESENTATION_ID);

        Map<String, Double> masteryBefore = persistedMastery();
        long expectedStateVersion = currentStateVersion();
        Map<String, Object> response = callMastery(
                CANONICAL_CHOOSE_REPRESENTATION_ID,
                expectedStateVersion);

        assertSuccessfulCompletion(response, CANONICAL_CHOOSE_REPRESENTATION_ID);
        Map<String, Object> context = nestedMap(response, "context");
        Map<String, Object> returnedActiveGoal = nestedMap(context, "activeGoal");
        assertThat(returnedActiveGoal).containsEntry("id", CANONICAL_CREATE_REPRESENTATION_ID);
        assertThat(nestedMap(context, "stateMachine"))
                .containsEntry("requiredAction", "teachActiveGoal");
        assertThat(context).containsEntry("frontier", List.of());

        Learner persistedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(persistedLearner.getActiveGoalId()).isEqualTo(CANONICAL_CREATE_REPRESENTATION_ID);
        assertThat(((Number) response.get("stateVersion")).longValue())
                .isEqualTo(persistedLearner.getCoachStateRevision())
                .isGreaterThan(expectedStateVersion);

        assertOnlyCompletedGoalWasAdded(
                masteryBefore,
                CANONICAL_CHOOSE_REPRESENTATION_ID,
                CANONICAL_CREATE_REPRESENTATION_ID);
    }

    @Test
    void orientationCompletionWritesOnlyTheActiveGoalAndCanonicalAutopilotSelectsTheSuccessor()
            throws Exception {
        createConfiguredLearner(true);
        activateSekOneOrientation();

        Map<String, Double> masteryBefore = persistedMastery();
        long expectedStateVersion = currentStateVersion();
        Map<String, Object> response = callMastery(
                CANONICAL_MATH_SEK_ONE_ORIENTATION_ID,
                expectedStateVersion);

        assertSuccessfulCompletion(response, CANONICAL_MATH_SEK_ONE_ORIENTATION_ID);
        Map<String, Object> context = nestedMap(response, "context");
        String successorGoalId = nestedMap(context, "activeGoal").get("id").toString();
        assertThat(successorGoalId)
                .isNotBlank()
                .isNotEqualTo(CANONICAL_MATH_SEK_ONE_ORIENTATION_ID);
        assertThat(nestedMap(context, "stateMachine"))
                .containsEntry("state", "TEACHING")
                .hasEntrySatisfying(
                        "requiredAction",
                        requiredAction -> assertThat(requiredAction).isNotEqualTo("setActiveGoal"));
        assertThat(context).containsEntry("frontier", List.of());

        Learner persistedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(persistedLearner.getActiveGoalId()).isEqualTo(successorGoalId);
        assertThat(((Number) response.get("stateVersion")).longValue())
                .isEqualTo(persistedLearner.getCoachStateRevision())
                .isGreaterThan(expectedStateVersion);
        assertOnlyCompletedGoalWasAdded(
                masteryBefore,
                CANONICAL_MATH_SEK_ONE_ORIENTATION_ID,
                successorGoalId);
    }

    @Test
    void orientationCompletionWithoutAutopilotLeavesSuccessorSelectionOpenInCanonicalBackend()
            throws Exception {
        createConfiguredLearner(false);
        activateSekOneOrientation();

        Map<String, Double> masteryBefore = persistedMastery();
        long expectedStateVersion = currentStateVersion();
        Map<String, Object> response = callMastery(
                CANONICAL_MATH_SEK_ONE_ORIENTATION_ID,
                expectedStateVersion);

        assertSuccessfulCompletion(response, CANONICAL_MATH_SEK_ONE_ORIENTATION_ID);
        Map<String, Object> context = nestedMap(response, "context");
        assertThat(context.get("activeGoal")).isNull();
        assertThat(nestedMap(context, "stateMachine"))
                .containsEntry("requiredAction", "setActiveGoal");
        assertThat(context.get("frontier"))
                .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.LIST)
                .isNotEmpty();

        Learner persistedLearner = learnerRepository.findById(learnerId).orElseThrow();
        assertThat(persistedLearner.getActiveGoalId()).isNull();
        assertThat(((Number) response.get("stateVersion")).longValue())
                .isEqualTo(persistedLearner.getCoachStateRevision())
                .isGreaterThan(expectedStateVersion);
        assertOnlyCompletedGoalWasAdded(
                masteryBefore,
                CANONICAL_MATH_SEK_ONE_ORIENTATION_ID,
                null);
    }

    private void activateSekOneOrientation() {
        learnerService.setPlannedGoals(learnerId, Set.of(CANONICAL_MATH_ROOT_SCOPE_ID));
        assertThat(learnerService.getRichFrontier(learnerId))
                .extracting(FrontierGoal::id)
                .contains(CANONICAL_MATH_SEK_ONE_ORIENTATION_ID);
        learnerService.setActiveGoal(learnerId, CANONICAL_MATH_SEK_ONE_ORIENTATION_ID);
    }

    private void createConfiguredLearner(boolean autoPilot) {
        ClaudeV1TestFixtures.BoundLearner bound = ClaudeV1TestFixtures.createBoundLearner(
                learnerRepository,
                sessionRepository,
                0L);
        learnerId = bound.learnerId();
        learningSessionId = bound.connectionId();

        Learner learner = learnerRepository.findById(learnerId).orElseThrow();
        learner.setSelectedCurriculum(CANONICAL_GYMNASIUM_ROOT_ID);
        learner.setPersonalCurriculum(configuredPersonalCurriculum());
        learner.setLearningStrategy("SEQUENTIAL");
        learner.setAutoPilot(autoPilot);
        learner.setStrictMode(false);
        learner.setCoachStateRevision(0L);
        learnerRepository.saveAndFlush(learner);

        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                learningSessionId,
                "unused",
                List.of(
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_READ),
                        new SimpleGrantedAuthority("SCOPE_" + ClaudeV1Contract.SCOPE_WRITE))));
    }

    private Map<String, Object> callMastery(String goalId, long expectedStateVersion) throws Exception {
        Map<String, Object> arguments = new LinkedHashMap<>();
        arguments.put("learningSessionId", learningSessionId);
        arguments.put("goalId", goalId);
        arguments.put("workFeedback", "The learner completed the active learning goal.");
        arguments.put("outcomeFeedback", "The active learning goal is reached.");
        arguments.put("expectedStateVersion", expectedStateVersion);
        arguments.put("clientRequestId", UUID.randomUUID().toString());
        arguments.put("language", "en");

        McpStatelessServerFeatures.SyncToolSpecification specification = contractAdapter.toolSpecifications().stream()
                .filter(candidate -> ClaudeV1Contract.TOOL_SET_MASTERY.equals(candidate.tool().name()))
                .findFirst()
                .orElseThrow();
        McpSchema.CallToolResult result = specification.callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(ClaudeV1Contract.TOOL_SET_MASTERY, arguments));
        assertThat(result.isError()).isFalse();
        assertThat(result.content()).singleElement().isInstanceOf(McpSchema.TextContent.class);
        return objectMapper.readValue(
                ((McpSchema.TextContent) result.content().getFirst()).text(),
                new TypeReference<>() {});
    }

    private void assertSuccessfulCompletion(Map<String, Object> response, String completedGoalId) {
        assertThat(response)
                .containsEntry("status", "SUCCESS")
                .containsEntry("savedGoalId", completedGoalId)
                .containsEntry("savedMastery", 1.0)
                .doesNotContainKeys("activatedGoalId", "orientationPathId", "successorGoalId");
        assertThat(response.get("presentationInstruction").toString())
                .contains("returned context", "canonical backend state", "do not reload");
    }

    private void assertOnlyCompletedGoalWasAdded(
            Map<String, Double> masteryBefore,
            String completedGoalId,
            String successorGoalId) {
        Map<String, Double> masteryAfter = persistedMastery();
        Map<String, Double> expected = new LinkedHashMap<>(masteryBefore);
        expected.put(completedGoalId, 1.0);
        assertThat(masteryAfter).containsExactlyInAnyOrderEntriesOf(expected);
        if (successorGoalId != null) {
            assertThat(masteryAfter).doesNotContainKey(successorGoalId);
        }
    }

    private Map<String, Double> persistedMastery() {
        return masteryRepository.findByLearner_SkillpilotId(learnerId).stream()
                .collect(Collectors.toMap(
                        Mastery::getGoalKey,
                        Mastery::getValue,
                        (left, right) -> right,
                        LinkedHashMap::new));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> nestedMap(Map<String, Object> parent, String key) {
        assertThat(parent.get(key)).isInstanceOf(Map.class);
        return (Map<String, Object>) parent.get(key);
    }

    private long currentStateVersion() {
        return learnerRepository.findById(learnerId).orElseThrow().getCoachStateRevision();
    }

    private String configuredPersonalCurriculum() {
        return """
                {
                  "%s": {
                    "selected": true,
                    "filterId": "DE-HE",
                    "durationModel": "G9",
                    "stage": "CrossStage"
                  },
                  "%s": {"selected": true, "filterId": "GK"},
                  "__skillpilotPersonalizationFlow": {
                    "rootLandscapeId": "%s",
                    "completedOptionIds": [],
                    "migrationCompleted": true
                  }
                }
                """.formatted(
                CANONICAL_GYMNASIUM_ROOT_ID,
                CANONICAL_MATH_LANDSCAPE_ID,
                CANONICAL_GYMNASIUM_ROOT_ID);
    }
}
