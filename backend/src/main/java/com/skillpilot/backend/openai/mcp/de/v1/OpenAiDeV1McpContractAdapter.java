package com.skillpilot.backend.openai.mcp.de.v1;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.UpdateCurriculumRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerRequest;
import com.skillpilot.backend.api.VerifiedRecallAnswerResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.api.VerifiedRecallResultRequest;
import com.skillpilot.backend.api.VerifiedRecallResultResponse;
import com.skillpilot.backend.api.VerifiedRecallStartRequest;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.mcp.SkillPilotMcpToolResults;
import com.skillpilot.backend.openai.OpenAiCoachLocale;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry.Event;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachContext;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachContextProjector;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachIdentityResolver;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeMcpTelemetry;
import com.skillpilot.backend.service.OpenAiDeLearningSessionRequiredException;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Complete language-neutral OpenAI MCP contract for the SkillPilot coach.
 *
 * <p>The class deliberately owns neither HTTP transport nor OAuth lifecycle.
 * It publishes native stateless MCP tool and UI-resource specifications and
 * resolves identity only through {@link OpenAiDeCoachIdentityResolver}.</p>
 */
@Component
@ConditionalOnProperty(
        name = {"skillpilot.openai.coach.v1.enabled", "skillpilot.openai.coach.v1.oauth.enabled"},
        havingValue = "true")
public final class OpenAiDeV1McpContractAdapter {

    private static final Logger LOGGER = LoggerFactory.getLogger(OpenAiDeV1McpContractAdapter.class);

    public static final String READ_SCOPE = "skillpilot.openai.v1.read";
    public static final String WRITE_SCOPE = "skillpilot.openai.v1.write";

    public static final String GET_CONTEXT = "get_skillpilot_context";
    public static final String RENDER_GOAL_VISUALIZATION =
            "render_skillpilot_goal_visualization";
    public static final String GET_NAVIGATION = "get_skillpilot_navigation";
    public static final String SET_CURRICULUM = "set_skillpilot_curriculum";
    public static final String SET_PERSONALIZATION = "set_skillpilot_personalization";
    public static final String SET_SCOPE = "set_skillpilot_scope";
    public static final String SET_ACTIVE_GOAL = "set_skillpilot_active_goal";
    public static final String SET_MASTERY = "set_skillpilot_mastery";
    public static final String START_RECALL = "start_skillpilot_verified_recall";
    public static final String GET_RECALL_ANSWER = "get_skillpilot_verified_recall_answer";
    public static final String RECORD_RECALL_RESULT = "record_skillpilot_verified_recall_result";
    public static final String GET_EXAM_EVALUATION = "get_skillpilot_exam_evaluation";
    public static final String LEARNING_SESSION_ID = "learningSessionId";
    public static final String EXPECTED_STATE_VERSION = "expectedStateVersion";
    public static final String CLIENT_REQUEST_ID = "clientRequestId";

    private static final Pattern LEARNING_SESSION_PATTERN =
            Pattern.compile("^sps_[A-Za-z0-9_-]{43}$");
    private static final ObjectMapper PUBLIC_OUTPUT_MAPPER = new ObjectMapper();
    private static final Set<String> GOAL_VISUALIZATION_UI_TOOLS =
            Set.of(RENDER_GOAL_VISUALIZATION);
    private static final String GOAL_VISUALIZATION_WIDGET_HTML =
            loadGoalVisualizationWidget();

    private static final String SERVER_INSTRUCTIONS = """
            You are the SkillPilot learning coach. When SkillPilot Coach v1 is selected or explicitly mentioned and the learner wants to learn, practise, start, continue, or resume a learning session, or use their stored learning state, call get_skillpilot_context before the first subject-matter response. Treat the newest structuredContent as the sole authority for the communication locale, curriculum, course profile, scope, active goal, mastery, frontier, task, recall, exam, progress, and next step. Never replace a missing or failed call with a generic curriculum overview, generic learning advice, or an invented learning path. Reload the state after a reload, long conversation, possible context compaction, uncertainty, or a 409 conflict. After a mutation, only the fresh successor state is authoritative.

            The newest communicationLocale returned by SkillPilot is authoritative for all user-facing communication. Respond exclusively in that locale, clearly, encouragingly, and age-appropriately. Never infer or override the response language from these English instructions, tool names, schemas, the host interface locale, OAuth, or the apparent language of a message. Static control metadata is English and is not user-facing content.

            The SkillPilot start message contains exactly one short-lived learning session. Copy it unchanged and send it on every tool call only in the learningSessionId argument. Never reuse a value from an older start message. Never derive the session from OAuth, conversation content, or another ID. Do not repeat it in responses or ask the learner to copy or re-enter it.

            Do not mention tool, API, JSON, or field names to the learner, and do not expose technical IDs. Never reveal or request OAuth tokens, connection subjects, permanent SkillPilot IDs, or other secrets. Use backend URLs verbatim only; never construct links from IDs or append tokens. If no approved link is available, do not output a link. Write mathematics only with \\(...\\) inline or \\[...\\] displayed, never with dollar delimiters.

            When interactionMode=orientation, do not conduct a subject-matter assessment. Show two to four understandable possibilities and honest positive perspectives of the material ahead, then ask only a low-threshold question about what sparks curiosity or whether the learner wants to continue. Do not test prior knowledge, terms, procedures, details, correctness, transfer, recall, or Feynman teach-back. Save orientation completion only after a visible response, expression of interest, or explicit willingness to continue. It is only a completion marker and never certifies subject mastery.

            For ordinary content goals, coach dialogically on exactly one confirmed atomic goal. Briefly check prior knowledge, provide small hints, let the learner work, and do not reveal the solution to the immediate next task. Assess meaning rather than wording and fully accept equivalent correct results, representations, justifications, and alternative methods; explicit format, unit, percentage, justification, and other criteria remain binding. Save mastery only for the active content goal after exactly two independent checks or genuine multi-step transfer in a changed context, covering every aspect. Self-assessment, repetition, or the same worked case is insufficient. Never manually master clusters or memorisation goals.

            If the newest context contains goalVisualization and nextAllowedTools permits render_skillpilot_goal_visualization, call that display tool exactly once with the unchanged goalId. Only that tool creates the MCP UI containing the approved image for the active atomic goal. Never call it without goalVisualization, with another goalId, or when it is not allowed. Use the image only for didactic orientation, not as a source, evidence, task, or performance record. Do not invent image details or repeat image URLs or technical metadata in the visible response. Without goalVisualization, continue the ordinary chat flow unchanged.

            In exam mode, reproduce taskContent verbatim except for replacing dollar TeX delimiters. If activeGoal.exam.hasImage=true, provide activeGoal.cockpitUrl verbatim before the task and state in the session communication locale that the image is there; do not invent or describe it. Give no hints, partial answers, solutions, scaffolds, or follow-up questions. Wait for a complete visible submission, then call get_skillpilot_exam_evaluation. Assess visible work criterion by criterion; the sample solution does not prescribe wording. Equivalent approaches receive full credit. Identify unreadable content without inventing an error. Save mastery only after a final pass with at least passingPoints.

            For Verified Recall, show the full question batch and wait for all answers. Fetch each expected answer only after the corresponding learner answer, accept technically equivalent wording, and save each card immediately; passed=true only for a correct answer without help. Save all cards before the next batch, check a card at most once per day, and do not save additional manual mastery.

            Treat natural multi-part requests as continuing intent. During open personalisation, first state the confirmed entry context briefly, then ask together for all information still listed as open by the newest SkillPilot context. Accept multiple answers in any order and partial answers. Apply each unambiguous fresh step directly, reload the context, and ask only for decisions that remain open. Questions announced for later do not authorise early writes; mutate only through an option in the newest context. Claim a state change only after confirmed success. After a 409 conflict, reload exactly once. SESSION_REQUIRED means OAuth remains connected: ask the learner, in communicationLocale, to open SkillPilot and choose the local equivalent of “Start learning” again; never request the learning session or SkillPilot ID and never demand a new OAuth connection. On authentication, schema, persistence, or repeated conflict failures, stop structured actions and state transparently that the state cannot be saved reliably; never guess or promise later persistence.
            """;

    private final CoachToolFacade coachTools;
    private final CoachStateProjection stateProjection;
    private final OpenAiDeCoachIdentityResolver identityResolver;
    private final OpenAiDeMcpTelemetry telemetry;
    private final OpenAiDeV1McpSessionCoordinator sessionCoordinator;
    private final OpenAiDeCoachContextProjector contextProjector;
    private final String sessionStartUrl;
    private final List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications;
    private final List<McpStatelessServerFeatures.SyncResourceSpecification> resourceSpecifications;

    @Autowired
    public OpenAiDeV1McpContractAdapter(
            CoachToolFacade coachTools,
            CoachStateProjection stateProjection,
            OpenAiDeCoachIdentityResolver identityResolver,
            OpenAiDeMcpTelemetry telemetry,
            OpenAiDeV1McpSessionCoordinator sessionCoordinator,
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl) {
        this.coachTools = coachTools;
        this.stateProjection = stateProjection;
        this.identityResolver = identityResolver;
        this.telemetry = telemetry;
        this.sessionCoordinator = sessionCoordinator;
        this.contextProjector = new OpenAiDeCoachContextProjector(stateProjection, publicBaseUrl);
        this.sessionStartUrl = normalizePublicBaseUrl(publicBaseUrl);
        this.toolSpecifications = buildToolSpecifications();
        this.resourceSpecifications = buildResourceSpecifications();
    }

    public OpenAiDeV1McpContractAdapter(
            CoachToolFacade coachTools,
            CoachStateProjection stateProjection,
            OpenAiDeCoachIdentityResolver identityResolver,
            OpenAiDeMcpTelemetry telemetry,
            String publicBaseUrl) {
        this.coachTools = coachTools;
        this.stateProjection = stateProjection;
        this.identityResolver = identityResolver;
        this.telemetry = telemetry;
        this.sessionCoordinator = null;
        this.contextProjector = new OpenAiDeCoachContextProjector(stateProjection, publicBaseUrl);
        this.sessionStartUrl = normalizePublicBaseUrl(publicBaseUrl);
        this.toolSpecifications = buildToolSpecifications();
        this.resourceSpecifications = buildResourceSpecifications();
    }

