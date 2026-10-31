package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.completion.*;
import com.skillpilot.backend.landscape.*;
import com.skillpilot.backend.service.DeckResourceService;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.ObjectProvider;

/** Loader tests use synthetic provisioner evidence; real ZIP validation is tested by the package pipeline. */
class CompletionPackageLoaderTest {
    @TempDir Path temporary;
    final ObjectMapper mapper = new ObjectMapper();
    static final String PROFILE = "completion-fixture";
    static final String REVIEW = "data/completion/reviews/review.json";
    static final String SCOPE_PATH = "data/completion/scopes/scope.json";
    static final String PROFILE_PATH = "data/completion/profiles/profile.json";
    static final String EXT_SCHEMA = "https://skillpilot.com/schemas/curriculum-package/v1.1/completion-artifact.schema.json";

    @Test void publishesImmutableReviewedPackageDocumentsAndCatalogWithoutRepositoryAccess() throws Exception {
        Fixture fixture = fixture();
        JsonCurriculumPackageLoader loader = fixture.loader();
        var provider = new CurriculumRuntimeSnapshotProvider(loader);
        var snapshot = provider.current();
        var documents = CompletionPackageCatalog.load(snapshot, mapper);
        assertThat(documents.profiles()).containsOnlyKeys(PROFILE);
        assertThat(documents.scopes()).containsOnlyKeys(PROFILE);
        @SuppressWarnings("unchecked")
        ObjectProvider<CurriculumRuntimeSnapshotProvider> snapshots = mock(ObjectProvider.class);
        when(snapshots.getIfAvailable()).thenReturn(provider);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(temporary.resolve("nonexistent-repository").toString());
        LandscapeService landscapes = mock(LandscapeService.class);
        GoalMappingService mappings = mock(GoalMappingService.class);
        DeckResourceService decks = mock(DeckResourceService.class);
        var catalog = new CompletionProfileCatalog(properties, mapper, landscapes, mappings, decks,
                true, "", "package", snapshots);
        assertThat(catalog.available()).isTrue();
        assertThat(catalog.generation()).isEqualTo(snapshot.generationSha256());
        assertThat(catalog.automatic()).isTrue();
        assertThat(catalog.profiles()).isEmpty();
        verifyNoInteractions(landscapes, mappings, decks);
        Files.writeString(fixture.root.resolve(REVIEW), "later-corruption");
        assertThat(CompletionPackageCatalog.load(snapshot, mapper).profiles()).containsOnlyKeys(PROFILE);
    }

