package com.skillpilot.backend.openai.mcp.de;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/** Fixture mechanics only: none of these deterministic assertions marks a model/host case passed. */
class OpenAiDialogReplayReviewFixturesTest {
    @Test
    void negativeFixturesStartWithoutWritesAndMissingUiCannotInventCardRatings() {
        for (String caseId : List.of("N2", "N3")) {
            var fixture = OpenAiDialogReplayReviewFixtures.create(caseId);
            assertThat(call(fixture, OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of()).isError()).isFalse();
            assertThat(fixture.snapshot().get("confirmedWriteCount")).isEqualTo(0);
            assertThat(fixture.domainState.get("mastery")).isEqualTo(Map.of());
        }
        var memory = OpenAiDialogReplayReviewFixtures.create("P3");
        assertThatThrownBy(() -> memory.ui("rate")).isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No successfully opened");
        assertThat(memory.snapshot().get("memoryReviewWrites")).isEqualTo(0L);
        assertThatThrownBy(() -> OpenAiDialogReplayReviewFixtures.create("unsupported"))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void orientationCompletionUsesCurrentAdapterAndMutableSuccessorState() {
        var fixture = OpenAiDialogReplayReviewFixtures.create("P2");
        assertThat(call(fixture, OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of()).isError()).isFalse();
        assertThat(fixture.snapshot().get("masteryWrites")).isEqualTo(0L);
        var result = call(fixture, OpenAiDeV1McpContractAdapter.SET_MASTERY, Map.of(
                "goalId", OpenAiDialogReplayReviewFixtures.ORIENTATION_ID,
                "orientationPathId", "change-and-models", "workFeedback", "Du hast deine persönliche Perspektive beschrieben.",
                "outcomeFeedback", "Die Orientierung ist abgeschlossen; dies ist keine Fachprüfung."));
        assertThat(result.isError()).isFalse();
        assertThat(fixture.state.activeGoal().id()).isEqualTo(OpenAiDialogReplayReviewFixtures.CONTENT_ID);
        assertThat(fixture.currentStateVersion()).isEqualTo(1L);
        assertThat(fixture.domainState.get("mastery")).isEqualTo(Map.of(OpenAiDialogReplayReviewFixtures.ORIENTATION_ID, 1.0));
    }

    @Test
    void examContextHidesProtectedSolutionButEvaluationUsesTwentyFivePointFixture() {
        var fixture = OpenAiDialogReplayReviewFixtures.create("P4");
        var context = call(fixture, OpenAiDeV1McpContractAdapter.GET_CONTEXT, Map.of());
        assertThat(context.isError()).isFalse();
        assertThat(context.content().toString()).doesNotContain("19,46", "104,03", "Kriterium");
        assertThat(context.structuredContent().toString()).doesNotContain("19,46", "104,03", "Kriterium");
        var evaluation = call(fixture, OpenAiDeV1McpContractAdapter.GET_EXAM_EVALUATION,
                Map.of("goalId", OpenAiDialogReplayReviewFixtures.EXAM_ID));
        assertThat(evaluation.isError()).isFalse();
        assertThat(evaluation.structuredContent().toString()).contains("25", "13", "19,46");
        assertThat(fixture.snapshot().get("masteryWrites")).isEqualTo(0L);
    }

    @Test
    void consentedScopeFixturePreservesIndependentRootAndExistingMastery() {
        var fixture = OpenAiDialogReplayReviewFixtures.create("P5");
        Object before = fixture.domainState.get("mastery");
        var options = call(fixture, OpenAiDeV1McpContractAdapter.GET_NAVIGATION, Map.of("target", "scope"));
        assertThat(options.isError()).isFalse();
        assertThat(options.structuredContent().toString()).contains(OpenAiDialogReplayReviewFixtures.SCOPE_TITLE);
        assertThat(fixture.snapshot().get("scopeWrites")).isEqualTo(0L);
        var updated = call(fixture, OpenAiDeV1McpContractAdapter.SET_SCOPE, Map.of("goalIds",
                List.of(OpenAiDialogReplayReviewFixtures.SCOPE_ID, OpenAiDialogReplayReviewFixtures.INDEPENDENT_SCOPE_ID)));
        assertThat(updated.isError()).isFalse();
        assertThat(fixture.domainState.get("mastery")).isEqualTo(before);
        assertThat(fixture.domainState.get("scopeGoalIds")).isEqualTo(
                List.of(OpenAiDialogReplayReviewFixtures.SCOPE_ID, OpenAiDialogReplayReviewFixtures.INDEPENDENT_SCOPE_ID));
    }

    @ParameterizedTest
    @ValueSource(booleans = {true, false})
    @SuppressWarnings("unchecked")
    void eightComponentRatingsDoNotWriteMasteryAndCompleteRecallUsesRealCapabilities(boolean allCorrect) {
        var fixture = OpenAiDialogReplayReviewFixtures.create("P3");
        var switchGoal = call(fixture, OpenAiDeV1McpContractAdapter.SET_ACTIVE_GOAL,
                Map.of("goalId", OpenAiDialogReplayReviewFixtures.MEMORY_ID, "redirect", true));
        assertThat(switchGoal.isError()).isFalse();
        var start = call(fixture, OpenAiDeV1McpContractAdapter.START_MEMORY_PRACTICE,
                Map.of("goalId", OpenAiDialogReplayReviewFixtures.MEMORY_ID));
        assertThat(start.isError()).isFalse();
        assertThat(start.content().toString()).doesNotContain("x₂", "Scheitelpunkt", "Nullprodukt");
        assertThat(start.structuredContent().toString()).doesNotContain("x₂", "Scheitelpunkt", "Nullprodukt", "reviewCapability");
        assertThat(fixture.ui("rate")).hasSize(8).allSatisfy(result -> assertThat(result.isError()).isFalse());
        assertThat(fixture.snapshot().get("masteryWrites")).isEqualTo(0L);
        assertThat(fixture.domainState.get("mastery")).isEqualTo(Map.of());
        assertThat(fixture.callAudit.stream().filter(call -> "component".equals(call.get("actor")))).hasSize(8);
        assertThatThrownBy(() -> fixture.call(OpenAiDeV1McpContractAdapter.REVIEW_MEMORY_PRACTICE_CARD, Map.of()))
                .isInstanceOf(IllegalArgumentException.class).hasMessageContaining("App-only");
        var prompts = call(fixture, OpenAiDeV1McpContractAdapter.START_RECALL, Map.of());
        assertThat(prompts.isError()).isFalse();
        var promptData = (Map<String, Object>) prompts.structuredContent();
        assertThat((List<?>) promptData.get("cards")).hasSize(8);
        var answers = call(fixture, OpenAiDeV1McpContractAdapter.GET_RECALL_ANSWERS,
                Map.of("batchCapability", promptData.get("batchCapability")));
        assertThat(answers.isError()).as("Synthetic recall-answer result: %s", answers.content()).isFalse();
        var answerData = (Map<String, Object>) answers.structuredContent();
        var recorded = call(fixture, OpenAiDeV1McpContractAdapter.RECORD_RECALL_RESULTS, Map.of(
                "gradingCapability", answerData.get("gradingCapability"),
                "assessments", java.util.stream.IntStream.range(0, 8)
                        .mapToObj(i -> Map.of("passed", allCorrect || i > 0,
                                "feedback", allCorrect || i > 0 ? "Die gegebene Antwort ist fachlich richtig." : "Die Steigung wurde vertauscht.")).toList()));
        assertThat(recorded.isError()).isFalse();
        assertThat(fixture.domainState.get("savedRecallBatches")).isEqualTo(1);
        assertThat((List<?>) fixture.domainState.get("verifiedCardIds")).hasSize(allCorrect ? 8 : 7);
        assertThat(fixture.domainState.get("mastery")).isEqualTo(allCorrect
                ? Map.of(OpenAiDialogReplayReviewFixtures.MEMORY_ID, 1.0) : Map.of());
        assertThat(fixture.state.activeGoal().id()).isEqualTo(allCorrect
                ? OpenAiDialogReplayReviewFixtures.CONTENT_ID : OpenAiDialogReplayReviewFixtures.MEMORY_ID);
    }

    private McpSchema.CallToolResult call(OpenAiDialogReplayFixture fixture, String tool, Map<String, Object> arguments) {
        Map<String, Object> input = new LinkedHashMap<>(arguments);
        input.put("learningSessionId", OpenAiDialogReplayFixture.SESSION_ID);
        var definition = fixture.contract.toolSpecifications().stream()
                .filter(spec -> spec.tool().name().equals(tool)).findFirst().orElseThrow().tool();
        var properties = (Map<?, ?>) definition.inputSchema().get("properties");
        if (properties.containsKey("expectedStateVersion")) {
            input.putIfAbsent("expectedStateVersion", fixture.currentStateVersion());
        }
        if (properties.containsKey("clientRequestId")) {
            input.putIfAbsent("clientRequestId", UUID.randomUUID().toString());
        }
        return fixture.call(tool, input);
    }
}
