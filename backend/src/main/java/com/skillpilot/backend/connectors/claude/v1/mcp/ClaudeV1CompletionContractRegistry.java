package com.skillpilot.backend.connectors.claude.v1.mcp;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import com.skillpilot.backend.connectors.claude.v1.ConditionalOnClaudeV1Enabled;
import io.modelcontextprotocol.spec.McpSchema;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.TreeSet;
import org.springframework.stereotype.Component;

/**
 * Pins the actual server-advertised contract, independently of session/adapter construction.
 * A technical receipt proves a session-bound client call, never host instruction compliance.
 */
@Component
@ConditionalOnClaudeV1Enabled
public final class ClaudeV1CompletionContractRegistry {
    public static final String TOOL_CONFIRM = "confirm_skillpilot_completion_contract";
    private final ObjectMapper mapper;
    private final CompletionProfileCatalog catalog;
    private volatile Registration registration;
    private record Registration(String contractFingerprint, String generation, String bindingDigest, boolean enabled) { }

    public ClaudeV1CompletionContractRegistry(ObjectMapper mapper, CompletionProfileCatalog catalog) {
        this.mapper = Objects.requireNonNull(mapper);
        this.catalog = Objects.requireNonNull(catalog);
    }

    /** Called only by MCP registration after the server accepted these exact definitions. */
    public synchronized void register(String instructions, List<McpSchema.Tool> tools) {
        Objects.requireNonNull(instructions);
        Objects.requireNonNull(tools);
        var sorted = tools.stream().sorted(Comparator.comparing(McpSchema.Tool::name)).toList();
        if (sorted.stream().map(McpSchema.Tool::name).distinct().count() != sorted.size()) {
            throw new IllegalArgumentException("Duplicate tool names cannot identify a contract");
        }
        ObjectNode document = mapper.createObjectNode();
        document.put("format", "skillpilot-claude-completion-contract-v1");
        document.put("instructions", instructions);
        document.set("tools", mapper.valueToTree(sorted));
        String fingerprint = sha256(canonical(document).toString());
        String generation = Objects.toString(catalog.generation(), "");
        boolean enabled = sorted.stream().anyMatch(tool -> TOOL_CONFIRM.equals(tool.name()));
        Registration next = new Registration(fingerprint, generation,
                sha256("completion-binding-v1\0" + fingerprint + "\0" + generation), enabled);
        if (registration != null && !registration.equals(next)) {
            throw new IllegalStateException("A running MCP contract cannot be replaced in place");
        }
        registration = next;
    }

    public String contractFingerprint() { return requireRegistration().contractFingerprint(); }
    public String bindingDigest() { return requireCurrent().bindingDigest(); }
    public String pendingStamp() { return "pending:" + bindingDigest(); }
    public String confirmedStamp() { return "confirmed:" + bindingDigest(); }

    public boolean isPending(String stamp) {
        Registration current = current();
        return current != null && ("pending:" + current.bindingDigest()).equals(stamp);
    }
    public boolean isConfirmed(String stamp) {
        Registration current = current();
        return current != null && ("confirmed:" + current.bindingDigest()).equals(stamp);
    }

    private Registration current() {
        Registration current = registration;
        return current != null && current.enabled() && catalog.available()
                && current.generation().equals(catalog.generation()) ? current : null;
    }
    private Registration requireCurrent() {
        Registration current = current();
        if (current == null) throw new IllegalStateException("No current advertised completion contract");
        return current;
    }
    private Registration requireRegistration() {
        Registration current = registration;
        if (current == null) throw new IllegalStateException("MCP contract has not been registered");
        return current;
    }
    private JsonNode canonical(JsonNode node) {
        if (node.isObject()) {
            ObjectNode sorted = mapper.createObjectNode();
            TreeSet<String> keys = new TreeSet<>();
            node.fieldNames().forEachRemaining(keys::add);
            keys.forEach(key -> sorted.set(key, canonical(node.get(key))));
            return sorted;
        }
        if (node.isArray()) {
            ArrayNode array = mapper.createArrayNode();
            node.forEach(value -> array.add(canonical(value)));
            return array;
        }
        return node;
    }
    private static String sha256(String text) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(text.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException impossible) {
            throw new IllegalStateException(impossible);
        }
    }
}
