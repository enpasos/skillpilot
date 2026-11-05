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
    private final LearningUnitOfferBindings currentOffers;
    private final CompletionCanonicalGraphResolver canonicalResolver;
    private final boolean packageRuntime;
    private final Map<String, Boolean> currentResultMeanings = new java.util.concurrent.ConcurrentHashMap<>();
    private final Map<String, Boolean> currentRecallMeanings = new java.util.concurrent.ConcurrentHashMap<>();
    private final Map<String, Map<String, LearningGoal>> canonicalBases = new LinkedHashMap<>(8, .75f, true);
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
        canonicalResolver = resolver;
        packageRuntime = "package".equals(source);
        LearningUnitCatalog loaded = LearningUnitCatalog.empty();
        LearningUnitOfferBindings offers = LearningUnitOfferBindings.unavailable("Current offer binding is absent");
        Set<LearningUnitDefinition.ContractRef> active = new LinkedHashSet<>();
        Map<String, LearningGoal> goals = new LinkedHashMap<>();
        Set<String> governed = new LinkedHashSet<>();
        String unavailable = null;
        try {
            // Current roles bootstrap a fail-closed boundary when catalog loading
            // is unavailable. Admitted frozen sources durably retain it below.
            // Names and unrelated Mathematics products never select it.
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
                manifest = packageManifest(snapshot, packaged, mapper);
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
                }, recall -> {
                    LearningGoal goal = bases.values().stream().map(base -> base.get(recall.goalId()))
                            .filter(java.util.Objects::nonNull).findFirst().orElse(null);
                    LearningUnitRecallBindings.DeckSource decks = finalPackageBindings == null ? (id, path) -> {
                        var resource = new com.skillpilot.backend.service.DeckResourceService(properties).resolveDeckResource(id, path);
                        if (resource == null || !resource.exists()) return null;
                        try (var input = resource.getInputStream()) { return input.readAllBytes(); }
                    } : finalPackageBindings::readCurrentDeck;
                    LearningUnitRecallBindings.validateActive(recall, goal, decks, mapper);
                }, mapper);
                offers = LearningUnitOfferBindings.load(loaded.currentOfferBinding(), inputs, loaded, definition -> {
                    SkillLandscape landscape = landscapes.getById(definition.sourceBinding().landscapeId());
                    Map<String, LearningGoal> base = bases.computeIfAbsent(definition.sourceBinding().landscapeId(), resolver::load);
                    LearningUnitSourceBindings.validateCurrentUnit(definition, landscape,
                            finalPackageBindings == null ? base : finalPackageBindings.restoreCurrentSourceMeanings(definition, base));
                }, (path, bytes) -> {
                    if (finalPackageBindings != null) finalPackageBindings.validateCurrentOfferInput(path, bytes);
                }, mapper);
                active.clear();
                active.addAll(loaded.activeContractRefs());
                goals.putAll(loaded.masteryGoals());
                if (loaded.compiled() != null) governed.addAll(loaded.compiled().ownedGoalIds());
            } else if (!governed.isEmpty()) {
                unavailable = "Authored learning units have no pinned contract catalog";
            }
        } catch (Exception invalid) {
            unavailable = invalid.getMessage();
            log.error("Learning-unit catalog is unavailable; no new recognition is awarded", invalid);
        }
        // Removing today's unit metadata cannot restore legacy implicit credit
        // for the remaining atoms of an already governed source landscape.
        for (String sourceId : loaded.definitions().stream().map(definition -> definition.sourceBinding().landscapeId())
                .collect(java.util.stream.Collectors.toSet())) {
            SkillLandscape currentSource = landscapes.getById(sourceId);
            if (currentSource != null && currentSource.getGoals() != null) for (LearningGoal goal : currentSource.getGoals()) {
                if (goal.getContains() == null || goal.getContains().isEmpty()) governed.add(goal.getId());
            }
        }
        if (loaded.compiled() != null) governed.addAll(loaded.compiled().ownedGoalIds());
        catalog = loaded;
        currentOffers = offers;
        activeContracts = Set.copyOf(active);
        masteryGoals = Map.copyOf(goals);
        governedGoalIds = Set.copyOf(governed);
        unavailableReason = unavailable;
        if (!catalog.quarantined().isEmpty()) log.error("Quarantined learning-unit contracts: {}", catalog.quarantined());
    }

    public LearningUnitApplicationService(LearningUnitCatalog catalog, Map<String, LearningGoal> masteryGoals,
                                          Set<String> governedGoalIds, Set<LearningUnitDefinition.ContractRef> activeContracts) {
        this(catalog, masteryGoals, governedGoalIds, activeContracts,
                LearningUnitOfferBindings.unavailable("Current offer binding is absent"));
    }

    public LearningUnitApplicationService(LearningUnitCatalog catalog, Map<String, LearningGoal> masteryGoals,
            Set<String> governedGoalIds, Set<LearningUnitDefinition.ContractRef> activeContracts,
            LearningUnitOfferBindings offers) {
        this.canonicalResolver = null;
        this.packageRuntime = false;
        this.catalog = catalog;
        this.currentOffers = offers;
        this.masteryGoals = Map.copyOf(masteryGoals);
        this.governedGoalIds = Set.copyOf(governedGoalIds);
        this.activeContracts = Set.copyOf(activeContracts);
        this.unavailableReason = null;
    }

    public boolean hasContracts() { return catalog.compiled() != null; }
    public Set<String> governedGoalIds() { return governedGoalIds; }
    public Map<String, LearningGoal> masteryGoals() { return masteryGoals; }
    public LearningUnitCatalog catalog() { return catalog; }
    public Map<String, Double> normalizeExplicitResults(Map<String, Double> storedMastery) {
        Map<String, Double> results = new LinkedHashMap<>(storedMastery);
        catalog.resultAliases().forEach((source, target) -> {
            if (com.skillpilot.backend.domain.Mastery.isMastered(storedMastery.get(source))) results.put(target, 1.0);
        });
        return results;
    }
    /** A new explicit result must retain the immutable meaning of its managed goal ID. */
    public boolean currentResultMeaningAdmitted(String goalId, LearningGoal fallback) {
        if (!masteryGoals.containsKey(goalId)) return true;
        if (canonicalResolver == null) return computeCurrentResultMeaningAdmitted(goalId, fallback);
        return currentResultMeanings.computeIfAbsent(goalId, id -> computeCurrentResultMeaningAdmitted(id, fallback));
    }

    private boolean computeCurrentResultMeaningAdmitted(String goalId, LearningGoal fallback) {
        for (var definition : catalog.definitions()) {
            if (!definition.ownGoalIds().contains(goalId)) continue;
            LearningGoal current = canonicalResolver == null ? fallback
                    : canonicalGoals(definition.sourceBinding().landscapeId(), Map.of()).get(goalId);
            if (current == null || !LearningUnitSourceBindings.resolvedKind(current)
                    .equals(definition.ownResolvedKinds().get(goalId))) continue;
            LearningGoal meaning = current;
            if (packageRuntime) {
                // Package admission authenticated this mechanical kind enrichment
                // against its pinned ledger; the seven other meaning fields stay exact.
                meaning = new ObjectMapper().convertValue(current, LearningGoal.class);
                meaning.setSemanticKind(definition.ownGoalMeanings().get(goalId).semanticKind());
            }
            if (!LearningUnitSourceBindings.meaningDigest(meaning)
                    .equals(definition.ownGoalMeaningDigests().get(goalId))) continue;
            var claim = definition.assessmentClaims().get(goalId);
            if (claim == null || LearningUnitSourceBindings.assessmentClaimMatches(claim, current.getExamData())) return true;
        }
        return false;
    }

    public Map<String, LearningUnitRecallBindings.FrozenRecall> frozenRecallSelections() {
        return catalog.frozenRecallSelections();
    }

    public boolean currentRecallMeaningAdmitted(LearningGoal currentGoal,
            LearningUnitRecallBindings.DeckSource decks, ObjectMapper mapper) {
        var frozen = catalog.frozenRecallSelections().get(currentGoal.getId());
        if (frozen == null) return true;
        java.util.function.Supplier<Boolean> check = () -> {
            if (!currentResultMeaningAdmitted(currentGoal.getId(), currentGoal)) return false;
            try {
                LearningUnitRecallBindings.validateActive(frozen, currentGoal, decks, mapper);
                return true;
            } catch (Exception invalid) {
                return false;
            }
        };
        return canonicalResolver == null ? check.get()
                : currentRecallMeanings.computeIfAbsent(currentGoal.getId(), ignored -> check.get());
    }

    /** Unit prerequisite readiness is independent of the legacy completion-offer catalog. */
    public synchronized Map<String, LearningGoal> canonicalGoals(String curriculumId, Map<String, LearningGoal> fallback) {
        if (canonicalResolver == null) return fallback;
        Map<String, LearningGoal> existing = canonicalBases.get(curriculumId);
        if (existing != null) return existing;
        Map<String, LearningGoal> compiled = Map.copyOf(canonicalResolver.load(curriculumId));
        while (canonicalBases.size() >= 8) canonicalBases.remove(canonicalBases.keySet().iterator().next());
        canonicalBases.put(curriculumId, compiled);
        return compiled;
    }
    public synchronized LearningUnitPrerequisiteGraph normalizedPrerequisites(String graphIdentity, Map<String, LearningGoal> goals,
                                                                              Set<String> atomicRoots) {
        LearningUnitPrerequisiteGraph existing = prerequisiteGraphs.get(graphIdentity);
        if (existing != null) return existing;
        LearningUnitPrerequisiteGraph compiled = new LearningUnitPrerequisiteGraph(new CompletionProfileCompiler().compileAtomicPrerequisites(goals, atomicRoots));
        while (prerequisiteGraphs.size() >= 8) prerequisiteGraphs.remove(prerequisiteGraphs.keySet().iterator().next());
        prerequisiteGraphs.put(graphIdentity, compiled);
        return compiled;
    }
    public LearningUnitEvaluation evaluate(String learnerId, Set<String> explicitMastery) {
        if (!hasContracts()) return new LearningUnitEvaluation(explicitMastery, Set.of(), explicitMastery, Map.of());
        return cache.evaluate(learnerId, catalog.compiled(), explicitMastery);
    }

    /** A bare target set cannot select an authored acquisition hierarchy. */
    public LearningUnitsReadModel readModel(LearningUnitEvaluation evaluation, Set<String> currentTargetIds) {
        return readModel(evaluation, new LearningUnitOfferBindings.ResolvedOfferContext(
                null, currentTargetIds, Set.of(), Set.of()), Set.of());
    }

    public LearningUnitsReadModel readModel(LearningUnitEvaluation evaluation, Set<String> currentTargetIds,
                                            Set<String> unavailableRecallGoalIds) {
        return readModel(evaluation, new LearningUnitOfferBindings.ResolvedOfferContext(
                null, currentTargetIds, Set.of(), Set.of()), unavailableRecallGoalIds);
    }

    public LearningUnitsReadModel readModel(LearningUnitEvaluation evaluation,
            LearningUnitOfferBindings.ResolvedOfferContext context, Set<String> unavailableRecallGoalIds) {
        if (governedGoalIds.isEmpty() && !hasContracts()) return null;
        var offer = currentOffers.resolve(context);
        Map<LearningUnitDefinition.ContractRef, LearningUnitDefinition> definitions = new LinkedHashMap<>();
        catalog.definitions().forEach(definition -> definitions.put(definition.ref(), definition));
        List<LearningUnitsReadModel.Unit> units = new ArrayList<>();
        for (var ref : offer.selectedContractRefs()) {
            var definition = definitions.get(ref);
            var result = evaluation.units().get(ref);
            units.add(new LearningUnitsReadModel.Unit(definition.contractId(), definition.revision(), definition.sourceBinding().programUnitId(),
                    definition.title(), definition.promise(), definition.introduction(), definition.ownGoalIds(), definition.requiredChildContractRefs(),
                    definition.ownAssessmentGoalIds(), definition.ownRecallGoalIds(), result.complete(), result.targetCount(), result.explicitTargetCount(),
                    result.recognizedTargetCount(), result.ownRecognizedGoalIds().stream().sorted().toList(), result.pendingGoalIds().stream().sorted().toList(),
                    java.util.Collections.disjoint(catalog.compiled().targetGoalIds(ref), unavailableRecallGoalIds) ? null : "unavailable"));
        }
        return new LearningUnitsReadModel(unavailableReason != null ? "unavailable"
                : catalog.quarantined().isEmpty() && unavailableRecallGoalIds.isEmpty() ? "valid" : "partial", LearningUnitDefinition.SEMANTICS,
                hasContracts() ? catalog.compiled().digest() : null, evaluation.recognizedGoalIds().stream().sorted().toList(), units)
                .withOfferBinding(new LearningUnitsReadModel.OfferBinding(offer.status(), offer.revision(), offer.scopeKey(),
                        offer.coverage(), offer.rootContractRefs(), offer.coveredTargetCount(), offer.totalTargetCount(), offer.bindingDigest()));
    }

    public static byte[] packageManifest(CurriculumRuntimeSnapshot snapshot, Map<String, byte[]> inputs,
                                         ObjectMapper mapper) throws Exception {
        var catalogs = snapshot.artifactsByRole().getOrDefault(LearningUnitCatalog.CATALOG_ROLE, List.of());
        if (catalogs.size() != 1) throw new IllegalArgumentException("Package requires exactly one learning-unit catalog role");
        JsonNode wrapper = mapper.readTree(catalogs.getFirst().contentBytes());
        String path = LearningUnitCatalog.checkedPath(wrapper.path("definition").path("sourcePath").asText());
        byte[] bytes = inputs.get(path);
        if (bytes == null) throw new IllegalArgumentException("Package omits its discovered learning-unit catalog");
        return bytes;
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
