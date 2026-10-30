package com.skillpilot.backend.connectors.claude.v1.mcp;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionProfileCatalog;
import io.modelcontextprotocol.spec.McpSchema;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ClaudeV1CompletionContractRegistryTest {
    private ClaudeV1CompletionContractRegistry registry(String generation) {
        return new ClaudeV1CompletionContractRegistry(new ObjectMapper(),
                new CompletionProfileCatalog(Map.of(), Map.of(), generation));
    }
    private McpSchema.Tool tool(String name, String description, boolean reverse) {
        Map<String, Object> properties = new LinkedHashMap<>();
        if (reverse) { properties.put("b", Map.of("type", "string")); properties.put("a", Map.of("type", "boolean")); }
        else { properties.put("a", Map.of("type", "boolean")); properties.put("b", Map.of("type", "string")); }
        return McpSchema.Tool.builder(name).description(description)
                .inputSchema(Map.of("type", "object", "properties", properties)).build();
    }
    private List<McpSchema.Tool> definitions() {
        return List.of(tool(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, "Receipt", false), tool("other", "Read", false));
    }

    @Test void canonicalPropertyAndToolOrderingCannotChangeTheFingerprint() {
        var one = registry("generation"); var two = registry("generation");
        one.register("instructions", definitions());
        two.register("instructions", List.of(tool("other", "Read", true),
                tool(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, "Receipt", true)));
        assertThat(one.contractFingerprint()).isEqualTo(two.contractFingerprint()).matches("[0-9a-f]{64}");
        assertThat(one.bindingDigest()).isEqualTo(two.bindingDigest());
    }
    @Test void changedInstructionsOrServedToolDefinitionRequireAnotherContract() {
        var original = registry("generation"); original.register("instructions", definitions());
        var instructions = registry("generation"); instructions.register("other instructions", definitions());
        var tool = registry("generation"); tool.register("instructions", List.of(
                tool(ClaudeV1CompletionContractRegistry.TOOL_CONFIRM, "Changed behavior", false), tool("other", "Read", false)));
        assertThat(instructions.contractFingerprint()).isNotEqualTo(original.contractFingerprint());
        assertThat(tool.contractFingerprint()).isNotEqualTo(original.contractFingerprint());
        assertThat(tool.isConfirmed(original.confirmedStamp())).isFalse();
    }
    @Test void newGenerationRetainsContractIdentityButRejectsEveryOldSessionBinding() {
        var one = registry("generation-one"); var two = registry("generation-two");
        one.register("instructions", definitions()); two.register("instructions", definitions());
        assertThat(two.contractFingerprint()).isEqualTo(one.contractFingerprint());
        assertThat(two.bindingDigest()).isNotEqualTo(one.bindingDigest());
        assertThat(two.isPending(one.pendingStamp())).isFalse();
        assertThat(two.isConfirmed(one.confirmedStamp())).isFalse();
    }
    @Test void noRegistrationOrMissingReceiptToolCannotEnableCompletion() {
        var registry = registry("generation");
        assertThatThrownBy(registry::pendingStamp).isInstanceOf(IllegalStateException.class);
        registry.register("ordinary contract", List.of(tool("ordinary", "Ordinary learning", false)));
        assertThatThrownBy(registry::pendingStamp).isInstanceOf(IllegalStateException.class);
        assertThat(registry.isConfirmed("completion@1")).isFalse();
        assertThat(registry.isPending(null)).isFalse();
    }
    @Test void registrationCannotBeSilentlyReplacedAndLegacyMarkersNeverUpgrade() {
        var registry = registry("generation"); registry.register("instructions", definitions());
        registry.register("instructions", definitions());
        assertThatThrownBy(() -> registry.register("changed instructions", definitions())).isInstanceOf(IllegalStateException.class);
        assertThat(registry.isConfirmed(null)).isFalse();
        assertThat(registry.isConfirmed("completion@1")).isFalse();
        assertThat(registry.isConfirmed(registry.pendingStamp())).isFalse();
        assertThat(registry.isPending(registry.confirmedStamp())).isFalse();
        assertThat(registry.pendingStamp()).hasSize(72);
        assertThat(registry.confirmedStamp()).hasSize(74);
    }
}
