package com.skillpilot.backend.curriculumpackage;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** One immutable, lock-bound generation of package runtime discovery data. */
public final class CurriculumRuntimeSnapshot {

    private final String generationSha256;
    private final List<PackageDescriptor> packages;
    private final List<String> rootLandscapeIds;
    private final Map<String, LandscapeDescriptor> landscapesById;
    private final Map<String, ViewDescriptor> viewsById;
    private final Map<String, OfferingDescriptor> offeringsById;
    private final Map<DeckKey, DeckDescriptor> decksByKey;
    private final Map<String, ResourceDescriptor> resourcesById;
    private final Map<String, ResourceDescriptor> resourcesByPublicUrl;
    private final Map<String, String> migrationAliasesJsonByPackageId;
    private final int definitionCount;

    CurriculumRuntimeSnapshot(
            String generationSha256,
            List<PackageDescriptor> packages,
            List<String> rootLandscapeIds,
            Map<String, LandscapeDescriptor> landscapesById,
            Map<String, ViewDescriptor> viewsById,
            Map<String, OfferingDescriptor> offeringsById,
            Map<DeckKey, DeckDescriptor> decksByKey,
            Map<String, ResourceDescriptor> resourcesById,
            Map<String, ResourceDescriptor> resourcesByPublicUrl,
            Map<String, String> migrationAliasesJsonByPackageId,
            int definitionCount) {
        this.generationSha256 = generationSha256;
        this.packages = List.copyOf(packages);
        this.rootLandscapeIds = List.copyOf(rootLandscapeIds);
        this.landscapesById = immutableOrderedMap(landscapesById);
        this.viewsById = immutableOrderedMap(viewsById);
        this.offeringsById = immutableOrderedMap(offeringsById);
        this.decksByKey = immutableOrderedMap(decksByKey);
        this.resourcesById = immutableOrderedMap(resourcesById);
        this.resourcesByPublicUrl = immutableOrderedMap(resourcesByPublicUrl);
        this.migrationAliasesJsonByPackageId = immutableOrderedMap(migrationAliasesJsonByPackageId);
        this.definitionCount = definitionCount;
    }

    public String generationSha256() {
        return generationSha256;
    }

    public List<PackageDescriptor> packages() {
        return packages;
    }

    public List<String> rootLandscapeIds() {
        return rootLandscapeIds;
    }

    public Map<String, LandscapeDescriptor> landscapesById() {
        return landscapesById;
    }

    public Map<String, ViewDescriptor> viewsById() {
        return viewsById;
    }

    public Map<String, OfferingDescriptor> offeringsById() {
        return offeringsById;
    }

    public Map<DeckKey, DeckDescriptor> decksByKey() {
        return decksByKey;
    }

    public Map<String, ResourceDescriptor> resourcesById() {
        return resourcesById;
    }

    public Map<String, ResourceDescriptor> resourcesByPublicUrl() {
        return resourcesByPublicUrl;
    }

    public Map<String, String> migrationAliasesJsonByPackageId() {
        return migrationAliasesJsonByPackageId;
    }

    public int definitionCount() {
        return definitionCount;
    }

    public record PackageDescriptor(
            String packageId,
            String packageVersion,
            String releaseId,
            String outerZipSha256,
            String manifestSha256,
            String contentDigest,
            String closureDigest,
            String definitionIndexDigest,
            List<ScopeDimension> scopeDimensions,
            List<String> capabilities) {
        public PackageDescriptor {
            scopeDimensions = List.copyOf(scopeDimensions);
            capabilities = List.copyOf(capabilities);
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

    public static final class Artifact {
        private final InstalledCurriculumPackage installedPackage;
        private final String relativePath;
        private final String role;
        private final String mediaType;
        private final long bytes;
        private final String sha256;

        Artifact(
                InstalledCurriculumPackage installedPackage,
                String relativePath,
                String role,
                String mediaType,
                long bytes,
                String sha256) {
            this.installedPackage = installedPackage;
            this.relativePath = relativePath;
            this.role = role;
            this.mediaType = mediaType;
            this.bytes = bytes;
            this.sha256 = sha256;
        }

        InstalledCurriculumPackage installedPackage() {
            return installedPackage;
        }

        public String packageId() {
            return installedPackage.lockEntry().packageId();
        }

        public String relativePath() {
            return relativePath;
        }

        public String role() {
            return role;
        }

        public String mediaType() {
            return mediaType;
        }

        public long bytes() {
            return bytes;
        }

        public String sha256() {
            return sha256;
        }
    }

    public record LandscapeDescriptor(
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
            String parentLandscapeId,
            Artifact artifact,
            String json) {
    }

    public record ViewDescriptor(
            String packageId,
            String viewId,
            String landscapeId,
            String language,
            Map<String, String> scope,
            Artifact artifact,
            String json) {
        public ViewDescriptor {
            scope = Map.copyOf(scope);
        }
    }

    public record OfferingDescriptor(
            String packageId,
            String offeringId,
            String landscapeId,
            Map<String, String> scope,
            String resolutionMode,
            String mergeDimension,
            List<String> viewIds) {
        public OfferingDescriptor {
            scope = Map.copyOf(scope);
            viewIds = List.copyOf(viewIds);
        }
    }

    public record DeckKey(String packageId, String deckId, String locale) {
    }

    public record DeckDescriptor(
            DeckKey key,
            String landscapeId,
            Artifact artifact,
            String json) {
    }

    public record ResourceDescriptor(
            String packageId,
            String resourceId,
            String landscapeId,
            String ownerGoalId,
            String resourceKind,
            String catalogResourceKind,
            String delivery,
            String mediaType,
            String publicUrl,
            String externalUrl,
            Artifact artifact) {
    }

    static <K, V> void putUnique(Map<K, V> target, K key, V value, String description) {
        V previous = target.putIfAbsent(key, value);
        if (previous != null) {
            throw new CurriculumPackageException("Ambiguous " + description + ": " + key);
        }
    }

    private static <K, V> Map<K, V> immutableOrderedMap(Map<K, V> source) {
        return Collections.unmodifiableMap(new LinkedHashMap<>(source));
    }
}
