package com.skillpilot.backend.completion.learningunit;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.api.LearningUnitsReadModel;
import com.skillpilot.backend.completion.CompletionCanonicalGraphResolver;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.curriculumpackage.CurriculumRuntimeSnapshot;
import com.skillpilot.backend.curriculumpackage.CurriculumRuntimeSnapshotProvider;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** One static admitted contract generation and one bounded, scope-independent learner evaluator. */
@Service
public class LearningUnitApplicationService {
    public static final String CAPABILITY = "learningUnitRecognitionV1";
    private static final Logger log = LoggerFactory.getLogger(LearningUnitApplicationService.class);
    private final LearningUnitCatalog catalog;
    private final LearningUnitRecognitionCache cache = new LearningUnitRecognitionCache();
    private final Map<String, LearningGoal> masteryGoals;
    private final Set<String> governedGoalIds;
    private final Set<LearningUnitDefinition.ContractRef> activeContracts;
    private final String unavailableReason;
    private final Map<String, LearningUnitPrerequisiteGraph> prerequisiteGraphs = new LinkedHashMap<>(8, .75f, true);

    @Autowired
    public LearningUnitApplicationService(LandscapeProperties properties, ObjectMapper mapper,
            LandscapeService landscapes, CompletionCanonicalGraphResolver resolver,
            @Value("${skillpilot.curriculum.source:repository}") String source,
            ObjectProvider<CurriculumRuntimeSnapshotProvider> packageSnapshots) {
        LearningUnitCatalog loaded = LearningUnitCatalog.empty();
        Set<LearningUnitDefinition.ContractRef> active = new LinkedHashSet<>();
        Map<String, LearningGoal> goals = new LinkedHashMap<>();
        Set<String> governed = new LinkedHashSet<>();
        String unavailable = null;
        try {
            // The authored unit role selects this migration boundary. Names,
            // subject labels and unrelated Mathematics products never select it.
            for (SkillLandscape landscape : landscapes.getAll()) {
                if (landscape.getProgramUnits() == null || landscape.getProgramUnits().stream().noneMatch(unit -> unit.getLearningUnit() != null)) continue;
                if (landscape.getGoals() != null) for (LearningGoal goal : landscape.getGoals()) {
                    if (goal.getContains() == null || goal.getContains().isEmpty()) governed.add(goal.getId());
                }
            }
            LearningUnitCatalog.InputSource inputs;
            byte[] manifest = null;
            Map<String, String> viewDigests = new LinkedHashMap<>();
            LearningUnitPackageBindings packageBindings = null;
            if ("repository".equals(source)) {
                Path root = Path.of(properties.getDirectory()).toAbsolutePath().normalize().toRealPath();
                inputs = path -> {
                    Path resolved = root.resolve(LearningUnitCatalog.checkedPath(path)).normalize().toRealPath();
                    if (!resolved.startsWith(root)) throw new IOException("Archive symlink escapes curriculum root");
                    return Files.readAllBytes(resolved);
                };
                Path manifestPath = root.resolve(LearningUnitCatalog.MANIFEST_PATH);
                if (Files.isRegularFile(manifestPath)) {
                    manifest = inputs.read(LearningUnitCatalog.MANIFEST_PATH);
                    Path views = root.resolve("DE/Gymnasium/composition-views");
                    if (Files.isDirectory(views)) try (var paths = Files.walk(views)) {
                        for (Path path : paths.filter(Files::isRegularFile).filter(path -> path.toString().endsWith(".json")).sorted().toList()) {
                            byte[] bytes = Files.readAllBytes(path);
                            String id = mapper.readTree(bytes).path("viewId").asText();
                            if (!id.isBlank()) viewDigests.put(id, rawDigest(bytes));
                        }
                    }
                }
            } else if ("package".equals(source)) {
                var provider = packageSnapshots.getIfAvailable();
                if (provider == null) throw new IllegalStateException("Learning units require the active package snapshot");
                var snapshot = provider.current();
                Map<String, byte[]> packaged = packageInputs(snapshot, mapper);
                packageBindings = new LearningUnitPackageBindings(snapshot, packaged, mapper);
                inputs = path -> {
                    byte[] bytes = packaged.get(LearningUnitCatalog.checkedPath(path));
                    if (bytes == null) throw new IOException("Missing packaged learning-unit source: " + path);
                    return bytes;
                };
                manifest = packaged.get(LearningUnitCatalog.MANIFEST_PATH);
                // Packaged locators are rewritten for installed resources. Frozen
                // source/view proof stays byte-exact in its sidecar generation.
                for (var view : snapshot.viewsById().values()) viewDigests.put(view.viewId(), rawDigest(view.json().getBytes(java.nio.charset.StandardCharsets.UTF_8)));
            } else throw new IllegalArgumentException("Unknown curriculum source");
            if (manifest != null) {
                Map<String, Map<String, LearningGoal>> bases = new LinkedHashMap<>();
                Map<String, String> finalViewDigests = viewDigests;
                LearningUnitPackageBindings finalPackageBindings = packageBindings;
                loaded = LearningUnitCatalog.load(manifest, inputs, definition -> {
                    SkillLandscape landscape = landscapes.getById(definition.sourceBinding().landscapeId());
                    Map<String, LearningGoal> base = bases.computeIfAbsent(definition.sourceBinding().landscapeId(), resolver::load);
                    Map<String, LearningGoal> bindingGoals = finalPackageBindings == null ? base
                            : finalPackageBindings.validateAndRestoreSourceMeanings(definition, base);
                    LearningUnitSourceBindings.validateActiveSource(definition, landscape, bindingGoals,
                            finalPackageBindings == null ? finalViewDigests : definition.sourceBinding().compositionViewDigests());
                    active.add(definition.ref());
                }, mapper);
                goals.putAll(loaded.masteryGoals());
                if (loaded.compiled() != null) governed.addAll(loaded.compiled().ownedGoalIds());
            } else if (!governed.isEmpty()) {
                unavailable = "Authored learning units have no pinned contract catalog";
            }
        } catch (Exception invalid) {
            unavailable = invalid.getMessage();
            log.error("Learning-unit catalog is unavailable; no new recognition is awarded", invalid);
        }
        catalog = loaded;
        activeContracts = Set.copyOf(active);
        masteryGoals = Map.copyOf(goals);
        governedGoalIds = Set.copyOf(governed);
        unavailableReason = unavailable;
        if (!catalog.quarantined().isEmpty()) log.error("Quarantined learning-unit contracts: {}", catalog.quarantined());
    }

