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
    private final Map<String, JsonNode> installedLandscapes = new LinkedHashMap<>();
    private final Set<String> installedMappingPairs = new LinkedHashSet<>();
    private final Map<String, String> installedSourceJurisdictions = new LinkedHashMap<>();
    private final Map<String, byte[]> pinnedInputs;
    private String currentMappingFailure;
    private final CurriculumRuntimeSnapshot snapshot;
    private final ObjectMapper mapper;
    private Map<String, String> nativeMappingInputDigests;

    public LearningUnitPackageBindings(CurriculumRuntimeSnapshot snapshot, Map<String, byte[]> pinnedInputs,
                                       ObjectMapper mapper) throws Exception {
        this.snapshot = snapshot;
        this.mapper = mapper;
        this.pinnedInputs = Map.copyOf(pinnedInputs);
        for (var input : pinnedInputs.entrySet()) {
            if (!input.getKey().endsWith(".json")) continue;
            JsonNode document;
            try { document = mapper.readTree(input.getValue()); }
            catch (java.io.IOException malformed) { continue; } // The owning frozen contract/offer records its own failure.
            if (document == null) continue;
            if (document.path("viewId").isTextual()) viewsByDigest.put(rawDigest(input.getValue()), document);
            if ("semantic-kind-ledger".equals(document.path("documentType").asText())) {
                for (JsonNode decision : document.path("decisions")) {
                    if (!"authoritative".equals(decision.path("decisionStatus").asText())) continue;
                    ledgerKinds.computeIfAbsent(decision.path("goalId").asText(), ignored -> new LinkedHashSet<>())
                            .add(decision.path("semanticKind").asText());
                }
            }
        }
        for (var landscape : snapshot.landscapesById().values()) {
            installedLandscapes.put(landscape.landscapeId(), mapper.readTree(landscape.json()));
        }
        if (snapshot.packages().stream().anyMatch(pkg -> pkg.capabilities().contains(LearningUnitOfferBindings.CAPABILITY))) {
            nativeMappingInputDigests = new java.util.TreeMap<>();
            Set<String> operationalPackages = snapshot.packages().stream()
                    .filter(pkg -> pkg.capabilities().contains(LearningUnitOfferBindings.CAPABILITY))
                    .map(CurriculumRuntimeSnapshot.PackageDescriptor::packageId).collect(java.util.stream.Collectors.toSet());
            for (var artifact : snapshot.artifactsByRole().getOrDefault(LearningUnitCatalog.INPUT_ROLE, java.util.List.of())) {
                if (!operationalPackages.contains(artifact.packageId())) continue;
                String path = mapper.readTree(artifact.contentBytes()).path("definition").path("sourcePath").asText();
                if (com.skillpilot.backend.landscape.GoalMappingService.isNativeOperationalMappingPath(path)) {
                    byte[] bytes = pinnedInputs.get(path);
                    if (bytes == null) throw new IllegalArgumentException("Native operational mapping has no exact input wrapper");
                    if (com.skillpilot.backend.landscape.GoalMappingService.isNativeOperationalMappingCandidate(path, bytes, mapper)) {
                        nativeMappingInputDigests.put(path, rawDigest(bytes));
                    }
                }
            }
            nativeMappingInputDigests = java.util.Collections.unmodifiableMap(nativeMappingInputDigests);
            for (var artifact : snapshot.artifactsByRole().getOrDefault("mapping", java.util.List.of())) {
                try {
                    JsonNode mapping = mapper.readTree(artifact.contentBytes());
                    for (JsonNode collection : mapping.path("collections")) {
                        installedMappingPairs.add(collection.path("sourceLandscapeId").asText() + "\n" + collection.path("targetLandscapeId").asText());
                        String sourceId = collection.path("sourceLandscapeId").asText();
                        String jurisdiction = com.skillpilot.backend.util.BundeslandCodeNormalizer.normalize(collection.path("jurisdiction").asText());
                        String previous = installedSourceJurisdictions.putIfAbsent(sourceId, jurisdiction == null ? "" : jurisdiction);
                        if (previous != null && !previous.equals(jurisdiction)) currentMappingFailure = "Installed source jurisdictions conflict";
                    }
                } catch (Exception missing) { currentMappingFailure = "Installed reviewed mapping relation is unavailable"; }
            }
        }
    }

    /** Null for legacy packages; otherwise exact live native inputs, never archived copies. */
    public Map<String, String> nativeMappingInputDigests() { return nativeMappingInputDigests; }

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
        return restoreCurrentSourceMeanings(definition, installedGoals);
    }

    /** Historical view hashes never restrict a newly reviewed current offer generation. */
    public Map<String, LearningGoal> restoreCurrentSourceMeanings(LearningUnitDefinition definition,
                                                                 Map<String, LearningGoal> installedGoals) {
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

    /** Bounded replay of the semantics consumed by the real native projector. */
    public void validateCurrentOfferInput(String path, byte[] pinnedBytes) throws Exception {
        if (!path.endsWith(".json")) return; // Exact review bytes were already pinned by the offer loader.
        JsonNode source = mapper.readTree(pinnedBytes);
        if (com.skillpilot.backend.landscape.GoalMappingService.isNativeOperationalMappingCandidate(path, pinnedBytes, mapper)
                && !com.skillpilot.backend.landscape.GoalMappingService.isNativeMappingDocument(source)) {
            fail("INVALID_SOURCE_BINDING", "Malformed current native mapping input: " + path);
        }
        if (LearningUnitPackageRegistryBindings.supports(path)) {
            if (currentMappingFailure != null) fail("INVALID_SOURCE_BINDING", currentMappingFailure);
            LearningUnitPackageRegistryBindings.validate(path, pinnedBytes, source, pinnedInputs,
                    installedLandscapes, installedSourceJurisdictions, mapper);
            return;
        }
        if (source.path("viewId").isTextual()) {
            var installed = snapshot.viewsById().get(source.path("viewId").asText());
            if (installed == null || !viewMeaning(source).equals(viewMeaning(mapper.readTree(installed.json())))) {
                fail("STALE_COMPOSITION_BINDING", "Installed current view differs beyond schema/version/language normalization");
            }
            return;
        }
        if (source.path("landscapeId").isTextual() && source.path("goals").isArray()) {
            JsonNode installed = installedLandscapes.get(source.path("landscapeId").asText());
            if (installed == null) fail("INVALID_SOURCE_BINDING", "Installed package omits a current native landscape");
            var raw = mapper.treeToValue(source, com.skillpilot.backend.landscape.SkillLandscape.class);
            var actual = mapper.treeToValue(installed, com.skillpilot.backend.landscape.SkillLandscape.class);
            if (!mapper.valueToTree(raw.getPersonalizationFlow()).equals(mapper.valueToTree(actual.getPersonalizationFlow()))
                    || !mapper.valueToTree(raw.getFilters()).equals(mapper.valueToTree(actual.getFilters()))) {
                fail("INVALID_SOURCE_BINDING", "Installed personalization flow or filters differ");
            }
            if (!mapper.valueToTree(raw.getProgramUnits()).equals(mapper.valueToTree(actual.getProgramUnits()))
                    || !mapper.valueToTree(raw.getGoalPlacements()).equals(mapper.valueToTree(actual.getGoalPlacements()))) {
                fail("STALE_PLACEMENT_BINDING", "Installed program units or acquisition placements differ");
            }
            var rawGoals = com.skillpilot.backend.completion.CompletionCanonicalGraphResolver.normalizeDefinitions(java.util.List.of(raw), mapper);
            var actualGoals = com.skillpilot.backend.completion.CompletionCanonicalGraphResolver.normalizeDefinitions(java.util.List.of(actual), mapper);
            if (!rawGoals.keySet().equals(actualGoals.keySet())) fail("INVALID_SOURCE_BINDING", "Installed current goal universe differs");
            for (var entry : rawGoals.entrySet()) {
                var expected = entry.getValue();
                var found = actualGoals.get(entry.getKey());
                if (expected.getContains().isEmpty()
                        && !LearningUnitSourceBindings.resolvedKind(expected).equals(LearningUnitSourceBindings.resolvedKind(found))) {
                    fail("INVALID_UNIT_PARTITION", "Installed current resolved goal kind differs");
                }
                var meaning = mapper.convertValue(found, LearningGoal.class);
                if (!java.util.Objects.equals(found.getSemanticKind(), expected.getSemanticKind())) {
                    if (!ledgerKinds.getOrDefault(found.getId(), Set.of()).contains(found.getSemanticKind())) {
                        fail("INVALID_UNIT_PARTITION", "Installed kind enrichment lacks its pinned authoritative ledger decision");
                    }
                    meaning.setSemanticKind(expected.getSemanticKind());
                }
                if (!LearningUnitSourceBindings.resolvedKind(expected).equals(LearningUnitSourceBindings.resolvedKind(meaning))) {
                    fail("INVALID_UNIT_PARTITION", "Installed current source kind differs after verified mechanical enrichment");
                }
                if (!LearningUnitSourceBindings.meaningDigest(expected).equals(LearningUnitSourceBindings.meaningDigest(meaning))
                        || !expected.getContains().equals(found.getContains()) || !expected.getRequires().equals(found.getRequires())) {
                    fail("GOAL_MEANING_CONFLICT", "Installed current goal meaning or full structural/prerequisite edges differ");
                }
                for (String key : java.util.List.of("applicabilityFromRequires", "applicabilityMappingInheritance", "applicabilityProjection", "compatibilityOnly")) {
                    Object before = expected.getExtendedData() == null ? null : expected.getExtendedData().get(key);
                    Object after = found.getExtendedData() == null ? null : found.getExtendedData().get(key);
                    if (!java.util.Objects.equals(before, after)) fail("INVALID_SOURCE_BINDING", "Installed projection boundary differs: " + key);
                }
                // The compiler explicitly removes applicabilityOverrides/masteryMigration.
                // Their projection effect remains bound by actual ScopeKey/P/support/view
                // equality; they are never used to admit a historical result alias.
            }
            return;
        }
        if ("semantic-kind-ledger".equals(source.path("documentType").asText())) return;
        if (source.path("sourceLandscapeId").isTextual() && source.path("targetLandscapeId").isTextual()) {
            if (currentMappingFailure != null || !installedMappingPairs.contains(source.path("sourceLandscapeId").asText()
                    + "\n" + source.path("targetLandscapeId").asText())) {
                fail("INVALID_SOURCE_BINDING", "Pinned mapping source is not represented in the installed reviewed mapping relation");
            }
            // Compiled mappings consume independently reviewed decisions, not the
            // legacy raw pair list. Exact native projection parity checks their effect.
            return;
        }
        if (!path.startsWith("DE/Gymnasium/quality/learning-units/")) {
            fail("INVALID_SOURCE_BINDING", "Unsupported current runtime input kind: " + path);
        }
    }

    public byte[] readCurrentDeck(String goalId, String sourcePath) {
        String owner = installedLandscapes.entrySet().stream().filter(entry -> {
            for (JsonNode goal : entry.getValue().path("goals")) if (goalId.equals(goal.path("id").asText())) return true;
            return false;
        }).map(Map.Entry::getKey).findFirst().orElse(null);
        for (var deck : snapshot.decksByKey().values()) {
            if (java.util.Objects.equals(owner, deck.landscapeId()) && deck.artifact().relativePath().equals(sourcePath)) {
                return deck.json().getBytes(java.nio.charset.StandardCharsets.UTF_8);
            }
        }
        return null;
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
