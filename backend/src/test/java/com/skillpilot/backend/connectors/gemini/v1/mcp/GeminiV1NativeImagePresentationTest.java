package com.skillpilot.backend.connectors.gemini.v1.mcp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class GeminiV1NativeImagePresentationTest {
    private static final String IMAGE_URL = "https://skillpilot.com/assets/goal-visualizations/goal-image.png";

    @Test
    void approvedImageHasAnExplicitVisibleImageAndDirectFallbackLinkWithoutPrivateFields() {
        String text = GeminiV1NativeImagePresentation.text(Map.of(
                "imageUrl", IMAGE_URL, "altText", "Winkel im Bogenmaß",
                "goalId", "internal-goal-reference", "learningSessionId", "private-session-value"), "de");
        assertThat(text).contains(
                "visible reply now", "Copy both Markdown lines", "when image embedding is unavailable",
                "![Winkel im Bogenmaß](<" + IMAGE_URL + ">)",
                "[Lernzielbild öffnen](<" + IMAGE_URL + ">)")
                .doesNotContain("internal-goal-reference", "private-session-value");
    }

    @Test
    void authoredAltTextCannotBreakOutIntoAnotherMarkdownLinkOrHtml() {
        String text = GeminiV1NativeImagePresentation.text(Map.of(
                "imageUrl", IMAGE_URL,
                "altText", "[title](https://unapproved.invalid/)\n<img> `hint` \\ tail"), "en");
        assertThat(text).contains(
                "![\\[title\\](https://unapproved.invalid/) \\<img\\> \\`hint\\` \\\\ tail](<" + IMAGE_URL + ">)",
                "[Open learning-goal image](<" + IMAGE_URL + ">)")
                .doesNotContain("<img>")
                // The only actual Markdown destination is the canonical asset; the authored
                // parentheses remain inside an escaped label rather than becoming another link.
                .doesNotContain("[title](https://unapproved.invalid/)");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "javascript:alert(1)",
            "https://skillpilot.com/other/image.png",
            "https://skillpilot.com/assets/goal-visualizations/../other.png",
            "https://skillpilot.com/assets/goal-visualizations/%2e%2e/other.png",
            "https://user:password@skillpilot.com/assets/goal-visualizations/image.png",
            "https://skillpilot.com/assets/goal-visualizations/image.png?token=private",
            "https://skillpilot.com/assets/goal-visualizations/image.png#fragment",
            "https://skillpilot.com/assets/goal-visualizations/image.png\n[foreign](https://unapproved.invalid)"
    })
    void unsupportedUrlCannotBecomeALink(String url) {
        assertThatThrownBy(() -> GeminiV1NativeImagePresentation.text(
                Map.of("imageUrl", url, "altText", "Approved learning-goal image"), "en"))
                .isInstanceOf(GeminiV1McpContractAdapter.ToolConflictException.class)
                .hasMessage("The approved image cannot be presented as a safe native image link.");
    }
}
