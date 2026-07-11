package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class CurriculumRuntimeSnapshotProviderTest {

    @TempDir
    Path tempDir;

    @Test
    void failedReloadKeepsTheExactPreviousSnapshot() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        CurriculumPackageProperties properties = new CurriculumPackageProperties();
        properties.setSource(CurriculumSourceMode.PACKAGE);
        properties.setConsumerVersion("0.1.0");
        properties.getPackages().setStoreDirectory(store.root().toString());
        CurriculumPackageFileReader reader = new CurriculumPackageFileReader();
        CurriculumPackageRepository repository = new FileSystemCurriculumPackageRepository(
                properties, objectMapper, reader);
        JsonCurriculumPackageLoader loader = new JsonCurriculumPackageLoader(
                properties, repository, reader, objectMapper);
        CurriculumRuntimeSnapshotProvider provider = new CurriculumRuntimeSnapshotProvider(loader);
        CurriculumRuntimeSnapshot original = provider.current();
        Files.writeString(store.packages().getFirst().packageRoot().resolve("assets/fixture.png"), "tampered");

        assertThatThrownBy(provider::reload).isInstanceOf(CurriculumPackageException.class);
        assertThat(provider.current()).isSameAs(original);
        assertThat(provider.current().generationSha256()).isEqualTo(original.generationSha256());
    }
}
