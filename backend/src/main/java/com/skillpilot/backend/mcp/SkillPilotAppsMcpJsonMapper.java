package com.skillpilot.backend.mcp;

import io.modelcontextprotocol.json.McpJsonMapper;
import io.modelcontextprotocol.json.TypeRef;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import tools.jackson.databind.node.ObjectNode;

/**
 * Adds Apps-SDK descriptor fields that are newer than the MCP Java SDK's {@code Tool} record.
 *
 * <p>MCP Java SDK 2.0.0 can serialize the compatibility mirror
 * {@code _meta.securitySchemes}, but its strongly typed tool descriptor has no top-level
 * {@code securitySchemes} member yet. ChatGPT's current Apps SDK contract requires the top-level
 * field and recommends the mirror for older clients. This mapper promotes the already-declared,
 * identical mirror while leaving all other protocol messages unchanged. It can be removed once the
 * Java SDK exposes the standard member directly.</p>
 */
final class SkillPilotAppsMcpJsonMapper implements McpJsonMapper {

    private static final String META = "_meta";
    private static final String SECURITY_SCHEMES = "securitySchemes";

    private final McpJsonMapper delegate;
    private final JsonMapper treeMapper;

    SkillPilotAppsMcpJsonMapper(McpJsonMapper delegate, JsonMapper treeMapper) {
        this.delegate = Objects.requireNonNull(delegate, "delegate");
        this.treeMapper = Objects.requireNonNull(treeMapper, "treeMapper");
    }

    @Override
    public <T> T readValue(String content, Class<T> type) throws IOException {
        return delegate.readValue(content, type);
    }

    @Override
    public <T> T readValue(byte[] content, Class<T> type) throws IOException {
        return delegate.readValue(content, type);
    }

    @Override
    public <T> T readValue(String content, TypeRef<T> type) throws IOException {
        return delegate.readValue(content, type);
    }

    @Override
    public <T> T readValue(byte[] content, TypeRef<T> type) throws IOException {
        return delegate.readValue(content, type);
    }

    @Override
    public <T> T convertValue(Object value, Class<T> type) {
        return delegate.convertValue(value, type);
    }

    @Override
    public <T> T convertValue(Object value, TypeRef<T> type) {
        return delegate.convertValue(value, type);
    }

    @Override
    public String writeValueAsString(Object value) throws IOException {
        return enrich(delegate.writeValueAsString(value));
    }

    @Override
    public byte[] writeValueAsBytes(Object value) throws IOException {
        return enrich(new String(delegate.writeValueAsBytes(value), StandardCharsets.UTF_8))
                .getBytes(StandardCharsets.UTF_8);
    }

    private String enrich(String serialized) throws IOException {
        JsonNode root = treeMapper.readTree(serialized);
        promoteSecuritySchemes(root);
        return treeMapper.writeValueAsString(root);
    }

    private void promoteSecuritySchemes(JsonNode node) {
        if (node == null || node.isValueNode()) {
            return;
        }
        if (node.isObject()) {
            ObjectNode object = node.asObject();
            JsonNode meta = object.get(META);
            if (!object.has(SECURITY_SCHEMES)
                    && meta != null
                    && meta.isObject()
                    && meta.has(SECURITY_SCHEMES)) {
                object.set(SECURITY_SCHEMES, meta.get(SECURITY_SCHEMES).deepCopy());
            }
        }
        for (JsonNode child : node) {
            promoteSecuritySchemes(child);
        }
    }
}
