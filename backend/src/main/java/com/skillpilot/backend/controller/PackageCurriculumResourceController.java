package com.skillpilot.backend.controller;

import com.skillpilot.backend.curriculumpackage.PackageCurriculumResourceState;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.HandlerMapping;

/** Delivers only bytes bound to the active package generation. */
@RestController
@ConditionalOnProperty(prefix = "skillpilot.curriculum", name = "source", havingValue = "package")
public class PackageCurriculumResourceController {

    private static final AntPathMatcher PATH_MATCHER = new AntPathMatcher();
    private static final CacheControl VERSIONED_CACHE = CacheControl
            .maxAge(365, TimeUnit.DAYS)
            .cachePublic()
            .immutable();

    private final PackageCurriculumResourceState resourceState;

    public PackageCurriculumResourceController(PackageCurriculumResourceState resourceState) {
        this.resourceState = resourceState;
    }

    @GetMapping("/api/ui/curriculum-resources/packages/{packageId}/{packageVersion}/decks/{deckId}/{locale}")
    public ResponseEntity<Resource> getDeck(
            @PathVariable String packageId,
            @PathVariable String packageVersion,
            @PathVariable String deckId,
            @PathVariable String locale) {
        return versioned(resourceState.resolveDeck(packageId, packageVersion, deckId, locale));
    }

    @GetMapping("/api/ui/curriculum-resources/packages/{packageId}/{packageVersion}/resources/{resourceId}")
    public ResponseEntity<Resource> getResource(
            @PathVariable String packageId,
            @PathVariable String packageVersion,
            @PathVariable String resourceId) {
        return versioned(resourceState.resolveResource(packageId, packageVersion, resourceId));
    }

    @GetMapping({"/ai-assets/**", "/assets/goal-visualizations/**"})
    public ResponseEntity<Resource> getPublicAsset(HttpServletRequest request) {
        String publicUrl = extractPublicUrl(request);
        if (publicUrl == null) {
            return ResponseEntity.notFound().build();
        }
        Optional<PackageCurriculumResourceState.ResolvedArtifact> resolved =
                resourceState.resolvePublicAsset(publicUrl);
        if (resolved.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return response(resolved.get(), CacheControl.noCache().cachePublic());
    }

    /** Prevents the generic static handler from becoming a package-mode deck/data fallback. */
    @GetMapping("/data/**")
    public ResponseEntity<Void> rejectLegacyStaticData() {
        return ResponseEntity.notFound().build();
    }

    private static ResponseEntity<Resource> versioned(
            Optional<PackageCurriculumResourceState.ResolvedArtifact> resolved) {
        return resolved
                .map(artifact -> response(artifact, VERSIONED_CACHE))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private static ResponseEntity<Resource> response(
            PackageCurriculumResourceState.ResolvedArtifact artifact,
            CacheControl cacheControl) {
        byte[] bytes = artifact.bytes();
        Resource resource = new ByteArrayResource(bytes, "package resource " + artifact.href()) {
            @Override
            public String getFilename() {
                return artifact.filename();
            }
        };
        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .eTag('"' + artifact.sha256() + '"')
                .contentLength(bytes.length)
                .contentType(MediaType.parseMediaType(artifact.mediaType()))
                .body(resource);
    }

    private static String extractPublicUrl(HttpServletRequest request) {
        String pathWithinMapping = (String) request.getAttribute(
                HandlerMapping.PATH_WITHIN_HANDLER_MAPPING_ATTRIBUTE);
        String bestMatchPattern = (String) request.getAttribute(
                HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        if (pathWithinMapping == null || bestMatchPattern == null) {
            return null;
        }
        if (pathWithinMapping.startsWith("/assets/goal-visualizations/")) {
            return pathWithinMapping;
        }
        if (!pathWithinMapping.startsWith("/ai-assets/")) {
            return null;
        }
        String extracted = PATH_MATCHER.extractPathWithinPattern(bestMatchPattern, pathWithinMapping);
        if (extracted == null || extracted.isBlank()) {
            return null;
        }
        return "/assets/" + extracted.replaceAll("^/+", "");
    }
}
