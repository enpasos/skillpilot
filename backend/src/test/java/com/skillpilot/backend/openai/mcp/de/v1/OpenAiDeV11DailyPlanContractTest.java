package com.skillpilot.backend.openai.mcp.de.v1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.api.FrontierGoal;
import com.skillpilot.backend.api.GoalStats;
import com.skillpilot.backend.api.LearnerGoals;
import com.skillpilot.backend.api.LearnerLearningPlanApi;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.api.StateMachineInfo;
import com.skillpilot.backend.api.UnifiedLearnerStateResponse;
import com.skillpilot.backend.landscape.LandscapeSummary;
import com.skillpilot.backend.openai.de.OpenAiDeProperties;
import com.skillpilot.backend.openai.de.health.OpenAiDeCoachHealthIndicator;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachIdentityResolver;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeMcpTelemetry;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeLearningPlanToday;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import io.modelcontextprotocol.common.McpTransportContext;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.spec.McpSchema;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class OpenAiDeV11DailyPlanContractTest {

    private static final String LEARNER_ID = "permanent-secret-learner-id";
    private static final String LEARNING_SESSION_ID =
            "sps_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    private static final String SERVER_BUILD = "0123456789abcdef0123456789abcdef01234567";
    private static final String SIGNING_SECRET =
            "skillpilot-openai-v11-daily-plan-contract-test-secret";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private CoachToolFacade coachTools;
    private OpenAiDeCoachIdentityResolver identityResolver;
    private OpenAiDeV1McpSessionCoordinator sessionCoordinator;
    private OpenAiDeMcpTelemetry telemetry;

    @BeforeEach
    void setUp() {
        coachTools = mock(CoachToolFacade.class);
        identityResolver = mock(OpenAiDeCoachIdentityResolver.class);
        sessionCoordinator = mock(OpenAiDeV1McpSessionCoordinator.class);
        SimpleMeterRegistry meterRegistry = new SimpleMeterRegistry();
        telemetry = new OpenAiDeMcpTelemetry(
                meterRegistry,
                new OpenAiDeOperationalTelemetry(meterRegistry));

        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(noActiveGoalState());
        when(coachTools.getPersonalizationPlan(LEARNER_ID)).thenReturn(PersonalizationPlan.complete(List.of()));
        when(identityResolver.resolveSkillpilotId(any(), eq(LEARNING_SESSION_ID)))
                .thenReturn(LEARNER_ID);
        when(sessionCoordinator.read(any(), any())).thenAnswer(invocation ->
                invoke(invocation.getArgument(1), 7L));
        when(sessionCoordinator.write(
                        any(),
                        any(),
                        anyLong(),
                        any(),
                        any(),
                        any()))
                .thenAnswer(invocation -> invoke(invocation.getArgument(5), 8L));
    }

    @Test
    void explicitLegacyFixtureKeepsTwelveToolsWithoutPlanProjection() {
        OpenAiDeV1McpContractAdapter contract = new OpenAiDeV1McpContractAdapter(
                coachTools,
                new CoachStateProjection("https://skillpilot.com"),
                identityResolver,
                telemetry,
                "https://skillpilot.com");

        assertThat(contract.toolSpecifications()).hasSize(12);
        assertThat(contract.toolSpecifications().stream().map(spec -> spec.tool().name()))
                .doesNotContain(
                        OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT,
                        OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN);
    }

    @Test
    void enabledSurfaceAddsOnlyTheTwoStrictDailyPlanTools() {
        OpenAiDeV1McpContractAdapter disabled = contract(false);
        OpenAiDeV1McpContractAdapter enabled = contract(true);

        assertThat(enabled.toolSpecifications()).hasSize(14);
        assertThat(enabled.toolSpecifications().stream().map(spec -> spec.tool().name()))
                .endsWith(OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN,
                        OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT)
                .doesNotContain("get_skillpilot_daily_plan");
        assertThat(enabled.serverInstructions()).contains("learningPlanToday", "Status-only", "completedToday");
        assertThat(objectMapper.<JsonNode>valueToTree(enabled.resourceSpecifications()))
                .isEqualTo(objectMapper.valueToTree(disabled.resourceSpecifications()));
        JsonNode currentSchema = objectMapper.valueToTree(spec(enabled,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool().outputSchema());
        assertThat(currentSchema.path("properties").has("learningPlanToday")).isTrue();
        JsonNode legacySchema = objectMapper.valueToTree(spec(disabled,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool().outputSchema());
        assertThat(legacySchema.path("properties").has("learningPlanToday")).isFalse();
        McpSchema.Tool subject = spec(enabled,
                OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT).tool();
        assertThat(subject.annotations().readOnlyHint()).isFalse();
        assertThat(subject.annotations().destructiveHint()).isFalse();
        assertThat(subject.annotations().idempotentHint()).isTrue();
        assertThat(subject.inputSchema().get("required")).isEqualTo(List.of(
                "subject",
                OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID));

        McpSchema.Tool resume = spec(
                enabled,
                OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN).tool();
        assertThat(resume.annotations().readOnlyHint()).isFalse();
        assertThat(resume.annotations().destructiveHint()).isFalse();
        assertThat(resume.annotations().idempotentHint()).isTrue();
        assertThat(resume.inputSchema().get("required"))
                .isEqualTo(List.of(
                        OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                        OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID));
    }

    @Test
    void healthGateExpectsFourteenToolsOnlyWhenTheDailyPlanFlagIsEnabled() {
        OpenAiDeV1McpContractAdapter enabled = contract(true);
        OpenAiDeCoachHealthIndicator indicator = new OpenAiDeCoachHealthIndicator(
                new OpenAiDeProperties(),
                Optional.of(enabled),
                Optional.empty(),
                false,
                true);

        assertThat(indicator.health().getDetails())
                .containsEntry("contractToolCount", 14)
                .containsEntry("contractExpectedToolCount", 14);
    }

    @Test
    void dailyPlanReadReturnsAdditiveLocalizedCountsWithoutInternalIds() {
        OpenAiDeV1McpContractAdapter contract = contract(true);
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(new LearnerPlanTodayStatus(
                        LocalDate.parse("2026-09-04"),
                        true,
                        true,
                        List.of(
                                new LearnerPlanTodayStatus.SubjectStatus(
                                        "secret-math-landscape",
                                        "Mathematik",
                                        3,
                                        1,
                                        2,
                                        4),
                                new LearnerPlanTodayStatus.SubjectStatus(
                                        "secret-physics-landscape",
                                        "Physik",
                                        2,
                                        2,
                                        0,
                                        1)),
                        new LearnerPlanTodayStatus.Totals(5, 3, 2, 5),
                        1));

        McpSchema.CallToolResult response = call(
                contract,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID));

        assertThat(response.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(response.structuredContent()).path("learningPlanToday");
        assertThat(content.path("asOf").asText()).isEqualTo("2026-09-04");
        assertThat(content.path("followLearningPlans").asBoolean()).isTrue();
        assertThat(content.path("resumeAvailable").asBoolean()).isTrue();
        assertThat(content.path("subjects").get(0).path("subject").asText())
                .isEqualTo("Mathematik");
        assertThat(content.path("subjects").get(1).path("subject").asText())
                .isEqualTo("Physik");
        assertThat(content.path("totals").path("dueToday").asInt()).isEqualTo(5);
        assertThat(content.path("totals").path("completedToday").asInt()).isEqualTo(3);
        assertThat(content.path("totals").path("openToday").asInt()).isEqualTo(2);
        assertThat(content.path("totals").path("openOverdue").asInt()).isEqualTo(5);
        assertThat(content.path("unavailablePlanCount").asInt()).isEqualTo(1);
        assertThat(content.toString())
                .doesNotContain(
                        "secret-math-landscape",
                        "secret-physics-landscape",
                        "landscapeId",
                        "planId");
        verify(coachTools).getLearningPlanTodayStatus(LEARNER_ID, "de-DE");
    }

    @Test
    void dailyPlanReadSanitizesAndMergesSubjectsAndRecomputesTrustedTotals() {
        OpenAiDeV1McpContractAdapter contract = contract(true);
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(new LearnerPlanTodayStatus(
                        LocalDate.parse("2026-09-04"),
                        true,
                        true,
                        List.of(
                                new LearnerPlanTodayStatus.SubjectStatus(
                                        "secret-math-a", "Mathematik\n", 3, 1, 2, 4),
                                new LearnerPlanTodayStatus.SubjectStatus(
                                        "secret-math-b", "Mathematik", 2, 1, 1, 1),
                                new LearnerPlanTodayStatus.SubjectStatus(
                                        "secret-physics", "Physik\u0000", 4, 1, 3, 2),
                                new LearnerPlanTodayStatus.SubjectStatus(
                                        "secret-control-only", "\u0000\u200B", 1, 0, 1, 0),
                                new LearnerPlanTodayStatus.SubjectStatus(
                                        "secret-invalid-counts", "Privat", 1, 1, 1, 0)),
                        new LearnerPlanTodayStatus.Totals(999, 999, 999, 999),
                        2));

        McpSchema.CallToolResult response = call(
                contract,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID));

        assertThat(response.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(response.structuredContent()).path("learningPlanToday");
        assertThat(content.path("subjects")).hasSize(2);
        assertThat(content.path("subjects").get(0).path("subject").asText())
                .isEqualTo("Mathematik");
        assertThat(content.path("subjects").get(0).path("dueToday").asInt()).isEqualTo(5);
        assertThat(content.path("subjects").get(0).path("completedToday").asInt()).isEqualTo(2);
        assertThat(content.path("subjects").get(0).path("openToday").asInt()).isEqualTo(3);
        assertThat(content.path("subjects").get(0).path("openOverdue").asInt()).isEqualTo(5);
        assertThat(content.path("subjects").get(1).path("subject").asText())
                .isEqualTo("Physik");
        assertThat(content.path("totals").path("dueToday").asInt()).isEqualTo(9);
        assertThat(content.path("totals").path("completedToday").asInt()).isEqualTo(3);
        assertThat(content.path("totals").path("openToday").asInt()).isEqualTo(6);
        assertThat(content.path("totals").path("openOverdue").asInt()).isEqualTo(7);
        assertThat(content.path("unavailablePlanCount").asInt()).isEqualTo(4);
        assertThat(content.path("resumeAvailable").asBoolean()).isTrue();
        assertThat(content.toString())
                .doesNotContain(
                        "secret-",
                        "Privat",
                        "\\u0000",
                        "\\u200b");
    }

    @Test
    void dailyPlanReadSuppressesResumeWhenEverySubjectEntryIsInvalid() {
        OpenAiDeV1McpContractAdapter contract = contract(true);
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(new LearnerPlanTodayStatus(
                        LocalDate.parse("2026-09-04"),
                        true,
                        true,
                        List.of(new LearnerPlanTodayStatus.SubjectStatus(
                                "secret-invalid", "\u0000", 1, 0, 1, 0)),
                        new LearnerPlanTodayStatus.Totals(1, 0, 1, 0),
                        0));

        McpSchema.CallToolResult response = call(
                contract,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID));

        assertThat(response.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(response.structuredContent()).path("learningPlanToday");
        assertThat(content.path("subjects")).isEmpty();
        assertThat(content.path("totals").path("dueToday").asInt()).isZero();
        assertThat(content.path("resumeAvailable").asBoolean()).isFalse();
        assertThat(content.path("unavailablePlanCount").asInt()).isEqualTo(1);
    }

    @Test
    void resumeUsesTheVersionedWriteAndReturnsOnlyTheFreshExistingContext() {
        OpenAiDeV1McpContractAdapter contract = contract(true);
        UnifiedLearnerStateResponse state = activeGoalState();
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(availablePlanStatus());
        UUID internalPlanId = UUID.fromString("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee");
        when(coachTools.resumeLearningPlan(LEARNER_ID, "de-DE"))
                .thenReturn(new LearnerLearningPlanApi.TransitionResponse(
                        internalPlanId,
                        9L,
                        "secret-math-landscape",
                        "secret-plan-focus",
                        "goal-1",
                        true,
                        state));
        when(coachTools.getPersonalizationPlan(LEARNER_ID))
                .thenReturn(PersonalizationPlan.complete(List.of()));
        when(coachTools.showGoalVisualizationsInChat(LEARNER_ID)).thenReturn(false);
        String requestId = "11111111-2222-4333-8444-555555555555";

        McpSchema.CallToolResult response = call(
                contract,
                OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN,
                Map.of(
                        OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID,
                        LEARNING_SESSION_ID,
                        OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION,
                        7L,
                        OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID,
                        requestId));

        assertThat(response.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(response.structuredContent());
        assertThat(content.path("status").asText()).isEqualTo("resumed");
        assertThat(content.path("changed").asBoolean()).isTrue();
        assertThat(content.path("context").path("activeGoal").path("goalId").asText())
                .isEqualTo("goal-1");
        assertThat(content.path("stateVersion").asLong()).isEqualTo(8L);
        assertThat(content.toString())
                .doesNotContain(
                        internalPlanId.toString(),
                        "secret-math-landscape",
                        "secret-plan-focus",
                        "planId",
                        "landscapeId",
                        "focusGoalId");
        verify(sessionCoordinator).write(
                eq(LEARNING_SESSION_ID),
                eq(OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN),
                eq(7L),
                eq(requestId),
                any(),
                any());
        verify(coachTools).resumeLearningPlan(LEARNER_ID, "de-DE");
    }

    @Test
    void productionSpringDefaultsEnableCurrentContract() throws Exception {
        var constructor = java.util.Arrays.stream(OpenAiDeV1McpContractAdapter.class.getConstructors())
                .filter(candidate -> candidate.isAnnotationPresent(
                        org.springframework.beans.factory.annotation.Autowired.class))
                .findFirst().orElseThrow();
        assertThat(constructor.getParameters()[8].getAnnotation(
                org.springframework.beans.factory.annotation.Value.class).value())
                .isEqualTo("${skillpilot.openai.coach.v1.daily-plan-tools-enabled:true}");
        assertThat(new OpenAiDeProperties().getWorkflowVersion()).isEqualTo("coach@1.1");
    }

    @Test
    void fullContextReadsTodayWithoutAdvancingStateAndSuppressesFutureGoalChoices() {
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE")).thenReturn(availablePlanStatus());
        var response = call(contract(true), OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());
        JsonNode content = objectMapper.valueToTree(response.structuredContent());
        assertThat(response.isError()).isFalse();
        assertThat(content.path("requiredAction").asText()).isEqualTo("resume");
        assertThat(content.path("frontier")).isEmpty();
        assertThat(content.path("options")).isEmpty();
        assertThat(content.path("learningPlanToday").path("guidance").path("state").asText())
                .isEqualTo("resume");
        assertThat(content.path("nextAllowedTools").toString())
                .contains(OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN)
                .doesNotContain(OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL);
        verify(coachTools, never()).resumeLearningPlan(any(), any());
        verify(coachTools, never()).switchLearningPlanSubject(any(), any(), any());
        verify(coachTools).getLearnerState(LEARNER_ID);
        verify(coachTools).getLearningPlanTodayStatus(LEARNER_ID, "de-DE");
    }

    @Test
    void currentInstructionsPrioritizeStatusPauseAndSubjectIntentBeforeRendering() {
        var adapter = contract(true);
        assertThat(adapter.serverInstructions()).startsWith("PRIORITY BEFORE ALL RENDERING")
                .contains("only a short acknowledgement", "Neither permits an unsolicited visualization",
                        "Resolve an explicit subject request before rendering the old active goal",
                        "These intent checks override automatic goal/renderer/mode steps");
        assertThat(spec(adapter, OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION).tool().description())
                .startsWith("Do not render for status-only questions or pauses.");
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(activeGoalState());
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE")).thenReturn(switchableStatus());
        var result = call(adapter, OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());
        assertThat(result.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(result.structuredContent());
        assertThat(content.path("learningPlanToday").path("guidance").path("instruction").asText())
                .contains("no unsolicited visualization, navigation, exercise or write",
                        "before rendering the old goal");
        verify(coachTools, never()).resumeLearningPlan(any(), any());
        verify(coachTools, never()).switchLearningPlanSubject(any(), any(), any());
        verify(coachTools, never()).setMastery(any(), any());
        // These backend assertions do not claim that a live model follows the published priority.
    }

    @ParameterizedTest
    @CsvSource({"true,0,0,complete", "true,1,0,blocked", "true,0,1,unavailable", "false,1,0,paused"})
    void noEligiblePlanPublishesAuthoritativeGuidance(boolean follow, int open, int unavailable, String expected) {
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(new LearnerPlanTodayStatus(LocalDate.parse("2026-09-09"), follow, false,
                        List.of(new LearnerPlanTodayStatus.SubjectStatus("private-math", "Mathematik",
                                2, 2 - open, open, 0)), new LearnerPlanTodayStatus.Totals(2, 2 - open, open, 0),
                        unavailable));
        JsonNode content = objectMapper.valueToTree(call(contract(true),
                OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments()).structuredContent());
        assertThat(content.path("learningPlanToday").path("guidance").path("state").asText()).isEqualTo(expected);
        assertThat(content.path("learningPlanToday").path("resumeAvailable").asBoolean()).isFalse();
        if (follow) {
            assertThat(content.path("frontier")).isEmpty();
            assertThat(content.path("options")).isEmpty();
            assertThat(content.path("requiredAction").asText()).isEqualTo(expected);
        }
        verify(coachTools, never()).resumeLearningPlan(any(), any());
    }

    @Test
    void missingStatusIsNotInventedZeroWorkloadAndDoesNotBlockActiveTeaching() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(activeGoalState());
        var response = call(contract(true), OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());
        JsonNode content = objectMapper.valueToTree(response.structuredContent());
        assertThat(response.isError()).isFalse();
        assertThat(content.path("activeGoal").path("goalId").asText()).isEqualTo("goal-1");
        assertThat(content.path("learningPlanToday").path("guidance").path("state").asText())
                .isEqualTo("unavailable");
        assertThat(content.path("learningPlanToday").has("asOf")).isFalse();
        assertThat(response.content().toString()).contains("nicht auswertbar").doesNotContain("0/0");
    }

    @Test
    void learnerWithoutPlansRetainsTheNormalContextSummaryAndFrontier() {
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(new LearnerPlanTodayStatus(LocalDate.parse("2026-09-09"), false, false,
                        List.of(), new LearnerPlanTodayStatus.Totals(0, 0, 0, 0), 0));
        var response = call(contract(true), OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());
        assertThat(response.isError()).isFalse();
        assertThat(response.content().toString()).contains("SkillPilot-Kontext geladen")
                .doesNotContain("nicht auswertbar", "0/0");
        JsonNode content = objectMapper.valueToTree(response.structuredContent());
        assertThat(content.path("requiredAction").asText()).isEqualTo("setActiveGoal");
        assertThat(content.path("frontier")).hasSize(1);
        assertThat(content.path("learningPlanToday").path("guidance").path("state").asText()).isEqualTo("paused");
    }

    @Test
    void sanitizedOrTruncatedLabelsRemainCountOnlyAndNeverAdvertiseAnUnusableSwitch() {
        String longLabel = "P".repeat(130);
        var projection = OpenAiDeLearningPlanToday.project(new LearnerPlanTodayStatus(
                LocalDate.parse("2026-09-09"), true, false,
                List.of(new LearnerPlanTodayStatus.SubjectStatus("a", "Physik\n", 1, 0, 1, 0, false, true),
                        new LearnerPlanTodayStatus.SubjectStatus("b", longLabel, 2, 0, 2, 0, false, true)),
                null, 0), false, false);
        assertThat(projection.subjects()).hasSize(2).allSatisfy(subject -> {
            assertThat(subject.canContinue()).isFalse();
            assertThat(subject.subject().length()).isLessThanOrEqualTo(120);
        });
        assertThat(projection.totals().openToday()).isEqualTo(3);
    }

    @Test
    void compactSummaryUsesCurrentMasteryCountsAndWarnsAboutPartialPlans() {
        var projection = OpenAiDeLearningPlanToday.project(new LearnerPlanTodayStatus(
                LocalDate.parse("2026-09-09"), true, true,
                List.of(new LearnerPlanTodayStatus.SubjectStatus("private-math", "Mathematik", 21, 2, 19, 0),
                        new LearnerPlanTodayStatus.SubjectStatus("private-physics", "Physik", 27, 0, 27, 0)),
                new LearnerPlanTodayStatus.Totals(999, 999, 999, 999), 1), false, false);
        assertThat(projection.summary(false)).isEqualTo(
                "Heute: 2/48 beherrscht · Offen: Mathematik 19 · Physik 27 · Nicht auswertbare Pläne: 1");
        assertThat(projection.summary(true)).isEqualTo(
                "Today: 2/48 mastered · Open: Mathematik 19 · Physik 27 · Unavailable plans: 1");
        assertThat(projection.summary(false)).doesNotContain("Rückstand", "heute geschafft");
    }

    @Test
    void overflowAndAmbiguousSubjectLabelsCannotAuthorizeASubjectSwitch() {
        var projection = OpenAiDeLearningPlanToday.project(new LearnerPlanTodayStatus(
                LocalDate.parse("2026-09-09"), true, true,
                List.of(new LearnerPlanTodayStatus.SubjectStatus("a", "Mathematik", Integer.MAX_VALUE,
                                0, Integer.MAX_VALUE, 0, false, true),
                        new LearnerPlanTodayStatus.SubjectStatus("b", "Mathematik", 1, 0, 1, 0, false, true)),
                null, 0), false, false);
        assertThat(projection.subjects()).isEmpty();
        assertThat(projection.resumeAvailable()).isFalse();
        assertThat(projection.unavailablePlanCount()).isEqualTo(2);
        assertThat(projection.guidance().state()).isEqualTo("unavailable");
        var duplicate = OpenAiDeLearningPlanToday.project(new LearnerPlanTodayStatus(
                LocalDate.parse("2026-09-09"), true, false,
                List.of(new LearnerPlanTodayStatus.SubjectStatus("a", "Mathematik", 1, 0, 1, 0, false, true),
                        new LearnerPlanTodayStatus.SubjectStatus("b", "Mathematik", 1, 0, 1, 0, false, true)),
                null, 0), false, false);
        assertThat(duplicate.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.canContinue()).isFalse();
            assertThat(subject.openToday()).isEqualTo(2);
        });
    }

    @Test
    void resumeRefusesExistingActiveGoalAndUnavailableDailyPlanBeforeMutation() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(activeGoalState());
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE")).thenReturn(availablePlanStatus());
        assertThat(call(contract(true), OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN, writeArguments())
                .isError()).isTrue();
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(noActiveGoalState());
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE")).thenReturn(null);
        assertThat(call(contract(true), OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN, writeArguments())
                .isError()).isTrue();
        verify(coachTools, never()).resumeLearningPlan(any(), any());
    }

    @Test
    void subjectSwitchRequiresExactPublishedAvailableNonCurrentLabel() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(activeGoalState());
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(switchableStatus());
        for (String invalid : List.of("Mathematik", "private-physics", "physics", "Chemie")) {
            assertThat(call(contract(true), OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT,
                    switchArguments(invalid)).isError()).isTrue();
        }
        verify(coachTools, never()).switchLearningPlanSubject(any(), any(), any());
    }

    @Test
    void activeExamCannotBeInterruptedByResumeOrSubjectSwitch() {
        UnifiedLearnerStateResponse state = activeGoalState();
        FrontierGoal exam = new FrontierGoal("exam-1", "Prüfung", "Aufgabe", "atomic", "exam", null,
                "frontier", List.of(), List.of(), null, null, null, null);
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(new UnifiedLearnerStateResponse(
                state.skillpilotId(), state.curriculum(), state.frontier(), state.goals(), state.nextAllowedActions(),
                state.activeFilters(), state.copySources(), "learning", exam,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), exam)));
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE")).thenReturn(switchableStatus());
        assertThat(call(contract(true), OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT,
                switchArguments("Physik")).isError()).isTrue();
        assertThat(call(contract(true), OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN,
                writeArguments()).isError()).isTrue();
        verify(coachTools, never()).switchLearningPlanSubject(any(), any(), any());
        verify(coachTools, never()).resumeLearningPlan(any(), any());
    }

    @Test
    void subjectSwitchReturnsOnlyConfirmedFreshContextAndNeverMarksParkedGoalMastered() {
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(activeGoalState());
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(switchableStatus(), switchedStatus());
        when(coachTools.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                .thenReturn(new LearnerLearningPlanApi.TransitionResponse(UUID.randomUUID(), 10L,
                        "private-physics", "private-focus", "goal-physics", true, physicsGoalState()));
        var response = call(contract(true), OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT,
                switchArguments("Physik"));
        assertThat(response.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(response.structuredContent());
        assertThat(content.path("status").asText()).isEqualTo("switched");
        assertThat(content.path("context").has("learningPlanToday")).isTrue();
        assertThat(content.path("context").path("activeGoal").path("goalId").asText()).isEqualTo("goal-physics");
        assertThat(content.path("context").path("learningPlanToday").path("subjects").get(1)
                .path("current").asBoolean()).isTrue();
        assertThat(content.toString()).doesNotContain("private-physics", "private-focus", "planId");
        verify(coachTools).switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik");
        verify(coachTools, never()).setMastery(any(), any());
        verify(identityResolver).requireWriteAccess(any());
        verify(sessionCoordinator).write(eq(LEARNING_SESSION_ID),
                eq(OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT), eq(7L),
                eq("11111111-2222-4333-8444-555555555555"), any(), any());
    }

    @Test
    void realCoordinatorMakesSubjectSwitchIdempotentAndRejectsStaleConflictingOrUnauthorisedWrites() throws Exception {
        useRealSessionCoordinator();
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(activeGoalState());
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(switchableStatus(), switchedStatus());
        when(coachTools.switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik"))
                .thenReturn(new LearnerLearningPlanApi.TransitionResponse(UUID.randomUUID(), 10L,
                        "private-physics", "private-focus", "goal-physics", true, physicsGoalState()));
        var adapter = contract(true);
        var first = call(adapter, OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT,
                switchArguments("Physik"));
        var replay = call(adapter, OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT,
                switchArguments("Physik"));
        assertThat(first.isError()).isFalse();
        assertThat(replay.isError()).isFalse();
        assertThat(objectMapper.readTree(objectMapper.writeValueAsBytes(replay.structuredContent())))
                .isEqualTo(objectMapper.readTree(objectMapper.writeValueAsBytes(first.structuredContent())));
        assertThat(objectMapper.<JsonNode>valueToTree(first.structuredContent()).path("stateVersion").asLong())
                .isEqualTo(8L);
        assertThat(call(adapter, OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT,
                switchArguments("Mathematik")).isError()).isTrue();
        Map<String, Object> stale = new java.util.LinkedHashMap<>(switchArguments("Physik"));
        stale.put(OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID, "22222222-2222-4333-8444-555555555555");
        var staleResponse = call(adapter, OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT, stale);
        assertThat(staleResponse.isError()).isTrue();
        assertThat(objectMapper.<JsonNode>valueToTree(staleResponse.structuredContent()).toString())
                .contains("STATE_VERSION_CONFLICT");
        org.mockito.Mockito.doThrow(new org.springframework.security.access.AccessDeniedException("denied"))
                .when(identityResolver).requireWriteAccess(any());
        assertThat(call(adapter, OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT,
                switchArguments("Physik")).isError()).isTrue();
        verify(coachTools, times(1)).switchLearningPlanSubject(LEARNER_ID, "de-DE", "Physik");
        verify(coachTools, times(2)).getLearningPlanTodayStatus(LEARNER_ID, "de-DE");
        verify(coachTools, times(1)).getLearnerState(LEARNER_ID);
        verify(coachTools, never()).setMastery(any(), any());
    }

    private void useRealSessionCoordinator() {
        var sessions = mock(com.skillpilot.backend.repository.OpenAiDeLearningSessionRepository.class);
        var learners = mock(com.skillpilot.backend.repository.LearnerRepository.class);
        var requests = mock(com.skillpilot.backend.repository.OpenAiDeIdempotencyRecordRepository.class);
        var revisions = mock(com.skillpilot.backend.openai.de.OpenAiDeCurriculumRevisionProvider.class);
        var learner = new com.skillpilot.backend.domain.Learner();
        learner.setSkillpilotId(LEARNER_ID);
        learner.setCoachStateRevision(7L);
        var session = new com.skillpilot.backend.domain.OpenAiDeLearningSession();
        var now = java.time.Instant.parse("2026-09-09T10:00:00Z");
        session.setLearner(learner);
        session.setTokenHash("private-hash");
        session.setStartedAt(now.minusSeconds(10));
        session.setExpiresAt(now.plusSeconds(7200));
        session.setContractMajor(1);
        session.setStateVersion(7L);
        session.setStateSchemaVersion(1);
        session.setWorkflowVersion(OpenAiDeV1ContractMetadata.WORKFLOW_VERSION);
        session.setCurriculumRevision("curricula-tree@test");
        session.setCommunicationLocale("de-DE");
        when(revisions.currentRevision()).thenReturn("curricula-tree@test");
        when(sessions.findLearnerSkillpilotIdByTokenHash(any())).thenReturn(Optional.of(LEARNER_ID));
        when(sessions.findByTokenHashForUpdate(any())).thenReturn(Optional.of(session));
        when(learners.findBySkillpilotIdForUpdate(LEARNER_ID)).thenReturn(Optional.of(learner));
        when(learners.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        Map<Object, com.skillpilot.backend.domain.OpenAiDeIdempotencyRecord> saved = new java.util.HashMap<>();
        when(requests.findById(any())).thenAnswer(invocation -> Optional.ofNullable(saved.get(invocation.getArgument(0))));
        when(requests.save(any())).thenAnswer(invocation -> {
            com.skillpilot.backend.domain.OpenAiDeIdempotencyRecord record = invocation.getArgument(0);
            saved.put(record.getId(), record);
            return record;
        });
        sessionCoordinator = new OpenAiDeV1McpSessionCoordinator(sessions, learners, requests,
                new OpenAiDeProperties(), revisions, SIGNING_SECRET,
                java.time.Clock.fixed(now, java.time.ZoneOffset.UTC));
    }

    private static LearnerPlanTodayStatus switchableStatus() {
        return new LearnerPlanTodayStatus(LocalDate.parse("2026-09-09"), true, false,
                List.of(new LearnerPlanTodayStatus.SubjectStatus("private-math", "Mathematik", 2, 0, 2, 0,
                                true, true),
                        new LearnerPlanTodayStatus.SubjectStatus("private-physics", "Physik", 3, 0, 3, 0,
                                false, true)), new LearnerPlanTodayStatus.Totals(5, 0, 5, 0), 0);
    }

    private static LearnerPlanTodayStatus switchedStatus() {
        return new LearnerPlanTodayStatus(LocalDate.parse("2026-09-09"), true, false,
                List.of(new LearnerPlanTodayStatus.SubjectStatus("private-math", "Mathematik", 2, 0, 2, 0,
                                false, true),
                        new LearnerPlanTodayStatus.SubjectStatus("private-physics", "Physik", 3, 0, 3, 0,
                                true, true)), new LearnerPlanTodayStatus.Totals(5, 0, 5, 0), 0);
    }

    private static UnifiedLearnerStateResponse physicsGoalState() {
        FrontierGoal active = new FrontierGoal("goal-physics", "Kräfte darstellen", "Kräfte als Pfeile darstellen.",
                "atomic", "tutor", null, "frontier", List.of(), List.of(), null, null, null, null);
        LandscapeSummary curriculum = new LandscapeSummary("public-physics", "Physik", "", "DE", "HE",
                "school", "Physik", "de", List.of());
        return new UnifiedLearnerStateResponse(LEARNER_ID, curriculum, List.of(active),
                new LearnerGoals(List.of(active), 0, 1, new GoalStats(0, 1), new GoalStats(0, 1), false),
                List.of("teachActiveGoal"), List.of(), Set.of(), "learning", active,
                new StateMachineInfo("TEACHING", "teachActiveGoal", List.of(), List.of(), active));
    }

    private static Map<String, Object> readArguments() {
        return Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID);
    }

    private static Map<String, Object> writeArguments() {
        return Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID,
                OpenAiDeV1McpContractAdapter.EXPECTED_STATE_VERSION, 7L,
                OpenAiDeV1McpContractAdapter.CLIENT_REQUEST_ID, "11111111-2222-4333-8444-555555555555");
    }

    private static Map<String, Object> switchArguments(String subject) {
        Map<String, Object> args = new java.util.LinkedHashMap<>(writeArguments());
        args.put("subject", subject);
        return args;
    }

    private OpenAiDeV1McpContractAdapter contract(boolean enabled) {
        return new OpenAiDeV1McpContractAdapter(
                coachTools,
                new CoachStateProjection("https://skillpilot.test"),
                identityResolver,
                telemetry,
                sessionCoordinator,
                "https://skillpilot.test",
                SERVER_BUILD,
                SIGNING_SECRET,
                enabled);
    }

    private McpSchema.CallToolResult call(
            OpenAiDeV1McpContractAdapter contract,
            String toolName,
            Map<String, Object> arguments) {
        return spec(contract, toolName).callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(toolName, arguments));
    }

    private McpStatelessServerFeatures.SyncToolSpecification spec(
            OpenAiDeV1McpContractAdapter contract,
            String toolName) {
        return contract.toolSpecifications().stream()
                .filter(candidate -> toolName.equals(candidate.tool().name()))
                .findFirst()
                .orElseThrow();
    }

    @SuppressWarnings("unchecked")
    private McpSchema.CallToolResult invoke(Object callback, long stateVersion) {
        Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult> operation =
                (Function<OpenAiDeV1SessionMetadata, McpSchema.CallToolResult>) callback;
        return operation.apply(new OpenAiDeV1SessionMetadata(
                1,
                stateVersion,
                1,
                OpenAiDeV1ContractMetadata.WORKFLOW_VERSION,
                "curricula-tree@test",
                "de-DE",
                Map.of()));
    }

    private static LearnerPlanTodayStatus availablePlanStatus() {
        return new LearnerPlanTodayStatus(LocalDate.parse("2026-09-09"), true, true,
                List.of(new LearnerPlanTodayStatus.SubjectStatus("private-math", "Mathematik", 2, 0, 2, 0,
                        false, true)), new LearnerPlanTodayStatus.Totals(2, 0, 2, 0), 0);
    }

    private static UnifiedLearnerStateResponse noActiveGoalState() {
        UnifiedLearnerStateResponse state = activeGoalState();
        return new UnifiedLearnerStateResponse(state.skillpilotId(), state.curriculum(), state.frontier(),
                state.goals(), state.nextAllowedActions(), state.activeFilters(), state.copySources(),
                "learning", null, new StateMachineInfo("SELECTING", "setActiveGoal", List.of(), List.of(), null));
    }

    private static UnifiedLearnerStateResponse activeGoalState() {
        FrontierGoal active = new FrontierGoal(
                "goal-1",
                "Brüche addieren",
                "Die lernende Person kann Brüche addieren.",
                "atomic",
                "tutor",
                null,
                "frontier",
                List.of(),
                List.of(),
                null,
                null,
                null,
                null);
        LandscapeSummary curriculum = new LandscapeSummary(
                "curriculum-public-id",
                "Mathematik",
                "",
                "DE",
                "HE",
                "school",
                "Mathematik",
                "de",
                List.of());
        LearnerGoals goals = new LearnerGoals(
                List.of(active),
                0,
                1,
                new GoalStats(0, 1),
                new GoalStats(0, 1),
                false);
        return new UnifiedLearnerStateResponse(
                LEARNER_ID,
                curriculum,
                List.of(active),
                goals,
                List.of("teachActiveGoal"),
                List.of(),
                Set.of(),
                "learning",
                active,
                new StateMachineInfo(
                        "TEACHING",
                        "teachActiveGoal",
                        List.of(),
                        List.of(),
                        active));
    }
}
