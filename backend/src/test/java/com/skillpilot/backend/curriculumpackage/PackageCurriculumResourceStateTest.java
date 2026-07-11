package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class PackageCurriculumResourceStateTest {

    @TempDir
    Path tempDir;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void resolvesOnlyExactVersionedDecksAndGoalBindings() throws Exception {
        RuntimeFixture runtime = runtime("alpha", 'a');
        CurriculumPackageTestFixture.PackageFixture fixture = runtime.fixture();
        LearningGoal goal = runtime.domainState().landscapes().getFirst().getGoals().getFirst();
        goal.setTags(List.of("memorization", "srs-deck:" + fixture.deckId()));
        goal.setExtendedData(Map.of(
                "vocabularySource", "data/cards/fixture.de.json"));
        PackageCurriculumResourceState state = PackageCurriculumResourceState.load(
                runtime.snapshot(), runtime.domainState(), runtime.artifactReader());

        String expectedHref = "/api/ui/curriculum-resources/packages/org.example.alpha/1.0.0/decks/"
                + fixture.deckId() + "/de-DE";
        assertThat(state.deckHrefs()).containsEntry(
                new CurriculumRuntimeSnapshot.DeckKey(
                        "org.example.alpha", fixture.deckId(), "de-DE"),
                expectedHref);
        assertThat(state.resolveDeck(
                        "org.example.alpha", "1.0.0", fixture.deckId(), "de-DE"))
                .get()
                .satisfies(artifact -> {
                    assertThat(artifact.mediaType()).isEqualTo("application/json");
                    assertThat(artifact.filename()).isEqualTo("fixture.de.json");
                    assertThat(new String(artifact.bytes(), java.nio.charset.StandardCharsets.UTF_8))
                            .contains("\"deckId\" : \"" + fixture.deckId() + "\"");
                    byte[] mutableCopy = artifact.bytes();
                    mutableCopy[0] = 0;
                    assertThat(artifact.bytes()[0]).isNotZero();
                });
        assertThat(state.resolveGoalDeck(goal.getId(), "/data/cards/fixture.de.json"))
                .isPresent();
        assertThat(state.resolveDeck(fixture.landscapeId(), "data/cards/fixture.de.json"))
                .isPresent();

        assertThat(state.resolveDeck(
                "org.example.alpha", "1.0.1", fixture.deckId(), "de-DE")).isEmpty();
        assertThat(state.resolveDeck(
                "org.example.alpha", "1.0.0", fixture.deckId(), "de")).isEmpty();
        assertThat(state.resolveGoalDeck(goal.getId(), "fixture.de.json")).isEmpty();
        assertThat(state.resolveGoalDeck(goal.getId(), "../../fixture.de.json")).isEmpty();
        assertThat(state.deckHrefs()).isUnmodifiable();
    }

    @Test
    void rejectsMemoryGoalWhoseTagAndCataloguedSourceDisagree() throws Exception {
        RuntimeFixture runtime = runtime("alpha", 'a');
        LearningGoal goal = runtime.domainState().landscapes().getFirst().getGoals().getFirst();
        goal.setTags(List.of("srs-deck:wrong-deck"));
        goal.setExtendedData(Map.of("vocabularySource", "data/cards/fixture.de.json"));

        assertThatThrownBy(() -> PackageCurriculumResourceState.load(
                        runtime.snapshot(), runtime.domainState(), runtime.artifactReader()))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("deck tag and source disagree");

        goal.setTags(List.of("srs-deck:" + runtime.fixture().deckId(), "srs-deck:second"));
        assertThatThrownBy(() -> PackageCurriculumResourceState.load(
                        runtime.snapshot(), runtime.domainState(), runtime.artifactReader()))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("exactly one");
    }

    @Test
    void rejectsDeckWhoseManifestSemanticBindingDoesNotMatchCatalogKey() throws Exception {
        RuntimeFixture runtime = runtime("alpha", 'a');
        CurriculumRuntimeSnapshot snapshot = runtime.snapshot();
        var deckEntry = snapshot.decksByKey().entrySet().iterator().next();
        CurriculumRuntimeSnapshot.Artifact original = deckEntry.getValue().artifact();
        CurriculumRuntimeSnapshot.Artifact invalid = new CurriculumRuntimeSnapshot.Artifact(
                original.installedPackage(),
                original.relativePath(),
                original.role(),
                original.mediaType(),
                original.bytes(),
                original.sha256(),
                original.runtimeRequired(),
                original.semanticBindingKind(),
                "wrong-logical-id",
                original.normalizationRole(),
                original.resourceId(),
                original.validationSchemaId(),
                original.licenseExpression(),
                original.provenanceClass(),
                original.redistributionStatus());
        Map<CurriculumRuntimeSnapshot.DeckKey, CurriculumRuntimeSnapshot.DeckDescriptor> decks =
                new java.util.LinkedHashMap<>(snapshot.decksByKey());
        decks.put(deckEntry.getKey(), new CurriculumRuntimeSnapshot.DeckDescriptor(
                deckEntry.getKey(), deckEntry.getValue().landscapeId(), invalid, deckEntry.getValue().json()));
        CurriculumRuntimeSnapshot invalidSnapshot = new CurriculumRuntimeSnapshot(
                snapshot.generationSha256(),
                snapshot.packages(),
                snapshot.rootLandscapeIds(),
                snapshot.landscapesById(),
                snapshot.viewsById(),
                snapshot.offeringsById(),
                decks,
                snapshot.resourcesById(),
                snapshot.resourcesByPublicUrl(),
                snapshot.artifactsByKey(),
                snapshot.migrationAliasesJsonByPackageId(),
                snapshot.definitionCount());

        assertThatThrownBy(() -> PackageCurriculumResourceState.load(
                        invalidSnapshot, runtime.domainState(), runtime.artifactReader()))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("runtime card-deck artifact");
    }

    @Test
    void resolvesEmbeddedResourcesAndNeverProxiesExternalMetadata() throws Exception {
        RuntimeFixture runtime = runtime("alpha", 'a');
        CurriculumPackageTestFixture.PackageFixture fixture = runtime.fixture();
        PackageCurriculumResourceState state = PackageCurriculumResourceState.load(
                runtime.snapshot(), runtime.domainState(), runtime.artifactReader());

        String expectedHref = "/api/ui/curriculum-resources/packages/org.example.alpha/1.0.0/resources/"
                + fixture.resourceId();
        assertThat(state.resourceHrefs())
                .containsEntry(fixture.resourceId(), expectedHref)
                .containsEntry(fixture.externalResourceId(), fixture.externalUrl());
        assertThat(state.resolveResource(
                        "org.example.alpha", "1.0.0", fixture.resourceId()))
                .get()
                .satisfies(artifact -> {
                    assertThat(artifact.bytes()).containsExactly(1, 2, 3, 4);
                    assertThat(artifact.mediaType()).isEqualTo("image/png");
                    assertThat(artifact.filename()).isEqualTo("fixture.png");
                });
        assertThat(state.resolvePublicAsset(fixture.publicUrl())).isPresent();
        assertThat(state.resolveResource(
                "org.example.alpha", "1.0.0", fixture.externalResourceId())).isEmpty();
        assertThat(state.resolvePublicAsset(fixture.externalUrl())).isEmpty();
        assertThat(state.resolvePublicAsset("/assets/../fixture-alpha.png")).isEmpty();
        assertThat(state.resourceHrefs()).isUnmodifiable();
    }

    @Test
    void rejectsEmbeddedAssetsOutsideTheInterceptedVisualizationLane() throws Exception {
        RuntimeFixture runtime = runtime("alpha", 'a');
        CurriculumRuntimeSnapshot snapshot = runtime.snapshot();
        String resourceId = runtime.fixture().resourceId();
        CurriculumRuntimeSnapshot.ResourceDescriptor original = snapshot.resourcesById().get(resourceId);
        CurriculumRuntimeSnapshot.ResourceDescriptor unsupported =
                new CurriculumRuntimeSnapshot.ResourceDescriptor(
                        original.packageId(),
                        original.resourceId(),
                        original.landscapeId(),
                        original.ownerGoalId(),
                        original.resourceKind(),
                        original.catalogResourceKind(),
                        original.delivery(),
                        original.mediaType(),
                        "/assets/not-intercepted.png",
                        original.externalUrl(),
                        original.artifact());
        Map<String, CurriculumRuntimeSnapshot.ResourceDescriptor> resources =
                new java.util.LinkedHashMap<>(snapshot.resourcesById());
        resources.put(resourceId, unsupported);
        Map<String, CurriculumRuntimeSnapshot.ResourceDescriptor> resourcesByPublicUrl =
                Map.of(unsupported.publicUrl(), unsupported);
        CurriculumRuntimeSnapshot invalidSnapshot = new CurriculumRuntimeSnapshot(
                snapshot.generationSha256(),
                snapshot.packages(),
                snapshot.rootLandscapeIds(),
                snapshot.landscapesById(),
                snapshot.viewsById(),
                snapshot.offeringsById(),
                snapshot.decksByKey(),
                resources,
                resourcesByPublicUrl,
                snapshot.artifactsByKey(),
                snapshot.migrationAliasesJsonByPackageId(),
                snapshot.definitionCount());

        assertThatThrownBy(() -> PackageCurriculumResourceState.load(
                        invalidSnapshot, runtime.domainState(), runtime.artifactReader()))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("outside the supported goal-visualization lane");
    }

    @Test
    void reverifiesResourceBytesOnEveryReadWithoutFallback() throws Exception {
        RuntimeFixture runtime = runtime("alpha", 'a');
        CurriculumPackageTestFixture.PackageFixture fixture = runtime.fixture();
        PackageCurriculumResourceState state = PackageCurriculumResourceState.load(
                runtime.snapshot(), runtime.domainState(), runtime.artifactReader());
        assertThat(state.resolvePublicAsset(fixture.publicUrl())).isPresent();

        Files.write(fixture.packageRoot().resolve("assets/fixture.png"), new byte[] {4, 3, 2, 1});

        assertThatThrownBy(() -> state.resolvePublicAsset(fixture.publicUrl()))
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("SHA-256 drift");
    }

    private RuntimeFixture runtime(String suffix, char hashCharacter) throws Exception {
        CurriculumPackageTestFixture fixtureBuilder = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixtureBuilder.create(
                tempDir.resolve("store-" + suffix),
                CurriculumPackageTestFixture.PackageSpec.packageSpec(suffix, hashCharacter));
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
                snapshot,
                domainState,
                artifactReader,
                store.packages().getFirst());
    }

    private record RuntimeFixture(
            CurriculumRuntimeSnapshot snapshot,
            PackageCurriculumDomainState domainState,
            CurriculumPackageArtifactReader artifactReader,
            CurriculumPackageTestFixture.PackageFixture fixture) {
    }
}
