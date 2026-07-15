package com.skillpilot.backend.claude.mcp;

import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.core.env.Environment;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

/** Public, secret-free diagnostics for the temporary Claude MCP regression mode. */
@RestController
public class ClaudeMcpRegressionStatusController {

    static final String STATUS_PATH = "/claude/mcp-regression/status.json";
    private static final Set<String> REGRESSION_TOOLS = Set.of(
            "createRegressionProbe",
            "verifyRegressionProbe");

    private final boolean claudeEnabled;
    private final boolean mcpEnabled;
    private final boolean coachToolsEnabled;
    private final boolean regressionToolsEnabled;
    private final List<String> invalidBooleanProperties;
    private final List<ToolCallbackProvider> toolProviders;

    public ClaudeMcpRegressionStatusController(
            Environment environment,
            List<ToolCallbackProvider> toolProviders) {
        BooleanProperty claude = booleanProperty(environment, "skillpilot.claude.enabled", false);
        BooleanProperty mcp = booleanProperty(environment, "skillpilot.claude.mcp.enabled", false);
        BooleanProperty coach = booleanProperty(environment, "skillpilot.claude.mcp.coach-enabled", true);
        BooleanProperty regression = booleanProperty(
                environment, "skillpilot.claude.mcp.regression-enabled", false);

        this.claudeEnabled = claude.value();
        this.mcpEnabled = mcp.value();
        this.coachToolsEnabled = coach.value();
        this.regressionToolsEnabled = regression.value();
        this.invalidBooleanProperties = java.util.stream.Stream.of(claude, mcp, coach, regression)
                .filter(property -> !property.valid())
                .map(BooleanProperty::name)
                .sorted()
                .toList();
        this.toolProviders = List.copyOf(toolProviders);
    }

    @GetMapping(value = STATUS_PATH, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> status() {
        Set<String> registeredTools = new TreeSet<>();
        toolProviders.stream()
                .flatMap(provider -> Arrays.stream(provider.getToolCallbacks()))
                .forEach(callback -> registeredTools.add(callback.getToolDefinition().name()));
        Set<String> registeredRegressionTools = new TreeSet<>(registeredTools);
        registeredRegressionTools.retainAll(REGRESSION_TOOLS);

        boolean regressionReady = claudeEnabled
                && mcpEnabled
                && regressionToolsEnabled
                && invalidBooleanProperties.isEmpty()
                && registeredRegressionTools.containsAll(REGRESSION_TOOLS);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", regressionReady ? "ready" : "not_ready");
        body.put("claude_enabled", claudeEnabled);
        body.put("mcp_enabled", mcpEnabled);
        body.put("coach_tools_enabled", coachToolsEnabled);
        body.put("regression_tools_enabled", regressionToolsEnabled);
        body.put("regression_tools_ready", regressionReady);
        body.put("configuration_valid", invalidBooleanProperties.isEmpty());
        body.put("invalid_boolean_properties", invalidBooleanProperties);
        body.put("registered_tool_count", registeredTools.size());
        body.put("registered_regression_tools", List.copyOf(registeredRegressionTools));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .body(body);
    }

    private static BooleanProperty booleanProperty(
            Environment environment,
            String name,
            boolean defaultValue) {
        String rawValue = environment.getProperty(name);
        if (rawValue == null) {
            return new BooleanProperty(name, defaultValue, true);
        }
        String normalized = rawValue.trim();
        if ("true".equalsIgnoreCase(normalized)) {
            return new BooleanProperty(name, true, true);
        }
        if ("false".equalsIgnoreCase(normalized)) {
            return new BooleanProperty(name, false, true);
        }
        return new BooleanProperty(name, defaultValue, false);
    }

    private record BooleanProperty(String name, boolean value, boolean valid) {
    }
}
