package com.skillpilot.backend.openai.mcp.de.v1;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.skillpilot.backend.curriculumpackage.PackageCurriculumResourceState;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;

class OpenAiDeGoalVisualizationImageResolverTest {

    private static final String PUBLIC_PATH =
            "/assets/goal-visualizations/mathematik/goal-id/goal-id.jpg";
    private static final String ABSOLUTE_URL = "https://skillpilot.com" + PUBLIC_PATH;

    private PackageCurriculumResourceState packageResourceState;
    private OpenAiDeGoalVisualizationImageResolver resolver;

    @BeforeEach
    void setUp() {
        packageResourceState = mock(PackageCurriculumResourceState.class);
        @SuppressWarnings("unchecked")
        ObjectProvider<PackageCurriculumResourceState> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(packageResourceState);
        resolver = new OpenAiDeGoalVisualizationImageResolver(provider);
    }

    @Test
    void resolvesOnlyTheVerifiedPackageBytesForAnApprovedHttpsAsset() {
        byte[] original = {(byte) 0xff, (byte) 0xd8, (byte) 0xff, 1, 2, 3};
        when(packageResourceState.resolvePublicAsset(
                        PUBLIC_PATH,
                        OpenAiDeGoalVisualizationImageResolver.MAX_MCP_IMAGE_BYTES))
                .thenReturn(Optional.of(new PackageCurriculumResourceState.ResolvedArtifact(
                        original,
                        "image/jpeg",
                        "goal-id.jpg",
                        "sha256",
                        "/api/ui/curriculum-resources/packages/package/version/resources/goal-id")));

        OpenAiDeGoalVisualizationImageResolver.ResolvedImage image =
                resolver.resolve(ABSOLUTE_URL).orElseThrow();

        assertThat(image.mediaType()).isEqualTo("image/jpeg");
        assertThat(image.bytes()).containsExactly(
                (byte) 0xff, (byte) 0xd8, (byte) 0xff, (byte) 1, (byte) 2, (byte) 3);
        original[0] = 9;
        byte[] returned = image.bytes();
        returned[1] = 9;
        assertThat(image.bytes()).containsExactly(
                (byte) 0xff, (byte) 0xd8, (byte) 0xff, (byte) 1, (byte) 2, (byte) 3);
        verify(packageResourceState).resolvePublicAsset(
                PUBLIC_PATH,
                OpenAiDeGoalVisualizationImageResolver.MAX_MCP_IMAGE_BYTES);
    }

    @Test
    void rejectsUrlsOutsideTheExactApprovedPublicAssetLaneBeforeReadingPackageState() {
        for (String url : new String[] {
                "http://skillpilot.com" + PUBLIC_PATH,
                ABSOLUTE_URL + "?token=secret",
                ABSOLUTE_URL + "#fragment",
                "https://skillpilot.com/assets/other/goal-id.jpg",
                "https://skillpilot.com/assets/goal-visualizations/../secret.jpg",
                "https://skillpilot.com/assets/goal-visualizations/%2e%2e/secret.jpg",
                "",
                "not-a-url"
        }) {
            assertThat(resolver.resolve(url)).isEmpty();
        }

        verify(packageResourceState, never()).resolvePublicAsset(
                org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void rejectsUnsupportedMissingAndOversizedPackageArtifacts() {
        when(packageResourceState.resolvePublicAsset(
                        PUBLIC_PATH,
                        OpenAiDeGoalVisualizationImageResolver.MAX_MCP_IMAGE_BYTES))
                .thenReturn(Optional.empty())
                .thenReturn(Optional.of(new PackageCurriculumResourceState.ResolvedArtifact(
                        new byte[] {1},
                        "image/svg+xml",
                        "goal-id.jpg",
                        "sha256",
                        "/resource")))
                .thenReturn(Optional.of(new PackageCurriculumResourceState.ResolvedArtifact(
                        new byte[OpenAiDeGoalVisualizationImageResolver.MAX_MCP_IMAGE_BYTES + 1],
                        "image/jpeg",
                        "goal-id.jpg",
                        "sha256",
                        "/resource")));

        assertThat(resolver.resolve(ABSOLUTE_URL)).isEmpty();
        assertThat(resolver.resolve(ABSOLUTE_URL)).isEmpty();
        assertThat(resolver.resolve(ABSOLUTE_URL)).isEmpty();
    }

    @Test
    void rejectsBytesWhoseSignatureDoesNotMatchTheDeclaredImageType() {
        when(packageResourceState.resolvePublicAsset(
                        PUBLIC_PATH,
                        OpenAiDeGoalVisualizationImageResolver.MAX_MCP_IMAGE_BYTES))
                .thenReturn(Optional.of(new PackageCurriculumResourceState.ResolvedArtifact(
                        new byte[] {1, 2, 3},
                        "image/jpeg",
                        "goal-id.jpg",
                        "sha256",
                        "/resource")))
                .thenReturn(Optional.of(new PackageCurriculumResourceState.ResolvedArtifact(
                        new byte[] {(byte) 0xff, (byte) 0xd8, (byte) 0xff},
                        "image/png",
                        "goal-id.png",
                        "sha256",
                        "/resource")));

        assertThat(resolver.resolve(ABSOLUTE_URL)).isEmpty();
        assertThat(resolver.resolve(ABSOLUTE_URL)).isEmpty();
    }
}
