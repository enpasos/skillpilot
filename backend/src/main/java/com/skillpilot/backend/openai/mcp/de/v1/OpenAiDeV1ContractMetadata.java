package com.skillpilot.backend.openai.mcp.de.v1;

/**
 * Stable public identity and independently moving state versions for the
 * OpenAI Coach V1 contract.
 *
 * <p>The matching release descriptor lives in
 * {@code ai/openai plugin/skillpilot-coach-v1/release/line.json}. CI checks
 * both sources against the submitted plugin manifest.</p>
 */
public final class OpenAiDeV1ContractMetadata {

    public static final String PLUGIN_IDENTITY = "skillpilot-coach-v1";
    public static final String PLUGIN_VERSION = "1.0.0";
    public static final int CONTRACT_MAJOR = 1;
    public static final String PUBLIC_MCP_ORIGIN = "https://mcp-coach-v1.skillpilot.com";
    public static final String PUBLIC_MCP_PATH = "/mcp";
    public static final String PUBLIC_MCP_ENDPOINT = PUBLIC_MCP_ORIGIN + PUBLIC_MCP_PATH;
    public static final String OAUTH_RESOURCE = PUBLIC_MCP_ENDPOINT;
    public static final String PROTECTED_RESOURCE_METADATA_PATH =
            "/.well-known/oauth-protected-resource/mcp";
    public static final String PROTECTED_RESOURCE_METADATA_ENDPOINT =
            PUBLIC_MCP_ORIGIN + PROTECTED_RESOURCE_METADATA_PATH;
    /** Loopback-only transport target behind the dedicated V1 reverse proxy. */
    public static final String INTERNAL_MCP_PATH = "/internal/openai/v1/mcp";
    /** Loopback-only metadata target rewritten from the public path-specific URL. */
    public static final String INTERNAL_PROTECTED_RESOURCE_METADATA_PATH =
            "/internal/openai/v1/protected-resource-metadata";
    /** Loopback-only OpenAI Apps challenge target behind the V1 reverse proxy. */
    public static final String INTERNAL_OPENAI_APPS_CHALLENGE_PATH =
            "/internal/openai/v1/openai-apps-challenge";
    public static final int STATE_SCHEMA_VERSION = 1;
    public static final String WORKFLOW_VERSION = "coach@1.0";
    public static final String DEFAULT_SERVER_BUILD = "dev";

    private OpenAiDeV1ContractMetadata() {
    }
}
