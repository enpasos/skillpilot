package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import java.util.Set;

/** Exact, reviewed derivation of a distinct package entry; never a goal/result alias. */
final class LearningUnitEntryDerivation {
    private static final Set<String> FIELDS = Set.of("schemaVersion", "semantics", "originalOverviewPath",
            "originalOverviewSha256", "entryPath", "entrySha256", "entryLandscapeId", "entryRootGoalId",
            "mathematicsLandscapeId", "mathematicsRootGoalId", "reviewRef");

    private LearningUnitEntryDerivation() { }

    static Set<String> validate(LearningUnitOfferBindings.Proof pointer, Map<String, byte[]> inputs,
                                ObjectMapper mapper) throws Exception {
        if (pointer == null) return Set.of();
        String descriptorPath = LearningUnitCatalog.checkedPath(pointer.path());
        byte[] descriptorBytes = require(inputs, descriptorPath, pointer.sha256());
        JsonNode descriptor = mapper.readTree(descriptorBytes);
        Set<String> fields = new java.util.LinkedHashSet<>();
        descriptor.fieldNames().forEachRemaining(fields::add);
        if (!fields.equals(FIELDS) || !descriptor.path("schemaVersion").isIntegralNumber()
                || descriptor.path("schemaVersion").asInt() != 1
                || !"reviewed-mathematics-package-entry-v1".equals(descriptor.path("semantics").asText())) {
            throw new IllegalArgumentException("Unsupported reviewed package entry derivation");
        }
        String originalPath = text(descriptor, "originalOverviewPath");
        String entryPath = text(descriptor, "entryPath");
        JsonNode original = mapper.readTree(require(inputs, originalPath, text(descriptor, "originalOverviewSha256")));
        JsonNode entry = mapper.readTree(require(inputs, entryPath, text(descriptor, "entrySha256")));
        require(inputs, text(descriptor, "reviewRef"), null);
        String entryId = text(descriptor, "entryLandscapeId");
        String rootId = text(descriptor, "entryRootGoalId");
        String mathId = text(descriptor, "mathematicsLandscapeId");
        String mathRoot = text(descriptor, "mathematicsRootGoalId");
        String originalId = text(original, "landscapeId");
        if (!entryId.equals(text(entry, "landscapeId")) || entryId.equals(originalId) || entryId.equals(mathId)
                || !"Gymnasium".equals(entry.path("schoolType").asText())
                || !entry.path("frameworkId").asText().startsWith("canonical-gymnasium")) {
            throw new IllegalArgumentException("Package entry must have its own reviewed landscape identity");
        }
        JsonNode goals = entry.path("goals");
        JsonNode goal = goals.path(0);
        if (!goals.isArray() || goals.size() != 1 || !rootId.equals(goal.path("id").asText())
                || !"cluster".equals(goal.path("type").asText())
                || !"programStructure".equals(goal.path("semanticKind").asText())
                || goal.path("contains").size() != 1 || !mathRoot.equals(goal.path("contains").path(0).asText())
                || goal.path("requires").size() != 0 || rootId.equals(mathRoot)) {
            throw new IllegalArgumentException("Package entry is not the reviewed one-subject structural root");
        }
        boolean originalContainsMath = false;
        for (JsonNode oldGoal : original.path("goals")) {
            if (rootId.equals(oldGoal.path("id").asText())) throw new IllegalArgumentException("Package entry reuses an original goal identity");
            for (JsonNode child : oldGoal.path("contains")) if (mathRoot.equals(child.asText())) originalContainsMath = true;
        }
        if (!originalContainsMath || !original.path("filters").equals(entry.path("filters"))
                || !deriveFlow(original.path("personalizationFlow"), originalId, entryId, mathId, mapper)
                        .equals(entry.path("personalizationFlow"))) {
            throw new IllegalArgumentException("Package entry differs beyond its reviewed personalization derivation");
        }
        // Only these exact, authenticated provenance documents may lack an installed
        // landscape counterpart. The resulting entry still undergoes ordinary parity.
        return Set.of(descriptorPath, originalPath);
    }

    private static JsonNode deriveFlow(JsonNode source, String originalId, String entryId, String mathId,
                                       ObjectMapper mapper) {
        if (source instanceof ObjectNode object) {
            ObjectNode result = object.deepCopy();
            object.fields().forEachRemaining(field -> {
                if (Set.of("landscapeId", "targetLandscapeId").contains(field.getKey()) && originalId.equals(field.getValue().asText())) {
                    result.put(field.getKey(), entryId);
                } else if ("landscapeIds".equals(field.getKey())) {
                    result.set(field.getKey(), mapper.createArrayNode().add(mathId));
                } else result.set(field.getKey(), deriveFlow(field.getValue(), originalId, entryId, mathId, mapper));
            });
            return result;
        }
        if (source instanceof ArrayNode array) {
            ArrayNode result = mapper.createArrayNode();
            array.forEach(value -> result.add(deriveFlow(value, originalId, entryId, mathId, mapper)));
            return result;
        }
        return source.deepCopy();
    }

    private static String text(JsonNode object, String key) {
        JsonNode value = object.path(key);
        if (!value.isTextual() || value.asText().isBlank()) throw new IllegalArgumentException("Missing entry derivation field: " + key);
        return value.asText();
    }

    private static byte[] require(Map<String, byte[]> inputs, String path, String hash) throws Exception {
        byte[] bytes = inputs.get(LearningUnitCatalog.checkedPath(path));
        if (bytes == null || bytes.length == 0 || hash != null && !HexFormat.of().formatHex(
                MessageDigest.getInstance("SHA-256").digest(bytes)).equals(hash)) {
            throw new IllegalArgumentException("Missing or changed pinned entry derivation input: " + path);
        }
        return bytes;
    }
}
