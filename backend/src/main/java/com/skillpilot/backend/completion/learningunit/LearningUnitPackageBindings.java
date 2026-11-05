package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.completion.CompletionCompilationException;
import com.skillpilot.backend.curriculumpackage.CurriculumRuntimeSnapshot;
import com.skillpilot.backend.landscape.LearningGoal;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;

/** Replays only documented package normalization against immutable source evidence. */
public final class LearningUnitPackageBindings {
    private final Map<String, JsonNode> viewsByDigest = new LinkedHashMap<>();
    private final Map<String, Set<String>> ledgerKinds = new LinkedHashMap<>();
    private final CurriculumRuntimeSnapshot snapshot;
    private final ObjectMapper mapper;

    public LearningUnitPackageBindings(CurriculumRuntimeSnapshot snapshot, Map<String, byte[]> pinnedInputs,
                                       ObjectMapper mapper) throws Exception {
        this.snapshot = snapshot;
        this.mapper = mapper;
        for (var input : pinnedInputs.entrySet()) {
            if (!input.getKey().endsWith(".json")) continue;
            JsonNode document = mapper.readTree(input.getValue());
            if (document.path("viewId").isTextual()) viewsByDigest.put(rawDigest(input.getValue()), document);
            if ("semantic-kind-ledger".equals(document.path("documentType").asText())) {
                for (JsonNode decision : document.path("decisions")) {
                    if (!"authoritative".equals(decision.path("decisionStatus").asText())) continue;
                    ledgerKinds.computeIfAbsent(decision.path("goalId").asText(), ignored -> new LinkedHashSet<>())
                            .add(decision.path("semanticKind").asText());
                }
            }
        }
    }

    public Map<String, LearningGoal> validateAndRestoreSourceMeanings(LearningUnitDefinition definition,
                                                                     Map<String, LearningGoal> installedGoals) {
        for (var binding : definition.sourceBinding().compositionViewDigests().entrySet()) {
            JsonNode raw = viewsByDigest.get(binding.getValue());
            var installed = snapshot.viewsById().get(binding.getKey());
            if (raw == null || !binding.getKey().equals(raw.path("viewId").asText()) || installed == null) {
                fail("STALE_COMPOSITION_BINDING", "Package omits pinned source view or installed view");
            }
            try {
                if (!viewMeaning(raw).equals(viewMeaning(mapper.readTree(installed.json())))) {
                    fail("STALE_COMPOSITION_BINDING", "Installed view differs beyond schema/version/language normalization");
                }
            } catch (java.io.IOException invalid) {
                fail("STALE_COMPOSITION_BINDING", "Cannot read installed view");
            }
        }
        Map<String, LearningGoal> sourceMeanings = new LinkedHashMap<>(installedGoals);
        for (String id : definition.ownGoalIds()) {
            LearningGoal installed = installedGoals.get(id);
            if (installed == null || !ledgerKinds.getOrDefault(id, Set.of()).contains(installed.getSemanticKind())
                    || !LearningUnitSourceBindings.resolvedKind(installed).equals(definition.ownResolvedKinds().get(id))) {
                fail("INVALID_UNIT_PARTITION", "Installed semantic kind lacks its pinned authoritative ledger decision: " + id);
            }
            LearningGoal copy = mapper.convertValue(installed, LearningGoal.class);
            copy.setSemanticKind(definition.ownGoalMeanings().get(id).semanticKind());
            sourceMeanings.put(id, copy);
        }
        return sourceMeanings;
    }

    private JsonNode viewMeaning(JsonNode source) {
        if (!(source instanceof ObjectNode object)) throw new IllegalArgumentException("Composition view must be an object");
        ObjectNode copy = object.deepCopy();
        copy.remove(java.util.List.of("$schema", "viewFormatVersion", "language"));
        return copy;
    }
    private static String rawDigest(byte[] bytes) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
    private static void fail(String code, String detail) { throw new CompletionCompilationException(code, detail); }
}
