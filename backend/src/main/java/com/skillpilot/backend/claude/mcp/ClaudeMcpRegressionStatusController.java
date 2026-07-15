package com.skillpilot.backend.claude.mcp;

import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Value;
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
    private final List<ToolCallbackProvider> toolProviders;

    public ClaudeMcpRegressionStatusController(
            @Value("${skillpilot.claude.enabled:false}") boolean claudeEnabled,
            @Value("${skillpilot.claude.mcp.enabled:false}") boolean mcpEnabled,
            @Value("${skillpilot.claude.mcp.coach-enabled:true}") boolean coachToolsEnabled,
            @Value("${skillpilot.claude.mcp.regression-enabled:false}") boolean regressionToolsEnabled,
            List<ToolCallbackProvider> toolProviders) {
        this.claudeEnabled = claudeEnabled;
        this.mcpEnabled = mcpEnabled;
        this.coachToolsEnabled = coachToolsEnabled;
        this.regressionToolsEnabled = regressionToolsEnabled;
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
                && registeredRegressionTools.containsAll(REGRESSION_TOOLS);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", regressionReady ? "ready" : "not_ready");
        body.put("claude_enabled", claudeEnabled);
        body.put("mcp_enabled", mcpEnabled);
        body.put("coach_tools_enabled", coachToolsEnabled);
        body.put("regression_tools_enabled", regressionToolsEnabled);
        body.put("regression_tools_ready", regressionReady);
        body.put("registered_tool_count", registeredTools.size());
        body.put("registered_regression_tools", List.copyOf(registeredRegressionTools));

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .header("X-Content-Type-Options", "nosniff")
                .body(body);
    }
}
