package com.skillpilot.backend.claude.mcp;

import com.skillpilot.backend.actionregression.ActionRegressionService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class ClaudeMcpConfigurationTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(ActionRegressionService.class, () -> mock(ActionRegressionService.class))
            .withUserConfiguration(ClaudeMcpConfiguration.class);

    @Test
    void isOffByDefault() {
        contextRunner.run(context -> {
            assertThat(context).doesNotHaveBean(ActionRegressionMcpTools.class);
            assertThat(context).doesNotHaveBean(ToolCallbackProvider.class);
        });
    }

    @Test
    void registersOnlyWhenExplicitlyEnabled() {
        contextRunner
                .withPropertyValues(
                        "skillpilot.claude.mcp.enabled=true",
                        "skillpilot.claude.mcp.regression-enabled=true")
                .run(context -> {
                    assertThat(context).hasSingleBean(ActionRegressionMcpTools.class);
                    assertThat(context).hasSingleBean(ToolCallbackProvider.class);
                });
    }
}
