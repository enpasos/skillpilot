package com.skillpilot.backend.claude.mcp;

import com.skillpilot.backend.actionregression.ActionRegressionAuditLogger;
import com.skillpilot.backend.actionregression.ActionRegressionService;
import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.ai.CoachStateProjection;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import com.skillpilot.backend.service.LearnerLifecycleService;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class ClaudeCoachMcpConfigurationTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(CoachToolFacade.class, () -> mock(CoachToolFacade.class))
            .withBean(CoachStateProjection.class, () -> new CoachStateProjection("https://skillpilot.test"))
            .withBean(ClaudeCoachConnectionService.class, () -> mock(ClaudeCoachConnectionService.class))
            .withBean(LearnerLifecycleService.class, () -> mock(LearnerLifecycleService.class))
            .withUserConfiguration(ClaudeCoachMcpConfiguration.class);

    @Test
    void coachProviderIsOffByDefault() {
        contextRunner.run(context -> {
            assertThat(context).doesNotHaveBean(ClaudeCoachMcpTools.class);
            assertThat(context).doesNotHaveBean(ToolCallbackProvider.class);
        });
    }

    @Test
    void coachProviderRegistersOnlyForEnabledClaudeFeature() {
        contextRunner
                .withPropertyValues(
                        "skillpilot.claude.enabled=true",
                        "skillpilot.claude.mcp.enabled=true")
                .run(context -> {
                    assertThat(context).hasSingleBean(ClaudeCoachMcpTools.class);
                    assertThat(context).hasSingleBean(ToolCallbackProvider.class);
                    assertThat(toolNames(context.getBean(ToolCallbackProvider.class)))
                            .contains(
                                    "getCoachContext",
                                    "setScope",
                                    "setPersonalization",
                                    "setActiveGoal",
                                    "setMastery",
                                    "setCurriculum",
                                    "getExamEvaluation",
                                    "startVerifiedRecall",
                                    "getVerifiedRecallAnswer",
                                    "recordVerifiedRecallResult");
                });
    }

    @Test
    void coachProviderCanBeSuppressedForAnIsolatedRegressionRun() {
        contextRunner
                .withPropertyValues(
                        "skillpilot.claude.enabled=true",
                        "skillpilot.claude.mcp.enabled=true",
                        "skillpilot.claude.mcp.coach-enabled=false")
                .run(context -> {
                    assertThat(context).doesNotHaveBean(ClaudeCoachMcpTools.class);
                    assertThat(context).doesNotHaveBean(ToolCallbackProvider.class);
                });
    }

    @Test
    void coachAndRegressionUseSeparateCallbackProviders() {
        new ApplicationContextRunner()
                .withBean(ActionRegressionService.class, () -> mock(ActionRegressionService.class))
                .withBean(ActionRegressionAuditLogger.class, () -> mock(ActionRegressionAuditLogger.class))
                .withBean(CoachToolFacade.class, () -> mock(CoachToolFacade.class))
                .withBean(CoachStateProjection.class, () -> new CoachStateProjection("https://skillpilot.test"))
                .withBean(ClaudeCoachConnectionService.class, () -> mock(ClaudeCoachConnectionService.class))
                .withBean(LearnerLifecycleService.class, () -> mock(LearnerLifecycleService.class))
                .withUserConfiguration(ClaudeMcpConfiguration.class, ClaudeCoachMcpConfiguration.class)
                .withPropertyValues(
                        "skillpilot.claude.mcp.enabled=true",
                        "skillpilot.claude.mcp.regression-enabled=true",
                        "skillpilot.claude.enabled=true")
                .run(context -> {
                    assertThat(context.getBeansOfType(ToolCallbackProvider.class)).hasSize(2);
                    Set<String> names = context.getBeansOfType(ToolCallbackProvider.class).values().stream()
                            .flatMap(provider -> Arrays.stream(provider.getToolCallbacks()))
                            .map(callback -> callback.getToolDefinition().name())
                            .collect(Collectors.toSet());
                    assertThat(names).contains(
                            "createRegressionProbe",
                            "verifyRegressionProbe",
                            "getCoachContext",
                            "setMastery");
                });
    }

    private Set<String> toolNames(ToolCallbackProvider provider) {
        return Arrays.stream(provider.getToolCallbacks())
                .map(callback -> callback.getToolDefinition().name())
                .collect(Collectors.toSet());
    }
}
