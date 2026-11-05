package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LearningUnitOfferPackageLoaderTest {
    private static final String BASE = "full-standalone-learning-units-v1";
    private static final String OFFER = "full-standalone-learning-unit-offers-v1";
    @TempDir Path directory;
    private final ObjectMapper mapper = new ObjectMapper();
    private int storeSequence;

    @Test void oldS2PairAndDiscoveredCatalogIdentityRemainSupported() throws Exception {
        var store = store(false, false, false, false);
        var snapshot = loader(store.root()).load();
        assertThat(snapshot.packages().getFirst().capabilities()).contains("learningUnitRecognitionV1")
                .doesNotContain("learningUnitOfferBindingsV1");
        assertThat(snapshot.artifactsByRole().get("learning-unit-catalog")).singleElement()
                .satisfies(artifact -> assertThat(artifact.logicalId()).endsWith("alternate.catalog.json"));
    }

    @Test void exactOfferPairRetainsManifestBoundReviewedMappingBytes() throws Exception {
        var store = store(true, true, true, true);
        var snapshot = loader(store.root()).load();
        assertThat(snapshot.packages().getFirst().capabilities()).contains("learningUnitOfferBindingsV1");
        assertThat(snapshot.artifactsByRole().get("mapping")).singleElement().satisfies(artifact -> {
            assertThat(artifact.runtimeRequired()).isTrue();
            assertThat(artifact.contentBytes()).isNotEmpty();
        });
    }

    @Test void oldProfileCannotSilentlyDropNewOfferCapability() throws Exception {
        var store = store(false, true, true, true);
        assertThatThrownBy(() -> loader(store.root()).load()).hasMessageContaining("offer profile/schema pair");
    }

    @Test void newProfileRequiresItsCapability() throws Exception {
        var store = store(true, false, true, true);
        assertThatThrownBy(() -> loader(store.root()).load()).hasMessageContaining("offer profile/schema pair");
    }

    @Test void pointerPresenceCannotBeHiddenBehindOldCapabilitySet() throws Exception {
        var store = store(false, false, true, false);
        assertThatThrownBy(() -> loader(store.root()).load()).hasMessageContaining("offer capability/profile/schema pair");
    }

    @Test void offerProfileCannotOmitCurrentPointerOrRequiredMappings() throws Exception {
        var noPointer = store(true, true, false, true);
        assertThatThrownBy(() -> loader(noPointer.root()).load()).hasMessageContaining("offer capability/profile/schema pair");
        var optionalMapping = store(true, true, true, false);
        assertThatThrownBy(() -> loader(optionalMapping.root()).load()).hasMessageContaining("runtimeRequired mapping");
    }

    @Test void longSourcePathUsesOnlyItsExactDeterministicArtifactIdentity() throws Exception {
        String sourcePath = "DE/Gymnasium/learning-units/sources/" + "long-source-name-".repeat(11) + ".json";
        var store = store(false, false, false, false, sourcePath, null);
        var snapshot = loader(store.root()).load();
        String expected = "learning-unit-source:sha256:" + CurriculumPackageFileReader.sha256(sourcePath.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        assertThat(snapshot.artifactsByRole().get("learning-unit-catalog")).singleElement()
                .satisfies(artifact -> assertThat(artifact.logicalId()).isEqualTo(expected));
        var wrong = store(false, false, false, false, sourcePath, "learning-unit-source:sha256:" + "1".repeat(64));
        assertThatThrownBy(() -> loader(wrong.root()).load()).hasMessageContaining("identity differs from its exact source locator");
    }

    @Test void aShortSourceCannotUseAnUnnecessaryHashIdentity() throws Exception {
        String sourcePath = "DE/Gymnasium/learning-units/offers/short.json";
        String hash = "learning-unit-source:sha256:" + CurriculumPackageFileReader.sha256(sourcePath.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        var wrong = store(false, false, false, false, sourcePath, hash);
        assertThatThrownBy(() -> loader(wrong.root()).load()).hasMessageContaining("identity differs from its exact source locator");
    }

    private CurriculumPackageTestFixture.TestStore store(boolean offerProfile, boolean offerCapability,
                                                        boolean pointer, boolean requiredMapping) throws Exception {
        return store(offerProfile, offerCapability, pointer, requiredMapping, "DE/Gymnasium/learning-units/offers/alternate.catalog.json", null);
    }

    private CurriculumPackageTestFixture.TestStore store(boolean offerProfile, boolean offerCapability,
            boolean pointer, boolean requiredMapping, String sourcePath, String overrideIdentity) throws Exception {
        var fixture = new CurriculumPackageTestFixture(mapper);
        var store = fixture.create(directory.resolve("store-" + storeSequence++),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        var pkg = store.packages().getFirst();
        ObjectNode manifest = (ObjectNode) fixture.readJson(pkg.manifestPath());
        manifest.put("runtimeContractVersion", "1.2"); manifest.put("releaseProfile", offerProfile ? OFFER : BASE);
        String catalogPath = null;
        for (var file : manifest.path("files")) {
            if ("runtime-catalog".equals(file.path("role").asText())) catalogPath = file.path("path").asText();
            if ("mapping".equals(file.path("role").asText())) ((ObjectNode) file).put("runtimeRequired", requiredMapping);
        }
        ObjectNode catalog = (ObjectNode) mapper.readTree(Files.readAllBytes(pkg.packageRoot().resolve(catalogPath)));
        catalog.put("$schema", "https://skillpilot.com/schemas/curriculum-package/v1.2/"
                + (offerProfile ? "offer-runtime-catalog.schema.json" : "runtime-catalog.schema.json"));
        catalog.put("catalogVersion", "1.2"); catalog.put("runtimeContractVersion", "1.2");
        var capabilities = catalog.withArray("capabilities"); capabilities.add("learningUnitRecognitionV1");
        if (offerCapability) capabilities.add("learningUnitOfferBindingsV1");
        String identity = overrideIdentity == null ? com.skillpilot.backend.completion.learningunit.LearningUnitApplicationService.packageArtifactIdentity(sourcePath) : overrideIdentity;
        String artifactPath = "data/learning-units/catalog.json";
        ObjectNode sourceCatalog = mapper.createObjectNode(); sourceCatalog.put("schemaVersion", 1); sourceCatalog.putArray("contracts");
        if (pointer) sourceCatalog.putObject("currentOfferBinding").put("path", "DE/Gymnasium/learning-units/offers/current.json")
                .put("sha256", "1".repeat(64));
        byte[] sourceBytes = mapper.writeValueAsBytes(sourceCatalog);
        byte[] wrapper = mapper.writeValueAsBytes(Map.of("artifactFormatVersion", 1, "artifactKind", "catalog", "id", identity,
                "definition", Map.of("sourcePath", sourcePath, "contentBase64", Base64.getEncoder().encodeToString(sourceBytes),
                        "sha256", CurriculumPackageFileReader.sha256(sourceBytes))));
        Files.createDirectories(pkg.packageRoot().resolve(artifactPath).getParent()); Files.write(pkg.packageRoot().resolve(artifactPath), wrapper);
        catalog.putArray("learningUnitArtifacts").addObject().put("id", identity).put("kind", "catalog").put("artifactPath", artifactPath);
        fixture.writeJson(pkg.packageRoot().resolve(catalogPath), catalog);
        manifest.withArray("files").add(mapper.valueToTree(Map.ofEntries(Map.entry("path", artifactPath),
                Map.entry("role", "learning-unit-catalog"), Map.entry("mediaType", "application/json"),
                Map.entry("bytes", wrapper.length), Map.entry("sha256", CurriculumPackageFileReader.sha256(wrapper)),
                Map.entry("runtimeRequired", true), Map.entry("validationSchemaId", "https://skillpilot.com/schemas/curriculum-package/v1.2/learning-unit-artifact.schema.json"),
                Map.entry("semanticBinding", Map.of("kind", "logical-artifact", "logicalId", identity, "normalizationRole", "learning-unit-catalog")),
                Map.entry("licenseExpression", "Apache-2.0"), Map.entry("provenanceClass", "software-contract"), Map.entry("redistributionStatus", "allowed"))));
        for (var file : manifest.path("files")) {
            byte[] bytes = Files.readAllBytes(pkg.packageRoot().resolve(file.path("path").asText()));
            ((ObjectNode) file).put("bytes", bytes.length).put("sha256", CurriculumPackageFileReader.sha256(bytes));
        }
        fixture.writeJson(pkg.manifestPath(), manifest);
        String manifestHash = CurriculumPackageFileReader.sha256(Files.readAllBytes(pkg.manifestPath()));
        ObjectNode report = (ObjectNode) fixture.readJson(pkg.validationReportPath());
        ((ObjectNode) report.path("package")).put("manifestSha256", manifestHash);
        ObjectNode counts = (ObjectNode) report.path("counts");
        counts.put("manifestFiles", manifest.path("files").size());
        counts.put("archiveEntries", counts.path("archiveEntries").asInt() + 1);
        counts.put("logicalArtifacts", counts.path("logicalArtifacts").asInt() + 1);
        fixture.writeJson(pkg.validationReportPath(), report);
        ObjectNode install = (ObjectNode) fixture.readJson(pkg.installRecordPath());
        install.put("manifestSha256", manifestHash).put("validationReportSha256", CurriculumPackageFileReader.sha256(Files.readAllBytes(pkg.validationReportPath())));
        fixture.writeJson(pkg.installRecordPath(), install);
        ObjectNode lock = (ObjectNode) fixture.readJson(store.lockPath());
        ((ObjectNode) lock.path("packages").path(0)).put("manifestSha256", manifestHash)
                .put("installRecordSha256", CurriculumPackageFileReader.sha256(Files.readAllBytes(pkg.installRecordPath())));
        fixture.writeJson(store.lockPath(), lock);
        return store;
    }

    private JsonCurriculumPackageLoader loader(Path root) {
        var properties = new CurriculumPackageProperties(); properties.setSource(CurriculumSourceMode.PACKAGE);
        properties.getPackages().setStoreDirectory(root.toString());
        var reader = new CurriculumPackageFileReader();
        return new JsonCurriculumPackageLoader(properties, new FileSystemCurriculumPackageRepository(properties, mapper, reader), reader, mapper);
    }
}
