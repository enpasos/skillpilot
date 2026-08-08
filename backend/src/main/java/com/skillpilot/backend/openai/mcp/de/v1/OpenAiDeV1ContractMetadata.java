package com.skillpilot.backend.openai.mcp.de.v1;

import java.util.List;

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
    /** Dedicated, plugin-unique origin required for the submitted MCP App UI. */
    public static final String WIDGET_DOMAIN = PUBLIC_MCP_ORIGIN;
    public static final String PUBLIC_MCP_PATH = "/mcp";
    public static final String PUBLIC_MCP_ENDPOINT = PUBLIC_MCP_ORIGIN + PUBLIC_MCP_PATH;
    public static final String OAUTH_RESOURCE = PUBLIC_MCP_ENDPOINT;
    public static final String PROTECTED_RESOURCE_METADATA_PATH =
            "/.well-known/oauth-protected-resource/mcp";
    public static final String PROTECTED_RESOURCE_METADATA_ENDPOINT =
            PUBLIC_MCP_ORIGIN + PROTECTED_RESOURCE_METADATA_PATH;
    public static final String GOAL_VISUALIZATION_ARTIFACT_SHA256 =
            "c890cf271307d815256450a2b20b27d57015a84e9f4e39c97532eaefc4e30c26";
    public static final String GOAL_VISUALIZATION_RESOURCE_URI =
            "ui://skillpilot/coach/v1/sha256-"
                    + GOAL_VISUALIZATION_ARTIFACT_SHA256
                    + "/goal-visualization.html";
    public static final String MCP_APP_RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";
    public static final String GOAL_VISUALIZATION_RESOURCE_CLASSPATH =
            "/openai/skillpilot-goal-visualization-v1.html";
    public static final String MEMORY_CARD_PRACTICE_ARTIFACT_SHA256 =
            "8524ee20837971227c35f1e16518d2b5bdbd60637fbec6beede9f2f4b29e4852";
    public static final String MEMORY_CARD_PRACTICE_RESOURCE_URI =
            "ui://skillpilot/coach/v1/sha256-"
                    + MEMORY_CARD_PRACTICE_ARTIFACT_SHA256
                    + "/memory-card-practice.html";
    public static final String MEMORY_CARD_PRACTICE_RESOURCE_CLASSPATH =
            "/openai/skillpilot-memory-card-practice-v1.html";
    /**
     * Every content-addressed visualization resource previously advertised by
     * Coach V1, ordered oldest first and retained byte-for-byte for connector
     * caches and historical chat messages. Append only while V1 is usable.
     */
    public static final List<String> RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S = List.of(
            "12f95e377a40d9112068016e5b532f0bf45f43ae6deb9083f04a7e93f7cb6cdc",
            "5564f42d0885bb8c12b1067a8d5db4e09986279ed513277021181a198dd20881",
            "bed59e4cd9b2cd00c31523c6bcc110db7c396f676704730e3a2a9055f0a0555c",
            "45e1f58df32ef6cc194a7cdc6353bbd5bfc93ead407dd213cb5a64ff65b9faed",
            "157aab83e83d6fcf208c4a1ae138c020aa4f117e9b990ba78d029b570fb9644c");
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

    public static String goalVisualizationResourceUri(String artifactSha256) {
        return "ui://skillpilot/coach/v1/sha256-"
                + artifactSha256
                + "/goal-visualization.html";
    }

    public static String retainedGoalVisualizationResourceClasspath(String artifactSha256) {
        return "/openai/retained/skillpilot/coach/v1/sha256-"
                + artifactSha256
                + "/goal-visualization.html";
    }

    private OpenAiDeV1ContractMetadata() {
    }
}
