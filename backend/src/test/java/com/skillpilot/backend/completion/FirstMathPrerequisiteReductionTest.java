package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.api.PersonalizationPlan;
import com.skillpilot.backend.domain.Learner;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.repository.LearnerClientStateRepository;
import com.skillpilot.backend.repository.LearnerRepository;
import com.skillpilot.backend.repository.MasteryRepository;
import com.skillpilot.backend.repository.PlannedGoalRepository;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.CurriculumPersonalizationPlanner;
import com.skillpilot.backend.service.DeckResourceService;
import com.skillpilot.backend.service.LearnerService;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.test.util.ReflectionTestUtils;

/** Live native regression for the registered reductions, independent of ignored measurement receipts. */
class FirstMathPrerequisiteReductionTest {
    private static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String BIOLOGY = "08a43a1b-d97e-522c-9dfa-c950a493364e";
    private static final String LATIN = "668cf206-941e-51f8-8704-3e8938631235";
    private static final String GERMAN = "67bd301b-e11a-582d-94ba-4f4b1a4cefff";
    private static final String GERMAN_ATOM = "2fb368b0-7b9d-5df0-99b6-6d719fd47f95";
    private static final String GERMAN_CLUSTER = "53462f11-c368-51df-bb68-c36a83d761b1";
    private static final String GERMAN_OTHER = "bb3dee7b-d6d3-513b-8824-bdf6414e02df";
    private static final String GERMAN_LEAF = "2122b969-61e9-412f-9e97-8777c606d27a";
    private static final String GERMAN_LEAF_PREREQUISITE = "eff86a92-e048-5494-b561-6ecdda1fbf67";
    private static final List<String> GERMAN_LEAVES = List.of(
            "001b6ae3-207a-400d-852d-2c4068df8d2f", "17164008-3c30-4d22-8f2b-bf2e5a79f9de", GERMAN_LEAF,
            "263b9af0-c584-4364-a35f-6dfccd7aaf21", "6904ca70-3f22-41eb-bc9c-9896bf7bb1e9",
            "70f5f3c6-f0e9-4bd7-8095-a20be459975c", "d4642285-5b73-4541-a088-6c1e77b37637",
            "ead22176-e8f4-45b6-8a3d-e04661f3c3e4", "f0c354f9-6f7a-494a-8f64-675bf1b42f5e",
            "fb8f990d-224f-4277-92a1-13bee8f7f8a4");
    private static final Set<String> GERMAN_TARGET_SCOPES = Set.of("DE-HE/CrossStage/G9/LK",
            "DE-HE/SekII/G8/GK", "DE-HE/SekII/G8/GK+LK", "DE-HE/SekII/G8/LK",
            "DE-HE/SekII/G9/GK", "DE-HE/SekII/G9/GK+LK", "DE-HE/SekII/G9/LK");
    private static final String BIOLOGY_ORIENTATION = "2d451684-6e53-565e-a987-f362da919d2c";
    private static final String LATIN_CLUSTER = "e82cc731-ebf4-588f-9fea-f0d31f7ad0e7";
    private static final String LATIN_ATOM = "bd6b8f87-f9b5-54ad-828e-e1c36c1d4d82";
    private static final String LATIN_BRIDGE = "1476af3f-0ff9-59c0-8a1a-e81dfc011ae2";
    private static final String LATIN_ORIENTATION = "551f2d6c-a030-57cc-9dbd-af30b2c3972a";
    private static final String EXCLUDED_NAVIGATION_CLUSTER = "d11b3b18-deec-5d1a-bff6-512cddf595a2";
    private static final String SOURCE = "bf17cada-3ccd-5d9a-b9e3-42065cfdbb01";
    private static final String RETAINED = "91e2f564-3bc8-4924-af85-2a3fa84c1471";
    private static final String REMOVED = "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
    private static final String CONTINUED_BRIDGE = "71683f37-24de-4e0f-badd-858b56fa4d64";
    private static final String V2 = "atomic-descendant-covered-cluster-reduction-v2";
    private static final String V3 = "ordered-atomic-materialization-and-cluster-reduction-v3";
    private static final String V4 = "continued-atomic-prerequisite-reduction-v4";
    private static final String V5 = "atomic-cluster-target-normalization-v5";
    private static final String V6 = "append-only-prerequisite-reduction-batches-v6";
    private static final Set<String> MATH_EXAMS = Set.of("464a6024-a2f8-53b4-84e0-d7b9df22a0b1",
            "9ad83149-3cb7-5b87-a617-3eae3715a50c");
    private static final Set<String> UNEXPOSED_CANONICAL_ATOMIC_BASES = Set.of(
            "858335d7-3336-5958-adf0-24c772091cf0", "cadc3bb3-e98d-5cda-893b-8b61811ba166");
    private static final List<String> BEFORE = List.of(RETAINED, REMOVED);
    private static final List<String> AFTER = List.of(RETAINED);
    private static final List<String> SUBJECTS = List.of(MATH,
            BIOLOGY, "c436b994-8f44-5134-b9f8-0c9f5d6a5ba0",
            "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", "605bdaf6-32d5-56fd-8d92-5a80c2fd2901",
            "67bd301b-e11a-582d-94ba-4f4b1a4cefff", "92406d94-e3c1-58ec-b7c6-12122278d25a",
            "7d51b38c-a149-5407-bddc-d2ce7878b020", LATIN,
            "51b60137-46e8-5498-973e-ea38bb32f327");
    private static final Path REPOSITORY = findRepositoryRoot();
    private static final Path MATH_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
    private static final Path BIOLOGY_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json");
    private static final Path LATIN_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_LATEIN.de.json");
    private static final Path GERMAN_SOURCE = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_DEUTSCH.de.json");
    private static final Path REDUCTION_REGISTRY = REPOSITORY.resolve(
            "curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json");
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static Path findRepositoryRoot() {
        Path start = Path.of("").toAbsolutePath().normalize();
        for (Path candidate = start; candidate != null; candidate = candidate.getParent()) {
            if (Files.isDirectory(candidate.resolve("curricula"))
                    && Files.isDirectory(candidate.resolve("app/src/generated"))
                    && Files.isDirectory(candidate.resolve("backend"))) {
                return candidate;
            }
        }
        throw new IllegalStateException("Cannot locate SkillPilot repository root from " + start);
    }

