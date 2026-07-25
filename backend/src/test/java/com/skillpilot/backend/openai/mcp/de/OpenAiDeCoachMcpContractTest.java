package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.MasteryUpdateRequest;
import com.skillpilot.backend.api.MasteryUpdateResponse;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.PersonalizationRequest;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.api.VerifiedRecallPromptCard;
import com.skillpilot.backend.api.VerifiedRecallPromptResponse;
import com.skillpilot.backend.domain.CopySource;
import com.skillpilot.backend.landscape.ExamData;
import com.skillpilot.backend.landscape.LandscapeFilter;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.mcp.SkillPilotMcpToolResults;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.service.OpenAiDeLearningSessionRequiredException;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.json.jackson3.JacksonMcpJsonMapperSupplier;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.server.ResponseStatusException;

class OpenAiDeCoachMcpContractTest {

    private static final String LEARNER_ID = "permanent-secret-learner-id";
    private static final String CONNECTION_SECRET = "opaque-oauth-subject-secret";
    private static final String CHALLENGE = "Bearer resource_metadata=\"https://skillpilot.test/meta\"";
    private static final String INSUFFICIENT_SCOPE_CHALLENGE =
            "Bearer resource_metadata=\"https://skillpilot.test/meta\", error=\"insufficient_scope\"";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private CoachToolFacade coachTools;
    private OpenAiDeCoachIdentityResolver identityResolver;
    private OpenAiDeCoachMcpContract contract;
    private SimpleMeterRegistry meterRegistry;

    @BeforeEach
    void setUp() {
        coachTools = mock(CoachToolFacade.class);
        identityResolver = mock(OpenAiDeCoachIdentityResolver.class);
        when(identityResolver.resolveSkillpilotId(any())).thenReturn(LEARNER_ID);
        when(identityResolver.authenticationChallenge()).thenReturn(CHALLENGE);
        when(identityResolver.insufficientScopeChallenge()).thenReturn(INSUFFICIENT_SCOPE_CHALLENGE);
        meterRegistry = new SimpleMeterRegistry();
        contract = new OpenAiDeCoachMcpContract(
                coachTools,
                new CoachStateProjection("https://skillpilot.test"),
                identityResolver,
                new OpenAiDeMcpTelemetry(
                        meterRegistry,
                        new OpenAiDeOperationalTelemetry(meterRegistry)),
                "https://skillpilot.test");
    }

