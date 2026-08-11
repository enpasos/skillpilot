package com.skillpilot.backend.openai.de.bootstrap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class OpenAiDeBootstrapControllerConditionalTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(OpenAiDeBootstrapAttemptService.class, () -> mock(OpenAiDeBootstrapAttemptService.class))
            .withBean(ObjectMapper.class, ObjectMapper::new)
            .withUserConfiguration(OpenAiDeBootstrapController.class)
            .withPropertyValues(
                    "skillpilot.openai.coach.v1.enabled=true",
                    "skillpilot.openai.coach.v1.oauth.enabled=true");

    @Test
    void bootstrapControllerIsAbsentUnlessTheInternalCanaryIsExplicitlyEnabled() {
        contextRunner.run(context -> assertThat(context)
                .doesNotHaveBean(OpenAiDeBootstrapController.class));
    }

    @Test
    void bootstrapControllerExistsOnlyWithTheExplicitInternalCanary() {
        contextRunner
                .withPropertyValues("skillpilot.openai.coach.v1.bootstrap-enabled=true")
                .run(context -> assertThat(context)
                        .hasSingleBean(OpenAiDeBootstrapController.class));
    }
}
