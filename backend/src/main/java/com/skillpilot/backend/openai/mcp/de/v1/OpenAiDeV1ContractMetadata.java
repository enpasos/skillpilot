package com.skillpilot.backend.openai.mcp.de.v1;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
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
    public static final long POLICY_REVISION = 3L;
    public static final String SUPPORT_LIFECYCLE = "CURRENT";
    public static final String PUBLICATION_STATUS = "DRAFT";
    public static final String NEW_SESSION_POLICY = "ALLOW";
    public static final String PUBLIC_MCP_ORIGIN = "https://mcp-coach-v1.skillpilot.com";
    /** Dedicated, plugin-unique origin required for the submitted MCP App UI. */
    public static final String WIDGET_DOMAIN = PUBLIC_MCP_ORIGIN;
    /**
     * ChatGPT hosts component documents below an isolated subdomain derived from
     * the declared widget domain. Limit direct-start browser access to HTTPS
     * origins in that OpenAI-owned sandbox family; this is an additional browser
     * boundary, not the endpoint's authorization mechanism.
     */
    public static final String CHATGPT_WEB_WIDGET_ORIGIN =
            "https://mcp-coach-v1-skillpilot-com.web-sandbox.oaiusercontent.com";
    public static final String CHATGPT_WIDGET_ORIGIN_PATTERN =
            "https://*.web-sandbox.oaiusercontent.com";
    private static final String CHATGPT_WIDGET_HOST_SUFFIX =
            ".web-sandbox.oaiusercontent.com";
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
            "8524ee20837971227c35f1e16518d2b5bdbd60637fbec6beede9f2f4b29e4852";
    public static final String MEMORY_CARD_PRACTICE_RESOURCE_URI =
            "ui://skillpilot/coach/v1/sha256-"
                    + MEMORY_CARD_PRACTICE_ARTIFACT_SHA256
                    + "/memory-card-practice.html";
    public static final String MEMORY_CARD_PRACTICE_RESOURCE_CLASSPATH =
            "/openai/skillpilot-memory-card-practice-v1.html";
    public static final String SKILLPILOT_START_ARTIFACT_SHA256 =
            "4bedfcc1f5de64bde6c8cf9f81879d0c80f54ec740de105357fa929be6cf7f85";
    public static final String SKILLPILOT_START_RESOURCE_URI =
            "ui://skillpilot/coach/v1/sha256-"
                    + SKILLPILOT_START_ARTIFACT_SHA256
                    + "/skillpilot-start.html";
    public static final String SKILLPILOT_START_RESOURCE_CLASSPATH =
            "/openai/skillpilot-start-v1.html";
    public static final String BOOTSTRAP_LAUNCH_PATH = "/bootstrap/v1/launch";
    public static final String BOOTSTRAP_LAUNCH_ENDPOINT =
            PUBLIC_MCP_ORIGIN + BOOTSTRAP_LAUNCH_PATH;
    public static final String PROVIDER_NOTICE_VERSION = "openai-provider-eligibility-v2";
    /**
     * Every content-addressed direct-start resource previously advertised to
     * a real ChatGPT client. Append only while Coach V1 is usable.
     */
    public static final List<String> RETAINED_SKILLPILOT_START_ARTIFACT_SHA256S = List.of(
            "a3fa63977b0912b42550b25352d3c1e60a5b2de6f59c72ddb8e988214522281c",
            "6bd0c61447830e8515c300d10be727d63ae2e7c4ce3cf38ae49730fb43dde701",
            "a496abebeb55df2b9d601f6a87029c93ca4f51f46807d59057240b7ec6ff40a5",
            "5226d4b800899d58273abd9ecaf7c968692ba73f46d965e4f4e29c3e54f5cfbc",
            "f87d979e5b762b4bc03448b5dad34740a61919d88fe43e3093ddca33bfcda90c",
            "28236257e83739317f342624492944a82a96aef1f0bd60dca63f388fac87b9f1",
            "4bedfcc1f5de64bde6c8cf9f81879d0c80f54ec740de105357fa929be6cf7f85");
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
    public static final Duration MINIMUM_ACTION_SESSION_REMAINING = Duration.ofHours(1);

    public static String goalVisualizationResourceUri(String artifactSha256) {
        return "ui://skillpilot/coach/v1/sha256-"
                + artifactSha256
                + "/goal-visualization.html";
    }

    public static boolean isAllowedBootstrapCorsOrigin(String origin) {
        if (WIDGET_DOMAIN.equals(origin)) {
            return true;
        }
        if (origin == null || origin.isBlank()) {
            return false;
        }
        try {
            URI candidate = new URI(origin);
            String host = candidate.getHost();
            return "https".equalsIgnoreCase(candidate.getScheme())
                    && candidate.getRawUserInfo() == null
                    && candidate.getPort() == -1
                    && (candidate.getRawPath() == null || candidate.getRawPath().isEmpty())
                    && candidate.getRawQuery() == null
                    && candidate.getRawFragment() == null
                    && host != null
                    && host.length() > CHATGPT_WIDGET_HOST_SUFFIX.length()
                    && host.endsWith(CHATGPT_WIDGET_HOST_SUFFIX);
        } catch (URISyntaxException exception) {
            return false;
        }
    }

    public static String retainedGoalVisualizationResourceClasspath(String artifactSha256) {
        return "/openai/retained/skillpilot/coach/v1/sha256-"
                + artifactSha256
                + "/goal-visualization.html";
    }

    public static String skillpilotStartResourceUri(String artifactSha256) {
        return "ui://skillpilot/coach/v1/sha256-"
                + artifactSha256
                + "/skillpilot-start.html";
    }

    public static String retainedSkillpilotStartResourceClasspath(String artifactSha256) {
        return "/openai/retained/skillpilot/coach/v1/sha256-"
                + artifactSha256
                + "/skillpilot-start.html";
    }

    private OpenAiDeV1ContractMetadata() {
    }
}
