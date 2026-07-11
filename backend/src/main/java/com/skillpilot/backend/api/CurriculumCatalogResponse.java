package com.skillpilot.backend.api;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Sanitized, package-derived curriculum discovery contract for runtime clients. */
public record CurriculumCatalogResponse(
        String catalogApiVersion,
        String generationSha256,
        List<PackageEntry> packages,
        List<String> rootLandscapeIds,
        List<LandscapeEntry> landscapes,
        List<ViewEntry> views,
        List<OfferingEntry> offerings) {

    public CurriculumCatalogResponse {
        packages = List.copyOf(packages);
        rootLandscapeIds = List.copyOf(rootLandscapeIds);
        landscapes = List.copyOf(landscapes);
        views = List.copyOf(views);
        offerings = List.copyOf(offerings);
    }

    public record PackageEntry(
            String packageId,
            String packageVersion,
            String releaseId,
            String contentDigest,
            List<String> capabilities,
            List<ScopeDimension> scopeDimensions) {
        public PackageEntry {
            capabilities = List.copyOf(capabilities);
            scopeDimensions = List.copyOf(scopeDimensions);
        }
    }

    public record ScopeDimension(String id, List<String> values, List<ScopeComposite> composites) {
        public ScopeDimension {
            values = List.copyOf(values);
            composites = List.copyOf(composites);
        }
    }

    public record ScopeComposite(String value, List<String> members) {
        public ScopeComposite {
            members = List.copyOf(members);
        }
    }

    public record LandscapeEntry(
            String packageId,
            String landscapeId,
            String role,
            String locale,
            String frameworkId,
            String subject,
            String country,
            String region,
            String schoolForm,
            String defaultOfferingId,
            String parentLandscapeId) {
    }

    public record ViewEntry(
            String packageId,
            String viewId,
            String landscapeId,
            String language,
            Map<String, String> scope) {
        public ViewEntry {
            scope = immutableOrderedMap(scope);
        }
    }

    public record OfferingEntry(
            String packageId,
            String offeringId,
            String landscapeId,
            Map<String, String> scope,
            ViewResolution resolution) {
        public OfferingEntry {
            scope = immutableOrderedMap(scope);
        }
    }

    public record ViewResolution(String mode, String mergeDimension, List<String> viewIds) {
        public ViewResolution {
            viewIds = List.copyOf(viewIds);
        }
    }

    private static <K, V> Map<K, V> immutableOrderedMap(Map<K, V> source) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(source));
    }
}
