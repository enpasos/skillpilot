package com.skillpilot.backend.api;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.modelcontextprotocol.spec.McpSchema;
import java.io.IOException;

/** Checks the actual structured payload and every serialized text payload, including successors. */
public final class LearningPlanWireAssertions {
    private LearningPlanWireAssertions() {}

    public static McpSchema.CallToolResult assertReducedPlanPayloads(McpSchema.CallToolResult result) {
        ObjectMapper mapper = new ObjectMapper();
        assertReduced(mapper.valueToTree(result.structuredContent()));
        if (result.content() != null) {
            for (McpSchema.Content content : result.content()) {
                if (content instanceof McpSchema.TextContent text) {
                    String value = text.text().stripLeading();
                    if (value.startsWith("{") || value.startsWith("[")) {
                        try {
                            assertReduced(mapper.readTree(value));
                        } catch (IOException error) {
                            throw new AssertionError("MCP text payload must be valid JSON", error);
                        }
                    }
                }
            }
        }
        return result;
    }

    private static void assertReduced(JsonNode payload) {
        for (JsonNode status : payload.findValues("learningPlanToday")) {
            if (status.isNull()) continue;
            assertThat(status.isObject()).isTrue();
            assertThat(status.has("statusDirection")).as("No cross-subject traffic light").isFalse();
            for (String field : java.util.List.of(
                    "unavailablePlanCount", "totals", "dueToday", "completedToday", "openToday",
                    "openOverdue", "extraCompletedToday", "dueThroughToday", "rawSaldo",
                    "landscapeIds", "landscapeId", "subjectKey", "planId", "balance")) {
                assertThat(status.findValues(field)).as("Forbidden plan field: %s", field).isEmpty();
            }
            assertThat(status.path("text").isTextual()).as("Backend text must cross the boundary").isTrue();
            assertNoNumber(status);
        }
    }

    private static void assertNoNumber(JsonNode node) {
        assertThat(node.isNumber()).as("No second numeric plan source for the model").isFalse();
        node.forEach(LearningPlanWireAssertions::assertNoNumber);
    }
}
