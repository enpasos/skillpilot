package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionCompilationException;
import com.skillpilot.backend.completion.CompletionCanonicalGraphResolver;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.io.IOException;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;

/** Ordered admission of content-pinned historical contracts and new active candidates. */
public final class LearningUnitCatalog {
    public static final String MANIFEST_PATH = "DE/Gymnasium/learning-units/catalog.json";
    public static final String CONTRACT_ROLE = "learning-unit-contract";
    public static final String INPUT_ROLE = "learning-unit-input";
    public static final String CATALOG_ROLE = "learning-unit-catalog";
    private final List<LearningUnitDefinition> definitions;
    private final Map<String, String> quarantined;
    private final CompiledLearningUnits compiled;
    private final Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals;
    private final Map<String, String> resultAliases;
    private final Map<String, LearningUnitRecallBindings.FrozenRecall> frozenRecallSelections;
    private final Set<LearningUnitDefinition.ContractRef> activeContractRefs;
    private final Map<LearningUnitDefinition.ContractRef, String> currentReadinessFailures;
    private final CurrentOfferBinding currentOfferBinding;
    private final String currentOfferBindingFailure;

    private LearningUnitCatalog(List<LearningUnitDefinition> definitions, Map<String, String> quarantined,
                                Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals) {
        this(definitions, quarantined, masteryGoals, Map.of(), Map.of());
    }

    private LearningUnitCatalog(List<LearningUnitDefinition> definitions, Map<String, String> quarantined,
                                Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals,
                                Map<String, String> resultAliases) {
        this(definitions, quarantined, masteryGoals, resultAliases, Map.of());
    }

    private LearningUnitCatalog(List<LearningUnitDefinition> definitions, Map<String, String> quarantined,
                                Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals,
                                Map<String, String> resultAliases,
                                Map<String, LearningUnitRecallBindings.FrozenRecall> frozenRecallSelections) {
        this(definitions, quarantined, masteryGoals, resultAliases, frozenRecallSelections, Set.of(), Map.of());
    }

    private LearningUnitCatalog(List<LearningUnitDefinition> definitions, Map<String, String> quarantined,
                                Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals,
                                Map<String, String> resultAliases,
                                Map<String, LearningUnitRecallBindings.FrozenRecall> frozenRecallSelections,
                                Set<LearningUnitDefinition.ContractRef> activeContractRefs,
                                Map<LearningUnitDefinition.ContractRef, String> currentReadinessFailures) {
        this(definitions, quarantined, masteryGoals, resultAliases, frozenRecallSelections,
                activeContractRefs, currentReadinessFailures, null, null);
    }

    private LearningUnitCatalog(List<LearningUnitDefinition> definitions, Map<String, String> quarantined,
                                Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals,
                                Map<String, String> resultAliases,
                                Map<String, LearningUnitRecallBindings.FrozenRecall> frozenRecallSelections,
                                Set<LearningUnitDefinition.ContractRef> activeContractRefs,
                                Map<LearningUnitDefinition.ContractRef, String> currentReadinessFailures,
                                CurrentOfferBinding currentOfferBinding, String currentOfferBindingFailure) {
        this.definitions = List.copyOf(definitions);
        this.quarantined = Map.copyOf(quarantined);
        this.compiled = definitions.isEmpty() ? null : new LearningUnitCompiler().compile(definitions);
        this.masteryGoals = Map.copyOf(masteryGoals);
        this.resultAliases = Map.copyOf(resultAliases);
        this.frozenRecallSelections = Map.copyOf(frozenRecallSelections);
        this.activeContractRefs = Set.copyOf(activeContractRefs);
        this.currentReadinessFailures = Map.copyOf(currentReadinessFailures);
        this.currentOfferBinding = currentOfferBinding;
        this.currentOfferBindingFailure = currentOfferBindingFailure;
    }

    public static LearningUnitCatalog empty() { return new LearningUnitCatalog(List.of(), Map.of(), Map.of()); }

