package com.skillpilot.backend.claude.mcp;

import com.skillpilot.backend.ai.CoachToolFacade;
import com.skillpilot.backend.service.ClaudeCoachConnectionService;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(
        name = {"skillpilot.claude.enabled", "skillpilot.claude.mcp.enabled"},
        havingValue = "true")
public class ClaudeCoachMcpConfiguration {

    @Bean
    ClaudeCoachMcpTools claudeCoachMcpTools(
            CoachToolFacade coachTools,
            ClaudeCoachConnectionService connectionService) {
        return new ClaudeCoachMcpTools(coachTools, connectionService);
    }

    @Bean
    ToolCallbackProvider claudeCoachMcpToolCallbacks(ClaudeCoachMcpTools tools) {
        return MethodToolCallbackProvider.builder().toolObjects(tools).build();
    }
}
