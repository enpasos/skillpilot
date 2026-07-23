package com.skillpilot.backend.mcp;

import io.modelcontextprotocol.spec.McpSchema;
import java.util.List;
import java.util.Map;

/** Shared MCP result helpers for provider adapters. */
public final class SkillPilotMcpToolResults {

    public static final String WWW_AUTHENTICATE_META_KEY = "mcp/www_authenticate";

    private SkillPilotMcpToolResults() {
    }

    /**
     * Returns the MCP-level authentication challenge used when authentication fails after a tool
     * call reached its handler. Requests rejected by Spring Security before MCP dispatch still use
     * the regular HTTP 401 {@code WWW-Authenticate} response.
     */
    public static McpSchema.CallToolResult authenticationRequired(String challenge) {
        if (challenge == null || challenge.isBlank()) {
            throw new IllegalArgumentException("challenge must not be blank");
        }
        return McpSchema.CallToolResult.builder()
                .isError(true)
                .addTextContent("Authentication is required before this SkillPilot action can run.")
                .meta(Map.of(WWW_AUTHENTICATE_META_KEY, List.of(challenge.trim())))
                .build();
    }
}
