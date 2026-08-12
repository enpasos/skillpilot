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
                "SKILLPILOT_OPENAI_COACH_V1_DIAGNOSTIC_SESSION_TTL_ENABLED",
                "SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE",
                "SKILLPILOT_OPENAI_COACH_V1_OAUTH_CLIENT_SECRET",
                "SKILLPILOT_OPENAI_COACH_V1_OPENAI_APPS_CHALLENGE",
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
                                "SKILLPILOT_OPENAI_APPS_CHALLENGE",
                                "SKILLPILOT_OPENAI_SECURE_COOKIE",
                                "SKILLPILOT_OPENAI_BINDING_TTL",
                                "SKILLPILOT_OPENAI_LAUNCH_TTL",
                                "SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_REQUESTS",
                                "SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_CAPABILITY_REQUESTS",
                                "SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_PROCESS_GLOBAL_REQUESTS",
                                "SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_ISSUER_REQUESTS",
                                "SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_ISSUER_PROCESS_GLOBAL_REQUESTS")))
                .withMessageContaining("SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_SECRET")
                .withMessageContaining("SKILLPILOT_OPENAI_EN_OAUTH_CLIENT_SECRET")
                .withMessageContaining("SKILLPILOT_OPENAI_COACH_V1_MCP_URL")
                .withMessageContaining("SKILLPILOT_OPENAI_COACH_V1_TYPO")
                .withMessageContaining("SKILLPILOT_OPENAI_COACH_DE_V2_ENABLED")
                .withMessageContaining("SKILLPILOT_OPENAI_COACH_EN_V1_ENABLED")
                .withMessageContaining("SKILLPILOT_OPENAI_APPS_CHALLENGE")
                .withMessageContaining("SKILLPILOT_OPENAI_SECURE_COOKIE")
                .withMessageContaining("SKILLPILOT_OPENAI_BINDING_TTL")
                .withMessageContaining("SKILLPILOT_OPENAI_LAUNCH_TTL")
                .withMessageContaining("SKILLPILOT_OPENAI_RATE_LIMIT_BOOTSTRAP_REQUESTS")
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
