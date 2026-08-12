package com.skillpilot.backend.openai.mcp.de;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.MemoryPracticeCard;
import com.skillpilot.backend.api.MemoryPracticeProgress;
import com.skillpilot.backend.api.MemoryPracticeResponse;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerCard;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchResultRequest;
import com.skillpilot.backend.api.VerifiedRecallBatchResultResponse;
import com.skillpilot.backend.api.VerifiedRecallBatchSavedResult;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.mcp.SkillPilotMcpToolResults;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpSessionCoordinator;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1SessionMetadata;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1SessionStateException;
import com.skillpilot.backend.service.OpenAiDeLearningSessionRequiredException;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.json.jackson3.JacksonMcpJsonMapperSupplier;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.server.ResponseStatusException;

class OpenAiDeCoachMcpContractTest {

    private static final String SERVER_BUILD = "0123456789abcdef0123456789abcdef01234567";

    private static final List<String> HISTORICAL_GOAL_VISUALIZATION_ARTIFACT_SHA256S = List.of(
            "12f95e377a40d9112068016e5b532f0bf45f43ae6deb9083f04a7e93f7cb6cdc",
            "5564f42d0885bb8c12b1067a8d5db4e09986279ed513277021181a198dd20881",
            "bed59e4cd9b2cd00c31523c6bcc110db7c396f676704730e3a2a9055f0a0555c",
            "45e1f58df32ef6cc194a7cdc6353bbd5bfc93ead407dd213cb5a64ff65b9faed",
            "157aab83e83d6fcf208c4a1ae138c020aa4f117e9b990ba78d029b570fb9644c");
    private static final String LEGACY_GOAL_VISUALIZATION_RESOURCE_URI =
            "ui://skillpilot/coach/v1/1.0.0/goal-visualization.html";
    private static final String LEGACY_GOAL_VISUALIZATION_ARTIFACT_SHA256 =
            "2655afdde360f80392318a868b51d1d3d8f0d27ab32e73255f0f22656b161e82";
    private static final String LEARNER_ID = "permanent-secret-learner-id";
    private static final String LEARNING_SESSION_ID =
            "sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    private static final String OTHER_LEARNING_SESSION_ID =
            "sps_BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
    private static final String CONNECTION_SECRET = "opaque-oauth-subject-secret";
    private static final String CHALLENGE = "Bearer resource_metadata=\"https://skillpilot.test/meta\"";
    private static final String INSUFFICIENT_SCOPE_CHALLENGE =
            "Bearer resource_metadata=\"https://skillpilot.test/meta\", error=\"insufficient_scope\"";
    private static final String TEST_WORK_FEEDBACK =
            "Dein sichtbarer Lösungsweg ist fachlich schlüssig und vollständig begründet.";
    private static final String TEST_OUTCOME_FEEDBACK =
            "Das Ergebnis ist vollständig richtig.";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private CoachToolFacade coachTools;
    private OpenAiDeCoachIdentityResolver identityResolver;
    private OpenAiDeV1McpContractAdapter contract;
    private SimpleMeterRegistry meterRegistry;
    private OpenAiDeV1McpSessionCoordinator sessionCoordinator;
    private String sessionCommunicationLocale;

    @BeforeEach
    void setUp() {
        coachTools = mock(CoachToolFacade.class);
        identityResolver = mock(OpenAiDeCoachIdentityResolver.class);
        when(identityResolver.resolveSkillpilotId(any(), eq(LEARNING_SESSION_ID)))
                .thenReturn(LEARNER_ID);
        when(coachTools.showGoalVisualizationsInChat(LEARNER_ID)).thenReturn(true);
        when(identityResolver.authenticationChallenge()).thenReturn(CHALLENGE);
        when(identityResolver.insufficientScopeChallenge()).thenReturn(INSUFFICIENT_SCOPE_CHALLENGE);
        meterRegistry = new SimpleMeterRegistry();
        sessionCommunicationLocale = "de";
        sessionCoordinator = mock(OpenAiDeV1McpSessionCoordinator.class);
        when(sessionCoordinator.read(any(), any())).thenAnswer(invocation ->
                sessionOperation(invocation.getArgument(1), 0L));
        when(sessionCoordinator.write(
                        any(),
                        any(),
                        anyLong(),
                        any(),
                        any(),
                        any()))
                .thenAnswer(invocation -> sessionOperation(invocation.getArgument(5), 1L));
        contract = new OpenAiDeV1McpContractAdapter(
                coachTools,
                new CoachStateProjection("https://skillpilot.test"),
                identityResolver,
                new OpenAiDeMcpTelemetry(
                        meterRegistry,
                        new OpenAiDeOperationalTelemetry(meterRegistry)),
                sessionCoordinator,
                "https://skillpilot.test",
                SERVER_BUILD,
                "skillpilot-memory-practice-contract-test-secret");
    }

