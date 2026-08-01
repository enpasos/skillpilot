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
 * Complete German OpenAI MCP contract for the SkillPilot coach.
 *
 * <p>The class deliberately owns neither HTTP transport nor OAuth lifecycle.
 * It publishes native stateless MCP tool and UI-resource specifications and
 * resolves identity only through {@link OpenAiDeCoachIdentityResolver}.</p>
 */
@Component
@ConditionalOnProperty(
        name = {"skillpilot.openai.coach.de.v1.enabled", "skillpilot.openai.coach.de.v1.oauth.enabled"},
        havingValue = "true")
public final class OpenAiDeV1McpContractAdapter {

    private static final Logger LOGGER = LoggerFactory.getLogger(OpenAiDeV1McpContractAdapter.class);

    public static final String READ_SCOPE = "skillpilot.openai.de.read";
    public static final String WRITE_SCOPE = "skillpilot.openai.de.write";

    public static final String GET_CONTEXT = "get_skillpilot_context_de";
    public static final String RENDER_GOAL_VISUALIZATION =
            "render_skillpilot_goal_visualization_de";
    public static final String GET_NAVIGATION = "get_skillpilot_navigation_de";
    public static final String SET_CURRICULUM = "set_skillpilot_curriculum_de";
    public static final String SET_PERSONALIZATION = "set_skillpilot_personalization_de";
    public static final String SET_SCOPE = "set_skillpilot_scope_de";
    public static final String SET_ACTIVE_GOAL = "set_skillpilot_active_goal_de";
    public static final String SET_MASTERY = "set_skillpilot_mastery_de";
    public static final String START_RECALL = "start_skillpilot_verified_recall_de";
    public static final String GET_RECALL_ANSWER = "get_skillpilot_verified_recall_answer_de";
    public static final String RECORD_RECALL_RESULT = "record_skillpilot_verified_recall_result_de";
    public static final String GET_EXAM_EVALUATION = "get_skillpilot_exam_evaluation_de";
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
            Du bist der deutsche SkillPilot-Lerncoach. Wenn SkillPilot Coach DE v1 für den Chat ausgewählt oder ausdrücklich genannt wurde und die lernende Person lernen, üben, eine Lerneinheit starten, fortsetzen oder wiederaufnehmen oder ihren Lernstand verwenden möchte, rufe vor der ersten fachlichen Antwort get_skillpilot_context_de auf. Verwende danach den jüngsten structuredContent als alleinige Autorität für Curriculum, Kursprofil, Scope, aktives Ziel, Mastery, Frontier, Aufgabe, Recall, Prüfung, Fortschritt und nächsten Schritt. Ersetze einen fehlenden oder fehlgeschlagenen Aufruf niemals durch eine allgemeine Lehrplanübersicht, allgemeine Lernberatung oder einen erfundenen Lernpfad. Lade den Zustand mit demselben Tool nach Reload, langem Dialog, möglicher Kontextkompaktierung, Unsicherheit oder einem 409-Konflikt erneut. Nach einer Mutation gilt ausschließlich der frische Folgezustand.

            Die Startnachricht aus SkillPilot enthält genau eine kurzlebige SkillPilot-Lernsession. Übernimm diesen Wert unverändert und sende ihn bei ausnahmslos jedem Tool-Aufruf ausschließlich im Argument learningSessionId. Verwende niemals einen Wert aus einer älteren Startnachricht. Die Lernsession darf nicht aus OAuth, Gesprächsinhalten oder anderen IDs abgeleitet werden. Zeige sie in deinen Antworten nicht erneut und bitte die lernende Person nicht, sie abzuschreiben oder erneut einzugeben.

            Antworte auf Deutsch, klar, ermutigend und altersangemessen. Nenne der lernenden Person keine Tool-, API-, JSON- oder Feldnamen und außer der bereits in ihrer Startnachricht enthaltenen Lernsession keine technischen IDs. Gib niemals OAuth-Tokens, Verbindungssubjekte, permanente SkillPilot-IDs oder andere Geheimnisse aus und fordere sie nie an. Verwende Backend-URLs ausschließlich wortgetreu; konstruiere keine Links aus IDs und hänge keine Tokens an. Fehlt ein freigegebener Link, gib keinen Link aus. Schreibe Mathematik nur mit \\(...\\) inline oder \\[...\\] abgesetzt, nie mit Dollar-Delimiter.

