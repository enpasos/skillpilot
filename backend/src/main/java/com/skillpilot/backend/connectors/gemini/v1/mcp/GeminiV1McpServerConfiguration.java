package com.skillpilot.backend.connectors.gemini.v1.mcp;

import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Contract;
import com.skillpilot.backend.connectors.gemini.v1.GeminiV1Properties;
import com.skillpilot.backend.connectors.gemini.v1.ConditionalOnGeminiV1Enabled;
import com.skillpilot.backend.mcp.SkillPilotStatelessMcpServerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

/**
 * Registers the provider-isolated Gemini v1 MCP server at its dedicated internal endpoint.
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnGeminiV1Enabled
public class GeminiV1McpServerConfiguration {

    @Bean(name = "geminiV1McpServerRegistration", destroyMethod = "close")
    public SkillPilotStatelessMcpServerFactory.Registration geminiV1McpServerRegistration(
            SkillPilotStatelessMcpServerFactory serverFactory,
            GeminiV1McpContractAdapter contract,
            GeminiV1Properties properties) {
        return serverFactory.create(
                GeminiV1Contract.INTERNAL_MCP_PATH,
                properties.getServerName(),
                properties.getServerVersion(),
                contract.serverInstructions(),
                properties.getRequestTimeout(),
                contract.toolSpecifications(),
                contract.resourceSpecifications());
    }

    @Bean(name = "geminiV1McpRouterFunction")
    public RouterFunction<ServerResponse> geminiV1McpRouterFunction(
            @Qualifier("geminiV1McpServerRegistration")
                    SkillPilotStatelessMcpServerFactory.Registration registration) {
        return registration.routerFunction();
    }
}
