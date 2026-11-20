package com.skillpilot.backend.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import jakarta.persistence.EntityManagerFactory;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.WebApplicationContextRunner;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.orm.jpa.support.OpenEntityManagerInViewInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.handler.MappedInterceptor;
import org.springframework.web.util.ServletRequestPathUtils;

class LearnerUpdateStreamJpaConfigurationTest {
    private final WebApplicationContextRunner context = new WebApplicationContextRunner()
            .withUserConfiguration(LearnerUpdateStreamJpaConfiguration.class)
            .withBean(EntityManagerFactory.class, () -> mock(EntityManagerFactory.class));

    @Test
    void onlyTheStreamSkipsTheRequestScopedEntityManager() {
        context.run(application -> {
            assertThat(application).hasSingleBean(OpenEntityManagerInViewInterceptor.class);
            class RegisteredInterceptors extends InterceptorRegistry {
                List<Object> all() { return getInterceptors(); }
            }
            var registry = new RegisteredInterceptors();
            application.getBean(WebMvcConfigurer.class).addInterceptors(registry);
            assertThat(registry.all()).singleElement().isInstanceOfSatisfying(MappedInterceptor.class, mapped -> {
                assertThat(matches(mapped, "/api/ui/updates/learner")).isFalse();
                assertThat(matches(mapped, "/api/ui/learners/learner/mastery")).isTrue();
                assertThat(matches(mapped, "/api/ui/updates/learner/other")).isTrue();
            });
        });
    }

    @Test
    void explicitlyDisablingOpenInViewInstallsNoInterceptor() {
        context.withPropertyValues("spring.jpa.open-in-view=false").run(application ->
                assertThat(application).doesNotHaveBean(OpenEntityManagerInViewInterceptor.class)
                        .doesNotHaveBean(WebMvcConfigurer.class));
    }

    private static boolean matches(MappedInterceptor interceptor, String path) {
        var request = new MockHttpServletRequest("GET", path);
        ServletRequestPathUtils.parseAndCache(request);
        return interceptor.matches(request);
    }
}