    public static LearningUnitCatalog load(byte[] manifestBytes, InputSource source,
                                           Consumer<LearningUnitDefinition> activeSourceValidator,
                                           ObjectMapper mapper) throws IOException {
        return load(manifestBytes, source, activeSourceValidator, recall -> {
            throw new IllegalArgumentException("Active recall requires actual runtime deck/selection validation");
        }, mapper);
    }

    public static LearningUnitCatalog load(byte[] manifestBytes, InputSource source,
                                           Consumer<LearningUnitDefinition> activeSourceValidator,
                                           LearningUnitRecallBindings.ActiveValidator activeRecallValidator,
                                           ObjectMapper mapper) throws IOException {
        ObjectMapper strict = mapper.copy().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        JsonNode manifest = strict.readTree(manifestBytes);
        Set<String> manifestFields = new java.util.HashSet<>();
        if (manifest != null && manifest.isObject()) manifest.fieldNames().forEachRemaining(manifestFields::add);
        if ((!manifestFields.equals(Set.of("schemaVersion", "contracts"))
                && !manifestFields.equals(Set.of("schemaVersion", "contracts", "currentOfferBinding")))
                || !manifest.path("schemaVersion").isIntegralNumber() || manifest.path("schemaVersion").intValue() != 1
                || !manifest.path("contracts").isArray()) throw new IllegalArgumentException("Unsupported learning-unit catalog");
        CurrentOfferBinding currentOffer = null;
        String currentOfferFailure = null;
        if (manifest.has("currentOfferBinding")) {
            try {
                JsonNode pointer = manifest.get("currentOfferBinding");
                if (!pointer.isObject() || pointer.size() != 2 || !pointer.path("path").isTextual()
                        || !pointer.path("sha256").isTextual() || !pointer.path("sha256").asText().matches("[0-9a-f]{64}")) {
                    throw new IllegalArgumentException("Current offer binding requires exact path and SHA256 fields");
                }
                currentOffer = strict.treeToValue(pointer, CurrentOfferBinding.class);
                checkedPath(currentOffer.path());
            } catch (Exception invalid) {
                currentOffer = null;
                currentOfferFailure = "CURRENT_OFFER_BINDING_UNAVAILABLE: " + invalid.getMessage();
            }
        }
        List<LearningUnitDefinition> prepared = new ArrayList<>();
        Map<String, String> quarantined = new LinkedHashMap<>();
        Map<String, VerifiedInput> capturedInputs = new LinkedHashMap<>();
        Map<String, FrozenSource> frozenSources = new LinkedHashMap<>();
        LearningUnitCompiler compiler = new LearningUnitCompiler();
        Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals = new LinkedHashMap<>();
        Map<LearningUnitDefinition.ContractRef, PreparedSource> sources = new LinkedHashMap<>();
        Map<String, String> preparedAliases = new LinkedHashMap<>();
        Map<String, LearningUnitRecallBindings.FrozenRecall> preparedRecalls = new LinkedHashMap<>();
        Map<String, Map<String, String>> preparedAssessmentMeanings = new LinkedHashMap<>();
        Set<LearningUnitDefinition.ContractRef> activeRefs = new java.util.LinkedHashSet<>();
        Map<LearningUnitDefinition.ContractRef, String> readinessFailures = new LinkedHashMap<>();
        Set<String> seen = new java.util.HashSet<>();
        // Historical admission wins even if a manifest accidentally lists a new
        // active candidate first. Relative archive order remains authoritative.
        List<JsonNode> admissionOrder = new ArrayList<>();
        manifest.path("contracts").forEach(admissionOrder::add);
        admissionOrder.sort(java.util.Comparator.comparingInt(entry -> "archived".equals(entry.path("status").asText()) ? 0 : 1));
        for (JsonNode rawEntry : admissionOrder) {
            String identity = rawEntry.path("path").isTextual() ? rawEntry.path("path").asText() : "<invalid-entry>";
            try {
                Entry entry = strict.treeToValue(rawEntry, Entry.class);
                if (entry == null || !Set.of("active", "archived").contains(entry.status()) || !seen.add(entry.path())) {
                    throw new IllegalArgumentException("Invalid/duplicate catalog entry");
                }
                checkedPath(entry.path());
                if (!entry.path().startsWith("DE/Gymnasium/learning-units/contracts/")) throw new IllegalArgumentException("Contract outside immutable archive");
                byte[] bytes = capturedRead(entry.path(), entry.sha256(), source, capturedInputs);
                var definition = strict.readValue(bytes, LearningUnitDefinition.class);
                Map<String, byte[]> inputs = new LinkedHashMap<>();
                for (var input : entry.inputs().entrySet()) inputs.put(input.getKey(), capturedRead(input.getKey(), input.getValue(), source, capturedInputs));
                byte[] sourceSnapshotBytes = requireInput(inputs, entry.sourceSnapshotPath());
                FrozenSource frozen = frozenSources.get(entry.sourceSnapshotPath());
                if (frozen == null) {
                    SourceSnapshot snapshot = strict.readValue(sourceSnapshotBytes, SourceSnapshot.class);
                    if (snapshot.schemaVersion() != 1 || !"completion-goal-kinds-v1".equals(snapshot.resolverRevision())
                            || snapshot.landscapes() == null || snapshot.landscapes().isEmpty()) {
                        throw new IllegalArgumentException("Unsupported frozen authoritative source snapshot");
                    }
                    frozen = new FrozenSource(snapshot, CompletionCanonicalGraphResolver.normalizeDefinitions(snapshot.landscapes(), strict));
                    frozenSources.put(entry.sourceSnapshotPath(), frozen);
                }
                var frozenSource = frozen.snapshot().landscapes().stream()
                        .filter(landscape -> definition.sourceBinding().landscapeId().equals(landscape.getLandscapeId()))
                        .findFirst().orElseThrow(() -> new IllegalArgumentException("Source snapshot omits bound landscape"));
                LearningUnitSourceBindings.validateActiveSource(definition, frozenSource,
                        frozen.canonicalGoals(), frozen.snapshot().compositionViewDigests());
                for (var view : definition.sourceBinding().compositionViewDigests().entrySet()) {
                    boolean pinned = false;
                    for (var input : entry.inputs().entrySet()) {
                        if (!view.getValue().equals(input.getValue())) continue;
                        JsonNode document = strict.readTree(requireInput(inputs, input.getKey()));
                        if (view.getKey().equals(document.path("viewId").asText())) { pinned = true; break; }
                    }
                    if (!pinned) throw new IllegalArgumentException("Bound source view bytes are not pinned: " + view.getKey());
                }
                requireInput(inputs, reviewPath(definition.reviewRef()));
                Map<String, Map<String, String>> assessmentMeanings = new LinkedHashMap<>();
                for (var claim : definition.assessmentClaims().entrySet()) {
                    var paths = entry.assessmentInputs().get(claim.getKey());
                    LearningUnitAssessmentVariants.validateFrozen(claim.getKey(), claim.getValue(), paths,
                            inputs, frozen.canonicalGoals(), strict);
                    Map<String, String> meanings = new java.util.TreeMap<>();
                    for (String covered : claim.getValue().coveredGoalIds()) {
                        var goal = frozen.canonicalGoals().get(covered);
                        if (goal == null) throw new CompletionCompilationException("ASSESSMENT_CLAIM_CONFLICT", "Claimed canonical goal is missing: " + covered);
                        meanings.put(covered, LearningUnitSourceBindings.canonicalDigest(Map.of(
                                "meaning", LearningUnitSourceBindings.meaning(goal), "resolvedKind", LearningUnitSourceBindings.resolvedKind(goal))));
                    }
                    var earlier = preparedAssessmentMeanings.get(claim.getKey());
                    if (earlier != null && !earlier.equals(meanings)) {
                        throw new CompletionCompilationException("ASSESSMENT_MEANING_CONFLICT", "Frozen meanings of the full canonical claim changed: " + claim.getKey());
                    }
                    assessmentMeanings.put(claim.getKey(), Map.copyOf(meanings));
                }
                if (!entry.assessmentInputs().keySet().equals(definition.assessmentClaims().keySet())) {
                    throw new IllegalArgumentException("Frozen assessment inputs do not match own Q");
                }
                if ((!definition.ownRecallGoalIds().isEmpty()
                        && !LearningUnitRecallBindings.SEMANTICS.equals(entry.recallBindingSemantics()))
                        || (definition.ownRecallGoalIds().isEmpty() && entry.recallBindingSemantics() != null)) {
                    throw new CompletionCompilationException("INVALID_RECALL_BINDING", "Recall contracts need the explicitly supported immutable selection semantics");
                }
                var recalls = LearningUnitRecallBindings.validateFrozen(definition, frozen.canonicalGoals(), entry.recallInputs(), inputs, strict);
                for (var recall : recalls.entrySet()) {
                    var previous = preparedRecalls.get(recall.getKey());
                    if (previous != null && !previous.sameOutcomeMeaning(recall.getValue())) {
                        throw new CompletionCompilationException("RECALL_MEANING_CONFLICT", "Stable memory identity changed its deck, selected cards or card meaning: " + recall.getKey());
                    }
                }
                Map<String, String> aliases = validateAliases(definition, frozen, inputs, strict);
                for (var alias : aliases.entrySet()) {
                    String existing = preparedAliases.get(alias.getKey());
                    if (existing != null && !existing.equals(alias.getValue())) {
                        throw new CompletionCompilationException("AMBIGUOUS_RESULT_ALIAS", "Conflicting frozen result alias: " + alias.getKey());
                    }
                }
                // Compile frozen contracts first. Today's source validates only a newly
                // active contract; it never reinterprets an archived result's meaning.
                List<LearningUnitDefinition> candidate = new ArrayList<>(prepared);
                candidate.add(definition);
                compiler.validateCanonicalDefinitions(candidate);
                if ("active".equals(entry.status())) {
                    activeRefs.add(definition.ref());
                    try {
                        activeSourceValidator.accept(definition);
                        for (var recall : recalls.values()) activeRecallValidator.validate(recall);
                    } catch (Exception unavailable) {
                        String code = unavailable instanceof CompletionCompilationException failure ? failure.code() : "CURRENT_SOURCE_UNAVAILABLE";
                        readinessFailures.put(definition.ref(), code + ": " + unavailable.getMessage());
                    }
                }
                prepared.add(definition);
                preparedAliases.putAll(aliases);
                preparedRecalls.putAll(recalls);
                preparedAssessmentMeanings.putAll(assessmentMeanings);
                sources.put(definition.ref(), new PreparedSource(entry.path(), frozen.canonicalGoals(), aliases));
            } catch (Exception invalid) {
                String code = invalid instanceof CompletionCompilationException failure ? failure.code() : "INVALID_ARCHIVED_INPUT";
                quarantined.put(String.valueOf(identity), code + ": " + invalid.getMessage());
            }
        }
        List<LearningUnitDefinition> admitted = admitChildrenFirst(prepared, sources, compiler, quarantined);
        Map<String, String> aliases = new LinkedHashMap<>();
        for (var definition : admitted) for (String id : definition.ownGoalIds()) {
            masteryGoals.putIfAbsent(id, sources.get(definition.ref()).canonicalGoals().get(id));
            aliases.putAll(sources.get(definition.ref()).aliases());
        }
        Map<String, LearningUnitRecallBindings.FrozenRecall> recalls = new LinkedHashMap<>();
        for (var definition : admitted) for (String id : definition.ownRecallGoalIds()) recalls.put(id, preparedRecalls.get(id));
        Set<LearningUnitDefinition.ContractRef> admittedRefs = admitted.stream().map(LearningUnitDefinition::ref).collect(java.util.stream.Collectors.toSet());
        activeRefs.retainAll(admittedRefs);
        readinessFailures.keySet().retainAll(admittedRefs);
        return new LearningUnitCatalog(admitted, quarantined, masteryGoals, aliases, recalls, activeRefs, readinessFailures,
                currentOffer, currentOfferFailure);
    }