    public LearningUnitApplicationService(LearningUnitCatalog catalog, Map<String, LearningGoal> masteryGoals,
                                          Set<String> governedGoalIds, Set<LearningUnitDefinition.ContractRef> activeContracts) {
        this.catalog = catalog;
        this.masteryGoals = Map.copyOf(masteryGoals);
        this.governedGoalIds = Set.copyOf(governedGoalIds);
        this.activeContracts = Set.copyOf(activeContracts);
        this.unavailableReason = null;
    }

    public boolean hasContracts() { return catalog.compiled() != null; }
    public Set<String> governedGoalIds() { return governedGoalIds; }
    public Map<String, LearningGoal> masteryGoals() { return masteryGoals; }
    public LearningUnitCatalog catalog() { return catalog; }
    public synchronized LearningUnitPrerequisiteGraph normalizedPrerequisites(String graphIdentity, Map<String, LearningGoal> goals) {
        LearningUnitPrerequisiteGraph existing = prerequisiteGraphs.get(graphIdentity);
        if (existing != null) return existing;
        Set<String> roots = new LinkedHashSet<>();
        goals.values().stream().filter(goal -> goal.getContains() == null || goal.getContains().isEmpty())
                .map(LearningGoal::getId).forEach(roots::add);
        LearningUnitPrerequisiteGraph compiled = new LearningUnitPrerequisiteGraph(new CompletionProfileCompiler().compileAtomicPrerequisites(goals, roots));
        while (prerequisiteGraphs.size() >= 8) prerequisiteGraphs.remove(prerequisiteGraphs.keySet().iterator().next());
        prerequisiteGraphs.put(graphIdentity, compiled);
        return compiled;
    }
    public LearningUnitEvaluation evaluate(String learnerId, Set<String> explicitMastery) {
        if (!hasContracts()) return new LearningUnitEvaluation(explicitMastery, Set.of(), explicitMastery, Map.of());
        return cache.evaluate(learnerId, catalog.compiled(), explicitMastery);
    }

    public LearningUnitsReadModel readModel(LearningUnitEvaluation evaluation, Set<String> currentTargetIds) {
        if (governedGoalIds.isEmpty() && !hasContracts()) return null;
        List<LearningUnitsReadModel.Unit> units = new ArrayList<>();
        for (var definition : catalog.definitions()) {
            if (!activeContracts.contains(definition.ref()) || !currentTargetIds.containsAll(catalog.compiled().targetGoalIds(definition.ref()))) continue;
            var result = evaluation.units().get(definition.ref());
            units.add(new LearningUnitsReadModel.Unit(definition.contractId(), definition.revision(), definition.sourceBinding().programUnitId(),
                    definition.title(), definition.promise(), definition.introduction(), definition.ownGoalIds(), definition.requiredChildContractRefs(),
                    definition.ownAssessmentGoalIds(), definition.ownRecallGoalIds(), result.complete(), result.targetCount(), result.explicitTargetCount(),
                    result.recognizedTargetCount(), result.ownRecognizedGoalIds().stream().sorted().toList(), result.pendingGoalIds().stream().sorted().toList()));
        }
        return new LearningUnitsReadModel(unavailableReason != null ? "unavailable" : catalog.quarantined().isEmpty() ? "valid" : "partial", LearningUnitDefinition.SEMANTICS,
                hasContracts() ? catalog.compiled().digest() : null, evaluation.recognizedGoalIds().stream().sorted().toList(), units);
    }

    public static Map<String, byte[]> packageInputs(CurriculumRuntimeSnapshot snapshot, ObjectMapper mapper) throws Exception {
        Map<String, byte[]> result = new LinkedHashMap<>();
        for (String role : List.of(LearningUnitCatalog.CATALOG_ROLE, LearningUnitCatalog.CONTRACT_ROLE, LearningUnitCatalog.INPUT_ROLE)) {
            for (var artifact : snapshot.artifactsByRole().getOrDefault(role, List.of())) {
                JsonNode wrapper = mapper.readTree(artifact.contentBytes());
                JsonNode definition = wrapper.path("definition");
                String sourcePath = LearningUnitCatalog.checkedPath(definition.path("sourcePath").asText());
                byte[] content = Base64.getDecoder().decode(definition.path("contentBase64").asText());
                if (!rawDigest(content).equals(definition.path("sha256").asText())) throw new IllegalArgumentException("Packaged learning-unit source digest differs");
                byte[] previous = result.putIfAbsent(sourcePath, content);
                if (previous != null && !java.util.Arrays.equals(previous, content)) throw new IllegalArgumentException("Conflicting packaged learning-unit source identity");
            }
        }
        return result;
    }

    private static String rawDigest(byte[] bytes) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
}
