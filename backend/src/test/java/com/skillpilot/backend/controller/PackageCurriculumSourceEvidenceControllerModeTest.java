package com.skillpilot.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.skillpilot.backend.curriculumpackage.PackageSourceEvidenceState;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class PackageCurriculumSourceEvidenceControllerModeTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(PackageSourceEvidenceState.class, () -> mock(PackageSourceEvidenceState.class))
            .withUserConfiguration(PackageCurriculumSourceEvidenceController.class);

    @Test
    void repositoryModeDoesNotExposePackageEvidenceOrFallbackController() {
        contextRunner
                .withPropertyValues("skillpilot.curriculum.source=repository")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).doesNotHaveBean(PackageCurriculumSourceEvidenceController.class);
                });
    }

    @Test
    void packageModeExposesSourceEvidenceController() {
        contextRunner
                .withPropertyValues("skillpilot.curriculum.source=package")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(PackageCurriculumSourceEvidenceController.class);
                });
    }
}
