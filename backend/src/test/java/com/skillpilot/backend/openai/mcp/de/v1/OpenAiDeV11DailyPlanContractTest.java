package com.skillpilot.backend.openai.mcp.de.v1;

import static com.skillpilot.backend.api.LearningPlanWireAssertions.assertReducedPlanPayloads;
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
import com.skillpilot.backend.api.LearnerPlanTodayStatusFixtures;
import com.skillpilot.backend.service.learningplan.PeriodBasis;
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
    private String sessionLocale;

    @BeforeEach
    void setUp() {
        sessionLocale = "de-DE";
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

    @ParameterizedTest
    @CsvSource({"de-DE,DAY", "de-DE,WEEK", "en-US,DAY", "en-US,WEEK"})
    void actualContextPayloadPreservesBackendStatusAndSeparateAnnouncement(String locale, PeriodBasis basis) {
        sessionLocale = locale;
        boolean english = locale.startsWith("en");
        String title = english ? "Adding fractions" : "Brüche addieren";
        String announcement = (english ? "Your active learning goal: " : "Dein aktives Lernziel: ") + title;
        var status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-14"), basis, locale, true, false, false, 0,
                new LearnerPlanTodayStatus.ActiveGoal("goal-1", title, announcement),
                List.of(LearnerPlanTodayStatusFixtures.subject("private-math",
                        english ? "Mathematics" : "Mathematik", 13, 3, 9, 1, true, true, basis, locale),
                        LearnerPlanTodayStatusFixtures.subject("private-physics",
                                english ? "Physics" : "Physik", 2, 0, 0, 0, false, true, basis, locale)));
        when(coachTools.getLearnerState(LEARNER_ID)).thenReturn(activeGoalState(title));
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, locale)).thenReturn(status);

        var result = call(contract(true), OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());

        JsonNode projection = objectMapper.valueToTree(result.structuredContent()).path("learningPlanToday");
        assertThat(projection.path("text").asText()).isEqualTo(status.statusText());
        assertThat(projection.path("periodBasis").asText()).isEqualTo(basis.name());
        assertThat(projection.path("activeGoalAnnouncement").asText()).isEqualTo(announcement);
        assertThat(result.content()).singleElement().isInstanceOfSatisfying(McpSchema.TextContent.class,
                text -> assertThat(text.text()).isEqualTo(status.statusText()).doesNotContain(announcement));
        verify(coachTools, never()).resumeLearningPlan(any(), any());
    }

    @Test
    void noStoredPlanKeepsPublishedPersonalContinuationWithoutInventingSubjects() {
        var status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-14"), PeriodBasis.WEEK, "de", true, true,
                false, 0, null, List.of());
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status);

        var response = call(contract(true), OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());

        JsonNode context = objectMapper.valueToTree(response.structuredContent());
        JsonNode projection = context.path("learningPlanToday");
        assertThat(projection.path("subjects")).isEmpty();
        assertThat(projection.path("resumeAvailable").asBoolean()).isTrue();
        assertThat(projection.path("guidance").path("state").asText()).isEqualTo("unavailable");
        assertThat(projection.path("text").asText()).isEqualTo("Kein Lernplan eingerichtet.");
        assertThat(context.path("nextAllowedTools").toString())
                .contains(OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN);
        verify(coachTools, never()).resumeLearningPlan(any(), any());
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
        assertThat(enabled.serverInstructions())
                .contains("learningPlanToday", "Status-only", "learningPlanToday.text verbatim")
                .doesNotContain("completedToday", "openOverdue", "extraCompletedToday");
        assertThat(objectMapper.<JsonNode>valueToTree(enabled.resourceSpecifications()))
                .isEqualTo(objectMapper.valueToTree(disabled.resourceSpecifications()));
        JsonNode currentSchema = objectMapper.valueToTree(spec(enabled,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT).tool().outputSchema());
        assertThat(currentSchema.path("properties").has("learningPlanToday")).isTrue();
        JsonNode dailySchema = currentSchema.path("properties").path("learningPlanToday");
        // The published shape carries the binding text and non-numeric control information only.
        assertThat(dailySchema.path("properties").path("text").path("type").asText()).isEqualTo("string");
        assertThat(dailySchema.path("properties").has("totals")).isFalse();
        assertThat(dailySchema.path("properties").has("statusDirection")).isFalse();
        assertThat(dailySchema.path("properties").has("unavailablePlanCount")).isFalse();
        assertThat(dailySchema.path("properties").path("activeGoalAnnouncement").path("type").asText())
                .isEqualTo("string");
        JsonNode subjectSchema = dailySchema.path("properties").path("subjects").path("items");
        assertThat(subjectSchema.path("properties").path("evaluable").path("type").asText())
                .isEqualTo("boolean");
        assertThat(subjectSchema.path("properties").toString())
                .doesNotContain("dueToday", "completedToday", "openToday", "openOverdue",
                        "extraCompletedToday");
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
    void dailyPlanReadReturnsTheLocalizedStatusTextWithoutInternalIdsOrCounts() {
        OpenAiDeV1McpContractAdapter contract = contract(true);
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(LearnerPlanTodayStatusFixtures.status(
                        LocalDate.parse("2026-09-04"), true, true, 1, null,
                        List.of(
                                LearnerPlanTodayStatusFixtures.subject(
                                        "secret-math-landscape", "Mathematik", 7, 3, 1, 1, false, false),
                                LearnerPlanTodayStatusFixtures.subject(
                                        "secret-physics-landscape", "Physik", 3, 2, 2, 2, false, false))));

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
        // The binding text travels; no separate count field does.
        assertThat(content.has("totals")).isFalse();
        assertThat(content.path("text").asText()).contains("Mathematik: ", "Physik: ");
        assertThat(content.has("unavailablePlanCount")).isFalse();
        assertThat(content.has("statusDirection")).isFalse();
        assertThat(content.toString())
                .doesNotContain(
                        "secret-math-landscape",
                        "secret-physics-landscape",
                        "landscapeId",
                        "planId",
                        "dueToday",
                        "completedToday",
                        "openToday",
                        "openOverdue",
                        "extraCompletedToday");
        verify(coachTools).getLearningPlanTodayStatus(LEARNER_ID, "de-DE");
    }

    @Test
    void dailyPlanReadSanitizesLabelsAndWithdrawsSwitchingForThem() {
        OpenAiDeV1McpContractAdapter contract = contract(true);
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(LearnerPlanTodayStatusFixtures.status(
                        LocalDate.parse("2026-09-04"), true, true, 2, null,
                        List.of(
                                LearnerPlanTodayStatusFixtures.subject(
                                        "secret-math", "Mathematik\n", 9, 5, 2, 2, false, true),
                                LearnerPlanTodayStatusFixtures.subject(
                                        "secret-physics", "Physik\u0000", 6, 4, 1, 1, false, true),
                                LearnerPlanTodayStatusFixtures.subject(
                                        "secret-control-only", "\u0000\u200B", 1, 1, 0, 0, false, true))));

        McpSchema.CallToolResult response = call(
                contract,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID));

        assertThat(response.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(response.structuredContent()).path("learningPlanToday");
        assertThat(content.path("subjects")).hasSize(2);
        assertThat(content.path("subjects").get(0).path("subject").asText())
                .isEqualTo("Mathematik");
        assertThat(content.path("subjects").get(1).path("subject").asText())
                .isEqualTo("Physik");
        // A label that had to be cleaned can no longer be copied back as a tool argument.
        assertThat(content.path("subjects").get(0).path("canContinue").asBoolean()).isFalse();
        assertThat(content.path("subjects").get(1).path("canContinue").asBoolean()).isFalse();
        // A label consisting only of control characters is unusable and counts as unevaluable.
        assertThat(content.has("unavailablePlanCount")).isFalse();
        assertThat(content.has("statusDirection")).isFalse();
        assertThat(content.path("resumeAvailable").asBoolean()).isTrue();
        // The published subject values stay usable as tool arguments. The binding text itself is
        // sanitized where the label enters it, in the backend; this fixture bypasses that on purpose
        // to exercise the projection's own defence.
        assertThat(content.path("subjects").toString())
                .doesNotContain("\\u0000", "\\u200b");
        assertThat(content.toString()).doesNotContain("secret-");
    }

    @Test
    void unreadableSubjectLabelsDoNotRevokeBackendAuthorizedPersonalContinuation() {
        OpenAiDeV1McpContractAdapter contract = contract(true);
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(LearnerPlanTodayStatusFixtures.status(
                        LocalDate.parse("2026-09-04"), true, true, 0, null,
                        List.of(LearnerPlanTodayStatusFixtures.subject(
                                "secret-invalid", "\u0000", 1, 1, 0, 0, false, true))));

        McpSchema.CallToolResult response = call(
                contract,
                OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                Map.of(OpenAiDeV1McpContractAdapter.LEARNING_SESSION_ID, LEARNING_SESSION_ID));

        assertThat(response.isError()).isFalse();
        JsonNode content = objectMapper.valueToTree(response.structuredContent()).path("learningPlanToday");
        assertThat(content.path("subjects")).isEmpty();
        assertThat(content.path("resumeAvailable").asBoolean()).isTrue();
        assertThat(content.path("guidance").path("state").asText()).isEqualTo("unavailable");
        assertThat(content.has("unavailablePlanCount")).isFalse();
        assertThat(content.has("statusDirection")).isFalse();
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
                        "before rendering the old goal", "pause without new evidence",
                        "save warranted success immediately", "sufficient evidence also asks to pause",
                        "wait for explicit learner continuation");
        verify(coachTools, never()).resumeLearningPlan(any(), any());
        verify(coachTools, never()).switchLearningPlanSubject(any(), any(), any());
        verify(coachTools, never()).setMastery(any(), any());
        // These backend assertions do not claim that a live model follows the published priority.
    }

    @ParameterizedTest
    @CsvSource({"true,0,0,complete", "true,1,0,blocked", "true,0,1,unavailable", "false,1,0,paused"})
    void noEligiblePlanPublishesAuthoritativeGuidance(boolean follow, int open, int unavailable, String expected) {
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(LearnerPlanTodayStatusFixtures.status(
                        LocalDate.parse("2026-09-09"), follow, false, unavailable, null,
                        List.of(LearnerPlanTodayStatusFixtures.subject("private-math", "Mathematik",
                                2, 2, 2 - open, 2 - open, false, false))));
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
                .thenReturn(LearnerPlanTodayStatusFixtures.status(
                        LocalDate.parse("2026-09-09"), false, false));
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
    void sanitizedOrTruncatedLabelsNeverAdvertiseAnUnusableSwitch() {
        String longLabel = "P".repeat(130);
        var status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-09"), true, false, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject("a", "Physik\n", 1, 1, 0, 0, false, true),
                        LearnerPlanTodayStatusFixtures.subject("b", longLabel, 2, 2, 0, 0, false, true)));

        var projection = OpenAiDeLearningPlanToday.project(status, false, false);

        assertThat(projection.subjects()).hasSize(2).allSatisfy(subject -> {
            assertThat(subject.canContinue()).isFalse();
            assertThat(subject.subject().length()).isLessThanOrEqualTo(120);
        });
        assertThat(projection.text()).isEqualTo(status.statusText());
    }

    @Test
    void compactSummaryIsTheBackendTextItselfInEveryLanguage() {
        var status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-09"), true, true, 1, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                                "private-math", "Mathematik", 21, 21, 2, 2, false, false),
                        LearnerPlanTodayStatusFixtures.subject(
                                "private-physics", "Physik", 27, 27, 0, 0, false, false),
                        LearnerPlanTodayStatusFixtures.unevaluableSubject(
                                "private-chemistry", "Chemie", false, false)));

        var projection = OpenAiDeLearningPlanToday.project(status, false, false);

        // One formulation, several channels: the summary is the backend text, not a second
        // rendering of it, so the language switch cannot produce a diverging statement either.
        assertThat(projection.summary(false)).isEqualTo(status.statusText());
        assertThat(projection.summary(true)).isEqualTo(status.statusText());
        assertThat(projection.summary(false))
                .contains("Mathematik: Tagesziel 2 von 21", "Physik: Tagesziel 0 von 27")
                .contains("nicht auswertbar");
    }

    @ParameterizedTest
    @CsvSource({"false, complete, true", "true, continue, false"})
    void fulfilledTargetAndRemainingBacklogStandSideBySideInOneText(
            boolean hasActiveGoal, String expectedGuidance, boolean expectedResume) {
        var status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-14"), true, true, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                                "private-math", "Mathematik", 4, 1, 1, 1, true, true),
                        LearnerPlanTodayStatusFixtures.subject(
                                "private-physics", "Physik", 2, 0, 0, 0, false, true)));

        var projection = OpenAiDeLearningPlanToday.project(status, hasActiveGoal, false);

        assertThat(projection.subjects()).containsExactly(
                new OpenAiDeLearningPlanToday.Subject("Mathematik", hasActiveGoal, true, true, "behind"),
                new OpenAiDeLearningPlanToday.Subject("Physik", false, true, true, "behind"));
        assertThat(projection.guidance().state()).isEqualTo(expectedGuidance);
        assertThat(projection.resumeAvailable()).isEqualTo(expectedResume);
        // A reached target never implies that nothing is left; both statements appear together.
        assertThat(projection.summary(false)).isEqualTo(status.statusText())
                .contains("Mathematik: Tagesziel erreicht · 3 Lernziele im Rückstand")
                .contains("Physik: Heute kein Tagesziel · 2 Lernziele im Rückstand");
    }

    @Test
    void zeroTargetStillShowsBacklogWithoutClaimingCompletedWork() {
        var status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-14"), true, true, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject("m", "Mathematik", 0, 0, 0, 0, false, false),
                        LearnerPlanTodayStatusFixtures.subject("p", "Physik", 2, 0, 0, 0, false, true)));

        var projection = OpenAiDeLearningPlanToday.project(status, false, false);

        assertThat(projection.guidance().state()).isEqualTo("complete");
        assertThat(projection.summary(false)).isEqualTo(status.statusText())
                .contains("Mathematik: Heute kein Tagesziel · im Plan")
                .contains("Physik: Heute kein Tagesziel · 2 Lernziele im Rückstand")
                .doesNotContain("geschafft");
    }

    @Test
    void coveredPeriodTargetPublishesAdvanceWorkAndDoesNotTurnBacklogIntoRequiredWork() {
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE"))
                .thenReturn(LearnerPlanTodayStatusFixtures.status(
                        LocalDate.parse("2026-09-11"), true, true, 0, null,
                        List.of(LearnerPlanTodayStatusFixtures.subject(
                                "private-math", "Mathematik", 5, 2, 6, 6, false, true))));
        var response = call(contract(true), OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());
        JsonNode content = objectMapper.valueToTree(response.structuredContent());
        JsonNode today = content.path("learningPlanToday");
        assertThat(today.path("guidance").path("state").asText()).isEqualTo("complete");
        assertThat(today.path("guidance").path("instruction").asText())
                .contains("explicit request", "Remaining backlog is not required today");
        assertThat(today.path("subjects").get(0).path("statusDirection").asText()).isEqualTo("ahead");
        assertThat(today.path("subjects").get(0).path("canContinue").asBoolean()).isTrue();
        assertThat(today.path("resumeAvailable").asBoolean()).isTrue();
        assertThat(content.path("requiredAction").asText()).isEqualTo("complete");
        assertThat(content.path("frontier")).isEmpty();
        assertThat(response.content().toString()).contains("Tagesziel erreicht", "1 Lernziel vorgearbeitet");
        verify(coachTools, never()).resumeLearningPlan(any(), any());
    }

    @ParameterizedTest
    @CsvSource({"0, 0, true, 0", "1, 0, true, 0", "1, 3, true, 0",
            "0, 0, false, 0", "1, 3, false, 0", "0, 0, true, 1"})
    void explicitExtraToolsUseBackendCapabilityRegardlessOfQuotaOrBacklog(
            int quota, int overdue, boolean available, int unavailablePlans) {
        var status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-14"), true, available, unavailablePlans, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                        "private-math", "Mathematik", quota + overdue, quota, quota, quota,
                        false, available)));
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status);

        var response = call(contract(true), OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());

        JsonNode content = objectMapper.valueToTree(response.structuredContent());
        JsonNode today = content.path("learningPlanToday");
        assertThat(today.path("resumeAvailable").asBoolean()).isEqualTo(available);
        assertThat(today.path("subjects").get(0).path("canContinue").asBoolean()).isEqualTo(available);
        assertThat(today.path("guidance").path("state").asText())
                .isEqualTo(unavailablePlans == 0 ? "complete" : "unavailable");
        assertThat(today.has("unavailablePlanCount")).isFalse();
        assertThat(today.has("statusDirection")).isFalse();
        assertThat(today.path("guidance").path("instruction").asText())
                .contains("Learning plans prioritize work and never limit learning within the Personal Curriculum",
                        unavailablePlans == 0 ? "A fulfilled period target never revokes that capability"
                                : "even if a plan is missing or outdated");
        assertThat(content.path("nextAllowedTools").toString()
                .contains(OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN)).isEqualTo(available);
        assertThat(content.path("nextAllowedTools").toString()
                .contains(OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT)).isEqualTo(available);
        assertThat(content.path("frontier")).isEmpty();
        verify(coachTools, never()).resumeLearningPlan(any(), any());
        verify(coachTools, never()).switchLearningPlanSubject(any(), any(), any());

        var active = OpenAiDeLearningPlanToday.project(status, true, true);
        assertThat(active.resumeAvailable()).isFalse();
        assertThat(active.subjects()).singleElement().satisfies(subject -> assertThat(subject.canContinue()).isFalse());
        assertThat(active.guidance().state()).isEqualTo("continue");
    }

    @ParameterizedTest
    @CsvSource({"false, blocked", "true, resume"})
    void openQuotaDoesNotAuthorizeAutomaticExtraWhenOnlyPersonalFallbackIsAvailable(
            boolean automaticResumeAvailable, String expectedGuidance) {
        var status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-14"), PeriodBasis.DAY, "de", true, true,
                automaticResumeAvailable, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                        "private-math", "Mathematik", 4, 1, 0, 0, false, true)));
        when(coachTools.getLearningPlanTodayStatus(LEARNER_ID, "de-DE")).thenReturn(status);

        var response = call(contract(true), OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());

        JsonNode content = objectMapper.valueToTree(response.structuredContent());
        JsonNode today = content.path("learningPlanToday");
        assertThat(today.path("resumeAvailable").asBoolean()).isTrue();
        assertThat(today.path("subjects").get(0).path("canContinue").asBoolean()).isTrue();
        assertThat(today.path("guidance").path("state").asText()).isEqualTo(expectedGuidance);
        assertThat(content.path("requiredAction").asText()).isEqualTo(expectedGuidance);
        if (!automaticResumeAvailable) {
            assertThat(today.path("guidance").path("instruction").asText())
                    .contains("An explicit learning request may still use",
                            "Do not claim the period is complete or automatically resume extra work");
        }
        assertThat(today.has("automaticResumeAvailable")).isFalse();
        verify(coachTools, never()).resumeLearningPlan(any(), any());
    }

    @Test
    void zeroPeriodTargetIsStatedHonestlyAndAdvanceWorkNeverCoversAnotherSubject() {
        // A weekend without a scheduled target, seven goals planned through it, two mastered.
        var weekendStatus = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-12"), true, true, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                        "m", "Mathematik", 7, 0, 2, 2, false, true)));
        var weekend = OpenAiDeLearningPlanToday.project(weekendStatus, false, false);
        assertThat(weekend.guidance().state()).isEqualTo("complete");
        assertThat(weekend.summary(false)).isEqualTo(weekendStatus.statusText())
                .contains("Heute kein Tagesziel", "5 Lernziele im Rückstand")
                .doesNotContain("geschafft");

        var subjectsStatus = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-11"), true, true, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject("m", "Mathematik", 2, 2, 6, 6, false, false),
                        LearnerPlanTodayStatusFixtures.subject("p", "Physik", 2, 2, 0, 0, false, true)));
        var subjects = OpenAiDeLearningPlanToday.project(subjectsStatus, false, false);
        // Maths is four goals ahead, physics still owes its target: no cross-subject netting.
        assertThat(subjectsStatus.statusText())
                .contains("Mathematik: Tagesziel erreicht · 4 Lernziele vorgearbeitet")
                .contains("Physik: Tagesziel 0 von 2 · im Plan");
        assertThat(subjects.guidance().state()).isEqualTo("resume");
    }

    @Test
    void anUnevaluableSubjectIsNamedInsteadOfBeingSilentlyDroppedOrFaked() {
        var status = LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-11"), true, false, 1, null,
                List.of(LearnerPlanTodayStatusFixtures.unevaluableSubject(
                        "m", "Mathematik", false, false)));

        var projection = OpenAiDeLearningPlanToday.project(status, false, false);

        assertThat(projection.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.evaluable()).isFalse();
            assertThat(subject.statusDirection()).isNull();
        });
        assertThat(projection.evaluable()).isFalse();
        assertThat(objectMapper.<JsonNode>valueToTree(projection).has("unavailablePlanCount")).isFalse();
        assertThat(projection.guidance().state()).isEqualTo("unavailable");
        assertThat(projection.text()).contains("nicht auswertbar");
    }

    @Test
    void aSubjectBackedBySeveralPlansCannotAuthorizeASubjectSwitch() {
        // The backend merges both plans into one subject balance; the ambiguity survives
        // only as a withdrawn switch capability, never as a duplicated subject line.
        var duplicate = OpenAiDeLearningPlanToday.project(LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-09"), true, false, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.ambiguousSubject(
                        List.of("a", "b"), "Mathematik", 2, 2, 0, 0, false))), false, false);

        assertThat(duplicate.subjects()).singleElement().satisfies(subject -> {
            assertThat(subject.subject()).isEqualTo("Mathematik");
            assertThat(subject.canContinue()).isFalse();
        });
        assertThat(duplicate.text()).contains("Mathematik: Tagesziel 0 von 2");
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
        return LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-09"), true, false, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                                "private-math", "Mathematik", 2, 2, 0, 0, true, true),
                        LearnerPlanTodayStatusFixtures.subject(
                                "private-physics", "Physik", 3, 3, 0, 0, false, true)));
    }

    private static LearnerPlanTodayStatus switchedStatus() {
        return LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-09"), true, false, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                                "private-math", "Mathematik", 2, 2, 0, 0, false, true),
                        LearnerPlanTodayStatusFixtures.subject(
                                "private-physics", "Physik", 3, 3, 0, 0, true, true)));
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
        return assertReducedPlanPayloads(spec(contract, toolName).callHandler().apply(
                McpTransportContext.EMPTY,
                new McpSchema.CallToolRequest(toolName, arguments)));
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
                sessionLocale,
                Map.of()));
    }

    private static LearnerPlanTodayStatus availablePlanStatus() {
        return LearnerPlanTodayStatusFixtures.status(
                LocalDate.parse("2026-09-09"), true, true, 0, null,
                List.of(LearnerPlanTodayStatusFixtures.subject(
                        "private-math", "Mathematik", 2, 2, 0, 0, false, true)));
    }

    private static UnifiedLearnerStateResponse noActiveGoalState() {
        UnifiedLearnerStateResponse state = activeGoalState();
        return new UnifiedLearnerStateResponse(state.skillpilotId(), state.curriculum(), state.frontier(),
                state.goals(), state.nextAllowedActions(), state.activeFilters(), state.copySources(),
                "learning", null, new StateMachineInfo("SELECTING", "setActiveGoal", List.of(), List.of(), null));
    }

    private static UnifiedLearnerStateResponse activeGoalState() {
        return activeGoalState("Brüche addieren");
    }

    private static UnifiedLearnerStateResponse activeGoalState(String title) {
        FrontierGoal active = new FrontierGoal(
                "goal-1",
                title,
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