    @Test
    void publishesExactlyTwelveNativeToolsWithSchemasSecurityAnnotationsAndDedicatedUiLinks() {
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = contract.toolSpecifications();

        assertThat(tools).hasSize(12);
        assertThat(tools.stream().map(spec -> spec.tool().name())).containsExactly(
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE,
                OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD,
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                OpenAiDeV1McpContractAdapter.SET_SCOPE,
                OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL,
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                OpenAiDeV1McpContractAdapter.START_RECALL,
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS,
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                OpenAiDeV1McpContractAdapter.GET_EXAM_EVALUATION);

        for (McpStatelessServerFeatures.SyncToolSpecification specification : tools) {
            McpSchema.Tool tool = specification.tool();
            assertThat(tool.inputSchema()).containsEntry("type", "object");
            assertThat(tool.outputSchema()).containsEntry("type", "object");
            assertThat(tool.annotations()).isNotNull();
            assertThat(tool.annotations().readOnlyHint()).isNotNull();
            assertThat(tool.annotations().destructiveHint()).isFalse();
            assertThat(tool.annotations().idempotentHint()).isNotNull();
            assertThat(tool.annotations().openWorldHint()).isFalse();
            assertThat(tool.meta().get("securitySchemes")).isInstanceOfSatisfying(List.class, schemes -> {
                assertThat(schemes).isNotEmpty();
                assertThat(schemes.getFirst()).isInstanceOfSatisfying(Map.class, scheme -> {
                    assertThat(scheme).containsEntry("type", "oauth2");
                    assertThat(scheme).containsKey("scopes");
                });
            });
            if (OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION.equals(tool.name())) {
                assertThat(tool.meta().get("ui"))
                        .isInstanceOfSatisfying(Map.class, ui -> assertThat(ui)
                                .containsEntry(
                                        "resourceUri",
                                        OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI));
                assertThat(tool.meta())
                        .containsEntry(
                                "openai/outputTemplate",
                                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI);
            } else if (OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE.equals(tool.name())) {
                assertThat(tool.meta().get("ui"))
                        .isInstanceOfSatisfying(Map.class, ui -> assertThat(ui)
                                .containsEntry(
                                        "resourceUri",
                                        OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI));
                assertThat(tool.meta())
                        .containsEntry(
                                "openai/outputTemplate",
                                OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI);
            } else if (OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD.equals(tool.name())) {
                assertThat(tool.meta().get("ui"))
                        .isInstanceOfSatisfying(Map.class, ui -> assertThat(ui)
                                .containsEntry("visibility", List.of("app"))
                                .doesNotContainKey("resourceUri"));
                assertThat(tool.meta()).doesNotContainKey("openai/outputTemplate");
            } else {
                assertThat(tool.meta()).doesNotContainKeys("ui", "openai/outputTemplate");
            }
            assertThat(tool.meta()).doesNotContainKey("openai/widgetAccessible");
        }
        assertThat(tools.stream().map(spec -> spec.tool().name()))
                .doesNotContain(
                        "open_skillpilot_start",
                        "issue_skillpilot_start_capability",
                        "set_skillpilot_curriculum",
                        "set_skillpilot_personalization",
                        "get_skillpilot_verified_recall_answer",
                        "record_skillpilot_verified_recall_result");
        assertThat(spec(OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool().annotations().readOnlyHint()).isTrue();
        assertThat(spec(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION)
                        .tool()
                        .annotations()
                        .readOnlyHint())
                .isTrue();
        assertThat(spec(OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE)
                        .tool()
                        .annotations()
                        .readOnlyHint())
                .isTrue();
        assertThat(spec(OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE)
                        .tool()
                        .annotations()
                        .idempotentHint())
                .isTrue();
        assertThat(spec(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD)
                        .tool()
                        .annotations()
                        .readOnlyHint())
                .isFalse();
        assertThat(spec(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD)
                        .tool()
                        .annotations()
                        .idempotentHint())
                .isTrue();
        assertThat(spec(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD)
                        .tool()
                        .meta()
                        .toString())
                .contains(OpenAiDeV1McpContractAdapter.READ_SCOPE, OpenAiDeV1McpContractAdapter.WRITE_SCOPE);
        assertThat(spec(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION)
                        .tool()
                        .annotations()
                        .idempotentHint())
                .isTrue();
        assertThat(spec(OpenAiDeV1McpContractAdapter.SET_MASTERY).tool().annotations().readOnlyHint()).isFalse();
        assertThat(spec(OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS).tool().annotations().idempotentHint())
                .isTrue();
        assertThat(spec(OpenAiDeV1McpContractAdapter.SET_SCOPE).tool().meta().toString())
                .contains(OpenAiDeV1McpContractAdapter.READ_SCOPE, OpenAiDeV1McpContractAdapter.WRITE_SCOPE);
        assertThat(spec(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION)
                        .tool()
                        .inputSchema()
                        .get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties)
                        .containsOnlyKeys(
                                "goalId",
                                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                                OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION));
        assertThat(spec(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION)
                        .tool()
                        .inputSchema()
                        .get("required"))
                .asString()
                .contains(
                        "goalId",
                        OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION);
        assertThat(spec(OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE)
                        .tool()
                        .inputSchema()
                        .get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties)
                        .containsOnlyKeys(
                                "goalId",
                                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                                OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION));
        assertThat(spec(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD)
                        .tool()
                        .inputSchema()
                        .get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties)
                        .containsOnlyKeys(
                                "goalId",
                                "cardId",
                                "rating",
                                "reviewCapability",
                                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                                OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                                OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID));
        JsonNode memoryReviewInputSchema = objectMapper.valueToTree(
                spec(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD)
                        .tool()
                        .inputSchema());
        assertThat(memoryReviewInputSchema.at("/properties/rating/enum"))
                .containsExactly(objectMapper.valueToTree("not_known"), objectMapper.valueToTree("known"));
        assertThat(spec(OpenAiDeV1McpContractAdapter.SET_MASTERY).tool().inputSchema().get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties)
                        .containsOnlyKeys(
                                "goalId",
                                OpenAiDeV1McpContractAdapter.ORIENTATION_PATH_ID,
                                OpenAiDeV1McpContractAdapter.WORK_FEEDBACK,
                                OpenAiDeV1McpContractAdapter.OUTCOME_FEEDBACK,
                                OpenAiDeV1McpContractAdapter.EXAM_EVALUATION_CAPABILITY,
                                OpenAiDeV1McpContractAdapter.EXAM_EARNED_POINTS,
                                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                                OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                                OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID));
        JsonNode masteryInputSchema = objectMapper.valueToTree(
                spec(OpenAiDeV1McpContractAdapter.SET_MASTERY).tool().inputSchema());
        assertThat(masteryInputSchema
                        .at("/properties/orientationPathId/minLength")
                        .asInt())
                .isEqualTo(1);
        assertThat(masteryInputSchema
                        .at("/properties/orientationPathId/maxLength")
                        .asInt())
                .isEqualTo(320);
        assertThat(masteryInputSchema.at("/required"))
                .containsExactly(
                        objectMapper.valueToTree("goalId"),
                        objectMapper.valueToTree(OpenAiDeV1McpContractAdapter.WORK_FEEDBACK),
                        objectMapper.valueToTree(OpenAiDeV1McpContractAdapter.OUTCOME_FEEDBACK),
                        objectMapper.valueToTree(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID),
                        objectMapper.valueToTree(OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION),
                        objectMapper.valueToTree(OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID));
        assertThat(spec(OpenAiDeV1McpContractAdapter.START_RECALL).tool().inputSchema().get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties)
                        .containsOnlyKeys(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID));
        JsonNode recallStartOutputSchema = objectMapper.valueToTree(
                spec(OpenAiDeV1McpContractAdapter.START_RECALL).tool().outputSchema());
        assertThat(recallStartOutputSchema.at("/properties").has("batchCapability")).isTrue();
        assertThat(recallStartOutputSchema.at("/properties").has("cards")).isTrue();
        assertThat(recallStartOutputSchema.at("/properties").has("batchSize")).isFalse();
        assertThat(recallStartOutputSchema.at("/properties").has("goalId")).isFalse();
        assertThat(recallStartOutputSchema.at("/properties").has("instruction")).isFalse();
        assertThat(recallStartOutputSchema.at("/properties/cards/items/properties").has("cardId")).isFalse();
        assertThat(spec(OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS).tool().inputSchema().get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties)
                        .containsOnlyKeys(
                                "batchCapability",
                                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID));
        JsonNode recallAnswersOutputSchema = objectMapper.valueToTree(
                spec(OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS).tool().outputSchema());
        assertThat(recallAnswersOutputSchema.at("/properties").has("instruction")).isFalse();
        JsonNode recallResultsInputSchema = objectMapper.valueToTree(
                spec(OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS).tool().inputSchema());
        assertThat(recallResultsInputSchema.at("/properties").fieldNames())
                .toIterable()
                .containsExactlyInAnyOrder(
                        "gradingCapability",
                        "assessments",
                        OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID);
        assertThat(recallResultsInputSchema.at("/required"))
                .containsExactly(
                        objectMapper.valueToTree("gradingCapability"),
                        objectMapper.valueToTree("assessments"),
                        objectMapper.valueToTree(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID));
        assertThat(recallResultsInputSchema.toString())
                .doesNotContain(
                        "goalId",
                        "cardId",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                        OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID);
        JsonNode recallResultsOutputSchema = objectMapper.valueToTree(
                spec(OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS).tool().outputSchema());
        assertThat(recallResultsOutputSchema.at("/properties").has("instruction")).isFalse();
        assertThat(recallResultsOutputSchema.at("/properties/next/properties").has("instruction")).isFalse();
        assertThat(recallResultsOutputSchema.at("/properties/continuation/properties").has("instruction"))
                .isTrue();
        assertThat(recallResultsOutputSchema.at("/properties/continuation/properties").has("toolCall"))
                .isTrue();
        assertThat(recallResultsOutputSchema.at("/properties/continuation/required")
                        .valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .doesNotContain("toolCall");
        assertThat(recallResultsOutputSchema
                        .at("/properties/continuation/properties/action/enum")
                        .valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .contains("renderGoalVisualizationThenTeachActiveGoal");
        JsonNode recallRendererToolCallSchema = recallResultsOutputSchema
                .at("/properties/continuation/properties/toolCall");
        assertThat(recallRendererToolCallSchema.path("additionalProperties").asBoolean()).isFalse();
        assertThat(recallRendererToolCallSchema.at("/required")
                        .valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .containsExactly("name", "arguments");
        assertThat(recallRendererToolCallSchema.at("/properties/name/enum")
                        .valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .containsExactly(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);
        JsonNode recallRendererArgumentsSchema = recallRendererToolCallSchema.at("/properties/arguments");
        assertThat(recallRendererArgumentsSchema.path("additionalProperties").asBoolean()).isFalse();
        assertThat(recallRendererArgumentsSchema.path("properties").fieldNames())
                .toIterable()
                .containsExactlyInAnyOrder(
                        "goalId",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION);
        assertThat(recallRendererArgumentsSchema.path("required")
                        .valueStream()
                        .map(JsonNode::asText)
                        .toList())
                .containsExactly(
                        "goalId",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION);
        assertThat(recallResultsOutputSchema.toString())
                .doesNotContain(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID);
        assertThat(recallResultsOutputSchema.at("/properties/context/properties").has("instruction"))
                .isFalse();
        assertThat(recallResultsOutputSchema.at("/properties/context/properties").has("requiredAction"))
                .isFalse();
        assertThat(recallResultsOutputSchema.at("/required"))
                .doesNotContain(objectMapper.valueToTree("next"), objectMapper.valueToTree("context"));
        assertThat(spec(OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool().outputSchema().get("required"))
                .asString()
                .contains(
                        "contractMajor",
                        "stateVersion",
                        "stateSchemaVersion",
                        "workflowVersion",
                        "curriculumRevision",
                        "extensions")
                .doesNotContain("presentationAction");
    }

    @Test
    void publishesActiveAndRetainedGoalVisualizationAndDedicatedMemoryPracticeResources() {
        assertThat(OpenAiDeV1ContractMetadata.RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S)
                .containsExactlyElementsOf(HISTORICAL_GOAL_VISUALIZATION_ARTIFACT_SHA256S);
        List<String> expectedResourceUris = Stream.of(
                        Stream.of(
                                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                                OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI,
                                LEGACY_GOAL_VISUALIZATION_RESOURCE_URI),
                        HISTORICAL_GOAL_VISUALIZATION_ARTIFACT_SHA256S.stream()
                                .map(OpenAiDeV1ContractMetadata::goalVisualizationResourceUri))
                .flatMap(stream -> stream)
                .toList();

        assertThat(contract.resourceSpecifications())
                .extracting(specification -> specification.resource().uri())
                .containsExactlyInAnyOrderElementsOf(expectedResourceUris);

        for (McpStatelessServerFeatures.SyncResourceSpecification specification
                : contract.resourceSpecifications()) {
            McpSchema.Resource resource = specification.resource();
            boolean memoryPractice = OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI
                    .equals(resource.uri());
            boolean prefersBorder = memoryPractice;
            assertThat(resource.mimeType())
                    .isEqualTo(OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE);
            assertThat(resource.meta().get("ui"))
                    .isInstanceOfSatisfying(Map.class, ui -> {
                        assertThat(ui.get("domain"))
                                .isEqualTo(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
                        assertThat(ui.get("prefersBorder")).isEqualTo(prefersBorder);
                        if (memoryPractice) {
                            assertThat(ui.toString())
                                    .contains("https://skillpilot.com", "redirectDomains")
                                    .doesNotContain("connectDomains", "resourceDomains");
                        } else {
                            assertThat(ui.toString())
                                    .contains("https://skillpilot.com", "resourceDomains")
                                    .doesNotContain("connectDomains", "redirectDomains");
                        }
                    });
            assertThat(resource.meta().get("openai/widgetDomain"))
                    .isEqualTo(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
            assertThat(resource.meta().get("openai/widgetPrefersBorder"))
                    .isEqualTo(prefersBorder);
            assertThat(resource.meta().get("openai/widgetCSP").toString())
                    .contains("resource_domains", "redirect_domains")
                    .doesNotContain("connect_domains");

            McpSchema.ReadResourceResult result = specification.readHandler().apply(
                    null, new McpSchema.ReadResourceRequest(resource.uri()));
            assertThat(result.contents())
                    .singleElement()
                    .isInstanceOfSatisfying(
                            McpSchema.TextResourceContents.class,
                            contents -> {
                                assertThat(contents.uri()).isEqualTo(resource.uri());
                                assertThat(contents.mimeType())
                                        .isEqualTo(
                                                OpenAiDeV1ContractMetadata
                                                        .MCP_APP_RESOURCE_MIME_TYPE);
                                assertThat(contents.text())
                                        .startsWith("<!doctype html>")
                                        .contains("ui/notifications/tool-result", "ui/open-link")
                                        .doesNotContain("<script src=");
                                if (memoryPractice) {
                                    assertThat(contents.text())
                                            .contains(
                                                    "skillpilotMemoryCard",
                                                    OpenAiDeV1McpContractAdapter
                                                            .REVIEW_MEMORY_PRACTICE_CARD)
                                            .doesNotContain("goalVisualization");
                                } else {
                                    assertThat(contents.text())
                                            .contains("goalVisualization")
                                            .doesNotContain("skillpilotMemoryCard");
                                }
                                assertThat(contents.meta().get("ui"))
                                        .isInstanceOfSatisfying(
                                                Map.class,
                                                ui -> {
                                                    assertThat(ui.get("domain"))
                                                            .isEqualTo(
                                                                    OpenAiDeV1ContractMetadata
                                                                            .WIDGET_DOMAIN);
                                                    assertThat(ui.get("prefersBorder"))
                                                            .isEqualTo(prefersBorder);
                                                });
                                assertThat(contents.meta().get("openai/widgetDomain"))
                                        .isEqualTo(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
                                assertThat(contents.meta().get("openai/widgetPrefersBorder"))
                                        .isEqualTo(prefersBorder);
                                assertThat(sha256(contents.text()))
                                        .isEqualTo(LEGACY_GOAL_VISUALIZATION_RESOURCE_URI.equals(resource.uri())
                                                ? LEGACY_GOAL_VISUALIZATION_ARTIFACT_SHA256
                                                : artifactSha256(resource.uri()));
                            });
        }

        assertThat(meterRegistry
                        .get(OpenAiDeMcpTelemetry.RESOURCE_READ_DURATION_METRIC)
                        .tags(
                                "artifact",
                                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_ARTIFACT_SHA256
                                        .substring(0, 12),
                                "role",
                                "active",
                                "status",
                                "success")
                        .timer()
                        .count())
                .isEqualTo(1);
        for (String retainedSha256 : HISTORICAL_GOAL_VISUALIZATION_ARTIFACT_SHA256S) {
            assertThat(meterRegistry
                            .get(OpenAiDeMcpTelemetry.RESOURCE_READ_DURATION_METRIC)
                            .tags(
                                    "artifact",
                                    retainedSha256.substring(0, 12),
                                    "role",
                                    "retained",
                                    "status",
                                    "success")
                            .timer()
                            .count())
                    .isEqualTo(1);
        }
        assertThat(meterRegistry
                        .get(OpenAiDeMcpTelemetry.RESOURCE_READ_DURATION_METRIC)
                        .tags(
                                "artifact",
                                OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_ARTIFACT_SHA256
                                        .substring(0, 12),
                                "role",
                                "active",
                                "status",
                                "success")
                        .timer()
                        .count())
                .isEqualTo(1);
    }

    @Test
    void keepsOriginalVersionedGoalVisualizationResourceByteExactAndPassive() {
        McpStatelessServerFeatures.SyncResourceSpecification legacyResource =
                contract.resourceSpecifications().stream()
                        .filter(specification -> LEGACY_GOAL_VISUALIZATION_RESOURCE_URI
                                .equals(specification.resource().uri()))
                        .findFirst()
                        .orElseThrow(() -> new AssertionError(
                                "The originally advertised V1 goal-visualization resource must remain readable."));

        McpSchema.ReadResourceResult result = legacyResource.readHandler().apply(
                null, new McpSchema.ReadResourceRequest(LEGACY_GOAL_VISUALIZATION_RESOURCE_URI));
        assertThat(result.contents())
                .singleElement()
                .isInstanceOfSatisfying(
                        McpSchema.TextResourceContents.class,
                        contents -> {
                            assertThat(contents.uri()).isEqualTo(LEGACY_GOAL_VISUALIZATION_RESOURCE_URI);
                            assertThat(contents.mimeType())
                                    .isEqualTo(OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE);
                            assertThat(sha256(contents.text()))
                                    .isEqualTo(LEGACY_GOAL_VISUALIZATION_ARTIFACT_SHA256);
                        });

        assertThat(contract.toolSpecifications())
                .allSatisfy(specification -> {
                    Object ui = specification.tool().meta().get("ui");
                    if (ui instanceof Map<?, ?> uiMeta) {
                        assertThat(uiMeta.get("resourceUri"))
                                .isNotEqualTo(LEGACY_GOAL_VISUALIZATION_RESOURCE_URI);
                    }
                    assertThat(specification.tool().meta().get("openai/outputTemplate"))
                            .isNotEqualTo(LEGACY_GOAL_VISUALIZATION_RESOURCE_URI);
                });
    }

    private static String artifactSha256(String resourceUri) {
        int start = resourceUri.indexOf("/sha256-") + "/sha256-".length();
        return resourceUri.substring(start, resourceUri.indexOf('/', start));
    }

    private static String sha256(String source) {
        try {
            return HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256")
                            .digest(source.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("JVM does not provide SHA-256.", exception);
        }
    }

    @Test
    void contextToolIsTheSingleExplicitBootstrapForSkillpilotLearningIntents() {
        McpSchema.Tool bootstrap = spec(OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool();

        assertThat(bootstrap.title()).isEqualTo("Start or continue the SkillPilot learning coach");
        assertThat(bootstrap.description())
                .contains("Required to start or refresh a SkillPilot coaching turn")
                .contains("unless this turn already has a successful state-changing result")
                .contains("one-hour remaining-lifetime guard")
                .contains("authoritative configured learning context")
                .contains("Do not call it redundantly after such a fresh mutation successor")
                .contains("Without either successful full result")
                .contains("generic advice", "self-created curriculum", "invented goals")
                .contains("unrelated to SkillPilot");
        assertThat(bootstrap.inputSchema())
                .containsEntry("type", "object")
                .containsEntry("additionalProperties", false);
        assertThat(bootstrap.inputSchema().get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties)
                        .containsOnlyKeys(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID));
        assertThat(bootstrap.annotations().readOnlyHint()).isTrue();
        assertThat(bootstrap.annotations().idempotentHint()).isTrue();
        assertThat(bootstrap.meta().toString())
                .contains(OpenAiDeV1McpContractAdapter.READ_SCOPE)
                .doesNotContain(OpenAiDeV1McpContractAdapter.WRITE_SCOPE);
        assertThat(contract.toolSpecifications().stream()
                        .filter(specification -> specification.tool().description() != null
                                && specification.tool().description().contains(
                                        "Required to start or refresh a SkillPilot coaching turn")))
                .singleElement()
                .extracting(specification -> specification.tool().name())
                .isEqualTo(OpenAiDeV1McpContractAdapter.GET_CONTEXT);
    }

    @Test
    void modelFacingInputSchemasOmitTechnicalStringValidationDetails() throws Exception {
        for (McpStatelessServerFeatures.SyncToolSpecification specification : contract.toolSpecifications()) {
            JsonNode inputSchema = objectMapper.valueToTree(specification.tool().inputSchema());
            if (OpenAiDeV1McpContractAdapter.SET_MASTERY.equals(specification.tool().name())
                    && inputSchema.path("properties") instanceof ObjectNode properties) {
                // orientationPathId is an authored public selector whose explicit bounds
                // are part of the V1 contract. All remaining model-facing strings stay
                // free of technical validators.
                properties.remove(OpenAiDeV1McpContractAdapter.ORIENTATION_PATH_ID);
            }
            if (OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS.equals(specification.tool().name())
                    && inputSchema.at("/properties/assessments/items/properties") instanceof ObjectNode properties) {
                // Recall feedback is learner-facing assessment content. Its explicit
                // 1..800 bound is part of the public contract, not a technical token format.
                properties.remove("feedback");
            }
            String inputSchemaJson = objectMapper.writeValueAsString(inputSchema);

            assertThat(inputSchemaJson)
                    .as("model-facing input schema of %s", specification.tool().name())
                    .doesNotContain("\"pattern\"", "\"minLength\"", "\"maxLength\"", "\"format\"");
        }

        McpSchema.Tool contextTool = spec(OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool();
        assertThat(contextTool.inputSchema().get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties
                                .get(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID))
                        .isInstanceOfSatisfying(Map.class, learningSessionSchema -> assertThat(learningSessionSchema)
                                .containsEntry("type", "string")
                                .containsEntry(
                                        "description",
                                        "Copy exactly and unchanged from the current SkillPilot start message and "
                                                + "send it with every tool call.")
                                .containsOnlyKeys("type", "description")));
    }

    @Test
    void contextOutputSchemaKeepsLearningStateAndOmitsWebGuiOwnedSetupState() {
        JsonNode contextSchema =
                objectMapper.valueToTree(spec(OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool().outputSchema());

        assertThat(contextSchema.at("/properties/orientationOutlook/type").asText())
                .isEqualTo("object");
        assertThat(contextSchema.at("/properties/orientationOutlook/properties/paths/minItems").asInt())
                .isEqualTo(2);
        assertThat(contextSchema.at("/properties/orientationOutlook/properties/paths/maxItems").asInt())
                .isEqualTo(4);
        assertThat(contextSchema
                        .at("/properties/orientationOutlook/properties/paths/items/properties/practicalContexts/maxItems")
                        .asInt())
                .isEqualTo(3);
        assertThat(contextSchema
                        .at("/properties/orientationOutlook/properties/paths/items/properties/representativeGoalTitles/maxItems")
                        .asInt())
                .isEqualTo(4);
        assertThat(contextSchema.at("/properties/goalVisualization/type").asText())
                .isEqualTo("object");
        assertThat(contextSchema.at("/properties/goalVisualization/properties/imageUrl/type").asText())
                .isEqualTo("string");
        assertThat(contextSchema.at("/properties/goalVisualization/properties/altText/type").asText())
                .isEqualTo("string");
        assertThat(contextSchema.at("/properties/activeGoal/properties/semanticKind/type").asText())
                .isEqualTo("string");
        assertThat(contextSchema.at("/properties/frontier/items/properties/semanticKind/type").asText())
                .isEqualTo("string");

        JsonNode properties = contextSchema.path("properties");
        assertThat(properties.has("orientation")).isFalse();
        assertThat(properties.has("curriculumCatalog")).isFalse();
        assertThat(properties.has("personalizationHistory")).isFalse();
        assertThat(properties.has("decision")).isFalse();
        assertThat(properties.has("presentationAction")).isFalse();
        assertThat(contextSchema.at("/required").valueStream().map(JsonNode::asText).toList())
                .doesNotContain(
                        "orientation",
                        "curriculumCatalog",
                        "personalizationHistory",
                        "decision",
                        "presentationAction");
    }
    @Test
    void dedicatedReadOnlyToolRendersOnlyTheCurrentTrustedVisualization() {
        UnifiedLearnerStateResponse state = visualizationState();
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);

        McpSchema.CallToolResult contextResult =
                call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());
        OpenAiDeCoachContext context = structured(contextResult, OpenAiDeCoachContext.class);

        assertThat(context.goalVisualization()).isNotNull();
        assertThat(context.nextAllowedTools())
                .contains(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);
        assertThat(spec(OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool().meta())
                .doesNotContainKeys("ui", "openai/outputTemplate");
        assertThat(spec(OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL).tool().meta())
                .doesNotContainKeys("ui", "openai/outputTemplate");

        McpSchema.CallToolResult renderResult = call(
                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                Map.of("goalId", "goal-with-image"));
        OpenAiDeV1McpContractAdapter.GoalVisualizationRenderResult render = structured(
                renderResult,
                OpenAiDeV1McpContractAdapter.GoalVisualizationRenderResult.class);

        assertThat(renderResult.isError()).isFalse();
        assertThat(renderResult.content())
                .noneMatch(McpSchema.ImageContent.class::isInstance);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION, renderResult);
        assertThat(render.goalVisualization()).isEqualTo(context.goalVisualization());
        assertThat(render.goalVisualization().imageUrl())
                .isEqualTo("https://skillpilot.test/assets/goal-visualizations/physik/"
                        + "goal-with-image/goal-with-image.jpg?v=" + SERVER_BUILD);
    }

    @Test
    void visualizationRejectsAStaleStateVersionWithoutRetryingTheImage() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(visualizationState());

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                Map.of(
                        "goalId", "goal-with-image",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION, 1L));

        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "STATE_VERSION_CONFLICT")
                .containsEntry("stateVersion", 0L)
                .containsEntry("stateChanged", false));
        assertThat(result.content().toString())
                .contains("versuche dieses Bild nicht automatisch erneut");
        verify(coachTools, never()).getLearnerState(LEARNER_ID);
    }

    @Test
    void visualizationRejectsAChangedGoalAtTheSameStateVersion() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(visualizationState());

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                Map.of(
                        "goalId", "previous-goal-with-image",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION, 0L));

        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "INVALID_INPUT")
                .containsEntry("stateVersion", 0L)
                .containsEntry("stateChanged", false));
        assertThat(result.content().toString()).contains("kein freigegebenes Lernzielbild");
        verify(coachTools).getLearnerState(LEARNER_ID);
    }

    @Test
    void visualizationFailsClosedWithoutCurrentSessionMetadata() {
        OpenAiDeV1McpContractAdapter contractWithoutSessionCoordinator = new OpenAiDeV1McpContractAdapter(
                coachTools,
                new CoachStateProjection("https://skillpilot.test"),
                identityResolver,
                new OpenAiDeMcpTelemetry(
                        meterRegistry,
                        new OpenAiDeOperationalTelemetry(meterRegistry)),
                null,
                "https://skillpilot.test",
                "skillpilot-memory-practice-contract-test-secret");
        McpStatelessServerFeatures.SyncToolSpecification renderer = contractWithoutSessionCoordinator
                .toolSpecifications()
                .stream()
                .filter(candidate -> OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION.equals(
                        candidate.tool().name()))
                .findFirst()
                .orElseThrow();

        McpSchema.CallToolResult result = renderer.callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(
                        OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                        Map.of(
                                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID,
                                "goalId", "goal-with-image",
                                OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION, 0L)));

        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "INTERNAL_ERROR")
                .containsEntry("retryable", false)
                .containsEntry("stateChanged", false));
        assertThat(result.content().toString())
                .contains("Continue without the image")
                .contains("do not retry it automatically");
        verify(coachTools, never()).getLearnerState(LEARNER_ID);
    }

    @Test
    void missingOrDisabledVisualizationNeverOffersOrRendersTheUiTool() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(normalState("teachActiveGoal"));

        OpenAiDeCoachContext missing = structured(
                call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of()),
                OpenAiDeCoachContext.class);

        assertThat(missing.goalVisualization()).isNull();
        assertThat(missing.nextAllowedTools())
                .doesNotContain(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);
        assertThat(call(
                                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                                Map.of("goalId", "goal-public-id"))
                        .isError())
                .isTrue();

        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(visualizationState());
        when(coachTools.showGoalVisualizationsInChat(LEARNER_ID)).thenReturn(false);

        OpenAiDeCoachContext disabled = structured(
                call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of()),
                OpenAiDeCoachContext.class);

        assertThat(disabled.goalVisualization()).isNull();
        assertThat(disabled.nextAllowedTools())
                .doesNotContain(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);
        McpSchema.CallToolResult disabledRender = call(
                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                Map.of("goalId", "goal-with-image"));
        assertThat(disabledRender.isError()).isTrue();
        assertThat(disabledRender.content().toString()).contains("kein freigegebenes Lernzielbild");
    }

    @Test
    void nativeMcpSerializationPublishesOutputSchemaAnnotationsAndOpenAiSecurityMirror() throws Exception {
        String json = new JacksonMcpJsonMapperSupplier().get().writeValueAsString(
                spec(OpenAiDeV1McpContractAdapter.SET_SCOPE).tool());

        assertThat(json)
                .contains("\"outputSchema\"")
                .contains("\"annotations\"")
                .contains("\"readOnlyHint\":false")
                .contains("\"destructiveHint\":false")
                .contains("\"idempotentHint\":true")
                .contains("\"openWorldHint\":false")
                .contains("\"_meta\"")
                .contains("\"securitySchemes\"")
                .contains(OpenAiDeV1McpContractAdapter.READ_SCOPE, OpenAiDeV1McpContractAdapter.WRITE_SCOPE);
    }

    @Test
    void contextUsesRealContentAndStructuredContentWithoutLearnerIdSecretsOrExamSolution() throws Exception {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(releasedExamState());

        McpSchema.CallToolResult result = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(result.isError()).isFalse();
        assertThat(result.content()).singleElement().isInstanceOfSatisfying(
                McpSchema.TextContent.class,
                text -> assertThat(text.text())
                        .contains("SkillPilot-Kontext geladen")
                        .doesNotContain(LEARNER_ID, CONNECTION_SECRET, "SECRET SOLUTION"));
        assertThat(result.structuredContent()).isInstanceOf(Map.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_CONTEXT, result);
        String nativeResultJson = new JacksonMcpJsonMapperSupplier().get().writeValueAsString(result);
        assertThat(nativeResultJson)
                .contains("\"content\"")
                .contains("\"structuredContent\"")
                .doesNotContain(":null", LEARNER_ID, "SECRET SOLUTION");
        OpenAiDeCoachContext context = structured(result, OpenAiDeCoachContext.class);
        assertThat(context.curriculumCatalog()).isNull();
        assertThat(context.curriculum().curriculumId()).isEqualTo("curriculum-public-id");
        assertThat(context.activeGoal().goalId()).isEqualTo("exam-public-id");
        assertThat(context.activeGoal().exam().taskContent()).isEqualTo("Sichtbare Prüfungsaufgabe");
        assertThat(context.activeGoal().exam().maxPoints()).isEqualTo(10.0);
        assertThat(context.instruction())
                .contains("keine lösungslenkenden Hinweise")
                .contains("keine Nachfragen")
                .contains(OpenAiDeV1McpContractAdapter.GET_EXAM_EVALUATION);
        assertThat(context.policies())
                .anySatisfy(policy -> assertThat(policy).contains("wortgetreu"))
                .anySatisfy(policy -> assertThat(policy).contains("nur sichtbare Arbeit"))
                .anySatisfy(policy -> assertThat(policy).contains("Bestehenspunktzahl"))
                .anySatisfy(policy -> assertThat(policy).contains("Dollar-Delimiter"))
                .anySatisfy(policy -> assertThat(policy).contains("keine Tool-, API-, JSON- oder Feldnamen"));

        String json = objectMapper.writeValueAsString(result.structuredContent());
        assertThat(json)
                .contains("curriculum-public-id", "exam-public-id", "Sichtbare Prüfungsaufgabe")
                .doesNotContain(":null")
                .doesNotContain(
                        LEARNER_ID,
                        CONNECTION_SECRET,
                        "copied-learner-secret-id",
                        "SECRET SOLUTION",
                        "SECRET RUBRIC",
                        "SECRET SOURCE",
                        "solutionContent",
                        "passingPoints");
        verify(identityResolver, never()).requireWriteAccess(any());
    }

    @Test
    void unconfiguredWebGuiContextFailsClosedWithoutPublishingSetupChoices() {
        LandscapeSummary canonicalSchool = curriculumSummary(
                OpenAiDeCurriculumOptionFacets.CANONICAL_GYMNASIUM_ROOT_ID,
                "Gymnasium (DE)",
                "Other",
                false,
                false);
        when(coachTools.getLearnerState(LEARNER_ID))
                .thenReturn(curriculumSetupState(List.of(canonicalSchool)));

        McpSchema.CallToolResult result = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "SESSION_REQUIRED")
                .containsEntry("configurationRequired", true)
                .containsEntry("oauthConnectionValid", true)
                .containsEntry("startUrl", "https://skillpilot.test")
                .containsEntry("communicationLocale", "de")
                .containsKey("instruction")
                .doesNotContainKeys(
                        "instructions",
                        "options",
                        "curriculumCatalog",
                        "decision",
                        "personalizationHistory",
                        "recoveryTool",
                        "purpose"));
        assertThat(result.content().toString())
                .contains("SkillPilot-WebGUI", "Lernen starten", "neuen Chat")
                .doesNotContain(canonicalSchool.getCurriculumId());
        verify(coachTools, never()).getPersonalizationPlan(any());
    }
    @Test
    void releasedExamSummariesRemainSelectableWithoutExposingProtectedExamContent() throws Exception {
        FrontierGoal examFolder = clusterGoal(
                "5fb3ee61-059c-47f4-8c6f-7285d7982a41",
                "Prüfungen Jahrgangsstufe 8");
        FrontierGoal taskOne = readyExamSummary(
                "4553367f-6265-511b-8632-46d99109e69b",
                "Aufgabe 1 (Jahrgangsstufe 8, 8 BE)");
        FrontierGoal taskTwo = readyExamSummary(
                "df9ecf0f-f4c9-5859-b99e-11cb62f6bb35",
                "Aufgabe 2 (Jahrgangsstufe 8, 6 BE)");
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-public-id",
                "Mathematik Hessen",
                "",
                "DE",
                "HE",
                "school",
                "Mathematik",
                "de",
                List.of());
        UnifiedLearnerStateResponse state = new UnifiedLearnerStateResponse(
                LEARNER_ID,
                curriculum,
                List.of(examFolder, taskOne, taskTwo),
                new LearnerGoals(
                        List.of(examFolder),
                        20,
                        25,
                        new GoalStats(20, 25),
                        new GoalStats(2, 7),
                        false),
                List.of("setActiveGoal"),
                List.of(),
                Set.of(),
                "frontier",
                null,
                new StateMachineInfo(
                        "FRONTIER",
                        "setActiveGoal",
                        List.of(taskOne, taskTwo),
                        List.of(),
                        null));
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);

        McpSchema.CallToolResult contextResult = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());
        OpenAiDeCoachContext context = structured(contextResult, OpenAiDeCoachContext.class);

        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_CONTEXT, contextResult);
        assertThat(context.requiredAction()).isEqualTo("setActiveGoal");
        assertThat(context.activeGoal()).isNull();
        assertThat(context.nextAllowedTools()).contains(OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL);
        assertThat(context.options())
                .extracting(OpenAiDeCoachContext.Option::kind, OpenAiDeCoachContext.Option::id)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("goal", taskOne.id()),
                        org.assertj.core.groups.Tuple.tuple("goal", taskTwo.id()));
        assertThat(context.frontier())
                .extracting(OpenAiDeCoachContext.Goal::goalId)
                .containsExactly(taskOne.id(), taskTwo.id());
        assertThat(context.instruction()).doesNotContain("keine sicheren Optionen");

        McpSchema.CallToolResult navigationResult = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "goal"));
        OpenAiDeV1McpContractAdapter.NavigationResult navigation =
                structured(navigationResult, OpenAiDeV1McpContractAdapter.NavigationResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_NAVIGATION, navigationResult);
        assertThat(navigation.requiredAction()).isEqualTo("setActiveGoal");
        assertThat(navigation.options())
                .extracting(OpenAiDeCoachContext.Option::kind, OpenAiDeCoachContext.Option::id)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("goal", taskOne.id()),
                        org.assertj.core.groups.Tuple.tuple("goal", taskTwo.id()));
        assertThat(navigation.instruction()).doesNotContain("keine sicheren Optionen");

        assertThat(objectMapper.writeValueAsString(contextResult.structuredContent()))
                .doesNotContain(
                        examFolder.id(),
                        "examReadyForSelection",
                        "examData",
                        "taskContent",
                        "solutionContent",
                        "passingPoints");
        assertThat(objectMapper.writeValueAsString(navigationResult.structuredContent()))
                .doesNotContain(
                        examFolder.id(),
                        "examReadyForSelection",
                        "examData",
                        "taskContent",
                        "solutionContent",
                        "passingPoints");
        verify(coachTools, never()).setActiveGoal(any(), any());
    }

    @Test
    void userFacingContextUsesTheLocalePinnedToTheLearningSession() {
        sessionCommunicationLocale = "en-GB";
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(normalState("teachActiveGoal"));

        McpSchema.CallToolResult result = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(result.isError()).isFalse();
        assertThat(result.content().toString())
                .contains("SkillPilot context loaded")
                .doesNotContain("SkillPilot-Kontext geladen");
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("communicationLocale", "en-GB"));
    }

    @Test
    void serverAndExamInstructionsRequireEquivalentSolutionsExplicitCriteriaAndNoExamQuestions() {
        assertThat(contract.serverInstructions())
                .contains("After each new learner message, establish exactly one fresh full SkillPilot context "
                        + "before learner-facing SkillPilot coaching")
                .contains("A successful state-changing tool result that contains its full successor context also "
                        + "satisfies the requirement")
                .contains("Do not insert get_skillpilot_context or another SkillPilot tool before the required "
                        + "renderer")
                .contains("continuation.action=renderGoalVisualizationThenTeachActiveGoal is the sole cross-flow "
                        + "exception")
                .contains("use its continuation.toolCall as this one required render call")
                .contains("do not derive a second call from context")
                .contains("A successful mastery result is the one ordering exception")
                .contains("first give both learner-facing texts from completionHandoff")
                .contains("only then begin the already activated successor")
                .contains("Never call get_skillpilot_navigation or set_skillpilot_active_goal")
                .contains("invented learning path")
                .contains("Assess meaning rather than wording")
                .contains("alternative methods")
                .contains("explicit format")
                .contains("follow-up questions")
                .contains("show every returned question in order, and wait for all answers")
                .contains("Load all expected answers once with batchCapability")
                .contains("one ordered assessment per answer in one atomic call with gradingCapability")
                .contains("Never invent counts, expose answers early, use per-card tools, grade from memory")
                .contains("Follow the confirmed continuation immediately")
                .contains("For renderGoalVisualizationThenTeachActiveGoal, call its toolCall once next")
                .contains("adding only the current learningSessionId")
                .contains("then teach in the same response; never reload or retry")
                .contains("permanent SkillPilot IDs")
                .contains("exact activeGoal.title")
                .contains("Dein aktuelles Lernziel ist: <Titel>")
                .contains("Your current learning goal is: <title>")
                .contains("Never substitute activeGoal.description")
                .contains("Do not comment didactically on setup, workflow ordering, or persistence")
                .contains("learner-facing focus exclusively on learning")
                .contains("two independent checks")
                .contains("If competence has not yet been demonstrated")
                .contains("stay on the same active goal")
                .contains("correction and fresh evidence")
                .contains("interactionMode=orientation")
                .contains("orientationOutlook as the sole authoritative map")
                .contains("present every supplied path")
                .contains("what the learner will actually learn")
                .contains("representative later milestones")
                .contains("practically useful")
                .contains("Do not invent, add, merge, or substitute paths")
                .contains("merely names one path starts the motivational dialogue")
                .contains("not completion evidence")
                .contains("one active personal follow-up")
                .contains("only after the learner meaningfully engages with that tailored follow-up")
                .contains("pass its exact pathId unchanged as orientationPathId")
                .contains("unrelated next-goal options is forbidden")
                .contains("Do not test prior knowledge")
                .contains("completion marker and never certifies subject mastery")
                .contains(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION)
                .contains(OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE)
                .contains("only a UI receipt")
                .contains("never replaces that full context")
                .contains("that full context contains goalVisualization, and its nextAllowedTools permits "
                        + "render_skillpilot_goal_visualization")
                .contains("get_skillpilot_context or a successful state-changing result")
                .contains("form a pair from that context's goalVisualization.goalId and the authorizing result's "
                        + "top-level stateVersion")
                .contains("For every previously unseen pair")
                .contains("even if a different pair was rendered earlier in this conversation")
                .contains("once as the immediate next tool")
                .contains("copying the pair to goalId and expectedStateVersion")
                .contains("A repeated pair creates no automatic call")
                .contains("Only an explicit learner request to show the current image again creates one new "
                        + "one-shot call after a fresh qualifying result; never retry otherwise")
                .contains("Do not insert get_skillpilot_context or another SkillPilot tool")
                .contains("immediate next action")
                .contains("before any learner-facing response")
                .contains("Never infer that the component is unavailable")
                .contains("only when the start tool actually returns an error")
                .contains("Use backend URLs verbatim only")
                .contains("If no approved link is available, do not output a link")
                .contains("never with dollar delimiters")
                .contains("activeGoal.exam.hasImage=true")
                .contains("activeGoal.cockpitUrl verbatim")
                .contains("do not invent or describe it")
                .contains("matching fixed sentence from the conversation language")
                .contains("Öffne SkillPilot unter https://skillpilot.com/, schließe dort die Lernkonfiguration "
                        + "ab, wähle „Lernen starten“ und verwende die vorbereitete Startnachricht in einem neuen "
                        + "Chat.")
                .contains("Open https://skillpilot.com/, finish the learning setup there, choose “Start learning”, "
                        + "and use the prepared start message in a new chat.")
                .contains("only when no session locale exists the conversation language")
                .contains("server-owned startUrl and instruction unchanged")
                .contains("Do not translate or invent technical recovery")
                .contains("prepared message in a new chat")
                .contains("When completion.scopeComplete=true and requiredAction=setScope supplies options")
                .contains("offer the first option as the backend-recommended broader focus but do not mutate until "
                        + "the learner accepts")
                .contains("suitable learner-facing ancestors come first")
                .contains("nearest broader focus first")
                .contains("copy exactly the first published option's goalIds unchanged")
                .contains("never infer an ancestor or construct an ID")
                .contains("The requires relation is one-way")
                .contains("mastery of a dependent goal never implies mastery of, or suppresses, an "
                        + "unmastered prerequisite")
                .contains("Every unmastered target in the Personal Curriculum remains subject to the normal "
                        + "frontier test")
                .contains("reload exactly once");

        assertThat(spec(OpenAiDeV1McpContractAdapter.SET_MASTERY).tool().description())
                .contains("interactionMode=orientation")
                .contains("orientationOutlook as the complete authoritative learning map")
                .contains("merely names one supplied path")
                .contains("must not call this tool")
                .contains("tailored motivational follow-up")
                .contains("wait for meaningful engagement")
                .contains("explicit request to continue directly")
                .contains("exact pathId unchanged as orientationPathId")
                .contains("unrelated frontier options")
                .contains("test details")
                .contains("claim subject mastery")
                .contains("For ordinary content goals, call only after two independent");

        assertThat(spec(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION).tool().description())
                .contains("successful state-changing result containing its full successor context")
                .contains("nextAllowedTools permits this tool")
                .contains("form a pair from that context's goalVisualization.goalId and the authorizing result's "
                        + "top-level stateVersion")
                .contains("For every previously unseen pair")
                .contains("even if a different pair was rendered earlier in this conversation")
                .contains("once as the immediate next tool")
                .contains("copying the pair to goalId and expectedStateVersion")
                .contains("A repeated pair creates no automatic call")
                .contains("Only an explicit learner request to show the current image again creates one new "
                        + "one-shot call after a fresh qualifying result; never retry otherwise")
                .contains("Never insert get_skillpilot_context or another SkillPilot tool")
                .contains("newer SkillPilot result");

        CoachToolFacade.ExamScoring scoring = new CoachToolFacade.ExamScoring(
                10,
                5,
                List.of(new CoachToolFacade.ExamScoringStep("step-1", 10, "Kriterium")));
        when(coachTools.getExamEvaluation(
                eq(LEARNER_ID),
                any(CoachToolFacade.ExamEvaluationRequest.class)))
                .thenReturn(new CoachToolFacade.ExamEvaluationResult(
                        "exam-public-id",
                        "Lösung: $x=7$",
                        "Solution: $x=7$",
                        scoring));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.GET_EXAM_EVALUATION,
                Map.of("goalId", "exam-public-id"));
        OpenAiDeV1McpContractAdapter.ExamEvaluationResult evaluation =
                structured(result, OpenAiDeV1McpContractAdapter.ExamEvaluationResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_EXAM_EVALUATION, result);

        assertThat(evaluation.solutionContent()).isEqualTo("Lösung: \\(x=7\\)");
        assertThat(evaluation.evaluationCapability()).isNotBlank();
        assertThat(evaluation.instruction())
                .contains("nur Referenz")
                .contains("alternative Lösungswege")
                .contains("ausdrückliche Anforderungen bleiben verbindlich")
                .contains("ausschließlich anhand sichtbar vorliegender Leistung")
                .contains("Teilpunkte sauber")
                .contains("jeden Abzug konkret")
                .contains("ohne Nachfrage")
                .contains("erfinde daraus keinen konkreten fachlichen Fehler")
                .contains("evaluationCapability", "earnedPoints", "workFeedback", "outcomeFeedback");
        verify(identityResolver, never()).requireWriteAccess(any());
    }

    @Test
    void examMasteryRequiresEvaluationCapabilityAndAtLeastThePassingScore() {
        UnifiedLearnerStateResponse examState = releasedExamState();
        FrontierGoal successor = contentGoal("successor-goal", "Zwischen Tabelle, Graph und Term wechseln");
        UnifiedLearnerStateResponse successorState = state("teachActiveGoal", successor);
        CoachToolFacade.ExamScoring scoring = new CoachToolFacade.ExamScoring(
                10,
                5,
                List.of(new CoachToolFacade.ExamScoringStep("step-1", 10, "Kriterium")));
        when(coachTools.getExamEvaluation(
                eq(LEARNER_ID),
                any(CoachToolFacade.ExamEvaluationRequest.class)))
                .thenReturn(new CoachToolFacade.ExamEvaluationResult(
                        "exam-public-id",
                        "Lösung: $x=7$",
                        "Solution: $x=7$",
                        scoring));
        when(coachTools.getLearnerState(LEARNER_ID))
                .thenReturn(examState, examState, examState, successorState);
        org.mockito.Mockito.doAnswer(invocation -> sessionOperation(invocation.getArgument(5), 0L))
                .when(sessionCoordinator)
                .write(
                        any(),
                        any(),
                        anyLong(),
                        any(),
                        any(),
                        any());

        McpSchema.CallToolResult missingEvaluation = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                masteryArguments("exam-public-id"));

        assertThat(missingEvaluation.isError()).isTrue();
        assertThat(missingEvaluation.content().toString())
                .contains("evaluationCapability", "earnedPoints");
        verify(coachTools, never()).setMastery(any(), any());

        OpenAiDeV1McpContractAdapter.ExamEvaluationResult evaluation = structured(
                call(
                        OpenAiDeV1McpContractAdapter.GET_EXAM_EVALUATION,
                        Map.of("goalId", "exam-public-id")),
                OpenAiDeV1McpContractAdapter.ExamEvaluationResult.class);

        McpSchema.CallToolResult belowPassingScore = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                examMasteryArguments("exam-public-id", evaluation.evaluationCapability(), 4.5));

        assertThat(belowPassingScore.isError()).isTrue();
        assertThat(belowPassingScore.content().toString()).contains("noch nicht bestanden");
        verify(coachTools, never()).setMastery(any(), any());

        MasteryUpdateResponse update = new MasteryUpdateResponse(
                true,
                "exam-public-id",
                1.0,
                successorState.frontier(),
                successorState.nextAllowedActions(),
                successorState.learningState(),
                successorState.activeGoal(),
                successorState.stateMachine(),
                successorState.goals());
        when(coachTools.setMastery(eq(LEARNER_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.UPDATED,
                        update,
                        null,
                        null));

        McpSchema.CallToolResult passingScore = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                examMasteryArguments("exam-public-id", evaluation.evaluationCapability(), 5.0));

        assertThat(passingScore.isError()).isFalse();
        OpenAiDeV1McpContractAdapter.MasteryToolResult payload = structured(
                passingScore,
                OpenAiDeV1McpContractAdapter.MasteryToolResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.SET_MASTERY, passingScore);
        assertThat(payload.completionHandoff().earnedPoints()).isEqualTo(5.0);
        assertThat(payload.completionHandoff().maxPoints()).isEqualTo(10.0);
        assertThat(payload.completionHandoff().workFeedback()).isEqualTo(TEST_WORK_FEEDBACK);
        assertThat(payload.completionHandoff().outcomeFeedback()).isEqualTo(TEST_OUTCOME_FEEDBACK);
        assertThat(payload.completionHandoff().successorGoalTitle()).isEqualTo(successor.title());
        assertThat(passingScore.content().toString())
                .contains("Bestätigte Punktzahl: 5 von 10", successor.title());
        verify(coachTools).setMastery(eq(LEARNER_ID), any(MasteryUpdateRequest.class));
    }

    @Test
    void mutationRequiresWriteAccessAndReturnsFreshSafeContextInStructuredContent() throws Exception {
        UnifiedLearnerStateResponse state = normalState("teachActiveGoal");
        MasteryUpdateResponse update = new MasteryUpdateResponse(
                true,
                "goal-public-id",
                1.0,
                state.frontier(),
                state.nextAllowedActions(),
                state.learningState(),
                state.activeGoal(),
                state.stateMachine(),
                state.goals());
        when(coachTools.setMastery(eq(LEARNER_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.UPDATED,
                        update,
                        null,
                        null));
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                masteryArguments("goal-public-id"));

        assertThat(result.isError()).isFalse();
        OpenAiDeV1McpContractAdapter.MasteryToolResult payload =
                structured(result, OpenAiDeV1McpContractAdapter.MasteryToolResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.SET_MASTERY, result);
        assertThat(payload.status()).isEqualTo("updated");
        assertThat(payload.completionHandoff().workFeedback()).isEqualTo(TEST_WORK_FEEDBACK);
        assertThat(payload.completionHandoff().outcomeFeedback()).isEqualTo(TEST_OUTCOME_FEEDBACK);
        assertThat(payload.context().activeGoal().goalId()).isEqualTo("goal-public-id");
        assertThat(objectMapper.writeValueAsString(payload)).doesNotContain(LEARNER_ID, CONNECTION_SECRET);
        verify(identityResolver).requireWriteAccess(McpTransportContext.EMPTY);
    }

    @Test
    void masteryRequiresConcreteBoundedFeedbackBeforeMutation() {
        McpSchema.CallToolResult missingFeedback = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                Map.of("goalId", "goal-public-id"));
        McpSchema.CallToolResult blankFeedback = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                Map.of(
                        "goalId", "goal-public-id",
                        OpenAiDeV1McpContractAdapter.WORK_FEEDBACK, "   ",
                        OpenAiDeV1McpContractAdapter.OUTCOME_FEEDBACK, TEST_OUTCOME_FEEDBACK));
        McpSchema.CallToolResult oversizedWorkFeedback = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                Map.of(
                        "goalId", "goal-public-id",
                        OpenAiDeV1McpContractAdapter.WORK_FEEDBACK, "x".repeat(1_601),
                        OpenAiDeV1McpContractAdapter.OUTCOME_FEEDBACK, TEST_OUTCOME_FEEDBACK));
        McpSchema.CallToolResult oversizedOutcomeFeedback = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                Map.of(
                        "goalId", "goal-public-id",
                        OpenAiDeV1McpContractAdapter.WORK_FEEDBACK, TEST_WORK_FEEDBACK,
                        OpenAiDeV1McpContractAdapter.OUTCOME_FEEDBACK, "x".repeat(801)));

        assertThat(List.of(
                        missingFeedback,
                        blankFeedback,
                        oversizedWorkFeedback,
                        oversizedOutcomeFeedback))
                .allSatisfy(result -> assertThat(result.isError()).isTrue());
        verify(coachTools, never()).setMastery(any(), any());
    }

    @Test
    void masteryContinuesTheAutoActivatedSuccessorWithoutPublishingAnotherGoalChoice() throws Exception {
        FrontierGoal completed = contentGoal(
                "completed-goal",
                "Lineare Gleichungen und Ungleichungen lösen");
        FrontierGoal successor = contentGoal(
                "successor-goal",
                "Zwischen Tabelle, Graph und Term wechseln");
        FrontierGoal unrelated = contentGoal(
                "unrelated-goal",
                "Geometrische Beziehungen an Kreisen untersuchen");
        UnifiedLearnerStateResponse before = state("teachActiveGoal", completed);
        UnifiedLearnerStateResponse successorState = new UnifiedLearnerStateResponse(
                before.skillpilotId(),
                before.curriculum(),
                List.of(successor, unrelated),
                new LearnerGoals(
                        List.of(successor, unrelated),
                        4,
                        10,
                        new GoalStats(4, 10),
                        new GoalStats(3, 5),
                        false),
                List.of("teachActiveGoal"),
                before.activeFilters(),
                before.copySources(),
                "learning",
                successor,
                new StateMachineInfo(
                        "TEACHING",
                        "teachActiveGoal",
                        List.of(successor),
                        List.of(),
                        successor));
        MasteryUpdateResponse update = new MasteryUpdateResponse(
                true,
                completed.id(),
                1.0,
                successorState.frontier(),
                successorState.nextAllowedActions(),
                successorState.learningState(),
                successorState.activeGoal(),
                successorState.stateMachine(),
                successorState.goals());
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(before, successorState);
        when(coachTools.setMastery(eq(LEARNER_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.UPDATED,
                        update,
                        null,
                        null));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                masteryArguments(completed.id()));

        assertThat(result.isError()).isFalse();
        OpenAiDeV1McpContractAdapter.MasteryToolResult payload =
                structured(result, OpenAiDeV1McpContractAdapter.MasteryToolResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.SET_MASTERY, result);
        assertThat(objectMapper.valueToTree(spec(OpenAiDeV1McpContractAdapter.SET_MASTERY)
                                .tool()
                                .outputSchema())
                        .at("/properties/context/description")
                        .asText())
                .contains(
                        "Fresh authoritative successor state",
                        "invalidates every goal option",
                        "continue it without offering a goal choice",
                        "only after presenting completionHandoff");
        assertThat(payload.completionHandoff().completedGoalId()).isEqualTo(completed.id());
        assertThat(payload.completionHandoff().completedGoalTitle()).isEqualTo(completed.title());
        assertThat(payload.completionHandoff().workFeedback()).isEqualTo(TEST_WORK_FEEDBACK);
        assertThat(payload.completionHandoff().outcomeFeedback()).isEqualTo(TEST_OUTCOME_FEEDBACK);
        assertThat(payload.completionHandoff().successorGoalTitle()).isEqualTo(successor.title());
        assertThat(payload.completionHandoff().instruction())
                .contains("zuerst workFeedback", "danach outcomeFeedback", "Beginne erst anschließend");
        assertThat(payload.completionHandoff().successorEvidenceReset()).isTrue();
        assertThat(payload.completionHandoff().earnedPoints()).isNull();
        assertThat(payload.completionHandoff().maxPoints()).isNull();
        assertThat(payload.context().activeGoal().goalId()).isEqualTo(successor.id());
        assertThat(payload.context().requiredAction()).isEqualTo("teachActiveGoal");
        assertThat(payload.context().interactionMode()).isEqualTo("chat");
        assertThat(payload.context().options()).isEmpty();
        assertThat(payload.context().frontier()).isEmpty();
        assertThat(payload.context().nextAllowedTools())
                .contains(OpenAiDeV1McpContractAdapter.GET_CONTEXT)
                .doesNotContain(
                        OpenAiDeV1McpContractAdapter.SET_MASTERY,
                        OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                        OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL);
        assertThat(payload.context().instruction())
                .contains(
                        successor.title(),
                        "bereits von SkillPilot ausgewählt",
                        "Beginne jetzt unmittelbar",
                        "keine anderen Lernziele",
                        "keine weitere Bestätigung");
        String completionSummary = ((McpSchema.TextContent) result.content().getFirst()).text();
        assertThat(completionSummary)
                .contains(TEST_WORK_FEEDBACK, TEST_OUTCOME_FEEDBACK)
                .contains(successor.title(), "bereits aktiviert", "keine Lernzielauswahl")
                .doesNotContain(unrelated.title());
        int workFeedbackIndex = completionSummary.indexOf(TEST_WORK_FEEDBACK);
        int outcomeFeedbackIndex = completionSummary.indexOf(TEST_OUTCOME_FEEDBACK);
        int successorIndex = completionSummary.indexOf(successor.title());
        assertThat(outcomeFeedbackIndex).isGreaterThan(workFeedbackIndex);
        assertThat(successorIndex).isGreaterThan(outcomeFeedbackIndex);
        McpSchema.CallToolResult accidentalNavigation = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "goal"));
        OpenAiDeV1McpContractAdapter.NavigationResult guardedNavigation =
                structured(accidentalNavigation, OpenAiDeV1McpContractAdapter.NavigationResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_NAVIGATION, accidentalNavigation);
        assertThat(guardedNavigation.requiredAction()).isEqualTo("teachActiveGoal");
        assertThat(guardedNavigation.options()).isEmpty();
        assertThat(guardedNavigation.instruction())
                .contains(successor.title(), "keine Lernzielauswahl", "früheren Zieloptionen")
                .doesNotContain(unrelated.title());
        assertThat(accidentalNavigation.content().toString())
                .contains("keine Lernzielauswahl geöffnet", "Frühere Zieloptionen sind ungültig")
                .doesNotContain("Navigationsoptionen für goal geladen", unrelated.title());
        verify(coachTools, never()).setActiveGoal(any(), any());
    }

    @Test
    void orientationCompletionActivatesTheFirstAvailableGoalFromTheSelectedAuthoritativePath() {
        FrontierGoal orientation = orientationGoal();
        FrontierGoal selectedEntry = contentGoal("selected-entry", "Funktionen und Modelle verstehen");
        FrontierGoal unrelatedEntry = contentGoal("unrelated-entry", "Daten auswerten");
        UnifiedLearnerStateResponse before = state("orientActiveGoal", orientation);
        UnifiedLearnerStateResponse successor = goalSelectionState(selectedEntry, unrelatedEntry);
        UnifiedLearnerStateResponse activated = state("teachActiveGoal", selectedEntry);
        OrientationOutlook outlook = new OrientationOutlook(
                orientation.id(),
                List.of(
                        new OrientationOutlook.Path(
                                "change-and-models",
                                "Veränderung, Wachstum und Modelle",
                                "Funktionen und Veränderungen modellieren.",
                                List.of("Klima und Wachstum"),
                                List.of(new OrientationOutlook.GoalReference(
                                        selectedEntry.id(),
                                        selectedEntry.title())),
                                List.of(selectedEntry.id())),
                        new OrientationOutlook.Path(
                                "data-and-decisions",
                                "Daten, Zufall und Entscheidungen",
                                "Daten und Unsicherheit beurteilen.",
                                List.of("Medizinische Studien"),
                                List.of(new OrientationOutlook.GoalReference(
                                        unrelatedEntry.id(),
                                        unrelatedEntry.title())),
                                List.of(unrelatedEntry.id()))));
        MasteryUpdateResponse update = new MasteryUpdateResponse(
                true,
                orientation.id(),
                1.0,
                successor.frontier(),
                successor.nextAllowedActions(),
                successor.learningState(),
                successor.activeGoal(),
                successor.stateMachine(),
                successor.goals());

        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(before, successor);
        when(coachTools.getOrientationOutlook(LEARNER_ID, "de")).thenReturn(outlook);
        when(coachTools.getUncompactedFrontier(LEARNER_ID))
                .thenReturn(List.of(unrelatedEntry, selectedEntry));
        when(coachTools.setMastery(eq(LEARNER_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.UPDATED,
                        update,
                        null,
                        null));
        when(coachTools.setActiveGoal(
                        LEARNER_ID,
                        new ActiveGoalRequest(selectedEntry.id(), false)))
                .thenReturn(activated);

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                masteryArguments(orientation.id(), "change-and-models"));

        assertThat(result.isError()).isFalse();
        OpenAiDeV1McpContractAdapter.MasteryToolResult payload =
                structured(result, OpenAiDeV1McpContractAdapter.MasteryToolResult.class);
        assertThat(payload.context().activeGoal().goalId()).isEqualTo(selectedEntry.id());
        verify(coachTools).setActiveGoal(
                LEARNER_ID,
                new ActiveGoalRequest(selectedEntry.id(), false));
    }

    @Test
    void orientationCompletionWithoutASelectedPathLeavesGoalChoiceToTheFreshState() {
        FrontierGoal orientation = orientationGoal();
        FrontierGoal firstEntry = contentGoal("first-entry", "Funktionen und Modelle verstehen");
        UnifiedLearnerStateResponse before = state("orientActiveGoal", orientation);
        UnifiedLearnerStateResponse successor = goalSelectionState(firstEntry);
        MasteryUpdateResponse update = new MasteryUpdateResponse(
                true,
                orientation.id(),
                1.0,
                successor.frontier(),
                successor.nextAllowedActions(),
                successor.learningState(),
                successor.activeGoal(),
                successor.stateMachine(),
                successor.goals());

        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(before, successor);
        when(coachTools.setMastery(eq(LEARNER_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.UPDATED,
                        update,
                        null,
                        null));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                masteryArguments(orientation.id()));

        assertThat(result.isError()).isFalse();
        OpenAiDeV1McpContractAdapter.MasteryToolResult payload =
                structured(result, OpenAiDeV1McpContractAdapter.MasteryToolResult.class);
        assertThat(payload.context().requiredAction()).isEqualTo("setActiveGoal");
        verify(coachTools, never()).setActiveGoal(any(), any());
    }

    @Test
    void orientationCompletionKeepsTheFreshStateWhenTheSelectedPathHasNoAvailableGoal() {
        FrontierGoal orientation = orientationGoal();
        FrontierGoal unavailableEntry = contentGoal("unavailable-entry", "Funktionen verstehen");
        FrontierGoal unrelatedEntry = contentGoal("unrelated-entry", "Daten auswerten");
        UnifiedLearnerStateResponse before = state("orientActiveGoal", orientation);
        UnifiedLearnerStateResponse successor = goalSelectionState(unrelatedEntry);
        OrientationOutlook outlook = new OrientationOutlook(
                orientation.id(),
                List.of(new OrientationOutlook.Path(
                        "change-and-models",
                        "Veränderung und Modelle",
                        "Funktionen und Veränderungen modellieren.",
                        List.of("Klima und Wachstum"),
                        List.of(new OrientationOutlook.GoalReference(
                                unavailableEntry.id(),
                                unavailableEntry.title())),
                        List.of(unavailableEntry.id()))));
        MasteryUpdateResponse update = new MasteryUpdateResponse(
                true,
                orientation.id(),
                1.0,
                successor.frontier(),
                successor.nextAllowedActions(),
                successor.learningState(),
                successor.activeGoal(),
                successor.stateMachine(),
                successor.goals());

        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(before, successor);
        when(coachTools.getOrientationOutlook(LEARNER_ID, "de")).thenReturn(outlook);
        when(coachTools.getUncompactedFrontier(LEARNER_ID)).thenReturn(List.of(unrelatedEntry));
        when(coachTools.setMastery(eq(LEARNER_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.UPDATED,
                        update,
                        null,
                        null));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                masteryArguments(orientation.id(), "change-and-models"));

        assertThat(result.isError()).isFalse();
        OpenAiDeV1McpContractAdapter.MasteryToolResult payload =
                structured(result, OpenAiDeV1McpContractAdapter.MasteryToolResult.class);
        assertThat(payload.status()).isEqualTo("updated");
        assertThat(payload.context().requiredAction()).isEqualTo("setActiveGoal");
        verify(coachTools, never()).setActiveGoal(any(), any());
    }

    @Test
    void orientationCompletionFailsClosedWhenTheAuthoritativePathContainsNoGoalIds() {
        FrontierGoal orientation = orientationGoal();
        FrontierGoal unrelatedEntry = contentGoal("unrelated-entry", "Daten auswerten");
        UnifiedLearnerStateResponse before = state("orientActiveGoal", orientation);
        UnifiedLearnerStateResponse successor = goalSelectionState(unrelatedEntry);
        OrientationOutlook outlook = new OrientationOutlook(
                orientation.id(),
                List.of(new OrientationOutlook.Path(
                        "change-and-models",
                        "Veränderung und Modelle",
                        "Funktionen und Veränderungen modellieren.",
                        List.of("Klima und Wachstum"),
                        List.of(new OrientationOutlook.GoalReference(
                                unrelatedEntry.id(),
                                unrelatedEntry.title())),
                        List.of())));
        MasteryUpdateResponse update = new MasteryUpdateResponse(
                true,
                orientation.id(),
                1.0,
                successor.frontier(),
                successor.nextAllowedActions(),
                successor.learningState(),
                successor.activeGoal(),
                successor.stateMachine(),
                successor.goals());

        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(before, successor);
        when(coachTools.getOrientationOutlook(LEARNER_ID, "de")).thenReturn(outlook);
        when(coachTools.setMastery(eq(LEARNER_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.UPDATED,
                        update,
                        null,
                        null));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                masteryArguments(orientation.id(), "change-and-models"));

        assertThat(result.isError()).isTrue();
        verify(coachTools, never()).setActiveGoal(any(), any());
    }

    @Test
    void orientationCompletionRejectsAPathOutsideTheCurrentAuthoritativeMap() {
        FrontierGoal orientation = orientationGoal();
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state("orientActiveGoal", orientation));
        when(coachTools.getOrientationOutlook(LEARNER_ID, "de")).thenReturn(new OrientationOutlook(
                orientation.id(),
                List.of(new OrientationOutlook.Path(
                        "known-path",
                        "Bekannter Pfad",
                        "Geprüfter Ausblick.",
                        List.of("Geprüfter Kontext"),
                        List.of(new OrientationOutlook.GoalReference("entry", "Einstieg")),
                        List.of("entry")))));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                masteryArguments(orientation.id(), "invented-path"));

        assertThat(result.isError()).isTrue();
        assertThat(result.content().toString()).contains("gehört nicht zur aktuellen Lernlandkarte");
        verify(coachTools, never()).setMastery(any(), any());
        verify(coachTools, never()).setActiveGoal(any(), any());
    }

    @Test
    void masteryIsFixedToOneAndRejectsMemoryGoalsBeforeMutation() {
        UnifiedLearnerStateResponse normal = normalState("teachActiveGoal");
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(normal);
        when(coachTools.setMastery(eq(LEARNER_ID), any(MasteryUpdateRequest.class)))
                .thenReturn(new CoachToolFacade.MasteryResult(
                        CoachToolFacade.MasteryStatus.BAD_REQUEST,
                        null,
                        null,
                        "stop after capture"));

        call(OpenAiDeV1McpContractAdapter.SET_MASTERY, masteryArguments("goal-public-id"));

        ArgumentCaptor<MasteryUpdateRequest> request = ArgumentCaptor.forClass(MasteryUpdateRequest.class);
        verify(coachTools).setMastery(eq(LEARNER_ID), request.capture());
        assertThat(request.getValue().goalId()).isEqualTo("goal-public-id");
        assertThat(request.getValue().mastery()).isNull();

        FrontierGoal memory = new FrontierGoal(
                "memory-public-id",
                "Merkziel",
                "Rufe Fakten sicher ab.",
                "atomic",
                "memory",
                "frontier",
                List.of("memorization", "srs-deck:deck-1"),
                List.of(),
                null,
                null,
                null,
                null);
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state("chooseMemoryMode", memory));

        McpSchema.CallToolResult rejected = call(
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                masteryArguments("memory-public-id"));

        assertThat(rejected.isError()).isTrue();
        assertThat(rejected.content().toString()).contains("nicht über die normale Coach-Mastery");
        verify(coachTools, never()).setMastery(
                eq(LEARNER_ID),
                org.mockito.ArgumentMatchers.argThat(candidate -> "memory-public-id".equals(candidate.goalId())));
    }

    @Test
    void memoryPracticeStartHidesCardContentsFromTheModelAndExposesThemOnlyToTheComponent() throws Exception {
        UnifiedLearnerStateResponse state = memoryState("memory-public-id");
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);
        when(coachTools.startMemoryPractice(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new MemoryPracticeResponse(
                        "ready",
                        "Karte ansehen und anschließend selbst bewerten.",
                        "memory-public-id",
                        "Lernkarten – Funktionen und Gleichungen",
                        new MemoryPracticeProgress(4, 3, 1),
                        List.of(
                                new MemoryPracticeCard(
                                        "card-public-id",
                                        "SECRET CARD FRONT: \\(a+b)^2\\)",
                                        "SECRET CARD BACK: \\(a^2+2ab+b^2\\)",
                                        "Binomische Formeln"),
                                new MemoryPracticeCard(
                                        "card-second",
                                        "SECOND SECRET FRONT",
                                        "SECOND SECRET BACK",
                                        null))));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE,
                Map.of(
                        "goalId", "memory-public-id",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION, 0L));

        assertThat(result.isError()).isFalse();
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE, result);
        String structuredJson = objectMapper.writeValueAsString(result.structuredContent());
        String modelVisibleText = result.content().toString();
        assertThat(structuredJson)
                .contains("ready", "memory-public-id", "totalCards", "dueCards", "scheduledCards")
                .doesNotContain(
                        LEARNING_SESSION_ID,
                        "reviewCapability",
                        "SECRET CARD FRONT",
                        "SECRET CARD BACK",
                        "SECOND SECRET FRONT",
                        "SECOND SECRET BACK",
                        "front",
                        "back",
                        "card-public-id",
                        "card-second");
        assertThat(modelVisibleText)
                .doesNotContain(
                        LEARNING_SESSION_ID,
                        "reviewCapability",
                        "SECRET CARD FRONT",
                        "SECRET CARD BACK",
                        "SECOND SECRET FRONT",
                        "SECOND SECRET BACK",
                        "card-public-id",
                        "card-second")
                .contains("Karteikartenlernen")
                .doesNotContain("beherrscht", "Mastery gespeichert");
        Map<String, Object> component = memoryPracticeComponent(result);
        assertThat(component)
                .containsEntry(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID)
                .containsEntry("goalId", "memory-public-id")
                .containsEntry("completed", false)
                .doesNotContainKey("card");
        Map<String, Object> batch = memoryPracticeCardBatch(result);
        assertThat(batch)
                .containsEntry("initialIndex", 0)
                .containsEntry("totalDueCards", 3)
                .containsEntry("hasMore", true);
        List<Map<String, Object>> cards = memoryPracticeCards(result);
        assertThat(cards).hasSize(2);
        assertThat(cards.get(0))
                .containsEntry("id", "card-public-id")
                .containsEntry("front", "SECRET CARD FRONT: \\(a+b)^2\\)")
                .containsEntry("back", "SECRET CARD BACK: \\(a^2+2ab+b^2\\)");
        assertThat(cards.get(1))
                .containsEntry("id", "card-second")
                .containsEntry("front", "SECOND SECRET FRONT")
                .containsEntry("back", "SECOND SECRET BACK");
        String firstCapability = reviewCapability(result, 0);
        String secondCapability = reviewCapability(result, 1);
        assertThat(firstCapability)
                .isNotBlank()
                .matches("[A-Za-z0-9_-]+")
                .isNotEqualTo(secondCapability);
        assertThat(structuredJson).doesNotContain(firstCapability, secondCapability);
        assertThat(modelVisibleText).doesNotContain(firstCapability, secondCapability);
        verify(coachTools).startMemoryPractice(eq(LEARNER_ID), eq("de"), any());
        verify(coachTools, never()).setMastery(any(), any());
    }

    @Test
    void validMemoryPracticeReviewCapabilityAuthorizesExactlyItsIssuedCard() throws Exception {
        UnifiedLearnerStateResponse state = memoryState("memory-public-id");
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);
        when(coachTools.startMemoryPractice(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(memoryPracticeBatch("card-public-id"));
        McpSchema.CallToolResult start = call(
                OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE,
                Map.of(
                        "goalId", "memory-public-id",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION, 0L));
        String capability = reviewCapability(start, 0);

        when(coachTools.reviewMemoryPracticeCard(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new MemoryPracticeResponse(
                        "ready",
                        "Nächste Karte.",
                        "memory-public-id",
                        "Lernkarten – Funktionen und Gleichungen",
                        new MemoryPracticeProgress(3, 1, 2),
                        List.of(new MemoryPracticeCard(
                                "card-next",
                                "PRIVATE NEXT FRONT",
                                "PRIVATE NEXT BACK",
                                "Funktionen"))));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD,
                Map.of(
                        "goalId", "memory-public-id",
                        "cardId", "card-public-id",
                        "rating", "known",
                        "reviewCapability", capability));

        assertThat(result.isError()).isFalse();
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD, result);
        String structuredJson = objectMapper.writeValueAsString(result.structuredContent());
        assertThat(structuredJson)
                .contains("ready", "memory-public-id", "dueCards")
                .doesNotContain(
                        LEARNING_SESSION_ID,
                        "reviewCapability",
                        capability,
                        "PRIVATE NEXT FRONT",
                        "PRIVATE NEXT BACK",
                        "card-next",
                        "front",
                        "back",
                        "mastery",
                        "mastered");
        assertThat(result.structuredContent())
                .isInstanceOfSatisfying(Map.class, structured -> assertThat(structured)
                        .containsEntry("stateVersion", 1L));
        assertThat(result.content().toString())
                .doesNotContain(
                        LEARNING_SESSION_ID,
                        "reviewCapability",
                        capability,
                        "PRIVATE NEXT FRONT",
                        "PRIVATE NEXT BACK",
                        "card-next",
                        "beherrscht");
        Map<String, Object> component = memoryPracticeComponent(result);
        assertThat(component)
                .containsEntry(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID)
                .containsEntry("goalId", "memory-public-id")
                .containsEntry("completed", false)
                .doesNotContainKeys("card", "cardBatch");
        assertThat(component.get("progress"))
                .isInstanceOfSatisfying(Map.class, progress -> assertThat(progress)
                        .containsEntry("total", 3)
                        .containsEntry("due", 1)
                        .containsEntry("scheduled", 2));
        assertThat(spec(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD)
                        .tool()
                        .description())
                .contains("updates only the rated card's repetition schedule")
                .contains("Rating is exactly not_known or known")
                .contains("Local previous/next navigation never calls this tool")
                .contains("never marks the memory goal as mastered");
        verify(coachTools).reviewMemoryPracticeCard(eq(LEARNER_ID), eq("de"), any());
        verify(coachTools, never()).setMastery(any(), any());
    }

    @Test
    void manipulatedMemoryPracticeReviewCapabilityIsRejectedBeforeTheBackendWrite() {
        UnifiedLearnerStateResponse state = memoryState("memory-public-id");
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);
        when(coachTools.startMemoryPractice(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(memoryPracticeBatch("card-public-id"));
        McpSchema.CallToolResult start = call(
                OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE,
                Map.of(
                        "goalId", "memory-public-id",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION, 0L));
        String capability = reviewCapability(start, 0);
        String manipulatedCapability = capability.substring(0, capability.length() - 1)
                + (capability.endsWith("A") ? "B" : "A");

        McpSchema.CallToolResult rejected = call(
                OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD,
                Map.of(
                        "goalId", "memory-public-id",
                        "cardId", "card-public-id",
                        "rating", "known",
                        "reviewCapability", manipulatedCapability));

        assertThat(rejected.isError()).isTrue();
        assertThat(rejected.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                        .containsEntry("code", "INVALID_INPUT")
                        .doesNotContainKeys(
                                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                                "reviewCapability"));
        assertThat(rejected.content().toString())
                .contains("gehört nicht zum ausgegebenen Karteikartenstapel")
                .doesNotContain(LEARNING_SESSION_ID, capability, manipulatedCapability);
        verify(coachTools, never()).reviewMemoryPracticeCard(any(), any(), any());
    }

    @Test
    void memoryPracticeStartRejectsStaleStateAndNonMemoryActiveGoalBeforeLoadingCards() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(normalState("teachActiveGoal"));

        McpSchema.CallToolResult stale = call(
                OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE,
                Map.of(
                        "goalId", "memory-public-id",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION, 9L));
        McpSchema.CallToolResult nonMemory = call(
                OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE,
                Map.of(
                        "goalId", "goal-public-id",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION, 0L));

        assertThat(stale.isError()).isTrue();
        assertThat(stale.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                        .containsEntry("status", "conflict")
                        .containsEntry("reloadContextAtMostOnce", true));
        assertThat(nonMemory.isError()).isTrue();
        assertThat(nonMemory.content().toString())
                .contains("bestätigte aktive Lernkartenziel");
        verify(coachTools, never()).startMemoryPractice(any(), any(), any());
    }

    @Test
    void recallStartUsesOnlyTheSessionBoundDirectiveAndProjectsAnOpaqueCompleteBatch() throws Exception {
        UnifiedLearnerStateResponse state = memoryState("memory-public-id");
        Instant issuedAt = Instant.ofEpochMilli(Instant.now().minusSeconds(30).toEpochMilli());
        VerifiedRecallPromptResponse response = new VerifiedRecallPromptResponse(
                "ready",
                "Alle Fragen stellen; Sollantworten noch nicht laden.",
                LEARNER_ID,
                "memory-public-id",
                "Grundwissen",
                2,
                0,
                2,
                2,
                0,
                null,
                2,
                List.of(
                        new VerifiedRecallPromptCard("card-public-id-1", "Was gilt?", "Formel"),
                        new VerifiedRecallPromptCard("card-public-id-2", "Wie lautet die Umkehrung?", "Satz")),
                "card-public-id-1",
                "Was gilt?",
                "Formel",
                10,
                issuedAt);
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);
        when(coachTools.startVerifiedRecallBatch(LEARNER_ID, "de", "memory-public-id", 10))
                .thenReturn(response);

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.START_RECALL,
                Map.of());

        OpenAiDeV1McpContractAdapter.RecallPromptResult prompt =
                structured(result, OpenAiDeV1McpContractAdapter.RecallPromptResult.class);
        String json = objectMapper.writeValueAsString(result.structuredContent());
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.START_RECALL, result);
        String nativeJson = new JacksonMcpJsonMapperSupplier().get().writeValueAsString(result);
        assertThat(prompt.cards()).hasSize(2);
        assertThat(prompt.cards())
                .extracting(OpenAiDeV1McpContractAdapter.RecallCard::prompt)
                .containsExactly("Was gilt?", "Wie lautet die Umkehrung?");
        assertThat(prompt.batchCapability()).isNotBlank();
        assertThat(nativeJson).doesNotContain(":null", LEARNER_ID, "skillpilotId", "expectedAnswer");
        assertThat(json)
                .contains("Was gilt?", "Wie lautet die Umkehrung?", "batchCapability")
                .doesNotContain(":null")
                .doesNotContain(
                        LEARNER_ID,
                        "memory-public-id",
                        "card-public-id-1",
                        "card-public-id-2",
                        "skillpilotId",
                        "goalId",
                        "cardId",
                        "batchSize",
                        "eligibleCards",
                        "expectedAnswer");
        assertThat(result.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                        .containsEntry("extensions", Map.of())
                        .doesNotContainKey("instruction"));
        verify(identityResolver, never()).requireWriteAccess(any());
        verify(coachTools).startVerifiedRecallBatch(LEARNER_ID, "de", "memory-public-id", 10);
    }

    @Test
    void capabilityBoundRecallFlowLoadsAllAnswersAndSavesOneAtomicOrderedReceipt() {
        UnifiedLearnerStateResponse state = memoryState("memory-public-id");
        Instant issuedAt = Instant.ofEpochMilli(Instant.now().minusSeconds(30).toEpochMilli());
        Instant nextIssuedAt = Instant.ofEpochMilli(Instant.now().minusSeconds(5).toEpochMilli());
        VerifiedRecallPromptResponse issued = new VerifiedRecallPromptResponse(
                "ready",
                "Beantworte beide Fragen.",
                LEARNER_ID,
                "memory-public-id",
                "Grundwissen",
                3,
                0,
                3,
                2,
                1,
                null,
                2,
                List.of(
                        new VerifiedRecallPromptCard("card-public-id-1", "Was gilt?", "Formel"),
                        new VerifiedRecallPromptCard("card-public-id-2", "Wie lautet die Umkehrung?", "Satz")),
                "card-public-id-1",
                "Was gilt?",
                "Formel",
                10,
                issuedAt);
        VerifiedRecallPromptResponse next = new VerifiedRecallPromptResponse(
                "ready",
                "Nächsten vollständigen Batch stellen.",
                LEARNER_ID,
                "memory-public-id",
                "Grundwissen",
                3,
                1,
                2,
                1,
                1,
                null,
                1,
                List.of(new VerifiedRecallPromptCard("card-next", "Was kommt als Nächstes?", "Formel")),
                "card-next",
                "Was kommt als Nächstes?",
                "Formel",
                10,
                nextIssuedAt);
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);
        when(coachTools.startVerifiedRecallBatch(LEARNER_ID, "de", "memory-public-id", 10))
                .thenReturn(issued);
        when(coachTools.getVerifiedRecallAnswersBatch(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new VerifiedRecallBatchAnswerResponse(
                        "Beide Antworten vergleichen.",
                        "memory-public-id",
                        List.of(
                                new VerifiedRecallBatchAnswerCard(
                                        "card-public-id-1", "Was gilt?", "Die Sollantwort.", "Formel"),
                                new VerifiedRecallBatchAnswerCard(
                                        "card-public-id-2", "Wie lautet die Umkehrung?", "Die Umkehrung.", "Satz"))));
        when(coachTools.recordVerifiedRecallResultsBatch(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new VerifiedRecallBatchResultResponse(
                        List.of(
                                new VerifiedRecallBatchSavedResult("card-public-id-1", true),
                                new VerifiedRecallBatchSavedResult("card-public-id-2", false)),
                        1,
                        1,
                        false,
                        null,
                        next,
                        state));
        org.mockito.Mockito.doAnswer(invocation -> sessionOperation(invocation.getArgument(5), 0L))
                .when(sessionCoordinator)
                .write(any(), any(), anyLong(), any(), any(), any());

        McpSchema.CallToolResult start = call(OpenAiDeV1McpContractAdapter.START_RECALL, Map.of());
        String batchCapability =
                structured(start, OpenAiDeV1McpContractAdapter.RecallPromptResult.class).batchCapability();
        McpSchema.CallToolResult answers = call(
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS,
                Map.of("batchCapability", batchCapability));
        OpenAiDeV1McpContractAdapter.RecallAnswersResult answerPayload =
                structured(answers, OpenAiDeV1McpContractAdapter.RecallAnswersResult.class);
        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", answerPayload.gradingCapability(),
                        "assessments", List.of(
                                Map.of("passed", true, "feedback", "Vollständig richtig."),
                                Map.of("passed", false, "feedback", "Die Richtung wurde vertauscht."))));
        OpenAiDeV1McpContractAdapter.RecallResultsReceipt receipt =
                structured(result, OpenAiDeV1McpContractAdapter.RecallResultsReceipt.class);

        assertThat(answers.isError()).isFalse();
        assertThat(result.isError()).isFalse();
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS, answers);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS, result);
        assertThat(answerPayload.answers())
                .extracting(OpenAiDeV1McpContractAdapter.RecallAnswerCard::expectedAnswer)
                .containsExactly("Die Sollantwort.", "Die Umkehrung.");
        assertThat(answerPayload.gradingCapability()).isNotBlank().isNotEqualTo(batchCapability);
        assertThat(receipt.savedAssessments()).isEqualTo(2);
        assertThat(receipt.passedAssessments()).isEqualTo(1);
        assertThat(receipt.next()).isNotNull();
        assertThat(receipt.next().cards())
                .extracting(OpenAiDeV1McpContractAdapter.RecallCard::prompt)
                .containsExactly("Was kommt als Nächstes?");
        assertThat(receipt.next().batchCapability()).isNotBlank();
        assertThat(receipt.continuation())
                .extracting(
                        OpenAiDeV1McpContractAdapter.RecallContinuation::action,
                        OpenAiDeV1McpContractAdapter.RecallContinuation::consentRequired)
                .containsExactly("askNextRecallBatch", false);
        assertThat(objectMapper.valueToTree(result.structuredContent())
                        .path("continuation")
                        .has("toolCall"))
                .isFalse();
        assertThat(receipt.context()).isNull();
        assertThat(answers.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                        .doesNotContainKeys("instruction", "goalId", "cardId"));
        assertThat(result.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> {
                    assertThat(content)
                            .containsEntry("extensions", Map.of())
                            .doesNotContainKeys(
                                    "instruction",
                                    "context",
                                    "savedCardId",
                                    "goalId",
                                    "cardId",
                                    "expectedStateVersion",
                                    "clientRequestId");
                    assertThat(content.get("next"))
                            .isInstanceOfSatisfying(Map.class, nextContent -> assertThat(nextContent)
                                    .doesNotContainKeys(
                                            "instruction",
                                            "goalId",
                                            "cardId",
                                            "expectedStateVersion",
                                            "clientRequestId"));
                    assertThat(content.get("continuation"))
                            .isInstanceOfSatisfying(Map.class, continuation -> assertThat(continuation)
                                    .containsKey("instruction"));
                });

        ArgumentCaptor<VerifiedRecallBatchAnswerRequest> answerRequest =
                ArgumentCaptor.forClass(VerifiedRecallBatchAnswerRequest.class);
        verify(coachTools).getVerifiedRecallAnswersBatch(eq(LEARNER_ID), eq("de"), answerRequest.capture());
        assertThat(answerRequest.getValue().goalId()).isEqualTo("memory-public-id");
        assertThat(answerRequest.getValue().configuredBatchSize()).isEqualTo(10);
        assertThat(answerRequest.getValue().cardIds())
                .containsExactly("card-public-id-1", "card-public-id-2");
        assertThat(answerRequest.getValue().issuedAt()).isEqualTo(issuedAt);
        ArgumentCaptor<VerifiedRecallBatchResultRequest> resultRequest =
                ArgumentCaptor.forClass(VerifiedRecallBatchResultRequest.class);
        verify(coachTools).recordVerifiedRecallResultsBatch(eq(LEARNER_ID), eq("de"), resultRequest.capture());
        assertThat(resultRequest.getValue().goalId()).isEqualTo("memory-public-id");
        assertThat(resultRequest.getValue().configuredBatchSize()).isEqualTo(10);
        assertThat(resultRequest.getValue().cardIds())
                .containsExactly("card-public-id-1", "card-public-id-2");
        assertThat(resultRequest.getValue().issuedAt()).isEqualTo(issuedAt);
        assertThat(resultRequest.getValue().results())
                .extracting(resultEntry -> resultEntry.cardId() + ":" + resultEntry.passed())
                .containsExactly("card-public-id-1:true", "card-public-id-2:false");
    }

    @Test
    void completedRecallBatchReturnsSuccessorContextInsteadOfAnotherBatch() {
        UnifiedLearnerStateResponse state = memoryState("memory-public-id");
        String batchCapability = issueTwoCardRecallBatchCapability();
        String gradingCapability = issueTwoCardRecallGradingCapability(batchCapability);
        when(coachTools.recordVerifiedRecallResultsBatch(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new VerifiedRecallBatchResultResponse(
                        List.of(
                                new VerifiedRecallBatchSavedResult("card-public-id-1", true),
                                new VerifiedRecallBatchSavedResult("card-public-id-2", true)),
                        2,
                        0,
                        true,
                        "memory-public-id",
                        null,
                        state));
        org.mockito.Mockito.doAnswer(invocation -> sessionOperation(invocation.getArgument(5), 0L))
                .when(sessionCoordinator)
                .write(any(), any(), anyLong(), any(), any(), any());

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", gradingCapability,
                        "assessments", twoCardAssessments(true, true)));
        OpenAiDeV1McpContractAdapter.RecallResultsReceipt receipt =
                structured(result, OpenAiDeV1McpContractAdapter.RecallResultsReceipt.class);

        assertThat(result.isError()).isFalse();
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS, result);
        assertThat(receipt.next()).isNull();
        assertThat(receipt.context()).isNotNull();
        assertThat(receipt.context().instruction()).isNull();
        assertThat(receipt.context().requiredAction()).isNull();
        assertThat(receipt.continuation().action()).isEqualTo("chooseMemoryMode");
        assertThat(objectMapper.valueToTree(result.structuredContent())
                        .path("continuation")
                        .has("toolCall"))
                .isFalse();
        assertThat(result.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> {
                    assertThat(content)
                            .containsKey("context")
                            .doesNotContainKey("next");
                    assertThat(content.get("context"))
                            .isInstanceOfSatisfying(Map.class, context -> assertThat(context)
                                    .doesNotContainKeys("instruction", "requiredAction"));
                });
    }

    @Test
    void completedRecallBatchWithVisualSuccessorReturnsAndExecutesTheServerDirectedRendererCall() {
        String batchCapability = issueTwoCardRecallBatchCapability();
        String gradingCapability = issueTwoCardRecallGradingCapability(batchCapability);
        UnifiedLearnerStateResponse visualSuccessor = visualizationState();
        when(coachTools.recordVerifiedRecallResultsBatch(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new VerifiedRecallBatchResultResponse(
                        List.of(
                                new VerifiedRecallBatchSavedResult("card-public-id-1", true),
                                new VerifiedRecallBatchSavedResult("card-public-id-2", true)),
                        2,
                        0,
                        true,
                        "memory-public-id",
                        null,
                        visualSuccessor));
        org.mockito.Mockito.doAnswer(invocation -> sessionOperation(invocation.getArgument(5), 0L))
                .when(sessionCoordinator)
                .write(any(), any(), anyLong(), any(), any(), any());

        McpSchema.CallToolResult recallResult = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", gradingCapability,
                        "assessments", twoCardAssessments(true, true)));

        assertThat(recallResult.isError()).isFalse();
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS, recallResult);
        JsonNode continuation = objectMapper.valueToTree(recallResult.structuredContent())
                .path("continuation");
        assertThat(continuation.path("action").asText())
                .isEqualTo("renderGoalVisualizationThenTeachActiveGoal");
        assertThat(continuation.path("consentRequired").asBoolean()).isFalse();
        assertThat(continuation.path("toolCall").path("name").asText())
                .isEqualTo(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);
        JsonNode rendererArguments = continuation.path("toolCall").path("arguments");
        assertThat(rendererArguments)
                .isEqualTo(objectMapper.valueToTree(Map.of(
                        "goalId", "goal-with-image",
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION, 1L)));
        JsonNode recallStructuredContent = objectMapper.valueToTree(recallResult.structuredContent());
        assertThat(recallStructuredContent.findValues(
                        OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID))
                .isEmpty();
        assertThat(recallStructuredContent.toString()).doesNotContain(LEARNING_SESSION_ID);

        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(visualSuccessor);
        org.mockito.Mockito.doAnswer(invocation ->
                        sessionOperation(invocation.getArgument(1), 1L))
                .when(sessionCoordinator)
                .read(any(), any());
        @SuppressWarnings("unchecked")
        Map<String, Object> directRendererArguments = objectMapper.convertValue(
                rendererArguments,
                Map.class);
        directRendererArguments.put(
                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                LEARNING_SESSION_ID);

        McpSchema.CallToolResult rendererResult = callWithoutLearningSession(
                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                directRendererArguments);

        assertThat(rendererResult.isError()).isFalse();
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION, rendererResult);
        JsonNode rendered = objectMapper.valueToTree(rendererResult.structuredContent());
        assertThat(rendered.path("stateVersion").asLong()).isEqualTo(1L);
        assertThat(rendered.path("goalVisualization").path("goalId").asText())
                .isEqualTo("goal-with-image");
        verify(coachTools, times(2)).getLearnerState(LEARNER_ID);
    }

    @Test
    void completedRecallBatchWithNonVisualSuccessorDoesNotPublishARendererCall() {
        String batchCapability = issueTwoCardRecallBatchCapability();
        String gradingCapability = issueTwoCardRecallGradingCapability(batchCapability);
        when(coachTools.recordVerifiedRecallResultsBatch(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new VerifiedRecallBatchResultResponse(
                        List.of(
                                new VerifiedRecallBatchSavedResult("card-public-id-1", true),
                                new VerifiedRecallBatchSavedResult("card-public-id-2", true)),
                        2,
                        0,
                        true,
                        "memory-public-id",
                        null,
                        normalState("teachActiveGoal")));
        org.mockito.Mockito.doAnswer(invocation -> sessionOperation(invocation.getArgument(5), 0L))
                .when(sessionCoordinator)
                .write(any(), any(), anyLong(), any(), any(), any());

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", gradingCapability,
                        "assessments", twoCardAssessments(true, true)));

        assertThat(result.isError()).isFalse();
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS, result);
        JsonNode continuation = objectMapper.valueToTree(result.structuredContent())
                .path("continuation");
        assertThat(continuation.path("action").asText()).isEqualTo("teachActiveGoal");
        assertThat(continuation.path("consentRequired").asBoolean()).isFalse();
        assertThat(continuation.has("toolCall")).isFalse();
    }

    @Test
    void recallCapabilitiesRejectManipulationAndTruncatedAssessmentsBeforeAnyWrite() {
        UnifiedLearnerStateResponse state = memoryState("memory-public-id");
        Instant issuedAt = Instant.ofEpochMilli(Instant.now().minusSeconds(30).toEpochMilli());
        VerifiedRecallPromptResponse issued = new VerifiedRecallPromptResponse(
                "ready",
                "Beantworte beide Fragen.",
                LEARNER_ID,
                "memory-public-id",
                "Grundwissen",
                2,
                0,
                2,
                2,
                0,
                null,
                2,
                List.of(
                        new VerifiedRecallPromptCard("card-public-id-1", "Frage eins?", "Formel"),
                        new VerifiedRecallPromptCard("card-public-id-2", "Frage zwei?", "Satz")),
                "card-public-id-1",
                "Frage eins?",
                "Formel",
                10,
                issuedAt);
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);
        when(coachTools.startVerifiedRecallBatch(LEARNER_ID, "de", "memory-public-id", 10))
                .thenReturn(issued);
        when(coachTools.getVerifiedRecallAnswersBatch(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new VerifiedRecallBatchAnswerResponse(
                        "Vergleichen.",
                        "memory-public-id",
                        List.of(
                                new VerifiedRecallBatchAnswerCard(
                                        "card-public-id-1", "Frage eins?", "Antwort eins.", "Formel"),
                                new VerifiedRecallBatchAnswerCard(
                                        "card-public-id-2", "Frage zwei?", "Antwort zwei.", "Satz"))));
        org.mockito.Mockito.doAnswer(invocation -> sessionOperation(invocation.getArgument(5), 0L))
                .when(sessionCoordinator)
                .write(any(), any(), anyLong(), any(), any(), any());

        McpSchema.CallToolResult start = call(OpenAiDeV1McpContractAdapter.START_RECALL, Map.of());
        String batchCapability =
                structured(start, OpenAiDeV1McpContractAdapter.RecallPromptResult.class).batchCapability();
        int manipulatedIndex = batchCapability.length() / 2;
        char originalCapabilityCharacter = batchCapability.charAt(manipulatedIndex);
        String manipulatedCapability = batchCapability.substring(0, manipulatedIndex)
                + (originalCapabilityCharacter == 'A' ? 'B' : 'A')
                + batchCapability.substring(manipulatedIndex + 1);
        McpSchema.CallToolResult rejectedCapability = call(
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS,
                Map.of("batchCapability", manipulatedCapability));
        McpSchema.CallToolResult answers = call(
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS,
                Map.of("batchCapability", batchCapability));
        String gradingCapability =
                structured(answers, OpenAiDeV1McpContractAdapter.RecallAnswersResult.class).gradingCapability();
        McpSchema.CallToolResult rejectedTruncation = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", gradingCapability,
                        "assessments", List.of(Map.of("passed", true))));

        assertThat(rejectedCapability.isError()).isTrue();
        assertThat(rejectedCapability.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                        .containsEntry("code", "INVALID_INPUT"));
        assertThat(rejectedTruncation.isError()).isTrue();
        assertThat(rejectedTruncation.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                        .containsEntry("code", "INVALID_INPUT"));
        assertThat(rejectedCapability.content().toString())
                .doesNotContain(batchCapability, manipulatedCapability, LEARNING_SESSION_ID);
        assertThat(rejectedTruncation.content().toString())
                .doesNotContain(gradingCapability, LEARNING_SESSION_ID);
        verify(coachTools, never()).recordVerifiedRecallResultsBatch(any(), any(), any());
    }

    @Test
    void recallCapabilitiesAreBoundToTheIssuingLearningSession() {
        String batchCapability = issueTwoCardRecallBatchCapability();
        String gradingCapability = issueTwoCardRecallGradingCapability(batchCapability);
        when(identityResolver.resolveSkillpilotId(any(), eq(OTHER_LEARNING_SESSION_ID)))
                .thenReturn(LEARNER_ID);

        McpSchema.CallToolResult foreignBatch = callWithoutLearningSession(
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS,
                Map.of(
                        OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, OTHER_LEARNING_SESSION_ID,
                        "batchCapability", batchCapability));
        McpSchema.CallToolResult foreignGrading = callWithoutLearningSession(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, OTHER_LEARNING_SESSION_ID,
                        "gradingCapability", gradingCapability,
                        "assessments", twoCardAssessments(true, false)));

        assertInvalidRecallCapability(foreignBatch, batchCapability);
        assertInvalidRecallCapability(foreignGrading, gradingCapability);
        verify(coachTools).getVerifiedRecallAnswersBatch(eq(LEARNER_ID), eq("de"), any());
        verify(coachTools, never()).recordVerifiedRecallResultsBatch(any(), any(), any());
        verify(sessionCoordinator, never()).write(any(), any(), anyLong(), any(), any(), any());
    }

    @Test
    void recallCapabilitiesCannotBeUsedForTheOtherCapabilityStage() {
        String batchCapability = issueTwoCardRecallBatchCapability();
        String gradingCapability = issueTwoCardRecallGradingCapability(batchCapability);

        McpSchema.CallToolResult gradingAsBatch = call(
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS,
                Map.of("batchCapability", gradingCapability));
        McpSchema.CallToolResult batchAsGrading = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", batchCapability,
                        "assessments", twoCardAssessments(true, false)));

        assertInvalidRecallCapability(gradingAsBatch, gradingCapability);
        assertInvalidRecallCapability(batchAsGrading, batchCapability);
        verify(coachTools).getVerifiedRecallAnswersBatch(eq(LEARNER_ID), eq("de"), any());
        verify(coachTools, never()).recordVerifiedRecallResultsBatch(any(), any(), any());
        verify(sessionCoordinator, never()).write(any(), any(), anyLong(), any(), any(), any());
    }

    @Test
    void staleRecallCapabilitiesFailClosedBeforeTheirBackendOperations() {
        String batchCapability = issueTwoCardRecallBatchCapability();
        String gradingCapability = issueTwoCardRecallGradingCapability(batchCapability);
        org.mockito.Mockito.doAnswer(invocation -> sessionOperation(invocation.getArgument(1), 1L))
                .when(sessionCoordinator)
                .read(any(), any());

        McpSchema.CallToolResult staleBatch = call(
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS,
                Map.of("batchCapability", batchCapability));
        McpSchema.CallToolResult staleGrading = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", gradingCapability,
                        "assessments", twoCardAssessments(true, false)));

        assertStaleRecallCapability(staleBatch, batchCapability);
        assertStaleRecallCapability(staleGrading, gradingCapability);
        verify(coachTools).getVerifiedRecallAnswersBatch(eq(LEARNER_ID), eq("de"), any());
        verify(coachTools, never()).recordVerifiedRecallResultsBatch(any(), any(), any());
        verify(sessionCoordinator).write(
                eq(LEARNING_SESSION_ID),
                eq(OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS),
                eq(0L),
                any(),
                any(),
                any());
    }

    @Test
    void recallResultRetriesDeriveOneStableIdentityFromTheGradingCapability() {
        String batchCapability = issueTwoCardRecallBatchCapability();
        String gradingCapability = issueTwoCardRecallGradingCapability(batchCapability);
        McpSchema.CallToolResult coordinatorReceipt = McpSchema.CallToolResult.builder()
                .isError(false)
                .addTextContent("stored")
                .structuredContent(Map.of("status", "stored"))
                .build();
        org.mockito.Mockito.doReturn(coordinatorReceipt)
                .when(sessionCoordinator)
                .write(any(), any(), anyLong(), any(), any(), any());
        List<Map<String, Object>> originalAssessments = twoCardAssessments(true, false);
        List<Map<String, Object>> changedAssessments = twoCardAssessments(false, false);

        McpSchema.CallToolResult first = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", gradingCapability,
                        "assessments", originalAssessments));
        McpSchema.CallToolResult exactRetry = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", gradingCapability,
                        "assessments", originalAssessments));
        McpSchema.CallToolResult changedRetry = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", gradingCapability,
                        "assessments", changedAssessments));

        assertThat(List.of(first, exactRetry, changedRetry))
                .allSatisfy(result -> assertThat(result.isError()).isFalse());
        ArgumentCaptor<Long> expectedStateVersion = ArgumentCaptor.forClass(Long.class);
        ArgumentCaptor<String> requestId = ArgumentCaptor.forClass(String.class);
        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> arguments = ArgumentCaptor.forClass(Map.class);
        verify(sessionCoordinator, times(3)).write(
                eq(LEARNING_SESSION_ID),
                eq(OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS),
                expectedStateVersion.capture(),
                requestId.capture(),
                arguments.capture(),
                any());

        String expectedRequestId = UUID.nameUUIDFromBytes(
                        ("skillpilot-verified-recall-write-v1\0" + gradingCapability)
                                .getBytes(StandardCharsets.UTF_8))
                .toString();
        assertThat(expectedStateVersion.getAllValues()).containsExactly(0L, 0L, 0L);
        assertThat(requestId.getAllValues())
                .containsExactly(expectedRequestId, expectedRequestId, expectedRequestId);
        assertThat(arguments.getAllValues().get(0)).isEqualTo(arguments.getAllValues().get(1));
        assertThat(arguments.getAllValues().get(2)).isNotEqualTo(arguments.getAllValues().get(0));
        assertThat(arguments.getAllValues())
                .allSatisfy(argument -> assertThat(argument)
                        .doesNotContainKeys(
                                OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                                OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID));
        assertThat(arguments.getAllValues().get(0)).containsEntry("assessments", originalAssessments);
        assertThat(arguments.getAllValues().get(2)).containsEntry("assessments", changedAssessments);
        verify(coachTools, never()).recordVerifiedRecallResultsBatch(any(), any(), any());
    }

    @Test
    void recallAssessmentFeedbackIsSafelyTruncatedBeforeTheAtomicDomainWrite() {
        String batchCapability = issueTwoCardRecallBatchCapability();
        String gradingCapability = issueTwoCardRecallGradingCapability(batchCapability);
        when(coachTools.recordVerifiedRecallResultsBatch(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new VerifiedRecallBatchResultResponse(
                        List.of(
                                new VerifiedRecallBatchSavedResult("card-public-id-1", true),
                                new VerifiedRecallBatchSavedResult("card-public-id-2", false)),
                        1,
                        1,
                        false,
                        null,
                        null,
                        memoryState("memory-public-id")));
        org.mockito.Mockito.doAnswer(invocation -> sessionOperation(invocation.getArgument(5), 0L))
                .when(sessionCoordinator)
                .write(any(), any(), anyLong(), any(), any(), any());
        String overlongFeedback = "x".repeat(799) + "😀" + "must-be-truncated";

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS,
                Map.of(
                        "gradingCapability", gradingCapability,
                        "assessments", List.of(
                                Map.of("passed", true, "feedback", overlongFeedback),
                                Map.of("passed", false, "feedback", "Kurz."))));

        assertThat(result.isError()).isFalse();
        ArgumentCaptor<VerifiedRecallBatchResultRequest> request =
                ArgumentCaptor.forClass(VerifiedRecallBatchResultRequest.class);
        verify(coachTools).recordVerifiedRecallResultsBatch(eq(LEARNER_ID), eq("de"), request.capture());
        String truncated = request.getValue().results().getFirst().feedback();
        assertThat(truncated)
                .hasSizeLessThanOrEqualTo(800)
                .isEqualTo("x".repeat(799))
                .doesNotContain("😀", "must-be-truncated");
        assertThat(truncated.chars().noneMatch(codeUnit -> Character.isSurrogate((char) codeUnit))).isTrue();
    }

    @Test
    void goalNavigationWithoutExplicitRedirectKeepsTheActiveSuccessorAndPublishesNoChoices() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(normalState("teachActiveGoal"));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "goal"));
        OpenAiDeV1McpContractAdapter.NavigationResult navigation =
                structured(result, OpenAiDeV1McpContractAdapter.NavigationResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_NAVIGATION, result);

        assertThat(navigation.requiredAction()).isEqualTo("teachActiveGoal");
        assertThat(navigation.options()).isEmpty();
        assertThat(navigation.instruction()).contains(
                "bereits ein aktives Lernziel",
                "normalen Fortsetzen",
                "Lineare Gleichungen sicher lösen",
                "keine Lernzielauswahl",
                "früheren Zieloptionen");
        assertThat(result.content().toString())
                .contains("keine Lernzielauswahl geöffnet", "Frühere Zieloptionen sind ungültig")
                .doesNotContain("Navigationsoptionen für goal geladen");
    }

    @Test
    void goalNavigationGuardPreservesEveryActiveModeWhenRedirectIsFalse() {
        for (String requiredAction : List.of(
                "orientActiveGoal",
                "teachActiveGoal",
                "chooseMemoryMode",
                "setMastery")) {
            when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(normalState(requiredAction));

            McpSchema.CallToolResult result = call(
                    OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                    Map.of("target", "goal", "redirect", false));
            OpenAiDeV1McpContractAdapter.NavigationResult navigation =
                    structured(result, OpenAiDeV1McpContractAdapter.NavigationResult.class);

            assertThat(navigation.requiredAction()).isEqualTo(requiredAction);
            assertThat(navigation.options()).isEmpty();
            assertThat(navigation.instruction())
                    .contains(
                            "requiredAction=" + requiredAction,
                            "modusspezifischen Regeln",
                            "keine Lernzielauswahl offen");
        }
    }

    @Test
    void navigationRejectsRedirectForTargetsOtherThanGoal() {
        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "scope", "redirect", true));

        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "INVALID_INPUT")
                .containsEntry("category", "input")
                .containsEntry("retryable", false)
                .containsEntry("stateChanged", false));
        verify(coachTools, never()).getLearnerState(any());
    }

    @Test
    void explicitGoalRedirectPublishesOnlyAlternativeAtomicGoals() {
        FrontierGoal active = contentGoal("active-goal", "Lineare Funktionen untersuchen");
        FrontierGoal firstAlternative = contentGoal("alternative-one", "Bruchgleichungen lösen");
        FrontierGoal secondAlternative = contentGoal("alternative-two", "Zinssatz bestimmen");
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(activeGoalState(
                active,
                active,
                firstAlternative,
                secondAlternative));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "goal", "redirect", true));
        OpenAiDeV1McpContractAdapter.NavigationResult navigation =
                structured(result, OpenAiDeV1McpContractAdapter.NavigationResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_NAVIGATION, result);

        assertThat(navigation.requiredAction()).isEqualTo("setActiveGoal");
        assertThat(navigation.options())
                .extracting(OpenAiDeCoachContext.Option::id)
                .containsExactly(firstAlternative.id(), secondAlternative.id())
                .doesNotContain(active.id());
        assertThat(navigation.instruction()).contains(
                "ausdrücklich einen Wechsel",
                "anderes Ziel",
                "redirect=true");

        McpSchema.Tool navigationTool = spec(OpenAiDeV1McpContractAdapter.GET_NAVIGATION).tool();
        assertThat(navigationTool.description()).contains(
                "redirect=true",
                "explicitly requests a different goal");
        assertThat(objectMapper.valueToTree(navigationTool.inputSchema())
                        .at("/properties/redirect/type")
                        .asText())
                .isEqualTo("boolean");
    }

    @Test
    void goalNavigationNeverPublishesAClusterAsAnActiveGoalFallback() {
        FrontierGoal examFolder = clusterGoal("year-8-exams", "Prüfungen Jahrgangsstufe 8");
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-public-id",
                "Mathematik Hessen",
                "",
                "DE",
                "HE",
                "school",
                "Mathematik",
                "de",
                List.of());
        UnifiedLearnerStateResponse clusterOnlyState = new UnifiedLearnerStateResponse(
                LEARNER_ID,
                curriculum,
                List.of(examFolder),
                new LearnerGoals(
                        List.of(examFolder),
                        7,
                        7,
                        new GoalStats(20, 25),
                        new GoalStats(7, 7),
                        true),
                List.of("getFrontier"),
                List.of(),
                Set.of(),
                "frontier",
                null,
                new StateMachineInfo("FRONTIER", "getFrontier", List.of(), List.of(), null));
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(clusterOnlyState);

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "goal"));
        OpenAiDeV1McpContractAdapter.NavigationResult navigation =
                structured(result, OpenAiDeV1McpContractAdapter.NavigationResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_NAVIGATION, result);

        assertThat(navigation.requiredAction()).isEqualTo("getFrontier");
        assertThat(navigation.options()).isEmpty();
        assertThat(navigation.instruction()).contains("keine sicheren Optionen");
    }

    @Test
    void scopeNavigationPublishesBroaderAncestorsNearestFirstAndCopiesTheFirstGoalIdsUnchanged() {
        FrontierGoal ePhase = clusterGoal(
                "composition:de-he-gym-sekii-math-lk:structure:e-phase",
                "E-Phase: Grundlagen der Analysis und mathematische Modelle")
                .withSelectionGoalIds(List.of(
                        "composition:de-he-gym-sekii-math-lk:structure:e-phase",
                        "composition:de-de-gym-physics-lk:structure:physics-root"));
        FrontierGoal sekTwo = clusterGoal(
                "composition:de-he-gym-sekii-math-lk:structure:sek2-lk",
                "Sekundarstufe II (LK)");
        FrontierGoal mathematics = clusterGoal("math-root", "Mathematik");
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(normalState("teachActiveGoal"));
        when(coachTools.getScopeOptions(LEARNER_ID)).thenReturn(List.of(ePhase, sekTwo, mathematics));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "scope"));
        OpenAiDeV1McpContractAdapter.NavigationResult navigation =
                structured(result, OpenAiDeV1McpContractAdapter.NavigationResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_NAVIGATION, result);

        assertThat(navigation.requiredAction()).isEqualTo("setScope");
        assertThat(navigation.options())
                .extracting(
                        OpenAiDeCoachContext.Option::kind,
                        OpenAiDeCoachContext.Option::label,
                        OpenAiDeCoachContext.Option::goalIds)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple(
                                "scope",
                                "E-Phase: Grundlagen der Analysis und mathematische Modelle",
                                ePhase.selectionGoalIds()),
                        org.assertj.core.groups.Tuple.tuple(
                                "scope",
                                "Sekundarstufe II (LK)",
                                List.of(sekTwo.id())),
                        org.assertj.core.groups.Tuple.tuple(
                                "scope",
                                "Mathematik",
                                List.of(mathematics.id())));
        assertThat(navigation.instruction())
                .contains(
                        "ausschließlich den Lernfokus",
                        "keine nächsten Lernziele",
                        "ausdrücklichen Wunsch zum Fokuswechsel",
                        "Bei Start, Fortsetzen oder Wiederaufnehmen darfst du sie nicht präsentieren",
                        "Geeignete learner-facing Vorfahren stehen zuerst",
                        "der nächste breitere Fokus an erster Stelle",
                        "kopiere genau das goalIds-Feld der ersten veröffentlichten Option unverändert",
                        "Leite niemals selbst einen Vorfahren oder eine ID ab")
                .doesNotContain("Womit möchtest du weitermachen");

        McpSchema.Tool navigationTool = contract.toolSpecifications().stream()
                .map(McpStatelessServerFeatures.SyncToolSpecification::tool)
                .filter(tool -> OpenAiDeV1McpContractAdapter.GET_NAVIGATION.equals(tool.name()))
                .findFirst()
                .orElseThrow();
        assertThat(navigationTool.description())
                .contains(
                        "only after the learner explicitly requests a change",
                        "Never call it for a normal start, continuation, or resumption",
                        "focus clusters, never next learning goals",
                        "learner-facing ancestors come first",
                        "nearest broader focus first",
                        "use exactly the first option's goalIds unchanged",
                        "never infer an ancestor or ID");

        List<String> firstFreshOption = navigation.options().getFirst().goalIds();
        when(coachTools.setScope(eq(LEARNER_ID), any(ScopeRequest.class)))
                .thenReturn(normalState("teachActiveGoal"));
        McpSchema.CallToolResult scopeWrite = call(
                OpenAiDeV1McpContractAdapter.SET_SCOPE,
                Map.of("goalIds", firstFreshOption));

        assertThat(scopeWrite.isError()).isFalse();
        ArgumentCaptor<ScopeRequest> scopeRequest = ArgumentCaptor.forClass(ScopeRequest.class);
        verify(coachTools).setScope(eq(LEARNER_ID), scopeRequest.capture());
        assertThat(scopeRequest.getValue().goalIds()).containsExactlyElementsOf(ePhase.selectionGoalIds());
    }

    @Test
    void scopeNavigationLocalizesTheBroaderFocusRuleInEnglish() {
        sessionCommunicationLocale = "en-GB";
        FrontierGoal ePhase = clusterGoal(
                "composition:de-he-gym-sekii-math-lk:structure:e-phase",
                "E phase");
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(normalState("teachActiveGoal"));
        when(coachTools.getScopeOptions(LEARNER_ID)).thenReturn(List.of(ePhase));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "scope"));
        OpenAiDeV1McpContractAdapter.NavigationResult navigation =
                structured(result, OpenAiDeV1McpContractAdapter.NavigationResult.class);

        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_NAVIGATION, result);
        assertThat(navigation.options()).singleElement()
                .extracting(OpenAiDeCoachContext.Option::goalIds)
                .isEqualTo(List.of(ePhase.id()));
        assertThat(navigation.instruction()).contains(
                "Suitable learner-facing ancestors come first",
                "nearest broader focus first",
                "copy exactly the first published option's goalIds unchanged",
                "Never infer an ancestor or construct an ID");
    }

    @Test
    void setScopeRejectsGoalIdsThatDoNotMatchOneFreshPublishedOption() {
        FrontierGoal published = clusterGoal("scope-parent", "Broader scope")
                .withSelectionGoalIds(List.of("scope-parent", "preserved-root"));
        when(coachTools.getScopeOptions(LEARNER_ID)).thenReturn(List.of(published));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_SCOPE,
                Map.of("goalIds", List.of("scope-parent")));

        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "STATE_CONFLICT")
                .containsEntry("stateChanged", false));
        verify(coachTools, never()).setScope(any(), any());
    }

    @Test
    void expiredLearningSessionReturnsSessionRequiredWithoutAnOauthChallenge() {
        when(identityResolver.resolveSkillpilotId(any(), eq(LEARNING_SESSION_ID)))
                .thenThrow(new OpenAiDeLearningSessionRequiredException());

        McpSchema.CallToolResult result = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(result.isError()).isTrue();
        assertThat(result.meta()).isNull();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("status", "session_required")
                .containsEntry("code", "SESSION_REQUIRED")
                .containsEntry("stateChanged", false)
                .containsEntry("oauthConnectionValid", true)
                .containsEntry("startUrl", "https://skillpilot.test")
                .containsKey("instructions")
                .doesNotContainKeys(
                        "recoveryTool",
                        "recoveryPurpose",
                        "recoveryCommunicationLocale",
                        "purpose"));
        JsonNode instructions = objectMapper.valueToTree(result.structuredContent()).at("/instructions");
        assertThat(instructions.path("de").asText())
                .contains("SkillPilot", "Lernen starten", "neuen Chat");
        assertThat(instructions.path("en").asText())
                .contains("SkillPilot", "Start learning", "new chat");
        assertThat(instructions.size()).isEqualTo(2);
        assertThat(result.content().toString())
                .contains("SkillPilot-Lernsession", "SkillPilot learning session", "neuen Chat", "new chat")
                .doesNotContain(LEARNER_ID, CONNECTION_SECRET, CHALLENGE);
        verify(coachTools, never()).getLearnerState(any());
        assertThat(operationalEvents("session_required")).isEqualTo(1);
        assertThat(operationalEvents("http_401")).isZero();
    }

    @Test
    void sessionStateFailureExposesStableCodeAndPinnedVersionMetadata() {
        OpenAiDeV1SessionMetadata metadata = new OpenAiDeV1SessionMetadata(
                1,
                27L,
                1,
                "coach@1.0",
                "curricula-tree@published",
                "de-DE",
                Map.of());
        org.mockito.Mockito.doThrow(new OpenAiDeV1SessionStateException(
                        OpenAiDeV1SessionStateException.Code.SESSION_VERSION_UNAVAILABLE,
                        metadata,
                        "private unavailable revision detail"))
                .when(sessionCoordinator)
                .read(any(), any());

        McpSchema.CallToolResult result =
                call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "SESSION_VERSION_UNAVAILABLE")
                .containsEntry("category", "state")
                .containsEntry("retryable", false)
                .containsEntry("stateChanged", false)
                .containsEntry("contractMajor", 1)
                .containsEntry("stateVersion", 27L)
                .containsEntry("stateSchemaVersion", 1)
                .containsEntry("workflowVersion", "coach@1.0")
                .containsEntry("curriculumRevision", "curricula-tree@published")
                .containsEntry("startUrl", "https://skillpilot.test")
                .containsEntry("oauthConnectionValid", true)
                .containsEntry("communicationLocale", "de-DE")
                .doesNotContainKeys(
                        "recoveryTool",
                        "recoveryPurpose",
                        "recoveryCommunicationLocale",
                        "purpose"));
        assertThat(result.content().toString())
                .contains("SkillPilot", "Lernen starten", "neuen Chat", "OAuth-Verbindung bleibt aktiv")
                .doesNotContain("private unavailable revision detail", LEARNER_ID);
    }

    @Test
    void expiringSessionReturnsLocalizedWebGuiRenewalWithoutCallingTheFacade() {
        OpenAiDeV1SessionMetadata germanMetadata = new OpenAiDeV1SessionMetadata(
                1,
                27L,
                1,
                "coach@1.0",
                "curricula-tree@published",
                "de-DE",
                Map.of());
        OpenAiDeV1SessionMetadata englishMetadata = new OpenAiDeV1SessionMetadata(
                1,
                28L,
                1,
                "coach@1.0",
                "curricula-tree@published",
                "en-GB",
                Map.of());
        org.mockito.Mockito.doThrow(
                        new OpenAiDeV1SessionStateException(
                                OpenAiDeV1SessionStateException.Code.SESSION_RENEWAL_REQUIRED,
                                germanMetadata,
                                "private expiry detail"),
                        new OpenAiDeV1SessionStateException(
                                OpenAiDeV1SessionStateException.Code.SESSION_RENEWAL_REQUIRED,
                                englishMetadata,
                                "private expiry detail"))
                .when(sessionCoordinator)
                .read(any(), any());

        McpSchema.CallToolResult german =
                call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());
        McpSchema.CallToolResult english =
                call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(german.isError()).isTrue();
        assertThat(german.meta()).isNull();
        assertThat(german.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("status", "session_renewal_required")
                .containsEntry("code", "SESSION_RENEWAL_REQUIRED")
                .containsEntry("category", "session")
                .containsEntry("retryable", false)
                .containsEntry("stateChanged", false)
                .containsEntry("oauthConnectionValid", true)
                .containsEntry("startUrl", "https://skillpilot.test")
                .containsEntry("minimumRemainingSeconds", 3600L)
                .containsEntry("communicationLocale", "de-DE")
                .doesNotContainKeys(
                        "recoveryTool",
                        "recoveryPurpose",
                        "recoveryCommunicationLocale",
                        "purpose"));
        assertThat(german.content().toString())
                .contains("SkillPilot", "Lernen starten", "neuen Chat", "OAuth-Verbindung bleibt aktiv")
                .doesNotContain("private expiry detail", LEARNER_ID, CHALLENGE);
        assertThat(english.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("status", "session_renewal_required")
                .containsEntry("code", "SESSION_RENEWAL_REQUIRED")
                .containsEntry("oauthConnectionValid", true)
                .containsEntry("minimumRemainingSeconds", 3600L)
                .containsEntry("communicationLocale", "en-GB")
                .doesNotContainKeys(
                        "recoveryTool",
                        "recoveryPurpose",
                        "recoveryCommunicationLocale",
                        "purpose"));
        assertThat(english.content().toString())
                .contains("SkillPilot", "Start learning", "new chat", "OAuth connection remains active")
                .doesNotContain("private expiry detail", LEARNER_ID, CHALLENGE);
        verify(coachTools, never()).getLearnerState(any());
        assertThat(operationalEvents("session_renewal_required")).isEqualTo(2);
        assertThat(operationalEvents("http_401")).isZero();
    }

    @Test
    void missingLearningSessionReturnsSessionRequiredBeforeResolvingIdentity() {
        McpSchema.CallToolResult result = callWithoutLearningSession(
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                Map.of());

        assertThat(result.isError()).isTrue();
        assertThat(result.meta()).isNull();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "SESSION_REQUIRED")
                .containsEntry("oauthConnectionValid", true)
                .containsEntry("startUrl", "https://skillpilot.test")
                .containsKey("instructions")
                .doesNotContainKeys(
                        "recoveryTool",
                        "recoveryPurpose",
                        "recoveryCommunicationLocale",
                        "purpose"));
        assertThat(result.content().toString())
                .contains(
                        "SkillPilot-Lernsession",
                        "SkillPilot learning session",
                        "Lernen starten",
                        "Start learning",
                        "neuen Chat",
                        "new chat");
        verify(identityResolver, never()).resolveSkillpilotId(any(), any());
        verify(coachTools, never()).getLearnerState(any());
    }

    @Test
    void malformedLearningSessionReturnsSessionRequiredBeforeResolvingIdentity() {
        McpSchema.CallToolResult result = callWithoutLearningSession(
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, "sps_not-valid"));

        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "SESSION_REQUIRED")
                .containsEntry("stateChanged", false));
        verify(identityResolver, never()).resolveSkillpilotId(any(), any());
        verify(coachTools, never()).getLearnerState(any());
    }

    @Test
    void missingWriteScopeBecomesSpecificMcpChallengeWithoutCallingFacade() {
        org.mockito.Mockito.doThrow(new AccessDeniedException("secret internal reason"))
                .when(identityResolver)
                .requireWriteAccess(any());

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_SCOPE,
                Map.of("goalIds", List.of("goal-public-id")));

        assertThat(result.isError()).isTrue();
        assertThat(result.meta())
                .containsEntry(
                        SkillPilotMcpToolResults.WWW_AUTHENTICATE_META_KEY,
                        List.of(INSUFFICIENT_SCOPE_CHALLENGE));
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "INSUFFICIENT_SCOPE")
                .containsEntry("category", "scope")
                .containsEntry("retryable", false)
                .containsEntry("stateChanged", false));
        assertThat(result.content().toString()).doesNotContain("secret internal reason", LEARNER_ID);
        verify(coachTools, never()).setScope(any(), any());
        assertThat(operationalEvents("http_403")).isEqualTo(1);
    }

    @Test
    void writesKillSwitchReturnsStableServiceUnavailableWithoutOauthChallenge() {
        org.mockito.Mockito.doThrow(new ResponseStatusException(
                        HttpStatus.SERVICE_UNAVAILABLE,
                        "private kill-switch implementation detail"))
                .when(identityResolver)
                .requireWriteAccess(any());

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_SCOPE,
                Map.of("goalIds", List.of("goal-public-id")));

        assertThat(result.isError()).isTrue();
        assertThat(result.meta()).isNull();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "SERVICE_UNAVAILABLE")
                .containsEntry("category", "availability")
                .containsEntry("retryable", true)
                .containsEntry("stateChanged", false)
                .containsEntry("recovery", "retry_later"));
        assertThat(result.content().toString())
                .contains("temporarily unavailable")
                .doesNotContain("private kill-switch implementation detail", LEARNER_ID);
        verify(coachTools, never()).setScope(any(), any());
    }

    @Test
    void authenticationConflictAndTimeoutUseOnlyBoundedOperationalEvents() {
        when(identityResolver.resolveSkillpilotId(any(), eq(LEARNING_SESSION_ID)))
                .thenThrow(new AuthenticationCredentialsNotFoundException("private authentication detail"));

        McpSchema.CallToolResult unauthorized = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(unauthorized.isError()).isTrue();
        assertThat(unauthorized.meta())
                .containsEntry(
                        SkillPilotMcpToolResults.WWW_AUTHENTICATE_META_KEY,
                        List.of(CHALLENGE));
        assertThat(unauthorized.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "AUTHENTICATION_REQUIRED")
                .containsEntry("category", "auth")
                .containsEntry("stateChanged", false));
        assertThat(unauthorized.content().toString()).doesNotContain("private authentication detail");
        assertThat(operationalEvents("http_401")).isEqualTo(1);
        assertThat(operationalEvents("tool_exception")).isZero();

        org.mockito.Mockito.doReturn(LEARNER_ID)
                .when(identityResolver)
                .resolveSkillpilotId(any(), eq(LEARNING_SESSION_ID));
        org.mockito.Mockito.doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "private conflict detail"))
                .when(coachTools)
                .getLearnerState(LEARNER_ID);

        McpSchema.CallToolResult conflict = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(conflict.isError()).isTrue();
        assertThat(conflict.content().toString())
                .contains("Kontext genau einmal neu")
                .doesNotContain("private conflict detail");
        assertThat(conflict.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "STATE_CONFLICT")
                .containsEntry("category", "conflict")
                .containsEntry("retryable", true)
                .containsEntry("stateVersion", 0L)
                .containsEntry("workflowVersion", "coach@1.0")
                .containsEntry("curriculumRevision", "curricula-tree@test"));
        assertThat(operationalEvents("http_409")).isEqualTo(1);
        assertThat(operationalEvents("tool_exception")).isZero();

        org.mockito.Mockito.doThrow(new IllegalStateException(
                        "private timeout detail",
                        new java.util.concurrent.TimeoutException("private cause")))
                .when(coachTools)
                .getLearnerState(LEARNER_ID);

        McpSchema.CallToolResult timeout = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(timeout.isError()).isTrue();
        assertThat(timeout.content().toString()).doesNotContain("private timeout detail", "private cause");
        assertThat(timeout.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "TIMEOUT")
                .containsEntry("category", "timeout")
                .containsEntry("retryable", true)
                .containsEntry("stateChanged", false)
                .containsEntry("stateVersion", 0L));
        assertThat(operationalEvents("tool_exception")).isEqualTo(1);
        assertThat(operationalEvents("timeout")).isEqualTo(1);
    }

    @Test
    void unexpectedProviderFailureReturnsOnlyFixedMessageAndCorrelationId() {
        String secretToken = "oauth-access-token-must-not-leak";
        when(coachTools.getLearnerState(LEARNER_ID)).thenThrow(new IllegalStateException(
                "database failure learner=" + LEARNER_ID + " token=" + secretToken));

        McpSchema.CallToolResult result = call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());

        assertThat(result.isError()).isTrue();
        assertThat(result.content().toString())
                .contains("internen Fehlers")
                .containsPattern("Referenz: [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}")
                .doesNotContain(
                        "database failure",
                        LEARNER_ID,
                        CONNECTION_SECRET,
                        secretToken,
                        "IllegalStateException");
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "INTERNAL_ERROR")
                .containsEntry("category", "internal")
                .containsEntry("retryable", false)
                .containsEntry("stateChanged", false)
                .containsEntry("stateVersion", 0L)
                .containsKey("reference"));
        assertThat(operationalEvents("tool_exception")).isEqualTo(1);
        assertThat(operationalEvents("timeout")).isZero();
    }

    private double operationalEvents(String event) {
        return meterRegistry.get(OpenAiDeOperationalTelemetry.EVENT_METRIC)
                .tag("event", event)
                .counter()
                .count();
    }

    private static Map<String, Object> masteryArguments(String goalId) {
        return Map.of(
                "goalId", goalId,
                OpenAiDeV1McpContractAdapter.WORK_FEEDBACK, TEST_WORK_FEEDBACK,
                OpenAiDeV1McpContractAdapter.OUTCOME_FEEDBACK, TEST_OUTCOME_FEEDBACK);
    }

    private static Map<String, Object> masteryArguments(
            String goalId,
            String orientationPathId) {
        return Map.of(
                "goalId", goalId,
                OpenAiDeV1McpContractAdapter.ORIENTATION_PATH_ID, orientationPathId,
                OpenAiDeV1McpContractAdapter.WORK_FEEDBACK, TEST_WORK_FEEDBACK,
                OpenAiDeV1McpContractAdapter.OUTCOME_FEEDBACK, TEST_OUTCOME_FEEDBACK);
    }

    private static Map<String, Object> examMasteryArguments(
            String goalId,
            String evaluationCapability,
            double earnedPoints) {
        Map<String, Object> arguments = new java.util.LinkedHashMap<>(masteryArguments(goalId));
        arguments.put(OpenAiDeV1McpContractAdapter.EXAM_EVALUATION_CAPABILITY, evaluationCapability);
        arguments.put(OpenAiDeV1McpContractAdapter.EXAM_EARNED_POINTS, earnedPoints);
        return arguments;
    }

    private String issueTwoCardRecallBatchCapability() {
        Instant issuedAt = Instant.ofEpochMilli(Instant.now().minusSeconds(30).toEpochMilli());
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(memoryState("memory-public-id"));
        when(coachTools.startVerifiedRecallBatch(LEARNER_ID, "de", "memory-public-id", 10))
                .thenReturn(new VerifiedRecallPromptResponse(
                        "ready",
                        "Beantworte beide Fragen.",
                        LEARNER_ID,
                        "memory-public-id",
                        "Grundwissen",
                        2,
                        0,
                        2,
                        2,
                        0,
                        null,
                        2,
                        List.of(
                                new VerifiedRecallPromptCard("card-public-id-1", "Frage eins?", "Formel"),
                                new VerifiedRecallPromptCard("card-public-id-2", "Frage zwei?", "Satz")),
                        "card-public-id-1",
                        "Frage eins?",
                        "Formel",
                        10,
                        issuedAt));

        McpSchema.CallToolResult start = call(OpenAiDeV1McpContractAdapter.START_RECALL, Map.of());

        assertThat(start.isError()).isFalse();
        return structured(start, OpenAiDeV1McpContractAdapter.RecallPromptResult.class).batchCapability();
    }

    private String issueTwoCardRecallGradingCapability(String batchCapability) {
        when(coachTools.getVerifiedRecallAnswersBatch(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new VerifiedRecallBatchAnswerResponse(
                        "Vergleiche beide Antworten.",
                        "memory-public-id",
                        List.of(
                                new VerifiedRecallBatchAnswerCard(
                                        "card-public-id-1", "Frage eins?", "Antwort eins.", "Formel"),
                                new VerifiedRecallBatchAnswerCard(
                                        "card-public-id-2", "Frage zwei?", "Antwort zwei.", "Satz"))));

        McpSchema.CallToolResult answers = call(
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS,
                Map.of("batchCapability", batchCapability));

        assertThat(answers.isError()).isFalse();
        return structured(answers, OpenAiDeV1McpContractAdapter.RecallAnswersResult.class)
                .gradingCapability();
    }

    private static List<Map<String, Object>> twoCardAssessments(
            boolean firstPassed,
            boolean secondPassed) {
        return List.of(
                Map.<String, Object>of("passed", firstPassed, "feedback", "Bewertung eins."),
                Map.<String, Object>of("passed", secondPassed, "feedback", "Bewertung zwei."));
    }

    private void assertInvalidRecallCapability(
            McpSchema.CallToolResult result,
            String capability) {
        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                        .containsEntry("code", "INVALID_INPUT"));
        assertThat(result.content().toString())
                .doesNotContain(capability, LEARNING_SESSION_ID, OTHER_LEARNING_SESSION_ID);
    }

    private void assertStaleRecallCapability(
            McpSchema.CallToolResult result,
            String capability) {
        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent())
                .isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                        .containsEntry("code", "STATE_VERSION_CONFLICT")
                        .containsEntry("status", "conflict")
                        .containsEntry("reloadContextAtMostOnce", true));
        assertThat(result.content().toString())
                .doesNotContain(capability, LEARNING_SESSION_ID, OTHER_LEARNING_SESSION_ID);
    }

    private McpSchema.CallToolResult call(String name, Map<String, Object> arguments) {
        Map<String, Object> requestArguments = new java.util.LinkedHashMap<>(arguments);
        requestArguments.put(
                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                LEARNING_SESSION_ID);
        if (Boolean.FALSE.equals(spec(name).tool().annotations().readOnlyHint())
                && !OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS.equals(name)) {
            requestArguments.putIfAbsent(
                    OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                    0L);
            requestArguments.putIfAbsent(
                    OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID,
                    UUID.randomUUID().toString());
        }
        if (OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION.equals(name)) {
            requestArguments.putIfAbsent(
                    OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                    0L);
        }
        return callWithoutLearningSession(name, requestArguments);
    }

    @SuppressWarnings("unchecked")
    private McpSchema.CallToolResult sessionOperation(Object operation, long stateVersion) {
        Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult> callback =
                (Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult>) operation;
        return callback.apply(new OpenAiDeV1SessionMetadata(
                1,
                stateVersion,
                1,
                "coach@1.0",
                "curricula-tree@test",
                sessionCommunicationLocale,
                Map.of()));
    }

    private <T> T structured(McpSchema.CallToolResult result, Class<T> type) {
        @SuppressWarnings("unchecked")
        Map<String, Object> source =
                new java.util.LinkedHashMap<>((Map<String, Object>) result.structuredContent());
        for (String field : List.of(
                "contractMajor",
                "stateVersion",
                "stateSchemaVersion",
                "workflowVersion",
                "curriculumRevision",
                "communicationLocale",
                "extensions")) {
            source.remove(field);
        }
        return objectMapper.convertValue(source, type);
    }

    private McpSchema.CallToolResult callWithoutLearningSession(
            String name,
            Map<String, Object> arguments) {
        return spec(name).callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(name, arguments));
    }

    private McpStatelessServerFeatures.SyncToolSpecification spec(String name) {
        return contract.toolSpecifications().stream()
                .filter(candidate -> name.equals(candidate.tool().name()))
                .findFirst()
                .orElseThrow();
    }

    private void assertExactSecuritySchemes(String toolName, List<String> scopes) {
        assertThat(spec(toolName).tool().meta().get("securitySchemes"))
                .isEqualTo(List.of(Map.of(
                        "type", "oauth2",
                        "scopes", scopes)));
    }

    private void assertMatchesOutputSchema(String toolName, McpSchema.CallToolResult result) {
        JsonNode json = objectMapper.valueToTree(result.structuredContent());
        assertSchemaNode(json, spec(toolName).tool().outputSchema(), toolName);
    }

    @SuppressWarnings("unchecked")
    private void assertSchemaNode(JsonNode node, Map<String, Object> schema, String path) {
        assertThat(node.isNull()).as("%s must not serialize as null", path).isFalse();
        String type = (String) schema.get("type");
        if ("object".equals(type)) {
            assertThat(node.isObject()).as("%s must be an object", path).isTrue();
            List<String> required = (List<String>) schema.getOrDefault("required", List.of());
            for (String property : required) {
                assertThat(node.has(property)).as("%s.%s is required", path, property).isTrue();
            }
            Map<String, Object> properties =
                    (Map<String, Object>) schema.getOrDefault("properties", Map.of());
            for (Map.Entry<String, Object> property : properties.entrySet()) {
                if (node.has(property.getKey())) {
                    assertSchemaNode(
                            node.get(property.getKey()),
                            (Map<String, Object>) property.getValue(),
                            path + "." + property.getKey());
                }
            }
            return;
        }
        if ("array".equals(type)) {
            assertThat(node.isArray()).as("%s must be an array", path).isTrue();
            Object itemSchema = schema.get("items");
            if (itemSchema instanceof Map<?, ?> items) {
                for (int index = 0; index < node.size(); index++) {
                    assertSchemaNode(
                            node.get(index),
                            (Map<String, Object>) items,
                            path + "[" + index + "]");
                }
            } else if (Boolean.FALSE.equals(itemSchema)) {
                Object prefixItems = schema.get("prefixItems");
                int maximumItems = prefixItems instanceof List<?> prefixes ? prefixes.size() : 0;
                assertThat(node.size())
                        .as("%s must not contain items outside prefixItems", path)
                        .isLessThanOrEqualTo(maximumItems);
            }
            return;
        }
        if ("string".equals(type)) {
            assertThat(node.isTextual()).as("%s must be a string", path).isTrue();
        } else if ("boolean".equals(type)) {
            assertThat(node.isBoolean()).as("%s must be a boolean", path).isTrue();
        } else if ("integer".equals(type)) {
            assertThat(node.isIntegralNumber()).as("%s must be an integer", path).isTrue();
        } else if ("number".equals(type)) {
            assertThat(node.isNumber()).as("%s must be a number", path).isTrue();
        }
    }

    private LandscapeSummary curriculumSummary(
            String curriculumId,
            String title,
            String type,
            boolean compatibilityOnly,
            boolean legacyHiddenByDefault) {
        return new LandscapeSummary(
                curriculumId,
                title,
                "Beschreibung " + title,
                "DE",
                "",
                type,
                title,
                "de",
                List.of(),
                compatibilityOnly,
                legacyHiddenByDefault);
    }

    private UnifiedLearnerStateResponse curriculumSetupState(
            List<LandscapeSummary> curriculumOptions) {
        return new UnifiedLearnerStateResponse(
                LEARNER_ID,
                null,
                List.of(),
                new LearnerGoals(
                        List.of(),
                        0,
                        0,
                        new GoalStats(0, 0),
                        new GoalStats(0, 0),
                        false),
                List.of("setCurriculum"),
                List.of(),
                Set.of(),
                "setup",
                null,
                new StateMachineInfo(
                        "SETUP",
                        "setCurriculum",
                        List.of(),
                        curriculumOptions,
                        null));
    }

    private UnifiedLearnerStateResponse normalState(String requiredAction) {
        FrontierGoal active = contentGoal(
                "goal-public-id",
                "Lineare Gleichungen sicher lösen");
        return state(requiredAction, active);
    }

    private FrontierGoal contentGoal(String goalId, String title) {
        return new FrontierGoal(
                goalId,
                title,
                "Bearbeite das Lernziel dialogisch.",
                "atomic",
                "tutor",
                "frontier",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
    }

    private FrontierGoal clusterGoal(String goalId, String title) {
        return new FrontierGoal(
                goalId,
                title,
                "Navigation und Fortschrittsübersicht.",
                "cluster",
                null,
                null,
                "available",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
    }

    private FrontierGoal readyExamSummary(String goalId, String title) {
        return new FrontierGoal(
                goalId,
                title,
                "Bearbeite die freigegebene Prüfungsaufgabe.",
                "atomic",
                "exam",
                null,
                "frontier",
                List.of("ExamTask"),
                List.of(),
                null,
                null,
                null,
                null,
                true);
    }

    private FrontierGoal orientationGoal() {
        return new FrontierGoal(
                "orientation-public-id",
                "Warum Mathematik? – Denken, Muster & Zukunft",
                "Entdecke Möglichkeiten der Mathematik.",
                "atomic",
                "tutor",
                "orientation",
                "frontier",
                List.of("orientation", "motivation"),
                List.of(),
                null,
                null,
                null,
                null);
    }

    private UnifiedLearnerStateResponse goalSelectionState(FrontierGoal... options) {
        List<FrontierGoal> goals = List.of(options);
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-public-id",
                "Mathematik Oberstufe Hessen",
                "",
                "DE",
                "HE",
                "school",
                "Mathematik",
                "de",
                List.of());
        return new UnifiedLearnerStateResponse(
                LEARNER_ID,
                curriculum,
                goals,
                new LearnerGoals(
                        goals,
                        3,
                        10,
                        new GoalStats(3, 10),
                        new GoalStats(2, 5),
                        false),
                List.of("setActiveGoal"),
                List.of(),
                Set.of(),
                "frontier",
                null,
                new StateMachineInfo("FRONTIER", "setActiveGoal", goals, List.of(), null));
    }

    private UnifiedLearnerStateResponse memoryState(String goalId) {
        FrontierGoal active = new FrontierGoal(
                goalId,
                "Merkziel",
                "Rufe Fakten sicher ab.",
                "atomic",
                "memory",
                "frontier",
                List.of("memorization", "srs-deck:deck-1"),
                List.of(),
                null,
                null,
                null,
                null);
        return state("chooseMemoryMode", active);
    }

    private MemoryPracticeResponse memoryPracticeBatch(String cardId) {
        return new MemoryPracticeResponse(
                "ready",
                "Karte ansehen und anschließend selbst bewerten.",
                "memory-public-id",
                "Lernkarten – Funktionen und Gleichungen",
                new MemoryPracticeProgress(1, 1, 0),
                List.of(new MemoryPracticeCard(
                        cardId,
                        "PRIVATE CARD FRONT",
                        "PRIVATE CARD BACK",
                        "Funktionen")));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> memoryPracticeComponent(McpSchema.CallToolResult result) {
        assertThat(result.meta()).isInstanceOf(Map.class);
        Object component = ((Map<String, Object>) result.meta()).get("skillpilotMemoryCard");
        assertThat(component).isInstanceOf(Map.class);
        return (Map<String, Object>) component;
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> memoryPracticeCardBatch(McpSchema.CallToolResult result) {
        Object batch = memoryPracticeComponent(result).get("cardBatch");
        assertThat(batch).isInstanceOf(Map.class);
        return (Map<String, Object>) batch;
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> memoryPracticeCards(McpSchema.CallToolResult result) {
        Object cards = memoryPracticeCardBatch(result).get("cards");
        assertThat(cards).isInstanceOf(List.class);
        return (List<Map<String, Object>>) cards;
    }

    private String reviewCapability(McpSchema.CallToolResult result, int cardIndex) {
        Object capability = memoryPracticeCards(result).get(cardIndex).get("reviewCapability");
        assertThat(capability).isInstanceOf(String.class);
        return (String) capability;
    }

    private UnifiedLearnerStateResponse visualizationState() {
        GoalSourceLink image = new GoalSourceLink(
                "goal-visualization",
                "Visualisierung: Projektion",
                "/assets/goal-visualizations/physik/goal-with-image/goal-with-image.jpg",
                "image",
                "SkillPilot",
                List.of(),
                "Didaktische Orientierung",
                "de",
                "AI-generated, SkillPilot-curated",
                "goal-with-image",
                "primary",
                "Skizze einer orthogonalen Projektion.",
                "approved");
        FrontierGoal active = new FrontierGoal(
                "goal-with-image",
                "Orthogonale Projektion verstehen",
                "Deute eine orthogonale Projektion anschaulich.",
                "atomic",
                "tutor",
                "frontier",
                List.of(),
                List.of(image),
                null,
                null,
                null,
                null);
        return state("teachActiveGoal", active);
    }

    private UnifiedLearnerStateResponse personalizationState() {
        UnifiedLearnerStateResponse base = normalState("setPersonalization");
        LandscapeFilter hessen = new LandscapeFilter();
        hessen.setId("DE-HE");
        hessen.setLabel("Hessen");
        LandscapeFilter bayern = new LandscapeFilter();
        bayern.setId("DE-BY");
        bayern.setLabel("Bayern");
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-public-id",
                "Gymnasium (DE)",
                "",
                "DE",
                "DE",
                "school",
                null,
                "de",
                List.of(hessen, bayern));
        return new UnifiedLearnerStateResponse(
                base.skillpilotId(),
                curriculum,
                base.frontier(),
                base.goals(),
                base.nextAllowedActions(),
                base.activeFilters(),
                base.copySources(),
                base.learningState(),
                base.activeGoal(),
                base.stateMachine());
    }

    private UnifiedLearnerStateResponse releasedExamState() {
        ExamData exam = new ExamData();
        exam.setReviewStatus("released");
        exam.setSourceArtifactPath("SECRET SOURCE");
        exam.setTaskContent("Sichtbare Prüfungsaufgabe");
        exam.setSolutionContent("SECRET SOLUTION");
        ExamData.Scoring scoring = new ExamData.Scoring();
        scoring.setMaxPoints(10);
        scoring.setPassingPoints(5);
        ExamData.Step step = new ExamData.Step();
        step.setId("step-1");
        step.setPoints(10);
        step.setDescription("SECRET RUBRIC");
        scoring.setSteps(List.of(step));
        exam.setScoring(scoring);
        FrontierGoal active = new FrontierGoal(
                "exam-public-id",
                "Prüfungsaufgabe",
                "Bearbeite die Aufgabe selbstständig.",
                "atomic",
                "exam",
                "frontier",
                List.of(),
                List.of(),
                null,
                null,
                null,
                exam);
        return state("teachActiveGoal", active);
    }

    private UnifiedLearnerStateResponse state(String requiredAction, FrontierGoal active) {
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-public-id",
                "Mathematik Oberstufe Hessen",
                "",
                "DE",
                "HE",
                "school",
                "Mathematik",
                "de",
                List.of());
        LearnerGoals goals = new LearnerGoals(
                List.of(active),
                3,
                10,
                new GoalStats(3, 10),
                new GoalStats(2, 5),
                false);
        return new UnifiedLearnerStateResponse(
                LEARNER_ID,
                curriculum,
                List.of(active),
                goals,
                List.of(requiredAction),
                List.of(),
                Set.of(new CopySource(
                        "copied-learner-secret-id",
                        Instant.parse("2026-01-01T00:00:00Z"))),
                "learning",
                active,
                new StateMachineInfo("TEACHING", requiredAction, List.of(), List.of(), active));
    }

    private UnifiedLearnerStateResponse activeGoalState(
            FrontierGoal active,
            FrontierGoal... frontierGoals) {
        UnifiedLearnerStateResponse base = state("teachActiveGoal", active);
        List<FrontierGoal> frontier = List.of(frontierGoals);
        return new UnifiedLearnerStateResponse(
                base.skillpilotId(),
                base.curriculum(),
                frontier,
                new LearnerGoals(
                        frontier,
                        base.goals().mastered_count(),
                        base.goals().total_count(),
                        base.goals().personalized(),
                        base.goals().scope(),
                        base.goals().scope_completed()),
                base.nextAllowedActions(),
                base.activeFilters(),
                base.copySources(),
                base.learningState(),
                active,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(active), List.of(), active));
    }
}
