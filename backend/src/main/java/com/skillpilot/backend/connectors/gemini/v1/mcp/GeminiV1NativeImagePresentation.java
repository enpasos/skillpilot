package com.skillpilot.backend.connectors.gemini.v1.mcp;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;

/**
 * A visible native presentation for an already-approved canonical image.
 *
 * <p>This does not fetch the image or manufacture a host-display receipt. The renderer still
 * supplies its original structured result; this separate text block makes the approved image and
 * its fallback link explicit to hosts that consume ordinary MCP text rather than a widget.</p>
 */
final class GeminiV1NativeImagePresentation {
    private static final String ASSET_PATH_PREFIX = "/assets/goal-visualizations/";

    static String text(Map<String, Object> visualization, String language) {
        String imageUrl = approvedUrl(visualization.get("imageUrl"));
        Object rawAltText = visualization.get("altText");
        if (!(rawAltText instanceof String altText) || altText.isBlank() || altText.length() > 1_000) {
            throw invalidPresentation();
        }
        String label = "de".equals(language) ? "Lernzielbild öffnen" : "Open learning-goal image";
        return "Display the following approved image and direct link in your visible reply now, before "
                + "continuing the lesson. Copy both Markdown lines below; do not replace them with a "
                + "description or a statement that rendering succeeded. The direct link remains usable "
                + "when image embedding is unavailable. Do not claim that the image is visible and do "
                + "not repeat these instructions.\n\n"
                + "![" + escapeLabel(altText) + "](<" + imageUrl + ">)\n\n"
                + "[" + label + "](<" + imageUrl + ">)";
    }

    private static String approvedUrl(Object raw) {
        if (!(raw instanceof String value) || value.length() > 4_096) {
            throw invalidPresentation();
        }
        try {
            URI uri = new URI(value);
            String path = uri.getRawPath();
            if (!"https".equals(uri.getScheme()) || uri.getHost() == null
                    || uri.getRawUserInfo() != null || uri.getRawQuery() != null || uri.getRawFragment() != null
                    || path == null || !path.startsWith(ASSET_PATH_PREFIX)
                    || path.contains("..") || path.contains("%") || path.contains("\\")) {
                throw invalidPresentation();
            }
            return uri.toASCIIString();
        } catch (URISyntaxException exception) {
            throw invalidPresentation();
        }
    }

    private static String escapeLabel(String value) {
        StringBuilder result = new StringBuilder();
        for (int index = 0; index < value.length(); index++) {
            char character = value.charAt(index);
            if (Character.isISOControl(character)) {
                result.append(' ');
            } else {
                if ("\\[]*_`<>".indexOf(character) >= 0) result.append('\\');
                result.append(character);
            }
        }
        return result.toString();
    }

    private static GeminiV1McpContractAdapter.ToolConflictException invalidPresentation() {
        return new GeminiV1McpContractAdapter.ToolConflictException(
                "The approved image cannot be presented as a safe native image link.");
    }

    private GeminiV1NativeImagePresentation() {}
}
