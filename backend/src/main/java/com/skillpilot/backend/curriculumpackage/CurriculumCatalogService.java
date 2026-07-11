package com.skillpilot.backend.curriculumpackage;

import com.skillpilot.backend.api.CurriculumCatalogResponse;
import java.util.List;
import java.util.Objects;

/** Immutable, path-free projection of the active package runtime catalog. */
public final class CurriculumCatalogService {

    private static final String CATALOG_API_VERSION = "1.0";

    private final CurriculumCatalogResponse catalog;

    public CurriculumCatalogService(CurriculumRuntimeSnapshot snapshot) {
        Objects.requireNonNull(snapshot, "snapshot");
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
        this.catalog = new CurriculumCatalogResponse(
                CATALOG_API_VERSION,
                snapshot.generationSha256(),
                packages,
                snapshot.rootLandscapeIds(),
                landscapes,
                views,
                offerings);
    }

    public CurriculumCatalogResponse getCatalog() {
        return catalog;
    }
}
