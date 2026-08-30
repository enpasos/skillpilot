package com.skillpilot.backend.goalfeedback;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;

/** Small deterministic JSON profile used to bind stored envelopes and exports. */
@Component
@ConditionalOnExpression("${skillpilot.goal-feedback.enabled:${SKILLPILOT_GOAL_FEEDBACK_ENABLED:false}}")
public class GoalFeedbackCanonicalJson {

    private final ObjectMapper objectMapper;

    public GoalFeedbackCanonicalJson(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public String serialize(JsonNode source) {
        try {
            return objectMapper.writeValueAsString(sortObjects(source));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to serialize canonical goal-feedback JSON", exception);
        }
    }

    public String digest(JsonNode source) {
        return digest(serialize(source));
    }

    public String digest(String canonicalJson) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(canonicalJson.getBytes(StandardCharsets.UTF_8));
            return "sha256:" + HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    public JsonNode parseStored(String json) {
        try {
            return objectMapper.readTree(json);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Stored goal-feedback JSON is invalid", exception);
        }
    }

    private JsonNode sortObjects(JsonNode node) {
        if (node.isObject()) {
            ObjectNode result = objectMapper.createObjectNode();
            List<Map.Entry<String, JsonNode>> fields = new ArrayList<>();
            node.fields().forEachRemaining(fields::add);
            fields.sort(Comparator.comparing(Map.Entry::getKey));
            for (Map.Entry<String, JsonNode> field : fields) {
                result.set(field.getKey(), sortObjects(field.getValue()));
            }
            return result;
        }
        if (node.isArray()) {
            ArrayNode result = objectMapper.createArrayNode();
            node.forEach(item -> result.add(sortObjects(item)));
            return result;
        }
        return node.deepCopy();
    }
}