    public String serverInstructions() {
        return SERVER_INSTRUCTIONS;
    }

    public List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications() {
        return toolSpecifications;
    }

    public List<McpStatelessServerFeatures.SyncResourceSpecification> resourceSpecifications() {
        return resourceSpecifications;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record NavigationResult(
            String target,
            String requiredAction,
            OpenAiDeCoachContext.Decision decision,
            List<OpenAiDeCoachContext.Option> options,
            String instruction) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GoalVisualizationRenderResult(
            OpenAiDeCoachContext.GoalVisualization goalVisualization) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record MasteryToolResult(
            String status,
            String savedGoalId,
            Double savedMastery,
            OpenAiDeCoachContext context,
            String error) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record RecallCard(
            String cardId,
            String prompt,
            String category) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record RecallPromptResult(
            String status,
            String instruction,
            String goalId,
            String goalTitle,
            int totalCards,
            int verifiedCards,
            int pendingCards,
            int eligibleCards,
            int blockedCards,
            String nextEligibleAt,
            int batchSize,
            List<RecallCard> cards) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record RecallAnswerResult(
            String instruction,
            String goalId,
            String cardId,
            String prompt,
            String expectedAnswer,
            String category) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record RecallResult(
            String savedCardId,
            boolean passed,
            int verifiedCards,
            int pendingCards,
            boolean masterySaved,
            String masteryGoalId,
            String instruction,
            RecallPromptResult next,
            OpenAiDeCoachContext context) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ExamEvaluationResult(
            String goalId,
            String solutionContent,
            ExamScoring scoring,
            String instruction) {
    }

    public record ExamScoring(
            double maxPoints,
            double passingPoints,
            List<ExamScoringStep> steps) {
    }

    public record ExamScoringStep(
            String id,
            double points,
            String description) {
    }

    private List<McpStatelessServerFeatures.SyncToolSpecification> buildToolSpecifications() {
        return List.of(
                tool(
                        GET_CONTEXT,
                        "Start or continue the SkillPilot learning coach",
                        "Always use this tool first when the learner selected SkillPilot Coach v1 or mentioned "
                                + "SkillPilot and wants to learn, practise, start, continue, or resume a learning "
                                + "session, or use stored learning state. It loads the authoritative personal "
                                + "SkillPilot state and communication locale for the learningSessionId in the start "
                                + "message. Also use it after a new chat, reload, long conversation, possible context "
                                + "compaction, context loss, or conflict. Never replace this call with generic advice, "
                                + "a self-created curriculum, or invented goals. Do not use it for general subject "
                                + "questions unrelated to SkillPilot.",
                        emptyObjectSchema(),
                        contextSchema(),
                        true,
                        true,
                        false,
                        this::getContext),
                tool(
                        RENDER_GOAL_VISUALIZATION,
                        "Display the learning-goal image",
                        "Displays only the approved image for the currently active atomic learning goal. Call it "
                                + "exactly once only when the newest SkillPilot context contains goalVisualization "
                                + "with the same goalId and nextAllowedTools names this tool. Never call it without "
                                + "goalVisualization or for another goalId. It does not change state.",
                        objectSchema(
                                Map.of("goalId", modelFacingOpaqueReferenceSchema()),
                                List.of("goalId")),
                        goalVisualizationRenderSchema(),
                        true,
                        true,
                        false,
                        this::renderGoalVisualization),
                tool(
                        GET_NAVIGATION,
                        "Load navigation options",
                        "Loads the options currently allowed for an explicit change. target is exactly one of "
                                + "curriculum, personalization, scope, or goal. It does not change state.",
                        objectSchema(
                                Map.of("target", enumStringSchema(
                                        "curriculum", "personalization", "scope", "goal")),
                                List.of("target")),
                        navigationSchema(),
                        true,
                        true,
                        false,
                        this::getNavigation),
                tool(
                        SET_CURRICULUM,
                        "Select curriculum",
                        "Sets exactly one curriculumId from the newest context or navigation result and returns the "
                                + "fresh successor state.",
                        objectSchema(
                                Map.of("curriculumId", modelFacingOpaqueReferenceSchema()),
                                List.of("curriculumId")),
                        contextSchema(),
                        false,
                        true,
                        true,
                        this::setCurriculum),
                tool(
                        SET_PERSONALIZATION,
                        "Continue personalisation",
                        "Executes exactly one currently allowed personalisation action. This may be a subject choice "
                                + "or explicit completion of the current selection group. Pass only the opaque "
                                + "optionId from structuredContent unchanged. Never derive it from labels.",
                        objectSchema(
                                Map.of("optionId", modelFacingOpaqueReferenceSchema()),
                                List.of("optionId")),
                        contextSchema(),
                        false,
                        true,
                        true,
                        this::setPersonalization),
                tool(
                        SET_SCOPE,
                        "Select learning scope",
                        "Replaces the learning scope with one or more currently allowed subject goalIds and returns "
                                + "the fresh successor state.",
                        objectSchema(
                                Map.of("goalIds", modelFacingOpaqueReferenceArraySchema(1)),
                                List.of("goalIds")),
                        contextSchema(),
                        false,
                        true,
                        true,
                        this::setScope),
                tool(
                        SET_ACTIVE_GOAL,
                        "Set active learning goal",
                        "Activates exactly one currently allowed frontier goal. Use redirect=true only for an "
                                + "explicitly requested change away from an already active goal.",
                        objectSchema(
                                Map.of(
                                        "goalId", modelFacingOpaqueReferenceSchema(),
                                        "redirect", booleanSchema()),
                                List.of("goalId")),
                        contextSchema(),
                        false,
                        true,
                        true,
                        this::setActiveGoal),
                tool(
                        SET_MASTERY,
                        "Save mastery",
                        "Completes exactly the confirmed active atomic goal with the technical value 1.0. For "
                                + "interactionMode=orientation, call only after presenting possibilities and a "
                                + "positive perspective followed by a visible response, expression of interest, or "
                                + "explicit willingness to continue; do not test details or claim subject mastery. "
                                + "For ordinary content goals, call only after two independent visible checks or "
                                + "genuine multi-step transfer in a changed context covering all aspects. Never use "
                                + "for clusters, memorisation/SRS goals, self-assessment, repetition, or the same "
                                + "worked case.",
                        objectSchema(
                                Map.of("goalId", modelFacingOpaqueReferenceSchema()),
                                List.of("goalId")),
                        masterySchema(),
                        false,
                        true,
                        true,
                        this::setMastery),
                tool(
                        START_RECALL,
                        "Start verified recall",
                        "Starts or continues the strict card recall check for the active memorisation goal. "
                                + "batchSize is between 1 and 20.",
                        objectSchema(
                                Map.of(
                                        "goalId", modelFacingOpaqueReferenceSchema(),
                                        "batchSize", integerSchema(1, 20)),
                                List.of("goalId")),
                        recallPromptSchema(),
                        true,
                        true,
                        false,
                        this::startRecall),
                tool(
                        GET_RECALL_ANSWER,
                        "Load a card's expected answer",
                        "Loads the expected answer for exactly one card only after the learner has answered it.",
                        objectSchema(
                                Map.of(
                                        "goalId", modelFacingOpaqueReferenceSchema(),
                                        "cardId", modelFacingOpaqueReferenceSchema()),
                                List.of("goalId", "cardId")),
                        recallAnswerSchema(),
                        true,
                        true,
                        false,
                        this::getRecallAnswer),
                tool(
                        RECORD_RECALL_RESULT,
                        "Save card result",
                        "Saves passed=true for exactly one card only for a correct answer without help; otherwise false.",
                        objectSchema(
                                Map.of(
                                        "goalId", modelFacingOpaqueReferenceSchema(),
                                        "cardId", modelFacingOpaqueReferenceSchema(),
                                        "passed", booleanSchema(),
                                        "feedback", stringSchema()),
                                List.of("goalId", "cardId", "passed")),
                        recallResultSchema(),
                        false,
                        true,
                        true,
                        this::recordRecallResult),
                tool(
                        GET_EXAM_EVALUATION,
                        "Load exam evaluation",
                        "Loads the solution and scoring rubric only for the active approved exam goal and only after "
                                + "a complete visible submission. Never ask follow-up questions in exam mode.",
                        objectSchema(
                                Map.of("goalId", modelFacingOpaqueReferenceSchema()),
                                List.of("goalId")),
                        examEvaluationSchema(),
                        true,
                        true,
                        false,
                        this::getExamEvaluation));
    }

    private McpStatelessServerFeatures.SyncToolSpecification tool(
            String name,
            String title,
            String description,
            Map<String, Object> inputSchema,
            Map<String, Object> outputSchema,
            boolean readOnly,
            boolean idempotent,
            boolean writeScope,
            ToolOperation operation) {
        List<Map<String, Object>> securitySchemes = writeScope
                ? List.of(oauthScheme(READ_SCOPE, WRITE_SCOPE))
                : List.of(oauthScheme(READ_SCOPE));
        Map<String, Object> meta = new LinkedHashMap<>();
        meta.put("securitySchemes", securitySchemes);
        if (GOAL_VISUALIZATION_UI_TOOLS.contains(name)) {
            meta.put(
                    "ui",
                    Map.of(
                            "resourceUri",
                            OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI));
            meta.put(
                    "openai/outputTemplate",
                    OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI);
        }
        McpSchema.Tool descriptor = McpSchema.Tool.builder()
                .name(name)
                .title(title)
                .description(description)
                .inputSchema(withSessionSchema(inputSchema, writeScope))
                .outputSchema(withVersionMetadataSchema(outputSchema))
                .annotations(McpSchema.ToolAnnotations.builder()
                        .title(title)
                        .readOnlyHint(readOnly)
                        .destructiveHint(false)
                        .idempotentHint(idempotent)
                        .openWorldHint(false)
                        .build())
                // MCP Apps uses ui.resourceUri. ChatGPT also accepts the
                // openai/outputTemplate compatibility alias.
                .meta(Map.copyOf(meta))
                .build();
        return McpStatelessServerFeatures.SyncToolSpecification.builder()
                .tool(descriptor)
                .callHandler((transportContext, request) -> executeWithTelemetry(
                        name,
                        transportContext,
                        request == null || request.arguments() == null ? Map.of() : request.arguments(),
                        writeScope,
                        operation))
                .build();
    }

    private List<McpStatelessServerFeatures.SyncResourceSpecification> buildResourceSpecifications() {
        Map<String, Object> meta = goalVisualizationResourceMeta();
        McpSchema.Resource resource = McpSchema.Resource.builder(
                        OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                        "skillpilot-goal-visualization-v1")
                .title("SkillPilot learning-goal image")
                .description("Displays the approved image for the active atomic learning goal.")
                .mimeType(OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE)
                .meta(meta)
                .build();
        McpStatelessServerFeatures.SyncResourceSpecification specification =
                new McpStatelessServerFeatures.SyncResourceSpecification(
                        resource,
                        (transportContext, request) -> {
                            if (request == null
                                    || !OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI
                                            .equals(request.uri())) {
                                throw new IllegalArgumentException(
                                        "Unknown SkillPilot MCP UI resource.");
                            }
                            McpSchema.TextResourceContents contents =
                                    new McpSchema.TextResourceContents(
                                            OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                                            OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE,
                                            GOAL_VISUALIZATION_WIDGET_HTML,
                                            meta);
                            return new McpSchema.ReadResourceResult(List.of(contents));
                        });
        return List.of(specification);
    }

    private Map<String, Object> goalVisualizationResourceMeta() {
        Map<String, Object> csp = Map.of(
                "resourceDomains", List.of("https://skillpilot.com"));
        Map<String, Object> ui = Map.of(
                "domain", OpenAiDeV1ContractMetadata.WIDGET_DOMAIN,
                "prefersBorder", false,
                "csp", csp);
        return Map.of(
                "ui", ui,
                "openai/widgetDescription",
                        "Approved didactic visualisation for the active SkillPilot learning goal.",
                "openai/widgetDomain", OpenAiDeV1ContractMetadata.WIDGET_DOMAIN,
                "openai/widgetPrefersBorder", false,
                "openai/widgetCSP", Map.of(
                        "resource_domains", List.of("https://skillpilot.com"),
                        "redirect_domains", List.of("https://skillpilot.com")));
    }

    private static String loadGoalVisualizationWidget() {
        try (InputStream input = OpenAiDeV1McpContractAdapter.class.getResourceAsStream(
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_CLASSPATH)) {
            if (input == null) {
                throw new IllegalStateException(
                        "Missing SkillPilot goal-visualization MCP UI bundle.");
            }
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not read SkillPilot goal-visualization MCP UI bundle.",
                    exception);
        }
    }

