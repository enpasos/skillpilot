package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.util.BundeslandCodeNormalizer;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Bounded provenance inputs; final projection equality uses the existing native projector. */
final class LearningUnitPackageRegistryBindings {
    static final String SOURCE = "DE/Gymnasium/provenance/source-landscape-registry.json";
    static final String PROVENANCE = "DE/Gymnasium/provenance/canonical-goal-provenance-registry.json";
    static final String OVERRIDES = "DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json";
    private LearningUnitPackageRegistryBindings() { }

    static boolean supports(String path) { return Set.of(SOURCE, PROVENANCE, OVERRIDES).contains(path); }

    static void validate(String path, byte[] bytes, JsonNode source, Map<String, byte[]> pinnedInputs,
                         Map<String, JsonNode> installedLandscapes, Map<String, String> installedSources,
                         ObjectMapper mapper) throws Exception {
        if (!java.util.Arrays.equals(bytes, pinnedInputs.get(path))) throw invalid("Registry differs from its package-bound source bytes");
        String list = SOURCE.equals(path) ? "entries" : "landscapes";
        requireVersion(source, list);
        Map<String, String> sourceJurisdictions = sourceJurisdictions(pinnedInputs, mapper);
        for (var installed : installedSources.entrySet()) {
            if (!installed.getValue().equals(sourceJurisdictions.get(installed.getKey()))) {
                throw invalid("Consumed source jurisdiction differs from installed reviewed mapping: " + installed.getKey());
            }
        }
        if (SOURCE.equals(path)) return;
        Set<String> seenLandscapes = new LinkedHashSet<>();
        for (JsonNode record : source.path(list)) {
            String id = text(record, "landscapeId");
            if (!seenLandscapes.add(id)) throw invalid("Duplicate registry landscape");
            String field = PROVENANCE.equals(path) ? "goalProvenance" : "goalApplicabilityOverrides";
            if (!record.path(field).isObject()) throw invalid("Registry goal map is missing");
            JsonNode installed = installedLandscapes.get(id);
            if (installed == null) continue; // Global registry; foreign subjects are not installation obligations.
            Set<String> goals = new LinkedHashSet<>();
            installed.path("goals").forEach(goal -> goals.add(text(goal, "id")));
            var entries = record.path(field).fields();
            while (entries.hasNext()) {
                var entry = entries.next();
                if (!goals.contains(entry.getKey()) || !entry.getValue().isObject()) throw invalid("Registry references an unknown installed goal");
                JsonNode meaning = entry.getValue();
                if (PROVENANCE.equals(path)) {
                    if (meaning.has("sourceLandscapeId")) requireSource(text(meaning, "sourceLandscapeId"), sourceJurisdictions);
                    for (String key : List.of("additionalSourceLandscapeIds", "crossSubjectPrerequisiteLandscapeIds")) {
                        if (meaning.has(key)) for (String sourceId : texts(meaning.path(key))) requireSource(sourceId, sourceJurisdictions);
                    }
                    // Source goal labels and editorial review metadata are retained
                    // verbatim; they do not define the native applicability relation.
                } else {
                    var dimensions = meaning.fields();
                    while (dimensions.hasNext()) {
                        var dimension = dimensions.next();
                        if (!Set.of("jurisdiction", "schoolForm", "stage", "durationModel", "courseProfile").contains(dimension.getKey())) {
                            throw invalid("Unsupported consumed applicability dimension");
                        }
                        for (String value : texts(dimension.getValue())) if ("jurisdiction".equals(dimension.getKey())
                                && BundeslandCodeNormalizer.normalize(value) == null) throw invalid("Invalid jurisdiction override");
                    }
                }
            }
        }
        // The reviewed offer's exact ScopeKey/P/support/physical-view equality
        // checks the effect of these registries without a second target projector.
    }

    private static Map<String, String> sourceJurisdictions(Map<String, byte[]> inputs, ObjectMapper mapper) throws Exception {
        byte[] bytes = inputs.get(SOURCE);
        if (bytes == null) throw invalid("Consumed provenance requires its pinned source registry");
        JsonNode registry = mapper.readTree(bytes); requireVersion(registry, "entries");
        Map<String, String> result = new LinkedHashMap<>();
        for (JsonNode entry : registry.path("entries")) {
            String id = text(entry, "landscapeId");
            String jurisdiction = entry.path("jurisdiction").isTextual()
                    ? BundeslandCodeNormalizer.normalize(entry.path("jurisdiction").asText()) : null;
            if (result.putIfAbsent(id, jurisdiction == null ? "" : jurisdiction) != null) throw invalid("Duplicate source registry identity");
        }
        return result;
    }

    private static void requireSource(String id, Map<String, String> sources) {
        if (!sources.containsKey(id)) throw invalid("Consumed provenance references an unbound source identity");
    }
    private static void requireVersion(JsonNode document, String field) {
        if (!document.isObject() || document.size() != 2 || !document.path("version").isIntegralNumber()
                || document.path("version").asInt() != 1 || !document.path(field).isArray()) throw invalid("Unsupported consumed registry shape/version");
    }
    private static String text(JsonNode object, String field) {
        JsonNode value = object.path(field);
        if (!value.isTextual() || value.asText().isBlank()) throw invalid("Missing registry identity: " + field);
        return value.asText();
    }
    private static Set<String> texts(JsonNode values) {
        if (!values.isArray() || values.isEmpty()) throw invalid("Registry dimension/source list must be nonempty");
        Set<String> result = new LinkedHashSet<>();
        for (JsonNode value : values) if (!value.isTextual() || value.asText().isBlank() || !result.add(value.asText())) {
            throw invalid("Invalid or duplicate registry dimension/source identity");
        }
        return result;
    }
    private static IllegalArgumentException invalid(String detail) { return new IllegalArgumentException("INVALID_SOURCE_BINDING: " + detail); }
}
