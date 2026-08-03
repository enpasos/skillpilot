package com.skillpilot.backend.openai.mcp.de.v1;

import com.skillpilot.backend.curriculumpackage.PackageCurriculumResourceState;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Locale;
import java.util.Optional;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

/** Resolves only approved, local learning-goal image assets for MCP image content. */
@Component
public final class OpenAiDeGoalVisualizationImageResolver {

    static final int MAX_MCP_IMAGE_BYTES = 6 * 1024 * 1024;
    private static final String PUBLIC_IMAGE_PREFIX = "/assets/goal-visualizations/";

    private final PackageCurriculumResourceState packageResourceState;

    public OpenAiDeGoalVisualizationImageResolver(
            ObjectProvider<PackageCurriculumResourceState> packageResourceStateProvider) {
        this.packageResourceState = packageResourceStateProvider.getIfAvailable();
    }

    public Optional<ResolvedImage> resolve(String absoluteImageUrl) {
        String publicPath = approvedPublicPath(absoluteImageUrl);
        if (publicPath == null) {
            return Optional.empty();
        }
        if (packageResourceState != null) {
            return packageResourceState.resolvePublicAsset(publicPath, MAX_MCP_IMAGE_BYTES)
                    .flatMap(artifact -> boundedImage(artifact.bytes(), artifact.mediaType()));
        }
        return resolveClasspathImage(publicPath);
    }

    private Optional<ResolvedImage> resolveClasspathImage(String publicPath) {
        ClassPathResource resource = new ClassPathResource("static" + publicPath);
        if (!resource.exists()) {
            return Optional.empty();
        }
        String mediaType = mediaType(publicPath);
        if (mediaType == null) {
            return Optional.empty();
        }
        try (InputStream input = resource.getInputStream()) {
            byte[] bytes = input.readNBytes(MAX_MCP_IMAGE_BYTES + 1);
            return boundedImage(bytes, mediaType);
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read the approved learning-goal image.", exception);
        }
    }

    private static Optional<ResolvedImage> boundedImage(byte[] bytes, String mediaType) {
        if (bytes == null
                || bytes.length == 0
                || bytes.length > MAX_MCP_IMAGE_BYTES
                || !hasExpectedSignature(bytes, mediaType)) {
            return Optional.empty();
        }
        return Optional.of(new ResolvedImage(bytes, mediaType));
    }

    private static boolean hasExpectedSignature(byte[] bytes, String mediaType) {
        if ("image/jpeg".equals(mediaType)) {
            return bytes.length >= 3
                    && Byte.toUnsignedInt(bytes[0]) == 0xff
                    && Byte.toUnsignedInt(bytes[1]) == 0xd8
                    && Byte.toUnsignedInt(bytes[2]) == 0xff;
        }
        if ("image/png".equals(mediaType)) {
            int[] signature = {0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};
            if (bytes.length < signature.length) {
                return false;
            }
            for (int index = 0; index < signature.length; index++) {
                if (Byte.toUnsignedInt(bytes[index]) != signature[index]) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    private static String approvedPublicPath(String absoluteImageUrl) {
        if (absoluteImageUrl == null || absoluteImageUrl.isBlank()) {
            return null;
        }
        try {
            URI uri = URI.create(absoluteImageUrl);
            String path = uri.getRawPath();
            if (!uri.isAbsolute()
                    || !"https".equalsIgnoreCase(uri.getScheme())
                    || uri.getRawQuery() != null
                    || uri.getRawFragment() != null
                    || path == null
                    || !path.startsWith(PUBLIC_IMAGE_PREFIX)
                    || path.contains("..")
                    || path.contains("%")) {
                return null;
            }
            return path;
        } catch (IllegalArgumentException exception) {
            return null;
        }
    }

    private static String mediaType(String publicPath) {
        String lower = publicPath.toLowerCase(Locale.ROOT);
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
            return "image/jpeg";
        }
        if (lower.endsWith(".png")) {
            return "image/png";
        }
        return null;
    }

    public record ResolvedImage(byte[] bytes, String mediaType) {
        public ResolvedImage {
            bytes = bytes.clone();
        }

        @Override
        public byte[] bytes() {
            return bytes.clone();
        }
    }
}