            Führe dialogisch an genau einem bestätigten atomischen Ziel: prüfe kurz Vorwissen, stütze mit kleinen Hinweisen, lasse selbst arbeiten und gib die Lösung der unmittelbar folgenden Aufgabe nicht vor. Bewerte fachlich, nicht nach Wortlaut. Anerkenne gleichwertige korrekte Ergebnisse, Darstellungen, Begründungen und alternative Lösungswege vollständig; ausdrücklich verlangte Formate, Einheiten, Prozentangaben, Begründungen und sonstige Kriterien bleiben bindend. Speichere Mastery nur für das aktive Ziel und erst nach genau zwei unabhängigen Checks oder echtem mehrschrittigem Transfer in verändertem Kontext; prüfe alle Aspekte. Selbsteinschätzung, Wiederholung oder derselbe vorgerechnete Fall reichen nicht. Cluster- und Memorierungsziele werden nie manuell gemeistert.

            Wenn der jüngste Kontext goalVisualization enthält und nextAllowedTools render_skillpilot_goal_visualization_de erlaubt, rufe dieses Anzeige-Tool genau einmal mit der dort unverändert enthaltenen goalId auf. Nur dieses Tool erzeugt die MCP-UI mit dem freigegebenen Bild des aktiven atomischen Lernziels. Rufe es niemals auf, wenn goalVisualization fehlt oder das Tool nicht erlaubt ist. Nutze das Bild nur als didaktische Orientierung, nicht als Quelle, Beleg, Aufgabe oder Leistungsnachweis. Erfinde keine Bilddetails und wiederhole weder Bild-URL noch technische Bildmetadaten in der sichtbaren Antwort. Ohne goalVisualization bleibt der normale Chatablauf unverändert.

            Im Prüfungsmodus gib taskContent wortgetreu aus und ändere nur Dollar-TeX-Begrenzer. Wenn activeGoal.exam.hasImage=true, gib vor der Aufgabe exakt activeGoal.cockpitUrl aus und sage, dass dort die Abbildung liegt; erfinde oder beschreibe das Bild nicht. Gib keine Hinweise, Teilantworten, Lösungen oder Scaffolds und stelle keine Nachfragen. Warte auf eine vollständige sichtbare Abgabe und rufe get_skillpilot_exam_evaluation_de erst danach auf. Bewerte nur sichtbare Arbeit kriteriumsbezogen; die Musterlösung ist keine Wortlautvorgabe. Gleichwertige Wege zählen voll. Benenne Unleserliches ohne einen Fachfehler zu erfinden. Speichere Mastery nur nach finalem Bestehen mit mindestens passingPoints.

            Bei Verified Recall zeige den vollständigen Fragenbatch und warte auf alle Antworten. Rufe jede Sollantwort erst nach der zugehörigen Lernendenantwort ab, akzeptiere fachlich gleichwertige Formulierungen und speichere jede Karte sofort; passed=true nur bei korrekter Antwort ohne Hilfe. Speichere alle Karten vor dem nächsten Batch, prüfe eine Karte höchstens einmal pro Tag und speichere keine zusätzliche manuelle Mastery.

