package com.skillpilot.backend.openai.mcp.de;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.ActiveGoalRequest;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.MasteryUpdateRequest;
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
import com.skillpilot.backend.service.OpenAiDeLearningSessionRequiredException;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

/**
 * Complete, data-only German OpenAI MCP contract for the SkillPilot coach.
 *
 * <p>The class deliberately owns neither HTTP transport nor OAuth lifecycle.
 * It publishes native stateless MCP specifications and resolves identity only
 * through {@link OpenAiDeCoachIdentityResolver}.</p>
 */
@Component
@ConditionalOnProperty(
        name = {"skillpilot.openai.de.enabled", "skillpilot.openai.de.oauth.enabled"},
        havingValue = "true")
public final class OpenAiDeCoachMcpContract {

    private static final Logger LOGGER = LoggerFactory.getLogger(OpenAiDeCoachMcpContract.class);

    public static final String READ_SCOPE = "skillpilot.openai.de.read";
    public static final String WRITE_SCOPE = "skillpilot.openai.de.write";

    public static final String GET_CONTEXT = "get_skillpilot_context_de";
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

    private static final String SERVER_INSTRUCTIONS = """
            Du bist der deutsche SkillPilot-Lerncoach. Wenn SkillPilot Coach (Deutsch) für den Chat ausgewählt oder ausdrücklich genannt wurde und die lernende Person lernen, üben, eine Lerneinheit starten, fortsetzen oder wiederaufnehmen oder ihren Lernstand verwenden möchte, rufe vor der ersten fachlichen Antwort get_skillpilot_context_de auf. Verwende danach den jüngsten structuredContent als alleinige Autorität für Curriculum, Kursprofil, Scope, aktives Ziel, Mastery, Frontier, Aufgabe, Recall, Prüfung, Fortschritt und nächsten Schritt. Ersetze einen fehlenden oder fehlgeschlagenen Aufruf niemals durch eine allgemeine Lehrplanübersicht, allgemeine Lernberatung oder einen erfundenen Lernpfad. Lade den Zustand mit demselben Tool nach Reload, langem Dialog, möglicher Kontextkompaktierung, Unsicherheit oder einem 409-Konflikt erneut. Nach einer Mutation gilt ausschließlich der frische Folgezustand.

            Antworte auf Deutsch, klar, ermutigend und altersangemessen. Nenne der lernenden Person keine Tool-, API-, JSON- oder Feldnamen und keine technischen IDs. Gib niemals OAuth-Tokens, Verbindungssubjekte, permanente SkillPilot-IDs oder andere Geheimnisse aus und fordere sie nie an. Verwende Backend-URLs ausschließlich wortgetreu; konstruiere keine Links aus IDs und hänge keine Tokens an. Fehlt ein freigegebener Link, verwende nur https://skillpilot.com. Schreibe Mathematik nur mit \\(...\\) inline oder \\[...\\] abgesetzt, nie mit Dollar-Delimiter.

            Führe dialogisch an genau einem bestätigten atomischen Ziel: prüfe kurz Vorwissen, stütze mit kleinen Hinweisen, lasse selbst arbeiten und gib die Lösung der unmittelbar folgenden Aufgabe nicht vor. Bewerte fachlich, nicht nach Wortlaut. Anerkenne gleichwertige korrekte Ergebnisse, Darstellungen, Begründungen und alternative Lösungswege vollständig; ausdrücklich verlangte Formate, Einheiten, Prozentangaben, Begründungen und sonstige Kriterien bleiben bindend. Speichere Mastery nur für das aktive Ziel und erst nach genau zwei unabhängigen Checks oder echtem mehrschrittigem Transfer in verändertem Kontext; prüfe alle Aspekte. Selbsteinschätzung, Wiederholung oder derselbe vorgerechnete Fall reichen nicht. Cluster- und Memorierungsziele werden nie manuell gemeistert.

            Im Prüfungsmodus gib taskContent wortgetreu aus und ändere nur Dollar-TeX-Begrenzer. Wenn activeGoal.exam.hasImage=true, gib vor der Aufgabe exakt activeGoal.cockpitUrl aus und sage, dass dort die Abbildung liegt; erfinde oder beschreibe das Bild nicht. Gib keine Hinweise, Teilantworten, Lösungen oder Scaffolds und stelle keine Nachfragen. Warte auf eine vollständige sichtbare Abgabe und rufe get_skillpilot_exam_evaluation_de erst danach auf. Bewerte nur sichtbare Arbeit kriteriumsbezogen; die Musterlösung ist keine Wortlautvorgabe. Gleichwertige Wege zählen voll. Benenne Unleserliches ohne einen Fachfehler zu erfinden. Speichere Mastery nur nach finalem Bestehen mit mindestens passingPoints.

            Bei Verified Recall zeige den vollständigen Fragenbatch und warte auf alle Antworten. Rufe jede Sollantwort erst nach der zugehörigen Lernendenantwort ab, akzeptiere fachlich gleichwertige Formulierungen und speichere jede Karte sofort; passed=true nur bei korrekter Antwort ohne Hilfe. Speichere alle Karten vor dem nächsten Batch, prüfe eine Karte höchstens einmal pro Tag und speichere keine zusätzliche manuelle Mastery.

            Behandle natürliche Mehrfachwünsche als fortgeltende Absicht: wende eindeutige frische Schritte direkt an und frage nur offene Entscheidungen. Behaupte Zustandsänderungen nur nach bestätigtem Erfolg. Bei einem 409-Konflikt lade den Kontext genau einmal neu. Bei SESSION_REQUIRED bleibt OAuth verbunden: bitte die lernende Person, SkillPilot zu öffnen und dort erneut „Lernen starten“ zu wählen; fordere weder Token noch SkillPilot-ID an und verlange keine neue OAuth-Verbindung. Bei Authentifizierungs-, Schema-, Speicher- oder wiederholtem Konfliktfehler stoppe strukturierte Aktionen und sage transparent, dass der Zustand nicht zuverlässig gespeichert werden kann; rate nie, behaupte keinen wahrscheinlichen Erfolg und verspreche kein späteres Speichern.
            """;

