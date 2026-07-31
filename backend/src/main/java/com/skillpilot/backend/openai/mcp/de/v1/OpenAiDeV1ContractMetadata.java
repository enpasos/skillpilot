package com.skillpilot.backend.openai.mcp.de.v1;

/**
 * Stable public identity and independently moving state versions for the
 * German OpenAI V1 contract.
 *
 * <p>The matching release descriptor lives in
 * {@code ai/openai plugin/skillpilot-coach-de-v1/release/line.json}. CI checks
 * both sources against the submitted plugin manifest.</p>
 */
public final class OpenAiDeV1ContractMetadata {

    public static final String PLUGIN_IDENTITY = "skillpilot-coach-de-v1";
    public static final String PLUGIN_VERSION = "1.0.0";
    public static final int CONTRACT_MAJOR = 1;
    public static final String PUBLIC_MCP_ORIGIN = "https://mcp-coach-de-v1.skillpilot.com";
    public static final String PUBLIC_MCP_PATH = "/mcp";
    public static final String PUBLIC_MCP_ENDPOINT = PUBLIC_MCP_ORIGIN + PUBLIC_MCP_PATH;
    public static final String OAUTH_RESOURCE = PUBLIC_MCP_ENDPOINT;
    public static final String PROTECTED_RESOURCE_METADATA_PATH =
            "/.well-known/oauth-protected-resource/mcp";
    public static final String PROTECTED_RESOURCE_METADATA_ENDPOINT =
            PUBLIC_MCP_ORIGIN + PROTECTED_RESOURCE_METADATA_PATH;
    public static final String GOAL_VISUALIZATION_RESOURCE_URI =
            "ui://skillpilot/coach/v1/1.0.0/goal-visualization.html";
    public static final String MCP_APP_RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";
    public static final String GOAL_VISUALIZATION_RESOURCE_CLASSPATH =
            "/openai/skillpilot-goal-visualization-v1.html";
    /** Loopback-only transport target behind the dedicated DE V1 reverse proxy. */
    public static final String INTERNAL_MCP_PATH = "/internal/openai/de/v1/mcp";
    /** Loopback-only metadata target rewritten from the public path-specific URL. */
    public static final String INTERNAL_PROTECTED_RESOURCE_METADATA_PATH =
            "/.well-known/oauth-protected-resource";
    public static final int STATE_SCHEMA_VERSION = 1;
    public static final String WORKFLOW_VERSION = "coach-de@1.0";
    public static final String DEFAULT_SERVER_BUILD = "dev";

    private OpenAiDeV1ContractMetadata() {
    }
}
