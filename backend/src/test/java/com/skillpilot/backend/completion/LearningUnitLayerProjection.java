package com.skillpilot.backend.completion;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.HashSet;
import java.util.Set;

/**
 * The landscape without its learning-unit layer: the Java mirror of
 * {@code project_out_learning_units} in {@code scripts/curriculum_learning_units.py} and
 * {@code projectOutLearningUnits} in {@code app/scripts/learningUnitLayerProjection.ts}.
 *
 * <p>Prerequisite-reduction proofs bind the canonical documents through
 * {@link #documentHash}: a learning unit is an orthogonal placement layer
 * ({@code programUnits} of kind {@code learningUnit}, {@code goalPlacements} of relation
 * {@code own} or towards a learning unit, the top-level {@code learningUnitCoverage}),
 * so it never stales a proof, while any other change still does. No production class
 * computes this fingerprint.
 */
final class LearningUnitLayerProjection {
    static final String LEARNING_UNIT_KIND = "learningUnit";
    static final String OWN_RELATION = "own";

    private LearningUnitLayerProjection() {
    }

    static boolean isLearningUnit(JsonNode unit) {
        return unit != null && unit.isObject() && unit.has("kind") && unit.get("kind").isTextual()
                && LEARNING_UNIT_KIND.equals(unit.get("kind").asText());
    }

    /** Python {@code dict.get} semantics: an absent field and JSON null are the same key. */
    private static Object reference(JsonNode value) {
        if (value == null || value.isNull()) return null;
        return value.isTextual() ? value.asText() : value;
    }

    private static String learningUnitIdentifier(JsonNode unit) {
        Object id = reference(unit.get("id"));
        if (id != null && !(id instanceof String))
            throw new IllegalArgumentException("Learning unit ID must be a string, found " + unit.get("id"));
        return (String) id;
    }

    /** Returns the projected copy; the input is not modified. A non-object value is returned unchanged. */
    static JsonNode projectOutLearningUnits(JsonNode landscape) {
        if (landscape == null || !landscape.isObject()) return landscape;
        ObjectNode result = ((ObjectNode) landscape).deepCopy();
        result.remove("learningUnitCoverage");
        Set<String> learningUnitIds = new HashSet<>();
        JsonNode units = result.get("programUnits");
        if (units != null && units.isArray()) {
            for (JsonNode unit : units) if (isLearningUnit(unit)) learningUnitIds.add(learningUnitIdentifier(unit));
            ArrayNode kept = result.arrayNode();
            for (JsonNode unit : units) {
                if (isLearningUnit(unit)) continue;
                Object parent = unit.isObject() ? reference(unit.get("parentUnitId")) : Boolean.FALSE;
                if (unit.isObject() && (parent == null || parent instanceof String) && learningUnitIds.contains(parent))
                    throw new IllegalArgumentException("Program unit " + unit.get("id") + " of kind " + unit.get("kind")
                            + " cannot have a learning-unit parent");
                kept.add(unit);
            }
            if (!kept.isEmpty() || units.isEmpty()) result.set("programUnits", kept);
            else result.remove("programUnits");
        }
        JsonNode placements = result.get("goalPlacements");
        if (placements != null && placements.isArray()) {
            ArrayNode kept = result.arrayNode();
            for (JsonNode item : placements) {
                boolean learningUnitPlacement = false;
                if (item.isObject()) {
                    JsonNode relation = item.get("relation");
                    Object unitId = reference(item.get("unitId"));
                    learningUnitPlacement = (relation != null && relation.isTextual() && OWN_RELATION.equals(relation.asText()))
                            || ((unitId == null || unitId instanceof String) && learningUnitIds.contains(unitId));
                }
                if (!learningUnitPlacement) kept.add(item);
            }
            if (!kept.isEmpty() || placements.isEmpty()) result.set("goalPlacements", kept);
            else result.remove("goalPlacements");
        }
        return result;
    }

    /** The prerequisite-reduction document fingerprint: canonical hash of the projected landscape. */
    static String documentHash(JsonNode document, ObjectMapper mapper) {
        try {
            return CompletionReviewBindings.canonicalHash(projectOutLearningUnits(document), mapper);
        } catch (IllegalArgumentException error) {
            throw error;
        } catch (Exception error) {
            throw new IllegalStateException("Cannot hash canonical document", error);
        }
    }
}
