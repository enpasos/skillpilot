package com.skillpilot.backend.openai.mcp.de.v1;

import java.time.Duration;
import java.util.List;

/**
 * Permanent public plugin identity with independent package and contract versions.
 * The current runtime implements the OpenAI Coach V1 contract.
 *
 * <p>The matching release descriptor lives in
 * {@code ai/openai plugin/skillpilot-coach/release/line.json}. CI checks
 * both sources against the submitted plugin manifest.</p>
 */
public final class OpenAiDeV1ContractMetadata {

    public static final String PLUGIN_IDENTITY = "skillpilot-coach";
    public static final String PLUGIN_VERSION = "1.1.3";
    public static final int CONTRACT_MAJOR = 1;
    public static final long POLICY_REVISION = 5L;
    public static final String SUPPORT_LIFECYCLE = "CURRENT";
    public static final String PUBLICATION_STATUS = "DRAFT";
    public static final String NEW_SESSION_POLICY = "ALLOW";
    public static final String PUBLIC_MCP_ORIGIN = "https://mcp-openai.skillpilot.com";
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
            "7cfc661b04b03d33aa630e8040150509e5c4d1567c39e95aebacf3f7307e13f1";
    public static final String GOAL_VISUALIZATION_RESOURCE_URI =
            "ui://skillpilot/coach/v1/sha256-"
                    + GOAL_VISUALIZATION_ARTIFACT_SHA256
                    + "/goal-visualization.html";
    public static final String MCP_APP_RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";
    public static final String GOAL_VISUALIZATION_RESOURCE_CLASSPATH =
            "/openai/skillpilot-goal-visualization-v1.html";
    /**
     * Original non-content-addressed V1 visualization resource retained for
     * historical ChatGPT conversations and connector metadata caches.
     */
    public static final String LEGACY_GOAL_VISUALIZATION_RESOURCE_URI =
            "ui://skillpilot/coach/v1/1.0.0/goal-visualization.html";
    public static final String LEGACY_GOAL_VISUALIZATION_ARTIFACT_SHA256 =
            "2655afdde360f80392318a868b51d1d3d8f0d27ab32e73255f0f22656b161e82";
    public static final String LEGACY_GOAL_VISUALIZATION_RESOURCE_CLASSPATH =
            "/openai/retained/skillpilot/coach/v1/legacy-1.0.0/goal-visualization.html";
    public static final String MEMORY_CARD_PRACTICE_ARTIFACT_SHA256 =
            "3665591f88892a89ce22bec7076e7ed7727db8b9360b438f1e1345e9a01bf7cb";
    public static final String MEMORY_CARD_PRACTICE_RESOURCE_URI =
            "ui://skillpilot/coach/v1/sha256-"
                    + MEMORY_CARD_PRACTICE_ARTIFACT_SHA256
                    + "/memory-card-practice.html";
    public static final String MEMORY_CARD_PRACTICE_RESOURCE_CLASSPATH =
            "/openai/skillpilot-memory-card-practice-v1.html";
    public static final String PROVIDER_NOTICE_VERSION = "openai-provider-eligibility-v2";
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
            "157aab83e83d6fcf208c4a1ae138c020aa4f117e9b990ba78d029b570fb9644c",
            "c890cf271307d815256450a2b20b27d57015a84e9f4e39c97532eaefc4e30c26",
            "12762009bd8e00c392e06aefac685e17653f50a5e7efeb21f865429a9fab641e",
            "08030bd956b68b816523f4971b6d18ab154eef01381882b01d7f1991cc643391",
            "9c09821e96abadfccb08d07b62367d47963420c3a5cc51021ba801e2d6019fe4");
    /** Previously advertised memory-practice resources, retained without tool bindings. */
    public static final List<String> RETAINED_MEMORY_CARD_PRACTICE_ARTIFACT_SHA256S = List.of(
            "8524ee20837971227c35f1e16518d2b5bdbd60637fbec6beede9f2f4b29e4852",
            "7e1e4f1acbc61a9b50e620ebdf56f10c782517f6454edb1777a8d796832c2962");
    /** Loopback-only transport target behind the dedicated V1 reverse proxy. */
    public static final String INTERNAL_MCP_PATH = "/internal/openai/v1/mcp";
    /** Loopback-only metadata target rewritten from the public path-specific URL. */
    public static final String INTERNAL_PROTECTED_RESOURCE_METADATA_PATH =
            "/internal/openai/v1/protected-resource-metadata";
    /** Loopback-only OpenAI Apps challenge target behind the V1 reverse proxy. */
    public static final String INTERNAL_OPENAI_APPS_CHALLENGE_PATH =
            "/internal/openai/v1/openai-apps-challenge";
    public static final int STATE_SCHEMA_VERSION = 1;
    public static final String WORKFLOW_VERSION = "coach@1.1";
    public static final String DEFAULT_SERVER_BUILD = "dev";
    public static final Duration MINIMUM_ACTION_SESSION_REMAINING = Duration.ofHours(1);

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

    public static String memoryCardPracticeResourceUri(String artifactSha256) {
        return "ui://skillpilot/coach/v1/sha256-"
                + artifactSha256
                + "/memory-card-practice.html";
    }

    public static String retainedMemoryCardPracticeResourceClasspath(String artifactSha256) {
        return "/openai/retained/skillpilot/coach/v1/sha256-"
                + artifactSha256
                + "/memory-card-practice.html";
    }

    private OpenAiDeV1ContractMetadata() {
    }
}
