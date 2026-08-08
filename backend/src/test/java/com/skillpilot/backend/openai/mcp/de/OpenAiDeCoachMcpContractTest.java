package com.skillpilot.backend.openai.mcp.de;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
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
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
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
    private static final String CONNECTION_SECRET = "opaque-oauth-subject-secret";
    private static final String CHALLENGE = "Bearer resource_metadata=\"https://skillpilot.test/meta\"";
    private static final String INSUFFICIENT_SCOPE_CHALLENGE =
            "Bearer resource_metadata=\"https://skillpilot.test/meta\", error=\"insufficient_scope\"";

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
    void publishesExactlyFourteenNativeToolsWithSchemasSecurityAnnotationsAndDedicatedUiLinks() {
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = contract.toolSpecifications();

        assertThat(tools).hasSize(14);
        assertThat(tools.stream().map(spec -> spec.tool().name())).containsExactly(
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
                OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE,
                OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD,
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                OpenAiDeV1McpContractAdapter.SET_CURRICULUM,
                OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
                OpenAiDeV1McpContractAdapter.SET_SCOPE,
                OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL,
                OpenAiDeV1McpContractAdapter.SET_MASTERY,
                OpenAiDeV1McpContractAdapter.START_RECALL,
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWER,
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULT,
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
        assertThat(spec(OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULT).tool().annotations().idempotentHint())
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
        assertThat(spec(OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool().outputSchema().get("required"))
                .asString()
                .contains(
                        "contractMajor",
                        "stateVersion",
                        "stateSchemaVersion",
                        "workflowVersion",
                        "curriculumRevision",
                        "extensions");
    }

    @Test
    void publishesActiveAllRetainedGoalVisualizationAndDedicatedMemoryPracticeResources() {
        assertThat(OpenAiDeV1ContractMetadata.RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S)
                .containsExactlyElementsOf(HISTORICAL_GOAL_VISUALIZATION_ARTIFACT_SHA256S);
        List<String> expectedResourceUris = Stream.concat(
                        Stream.of(
                                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                                OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI,
                                LEGACY_GOAL_VISUALIZATION_RESOURCE_URI),
                        HISTORICAL_GOAL_VISUALIZATION_ARTIFACT_SHA256S.stream()
                                .map(OpenAiDeV1ContractMetadata::goalVisualizationResourceUri))
                .toList();

        assertThat(contract.resourceSpecifications())
                .extracting(specification -> specification.resource().uri())
                .containsExactlyInAnyOrderElementsOf(expectedResourceUris);

        for (McpStatelessServerFeatures.SyncResourceSpecification specification
                : contract.resourceSpecifications()) {
            McpSchema.Resource resource = specification.resource();
            boolean memoryPractice = OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI
                    .equals(resource.uri());
            assertThat(resource.mimeType())
                    .isEqualTo(OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE);
            assertThat(resource.meta().get("ui"))
                    .isInstanceOfSatisfying(Map.class, ui -> {
                        assertThat(ui.get("domain"))
                                .isEqualTo(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
                        assertThat(ui.get("prefersBorder")).isEqualTo(memoryPractice);
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
                    .isEqualTo(memoryPractice);
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
                                                            .isEqualTo(memoryPractice);
                                                });
                                assertThat(contents.meta().get("openai/widgetDomain"))
                                        .isEqualTo(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
                                assertThat(contents.meta().get("openai/widgetPrefersBorder"))
                                        .isEqualTo(memoryPractice);
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
                .contains("Always use this tool first")
                .contains("SkillPilot Coach v1")
                .contains("learn, practise, start, continue, or resume")
                .contains("stored learning state")
                .contains("authoritative personal SkillPilot state")
                .contains("generic advice")
                .contains("self-created curriculum")
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
                                && specification.tool().description().contains("Always use this tool first")))
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
    void contextOutputSchemaPublishesOrientationAndOrderedOpenQuestions() {
        JsonNode contextSchema =
                objectMapper.valueToTree(spec(OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool().outputSchema());

        assertThat(contextSchema.at("/properties/orientation/type").asText())
                .isEqualTo("object");
        assertThat(contextSchema.at("/properties/orientation/properties/establishedContext/type").asText())
                .isEqualTo("string");
        assertThat(contextSchema.at("/properties/orientation/properties/openQuestions/type").asText())
                .isEqualTo("array");
        assertThat(contextSchema.at("/properties/orientation/properties/openQuestions/items/type").asText())
                .isEqualTo("object");
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
        assertThat(contextSchema
                        .at("/properties/orientation/properties/openQuestions/items/properties/topic/type")
                        .asText())
                .isEqualTo("string");
        assertThat(contextSchema
                        .at("/properties/orientation/properties/openQuestions/items/properties/question/type")
                        .asText())
                .isEqualTo("string");
        JsonNode required = contextSchema
                .at("/properties/orientation/properties/openQuestions/items/required");
        assertThat(required.isArray()).isTrue();
        assertThat(java.util.stream.StreamSupport.stream(required.spliterator(), false)
                        .map(JsonNode::asText)
                        .toList())
                .containsExactly("topic", "question");
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
                .contains("call " + OpenAiDeV1McpContractAdapter.GET_CONTEXT + " before the first subject-matter response")
                .contains("after successful mastery activates a successor")
                .contains("never call get_skillpilot_navigation or set_skillpilot_active_goal")
                .contains("generic curriculum overview")
                .contains("invented learning path")
                .contains("Assess meaning rather than wording")
                .contains("alternative methods")
                .contains("explicit format")
                .contains("follow-up questions")
                .contains("expected answer only after")
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
                .contains("UI receipt only")
                .contains("preceding full SkillPilot result as the authority")
                .contains("immediate next tool call in the same assistant turn")
                .contains("unchanged goalId and expectedStateVersion")
                .contains("Never retry it automatically")
                .contains("before any learner-facing response")
                .contains("Never infer that the component is unavailable")
                .contains("only when the start tool actually returns an error")
                .contains("Use backend URLs verbatim only")
                .contains("If no approved link is available, do not output a link")
                .contains("never with dollar delimiters")
                .contains("activeGoal.exam.hasImage=true")
                .contains("activeGoal.cockpitUrl verbatim")
                .contains("do not invent or describe it")
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
                .contains("immediate next tool call")
                .contains("same goalId")
                .contains(OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION)
                .contains("newer successful SkillPilot result")
                .contains("Do not retry automatically");

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
        assertThat(evaluation.instruction())
                .contains("nur Referenz")
                .contains("alternative Lösungswege")
                .contains("ausdrückliche Anforderungen bleiben verbindlich")
                .contains("ausschließlich anhand sichtbar vorliegender Leistung")
                .contains("Teilpunkte sauber")
                .contains("jeden Abzug konkret")
                .contains("ohne Nachfrage")
                .contains("erfinde daraus keinen konkreten fachlichen Fehler");
        verify(identityResolver, never()).requireWriteAccess(any());
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
                Map.of("goalId", "goal-public-id"));

        assertThat(result.isError()).isFalse();
        OpenAiDeV1McpContractAdapter.MasteryToolResult payload =
                structured(result, OpenAiDeV1McpContractAdapter.MasteryToolResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.SET_MASTERY, result);
        assertThat(payload.status()).isEqualTo("updated");
        assertThat(payload.context().activeGoal().goalId()).isEqualTo("goal-public-id");
        assertThat(objectMapper.writeValueAsString(payload)).doesNotContain(LEARNER_ID, CONNECTION_SECRET);
        verify(identityResolver).requireWriteAccess(McpTransportContext.EMPTY);
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
                Map.of("goalId", completed.id()));

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
                        "continue it immediately without offering a goal choice");
        assertThat(payload.context().activeGoal().goalId()).isEqualTo(successor.id());
        assertThat(payload.context().requiredAction()).isEqualTo("teachActiveGoal");
        assertThat(payload.context().interactionMode()).isEqualTo("chat");
        assertThat(payload.context().options()).isEmpty();
        assertThat(payload.context().frontier()).isEmpty();
        assertThat(payload.context().nextAllowedTools())
                .contains(
                        OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                        OpenAiDeV1McpContractAdapter.SET_MASTERY)
                .doesNotContain(
                        OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                        OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL);
        assertThat(payload.context().instruction())
                .contains(
                        successor.title(),
                        "bereits von SkillPilot ausgewählt",
                        "Beginne jetzt unmittelbar",
                        "keine anderen Lernziele",
                        "keine weitere Bestätigung");
        assertThat(result.content().toString())
                .contains(successor.title(), "bereits aktiviert", "keine Lernzielauswahl")
                .doesNotContain(unrelated.title());
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
                Map.of(
                        "goalId", orientation.id(),
                        OpenAiDeV1McpContractAdapter.ORIENTATION_PATH_ID, "change-and-models"));

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
                Map.of("goalId", orientation.id()));

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
                Map.of(
                        "goalId", orientation.id(),
                        OpenAiDeV1McpContractAdapter.ORIENTATION_PATH_ID, "change-and-models"));

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
                Map.of(
                        "goalId", orientation.id(),
                        OpenAiDeV1McpContractAdapter.ORIENTATION_PATH_ID, "change-and-models"));

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
                Map.of(
                        "goalId", orientation.id(),
                        OpenAiDeV1McpContractAdapter.ORIENTATION_PATH_ID, "invented-path"));

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

        call(OpenAiDeV1McpContractAdapter.SET_MASTERY, Map.of("goalId", "goal-public-id"));

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
                Map.of("goalId", "memory-public-id"));

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
    void recallProjectionDropsPermanentLearnerIdFromTopLevelAndNestedPrompt() throws Exception {
        VerifiedRecallPromptResponse response = new VerifiedRecallPromptResponse(
                "ready",
                "Frage stellen; Sollantwort noch nicht laden.",
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
                List.of(new VerifiedRecallPromptCard("card-public-id", "Was gilt?", "Formel")),
                "card-public-id",
                "Was gilt?",
                "Formel");
        when(coachTools.startVerifiedRecall(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(response);

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.START_RECALL,
                Map.of("goalId", "memory-public-id", "batchSize", 2));

        String json = objectMapper.writeValueAsString(result.structuredContent());
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.START_RECALL, result);
        String nativeJson = new JacksonMcpJsonMapperSupplier().get().writeValueAsString(result);
        assertThat(nativeJson).doesNotContain(":null", LEARNER_ID, "skillpilotId", "expectedAnswer");
        assertThat(json)
                .contains("memory-public-id", "card-public-id", "Was gilt?")
                .doesNotContain(":null")
                .doesNotContain(LEARNER_ID, "skillpilotId", "expectedAnswer");
        verify(identityResolver, never()).requireWriteAccess(any());
    }

    @Test
    void activeLearnerFacingMemoryGoalAllowsAnswerLookupAndResultRecording() {
        UnifiedLearnerStateResponse state = memoryState("memory-public-id");
        VerifiedRecallPromptResponse next = new VerifiedRecallPromptResponse(
                "ready",
                "Nächste Frage stellen.",
                LEARNER_ID,
                "memory-public-id",
                "Grundwissen",
                2,
                1,
                1,
                1,
                0,
                null,
                1,
                List.of(new VerifiedRecallPromptCard("card-next", "Was kommt als Nächstes?", "Formel")),
                "card-next",
                "Was kommt als Nächstes?",
                "Formel");
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);
        when(coachTools.getVerifiedRecallAnswer(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new VerifiedRecallAnswerResponse(
                        "Vergleichen.",
                        "memory-public-id",
                        "card-public-id",
                        "Was gilt?",
                        "Die Sollantwort.",
                        "Formel"));
        when(coachTools.recordVerifiedRecallResult(eq(LEARNER_ID), eq("de"), any()))
                .thenReturn(new VerifiedRecallResultResponse(
                        "card-public-id",
                        true,
                        1,
                        1,
                        false,
                        null,
                        "Gespeichert.",
                        next));

        McpSchema.CallToolResult answer = call(
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWER,
                Map.of("goalId", "memory-public-id", "cardId", "card-public-id"));
        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULT,
                Map.of(
                        "goalId", "memory-public-id",
                        "cardId", "card-public-id",
                        "passed", true));

        assertThat(answer.isError()).isFalse();
        assertThat(result.isError()).isFalse();
        assertThat(structured(answer, OpenAiDeV1McpContractAdapter.RecallAnswerResult.class).expectedAnswer())
                .isEqualTo("Die Sollantwort.");
        assertThat(structured(result, OpenAiDeV1McpContractAdapter.RecallResult.class).savedCardId())
                .isEqualTo("card-public-id");
        verify(coachTools).getVerifiedRecallAnswer(eq(LEARNER_ID), eq("de"), any());
        verify(coachTools).recordVerifiedRecallResult(eq(LEARNER_ID), eq("de"), any());
    }

    @Test
    void allRecallOperationsMapTheSharedActiveGoalGuardToReloadableConflict() {
        ResponseStatusException conflict =
                new ResponseStatusException(HttpStatus.CONFLICT, "active memory goal changed");
        when(coachTools.startVerifiedRecall(eq(LEARNER_ID), eq("de"), any()))
                .thenThrow(conflict);
        when(coachTools.getVerifiedRecallAnswer(eq(LEARNER_ID), eq("de"), any()))
                .thenThrow(conflict);
        when(coachTools.recordVerifiedRecallResult(eq(LEARNER_ID), eq("de"), any()))
                .thenThrow(conflict);

        McpSchema.CallToolResult start = call(
                OpenAiDeV1McpContractAdapter.START_RECALL,
                Map.of("goalId", "known-but-not-active-memory-id"));
        McpSchema.CallToolResult answer = call(
                OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWER,
                Map.of("goalId", "known-but-not-active-memory-id", "cardId", "foreign-card-id"));
        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULT,
                Map.of(
                        "goalId", "known-but-not-active-memory-id",
                        "cardId", "foreign-card-id",
                        "passed", true));

        assertThat(List.of(start, answer, result))
                .allSatisfy(rejected -> {
                    assertThat(rejected.isError()).isTrue();
                    assertThat(rejected.structuredContent()).isInstanceOfSatisfying(
                            Map.class,
                            content -> assertThat(content)
                                    .containsEntry("status", "conflict")
                                    .containsEntry("stateChanged", false)
                                    .containsEntry("reloadContextAtMostOnce", true));
                });
        verify(coachTools).startVerifiedRecall(eq(LEARNER_ID), eq("de"), any());
        verify(coachTools).getVerifiedRecallAnswer(eq(LEARNER_ID), eq("de"), any());
        verify(coachTools).recordVerifiedRecallResult(eq(LEARNER_ID), eq("de"), any());
    }

    @Test
    void navigationUsesFacadeCatalogAndSafeProjectionInsteadOfInventingOptions() {
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-2",
                "Mathematik Hessen",
                "Gymnasiale Oberstufe",
                "DE",
                "HE",
                "school",
                "Mathematik",
                "de",
                List.of());
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(normalState("teachActiveGoal"));
        when(coachTools.getCurriculumOptions(LEARNER_ID)).thenReturn(List.of(curriculum));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "curriculum"));
        OpenAiDeV1McpContractAdapter.NavigationResult navigation =
                structured(result, OpenAiDeV1McpContractAdapter.NavigationResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_NAVIGATION, result);

        assertThat(navigation.requiredAction()).isEqualTo("setCurriculum");
        assertThat(navigation.options()).singleElement().satisfies(option -> {
            assertThat(option.id()).isEqualTo("curriculum-2");
            assertThat(option.label()).isEqualTo("Mathematik Hessen");
        });
        verify(coachTools).getCurriculumOptions(LEARNER_ID);
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
    void scopeNavigationIsExplicitlyFocusOnlyAndNeverPublishesClustersAsNextLearningGoals() {
        FrontierGoal yearSeven = clusterGoal("year-7", "Jahrgangsstufe 7");
        FrontierGoal yearSevenExams = clusterGoal("year-7-exams", "Prüfungen Jahrgangsstufe 7");
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(normalState("teachActiveGoal"));
        when(coachTools.getScopeOptions(LEARNER_ID)).thenReturn(List.of(yearSeven, yearSevenExams));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "scope"));
        OpenAiDeV1McpContractAdapter.NavigationResult navigation =
                structured(result, OpenAiDeV1McpContractAdapter.NavigationResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_NAVIGATION, result);

        assertThat(navigation.requiredAction()).isEqualTo("setScope");
        assertThat(navigation.options())
                .extracting(OpenAiDeCoachContext.Option::kind, OpenAiDeCoachContext.Option::label)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("scope", "Jahrgangsstufe 7"),
                        org.assertj.core.groups.Tuple.tuple("scope", "Prüfungen Jahrgangsstufe 7"));
        assertThat(navigation.instruction())
                .contains(
                        "ausschließlich den Lernfokus",
                        "keine nächsten Lernziele",
                        "ausdrücklichen Wunsch zum Fokuswechsel",
                        "Bei Start, Fortsetzen oder Wiederaufnehmen darfst du sie nicht präsentieren")
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
                        "focus clusters, never next learning goals");
    }

    @Test
    void curriculumMutationForwardsExactIdToTheSharedPublicCatalogGuard() {
        UnifiedLearnerStateResponse state = normalState("setPersonalization");
        when(coachTools.setCurriculum(eq(LEARNER_ID), any(UpdateCurriculumRequest.class)))
                .thenReturn(state);

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_CURRICULUM,
                Map.of("curriculumId", "curriculum-current"));

        assertThat(result.isError()).isFalse();
        ArgumentCaptor<UpdateCurriculumRequest> request =
                ArgumentCaptor.forClass(UpdateCurriculumRequest.class);
        verify(coachTools).setCurriculum(eq(LEARNER_ID), request.capture());
        assertThat(request.getValue().getCurriculumId()).isEqualTo("curriculum-current");
    }

    @Test
    void curriculumMapsAStalePublicCatalogSelectionToReloadableConflict() {
        when(coachTools.setCurriculum(eq(LEARNER_ID), any(UpdateCurriculumRequest.class)))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "curriculum is no longer in the public catalog"));

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_CURRICULUM,
                Map.of("curriculumId", "known-landscape-not-currently-offered"));

        assertThat(result.isError()).isTrue();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("status", "conflict")
                .containsEntry("stateChanged", false)
                .containsEntry("reloadContextAtMostOnce", true));
        verify(coachTools).setCurriculum(eq(LEARNER_ID), any(UpdateCurriculumRequest.class));
    }

    @Test
    void personalizationNavigationPublishesQuestionAndCardinalityWithoutTechnicalDecisionIds() throws Exception {
        UnifiedLearnerStateResponse state = personalizationState();
        PersonalizationPlan plan = PersonalizationPlan.selection(
                "stage-internal-11",
                "Synthetic stage",
                "group-internal-23",
                "Which pathways fit?",
                "instance-internal-37",
                1,
                3,
                1,
                List.of(
                        new PersonalizationPlan.Option(
                                "po-route-amber",
                                "stage-internal-11",
                                "group-internal-23",
                                "instance-internal-37",
                                state.curriculum().getCurriculumId(),
                                state.curriculum().getTitle(),
                                "route-amber",
                                "Route Amber"),
                        new PersonalizationPlan.Option(
                                "po-finish-pathways",
                                "stage-internal-11",
                                "group-internal-23",
                                "instance-internal-37",
                                null,
                                null,
                                null,
                                null,
                                PersonalizationPlan.OptionKind.COMPLETE_GROUP)),
                List.of());
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);
        when(coachTools.getPersonalizationPlan(LEARNER_ID)).thenReturn(plan);

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.GET_NAVIGATION,
                Map.of("target", "personalization"));
        OpenAiDeV1McpContractAdapter.NavigationResult navigation =
                structured(result, OpenAiDeV1McpContractAdapter.NavigationResult.class);
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.GET_NAVIGATION, result);

        assertThat(navigation.decision()).isEqualTo(new OpenAiDeCoachContext.Decision(
                "Synthetic stage",
                "Which pathways fit?",
                1,
                3,
                1));
        assertThat(navigation.options()).extracting(OpenAiDeCoachContext.Option::id)
                .containsExactly("po-route-amber", "po-finish-pathways");
        assertThat(navigation.instruction())
                .contains(
                        "Which pathways fit?",
                        "Mindestens 1 und höchstens 3",
                        "bisher ausgewählt: 1",
                        "Minimum ist erfüllt")
                .doesNotContain(
                        "stage-internal-11",
                        "group-internal-23",
                        "instance-internal-37");

        JsonNode decision = objectMapper.valueToTree(navigation).path("decision");
        assertThat(decision.has("stageId")).isFalse();
        assertThat(decision.has("groupId")).isFalse();
        assertThat(decision.has("groupInstanceId")).isFalse();
    }

    @Test
    void personalizationForwardsTheExactOpaqueOptionIdWithoutReconstructingItsVisibleLabel() {
        UnifiedLearnerStateResponse state = personalizationState();
        PersonalizationPlan plan = new PersonalizationPlan(
                PersonalizationPlan.Stage.SELECTION,
                List.of(new PersonalizationPlan.Option(
                        "po-hessen",
                        "jurisdiction",
                        "jurisdiction",
                        "jurisdiction:curriculum-public-id",
                        "curriculum-public-id",
                        "Gymnasium (DE)",
                        "DE-HE",
                        "Hessen")),
                List.of());
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(state);
        when(coachTools.getPersonalizationPlan(LEARNER_ID)).thenReturn(plan);
        when(coachTools.setPersonalization(eq(LEARNER_ID), any(PersonalizationRequest.class)))
                .thenReturn(state);

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
                Map.of("optionId", "po-hessen"));

        assertThat(result.isError()).isFalse();
        ArgumentCaptor<PersonalizationRequest> request =
                ArgumentCaptor.forClass(PersonalizationRequest.class);
        verify(coachTools).setPersonalization(eq(LEARNER_ID), request.capture());
        assertThat(request.getValue().goalIds()).isEmpty();
        assertThat(request.getValue().filters()).isEmpty();
        assertThat(request.getValue().config()).isEmpty();
        assertThat(request.getValue().optionId()).isEqualTo("po-hessen");
    }

    @Test
    void personalizationRejectsUnknownReferencesWithoutMutation() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(personalizationState());

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
                Map.of(
                        "goalIds", List.of(),
                        "filterIds", List.of("Atlantis")));

        assertThat(result.isError()).isTrue();
        assertThat(result.content().toString()).contains("ungültig");
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("code", "INVALID_INPUT")
                .containsEntry("category", "input")
                .containsEntry("retryable", false)
                .containsEntry("stateChanged", false)
                .containsEntry("stateVersion", 1L));
        verify(coachTools, never()).setPersonalization(any(), any());
    }

    @Test
    void personalizationRejectsSeveralMutuallyExclusiveOptionsWithoutMutation() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(personalizationState());

        McpSchema.CallToolResult result = call(
                OpenAiDeV1McpContractAdapter.SET_PERSONALIZATION,
                Map.of(
                        "goalIds", List.of(),
                        "filterIds", List.of("Hessen", "Bayern")));

        assertThat(result.isError()).isTrue();
        assertThat(result.content().toString()).contains("ungültig");
        verify(coachTools, never()).setPersonalization(any(), any());
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
                .containsEntry("startUrl", "https://skillpilot.test"));
        assertThat(result.content().toString())
                .contains("Start learning")
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
                "de",
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
                .containsEntry("startUrl", "https://skillpilot.test"));
        assertThat(result.content().toString())
                .contains("Lernen starten")
                .doesNotContain("private unavailable revision detail", LEARNER_ID);
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
                .containsEntry("oauthConnectionValid", true));
        assertThat(result.content().toString())
                .contains("Your SkillPilot learning session is missing or expired")
                .contains("Start learning")
                .doesNotContain("Lernsession", "Lernen starten");
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

    private McpSchema.CallToolResult call(String name, Map<String, Object> arguments) {
        Map<String, Object> requestArguments = new java.util.LinkedHashMap<>(arguments);
        requestArguments.put(
                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                LEARNING_SESSION_ID);
        if (Boolean.FALSE.equals(spec(name).tool().annotations().readOnlyHint())) {
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
            Map<String, Object> items = (Map<String, Object>) schema.get("items");
            if (items != null) {
                for (int index = 0; index < node.size(); index++) {
                    assertSchemaNode(node.get(index), items, path + "[" + index + "]");
                }
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
