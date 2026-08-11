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
import org.springframework.web.servlet.function.ServerRequest;
import org.springframework.web.servlet.function.ServerResponse;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
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
    private static final String LEGACY_PROTOCOL_VERSION = "2025-11-25";
    private static final String MODERN_PROTOCOL_VERSION = "2026-07-28";
    private static final String PROTOCOL_VERSION_HEADER = "MCP-Protocol-Version";
    private static final String METHOD_HEADER = "Mcp-Method";
    private static final String NAME_HEADER = "Mcp-Name";
    private static final String DISCOVER_METHOD = "server/discover";
    private static final Set<String> LEGACY_RESOURCE_METHODS =
            Set.of("resources/list", "resources/read");

    private final JsonMapper treeMapper;
    private final McpJsonMapper jsonMapper;

    public SkillPilotStatelessMcpServerFactory(JsonMapper jsonMapper) {
        JsonMapper requiredMapper = Objects.requireNonNull(jsonMapper, "jsonMapper");
        this.treeMapper = requiredMapper;
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
                toolSpecifications,
                List.of());
    }

    public Registration create(
            String endpoint,
            String serverName,
            String serverVersion,
            String instructions,
            Duration requestTimeout,
            List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications) {
        return create(
                endpoint,
                serverName,
                serverVersion,
                instructions,
                requestTimeout,
                toolSpecifications,
                List.of());
    }

    public Registration create(
            String endpoint,
            String serverName,
            String serverVersion,
            String instructions,
            Duration requestTimeout,
            List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications,
            List<McpStatelessServerFeatures.SyncResourceSpecification> resourceSpecifications) {
        String normalizedEndpoint = requireEndpoint(endpoint);
        String normalizedName = requireText(serverName, "serverName");
        String normalizedVersion = requireText(serverVersion, "serverVersion");
        String normalizedInstructions = requireText(instructions, "instructions");
        Duration normalizedTimeout = requirePositive(requestTimeout, "requestTimeout");
        List<McpStatelessServerFeatures.SyncToolSpecification> tools = copyAndValidateTools(toolSpecifications);
        List<McpStatelessServerFeatures.SyncResourceSpecification> resources =
                copyAndValidateResources(resourceSpecifications);

        WebMvcStatelessServerTransport transport = WebMvcStatelessServerTransport.builder()
                .jsonMapper(jsonMapper)
                .messageEndpoint(normalizedEndpoint)
                .build();

        McpSchema.ServerCapabilities.Builder capabilities =
                McpSchema.ServerCapabilities.builder().tools(false);
        if (!resources.isEmpty()) {
            capabilities.resources(false, false);
        }
        McpStatelessSyncServer server = McpServer.sync(transport)
                .serverInfo(normalizedName, normalizedVersion)
                .instructions(normalizedInstructions)
                .capabilities(capabilities.build())
                .requestTimeout(normalizedTimeout)
                .tools(tools)
                .resources(resources)
                // Tool handlers rely on the request's Spring Security context. Keep execution on
                // the servlet request thread instead of moving it to a scheduler.
                .immediateExecution(true)
                .build();

        return new Registration(
                normalizedEndpoint,
                List.copyOf(tools),
                List.copyOf(resources),
                transport,
                server,
                withLegacyProtocolFallback(transport.getRouterFunction(), !resources.isEmpty()));
    }

    /**
     * The Java MCP SDK 2.0 transport implements the initialization-based 2025-11-25 protocol. A
     * modern client probes the server with 2026-07-28 request metadata before falling back to that
     * legacy handshake. Passing the probe into the legacy SDK produces a 500 for the unknown
     * {@code server/discover} method, which prevents the client from falling back.
     *
     * <p>For Streamable HTTP, an empty 400 response identifies a legacy server. Keep this
     * compatibility signal outside the SDK transport. Some hosts retain the modern headers and
     * request metadata after discovery fallback. For an exact, non-batched resource request whose
     * body method agrees with {@code Mcp-Method}, forward a buffered copy with the protocol header
     * downgraded to the version implemented by the SDK. The response remains a legacy response;
     * this is a narrow host compatibility shim, not an implementation of the 2026-07-28 contract.</p>
     */
    private RouterFunction<ServerResponse> withLegacyProtocolFallback(
            RouterFunction<ServerResponse> routerFunction,
            boolean resourceCompatibilityEnabled) {
        return routerFunction.filter((request, next) -> {
            String protocolVersion = request.headers().firstHeader(PROTOCOL_VERSION_HEADER);
            String method = request.headers().firstHeader(METHOD_HEADER);
            if (!HttpMethod.POST.equals(request.method())) {
                return next.handle(request);
            }
            if (DISCOVER_METHOD.equals(method)) {
                return ServerResponse.badRequest().build();
            }
            if (!MODERN_PROTOCOL_VERSION.equals(protocolVersion)) {
                return next.handle(request);
            }
            if (!resourceCompatibilityEnabled) {
                return ServerResponse.badRequest().build();
            }
            if (request.headers().header(PROTOCOL_VERSION_HEADER).size() != 1) {
                return ServerResponse.badRequest().build();
            }
            List<String> methods = request.headers().header(METHOD_HEADER);
            if (methods.size() != 1 || !LEGACY_RESOURCE_METHODS.contains(method)) {
                return ServerResponse.badRequest().build();
            }

            byte[] body = request.body(byte[].class);
            CompatibilityRequest compatibilityRequest = singleRequest(body);
            if (!matchesCompatibilityHeaders(request, method, compatibilityRequest)) {
                return ServerResponse.badRequest().build();
            }
            ServerRequest downgradedRequest = ServerRequest.from(request)
                    .headers(headers -> headers.set(PROTOCOL_VERSION_HEADER, LEGACY_PROTOCOL_VERSION))
                    .body(body)
                    .build();
            return next.handle(downgradedRequest);
        });
    }

    private boolean matchesCompatibilityHeaders(
            ServerRequest request,
            String method,
            CompatibilityRequest compatibilityRequest) {
        if (compatibilityRequest == null || !method.equals(compatibilityRequest.method())) {
            return false;
        }
        List<String> names = request.headers().header(NAME_HEADER);
        if ("resources/list".equals(method)) {
            return names.isEmpty();
        }
        return names.size() == 1 && names.getFirst().equals(compatibilityRequest.name());
    }

    private CompatibilityRequest singleRequest(byte[] body) {
        try {
            JsonNode root = treeMapper.readTree(body);
            if (root == null || !root.isObject()) {
                return null;
            }
            JsonNode jsonrpc = root.get("jsonrpc");
            JsonNode id = root.get("id");
            JsonNode params = root.get("params");
            if (jsonrpc == null
                    || !jsonrpc.isTextual()
                    || !"2.0".equals(jsonrpc.asText())
                    || id == null
                    || !(id.isTextual() || id.isNumber())
                    || !hasModernRequestMetadata(params)) {
                return null;
            }
            JsonNode method = root.get("method");
            if (method == null || !method.isTextual()) {
                return null;
            }
            String methodValue = method.asText();
            if ("resources/list".equals(methodValue)) {
                return new CompatibilityRequest(methodValue, null);
            }
            if (!"resources/read".equals(methodValue)) {
                return new CompatibilityRequest(methodValue, null);
            }
            JsonNode uri = params.get("uri");
            return uri != null && uri.isTextual()
                    ? new CompatibilityRequest(methodValue, uri.asText())
                    : null;
        } catch (JacksonException exception) {
            return null;
        }
    }

    private static boolean hasModernRequestMetadata(JsonNode params) {
        if (params == null || !params.isObject()) {
            return false;
        }
        JsonNode meta = params.get("_meta");
        if (meta == null || !meta.isObject()) {
            return false;
        }
        JsonNode protocolVersion = meta.get("io.modelcontextprotocol/protocolVersion");
        JsonNode clientCapabilities = meta.get("io.modelcontextprotocol/clientCapabilities");
        return protocolVersion != null
                && protocolVersion.isTextual()
                && MODERN_PROTOCOL_VERSION.equals(protocolVersion.asText())
                && clientCapabilities != null
                && clientCapabilities.isObject();
    }

    private record CompatibilityRequest(String method, String name) {}

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

    private static List<McpStatelessServerFeatures.SyncResourceSpecification> copyAndValidateResources(
            List<McpStatelessServerFeatures.SyncResourceSpecification> resourceSpecifications) {
        Objects.requireNonNull(resourceSpecifications, "resourceSpecifications");
        List<McpStatelessServerFeatures.SyncResourceSpecification> resources =
                List.copyOf(resourceSpecifications);
        Set<String> uris = new HashSet<>();
        for (McpStatelessServerFeatures.SyncResourceSpecification specification : resources) {
            Objects.requireNonNull(specification, "resourceSpecifications must not contain null");
            String uri = requireText(specification.resource().uri(), "resource URI");
            if (!uris.add(uri)) {
                throw new IllegalArgumentException("duplicate MCP resource URI: " + uri);
            }
        }
        return resources;
    }

    /**
     * Spring owns this bean and invokes {@link #close()} during shutdown. The router is exposed as a
     * separate bean by the provider configuration so Spring MVC can compose multiple MCP routes.
     */
    public record Registration(
            String endpoint,
            List<McpStatelessServerFeatures.SyncToolSpecification> toolSpecifications,
            List<McpStatelessServerFeatures.SyncResourceSpecification> resourceSpecifications,
            WebMvcStatelessServerTransport transport,
            McpStatelessSyncServer server,
            RouterFunction<ServerResponse> routerFunction) implements AutoCloseable {

        @Override
        public void close() {
            server.close();
        }
    }
}
