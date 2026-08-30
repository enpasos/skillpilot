package com.skillpilot.backend.goalfeedback;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

class GoalFeedbackFeatureActivationTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(FilterConfiguration.class);

    @Test
    void featureIsOffByDefault() {
        contextRunner.run(context -> {
            assertThat(context).hasNotFailed();
            assertThat(context).doesNotHaveBean(GoalFeedbackOperatorAuthenticationFilter.class);
        });
    }

    @Test
    void enabledFeatureFailsStartupWithoutADedicatedStrongToken() {
        contextRunner
                .withPropertyValues(
                        "skillpilot.goal-feedback.enabled=true",
                        "skillpilot.goal-feedback.operator-token=too-short")
                .run(context -> assertThat(context.getStartupFailure())
                        .hasRootCauseInstanceOf(IllegalStateException.class)
                        .hasStackTraceContaining("requires SKILLPILOT_GOAL_FEEDBACK_OPERATOR_TOKEN"));
    }

    @Test
    void enabledFeatureStartsItsOperatorBoundaryWithAStrongDedicatedToken() {
        contextRunner
                .withPropertyValues(
                        "skillpilot.goal-feedback.enabled=true",
                        "skillpilot.goal-feedback.operator-token=production-operator-token-at-least-32-bytes")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(GoalFeedbackOperatorAuthenticationFilter.class);
                });
    }

    @Configuration(proxyBeanMethods = false)
    @Import(GoalFeedbackOperatorAuthenticationFilter.class)
    static class FilterConfiguration {
    }
}
