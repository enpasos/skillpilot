package com.skillpilot.backend.ai;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.Map;
import org.junit.jupiter.api.Test;

class AiOpenApiSpecTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Test
    void aiSpecs_doNotExposeInternalReleaseOrLandscapeSchemas() throws Exception {
        assertSpecIsAiMinimal(Path.of("..", "ai", "skillpilot-api-4ai.en.json"));
        assertSpecIsAiMinimal(Path.of("..", "ai", "skillpilot-api-4ai.de.json"));
    }

    @Test
    void aiSpecs_makeMasteryExplicitAndAlwaysAllowable() throws Exception {
        assertMasteryWriteIsGuardedButAlwaysAllowable(Path.of("..", "ai", "skillpilot-api-4ai.en.json"));
        assertMasteryWriteIsGuardedButAlwaysAllowable(Path.of("..", "ai", "skillpilot-api-4ai.de.json"));
    }

    @Test
    void aiSpecs_markAllActionsAlwaysAllowable() throws Exception {
        assertAllActionsAreAlwaysAllowable(Path.of("..", "ai", "skillpilot-api-4ai.en.json"));
        assertAllActionsAreAlwaysAllowable(Path.of("..", "ai", "skillpilot-api-4ai.de.json"));
    }

    private static void assertSpecIsAiMinimal(Path path) throws IOException {
        JsonNode root = MAPPER.readTree(Files.readString(path));
        JsonNode schemas = root.path("components").path("schemas");

        assertThat(schemas.has("LearningGoal")).isFalse();
        assertThat(schemas.has("LearningLandscape")).isFalse();
        assertThat(schemas.has("ReleaseMetadata")).isFalse();
        assertThat(containsFieldNamed(root, "release")).isFalse();
    }

    private static void assertMasteryWriteIsGuardedButAlwaysAllowable(Path path) throws IOException {
        JsonNode root = MAPPER.readTree(Files.readString(path));
        String lang = path.getFileName().toString().contains(".de.") ? "de" : "en";
        JsonNode paths = root.path("paths");
        assertThat(paths.has("/api/ai/" + lang + "/learners/{skillpilotId}/mastery")).isFalse();

        JsonNode operation = paths.path("/api/ai/" + lang + "/sessions/{chatSessionToken}/mastery")
                .path("post");
        assertThat(operation.path("x-openai-isConsequential").asBoolean()).isFalse();
        assertThat(operation.path("requestBody").path("required").asBoolean()).isTrue();
        assertThat(operation.path("description").asText()).hasSizeLessThanOrEqualTo(300);

        JsonNode masteryRequest = root.path("components").path("schemas").path("MasteryUpdateRequest");
        assertThat(masteryRequest.path("required").toString())
                .contains("\"goalId\"");
        assertThat(masteryRequest.path("properties").has("mastery")).isFalse();
        assertThat(masteryRequest.path("properties").has("value")).isFalse();
    }

    private static void assertAllActionsAreAlwaysAllowable(Path path) throws IOException {
        JsonNode root = MAPPER.readTree(Files.readString(path));
        JsonNode paths = root.path("paths");
        paths.fields().forEachRemaining(pathEntry -> pathEntry.getValue().fields().forEachRemaining(methodEntry -> {
            JsonNode operation = methodEntry.getValue();
            if (!operation.has("operationId")) {
                return;
            }
            String actionName = methodEntry.getKey() + " " + pathEntry.getKey() + " "
                    + operation.path("operationId").asText();
            assertThat(operation.has("x-openai-isConsequential"))
                    .as(actionName)
                    .isTrue();
            assertThat(operation.path("x-openai-isConsequential").asBoolean())
                    .as(actionName)
                    .isFalse();
        }));
    }

    private static boolean containsFieldNamed(JsonNode node, String fieldName) {
        if (node == null || node.isMissingNode()) {
            return false;
        }
        if (node.isObject()) {
            Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
            while (fields.hasNext()) {
                Map.Entry<String, JsonNode> entry = fields.next();
                if (fieldName.equals(entry.getKey()) || containsFieldNamed(entry.getValue(), fieldName)) {
                    return true;
                }
            }
            return false;
        }
        if (node.isArray()) {
            for (JsonNode item : node) {
                if (containsFieldNamed(item, fieldName)) {
                    return true;
                }
            }
        }
        return false;
    }
}
