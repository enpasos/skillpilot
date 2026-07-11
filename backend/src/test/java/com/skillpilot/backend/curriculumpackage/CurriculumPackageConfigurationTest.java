package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class CurriculumPackageConfigurationTest {

    @TempDir
    Path tempDir;

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(ObjectMapper.class, ObjectMapper::new)
            .withUserConfiguration(
                    CurriculumSourceConfiguration.class,
                    CurriculumPackageConfiguration.class);

    @Test
    void repositoryModeDoesNotCreateAnyPackageRuntimeBeans() {
        contextRunner
                .withPropertyValues("skillpilot.curriculum.source=repository")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).doesNotHaveBean(CurriculumPackageRepository.class);
                    assertThat(context).doesNotHaveBean(CurriculumRuntimeSnapshotProvider.class);
                });
    }

    @Test
    void packageModeBuildsSnapshotAtStartupFromTheExactLock() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));

        contextRunner
                .withPropertyValues(
                        "skillpilot.curriculum.source=package",
                        "skillpilot.curriculum.packages.store-directory=" + store.root(),
                        "skillpilot.curriculum.packages.active-lock=locks/active.json")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(CurriculumPackageRepository.class);
                    assertThat(context).hasSingleBean(CurriculumRuntimeSnapshotProvider.class);
                    assertThat(context.getBean(CurriculumRuntimeSnapshotProvider.class)
                            .current().packages()).hasSize(1);
                });
    }

    @Test
    void packageModeFailsStartupInsteadOfFallingBackWhenLockIsMissing() {
        contextRunner
                .withPropertyValues(
                        "skillpilot.curriculum.source=package",
                        "skillpilot.curriculum.packages.store-directory=" + tempDir.resolve("missing"))
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure()).hasRootCauseInstanceOf(CurriculumPackageException.class);
                });
    }

    @Test
    void unknownSourceModeFailsBindingInsteadOfStartingRepositoryMode() {
        contextRunner
                .withPropertyValues("skillpilot.curriculum.source=typo")
                .run(context -> assertThat(context).hasFailed());
    }
}
