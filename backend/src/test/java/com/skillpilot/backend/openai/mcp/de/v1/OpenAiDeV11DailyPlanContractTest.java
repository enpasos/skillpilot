package com.skillpilot.backend.openai.mcp.de.v1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
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
import com.skillpilot.backend.openai.de.health.OpenAiDeCoachContractFingerprint;
import com.skillpilot.backend.openai.de.health.OpenAiDeCoachHealthIndicator;
import com.skillpilot.backend.openai.de.observability.OpenAiDeOperationalTelemetry;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachIdentityResolver;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeMcpTelemetry;
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

class OpenAiDeV11DailyPlanContractTest {

    private static final String FROZEN_V1_CONTRACT_SHA256 =
            "d2f08a66efa3488e5f87758de41688a18ce47ba2951bb2d3147e522d1fd30b38";
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
    void dailyPlanToolsAreOffByDefaultAndTheFrozenV1ContractRemainsExact() {
        OpenAiDeV1McpContractAdapter contract = new OpenAiDeV1McpContractAdapter(
                coachTools,
                new CoachStateProjection("https://skillpilot.com"),
                identityResolver,
                telemetry,
                "https://skillpilot.com");

        assertThat(contract.toolSpecifications()).hasSize(12);
        assertThat(contract.toolSpecifications().stream().map(spec -> spec.tool().name()))
                .doesNotContain(
                        OpenAiDeV1McpContractAdapter.GET_DAILY_PLAN,
                        OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN);
        assertThat(OpenAiDeCoachContractFingerprint.sha256(contract))
                .isEqualTo(FROZEN_V1_CONTRACT_SHA256);
    }

    @Test
    void enabledSurfaceAddsOnlyTheTwoStrictDailyPlanTools() {
        OpenAiDeV1McpContractAdapter disabled = contract(false);
        OpenAiDeV1McpContractAdapter enabled = contract(true);

        assertThat(enabled.toolSpecifications()).hasSize(14);
        assertThat(enabled.toolSpecifications().stream().map(spec -> spec.tool().name()))
                .endsWith(
                        OpenAiDeV1McpContractAdapter.GET_DAILY_PLAN,
                        OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN);
        assertThat(enabled.serverInstructions()).isEqualTo(disabled.serverInstructions());
        JsonNode enabledResources = objectMapper.valueToTree(enabled.resourceSpecifications());
        JsonNode disabledResources = objectMapper.valueToTree(disabled.resourceSpecifications());
        assertThat(enabledResources).isEqualTo(disabledResources);
        for (int index = 0; index < disabled.toolSpecifications().size(); index++) {
            JsonNode disabledTool = objectMapper.valueToTree(
                    disabled.toolSpecifications().get(index).tool());
            JsonNode enabledTool = objectMapper.valueToTree(
                    enabled.toolSpecifications().get(index).tool());
            assertThat(enabledTool).isEqualTo(disabledTool);
        }

        McpSchema.Tool read = spec(enabled, OpenAiDeV1McpContractAdapter.GET_DAILY_PLAN).tool();
        assertThat(read.annotations().readOnlyHint()).isTrue();
        assertThat(read.annotations().idempotentHint()).isTrue();
        assertThat(read.inputSchema().get("required"))
                .isEqualTo(List.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID));

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
                OpenAiDeV1McpContractAdapter.GET_DAILY_PLAN,
                Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID));

        assertThat(response.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(response.structuredContent());
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
                OpenAiDeV1McpContractAdapter.GET_DAILY_PLAN,
                Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID));

        assertThat(response.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(response.structuredContent());
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
                OpenAiDeV1McpContractAdapter.GET_DAILY_PLAN,
                Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID));

        assertThat(response.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(response.structuredContent());
        assertThat(content.path("subjects")).isEmpty();
        assertThat(content.path("totals").path("dueToday").asInt()).isZero();
        assertThat(content.path("resumeAvailable").asBoolean()).isFalse();
        assertThat(content.path("unavailablePlanCount").asInt()).isEqualTo(1);
    }

    @Test
    void resumeUsesTheVersionedWriteAndReturnsOnlyTheFreshExistingContext() {
        OpenAiDeV1McpContractAdapter contract = contract(true);
        UnifiedLearnerStateResponse state = activeGoalState();
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
                "coach@1.0",
                "curricula-tree@test",
                "de-DE",
                Map.of()));
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