    private McpSchema.CallToolResult executeWithTelemetry(
            String toolName,
            McpTransportContext transportContext,
            Map<String, Object> arguments,
            boolean writeScope,
            ToolOperation operation) {
        try {
            return telemetry.record(
                    toolName,
                    arguments,
                    () -> execute(toolName, transportContext, arguments, writeScope, operation));
        } catch (RuntimeException exception) {
            return unexpectedErrorResult(toolName, exception);
        }
    }

    private McpSchema.CallToolResult execute(
            String toolName,
            McpTransportContext transportContext,
            Map<String, Object> arguments,
            boolean writeScope,
        ToolOperation operation) {
        try {
            String learningSessionId = requiredLearningSessionId(arguments);
            String skillpilotId =
                    identityResolver.resolveSkillpilotId(transportContext, learningSessionId);
            if (skillpilotId == null || skillpilotId.isBlank()) {
                telemetry.recordOperational(Event.UNAUTHORIZED);
                return authenticationErrorResult(
                        OpenAiDeV1ErrorCode.AUTHENTICATION_REQUIRED,
                        identityResolver.authenticationChallenge(),
                        "A valid OAuth connection is required for this SkillPilot step.",
                        null);
            }
            if (writeScope) {
                identityResolver.requireWriteAccess(transportContext);
            }
            if (writeScope) {
                if (sessionCoordinator == null) {
                    return operation.apply(skillpilotId, arguments, null);
                }
                long expectedStateVersion = requiredLong(arguments, EXPECTED_STATE_VERSION);
                String clientRequestId = requiredString(arguments, CLIENT_REQUEST_ID);
                return sessionCoordinator.write(
                        learningSessionId,
                        toolName,
                        expectedStateVersion,
                        clientRequestId,
                        arguments,
                        metadata -> invokeVersionedOperation(
                                operation,
                                skillpilotId,
                                arguments,
                                metadata,
                                true));
            }
            if (sessionCoordinator == null) {
                return operation.apply(skillpilotId, arguments, null);
            }
            return sessionCoordinator.read(
                    learningSessionId,
                    metadata -> invokeVersionedOperation(
                            operation,
                            skillpilotId,
                            arguments,
                            metadata,
                            false));
        } catch (VersionedPublicResultException exception) {
            return exception.result();
        } catch (SessionBoundOperationException exception) {
            return classifiedFailure(
                    toolName,
                    exception.operationCause(),
                    exception.metadata());
        } catch (OpenAiDeV1SessionStateException exception) {
            return stateErrorResult(exception);
        } catch (OpenAiDeLearningSessionRequiredException exception) {
            telemetry.recordOperational(Event.SESSION_REQUIRED);
            return sessionRequiredResult();
        } catch (AuthenticationException exception) {
            telemetry.recordOperational(Event.UNAUTHORIZED);
            return authenticationErrorResult(
                    OpenAiDeV1ErrorCode.AUTHENTICATION_REQUIRED,
                    identityResolver.authenticationChallenge(),
                    "A valid OAuth connection is required for this SkillPilot step.",
                    null);
        } catch (AccessDeniedException exception) {
            telemetry.recordOperational(Event.FORBIDDEN);
            return authenticationErrorResult(
                    OpenAiDeV1ErrorCode.INSUFFICIENT_SCOPE,
                    identityResolver.insufficientScopeChallenge(),
                    "The connected app does not have the required access for this SkillPilot step.",
                    null);
        } catch (ResponseStatusException exception) {
            return responseStatusFailure(toolName, exception, null);
        } catch (IllegalArgumentException exception) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    "The inputs for this SkillPilot step are invalid.",
                    null);
        } catch (RuntimeException exception) {
            return unexpectedErrorResult(toolName, exception, null);
        }
    }

    private McpSchema.CallToolResult unexpectedErrorResult(String toolName, RuntimeException exception) {
        return unexpectedErrorResult(toolName, exception, null);
    }

    private McpSchema.CallToolResult unexpectedErrorResult(
            String toolName,
            RuntimeException exception,
            OpenAiDeV1SessionMetadata metadata) {
        telemetry.recordException(exception);
        String correlationId = UUID.randomUUID().toString();
        LOGGER.error(
                "OpenAI Coach V1 MCP tool failed; correlationId={}, tool={}",
                correlationId,
                toolName,
                exception);
        if (isTimeout(exception)) {
            return errorResult(
                    OpenAiDeV1ErrorCode.TIMEOUT,
                    localized(metadata,
                            "Der SkillPilot-Schritt wurde wegen einer Zeitüberschreitung nicht bestätigt.",
                            "The SkillPilot step was not confirmed because it timed out."),
                    metadata,
                    Map.of("reference", correlationId));
        }
        return errorResult(
                OpenAiDeV1ErrorCode.INTERNAL_ERROR,
                localized(metadata,
                        "Der SkillPilot-Schritt konnte wegen eines internen Fehlers nicht ausgeführt werden. Referenz: ",
                        "The SkillPilot step could not be completed because of an internal error. Reference: ")
                        + correlationId,
                metadata,
                Map.of("reference", correlationId));
    }

    private McpSchema.CallToolResult getContext(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        OpenAiDeCoachContext context = projectContext(
                skillpilotId,
                coachTools.getLearnerState(skillpilotId),
                metadata);
        return successResult(contextSummary(context, metadata), context);
    }

    private McpSchema.CallToolResult renderGoalVisualization(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        String goalId = requiredString(arguments, "goalId");
        OpenAiDeCoachContext context = projectContext(
                skillpilotId,
                coachTools.getLearnerState(skillpilotId),
                metadata);
        OpenAiDeCoachContext.GoalVisualization visualization =
                context == null ? null : context.goalVisualization();
        if (visualization == null || !goalId.equals(visualization.goalId())) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    localized(metadata,
                            "Für das aktuelle Lernziel ist kein freigegebenes Lernzielbild verfügbar.",
                            "No approved learning-goal image is available for the current goal."),
                    metadata);
        }
        return successResult(
                localized(metadata,
                        "Freigegebenes Lernzielbild bereitgestellt.",
                        "Approved learning-goal image provided."),
                new GoalVisualizationRenderResult(visualization));
    }

    private McpSchema.CallToolResult getNavigation(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        String target = requiredString(arguments, "target").toLowerCase(Locale.ROOT);
        UnifiedLearnerStateResponse rawState = coachTools.getLearnerState(skillpilotId);
        List<OpenAiDeCoachContext.Option> options = new ArrayList<>();
        OpenAiDeCoachContext.Decision decision = null;
        String requiredAction;
        switch (target) {
            case "curriculum" -> {
                requiredAction = "setCurriculum";
                List<LandscapeSummary> curricula = coachTools.getCurriculumOptions(skillpilotId);
                if (curricula != null) {
                    for (LandscapeSummary curriculum : curricula) {
                        add(options, contextProjector.curriculumOption(curriculum));
                    }
                }
            }
            case "personalization" -> {
                requiredAction = "setPersonalization";
                // Navigation must expose only the option set that is valid for
                // the current metadata-derived stage. Historical options are
                // useful for display, but must never become replayable writes.
                if (rawState != null && rawState.curriculum() != null) {
                    PersonalizationPlan plan = coachTools.getPersonalizationPlan(skillpilotId);
                    options.addAll(contextProjector.personalizationOptions(
                            plan,
                            rawState.curriculum().getCurriculumId(),
                            communicationLocale(metadata)));
                    decision = contextProjector.personalizationDecision(plan);
                }
            }
            case "scope" -> {
                requiredAction = "setScope";
                List<FrontierGoal> candidates = contextProjector.projectNavigationGoals(
                        coachTools.getScopeOptions(skillpilotId));
                List<FrontierGoal> clusters = candidates.stream()
                        .filter(goal -> "cluster".equals(goal.type()))
                        .toList();
                for (FrontierGoal goal : clusters.isEmpty() ? candidates : clusters) {
                    add(options, contextProjector.goalOption(goal, "scope"));
                }
            }
            case "goal" -> {
                requiredAction = "setActiveGoal";
                List<FrontierGoal> source = rawState.frontier();
                if ((source == null || source.isEmpty()) && rawState.stateMachine() != null) {
                    source = rawState.stateMachine().goalOptions();
                }
                List<FrontierGoal> candidates = contextProjector.projectNavigationGoals(source);
                List<FrontierGoal> atomic = candidates.stream()
                        .filter(goal -> "atomic".equals(goal.type()))
                        .toList();
                for (FrontierGoal goal : atomic.isEmpty() ? candidates : atomic) {
                    add(options, contextProjector.goalOption(goal, "goal"));
                }
            }
            default -> throw new IllegalArgumentException(
                    "target must be curriculum, personalization, scope, or goal.");
        }
        NavigationResult result = new NavigationResult(
                target,
                requiredAction,
                decision,
                List.copyOf(options),
                "personalization".equals(target)
                        ? contextProjector.personalizationInstruction(
                                decision,
                                options,
                                null,
                                communicationLocale(metadata))
                        : options.isEmpty()
                        ? localized(metadata,
                                "Aktuell sind keine sicheren Optionen verfügbar. Lade den Kontext erneut.",
                                "No safe options are currently available. Reload the context.")
                        : localized(metadata,
                                "Übernimm ausschließlich die veröffentlichten Options-IDs unverändert. "
                                        + "Frage nur nach, wenn der Wunsch inhaltlich nicht eindeutig ist.",
                                "Use only the published option IDs unchanged. Ask only when the request is not "
                                        + "semantically unambiguous."));
        return successResult(
                localized(metadata,
                        "Navigationsoptionen für " + target + " geladen.",
                        "Navigation options for " + target + " loaded."),
                result);
    }

    private McpSchema.CallToolResult setCurriculum(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        UpdateCurriculumRequest request = new UpdateCurriculumRequest();
        request.setCurriculumId(requiredString(arguments, "curriculumId"));
        return contextMutationResult(
                skillpilotId,
                localized(metadata,
                        "Lehrplan gespeichert; Folgezustand geladen.",
                        "Curriculum saved; successor state loaded."),
                coachTools.setCurriculum(skillpilotId, request),
                metadata);
    }

    private McpSchema.CallToolResult setPersonalization(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        String optionId = requiredString(arguments, "optionId");
        PersonalizationRequest request = resolvePersonalizationRequest(
                skillpilotId,
                coachTools.getLearnerState(skillpilotId),
                optionId,
                metadata);
        return contextMutationResult(
                skillpilotId,
                localized(metadata,
                        "Personalisierung aktualisiert; Folgezustand geladen.",
                        "Personalisation updated; successor state loaded."),
                coachTools.setPersonalization(skillpilotId, request),
                metadata);
    }

    /** Resolves exactly one opaque ID from the currently published option set. */
    private PersonalizationRequest resolvePersonalizationRequest(
            String skillpilotId,
            UnifiedLearnerStateResponse state,
            String optionId,
            OpenAiDeV1SessionMetadata metadata) {
        List<OpenAiDeCoachContext.Option> allowedOptions =
                personalizationOptions(skillpilotId, state, false, metadata);
        if (allowedOptions.isEmpty()) {
            throw new IllegalArgumentException("No personalisation options are currently available.");
        }
        List<OpenAiDeCoachContext.Option> matches = allowedOptions.stream()
                .filter(option -> option.id() != null && option.id().equals(optionId))
                .toList();
        if (matches.size() != 1) {
            throw new IllegalArgumentException(
                    "The personalisation option is unknown, stale, or ambiguous.");
        }

        return new PersonalizationRequest(
                Map.of(),
                List.of(),
                List.of(),
                optionId);
    }

    private List<OpenAiDeCoachContext.Option> personalizationOptions(
            String skillpilotId,
            UnifiedLearnerStateResponse state,
            boolean navigation,
            OpenAiDeV1SessionMetadata metadata) {
        if (state == null || state.curriculum() == null) {
            return List.of();
        }
        PersonalizationPlan plan = coachTools.getPersonalizationPlan(skillpilotId);
        String rootLandscapeId = state.curriculum().getCurriculumId();
        return navigation
                ? contextProjector.personalizationNavigationOptions(
                        plan,
                        rootLandscapeId,
                        communicationLocale(metadata))
                : contextProjector.personalizationOptions(
                        plan,
                        rootLandscapeId,
                        communicationLocale(metadata));
    }

    private McpSchema.CallToolResult setScope(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        List<String> goalIds = stringList(arguments, "goalIds", true);
        return contextMutationResult(
                skillpilotId,
                localized(metadata,
                        "Lernumfang gespeichert; Folgezustand geladen.",
                        "Learning scope saved; successor state loaded."),
                coachTools.setScope(skillpilotId, new ScopeRequest(goalIds)),
                metadata);
    }

    private McpSchema.CallToolResult setActiveGoal(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        String goalId = requiredString(arguments, "goalId");
        Boolean redirect = optionalBoolean(arguments, "redirect");
        return contextMutationResult(
                skillpilotId,
                localized(metadata,
                        "Aktives Lernziel gespeichert; Folgezustand geladen.",
                        "Active learning goal saved; successor state loaded."),
                coachTools.setActiveGoal(skillpilotId, new ActiveGoalRequest(goalId, redirect)),
                metadata);
    }

    private McpSchema.CallToolResult setMastery(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        String goalId = requiredString(arguments, "goalId");
        UnifiedLearnerStateResponse before = coachTools.getLearnerState(skillpilotId);
        FrontierGoal active = activeGoal(before);
        if (active == null || !goalId.equals(active.id())) {
            return conflictResult(metadata);
        }
        if (!"atomic".equals(active.type()) || isMemoryGoal(active)) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    localized(metadata,
                            "Dieses Ziel darf nicht über die normale Coach-Mastery abgeschlossen werden.",
                            "This goal cannot be completed through ordinary coach mastery."),
                    metadata);
        }
        CoachToolFacade.MasteryResult result = coachTools.setMastery(
                skillpilotId,
                new MasteryUpdateRequest(null, goalId));
        if (result.status() == CoachToolFacade.MasteryStatus.CONFLICT) {
            telemetry.recordOperational(Event.CONFLICT);
            return conflictResult(metadata);
        }
        UnifiedLearnerStateResponse state = result.status() == CoachToolFacade.MasteryStatus.CONFLICT
                ? result.state()
                : coachTools.getLearnerState(skillpilotId);
        MasteryToolResult response = new MasteryToolResult(
                result.status().name().toLowerCase(Locale.ROOT),
                result.update() == null ? null : result.update().savedGoalId(),
                result.update() == null ? null : result.update().savedMastery(),
                projectContext(skillpilotId, state, metadata),
                result.error());
        return successResult(
                result.status() == CoachToolFacade.MasteryStatus.UPDATED
                        ? localized(metadata,
                                "Mastery gespeichert; Folgezustand geladen.",
                                "Mastery saved; successor state loaded.")
                        : localized(metadata,
                                "Mastery nicht gespeichert; aktuellen Folgezustand beachten.",
                                "Mastery was not saved; use the current successor state."),
                response);
    }

    private McpSchema.CallToolResult startRecall(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        String goalId = requiredString(arguments, "goalId");
        Integer batchSize = optionalInteger(arguments, "batchSize");
        if (batchSize != null && (batchSize < 1 || batchSize > 20)) {
            throw new IllegalArgumentException("batchSize must be between 1 and 20.");
        }
        RecallPromptResult result = recallPrompt(coachTools.startVerifiedRecall(
                skillpilotId,
                communicationLanguage(metadata),
                new VerifiedRecallStartRequest(goalId, false, batchSize)));
        return successResult(
                localized(metadata,
                        "Abrufprüfung geladen. Zeige jeweils nur die Frage, nicht die Sollantwort.",
                        "Recall check loaded. Show only each question, never the expected answer."),
                result);
    }

    private McpSchema.CallToolResult getRecallAnswer(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        VerifiedRecallAnswerResponse response = coachTools.getVerifiedRecallAnswer(
                skillpilotId,
                communicationLanguage(metadata),
                new VerifiedRecallAnswerRequest(
                        requiredString(arguments, "goalId"),
                        requiredString(arguments, "cardId")));
        RecallAnswerResult result = new RecallAnswerResult(
                response.instruction(),
                response.goalId(),
                response.cardId(),
                response.prompt(),
                response.expectedAnswer(),
                response.category());
        return successResult(
                localized(metadata,
                        "Sollantwort nach der Lernendenantwort geladen; jetzt fachlich vergleichen.",
                        "Expected answer loaded after the learner answer; now compare technical meaning."),
                result);
    }

    private McpSchema.CallToolResult recordRecallResult(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        VerifiedRecallResultResponse response = coachTools.recordVerifiedRecallResult(
                skillpilotId,
                communicationLanguage(metadata),
                new VerifiedRecallResultRequest(
                        requiredString(arguments, "goalId"),
                        requiredString(arguments, "cardId"),
                        requiredBoolean(arguments, "passed"),
                        optionalString(arguments, "feedback")));
        RecallResult result = new RecallResult(
                response.savedCardId(),
                response.passed(),
                response.verifiedCards(),
                response.pendingCards(),
                response.masterySaved(),
                response.masteryGoalId(),
                response.instruction(),
                recallPrompt(response.next()),
                projectContext(skillpilotId, coachTools.getLearnerState(skillpilotId), metadata));
        return successResult(
                localized(metadata,
                        "Kartenergebnis gespeichert; Folgezustand geladen.",
                        "Card result saved; successor state loaded."),
                result);
    }

    private McpSchema.CallToolResult getExamEvaluation(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        CoachToolFacade.ExamEvaluationResult response = coachTools.getExamEvaluation(
                skillpilotId,
                new CoachToolFacade.ExamEvaluationRequest(requiredString(arguments, "goalId")));
        ExamEvaluationResult result = new ExamEvaluationResult(
                response.goalId(),
                stateProjection.projectReleasedEvaluationContent(response.solutionContent()),
                new ExamScoring(
                        response.scoring().maxPoints(),
                        response.scoring().passingPoints(),
                        response.scoring().steps().stream()
                                .map(step -> new ExamScoringStep(
                                        step.id(),
                                        step.points(),
                                        step.description()))
                                .toList()),
                localized(metadata,
                        "Bewerte die bereits vollständig vorliegende Abgabe Schritt für Schritt nach jedem Rasterkriterium "
                                + "und ausschließlich anhand sichtbar vorliegender Leistung. Die Musterlösung ist nur Referenz: "
                                + "Fachlich gleichwertige Ergebnisse, Darstellungen, Rundungen, Begründungen und korrekte "
                                + "alternative Lösungswege zählen voll, sofern Aufgabe oder Raster keine bestimmte Antwortform "
                                + "verlangt; ausdrückliche Anforderungen bleiben verbindlich. Fehlt eine ausdrücklich geforderte "
                                + "Deutung oder Begründung, erhält genau dieser Teil keine Punkte; trenne Teilpunkte sauber und "
                                + "begründe jeden Abzug konkret. Bewerte abschließend ohne Nachfrage. Benenne Unleserliches als "
                                + "solches und erfinde daraus keinen konkreten fachlichen Fehler. Speichere Mastery erst nach "
                                + "einem finalen Ergebnis mit mindestens passingPoints.",
                        "Assess the complete visible submission step by step against every rubric criterion and only "
                                + "from visible work. The sample solution is a reference, not a wording requirement. Give "
                                + "full credit for technically equivalent results, representations, rounding, reasoning, and "
                                + "correct alternative approaches unless the task or rubric requires a specific form. Explicit "
                                + "requirements remain binding. If a required interpretation or justification is missing, "
                                + "withhold only those points, separate partial credit cleanly, and justify every deduction. "
                                + "Complete the assessment without another question. Identify unreadable content as unreadable "
                                + "and do not invent a specific subject error. Save mastery only after a final result with at "
                                + "least passingPoints."));
        return successResult(
                localized(metadata,
                        "Freigegebene Bewertungsgrundlage geladen; jetzt abschließend bewerten.",
                        "Approved evaluation basis loaded; now complete the assessment."),
                result);
    }

    private McpSchema.CallToolResult contextMutationResult(
            String skillpilotId,
            String summary,
            UnifiedLearnerStateResponse state,
            OpenAiDeV1SessionMetadata metadata) {
        return successResult(summary, projectContext(skillpilotId, state, metadata));
    }

    private OpenAiDeCoachContext projectContext(
            String skillpilotId,
            UnifiedLearnerStateResponse state,
            OpenAiDeV1SessionMetadata metadata) {
        PersonalizationPlan plan =
                state != null
                                && state.stateMachine() != null
                                && "setPersonalization".equals(state.stateMachine().requiredAction())
                        ? coachTools.getPersonalizationPlan(skillpilotId)
                        : PersonalizationPlan.complete(List.of());
        return contextProjector.project(
                state,
                plan,
                coachTools.showGoalVisualizationsInChat(skillpilotId),
                communicationLocale(metadata));
    }

    private RecallPromptResult recallPrompt(VerifiedRecallPromptResponse response) {
        if (response == null) {
            return null;
        }
        List<RecallCard> cards = response.cards() == null
                ? List.of()
                : response.cards().stream().map(this::recallCard).toList();
        return new RecallPromptResult(
                response.status(),
                response.instruction(),
                response.goalId(),
                response.goalTitle(),
                response.totalCards(),
                response.verifiedCards(),
                response.pendingCards(),
                response.eligibleCards(),
                response.blockedCards(),
                response.nextEligibleAt(),
                response.batchSize(),
                cards);
    }

    private RecallCard recallCard(VerifiedRecallPromptCard card) {
        return new RecallCard(card.cardId(), card.prompt(), card.category());
    }

    private McpSchema.CallToolResult successResult(String summary, Object structuredContent) {
        return McpSchema.CallToolResult.builder()
                .isError(false)
                .addTextContent(summary)
                .structuredContent(structuredContent)
                .build();
    }

    private McpSchema.CallToolResult versionResult(
            McpSchema.CallToolResult result,
            OpenAiDeV1SessionMetadata metadata) {
        if (result == null) {
            return result;
        }
        Map<String, Object> versioned = new LinkedHashMap<>();
        addVersionMetadata(versioned, metadata);
        Object structured = result.structuredContent();
        if (structured instanceof Map<?, ?> map) {
            map.forEach((key, value) -> {
                if (key instanceof String name && !versioned.containsKey(name)) {
                    versioned.put(name, value);
                }
            });
        } else if (structured != null) {
            Map<String, Object> projected = PUBLIC_OUTPUT_MAPPER.convertValue(
                    structured,
                    new TypeReference<Map<String, Object>>() {
                    });
            projected.forEach(versioned::putIfAbsent);
        }
        versioned.put("extensions", metadata.extensions());
        return McpSchema.CallToolResult.builder()
                .content(result.content())
                .isError(result.isError())
                .structuredContent(versioned)
                .meta(result.meta())
                .build();
    }

    private McpSchema.CallToolResult invokeVersionedOperation(
            ToolOperation operation,
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata,
            boolean failTransactionOnPublicError) {
        try {
            McpSchema.CallToolResult result =
                    versionResult(operation.apply(skillpilotId, arguments, metadata), metadata);
            if (failTransactionOnPublicError
                    && result != null
                    && Boolean.TRUE.equals(result.isError())) {
                throw new VersionedPublicResultException(result);
            }
            return result;
        } catch (VersionedPublicResultException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            throw new SessionBoundOperationException(exception, metadata);
        }
    }

    private McpSchema.CallToolResult classifiedFailure(
            String toolName,
            RuntimeException exception,
            OpenAiDeV1SessionMetadata metadata) {
        if (exception instanceof OpenAiDeV1SessionStateException stateException) {
            return stateErrorResult(stateException);
        }
        if (exception instanceof OpenAiDeLearningSessionRequiredException) {
            telemetry.recordOperational(Event.SESSION_REQUIRED);
            return sessionRequiredResult();
        }
        if (exception instanceof AuthenticationException) {
            telemetry.recordOperational(Event.UNAUTHORIZED);
            return authenticationErrorResult(
                    OpenAiDeV1ErrorCode.AUTHENTICATION_REQUIRED,
                    identityResolver.authenticationChallenge(),
                    localized(metadata,
                            "Für diesen SkillPilot-Schritt ist eine gültige OAuth-Verbindung erforderlich.",
                            "A valid OAuth connection is required for this SkillPilot step."),
                    metadata);
        }
        if (exception instanceof AccessDeniedException) {
            telemetry.recordOperational(Event.FORBIDDEN);
            return authenticationErrorResult(
                    OpenAiDeV1ErrorCode.INSUFFICIENT_SCOPE,
                    identityResolver.insufficientScopeChallenge(),
                    localized(metadata,
                            "Die verbundene App hat für diesen SkillPilot-Schritt nicht den erforderlichen Zugriff.",
                            "The connected app does not have the required access for this SkillPilot step."),
                    metadata);
        }
        if (exception instanceof ResponseStatusException responseStatusException) {
            return responseStatusFailure(toolName, responseStatusException, metadata);
        }
        if (exception instanceof IllegalArgumentException) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    localized(metadata,
                            "Die Eingaben für diesen SkillPilot-Schritt sind ungültig.",
                            "The inputs for this SkillPilot step are invalid."),
                    metadata);
        }
        return unexpectedErrorResult(toolName, exception, metadata);
    }

    private McpSchema.CallToolResult responseStatusFailure(
            String toolName,
            ResponseStatusException exception,
            OpenAiDeV1SessionMetadata metadata) {
        int status = exception.getStatusCode().value();
        if (status == 409) {
            return conflictResult(metadata);
        }
        if (status == 401) {
            telemetry.recordOperational(Event.UNAUTHORIZED);
            return authenticationErrorResult(
                    OpenAiDeV1ErrorCode.AUTHENTICATION_REQUIRED,
                    identityResolver.authenticationChallenge(),
                    localized(metadata,
                            "Für diesen SkillPilot-Schritt ist eine gültige OAuth-Verbindung erforderlich.",
                            "A valid OAuth connection is required for this SkillPilot step."),
                    metadata);
        }
        if (status == 403) {
            telemetry.recordOperational(Event.FORBIDDEN);
            return authenticationErrorResult(
                    OpenAiDeV1ErrorCode.INSUFFICIENT_SCOPE,
                    identityResolver.insufficientScopeChallenge(),
                    localized(metadata,
                            "Die verbundene App hat für diesen SkillPilot-Schritt nicht den erforderlichen Zugriff.",
                            "The connected app does not have the required access for this SkillPilot step."),
                    metadata);
        }
        if (status == 408 || status == 429 || status == 504) {
            if (status == 429) {
                telemetry.recordOperational(Event.RATE_LIMITED);
            } else {
                telemetry.recordOperational(Event.TIMEOUT);
            }
            return errorResult(
                    OpenAiDeV1ErrorCode.TIMEOUT,
                    localized(metadata,
                            "Der SkillPilot-Schritt wurde wegen einer vorübergehenden Zeit- oder Kapazitätsgrenze nicht bestätigt.",
                            "The SkillPilot step was not confirmed because of a temporary time or capacity limit."),
                    metadata);
        }
        if (status == 503) {
            return errorResult(
                    OpenAiDeV1ErrorCode.SERVICE_UNAVAILABLE,
                    localized(metadata,
                            "Schreibende SkillPilot-Aktionen oder der benötigte Dienst sind vorübergehend nicht verfügbar.",
                            "SkillPilot write actions or the required service are temporarily unavailable."),
                    metadata);
        }
        if (exception.getStatusCode().is5xxServerError()) {
            return unexpectedErrorResult(toolName, exception, metadata);
        }
        if (status == 400 || status == 404 || status == 422) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    localized(metadata,
                            "Die Eingaben für diesen SkillPilot-Schritt sind ungültig.",
                            "The inputs for this SkillPilot step are invalid."),
                    metadata);
        }
        return conflictResult(metadata);
    }

    private McpSchema.CallToolResult stateErrorResult(
            OpenAiDeV1SessionStateException exception) {
        OpenAiDeV1SessionMetadata metadata = exception.metadata();
        OpenAiDeV1ErrorCode code = OpenAiDeV1ErrorCode.valueOf(exception.code().name());
        String instruction;
        Map<String, Object> details = new LinkedHashMap<>();
        if (code == OpenAiDeV1ErrorCode.SESSION_VERSION_UNAVAILABLE) {
            instruction = localized(metadata,
                    "Die vorbereitete Lernsession gehört zu einer nicht mehr verfügbaren Workflow- oder "
                            + "Curriculumrevision. Öffne SkillPilot und wähle erneut „Lernen starten“.",
                    "The prepared learning session belongs to a workflow or curriculum revision that is no longer "
                            + "available. Open SkillPilot and choose Start learning again.");
            details.put("oauthConnectionValid", true);
            details.put("startUrl", sessionStartUrl);
        } else if (code == OpenAiDeV1ErrorCode.IDEMPOTENCY_KEY_REUSED) {
            instruction = localized(metadata,
                    "Diese clientRequestId wurde bereits für einen anderen Schreibversuch verwendet. "
                            + "Lade den aktuellen Kontext neu und verwende für einen neuen Versuch eine neue clientRequestId.",
                    "This clientRequestId was already used for a different write attempt. Reload the current context "
                            + "and use a new clientRequestId for a new attempt.");
        } else {
            instruction = localized(metadata,
                    "Lade den aktuellen SkillPilot-Kontext genau einmal neu. Verwende danach dessen stateVersion "
                            + "und für einen neuen fachlichen Schreibversuch eine neue clientRequestId.",
                    "Reload the current SkillPilot context exactly once. Then use its stateVersion and a new "
                            + "clientRequestId for a new subject-matter write attempt.");
            details.put("reloadContextAtMostOnce", true);
        }
        details.put("instruction", instruction);
        return errorResult(code, instruction, metadata, details);
    }

    private McpSchema.CallToolResult errorResult(
            OpenAiDeV1ErrorCode code,
            String message,
            OpenAiDeV1SessionMetadata metadata) {
        return errorResult(code, message, metadata, Map.of());
    }

    private McpSchema.CallToolResult errorResult(
            OpenAiDeV1ErrorCode code,
            String message,
            OpenAiDeV1SessionMetadata metadata,
            Map<String, Object> details) {
        String safeMessage = message == null || message.isBlank()
                ? localized(metadata,
                        "Der SkillPilot-Schritt konnte nicht ausgeführt werden.",
                        "The SkillPilot step could not be completed.")
                : message;
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("status", statusFor(code));
        content.put("code", code.code());
        content.put("category", code.category());
        content.put("retryable", code.retryable());
        content.put("stateChanged", code.stateChanged());
        content.put("recovery", code.recovery());
        content.put("message", safeMessage);
        addVersionMetadata(content, metadata);
        if (details != null) {
            details.forEach(content::putIfAbsent);
        }
        String continuation = metadata == null
                ? " The step was not confirmed; do not claim persistence and continue the structured workflow "
                        + "only after a stable fresh context."
                : localized(metadata,
                        " Der Schritt wurde nicht bestätigt; behaupte keine Speicherung und setze den strukturierten "
                                + "Ablauf erst nach einem stabilen frischen Kontext fort.",
                        " The step was not confirmed; do not claim persistence and continue the structured workflow "
                                + "only after a stable fresh context.");
        return McpSchema.CallToolResult.builder()
                .isError(true)
                .addTextContent(safeMessage + continuation)
                .structuredContent(content)
                .build();
    }

    private McpSchema.CallToolResult conflictResult() {
        return conflictResult(null);
    }

    private McpSchema.CallToolResult conflictResult(OpenAiDeV1SessionMetadata metadata) {
        telemetry.recordOperational(Event.CONFLICT);
        String instruction = localized(metadata,
                "Der SkillPilot-Zustand hat sich geändert. Lade den aktuellen Kontext genau einmal neu "
                        + "und entscheide ausschließlich anhand dieses Zustands; bei einem weiteren Konflikt stoppe transparent.",
                "The SkillPilot state has changed. Reload the current context exactly once and decide only from that "
                        + "state; after another conflict, stop transparently.");
        return errorResult(
                OpenAiDeV1ErrorCode.STATE_CONFLICT,
                instruction,
                metadata,
                Map.of(
                        "reloadContextAtMostOnce", true,
                        "instruction", instruction));
    }

    private McpSchema.CallToolResult sessionRequiredResult() {
        String instruction = "Open SkillPilot and choose Start learning again. The OAuth connection remains active; "
                + "do not enter a token or SkillPilot ID in the chat.";
        return errorResult(
                OpenAiDeV1ErrorCode.SESSION_REQUIRED,
                "Your SkillPilot learning session is missing or expired. " + instruction,
                null,
                Map.of(
                        "oauthConnectionValid", true,
                        "startUrl", sessionStartUrl,
                        "instruction", instruction));
    }

    private McpSchema.CallToolResult authenticationErrorResult(
            OpenAiDeV1ErrorCode code,
            String challenge,
            String message,
            OpenAiDeV1SessionMetadata metadata) {
        McpSchema.CallToolResult challengeResult =
                SkillPilotMcpToolResults.authenticationRequired(challenge);
        McpSchema.CallToolResult error = errorResult(code, message, metadata);
        return McpSchema.CallToolResult.builder()
                .content(error.content())
                .isError(true)
                .structuredContent(error.structuredContent())
                .meta(challengeResult.meta())
                .build();
    }

    private void addVersionMetadata(
            Map<String, Object> content,
            OpenAiDeV1SessionMetadata metadata) {
        if (metadata == null) {
            return;
        }
        content.put("contractMajor", metadata.contractMajor());
        content.put("stateVersion", metadata.stateVersion());
        content.put("stateSchemaVersion", metadata.stateSchemaVersion());
        content.put("workflowVersion", metadata.workflowVersion());
        content.put("curriculumRevision", metadata.curriculumRevision());
        content.put("communicationLocale", metadata.communicationLocale());
        content.put("extensions", metadata.extensions());
    }

    private String statusFor(OpenAiDeV1ErrorCode code) {
        return switch (code) {
            case STATE_VERSION_CONFLICT, IDEMPOTENCY_KEY_REUSED, STATE_CONFLICT -> "conflict";
            case SESSION_REQUIRED -> "session_required";
            case SESSION_VERSION_UNAVAILABLE -> "session_version_unavailable";
            case AUTHENTICATION_REQUIRED -> "authentication_required";
            case INSUFFICIENT_SCOPE -> "insufficient_scope";
            case INVALID_INPUT -> "invalid_input";
            case TIMEOUT -> "timeout";
            case SERVICE_UNAVAILABLE -> "service_unavailable";
            case INTERNAL_ERROR -> "internal_error";
        };
    }

    private boolean isTimeout(Throwable throwable) {
        Throwable current = throwable;
        while (current != null) {
            if (current instanceof java.util.concurrent.TimeoutException) {
                return true;
            }
            if (current instanceof ResponseStatusException responseStatus
                    && (responseStatus.getStatusCode().value() == 408
                            || responseStatus.getStatusCode().value() == 504)) {
                return true;
            }
            current = current.getCause();
        }
        return false;
    }

    private String normalizePublicBaseUrl(String publicBaseUrl) {
        String normalized = publicBaseUrl == null ? "" : publicBaseUrl.trim();
        if (normalized.isEmpty()) {
            return "https://skillpilot.com";
        }
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized.isEmpty() ? "https://skillpilot.com" : normalized;
    }

    private FrontierGoal activeGoal(UnifiedLearnerStateResponse state) {
        if (state == null) {
            return null;
        }
        if (state.stateMachine() != null && state.stateMachine().activeGoal() != null) {
            return state.stateMachine().activeGoal();
        }
        return state.activeGoal();
    }

    private boolean isMemoryGoal(FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        if ("memory".equals(goal.nodeKind())) {
            return true;
        }
        return goal.tags() != null && goal.tags().stream()
                .anyMatch(tag -> "memorization".equals(tag) || (tag != null && tag.startsWith("srs-deck:")));
    }

    private String contextSummary(
            OpenAiDeCoachContext context,
            OpenAiDeV1SessionMetadata metadata) {
        boolean english = OpenAiCoachLocale.isEnglish(communicationLocale(metadata));
        if (context == null) {
            return english
                    ? "The SkillPilot context is currently unavailable."
                    : "SkillPilot-Kontext ist derzeit nicht verfügbar.";
        }
        if (context.orientation() != null) {
            String establishedContext = context.orientation().establishedContext();
            String openTopics = context.orientation().openQuestions() == null
                    ? ""
                    : context.orientation().openQuestions().stream()
                            .map(OpenAiDeCoachContext.OpenQuestion::topic)
                            .filter(topic -> topic != null && !topic.isBlank())
                            .distinct()
                            .collect(java.util.stream.Collectors.joining(", "));
            StringBuilder summary = new StringBuilder(
                    english ? "SkillPilot context loaded" : "SkillPilot-Kontext geladen");
            if (establishedContext != null && !establishedContext.isBlank()) {
                summary.append(". ").append(establishedContext.trim());
            }
            if (!openTopics.isBlank()) {
                summary.append(english ? " Still to clarify together: " : " Noch gemeinsam zu klären: ")
                        .append(openTopics)
                        .append('.');
            }
            String value = summary.toString();
            return value.endsWith(".") || value.endsWith("!") || value.endsWith("?")
                    ? value
                    : value + '.';
        }
        String goal = context.activeGoal() == null || context.activeGoal().title() == null
                ? (english ? "no active learning goal" : "kein aktives Lernziel")
                : (english ? "active learning goal: " : "aktives Lernziel: ")
                        + context.activeGoal().title();
        return (english ? "SkillPilot context loaded; " : "SkillPilot-Kontext geladen; ")
                + goal
                + (english ? "; next step: " : "; nächster Schritt: ")
                + (context.requiredAction().isBlank()
                        ? (english ? "no backend action" : "keine Backend-Aktion")
                        : context.requiredAction())
                + ".";
    }

    private String requiredString(Map<String, Object> arguments, String name) {
        String value = optionalString(arguments, name);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(name + " darf nicht leer sein.");
        }
        return value;
    }

    private String requiredLearningSessionId(Map<String, Object> arguments) {
        Object value = arguments.get(LEARNING_SESSION_ID);
        if (!(value instanceof String text)) {
            throw new OpenAiDeLearningSessionRequiredException();
        }
        String normalized = text.trim();
        if (!LEARNING_SESSION_PATTERN.matcher(normalized).matches()) {
            throw new OpenAiDeLearningSessionRequiredException();
        }
        return normalized;
    }

    private String optionalString(Map<String, Object> arguments, String name) {
        Object value = arguments.get(name);
        if (value == null) {
            return null;
        }
        if (!(value instanceof String text)) {
            throw new IllegalArgumentException(name + " muss eine Zeichenkette sein.");
        }
        return text.trim();
    }

    private List<String> stringList(Map<String, Object> arguments, String name, boolean required) {
        Object value = arguments.get(name);
        if (value == null) {
            if (required) {
                throw new IllegalArgumentException(name + " darf nicht leer sein.");
            }
            return List.of();
        }
        if (!(value instanceof List<?> list)) {
            throw new IllegalArgumentException(name + " muss eine Liste sein.");
        }
        List<String> normalized = list.stream()
                .map(item -> {
                    if (!(item instanceof String text) || text.isBlank()) {
                        throw new IllegalArgumentException(name + " darf nur nichtleere Zeichenketten enthalten.");
                    }
                    return text.trim();
                })
                .distinct()
                .toList();
        if (required && normalized.isEmpty()) {
            throw new IllegalArgumentException(name + " darf nicht leer sein.");
        }
        return normalized;
    }

    private Boolean optionalBoolean(Map<String, Object> arguments, String name) {
        Object value = arguments.get(name);
        if (value == null) {
            return null;
        }
        if (!(value instanceof Boolean bool)) {
            throw new IllegalArgumentException(name + " muss true oder false sein.");
        }
        return bool;
    }

    private boolean requiredBoolean(Map<String, Object> arguments, String name) {
        Boolean value = optionalBoolean(arguments, name);
        if (value == null) {
            throw new IllegalArgumentException(name + " muss gesetzt sein.");
        }
        return value;
    }

    private long requiredLong(Map<String, Object> arguments, String name) {
        Object value = arguments.get(name);
        if (!(value instanceof Number number)) {
            throw new IllegalArgumentException(name + " muss eine ganze Zahl sein.");
        }
        double asDouble = number.doubleValue();
        long asLong = number.longValue();
        if (!Double.isFinite(asDouble) || asDouble != asLong || asLong < 0) {
            throw new IllegalArgumentException(name + " muss eine nichtnegative ganze Zahl sein.");
        }
        return asLong;
    }

    private Integer optionalInteger(Map<String, Object> arguments, String name) {
        Object value = arguments.get(name);
        if (value == null) {
            return null;
        }
        if (!(value instanceof Number number)) {
            throw new IllegalArgumentException(name + " muss eine ganze Zahl sein.");
        }
        double asDouble = number.doubleValue();
        int asInt = number.intValue();
        if (!Double.isFinite(asDouble) || asDouble != asInt) {
            throw new IllegalArgumentException(name + " muss eine ganze Zahl sein.");
        }
        return asInt;
    }

    private void add(List<OpenAiDeCoachContext.Option> options, OpenAiDeCoachContext.Option option) {
        if (option != null) {
            options.add(option);
        }
    }

    private static Map<String, Object> oauthScheme(String... scopes) {
        return Map.of("type", "oauth2", "scopes", List.of(scopes));
    }

    private static Map<String, Object> emptyObjectSchema() {
        return objectSchema(Map.of(), List.of());
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> withSessionSchema(
            Map<String, Object> inputSchema,
            boolean writeScope) {
        Map<String, Object> properties = new LinkedHashMap<>();
        Object originalProperties = inputSchema.get("properties");
        if (originalProperties instanceof Map<?, ?> propertyMap) {
            propertyMap.forEach((key, value) -> {
                if (key instanceof String name) {
                    properties.put(name, value);
                }
            });
        }
        properties.put(
                LEARNING_SESSION_ID,
                Map.of(
                        "type", "string",
                        "description",
                                "Copy exactly and unchanged from the current SkillPilot start message and send it "
                                        + "with every tool call."));
        if (writeScope) {
            properties.put(
                    EXPECTED_STATE_VERSION,
                    Map.of(
                            "type", "integer",
                            "minimum", 0,
                            "description",
                                    "Copy stateVersion unchanged from the newest successful SkillPilot result."));
            properties.put(
                    CLIENT_REQUEST_ID,
                    Map.of(
                            "type", "string",
                            "description",
                                    "Create a new UUID for every new subject-matter write attempt; reuse the same "
                                            + "UUID for an unchanged retry."));
        }

        List<String> required = new ArrayList<>();
        Object originalRequired = inputSchema.get("required");
        if (originalRequired instanceof List<?> requiredList) {
            requiredList.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .forEach(required::add);
        }
        if (!required.contains(LEARNING_SESSION_ID)) {
            required.add(LEARNING_SESSION_ID);
        }
        if (writeScope) {
            if (!required.contains(EXPECTED_STATE_VERSION)) {
                required.add(EXPECTED_STATE_VERSION);
            }
            if (!required.contains(CLIENT_REQUEST_ID)) {
                required.add(CLIENT_REQUEST_ID);
            }
        }
        return objectSchema(properties, List.copyOf(required));
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> withVersionMetadataSchema(
            Map<String, Object> outputSchema) {
        Map<String, Object> properties = new LinkedHashMap<>();
        Object originalProperties = outputSchema.get("properties");
        if (originalProperties instanceof Map<?, ?> propertyMap) {
            propertyMap.forEach((key, value) -> {
                if (key instanceof String name) {
                    properties.put(name, value);
                }
            });
        }
        properties.put("contractMajor", Map.of("type", "integer", "const", 1));
        properties.put("stateVersion", Map.of("type", "integer", "minimum", 0));
        properties.put("stateSchemaVersion", Map.of("type", "integer", "minimum", 1));
        properties.put("workflowVersion", nonEmptyStringSchema());
        properties.put("curriculumRevision", nonEmptyStringSchema());
        properties.put("communicationLocale", nonEmptyStringSchema());
        properties.put("extensions", Map.of("type", "object", "additionalProperties", true));

        List<String> required = new ArrayList<>();
        Object originalRequired = outputSchema.get("required");
        if (originalRequired instanceof List<?> requiredList) {
            requiredList.stream()
                    .filter(String.class::isInstance)
                    .map(String.class::cast)
                    .forEach(required::add);
        }
        for (String name : List.of(
                "contractMajor",
                "stateVersion",
                "stateSchemaVersion",
                "workflowVersion",
                "curriculumRevision",
                "communicationLocale",
                "extensions")) {
            if (!required.contains(name)) {
                required.add(name);
            }
        }
        return objectSchema(properties, List.copyOf(required));
    }

    private static Map<String, Object> contextSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("learningState", stringSchema());
        properties.put("requiredAction", stringSchema());
        properties.put("interactionMode", stringSchema());
        properties.put("curriculum", curriculumSchema());
        properties.put("orientation", orientationSchema());
        properties.put("activeGoal", activeGoalSchema());
        properties.put("options", objectArraySchema(optionSchema()));
        properties.put("decision", decisionSchema());
        properties.put("frontier", objectArraySchema(goalSchema()));
        properties.put("resources", objectArraySchema(resourceSchema()));
        properties.put("goalVisualization", goalVisualizationSchema());
        properties.put("nextAllowedTools", stringArraySchema(0));
        properties.put("progress", progressSchema());
        properties.put("completion", completionSchema());
        properties.put("policies", stringArraySchema(0));
        properties.put("instruction", stringSchema());
        return objectSchema(
                properties,
                List.of(
                        "learningState",
                        "requiredAction",
                        "interactionMode",
                        "options",
                        "frontier",
                        "resources",
                        "nextAllowedTools",
                        "progress",
                        "completion",
                        "policies",
                        "instruction"));
    }

    private static Map<String, Object> navigationSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("target", stringSchema());
        properties.put("requiredAction", stringSchema());
        properties.put("decision", decisionSchema());
        properties.put("options", objectArraySchema(optionSchema()));
        properties.put("instruction", stringSchema());
        return objectSchema(
                properties,
                List.of("target", "requiredAction", "options", "instruction"));
    }

    private static Map<String, Object> goalVisualizationSchema() {
        return objectSchema(
                Map.of(
                        "goalId", nonEmptyStringSchema(),
                        "title", nonEmptyStringSchema(),
                        "description", stringSchema(),
                        "imageUrl", nonEmptyStringSchema(),
                        "altText", nonEmptyStringSchema(),
                        "cockpitUrl", nonEmptyStringSchema()),
                List.of(
                        "goalId",
                        "title",
                        "imageUrl",
                        "altText",
                        "cockpitUrl"));
    }

    private static Map<String, Object> goalVisualizationRenderSchema() {
        return objectSchema(
                Map.of("goalVisualization", goalVisualizationSchema()),
                List.of("goalVisualization"));
    }

    private static Map<String, Object> decisionSchema() {
        return objectSchema(
                Map.of(
                        "stageLabel", nonEmptyStringSchema(),
                        "groupLabel", nonEmptyStringSchema(),
                        "minSelections", integerSchema(0, null),
                        "maxSelections", integerSchema(0, null),
                        "selectedCount", integerSchema(0, null)),
                List.of(
                        "stageLabel",
                        "groupLabel",
                        "minSelections",
                        "maxSelections",
                        "selectedCount"));
    }

    private static Map<String, Object> orientationSchema() {
        return objectSchema(
                Map.of(
                        "establishedContext", stringSchema(),
                        "openQuestions", objectArraySchema(openQuestionSchema())),
                List.of("openQuestions"));
    }

    private static Map<String, Object> openQuestionSchema() {
        return objectSchema(
                Map.of(
                        "topic", stringSchema(),
                        "question", stringSchema()),
                List.of("topic", "question"));
    }

    private static Map<String, Object> masterySchema() {
        return objectSchema(
                Map.of(
                        "status", stringSchema(),
                        "savedGoalId", stringSchema(),
                        "savedMastery", numberSchema(0.0, 1.0),
                        "context", contextSchema(),
                        "error", stringSchema()),
                List.of("status"));
    }

    private static Map<String, Object> recallPromptSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("status", stringSchema());
        properties.put("instruction", stringSchema());
        properties.put("goalId", stringSchema());
        properties.put("goalTitle", stringSchema());
        properties.put("totalCards", integerSchema(0, null));
        properties.put("verifiedCards", integerSchema(0, null));
        properties.put("pendingCards", integerSchema(0, null));
        properties.put("eligibleCards", integerSchema(0, null));
        properties.put("blockedCards", integerSchema(0, null));
        properties.put("nextEligibleAt", stringSchema());
        properties.put("batchSize", integerSchema(0, 20));
        properties.put("cards", objectArraySchema(recallCardSchema()));
        return objectSchema(properties, List.of(
                "status", "instruction", "goalId", "totalCards", "verifiedCards", "pendingCards",
                "eligibleCards", "blockedCards", "batchSize", "cards"));
    }

    private static Map<String, Object> recallAnswerSchema() {
        return objectSchema(
                Map.of(
                        "instruction", stringSchema(),
                        "goalId", stringSchema(),
                        "cardId", stringSchema(),
                        "prompt", stringSchema(),
                        "expectedAnswer", stringSchema(),
                        "category", stringSchema()),
                List.of("instruction", "goalId", "cardId", "prompt", "expectedAnswer"));
    }

    private static Map<String, Object> recallResultSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("savedCardId", stringSchema());
        properties.put("passed", booleanSchema());
        properties.put("verifiedCards", integerSchema(0, null));
        properties.put("pendingCards", integerSchema(0, null));
        properties.put("masterySaved", booleanSchema());
        properties.put("masteryGoalId", stringSchema());
        properties.put("instruction", stringSchema());
        properties.put("next", recallPromptSchema());
        properties.put("context", contextSchema());
        return objectSchema(properties, List.of(
                "savedCardId", "passed", "verifiedCards", "pendingCards", "masterySaved", "context"));
    }

    private static Map<String, Object> examEvaluationSchema() {
        return objectSchema(
                Map.of(
                        "goalId", stringSchema(),
                        "solutionContent", stringSchema(),
                        "scoring", scoringSchema(),
                        "instruction", stringSchema()),
                List.of("goalId", "solutionContent", "scoring", "instruction"));
    }

    private static Map<String, Object> objectSchema(
            Map<String, Object> properties,
            List<String> required) {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", properties);
        if (required != null && !required.isEmpty()) {
            schema.put("required", required);
        }
        schema.put("additionalProperties", false);
        return Map.copyOf(schema);
    }

    private static Map<String, Object> curriculumSchema() {
        return objectSchema(
                Map.of(
                        "curriculumId", stringSchema(),
                        "title", stringSchema(),
                        "subject", stringSchema()),
                List.of("curriculumId"));
    }

    private static Map<String, Object> activeGoalSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("goalId", stringSchema());
        properties.put("title", stringSchema());
        properties.put("description", stringSchema());
        properties.put("type", stringSchema());
        properties.put("nodeKind", stringSchema());
        properties.put("semanticKind", stringSchema());
        properties.put("cockpitUrl", stringSchema());
        properties.put("exam", examTaskSchema());
        return objectSchema(properties, List.of("goalId"));
    }

    private static Map<String, Object> examTaskSchema() {
        return objectSchema(
                Map.of(
                        "taskContent", stringSchema(),
                        "maxPoints", numberSchema(0.0, Double.MAX_VALUE),
                        "hasImage", booleanSchema()),
                List.of("hasImage"));
    }

    private static Map<String, Object> optionSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("kind", stringSchema());
        properties.put("id", stringSchema());
        properties.put("label", stringSchema());
        properties.put("description", stringSchema());
        properties.put("goalIds", stringArraySchema(0));
        properties.put("filterIds", stringArraySchema(0));
        properties.put("action", stringSchema());
        return objectSchema(properties, List.of("kind", "id", "label"));
    }

    private static Map<String, Object> goalSchema() {
        return objectSchema(
                Map.of(
                        "goalId", stringSchema(),
                        "title", stringSchema(),
                        "description", stringSchema(),
                        "type", stringSchema(),
                        "nodeKind", stringSchema(),
                        "semanticKind", stringSchema(),
                        "reason", stringSchema()),
                List.of("goalId"));
    }

    private static Map<String, Object> resourceSchema() {
        return objectSchema(
                Map.of(
                        "type", stringSchema(),
                        "title", stringSchema(),
                        "url", stringSchema(),
                        "resourceType", stringSchema(),
                        "provider", stringSchema(),
                        "altText", stringSchema(),
                        "requiresCockpit", booleanSchema()),
                List.of("type", "title", "url", "requiresCockpit"));
    }

    private static Map<String, Object> progressSchema() {
        return objectSchema(
                Map.of(
                        "masteredAtomic", integerSchema(0, null),
                        "totalAtomic", integerSchema(0, null),
                        "personalized", goalProgressSchema(),
                        "scope", goalProgressSchema(),
                        "scopeCompleted", booleanSchema()),
                List.of("masteredAtomic", "totalAtomic", "scopeCompleted"));
    }

    private static Map<String, Object> goalProgressSchema() {
        return objectSchema(
                Map.of(
                        "masteredAtomic", integerSchema(0, null),
                        "totalAtomic", integerSchema(0, null)),
                List.of("masteredAtomic", "totalAtomic"));
    }

    private static Map<String, Object> completionSchema() {
        return objectSchema(
                Map.of(
                        "scopeComplete", booleanSchema(),
                        "curriculumComplete", booleanSchema()),
                List.of("scopeComplete", "curriculumComplete"));
    }

    private static Map<String, Object> recallCardSchema() {
        return objectSchema(
                Map.of(
                        "cardId", stringSchema(),
                        "prompt", stringSchema(),
                        "category", stringSchema()),
                List.of("cardId", "prompt"));
    }

    private static Map<String, Object> scoringSchema() {
        return objectSchema(
                Map.of(
                        "maxPoints", numberSchema(0.0, Double.MAX_VALUE),
                        "passingPoints", numberSchema(0.0, Double.MAX_VALUE),
                        "steps", objectArraySchema(scoringStepSchema())),
                List.of("maxPoints", "passingPoints", "steps"));
    }

    private static Map<String, Object> scoringStepSchema() {
        return objectSchema(
                Map.of(
                        "id", stringSchema(),
                        "points", numberSchema(0.0, Double.MAX_VALUE),
                        "description", stringSchema()),
                List.of("points"));
    }

    private static Map<String, Object> objectArraySchema(Map<String, Object> itemSchema) {
        return Map.of("type", "array", "items", itemSchema);
    }

    private static Map<String, Object> stringSchema() {
        return Map.of("type", "string");
    }

    private static Map<String, Object> nonEmptyStringSchema() {
        return Map.of("type", "string", "minLength", 1);
    }

    private static Map<String, Object> modelFacingOpaqueReferenceSchema() {
        return Map.of(
                "type", "string",
                "description", "Copy unchanged from the newest SkillPilot result.");
    }

    private String communicationLocale(OpenAiDeV1SessionMetadata metadata) {
        return metadata == null
                ? OpenAiCoachLocale.CONTROL_PLANE_LOCALE
                : OpenAiCoachLocale.normalize(metadata.communicationLocale());
    }

    private String communicationLanguage(OpenAiDeV1SessionMetadata metadata) {
        return Locale.forLanguageTag(communicationLocale(metadata)).getLanguage();
    }

    private String localized(
            OpenAiDeV1SessionMetadata metadata,
            String german,
            String english) {
        return OpenAiCoachLocale.localized(communicationLocale(metadata), german, english);
    }

    private static Map<String, Object> enumStringSchema(String... values) {
        return Map.of("type", "string", "enum", List.of(values));
    }

    private static Map<String, Object> booleanSchema() {
        return Map.of("type", "boolean");
    }

    private static Map<String, Object> numberSchema(double minimum, double maximum) {
        return Map.of("type", "number", "minimum", minimum, "maximum", maximum);
    }

    private static Map<String, Object> integerSchema(Integer minimum, Integer maximum) {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "integer");
        if (minimum != null) {
            schema.put("minimum", minimum);
        }
        if (maximum != null) {
            schema.put("maximum", maximum);
        }
        return Map.copyOf(schema);
    }

    private static Map<String, Object> stringArraySchema(int minItems) {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "array");
        schema.put("items", nonEmptyStringSchema());
        schema.put("uniqueItems", true);
        schema.put("minItems", minItems);
        return Map.copyOf(schema);
    }

    private static Map<String, Object> modelFacingOpaqueReferenceArraySchema(int minItems) {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "array");
        schema.put("items", modelFacingOpaqueReferenceSchema());
        schema.put("uniqueItems", true);
        schema.put("minItems", minItems);
        return Map.copyOf(schema);
    }

    private static final class VersionedPublicResultException extends RuntimeException {
        private final McpSchema.CallToolResult result;

        private VersionedPublicResultException(McpSchema.CallToolResult result) {
            super(null, null, false, false);
            this.result = result;
        }

        private McpSchema.CallToolResult result() {
            return result;
        }
    }

    private static final class SessionBoundOperationException extends RuntimeException {
        private final RuntimeException operationCause;
        private final OpenAiDeV1SessionMetadata metadata;

        private SessionBoundOperationException(
                RuntimeException operationCause,
                OpenAiDeV1SessionMetadata metadata) {
            super(null, operationCause, false, false);
            this.operationCause = operationCause;
            this.metadata = metadata;
        }

        private RuntimeException operationCause() {
            return operationCause;
        }

        private OpenAiDeV1SessionMetadata metadata() {
            return metadata;
        }
    }

    @FunctionalInterface
    private interface ToolOperation {
        McpSchema.CallToolResult apply(
                String skillpilotId,
                Map<String, Object> arguments,
                OpenAiDeV1SessionMetadata metadata);
    }

}
