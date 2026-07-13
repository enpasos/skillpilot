package com.skillpilot.backend.claude.mcp;

import com.skillpilot.backend.actionregression.ActionRegressionService;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(
        prefix = "skillpilot.claude.mcp",
        name = {"enabled", "regression-enabled"},
        havingValue = "true")
public class ClaudeMcpConfiguration {

    @Bean
    ActionRegressionMcpTools actionRegressionMcpTools(ActionRegressionService regressionService) {
        return new ActionRegressionMcpTools(regressionService);
    }

    @Bean
    ToolCallbackProvider claudeMcpToolCallbacks(ActionRegressionMcpTools tools) {
        return MethodToolCallbackProvider.builder().toolObjects(tools).build();
    }
}
