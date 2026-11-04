package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.skillpilot.backend.api.LevelCompletionResponse;
import com.skillpilot.backend.completion.CompletionCallContext;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ClaudeV1CompletionChoicesTest {
    @Test void uncoveredRoutesKeepPublishedExamsAvailableWithoutInventingCompletion() {
        CompletionCallContext.with(new CompletionCallContext("claude", "owner", Instant.now().plusSeconds(600), true), () -> {
            var completion = invalid("completion_target_routes_uncovered");
            var choices = ClaudeV1CompletionChoices.published(completion, "en");
            assertThat(choices).hasSize(1);
            assertThat(choices.getFirst().action()).isEqualTo("startAssessment");
            assertThat(choices.getFirst().goalId()).isEqualTo("exam");
            var projection = ClaudeV1CompletionChoices.project(completion, "en");
            assertThat(projection).doesNotContainKeys("complete", "text", "waivedPreparation");
            assertThat(projection.get("notice").toString()).contains("Ordinary learning", "remain available");
            return null;
        });
    }

    @Test void unrelatedInvalidityAndUnsupportedSessionsCannotOfferAnExam() {
        for (boolean supported : List.of(false, true)) {
            CompletionCallContext.with(new CompletionCallContext("claude", "owner", Instant.now().plusSeconds(600), supported), () -> {
                assertThat(ClaudeV1CompletionChoices.published(invalid("completion_profile_invalid"), "en")).isEmpty();
                if (!supported) assertThat(ClaudeV1CompletionChoices.published(
                        invalid("completion_target_routes_uncovered"), "en")).isEmpty();
                return null;
            });
        }
    }

    private LevelCompletionResponse invalid(String notice) {
        var title = Map.of("de", "Prüfung", "en", "Assessment");
        return new LevelCompletionResponse("invalid", "context", "automatic:personal-curriculum", "v3",
                "generation", 1, title, null, 0, 0, 0, 0, 0, 0, List.of(),
                List.of(new LevelCompletionResponse.Assessment("exam", title, false, true, null)),
                List.of(), null, false, notice, List.of());
    }
}
