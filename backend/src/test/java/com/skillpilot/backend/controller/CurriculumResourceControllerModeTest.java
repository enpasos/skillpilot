package com.skillpilot.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.skillpilot.backend.curriculumpackage.PackageCurriculumResourceState;
import com.skillpilot.backend.service.DeckResourceService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class CurriculumResourceControllerModeTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(DeckResourceService.class, () -> mock(DeckResourceService.class))
            .withBean(PackageCurriculumResourceState.class, () -> mock(PackageCurriculumResourceState.class))
            .withUserConfiguration(
                    AssetController.class,
                    DeckDataController.class,
                    RepositorySourceRationaleController.class,
                    PackageCurriculumResourceController.class);

    @Test
    void repositoryModeCreatesOnlyRepositoryFallbackControllers() {
        contextRunner
                .withPropertyValues("skillpilot.curriculum.source=repository")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(AssetController.class);
                    assertThat(context).hasSingleBean(DeckDataController.class);
                    assertThat(context).hasSingleBean(RepositorySourceRationaleController.class);
                    assertThat(context).doesNotHaveBean(PackageCurriculumResourceController.class);
                });
    }

    @Test
    void packageModeCreatesOnlyPackageAuthoritativeController() {
        contextRunner
                .withPropertyValues(
                        "skillpilot.curriculum.source=package",
                        "skillpilot.assets.directory=/repository-poison")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).doesNotHaveBean(AssetController.class);
                    assertThat(context).doesNotHaveBean(DeckDataController.class);
                    assertThat(context).doesNotHaveBean(RepositorySourceRationaleController.class);
                    assertThat(context).hasSingleBean(PackageCurriculumResourceController.class);
                });
    }
}
