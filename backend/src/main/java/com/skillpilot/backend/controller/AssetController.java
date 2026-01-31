package com.skillpilot.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping({"/ai-assets"})
public class AssetController {

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();

    private final ResourceLoader resourceLoader;
    private final String externalAssetsDir;

    public AssetController(ResourceLoader resourceLoader,
            @Value("${skillpilot.assets.directory:}") String externalAssetsDir) {
        this.resourceLoader = resourceLoader;
        this.externalAssetsDir = externalAssetsDir == null ? "" : externalAssetsDir.trim();
    }

    @GetMapping("/**")
    public ResponseEntity<Resource> getAsset(HttpServletRequest request) throws IOException {
        String path = extractPath(request);
        if (path == null || path.isBlank()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = resolveResource(path);
        if (resource == null || !resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        MediaType mediaType = MediaTypeFactory.getMediaType(resource).orElse(MediaType.APPLICATION_OCTET_STREAM);
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic())
                .contentType(mediaType)
                .body(resource);
    }

    private Resource resolveResource(String relativePath) {
        Resource classpath = resourceLoader.getResource("classpath:/static/assets/" + relativePath);
        if (classpath.exists()) {
            return classpath;
        }

        if (!relativePath.contains(".")) {
            Resource withExtension = resolveWithExtension(relativePath);
            if (withExtension != null && withExtension.exists()) {
                return withExtension;
            }
        }

        if (!externalAssetsDir.isEmpty()) {
            String normalized = externalAssetsDir.endsWith("/") ? externalAssetsDir : externalAssetsDir + "/";
            Resource external = resourceLoader.getResource("file:" + normalized + relativePath);
            if (external.exists()) {
                return external;
            }

            if (!relativePath.contains(".")) {
                Resource externalWithExtension = resolveExternalWithExtension(normalized, relativePath);
                if (externalWithExtension != null && externalWithExtension.exists()) {
                    return externalWithExtension;
                }
            }
        }

        return classpath;
    }

    private Resource resolveWithExtension(String relativePath) {
        String[] extensions = new String[] { ".png", ".jpg", ".jpeg", ".gif", ".webp" };
        for (String ext : extensions) {
            Resource candidate = resourceLoader.getResource("classpath:/static/assets/" + relativePath + ext);
            if (candidate.exists()) {
                return candidate;
            }
        }
        return null;
    }

    private Resource resolveExternalWithExtension(String baseDir, String relativePath) {
        String[] extensions = new String[] { ".png", ".jpg", ".jpeg", ".gif", ".webp" };
        for (String ext : extensions) {
            Resource candidate = resourceLoader.getResource("file:" + baseDir + relativePath + ext);
            if (candidate.exists()) {
                return candidate;
            }
        }
        return null;
    }

    private String extractPath(HttpServletRequest request) {
        String pathWithinMapping = (String) request.getAttribute(HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String bestMatchPattern = (String) request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        if (pathWithinMapping == null || bestMatchPattern == null) {
            return null;
        }
        String extracted = PATH_MATCHER.extractPathWithinPattern(bestMatchPattern, pathWithinMapping);
        if (extracted == null) {
            return null;
        }
        return extracted.replaceAll("^/+", "");
    }
}
