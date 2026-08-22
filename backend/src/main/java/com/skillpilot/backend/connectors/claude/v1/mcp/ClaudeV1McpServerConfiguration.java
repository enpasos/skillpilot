package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Contract;
import com.skillpilot.backend.connectors.claude.v1.ClaudeV1Properties;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import com.skillpilot.backend.mcp.SkillPilotStatelessMcpServerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

/**
 * Registers the provider-isolated Claude v1 MCP server at its dedicated internal endpoint.
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnClaudeV1Enabled
public class ClaudeV1McpServerConfiguration {

    @Bean(name = "claudeV1McpServerRegistration", destroyMethod = "close")
    public SkillPilotStatelessMcpServerFactory.Registration claudeV1McpServerRegistration(
            SkillPilotStatelessMcpServerFactory serverFactory,
            ClaudeV1McpContractAdapter contract,
            ClaudeV1Properties properties) {
        return serverFactory.create(
                ClaudeV1Contract.INTERNAL_MCP_PATH,
                properties.getServerName(),
                properties.getServerVersion(),
                contract.serverInstructions(),
                properties.getRequestTimeout(),
                contract.toolSpecifications(),
                contract.resourceSpecifications());
    }

    @Bean(name = "claudeV1McpRouterFunction")
    public RouterFunction<ServerResponse> claudeV1McpRouterFunction(
            @Qualifier("claudeV1McpServerRegistration")
                    SkillPilotStatelessMcpServerFactory.Registration registration) {
        return registration.routerFunction();
    }
}
