package com.skillpilot.backend.openai;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class OpenAiRuntimeEnvironmentValidationConfigurationTest {

    @Test
    void acceptsLineSpecificAndProcessSharedNames() {
        OpenAiRuntimeEnvironmentValidationConfiguration.requireNoForbiddenNames(List.of(
                "SKILLPILOT_OPENAI_COACH_V1_ENABLED",
                "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET",
                "SKILLPILOT_OPENAI_COACH_V1_OPENAI_APPS_CHALLENGE",
                "SKILLPILOT_OPENAI_SECURE_COOKIE",
                "SKILLPILOT_OPENAI_RATE_LIMIT_ENABLED"));
    }

    @Test
    void rejectsLegacyAndPublicUrlOverrideNamesWithoutReceivingValues() {
        assertThatExceptionOfType(IllegalStateException.class)
                .isThrownBy(() -> OpenAiRuntimeEnvironmentValidationConfiguration
                        .requireNoForbiddenNames(List.of(
                                "SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET",
                                "SKILLPILOT_OPENAI_EN_OAUTH_CLIENT_SECRET",
                                "SKILLPILOT_OPENAI_COACH_V1_MCP_URL",
                                "SKILLPILOT_OPENAI_COACH_V1_TYPO",
                                "SKILLPILOT_OPENAI_COACH_DE_V2_ENABLED",
                                "SKILLPILOT_OPENAI_COACH_EN_V1_ENABLED",
                                "SKILLPILOT_OPENAI_APPS_CHALLENGE")))
                .withMessageContaining("SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET")
                .withMessageContaining("SKILLPILOT_OPENAI_EN_OAUTH_CLIENT_SECRET")
                .withMessageContaining("SKILLPILOT_OPENAI_COACH_V1_MCP_URL")
                .withMessageContaining("SKILLPILOT_OPENAI_COACH_V1_TYPO")
                .withMessageContaining("SKILLPILOT_OPENAI_COACH_DE_V2_ENABLED")
                .withMessageContaining("SKILLPILOT_OPENAI_COACH_EN_V1_ENABLED")
                .withMessageContaining("SKILLPILOT_OPENAI_APPS_CHALLENGE")
                .withMessageContaining("environment values were not inspected");
    }

    @Test
    void validatesAtStartupEvenWhenTheV1LineIsDisabled() {
        new ApplicationContextRunner()
                .withUserConfiguration(OpenAiRuntimeEnvironmentValidationConfiguration.class)
                .withPropertyValues("skillpilot.openai.coach.v1.enabled=false")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(InitializingBean.class);
                });
    }
}
