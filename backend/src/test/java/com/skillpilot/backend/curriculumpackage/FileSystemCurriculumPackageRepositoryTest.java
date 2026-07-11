package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class FileSystemCurriculumPackageRepositoryTest {

    @TempDir
    Path tempDir;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void loadsOnlyTheExactPrevalidatedContentAddressedObject() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));

        CurriculumPackageRepository.ActivePackageSet active = repository(store.root()).loadActivePackageSet();

        assertThat(active.lockSha256()).hasSize(64);
        assertThat(active.packages()).hasSize(1);
        assertThat(active.packages().getFirst().lockEntry().packageId()).isEqualTo("org.example.alpha");
        assertThat(active.packages().getFirst().lockEntry().closureDigest()).startsWith("sha256:");
    }

    @Test
    void rejectsUnknownLockFields() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        ObjectNode lock = (ObjectNode) fixture.readJson(store.lockPath());
        lock.put("latest", true);
        fixture.writeJson(store.lockPath(), lock);

        assertThatThrownBy(() -> repository(store.root()).loadActivePackageSet())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("fields differ");
    }

    @Test
    void rejectsTrailingJsonTokensInActiveLock() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        Files.writeString(store.lockPath(), "{}", java.nio.file.StandardOpenOption.APPEND);

        assertThatThrownBy(() -> repository(store.root()).loadActivePackageSet())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Cannot parse active package lock");
    }

    @Test
    void rejectsUnboundedActivePackageSetBeforeObjectLoading() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        ObjectNode lock = (ObjectNode) fixture.readJson(store.lockPath());
        JsonNode entry = lock.withArray("packages").get(0).deepCopy();
        while (lock.withArray("packages").size() <= 256) {
            lock.withArray("packages").add(entry.deepCopy());
        }
        fixture.writeJson(store.lockPath(), lock);

        assertThatThrownBy(() -> repository(store.root()).loadActivePackageSet())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("exceeds 256 packages");
    }

    @Test
    void rejectsUnsortedMultiPackageLockInsteadOfUsingInstallOrder() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("zeta", 'a'),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'b'));

        assertThatThrownBy(() -> repository(store.root()).loadActivePackageSet())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("strictly sorted by packageId");
    }

    @Test
    void rejectsSymlinkedActiveLock() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        Path realLock = tempDir.resolve("real-lock.json");
        Files.move(store.lockPath(), realLock);
        Files.createSymbolicLink(store.lockPath(), realLock);

        assertThatThrownBy(() -> repository(store.root()).loadActivePackageSet())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("regular non-symlink file");
    }

    @Test
    void rejectsSymlinkInConfiguredStoreRootChain() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("real-store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        Path linkedStore = tempDir.resolve("linked-store");
        Files.createSymbolicLink(linkedStore, store.root());

        assertThatThrownBy(() -> repository(linkedStore).loadActivePackageSet())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("real directory");
    }

    @Test
    void rejectsValidationReportTamper() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        Files.writeString(store.packages().getFirst().validationReportPath(), "{}\n");

        assertThatThrownBy(() -> repository(store.root()).loadActivePackageSet())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Validation report SHA-256 drift");
    }

    @Test
    void rejectsManifestTamperEvenThoughObjectDirectoryNameStillMatches() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        Files.writeString(store.packages().getFirst().manifestPath(), "{}\n");

        assertThatThrownBy(() -> repository(store.root()).loadActivePackageSet())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Manifest SHA-256 drift");
    }

    @Test
    void reportV2RejectsSubstitutedExtractedPayloadDespiteReboundLockAndReceipt() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumPackageTestFixture.PackageFixture packageFixture = store.packages().getFirst();
        byte[] genuineReport = Files.readAllBytes(packageFixture.validationReportPath());

        byte[] substitutedPayload = "{\"landscapeId\":\"landscape-alpha\",\"goals\":[]}\n".getBytes();
        Files.write(packageFixture.packageRoot().resolve("data/canonical/landscape.json"), substitutedPayload);
        ObjectNode manifest = (ObjectNode) fixture.readJson(packageFixture.manifestPath());
        for (JsonNode record : manifest.withArray("files")) {
            if ("data/canonical/landscape.json".equals(record.path("path").asText())) {
                ((ObjectNode) record).put("bytes", substitutedPayload.length);
                ((ObjectNode) record).put("sha256", CurriculumPackageFileReader.sha256(substitutedPayload));
            }
        }
        fixture.writeJson(packageFixture.manifestPath(), manifest);
        String substitutedManifestSha = CurriculumPackageFileReader.sha256(
                Files.readAllBytes(packageFixture.manifestPath()));
        rebindInstallRecordAndLock(fixture, store, substitutedManifestSha, null);

        assertThat(Files.readAllBytes(packageFixture.validationReportPath())).isEqualTo(genuineReport);
        assertThatThrownBy(() -> repository(store.root()).loadActivePackageSet())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("manifestSha256");
    }

    @Test
    void rejectsPartialValidatorCountsEvenWhenReceiptAndLockAreRebound() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumPackageTestFixture.PackageFixture packageFixture = store.packages().getFirst();
        ObjectNode report = (ObjectNode) fixture.readJson(packageFixture.validationReportPath());
        ((ObjectNode) report.get("counts")).remove("binaryResources");
        fixture.writeJson(packageFixture.validationReportPath(), report);
        String reportSha = CurriculumPackageFileReader.sha256(
                Files.readAllBytes(packageFixture.validationReportPath()));
        rebindInstallRecordAndLock(fixture, store, null, reportSha);

        assertThatThrownBy(() -> repository(store.root()).loadActivePackageSet())
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("counts fields differ");
    }

    @Test
    void refusesUseOutsideExplicitPackageMode() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumPackageProperties properties = properties(store.root());
        properties.setSource(CurriculumSourceMode.REPOSITORY);
        FileSystemCurriculumPackageRepository repository = new FileSystemCurriculumPackageRepository(
                properties,
                objectMapper,
                new CurriculumPackageFileReader());

        assertThatThrownBy(repository::loadActivePackageSet)
                .isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("source=package");
    }

    private FileSystemCurriculumPackageRepository repository(Path storeRoot) {
        return new FileSystemCurriculumPackageRepository(
                properties(storeRoot),
                objectMapper,
                new CurriculumPackageFileReader());
    }

    private CurriculumPackageProperties properties(Path storeRoot) {
        CurriculumPackageProperties properties = new CurriculumPackageProperties();
        properties.setSource(CurriculumSourceMode.PACKAGE);
        properties.setConsumerVersion("0.1.0");
        properties.getPackages().setStoreDirectory(storeRoot.toString());
        return properties;
    }

    private void rebindInstallRecordAndLock(
            CurriculumPackageTestFixture fixture,
            CurriculumPackageTestFixture.TestStore store,
            String manifestSha256,
            String validationReportSha256) throws Exception {
        CurriculumPackageTestFixture.PackageFixture packageFixture = store.packages().getFirst();
        ObjectNode installRecord = (ObjectNode) fixture.readJson(packageFixture.installRecordPath());
        if (manifestSha256 != null) {
            installRecord.put("manifestSha256", manifestSha256);
        }
        if (validationReportSha256 != null) {
            installRecord.put("validationReportSha256", validationReportSha256);
        }
        fixture.writeJson(packageFixture.installRecordPath(), installRecord);
        String installRecordSha = CurriculumPackageFileReader.sha256(
                Files.readAllBytes(packageFixture.installRecordPath()));

        ObjectNode lock = (ObjectNode) fixture.readJson(store.lockPath());
        ObjectNode entry = (ObjectNode) lock.withArray("packages").get(0);
        if (manifestSha256 != null) {
            entry.put("manifestSha256", manifestSha256);
        }
        entry.put("installRecordSha256", installRecordSha);
        fixture.writeJson(store.lockPath(), lock);
    }
}
