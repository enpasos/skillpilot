package com.skillpilot.backend.openai.mcp.de.v1;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MemoryPracticeCard;
import com.skillpilot.backend.api.MemoryPracticeProgress;
import com.skillpilot.backend.api.MemoryPracticeResponse;
import com.skillpilot.backend.api.MemoryPracticeReviewRequest;
import com.skillpilot.backend.api.MemoryPracticeStartRequest;
import com.skillpilot.backend.api.OrientationOutlook;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.ScopeRequest;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
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
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.regex.Pattern;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    public static final String START_MEMORY_PRACTICE = "start_skillpilot_memory_practice";
    public static final String REVIEW_MEMORY_PRACTICE_CARD =
            "review_skillpilot_memory_practice_card";
    public static final String GET_NAVIGATION = "get_skillpilot_navigation";
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
    public static final String ORIENTATION_PATH_ID = "orientationPathId";
    public static final String WORK_FEEDBACK = "workFeedback";
    public static final String OUTCOME_FEEDBACK = "outcomeFeedback";
    public static final String EXAM_EVALUATION_CAPABILITY = "evaluationCapability";
    public static final String EXAM_EARNED_POINTS = "earnedPoints";
    private static final String MEMORY_PRACTICE_REVIEW_CAPABILITY = "reviewCapability";
    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String MEMORY_PRACTICE_CAPABILITY_CONTEXT = "skillpilot-memory-practice-card-v1";
    private static final String EXAM_EVALUATION_CAPABILITY_CONTEXT = "skillpilot-exam-evaluation-v1";
    private static final int MAX_WORK_FEEDBACK_LENGTH = 1_600;
    private static final int MAX_OUTCOME_FEEDBACK_LENGTH = 800;

    private static final Pattern LEARNING_SESSION_PATTERN =
            Pattern.compile("^sps_[A-Za-z0-9_-]{43}$");
    private static final ObjectMapper PUBLIC_OUTPUT_MAPPER = new ObjectMapper();
    private static final Map<String, String> UI_TOOL_RESOURCE_BINDINGS = Map.of(
            RENDER_GOAL_VISUALIZATION,
            OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
            START_MEMORY_PRACTICE,
            OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI);
    private static final List<GoalVisualizationUiResource> GOAL_VISUALIZATION_UI_RESOURCES =
            loadGoalVisualizationUiResources();
    private static final MemoryPracticeUiResource MEMORY_PRACTICE_UI_RESOURCE =
            loadMemoryPracticeWidget(
                    "skillpilot-memory-card-practice-v1-current",
                    OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_URI,
                    OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_RESOURCE_CLASSPATH,
                    OpenAiDeV1ContractMetadata.MEMORY_CARD_PRACTICE_ARTIFACT_SHA256);
    private static final String SERVER_INSTRUCTIONS = """
            You are the SkillPilot learning coach. Before every learner-facing SkillPilot coaching response, establish one fresh full SkillPilot context in the current assistant turn. A successful get_skillpilot_context result does this. A successful state-changing tool result that contains its full successor context also does this because SkillPilot has already revalidated the session and canonical state; use that successor directly and do not call get_skillpilot_context again before its immediate renderer or learner-facing response. Without either successful full result, provide no subject-matter communication. Treat the newest full result's structuredContent as the sole authority for the communication locale, configured curriculum and course profile, scope, active goal, mastery, frontier, task, recall, exam, progress, and next step. Never replace a missing or failed call with generic advice, an invented curriculum, or an invented learning path. A successful render_skillpilot_goal_visualization result is only a UI receipt and never replaces that full context.

            On a normal start, continuation, or resumption, if the newest full context or mutation successor contains an activeGoal, continue that exact goal immediately. A successful mastery result is the one ordering exception: first give both learner-facing texts from completionHandoff as concrete feedback on the completed goal, and only then begin the already activated successor in the same response. Never omit, merge, postpone, or replace either feedback text with the successor introduction. Never call get_skillpilot_navigation or set_skillpilot_active_goal for that already active successor and never wait for another acknowledgement before beginning it. Every goal option from an earlier result or earlier conversation turn is invalidated by that successor.

            The newest communicationLocale returned by SkillPilot is authoritative for all user-facing communication. Respond exclusively in that locale, clearly, encouragingly, and age-appropriately. Never infer or override the response language from these English instructions, tool names, schemas, the host interface locale, OAuth, or the apparent language of a message. Static control metadata is English and is not user-facing content.

            When work begins on a newly confirmed active atomic goal, the first learner-facing content sentence of that goal's section must name the exact activeGoal.title in the communicationLocale, for example “Dein aktuelles Lernziel ist: <Titel>.” or “Your current learning goal is: <title>.” Never substitute activeGoal.description, a paraphrase, or an explanation for that title sentence. After mastery, the mandatory completionHandoff for the previous goal must appear before this new-goal section and is not an explanation of the successor.

            If no current learningSessionId is available, do not call a SkillPilot tool and do not begin teaching. In this narrow case no authoritative session locale exists, so output exactly one matching fixed sentence from the conversation language: German: “Öffne SkillPilot unter https://skillpilot.com/, schließe dort die Lernkonfiguration ab, wähle „Lernen starten“ und verwende die vorbereitete Startnachricht in einem neuen Chat.” English: “Open https://skillpilot.com/, finish the learning setup there, choose “Start learning”, and use the prepared start message in a new chat.” Do not translate either sentence or invent another recovery. Never ask for, accept, repeat, or expose a permanent SkillPilot ID, PIN, password, or OAuth value in chat. OAuth authorizes only the App connection and never selects a learner or learning session.

            The SkillPilot start message contains exactly one short-lived learning session. Copy it unchanged and send it on every subject-matter tool call only in the learningSessionId argument. Never reuse a value from an older start message. Never derive the session from OAuth, conversation content, or another ID. Do not repeat it in responses or ask the learner to copy or re-enter it.

            Do not mention tool, API, JSON, or field names to the learner, and do not expose technical IDs. Never reveal or request OAuth tokens, connection subjects, permanent SkillPilot IDs, or other secrets. Do not comment didactically on setup, workflow ordering, or persistence; once teaching is permitted, keep the learner-facing focus exclusively on learning. Use backend URLs verbatim only; never construct links from IDs or append tokens. If no approved link is available, do not output a link. Write mathematics only with \\(...\\) inline or \\[...\\] displayed, never with dollar delimiters.

            When interactionMode=orientation, do not conduct a subject-matter assessment. After the exact goal-title sentence, use orientationOutlook as the sole authoritative map of the material ahead: briefly present every supplied path, what the learner will actually learn along it, its representative later milestones, and where that knowledge is practically useful. Do not invent, add, merge, or substitute paths, applications, or follow-on topics. If orientationOutlook is absent, stay general about the active orientation goal and only offer to continue directly. Then ask a low-threshold question about which supplied path sparks curiosity or whether the learner wants to continue. A reply that merely names one path starts the motivational dialogue; it is not completion evidence and not a request to leave the active goal. Map a free-form interest to a path only when exactly one supplied path clearly matches it; otherwise ask which supplied path the learner means and never guess a pathId. Take up that exact path, connect two to four of its supplied milestones to its supplied practical contexts, and ask one active personal follow-up with no technically right or wrong answer. Do not test prior knowledge, terms, procedures, details, correctness, transfer, recall, or Feynman teach-back. Save orientation completion only after the learner meaningfully engages with that tailored follow-up or explicitly asks to continue directly; a content-free acknowledgement alone is not sufficient. When completing a selected path, pass its exact pathId unchanged as orientationPathId. SkillPilot activates the path's first reviewed entry only when it is currently available; otherwise completion still succeeds and the normal available foundations return without an active goal. Omit orientationPathId only when the learner explicitly chose to continue without selecting a path. A generic acknowledgement followed immediately by unrelated next-goal options is forbidden. Orientation is only a completion marker and never certifies subject mastery.

            For ordinary content goals, coach dialogically on exactly one confirmed atomic goal. After the exact goal-title sentence, briefly check prior knowledge, connect the next hint or explanation explicitly to the learner's answer, provide small hints, and let the learner work. Do not reveal the solution to the immediate next task; if a mini-example is needed, the following exercise must use a different case or wording. Use one to three tasks and require intermediate steps or justification. For goals explicitly marked for visual, graph, or GeoGebra work, use a supplied visible resource and learner interaction rather than pure text. Assess meaning rather than wording and fully accept equivalent correct results, representations, justifications, and alternative methods; explicit format, unit, percentage, justification, and other criteria remain binding. Save mastery only for the active content goal after exactly two independent checks or genuine multi-step transfer in a changed context, covering every aspect. On that call, workFeedback must assess the learner's visible reasoning or approach and outcomeFeedback must state the accepted result or conclusion; generic praise is insufficient. After success, present both returned texts before introducing the successor. If competence has not yet been demonstrated, stay on the same active goal and continue with one short additional question, targeted hint or substep, or a suitable new exercise; after an error, require correction and fresh evidence. Self-assessment, repetition, or the same worked case is insufficient. Never manually master clusters or memorisation goals.

            When the newest full result is get_skillpilot_context or a successful state-changing result containing its full successor context, that full context contains goalVisualization, and its nextAllowedTools permits render_skillpilot_goal_visualization, form a pair from that context's goalVisualization.goalId and the authorizing result's top-level stateVersion. For every previously unseen pair, even if a different pair was rendered earlier in this conversation, call the renderer once as the immediate next tool, copying the pair to goalId and expectedStateVersion. A repeated pair creates no automatic call. Only an explicit learner request to show the current image again creates one new one-shot call after a fresh qualifying result; never retry otherwise. Do not insert get_skillpilot_context or another SkillPilot tool before the required renderer. The renderer result is only a UI receipt. Never claim display, invent image details, expose image URLs or metadata, or use the image as evidence.

            For a memory goal, keep normal flashcard learning and Verified Recall strictly separate. The published normal-practice option uses the exact action start_skillpilot_memory_practice. Treat the exact localized option label “Karteikarten lernen” or “Learn with flashcards”, and any unambiguous equivalent request, as confirmation of that option. When the newest full context permits start_skillpilot_memory_practice, call it exactly once as the immediate next action with the confirmed activeGoal.goalId and stateVersion, before any learner-facing response. Never infer that the component is unavailable and never replace this required call pre-emptively with a Cockpit link. Its dedicated component alone may reveal card fronts and backs and call review_skillpilot_memory_practice_card. Never call the review tool from ordinary coach dialogue, reproduce or answer the private card content in the transcript, infer a rating, or claim that the host displayed the component. The component may navigate locally through the supplied bounded card batch without any tool call or state change. It records exactly not_known or known for an explicitly rated card; that updates only the card's repetition schedule. After its loaded batch is exhausted, only the component may call start_skillpilot_memory_practice again with the newest stateVersion to load another private batch. Normal flashcard learning never certifies mastery, completes the active goal, or substitutes for Verified Recall. When no cards are due, say only that flashcard learning is complete for today and offer the separate strict learning-coach check if appropriate. Offer the supplied activeGoal.cockpitUrl verbatim as the fallback for flashcard learning only when the start tool actually returns an error, the newest context does not permit it, or the learner explicitly asks for the Cockpit. For the learner-visible German wording, say „Karteikarten lernen“ or „Karteikartenlernen“, never „SRS-Kartendrill“.

            In exam mode, reproduce taskContent verbatim except for replacing dollar TeX delimiters. If activeGoal.exam.hasImage=true, provide activeGoal.cockpitUrl verbatim before the task and state in the session communication locale that the image is there; do not invent or describe it. Give no hints, partial answers, solutions, scaffolds, or follow-up questions. Wait for a complete visible submission, then call get_skillpilot_exam_evaluation. Assess visible work criterion by criterion; the sample solution does not prescribe wording. Equivalent approaches receive full credit. Identify unreadable content without inventing an error. Save mastery only after a final pass with at least passingPoints, copying evaluationCapability unchanged and passing earnedPoints plus concrete workFeedback and outcomeFeedback. Present the returned feedback and score before introducing the successor.

            For Verified Recall, show the full question batch and wait for all answers. Fetch each expected answer only after the corresponding learner answer, accept technically equivalent wording, and save each card immediately; passed=true only for a correct answer without help. Save all cards before the next batch, check a card at most once per day, and do not save additional manual mastery.

            Treat natural multi-part learning requests as continuing intent, but mutate only through an option in the newest context. Claim a state change only after confirmed success. After a 409 conflict, reload exactly once. SESSION_REQUIRED, SESSION_RENEWAL_REQUIRED, SESSION_VERSION_UNAVAILABLE, or an unfinished web configuration permit no further subject-matter response: use the returned server-owned startUrl and instruction unchanged. When the error instead supplies the closed instructions.de/instructions.en map, choose the entry matching the last authoritative session locale, or only when no session locale exists the conversation language. Tell the learner to finish or renew the setup in SkillPilot, choose “Lernen starten” or “Start learning”, and continue with the newly prepared message in a new chat. Do not translate or invent technical recovery, retry the old session, request an ID in chat, or demand a new OAuth connection. On authentication, schema, persistence, or repeated conflict failures, stop structured actions transparently; never guess or promise later persistence.
            """;

    private final CoachToolFacade coachTools;
    private final CoachStateProjection stateProjection;
    private final OpenAiDeCoachIdentityResolver identityResolver;
    private final OpenAiDeMcpTelemetry telemetry;
    private final OpenAiDeV1McpSessionCoordinator sessionCoordinator;
    private final OpenAiDeCoachContextProjector contextProjector;
    private final String sessionStartUrl;
    private final byte[] capabilitySecret;
    private final List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications;
    private final List<McpStatelessServerFeatures.SyncResourceSpecification> resourceSpecifications;

    @Autowired
    public OpenAiDeV1McpContractAdapter(
            CoachToolFacade coachTools,
            CoachStateProjection stateProjection,
            OpenAiDeCoachIdentityResolver identityResolver,
            OpenAiDeMcpTelemetry telemetry,
            OpenAiDeV1McpSessionCoordinator sessionCoordinator,
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl,
            @Value("${skillpilot.openai.coach.v1.server-build:dev}") String serverBuild,
            @Value("${skillpilot.security.signing-secret:default-insecure-secret-change-me}")
                    String signingSecret) {
        this.coachTools = coachTools;
        this.stateProjection = stateProjection;
        this.identityResolver = identityResolver;
        this.telemetry = telemetry;
        this.sessionCoordinator = sessionCoordinator;
        this.contextProjector = new OpenAiDeCoachContextProjector(
                stateProjection,
                publicBaseUrl,
                serverBuild);
        this.sessionStartUrl = normalizePublicBaseUrl(publicBaseUrl);
        this.capabilitySecret = signingSecret.getBytes(StandardCharsets.UTF_8);
        this.toolSpecifications = buildToolSpecifications();
        this.resourceSpecifications = buildResourceSpecifications();
    }

    public OpenAiDeV1McpContractAdapter(
            CoachToolFacade coachTools,
            CoachStateProjection stateProjection,
            OpenAiDeCoachIdentityResolver identityResolver,
            OpenAiDeMcpTelemetry telemetry,
            OpenAiDeV1McpSessionCoordinator sessionCoordinator,
            String publicBaseUrl,
            String signingSecret) {
        this(
                coachTools,
                stateProjection,
                identityResolver,
                telemetry,
                sessionCoordinator,
                publicBaseUrl,
                null,
                signingSecret);
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
        this.capabilitySecret =
                "skillpilot-memory-practice-test-secret".getBytes(StandardCharsets.UTF_8);
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
            List<OpenAiDeCoachContext.Option> options,
            String instruction) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record GoalVisualizationRenderResult(
            OpenAiDeCoachContext.GoalVisualization goalVisualization) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record MemoryPracticeReceipt(
            String status,
            String goalId,
            String goalTitle,
            MemoryPracticeProgress progress,
            boolean completed) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record CompletionHandoff(
            String completedGoalId,
            String completedGoalTitle,
            String workFeedback,
            String outcomeFeedback,
            Double earnedPoints,
            Double maxPoints,
            String successorGoalTitle,
            String instruction,
            boolean successorEvidenceReset) {
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record MasteryToolResult(
            String status,
            String savedGoalId,
            Double savedMastery,
            CompletionHandoff completionHandoff,
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
            String evaluationCapability,
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
                        "Required to start or refresh a SkillPilot coaching turn before the learner-facing response "
                                + "unless this turn already has a successful state-changing result containing its full "
                                + "successor context. It verifies the current learning session, including the one-hour "
                                + "remaining-lifetime guard, and loads the authoritative configured learning context "
                                + "and communication locale. Do not call it redundantly after such a fresh mutation "
                                + "successor. Without either successful full result, subject-matter SkillPilot "
                                + "communication is forbidden. Never replace the required full result with generic "
                                + "advice, a self-created curriculum, or invented goals. Do not use this tool for "
                                + "general subject questions unrelated to SkillPilot.",
                        emptyObjectSchema(),
                        contextSchema(),
                        true,
                        true,
                        false,
                        this::getContext),
                tool(
                        RENDER_GOAL_VISUALIZATION,
                        "Display the learning-goal image",
                        "When the newest full result is get_skillpilot_context or a successful state-changing "
                                + "result containing its full successor context, that full context contains "
                                + "goalVisualization, and its nextAllowedTools permits this tool, form a pair from "
                                + "that context's goalVisualization.goalId and the authorizing result's top-level "
                                + "stateVersion. For every previously unseen pair, even if a different pair was "
                                + "rendered earlier in this conversation, call this renderer once as the immediate "
                                + "next tool, copying the pair to goalId and expectedStateVersion. A repeated pair "
                                + "creates no automatic call. Only an explicit learner request to show the current "
                                + "image again creates one new one-shot call after a fresh qualifying result; never "
                                + "retry otherwise. Never insert get_skillpilot_context or another "
                                + "SkillPilot tool after the authorizing result, call after a newer SkillPilot result, "
                                + "or use different values. It does not change state.",
                        objectSchema(
                                Map.of(
                                        "goalId", modelFacingOpaqueReferenceSchema(),
                                        EXPECTED_STATE_VERSION, integerSchema(0, null)),
                                List.of("goalId", EXPECTED_STATE_VERSION)),
                        goalVisualizationRenderSchema(),
                        true,
                        true,
                        false,
                        this::renderGoalVisualization),
                tool(
                        START_MEMORY_PRACTICE,
                        "Learn with flashcards in the chat",
                        "Starts the dedicated flashcard-learning component for the confirmed active memory goal. "
                                + "The published option action is this exact tool name. When the learner replies "
                                + "with the localized option label or an unambiguous equivalent request and the "
                                + "newest context permits this tool, call it exactly once as the immediate next "
                                + "action before any learner-facing response. Do not infer that the component is "
                                + "unavailable and do not substitute a Cockpit link before attempting this call. "
                                + "Copy goalId and expectedStateVersion from the newest full SkillPilot context. "
                                + "The component may call it again only after its private bounded batch is "
                                + "exhausted, using the newest stateVersion. This is normal spaced-repetition "
                                + "practice, not a mastery check. Never "
                                + "read, reveal, rate, or answer the card in ordinary coach dialogue.",
                        objectSchema(
                                Map.of(
                                        "goalId", modelFacingOpaqueReferenceSchema(),
                                        EXPECTED_STATE_VERSION, integerSchema(0, null)),
                                List.of("goalId", EXPECTED_STATE_VERSION)),
                        memoryPracticeReceiptSchema(),
                        true,
                        true,
                        false,
                        this::startMemoryPractice),
                tool(
                        REVIEW_MEMORY_PRACTICE_CARD,
                        "Save one flashcard repetition rating",
                        "App-only write used by the dedicated flashcard component after the learner revealed and "
                                + "rated exactly the currently displayed card. Ordinary coach dialogue must never "
                                + "call this tool or infer a rating. Rating is exactly not_known or known. Local "
                                + "previous/next navigation never calls this tool and never changes state. This "
                                + "updates only the rated card's repetition "
                                + "schedule and never marks the memory goal as mastered.",
                        objectSchema(
                                Map.of(
                                        "goalId", modelFacingOpaqueReferenceSchema(),
                                        "cardId", modelFacingOpaqueReferenceSchema(),
                                        "rating", enumStringSchema("not_known", "known"),
                                        MEMORY_PRACTICE_REVIEW_CAPABILITY, modelFacingOpaqueReferenceSchema()),
                                List.of(
                                        "goalId",
                                        "cardId",
                                        "rating",
                                        MEMORY_PRACTICE_REVIEW_CAPABILITY)),
                        memoryPracticeReceiptSchema(),
                        false,
                        true,
                        true,
                        this::reviewMemoryPracticeCard),
                tool(
                        GET_NAVIGATION,
                        "Load navigation options",
                        "Loads options only after the learner explicitly requests a change. Never call it for a "
                                + "normal start, continuation, or resumption. target is exactly scope or goal. scope "
                                + "returns focus clusters, never next "
                                + "learning goals. When an active goal exists, target=goal returns no choices unless "
                                + "redirect=true, which is allowed only when the learner explicitly requests a "
                                + "different goal. It does not change state.",
                        objectSchema(
                                Map.of(
                                        "target", enumStringSchema("scope", "goal"),
                                        "redirect", booleanSchema()),
                                List.of("target")),
                        navigationSchema(),
                        true,
                        true,
                        false,
                        this::getNavigation),
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
                        "Finalize evaluated learning goal",
                        "Completes exactly the confirmed active atomic goal with the technical value 1.0. Every "
                                + "call must carry two concrete learner-facing feedback texts about the work just "
                                + "completed: workFeedback assesses the reasoning or approach, and outcomeFeedback "
                                + "states the accepted result or conclusion. If either cannot be written from visible "
                                + "evidence, do not call this tool. After success, first present both texts from "
                                + "completionHandoff, then begin the exact successor from context.activeGoal in the "
                                + "same response; never load navigation or set that goal again. "
                                + "For interactionMode=orientation, use orientationOutlook as the complete authoritative "
                                + "learning map. A reply that merely names one supplied path starts the tailored "
                                + "motivational follow-up and must not call this tool. Resolve a free-form interest "
                                + "to a path only when the match is unique; otherwise ask which path was meant. "
                                + "First connect two to four "
                                + "supplied milestones from that path to its supplied practical contexts, ask one "
                                + "active non-assessing follow-up, and wait for meaningful engagement. Call only "
                                + "after that engagement or an explicit request to continue directly; a content-free "
                                + "acknowledgement alone is insufficient. When a path was selected, pass "
                                + "its exact pathId unchanged as orientationPathId. SkillPilot activates its first "
                                + "reviewed entry only when currently available; otherwise completion succeeds and "
                                + "the normal available foundations return without an active goal. Omit it only for "
                                + "an explicit direct continuation. "
                                + "Do not invent content, test "
                                + "details, jump straight to unrelated frontier options, or claim subject mastery. "
                                + "For ordinary content goals, call only after two independent visible checks or "
                                + "genuine multi-step transfer in a changed context covering all aspects. Never use "
                                + "for clusters, memorisation/SRS goals, self-assessment, repetition, or the same "
                                + "worked case. For exam goals, first call get_skillpilot_exam_evaluation. Copy its "
                                + "evaluationCapability unchanged, pass earnedPoints from the completed rubric, and "
                                + "call only when earnedPoints reaches passingPoints.",
                        objectSchema(
                                Map.of(
                                        "goalId", modelFacingOpaqueReferenceSchema(),
                                        ORIENTATION_PATH_ID, boundedNonEmptyStringSchema(320),
                                        WORK_FEEDBACK, describedSchema(
                                                stringSchema(),
                                                "Concrete learner-facing feedback on the visible reasoning, approach, "
                                                        + "or meaningful orientation contribution, written in the "
                                                        + "authoritative communicationLocale. This exact text is returned "
                                                        + "before any successor goal."),
                                        OUTCOME_FEEDBACK, describedSchema(
                                                stringSchema(),
                                                "Clear learner-facing statement of the accepted result, conclusion, or "
                                                        + "orientation completion, written in the authoritative "
                                                        + "communicationLocale. This exact text is returned before any "
                                                        + "successor goal."),
                                        EXAM_EVALUATION_CAPABILITY, modelFacingOpaqueReferenceSchema(),
                                        EXAM_EARNED_POINTS, numberSchema(0.0, Double.MAX_VALUE)),
                                List.of("goalId", WORK_FEEDBACK, OUTCOME_FEEDBACK)),
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
                                + "a complete visible submission. It returns the evaluationCapability required by "
                                + "set_skillpilot_mastery after a passing final assessment. Never ask follow-up "
                                + "questions in exam mode.",
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
        String uiResourceUri = UI_TOOL_RESOURCE_BINDINGS.get(name);
        if (uiResourceUri != null) {
            meta.put(
                    "ui",
                    Map.of("resourceUri", uiResourceUri));
            meta.put("openai/outputTemplate", uiResourceUri);
        } else if (REVIEW_MEMORY_PRACTICE_CARD.equals(name)) {
            // The rating write is available only to the dedicated card
            // component and must never be selected by the model.
            meta.put("ui", Map.of("visibility", List.of("app")));
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
        List<McpStatelessServerFeatures.SyncResourceSpecification> resources = new ArrayList<>();
        GOAL_VISUALIZATION_UI_RESOURCES.stream()
                .map(uiResource -> goalVisualizationResourceSpecification(uiResource, meta))
                .forEach(resources::add);
        resources.add(memoryPracticeResourceSpecification(
                MEMORY_PRACTICE_UI_RESOURCE,
                memoryPracticeResourceMeta()));
        return List.copyOf(resources);
    }

    private McpStatelessServerFeatures.SyncResourceSpecification goalVisualizationResourceSpecification(
            GoalVisualizationUiResource uiResource,
            Map<String, Object> meta) {
        McpSchema.Resource resource = McpSchema.Resource.builder(
                        uiResource.uri(),
                        uiResource.name())
                .title("SkillPilot learning-goal image")
                .description("Displays the approved image for the active atomic learning goal.")
                .mimeType(OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE)
                .meta(meta)
                .build();
        return new McpStatelessServerFeatures.SyncResourceSpecification(
                resource,
                (transportContext, request) -> readGoalVisualizationResource(uiResource, meta, request));
    }

    private McpSchema.ReadResourceResult readGoalVisualizationResource(
            GoalVisualizationUiResource uiResource,
            Map<String, Object> meta,
            McpSchema.ReadResourceRequest request) {
        String requestedUri = request == null ? null : request.uri();
        Supplier<McpSchema.ReadResourceResult> read = () -> {
            if (!uiResource.uri().equals(requestedUri)) {
                throw new IllegalArgumentException("Unknown SkillPilot MCP UI resource.");
            }
            McpSchema.TextResourceContents contents =
                    new McpSchema.TextResourceContents(
                            uiResource.uri(),
                            OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE,
                            uiResource.html(),
                            meta);
            return new McpSchema.ReadResourceResult(List.of(contents));
        };
        return telemetry == null ? read.get() : telemetry.recordResourceRead(requestedUri, read);
    }

    private McpStatelessServerFeatures.SyncResourceSpecification memoryPracticeResourceSpecification(
            MemoryPracticeUiResource uiResource,
            Map<String, Object> meta) {
        McpSchema.Resource resource = McpSchema.Resource.builder(
                        uiResource.uri(),
                        uiResource.name())
                .title("SkillPilot flashcard learning")
                .description("Interactive, private flashcard practice for the active memory goal.")
                .mimeType(OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE)
                .meta(meta)
                .build();
        return new McpStatelessServerFeatures.SyncResourceSpecification(
                resource,
                (transportContext, request) -> readMemoryPracticeResource(uiResource, meta, request));
    }

    private McpSchema.ReadResourceResult readMemoryPracticeResource(
            MemoryPracticeUiResource uiResource,
            Map<String, Object> meta,
            McpSchema.ReadResourceRequest request) {
        String requestedUri = request == null ? null : request.uri();
        Supplier<McpSchema.ReadResourceResult> read = () -> {
            if (!uiResource.uri().equals(requestedUri)) {
                throw new IllegalArgumentException("Unknown SkillPilot memory-practice MCP UI resource.");
            }
            McpSchema.TextResourceContents contents = new McpSchema.TextResourceContents(
                    uiResource.uri(),
                    OpenAiDeV1ContractMetadata.MCP_APP_RESOURCE_MIME_TYPE,
                    uiResource.html(),
                    meta);
            return new McpSchema.ReadResourceResult(List.of(contents));
        };
        return telemetry == null ? read.get() : telemetry.recordResourceRead(requestedUri, read);
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

    private Map<String, Object> memoryPracticeResourceMeta() {
        Map<String, Object> csp = Map.of(
                "redirectDomains", List.of("https://skillpilot.com"));
        Map<String, Object> ui = Map.of(
                "domain", OpenAiDeV1ContractMetadata.WIDGET_DOMAIN,
                "prefersBorder", true,
                "csp", csp);
        return Map.of(
                "ui", ui,
                "openai/widgetDescription",
                        "Interactive SkillPilot flashcard learning for the active memory goal.",
                "openai/widgetDomain", OpenAiDeV1ContractMetadata.WIDGET_DOMAIN,
                "openai/widgetPrefersBorder", true,
                "openai/widgetCSP", Map.of(
                        "resource_domains", List.of(),
                        "redirect_domains", List.of("https://skillpilot.com")));
    }

    /**
     * Loads the active widget plus every immutable predecessor. Historical
     * resources remain passive: only the active URI is bound to the tool.
     */
    private static List<GoalVisualizationUiResource> loadGoalVisualizationUiResources() {
        List<GoalVisualizationUiResource> resources = new ArrayList<>();
        resources.add(loadGoalVisualizationWidget(
                "skillpilot-goal-visualization-v1-current",
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_URI,
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_RESOURCE_CLASSPATH,
                OpenAiDeV1ContractMetadata.GOAL_VISUALIZATION_ARTIFACT_SHA256));
        resources.add(loadGoalVisualizationWidget(
                "skillpilot-goal-visualization-v1-legacy-1.0.0",
                OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_RESOURCE_URI,
                OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_RESOURCE_CLASSPATH,
                OpenAiDeV1ContractMetadata.LEGACY_GOAL_VISUALIZATION_ARTIFACT_SHA256));
        for (String sha256 : OpenAiDeV1ContractMetadata.RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S) {
            resources.add(loadGoalVisualizationWidget(
                    "skillpilot-goal-visualization-v1-retained-" + sha256.substring(0, 8),
                    OpenAiDeV1ContractMetadata.goalVisualizationResourceUri(sha256),
                    OpenAiDeV1ContractMetadata.retainedGoalVisualizationResourceClasspath(sha256),
                    sha256));
        }
        long distinctUris = resources.stream().map(GoalVisualizationUiResource::uri).distinct().count();
        if (distinctUris != resources.size()) {
            throw new IllegalStateException(
                    "Duplicate SkillPilot MCP UI resource URI: active and historical resources must remain distinct.");
        }
        return List.copyOf(resources);
    }

    private static GoalVisualizationUiResource loadGoalVisualizationWidget(
            String name,
            String uri,
            String classpath,
            String expectedSha256) {
        try (InputStream input = OpenAiDeV1McpContractAdapter.class.getResourceAsStream(classpath)) {
            if (input == null) {
                throw new IllegalStateException("Missing SkillPilot goal-visualization MCP UI bundle " + classpath + ".");
            }
            byte[] bytes = input.readAllBytes();
            String actualSha256 = HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(bytes));
            if (!expectedSha256.equals(actualSha256)) {
                throw new IllegalStateException(
                        "SkillPilot goal-visualization MCP UI hash mismatch for "
                                + classpath
                                + ": expected "
                                + expectedSha256
                                + ", got "
                                + actualSha256
                                + ".");
            }
            return new GoalVisualizationUiResource(
                    name,
                    uri,
                    new String(bytes, StandardCharsets.UTF_8));
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not read SkillPilot goal-visualization MCP UI bundle " + classpath + ".",
                    exception);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("JVM does not provide SHA-256.", exception);
        }
    }

    private record GoalVisualizationUiResource(String name, String uri, String html) {}

    private static MemoryPracticeUiResource loadMemoryPracticeWidget(
            String name,
            String uri,
            String classpath,
            String expectedSha256) {
        try (InputStream input = OpenAiDeV1McpContractAdapter.class.getResourceAsStream(classpath)) {
            if (input == null) {
                throw new IllegalStateException(
                        "Missing SkillPilot memory-practice MCP UI bundle " + classpath + ".");
            }
            byte[] bytes = input.readAllBytes();
            String actualSha256 = HexFormat.of().formatHex(
                    MessageDigest.getInstance("SHA-256").digest(bytes));
            if (!expectedSha256.equals(actualSha256)) {
                throw new IllegalStateException(
                        "SkillPilot memory-practice MCP UI hash mismatch for "
                                + classpath
                                + ": expected "
                                + expectedSha256
                                + ", got "
                                + actualSha256
                                + ".");
            }
            return new MemoryPracticeUiResource(
                    name,
                    uri,
                    new String(bytes, StandardCharsets.UTF_8));
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "Could not read SkillPilot memory-practice MCP UI bundle " + classpath + ".",
                    exception);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("JVM does not provide SHA-256.", exception);
        }
    }

    private record MemoryPracticeUiResource(String name, String uri, String html) {}

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
        long expectedStateVersion = requiredLong(arguments, EXPECTED_STATE_VERSION);
        if (metadata == null) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INTERNAL_ERROR,
                    "The learning-goal image could not be verified against the current session state. "
                            + "Continue without the image and do not retry it automatically.",
                    null,
                    Map.of(
                            "instruction",
                            "Continue without the image and do not retry it automatically."));
        }
        if (expectedStateVersion != metadata.stateVersion()) {
            String instruction = localized(metadata,
                    "Der Lernstand hat sich seit der Bildfreigabe geändert. Lade den aktuellen SkillPilot-Kontext "
                            + "genau einmal neu und versuche dieses Bild nicht automatisch erneut.",
                    "The learning state changed after the image was authorized. Reload the current SkillPilot context "
                            + "exactly once and do not retry this image automatically.");
            return errorResult(
                    OpenAiDeV1ErrorCode.STATE_VERSION_CONFLICT,
                    instruction,
                    metadata,
                    Map.of(
                            "reloadContextAtMostOnce", true,
                            "instruction", instruction));
        }
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

    private McpSchema.CallToolResult startMemoryPractice(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        String goalId = requiredString(arguments, "goalId");
        long expectedStateVersion = requiredLong(arguments, EXPECTED_STATE_VERSION);
        McpSchema.CallToolResult stateError = validateUiReadStateVersion(
                expectedStateVersion,
                metadata,
                localized(metadata,
                        "Der Lernstand hat sich seit der Auswahl des Karteikartenlernens geändert. Lade den aktuellen "
                                + "SkillPilot-Kontext genau einmal neu.",
                        "The learning state changed after flashcard learning was selected. Reload the current "
                                + "SkillPilot context exactly once."));
        if (stateError != null) {
            return stateError;
        }
        UnifiedLearnerStateResponse rawState = coachTools.getLearnerState(skillpilotId);
        FrontierGoal rawActiveGoal = activeGoal(rawState);
        OpenAiDeCoachContext context = projectContext(skillpilotId, rawState, metadata);
        OpenAiDeCoachContext.ActiveGoal activeGoal = context == null ? null : context.activeGoal();
        if (activeGoal == null
                || !goalId.equals(activeGoal.goalId())
                || rawActiveGoal == null
                || !goalId.equals(rawActiveGoal.id())
                || !isMemoryGoal(rawActiveGoal)) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    localized(metadata,
                            "Karteikartenlernen ist nur für das bestätigte aktive Lernkartenziel verfügbar.",
                            "Flashcard learning is available only for the confirmed active memory goal."),
                    metadata);
        }
        MemoryPracticeResponse response = coachTools.startMemoryPractice(
                skillpilotId,
                communicationLanguage(metadata),
                new MemoryPracticeStartRequest(goalId));
        return memoryPracticeResult(
                response,
                activeGoal.cockpitUrl(),
                metadata,
                true,
                requiredLearningSessionId(arguments));
    }

    private McpSchema.CallToolResult reviewMemoryPracticeCard(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        String goalId = requiredString(arguments, "goalId");
        UnifiedLearnerStateResponse rawState = coachTools.getLearnerState(skillpilotId);
        FrontierGoal rawActiveGoal = activeGoal(rawState);
        OpenAiDeCoachContext context = projectContext(skillpilotId, rawState, metadata);
        OpenAiDeCoachContext.ActiveGoal activeGoal = context == null ? null : context.activeGoal();
        if (activeGoal == null
                || !goalId.equals(activeGoal.goalId())
                || rawActiveGoal == null
                || !goalId.equals(rawActiveGoal.id())
                || !isMemoryGoal(rawActiveGoal)) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    localized(metadata,
                            "Die Karte gehört nicht zum bestätigten aktiven Lernkartenziel.",
                            "The card does not belong to the confirmed active memory goal."),
                    metadata);
        }
        String cardId = requiredString(arguments, "cardId");
        String learningSessionId = requiredLearningSessionId(arguments);
        String reviewCapability = requiredString(arguments, MEMORY_PRACTICE_REVIEW_CAPABILITY);
        if (!verifyMemoryPracticeReviewCapability(
                reviewCapability,
                learningSessionId,
                goalId,
                cardId)) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    localized(metadata,
                            "Diese Kartenbewertung gehört nicht zum ausgegebenen Karteikartenstapel.",
                            "This card rating is not authorized by the issued flashcard batch."),
                    metadata);
        }
        MemoryPracticeResponse response = coachTools.reviewMemoryPracticeCard(
                skillpilotId,
                communicationLanguage(metadata),
                new MemoryPracticeReviewRequest(
                        goalId,
                        cardId,
                        requiredString(arguments, "rating")));
        return memoryPracticeResult(
                response,
                activeGoal.cockpitUrl(),
                metadata,
                false,
                learningSessionId);
    }

    private McpSchema.CallToolResult validateUiReadStateVersion(
            long expectedStateVersion,
            OpenAiDeV1SessionMetadata metadata,
            String conflictInstruction) {
        if (metadata == null) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INTERNAL_ERROR,
                    "The UI action could not be verified against the current learning-session state.",
                    null);
        }
        if (expectedStateVersion == metadata.stateVersion()) {
            return null;
        }
        return errorResult(
                OpenAiDeV1ErrorCode.STATE_VERSION_CONFLICT,
                conflictInstruction,
                metadata,
                Map.of(
                        "reloadContextAtMostOnce", true,
                        "instruction", conflictInstruction));
    }

    private McpSchema.CallToolResult memoryPracticeResult(
            MemoryPracticeResponse response,
            String cockpitUrl,
            OpenAiDeV1SessionMetadata metadata,
            boolean includePrivateBatch,
            String learningSessionId) {
        if (response == null || response.progress() == null) {
            throw new IllegalStateException("Memory practice returned no progress.");
        }
        boolean completed = "complete".equals(response.status()) || response.cards().isEmpty();
        MemoryPracticeReceipt receipt = new MemoryPracticeReceipt(
                response.status(),
                response.goalId(),
                response.goalTitle(),
                response.progress(),
                completed);
        Map<String, Object> componentData = new LinkedHashMap<>();
        componentData.put("communicationLocale", communicationLocale(metadata));
        componentData.put(LEARNING_SESSION_ID, learningSessionId);
        componentData.put("goalId", response.goalId());
        componentData.put("goalTitle", response.goalTitle());
        componentData.put("progress", Map.of(
                "total", response.progress().totalCards(),
                "due", response.progress().dueCards(),
                "scheduled", response.progress().scheduledCards()));
        componentData.put("completed", completed);
        if (cockpitUrl != null && !cockpitUrl.isBlank()) {
            componentData.put("cockpitUrl", cockpitUrl);
        }
        if (includePrivateBatch) {
            List<Map<String, Object>> cards = new ArrayList<>();
            for (MemoryPracticeCard card : response.cards()) {
                Map<String, Object> cardData = new LinkedHashMap<>();
                cardData.put("id", card.cardId());
                cardData.put(
                        MEMORY_PRACTICE_REVIEW_CAPABILITY,
                        memoryPracticeReviewCapability(
                                learningSessionId,
                                response.goalId(),
                                card.cardId()));
                cardData.put("front", card.front());
                cardData.put("back", card.back());
                if (card.category() != null && !card.category().isBlank()) {
                    cardData.put("category", card.category());
                }
                cards.add(Map.copyOf(cardData));
            }
            componentData.put("cardBatch", Map.of(
                    "cards", List.copyOf(cards),
                    "initialIndex", 0,
                    "totalDueCards", response.progress().dueCards(),
                    "hasMore", response.progress().dueCards() > cards.size()));
        }
        return successResult(
                completed
                        ? localized(metadata,
                                "Für heute sind keine Karteikarten mehr fällig. Das Lernkartenziel wurde dadurch "
                                        + "nicht als beherrscht markiert.",
                                "No more flashcards are due today. This did not mark the memory goal as mastered.")
                        : localized(metadata,
                                "Karteikartenlernen in der eigenen Komponente bereitgestellt.",
                                "Flashcard learning provided in its dedicated component."),
                receipt,
                Map.of("skillpilotMemoryCard", Map.copyOf(componentData)));
    }

    private String memoryPracticeReviewCapability(
            String learningSessionId,
            String goalId,
            String cardId) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(memoryPracticeCapabilityBytes(learningSessionId, goalId, cardId));
    }

    private boolean verifyMemoryPracticeReviewCapability(
            String capability,
            String learningSessionId,
            String goalId,
            String cardId) {
        try {
            byte[] supplied = Base64.getUrlDecoder().decode(capability);
            return MessageDigest.isEqual(
                    supplied,
                    memoryPracticeCapabilityBytes(learningSessionId, goalId, cardId));
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private byte[] memoryPracticeCapabilityBytes(
            String learningSessionId,
            String goalId,
            String cardId) {
        return capabilityBytes(
                MEMORY_PRACTICE_CAPABILITY_CONTEXT,
                learningSessionId,
                goalId,
                cardId);
    }

    private String examEvaluationCapability(
            String learningSessionId,
            String goalId,
            OpenAiDeV1SessionMetadata metadata) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(examEvaluationCapabilityBytes(learningSessionId, goalId, metadata));
    }

    private boolean verifyExamEvaluationCapability(
            String capability,
            String learningSessionId,
            String goalId,
            OpenAiDeV1SessionMetadata metadata) {
        try {
            byte[] supplied = Base64.getUrlDecoder().decode(capability);
            return MessageDigest.isEqual(
                    supplied,
                    examEvaluationCapabilityBytes(learningSessionId, goalId, metadata));
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    private byte[] examEvaluationCapabilityBytes(
            String learningSessionId,
            String goalId,
            OpenAiDeV1SessionMetadata metadata) {
        if (metadata == null) {
            throw new IllegalStateException("Exam evaluation capability requires session metadata.");
        }
        return capabilityBytes(
                EXAM_EVALUATION_CAPABILITY_CONTEXT,
                learningSessionId,
                goalId,
                Long.toString(metadata.stateVersion()),
                metadata.curriculumRevision());
    }

    private byte[] capabilityBytes(String context, String... frames) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(capabilitySecret, HMAC_ALGORITHM));
            updateCapabilityFrame(mac, context);
            for (String frame : frames) {
                updateCapabilityFrame(mac, frame == null ? "" : frame);
            }
            return mac.doFinal();
        } catch (Exception exception) {
            throw new IllegalStateException("Could not protect an MCP capability.", exception);
        }
    }

    private static void updateCapabilityFrame(Mac mac, String value) {
        byte[] bytes = value.getBytes(StandardCharsets.UTF_8);
        mac.update((byte) (bytes.length >>> 24));
        mac.update((byte) (bytes.length >>> 16));
        mac.update((byte) (bytes.length >>> 8));
        mac.update((byte) bytes.length);
        mac.update(bytes);
    }

    private McpSchema.CallToolResult getNavigation(
            String skillpilotId,
            Map<String, Object> arguments,
            OpenAiDeV1SessionMetadata metadata) {
        String target = requiredString(arguments, "target").toLowerCase(Locale.ROOT);
        Boolean redirect = optionalBoolean(arguments, "redirect");
        if (redirect != null && !"goal".equals(target)) {
            throw new IllegalArgumentException("redirect ist nur für target=goal zulässig.");
        }
        boolean explicitGoalRedirect = "goal".equals(target) && Boolean.TRUE.equals(redirect);
        UnifiedLearnerStateResponse rawState = coachTools.getLearnerState(skillpilotId);
        FrontierGoal currentActiveGoal = activeGoal(rawState);
        List<OpenAiDeCoachContext.Option> options = new ArrayList<>();
        String requiredAction;
        switch (target) {
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
                String currentRequiredAction = rawState.stateMachine() == null
                        ? null
                        : rawState.stateMachine().requiredAction();
                if (currentActiveGoal != null && !explicitGoalRedirect) {
                    requiredAction = currentRequiredAction == null
                            ? "teachActiveGoal"
                            : currentRequiredAction;
                } else {
                    List<FrontierGoal> source = rawState.frontier();
                    if ((source == null || source.isEmpty()) && rawState.stateMachine() != null) {
                        source = rawState.stateMachine().goalOptions();
                    }
                    List<FrontierGoal> candidates = contextProjector.projectNavigationGoals(source);
                    List<FrontierGoal> atomic = candidates.stream()
                            .filter(goal -> "atomic".equals(goal.type()))
                            .filter(goal -> currentActiveGoal == null
                                    || !Objects.equals(goal.id(), currentActiveGoal.id()))
                            .toList();
                    if (!atomic.isEmpty()) {
                        requiredAction = "setActiveGoal";
                    } else if (currentActiveGoal != null) {
                        requiredAction = currentRequiredAction == null
                                ? "teachActiveGoal"
                                : currentRequiredAction;
                    } else {
                        requiredAction = currentRequiredAction == null
                                ? "getFrontier"
                                : currentRequiredAction;
                    }
                    for (FrontierGoal goal : atomic) {
                        add(options, contextProjector.goalOption(goal, "goal"));
                    }
                }
            }
            default -> throw new IllegalArgumentException("target must be scope or goal.");
        }
        String instruction;
        if ("goal".equals(target) && currentActiveGoal != null && !explicitGoalRedirect) {
            String activeTitle = currentActiveGoal.title() == null || currentActiveGoal.title().isBlank()
                    ? localized(metadata, "das aktive Lernziel", "the active learning goal")
                    : currentActiveGoal.title();
            instruction = localized(metadata,
                    "Es besteht bereits ein aktives Lernziel: " + activeTitle + ". Beim normalen Fortsetzen bleibt "
                            + "der neueste vollständige SkillPilot-Kontext autoritativ. Folge unverändert dessen "
                            + "requiredAction=" + requiredAction + " und den dort veröffentlichten modusspezifischen "
                            + "Regeln. Es ist keine Lernzielauswahl offen. Verwirf alle früheren Zieloptionen aus "
                            + "dem Gespräch und lade oder setze kein Lernziel erneut. Falls der vollständige Kontext "
                            + "nicht mehr verfügbar ist, lade ihn genau einmal neu.",
                    "There is already an active learning goal: " + activeTitle + ". During normal continuation, "
                            + "the newest full SkillPilot context remains authoritative. Continue to follow its "
                            + "requiredAction=" + requiredAction + " and the mode-specific rules published there. "
                            + "No learning-goal choice is open. Discard all goal options from earlier conversation "
                            + "turns and do not load or set a goal again. If the full context is no longer available, "
                            + "reload it exactly once.");
        } else if (options.isEmpty()) {
            if ("goal".equals(target) && currentActiveGoal != null) {
                instruction = localized(metadata,
                        "Für den ausdrücklich gewünschten Zielwechsel sind aktuell keine anderen sicheren Ziele "
                                + "verfügbar. Arbeite am bereits aktiven Lernziel weiter.",
                        "No other safe goals are currently available for the explicitly requested switch. "
                                + "Continue the already active learning goal.");
            } else {
                instruction = localized(metadata,
                        "Aktuell sind keine sicheren Optionen verfügbar. Lade den Kontext erneut.",
                        "No safe options are currently available. Reload the context.");
            }
        } else if ("scope".equals(target)) {
            instruction = localized(metadata,
                    "Diese Optionen ändern ausschließlich den Lernfokus; sie sind keine nächsten Lernziele. "
                            + "Verwende sie nur nach einem ausdrücklichen Wunsch zum Fokuswechsel. Bei Start, "
                            + "Fortsetzen oder Wiederaufnehmen darfst du sie nicht präsentieren; lade stattdessen "
                            + "den vollständigen Kontext und folge dessen aktivem Lernziel und requiredAction. "
                            + "Übernimm beim Fokuswechsel ausschließlich eine veröffentlichte Options-ID "
                            + "unverändert.",
                    "These options change only the learning focus; they are not next learning goals. Use them "
                            + "only after an explicit request to change focus. Never present them during a normal "
                            + "start, continuation, or resumption; load the full context instead and follow its "
                            + "active goal and requiredAction. For a focus change, copy exactly one published "
                            + "option ID unchanged.");
        } else if ("goal".equals(target) && currentActiveGoal != null) {
            instruction = localized(metadata,
                    "Die lernende Person hat ausdrücklich einen Wechsel auf ein anderes Ziel angefordert. "
                            + "Verwende ausschließlich eine dieser aktuellen Optionen und rufe danach "
                            + "set_skillpilot_active_goal mit redirect=true auf.",
                    "The learner explicitly requested a switch to a different goal. Use only one of these current "
                            + "options, then call set_skillpilot_active_goal with redirect=true.");
        } else {
            instruction = localized(metadata,
                    "Übernimm ausschließlich die veröffentlichten Options-IDs unverändert. "
                            + "Frage nur nach, wenn der Wunsch inhaltlich nicht eindeutig ist.",
                    "Use only the published option IDs unchanged. Ask only when the request is not "
                            + "semantically unambiguous.");
        }
        NavigationResult result = new NavigationResult(
                target,
                requiredAction,
                List.copyOf(options),
                instruction);
        String resultSummary;
        if ("goal".equals(target) && currentActiveGoal != null && !explicitGoalRedirect) {
            resultSummary = localized(metadata,
                    "Aktives Lernziel bestätigt; keine Lernzielauswahl geöffnet. Frühere Zieloptionen sind ungültig.",
                    "Active learning goal confirmed; no learning-goal choice opened. Earlier goal options are invalid.");
        } else if ("goal".equals(target) && currentActiveGoal != null && options.isEmpty()) {
            resultSummary = localized(metadata,
                    "Keine anderen sicheren Lernziele für den ausdrücklich gewünschten Wechsel verfügbar.",
                    "No other safe learning goals are available for the explicitly requested switch.");
        } else {
            resultSummary = localized(metadata,
                    "Navigationsoptionen für " + target + " geladen.",
                    "Navigation options for " + target + " loaded.");
        }
        return successResult(
                resultSummary,
                result);
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
        String workFeedback = requiredBoundedString(
                arguments,
                WORK_FEEDBACK,
                MAX_WORK_FEEDBACK_LENGTH);
        String outcomeFeedback = requiredBoundedString(
                arguments,
                OUTCOME_FEEDBACK,
                MAX_OUTCOME_FEEDBACK_LENGTH);
        String orientationPathId = optionalString(arguments, ORIENTATION_PATH_ID);
        String evaluationCapability = optionalString(arguments, EXAM_EVALUATION_CAPABILITY);
        Double earnedPoints = optionalFiniteDouble(arguments, EXAM_EARNED_POINTS);
        if (orientationPathId != null && orientationPathId.isBlank()) {
            throw new IllegalArgumentException(ORIENTATION_PATH_ID + " darf nicht leer sein.");
        }
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
        Double examMaxPoints = null;
        if (isExamGoal(active)) {
            if (evaluationCapability == null || evaluationCapability.isBlank() || earnedPoints == null) {
                return errorResult(
                        OpenAiDeV1ErrorCode.INVALID_INPUT,
                        localized(metadata,
                                "Eine Prüfungs-Mastery benötigt zuerst die freigegebene Bewertung sowie deren "
                                        + "evaluationCapability und earnedPoints.",
                                "Exam mastery first requires the approved evaluation together with its "
                                        + "evaluationCapability and earnedPoints."),
                        metadata);
            }
            String learningSessionId = requiredLearningSessionId(arguments);
            if (!verifyExamEvaluationCapability(
                    evaluationCapability,
                    learningSessionId,
                    goalId,
                    metadata)) {
                return errorResult(
                        OpenAiDeV1ErrorCode.INVALID_INPUT,
                        localized(metadata,
                                "Diese Prüfungsbewertung gehört nicht zur aktuellen Aufgabe und Lernsession.",
                                "This exam evaluation does not belong to the current task and learning session."),
                        metadata);
            }
            CoachToolFacade.ExamEvaluationResult evaluation = coachTools.getExamEvaluation(
                    skillpilotId,
                    new CoachToolFacade.ExamEvaluationRequest(goalId));
            examMaxPoints = evaluation.scoring().maxPoints();
            if (earnedPoints < 0.0 || earnedPoints > examMaxPoints) {
                return errorResult(
                        OpenAiDeV1ErrorCode.INVALID_INPUT,
                        localized(metadata,
                                "Die angegebene Punktzahl liegt außerhalb des freigegebenen Bewertungsrasters.",
                                "The supplied score is outside the approved scoring rubric."),
                        metadata);
            }
            if (earnedPoints < evaluation.scoring().passingPoints()) {
                return errorResult(
                        OpenAiDeV1ErrorCode.INVALID_INPUT,
                        localized(metadata,
                                "Die Prüfung ist noch nicht bestanden. Gib die vollständige Rückmeldung und bleibe "
                                        + "bei derselben aktiven Prüfungsaufgabe; speichere keine Mastery.",
                                "The exam has not passed yet. Give the complete feedback and remain on the same "
                                        + "active exam task; do not save mastery."),
                        metadata);
            }
        } else if (evaluationCapability != null || earnedPoints != null) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    localized(metadata,
                            "Prüfungsbewertung und Punktzahl sind nur für ein aktives Prüfungsziel zulässig.",
                            "Exam evaluation capability and score are allowed only for an active exam goal."),
                    metadata);
        }
        OrientationOutlook.Path selectedOrientationPath = null;
        if (orientationPathId != null) {
            if (!isOrientationGoal(active)) {
                return errorResult(
                        OpenAiDeV1ErrorCode.INVALID_INPUT,
                        localized(metadata,
                                "orientationPathId ist nur beim Abschluss eines Orientierungsziels zulässig.",
                                "orientationPathId is allowed only when completing an orientation goal."),
                        metadata);
            }
            OrientationOutlook orientationOutlook = coachTools.getOrientationOutlook(
                    skillpilotId,
                    communicationLocale(metadata));
            selectedOrientationPath = orientationOutlook == null || orientationOutlook.paths() == null
                    ? null
                    : orientationOutlook.paths().stream()
                            .filter(Objects::nonNull)
                            .filter(path -> orientationPathId.equals(path.pathId()))
                            .findFirst()
                            .orElse(null);
            if (selectedOrientationPath == null) {
                return errorResult(
                        OpenAiDeV1ErrorCode.INVALID_INPUT,
                        localized(metadata,
                                "Der gewählte Motivationspfad gehört nicht zur aktuellen Lernlandkarte.",
                                "The selected orientation path is not part of the current learning map."),
                        metadata);
            }
        }
        CoachToolFacade.MasteryResult result = coachTools.setMastery(
                skillpilotId,
                new MasteryUpdateRequest(null, goalId));
        if (result.status() == CoachToolFacade.MasteryStatus.CONFLICT) {
            telemetry.recordOperational(Event.CONFLICT);
            return conflictResult(metadata);
        }
        if (result.status() == CoachToolFacade.MasteryStatus.BAD_REQUEST) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    localized(metadata,
                            "Die Mastery konnte mit diesen Abschlussdaten nicht gespeichert werden.",
                            "Mastery could not be saved with these completion details."),
                    metadata);
        }
        UnifiedLearnerStateResponse state = coachTools.getLearnerState(skillpilotId);
        if (result.status() == CoachToolFacade.MasteryStatus.UPDATED && selectedOrientationPath != null) {
            state = activateFirstAvailableOrientationPathGoal(
                    skillpilotId,
                    state,
                    selectedOrientationPath);
        }
        OpenAiDeCoachContext successorContext = projectContext(skillpilotId, state, metadata);
        String successorTitle = successorContext == null || successorContext.activeGoal() == null
                ? null
                : successorContext.activeGoal().title();
        MasteryToolResult response = new MasteryToolResult(
                result.status().name().toLowerCase(Locale.ROOT),
                result.update() == null ? null : result.update().savedGoalId(),
                result.update() == null ? null : result.update().savedMastery(),
                new CompletionHandoff(
                        result.update() == null ? goalId : result.update().savedGoalId(),
                        active.title(),
                        workFeedback,
                        outcomeFeedback,
                        earnedPoints,
                        examMaxPoints,
                        successorTitle,
                        localized(metadata,
                                "Gib zuerst workFeedback und danach outcomeFeedback vollständig sichtbar aus. "
                                        + "Beginne erst anschließend den Nachfolgerabschnitt. Keine Antwort aus der "
                                        + "Zeit vor seiner Aktivierung zählt als Evidenz für das neue Lernziel.",
                                "Present workFeedback first and outcomeFeedback second in full. Only then begin "
                                        + "the successor section. No answer from before its activation counts as "
                                        + "evidence for the new learning goal."),
                        true),
                successorContext,
                result.error());
        String transitionSummary;
        if (result.status() == CoachToolFacade.MasteryStatus.UPDATED
                && successorTitle != null
                && !successorTitle.isBlank()) {
            transitionSummary = isOrientationGoal(active)
                    ? localized(metadata,
                            "Orientierung abgeschlossen. SkillPilot hat das nächste Lernziel bereits aktiviert: "
                                    + successorTitle
                                    + ". Beginne dieses Ziel unmittelbar und biete keine Lernzielauswahl an. Alle "
                                    + "zuvor genannten Zieloptionen sind ungültig.",
                            "Orientation complete. SkillPilot has already activated the next learning goal: "
                                    + successorTitle
                                    + ". Begin this goal immediately and do not offer a learning-goal choice. All "
                                    + "previously mentioned goal options are invalid.")
                    : localized(metadata,
                            "Mastery gespeichert. SkillPilot hat das nächste Lernziel bereits aktiviert: "
                                    + successorTitle
                                    + ". Beginne dieses Ziel unmittelbar und biete keine Lernzielauswahl an. Alle "
                                    + "zuvor genannten Zieloptionen sind ungültig.",
                            "Mastery saved. SkillPilot has already activated the next learning goal: "
                                    + successorTitle
                                    + ". Begin this goal immediately and do not offer a learning-goal choice. All "
                                    + "previously mentioned goal options are invalid.");
        } else if (result.status() == CoachToolFacade.MasteryStatus.UPDATED) {
            transitionSummary = isOrientationGoal(active)
                    ? localized(metadata,
                            "Orientierung abgeschlossen; Folgezustand geladen.",
                            "Orientation complete; successor state loaded.")
                    : localized(metadata,
                            "Mastery gespeichert; Folgezustand geladen.",
                            "Mastery saved; successor state loaded.");
        } else {
            transitionSummary = localized(metadata,
                    "Mastery nicht gespeichert; aktuellen Folgezustand beachten.",
                    "Mastery was not saved; use the current successor state.");
        }
        String successSummary = completionFeedbackSummary(
                active.title(),
                workFeedback,
                outcomeFeedback,
                earnedPoints,
                examMaxPoints,
                transitionSummary,
                metadata);
        return successResult(
                successSummary,
                response);
    }

    private String completionFeedbackSummary(
            String completedGoalTitle,
            String workFeedback,
            String outcomeFeedback,
            Double earnedPoints,
            Double maxPoints,
            String transitionSummary,
            OpenAiDeV1SessionMetadata metadata) {
        String title = completedGoalTitle == null || completedGoalTitle.isBlank()
                ? localized(metadata, "Abgeschlossenes Lernziel", "Completed learning goal")
                : completedGoalTitle;
        StringBuilder summary = new StringBuilder(localized(metadata,
                "Verpflichtende Abschlussrückmeldung zu „" + title + "“ — gib diesen Block zuerst vollständig sichtbar aus:\n"
                        + "Inhaltliche Rückmeldung: " + workFeedback + "\n"
                        + "Ergebnis: " + outcomeFeedback,
                "Mandatory completion feedback for “" + title + "” — present this full block visibly first:\n"
                        + "Feedback on the work: " + workFeedback + "\n"
                        + "Outcome: " + outcomeFeedback));
        if (earnedPoints != null && maxPoints != null) {
            summary.append(localized(metadata,
                    "\nBestätigte Punktzahl: " + formatScore(earnedPoints) + " von " + formatScore(maxPoints) + ".",
                    "\nConfirmed score: " + formatScore(earnedPoints) + " of " + formatScore(maxPoints) + "."));
        }
        summary.append("\n\n").append(localized(metadata,
                "Erst nach dieser Rückmeldung folgt der neue Lernzielabschnitt. ",
                "Only after this feedback may the new learning-goal section begin. "));
        summary.append(transitionSummary);
        return summary.toString();
    }

    private static String formatScore(double value) {
        return BigDecimal.valueOf(value).stripTrailingZeros().toPlainString();
    }

    private UnifiedLearnerStateResponse activateFirstAvailableOrientationPathGoal(
            String skillpilotId,
            UnifiedLearnerStateResponse state,
            OrientationOutlook.Path selectedPath) {
        if (state == null || selectedPath.relatedGoalIds() == null || selectedPath.relatedGoalIds().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Selected orientation path has no reviewed learning-goal entry.");
        }
        Set<String> relatedGoalIds = new LinkedHashSet<>(selectedPath.relatedGoalIds());
        List<FrontierGoal> candidates = coachTools.getUncompactedFrontier(skillpilotId);
        FrontierGoal selectedGoal = candidates.stream()
                .filter(Objects::nonNull)
                .filter(goal -> "atomic".equals(goal.type()))
                .filter(goal -> relatedGoalIds.contains(goal.id()))
                .findFirst()
                .orElse(null);
        if (selectedGoal == null) {
            return state;
        }
        return coachTools.setActiveGoal(
                skillpilotId,
                new ActiveGoalRequest(selectedGoal.id(), false));
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
        String goalId = requiredString(arguments, "goalId");
        String learningSessionId = requiredLearningSessionId(arguments);
        CoachToolFacade.ExamEvaluationResult response = coachTools.getExamEvaluation(
                skillpilotId,
                new CoachToolFacade.ExamEvaluationRequest(goalId));
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
                examEvaluationCapability(
                        learningSessionId,
                        response.goalId(),
                        metadata),
                localized(metadata,
                        "Bewerte die bereits vollständig vorliegende Abgabe Schritt für Schritt nach jedem Rasterkriterium "
                                + "und ausschließlich anhand sichtbar vorliegender Leistung. Die Musterlösung ist nur Referenz: "
                                + "Fachlich gleichwertige Ergebnisse, Darstellungen, Rundungen, Begründungen und korrekte "
                                + "alternative Lösungswege zählen voll, sofern Aufgabe oder Raster keine bestimmte Antwortform "
                                + "verlangt; ausdrückliche Anforderungen bleiben verbindlich. Fehlt eine ausdrücklich geforderte "
                                + "Deutung oder Begründung, erhält genau dieser Teil keine Punkte; trenne Teilpunkte sauber und "
                                + "begründe jeden Abzug konkret. Bewerte abschließend ohne Nachfrage. Benenne Unleserliches als "
                                + "solches und erfinde daraus keinen konkreten fachlichen Fehler. Speichere Mastery erst nach "
                                + "einem finalen Ergebnis mit mindestens passingPoints. Übergib dabei diese "
                                + "evaluationCapability unverändert, earnedPoints sowie konkrete workFeedback- und "
                                + "outcomeFeedback-Texte.",
                        "Assess the complete visible submission step by step against every rubric criterion and only "
                                + "from visible work. The sample solution is a reference, not a wording requirement. Give "
                                + "full credit for technically equivalent results, representations, rounding, reasoning, and "
                                + "correct alternative approaches unless the task or rubric requires a specific form. Explicit "
                                + "requirements remain binding. If a required interpretation or justification is missing, "
                                + "withhold only those points, separate partial credit cleanly, and justify every deduction. "
                                + "Complete the assessment without another question. Identify unreadable content as unreadable "
                                + "and do not invent a specific subject error. Save mastery only after a final result with at "
                                + "least passingPoints. Copy this evaluationCapability unchanged and pass earnedPoints "
                                + "together with concrete workFeedback and outcomeFeedback texts."));
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
        requireWebFirstContextConfigured(state);
        PersonalizationPlan plan =
                state != null
                                && state.curriculum() != null
                        ? coachTools.getPersonalizationPlan(skillpilotId)
                        : PersonalizationPlan.complete(List.of());
        if (plan == null) {
            plan = PersonalizationPlan.complete(List.of());
        }
        FrontierGoal active = activeGoal(state);
        OrientationOutlook orientationOutlook = isOrientationGoal(active)
                ? coachTools.getOrientationOutlook(skillpilotId, communicationLocale(metadata))
                : null;
        return contextProjector.project(
                state,
                plan,
                coachTools.showGoalVisualizationsInChat(skillpilotId),
                communicationLocale(metadata),
                orientationOutlook);
    }

    private void requireWebFirstContextConfigured(UnifiedLearnerStateResponse state) {
        String requiredAction = state == null || state.stateMachine() == null
                ? null
                : state.stateMachine().requiredAction();
        if (state == null
                || state.curriculum() == null
                || "setCurriculum".equals(requiredAction)
                || "setPersonalization".equals(requiredAction)) {
            throw new WebFirstConfigurationRequiredException();
        }
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
        return successResult(summary, structuredContent, null);
    }

    private McpSchema.CallToolResult successResult(
            String summary,
            Object structuredContent,
            Map<String, Object> meta) {
        return McpSchema.CallToolResult.builder()
                .isError(false)
                .addTextContent(summary)
                .structuredContent(structuredContent)
                .meta(meta)
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
        if (exception instanceof WebFirstConfigurationRequiredException) {
            return configurationRequiredResult(metadata);
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
        if (code == OpenAiDeV1ErrorCode.SESSION_RENEWAL_REQUIRED) {
            telemetry.recordOperational(Event.SESSION_RENEWAL_REQUIRED);
            instruction = localized(metadata,
                    "Die aktuelle SkillPilot-Lernsession hat weniger als eine Stunde Restlaufzeit. Öffne jetzt "
                            + "SkillPilot über den bereitgestellten Link, prüfe dort den Lernkontext und wähle "
                            + "„Lernen starten“. Verwende die vorbereitete Startnachricht in einem neuen Chat. Bis "
                            + "dahin ist keine fachliche SkillPilot-Antwort erlaubt. Die OAuth-Verbindung bleibt aktiv.",
                    "The current SkillPilot learning session has less than one hour remaining. Open SkillPilot with "
                            + "the provided link, verify the learning context there, and choose “Start learning”. Use "
                            + "the prepared start message in a new chat. No subject-matter SkillPilot response is "
                            + "permitted before then. The OAuth connection remains active.");
            details.put("oauthConnectionValid", true);
            details.put("startUrl", sessionStartUrl);
            details.put(
                    "minimumRemainingSeconds",
                    OpenAiDeV1ContractMetadata.MINIMUM_ACTION_SESSION_REMAINING.toSeconds());
        } else if (code == OpenAiDeV1ErrorCode.SESSION_VERSION_UNAVAILABLE) {
            instruction = localized(metadata,
                    "Die vorbereitete Lernsession gehört zu einer nicht mehr verfügbaren Workflow- oder "
                            + "Curriculumrevision. Öffne SkillPilot über den bereitgestellten Link, prüfe dort den "
                            + "Lernkontext und wähle „Lernen starten“. Verwende die vorbereitete Startnachricht in "
                            + "einem neuen Chat. Die OAuth-Verbindung bleibt aktiv.",
                    "The prepared learning session belongs to a workflow or curriculum revision that is no longer "
                            + "available. Open SkillPilot with the provided link, verify the learning context there, "
                            + "and choose “Start learning”. Use the prepared start message in a new chat. The OAuth "
                            + "connection remains active.");
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
        String instructionDe = "Öffne SkillPilot über den bereitgestellten Link, schließe oder prüfe dort die "
                + "Konfiguration und wähle „Lernen starten“. Verwende die vorbereitete Startnachricht in einem neuen "
                + "Chat. Die OAuth-Verbindung bleibt aktiv; gib im Chat weder Token noch dauerhafte SkillPilot-ID ein.";
        String instructionEn = "Open SkillPilot with the provided link, finish or verify the learning setup there, "
                + "and choose “Start learning”. Use the prepared start message in a new chat. The OAuth connection "
                + "remains active; do not enter a token or permanent SkillPilot ID in chat.";
        return errorResult(
                OpenAiDeV1ErrorCode.SESSION_REQUIRED,
                "Die SkillPilot-Lernsession fehlt oder ist abgelaufen. " + instructionDe
                        + "\n\nThe SkillPilot learning session is missing or expired. " + instructionEn,
                null,
                Map.of(
                        "oauthConnectionValid", true,
                        "startUrl", sessionStartUrl,
                        "instructions", Map.of("de", instructionDe, "en", instructionEn)));
    }

    private McpSchema.CallToolResult configurationRequiredResult(
            OpenAiDeV1SessionMetadata metadata) {
        String instruction = localized(metadata,
                "Der Lernkontext ist im SkillPilot-WebGUI noch nicht vollständig konfiguriert. Öffne SkillPilot "
                        + "über den bereitgestellten Link, schließe die Konfiguration ab und wähle „Lernen starten“. "
                        + "Verwende die vorbereitete Startnachricht in einem neuen Chat. Bis dahin ist keine "
                        + "fachliche SkillPilot-Antwort erlaubt. Die OAuth-Verbindung bleibt aktiv.",
                "The learning context is not fully configured in the SkillPilot web interface. Open SkillPilot with "
                        + "the provided link, finish the configuration, and choose “Start learning”. Use the prepared "
                        + "start message in a new chat. No subject-matter SkillPilot response is permitted before "
                        + "then. The OAuth connection remains active.");
        return errorResult(
                OpenAiDeV1ErrorCode.SESSION_REQUIRED,
                instruction,
                metadata,
                Map.of(
                        "oauthConnectionValid", true,
                        "startUrl", sessionStartUrl,
                        "configurationRequired", true,
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
            case SESSION_RENEWAL_REQUIRED -> "session_renewal_required";
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

    private boolean isExamGoal(FrontierGoal goal) {
        return goal != null
                && ("exam".equals(goal.nodeKind()) || goal.examData() != null);
    }

    private boolean isOrientationGoal(FrontierGoal goal) {
        if (goal == null) {
            return false;
        }
        if (goal.semanticKind() != null && !goal.semanticKind().isBlank()) {
            return "orientation".equalsIgnoreCase(goal.semanticKind().trim());
        }
        return goal.tags() != null && goal.tags().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .anyMatch(tag -> "orientation".equalsIgnoreCase(tag)
                        || "motivation".equalsIgnoreCase(tag));
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

    private String requiredBoundedString(
            Map<String, Object> arguments,
            String name,
            int maxLength) {
        String value = requiredString(arguments, name);
        if (value.length() > maxLength) {
            throw new IllegalArgumentException(name + " darf höchstens " + maxLength + " Zeichen enthalten.");
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

    private Double optionalFiniteDouble(Map<String, Object> arguments, String name) {
        Object value = arguments.get(name);
        if (value == null) {
            return null;
        }
        if (!(value instanceof Number number)) {
            throw new IllegalArgumentException(name + " muss eine Zahl sein.");
        }
        double normalized = number.doubleValue();
        if (!Double.isFinite(normalized)) {
            throw new IllegalArgumentException(name + " muss eine endliche Zahl sein.");
        }
        return normalized;
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
        Map<String, Object> schema = new LinkedHashMap<>(objectSchema(properties, List.copyOf(required)));
        Object oneOf = inputSchema.get("oneOf");
        if (oneOf != null) {
            schema.put("oneOf", oneOf);
        }
        return Map.copyOf(schema);
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
        properties.put("orientationOutlook", orientationOutlookSchema());
        properties.put("activeGoal", activeGoalSchema());
        properties.put("options", objectArraySchema(optionSchema()));
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

    private static Map<String, Object> orientationOutlookSchema() {
        return objectSchema(
                Map.of("paths", boundedObjectArraySchema(orientationPathSchema(), 2, 4)),
                List.of("paths"));
    }

    private static Map<String, Object> orientationPathSchema() {
        return objectSchema(
                Map.of(
                        "pathId", boundedNonEmptyStringSchema(320),
                        "title", boundedNonEmptyStringSchema(320),
                        "learningOutlook", boundedNonEmptyStringSchema(320),
                        "practicalContexts", boundedStringArraySchema(1, 3),
                        "representativeGoalTitles", boundedStringArraySchema(1, 4)),
                List.of(
                        "pathId",
                        "title",
                        "learningOutlook",
                        "practicalContexts",
                        "representativeGoalTitles"));
    }

    private static Map<String, Object> masterySchema() {
        return objectSchema(
                Map.of(
                        "status", stringSchema(),
                        "savedGoalId", stringSchema(),
                        "savedMastery", numberSchema(0.0, 1.0),
                        "completionHandoff", describedSchema(
                                completionHandoffSchema(),
                                "Mandatory learner-facing handoff for the completed goal. Present workFeedback "
                                        + "and outcomeFeedback in that order before naming or teaching the successor."),
                        "context", describedSchema(
                                contextSchema(),
                                "Fresh authoritative successor state. It invalidates every goal option from "
                                        + "earlier results and conversation turns. If activeGoal is present, "
                                        + "continue it without offering a goal choice, but only after presenting "
                                        + "completionHandoff."),
                        "error", stringSchema()),
                List.of("status", "completionHandoff", "context"));
    }

    private static Map<String, Object> completionHandoffSchema() {
        return objectSchema(
                Map.of(
                        "completedGoalId", stringSchema(),
                        "completedGoalTitle", stringSchema(),
                        "workFeedback", stringSchema(),
                        "outcomeFeedback", stringSchema(),
                        "earnedPoints", numberSchema(0.0, Double.MAX_VALUE),
                        "maxPoints", numberSchema(0.0, Double.MAX_VALUE),
                        "successorGoalTitle", stringSchema(),
                        "instruction", stringSchema(),
                        "successorEvidenceReset", booleanSchema()),
                List.of(
                        "completedGoalId",
                        "completedGoalTitle",
                        "workFeedback",
                        "outcomeFeedback",
                        "instruction",
                        "successorEvidenceReset"));
    }

    private static Map<String, Object> memoryPracticeReceiptSchema() {
        return objectSchema(
                Map.of(
                        "status", enumStringSchema("ready", "complete"),
                        "goalId", stringSchema(),
                        "goalTitle", stringSchema(),
                        "progress", objectSchema(
                                Map.of(
                                        "totalCards", integerSchema(0, null),
                                        "dueCards", integerSchema(0, null),
                                        "scheduledCards", integerSchema(0, null)),
                                List.of("totalCards", "dueCards", "scheduledCards")),
                        "completed", booleanSchema()),
                List.of("status", "goalId", "goalTitle", "progress", "completed"));
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
                        "evaluationCapability", modelFacingOpaqueReferenceSchema(),
                        "instruction", stringSchema()),
                List.of(
                        "goalId",
                        "solutionContent",
                        "scoring",
                        "evaluationCapability",
                        "instruction"));
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

    private static Map<String, Object> boundedObjectArraySchema(
            Map<String, Object> itemSchema,
            int minItems,
            int maxItems) {
        return Map.of(
                "type", "array",
                "items", itemSchema,
                "minItems", minItems,
                "maxItems", maxItems);
    }

    private static Map<String, Object> describedSchema(
            Map<String, Object> schema,
            String description) {
        Map<String, Object> described = new LinkedHashMap<>(schema);
        described.put("description", description);
        return Map.copyOf(described);
    }

    private static Map<String, Object> stringSchema() {
        return Map.of("type", "string");
    }

    private static Map<String, Object> nonEmptyStringSchema() {
        return Map.of("type", "string", "minLength", 1);
    }

    private static Map<String, Object> boundedNonEmptyStringSchema(int maxLength) {
        return Map.of(
                "type", "string",
                "minLength", 1,
                "maxLength", maxLength);
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

    private static Map<String, Object> boundedStringArraySchema(int minItems, int maxItems) {
        Map<String, Object> schema = new LinkedHashMap<>(stringArraySchema(minItems));
        schema.put("items", boundedNonEmptyStringSchema(320));
        schema.put("maxItems", maxItems);
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

    private static final class WebFirstConfigurationRequiredException extends RuntimeException {
        private WebFirstConfigurationRequiredException() {
            super(null, null, false, false);
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
