package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.api.CurriculumCatalogResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.function.Consumer;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class PackageSourceEvidenceStateTest {

    @TempDir
    Path tempDir;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void joinsEvidenceAndPrefersExactThenDeclaredMappingOrder() throws Exception {
        RuntimeFixture runtime = runtime("ordered", true);
        PackageSourceEvidenceState state = PackageSourceEvidenceState.load(
                runtime.snapshot(), runtime.domainState(), runtime.artifactReader(), objectMapper);

        assertThat(state.generationSha256()).isEqualTo(runtime.snapshot().generationSha256());
        assertThat(state.catalogEntries())
                .singleElement()
                .satisfies(entry -> {
                    assertThat(entry.packageId()).isEqualTo("org.example.ordered");
                    assertThat(entry.packageVersion()).isEqualTo("1.0.0");
                    assertThat(entry.targetLandscapeId()).isEqualTo(runtime.fixture().landscapeId());
                    assertThat(entry.sourceCollectionCount()).isOne();
                    assertThat(entry.sourceDocumentCount()).isOne();
                    assertThat(entry.sourceGoalCount()).isEqualTo(3);
                    assertThat(entry.mappingEdgeCount()).isEqualTo(3);
                    assertThat(entry.href()).isEqualTo(
                            "/api/ui/curriculum-source-evidence/packages/"
                                    + "org.example.ordered/1.0.0/goals");
                    assertThat(entry.goals())
                            .containsExactly(new CurriculumCatalogResponse.SourceEvidenceGoalEntry(
                                    "goal-ordered", java.util.List.of("DE-BY")));
                });

        PackageSourceEvidenceState.LookupResult result = state.lookup(
                "org.example.ordered",
                "1.0.0",
                "goal-ordered",
                runtime.snapshot().generationSha256(),
                null);
        assertThat(result.status()).isEqualTo(PackageSourceEvidenceState.LookupStatus.FOUND);
        assertThat(result.etag()).matches("[a-f0-9]{64}");
        assertThat(result.evidence()).satisfies(evidence -> {
            assertThat(evidence.generationSha256()).isEqualTo(runtime.snapshot().generationSha256());
            assertThat(evidence.targetLandscapeId()).isEqualTo(runtime.fixture().landscapeId());
            assertThat(evidence.goalId()).isEqualTo("goal-ordered");
            assertThat(evidence.jurisdiction()).isEqualTo("DE-BY");
            assertThat(evidence.matchType()).isEqualTo("exact");
            // The partial edge is declared first. Of the two exact edges, this lexically later
            // source goal is declared first and therefore proves stable mapping-edge ordering.
            assertThat(evidence.sourceGoal().sourceGoalId())
                    .isEqualTo(runtime.fixture().preferredExactSourceGoalId());
            assertThat(evidence.sourceCollection().sourceCollectionId())
                    .isEqualTo(runtime.fixture().sourceCollectionId());
            assertThat(evidence.sourceCollection().sourceLandscapeId())
                    .isEqualTo(runtime.fixture().sourceLandscapeId());
            assertThat(evidence.sourceDocument().sourceDocumentId())
                    .isEqualTo(runtime.fixture().sourceDocumentId());
            assertThat(evidence.sourceDocument().url())
                    .isEqualTo("https://example.org/curriculum/ordered");
            assertThat(evidence.sourceGoal().sourceTextSha256()).startsWith("sha256:");
            assertThat(evidence.sourceGoal().locator().sourcePage()).isEqualTo(9);
        });

        assertThat(state.lookup(
                        "org.example.ordered",
                        "1.0.0",
                        "goal-ordered",
                        runtime.snapshot().generationSha256(),
                        "DE-BY"))
                .usingRecursiveComparison()
                .isEqualTo(result);
        assertThatThrownBy(() -> state.catalogEntries().clear())
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void distinguishesInvalidUnknownAndKnownGoalsWithoutMatchingEvidence() throws Exception {
        RuntimeFixture runtime = runtime("lookup", false);
        PackageSourceEvidenceState state = PackageSourceEvidenceState.load(
                runtime.snapshot(), runtime.domainState(), runtime.artifactReader(), objectMapper);

        String generation = runtime.snapshot().generationSha256();
        assertThat(state.lookup("org.example.lookup", "1.0.0", "goal-lookup", generation, ""))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.INVALID);
        assertThat(state.lookup("org.example.lookup", "1.0.0", "goal-lookup", generation, "de-by"))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.INVALID);
        assertThat(state.lookup("org.example.lookup", "1.0.0", "goal/lookup", generation, null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.INVALID);
        assertThat(state.lookup("org.example.lookup", "1.0.0", "goal-lookup", null, null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.INVALID);
        assertThat(state.lookup("org.example.lookup", "1.0.0", "goal-lookup", "not-a-hash", null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.INVALID);
        assertThat(state.lookup("org.example.lookup", "1.0.0", "goal-lookup", "f".repeat(64), null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.NOT_FOUND);

        assertThat(state.lookup("org.example.unknown", "1.0.0", "goal-lookup", generation, null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.NOT_FOUND);
        assertThat(state.lookup("org.example.lookup", "1.0.1", "goal-lookup", generation, null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.NOT_FOUND);
        assertThat(state.lookup("org.example.lookup", "1.0.0", "unknown-goal", generation, null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.NOT_FOUND);

        assertThat(state.lookup(
                        "org.example.lookup", "1.0.0", "unmapped-goal-lookup", generation, null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.NO_CONTENT);
        assertThat(state.lookup("org.example.lookup", "1.0.0", "goal-lookup", generation, "DE-HE"))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.NO_CONTENT);
    }

    @Test
    void absentEvidenceRoleLeavesKnownGoalsAvailableWithoutDiscoveryOrFallback() throws Exception {
        RuntimeFixture runtime = runtime("absent", false);
        CurriculumRuntimeSnapshot withoutEvidence = withoutSourceEvidence(runtime.snapshot());

        PackageSourceEvidenceState state = PackageSourceEvidenceState.load(
                withoutEvidence, runtime.domainState(), runtime.artifactReader(), objectMapper);

        assertThat(state.catalogEntries()).isEmpty();
        assertThat(state.lookup(
                        "org.example.absent",
                        "1.0.0",
                        "goal-absent",
                        withoutEvidence.generationSha256(),
                        null))
                .satisfies(result -> {
                    assertThat(result.status()).isEqualTo(PackageSourceEvidenceState.LookupStatus.NO_CONTENT);
                    assertThat(result.evidence()).isNull();
                    assertThat(result.etag()).isNull();
                });
        assertThat(state.lookup(
                        "org.example.absent",
                        "1.0.0",
                        "unknown-goal",
                        withoutEvidence.generationSha256(),
                        null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.NOT_FOUND);
    }

    @Test
    void limitsDiscoveryAndLookupIdentityToTheTargetLandscape() throws Exception {
        CurriculumPackageTestFixture.PackageSpec base =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("root-only", 'a');
        CurriculumPackageTestFixture.PackageSpec withModule = new CurriculumPackageTestFixture.PackageSpec(
                base.suffix(),
                base.packageId(),
                base.landscapeId(),
                base.hashCharacter(),
                base.closureHashCharacter(),
                base.indexHashCharacter(),
                base.definitionKey(),
                base.definitionOwner(),
                base.definitionDigest(),
                "module-root-only",
                false,
                base.externalUrlScheme());
        RuntimeFixture runtime = runtime(withModule, false);
        PackageSourceEvidenceState state = PackageSourceEvidenceState.load(
                runtime.snapshot(), runtime.domainState(), runtime.artifactReader(), objectMapper);

        assertThat(state.lookup(
                        "org.example.root-only",
                        "1.0.0",
                        "module-goal-root-only",
                        runtime.snapshot().generationSha256(),
                        null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.NOT_FOUND);
        assertThat(state.lookup(
                        "org.example.root-only",
                        "1.0.0",
                        "unmapped-goal-root-only",
                        runtime.snapshot().generationSha256(),
                        null))
                .extracting(PackageSourceEvidenceState.LookupResult::status)
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.NO_CONTENT);
    }

    @Test
    void rejectsCountHashDuplicateAndBrokenCrossReferences() throws Exception {
        expectMutationFailure("count", root -> root.put("sourceGoalCount", 2),
                "sourceGoalCount count mismatch");
        expectMutationFailure("hash", root -> firstSourceGoal(root)
                        .put("sourceTextSha256", "sha256:" + "0".repeat(64)),
                "sourceTextSha256 differs");
        expectMutationFailure("duplicate", root -> {
            ObjectNode collection = firstCollection(root);
            ArrayNode goals = (ArrayNode) collection.get("sourceGoals");
            goals.add(goals.get(0).deepCopy());
            collection.put("sourceGoalCount", 2);
            root.put("sourceGoalCount", 2);
        }, "Duplicate sourceGoalId");
        expectMutationFailure("document", root -> firstSourceGoal(root)
                        .put("sourceDocumentId", "unknown-document"),
                "outside its source collection");
        expectMutationFailure("mapping", root -> firstSourceGoal(root)
                        .put("sourceGoalId", "unknown-source-goal"),
                "cross-reference sets differ");
        expectMutationFailure("collection", root -> firstCollection(root)
                        .put("sourceCollectionId", "unknown-source-collection"),
                "absent from the official source index");
    }

    @Test
    void rejectsDuplicateRoleInvalidSemanticBindingAndArtifactHashDrift() throws Exception {
        RuntimeFixture duplicateRuntime = runtime("duplicate-role", false);
        CurriculumRuntimeSnapshot.Artifact original = sourceEvidenceArtifact(duplicateRuntime.snapshot());
        CurriculumRuntimeSnapshot.Artifact duplicate = copyArtifact(
                original,
                "data/sources/duplicate-source-goal-references.json",
                original.bytes(),
                original.sha256(),
                original.logicalId());
        Map<CurriculumRuntimeSnapshot.ArtifactKey, CurriculumRuntimeSnapshot.Artifact> duplicateArtifacts =
                new LinkedHashMap<>(duplicateRuntime.snapshot().artifactsByKey());
        duplicateArtifacts.put(
                new CurriculumRuntimeSnapshot.ArtifactKey(duplicate.packageId(), duplicate.relativePath()),
                duplicate);
        CurriculumRuntimeSnapshot duplicateSnapshot = copySnapshot(
                duplicateRuntime.snapshot(), duplicateArtifacts);
        assertThatThrownBy(() -> PackageSourceEvidenceState.load(
                        duplicateSnapshot,
                        duplicateRuntime.domainState(),
                        duplicateRuntime.artifactReader(),
                        objectMapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("more than one source-goal-reference-index");

        RuntimeFixture bindingRuntime = runtime("binding", false);
        CurriculumRuntimeSnapshot.Artifact bound = sourceEvidenceArtifact(bindingRuntime.snapshot());
        CurriculumRuntimeSnapshot invalidBindingSnapshot = replaceSourceEvidenceArtifact(
                bindingRuntime.snapshot(),
                copyArtifact(
                        bound,
                        bound.relativePath(),
                        bound.bytes(),
                        bound.sha256(),
                        "wrong:source-goal-references"));
        assertThatThrownBy(() -> PackageSourceEvidenceState.load(
                        invalidBindingSnapshot,
                        bindingRuntime.domainState(),
                        bindingRuntime.artifactReader(),
                        objectMapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("invalid semantic binding");

        RuntimeFixture driftRuntime = runtime("drift", false);
        CurriculumRuntimeSnapshot.Artifact driftArtifact = sourceEvidenceArtifact(driftRuntime.snapshot());
        Files.write(
                driftRuntime.fixture().packageRoot().resolve(driftArtifact.relativePath()),
                "{}".getBytes(java.nio.charset.StandardCharsets.UTF_8));
        assertThatThrownBy(() -> PackageSourceEvidenceState.load(
                        driftRuntime.snapshot(),
                        driftRuntime.domainState(),
                        driftRuntime.artifactReader(),
                        objectMapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("drift");
    }

    private void expectMutationFailure(
            String suffix,
            Consumer<ObjectNode> mutation,
            String expectedMessage) throws Exception {
        RuntimeFixture runtime = runtime(suffix, false);
        CurriculumRuntimeSnapshot snapshot = mutateSourceEvidence(runtime, mutation);
        assertThatThrownBy(() -> PackageSourceEvidenceState.load(
                        snapshot, runtime.domainState(), runtime.artifactReader(), objectMapper))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining(expectedMessage);
    }

    private CurriculumRuntimeSnapshot mutateSourceEvidence(
            RuntimeFixture runtime,
            Consumer<ObjectNode> mutation) throws Exception {
        CurriculumRuntimeSnapshot.Artifact original = sourceEvidenceArtifact(runtime.snapshot());
        Path path = runtime.fixture().packageRoot().resolve(original.relativePath());
        ObjectNode root = (ObjectNode) objectMapper.readTree(path.toFile());
        mutation.accept(root);
        byte[] bytes = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(root);
        Files.write(path, bytes);
        CurriculumRuntimeSnapshot.Artifact replacement = copyArtifact(
                original,
                original.relativePath(),
                bytes.length,
                CurriculumPackageFileReader.sha256(bytes),
                original.logicalId());
        return replaceSourceEvidenceArtifact(runtime.snapshot(), replacement);
    }

    private RuntimeFixture runtime(String suffix, boolean mixedSourceEvidence) throws Exception {
        CurriculumPackageTestFixture.PackageSpec spec =
                CurriculumPackageTestFixture.PackageSpec.packageSpec(suffix, 'a');
        return runtime(spec, mixedSourceEvidence);
    }

    private RuntimeFixture runtime(
            CurriculumPackageTestFixture.PackageSpec spec,
            boolean mixedSourceEvidence) throws Exception {
        CurriculumPackageTestFixture fixtureBuilder = new CurriculumPackageTestFixture(objectMapper);
        String suffix = spec.suffix();
        CurriculumPackageTestFixture.TestStore store = mixedSourceEvidence
                ? fixtureBuilder.createWithMixedSourceEvidence(tempDir.resolve("store-" + suffix), spec)
                : fixtureBuilder.create(tempDir.resolve("store-" + suffix), spec);
        CurriculumPackageFileReader fileReader = new CurriculumPackageFileReader();
        CurriculumPackageArtifactReader artifactReader = new CurriculumPackageArtifactReader(fileReader);
        CurriculumPackageProperties properties = new CurriculumPackageProperties();
        properties.setSource(CurriculumSourceMode.PACKAGE);
        properties.getPackages().setStoreDirectory(store.root().toString());
        CurriculumRuntimeSnapshot snapshot = new JsonCurriculumPackageLoader(
                properties,
                new FileSystemCurriculumPackageRepository(properties, objectMapper, fileReader),
                fileReader,
                objectMapper).load();
        PackageCurriculumDomainState domainState = PackageCurriculumDomainState.load(
                snapshot, artifactReader, objectMapper);
        return new RuntimeFixture(
                snapshot, domainState, artifactReader, store.packages().getFirst());
    }

    private static ObjectNode firstCollection(ObjectNode root) {
        return (ObjectNode) root.withArray("collections").get(0);
    }

    private static ObjectNode firstSourceGoal(ObjectNode root) {
        return (ObjectNode) firstCollection(root).withArray("sourceGoals").get(0);
    }

    private static CurriculumRuntimeSnapshot.Artifact sourceEvidenceArtifact(
            CurriculumRuntimeSnapshot snapshot) {
        return snapshot.artifactsByRole().get("source-goal-reference-index").getFirst();
    }

    private static CurriculumRuntimeSnapshot withoutSourceEvidence(CurriculumRuntimeSnapshot snapshot) {
        Map<CurriculumRuntimeSnapshot.ArtifactKey, CurriculumRuntimeSnapshot.Artifact> artifacts =
                new LinkedHashMap<>(snapshot.artifactsByKey());
        CurriculumRuntimeSnapshot.Artifact artifact = sourceEvidenceArtifact(snapshot);
        artifacts.remove(new CurriculumRuntimeSnapshot.ArtifactKey(
                artifact.packageId(), artifact.relativePath()));
        return copySnapshot(snapshot, artifacts);
    }

    private static CurriculumRuntimeSnapshot replaceSourceEvidenceArtifact(
            CurriculumRuntimeSnapshot snapshot,
            CurriculumRuntimeSnapshot.Artifact replacement) {
        Map<CurriculumRuntimeSnapshot.ArtifactKey, CurriculumRuntimeSnapshot.Artifact> artifacts =
                new LinkedHashMap<>(snapshot.artifactsByKey());
        artifacts.put(
                new CurriculumRuntimeSnapshot.ArtifactKey(
                        replacement.packageId(), replacement.relativePath()),
                replacement);
        return copySnapshot(snapshot, artifacts);
    }

    private static CurriculumRuntimeSnapshot copySnapshot(
            CurriculumRuntimeSnapshot snapshot,
            Map<CurriculumRuntimeSnapshot.ArtifactKey, CurriculumRuntimeSnapshot.Artifact> artifacts) {
        return new CurriculumRuntimeSnapshot(
                snapshot.generationSha256(),
                snapshot.packages(),
                snapshot.rootLandscapeIds(),
                snapshot.landscapesById(),
                snapshot.viewsById(),
                snapshot.offeringsById(),
                snapshot.decksByKey(),
                snapshot.resourcesById(),
                snapshot.resourcesByPublicUrl(),
                artifacts,
                snapshot.migrationAliasesJsonByPackageId(),
                snapshot.definitionCount());
    }

    private static CurriculumRuntimeSnapshot.Artifact copyArtifact(
            CurriculumRuntimeSnapshot.Artifact original,
            String relativePath,
            long bytes,
            String sha256,
            String logicalId) {
        return new CurriculumRuntimeSnapshot.Artifact(
                original.installedPackage(),
                relativePath,
                original.role(),
                original.mediaType(),
                bytes,
                sha256,
                original.runtimeRequired(),
                original.semanticBindingKind(),
                logicalId,
                original.normalizationRole(),
                original.resourceId(),
                original.validationSchemaId(),
                original.licenseExpression(),
                original.provenanceClass(),
                original.redistributionStatus());
    }

    private record RuntimeFixture(
            CurriculumRuntimeSnapshot snapshot,
            PackageCurriculumDomainState domainState,
            CurriculumPackageArtifactReader artifactReader,
            CurriculumPackageTestFixture.PackageFixture fixture) {
    }
}