    private static List<LearningUnitDefinition> admitChildrenFirst(List<LearningUnitDefinition> prepared,
            Map<LearningUnitDefinition.ContractRef, PreparedSource> sources, LearningUnitCompiler compiler,
            Map<String, String> quarantined) {
        Map<LearningUnitDefinition.ContractRef, LearningUnitDefinition> definitions = new LinkedHashMap<>();
        prepared.forEach(definition -> definitions.put(definition.ref(), definition));
        Map<LearningUnitDefinition.ContractRef, Integer> remaining = new LinkedHashMap<>();
        Map<LearningUnitDefinition.ContractRef, List<LearningUnitDefinition.ContractRef>> parents = new LinkedHashMap<>();
        Set<LearningUnitDefinition.ContractRef> unknownChildren = new java.util.HashSet<>();
        for (var definition : prepared) {
            int known = 0;
            for (var child : definition.requiredChildContractRefs()) {
                if (!definitions.containsKey(child)) { unknownChildren.add(definition.ref()); continue; }
                known++;
                parents.computeIfAbsent(child, ignored -> new ArrayList<>()).add(definition.ref());
            }
            remaining.put(definition.ref(), known);
        }
        java.util.ArrayDeque<LearningUnitDefinition.ContractRef> ready = new java.util.ArrayDeque<>();
        remaining.forEach((ref, count) -> { if (count == 0) ready.addLast(ref); });
        Set<LearningUnitDefinition.ContractRef> admittedRefs = new java.util.HashSet<>();
        List<LearningUnitDefinition> admitted = new ArrayList<>();
        while (!ready.isEmpty()) {
            var ref = ready.removeFirst();
            var definition = definitions.get(ref);
            try {
                if (unknownChildren.contains(ref) || !admittedRefs.containsAll(definition.requiredChildContractRefs())) {
                    throw new CompletionCompilationException("MISSING_CHILD_CONTRACT", "Required child was unknown or not admitted");
                }
                List<LearningUnitDefinition> candidate = new ArrayList<>(admitted);
                candidate.add(definition);
                compiler.compile(candidate);
                admitted.add(definition);
                admittedRefs.add(ref);
            } catch (CompletionCompilationException invalid) {
                quarantined.put(sources.get(ref).path(), invalid.code() + ": " + invalid.getMessage());
            }
            remaining.remove(ref);
            for (var parent : parents.getOrDefault(ref, List.of())) {
                if (remaining.compute(parent, (key, count) -> count - 1) == 0) ready.addLast(parent);
            }
        }
        for (var ref : remaining.keySet()) quarantined.put(sources.get(ref).path(), "UNIT_CYCLE: Required children cannot be ordered");
        return admitted;
    }

