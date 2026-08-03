package com.skillpilot.backend.openai.mcp.de.v1;

import java.util.Locale;
import java.util.Map;

/**
 * Best-effort presentation surface derived from client-provided MCP metadata.
 *
 * <p>This classification is deliberately fail-closed for optional MCP UI. It
 * must never be used for authentication, authorization, learner identity, or
 * state transitions.</p>
 */
enum OpenAiDeClientSurface {
    DESKTOP_WEB("desktop_web", true),
    UNSUPPORTED("unsupported", false),
    UNKNOWN("unknown", false);

    private static final String OPENAI_USER_AGENT = "openai/userAgent";

    private final String telemetryValue;
    private final boolean goalVisualizationSupported;

    OpenAiDeClientSurface(String telemetryValue, boolean goalVisualizationSupported) {
        this.telemetryValue = telemetryValue;
        this.goalVisualizationSupported = goalVisualizationSupported;
    }

    static OpenAiDeClientSurface from(Map<String, Object> requestMeta) {
        if (requestMeta == null) {
            return UNKNOWN;
        }
        Object rawValue = requestMeta.get(OPENAI_USER_AGENT);
        if (!(rawValue instanceof String userAgent) || userAgent.isBlank()) {
            return UNKNOWN;
        }
        String normalized = userAgent.toLowerCase(Locale.ROOT);

        // Mobile/native markers win over desktop-looking compatibility tokens.
        if (containsAny(
                normalized,
                "android",
                "iphone",
                "ipad",
                "ipod",
                " mobile",
                "ios",
                "cfnetwork",
                "okhttp",
                "electron/",
                "webview",
                "; wv)")) {
            return UNSUPPORTED;
        }

        boolean browser = normalized.contains("mozilla/");
        boolean desktopPlatform = containsAny(
                normalized,
                "windows nt",
                "macintosh",
                "x11",
                "linux x86_64",
                "cros");
        return browser && desktopPlatform ? DESKTOP_WEB : UNKNOWN;
    }

    String telemetryValue() {
        return telemetryValue;
    }

    boolean supportsGoalVisualization() {
        return goalVisualizationSupported;
    }

    private static boolean containsAny(String value, String... markers) {
        for (String marker : markers) {
            if (value.contains(marker)) {
                return true;
            }
        }
        return false;
    }
}
