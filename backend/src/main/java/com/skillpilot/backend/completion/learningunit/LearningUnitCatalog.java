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

    private LearningUnitCatalog(List<LearningUnitDefinition> definitions, Map<String, String> quarantined,
                                Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals) {
        this.definitions = List.copyOf(definitions);
        this.quarantined = Map.copyOf(quarantined);
        this.compiled = definitions.isEmpty() ? null : new LearningUnitCompiler().compile(definitions);
        this.masteryGoals = Map.copyOf(masteryGoals);
    }

    public static LearningUnitCatalog empty() { return new LearningUnitCatalog(List.of(), Map.of(), Map.of()); }

    public static LearningUnitCatalog load(byte[] manifestBytes, InputSource source,
                                           Consumer<LearningUnitDefinition> activeSourceValidator,
                                           ObjectMapper mapper) throws IOException {
        ObjectMapper strict = mapper.copy().enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        Manifest manifest = strict.readValue(manifestBytes, Manifest.class);
        if (manifest.schemaVersion() != 1 || manifest.contracts() == null) throw new IllegalArgumentException("Unsupported learning-unit catalog");
        List<LearningUnitDefinition> admitted = new ArrayList<>();
        Map<String, String> quarantined = new LinkedHashMap<>();
        Map<String, VerifiedInput> capturedInputs = new LinkedHashMap<>();
        Map<String, FrozenSource> frozenSources = new LinkedHashMap<>();
        LearningUnitCompiler compiler = new LearningUnitCompiler();
        Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals = new LinkedHashMap<>();
        Set<String> seen = new java.util.HashSet<>();
        // Historical admission wins even if a manifest accidentally lists a new
        // active candidate first. Relative archive order remains authoritative.
        List<Entry> admissionOrder = new ArrayList<>(manifest.contracts());
        admissionOrder.sort(java.util.Comparator.comparingInt(entry -> entry != null && "archived".equals(entry.status()) ? 0 : 1));
        for (Entry entry : admissionOrder) {
            String identity = entry == null ? "<null>" : entry.path();
            try {
                if (entry == null || !Set.of("active", "archived").contains(entry.status()) || !seen.add(entry.path())) {
                    throw new IllegalArgumentException("Invalid/duplicate catalog entry");
                }
                checkedPath(entry.path());
                if (!entry.path().startsWith("DE/Gymnasium/learning-units/contracts/")) throw new IllegalArgumentException("Contract outside immutable archive");
                byte[] bytes = capturedRead(entry.path(), entry.sha256(), source, capturedInputs);
                var definition = strict.readValue(bytes, LearningUnitDefinition.class);
                Map<String, byte[]> inputs = new LinkedHashMap<>();
                for (var input : entry.inputs().entrySet()) inputs.put(input.getKey(), capturedRead(input.getKey(), input.getValue(), source, capturedInputs));
                FrozenSource frozen = frozenSources.get(entry.sourceSnapshotPath());
                if (frozen == null) {
                    SourceSnapshot snapshot = strict.readValue(requireInput(inputs, entry.sourceSnapshotPath()), SourceSnapshot.class);
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
                for (var claim : definition.assessmentClaims().entrySet()) {
                    var paths = entry.assessmentInputs().get(claim.getKey());
                    if (paths == null) throw new IllegalArgumentException("Missing frozen normal task/rubric inputs");
                    JsonNode task = strict.readTree(requireInput(inputs, paths.taskPath()));
                    if (!task.isObject() || task.size() != 2 || !task.path("taskContent").isTextual()
                            || !task.path("solutionContent").isTextual()) throw new IllegalArgumentException("Frozen task and solution pair is required");
                    if (!LearningUnitSourceBindings.canonicalDigest(task).equals(claim.getValue().taskRevision())) {
                        throw new IllegalArgumentException("Frozen task bytes differ from reviewed claim");
                    }
                    JsonNode rubric = strict.readTree(requireInput(inputs, paths.rubricPath()));
                    if (!LearningUnitSourceBindings.canonicalDigest(rubric).equals(claim.getValue().rubricRevision())) {
                        throw new IllegalArgumentException("Frozen normal rubric differs from reviewed claim");
                    }
                    requireInput(inputs, reviewPath(claim.getValue().reviewRef()));
                }
                if (!entry.assessmentInputs().keySet().equals(definition.assessmentClaims().keySet())) {
                    throw new IllegalArgumentException("Frozen assessment inputs do not match own Q");
                }
                if (!entry.recallInputs().keySet().equals(Set.copyOf(definition.ownRecallGoalIds()))) {
                    throw new IllegalArgumentException("Every own recall duty needs frozen deck/selection inputs");
                }
                for (var recall : entry.recallInputs().values()) {
                    if (recall.isEmpty()) throw new IllegalArgumentException("Empty frozen recall input binding");
                    for (String path : recall) requireInput(inputs, path);
                }
                // Compile frozen contracts first. Today's source validates only a newly
                // active contract; it never reinterprets an archived result's meaning.
                List<LearningUnitDefinition> candidate = new ArrayList<>(admitted);
                candidate.add(definition);
                compiler.compile(candidate);
                if ("active".equals(entry.status())) activeSourceValidator.accept(definition);
                admitted.add(definition);
                for (String id : definition.ownGoalIds()) masteryGoals.putIfAbsent(id, frozen.canonicalGoals().get(id));
            } catch (Exception invalid) {
                String code = invalid instanceof CompletionCompilationException failure ? failure.code() : "INVALID_ARCHIVED_INPUT";
                quarantined.put(String.valueOf(identity), code + ": " + invalid.getMessage());
            }
        }
        return new LearningUnitCatalog(admitted, quarantined, masteryGoals);
    }

    public List<LearningUnitDefinition> definitions() { return definitions; }
    public Map<String, String> quarantined() { return quarantined; }
    public CompiledLearningUnits compiled() { return compiled; }
    public Map<String, com.skillpilot.backend.landscape.LearningGoal> masteryGoals() { return masteryGoals; }

    public record Manifest(int schemaVersion, List<Entry> contracts) { }
    public record Entry(String path, String sha256, String status, String sourceSnapshotPath, Map<String, String> inputs,
                        Map<String, AssessmentInputs> assessmentInputs, Map<String, List<String>> recallInputs) {
        public Entry {
            inputs = inputs == null ? Map.of() : Map.copyOf(inputs);
            assessmentInputs = assessmentInputs == null ? Map.of() : Map.copyOf(assessmentInputs);
            recallInputs = recallInputs == null ? Map.of() : Map.copyOf(recallInputs);
        }
    }
    public record AssessmentInputs(String taskPath, String rubricPath) { }
    public record SourceSnapshot(int schemaVersion, String resolverRevision, List<SkillLandscape> landscapes,
                                 Map<String, String> compositionViewDigests) { }
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
    private record VerifiedInput(String hash, byte[] bytes) { }
    private record FrozenSource(SourceSnapshot snapshot, Map<String, com.skillpilot.backend.landscape.LearningGoal> canonicalGoals) { }
}
