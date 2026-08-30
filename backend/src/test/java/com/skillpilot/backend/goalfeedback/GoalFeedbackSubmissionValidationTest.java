package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

class GoalFeedbackSubmissionValidationTest {

    @Test
    void rejectsEveryRelevantEcmaScriptWhitespaceClassAtStringEdges() {
        for (String text : List.of(
                "\u00a0feedback",
                "feedback\u00a0",
                "\ufefffeedback",
                "feedback\ufeff",
                "\u2007feedback",
                "feedback\u2028")) {
            var parent = JsonNodeFactory.instance.objectNode().put("value", text);

            assertThatThrownBy(() -> GoalFeedbackSubmissionService.requiredString(
                            parent, "value", 100, false))
                    .isInstanceOf(ResponseStatusException.class)
                    .hasMessageContaining("must not have surrounding whitespace");
        }
    }

    @Test
    void preservesSchemaPermittedInteriorWhitespaceAndEmptyHoneypot() {
        String interiorWhitespace = "feedback\u00a0\ufefftext";
        var parent = JsonNodeFactory.instance.objectNode().put("value", interiorWhitespace);
        assertThat(GoalFeedbackSubmissionService.requiredString(parent, "value", 100, false))
                .isEqualTo(interiorWhitespace);

        parent.put("value", "");
        assertThat(GoalFeedbackSubmissionService.requiredString(parent, "value", 100, true))
                .isEmpty();
    }
}
