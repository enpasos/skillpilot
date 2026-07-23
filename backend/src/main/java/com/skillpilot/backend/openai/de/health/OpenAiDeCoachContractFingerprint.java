package com.skillpilot.backend.openai.de.health;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.skillpilot.backend.openai.mcp.de.OpenAiDeCoachMcpContract;
import io.modelcontextprotocol.spec.McpSchema;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Creates a stable fingerprint of instructions and public MCP tool descriptors. */
final class OpenAiDeCoachContractFingerprint {

    private static final ObjectMapper CANONICAL_JSON = new ObjectMapper()
            .enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS);

    private OpenAiDeCoachContractFingerprint() {
    }

    static String sha256(OpenAiDeCoachMcpContract contract) {
        Map<String, Object> canonicalContract = new LinkedHashMap<>();
        canonicalContract.put("serverInstructions", contract.serverInstructions());
        canonicalContract.put("tools", contract.toolSpecifications().stream()
                .map(specification -> canonicalTool(specification.tool()))
                .sorted(Comparator.comparing(tool -> (String) tool.get("name")))
                .toList());
        try {
            byte[] bytes = CANONICAL_JSON.writeValueAsBytes(canonicalContract);
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (JsonProcessingException | NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Could not fingerprint the OpenAI-DE MCP contract.", exception);
        }
    }

    private static Map<String, Object> canonicalTool(McpSchema.Tool tool) {
        Map<String, Object> canonical = new LinkedHashMap<>();
        canonical.put("name", tool.name());
        canonical.put("title", tool.title());
        canonical.put("description", tool.description());
        canonical.put("inputSchema", tool.inputSchema());
        canonical.put("outputSchema", tool.outputSchema());
        canonical.put("annotations", canonicalAnnotations(tool.annotations()));
        canonical.put("meta", tool.meta());
        canonical.put("icons", canonicalIcons(tool.icons()));
        return canonical;
    }

    private static Map<String, Object> canonicalAnnotations(McpSchema.ToolAnnotations annotations) {
        if (annotations == null) {
            return Map.of();
        }
        Map<String, Object> canonical = new LinkedHashMap<>();
        putIfNotNull(canonical, "title", annotations.title());
        putIfNotNull(canonical, "readOnlyHint", annotations.readOnlyHint());
        putIfNotNull(canonical, "destructiveHint", annotations.destructiveHint());
        putIfNotNull(canonical, "idempotentHint", annotations.idempotentHint());
        putIfNotNull(canonical, "openWorldHint", annotations.openWorldHint());
        putIfNotNull(canonical, "returnDirect", annotations.returnDirect());
        return canonical;
    }

    private static List<Map<String, Object>> canonicalIcons(List<McpSchema.Icon> icons) {
        if (icons == null || icons.isEmpty()) {
            return List.of();
        }
        List<Map<String, Object>> canonical = new ArrayList<>(icons.size());
        for (McpSchema.Icon icon : icons) {
            Map<String, Object> values = new LinkedHashMap<>();
            putIfNotNull(values, "src", icon.src());
            putIfNotNull(values, "mimeType", icon.mimeType());
            putIfNotNull(values, "sizes", icon.sizes());
            putIfNotNull(values, "theme", icon.theme());
            canonical.add(values);
        }
        return List.copyOf(canonical);
    }

    private static void putIfNotNull(Map<String, Object> target, String key, Object value) {
        if (value != null) {
            target.put(key, value);
        }
    }
}
