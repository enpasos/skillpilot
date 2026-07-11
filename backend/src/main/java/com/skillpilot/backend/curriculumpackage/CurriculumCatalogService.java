package com.skillpilot.backend.curriculumpackage;

import com.skillpilot.backend.api.CurriculumCatalogResponse;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Objects;

/** Immutable, path-free projection of the active package runtime catalog. */
public final class CurriculumCatalogService {

    private static final String CATALOG_API_VERSION = "1.1";

    private final CurriculumCatalogResponse catalog;

    public CurriculumCatalogService(
            CurriculumRuntimeSnapshot snapshot,
            PackageCurriculumResourceState resourceState) {
        Objects.requireNonNull(snapshot, "snapshot");
        Objects.requireNonNull(resourceState, "resourceState");
        if (!snapshot.generationSha256().equals(resourceState.generationSha256())) {
            throw new CurriculumPackageException("Catalog and package resource generations differ");
        }
        Map<String, String> packageVersions = new LinkedHashMap<>();
        snapshot.packages().forEach(descriptor ->
                packageVersions.put(descriptor.packageId(), descriptor.packageVersion()));
        List<CurriculumCatalogResponse.PackageEntry> packages = snapshot.packages().stream()
                .map(descriptor -> new CurriculumCatalogResponse.PackageEntry(
                        descriptor.packageId(),
                        descriptor.packageVersion(),
                        descriptor.releaseId(),
                        descriptor.contentDigest(),
                        descriptor.capabilities(),
                        descriptor.scopeDimensions().stream()
                                .map(dimension -> new CurriculumCatalogResponse.ScopeDimension(
                                        dimension.id(),
                                        dimension.values(),
                                        dimension.composites().stream()
                                                .map(composite -> new CurriculumCatalogResponse.ScopeComposite(
                                                        composite.value(), composite.members()))
                                                .toList()))
                                .toList()))
                .toList();
        List<CurriculumCatalogResponse.LandscapeEntry> landscapes = snapshot.landscapesById().values().stream()
                .map(descriptor -> new CurriculumCatalogResponse.LandscapeEntry(
                        descriptor.packageId(),
                        descriptor.landscapeId(),
                        descriptor.role(),
                        descriptor.locale(),
                        descriptor.frameworkId(),
                        descriptor.subject(),
                        descriptor.country(),
                        descriptor.region(),
                        descriptor.schoolForm(),
                        descriptor.defaultOfferingId(),
                        descriptor.parentLandscapeId()))
                .toList();
        List<CurriculumCatalogResponse.ViewEntry> views = snapshot.viewsById().values().stream()
                .map(descriptor -> new CurriculumCatalogResponse.ViewEntry(
                        descriptor.packageId(),
                        descriptor.viewId(),
                        descriptor.landscapeId(),
                        descriptor.language(),
                        descriptor.scope()))
                .toList();
        List<CurriculumCatalogResponse.OfferingEntry> offerings = snapshot.offeringsById().values().stream()
                .map(descriptor -> new CurriculumCatalogResponse.OfferingEntry(
                        descriptor.packageId(),
                        descriptor.offeringId(),
                        descriptor.landscapeId(),
                        descriptor.scope(),
                        new CurriculumCatalogResponse.ViewResolution(
                                descriptor.resolutionMode(),
                                descriptor.mergeDimension(),
                                descriptor.viewIds())))
                .toList();
        List<CurriculumCatalogResponse.DeckEntry> decks = snapshot.decksByKey().values().stream()
                .map(descriptor -> {
                    CurriculumRuntimeSnapshot.DeckKey key = descriptor.key();
                    return new CurriculumCatalogResponse.DeckEntry(
                            key.packageId(),
                            requirePackageVersion(packageVersions, key.packageId()),
                            key.deckId(),
                            descriptor.landscapeId(),
                            key.locale(),
                            requireHref(resourceState.deckHrefs(), key, "deck"));
                })
                .toList();
        List<CurriculumCatalogResponse.ResourceEntry> resources = snapshot.resourcesById().values().stream()
                .map(descriptor -> {
                    CurriculumRuntimeSnapshot.Artifact artifact = descriptor.artifact();
                    return new CurriculumCatalogResponse.ResourceEntry(
                            descriptor.packageId(),
                            requirePackageVersion(packageVersions, descriptor.packageId()),
                            descriptor.resourceId(),
                            descriptor.landscapeId(),
                            descriptor.ownerGoalId(),
                            descriptor.catalogResourceKind(),
                            descriptor.delivery(),
                            descriptor.mediaType(),
                            descriptor.publicUrl(),
                            requireHref(resourceState.resourceHrefs(), descriptor.resourceId(), "resource"),
                            artifact != null && artifact.runtimeRequired(),
                            artifact == null ? null : artifact.bytes(),
                            artifact == null ? null : artifact.sha256());
                })
                .toList();
        this.catalog = new CurriculumCatalogResponse(
                CATALOG_API_VERSION,
                snapshot.generationSha256(),
                packages,
                snapshot.rootLandscapeIds(),
                landscapes,
                views,
                offerings,
                decks,
                resources);
    }

    public CurriculumCatalogResponse getCatalog() {
        return catalog;
    }

    private static String requirePackageVersion(Map<String, String> packageVersions, String packageId) {
        String version = packageVersions.get(packageId);
        if (version == null) {
            throw new CurriculumPackageException("Catalog entry references an unknown package: " + packageId);
        }
        return version;
    }

    private static <K> String requireHref(Map<K, String> hrefs, K key, String kind) {
        String href = hrefs.get(key);
        if (href == null) {
            throw new CurriculumPackageException("Catalog has no " + kind + " href for " + key);
        }
        return href;
    }
}