    @Test
    void publishesExactlyElevenNativeDataOnlyToolsWithSchemasSecurityAndAnnotations() {
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = contract.toolSpecifications();

        assertThat(tools).hasSize(11);
        assertThat(tools.stream().map(spec -> spec.tool().name())).containsExactly(
                OpenAiDeCoachMcpContract.GET_CONTEXT,
                OpenAiDeCoachMcpContract.GET_NAVIGATION,
                OpenAiDeCoachMcpContract.SET_CURRICULUM,
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
                OpenAiDeCoachMcpContract.SET_SCOPE,
                OpenAiDeCoachMcpContract.SET_ACTIVE_GOAL,
                OpenAiDeCoachMcpContract.SET_MASTERY,
                OpenAiDeCoachMcpContract.START_RECALL,
                OpenAiDeCoachMcpContract.GET_RECALL_ANSWER,
                OpenAiDeCoachMcpContract.RECORD_RECALL_RESULT,
                OpenAiDeCoachMcpContract.GET_EXAM_EVALUATION);

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
            assertThat(tool.meta()).doesNotContainKeys("openai/outputTemplate", "openai/widgetAccessible");
        }
        assertThat(spec(OpenAiDeCoachMcpContract.GET_CONTEXT).tool().annotations().readOnlyHint()).isTrue();
        assertThat(spec(OpenAiDeCoachMcpContract.SET_MASTERY).tool().annotations().readOnlyHint()).isFalse();
        assertThat(spec(OpenAiDeCoachMcpContract.RECORD_RECALL_RESULT).tool().annotations().idempotentHint())
                .isFalse();
        assertThat(spec(OpenAiDeCoachMcpContract.SET_SCOPE).tool().meta().toString())
                .contains(OpenAiDeCoachMcpContract.READ_SCOPE, OpenAiDeCoachMcpContract.WRITE_SCOPE);
        assertThat(spec(OpenAiDeCoachMcpContract.SET_MASTERY).tool().inputSchema().get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties)
                        .containsOnlyKeys("goalId"));
    }

    @Test
    void contextToolIsTheSingleExplicitBootstrapForSkillpilotLearningIntents() {
        McpSchema.Tool bootstrap = spec(OpenAiDeCoachMcpContract.GET_CONTEXT).tool();

        assertThat(bootstrap.title()).isEqualTo("SkillPilot-Lerncoach starten oder fortsetzen");
        assertThat(bootstrap.description())
                .contains("immer zuerst")
                .contains("SkillPilot Coach (Deutsch)")
                .contains("lernen, üben")
                .contains("Lerneinheit starten, fortsetzen oder wiederaufnehmen")
                .contains("gespeicherten Lernstand")
                .contains("autoritativen persönlichen SkillPilot-Zustand")
                .contains("allgemeine Lernberatung")
                .contains("selbst erstellten Lehrplan")
                .contains("nicht für allgemeine Fachfragen ohne SkillPilot-Bezug");
        assertThat(bootstrap.inputSchema())
                .containsEntry("type", "object")
                .containsEntry("additionalProperties", false);
        assertThat(bootstrap.inputSchema().get("properties"))
                .isInstanceOfSatisfying(Map.class, properties -> assertThat(properties).isEmpty());
        assertThat(bootstrap.annotations().readOnlyHint()).isTrue();
        assertThat(bootstrap.annotations().idempotentHint()).isTrue();
        assertThat(bootstrap.meta().toString())
                .contains(OpenAiDeCoachMcpContract.READ_SCOPE)
                .doesNotContain(OpenAiDeCoachMcpContract.WRITE_SCOPE);
        assertThat(contract.toolSpecifications().stream()
                        .filter(specification -> specification.tool().description() != null
                                && specification.tool().description().contains("immer zuerst")))
                .singleElement()
                .extracting(specification -> specification.tool().name())
                .isEqualTo(OpenAiDeCoachMcpContract.GET_CONTEXT);
    }

    @Test
    void nativeMcpSerializationPublishesOutputSchemaAnnotationsAndOpenAiSecurityMirror() throws Exception {
        String json = new JacksonMcpJsonMapperSupplier().get().writeValueAsString(
                spec(OpenAiDeCoachMcpContract.SET_SCOPE).tool());

        assertThat(json)
                .contains("\"outputSchema\"")
                .contains("\"annotations\"")
                .contains("\"readOnlyHint\":false")
                .contains("\"destructiveHint\":false")
                .contains("\"idempotentHint\":true")
                .contains("\"openWorldHint\":false")
                .contains("\"_meta\"")
                .contains("\"securitySchemes\"")
                .contains(OpenAiDeCoachMcpContract.READ_SCOPE, OpenAiDeCoachMcpContract.WRITE_SCOPE);
    }

    @Test
    void contextUsesRealContentAndStructuredContentWithoutLearnerIdSecretsOrExamSolution() throws Exception {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(releasedExamState());

        McpSchema.CallToolResult result = call(OpenAiDeCoachMcpContract.GET_CONTEXT, Map.of());

        assertThat(result.isError()).isFalse();
        assertThat(result.content()).singleElement().isInstanceOfSatisfying(
                McpSchema.TextContent.class,
                text -> assertThat(text.text())
                        .contains("SkillPilot-Kontext geladen")
                        .doesNotContain(LEARNER_ID, CONNECTION_SECRET, "SECRET SOLUTION"));
        assertThat(result.structuredContent()).isInstanceOf(OpenAiDeCoachContext.class);
        assertMatchesOutputSchema(OpenAiDeCoachMcpContract.GET_CONTEXT, result);
        String nativeResultJson = new JacksonMcpJsonMapperSupplier().get().writeValueAsString(result);
        assertThat(nativeResultJson)
                .contains("\"content\"")
                .contains("\"structuredContent\"")
                .doesNotContain(":null", LEARNER_ID, "SECRET SOLUTION");
        OpenAiDeCoachContext context = (OpenAiDeCoachContext) result.structuredContent();
        assertThat(context.curriculum().curriculumId()).isEqualTo("curriculum-public-id");
        assertThat(context.activeGoal().goalId()).isEqualTo("exam-public-id");
        assertThat(context.activeGoal().exam().taskContent()).isEqualTo("Sichtbare Prüfungsaufgabe");
        assertThat(context.activeGoal().exam().maxPoints()).isEqualTo(10.0);
        assertThat(context.instruction())
                .contains("keine lösungslenkenden Hinweise")
                .contains("keine Nachfragen")
                .contains(OpenAiDeCoachMcpContract.GET_EXAM_EVALUATION);
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
    void serverAndExamInstructionsRequireEquivalentSolutionsExplicitCriteriaAndNoExamQuestions() {
        assertThat(contract.serverInstructions())
                .contains("vor der ersten fachlichen Antwort " + OpenAiDeCoachMcpContract.GET_CONTEXT)
                .contains("allgemeine Lehrplanübersicht")
                .contains("erfundenen Lernpfad")
                .contains("Bewerte fachlich, nicht nach Wortlaut")
                .contains("alternative Lösungswege")
                .contains("ausdrücklich verlangte Formate")
                .contains("stelle keine Nachfragen")
                .contains("Sollantwort erst nach")
                .contains("permanente SkillPilot-IDs")
                .contains("zwei unabhängigen Checks")
                .contains("URLs ausschließlich wortgetreu")
                .contains("nie mit Dollar-Delimiter")
                .contains("activeGoal.exam.hasImage=true")
                .contains("exakt activeGoal.cockpitUrl")
                .contains("erfinde oder beschreibe das Bild nicht")
                .contains("Kontext genau einmal neu");

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
                OpenAiDeCoachMcpContract.GET_EXAM_EVALUATION,
                Map.of("goalId", "exam-public-id"));
        OpenAiDeCoachMcpContract.ExamEvaluationResult evaluation =
                (OpenAiDeCoachMcpContract.ExamEvaluationResult) result.structuredContent();
        assertMatchesOutputSchema(OpenAiDeCoachMcpContract.GET_EXAM_EVALUATION, result);

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
                OpenAiDeCoachMcpContract.SET_MASTERY,
                Map.of("goalId", "goal-public-id"));

        assertThat(result.isError()).isFalse();
        OpenAiDeCoachMcpContract.MasteryToolResult payload =
                (OpenAiDeCoachMcpContract.MasteryToolResult) result.structuredContent();
        assertMatchesOutputSchema(OpenAiDeCoachMcpContract.SET_MASTERY, result);
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

        call(OpenAiDeCoachMcpContract.SET_MASTERY, Map.of("goalId", "goal-public-id"));

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
                OpenAiDeCoachMcpContract.SET_MASTERY,
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
                OpenAiDeCoachMcpContract.START_RECALL,
                Map.of("goalId", "memory-public-id", "batchSize", 2));

        String json = objectMapper.writeValueAsString(result.structuredContent());
        assertMatchesOutputSchema(OpenAiDeCoachMcpContract.START_RECALL, result);
        String nativeJson = new JacksonMcpJsonMapperSupplier().get().writeValueAsString(result);
        assertThat(nativeJson).doesNotContain(":null", LEARNER_ID, "skillpilotId", "expectedAnswer");
        assertThat(json)
                .contains("memory-public-id", "card-public-id", "Was gilt?")
                .doesNotContain(":null")
                .doesNotContain(LEARNER_ID, "skillpilotId", "expectedAnswer");
        verify(identityResolver, never()).requireWriteAccess(any());
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
                OpenAiDeCoachMcpContract.GET_NAVIGATION,
                Map.of("target", "curriculum"));
        OpenAiDeCoachMcpContract.NavigationResult navigation =
                (OpenAiDeCoachMcpContract.NavigationResult) result.structuredContent();
        assertMatchesOutputSchema(OpenAiDeCoachMcpContract.GET_NAVIGATION, result);

        assertThat(navigation.requiredAction()).isEqualTo("setCurriculum");
        assertThat(navigation.options()).singleElement().satisfies(option -> {
            assertThat(option.id()).isEqualTo("curriculum-2");
            assertThat(option.label()).isEqualTo("Mathematik Hessen");
        });
        verify(coachTools).getCurriculumOptions(LEARNER_ID);
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
                OpenAiDeCoachMcpContract.GET_NAVIGATION,
                Map.of("target", "personalization"));
        OpenAiDeCoachMcpContract.NavigationResult navigation =
                (OpenAiDeCoachMcpContract.NavigationResult) result.structuredContent();
        assertMatchesOutputSchema(OpenAiDeCoachMcpContract.GET_NAVIGATION, result);

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
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
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
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
                Map.of(
                        "goalIds", List.of(),
                        "filterIds", List.of("Atlantis")));

        assertThat(result.isError()).isTrue();
        assertThat(result.content().toString()).contains("ungültig");
        verify(coachTools, never()).setPersonalization(any(), any());
    }

    @Test
    void personalizationRejectsSeveralMutuallyExclusiveOptionsWithoutMutation() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(personalizationState());

        McpSchema.CallToolResult result = call(
                OpenAiDeCoachMcpContract.SET_PERSONALIZATION,
                Map.of(
                        "goalIds", List.of(),
                        "filterIds", List.of("Hessen", "Bayern")));

        assertThat(result.isError()).isTrue();
        assertThat(result.content().toString()).contains("ungültig");
        verify(coachTools, never()).setPersonalization(any(), any());
    }

    @Test
    void expiredLearningSessionReturnsSessionRequiredWithoutAnOauthChallenge() {
        when(identityResolver.resolveSkillpilotId(any()))
                .thenThrow(new OpenAiDeLearningSessionRequiredException());

        McpSchema.CallToolResult result = call(OpenAiDeCoachMcpContract.GET_CONTEXT, Map.of());

        assertThat(result.isError()).isTrue();
        assertThat(result.meta()).isNull();
        assertThat(result.structuredContent()).isInstanceOfSatisfying(Map.class, content -> assertThat(content)
                .containsEntry("status", "session_required")
                .containsEntry("code", "SESSION_REQUIRED")
                .containsEntry("stateChanged", false)
                .containsEntry("oauthConnectionValid", true)
                .containsEntry("startUrl", "https://skillpilot.test"));
        assertThat(result.content().toString())
                .contains("Lernen starten")
                .doesNotContain(LEARNER_ID, CONNECTION_SECRET, CHALLENGE);
        verify(coachTools, never()).getLearnerState(any());
        assertThat(operationalEvents("session_required")).isEqualTo(1);
        assertThat(operationalEvents("http_401")).isZero();
    }

    @Test
    void missingWriteScopeBecomesSpecificMcpChallengeWithoutCallingFacade() {
        org.mockito.Mockito.doThrow(new AccessDeniedException("secret internal reason"))
                .when(identityResolver)
                .requireWriteAccess(any());

        McpSchema.CallToolResult result = call(
                OpenAiDeCoachMcpContract.SET_SCOPE,
                Map.of("goalIds", List.of("goal-public-id")));

        assertThat(result.isError()).isTrue();
        assertThat(result.meta())
                .containsEntry(
                        SkillPilotMcpToolResults.WWW_AUTHENTICATE_META_KEY,
                        List.of(INSUFFICIENT_SCOPE_CHALLENGE));
        assertThat(result.content().toString()).doesNotContain("secret internal reason", LEARNER_ID);
        verify(coachTools, never()).setScope(any(), any());
        assertThat(operationalEvents("http_403")).isEqualTo(1);
    }

    @Test
    void authenticationConflictAndTimeoutUseOnlyBoundedOperationalEvents() {
        when(identityResolver.resolveSkillpilotId(any()))
                .thenThrow(new AuthenticationCredentialsNotFoundException("private authentication detail"));

        McpSchema.CallToolResult unauthorized = call(OpenAiDeCoachMcpContract.GET_CONTEXT, Map.of());

        assertThat(unauthorized.isError()).isTrue();
        assertThat(unauthorized.content().toString()).doesNotContain("private authentication detail");
        assertThat(operationalEvents("http_401")).isEqualTo(1);
        assertThat(operationalEvents("tool_exception")).isZero();

        org.mockito.Mockito.doReturn(LEARNER_ID)
                .when(identityResolver)
                .resolveSkillpilotId(any());
        org.mockito.Mockito.doThrow(new ResponseStatusException(HttpStatus.CONFLICT, "private conflict detail"))
                .when(coachTools)
                .getLearnerState(LEARNER_ID);

        McpSchema.CallToolResult conflict = call(OpenAiDeCoachMcpContract.GET_CONTEXT, Map.of());

        assertThat(conflict.isError()).isTrue();
        assertThat(conflict.content().toString())
                .contains("Kontext genau einmal neu")
                .doesNotContain("private conflict detail");
        assertThat(operationalEvents("http_409")).isEqualTo(1);
        assertThat(operationalEvents("tool_exception")).isZero();

        org.mockito.Mockito.doThrow(new IllegalStateException(
                        "private timeout detail",
                        new java.util.concurrent.TimeoutException("private cause")))
                .when(coachTools)
                .getLearnerState(LEARNER_ID);

        McpSchema.CallToolResult timeout = call(OpenAiDeCoachMcpContract.GET_CONTEXT, Map.of());

        assertThat(timeout.isError()).isTrue();
        assertThat(timeout.content().toString()).doesNotContain("private timeout detail", "private cause");
        assertThat(operationalEvents("tool_exception")).isEqualTo(1);
        assertThat(operationalEvents("timeout")).isEqualTo(1);
    }

    @Test
    void unexpectedProviderFailureReturnsOnlyFixedMessageAndCorrelationId() {
        String secretToken = "oauth-access-token-must-not-leak";
        when(coachTools.getLearnerState(LEARNER_ID)).thenThrow(new IllegalStateException(
                "database failure learner=" + LEARNER_ID + " token=" + secretToken));

        McpSchema.CallToolResult result = call(OpenAiDeCoachMcpContract.GET_CONTEXT, Map.of());

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