            Behandle natürliche Mehrfachwünsche als fortgeltende Absicht: Nenne bei einer offenen Personalisierung zuerst knapp den bestätigten Einstiegskontext und frage danach alle vom jüngsten SkillPilot-Kontext als noch offen aufgeführten Angaben gemeinsam ab. Akzeptiere Antworten mit mehreren Angaben in beliebiger Reihenfolge sowie Teilantworten. Wende jeden eindeutig bestimmten frischen Schritt direkt an, lade danach den Kontext neu und frage anschließend nur noch tatsächlich offene Entscheidungen. Später angekündigte Fragen sind keine vorgezogene Schreibberechtigung; mutiere ausschließlich über eine Option des jeweils jüngsten Kontexts. Behaupte Zustandsänderungen nur nach bestätigtem Erfolg. Bei einem 409-Konflikt lade den Kontext genau einmal neu. Bei SESSION_REQUIRED bleibt OAuth verbunden: bitte die lernende Person, SkillPilot zu öffnen und dort erneut „Lernen starten“ zu wählen; fordere weder Lernsession noch SkillPilot-ID an und verlange keine neue OAuth-Verbindung. Bei Authentifizierungs-, Schema-, Speicher- oder wiederholtem Konfliktfehler stoppe strukturierte Aktionen und sage transparent, dass der Zustand nicht zuverlässig gespeichert werden kann; rate nie, behaupte keinen wahrscheinlichen Erfolg und verspreche kein späteres Speichern.
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
                        "SkillPilot-Lerncoach starten oder fortsetzen",
                        "Verwende dieses Tool immer zuerst, wenn die lernende Person die App SkillPilot Coach "
                                + "DE v1 ausgewählt oder SkillPilot genannt hat und lernen, üben, eine "
                                + "Lerneinheit starten, fortsetzen oder wiederaufnehmen oder ihren gespeicherten "
                                + "Lernstand verwenden möchte. Es lädt den autoritativen persönlichen "
                                + "SkillPilot-Zustand für die im Startprompt enthaltene Lernsession. Verwende es "
                                + "außerdem nach einem neuen Chat, "
                                + "Reload, langem Dialog, möglicher Kontextkompaktierung, Kontextverlust oder "
                                + "Konflikt. Ersetze diesen Aufruf niemals durch allgemeine Lernberatung, einen "
                                + "selbst erstellten Lehrplan oder erfundene Lernziele. Verwende es nicht für "
                                + "allgemeine Fachfragen ohne SkillPilot-Bezug.",
                        emptyObjectSchema(),
                        contextSchema(),
                        true,
                        true,
                        false,
                        this::getContext),
                tool(
                        RENDER_GOAL_VISUALIZATION,
                        "Lernzielbild anzeigen",
                        "Zeigt ausschließlich das bereits freigegebene Bild des aktuell aktiven atomischen "
                                + "Lernziels an. Rufe dieses Tool genau einmal nur dann auf, wenn der jüngste "
                                + "SkillPilot-Kontext goalVisualization enthält, dessen goalId übereinstimmt und "
                                + "nextAllowedTools dieses Tool nennt. Ohne goalVisualization oder bei einer "
                                + "anderen goalId niemals aufrufen. Ändert keinen Zustand.",
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
                        "Navigationsoptionen laden",
                        "Lädt für einen ausdrücklichen Wechsel die aktuell erlaubten Optionen. target ist genau eines "
                                + "von curriculum, personalization, scope oder goal. Ändert keinen Zustand.",
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
                        "Lehrplan auswählen",
                        "Setzt genau eine curriculumId aus dem jüngsten Kontext oder Navigationsergebnis und gibt den "
                                + "frischen Folgezustand zurück.",
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
                        "Personalisierung fortsetzen",
                        "Führt genau eine aktuell erlaubte Personalisierungsaktion aus. Das kann eine fachliche "
                                + "Auswahl oder das ausdrückliche Abschließen der aktuellen Auswahlgruppe sein. "
                                + "Übergib ausschließlich die opake optionId aus structuredContent unverändert. "
                                + "Leite sie niemals aus Bezeichnungen ab.",
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
                        "Lernumfang auswählen",
                        "Ersetzt den Lernumfang durch eine oder mehrere aktuell erlaubte fachliche goalIds und gibt den "
                                + "frischen Folgezustand zurück.",
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
                        "Aktives Lernziel setzen",
                        "Aktiviert genau ein aktuell erlaubtes Frontier-Ziel. redirect=true nur bei einem ausdrücklich "
                                + "gewünschten Wechsel eines bereits aktiven Ziels.",
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
                        "Mastery speichern",
                        "Schließt genau das bestätigte aktive atomische Ziel mit Mastery 1.0 ab. Erst nach zwei "
                                + "unabhängigen sichtbaren Checks oder echtem mehrschrittigem Transfer in verändertem "
                                + "Kontext aufrufen; alle Aspekte des Ziels müssen geprüft sein. Nie für Cluster, "
                                + "Memorierungs-/SRS-Ziele, Selbsteinschätzung, Nachsprechen oder denselben "
                                + "vorgerechneten Fall verwenden.",
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
                        "Abrufprüfung starten",
                        "Startet oder setzt die strikte Kartenprüfung für das aktive Merkziel fort. batchSize liegt "
                                + "zwischen 1 und 20.",
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
                        "Sollantwort einer Karte laden",
                        "Lädt die Sollantwort genau einer Karte erst nachdem die lernende Person darauf geantwortet hat.",
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
                        "Kartenergebnis speichern",
                        "Speichert für genau eine Karte passed=true nur bei einer korrekten Antwort ohne Hilfe, sonst false.",
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
                        "Prüfungsbewertung laden",
                        "Lädt Lösung und Bewertungsraster ausschließlich für das aktive freigegebene Prüfungsziel und "
                                + "erst nach einer vollständigen sichtbaren Abgabe. Im Prüfungsmodus niemals nachfragen.",
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
                .title("SkillPilot-Lernzielbild")
                .description("Zeigt das freigegebene Bild des aktiven atomischen Lernziels.")
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
                "prefersBorder", true,
                "csp", csp);
        return Map.of(
                "ui", ui,
                "openai/widgetDescription",
                        "Freigegebene didaktische Visualisierung zum aktiven SkillPilot-Lernziel.",
                "openai/widgetDomain", OpenAiDeV1ContractMetadata.WIDGET_DOMAIN,
                "openai/widgetPrefersBorder", true,
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
                        "Für diesen SkillPilot-Schritt ist eine gültige OAuth-Verbindung erforderlich.",
                        null);
            }
            if (writeScope) {
                identityResolver.requireWriteAccess(transportContext);
            }
            if (writeScope) {
                if (sessionCoordinator == null) {
                    return operation.apply(skillpilotId, arguments);
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
                return operation.apply(skillpilotId, arguments);
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
                    "Für diesen SkillPilot-Schritt ist eine gültige OAuth-Verbindung erforderlich.",
                    null);
        } catch (AccessDeniedException exception) {
            telemetry.recordOperational(Event.FORBIDDEN);
            return authenticationErrorResult(
                    OpenAiDeV1ErrorCode.INSUFFICIENT_SCOPE,
                    identityResolver.insufficientScopeChallenge(),
                    "Die verbundene App hat für diesen SkillPilot-Schritt nicht den erforderlichen Zugriff.",
                    null);
        } catch (ResponseStatusException exception) {
            return responseStatusFailure(toolName, exception, null);
        } catch (IllegalArgumentException exception) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    "Die Eingaben für diesen SkillPilot-Schritt sind ungültig.",
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
                "OpenAI-DE MCP tool failed; correlationId={}, tool={}",
                correlationId,
                toolName,
                exception);
        if (isTimeout(exception)) {
            return errorResult(
                    OpenAiDeV1ErrorCode.TIMEOUT,
                    "Der SkillPilot-Schritt wurde wegen einer Zeitüberschreitung nicht bestätigt.",
                    metadata,
                    Map.of("reference", correlationId));
        }
        return errorResult(
                OpenAiDeV1ErrorCode.INTERNAL_ERROR,
                "Der SkillPilot-Schritt konnte wegen eines internen Fehlers nicht ausgeführt werden. Referenz: "
                        + correlationId,
                metadata,
                Map.of("reference", correlationId));
    }

    private McpSchema.CallToolResult getContext(String skillpilotId, Map<String, Object> arguments) {
        OpenAiDeCoachContext context = projectContext(
                skillpilotId,
                coachTools.getLearnerState(skillpilotId));
        return successResult(contextSummary(context), context);
    }

    private McpSchema.CallToolResult renderGoalVisualization(
            String skillpilotId,
            Map<String, Object> arguments) {
        String goalId = requiredString(arguments, "goalId");
        OpenAiDeCoachContext context = projectContext(
                skillpilotId,
                coachTools.getLearnerState(skillpilotId));
        OpenAiDeCoachContext.GoalVisualization visualization =
                context == null ? null : context.goalVisualization();
        if (visualization == null || !goalId.equals(visualization.goalId())) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    "Für das aktuelle Lernziel ist kein freigegebenes Lernzielbild verfügbar.",
                    null);
        }
        return successResult(
                "Freigegebenes Lernzielbild bereitgestellt.",
                new GoalVisualizationRenderResult(visualization));
    }

    private McpSchema.CallToolResult getNavigation(String skillpilotId, Map<String, Object> arguments) {
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
                            rawState.curriculum().getCurriculumId()));
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
                    "target muss curriculum, personalization, scope oder goal sein.");
        }
        NavigationResult result = new NavigationResult(
                target,
                requiredAction,
                decision,
                List.copyOf(options),
                "personalization".equals(target)
                        ? contextProjector.personalizationInstruction(decision, options)
                        : options.isEmpty()
                        ? "Aktuell sind keine sicheren Optionen verfügbar. Lade den Kontext erneut."
                        : "Übernimm ausschließlich die veröffentlichten Options-IDs unverändert. "
                                + "Frage nur nach, wenn der Wunsch inhaltlich nicht eindeutig ist.");
        return successResult("Navigationsoptionen für " + target + " geladen.", result);
    }

    private McpSchema.CallToolResult setCurriculum(String skillpilotId, Map<String, Object> arguments) {
        UpdateCurriculumRequest request = new UpdateCurriculumRequest();
        request.setCurriculumId(requiredString(arguments, "curriculumId"));
        return contextMutationResult(
                skillpilotId,
                "Lehrplan gespeichert; Folgezustand geladen.",
                coachTools.setCurriculum(skillpilotId, request));
    }

    private McpSchema.CallToolResult setPersonalization(String skillpilotId, Map<String, Object> arguments) {
        String optionId = requiredString(arguments, "optionId");
        PersonalizationRequest request = resolvePersonalizationRequest(
                skillpilotId,
                coachTools.getLearnerState(skillpilotId),
                optionId);
        return contextMutationResult(
                skillpilotId,
                "Personalisierung aktualisiert; Folgezustand geladen.",
                coachTools.setPersonalization(skillpilotId, request));
    }

    /** Resolves exactly one opaque ID from the currently published option set. */
    private PersonalizationRequest resolvePersonalizationRequest(
            String skillpilotId,
            UnifiedLearnerStateResponse state,
            String optionId) {
        List<OpenAiDeCoachContext.Option> allowedOptions = personalizationOptions(skillpilotId, state, false);
        if (allowedOptions.isEmpty()) {
            throw new IllegalArgumentException("Aktuell sind keine Personalisierungsoptionen verfügbar.");
        }
        List<OpenAiDeCoachContext.Option> matches = allowedOptions.stream()
                .filter(option -> option.id() != null && option.id().equals(optionId))
                .toList();
        if (matches.size() != 1) {
            throw new IllegalArgumentException(
                    "Die Personalisierungsoption ist unbekannt, veraltet oder mehrdeutig.");
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
            boolean navigation) {
        if (state == null || state.curriculum() == null) {
            return List.of();
        }
        PersonalizationPlan plan = coachTools.getPersonalizationPlan(skillpilotId);
        String rootLandscapeId = state.curriculum().getCurriculumId();
        return navigation
                ? contextProjector.personalizationNavigationOptions(plan, rootLandscapeId)
                : contextProjector.personalizationOptions(plan, rootLandscapeId);
    }

    private McpSchema.CallToolResult setScope(String skillpilotId, Map<String, Object> arguments) {
        List<String> goalIds = stringList(arguments, "goalIds", true);
        return contextMutationResult(
                skillpilotId,
                "Lernumfang gespeichert; Folgezustand geladen.",
                coachTools.setScope(skillpilotId, new ScopeRequest(goalIds)));
    }

    private McpSchema.CallToolResult setActiveGoal(String skillpilotId, Map<String, Object> arguments) {
        String goalId = requiredString(arguments, "goalId");
        Boolean redirect = optionalBoolean(arguments, "redirect");
        return contextMutationResult(
                skillpilotId,
                "Aktives Lernziel gespeichert; Folgezustand geladen.",
                coachTools.setActiveGoal(skillpilotId, new ActiveGoalRequest(goalId, redirect)));
    }

    private McpSchema.CallToolResult setMastery(String skillpilotId, Map<String, Object> arguments) {
        String goalId = requiredString(arguments, "goalId");
        UnifiedLearnerStateResponse before = coachTools.getLearnerState(skillpilotId);
        FrontierGoal active = activeGoal(before);
        if (active == null || !goalId.equals(active.id())) {
            return conflictResult();
        }
        if (!"atomic".equals(active.type()) || isMemoryGoal(active)) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    "Dieses Ziel darf nicht über die normale Coach-Mastery abgeschlossen werden.",
                    null);
        }
        CoachToolFacade.MasteryResult result = coachTools.setMastery(
                skillpilotId,
                new MasteryUpdateRequest(null, goalId));
        if (result.status() == CoachToolFacade.MasteryStatus.CONFLICT) {
            telemetry.recordOperational(Event.CONFLICT);
            return conflictResult();
        }
        UnifiedLearnerStateResponse state = result.status() == CoachToolFacade.MasteryStatus.CONFLICT
                ? result.state()
                : coachTools.getLearnerState(skillpilotId);
        MasteryToolResult response = new MasteryToolResult(
                result.status().name().toLowerCase(Locale.ROOT),
                result.update() == null ? null : result.update().savedGoalId(),
                result.update() == null ? null : result.update().savedMastery(),
                projectContext(skillpilotId, state),
                result.error());
        return successResult(
                result.status() == CoachToolFacade.MasteryStatus.UPDATED
                        ? "Mastery gespeichert; Folgezustand geladen."
                        : "Mastery nicht gespeichert; aktuellen Folgezustand beachten.",
                response);
    }

    private McpSchema.CallToolResult startRecall(String skillpilotId, Map<String, Object> arguments) {
        String goalId = requiredString(arguments, "goalId");
        Integer batchSize = optionalInteger(arguments, "batchSize");
        if (batchSize != null && (batchSize < 1 || batchSize > 20)) {
            throw new IllegalArgumentException("batchSize muss zwischen 1 und 20 liegen.");
        }
        RecallPromptResult result = recallPrompt(coachTools.startVerifiedRecall(
                skillpilotId,
                "de",
                new VerifiedRecallStartRequest(goalId, false, batchSize)));
        return successResult("Abrufprüfung geladen. Zeige jeweils nur die Frage, nicht die Sollantwort.", result);
    }

    private McpSchema.CallToolResult getRecallAnswer(String skillpilotId, Map<String, Object> arguments) {
        VerifiedRecallAnswerResponse response = coachTools.getVerifiedRecallAnswer(
                skillpilotId,
                "de",
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
        return successResult("Sollantwort nach der Lernendenantwort geladen; jetzt fachlich vergleichen.", result);
    }

    private McpSchema.CallToolResult recordRecallResult(String skillpilotId, Map<String, Object> arguments) {
        VerifiedRecallResultResponse response = coachTools.recordVerifiedRecallResult(
                skillpilotId,
                "de",
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
                projectContext(skillpilotId, coachTools.getLearnerState(skillpilotId)));
        return successResult("Kartenergebnis gespeichert; Folgezustand geladen.", result);
    }

    private McpSchema.CallToolResult getExamEvaluation(String skillpilotId, Map<String, Object> arguments) {
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
                "Bewerte die bereits vollständig vorliegende Abgabe Schritt für Schritt nach jedem Rasterkriterium "
                        + "und ausschließlich anhand sichtbar vorliegender Leistung. Die Musterlösung ist nur Referenz: "
                        + "Fachlich gleichwertige Ergebnisse, Darstellungen, Rundungen, Begründungen und korrekte "
                        + "alternative Lösungswege zählen voll, sofern Aufgabe oder Raster keine bestimmte Antwortform "
                        + "verlangt; ausdrückliche Anforderungen bleiben verbindlich. Fehlt eine ausdrücklich geforderte "
                        + "Deutung oder Begründung, erhält genau dieser Teil keine Punkte; trenne Teilpunkte sauber und "
                        + "begründe jeden Abzug konkret. Bewerte abschließend ohne Nachfrage. Benenne Unleserliches als "
                        + "solches und erfinde daraus keinen konkreten fachlichen Fehler. Speichere Mastery erst nach "
                        + "einem finalen Ergebnis mit mindestens passingPoints.");
        return successResult("Freigegebene Bewertungsgrundlage geladen; jetzt abschließend bewerten.", result);
    }

    private McpSchema.CallToolResult contextMutationResult(
            String skillpilotId,
            String summary,
            UnifiedLearnerStateResponse state) {
        return successResult(summary, projectContext(skillpilotId, state));
    }

    private OpenAiDeCoachContext projectContext(
            String skillpilotId,
            UnifiedLearnerStateResponse state) {
        PersonalizationPlan plan =
                state != null
                                && state.stateMachine() != null
                                && "setPersonalization".equals(state.stateMachine().requiredAction())
                        ? coachTools.getPersonalizationPlan(skillpilotId)
                        : PersonalizationPlan.complete(List.of());
        return contextProjector.project(
                state,
                plan,
                coachTools.showGoalVisualizationsInChat(skillpilotId));
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
                    versionResult(operation.apply(skillpilotId, arguments), metadata);
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
                    "Für diesen SkillPilot-Schritt ist eine gültige OAuth-Verbindung erforderlich.",
                    metadata);
        }
        if (exception instanceof AccessDeniedException) {
            telemetry.recordOperational(Event.FORBIDDEN);
            return authenticationErrorResult(
                    OpenAiDeV1ErrorCode.INSUFFICIENT_SCOPE,
                    identityResolver.insufficientScopeChallenge(),
                    "Die verbundene App hat für diesen SkillPilot-Schritt nicht den erforderlichen Zugriff.",
                    metadata);
        }
        if (exception instanceof ResponseStatusException responseStatusException) {
            return responseStatusFailure(toolName, responseStatusException, metadata);
        }
        if (exception instanceof IllegalArgumentException) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    "Die Eingaben für diesen SkillPilot-Schritt sind ungültig.",
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
                    "Für diesen SkillPilot-Schritt ist eine gültige OAuth-Verbindung erforderlich.",
                    metadata);
        }
        if (status == 403) {
            telemetry.recordOperational(Event.FORBIDDEN);
            return authenticationErrorResult(
                    OpenAiDeV1ErrorCode.INSUFFICIENT_SCOPE,
                    identityResolver.insufficientScopeChallenge(),
                    "Die verbundene App hat für diesen SkillPilot-Schritt nicht den erforderlichen Zugriff.",
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
                    "Der SkillPilot-Schritt wurde wegen einer vorübergehenden Zeit- oder Kapazitätsgrenze nicht bestätigt.",
                    metadata);
        }
        if (status == 503) {
            return errorResult(
                    OpenAiDeV1ErrorCode.SERVICE_UNAVAILABLE,
                    "Schreibende SkillPilot-Aktionen oder der benötigte Dienst sind vorübergehend nicht verfügbar.",
                    metadata);
        }
        if (exception.getStatusCode().is5xxServerError()) {
            return unexpectedErrorResult(toolName, exception, metadata);
        }
        if (status == 400 || status == 404 || status == 422) {
            return errorResult(
                    OpenAiDeV1ErrorCode.INVALID_INPUT,
                    "Die Eingaben für diesen SkillPilot-Schritt sind ungültig.",
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
            instruction = "Die vorbereitete Lernsession gehört zu einer nicht mehr verfügbaren Workflow- oder "
                    + "Curriculumrevision. Öffne SkillPilot und wähle erneut „Lernen starten“.";
            details.put("oauthConnectionValid", true);
            details.put("startUrl", sessionStartUrl);
        } else if (code == OpenAiDeV1ErrorCode.IDEMPOTENCY_KEY_REUSED) {
            instruction = "Diese clientRequestId wurde bereits für einen anderen Schreibversuch verwendet. "
                    + "Lade den aktuellen Kontext neu und verwende für einen neuen Versuch eine neue clientRequestId.";
        } else {
            instruction = "Lade den aktuellen SkillPilot-Kontext genau einmal neu. Verwende danach dessen stateVersion "
                    + "und für einen neuen fachlichen Schreibversuch eine neue clientRequestId.";
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
                ? "Der SkillPilot-Schritt konnte nicht ausgeführt werden."
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
        return McpSchema.CallToolResult.builder()
                .isError(true)
                .addTextContent(safeMessage + " Der Schritt wurde nicht bestätigt; behaupte keine Speicherung und "
                        + "setze den strukturierten Ablauf erst nach einem stabilen frischen Kontext fort.")
                .structuredContent(content)
                .build();
    }

    private McpSchema.CallToolResult conflictResult() {
        return conflictResult(null);
    }

    private McpSchema.CallToolResult conflictResult(OpenAiDeV1SessionMetadata metadata) {
        telemetry.recordOperational(Event.CONFLICT);
        String instruction = "Der SkillPilot-Zustand hat sich geändert. Lade den aktuellen Kontext genau einmal neu "
                + "und entscheide ausschließlich anhand dieses Zustands; bei einem weiteren Konflikt stoppe transparent.";
        return errorResult(
                OpenAiDeV1ErrorCode.STATE_CONFLICT,
                instruction,
                metadata,
                Map.of(
                        "reloadContextAtMostOnce", true,
                        "instruction", instruction));
    }

    private McpSchema.CallToolResult sessionRequiredResult() {
        String instruction = "Öffne SkillPilot und wähle dort erneut „Lernen starten“. "
                + "Die OAuth-Verbindung bleibt bestehen; gib keinen Token und keine SkillPilot-ID im Chat ein.";
        return errorResult(
                OpenAiDeV1ErrorCode.SESSION_REQUIRED,
                "Deine SkillPilot-Lernsession fehlt oder ist abgelaufen. " + instruction,
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

    private String contextSummary(OpenAiDeCoachContext context) {
        if (context == null) {
            return "SkillPilot-Kontext ist derzeit nicht verfügbar.";
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
            StringBuilder summary = new StringBuilder("SkillPilot-Kontext geladen");
            if (establishedContext != null && !establishedContext.isBlank()) {
                summary.append(". ").append(establishedContext.trim());
            }
            if (!openTopics.isBlank()) {
                summary.append(" Noch gemeinsam zu klären: ").append(openTopics).append('.');
            }
            String value = summary.toString();
            return value.endsWith(".") || value.endsWith("!") || value.endsWith("?")
                    ? value
                    : value + '.';
        }
        String goal = context.activeGoal() == null || context.activeGoal().title() == null
                ? "kein aktives Lernziel"
                : "aktives Lernziel: " + context.activeGoal().title();
        return "SkillPilot-Kontext geladen; " + goal + "; nächster Schritt: "
                + (context.requiredAction().isBlank() ? "keine Backend-Aktion" : context.requiredAction()) + ".";
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
                                "Aus der aktuellen SkillPilot-Startnachricht exakt und unverändert übernehmen "
                                        + "und bei jedem Tool-Aufruf mitsenden."));
        if (writeScope) {
            properties.put(
                    EXPECTED_STATE_VERSION,
                    Map.of(
                            "type", "integer",
                            "minimum", 0,
                            "description",
                                    "stateVersion aus dem jüngsten erfolgreichen SkillPilot-Ergebnis "
                                            + "unverändert übernehmen."));
            properties.put(
                    CLIENT_REQUEST_ID,
                    Map.of(
                            "type", "string",
                            "description",
                                    "Für jeden neuen fachlichen Schreibversuch eine neue UUID erzeugen; "
                                            + "für einen unveränderten Retry dieselbe UUID wiederverwenden."));
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
                "description", "Aus dem jüngsten SkillPilot-Ergebnis unverändert übernehmen.");
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
        McpSchema.CallToolResult apply(String skillpilotId, Map<String, Object> arguments);
    }

}