    private final CoachToolFacade coachTools;
    private final CoachStateProjection stateProjection;
    private final OpenAiDeCoachIdentityResolver identityResolver;
    private final OpenAiDeMcpTelemetry telemetry;
    private final OpenAiDeCoachContextProjector contextProjector;
    private final String sessionStartUrl;
    private final List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications;

    public OpenAiDeCoachMcpContract(
            CoachToolFacade coachTools,
            CoachStateProjection stateProjection,
            OpenAiDeCoachIdentityResolver identityResolver,
            OpenAiDeMcpTelemetry telemetry,
            @Value("${skillpilot.public-base-url:https://skillpilot.com}") String publicBaseUrl) {
        this.coachTools = coachTools;
        this.stateProjection = stateProjection;
        this.identityResolver = identityResolver;
        this.telemetry = telemetry;
        this.contextProjector = new OpenAiDeCoachContextProjector(stateProjection, publicBaseUrl);
        this.sessionStartUrl = normalizePublicBaseUrl(publicBaseUrl);
        this.toolSpecifications = buildToolSpecifications();
    }

    public String serverInstructions() {
        return SERVER_INSTRUCTIONS;
    }

    public List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications() {
        return toolSpecifications;
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record NavigationResult(
            String target,
            String requiredAction,
            List<OpenAiDeCoachContext.Option> options,
            String instruction) {
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
            CoachToolFacade.ExamScoring scoring,
            String instruction) {
    }

    private List<McpStatelessServerFeatures.SyncToolSpecification> buildToolSpecifications() {
        return List.of(
                tool(
                        GET_CONTEXT,
                        "SkillPilot-Lerncoach starten oder fortsetzen",
                        "Verwende dieses Tool immer zuerst, wenn die lernende Person die App SkillPilot Coach "
                                + "(Deutsch) ausgewählt oder SkillPilot genannt hat und lernen, üben, eine "
                                + "Lerneinheit starten, fortsetzen oder wiederaufnehmen oder ihren gespeicherten "
                                + "Lernstand verwenden möchte. Es lädt den autoritativen persönlichen "
                                + "SkillPilot-Zustand ohne Argumente. Verwende es außerdem nach einem neuen Chat, "
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
                        objectSchema(Map.of("curriculumId", nonEmptyStringSchema()), List.of("curriculumId")),
                        contextSchema(),
                        false,
                        true,
                        true,
                        this::setCurriculum),
                tool(
                        SET_PERSONALIZATION,
                        "Kursausprägung auswählen",
                        "Setzt die aktuell erlaubte Personalisierung. Verwende ausschließlich goalIds beziehungsweise "
                                + "filterIds aus structuredContent; nicht verwendete Liste leer übergeben.",
                        objectSchema(
                                Map.of(
                                        "goalIds", stringArraySchema(0),
                                        "filterIds", stringArraySchema(0)),
                                List.of("goalIds", "filterIds")),
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
                        objectSchema(Map.of("goalIds", stringArraySchema(1)), List.of("goalIds")),
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
                                        "goalId", nonEmptyStringSchema(),
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
                        objectSchema(Map.of("goalId", nonEmptyStringSchema()), List.of("goalId")),
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
                                        "goalId", nonEmptyStringSchema(),
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
                                        "goalId", nonEmptyStringSchema(),
                                        "cardId", nonEmptyStringSchema()),
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
                                        "goalId", nonEmptyStringSchema(),
                                        "cardId", nonEmptyStringSchema(),
                                        "passed", booleanSchema(),
                                        "feedback", stringSchema()),
                                List.of("goalId", "cardId", "passed")),
                        recallResultSchema(),
                        false,
                        false,
                        true,
                        this::recordRecallResult),
                tool(
                        GET_EXAM_EVALUATION,
                        "Prüfungsbewertung laden",
                        "Lädt Lösung und Bewertungsraster ausschließlich für das aktive freigegebene Prüfungsziel und "
                                + "erst nach einer vollständigen sichtbaren Abgabe. Im Prüfungsmodus niemals nachfragen.",
                        objectSchema(Map.of("goalId", nonEmptyStringSchema()), List.of("goalId")),
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
        McpSchema.Tool descriptor = McpSchema.Tool.builder()
                .name(name)
                .title(title)
                .description(description)
                .inputSchema(inputSchema)
                .outputSchema(outputSchema)
                .annotations(McpSchema.ToolAnnotations.builder()
                        .title(title)
                        .readOnlyHint(readOnly)
                        .destructiveHint(false)
                        .idempotentHint(idempotent)
                        .openWorldHint(false)
                        .build())
                // Apps SDK reads the standard OpenAI mirror from the MCP _meta object.
                .meta(Map.of("securitySchemes", securitySchemes))
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

    private McpSchema.CallToolResult executeWithTelemetry(
            String toolName,
            McpTransportContext transportContext,
            Map<String, Object> arguments,
            boolean writeScope,
            ToolOperation operation) {
        try {
            return telemetry.record(
                    toolName,
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
            String skillpilotId = identityResolver.resolveSkillpilotId(transportContext);
            if (skillpilotId == null || skillpilotId.isBlank()) {
                telemetry.recordOperational(Event.UNAUTHORIZED);
                return SkillPilotMcpToolResults.authenticationRequired(identityResolver.authenticationChallenge());
            }
            if (writeScope) {
                identityResolver.requireWriteAccess(transportContext);
            }
            return operation.apply(skillpilotId, arguments);
        } catch (OpenAiDeLearningSessionRequiredException exception) {
            telemetry.recordOperational(Event.SESSION_REQUIRED);
            return sessionRequiredResult();
        } catch (AuthenticationException exception) {
            telemetry.recordOperational(Event.UNAUTHORIZED);
            return SkillPilotMcpToolResults.authenticationRequired(identityResolver.authenticationChallenge());
        } catch (AccessDeniedException exception) {
            telemetry.recordOperational(Event.FORBIDDEN);
            return SkillPilotMcpToolResults.authenticationRequired(identityResolver.insufficientScopeChallenge());
        } catch (ResponseStatusException exception) {
            if (exception.getStatusCode().value() == 409) {
                return conflictResult();
            }
            if (exception.getStatusCode().value() == 401) {
                telemetry.recordOperational(Event.UNAUTHORIZED);
            } else if (exception.getStatusCode().value() == 403) {
                telemetry.recordOperational(Event.FORBIDDEN);
            } else if (exception.getStatusCode().value() == 408) {
                telemetry.recordOperational(Event.TIMEOUT);
            }
            if (exception.getStatusCode().is5xxServerError()) {
                return unexpectedErrorResult(toolName, exception);
            }
            if (exception.getStatusCode().value() == 400
                    || exception.getStatusCode().value() == 422) {
                return errorResult("Die Eingaben für diesen SkillPilot-Schritt sind ungültig.");
            }
            return errorResult("Der SkillPilot-Schritt konnte im aktuellen Zustand nicht ausgeführt werden.");
        } catch (IllegalArgumentException exception) {
            return errorResult("Die Eingaben für diesen SkillPilot-Schritt sind ungültig.");
        } catch (RuntimeException exception) {
            return unexpectedErrorResult(toolName, exception);
        }
    }

    private McpSchema.CallToolResult unexpectedErrorResult(String toolName, RuntimeException exception) {
        telemetry.recordException(exception);
        String correlationId = UUID.randomUUID().toString();
        LOGGER.error(
                "OpenAI-DE MCP tool failed; correlationId={}, tool={}",
                correlationId,
                toolName,
                exception);
        return errorResult(
                "Der SkillPilot-Schritt konnte wegen eines internen Fehlers nicht ausgeführt werden. Referenz: "
                        + correlationId);
    }

    private McpSchema.CallToolResult getContext(String skillpilotId, Map<String, Object> arguments) {
        OpenAiDeCoachContext context = contextProjector.project(coachTools.getLearnerState(skillpilotId));
        return successResult(contextSummary(context), context);
    }

    private McpSchema.CallToolResult getNavigation(String skillpilotId, Map<String, Object> arguments) {
        String target = requiredString(arguments, "target").toLowerCase(Locale.ROOT);
        UnifiedLearnerStateResponse rawState = coachTools.getLearnerState(skillpilotId);
        List<OpenAiDeCoachContext.Option> options = new ArrayList<>();
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
                options.addAll(contextProjector.personalizationOptions(rawState.curriculum()));
                if (options.isEmpty() && rawState.stateMachine() != null
                        && rawState.stateMachine().goalOptions() != null) {
                    for (FrontierGoal goal : contextProjector.projectNavigationGoals(
                            rawState.stateMachine().goalOptions())) {
                        add(options, contextProjector.goalOption(goal, "personalization"));
                    }
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
                List.copyOf(options),
                options.isEmpty()
                        ? "Aktuell sind keine sicheren Optionen verfügbar. Lade den Kontext erneut."
                        : "Verwende ausschließlich eine oder mehrere fachliche IDs aus diesen Optionen. "
                                + "Frage nur nach, wenn der Wunsch inhaltlich nicht eindeutig ist.");
        return successResult("Navigationsoptionen für " + target + " geladen.", result);
    }

    private McpSchema.CallToolResult setCurriculum(String skillpilotId, Map<String, Object> arguments) {
        UpdateCurriculumRequest request = new UpdateCurriculumRequest();
        request.setCurriculumId(requiredString(arguments, "curriculumId"));
        return contextMutationResult(
                "Lehrplan gespeichert; Folgezustand geladen.",
                coachTools.setCurriculum(skillpilotId, request));
    }

    private McpSchema.CallToolResult setPersonalization(String skillpilotId, Map<String, Object> arguments) {
        List<String> goalIds = stringList(arguments, "goalIds", false);
        List<String> filterIds = stringList(arguments, "filterIds", false);
        if (goalIds.isEmpty() && filterIds.isEmpty()) {
            throw new IllegalArgumentException("goalIds und filterIds dürfen nicht beide leer sein.");
        }
        return contextMutationResult(
                "Kursausprägung gespeichert; Folgezustand geladen.",
                coachTools.setPersonalization(
                        skillpilotId,
                        new PersonalizationRequest(Map.of(), goalIds, filterIds)));
    }

    private McpSchema.CallToolResult setScope(String skillpilotId, Map<String, Object> arguments) {
        List<String> goalIds = stringList(arguments, "goalIds", true);
        return contextMutationResult(
                "Lernumfang gespeichert; Folgezustand geladen.",
                coachTools.setScope(skillpilotId, new ScopeRequest(goalIds)));
    }

    private McpSchema.CallToolResult setActiveGoal(String skillpilotId, Map<String, Object> arguments) {
        String goalId = requiredString(arguments, "goalId");
        Boolean redirect = optionalBoolean(arguments, "redirect");
        return contextMutationResult(
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
                    "Dieses Ziel darf nicht über die normale Coach-Mastery abgeschlossen werden.");
        }
        CoachToolFacade.MasteryResult result = coachTools.setMastery(
                skillpilotId,
                new MasteryUpdateRequest(null, goalId));
        if (result.status() == CoachToolFacade.MasteryStatus.CONFLICT) {
            telemetry.recordOperational(Event.CONFLICT);
        }
        UnifiedLearnerStateResponse state = result.status() == CoachToolFacade.MasteryStatus.CONFLICT
                ? result.state()
                : coachTools.getLearnerState(skillpilotId);
        MasteryToolResult response = new MasteryToolResult(
                result.status().name().toLowerCase(Locale.ROOT),
                result.update() == null ? null : result.update().savedGoalId(),
                result.update() == null ? null : result.update().savedMastery(),
                contextProjector.project(state),
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
                contextProjector.project(coachTools.getLearnerState(skillpilotId)));
        return successResult("Kartenergebnis gespeichert; Folgezustand geladen.", result);
    }

    private McpSchema.CallToolResult getExamEvaluation(String skillpilotId, Map<String, Object> arguments) {
        CoachToolFacade.ExamEvaluationResult response = coachTools.getExamEvaluation(
                skillpilotId,
                new CoachToolFacade.ExamEvaluationRequest(requiredString(arguments, "goalId")));
        ExamEvaluationResult result = new ExamEvaluationResult(
                response.goalId(),
                stateProjection.projectReleasedEvaluationContent(response.solutionContent()),
                response.scoring(),
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
            String summary,
            UnifiedLearnerStateResponse state) {
        return successResult(summary, contextProjector.project(state));
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

    private McpSchema.CallToolResult errorResult(String message) {
        String safeMessage = message == null || message.isBlank()
                ? "Der SkillPilot-Schritt konnte nicht ausgeführt werden."
                : message;
        return McpSchema.CallToolResult.builder()
                .isError(true)
                .addTextContent(safeMessage + " Der Schritt wurde nicht bestätigt; behaupte keine Speicherung und "
                        + "setze den strukturierten Ablauf erst nach einem stabilen frischen Kontext fort.")
                .structuredContent(Map.of(
                        "status", "error",
                        "message", safeMessage,
                        "stateChanged", false,
                        "recovery", "Stoppe den strukturierten Ablauf und lade erst nach Behebung einen frischen Kontext."))
                .build();
    }

    private McpSchema.CallToolResult conflictResult() {
        telemetry.recordOperational(Event.CONFLICT);
        return McpSchema.CallToolResult.builder()
                .isError(true)
                .addTextContent("Der SkillPilot-Zustand hat sich geändert. Der Schritt wurde nicht bestätigt. Lade "
                        + "den aktuellen Kontext genau einmal neu und entscheide ausschließlich anhand dieses Zustands; "
                        + "bei einem weiteren Konflikt stoppe transparent.")
                .structuredContent(Map.of(
                        "status", "conflict",
                        "stateChanged", false,
                        "reloadContextAtMostOnce", true))
                .build();
    }

    private McpSchema.CallToolResult sessionRequiredResult() {
        String instruction = "Öffne SkillPilot und wähle dort erneut „Lernen starten“. "
                + "Die OAuth-Verbindung bleibt bestehen; gib keinen Token und keine SkillPilot-ID im Chat ein.";
        return McpSchema.CallToolResult.builder()
                .isError(true)
                .addTextContent("Deine SkillPilot-Lernsession fehlt oder ist abgelaufen. " + instruction)
                .structuredContent(Map.of(
                        "status", "session_required",
                        "code", "SESSION_REQUIRED",
                        "stateChanged", false,
                        "oauthConnectionValid", true,
                        "startUrl", sessionStartUrl,
                        "instruction", instruction))
                .build();
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

    private static Map<String, Object> contextSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("learningState", stringSchema());
        properties.put("requiredAction", stringSchema());
        properties.put("interactionMode", stringSchema());
        properties.put("curriculum", curriculumSchema());
        properties.put("activeGoal", activeGoalSchema());
        properties.put("options", objectArraySchema(optionSchema()));
        properties.put("frontier", objectArraySchema(goalSchema()));
        properties.put("resources", objectArraySchema(resourceSchema()));
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
        return objectSchema(
                Map.of(
                        "target", stringSchema(),
                        "requiredAction", stringSchema(),
                        "options", objectArraySchema(optionSchema()),
                        "instruction", stringSchema()),
                List.of("target", "requiredAction", "options", "instruction"));
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

    @FunctionalInterface
    private interface ToolOperation {
        McpSchema.CallToolResult apply(String skillpilotId, Map<String, Object> arguments);
    }

}