    /** Legacy V5 regression; active V6 is read through its exact reconstructed V5-current frame. */
    @Test
    void rawRegistryFramesRejectMissingOverlaysBadDigestsAndRequiresPresenceChanges() throws Exception {
        JsonNode declared = MAPPER.readTree(REDUCTION_REGISTRY.toFile());
        assertThat(declared.path("proofContract").asText()).as("active V5 or V6 with independently reconstructed V5 prefix").isIn(V5, V6);
        ReductionRegistry registry = readReductionRegistry(declared);
        JsonNode current = readFrameDocument(MATH_SOURCE, registry.currentDocuments());
        List<ChangedSource> changes = registry.changesByFile().get(MATH_SOURCE);
        ChangedSource atom = changes.stream().filter(changed -> registry.suffixSourceIds().contains(changed.goalId())
                && changed.atomicSource()).findFirst().orElseThrow();
        assertThat(atom.originalRequires()).isEmpty();
        assertThat(atom.originalRequiresPresent()).isTrue();
        assertThat(atom.currentRequires()).containsExactly(REMOVED);
        JsonNode before = reconstructRawDocument(MATH_SOURCE, current, MATH, registry.documentDigests().get(MATH_SOURCE), changes, true);
        JsonNode beforeAtom = rawGoals(before).get(atom.goalId());
        assertThat(beforeAtom.has("requires")).isTrue();
        assertThat(beforeAtom.path("requires")).isEmpty();

        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, current, MATH, registry.documentDigests().get(MATH_SOURCE),
                changes.stream().filter(changed -> !changed.goalId().equals(atom.goalId())).toList(), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, current, MATH,
                new DocumentDigests("sha256:" + "0".repeat(64), registry.documentDigests().get(MATH_SOURCE).current()), changes, true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, current, MATH, registry.documentDigests().get(MATH_SOURCE),
                changes.stream().map(changed -> changed.goalId().equals(atom.goalId()) ? changed.withOriginalPresence(false) : changed).toList(), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        JsonNode absentArray = beforeAtom.deepCopy();
        ((ObjectNode) absentArray).remove("requires");
        var compiler = new CompletionProfileCompiler();
        assertThat(compiler.normalizePrerequisites(Map.of(atom.goalId(), MAPPER.treeToValue(absentArray, LearningGoal.class)))
                .transitivePrerequisites(atom.goalId())).isEmpty();
        assertThat(compiler.normalizePrerequisites(Map.of(atom.goalId(), MAPPER.treeToValue(beforeAtom, LearningGoal.class)))
                .transitivePrerequisites(atom.goalId())).isEmpty();
        assertThat(absentArray.has("requires")).isFalse();

        ObjectNode missing = declared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) missing.path("suffixOriginalRequires")).remove(0);
        assertThatThrownBy(() -> readReductionRegistry(missing)).isInstanceOf(AssertionError.class);
        ObjectNode missingTail = declared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) missingTail.path("tailOriginalRequires")).remove(0);
        assertThatThrownBy(() -> readReductionRegistry(missingTail)).isInstanceOf(AssertionError.class);
        ObjectNode extraTail = declared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) extraTail.path("tailOriginalRequires"))
                .add(extraTail.path("tailOriginalRequires").get(0).deepCopy());
        assertThatThrownBy(() -> readReductionRegistry(extraTail)).isInstanceOf(AssertionError.class);
        ChangedSource tail = changes.stream().filter(changed -> registry.tailSourceIds().contains(changed.goalId()))
                .findFirst().orElseThrow();
        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, current, MATH, registry.documentDigests().get(MATH_SOURCE),
                changes.stream().filter(changed -> !changed.goalId().equals(tail.goalId())).toList(), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, current, MATH, registry.documentDigests().get(MATH_SOURCE),
                changes.stream().map(changed -> changed.goalId().equals(tail.goalId())
                        ? changed.withOriginalPresence(!changed.originalRequiresPresent()) : changed).toList(), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        JsonNode missingCurrentTail = current.deepCopy();
        ((ObjectNode) rawGoals(missingCurrentTail).get(tail.goalId())).remove("requires");
        assertThatThrownBy(() -> reconstructRawDocument(MATH_SOURCE, missingCurrentTail, MATH,
                registry.documentDigests().get(MATH_SOURCE), changes, false))
                .isInstanceOf(AssertionError.class).hasMessageContaining("current raw document");
        ObjectNode missingClusterTargetOverlay = declared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) missingClusterTargetOverlay.path("clusterTargetOriginalRequires")).remove(0);
        assertThatThrownBy(() -> readReductionRegistry(missingClusterTargetOverlay)).isInstanceOf(AssertionError.class);
        ObjectNode nullClusterTargetOverlay = declared.deepCopy();
        ((ObjectNode) nullClusterTargetOverlay.path("clusterTargetOriginalRequires").get(0)).putNull("requires");
        assertThatThrownBy(() -> readReductionRegistry(nullClusterTargetOverlay)).isInstanceOf(AssertionError.class);
        ObjectNode missingClusterTargetStep = declared.deepCopy();
        ((com.fasterxml.jackson.databind.node.ArrayNode) missingClusterTargetStep.path("clusterTargetSuffix")).remove(0);
        assertThatThrownBy(() -> readReductionRegistry(missingClusterTargetStep)).isInstanceOf(AssertionError.class);
        ObjectNode reorderedClusterTargetSteps = declared.deepCopy();
        var clusterTargetSteps = (com.fasterxml.jackson.databind.node.ArrayNode) reorderedClusterTargetSteps.path("clusterTargetSuffix");
        JsonNode firstStep = clusterTargetSteps.get(0).deepCopy();
        clusterTargetSteps.set(0, clusterTargetSteps.get(10).deepCopy());
        clusterTargetSteps.set(10, firstStep);
        assertThatThrownBy(() -> readReductionRegistry(reorderedClusterTargetSteps)).isInstanceOf(AssertionError.class);
        ObjectNode badV4Checkpoint = declared.deepCopy();
        ((ObjectNode) badV4Checkpoint.path("v4Checkpoint")).put("registryDigest", "sha256:" + "0".repeat(64));
        assertThatThrownBy(() -> readReductionRegistry(badV4Checkpoint)).isInstanceOf(AssertionError.class);
        JsonNode germanCurrent = readFrameDocument(GERMAN_SOURCE, registry.currentDocuments());
        List<ChangedSource> germanChanges = registry.changesByFile().get(GERMAN_SOURCE);
        assertThat(germanChanges).hasSize(1);
        assertThatThrownBy(() -> reconstructRawDocument(GERMAN_SOURCE, germanCurrent, GERMAN,
                registry.documentDigests().get(GERMAN_SOURCE), List.of(), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        assertThatThrownBy(() -> reconstructRawDocument(GERMAN_SOURCE, germanCurrent, GERMAN,
                registry.documentDigests().get(GERMAN_SOURCE), List.of(germanChanges.getFirst().withOriginalPresence(false)), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
        ObjectNode unknown = declared.deepCopy();
        unknown.put("proofContract", "unreviewed-reduction-contract");
        assertThatThrownBy(() -> readReductionRegistry(unknown)).isInstanceOf(AssertionError.class);

        if (V6.equals(declared.path("proofContract").asText())) {
            ObjectNode badV5Checkpoint = declared.deepCopy();
            ((ObjectNode) badV5Checkpoint.path("v5Checkpoint")).put("registryDigest", "sha256:" + "0".repeat(64));
            assertThatThrownBy(() -> readReductionRegistry(badV5Checkpoint)).isInstanceOf(AssertionError.class);
            ObjectNode missingBatchSnapshot = declared.deepCopy();
            ((com.fasterxml.jackson.databind.node.ArrayNode) missingBatchSnapshot.path("batches").get(0).path("originalRequires")).remove(0);
            assertThatThrownBy(() -> readReductionRegistry(missingBatchSnapshot)).isInstanceOf(AssertionError.class);
            ObjectNode duplicateBatchSnapshot = declared.deepCopy();
            var batchSnapshots = (com.fasterxml.jackson.databind.node.ArrayNode) duplicateBatchSnapshot.path("batches").get(0).path("originalRequires");
            batchSnapshots.add(batchSnapshots.get(0).deepCopy());
            assertThatThrownBy(() -> readReductionRegistry(duplicateBatchSnapshot)).isInstanceOf(AssertionError.class);
            ObjectNode badBatchEnd = declared.deepCopy();
            ((ObjectNode) badBatchEnd.path("batches").get(0).path("currentDocumentDigests").get(0))
                    .put("currentDocumentDigest", "sha256:" + "0".repeat(64));
            assertThatThrownBy(() -> readReductionRegistry(badBatchEnd)).isInstanceOf(AssertionError.class);
            ObjectNode badBatchPredecessor = declared.deepCopy();
            ((ObjectNode) badBatchPredecessor.path("batches").get(0)).put("previousDigest", "sha256:" + "0".repeat(64));
            assertThatThrownBy(() -> readReductionRegistry(badBatchPredecessor)).isInstanceOf(AssertionError.class);
        }

        // The same raw reconstruction helper also preserves a genuine null
        // overlay; native topology alone maps both raw forms to empty demand.
        JsonNode syntheticCurrent = MAPPER.readTree("""
                {"landscapeId":"presence-fixture","goals":[
                  {"id":"a","type":"atomic","contains":[],"requires":["b"]},
                  {"id":"b","type":"atomic","contains":[]}]}
                """);
        JsonNode syntheticBefore = syntheticCurrent.deepCopy();
        ((ObjectNode) rawGoals(syntheticBefore).get("a")).remove("requires");
        DocumentDigests syntheticDigests = new DocumentDigests(CompletionReviewBindings.canonicalHash(syntheticBefore, MAPPER),
                CompletionReviewBindings.canonicalHash(syntheticCurrent, MAPPER));
        ChangedSource absent = new ChangedSource("presence-fixture", "a", List.of(), List.of("b"), List.of(), true, false, true);
        JsonNode restored = reconstructRawDocument(Path.of("synthetic-presence.json"), syntheticCurrent,
                "presence-fixture", syntheticDigests, List.of(absent), true);
        assertThat(rawGoals(restored).get("a").has("requires")).isFalse();
        assertThat(CompletionReviewBindings.canonicalHash(restored, MAPPER)).isEqualTo(syntheticDigests.original());
        assertThat(compiler.normalizePrerequisites(Map.of("a", MAPPER.treeToValue(rawGoals(restored).get("a"), LearningGoal.class)))
                .transitivePrerequisites("a")).isEmpty();
        assertThatThrownBy(() -> reconstructRawDocument(Path.of("synthetic-presence.json"), syntheticCurrent,
                "presence-fixture", syntheticDigests, List.of(absent.withOriginalPresence(true)), true))
                .isInstanceOf(AssertionError.class).hasMessageContaining("baseline raw document");
    }

    /** Legacy V5 regression; active V6 is read through its exact reconstructed V5-current frame. */
    @Test
    void economicsAuthoredAtomicAbiturTargetsPreserveNativePrerequisitesAndFrontier() throws Exception {
        String economics = "605bdaf6-32d5-56fd-8d92-5a80c2fd2901";
        String orientation = "6bf2d1cc-e745-50dd-a617-71c06a6c6945";
        ReductionRegistry registry = readReductionRegistry();
        Map<Path, byte[]> sourceBytes = new LinkedHashMap<>();
        for (Path source : registry.canonicalOwners().keySet()) sourceBytes.put(source, Files.readAllBytes(source));
        byte[] registryBytes = Files.readAllBytes(REDUCTION_REGISTRY);
        var before = new NativeFixture(registry, true);
        var after = new NativeFixture(registry, false);
        JsonNode offerings = readGuiOfferings().path(economics);
        Discovery original = discover(before, economics, offerings);
        Discovery reduced = discover(after, economics, offerings);
        assertThat(reduced).as("actual offered Economics configurations").isEqualTo(original);
        Map<String, String> cases = new LinkedHashMap<>();
        cases.put("DE-HE/CrossStage//GK", "d7f40fca-bdde-5a07-9c37-c892c2588177");
        cases.put("DE-HE/CrossStage//LK", "a068e975-4dae-56ba-b510-f26532d6de0b");
        assertThat(registry.changedSources()).as("both Economics Abitur sources stay outside the reduction registry")
                .doesNotContainKeys(cases.values().toArray(String[]::new));
        List<String> differences = new ArrayList<>();
        for (var entry : cases.entrySet()) {
            String configId = entry.getKey(), sourceId = entry.getValue();
            assertThat(original.configurations()).as("existing authored Economics configuration %s", configId).containsKey(configId);
            var config = original.configurations().get(configId);
            NativeScope left = before.resolve(config);
            NativeScope right = after.resolve(reduced.configurations().get(configId));
            assertThat(right.roles()).as("unchanged authored roles: %s", configId).isEqualTo(left.roles());
            assertThat(right.graph().keySet()).as("unchanged actual lookup context: %s", configId).isEqualTo(left.graph().keySet());
            for (NativeScope actual : List.of(left, right)) {
                assertThat(actual.roles().targets()).contains(sourceId);
                assertThat(actual.roles().atomicTargets()).contains(sourceId);
                assertThat(actual.context()).as("actual compiled atomic context: %s", configId).contains(sourceId);
                assertThat(actual.graph()).containsKey(sourceId);
                assertThat(actual.graph().get(sourceId).getType()).isEqualTo("atomic");
                assertThat(actual.graph().get(sourceId).getContains()).isEmpty();
                Map<String, LearningGoal> lookup = ReflectionTestUtils.invokeMethod(actual.frontier(), "lookup");
                assertThat(lookup).as("actual production frontier lookup: %s", configId).containsKey(sourceId);
            }
            Set<String> originalAtomic = left.topology().transitivePrerequisites(sourceId);
            Set<String> reducedAtomic = right.topology().transitivePrerequisites(sourceId);
            Set<String> originalGoals = left.topology().transitiveGoalPrerequisites(sourceId);
            Set<String> reducedGoals = right.topology().transitiveGoalPrerequisites(sourceId);
            assertThat(originalAtomic).as("original Economics entry demand: %s", configId).contains(orientation);
            assertThat(originalGoals).as("original Economics entry role: %s", configId).contains(orientation);
            Map<String, Double> originalMastery = new TreeMap<>(), reducedMastery = new TreeMap<>();
            left.graph().keySet().forEach(id -> originalMastery.put(id, 1.0));
            right.graph().keySet().forEach(id -> reducedMastery.put(id, 1.0));
            boolean originalFull = atomicFrontierProbe(before.service, left, sourceId,
                    new AtomicFrontierCase("econ-strict-full-mastered", originalMastery, null, true, null));
            boolean reducedFull = atomicFrontierProbe(after.service, right, sourceId,
                    new AtomicFrontierCase("econ-strict-full-mastered", reducedMastery, null, true, null));
            originalMastery.remove(orientation);
            reducedMastery.remove(orientation);
            boolean originalMissing = atomicFrontierProbe(before.service, left, sourceId,
                    new AtomicFrontierCase("econ-strict-missing-orientation", originalMastery, null, true, null));
            boolean reducedMissing = atomicFrontierProbe(after.service, right, sourceId,
                    new AtomicFrontierCase("econ-strict-missing-orientation", reducedMastery, null, true, null));
            Map<String, Object> diagnostic = new LinkedHashMap<>();
            diagnostic.put("configurationId", configId);
            diagnostic.put("configuration", config);
            diagnostic.put("source", sourceId);
            diagnostic.put("actualAtomicTargetAndLookupBothFrames", true);
            diagnostic.put("orientationRole", Map.of("before", hasDeclaredRole(left, orientation), "after", hasDeclaredRole(right, orientation)));
            List<String> originalRaw = before.canonicalGoals.get(sourceId).getRequires();
            List<String> reducedRaw = after.canonicalGoals.get(sourceId).getRequires();
            assertThat(originalRaw).containsExactly(orientation);
            assertThat(reducedRaw).containsExactlyElementsOf(originalRaw);
            diagnostic.put("rawCanonicalRequires", Map.of("before", originalRaw, "after", reducedRaw));
            diagnostic.put("projectedRequires", Map.of("before", left.graph().get(sourceId).getRequires(), "after", right.graph().get(sourceId).getRequires()));
            diagnostic.put("atomicDemand", Map.of("before", originalAtomic, "after", reducedAtomic));
            diagnostic.put("preExpansionDemand", Map.of("before", originalGoals, "after", reducedGoals));
            diagnostic.put("strictFullMastery", Map.of("before", originalFull, "after", reducedFull));
            diagnostic.put("strictMissingOrientation", Map.of("before", originalMissing, "after", reducedMissing));
            System.out.printf("ECON_SCOPE_PROJECTION_INVARIANCE %s%n", MAPPER.writeValueAsString(diagnostic));
            String label = configId + " source=" + sourceId;
            if (!originalAtomic.equals(reducedAtomic)) differences.add(label + " atomic demand changed: " + originalAtomic + " -> " + reducedAtomic);
            if (!originalGoals.equals(reducedGoals)) differences.add(label + " pre-expansion demand changed: " + originalGoals + " -> " + reducedGoals);
            if (!originalFull || !reducedFull) differences.add(label + " full-mastery positive control: " + originalFull + " -> " + reducedFull);
            if (originalMissing || reducedMissing) differences.add(label + " strict missing-orientation availability: " + originalMissing + " -> " + reducedMissing);
        }
        before.verifyOnlyUnsavedFixtures();
        after.verifyOnlyUnsavedFixtures();
        for (var source : sourceBytes.entrySet()) {
            assertThat(Files.readAllBytes(source.getKey())).as("canonical source remains untouched: %s", source.getKey())
                    .isEqualTo(source.getValue());
        }
        assertThat(Files.readAllBytes(REDUCTION_REGISTRY)).as("registry remains untouched").isEqualTo(registryBytes);
        assertThat(differences).as("native invariance of the actually atomic Economics Abitur targets").isEmpty();
    }

    /** Legacy V5 regression; active V6 is read through its exact reconstructed V5-current frame. */
    @Test
    void firstMathEdgePreservesLiveOfferingsProjectionsAtomicDemandAndEffectiveRoleValidity() throws Exception {
        ReductionRegistry registry = readReductionRegistry();
        Map<Path, byte[]> sourceBytes = new LinkedHashMap<>();
        for (Path source : registry.canonicalOwners().keySet()) sourceBytes.put(source, Files.readAllBytes(source));
        byte[] registryBytes = Files.readAllBytes(REDUCTION_REGISTRY);
        // Both frames use the current native policy. Before reconstructs the full
        // original registry baseline, including the first Math reduction.
        var before = new NativeFixture(registry, true);
        var after = new NativeFixture(registry, false);
        assertThat(after.canonicalAtomicIds).as("canonical atomic classification before scope")
                .isEqualTo(before.canonicalAtomicIds);
        assertThat(after.atomicProbesBySource).as("canonical descendant coverage before scope")
                .isEqualTo(before.atomicProbesBySource);
        assertThat(nativeGermanApplicability(after)).as("native derived German applicability before scope")
                .isEqualTo(nativeGermanApplicability(before));
        Set<String> germanReachedScopes = new TreeSet<>(), germanTargetScopes = new TreeSet<>();
        int germanCompletionPairs = 0, germanPolicyPairs = 0, germanMasteredSourcePairs = 0;
        boolean germanControlledRolesChecked = false;
        JsonNode offerings = readGuiOfferings();
        int sourceTargets = 0, sourceContextsOnly = 0, foreignContexts = 0;
        int validRoles = 0, invalidRoles = 0;
        boolean negativeRoleCaseChecked = false;
        boolean navigationClusterCaseChecked = false;
        boolean inheritedRoleCaseChecked = false, transitiveRoleCaseChecked = false;
        boolean latinMissingRoleCaseChecked = false;
        boolean continuedMathFocusCaseChecked = false;
        Map<String, Integer> configurationCounts = new TreeMap<>();
        Map<String, Integer> changedContextPairs = new TreeMap<>();
        Map<String, Integer> changedTargetPairs = new TreeMap<>();
        Map<String, Integer> changedValidRoles = new TreeMap<>();
        Map<String, Integer> changedInvalidRoles = new TreeMap<>();
        Set<String> coveredChangedSources = new TreeSet<>();
        Map<String, Set<String>> coveredAtomicProbes = new TreeMap<>();
        long atomicFrontierComparisons = 0;
        long mathFrontierComparisons = 0;
        long mathPositiveTargetControls = 0;
        long liveAtomicTargetComparisons = 0;
        long contextGoalComparisons = 0;

        for (String subject : SUBJECTS) {
            Discovery original = discover(before, subject, offerings.path(subject));
            Discovery reduced = discover(after, subject, offerings.path(subject));
            assertThat(reduced).as("actual offered and selected configurations: %s", subject).isEqualTo(original);
            assertThat(original.plannerScopes()).as("native planner coverage: %s", subject).isNotEmpty();
            assertThat(original.guiScopes()).as("declared GUI coverage: %s", subject).isNotEmpty();
            configurationCounts.put(subject, original.configurations().size());
            for (var entry : original.configurations().entrySet()) {
                String scope = subject + "/" + entry.getKey();
                NativeScope left = before.resolve(entry.getValue());
                NativeScope right = after.resolve(reduced.configurations().get(entry.getKey()));
                assertThat(right.roles()).as("projection roles and views: %s", scope).isEqualTo(left.roles());
                assertThat(right.graph().keySet()).as("complete resolved graph: %s", scope)
                        .isEqualTo(left.graph().keySet());
                assertThat(right.context()).as("complete native compiler context: %s", scope).isEqualTo(left.context());
                if (GERMAN.equals(subject)) {
                    assertThat(projectedApplicability(right)).as("actual projected German applicability: %s", scope)
                            .isEqualTo(projectedApplicability(left));
                    if (left.graph().containsKey(GERMAN_ATOM)) {
                        germanReachedScopes.add(entry.getKey());
                        assertThat(left.roles().atomicTargets()).as("actual German assessment target: %s", scope).contains(GERMAN_ATOM);
                        assertThat(right.roles().atomicTargets()).contains(GERMAN_ATOM);
                        germanTargetScopes.add(entry.getKey());
                        assertGermanRawGoalNormalization(left.topology(), right.topology(), scope);
                        assertGermanActualCompletionAndPolicyPreserved(before.service, left, after.service, right,
                                registry.documentDigests().get(GERMAN_SOURCE), scope);
                        germanCompletionPairs += 5;
                        germanPolicyPairs += 20;
                        germanMasteredSourcePairs++;
                        if ("DE-HE/SekII/G8/GK".equals(entry.getKey())) {
                            assertGermanControlledRoleDifferences(before.service, left, after.service, right);
                            germanControlledRolesChecked = true;
                        }
                    }
                }

                if (BIOLOGY.equals(subject) && "DE-MV/SekI/G8/".equals(entry.getKey())) {
                    assertDuplicateRemovalKeepsMissingRoleInvalid(before.service, left,
                            "1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30", "b530a382-2786-5794-8821-3e01a62d88fd");
                    assertDuplicateRemovalKeepsMissingRoleInvalid(after.service, right,
                            "1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30", "b530a382-2786-5794-8821-3e01a62d88fd");
                    for (NativeScope actual : List.of(left, right)) {
                        assertThat(actual.graph().get("b530a382-2786-5794-8821-3e01a62d88fd").getType()).isEqualTo("cluster");
                    }
                    inheritedRoleCaseChecked = true;
                }
                if (MATH.equals(subject) && "ALL/CrossStage//GK".equals(entry.getKey())) {
                    String source = "1878f680-095c-511d-aaed-e98393f7fde9";
                    String missingRole = "9460c3ff-e72d-4107-bc73-087d217200aa";
                    assertDuplicateRemovalKeepsMissingRoleInvalid(before.service, left,
                            source, missingRole);
                    assertMissingRoleInvalid(after.service, right, source, missingRole);
                    assertThat(right.graph().get(source).getRequires()).as("certified tail 912 already removed the duplicate")
                            .doesNotContain(missingRole);
                    assertThat(right.topology().transitivePrerequisites(source)).as("full atomic demand after the actual tail")
                            .isEqualTo(left.topology().transitivePrerequisites(source));
                    assertThat(right.topology().transitiveGoalPrerequisites(source)).as("full role demand after the actual tail")
                            .isEqualTo(left.topology().transitiveGoalPrerequisites(source));
                    List<String> finalWitness = List.of(source, "5f548596-9bc3-532e-88a0-81d5029809e9",
                            "636b3e2d-c687-5469-8850-e085df06878d", "b4fd63de-1e36-5efd-ae0a-6c5e7741b0d2",
                            "eb070ed2-7ef4-5afe-b203-190ebb0116af", "50eb5156-5046-5887-80dc-3128c5f8cbd6", missingRole);
                    assertThat(right.graph()).as("actual native vertices of the certified tail 912 witness")
                            .containsKeys(finalWitness.toArray(String[]::new));
                    for (int index = 0; index + 1 < finalWitness.size(); index++) {
                        assertThat(right.graph().get(finalWitness.get(index)).getRequires())
                                .as("literal final native tail 912 witness edge %d", index).contains(finalWitness.get(index + 1));
                    }
                    transitiveRoleCaseChecked = true;
                }

                if (BIOLOGY.equals(subject) && "DE-BY/CrossStage/G9/GK".equals(entry.getKey())) {
                    for (NativeScope actual : List.of(left, right)) {
                        assertThat(actual.roles().targets()).contains(EXCLUDED_NAVIGATION_CLUSTER);
                        assertThat(actual.roles().atomicTargets()).doesNotContain(EXCLUDED_NAVIGATION_CLUSTER);
                        assertThat(actual.graph()).doesNotContainKey(EXCLUDED_NAVIGATION_CLUSTER);
                    }
                    assertBiologyOrientationAvailable(before.service, left);
                    assertBiologyOrientationAvailable(after.service, right);
                    assertInvalidAtomicRequirementOutsideFocusFailsClosed(before.service, left);
                    navigationClusterCaseChecked = true;
                }

                if (!MATH.equals(subject)) {
                    assertThat(left.graph()).as("foreign resolved context: %s", scope).doesNotContainKey(SOURCE);
                    assertThat(right.graph()).as("foreign reduced context: %s", scope).doesNotContainKey(SOURCE);
                    assertThat(left.context()).as(scope).doesNotContain(SOURCE);
                    assertThat(right.context()).as(scope).doesNotContain(SOURCE);
                    foreignContexts++;
                }
                for (String id : left.graph().keySet()) {
                    // The registry overlay changes only these raw requires arrays.
                    if (!registry.changedSources().containsKey(id)) {
                        assertThat(right.graph().get(id).getRequires()).as("requires %s: %s", id, scope)
                                .isEqualTo(left.graph().get(id).getRequires());
                    }
                    assertThat(right.graph().get(id).getContains()).as("contains %s: %s", id, scope)
                            .isEqualTo(left.graph().get(id).getContains());
                }
                Map<String, LearningGoal> originalLookup = ReflectionTestUtils.invokeMethod(left.frontier(), "lookup");
                Map<String, LearningGoal> reducedLookup = ReflectionTestUtils.invokeMethod(right.frontier(), "lookup");
                for (String id : left.roles().atomicTargets()) {
                    assertThat(originalLookup).as("actual atomic target in original production lookup %s: %s", id, scope).containsKey(id);
                    assertThat(reducedLookup).as("actual atomic target in reduced production lookup %s: %s", id, scope).containsKey(id);
                    assertThat(left.context()).as("original compiler target %s: %s", id, scope).contains(id);
                    assertThat(right.context()).as("reduced compiler target %s: %s", id, scope).contains(id);
                    liveAtomicTargetComparisons++;
                }
                Set<String> liveProbeIds = new TreeSet<>(left.context());
                liveProbeIds.retainAll(before.canonicalAtomicIds);
                liveProbeIds.addAll(left.roles().atomicTargets());
                Object originalFullMastery = fullMasteryPrerequisites(left.graph(), left.topology());
                Object reducedFullMastery = fullMasteryPrerequisites(right.graph(), right.topology());
                for (String id : liveProbeIds) {
                    // Scope-atomic goalEntries must be checked even when their
                    // unfiltered canonical definition remains a cluster.
                    assertThat(right.topology().transitivePrerequisites(id)).as("full atomic demand %s: %s", id, scope)
                            .isEqualTo(left.topology().transitivePrerequisites(id));
                    if (GERMAN_ATOM.equals(id)) assertGermanRawGoalNormalization(left.topology(), right.topology(), scope);
                    else assertThat(right.topology().transitiveGoalPrerequisites(id))
                                .as("pre-expansion prerequisite roles %s: %s", id, scope)
                                .isEqualTo(left.topology().transitiveGoalPrerequisites(id));
                    boolean originalRoleValid = roleProbeWithPrerequisites(before.service, left.graph(), left.projection(), id, originalFullMastery);
                    assertThat(roleProbeWithPrerequisites(after.service, right.graph(), right.projection(), id, reducedFullMastery))
                            .as("complete native role check %s: %s", id, scope)
                            .isEqualTo(originalRoleValid);
                    if (registry.suffixSourceIds().contains(id)) {
                        mathFrontierComparisons += assertMathSuffixAtomicFrontierPreserved(before.service, left,
                                after.service, right, id, originalRoleValid, scope);
                        if (originalRoleValid && left.roles().atomicTargets().contains(id)) mathPositiveTargetControls++;
                    }
                    if (!continuedMathFocusCaseChecked && RETAINED.equals(id) && originalRoleValid
                            && left.roles().atomicTargets().containsAll(Set.of(RETAINED, REMOVED))) {
                        assertContinuedMathFocusPreserved(before.service, left, after.service, right, scope);
                        continuedMathFocusCaseChecked = true;
                    }
                    contextGoalComparisons++;
                }
                Map<String, Boolean> originalRoleValidity = new LinkedHashMap<>();
                for (ChangedSource changed : registry.changedSources().values()) {
                    if (left.graph().containsKey(changed.goalId())) {
                        assertThat(left.graph().get(changed.goalId()).getRequires())
                                .as("original registered requires %s: %s", changed.goalId(), scope)
                                .containsExactlyElementsOf(changed.originalRequires());
                        assertThat(right.graph().get(changed.goalId()).getRequires())
                                .as("current registered requires %s: %s", changed.goalId(), scope)
                                .containsExactlyElementsOf(changed.currentRequires());
                    }
                    for (String id : before.atomicProbesBySource.get(changed.goalId())) {
                        if (!left.context().contains(id)) continue;
                        boolean originalHelper = roleProbe(before.service, left, left.projection(), id, left.topology());
                        boolean reducedHelper = roleProbe(after.service, right, right.projection(), id, right.topology());
                        assertThat(reducedHelper).as("native effective-role helper %s for source %s: %s",
                                id, changed.goalId(), scope).isEqualTo(originalHelper);
                        originalRoleValidity.put(id, originalHelper);
                        coveredChangedSources.add(changed.goalId());
                        coveredAtomicProbes.computeIfAbsent(changed.goalId(), ignored -> new TreeSet<>()).add(id);
                        changedContextPairs.merge(changed.owner(), 1, Integer::sum);
                        if (left.roles().targets().contains(id)) changedTargetPairs.merge(changed.owner(), 1, Integer::sum);
                        (originalHelper ? changedValidRoles : changedInvalidRoles).merge(changed.owner(), 1, Integer::sum);
                        if (LATIN_CLUSTER.equals(changed.goalId()) && left.roles().atomicTargets().contains(id)) {
                            atomicFrontierComparisons += assertLatinAtomicFrontierPreserved(
                                    before.service, left, after.service, right, id, originalHelper, scope);
                            if (!latinMissingRoleCaseChecked && originalHelper
                                    && Boolean.TRUE.equals(ReflectionTestUtils.invokeMethod(left.projection(), "compositionViewApplied"))) {
                                assertThat(roleProbe(before.service, left, withoutRole(left.projection(), LATIN_ORIENTATION),
                                        id, left.topology())).isFalse();
                                assertThat(roleProbe(after.service, right, withoutRole(right.projection(), LATIN_ORIENTATION),
                                        id, right.topology())).isFalse();
                                latinMissingRoleCaseChecked = true;
                            }
                        }
                    }
                }
                if (!left.context().contains(SOURCE)) continue;
                assertThat(subject).as("first Math source reached only from Math: %s", scope).isEqualTo(MATH);
                assertThat(left.graph().get(SOURCE).getRequires()).containsExactlyElementsOf(BEFORE);
                assertThat(right.graph().get(SOURCE).getRequires()).containsExactlyElementsOf(AFTER);
                assertThat(hasDeclaredRole(left, REMOVED)).as("removed prerequisite retains a declared role: %s", scope).isTrue();
                assertThat(hasDeclaredRole(right, REMOVED)).as("reduced prerequisite retains a declared role: %s", scope).isTrue();
                boolean originalHelper = originalRoleValidity.get(SOURCE);
                if (originalHelper) validRoles++; else invalidRoles++;
                if (left.roles().targets().contains(SOURCE)) sourceTargets++; else sourceContextsOnly++;

                if (!negativeRoleCaseChecked && originalHelper
                        && Boolean.TRUE.equals(ReflectionTestUtils.invokeMethod(left.projection(), "compositionViewApplied"))) {
                    // The endpoint remains required transitively under the same E+ role policy.
                    assertThat(roleProbe(before.service, left, withoutRole(left.projection(), REMOVED))).isFalse();
                    assertThat(roleProbe(after.service, right, withoutRole(right.projection(), REMOVED))).isFalse();
                    negativeRoleCaseChecked = true;
                }
            }
        }
        Set<String> missingChangedSources = new TreeSet<>(registry.changedSources().keySet());
        missingChangedSources.removeAll(coveredChangedSources);
        Set<String> missingHistoricalSources = new TreeSet<>(missingChangedSources);
        missingHistoricalSources.retainAll(registry.historicalSourceIds());
        assertThat(missingHistoricalSources).as("exact historical canonical atomic bases unexposed by actual authored views")
                .containsExactlyInAnyOrderElementsOf(UNEXPOSED_CANONICAL_ATOMIC_BASES);
        Set<String> missingTailSources = new TreeSet<>(missingChangedSources);
        missingTailSources.retainAll(registry.tailSourceIds());
        Set<String> coveredTailSources = new TreeSet<>(coveredChangedSources);
        coveredTailSources.retainAll(registry.tailSourceIds());
        int liveCoveredSources = coveredChangedSources.size();
        Map<String, Set<String>> canonicalCoveredAtoms = new TreeMap<>();
        long canonicalRoleComparisons = 0;
        for (String source : UNEXPOSED_CANONICAL_ATOMIC_BASES) {
            Set<String> atoms = before.atomicProbesBySource.get(source);
            assertThat(atoms).as("three complete canonical PoWi assessment atoms of %s", source).hasSize(3);
            CanonicalProbe left = canonicalProbe(before, atoms);
            CanonicalProbe right = canonicalProbe(after, atoms);
            assertThat(right.context()).as("canonical compiler context of %s", source).isEqualTo(left.context());
            for (String atom : left.context()) {
                assertThat(before.canonicalAtomicIds).contains(atom);
                assertThat(right.topology().transitivePrerequisites(atom)).isEqualTo(left.topology().transitivePrerequisites(atom));
                assertThat(right.topology().transitiveGoalPrerequisites(atom)).isEqualTo(left.topology().transitiveGoalPrerequisites(atom));
            }
            for (String atom : atoms) {
                assertThat(roleProbe(before.service, left.graph(), left.projection(), atom, left.topology())).isTrue();
                assertThat(roleProbe(after.service, right.graph(), right.projection(), atom, right.topology())).isTrue();
                for (ClusterWitnessCoverage operation : registry.clusterWitnessCoverage()) {
                    if (!operation.sourceId().equals(source)) continue;
                    String prerequisite = operation.prerequisiteId();
                    assertThat(left.topology().transitivePrerequisites(atom)).contains(prerequisite);
                    assertThat(right.topology().transitivePrerequisites(atom)).contains(prerequisite);
                    assertThat(left.topology().transitiveGoalPrerequisites(atom)).contains(prerequisite);
                    assertThat(right.topology().transitiveGoalPrerequisites(atom)).contains(prerequisite);
                    assertThat(roleProbe(before.service, left.graph(), withoutRole(left.projection(), prerequisite), atom, left.topology())).isFalse();
                    assertThat(roleProbe(after.service, right.graph(), withoutRole(right.projection(), prerequisite), atom, right.topology())).isFalse();
                    canonicalRoleComparisons++;
                }
            }
            canonicalCoveredAtoms.put(source, atoms);
        }
        Map<String, Set<String>> tailCanonicalCoveredAtoms = new TreeMap<>();
        long tailCanonicalRoleComparisons = 0;
        for (String source : missingTailSources) {
            Set<String> atoms = before.atomicProbesBySource.get(source);
            assertThat(atoms).as("unexposed atomic tail source %s", source).containsExactly(source);
            CanonicalProbe left = canonicalProbe(before, atoms);
            CanonicalProbe right = canonicalProbe(after, atoms);
            assertThat(right.context()).as("separate canonical tail context of %s", source).isEqualTo(left.context());
            for (String atom : left.context()) {
                assertThat(before.canonicalAtomicIds).contains(atom);
                assertThat(right.topology().transitivePrerequisites(atom)).as("canonical tail atomic demand %s", atom)
                        .isEqualTo(left.topology().transitivePrerequisites(atom));
                assertThat(right.topology().transitiveGoalPrerequisites(atom)).as("canonical tail role demand %s", atom)
                        .isEqualTo(left.topology().transitiveGoalPrerequisites(atom));
            }
            assertThat(roleProbe(before.service, left.graph(), left.projection(), source, left.topology())).isTrue();
            assertThat(roleProbe(after.service, right.graph(), right.projection(), source, right.topology())).isTrue();
            for (String prerequisite : registry.tailRemovedPrerequisites().get(source)) {
                assertThat(left.topology().transitivePrerequisites(source)).contains(prerequisite);
                assertThat(right.topology().transitivePrerequisites(source)).contains(prerequisite);
                assertThat(roleProbe(before.service, left.graph(), withoutRole(left.projection(), prerequisite), source, left.topology())).isFalse();
                assertThat(roleProbe(after.service, right.graph(), withoutRole(right.projection(), prerequisite), source, right.topology())).isFalse();
                tailCanonicalRoleComparisons++;
            }
            tailCanonicalCoveredAtoms.put(source, atoms);
        }
        assertThat(coveredChangedSources.stream().filter(registry.historicalSourceIds()::contains).count())
                .as("historical sources with real authored-scope descendant probes").isEqualTo(198);
        assertThat(liveCoveredSources).as("all sources with real authored-scope descendant probes")
                .isEqualTo(198 + registry.suffixSourceIds().size() + coveredTailSources.size() + registry.clusterTargetSourceIds().size());
        assertThat(coveredChangedSources).as("all V3 Math materialization sources have actual authored-scope coverage")
                .containsAll(registry.suffixSourceIds());
        assertThat(coveredChangedSources.stream().filter(id -> registry.historicalSourceIds().contains(id)
                || registry.suffixSourceIds().contains(id)).count()).as("V3 prefix exposure remains separate").isEqualTo(227);
        assertThat(canonicalCoveredAtoms.values().stream().mapToInt(Set::size).sum()).isEqualTo(6);
        assertThat(canonicalRoleComparisons).as("canonical removed-role negative controls").isEqualTo(6);
        Set<String> allCoveredSources = new TreeSet<>(coveredChangedSources);
        allCoveredSources.addAll(canonicalCoveredAtoms.keySet());
        allCoveredSources.addAll(tailCanonicalCoveredAtoms.keySet());
        assertThat(allCoveredSources).as("combined live and separate canonical source coverage")
                .containsExactlyInAnyOrderElementsOf(registry.changedSources().keySet());
        before.atomicProbesBySource.forEach((source, probes) -> {
            Set<String> combined = new TreeSet<>(coveredAtomicProbes.getOrDefault(source, Set.of()));
            combined.addAll(canonicalCoveredAtoms.getOrDefault(source, Set.of()));
            combined.addAll(tailCanonicalCoveredAtoms.getOrDefault(source, Set.of()));
            assertThat(combined)
                    .as("all canonical atomic probes for registered source %s", source)
                    .containsExactlyInAnyOrderElementsOf(probes);
        });
        assertThat(configurationCounts.values().stream().mapToInt(Integer::intValue).sum())
                .as("all actual native planner and GUI configurations").isEqualTo(1240);
        assertThat(configurationCounts.get(GERMAN)).as("all actual German configurations").isEqualTo(99);
        assertThat(germanReachedScopes).as("exact actual source contexts, no incoming source dependencies")
                .containsExactlyInAnyOrderElementsOf(GERMAN_TARGET_SCOPES);
        assertThat(germanTargetScopes).as("seven actual positive prepared-source-open policy controls")
                .containsExactlyInAnyOrderElementsOf(GERMAN_TARGET_SCOPES);
        assertThat(germanCompletionPairs).isEqualTo(35);
        assertThat(germanPolicyPairs).isEqualTo(140);
        assertThat(germanMasteredSourcePairs).isEqualTo(7);
        assertThat(germanControlledRolesChecked).as("separate artificial role-projection differences").isTrue();
        assertThat(sourceTargets).as("actual Math target coverage").isPositive();
        assertThat(sourceContextsOnly).as("Math source present only in supporting compiler context").isPositive();
        assertThat(foreignContexts).isPositive();
        assertThat(validRoles).isPositive();
        // Existing incomplete GK roles remain invalid under the unified policy.
        assertThat(invalidRoles).isPositive();
        assertThat(negativeRoleCaseChecked).as("effective-role negative control executed").isTrue();
        assertThat(navigationClusterCaseChecked).as("actual Bio navigation-cluster counterexample executed").isTrue();
        assertThat(inheritedRoleCaseChecked).as("actual Bio inherited-role counterexample executed").isTrue();
        assertThat(transitiveRoleCaseChecked).as("actual Math transitive-role counterexample executed").isTrue();
        assertThat(latinMissingRoleCaseChecked).as("Latin descendant still requires the removed orientation role").isTrue();
        assertThat(atomicFrontierComparisons).as("actual Latin atomic-target frontier comparisons").isPositive();
        assertThat(mathFrontierComparisons).as("actual new Math atomic-target frontier comparisons").isPositive();
        assertThat(mathPositiveTargetControls).as("actually offered new Math targets with positive full-mastery frontier controls").isPositive();
        assertThat(continuedMathFocusCaseChecked).as("actual Retained/Orientation focus with outside-focus continuation bridge").isTrue();
        assertThat(liveAtomicTargetComparisons).as("all actual atomic scope targets checked").isPositive();
        before.verifyOnlyUnsavedFixtures();
        after.verifyOnlyUnsavedFixtures();
        for (var source : sourceBytes.entrySet()) {
            assertThat(Files.readAllBytes(source.getKey())).as("canonical source remains untouched: %s", source.getKey())
                    .isEqualTo(source.getValue());
        }
        assertThat(Files.readAllBytes(REDUCTION_REGISTRY)).as("registry remains untouched").isEqualTo(registryBytes);
        System.out.printf("FIRST_MATH_REDUCTION_NATIVE_COVERAGE configurations=%s sourceTargets=%d sourceContextsOnly=%d foreignContexts=%d validRoles=%d invalidRoles=%d%n",
                configurationCounts, sourceTargets, sourceContextsOnly, foreignContexts, validRoles, invalidRoles);
        System.out.printf("REGISTERED_REDUCTION_NATIVE_COVERAGE baseline=original-registry currentPolicy=true configurations=%d contextGoalComparisons=%d registeredSources=%d liveReachedSources=%d contextPairs=%s targetPairs=%s validRoles=%s invalidRoles=%s atomicFrontierComparisons=%d%n",
                configurationCounts.values().stream().mapToInt(Integer::intValue).sum(), contextGoalComparisons,
                registry.changedSources().size(), coveredChangedSources.size(), changedContextPairs, changedTargetPairs,
                changedValidRoles, changedInvalidRoles, atomicFrontierComparisons);
        System.out.printf("REGISTERED_REDUCTION_CANONICAL_COVERAGE liveSources=%d canonicalSources=%d combinedSources=%d canonicalAtoms=6 canonicalMissingRoleCases=%d liveAtomicTargetComparisons=%d%n",
                liveCoveredSources, canonicalCoveredAtoms.size(), allCoveredSources.size(), canonicalRoleComparisons,
                liveAtomicTargetComparisons);
        System.out.printf("MATH_MATERIALIZATION_NATIVE_COVERAGE sources=%d atomicSources=27 clusterSources=2 frontierComparisons=%d positiveTargetControls=%d%n",
                registry.suffixSourceIds().size(), mathFrontierComparisons, mathPositiveTargetControls);
        System.out.printf("MATH_ATOMIC_TAIL_NATIVE_COVERAGE registeredSources=%d liveSources=%d unexposedSources=%d separateCanonicalSources=%d canonicalMissingRoleCases=%d unexposedSourceIds=%s%n",
                registry.tailSourceIds().size(), coveredTailSources.size(), missingTailSources.size(),
                tailCanonicalCoveredAtoms.size(), tailCanonicalRoleComparisons, missingTailSources);
        System.out.printf("GERMAN_CLUSTER_TARGET_NATIVE_COVERAGE configurations=%d reachedScopes=%s targetScopes=%s atomicDemand=20 rawGoalDemand=2-to-12 completionPairs=%d commonPolicyPairs=%d masteredSourceCompletionAndEffectiveMasteryPairs=%d separateControlledRoleCases=2%n",
                configurationCounts.get(GERMAN), germanReachedScopes, germanTargetScopes,
                germanCompletionPairs, germanPolicyPairs, germanMasteredSourcePairs);
    }

    /** Separate final-V6 evidence; the three existing tests retain exact V5-prefix coverage. */
    @Test
    void batchedGermanSourcesPreserveFinalCurrentNativeAtomicDemandRolesAndFrontier() throws Exception {
        JsonNode declared = MAPPER.readTree(REDUCTION_REGISTRY.toFile());
        assertThat(declared.path("proofContract").asText()).as("this final-current regression requires actual V6 activation").isEqualTo(V6);
        BatchNativeFrames frames = readBatchedReductionRegistry(declared);
        ReductionRegistry prefix = frames.legacy(), current = frames.current();
        assertThat(prefix.changedSources()).as("the independently checked V5 inventory remains separate").hasSize(720);
        Set<String> newSources = new TreeSet<>(current.batchSourceIds());
        newSources.removeAll(prefix.changedSources().keySet());
        assertThat(current.changedSources()).as("final inventory derives from prefix plus genuinely new batch sources")
                .hasSize(prefix.changedSources().size() + newSources.size());
        Set<String> germanSources = new TreeSet<>();
        current.batchSourceIds().stream().filter(id -> GERMAN.equals(current.changedSources().get(id).owner())).forEach(germanSources::add);
        assertThat(germanSources).as("reviewed complete first German batch source inventory").hasSize(18);
        Set<String> germanOverlap = new TreeSet<>(germanSources);
        germanOverlap.retainAll(prefix.changedSources().keySet());
        assertThat(germanOverlap).as("the first German V5 source is changed again").containsExactly(GERMAN_ATOM);
        assertThat(germanSources.stream().filter(newSources::contains).count()).isEqualTo(17);
        assertThat(current.changedSources().get(GERMAN_ATOM).originalRequires())
                .as("overlap retains the earliest pre-V5 raw array, never the last batch snapshot")
                .containsExactly(GERMAN_CLUSTER, GERMAN_OTHER);
        Map<Path, byte[]> sourceBytes = new LinkedHashMap<>();
        for (Path source : current.canonicalOwners().keySet()) sourceBytes.put(source, Files.readAllBytes(source));
        byte[] registryBytes = Files.readAllBytes(REDUCTION_REGISTRY);
        var before = new NativeFixture(prefix, false);
        var after = new NativeFixture(current, false);
        assertThat(after.canonicalAtomicIds).isEqualTo(before.canonicalAtomicIds);
        assertThat(nativeGermanApplicability(after)).as("final-current native German applicability").isEqualTo(nativeGermanApplicability(before));
        for (String source : germanSources) {
            assertThat(current.changedSources().get(source).atomicSource()).isTrue();
            assertThat(after.atomicProbesBySource.get(source)).containsExactly(source);
            assertThat(canonicalAtomicDescendants(source, before.canonicalGoals)).containsExactly(source);
        }
        JsonNode offerings = readGuiOfferings().path(GERMAN);
        Discovery leftDiscovery = discover(before, GERMAN, offerings), rightDiscovery = discover(after, GERMAN, offerings);
        assertThat(rightDiscovery).as("actual German planner/GUI offerings").isEqualTo(leftDiscovery);
        assertThat(leftDiscovery.configurations()).hasSize(99);
        Set<String> contextReached = new TreeSet<>(), targetReached = new TreeSet<>();
        Map<String, Set<String>> runtimeReachedUnion = new TreeMap<>();
        germanSources.forEach(source -> runtimeReachedUnion.put(source, new TreeSet<>()));
        LearnerService beforePublic = org.mockito.Mockito.spy(before.service), afterPublic = org.mockito.Mockito.spy(after.service);
        String probeId = "unsaved-german-batch-native-control";
        long rolePairs = 0, frontierPairs = 0, positiveControls = 0, negativeControls = 0, invalidRolePairs = 0;
        int completedScopes = 0, incompleteScopes = 0, incomplete409Responses = 0;
        for (var configuration : leftDiscovery.configurations().entrySet()) {
            String scope = configuration.getKey();
            List<PersonalizationPlan> plans = new ArrayList<>();
            for (NativeFixture fixture : List.of(before, after)) plans.add(CurriculumPersonalizationPlanner.plan(
                    ROOT, fixture.landscapes::getById,
                    (subject, settings) -> ReflectionTestUtils.invokeMethod(fixture.service, "resolvePersonalizationOfferingScope", subject, settings),
                    configuration.getValue()));
            assertThat(plans.get(1)).as("actual personal-curriculum validity: %s", scope).isEqualTo(plans.get(0));
            if (!plans.get(0).valid() || plans.get(0).required()) {
                assertThat(leftDiscovery.plannerScopes()).doesNotContain(scope);
                assertThat(rightDiscovery.plannerScopes()).doesNotContain(scope);
                for (LearnerService service : List.of(beforePublic, afterPublic)) {
                    var learner = new Learner();
                    learner.setSelectedCurriculum(ROOT);
                    learner.setPersonalCurriculum(MAPPER.writeValueAsString(configuration.getValue()));
                    org.mockito.Mockito.doReturn(learner).when(service).getLearner(probeId);
                    try {
                        service.getPlanningScope(probeId, GERMAN);
                        throw new AssertionError("Incomplete personal curriculum unexpectedly accepted: " + scope);
                    } catch (org.springframework.web.server.ResponseStatusException expected) {
                        assertThat(expected.getStatusCode().value()).isEqualTo(409);
                        assertThat(expected.getReason()).isEqualTo("The learner's personal curriculum is incomplete.");
                        incomplete409Responses++;
                    }
                }
                incompleteScopes++;
                continue;
            }
            completedScopes++;
            NativeScope left = before.resolve(configuration.getValue()), right = after.resolve(rightDiscovery.configurations().get(scope));
            assertThat(right.roles()).as("final-current actual roles: %s", scope).isEqualTo(left.roles());
            assertThat(right.graph().keySet()).as("final-current native graph: %s", scope).isEqualTo(left.graph().keySet());
            assertThat(right.context()).as("final-current compiler context: %s", scope).isEqualTo(left.context());
            assertThat(projectedApplicability(right)).as("final-current projected applicability: %s", scope).isEqualTo(projectedApplicability(left));
            Set<String> probes = new TreeSet<>(left.context());
            probes.retainAll(before.canonicalAtomicIds);
            probes.addAll(left.roles().atomicTargets());
            Object leftMastered = fullMasteryPrerequisites(left.graph(), left.topology());
            Object rightMastered = fullMasteryPrerequisites(right.graph(), right.topology());
            for (String id : probes) {
                assertThat(right.topology().transitivePrerequisites(id)).as("final-current full atomic demand %s: %s", id, scope)
                        .isEqualTo(left.topology().transitivePrerequisites(id));
                assertThat(roleProbeWithPrerequisites(after.service, right.graph(), right.projection(), id, rightMastered))
                        .as("final-current effective role validity %s: %s", id, scope)
                        .isEqualTo(roleProbeWithPrerequisites(before.service, left.graph(), left.projection(), id, leftMastered));
                rolePairs++;
            }
            for (String source : germanSources) {
                assertThat(right.context().contains(source)).as("separate source-context reach %s: %s", source, scope)
                        .isEqualTo(left.context().contains(source));
                if (left.context().contains(source)) contextReached.add(source);
                boolean target = left.roles().atomicTargets().contains(source);
                assertThat(right.roles().atomicTargets().contains(source)).as("actual atomic target exposure %s: %s", source, scope).isEqualTo(target);
                if (!target) continue;
                targetReached.add(source);
                runtimeReachedUnion.get(source).add(scope);
                boolean roleValid = roleProbeWithPrerequisites(before.service, left.graph(), left.projection(), source, leftMastered);
                Map<String, Double> mastered = new TreeMap<>();
                left.graph().keySet().forEach(id -> mastered.put(id, 1.0));
                Set<String> demand = left.topology().transitivePrerequisites(source);
                if (roleValid) assertThat(demand).as("meaningful positive German prerequisite control %s: %s", source, scope).isNotEmpty();
                Map<String, Double> missing = new TreeMap<>(mastered);
                if (roleValid) missing.remove(demand.stream().sorted().findFirst().orElseThrow());
                List<AtomicFrontierCase> cases = List.of(
                        new AtomicFrontierCase("batch-normal-empty", Map.of(), null, false, null),
                        new AtomicFrontierCase("batch-normal-mastered", mastered, null, false, roleValid),
                        new AtomicFrontierCase("batch-strict-mastered", mastered, null, true, roleValid),
                        new AtomicFrontierCase("batch-strict-missing-one", missing, null, true, null),
                        new AtomicFrontierCase("batch-strict-empty", Map.of(), null, true, false),
                        new AtomicFrontierCase("batch-normal-single-source-focus", Map.of(), Set.of(source), false, roleValid),
                        new AtomicFrontierCase("batch-strict-single-source-focus", Map.of(), Set.of(source), true, false));
                for (AtomicFrontierCase probe : cases) {
                    boolean original = atomicFrontierProbe(before.service, left, source, probe);
                    boolean finalCurrent = atomicFrontierProbe(after.service, right, source, probe);
                    assertThat(finalCurrent).as("final-current real frontier %s/%s: %s", source, probe.name(), scope).isEqualTo(original);
                    if (!roleValid) {
                        assertThat(original).as("invalid source roles fail closed %s/%s: %s", source, probe.name(), scope).isFalse();
                        invalidRolePairs++;
                    }
                    if (probe.expected() != null) assertThat(original).as("actual frontier control %s/%s: %s", source, probe.name(), scope)
                            .isEqualTo(probe.expected());
                    if (roleValid && "batch-strict-mastered".equals(probe.name()) && original) positiveControls++;
                    if (roleValid && "batch-strict-empty".equals(probe.name()) && !original) negativeControls++;
                    frontierPairs++;
                }
            }
        }
        assertThat(completedScopes + incompleteScopes).as("all discovered configurations are classified").isEqualTo(99);
        assertThat(incompleteScopes).as("GUI-only incomplete personal curricula are separate negative controls").isEqualTo(55);
        assertThat(incomplete409Responses).as("paired actual planning-API 409 controls").isEqualTo(2 * incompleteScopes);
        assertThat(contextReached).as("context reach is recorded separately from positive target exposure").containsAll(targetReached);
        assertThat(targetReached).as("all 18 sources require actual target exposure under completed personal curricula")
                .containsExactlyInAnyOrderElementsOf(germanSources);
        runtimeReachedUnion.forEach((source, scopes) -> assertThat(scopes).as("actual runtime target scopes of %s", source).isNotEmpty());
        assertThat(runtimeReachedUnion.get("de86a077-6c71-56d7-92da-9d8e376fb110"))
                .as("previously aborted source must reach all four real HE profiles")
                .containsAll(Set.of("DE-HE/SekII/G8/GK", "DE-HE/SekII/G9/GK", "DE-HE/SekII/G8/GK+LK", "DE-HE/SekII/G9/GK+LK"));
        assertThat(rolePairs).isPositive();
        assertThat(frontierPairs).isPositive();
        assertThat(positiveControls).isPositive();
        assertThat(negativeControls).isPositive();
        before.verifyOnlyUnsavedFixtures();
        after.verifyOnlyUnsavedFixtures();
        for (var source : sourceBytes.entrySet()) assertThat(Files.readAllBytes(source.getKey())).isEqualTo(source.getValue());
        assertThat(Files.readAllBytes(REDUCTION_REGISTRY)).isEqualTo(registryBytes);
        System.out.printf("GERMAN_BATCH_FINAL_V6_NATIVE_COVERAGE baseline=exact-V5-prefix current=actual-final-V6 prefixSources=%d registeredSources=%d germanBatchSources=%d newGermanSources=17 discoveredConfigurations=99 completedScopes=%d incompleteScopes=%d incomplete409Responses=%d contextReached=%s runtimeReachedUnion=%s rolePairs=%d frontierPairs=%d positiveControls=%d negativeControls=%d invalidRolePairs=%d publicPositiveFrontierListCoverage=false nodeProofCoverage=false%n",
                prefix.changedSources().size(), current.changedSources().size(), germanSources.size(), completedScopes, incompleteScopes,
                incomplete409Responses, contextReached, runtimeReachedUnion, rolePairs, frontierPairs, positiveControls, negativeControls, invalidRolePairs);
    }

    private record Roles(Set<String> targets, Set<String> atomicTargets, Set<String> support, Set<String> viewIds) { }
    private record NativeScope(Learner learner, Object projection, Object frontier, Roles roles,
            Map<String, LearningGoal> graph, Set<String> context, CompletionProfileCompiler.PrerequisiteTopology topology) { }
    private record CanonicalProbe(Map<String, LearningGoal> graph, Set<String> context,
            CompletionProfileCompiler.PrerequisiteTopology topology, Object projection) { }

    /** Explicit test-role fixture, independent of GUI enrollment and its authored atomic macros. */
    private static CanonicalProbe canonicalProbe(NativeFixture fixture, Set<String> atoms) throws Exception {
        var graph = new CompletionCanonicalGraphResolver(fixture.landscapes, fixture.mapper)
                .loadForTargets(ROOT, atoms, Map.of());
        var compiler = new CompletionProfileCompiler();
        var topology = compiler.normalizePrerequisites(graph);
        topology.validateContext(atoms);
        var compiled = compiler.compileAutomatic(graph, atoms, atoms, "registered-canonical-atomic-probe");
        Set<String> support = new TreeSet<>();
        atoms.forEach(atom -> support.addAll(topology.transitiveGoalPrerequisites(atom)));
        support.removeAll(atoms);
        Map<String, LearningGoal> visible = new TreeMap<>();
        atoms.forEach(atom -> visible.put(atom, graph.get(atom)));
        var type = Class.forName("com.skillpilot.backend.service.LearnerService$GoalProjection");
        var constructor = type.getDeclaredConstructor(Map.class, Set.class, Set.class, Map.class, Set.class, List.class, boolean.class);
        constructor.setAccessible(true);
        Object projection = constructor.newInstance(visible, atoms, support, graph, Set.of(), List.copyOf(atoms), true);
        return new CanonicalProbe(graph, compiled.contextGoalIds(), topology, projection);
    }
    private record Discovery(Map<String, Map<String, Map<String, Object>>> configurations,
            Set<String> plannerScopes, Set<String> guiScopes, Map<String, PersonalizationPlan> offeredPlans) { }

    private static final class NativeFixture {
        final ObjectMapper mapper;
        final LandscapeService landscapes;
        final LearnerService service;
        final Map<String, LearningGoal> canonicalGoals;
        final Set<String> canonicalAtomicIds;
        final Map<String, Set<String>> atomicProbesBySource;
        final LearnerRepository learners = mock(LearnerRepository.class);
        final LearnerClientStateRepository clients = mock(LearnerClientStateRepository.class);
        final MasteryRepository mastery = mock(MasteryRepository.class);
        final PlannedGoalRepository plans = mock(PlannedGoalRepository.class);
        final ApplicationEventPublisher events = mock(ApplicationEventPublisher.class);

        NativeFixture(ReductionRegistry registry, boolean originalBaseline) {
            // Only the baseline's registered raw requires arrays are overlaid.
            mapper = new ObjectMapper(new RegistryBaselineJsonFactory(registry, originalBaseline));
            var properties = new LandscapeProperties();
            properties.setDirectory(REPOSITORY.resolve("curricula").toString());
            landscapes = new LandscapeService(properties, mapper);
            landscapes.pinRuntimeGeneration();
            var canonical = new CompletionCanonicalGraphResolver(landscapes, mapper).load(ROOT);
            canonicalGoals = Collections.unmodifiableMap(canonical);
            assertThat(CompletionProfileCompiler.isOrientation(canonical.get(REMOVED))).isTrue();
            Set<String> atomicIds = new TreeSet<>();
            canonical.forEach((id, goal) -> {
                if (goal.getContains().isEmpty()) atomicIds.add(id);
            });
            canonicalAtomicIds = Collections.unmodifiableSet(atomicIds);
            if (!registry.clusterTargetSourceIds().isEmpty()) {
                assertThat(canonicalAtomicDescendants(GERMAN_CLUSTER, canonical)).as("complete canonical German cluster leaf set")
                        .containsExactlyInAnyOrderElementsOf(GERMAN_LEAVES);
                assertThat(canonical.get(GERMAN_ATOM).getType()).isEqualTo("atomic");
                assertThat(canonical.get(GERMAN_ATOM).getContains()).isEmpty();
                assertThat(canonical.get(GERMAN_CLUSTER).getType()).isEqualTo("cluster");
                assertThat(canonical.get(GERMAN_CLUSTER).getContains()).isNotEmpty();
            }
            Map<String, Set<String>> probes = new TreeMap<>();
            for (ChangedSource changed : registry.changedSources().values()) {
                LearningGoal source = canonical.get(changed.goalId());
                assertThat(source).as("native overlay source %s", changed.goalId()).isNotNull();
                assertThat(source.getRequires()).as("native %s raw overlay for %s",
                        originalBaseline ? "original" : "current", changed.goalId())
                        .containsExactlyElementsOf(originalBaseline ? changed.originalRequires() : changed.currentRequires());
                assertThat(canonicalAtomicIds.contains(changed.goalId()))
                        .as("unfiltered source classification %s", changed.goalId()).isEqualTo(changed.atomicSource());
                probes.put(changed.goalId(), canonicalAtomicDescendants(changed.goalId(), canonical));
            }
            atomicProbesBySource = Collections.unmodifiableMap(probes);
            for (ClusterWitnessCoverage coverage : registry.clusterWitnessCoverage()) {
                assertThat(coverage.atomicSourceIds())
                        .as("complete canonical atomic witness coverage for %s", coverage.sourceId())
                        .containsExactlyInAnyOrderElementsOf(atomicProbesBySource.get(coverage.sourceId()));
            }
            Set<String> followupAtoms = new TreeSet<>();
            registry.changedSources().values().stream()
                    .filter(changed -> registry.historicalSourceIds().contains(changed.goalId()))
                    .filter(changed -> !changed.atomicSource() && !LATIN_CLUSTER.equals(changed.goalId()))
                    .forEach(changed -> followupAtoms.addAll(atomicProbesBySource.get(changed.goalId())));
            assertThat(followupAtoms).as("canonical atomic descendants of all twelve follow-up cluster sources")
                    .hasSize(70);
            if (!registry.suffixSourceIds().isEmpty()) {
                Set<String> mathAtoms = new TreeSet<>();
                for (String exam : MATH_EXAMS) mathAtoms.addAll(atomicProbesBySource.get(exam));
                assertThat(atomicProbesBySource.get("464a6024-a2f8-53b4-84e0-d7b9df22a0b1")).hasSize(14);
                assertThat(atomicProbesBySource.get("9ad83149-3cb7-5b87-a617-3eae3715a50c")).hasSize(13);
                assertThat(mathAtoms).as("complete separate Math exam descendant basis").hasSize(27);
                assertThat(mathAtoms).containsExactlyInAnyOrderElementsOf(registry.suffixSourceIds().stream()
                        .filter(id -> registry.changedSources().get(id).atomicSource()).toList());
            }
            assertThat(atomicProbesBySource.get(LATIN_CLUSTER)).containsExactly(LATIN_ATOM);
            assertThat(canonical.get(LATIN_ATOM).getRequires()).contains(LATIN_BRIDGE);
            assertThat(canonical.get(LATIN_BRIDGE).getRequires()).contains(LATIN_ORIENTATION);
            Map<String, List<String>> contains = new TreeMap<>();
            canonical.forEach((id, goal) -> contains.put(id, goal.getContains()));
            service = new LearnerService(learners, clients, mastery, plans, landscapes,
                    new GoalMappingService(properties, mapper), mock(DeckResourceService.class), mapper, events);
            ReflectionTestUtils.setField(service, "compositionViewService", new CompositionViewService(properties, mapper, () -> contains));
            var catalog = mock(CompletionProfileCatalog.class);
            when(catalog.automatic()).thenReturn(true);
            when(catalog.available()).thenReturn(true);
            ReflectionTestUtils.setField(service, "completionApplicationService", new CompletionApplicationService(catalog));
        }

        NativeScope resolve(Map<String, Map<String, Object>> config) throws Exception {
            String personalCurriculum = mapper.writeValueAsString(config);
            var learner = new Learner();
            learner.setSelectedCurriculum(ROOT);
            learner.setPersonalCurriculum(personalCurriculum);
            Object projection = ReflectionTestUtils.invokeMethod(service, "getGoalProjection", ROOT, personalCurriculum, false);
            Set<String> atomic = ReflectionTestUtils.invokeMethod(service, "automaticCompletionTargets", "automatic:personal-curriculum", projection);
            Set<String> targets = ReflectionTestUtils.invokeMethod(projection, "targetGoalIds");
            Set<String> support = ReflectionTestUtils.invokeMethod(projection, "prerequisiteOnlyGoalIds");
            Set<String> views = ReflectionTestUtils.invokeMethod(projection, "compositionViewIds");
            Map<String, LearningGoal> graph = ReflectionTestUtils.invokeMethod(service, "completionGraph", learner, projection);
            var compiler = new CompletionProfileCompiler();
            Object frontier = ReflectionTestUtils.invokeMethod(service, "frontierPrerequisites", learner, projection, Map.of(), null);
            CompletionProfileCompiler.PrerequisiteTopology topology = ReflectionTestUtils.invokeMethod(frontier, "topology");
            assertThat(topology).as("actual runtime prerequisite topology: %s", personalCurriculum).isNotNull();
            topology.validateContext(atomic);
            var compiled = compiler.compileAutomatic(graph, atomic, targets, "first-math-edge-regression");
            return new NativeScope(learner, projection, frontier, new Roles(targets, atomic, support, views), graph, compiled.contextGoalIds(), topology);
        }

        void verifyOnlyUnsavedFixtures() {
            // Native option application invokes persistence, intercepted exclusively by this mock.
            verify(learners, atLeastOnce()).save(argThat(learner -> learner.getSkillpilotId() == null));
            verifyNoMoreInteractions(learners);
            verifyNoInteractions(clients, mastery, plans);
        }
    }

    private record ChangedSource(String owner, String goalId, List<String> originalRequires,
            List<String> currentRequires, List<String> canonicalContains, boolean atomicSource,
            boolean originalRequiresPresent, boolean currentRequiresPresent) {
        ChangedSource withOriginalPresence(boolean present) {
            return new ChangedSource(owner, goalId, originalRequires, currentRequires, canonicalContains,
                    atomicSource, present, currentRequiresPresent);
        }
    }
    private record DocumentDigests(String original, String current) { }
    private record ClusterWitnessCoverage(String sourceId, String prerequisiteId, Set<String> atomicSourceIds) { }
    private record ReductionRegistry(Map<Path, String> canonicalOwners,
            Map<Path, List<ChangedSource>> changesByFile, Map<String, ChangedSource> changedSources,
            List<ClusterWitnessCoverage> clusterWitnessCoverage, Map<Path, DocumentDigests> documentDigests,
            Set<String> historicalSourceIds, Set<String> suffixSourceIds, Set<String> tailSourceIds,
            Set<String> clusterTargetSourceIds,
            Map<String, Set<String>> tailRemovedPrerequisites, Map<Path, JsonNode> currentDocuments,
            Set<String> batchSourceIds) { }

    private static ReductionRegistry readReductionRegistry() throws IOException {
        return readReductionRegistry(MAPPER.readTree(REDUCTION_REGISTRY.toFile()));
    }

    private static ReductionRegistry readReductionRegistry(JsonNode registry) throws IOException {
        if (V6.equals(registry.path("proofContract").asText())) {
            System.out.println("REGISTERED_NATIVE_FRAME active=V6 tested=exact-reconstructed-V5-prefix finalV6Coverage=false");
            return readBatchedReductionRegistry(registry).legacy();
        }
        return readReductionRegistry(registry, Map.of());
    }

    private static ReductionRegistry readReductionRegistry(JsonNode registry, Map<Path, JsonNode> documents) throws IOException {
        assertThat(registry.path("schemaVersion").asInt()).isEqualTo(1);
        assertThat(registry.path("proofContract").asText()).isIn(V2, V3, V4, V5);
        boolean clusterTargetNormalization = V5.equals(registry.path("proofContract").asText());
        boolean continued = clusterTargetNormalization || V4.equals(registry.path("proofContract").asText());
        boolean ordered = continued || V3.equals(registry.path("proofContract").asText());
        assertThat(registry.path("auditScope").asText()).isEqualTo("origin-source-landscape-closure");
        assertThat(registry.path("catalogSources").isArray()).isTrue();
        assertThat(registry.path("originalRequires").isArray() && !registry.path("originalRequires").isEmpty()).isTrue();
        assertThat(registry.path("originalRequires").get(0).path("source").asText()).isEqualTo(MATH + ":" + SOURCE);

        Map<Path, String> canonicalOwners = new LinkedHashMap<>();
        Map<Path, DocumentDigests> documentDigests = new LinkedHashMap<>();
        Map<String, Path> ownerFiles = new LinkedHashMap<>();
        Map<String, Map<String, JsonNode>> goalsByOwner = new LinkedHashMap<>();
        for (JsonNode source : registry.path("catalogSources")) {
            String owner = source.path("landscapeId").asText();
            String relative = source.path("path").asText();
            assertThat(owner).isNotBlank();
            assertThat(relative).startsWith("curricula/DE/Gymnasium/canonical/");
            Path file = REPOSITORY.resolve(relative).toAbsolutePath().normalize();
            assertThat(file.startsWith(REPOSITORY)).isTrue();
            assertThat(canonicalOwners.putIfAbsent(file, owner)).as("unique canonical registry path: %s", file).isNull();
            assertThat(ownerFiles.putIfAbsent(owner, file)).as("unique canonical registry owner: %s", owner).isNull();
            JsonNode canonical = readFrameDocument(file, documents);
            assertThat(canonical.path("landscapeId").asText()).isEqualTo(owner);
            DocumentDigests digests = new DocumentDigests(source.path("baselineDocumentDigest").asText(),
                    source.path("currentDocumentDigest").asText());
            assertRawDocumentDigest(canonical, digests.current(), "current raw document " + relative);
            documentDigests.put(file, digests);
            goalsByOwner.put(owner, rawGoals(canonical));
        }
        assertThat(canonicalOwners).hasSize(21);
        assertHistoricalBindings(registry, ordered, continued, clusterTargetNormalization);
        assertThat(canonicalOwners).containsKeys(MATH_SOURCE, BIOLOGY_SOURCE, LATIN_SOURCE, GERMAN_SOURCE);
        assertThat(registry.path("removals").isArray()).isTrue();
        assertThat(registry.path("removals")).as("retained historical operation count").hasSize(204);
        assertThat(registry.path("originalRequires")).as("retained historical raw overlay count").hasSize(200);
        int legacyRemovals = 0, clusterRemovals = 0;
        Set<String> clusterSourceIds = new TreeSet<>();
        List<ClusterWitnessCoverage> clusterWitnessCoverage = new ArrayList<>();
        for (JsonNode removal : registry.path("removals")) {
            String qualifiedSource = removal.path("source").asText();
            String prerequisite = removal.path("prerequisite").asText();
            JsonNode sourceGoal = registeredGoal(goalsByOwner, qualifiedSource);
            assertAtomicWitness(registeredGoal(goalsByOwner, prerequisite), prerequisite);
            if (!removal.has("atomicWitnesses")) {
                assertAtomicWitness(sourceGoal, qualifiedSource);
                assertThat(removal.path("witness").isArray()).isTrue();
                legacyRemovals++;
                continue;
            }
            clusterRemovals++;
            String sourceId = qualifiedIdentity(qualifiedSource)[1];
            clusterSourceIds.add(sourceId);
            assertThat(sourceGoal.path("type").asText()).isEqualTo("cluster");
            assertThat(sourceGoal.path("contains").isArray() && !sourceGoal.path("contains").isEmpty()).isTrue();
            assertThat(removal.has("witness")).isFalse();
            assertThat(removal.path("atomicWitnesses").isArray()).isTrue();
            assertThat(removal.path("atomicWitnesses")).isNotEmpty();
            Set<String> witnessStarts = new TreeSet<>();
            for (JsonNode rawWitness : removal.path("atomicWitnesses")) {
                List<String> witness = rawRequires(rawWitness, qualifiedSource);
                assertThat(witness).as("atomic descendant path for %s", qualifiedSource).hasSizeGreaterThanOrEqualTo(2);
                assertThat(witness.get(witness.size() - 1)).isEqualTo(prerequisite);
                for (String vertex : witness) assertAtomicWitness(registeredGoal(goalsByOwner, vertex), vertex);
                assertThat(witnessStarts.add(qualifiedIdentity(witness.get(0))[1]))
                        .as("exactly one witness per canonical atomic descendant of %s", qualifiedSource).isTrue();
            }
            clusterWitnessCoverage.add(new ClusterWitnessCoverage(sourceId, qualifiedIdentity(prerequisite)[1], Collections.unmodifiableSet(witnessStarts)));
            if (LATIN_CLUSTER.equals(sourceId)) {
                assertThat(qualifiedSource).isEqualTo(LATIN + ":" + LATIN_CLUSTER);
                assertThat(prerequisite).isEqualTo(LATIN + ":" + LATIN_ORIENTATION);
                assertThat(removal.path("atomicWitnesses")).hasSize(1);
                assertThat(rawRequires(removal.path("atomicWitnesses").get(0), LATIN_CLUSTER))
                        .containsExactly(LATIN + ":" + LATIN_ATOM, LATIN + ":" + LATIN_BRIDGE,
                                LATIN + ":" + LATIN_ORIENTATION);
            }
        }
        assertThat(legacyRemovals).as("original Math and 186 Bio operations retained").isEqualTo(187);
        assertThat(clusterRemovals).as("Latin plus sixteen covered follow-up operations").isEqualTo(17);
        assertThat(clusterSourceIds).as("Latin plus twelve follow-up cluster sources").hasSize(13);

        Set<String> historicalSourceIds = new TreeSet<>(), suffixSourceIds = new TreeSet<>(), tailSourceIds = new TreeSet<>();
        Set<String> clusterTargetSourceIds = new TreeSet<>();
        Map<String, Set<String>> tailRemovedPrerequisites = new TreeMap<>();
        List<JsonNode> originals = new ArrayList<>();
        for (JsonNode original : registry.path("originalRequires")) {
            assertThat(historicalSourceIds.add(qualifiedIdentity(original.path("source").asText())[1])).isTrue();
            assertThat(original.path("requires").isArray()).isTrue();
            originals.add(original);
        }
        if (ordered) {
            assertThat(registry.path("suffix").isArray()).isTrue();
            assertThat(registry.path("suffix")).hasSize(29);
            Set<String> newAtoms = new TreeSet<>(), newClusters = new TreeSet<>();
            for (JsonNode step : registry.path("suffix")) {
                String source = step.path("source").asText(), id = qualifiedIdentity(source)[1];
                assertThat(qualifiedIdentity(source)[0]).isEqualTo(MATH);
                assertThat(step.path("prerequisite").asText()).isEqualTo(MATH + ":" + REMOVED);
                assertThat(suffixSourceIds.add(id)).as("one actual Math suffix step per source").isTrue();
                assertThat(historicalSourceIds).doesNotContain(id);
                JsonNode goal = registeredGoal(goalsByOwner, source);
                if ("materialize-atomic".equals(step.path("operation").asText())) {
                    assertAtomicWitness(goal, source);
                    assertThat(rawRequires(goal.path("requires"), source)).containsExactly(REMOVED);
                    newAtoms.add(id);
                } else {
                    assertThat(step.path("operation").asText()).isEqualTo("remove-cluster");
                    assertThat(goal.path("type").asText()).isEqualTo("cluster");
                    assertThat(rawRequires(goal.path("requires"), source)).isEmpty();
                    Set<String> witnesses = new TreeSet<>();
                    for (JsonNode witness : step.path("atomicWitnesses")) {
                        List<String> path = rawRequires(witness, source);
                        assertThat(path).hasSize(2);
                        assertThat(path.get(1)).isEqualTo(MATH + ":" + REMOVED);
                        assertAtomicWitness(registeredGoal(goalsByOwner, path.get(0)), path.get(0));
                        assertThat(witnesses.add(qualifiedIdentity(path.get(0))[1])).isTrue();
                    }
                    assertThat(witnesses).isNotEmpty();
                    clusterWitnessCoverage.add(new ClusterWitnessCoverage(id, REMOVED, Set.copyOf(witnesses)));
                    clusterSourceIds.add(id);
                    newClusters.add(id);
                }
            }
            assertThat(newAtoms).hasSize(27);
            assertThat(newClusters).containsExactlyInAnyOrderElementsOf(MATH_EXAMS);
            assertThat(registry.path("suffixOriginalRequires").isArray()).isTrue();
            Set<String> overlaid = new TreeSet<>();
            for (JsonNode original : registry.path("suffixOriginalRequires")) {
                String source = original.path("source").asText(), id = qualifiedIdentity(source)[1];
                assertThat(qualifiedIdentity(source)[0]).isEqualTo(MATH);
                assertThat(suffixSourceIds).contains(id);
                assertThat(overlaid.add(id)).as("unique suffix original overlay: %s", id).isTrue();
                assertThat(original.has("requires")).isTrue();
                assertThat(original.path("requires").isNull() || original.path("requires").isArray()).isTrue();
                if (newAtoms.contains(id)) {
                    assertThat(original.path("requires").isArray()).as("actual new Math atom has a present empty before-array").isTrue();
                    assertThat(original.path("requires")).isEmpty();
                } else assertThat(rawRequires(original.path("requires"), source)).containsExactly(REMOVED);
                originals.add(original);
            }
            assertThat(overlaid).containsExactlyInAnyOrderElementsOf(suffixSourceIds);
        }
        if (continued) {
            assertThat(registry.path("tailOriginalRequires").isArray()).isTrue();
            assertThat(registry.path("tailOriginalRequires")).as("one true original snapshot for each disjoint tail source").hasSize(490);
            for (JsonNode original : registry.path("tailOriginalRequires")) {
                String source = original.path("source").asText(), id = qualifiedIdentity(source)[1];
                assertThat(qualifiedIdentity(source)[0]).isEqualTo(MATH);
                assertThat(historicalSourceIds).doesNotContain(id);
                assertThat(suffixSourceIds).doesNotContain(id);
                assertThat(tailSourceIds.add(id)).as("unique disjoint tail original source %s", id).isTrue();
                assertAtomicWitness(registeredGoal(goalsByOwner, source), source);
                assertThat(original.has("requires")).isTrue();
                assertThat(original.path("requires").isNull() || original.path("requires").isArray()).isTrue();
                originals.add(original);
            }
            assertThat(registry.path("atomicRemovals").isArray()).isTrue();
            assertThat(registry.path("atomicRemovals")).as("separate atomic reduction tail operation count").hasSize(922);
            for (JsonNode removal : registry.path("atomicRemovals")) {
                String source = removal.path("source").asText(), prerequisite = removal.path("prerequisite").asText();
                String id = qualifiedIdentity(source)[1];
                assertThat(qualifiedIdentity(source)[0]).isEqualTo(MATH);
                assertThat(qualifiedIdentity(prerequisite)[0]).isEqualTo(MATH);
                assertThat(tailSourceIds).contains(id);
                assertAtomicWitness(registeredGoal(goalsByOwner, source), source);
                assertAtomicWitness(registeredGoal(goalsByOwner, prerequisite), prerequisite);
                assertThat(removal.has("atomicWitnesses")).isFalse();
                List<String> witness = rawRequires(removal.path("witness"), source);
                assertThat(witness).hasSizeGreaterThanOrEqualTo(3);
                assertThat(witness.getFirst()).isEqualTo(source);
                assertThat(witness.getLast()).isEqualTo(prerequisite);
                for (String vertex : witness) assertAtomicWitness(registeredGoal(goalsByOwner, vertex), vertex);
                assertThat(tailRemovedPrerequisites.computeIfAbsent(id, ignored -> new TreeSet<>())
                        .add(qualifiedIdentity(prerequisite)[1])).as("unique tail source/prerequisite operation %s -> %s", source, prerequisite).isTrue();
            }
            assertThat(tailRemovedPrerequisites.keySet()).containsExactlyInAnyOrderElementsOf(tailSourceIds);
            assertThat(tailRemovedPrerequisites.values().stream().mapToInt(Set::size).sum()).isEqualTo(922);
            assertThat(registry.path("witnessContinuations")).hasSize(1);
            JsonNode continuation = registry.path("witnessContinuations").get(0);
            assertThat(continuation.size()).isEqualTo(3);
            assertThat(continuation.path("historicalRemovalIndex").isIntegralNumber()).isTrue();
            assertThat(continuation.path("edgeIndex").isIntegralNumber()).isTrue();
            assertThat(continuation.path("tailRemovalIndex").isIntegralNumber()).isTrue();
            assertThat(continuation.path("historicalRemovalIndex").asInt()).isZero();
            assertThat(continuation.path("edgeIndex").asInt()).isEqualTo(1);
            assertThat(continuation.path("tailRemovalIndex").asInt()).isEqualTo(608);
            JsonNode replacement = registry.path("atomicRemovals").get(608);
            assertThat(replacement.path("source").asText()).isEqualTo(MATH + ":" + RETAINED);
            assertThat(replacement.path("prerequisite").asText()).isEqualTo(MATH + ":" + REMOVED);
            assertThat(rawRequires(replacement.path("witness"), RETAINED))
                    .containsExactly(MATH + ":" + RETAINED, MATH + ":" + CONTINUED_BRIDGE, MATH + ":" + REMOVED);
        }
        if (clusterTargetNormalization) {
            assertThat(registry.path("clusterTargetOriginalRequires").isArray()).isTrue();
            assertThat(registry.path("clusterTargetOriginalRequires")).hasSize(1);
            JsonNode original = registry.path("clusterTargetOriginalRequires").get(0);
            String source = GERMAN + ":" + GERMAN_ATOM;
            assertThat(original.size()).isEqualTo(2);
            assertThat(original.path("source").asText()).isEqualTo(source);
            assertThat(rawRequires(original.path("requires"), source)).containsExactly(GERMAN_CLUSTER, GERMAN_OTHER);
            assertThat(historicalSourceIds).doesNotContain(GERMAN_ATOM);
            assertThat(suffixSourceIds).doesNotContain(GERMAN_ATOM);
            assertThat(tailSourceIds).doesNotContain(GERMAN_ATOM);
            assertAtomicWitness(registeredGoal(goalsByOwner, source), source);
            JsonNode cluster = registeredGoal(goalsByOwner, GERMAN + ":" + GERMAN_CLUSTER);
            assertThat(cluster.path("type").asText()).isEqualTo("cluster");
            assertThat(cluster.path("contains")).isNotEmpty();
            assertThat(registry.path("clusterTargetSuffix").isArray()).isTrue();
            assertThat(registry.path("clusterTargetSuffix")).hasSize(11);
            List<String> replay = new ArrayList<>(List.of(GERMAN_CLUSTER, GERMAN_OTHER));
            for (int index = 0; index < 11; index++) {
                JsonNode step = registry.path("clusterTargetSuffix").get(index);
                assertThat(step.path("source").asText()).isEqualTo(source);
                if (index < 10) {
                    assertThat(step.size()).as("bounded V5 materialization fields: %d", index).isEqualTo(4);
                    String leaf = GERMAN_LEAVES.get(index);
                    assertThat(step.path("operation").asText()).isEqualTo("materialize-atomic");
                    assertThat(step.path("prerequisite").asText()).isEqualTo(GERMAN + ":" + leaf);
                    JsonNode origin = step.path("origin");
                    assertThat(origin.isObject()).isTrue();
                    assertThat(origin.size()).as("bounded V5 origin fields: %d", index).isEqualTo(4);
                    assertThat(origin.path("source").asText()).isEqualTo(source);
                    assertThat(origin.path("prerequisite").asText()).isEqualTo(GERMAN_CLUSTER);
                    assertThat(rawRequires(origin.path("sourceContainsPath"), source)).containsExactly(source);
                    List<String> prerequisitePath = rawRequires(origin.path("prerequisiteContainsPath"), source);
                    assertThat(prerequisitePath).hasSize(3);
                    assertThat(prerequisitePath.getFirst()).isEqualTo(GERMAN + ":" + GERMAN_CLUSTER);
                    assertThat(prerequisitePath.getLast()).isEqualTo(GERMAN + ":" + leaf);
                    for (int pathIndex = 0; pathIndex + 1 < prerequisitePath.size(); pathIndex++) {
                        String parent = prerequisitePath.get(pathIndex), child = prerequisitePath.get(pathIndex + 1);
                        assertThat(qualifiedIdentity(parent)[0]).isEqualTo(GERMAN);
                        assertThat(qualifiedIdentity(child)[0]).isEqualTo(GERMAN);
                        assertThat(rawRequires(registeredGoal(goalsByOwner, parent).path("contains"), parent))
                                .as("literal V5 prerequisite contains edge %s -> %s", parent, child)
                                .contains(qualifiedIdentity(child)[1]);
                    }
                    assertAtomicWitness(registeredGoal(goalsByOwner, GERMAN + ":" + leaf), leaf);
                    assertThat(replay).doesNotContain(leaf);
                    replay.add(leaf);
                } else {
                    assertThat(step.size()).as("bounded V5 final removal fields").isEqualTo(3);
                    assertThat(replay).hasSize(12).contains(GERMAN_CLUSTER);
                    assertThat(step.path("operation").asText()).isEqualTo("remove-cluster-target");
                    assertThat(step.path("prerequisite").asText()).isEqualTo(GERMAN + ":" + GERMAN_CLUSTER);
                    assertThat(replay.remove(GERMAN_CLUSTER)).isTrue();
                }
            }
            assertThat(rawRequires(registeredGoal(goalsByOwner, source).path("requires"), source))
                    .as("exact ordered 2-to-11 German raw rewrite").containsExactlyElementsOf(replay);
            assertThat(replay).hasSize(11).doesNotContain(GERMAN_CLUSTER);
            // Inventory every canonical owner, including qualified references.
            // With no incoming raw edge the source is the only possible changed
            // pre-expansion closure; all other closure assertions stay strict.
            List<String> incoming = new ArrayList<>();
            goalsByOwner.forEach((owner, goals) -> goals.forEach((id, goal) -> {
                if (!goal.has("requires")) return;
                for (String prerequisite : rawRequires(goal.path("requires"), owner + ":" + id)) {
                    if (GERMAN_ATOM.equals(prerequisite) || prerequisite.endsWith(":" + GERMAN_ATOM)) incoming.add(owner + ":" + id);
                }
            }));
            assertThat(incoming).as("all 21 canonical owners: exact incoming raw prerequisite inventory of German source").isEmpty();
            clusterTargetSourceIds.add(GERMAN_ATOM);
            originals.add(original);
        }
        Map<Path, List<ChangedSource>> changesByFile = new LinkedHashMap<>();
        Map<String, ChangedSource> changedSources = new LinkedHashMap<>();
        for (JsonNode original : originals) {
            String qualifiedSource = original.path("source").asText();
            String[] identity = qualifiedIdentity(qualifiedSource);
            String owner = identity[0], id = identity[1];
            assertThat(ownerFiles).as("registered source owner: %s", qualifiedSource).containsKey(owner);
            JsonNode goal = goalsByOwner.get(owner).get(id);
            assertThat(goal).as("registered native source %s", qualifiedSource).isNotNull();
            List<String> canonicalContains = rawRequires(goal.path("contains"), qualifiedSource);
            boolean atomicSource = canonicalContains.isEmpty();
            if (atomicSource) {
                assertAtomicWitness(goal, qualifiedSource);
                assertThat(clusterSourceIds).doesNotContain(id);
            } else {
                assertThat(clusterSourceIds).as("registered covered-cluster source %s", qualifiedSource).contains(id);
                assertThat(goal.path("type").asText()).isEqualTo("cluster");
            }
            boolean beforePresent = !original.path("requires").isNull(), afterPresent = goal.has("requires");
            List<String> before = beforePresent ? rawRequires(original.path("requires"), qualifiedSource) : List.of();
            List<String> after = afterPresent ? rawRequires(goal.path("requires"), qualifiedSource) : List.of();
            assertThat(after).as("registered source has an actual raw reduction: %s", qualifiedSource).isNotEqualTo(before);
            if (tailSourceIds.contains(id)) {
                assertThat(before).containsAll(tailRemovedPrerequisites.get(id));
                assertThat(after).as("literal tail deletions preserve all other original entries in order: %s", id)
                        .containsExactlyElementsOf(before.stream().filter(prerequisite -> !tailRemovedPrerequisites.get(id).contains(prerequisite)).toList());
            }
            ChangedSource changed = new ChangedSource(owner, id, before, after, canonicalContains, atomicSource,
                    beforePresent, afterPresent);
            assertThat(changedSources.putIfAbsent(id, changed)).as("unique registered canonical source: %s", id).isNull();
            changesByFile.computeIfAbsent(ownerFiles.get(owner), ignored -> new ArrayList<>()).add(changed);
        }
        ChangedSource firstMath = changedSources.get(SOURCE);
        assertThat(firstMath.owner()).isEqualTo(MATH);
        assertThat(firstMath.originalRequires()).containsExactlyElementsOf(BEFORE);
        assertThat(firstMath.currentRequires()).containsExactlyElementsOf(AFTER);
        Map<String, JsonNode> math = goalsByOwner.get(MATH);
        for (String id : List.of(SOURCE, RETAINED, REMOVED)) assertAtomicWitness(math.get(id), id);
        if (continued) {
            assertThat(changedSources.get(RETAINED).originalRequires()).as("historical before-only Math witness edge").contains(REMOVED);
            assertThat(rawRequires(math.get(RETAINED).path("requires"), RETAINED))
                    .as("certified final continuation first literal edge").contains(CONTINUED_BRIDGE).doesNotContain(REMOVED);
            assertAtomicWitness(math.get(CONTINUED_BRIDGE), CONTINUED_BRIDGE);
            assertThat(rawRequires(math.get(CONTINUED_BRIDGE).path("requires"), CONTINUED_BRIDGE))
                    .as("certified final continuation second literal edge").contains(REMOVED);
        } else assertThat(math.get(RETAINED).path("requires")).as("historical direct authored Math witness edge")
                .contains(MAPPER.getNodeFactory().textNode(REMOVED));
        ChangedSource latin = changedSources.get(LATIN_CLUSTER);
        assertThat(latin).as("registered Latin raw cluster overlay").isNotNull();
        assertThat(latin.atomicSource()).isFalse();
        assertThat(latin.originalRequires()).containsExactly(LATIN_ORIENTATION);
        assertThat(latin.currentRequires()).isEmpty();
        assertThat(changedSources.values().stream().filter(changed -> historicalSourceIds.contains(changed.goalId()))
                .filter(ChangedSource::atomicSource).count())
                .as("legacy native source checks remain atomic").isEqualTo(187);
        assertThat(changedSources.values().stream().filter(changed -> historicalSourceIds.contains(changed.goalId()))
                .filter(changed -> !changed.atomicSource()).count())
                .as("all thirteen registered covered-cluster sources").isEqualTo(13);
        assertThat(changedSources.keySet().stream().filter(id -> !tailSourceIds.contains(id) && !clusterTargetSourceIds.contains(id)).count())
                .as("historical plus V3 prefix source count stays separate").isEqualTo(ordered ? 229 : 200);
        assertThat(changedSources.values().stream().filter(changed -> !tailSourceIds.contains(changed.goalId()) && !clusterTargetSourceIds.contains(changed.goalId()))
                .filter(ChangedSource::atomicSource).count()).as("historical plus V3 prefix atomic count stays separate").isEqualTo(ordered ? 214 : 187);
        assertThat(changedSources).hasSize(clusterTargetNormalization ? 720 : continued ? 719 : ordered ? 229 : 200);
        assertThat(changedSources.values().stream().filter(ChangedSource::atomicSource).count()).isEqualTo(clusterTargetNormalization ? 705 : continued ? 704 : ordered ? 214 : 187);
        assertThat(changedSources.values().stream().filter(changed -> !changed.atomicSource()).count()).isEqualTo(ordered ? 15 : 13);

        Map<Path, List<ChangedSource>> immutableChanges = new LinkedHashMap<>();
        changesByFile.forEach((file, changes) -> immutableChanges.put(file, List.copyOf(changes)));
        ReductionRegistry result = new ReductionRegistry(Collections.unmodifiableMap(canonicalOwners),
                Collections.unmodifiableMap(immutableChanges), Collections.unmodifiableMap(changedSources),
                List.copyOf(clusterWitnessCoverage), Collections.unmodifiableMap(documentDigests),
                Set.copyOf(historicalSourceIds), Set.copyOf(suffixSourceIds), Set.copyOf(tailSourceIds),
                Set.copyOf(clusterTargetSourceIds),
                Collections.unmodifiableMap(tailRemovedPrerequisites), immutableDocuments(documents), Set.of());
        for (var entry : canonicalOwners.entrySet()) {
            reconstructRawDocument(entry.getKey(), readFrameDocument(entry.getKey(), documents), entry.getValue(),
                    documentDigests.get(entry.getKey()), immutableChanges.getOrDefault(entry.getKey(), List.of()), true);
        }
        return result;
    }

    /** Native reader boundary only: Node remains the sequential proof/auditor authority. */
    private record BatchNativeFrames(ReductionRegistry legacy, ReductionRegistry current) { }

    private static BatchNativeFrames readBatchedReductionRegistry(JsonNode registry) throws IOException {
        assertFields(registry, "V6 registry", "schemaVersion", "proofContract", "auditScope", "catalogSources",
                "originalRequires", "removals", "v2Checkpoint", "suffixOriginalRequires", "suffix", "v3Checkpoint",
                "tailOriginalRequires", "atomicRemovals", "witnessContinuations", "v4Checkpoint",
                "clusterTargetOriginalRequires", "clusterTargetSuffix", "v5Checkpoint", "batches");
        assertThat(registry.path("schemaVersion").isIntegralNumber()).isTrue();
        assertThat(registry.path("schemaVersion").asInt()).isEqualTo(1);
        assertThat(registry.path("proofContract").asText()).isEqualTo(V6);
        assertThat(registry.path("auditScope").asText()).isEqualTo("origin-source-landscape-closure");
        assertThat(registry.path("batches").isArray()).isTrue();
        assertThat(registry.path("batches")).isNotEmpty();
        assertFields(registry.path("v5Checkpoint"), "V5 checkpoint", "registryDigest", "currentDocumentDigests");
        Map<Path, JsonNode> finalDocuments = new LinkedHashMap<>();
        for (JsonNode source : registry.path("catalogSources")) {
            String relative = source.path("path").asText();
            assertThat(relative).startsWith("curricula/DE/Gymnasium/canonical/");
            Path file = REPOSITORY.resolve(relative).toAbsolutePath().normalize();
            assertThat(file.startsWith(REPOSITORY)).isTrue();
            assertThat(REPOSITORY.relativize(file).toString().replace(File.separatorChar, '/')).isEqualTo(relative);
            JsonNode document = MAPPER.readTree(file.toFile());
            assertThat(document.path("landscapeId").asText()).isEqualTo(source.path("landscapeId").asText());
            assertRawDocumentDigest(document, source.path("currentDocumentDigest").asText(), "V6 final document " + relative);
            assertThat(finalDocuments.putIfAbsent(file, document)).isNull();
        }
        assertThat(finalDocuments).hasSize(21);
        Map<Path, JsonNode> checkpointDocuments = mutableDocuments(finalDocuments);
        // Every batch snapshot is its own start frame, including overlap with
        // an earlier batch or the V1-V5 prefix; null restores field absence.
        for (int index = registry.path("batches").size() - 1; index >= 0; index--) {
            JsonNode batch = registry.path("batches").get(index);
            assertFields(batch, "V6 batch", "id", "previousDigest", "originalRequires", "operations",
                    "currentDocumentDigests", "legacyContinuations");
            assertFrameDigests(batch.path("currentDocumentDigests"), checkpointDocuments, "batch end " + index);
            assertThat(batch.path("originalRequires").isArray()).isTrue();
            Set<String> snapshots = new TreeSet<>();
            Map<String, Map<String, JsonNode>> goals = frameGoals(checkpointDocuments);
            for (JsonNode original : batch.path("originalRequires")) {
                assertFields(original, "batch original requires", "source", "requires");
                String source = original.path("source").asText();
                assertThat(snapshots.add(source)).as("one start snapshot per batch source %s", source).isTrue();
                ObjectNode goal = (ObjectNode) registeredGoal(goals, source);
                if (original.path("requires").isNull()) goal.remove("requires");
                else goal.set("requires", MAPPER.valueToTree(rawRequires(original.path("requires"), source)));
            }
            JsonNode startDigests = index == 0 ? registry.path("v5Checkpoint").path("currentDocumentDigests")
                    : registry.path("batches").get(index - 1).path("currentDocumentDigests");
            assertFrameDigests(startDigests, checkpointDocuments, "batch start " + index);
        }
        ObjectNode prefix = registry.deepCopy();
        restoreCheckpointDocumentDigests(prefix, registry.path("v5Checkpoint"));
        prefix.remove(List.of("v5Checkpoint", "batches"));
        prefix.put("proofContract", V5);
        assertRawDocumentDigest(prefix, registry.path("v5Checkpoint").path("registryDigest").asText(), "complete V5 checkpoint");
        // No legacy reader checks are skipped or taught the new aggregate count.
        ReductionRegistry legacy = readReductionRegistry(prefix, checkpointDocuments);
        assertThat(legacy.changedSources()).hasSize(720);
        Set<String> touchedSources = new TreeSet<>(), uniqueIds = new TreeSet<>();
        String previousDigest = registry.path("v5Checkpoint").path("registryDigest").asText();
        for (int index = 0; index < registry.path("batches").size(); index++) {
            JsonNode batch = registry.path("batches").get(index);
            assertUniqueBatchId(uniqueIds, batch.path("id"));
            assertThat(batch.path("previousDigest").asText()).as("append-only batch predecessor %s", index).isEqualTo(previousDigest);
            // Every complete start and end frame was checked in the reverse
            // pass above. Walking predecessor hashes here binds that ordered
            // boundary inventory; it does not replay or certify operations.
            for (JsonNode original : batch.path("originalRequires")) touchedSources.add(original.path("source").asText());
            previousDigest = rawHash(batch);
        }
        return new BatchNativeFrames(legacy, mergeBatchedNativeSources(legacy, finalDocuments, touchedSources));
    }

    private static ReductionRegistry mergeBatchedNativeSources(ReductionRegistry legacy, Map<Path, JsonNode> documents,
            Set<String> touchedSources) throws IOException {
        Map<Path, JsonNode> baseline = new LinkedHashMap<>();
        for (var entry : legacy.canonicalOwners().entrySet()) baseline.put(entry.getKey(), reconstructRawDocument(entry.getKey(),
                readFrameDocument(entry.getKey(), legacy.currentDocuments()), entry.getValue(), legacy.documentDigests().get(entry.getKey()),
                legacy.changesByFile().getOrDefault(entry.getKey(), List.of()), true));
        Map<String, Map<String, JsonNode>> originalGoals = frameGoals(baseline), currentGoals = frameGoals(documents);
        Set<String> sources = new TreeSet<>(touchedSources), batchIds = new TreeSet<>();
        legacy.changedSources().values().forEach(source -> sources.add(source.owner() + ":" + source.goalId()));
        touchedSources.forEach(source -> batchIds.add(qualifiedIdentity(source)[1]));
        Map<String, ChangedSource> merged = new LinkedHashMap<>();
        Map<Path, List<ChangedSource>> changes = new LinkedHashMap<>();
        Map<Path, DocumentDigests> digests = new LinkedHashMap<>();
        for (var entry : legacy.canonicalOwners().entrySet()) digests.put(entry.getKey(),
                new DocumentDigests(legacy.documentDigests().get(entry.getKey()).original(), rawHash(documents.get(entry.getKey()))));
        for (String source : sources) {
            String[] identity = qualifiedIdentity(source);
            JsonNode before = registeredGoal(originalGoals, source), after = registeredGoal(currentGoals, source);
            List<String> contains = rawRequires(before.path("contains"), source);
            assertThat(after.path("contains")).as("batch contains remains unchanged %s", source).isEqualTo(before.path("contains"));
            assertThat(after.path("type")).isEqualTo(before.path("type"));
            assertStructuralSource(before, source, contains.isEmpty());
            assertStructuralSource(after, source, contains.isEmpty());
            ChangedSource changed = new ChangedSource(identity[0], identity[1],
                    before.has("requires") ? rawRequires(before.path("requires"), source) : List.of(),
                    after.has("requires") ? rawRequires(after.path("requires"), source) : List.of(), contains, contains.isEmpty(),
                    before.has("requires"), after.has("requires"));
            assertThat(merged.putIfAbsent(identity[1], changed)).as("unique native stable source ID %s", source).isNull();
            Path file = legacy.canonicalOwners().entrySet().stream().filter(entry -> identity[0].equals(entry.getValue()))
                    .map(Map.Entry::getKey).findFirst().orElseThrow();
            changes.computeIfAbsent(file, ignored -> new ArrayList<>()).add(changed);
        }
        Map<Path, List<ChangedSource>> immutableChanges = new LinkedHashMap<>();
        changes.forEach((file, value) -> immutableChanges.put(file, List.copyOf(value)));
        ReductionRegistry result = new ReductionRegistry(legacy.canonicalOwners(), Collections.unmodifiableMap(immutableChanges),
                Collections.unmodifiableMap(merged), legacy.clusterWitnessCoverage(), Collections.unmodifiableMap(digests),
                legacy.historicalSourceIds(), legacy.suffixSourceIds(), legacy.tailSourceIds(), legacy.clusterTargetSourceIds(),
                legacy.tailRemovedPrerequisites(), immutableDocuments(documents), Set.copyOf(batchIds));
        for (var entry : result.canonicalOwners().entrySet()) reconstructRawDocument(entry.getKey(), documents.get(entry.getKey()),
                entry.getValue(), result.documentDigests().get(entry.getKey()), result.changesByFile().getOrDefault(entry.getKey(), List.of()),
                true, result.batchSourceIds());
        return result;
    }

    private static void assertFields(JsonNode value, String label, String... expected) {
        assertThat(value.isObject()).as(label).isTrue();
        Set<String> actual = new TreeSet<>();
        value.fieldNames().forEachRemaining(actual::add);
        assertThat(actual).as("exact %s fields", label).containsExactlyInAnyOrder(expected);
    }

    private static void assertUniqueBatchId(Set<String> ids, JsonNode value) {
        assertThat(value.isTextual()).isTrue();
        assertThat(value.asText()).isNotBlank();
        assertThat(ids.add(value.asText())).as("unique native batch boundary ID %s", value).isTrue();
    }

    private static Map<String, Map<String, JsonNode>> frameGoals(Map<Path, JsonNode> documents) {
        Map<String, Map<String, JsonNode>> goals = new LinkedHashMap<>();
        documents.values().forEach(document -> assertThat(goals.putIfAbsent(document.path("landscapeId").asText(), rawGoals(document))).isNull());
        return goals;
    }

    private static Map<Path, JsonNode> mutableDocuments(Map<Path, JsonNode> documents) {
        Map<Path, JsonNode> result = new LinkedHashMap<>();
        documents.forEach((path, document) -> result.put(path, document.deepCopy()));
        return result;
    }

    private static Map<Path, JsonNode> immutableDocuments(Map<Path, JsonNode> documents) {
        return Collections.unmodifiableMap(mutableDocuments(documents));
    }

    private static JsonNode readFrameDocument(Path file, Map<Path, JsonNode> documents) throws IOException {
        if (documents.isEmpty()) return MAPPER.readTree(file.toFile());
        assertThat(documents).as("complete native frame document %s", file).containsKey(file);
        return documents.get(file).deepCopy();
    }

    private static void assertFrameDigests(JsonNode bindings, Map<Path, JsonNode> documents, String label) {
        assertThat(bindings.isArray()).as(label).isTrue();
        Set<Path> paths = new HashSet<>();
        for (JsonNode binding : bindings) {
            assertFields(binding, "document digest", "path", "currentDocumentDigest");
            String relative = binding.path("path").asText();
            Path file = REPOSITORY.resolve(relative).toAbsolutePath().normalize();
            assertThat(REPOSITORY.relativize(file).toString().replace(File.separatorChar, '/')).isEqualTo(relative);
            assertThat(paths.add(file)).as("unique %s path %s", label, file).isTrue();
            assertThat(documents).containsKey(file);
            assertRawDocumentDigest(documents.get(file), binding.path("currentDocumentDigest").asText(), label + ": " + file);
        }
        assertThat(paths).as("complete %s catalog paths", label).containsExactlyInAnyOrderElementsOf(documents.keySet());
    }

    private static String rawHash(JsonNode value) {
        try { return CompletionReviewBindings.canonicalHash(value, MAPPER); }
        catch (Exception error) { throw new IllegalStateException("Cannot hash raw native frame", error); }
    }

    private static void assertHistoricalBindings(JsonNode registry, boolean ordered, boolean continued, boolean clusterTargetNormalization) {
        assertRawDocumentDigest(registry.path("originalRequires"),
                "sha256:b731e23f6ef9e142d4efb7b95c844f8bed84f11e71c462fa21e40d9b2dc6583c", "historical 200 arrays");
        assertRawDocumentDigest(registry.path("removals"),
                "sha256:2c533d75b972288ab828a7312af9156d59c738e9d4a0e5755c3b25862470630f", "historical 204 removals");
        var baselines = MAPPER.createArrayNode();
        for (JsonNode source : registry.path("catalogSources")) {
            var binding = baselines.addObject();
            for (String field : List.of("path", "landscapeId", "baselineDocumentDigest")) binding.set(field, source.path(field));
        }
        assertRawDocumentDigest(baselines,
                "sha256:356ffe9a535fb4b35734c7c1bee0c5e9258feab163ea6dec83c4260d793d1471", "historical 21 baseline bindings");
        ObjectNode historical = registry.deepCopy();
        if (clusterTargetNormalization) {
            JsonNode checkpoint = historical.path("v4Checkpoint");
            assertThat(checkpoint.size()).isEqualTo(2);
            assertThat(checkpoint.path("registryDigest").asText())
                    .isEqualTo("sha256:b43287aac991215610cf9a3fa01a766c17d9a3e4bc47eb4cc45d61573ddb9803");
            restoreCheckpointDocumentDigests(historical, checkpoint);
            historical.remove(List.of("v4Checkpoint", "clusterTargetOriginalRequires", "clusterTargetSuffix"));
            historical.put("proofContract", V4);
            assertRawDocumentDigest(historical,
                    "sha256:b43287aac991215610cf9a3fa01a766c17d9a3e4bc47eb4cc45d61573ddb9803", "complete historical V4 checkpoint");
        }
        if (continued) {
            JsonNode checkpoint = historical.path("v3Checkpoint");
            assertThat(checkpoint.path("registryDigest").asText())
                    .isEqualTo("sha256:55bbd974c3265cd3802b7bf5d8622beeb2d3d5ac4795d4e0dfdb27b63302f06b");
            restoreCheckpointDocumentDigests(historical, checkpoint);
            historical.remove(List.of("v3Checkpoint", "tailOriginalRequires", "atomicRemovals", "witnessContinuations"));
            historical.put("proofContract", V3);
            assertRawDocumentDigest(historical,
                    "sha256:55bbd974c3265cd3802b7bf5d8622beeb2d3d5ac4795d4e0dfdb27b63302f06b", "complete historical V3 checkpoint");
        }
        if (ordered) {
            JsonNode checkpoint = historical.path("v2Checkpoint");
            assertThat(checkpoint.path("registryDigest").asText())
                    .isEqualTo("sha256:9142a16a3418ec77a7689a14c74eb86d0f77ee6e0ed166fac39c0f4737c0650f");
            restoreCheckpointDocumentDigests(historical, checkpoint);
            historical.remove(List.of("v2Checkpoint", "suffixOriginalRequires", "suffix"));
            historical.put("proofContract", V2);
        }
        assertRawDocumentDigest(historical,
                "sha256:9142a16a3418ec77a7689a14c74eb86d0f77ee6e0ed166fac39c0f4737c0650f", "complete historical V2 checkpoint");
    }

    private static void restoreCheckpointDocumentDigests(ObjectNode registry, JsonNode checkpoint) {
        assertThat(checkpoint.path("currentDocumentDigests").isArray()).isTrue();
        Map<String, String> currentDigests = new LinkedHashMap<>();
        for (JsonNode entry : checkpoint.path("currentDocumentDigests")) {
            assertThat(currentDigests.putIfAbsent(entry.path("path").asText(), entry.path("currentDocumentDigest").asText())).isNull();
        }
        assertThat(currentDigests).hasSize(21);
        for (JsonNode source : registry.path("catalogSources")) {
            assertThat(currentDigests).containsKey(source.path("path").asText());
            ((ObjectNode) source).put("currentDocumentDigest", currentDigests.get(source.path("path").asText()));
        }
    }

    private static void assertRawDocumentDigest(JsonNode document, String expected, String label) {
        try {
            assertThat(CompletionReviewBindings.canonicalHash(document, MAPPER)).as(label).isEqualTo(expected);
        } catch (Exception error) {
            throw new IllegalStateException("Cannot hash " + label, error);
        }
    }

    private static JsonNode reconstructRawDocument(Path source, JsonNode current, String owner,
            DocumentDigests digests, List<ChangedSource> changes, boolean originalBaseline) {
        return reconstructRawDocument(source, current, owner, digests, changes, originalBaseline, Set.of());
    }

    private static JsonNode reconstructRawDocument(Path source, JsonNode current, String owner,
            DocumentDigests digests, List<ChangedSource> changes, boolean originalBaseline, Set<String> structuralSourceIds) {
        assertThat(current.path("landscapeId").asText()).isEqualTo(owner);
        assertRawDocumentDigest(current, digests.current(), "current raw document " + source);
        JsonNode result = current.deepCopy();
        Map<String, JsonNode> goals = rawGoals(result);
        for (ChangedSource changed : changes) {
            JsonNode goal = goals.get(changed.goalId());
            assertThat(goal).as("raw overlay source %s", changed.goalId()).isNotNull();
            if (structuralSourceIds.contains(changed.goalId())) assertStructuralSource(goal, changed.goalId(), changed.atomicSource());
            else if (changed.atomicSource()) assertAtomicWitness(goal, changed.goalId());
            else assertThat(goal.path("type").asText()).isEqualTo("cluster");
            assertThat(rawRequires(goal.path("contains"), changed.goalId()))
                    .as("unchanged canonical contains for %s", changed.goalId()).containsExactlyElementsOf(changed.canonicalContains());
            assertThat(goal.has("requires")).as("current raw requires presence: %s", changed.goalId()).isEqualTo(changed.currentRequiresPresent());
            assertThat(goal.has("requires") ? rawRequires(goal.path("requires"), changed.goalId()) : List.of())
                    .as("pinned current raw requires: %s", changed.goalId()).containsExactlyElementsOf(changed.currentRequires());
            if (originalBaseline) {
                if (changed.originalRequiresPresent()) ((ObjectNode) goal).set("requires", MAPPER.valueToTree(changed.originalRequires()));
                else ((ObjectNode) goal).remove("requires");
            }
        }
        assertRawDocumentDigest(result, originalBaseline ? digests.original() : digests.current(),
                (originalBaseline ? "baseline" : "current") + " raw document " + source);
        return result;
    }

    private static String[] qualifiedIdentity(String reference) {
        String[] identity = reference.split(":", -1);
        assertThat(identity).as("qualified registry reference: %s", reference).hasSize(2);
        assertThat(identity[0]).isNotBlank();
        assertThat(identity[1]).isNotBlank();
        return identity;
    }

    private static JsonNode registeredGoal(Map<String, Map<String, JsonNode>> goalsByOwner, String reference) {
        String[] identity = qualifiedIdentity(reference);
        assertThat(goalsByOwner).as("registered reference owner: %s", reference).containsKey(identity[0]);
        JsonNode goal = goalsByOwner.get(identity[0]).get(identity[1]);
        assertThat(goal).as("registered canonical reference: %s", reference).isNotNull();
        return goal;
    }

    private static Map<String, JsonNode> rawGoals(JsonNode canonical) {
        assertThat(canonical.path("goals").isArray()).isTrue();
        Map<String, JsonNode> goals = new LinkedHashMap<>();
        canonical.path("goals").forEach(goal -> {
            String id = goal.path("id").asText();
            assertThat(id).isNotBlank();
            assertThat(goals.putIfAbsent(id, goal)).as("unique raw canonical goal: %s", id).isNull();
        });
        return goals;
    }

    private static Set<String> canonicalAtomicDescendants(String sourceId, Map<String, LearningGoal> canonical) {
        Set<String> visited = new TreeSet<>(), atoms = new TreeSet<>();
        ArrayDeque<String> pending = new ArrayDeque<>(List.of(sourceId));
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (!visited.add(id)) continue;
            LearningGoal goal = canonical.get(id);
            assertThat(goal).as("complete canonical contains descendant %s of %s", id, sourceId).isNotNull();
            if (goal.getContains().isEmpty()) atoms.add(id);
            else pending.addAll(goal.getContains());
        }
        assertThat(atoms).as("nonempty canonical atomic basis of %s", sourceId).isNotEmpty();
        return Collections.unmodifiableSet(atoms);
    }

    private static void assertStructuralSource(JsonNode goal, String id, boolean atomic) {
        assertThat(goal).as("registered V6 structural source %s", id).isNotNull();
        assertThat(goal.path("contains").isArray()).isTrue();
        assertThat(goal.path("contains").isEmpty()).as("V6 contains classification %s", id).isEqualTo(atomic);
        if (goal.has("type")) assertThat(goal.path("type").asText()).as("noncontradictory explicit V6 type %s", id)
                .isEqualTo(atomic ? "atomic" : "cluster");
    }

    private static void assertAtomicWitness(JsonNode goal, String id) {
        assertThat(goal).as("registered native source/witness: %s", id).isNotNull();
        assertThat(goal.path("type").asText()).as("structurally atomic witness: %s", id).isEqualTo("atomic");
        assertThat(goal.path("contains").isArray()).isTrue();
        assertThat(goal.path("contains").isEmpty()).isTrue();
    }

    private static List<String> rawRequires(JsonNode references, String id) {
        assertThat(references.isArray()).as("raw ordered requires: %s", id).isTrue();
        List<String> result = new ArrayList<>();
        for (JsonNode reference : references) {
            assertThat(reference.isTextual()).isTrue();
            assertThat(reference.asText()).isNotBlank();
            result.add(reference.asText());
        }
        return List.copyOf(result);
    }

    private static final class RegistryBaselineJsonFactory extends JsonFactory {
        private final ReductionRegistry registry;
        private final boolean originalBaseline;
        RegistryBaselineJsonFactory(ReductionRegistry registry, boolean originalBaseline) {
            this.registry = registry;
            this.originalBaseline = originalBaseline;
        }
        private RegistryBaselineJsonFactory(RegistryBaselineJsonFactory source) {
            super(source, null);
            registry = source.registry;
            originalBaseline = source.originalBaseline;
        }
        @Override public JsonFactory copy() { return new RegistryBaselineJsonFactory(this); }
        @Override public JsonParser createParser(File file) throws IOException {
            Path source = file.toPath().toAbsolutePath().normalize();
            if (!registry.canonicalOwners().containsKey(source)) return super.createParser(file);
            JsonNode tree = reconstructRawDocument(source, readFrameDocument(source, registry.currentDocuments()), registry.canonicalOwners().get(source),
                    registry.documentDigests().get(source), registry.changesByFile().getOrDefault(source, List.of()),
                    originalBaseline, registry.batchSourceIds());
            return super.createParser(tree.toString());
        }
    }

    private static Discovery discover(NativeFixture fixture, String subject, JsonNode declared) throws Exception {
        assertThat(declared.isObject() && !declared.isEmpty()).as("GUI offerings for %s", subject).isTrue();
        Set<String> jurisdictions = new TreeSet<>();
        declared.fieldNames().forEachRemaining(jurisdictions::add);
        jurisdictions.add("ALL");
        Map<String, Map<String, Map<String, Object>>> configurations = new TreeMap<>();
        Map<String, PersonalizationPlan> offeredPlans = new TreeMap<>();
        for (String jurisdiction : jurisdictions) {
            ArrayDeque<Map<String, Map<String, Object>>> pending = new ArrayDeque<>();
            pending.add(Map.of(ROOT, Map.of("selected", true, "filterId", jurisdiction)));
            Set<Map<String, Map<String, Object>>> visited = new HashSet<>();
            while (!pending.isEmpty()) {
                var config = pending.removeFirst();
                if (!visited.add(config)) continue;
                assertThat(visited.size()).as("bounded actual planner discovery").isLessThan(10000);
                PersonalizationPlan plan = CurriculumPersonalizationPlanner.plan(ROOT, fixture.landscapes::getById,
                        (id, scope) -> ReflectionTestUtils.invokeMethod(fixture.service, "resolvePersonalizationOfferingScope", id, scope), config);
                assertThat(plan.valid()).as("planner failure must not disappear: %s %s %s", subject, config, plan.problemCode()).isTrue();
                offeredPlans.put(MAPPER.writeValueAsString(config), plan);
                if (!plan.required()) {
                    if (Boolean.TRUE.equals(config.getOrDefault(subject, Map.of()).get("selected"))) {
                        assertThat(configurations.putIfAbsent(identity(config, subject), config)).as("unique planner configuration").isNull();
                    }
                    continue;
                }
                for (PersonalizationPlan.Option option : plan.options()) {
                    if (option.kind() == PersonalizationPlan.OptionKind.COMPLETE_GROUP || ROOT.equals(option.landscapeId()) || subject.equals(option.landscapeId())) {
                        Map<String, Object> mutable = new LinkedHashMap<>();
                        config.forEach((id, settings) -> mutable.put(id, new LinkedHashMap<>(settings)));
                        var learner = new Learner(); learner.setSelectedCurriculum(ROOT);
                        ReflectionTestUtils.invokeMethod(fixture.service, "applyCurrentPersonalizationOption", learner, mutable, option);
                        pending.add(MAPPER.readValue(learner.getPersonalCurriculum(), new TypeReference<>() { }));
                    }
                }
            }
        }
        Set<String> planner = new TreeSet<>(configurations.keySet());
        Set<String> gui = new TreeSet<>();
        declared.fields().forEachRemaining(country -> {
            JsonNode settings = country.getValue();
            assertThat(settings.path("stages").isArray() && !settings.path("stages").isEmpty()).isTrue();
            assertThat(settings.path("durationModels").isArray()).isTrue();
            List<String> durations = new ArrayList<>();
            settings.path("durationModels").forEach(duration -> {
                assertThat(duration.asText()).isIn("G8", "G9"); durations.add(duration.asText());
            });
            if (durations.isEmpty()) durations.add("");
            settings.path("stages").forEach(stage -> {
                assertThat(stage.asText()).isIn("SekI", "SekII", "CrossStage");
                for (String duration : durations) for (String course : "SekI".equals(stage.asText()) ? List.of("") : List.of("GK", "LK", "GK+LK")) {
                    String identity = String.join("/", country.getKey(), stage.asText(), duration, course);
                    assertThat(gui.add(identity)).as("unique declared GUI configuration").isTrue();
                    Map<String, Object> root = new TreeMap<>(Map.of("selected", true, "filterId", country.getKey(), "stage", stage.asText()));
                    if (!duration.isBlank()) root.put("durationModel", duration);
                    Map<String, Object> selection = new TreeMap<>(Map.of("selected", true));
                    if (!course.isBlank()) selection.put("filterId", course);
                    configurations.putIfAbsent(identity, Map.of(ROOT, root, subject, selection));
                }
            });
        });
        return new Discovery(configurations, planner, gui, offeredPlans);
    }

    private static String identity(Map<String, Map<String, Object>> config, String subject) {
        Map<String, Object> root = config.get(ROOT);
        return String.join("/", (String) root.get("filterId"), (String) root.get("stage"),
                (String) root.getOrDefault("durationModel", ""), (String) config.get(subject).getOrDefault("filterId", ""));
    }

    private static JsonNode readGuiOfferings() throws IOException {
        String source = Files.readString(REPOSITORY.resolve("app/src/generated/gymnasiumDurationOfferings.ts"));
        String marker = "export const GYMNASIUM_CONTENT_OFFERINGS = ";
        int start = source.indexOf(marker), end = source.indexOf(" as const satisfies GymnasiumContentOfferings", start);
        assertThat(start).isNotNegative();
        assertThat(end).isGreaterThan(start);
        return new ObjectMapper().enable(JsonParser.Feature.ALLOW_SINGLE_QUOTES).readTree(source.substring(start + marker.length(), end));
    }

    private static boolean hasDeclaredRole(NativeScope scope, String id) {
        return scope.roles().targets().contains(id) || scope.roles().support().contains(id);
    }

    private record AtomicFrontierCase(String name, Map<String, Double> mastery, Set<String> focus,
            boolean strict, Boolean expected) { }

    private static Map<String, JsonNode> nativeGermanApplicability(NativeFixture fixture) {
        Map<String, JsonNode> result = new TreeMap<>();
        for (var landscape : fixture.landscapes.getClosure(ROOT)) {
            if (!GERMAN.equals(landscape.getLandscapeId())) continue;
            for (var goal : landscape.getGoals()) result.put(goal.getId(), MAPPER.valueToTree(goal).path("applicability"));
        }
        assertThat(result).as("native German LandscapeService applicability").isNotEmpty();
        return result;
    }

    private static Map<String, JsonNode> projectedApplicability(NativeScope scope) {
        Map<String, LearningGoal> visible = ReflectionTestUtils.invokeMethod(scope.projection(), "visibleGoals");
        Map<String, JsonNode> result = new TreeMap<>();
        visible.forEach((id, goal) -> result.put(id, MAPPER.valueToTree(goal).path("applicability")));
        return result;
    }

    private static void assertGermanRawGoalNormalization(CompletionProfileCompiler.PrerequisiteTopology before,
            CompletionProfileCompiler.PrerequisiteTopology after, String scope) {
        assertThat(before.transitiveGoalPrerequisites(GERMAN_ATOM))
                .as("exact original German pre-expansion demand: %s", scope).containsExactlyInAnyOrder(GERMAN_CLUSTER, GERMAN_OTHER);
        Set<String> normalizedRoles = new TreeSet<>(GERMAN_LEAVES);
        normalizedRoles.add(GERMAN_OTHER);
        normalizedRoles.add(GERMAN_LEAF_PREREQUISITE);
        assertThat(after.transitiveGoalPrerequisites(GERMAN_ATOM))
                .as("exact normalized German pre-expansion demand: %s", scope)
                .hasSize(12).containsExactlyInAnyOrderElementsOf(normalizedRoles).doesNotContain(GERMAN_CLUSTER);
        assertThat(before.transitivePrerequisites(GERMAN_ATOM)).as("original complete German atomic demand: %s", scope).hasSize(20);
        assertThat(after.transitivePrerequisites(GERMAN_ATOM)).as("normalized complete German atomic demand: %s", scope)
                .isEqualTo(before.transitivePrerequisites(GERMAN_ATOM));
    }

    private static void assertGermanActualCompletionAndPolicyPreserved(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after, DocumentDigests digests, String scope) {
        assertThat(before.graph().get(GERMAN_ATOM).getRequires()).containsExactly(GERMAN_CLUSTER, GERMAN_OTHER);
        List<String> current = new ArrayList<>(List.of(GERMAN_OTHER));
        current.addAll(GERMAN_LEAVES);
        assertThat(after.graph().get(GERMAN_ATOM).getRequires()).containsExactlyElementsOf(current);
        for (NativeScope actual : List.of(before, after)) {
            assertThat(actual.graph().get(GERMAN_ATOM).getType()).isEqualTo("atomic");
            assertThat(actual.graph().get(GERMAN_ATOM).getContains()).isEmpty();
            assertThat(actual.roles().atomicTargets()).contains(GERMAN_ATOM, GERMAN_LEAF);
            assertThat(actual.topology().transitivePrerequisites(GERMAN_ATOM)).contains(GERMAN_LEAF);
        }
        Map<String, Double> all = new TreeMap<>();
        before.graph().keySet().forEach(id -> all.put(id, 1.0));
        Map<String, Double> prepared = new TreeMap<>(all);
        prepared.remove(GERMAN_ATOM);
        Map<String, Double> leafOpen = new TreeMap<>(prepared);
        leafOpen.remove(GERMAN_LEAF);
        leafOpen.remove(GERMAN_CLUSTER);
        Map<String, Double> clusterMastered = new TreeMap<>(leafOpen);
        clusterMastered.put(GERMAN_CLUSTER, 1.0);
        Map<String, Map<String, Double>> cases = new LinkedHashMap<>();
        cases.put("all-open", Map.of());
        cases.put("all-closed", all);
        cases.put("prepared-source-open", prepared);
        cases.put("one-leaf-open-source-open", leafOpen);
        cases.put("cluster-mastered-leaf-open-source-open", clusterMastered);
        Set<String> focus = new TreeSet<>(before.roles().targets());
        assertThat(focus.remove(GERMAN_LEAF)).as("required actual target leaf is removed from focus: %s", scope).isTrue();
        assertThat(focus).contains(GERMAN_ATOM).doesNotContain(GERMAN_LEAF);

        // Independent native completion caches carry the pinned raw frame hashes.
        // Restore the existing fixture applications after this bounded matrix.
        Object previousBefore = ReflectionTestUtils.getField(beforeService, "completionApplicationService");
        Object previousAfter = ReflectionTestUtils.getField(afterService, "completionApplicationService");
        var beforeApplication = new CompletionApplicationService(new CompletionProfileCatalog(Map.of(), Map.of(), digests.original(), true));
        var afterApplication = new CompletionApplicationService(new CompletionProfileCatalog(Map.of(), Map.of(), digests.current(), true));
        ReflectionTestUtils.setField(beforeService, "completionApplicationService", beforeApplication);
        ReflectionTestUtils.setField(afterService, "completionApplicationService", afterApplication);
        try {
            CompiledCompletionProfile original = ReflectionTestUtils.invokeMethod(beforeService, "compileCompletionScope",
                    before.learner(), "automatic:personal-curriculum", before.projection(), before.graph());
            CompiledCompletionProfile normalized = ReflectionTestUtils.invokeMethod(afterService, "compileCompletionScope",
                    after.learner(), "automatic:personal-curriculum", after.projection(), after.graph());
            for (var entry : cases.entrySet()) {
                String name = entry.getKey();
                CompletionEvaluation left = beforeApplication.evaluate(original, entry.getValue());
                CompletionEvaluation right = afterApplication.evaluate(normalized, entry.getValue());
                assertThat(right).as("complete actual German evaluation %s: %s", name, scope).isEqualTo(left);
                assertThat(left.complete()).as("actual German completion control %s: %s", name, scope).isEqualTo("all-closed".equals(name));
                if (!"all-closed".equals(name)) assertThat(entry.getValue().getOrDefault(GERMAN_ATOM, 0.0)).isZero();
                for (boolean strict : List.of(false, true)) for (boolean focused : List.of(false, true)) {
                    boolean expected = switch (name) {
                        case "all-closed", "prepared-source-open" -> true;
                        case "one-leaf-open-source-open", "cluster-mastered-leaf-open-source-open" -> focused && !strict;
                        default -> false;
                    };
                    var probe = new AtomicFrontierCase(name, entry.getValue(), focused ? focus : null, strict, expected);
                    boolean leftPolicy = atomicFrontierProbe(beforeService, before, GERMAN_ATOM, probe);
                    boolean rightPolicy = atomicFrontierProbe(afterService, after, GERMAN_ATOM, probe);
                    assertThat(leftPolicy).as("actual German common-policy control %s strict=%s leafOutsideFocus=%s: %s",
                            name, strict, focused, scope).isEqualTo(expected);
                    assertThat(rightPolicy).as("actual German common-policy preservation %s strict=%s leafOutsideFocus=%s: %s",
                            name, strict, focused, scope).isEqualTo(leftPolicy);
                }
            }
            Map<String, Double> sourceMasteredLeafOpen = new TreeMap<>(all);
            sourceMasteredLeafOpen.put(GERMAN_ATOM, 1.0);
            sourceMasteredLeafOpen.put(GERMAN_LEAF, 0.0);
            assertThat(sourceMasteredLeafOpen.get(GERMAN_ATOM)).isEqualTo(1.0);
            assertThat(sourceMasteredLeafOpen.get(GERMAN_LEAF)).isZero();
            assertThat(afterApplication.evaluate(normalized, sourceMasteredLeafOpen))
                    .as("full completion with explicit assessment mastery and an open prerequisite: %s", scope)
                    .isEqualTo(beforeApplication.evaluate(original, sourceMasteredLeafOpen));
            Map<String, Double> originalEffective = ReflectionTestUtils.invokeMethod(beforeService, "computeEffectiveMastery", before.graph(), sourceMasteredLeafOpen);
            Map<String, Double> normalizedEffective = ReflectionTestUtils.invokeMethod(afterService, "computeEffectiveMastery", after.graph(), sourceMasteredLeafOpen);
            assertThat(normalizedEffective).as("native effective mastery with explicit assessment mastery and an open prerequisite: %s", scope)
                    .isEqualTo(originalEffective);
        } finally {
            ReflectionTestUtils.setField(beforeService, "completionApplicationService", previousBefore);
            ReflectionTestUtils.setField(afterService, "completionApplicationService", previousAfter);
        }
        System.out.printf("GERMAN_CLUSTER_TARGET_ACTUAL_SCOPE scope=%s preparedSourceOpenPositive=true requiredTargetLeafOutsideFocus=%s completionPairs=5 commonPolicyPairs=20 masteredSourceCompletionAndEffectiveMasteryPairs=1%n",
                scope, GERMAN_LEAF);
    }

    private static void assertGermanControlledRoleDifferences(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after) throws Exception {
        for (NativeScope actual : List.of(before, after)) {
            assertThat(Boolean.TRUE.equals(ReflectionTestUtils.invokeMethod(actual.projection(), "compositionViewApplied"))).isTrue();
            assertThat(hasDeclaredRole(actual, GERMAN_CLUSTER)).isTrue();
            for (String leaf : GERMAN_LEAVES) assertThat(hasDeclaredRole(actual, leaf)).isTrue();
        }
        // These deliberately altered role sets are separate from actual enrollment
        // invariance. The pre-expansion role contract intentionally changes here.
        assertThat(roleProbe(beforeService, before, withoutRole(before.projection(), GERMAN_LEAF), GERMAN_ATOM, before.topology()))
                .as("artificial missing-leaf-role control before cluster expansion").isTrue();
        assertThat(roleProbe(afterService, after, withoutRole(after.projection(), GERMAN_LEAF), GERMAN_ATOM, after.topology()))
                .as("artificial missing-leaf-role control after atomic normalization").isFalse();
        assertThat(roleProbe(beforeService, before, withoutRole(before.projection(), GERMAN_CLUSTER), GERMAN_ATOM, before.topology()))
                .as("artificial missing-cluster-role control before normalization").isFalse();
        assertThat(roleProbe(afterService, after, withoutRole(after.projection(), GERMAN_CLUSTER), GERMAN_ATOM, after.topology()))
                .as("artificial missing-cluster-role control with every leaf role retained").isTrue();
    }

    private static void assertContinuedMathFocusPreserved(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after, String scope) {
        Set<String> focus = Set.of(RETAINED, REMOVED);
        assertThat(focus).doesNotContain(CONTINUED_BRIDGE);
        assertThat(before.roles().atomicTargets()).containsAll(focus);
        assertThat(after.roles().atomicTargets()).containsAll(focus);
        assertThat(before.graph().get(RETAINED).getRequires()).as("historical direct orientation edge").contains(REMOVED);
        assertThat(after.graph().get(RETAINED).getRequires()).as("current literal continuation first edge")
                .contains(CONTINUED_BRIDGE).doesNotContain(REMOVED);
        assertThat(after.graph().get(CONTINUED_BRIDGE).getRequires()).as("current literal continuation second edge").contains(REMOVED);
        assertThat(before.topology().transitivePrerequisites(RETAINED)).contains(CONTINUED_BRIDGE, REMOVED);
        assertThat(after.topology().transitivePrerequisites(RETAINED)).contains(CONTINUED_BRIDGE, REMOVED);
        Map<String, Double> mastered = new TreeMap<>();
        before.graph().keySet().forEach(id -> mastered.put(id, 1.0));
        Map<String, Double> missingOrientation = new TreeMap<>(mastered);
        missingOrientation.remove(REMOVED);
        List<AtomicFrontierCase> cases = List.of(
                new AtomicFrontierCase("continued-normal-focus-full-mastered", mastered, focus, false, true),
                new AtomicFrontierCase("continued-normal-focus-missing-orientation", missingOrientation, focus, false, false),
                new AtomicFrontierCase("continued-normal-focus-only-orientation-mastered", Map.of(REMOVED, 1.0), focus, false, true),
                new AtomicFrontierCase("continued-strict-focus-full-mastered", mastered, focus, true, true),
                new AtomicFrontierCase("continued-strict-focus-missing-orientation", missingOrientation, focus, true, false));
        for (AtomicFrontierCase probe : cases) {
            boolean original = atomicFrontierProbe(beforeService, before, RETAINED, probe);
            boolean reduced = atomicFrontierProbe(afterService, after, RETAINED, probe);
            assertThat(original).as("actual continued Math frontier positive/negative control %s: %s", probe.name(), scope)
                    .isEqualTo(probe.expected());
            assertThat(reduced).as("actual continued Math focus invariance %s: %s", probe.name(), scope).isEqualTo(original);
        }
        System.out.printf("MATH_CONTINUED_WITNESS_FOCUS_COVERAGE scope=%s source=%s focus=%s outsideFocusBridge=%s cases=%d%n",
                scope, RETAINED, focus, CONTINUED_BRIDGE, cases.size());
    }

    private static int assertMathSuffixAtomicFrontierPreserved(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after, String id, boolean validRoles, String scope) {
        assertThat(before.topology().transitivePrerequisites(id)).as("original Math demand: %s/%s", scope, id).contains(REMOVED);
        Map<String, Double> mastered = new TreeMap<>();
        before.graph().keySet().forEach(goal -> mastered.put(goal, 1.0));
        Map<String, Double> missingOrientation = new TreeMap<>(mastered);
        missingOrientation.remove(REMOVED);
        List<AtomicFrontierCase> cases = List.of(
                new AtomicFrontierCase("math-normal-empty", Map.of(), null, false, null),
                new AtomicFrontierCase("math-normal-mastered", mastered, null, false, validRoles),
                new AtomicFrontierCase("math-strict-mastered", mastered, null, true, validRoles),
                new AtomicFrontierCase("math-strict-missing-orientation", missingOrientation, null, true, false),
                new AtomicFrontierCase("math-normal-atomic-focus", Map.of(), Set.of(id), false, validRoles),
                new AtomicFrontierCase("math-strict-atomic-focus", Map.of(), Set.of(id), true, false));
        for (AtomicFrontierCase probe : cases) {
            boolean original = atomicFrontierProbe(beforeService, before, id, probe);
            boolean reduced = atomicFrontierProbe(afterService, after, id, probe);
            assertThat(reduced).as("new Math atomic frontier %s/%s: %s", id, probe.name(), scope).isEqualTo(original);
            if (probe.expected() != null) assertThat(original).as("new Math frontier control %s/%s: %s", id, probe.name(), scope)
                    .isEqualTo(probe.expected());
        }
        return cases.size();
    }

    private static int assertLatinAtomicFrontierPreserved(LearnerService beforeService, NativeScope before,
            LearnerService afterService, NativeScope after, String atomId, boolean validRoles, String scope) {
        assertThat(atomId).isEqualTo(LATIN_ATOM);
        assertThat(before.topology().transitivePrerequisites(atomId)).contains(LATIN_BRIDGE, LATIN_ORIENTATION);
        assertThat(before.topology().transitiveGoalPrerequisites(atomId)).contains(LATIN_BRIDGE, LATIN_ORIENTATION);
        Map<String, Double> mastered = new TreeMap<>();
        before.graph().keySet().forEach(id -> mastered.put(id, 1.0));
        Map<String, Double> missingOrientation = new TreeMap<>(mastered);
        missingOrientation.remove(LATIN_ORIENTATION);
        List<AtomicFrontierCase> cases = List.of(
                new AtomicFrontierCase("normal-empty", Map.of(), null, false, null),
                new AtomicFrontierCase("normal-mastered", mastered, null, false, validRoles),
                new AtomicFrontierCase("strict-mastered", mastered, null, true, validRoles),
                new AtomicFrontierCase("strict-mastered-intermediate-missing-orientation", missingOrientation, null, true, false),
                new AtomicFrontierCase("strict-only-orientation-mastered", Map.of(LATIN_ORIENTATION, 1.0), null, true, false),
                new AtomicFrontierCase("normal-atomic-focus-empty", Map.of(), Set.of(atomId), false, validRoles),
                new AtomicFrontierCase("strict-atomic-focus-empty", Map.of(), Set.of(atomId), true, false));
        for (AtomicFrontierCase probe : cases) {
            boolean original = atomicFrontierProbe(beforeService, before, atomId, probe);
            boolean reduced = atomicFrontierProbe(afterService, after, atomId, probe);
            assertThat(reduced).as("native atomic frontier %s/%s: %s", atomId, probe.name(), scope).isEqualTo(original);
            if (probe.expected() != null) {
                assertThat(original).as("native frontier control %s/%s: %s", atomId, probe.name(), scope)
                        .isEqualTo(probe.expected());
            }
        }
        return cases.size();
    }

    private static boolean atomicFrontierProbe(LearnerService service, NativeScope scope,
            String atomId, AtomicFrontierCase probe) {
        Boolean originalStrictMode = scope.learner().getStrictMode();
        try {
            scope.learner().setStrictMode(probe.strict());
            Object prerequisites = ReflectionTestUtils.invokeMethod(service, "frontierPrerequisites",
                    scope.learner(), scope.projection(), probe.mastery(), probe.focus());
            assertThat(ReflectionTestUtils.<Object>invokeMethod(prerequisites, "topology"))
                    .as("actual atomic frontier topology: %s", probe.name()).isNotNull();
            return ReflectionTestUtils.invokeMethod(service, "areFrontierPrerequisitesMastered",
                    scope.graph().get(atomId), scope.projection(), prerequisites);
        } finally {
            scope.learner().setStrictMode(originalStrictMode);
        }
    }

    private static void assertBiologyOrientationAvailable(LearnerService service, NativeScope scope) {
        LearningGoal orientation = scope.graph().get(BIOLOGY_ORIENTATION);
        assertThat(orientation).isNotNull();
        assertThat(CompletionProfileCompiler.isOrientation(orientation)).isTrue();
        assertThat(ReflectionTestUtils.<Boolean>invokeMethod(service, "areFrontierPrerequisitesMastered",
                orientation, scope.projection(), scope.frontier())).isTrue();
    }

    private static void assertInvalidAtomicRequirementOutsideFocusFailsClosed(LearnerService service, NativeScope scope) {
        String outsideFocus = scope.roles().atomicTargets().stream()
                .filter(id -> !BIOLOGY_ORIENTATION.equals(id) && "atomic".equals(scope.graph().get(id).getType()))
                .sorted().findFirst().orElseThrow();
        LearningGoal outsideGoal = scope.graph().get(outsideFocus);
        List<String> original = outsideGoal.getRequires();
        try {
            // The cached native definition is changed only in this isolated fixture.
            outsideGoal.setRequires(List.of("unknown-atomic-requirement-outside-focus"));
            Object rejected = ReflectionTestUtils.invokeMethod(service, "frontierPrerequisites", scope.learner(),
                    scope.projection(), Map.of(), Set.of(BIOLOGY_ORIENTATION));
            assertThat(ReflectionTestUtils.<Object>invokeMethod(rejected, "topology")).isNull();
            assertThat(ReflectionTestUtils.<Boolean>invokeMethod(service, "areFrontierPrerequisitesMastered",
                    scope.graph().get(BIOLOGY_ORIENTATION), scope.projection(), rejected)).isFalse();
        } finally {
            outsideGoal.setRequires(original);
        }
    }

    private static boolean roleProbe(LearnerService service, NativeScope scope, Object projection) throws Exception {
        return roleProbe(service, scope, projection, SOURCE, scope.topology());
    }

    private static boolean roleProbe(LearnerService service, NativeScope scope, Object projection,
            String sourceId, CompletionProfileCompiler.PrerequisiteTopology topology) throws Exception {
        return roleProbe(service, scope.graph(), projection, sourceId, topology);
    }

    private static boolean roleProbe(LearnerService service, Map<String, LearningGoal> graph, Object projection,
            String sourceId, CompletionProfileCompiler.PrerequisiteTopology topology) throws Exception {
        return roleProbeWithPrerequisites(service, graph, projection, sourceId, fullMasteryPrerequisites(graph, topology));
    }

    private static Object fullMasteryPrerequisites(Map<String, LearningGoal> graph,
            CompletionProfileCompiler.PrerequisiteTopology topology) throws Exception {
        Map<String, Double> mastered = new TreeMap<>();
        graph.keySet().forEach(id -> mastered.put(id, 1.0));
        var type = Class.forName("com.skillpilot.backend.service.LearnerService$FrontierPrerequisites");
        var constructor = type.getDeclaredConstructor(Map.class, CompletionProfileCompiler.PrerequisiteTopology.class, Map.class, Set.class);
        constructor.setAccessible(true);
        return constructor.newInstance(graph, topology, mastered, null);
    }

    private static boolean roleProbeWithPrerequisites(LearnerService service, Map<String, LearningGoal> graph,
            Object projection, String sourceId, Object prerequisites) {
        return ReflectionTestUtils.invokeMethod(service, "areFrontierPrerequisitesMastered", graph.get(sourceId), projection, prerequisites);
    }

    private static void assertMissingRoleInvalid(LearnerService service, NativeScope scope,
            String sourceId, String prerequisiteId) throws Exception {
        assertThat(scope.roles().targets()).contains(sourceId);
        assertThat(scope.context()).contains(sourceId);
        assertThat(scope.graph()).containsKey(sourceId);
        assertThat(hasDeclaredRole(scope, prerequisiteId)).isFalse();
        assertThat(scope.topology().transitiveGoalPrerequisites(sourceId)).contains(prerequisiteId);
        assertThat(roleProbe(service, scope, scope.projection(), sourceId, scope.topology())).isFalse();
    }

    private static void assertDuplicateRemovalKeepsMissingRoleInvalid(LearnerService service, NativeScope scope,
            String sourceId, String prerequisiteId) throws Exception {
        assertMissingRoleInvalid(service, scope, sourceId, prerequisiteId);
        LearningGoal source = scope.graph().get(sourceId);
        List<String> original = source.getRequires();
        assertThat(original).contains(prerequisiteId);
        try {
            // Remove just this duplicate in the isolated native graph, never in canonical data.
            source.setRequires(original.stream().filter(id -> !prerequisiteId.equals(id)).toList());
            var reduced = new CompletionProfileCompiler().normalizePrerequisites(scope.graph());
            reduced.validateContext(scope.roles().atomicTargets());
            assertThat(reduced.transitiveGoalPrerequisites(sourceId))
                    .isEqualTo(scope.topology().transitiveGoalPrerequisites(sourceId));
            assertThat(reduced.transitivePrerequisites(sourceId))
                    .isEqualTo(scope.topology().transitivePrerequisites(sourceId));
            assertThat(roleProbe(service, scope, scope.projection(), sourceId, reduced)).isFalse();
        } finally {
            source.setRequires(original);
        }
    }

    private static Object withoutRole(Object projection, String id) throws Exception {
        Set<String> targets = new TreeSet<>(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "targetGoalIds"));
        Set<String> support = new TreeSet<>(ReflectionTestUtils.<Set<String>>invokeMethod(projection, "prerequisiteOnlyGoalIds"));
        targets.remove(id); support.remove(id);
        var constructor = projection.getClass().getDeclaredConstructor(Map.class, Set.class, Set.class, Map.class, Set.class, List.class, boolean.class);
        constructor.setAccessible(true);
        return constructor.newInstance(ReflectionTestUtils.invokeMethod(projection, "visibleGoals"), targets, support,
                ReflectionTestUtils.invokeMethod(projection, "structuralGoals"), ReflectionTestUtils.invokeMethod(projection, "compositionViewIds"),
                ReflectionTestUtils.invokeMethod(projection, "presentationRootGoalIds"), true);
    }
}
