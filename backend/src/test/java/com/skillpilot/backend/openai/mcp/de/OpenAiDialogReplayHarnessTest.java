package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearnerPlanTodayStatus;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class OpenAiDialogReplayHarnessTest {
    private final ObjectMapper json = new ObjectMapper();

    @Test
    void modelCatalogExcludesComponentOnlyRatingAndNeverGrantsModelUiActor() {
        var fixture = OpenAiDialogReplayDailyFixtures.create("D1");
        assertThat(fixture.contract.toolSpecifications()).hasSize(14);
        assertThat(fixture.modelTools()).hasSize(13);
        assertThat(fixture.modelTools().stream().map(tool -> tool.name()))
                .doesNotContain(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD);
        assertThatThrownBy(() -> fixture.call(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD, Map.of()))
                .isInstanceOf(IllegalArgumentException.class);
        assertThat(fixture.currentStateVersion()).isZero();
    }

    @Test
    void dailyContextHasActualAdapterTotalsAndDoesNotMutate() {
        var fixture = OpenAiDialogReplayDailyFixtures.create("D1");
        var response = fixture.call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());
        JsonNode context = content(response);
        assertThat(context.path("learningPlanToday").path("totals").path("dueToday").asInt()).isEqualTo(48);
        assertThat(context.path("learningPlanToday").path("totals").path("completedToday").asInt()).isEqualTo(2);
        assertThat(context.path("learningPlanToday").path("totals").path("openToday").asInt()).isEqualTo(46);
        assertThat(context.path("learningPlanToday").path("totals").path("extraCompletedToday").asInt()).isZero();
        assertThat(response.content().toString()).contains("2/48 geschafft").doesNotContain("beherrscht");
        assertThat(fixture.currentStateVersion()).isZero();
        assertThat(fixture.snapshot().get("confirmedWriteCount")).isEqualTo(0);
        assertThat(context.toString()).doesNotContain(OpenAiDialogReplayFixture.LEARNER_ID);
    }

    @Test
    void weekendReplayReportsNoFixedQuotaAndLeavesVoluntaryExtraUnstarted() {
        var fixture = OpenAiDialogReplayDailyFixtures.create("D2");
        fixture.planStatus = new LearnerPlanTodayStatus(LocalDate.parse("2026-09-12"), true, true,
                List.of(new LearnerPlanTodayStatus.SubjectStatus(
                                "synthetic-math", "Mathematik", 0, 0, 0, 1, false, true, 0),
                        new LearnerPlanTodayStatus.SubjectStatus(
                                "synthetic-physics", "Physik", 0, 0, 0, 1, false, true, 0)),
                new LearnerPlanTodayStatus.Totals(0, 0, 0, 2, 0), 0);
        var response = fixture.call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments());
        JsonNode context = content(response);
        assertThat(context.path("learningPlanToday").path("guidance").path("state").asText())
                .isEqualTo("complete");
        assertThat(context.path("learningPlanToday").path("resumeAvailable").asBoolean()).isTrue();
        assertThat(response.content().toString()).contains("Heute kein festes Pensum.")
                .doesNotContain("Rückstand", "0/0", "geschafft");
        assertThat(fixture.currentStateVersion()).isZero();
        assertThat(fixture.snapshot().get("confirmedWriteCount")).isEqualTo(0);
    }

    @Test
    void resumeUsesRealCoordinatorForSuccessReplayAndStaleWriteRejection() {
        var fixture = OpenAiDialogReplayDailyFixtures.create("D2");
        JsonNode before = content(fixture.call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments()));
        assertThat(before.path("activeGoal").isMissingNode() || before.path("activeGoal").isNull()).isTrue();
        assertThat(before.path("learningPlanToday").path("resumeAvailable").asBoolean()).isTrue();
        var args = writeArguments();
        var first = fixture.call(OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN, args);
        assertThat(first.isError()).isFalse();
        var replay = fixture.call(OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN, args);
        assertThat(content(replay)).isEqualTo(content(first));
        assertThat(fixture.currentStateVersion()).isEqualTo(1L);
        assertThat(fixture.snapshot().get("resumeWrites")).isEqualTo(1L);
        args.put("clientRequestId", "22222222-2222-4333-8444-555555555555");
        JsonNode rejected = content(fixture.call(OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN, args));
        assertThat(rejected.path("code").asText()).isEqualTo("STATE_VERSION_CONFLICT");
        assertThat(fixture.currentStateVersion()).isEqualTo(1L);
    }

    @Test
    void subjectSwitchChangesOnlyActiveSubjectAndRetainsDailyTotals() {
        var fixture = OpenAiDialogReplayDailyFixtures.create("D3");
        var args = writeArguments();
        args.put("subject", "Physik");
        var result = fixture.call(OpenAiDeV1McpContractAdapter.SWITCH_LEARNING_PLAN_SUBJECT, args);
        assertThat(result.isError()).isFalse();
        JsonNode context = content(result).path("context");
        assertThat(context.path("activeGoal").path("goalId").asText()).isEqualTo("synthetic-physics-goal");
        assertThat(context.path("learningPlanToday").path("totals").path("openToday").asInt()).isEqualTo(46);
        assertThat(fixture.snapshot().get("masteryWrites")).isEqualTo(0L);
        assertThat(fixture.snapshot().get("scopeWrites")).isEqualTo(0L);
        assertThat(fixture.snapshot().get("subjectSwitchWrites")).isEqualTo(1L);
    }

    @Test
    void blockedAndInvalidSessionsNeverReachAFacadeWrite() {
        var blocked = OpenAiDialogReplayDailyFixtures.create("D4");
        var context = content(blocked.call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments()));
        assertThat(context.path("learningPlanToday").path("resumeAvailable").asBoolean()).isFalse();
        assertThat(blocked.call(OpenAiDeV1McpContractAdapter.RESUME_LEARNING_PLAN, writeArguments()).isError()).isTrue();
        assertThat(blocked.snapshot().get("resumeWrites")).isEqualTo(0L);
        for (String caseId : new String[] {"P1", "N1"}) {
            var invalid = OpenAiDialogReplayDailyFixtures.create(caseId);
            assertThat(content(invalid.call(OpenAiDeV1McpContractAdapter.GET_CONTEXT,
                    caseId.equals("P1") ? Map.of() : readArguments())).path("code").asText())
                    .isEqualTo("SESSION_REQUIRED");
            assertThat(invalid.currentStateVersion()).isZero();
            assertThat(invalid.snapshot().get("confirmedWriteCount")).isEqualTo(0);
        }
    }

    @Test
    void statusAndPauseFixturesOfferARealRendererWithoutExecutingItDuringSetup() {
        for (String caseId : new String[] {"D5", "D6"}) {
            var fixture = OpenAiDialogReplayDailyFixtures.create(caseId);
            assertThat(fixture.callAudit).isEmpty();
            var context = content(fixture.call(OpenAiDeV1McpContractAdapter.GET_CONTEXT, readArguments()));
            assertThat(context.path("goalVisualization").path("imageUrl").asText())
                    .startsWith("https://skillpilot.com/assets/goal-visualizations/");
            assertThat(context.path("nextAllowedTools").toString())
                    .contains(OpenAiDeV1McpContractAdapter.RENDER_GOAL_VISUALIZATION);
            assertThat(fixture.currentStateVersion()).isZero();
        }
    }

    @Test
    void resetRequiresKnownCaseAndReturnsNoPriorExecutionAsMeasuredCalls() throws Exception {
        var harness = new OpenAiDialogReplayHarness();
        assertThatThrownBy(() -> harness.handle(json.readTree("{\"action\":\"snapshot\"}")))
                .isInstanceOf(IllegalStateException.class);
        var setup = harness.handle(json.readTree("{\"action\":\"reset\",\"caseId\":\"D5\"}"));
        assertThat(setup.get("evidenceLayer")).isEqualTo("model-api-with-simulated-domain");
        assertThat(setup.get("priorConversation")).asList().hasSize(1);
        assertThatThrownBy(() -> harness.handle(json.readTree("{\"action\":\"reset\",\"caseId\":\"unknown\"}")))
                .isInstanceOf(IllegalArgumentException.class);
    }

    private JsonNode content(io.modelcontextprotocol.spec.McpSchema.CallToolResult result) {
        try {
            // Compare the wire representation, including coordinator-replayed persisted JSON.
            return json.readTree(json.writeValueAsBytes(result.structuredContent()));
        } catch (Exception error) {
            throw new AssertionError("Fixture result must serialize to JSON", error);
        }
    }

    private static Map<String, Object> readArguments() {
        return Map.of("learningSessionId", OpenAiDialogReplayFixture.SESSION_ID);
    }

    private static Map<String, Object> writeArguments() {
        Map<String, Object> args = new LinkedHashMap<>(readArguments());
        args.put("expectedStateVersion", 0L);
        args.put("clientRequestId", "11111111-2222-4333-8444-555555555555");
        return args;
    }
}
