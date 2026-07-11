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
        List<OfferingEntry> offerings,
        List<DeckEntry> decks,
        List<ResourceEntry> resources,
        List<SourceEvidenceEntry> sourceEvidence) {

    public CurriculumCatalogResponse {
        packages = List.copyOf(packages);
        rootLandscapeIds = List.copyOf(rootLandscapeIds);
        landscapes = List.copyOf(landscapes);
        views = List.copyOf(views);
        offerings = List.copyOf(offerings);
        decks = List.copyOf(decks);
        resources = List.copyOf(resources);
        sourceEvidence = List.copyOf(sourceEvidence);
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

    public record DeckEntry(
            String packageId,
            String packageVersion,
            String deckId,
            String landscapeId,
            String locale,
            String href) {
    }

    public record ResourceEntry(
            String packageId,
            String packageVersion,
            String resourceId,
            String landscapeId,
            String ownerGoalId,
            String resourceKind,
            String delivery,
            String mediaType,
            String publicUrl,
            String href,
            boolean runtimeRequired,
            Long bytes,
            String sha256) {
    }

    public record SourceEvidenceEntry(
            String packageId,
            String packageVersion,
            String targetLandscapeId,
            int sourceCollectionCount,
            int sourceDocumentCount,
            int sourceGoalCount,
            int mappingEdgeCount,
            List<SourceEvidenceGoalEntry> goals,
            String href) {
        public SourceEvidenceEntry {
            goals = List.copyOf(goals);
        }
    }

    public record SourceEvidenceGoalEntry(String goalId, List<String> jurisdictions) {
        public SourceEvidenceGoalEntry {
            jurisdictions = List.copyOf(jurisdictions);
        }
    }

    private static <K, V> Map<K, V> immutableOrderedMap(Map<K, V> source) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(source));
    }
}
