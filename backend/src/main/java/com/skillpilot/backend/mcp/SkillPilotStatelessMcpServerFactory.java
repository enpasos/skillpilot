package com.skillpilot.backend.mcp;

import io.modelcontextprotocol.json.jackson3.JacksonMcpJsonMapper;
import io.modelcontextprotocol.json.McpJsonMapper;
import io.modelcontextprotocol.server.McpServer;
import io.modelcontextprotocol.server.McpStatelessServerFeatures;
import io.modelcontextprotocol.server.McpStatelessSyncServer;
import io.modelcontextprotocol.spec.McpSchema;
import java.time.Duration;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import org.springframework.ai.mcp.server.webmvc.transport.WebMvcStatelessServerTransport;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;
import tools.jackson.databind.json.JsonMapper;

/**
 * Creates independent stateless MCP servers inside the SkillPilot Spring Boot process.
 *
 * <p>The factory deliberately accepts native MCP tool specifications instead of discovering all
 * {@code ToolCallbackProvider} beans from the application context. This keeps provider and language
 * contracts isolated and preserves native MCP result fields such as {@code structuredContent} and
 * {@code _meta}.</p>
 */
@Component
public final class SkillPilotStatelessMcpServerFactory {

    private static final Duration DEFAULT_REQUEST_TIMEOUT = Duration.ofSeconds(30);
    private static final String MODERN_PROTOCOL_VERSION = "2026-07-28";
    private static final String PROTOCOL_VERSION_HEADER = "MCP-Protocol-Version";
    private static final String METHOD_HEADER = "Mcp-Method";
    private static final String DISCOVER_METHOD = "server/discover";

    private final McpJsonMapper jsonMapper;

    public SkillPilotStatelessMcpServerFactory(JsonMapper jsonMapper) {
        JsonMapper requiredMapper = Objects.requireNonNull(jsonMapper, "jsonMapper");
        this.jsonMapper = new SkillPilotAppsMcpJsonMapper(
                new JacksonMcpJsonMapper(requiredMapper),
                requiredMapper);
    }

    /**
     * Creates one complete MCP registration with its own transport, server, router, instructions,
     * and explicit tool allowlist.
     */
    public Registration create(
            String endpoint,
            String serverName,
            String serverVersion,
            String instructions,
            List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications) {
        return create(
                endpoint,
                serverName,
                serverVersion,
                instructions,
                DEFAULT_REQUEST_TIMEOUT,
                toolSpecifications);
    }

    public Registration create(
            String endpoint,
            String serverName,
            String serverVersion,
            String instructions,
            Duration requestTimeout,
            List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications) {
        String normalizedEndpoint = requireEndpoint(endpoint);
        String normalizedName = requireText(serverName, "serverName");
        String normalizedVersion = requireText(serverVersion, "serverVersion");
        String normalizedInstructions = requireText(instructions, "instructions");
        Duration normalizedTimeout = requirePositive(requestTimeout, "requestTimeout");
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = copyAndValidateTools(toolSpecifications);

        WebMvcStatelessServerTransport transport = WebMvcStatelessServerTransport.builder()
                .jsonMapper(jsonMapper)
                .messageEndpoint(normalizedEndpoint)
                .build();

        McpStatelessSyncServer server = McpServer.sync(transport)
                .serverInfo(normalizedName, normalizedVersion)
                .instructions(normalizedInstructions)
                .capabilities(McpSchema.ServerCapabilities.builder().tools(false).build())
                .requestTimeout(normalizedTimeout)
                .tools(tools)
                // Tool handlers rely on the request's Spring Security context. Keep execution on
                // the servlet request thread instead of moving it to a scheduler.
                .immediateExecution(true)
                .build();

        return new Registration(
                normalizedEndpoint,
                List.copyOf(tools),
                transport,
                server,
                withLegacyProtocolFallback(transport.getRouterFunction()));
    }

    /**
     * The Java MCP SDK 2.0 transport implements the initialization-based 2025-11-25 protocol. A
     * modern client probes the server with 2026-07-28 request metadata before falling back to that
     * legacy handshake. Passing the probe into the legacy SDK produces a 500 for the unknown
     * {@code server/discover} method, which prevents the client from falling back.
     *
     * <p>For Streamable HTTP, an empty 400 response identifies a legacy server. Keep this
     * compatibility signal outside the SDK transport and leave all legacy requests untouched.</p>
     */
    private static RouterFunction<ServerResponse> withLegacyProtocolFallback(
            RouterFunction<ServerResponse> routerFunction) {
        return routerFunction.filter((request, next) -> {
            String protocolVersion = request.headers().firstHeader(PROTOCOL_VERSION_HEADER);
            String method = request.headers().firstHeader(METHOD_HEADER);
            if (HttpMethod.POST.equals(request.method())
                    && (MODERN_PROTOCOL_VERSION.equals(protocolVersion)
                            || DISCOVER_METHOD.equals(method))) {
                return ServerResponse.badRequest().build();
            }
            return next.handle(request);
        });
    }

    private static String requireEndpoint(String value) {
        String endpoint = requireText(value, "endpoint");
        if (!endpoint.startsWith("/") || endpoint.endsWith("/")) {
            throw new IllegalArgumentException("endpoint must start with '/' and must not end with '/'");
        }
        return endpoint;
    }

    private static String requireText(String value, String name) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException(name + " must not be blank");
        }
        return normalized;
    }

    private static Duration requirePositive(Duration value, String name) {
        if (value == null || value.isZero() || value.isNegative()) {
            throw new IllegalArgumentException(name + " must be positive");
        }
        return value;
    }

    private static List<McpStatelessServerFeatures.SyncToolSpecification> copyAndValidateTools(
            List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications) {
        Objects.requireNonNull(toolSpecifications, "toolSpecifications");
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = List.copyOf(toolSpecifications);
        Set<String> names = new HashSet<>();
        for (McpStatelessServerFeatures.SyncToolSpecification specification : tools) {
            Objects.requireNonNull(specification, "toolSpecifications must not contain null");
            String name = requireText(specification.tool().name(), "tool name");
            if (!names.add(name)) {
                throw new IllegalArgumentException("duplicate MCP tool name: " + name);
            }
        }
        return tools;
    }

    /**
     * Spring owns this bean and invokes {@link #close()} during shutdown. The router is exposed as a
     * separate bean by the provider configuration so Spring MVC can compose multiple MCP routes.
     */
    public record Registration(
            String endpoint,
            List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications,
            WebMvcStatelessServerTransport transport,
            McpStatelessSyncServer server,
            RouterFunction<ServerResponse> routerFunction) implements AutoCloseable {

        @Override
        public void close() {
            server.close();
        }
    }
}
