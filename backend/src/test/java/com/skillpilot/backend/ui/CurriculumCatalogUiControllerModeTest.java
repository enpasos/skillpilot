package com.skillpilot.backend.ui;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.skillpilot.backend.curriculumpackage.CurriculumCatalogService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class CurriculumCatalogUiControllerModeTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(CurriculumCatalogService.class, () -> mock(CurriculumCatalogService.class))
            .withUserConfiguration(CurriculumCatalogUiController.class);

    @Test
    void repositoryModeDoesNotExposeThePackageCatalogEndpoint() {
        contextRunner
                .withPropertyValues("skillpilot.curriculum.source=repository")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).doesNotHaveBean(CurriculumCatalogUiController.class);
                });
    }

    @Test
    void packageModeExposesTheCatalogEndpoint() {
        contextRunner
                .withPropertyValues("skillpilot.curriculum.source=package")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(CurriculumCatalogUiController.class);
                });
    }
}
