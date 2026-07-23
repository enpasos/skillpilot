package com.skillpilot.backend.controller;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves the two reviewed repository compatibility indexes.
 *
 * <p>The exact mappings deliberately take precedence over the generic repository deck route.
 * Package mode does not create this controller and continues to reject all legacy {@code /data/**}
 * requests.</p>
 */
@RestController
@ConditionalOnProperty(
        prefix = "skillpilot.curriculum",
        name = "source",
        havingValue = "repository",
        matchIfMissing = true)
public class RepositorySourceRationaleController {

    private static final String STATIC_DATA_ROOT = "classpath:/static/data/";
    private static final String MATH_INDEX = "goal-source-rationales-math-public.json";
    private static final String PHYSICS_INDEX = "goal-source-rationales-physics-public.json";

    private final ResourceLoader resourceLoader;

    public RepositorySourceRationaleController(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @GetMapping(value = "/data/goal-source-rationales-math-public.json", produces = "application/json")
    public ResponseEntity<Resource> getMathIndex() {
        return getIndex(MATH_INDEX);
    }

    @GetMapping(value = "/data/goal-source-rationales-physics-public.json", produces = "application/json")
    public ResponseEntity<Resource> getPhysicsIndex() {
        return getIndex(PHYSICS_INDEX);
    }

    private ResponseEntity<Resource> getIndex(String fileName) {
        Resource resource = resourceLoader.getResource(STATIC_DATA_ROOT + fileName);
        if (!resource.exists() || !resource.isReadable()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(MediaType.APPLICATION_JSON)
                .body(resource);
    }
}
