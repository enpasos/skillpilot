package com.skillpilot.backend.claude.mcp;

import com.skillpilot.backend.mcp.SkillPilotStatelessMcpServerFactory;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.ai.mcp.McpToolUtils;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

/** Registers the Claude MCP endpoint with an explicit, Claude-only tool allowlist. */
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(
        name = {"skillpilot.claude.enabled", "skillpilot.claude.mcp.enabled"},
        havingValue = "true")
public class ClaudeMcpServerConfiguration {

    static final String DEFAULT_ENDPOINT = "/api/claude/mcp";
    static final String DEFAULT_SERVER_NAME = "skillpilot-claude-mcp";
    static final String DEFAULT_SERVER_VERSION = "0.1.0";
    static final Duration DEFAULT_REQUEST_TIMEOUT = Duration.ofSeconds(30);
    static final String DEFAULT_INSTRUCTIONS = """
            Follow the user's explicit request and the descriptions of the currently available tools.
            When getCoachContext is available and the request is a coaching task, call it first and
            follow state.stateMachine.requiredAction. After changing coach state, reload the context
            before making another coaching decision. Preserve backend-provided fields unchanged when
            passing them between tools. When getCoachContext returns a language, answer in that language;
            otherwise continue in the user's language. Never ask for or expose a permanent SkillPilot ID
            or an OAuth credential.
            """;

    @Bean(name = "claudeMcpServerRegistration", destroyMethod = "close")
    SkillPilotStatelessMcpServerFactory.Registration claudeMcpServerRegistration(
            SkillPilotStatelessMcpServerFactory serverFactory,
            Environment environment,
            @Qualifier("claudeCoachMcpToolCallbacks")
                    ObjectProvider<ToolCallbackProvider> coachToolProvider,
            @Qualifier("claudeMcpToolCallbacks")
                    ObjectProvider<ToolCallbackProvider> regressionToolProvider) {
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = new ArrayList<>();
        appendTools(tools, coachToolProvider.getIfAvailable());
        appendTools(tools, regressionToolProvider.getIfAvailable());

        return serverFactory.create(
                DEFAULT_ENDPOINT,
                environment.getProperty("skillpilot.claude.mcp.server-name", DEFAULT_SERVER_NAME),
                environment.getProperty("skillpilot.claude.mcp.server-version", DEFAULT_SERVER_VERSION),
                environment.getProperty("skillpilot.claude.mcp.instructions", DEFAULT_INSTRUCTIONS),
                environment.getProperty(
                        "skillpilot.claude.mcp.request-timeout",
                        Duration.class,
                        DEFAULT_REQUEST_TIMEOUT),
                tools);
    }

    @Bean(name = "claudeMcpRouterFunction")
    RouterFunction<ServerResponse> claudeMcpRouterFunction(
            @Qualifier("claudeMcpServerRegistration")
                    SkillPilotStatelessMcpServerFactory.Registration registration) {
        return registration.routerFunction();
    }

    private static void appendTools(
            List<McpStatelessServerFeatures.SyncToolSpecification> target,
            ToolCallbackProvider provider) {
        if (provider == null) {
            return;
        }
        Arrays.stream(provider.getToolCallbacks())
                .map(callback -> McpToolUtils.toStatelessSyncToolSpecification(callback, null))
                .forEach(target::add);
    }
}
