package com.skillpilot.backend.openai.mcp.de;

import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1McpContractAdapter;
import com.skillpilot.backend.mcp.SkillPilotStatelessMcpServerFactory;
import com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV1ContractMetadata;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

/** Registers only the German OpenAI coach contract at its dedicated MCP endpoint. */
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(
        name = {
                "skillpilot.openai.de.enabled",
                "skillpilot.openai.de.oauth.enabled",
                "skillpilot.openai.de.mcp.enabled"
        },
        havingValue = "true")
public class OpenAiDeMcpServerConfiguration {

    static final String DEFAULT_ENDPOINT = OpenAiDeV1ContractMetadata.INTERNAL_MCP_PATH;
    static final String DEFAULT_SERVER_NAME = OpenAiDeV1ContractMetadata.PLUGIN_IDENTITY;
    static final String DEFAULT_SERVER_VERSION = OpenAiDeV1ContractMetadata.DEFAULT_SERVER_BUILD;
    static final Duration DEFAULT_REQUEST_TIMEOUT = Duration.ofSeconds(30);

    @Bean(name = "openAiDeMcpServerRegistration", destroyMethod = "close")
    SkillPilotStatelessMcpServerFactory.Registration openAiDeMcpServerRegistration(
            SkillPilotStatelessMcpServerFactory serverFactory,
            OpenAiDeV1McpContractAdapter contract,
            Environment environment) {
        return serverFactory.create(
                DEFAULT_ENDPOINT,
                environment.getProperty("skillpilot.openai.de.mcp.server-name", DEFAULT_SERVER_NAME),
                environment.getProperty("skillpilot.openai.de.mcp.server-version", DEFAULT_SERVER_VERSION),
                contract.serverInstructions(),
                environment.getProperty(
                        "skillpilot.openai.de.mcp.request-timeout",
                        Duration.class,
                        DEFAULT_REQUEST_TIMEOUT),
                contract.toolSpecifications(),
                contract.resourceSpecifications());
    }

    @Bean(name = "openAiDeMcpRouterFunction")
    RouterFunction<ServerResponse> openAiDeMcpRouterFunction(
            @Qualifier("openAiDeMcpServerRegistration")
                    SkillPilotStatelessMcpServerFactory.Registration registration) {
        return registration.routerFunction();
    }
}