    public List<LearningUnitDefinition> definitions() { return definitions; }
    public Map<String, String> quarantined() { return quarantined; }
    public CompiledLearningUnits compiled() { return compiled; }
    public Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals() { return masteryGoals; }
    public Map<String, String> resultAliases() { return resultAliases; }
    public Map<String, LearningUnitRecallBindings.FrozenRecall> frozenRecallSelections() { return frozenRecallSelections; }
    public Set<LearningUnitDefinition.ContractRef> activeContractRefs() { return activeContractRefs; }
    public Map<LearningUnitDefinition.ContractRef, String> currentReadinessFailures() { return currentReadinessFailures; }
    public CurrentOfferBinding currentOfferBinding() { return currentOfferBinding; }
    public String currentOfferBindingFailure() { return currentOfferBindingFailure; }

    public record Manifest(int schemaVersion, List<Entry> contracts,
                           @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
                           CurrentOfferBinding currentOfferBinding) {
        public Manifest(int schemaVersion, List<Entry> contracts) { this(schemaVersion, contracts, null); }
    }
    public record CurrentOfferBinding(String path, String sha256) { }
    public record Entry(String path, String sha256, String status, String sourceSnapshotPath, Map<String, String> inputs,
                        Map<String, AssessmentInputs> assessmentInputs, Map<String, List<String>> recallInputs,
                        @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
                        String recallBindingSemantics) {
        public Entry {
            inputs = inputs == null ? Map.of() : Map.copyOf(inputs);
            assessmentInputs = assessmentInputs == null ? Map.of() : Map.copyOf(assessmentInputs);
            recallInputs = recallInputs == null ? Map.of() : Map.copyOf(recallInputs);
        }
        public Entry(String path, String sha256, String status, String sourceSnapshotPath, Map<String, String> inputs,
                     Map<String, AssessmentInputs> assessmentInputs, Map<String, List<String>> recallInputs) {
            this(path, sha256, status, sourceSnapshotPath, inputs, assessmentInputs, recallInputs, null);
        }
    }
    public record AssessmentInputs(String taskPath, String rubricPath,
            @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_EMPTY)
            Map<String, TaskVariantInputs> taskVariants) {
        public AssessmentInputs { taskVariants = taskVariants == null ? Map.of() : Map.copyOf(taskVariants); }
        public AssessmentInputs(String taskPath, String rubricPath) { this(taskPath, rubricPath, Map.of()); }
    }
    public record TaskVariantInputs(String taskPath, String rubricPath) { }
    public record SourceSnapshot(int schemaVersion, String resolverRevision, List<SkillLandscape> landscapes,
                                 Map<String, String> compositionViewDigests, List<ResultAlias> resultAliases) {
        public SourceSnapshot { resultAliases = resultAliases == null ? List.of() : List.copyOf(resultAliases); }
        public SourceSnapshot(int schemaVersion, String resolverRevision, List<SkillLandscape> landscapes,
                              Map<String, String> compositionViewDigests) {
            this(schemaVersion, resolverRevision, landscapes, compositionViewDigests, List.of());
        }
    }
    public record ResultAlias(String sourceGoalId, String canonicalGoalId, String sourceGoalSnapshotPath,
                              String sourceMeaningDigest, String sourceResolvedKind,
                              String targetMeaningDigest, String targetResolvedKind,
                              String mappingRef, String reviewRef, String assessmentMeaningRef) { }
    public record AliasSource(String sourceLandscapeId, com.skillpilot.backend.landscape.LearningGoal goal) { }
    @FunctionalInterface public interface InputSource { byte[] read(String curriculumRelativePath) throws IOException; }

    public static String reviewPath(String reference) {
        if (reference == null) throw new IllegalArgumentException("Missing review reference");
        return reference.startsWith("DE/") ? reference : "DE/Gymnasium/" + reference;
    }

    public static String checkedPath(String reference) {
        if (reference == null || reference.isBlank() || reference.contains("\\") || reference.indexOf('\0') >= 0) {
            throw new IllegalArgumentException("Invalid archive path");
        }
        Path path = Path.of(reference);
        if (path.isAbsolute() || !path.normalize().toString().equals(reference) || path.startsWith("..")) {
            throw new IllegalArgumentException("Archive path must stay within curriculum root");
        }
        return reference;
    }

    private static byte[] checkedRead(String path, String hash, InputSource source) throws Exception {
        checkedPath(path);
        byte[] content = source.read(path);
        String actual = HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(content));
        if (!actual.equals(hash)) throw new IllegalArgumentException("Pinned archive bytes changed: " + path);
        return content;
    }
    private static byte[] capturedRead(String path, String hash, InputSource source, Map<String, VerifiedInput> inputs) throws Exception {
        VerifiedInput captured = inputs.get(path);
        if (captured != null) {
            if (!captured.hash().equals(hash)) throw new IllegalArgumentException("Conflicting immutable input digest: " + path);
            return captured.bytes();
        }
        byte[] bytes = checkedRead(path, hash, source);
        inputs.put(path, new VerifiedInput(hash, bytes));
        return bytes;
    }
    private static byte[] requireInput(Map<String, byte[]> inputs, String path) {
        checkedPath(path);
        byte[] content = inputs.get(path);
        if (content == null) throw new IllegalArgumentException("Unpinned frozen input: " + path);
        return content;
    }
    private static Map<String, String> validateAliases(LearningUnitDefinition definition, FrozenSource frozen,
                                                       Map<String, byte[]> inputs, ObjectMapper mapper) throws IOException {
        Map<String, String> result = new LinkedHashMap<>();
        for (var alias : frozen.snapshot().resultAliases()) {
            if (!definition.ownGoalIds().contains(alias.canonicalGoalId())) continue;
            AliasSource origin = mapper.readValue(requireInput(inputs, alias.sourceGoalSnapshotPath()), AliasSource.class);
            var sourceGoal = origin.goal();
            String sourceKey = alias.sourceGoalId();
            if (sourceGoal == null || origin.sourceLandscapeId() == null || sourceKey == null
                    || !(sourceKey.equals(origin.sourceLandscapeId() + ":" + sourceGoal.getId())
                        || sourceKey.equals(sourceGoal.getId()) && canonicalUuid(sourceKey))) {
                throw new CompletionCompilationException("AMBIGUOUS_RESULT_ALIAS", "Source result needs a unique frozen canonical or qualified identity");
            }
            if (sourceGoal.getContains() != null && !sourceGoal.getContains().isEmpty() || "cluster".equalsIgnoreCase(sourceGoal.getType())) {
                throw new CompletionCompilationException("RESULT_ALIAS_NOT_ATOMIC", "An aggregate result cannot become an atomic outcome");
            }
            if (!LearningUnitSourceBindings.meaningDigest(sourceGoal).equals(alias.sourceMeaningDigest())
                    || !LearningUnitSourceBindings.resolvedKind(sourceGoal).equals(alias.sourceResolvedKind())
                    || !definition.ownGoalMeaningDigests().get(alias.canonicalGoalId()).equals(alias.targetMeaningDigest())
                    || !definition.ownResolvedKinds().get(alias.canonicalGoalId()).equals(alias.targetResolvedKind())
                    || !alias.sourceResolvedKind().equals(alias.targetResolvedKind())) {
                throw new CompletionCompilationException("RESULT_ALIAS_MEANING_CONFLICT", "Frozen source and target result kinds/meanings differ");
            }
            requireInput(inputs, reviewPath(alias.reviewRef()));
            JsonNode mapping = mapper.readTree(requireInput(inputs, alias.mappingRef()));
            boolean exact = false;
            if (origin.sourceLandscapeId().equals(mapping.path("sourceLandscapeId").asText())
                    && definition.sourceBinding().landscapeId().equals(mapping.path("targetLandscapeId").asText())) {
                for (JsonNode pair : mapping.path("mappings")) {
                    if (sourceGoal.getId().equals(pair.path("legacyGoalId").asText())
                            && alias.canonicalGoalId().equals(pair.path("canonicalGoalId").asText())
                            && "exact".equals(pair.path("matchType").asText())) exact = true;
                }
            }
            if (!exact) throw new CompletionCompilationException("INVALID_RESULT_ALIAS", "Frozen exact mapping does not bind this source outcome");
            if ("memory".equals(alias.targetResolvedKind())) {
                throw new CompletionCompilationException("RESULT_ALIAS_RECALL_REVIEW_REQUIRED", "Recall aliases require the same frozen verified card selection");
            }
            if ("assessment".equals(alias.targetResolvedKind())) {
                var exam = sourceGoal.getExamData();
                var claim = definition.assessmentClaims().get(alias.canonicalGoalId());
                if (exam == null || !alias.canonicalGoalId().equals(alias.assessmentMeaningRef())
                        || !LearningUnitSourceBindings.assessmentClaimMatches(claim, exam)) {
                    throw new CompletionCompilationException("RESULT_ALIAS_ASSESSMENT_CONFLICT", "Source pass does not establish this immutable normal assessment");
                }
            }
            String previous = result.putIfAbsent(sourceKey, alias.canonicalGoalId());
            if (previous != null && !previous.equals(alias.canonicalGoalId())) throw new CompletionCompilationException("AMBIGUOUS_RESULT_ALIAS", "Conflicting source result identity");
        }
        return result;
    }
    private static boolean canonicalUuid(String value) {
        try { return java.util.UUID.fromString(value).toString().equalsIgnoreCase(value); }
        catch (IllegalArgumentException invalid) { return false; }
    }
    private record VerifiedInput(String hash, byte[] bytes) { }
    private record PreparedSource(String path, Map<String, com.skillpilot.backend.landscape.LearningGoal> canonicalGoals,
                                  Map<String, String> aliases) { }
    private record FrozenSource(SourceSnapshot snapshot, Map<String, com.skillpilot.backend.landscape.LearningGoal> canonicalGoals) { }
}