    @Test void automaticCatalogUsesVerifiedPackageWithoutCompletionCapabilityOrProfiles() throws Exception {
        var helper = new CurriculumPackageTestFixture(mapper);
        var store = helper.create(temporary.resolve("ordinary-package"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("ordinary", 'c'));
        var properties = new CurriculumPackageProperties();
        properties.setSource(CurriculumSourceMode.PACKAGE);
        properties.setConsumerVersion("0.1.0");
        properties.getPackages().setStoreDirectory(store.root().toString());
        var reader = new CurriculumPackageFileReader();
        var repository = new FileSystemCurriculumPackageRepository(properties, mapper, reader);
        var provider = new CurriculumRuntimeSnapshotProvider(new JsonCurriculumPackageLoader(
                properties, repository, reader, mapper));
        var snapshot = provider.current();
        assertThat(snapshot.packages()).allSatisfy(p ->
                assertThat(p.capabilities()).doesNotContain(CompletionPackageCatalog.CAPABILITY));
        @SuppressWarnings("unchecked")
        ObjectProvider<CurriculumRuntimeSnapshotProvider> snapshots = mock(ObjectProvider.class);
        when(snapshots.getIfAvailable()).thenReturn(provider);
        var landscapes = mock(LandscapeService.class);
        var mappings = mock(GoalMappingService.class);
        var decks = mock(DeckResourceService.class);
        var catalog = new CompletionProfileCatalog(new LandscapeProperties(), mapper, landscapes, mappings, decks,
                true, "obsolete-pilot", "package", snapshots);
        assertThat(catalog.available()).isTrue();
        assertThat(catalog.automatic()).isTrue();
        assertThat(catalog.profiles()).isEmpty();
        assertThat(catalog.generation()).isEqualTo(snapshot.generationSha256());
        verifyNoInteractions(landscapes, mappings, decks);
    }

    @Test void rejectsMissingCapabilityAndOldRuntimePretendingToCarryCompletion() throws Exception {
        Fixture fixture = fixture();
        ObjectNode catalog = fixture.read("data/runtime/catalog.json");
        ((ArrayNode) catalog.get("capabilities")).remove(catalog.get("capabilities").size() - 1);
        fixture.write("data/runtime/catalog.json", catalog);
        assertThatThrownBy(() -> fixture.loader().load()).isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("exact runtime 1.1");
    }

    @Test void rejectsTaskAndGoalSemanticDriftDespiteFreshFileDigests() throws Exception {
        Fixture fixture = fixture();
        ObjectNode landscape = fixture.read("data/canonical/landscape.json");
        ((ObjectNode) landscape.withArray("goals").get(2)).put("description", "Unreviewed changed outcome");
        fixture.write("data/canonical/landscape.json", landscape);
        assertThatThrownBy(() -> fixture.loader().load()).isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Stale completion review");
    }

    @Test void rejectsUnknownLearnerResultFieldsAndForeignReviewPaths() throws Exception {
        Fixture fixture = fixture();
        ObjectNode profile = fixture.read(PROFILE_PATH);
        ((ObjectNode) profile.get("definition")).put("mastery", true);
        fixture.write(PROFILE_PATH, profile);
        assertThatThrownBy(() -> fixture.loader().load()).isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Invalid reviewed completion package");
        ((ObjectNode) profile.get("definition")).remove("mastery");
        ((ObjectNode) profile.path("definition").path("review")).put("reference", "data/elsewhere/review.json");
        fixture.write(PROFILE_PATH, profile);
        assertThatThrownBy(() -> fixture.loader().load()).isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("missing package-local review");
    }

    @Test void rejectsReviewIdentityDifferentFromItsPackagePath() throws Exception {
        Fixture fixture = fixture();
        ObjectNode review = fixture.read(REVIEW);
        review.put("id", "another-review");
        fixture.write(REVIEW, review);
        ObjectNode catalog = fixture.read("data/runtime/catalog.json");
        for (JsonNode entry : catalog.withArray("completionArtifacts")) {
            if ("review".equals(entry.path("kind").asText())) ((ObjectNode) entry).put("id", "another-review");
        }
        fixture.write("data/runtime/catalog.json", catalog);
        for (JsonNode file : fixture.manifest.withArray("files")) {
            if (REVIEW.equals(file.path("path").asText())) {
                ((ObjectNode) file.path("semanticBinding")).put("logicalId", "another-review");
            }
        }
        assertThatThrownBy(() -> fixture.loader().load()).isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("identity must equal its package-local artifact path");
    }

    private Fixture fixture() throws Exception {
        var helper = new CurriculumPackageTestFixture(mapper);
        var store = helper.create(temporary.resolve(UUID.randomUUID().toString()),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("completion", 'b'));
        Path root = store.packages().getFirst().packageRoot();
        ObjectNode manifest = (ObjectNode) helper.readJson(root.resolve("metadata/manifest.json"));
        ObjectNode landscape = (ObjectNode) helper.readJson(root.resolve("data/canonical/landscape.json"));
        ObjectNode ordinary = mapper.createObjectNode().put("id", "preparation").put("title", "Explain addition")
                .put("description", "Explain addition").put("type", "atomic");
        ordinary.putArray("contains"); ordinary.putArray("requires");
        ObjectNode exam = mapper.createObjectNode().put("id", "assessment").put("title", "Addition assessment")
                .put("type", "atomic").put("nodeKind", "exam");
        exam.putArray("contains"); exam.putArray("requires").add("preparation");
        ObjectNode data = exam.putObject("examData");
        data.put("taskContent", "Explain two plus two.").put("solutionContent", "Two pairs make four.");
        data.putObject("scoring").put("maxPoints", 1).put("passingPoints", 1).putArray("steps");
        landscape.withArray("goals").add(ordinary).add(exam);
        helper.writeJson(root.resolve("data/canonical/landscape.json"), landscape);
        var scope = new CompletionScopeDefinition(1, PROFILE, "1", Map.of("de", "Addition", "en", "Addition"),
                List.of("preparation", "assessment"));
        JsonNode scopeDocument = mapper.valueToTree(scope);
        String scopeHash = CompletionReviewBindings.canonicalHash(mapper.valueToTree(Map.of(
                "scope", scopeDocument, "targetGoals", List.of(exam, ordinary))), mapper);
        String taskHash = CompletionReviewBindings.canonicalHash(mapper.valueToTree(Map.of(
                "taskContent", data.get("taskContent"), "solutionContent", data.get("solutionContent"))), mapper);
        String rubricHash = CompletionReviewBindings.canonicalHash(data.get("scoring"), mapper);
        var profile = new CompletionProfileDefinition(1, PROFILE, "1", Map.of("de", "Addition", "en", "Addition"),
                PROFILE, Map.of(), List.of(), new CompletionProfileDefinition.Review(REVIEW, scopeHash, taskHash, rubricHash),
                List.of(new CompletionProfileDefinition.WaiverRule("addition", List.of("assessment"),
                        List.of("preparation"), "All scored work covers the one target", REVIEW)));
        Fixture fixture = new Fixture(root, manifest, store.packages().getFirst().lockEntry());
        fixture.add(SCOPE_PATH, "scope", PROFILE, mapper.valueToTree(scope));
        fixture.add(PROFILE_PATH, "profile", PROFILE, mapper.valueToTree(profile));
        String review = "Machine-only synthetic review. No learner data.";
        fixture.add(REVIEW, "review", REVIEW, mapper.valueToTree(Map.of("mediaType", "text/markdown", "content", review,
                "sha256", CurriculumPackageFileReader.sha256(review.getBytes(StandardCharsets.UTF_8)))));
        ObjectNode catalog = fixture.read("data/runtime/catalog.json");
        catalog.put("$schema", "https://skillpilot.com/schemas/curriculum-package/v1.1/runtime-catalog.schema.json")
                .put("catalogVersion", "1.1").put("runtimeContractVersion", "1.1");
        catalog.withArray("capabilities").add("assessmentCompletionV1");
        ArrayNode discovery = catalog.putArray("completionArtifacts");
        for (String[] entry : List.of(new String[]{PROFILE, "scope", SCOPE_PATH},
                new String[]{PROFILE, "profile", PROFILE_PATH}, new String[]{REVIEW, "review", REVIEW})) {
            discovery.addObject().put("id", entry[0]).put("kind", entry[1]).put("artifactPath", entry[2]);
        }
        fixture.write("data/runtime/catalog.json", catalog);
        manifest.put("runtimeContractVersion", "1.1").put("releaseProfile", "full-standalone-completion-v1");
        return fixture;
    }

    private class Fixture {
        final Path root; final ObjectNode manifest; final Map<String, Object> originalLock;
        Fixture(Path root, ObjectNode manifest, Map<String, Object> originalLock) {
            this.root = root; this.manifest = manifest; this.originalLock = originalLock;
        }
        ObjectNode read(String path) throws Exception { return (ObjectNode) mapper.readTree(root.resolve(path).toFile()); }
        void write(String path, Object value) throws Exception {
            Files.createDirectories(root.resolve(path).getParent());
            Files.write(root.resolve(path), mapper.writeValueAsBytes(value));
        }
        void add(String path, String kind, String id, JsonNode definition) throws Exception {
            write(path, Map.of("artifactFormatVersion", 1, "artifactKind", kind, "id", id, "definition", definition));
            manifest.withArray("files").addObject().put("path", path).put("role", "completion-" +
                    (kind.equals("review") ? "rule-review" : kind)).put("mediaType", "application/json")
                    .put("runtimeRequired", true).put("validationSchemaId", EXT_SCHEMA)
                    .put("licenseExpression", "CC-BY-4.0").put("provenanceClass", "first-party-content")
                    .put("redistributionStatus", "allowed").set("semanticBinding", mapper.valueToTree(Map.of(
                            "kind", "logical-artifact", "logicalId", id, "normalizationRole", "completion-" +
                                    (kind.equals("review") ? "rule-review" : kind))));
        }
        JsonCurriculumPackageLoader loader() throws Exception {
            for (JsonNode file : manifest.withArray("files")) {
                byte[] bytes = Files.readAllBytes(root.resolve(file.path("path").asText()));
                ((ObjectNode) file).put("bytes", bytes.length).put("sha256", CurriculumPackageFileReader.sha256(bytes));
            }
            byte[] manifestBytes = mapper.writeValueAsBytes(manifest);
            Files.write(root.resolve("metadata/manifest.json"), manifestBytes);
            var old = originalLock;
            var entry = new CurriculumPackageLock.Entry((String) old.get("packageId"), (String) old.get("packageVersion"),
                    (String) old.get("releaseId"), (String) old.get("outerZipSha256"), CurriculumPackageFileReader.sha256(manifestBytes),
                    (String) old.get("contentDigest"), (String) old.get("archiveRoot"), (String) old.get("closureDigest"),
                    (String) old.get("definitionIndexDigest"), (String) old.get("installRecordSha256"));
            CurriculumPackageRepository repository = () -> new CurriculumPackageRepository.ActivePackageSet("fixture-lock",
                    List.of(new InstalledCurriculumPackage(entry, root, manifest.path("files").size())));
            var properties = new CurriculumPackageProperties(); properties.setConsumerVersion("0.1.0");
            return new JsonCurriculumPackageLoader(properties, repository, new CurriculumPackageFileReader(), mapper);
        }
    }
}
