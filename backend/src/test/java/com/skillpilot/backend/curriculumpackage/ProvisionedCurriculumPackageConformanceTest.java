package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

/**
 * Loads the real content-addressed Mathematics store produced earlier by the
 * repository-wide conformance lane. Standalone backend jobs skip this test because
 * their checkout intentionally has no 1.7-GB release artifact.
 */
class ProvisionedCurriculumPackageConformanceTest {

    @Test
    void loadsTheRealProvisionedMathematicsReleaseWithoutRepositoryDiscovery() {
        String configuredStore = System.getenv("SKILLPILOT_CONFORMANCE_PACKAGE_STORE");
        Assumptions.assumeTrue(
                configuredStore != null && !configuredStore.isBlank(),
                "real package store is supplied only by repository-wide conformance");
        Path store = Path.of(configuredStore).toAbsolutePath().normalize();
        Assumptions.assumeTrue(
                Files.isRegularFile(store.resolve("locks/active.json")),
                "real provisioned active lock is unavailable");

        CurriculumPackageProperties properties = new CurriculumPackageProperties();
        properties.setSource(CurriculumSourceMode.PACKAGE);
        properties.setConsumerVersion("0.1.0");
        properties.getPackages().setStoreDirectory(store.toString());
        CurriculumPackageFileReader reader = new CurriculumPackageFileReader();
        ObjectMapper mapper = new ObjectMapper();
        CurriculumPackageRepository repository = new FileSystemCurriculumPackageRepository(
                properties, mapper, reader);

        CurriculumRuntimeSnapshot snapshot = new JsonCurriculumPackageLoader(
                properties, repository, reader, mapper).load();

        assertThat(snapshot.packages()).hasSize(1);
        assertThat(snapshot.packages().getFirst().packageId())
                .isEqualTo("org.skillpilot.curriculum.de.gymnasium.mathematik");
        assertThat(snapshot.packages().getFirst().contentDigest())
                .isEqualTo("sha256:3b44444b50b41f45ec1cb12d4d912a4524effe9d560d539788cfe36d4d7ffc60");
        assertThat(snapshot.rootLandscapeIds()).hasSize(1);
        assertThat(snapshot.landscapesById()).hasSize(1);
        assertThat(snapshot.viewsById()).hasSize(88);
        assertThat(snapshot.offeringsById()).hasSize(88);
        assertThat(snapshot.decksByKey()).hasSize(12);
        assertThat(snapshot.resourcesById()).hasSize(825);
        assertThat(snapshot.resourcesByPublicUrl()).hasSize(756);
        assertThat(snapshot.artifactsByKey()).hasSize(911);
        assertThat(snapshot.artifactsByRole().get("mapping"))
                .singleElement()
                .satisfies(artifact -> {
                    assertThat(artifact.runtimeRequired()).isFalse();
                    assertThat(artifact.normalizationRole()).isEqualTo("source-to-canonical-mappings");
                });
        assertThat(snapshot.artifactsByRole().get("quality-evidence"))
                .singleElement()
                .satisfies(artifact -> assertThat(artifact.runtimeRequired()).isFalse());
        assertThat(snapshot.definitionCount()).isEqualTo(2402);
    }
}
