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
    void aiSpecs_makeMasteryExplicitAndConsequential() throws Exception {
        assertMasteryWriteIsGuarded(Path.of("..", "ai", "skillpilot-api-4ai.en.json"));
        assertMasteryWriteIsGuarded(Path.of("..", "ai", "skillpilot-api-4ai.de.json"));
    }

    private static void assertSpecIsAiMinimal(Path path) throws IOException {
        JsonNode root = MAPPER.readTree(Files.readString(path));
        JsonNode schemas = root.path("components").path("schemas");

        assertThat(schemas.has("LearningGoal")).isFalse();
        assertThat(schemas.has("LearningLandscape")).isFalse();
        assertThat(schemas.has("ReleaseMetadata")).isFalse();
        assertThat(containsFieldNamed(root, "release")).isFalse();
    }

    private static void assertMasteryWriteIsGuarded(Path path) throws IOException {
        JsonNode root = MAPPER.readTree(Files.readString(path));
        String lang = path.getFileName().toString().contains(".de.") ? "de" : "en";
        JsonNode operation = root.path("paths").path("/api/ai/" + lang + "/learners/{skillpilotId}/mastery")
                .path("post");
        assertThat(operation.path("x-openai-isConsequential").asBoolean()).isTrue();
        assertThat(operation.path("requestBody").path("required").asBoolean()).isTrue();
        assertThat(operation.path("description").asText()).hasSizeLessThanOrEqualTo(300);

        JsonNode masteryRequest = root.path("components").path("schemas").path("MasteryUpdateRequest");
        assertThat(masteryRequest.path("required").toString())
                .contains("\"goalId\"");
        assertThat(masteryRequest.path("properties").has("mastery")).isFalse();
        assertThat(masteryRequest.path("properties").has("value")).isFalse();
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
