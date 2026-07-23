package com.skillpilot.backend.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.skillpilot.backend.curriculumpackage.PackageCurriculumResourceState;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.servlet.HandlerMapping;

class PackageCurriculumResourceControllerTest {

    private final PackageCurriculumResourceState state = mock(PackageCurriculumResourceState.class);
    private final PackageCurriculumResourceController controller =
            new PackageCurriculumResourceController(state);

    @Test
    void servesExactVersionedDeckWithImmutableHashBoundResponse() throws Exception {
        var artifact = artifact("{\"cards\":[]}", "application/json", "deck.de.json");
        when(state.resolveDeck("org.example.math", "1.2.3", "math-core", "de-DE"))
                .thenReturn(Optional.of(artifact));

        var response = controller.getDeck("org.example.math", "1.2.3", "math-core", "de-DE");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getHeaders().getContentType().toString()).isEqualTo("application/json");
        assertThat(response.getHeaders().getETag()).isEqualTo('"' + "a".repeat(64) + '"');
        assertThat(response.getHeaders().getCacheControl())
                .contains("max-age=31536000")
                .contains("immutable");
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getContentAsString(StandardCharsets.UTF_8))
                .isEqualTo("{\"cards\":[]}");
    }

    @Test
    void unknownOrExternalResourceHasNoByteEndpoint() {
        when(state.resolveResource("org.example.math", "1.2.3", "external-tool"))
                .thenReturn(Optional.empty());

        assertThat(controller.getResource(
                        "org.example.math", "1.2.3", "external-tool").getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void legacyAiAndVisualizationAliasesUseOnlyExactPackagePublicUrls() throws Exception {
        var artifact = artifact("image", "image/png", "goal.png");
        when(state.resolvePublicAsset("/assets/goal-visualizations/math/goal.png"))
                .thenReturn(Optional.of(artifact));

        MockHttpServletRequest aiRequest = mappedRequest(
                "/ai-assets/goal-visualizations/math/goal.png", "/ai-assets/**");
        var aiResponse = controller.getPublicAsset(aiRequest);
        MockHttpServletRequest directRequest = mappedRequest(
                "/assets/goal-visualizations/math/goal.png", "/assets/goal-visualizations/**");
        var directResponse = controller.getPublicAsset(directRequest);

        assertThat(aiResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(directResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(aiResponse.getHeaders().getCacheControl()).contains("no-cache");
        assertThat(aiResponse.getBody().getContentAsString(StandardCharsets.UTF_8)).isEqualTo("image");
        verify(state, org.mockito.Mockito.times(2))
                .resolvePublicAsset("/assets/goal-visualizations/math/goal.png");
    }

    @Test
    void malformedOrUnknownPublicAliasesFailClosed() {
        MockHttpServletRequest traversal = mappedRequest(
                "/ai-assets/../secret.png", "/ai-assets/**");
        when(state.resolvePublicAsset("/assets/../secret.png")).thenReturn(Optional.empty());

        assertThat(controller.getPublicAsset(traversal).getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(controller.getPublicAsset(new MockHttpServletRequest()).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(controller.rejectLegacyStaticData().getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void springRoutesVersionedIdsAndBlocksGenericStaticDataFallback() throws Exception {
        when(state.resolveResource("org.example.math", "1.2.3", "goal-resource:one"))
                .thenReturn(Optional.of(artifact("image", "image/png", "goal.png")));
        when(state.resolvePublicAsset("/assets/goal-visualizations/math/goal.png"))
                .thenReturn(Optional.of(artifact("image", "image/png", "goal.png")));
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();

        mockMvc.perform(get(
                        "/api/ui/curriculum-resources/packages/org.example.math/1.2.3/"
                                + "resources/goal-resource:one"))
                .andExpect(status().isOk())
                .andExpect(content().bytes("image".getBytes(StandardCharsets.UTF_8)))
                .andExpect(header().string("ETag", '"' + "a".repeat(64) + '"'));
        mockMvc.perform(get("/ai-assets/goal-visualizations/math/goal.png"))
                .andExpect(status().isOk())
                .andExpect(content().contentType("image/png"));
        mockMvc.perform(get("/assets/goal-visualizations/math/unknown.png"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/data/cards/repository-deck.de.json"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/data/goal-source-rationales-math-public.json"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/data/goal-source-rationales-physics-public.json"))
                .andExpect(status().isNotFound());
    }

    private static PackageCurriculumResourceState.ResolvedArtifact artifact(
            String body,
            String mediaType,
            String filename) {
        return new PackageCurriculumResourceState.ResolvedArtifact(
                body.getBytes(StandardCharsets.UTF_8),
                mediaType,
                filename,
                "a".repeat(64),
                "/api/ui/curriculum-resources/example");
    }

    private static MockHttpServletRequest mappedRequest(String path, String pattern) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", path);
        request.setAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE, path);
        request.setAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE, pattern);
        return request;
    }
}
