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
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalSourceLink;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
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
                "https://skillpilot.test");
    }

    @Test
    void publishesExactlyTwelveNativeToolsWithSchemasSecurityAnnotationsAndDedicatedUiLink() {
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = contract.toolSpecifications();

        assertThat(tools).hasSize(12);
        assertThat(tools.stream().map(spec -> spec.tool().name())).containsExactly(
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION,
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
        assertThat(spec(OpenAiDeV1McpContractAdapter.SET_MASTERY).tool().inputSchema().get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties)
                        .containsOnlyKeys(
                                "goalId",
                                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                                OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                                OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID));
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
    void publishesActiveAndRetainedSelfContainedGoalVisualizationMcpAppResources() {
        List<String> expectedUris = Stream.concat(
                        Stream.of(OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI),
                        OpenAiDeV1ContractMetadata.RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S
                                .stream()
                                .map(OpenAiDeV1ContractMetadata::goalVisualizationResourceUri))
                .toList();
        assertThat(contract.resourceSpecifications())
                .extracting(specification -> specification.resource().uri())
                .containsExactlyInAnyOrderElementsOf(expectedUris);

        for (McpStatelessServerFeatures.SyncResourceSpecification specification
                : contract.resourceSpecifications()) {
            McpSchema.Resource resource = specification.resource();
            assertThat(resource.mimeType())
                    .isEqualTo(OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE);
            assertThat(resource.meta().get("ui"))
                    .isInstanceOfSatisfying(Map.class, ui -> {
                        assertThat(ui.get("domain"))
                                .isEqualTo(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
                        assertThat(ui.get("prefersBorder")).isEqualTo(false);
                        assertThat(ui.toString())
                                .contains("https://skillpilot.com", "resourceDomains")
                                .doesNotContain("connectDomains", "redirectDomains");
                    });
            assertThat(resource.meta().get("openai/widgetDomain"))
                    .isEqualTo(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
            assertThat(resource.meta().get("openai/widgetPrefersBorder"))
                    .isEqualTo(false);
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
                                        .contains(
                                                "ui/notifications/tool-result",
                                                "goalVisualization",
                                                "ui/open-link")
                                        .doesNotContain("<script src=");
                                assertThat(contents.meta().get("ui"))
                                        .isInstanceOfSatisfying(
                                                Map.class,
                                                ui -> {
                                                    assertThat(ui.get("domain"))
                                                            .isEqualTo(
                                                                    OpenAiDeV1ContractMetadata
                                                                            .WIDGET_DOMAIN);
                                                    assertThat(ui.get("prefersBorder"))
                                                            .isEqualTo(false);
                                                });
                                assertThat(contents.meta().get("openai/widgetDomain"))
                                        .isEqualTo(OpenAiDeV1ContractMetadata.WIDGET_DOMAIN);
                                assertThat(contents.meta().get("openai/widgetPrefersBorder"))
                                        .isEqualTo(false);
                                assertThat(sha256(contents.text()))
                                        .isEqualTo(artifactSha256(resource.uri()));
                            });
        }

        // Every read must be observable. Without this the server-side evidence
        // chain ends at the render tool, and a host that stalls after mounting
        // looks exactly like a client that never fetched the component at all.
        assertThat(meterRegistry.get(OpenAiDeMcpTelemetry.RESOURCE_READ_DURATION_METRIC)
                        .tag("role", "active")
                        .timer()
                        .count())
                .isEqualTo(1);
        assertThat(meterRegistry.find(OpenAiDeMcpTelemetry.RESOURCE_READ_DURATION_METRIC)
                        .tag("role", "retained")
                        .timers()
                        .stream()
                        .mapToLong(timer -> timer.count())
                        .sum())
                .isEqualTo(
                        OpenAiDeV1ContractMetadata
                                .RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S
                                .size());
    }

    /**
     * Every V1 UI resource URI embeds the SHA-256 of the exact bytes it must
     * serve, so the URI itself is the authority the assertion compares against.
     */
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
            String inputSchemaJson = objectMapper.writeValueAsString(specification.tool().inputSchema());

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
        assertMatchesOutputSchema(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION, renderResult);
        assertThat(render.goalVisualization()).isEqualTo(context.goalVisualization());
        assertThat(render.goalVisualization().imageUrl())
                .isEqualTo("https://skillpilot.test/assets/goal-visualizations/physik/"
                        + "goal-with-image/goal-with-image.jpg");
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
                .contains("generic curriculum overview")
                .contains("invented learning path")
                .contains("Assess meaning rather than wording")
                .contains("alternative methods")
                .contains("explicit format")
                .contains("follow-up questions")
                .contains("expected answer only after")
                .contains("permanent SkillPilot IDs")
                .contains("two independent checks")
                .contains("interactionMode=orientation")
                .contains("two to four understandable possibilities")
                .contains("Do not test prior knowledge")
                .contains("completion marker and never certifies subject mastery")
                .contains(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION)
                .contains("exactly once")
                .contains("Use backend URLs verbatim only")
                .contains("If no approved link is available, do not output a link")
                .contains("never with dollar delimiters")
                .contains("activeGoal.exam.hasImage=true")
                .contains("activeGoal.cockpitUrl verbatim")
                .contains("do not invent or describe it")
                .contains("reload exactly once");

        assertThat(spec(OpenAiDeV1McpContractAdapter.SET_MASTERY).tool().description())
                .contains("interactionMode=orientation")
                .contains("visible response")
                .contains("do not test details")
                .contains("claim subject mastery")
                .contains("For ordinary content goals, call only after two independent");

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
        FrontierGoal active = new FrontierGoal(
                "goal-public-id",
                "Lineare Gleichungen sicher lösen",
                "Löse lineare Gleichungen und begründe deinen Weg.",
                "atomic",
                "tutor",
                "frontier",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
        return state(requiredAction, active);
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
}
