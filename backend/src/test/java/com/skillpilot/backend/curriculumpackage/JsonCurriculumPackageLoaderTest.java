package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class JsonCurriculumPackageLoaderTest {

    @TempDir
    Path tempDir;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void buildsImmutableManifestAndCatalogDrivenSnapshot() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));

        CurriculumRuntimeSnapshot snapshot = loader(store.root(), null).load();
        CurriculumPackageTestFixture.PackageFixture expected = store.packages().getFirst();

        assertThat(snapshot.packages()).hasSize(1);
        assertThat(snapshot.packages().getFirst().capabilities())
                .containsExactly("compositionViews", "memoryCards", "goalVisualizations");
        assertThat(snapshot.packages().getFirst().scopeDimensions())
                .extracting(CurriculumRuntimeSnapshot.ScopeDimension::id)
                .containsExactly("schoolForm", "courseProfile");
        assertThat(snapshot.packages().getFirst().scopeDimensions().get(1).composites())
                .containsExactly(new CurriculumRuntimeSnapshot.ScopeComposite(
                        "GK+LK", java.util.List.of("GK", "LK")));
        assertThat(new CurriculumPackageProperties().getConsumerVersion()).isEqualTo("0.1.0");
        assertThat(snapshot.rootLandscapeIds()).containsExactly(expected.landscapeId());
        assertThat(snapshot.landscapesById()).containsOnlyKeys(expected.landscapeId());
        assertThat(snapshot.viewsById()).containsOnlyKeys(expected.viewId());
        assertThat(snapshot.viewsById().get(expected.viewId()).language()).isEqualTo("de-DE");
        assertThat(snapshot.offeringsById()).containsOnlyKeys(expected.offeringId());
        assertThat(snapshot.offeringsById().get(expected.offeringId()).packageId())
                .isEqualTo("org.example.alpha");
        assertThat(snapshot.offeringsById().get(expected.offeringId()).resolutionMode())
                .isEqualTo("single");
        assertThat(snapshot.offeringsById().get(expected.offeringId()).mergeDimension()).isNull();
        assertThat(snapshot.decksByKey()).containsKey(new CurriculumRuntimeSnapshot.DeckKey(
                "org.example.alpha", expected.deckId(), "de-DE"));
        assertThat(snapshot.resourcesById()).containsOnlyKeys(
                expected.resourceId(), expected.externalResourceId());
        assertThat(snapshot.resourcesByPublicUrl()).containsOnlyKeys(expected.publicUrl());
        assertThat(snapshot.resourcesById().get(expected.externalResourceId()).externalUrl())
                .isEqualTo(expected.externalUrl());
        assertThat(snapshot.resourcesById().get(expected.externalResourceId()).resourceKind())
                .isEqualTo("tool");
        assertThat(snapshot.resourcesById().get(expected.externalResourceId()).catalogResourceKind())
                .isEqualTo("external-tool");
        CurriculumRuntimeSnapshot.Artifact auditArtifact = snapshot.artifactsByKey().get(
                new CurriculumRuntimeSnapshot.ArtifactKey("org.example.alpha", "metadata/audit.json"));
        assertThat(snapshot.artifactsByKey()).hasSize(13);
        assertThat(auditArtifact.runtimeRequired()).isFalse();
        assertThat(auditArtifact.semanticBindingKind()).isEqualTo("excluded-generated");
        assertThat(auditArtifact.licenseExpression()).isEqualTo("Apache-2.0");
        assertThat(auditArtifact.provenanceClass()).isEqualTo("software-contract");
        assertThat(auditArtifact.redistributionStatus()).isEqualTo("allowed");
        assertThat(snapshot.artifactsByRole().get("binary-asset"))
                .singleElement()
                .satisfies(artifact -> {
                    assertThat(artifact.resourceId()).isEqualTo(expected.resourceId());
                    assertThat(artifact.runtimeRequired()).isTrue();
                });
        assertThat(snapshot.artifactsByRole().get("mapping"))
                .singleElement()
                .satisfies(artifact -> {
                    assertThat(artifact.runtimeRequired()).isFalse();
                    assertThat(artifact.normalizationRole()).isEqualTo("source-to-canonical-mappings");
                });
        assertThat(snapshot.artifactsByRole().get("source-index"))
                .singleElement()
                .satisfies(artifact -> {
                    assertThat(artifact.runtimeRequired()).isFalse();
                    assertThat(artifact.normalizationRole()).isEqualTo("official-source-index");
                });
        assertThat(snapshot.definitionCount()).isEqualTo(1);
        assertThat(snapshot.landscapesById()).isUnmodifiable();
        assertThat(snapshot.rootLandscapeIds()).isUnmodifiable();
        assertThat(snapshot.resourcesById().get(expected.resourceId()).artifact().getClass().getMethods())
                .noneMatch(method -> method.getReturnType().equals(Path.class));
        assertThat(snapshot.artifactsByKey()).isUnmodifiable();
        assertThat(snapshot.artifactsByRole()).isUnmodifiable();
    }

    @Test
    void readsOnlySnapshotBoundArtifactsAndReverifiesEveryAccess() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumRuntimeSnapshot snapshot = loader(store.root(), "0.1.0").load();
        CurriculumPackageArtifactReader reader = new CurriculumPackageArtifactReader(
                new CurriculumPackageFileReader());
        CurriculumRuntimeSnapshot.ArtifactKey key = new CurriculumRuntimeSnapshot.ArtifactKey(
                "org.example.alpha", "assets/fixture.png");

        assertThat(reader.readVerified(snapshot, key, 4)).containsExactly(1, 2, 3, 4);
        assertThatThrownBy(() -> reader.readVerified(snapshot, key, 3))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("caller byte limit");
        assertThatThrownBy(() -> reader.readVerified(
                snapshot,
                new CurriculumRuntimeSnapshot.ArtifactKey("org.example.alpha", "assets/missing.png"),
                4))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("not part of the active snapshot");

        Files.write(store.packages().getFirst().packageRoot().resolve("assets/fixture.png"),
                new byte[] {4, 3, 2, 1});
        assertThatThrownBy(() -> reader.readVerified(snapshot, key, 4))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("SHA-256 drift");
    }

    @Test
    void rejectsConsumerVersionOutsideManifestRange() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));

        assertThatThrownBy(() -> loader(store.root(), "1.0.0").load())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("outside supportedSkillpilotSoftware");
    }

    @Test
    void prereleaseConsumerDoesNotSatisfyItsFinalReleaseLowerBound() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));

        assertThatThrownBy(() -> loader(store.root(), "0.1.0-rc.1").load())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("outside supportedSkillpilotSoftware");
    }

    @Test
    void rejectsRuntimeArtifactTamperBeforePublishingSnapshot() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        Files.writeString(store.packages().getFirst().packageRoot().resolve("data/views/fixture.view.json"), "{}\n");

        assertThatThrownBy(() -> loader(store.root(), "0.1.0").load())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("byte length drift");
    }

    @Test
    void rejectsTamperOfManifestRecordedNonRuntimeArtifact() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        Files.writeString(store.packages().getFirst().packageRoot().resolve("metadata/audit.json"), "{}\n");

        assertThatThrownBy(() -> loader(store.root(), "0.1.0").load())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("byte length drift");
    }

    @Test
    void deduplicatesIdenticalCrossPackageDefinitionBindings() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("beta", 'b'));

        CurriculumRuntimeSnapshot snapshot = loader(store.root(), "0.1.0").load();

        assertThat(snapshot.packages()).hasSize(2);
        assertThat(snapshot.definitionCount()).isEqualTo(1);
        assertThat(snapshot.landscapesById()).hasSize(2);
    }

    @Test
    void rejectsSameDefinitionKeyWithDifferentOwnerOrDigest() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.PackageSpec alpha = CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        CurriculumPackageTestFixture.PackageSpec betaBase = CurriculumPackageTestFixture.PackageSpec.packageSpec("beta", 'b');
        CurriculumPackageTestFixture.PackageSpec beta = new CurriculumPackageTestFixture.PackageSpec(
                betaBase.suffix(),
                betaBase.packageId(),
                betaBase.landscapeId(),
                betaBase.hashCharacter(),
                betaBase.closureHashCharacter(),
                betaBase.indexHashCharacter(),
                betaBase.definitionKey(),
                "org.example.different-owner",
                betaBase.definitionDigest(),
                null,
                false,
                "https");
        CurriculumPackageTestFixture.TestStore store = fixture.create(tempDir.resolve("store"), alpha, beta);

        assertThatThrownBy(() -> loader(store.root(), "0.1.0").load())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Cross-package definition conflict");
    }

    @Test
    void rejectsLandscapeIdCollisionAcrossLockedPackages() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.PackageSpec alpha = CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        CurriculumPackageTestFixture.PackageSpec betaBase = CurriculumPackageTestFixture.PackageSpec.packageSpec("beta", 'b');
        CurriculumPackageTestFixture.PackageSpec beta = new CurriculumPackageTestFixture.PackageSpec(
                betaBase.suffix(),
                betaBase.packageId(),
                alpha.landscapeId(),
                betaBase.hashCharacter(),
                betaBase.closureHashCharacter(),
                betaBase.indexHashCharacter(),
                betaBase.definitionKey(),
                betaBase.definitionOwner(),
                betaBase.definitionDigest(),
                null,
                false,
                "https");
        CurriculumPackageTestFixture.TestStore store = fixture.create(tempDir.resolve("store"), alpha, beta);

        assertThatThrownBy(() -> loader(store.root(), "0.1.0").load())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Ambiguous landscapeId");
    }

    @Test
    void rejectsModuleLandscapeCollisionWithEarlierRootLandscape() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.PackageSpec alpha = CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        CurriculumPackageTestFixture.PackageSpec betaBase = CurriculumPackageTestFixture.PackageSpec.packageSpec("beta", 'b');
        CurriculumPackageTestFixture.PackageSpec beta = new CurriculumPackageTestFixture.PackageSpec(
                betaBase.suffix(),
                betaBase.packageId(),
                betaBase.landscapeId(),
                betaBase.hashCharacter(),
                betaBase.closureHashCharacter(),
                betaBase.indexHashCharacter(),
                betaBase.definitionKey(),
                betaBase.definitionOwner(),
                betaBase.definitionDigest(),
                alpha.landscapeId(),
                false,
                "https");
        CurriculumPackageTestFixture.TestStore store = fixture.create(tempDir.resolve("store"), alpha, beta);

        assertThatThrownBy(() -> loader(store.root(), "0.1.0").load())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Ambiguous landscapeId");
    }

    @Test
    void loadsCanonicalModuleAndPreservesItsParentBinding() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.PackageSpec base =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("module", 'd');
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
                "landscape-module-child",
                false,
                "https");
        CurriculumPackageTestFixture.TestStore store = fixture.create(tempDir.resolve("store"), withModule);

        CurriculumRuntimeSnapshot snapshot = loader(store.root(), "0.1.0").load();
        CurriculumRuntimeSnapshot.LandscapeDescriptor module =
                snapshot.landscapesById().get("landscape-module-child");

        assertThat(snapshot.rootLandscapeIds()).containsExactly(base.landscapeId());
        assertThat(module.role()).isEqualTo("module");
        assertThat(module.parentLandscapeId()).isEqualTo(base.landscapeId());
        assertThat(module.artifact().role()).isEqualTo("canonical-landscape");
    }

    @Test
    void preservesOrderedMergeResolutionAndCompositeDefinition() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.PackageSpec base =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("merge", 'c');
        CurriculumPackageTestFixture.PackageSpec merge = new CurriculumPackageTestFixture.PackageSpec(
                base.suffix(),
                base.packageId(),
                base.landscapeId(),
                base.hashCharacter(),
                base.closureHashCharacter(),
                base.indexHashCharacter(),
                base.definitionKey(),
                base.definitionOwner(),
                base.definitionDigest(),
                null,
                true,
                "https");
        CurriculumPackageTestFixture.TestStore store = fixture.create(tempDir.resolve("store"), merge);

        CurriculumRuntimeSnapshot snapshot = loader(store.root(), "0.1.0").load();
        CurriculumRuntimeSnapshot.OfferingDescriptor offering =
                snapshot.offeringsById().get(store.packages().getFirst().offeringId());

        assertThat(offering.resolutionMode()).isEqualTo("merge");
        assertThat(offering.mergeDimension()).isEqualTo("courseProfile");
        assertThat(offering.viewIds()).containsExactly("view-merge", "view-merge-secondary");
        assertThat(offering.scope()).containsEntry("courseProfile", "GK+LK");
    }

    @Test
    void rejectsNonHttpsExternalResourceUrl() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.PackageSpec base =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("http-resource", 'b');
        CurriculumPackageTestFixture.PackageSpec insecure = new CurriculumPackageTestFixture.PackageSpec(
                base.suffix(),
                base.packageId(),
                base.landscapeId(),
                base.hashCharacter(),
                base.closureHashCharacter(),
                base.indexHashCharacter(),
                base.definitionKey(),
                base.definitionOwner(),
                base.definitionDigest(),
                null,
                false,
                "http");
        CurriculumPackageTestFixture.TestStore store = fixture.create(tempDir.resolve("store"), insecure);

        assertThatThrownBy(() -> loader(store.root(), "0.1.0").load())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("unsafe externalUrl");
    }

    private JsonCurriculumPackageLoader loader(Path storeRoot, String consumerVersion) {
        CurriculumPackageProperties properties = new CurriculumPackageProperties();
        properties.setSource(CurriculumSourceMode.PACKAGE);
        if (consumerVersion != null) {
            properties.setConsumerVersion(consumerVersion);
        }
        properties.getPackages().setStoreDirectory(storeRoot.toString());
        CurriculumPackageFileReader reader = new CurriculumPackageFileReader();
        CurriculumPackageRepository repository = new FileSystemCurriculumPackageRepository(
                properties, objectMapper, reader);
        return new JsonCurriculumPackageLoader(properties, repository, reader, objectMapper);
    }
}
