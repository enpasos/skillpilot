package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.curriculumpackage.CurriculumSourceConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

class CurriculumQualitySnapshotProviderModeTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(ObjectMapper.class, ObjectMapper::new)
            .withUserConfiguration(CurriculumSourceConfiguration.class, ProviderConfiguration.class);

    @Test
    void repositoryModeSelectsOnlyRepositoryProvider() {
        contextRunner
                .withPropertyValues("skillpilot.curriculum.source=repository")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(CurriculumQualitySnapshotProvider.class);
                    assertThat(context).hasSingleBean(RepositoryCurriculumQualitySnapshotProvider.class);
                    assertThat(context).doesNotHaveBean(PackageCurriculumQualitySnapshotProvider.class);
                });
    }

    @Test
    void packageModeSelectsOnlyRepositoryFreePackageProvider() {
        contextRunner
                .withPropertyValues("skillpilot.curriculum.source=package")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(CurriculumQualitySnapshotProvider.class);
                    assertThat(context).hasSingleBean(PackageCurriculumQualitySnapshotProvider.class);
                    assertThat(context).doesNotHaveBean(RepositoryCurriculumQualitySnapshotProvider.class);
                    CurriculumQualitySnapshotProvider.CurriculumQualitySnapshot snapshot =
                            context.getBean(CurriculumQualitySnapshotProvider.class).load();
                    assertThat(snapshot.byLandscapeId()).isEmpty();
                    assertThat(snapshot.canonicalSubjects()).isEmpty();
                });
    }

    @Configuration(proxyBeanMethods = false)
    @Import({
        RepositoryCurriculumQualitySnapshotProvider.class,
        PackageCurriculumQualitySnapshotProvider.class
    })
    static class ProviderConfiguration {
    }
}
