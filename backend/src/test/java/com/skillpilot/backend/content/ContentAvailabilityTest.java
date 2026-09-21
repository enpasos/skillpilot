package com.skillpilot.backend.content;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

class ContentAvailabilityTest {
    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(ContentConfiguration.class)
            .withBean(ContentCatalog.class, () -> new ContentCatalog(List.of()))
            .withBean(ContentSelectionService.class, () -> mock(ContentSelectionService.class));

    @Test
    void materialSettingsAndResolverAreEnabledByDefault() {
        contextRunner.run(context -> {
            assertThat(context).hasNotFailed();
            var availability = context.getBean(ContentAvailability.class);
            assertThat(availability.isEnabled()).isTrue();
            assertThatCode(availability::requireEnabled).doesNotThrowAnyException();
            context.getBean(ContentMaterialResolver.class).resolve("learner", "goal", "de");
            verify(context.getBean(ContentSelectionService.class)).selectedPackageIds("learner");
        });
    }

    @Test
    void globalOperationalSwitchDisablesSettingsAndMaterialReads() {
        contextRunner.withPropertyValues("skillpilot.content.enabled=false").run(context -> {
            assertThat(context).hasNotFailed();
            var availability = context.getBean(ContentAvailability.class);
            assertThat(availability.isEnabled()).isFalse();
            assertThatThrownBy(availability::requireEnabled).isInstanceOfSatisfying(ResponseStatusException.class,
                    exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));
            assertThat(context.getBean(ContentMaterialResolver.class).resolve("learner", "goal", "de")).isEmpty();
            verifyNoInteractions(context.getBean(ContentSelectionService.class));
        });
    }

    @Configuration(proxyBeanMethods = false)
    @Import({ContentAvailability.class, ContentMaterialResolver.class})
    static class ContentConfiguration {}
}
