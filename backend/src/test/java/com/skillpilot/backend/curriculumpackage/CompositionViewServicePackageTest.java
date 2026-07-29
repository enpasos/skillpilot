package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.service.CompositionViewService;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class CompositionViewServicePackageTest {

    @TempDir
    Path tempDir;

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void learnerScopeResolvesDurationNeutralOfferingAndKeepsPackageResolutionExact()
            throws Exception {
        Map<String, String> publishedScope = Map.of(
                "schoolForm", "Gymnasium",
                "stage", "SekII",
                "courseProfile", "LK");
        PackageCompositionViewState state =
                PackageCompositionViewState.load(withPublishedScope(load(), publishedScope), mapper);
        CompositionViewService service = new CompositionViewService(state);
        Map<String, String> committedLearnerScope = Map.of(
                "schoolForm", "Gymnasium",
                "stage", "SekII",
                "courseProfile", "LK",
                "durationModel", "G9");

        assertThat(state.resolveDocument("landscape-alpha", committedLearnerScope)).isNull();
        assertThat(service.findMatchingView("landscape-alpha", committedLearnerScope)).isNull();
        assertThat(service.findLearnerScopeView("landscape-alpha", committedLearnerScope))
                .containsEntry("viewId", "view-alpha")
                .containsEntry("scope", publishedScope);
    }

    @Test
    void learnerScopeResolvesGenericSekOneOfferingForCommittedJurisdictionAndDuration()
            throws Exception {
        Map<String, String> publishedScope = Map.of(
                "schoolForm", "Gymnasium",
                "stage", "SekI");
        PackageCompositionViewState state =
                PackageCompositionViewState.load(withPublishedScope(load(), publishedScope), mapper);
        CompositionViewService service = new CompositionViewService(state);
        Map<String, String> committedLearnerScope = Map.of(
                "schoolForm", "Gymnasium",
                "jurisdiction", "DE-BW",
                "stage", "SekI",
                "durationModel", "G9");

        assertThat(state.resolveDocument("landscape-alpha", committedLearnerScope)).isNull();
        assertThat(service.findMatchingView("landscape-alpha", committedLearnerScope)).isNull();
        assertThat(service.findLearnerScopeView("landscape-alpha", committedLearnerScope))
                .containsEntry("viewId", "view-alpha")
                .containsEntry("scope", publishedScope);
    }

    @Test
    void learnerScopeDoesNotDiscardDurationForCrossStageOrUnrelatedDimensions()
            throws Exception {
        Map<String, String> publishedScope = Map.of(
                "schoolForm", "Gymnasium",
                "stage", "SekII",
                "courseProfile", "LK");
        CompositionViewService service = new CompositionViewService(
                PackageCompositionViewState.load(withPublishedScope(load(), publishedScope), mapper));

        assertThat(service.findLearnerScopeView(
                        "landscape-alpha",
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "stage", "CrossStage",
                                "courseProfile", "LK",
                                "durationModel", "G9")))
                .isNull();
        assertThat(service.findLearnerScopeView(
                        "landscape-alpha",
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "stage", "SekII",
                                "courseProfile", "LK",
                                "durationModel", "G9",
                                "year", "12")))
                .isNull();
    }

    @Test
    void canonicalPackageOfferingRequiresTheJurisdictionDimensionToBeOmitted()
            throws Exception {
        Map<String, String> publishedScope = Map.of(
                "schoolForm", "Gymnasium",
                "stage", "SekII",
                "courseProfile", "LK");
        CompositionViewService service = new CompositionViewService(
                PackageCompositionViewState.load(withPublishedScope(load(), publishedScope), mapper));

        assertThat(service.findMatchingView("landscape-alpha", publishedScope))
                .containsEntry("viewId", "view-alpha");
        assertThat(service.findMatchingView(
                        "landscape-alpha",
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "jurisdiction", "ALL",
                                "stage", "SekII",
                                "courseProfile", "LK")))
                .isNull();
        assertThat(service.findLearnerScopeView(
                        "landscape-alpha",
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "jurisdiction", "ALL",
                                "stage", "SekII",
                                "courseProfile", "LK")))
                .isNull();
    }

    private CurriculumRuntimeSnapshot load() throws Exception {
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(mapper);
        CurriculumPackageTestFixture.PackageSpec spec =
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a');
        CurriculumPackageTestFixture.TestStore store = fixture.create(tempDir.resolve("alpha"), spec);
        CurriculumPackageProperties properties = new CurriculumPackageProperties();
        properties.setSource(CurriculumSourceMode.PACKAGE);
        properties.setConsumerVersion("0.1.0");
        properties.getPackages().setStoreDirectory(store.root().toString());
        CurriculumPackageFileReader reader = new CurriculumPackageFileReader();
        CurriculumPackageRepository repository = new FileSystemCurriculumPackageRepository(
                properties,
                mapper,
                reader);
        return new JsonCurriculumPackageLoader(properties, repository, reader, mapper).load();
    }

    private CurriculumRuntimeSnapshot withPublishedScope(
            CurriculumRuntimeSnapshot snapshot,
            Map<String, String> scope) throws Exception {
        CurriculumRuntimeSnapshot.ViewDescriptor originalView =
                snapshot.viewsById().get("view-alpha");
        CurriculumRuntimeSnapshot.ViewDescriptor view =
                new CurriculumRuntimeSnapshot.ViewDescriptor(
                        originalView.packageId(),
                        originalView.viewId(),
                        originalView.landscapeId(),
                        originalView.language(),
                        scope,
                        originalView.artifact(),
                        mapper.writeValueAsString(Map.of(
                                "viewId", originalView.viewId(),
                                "landscapeId", originalView.landscapeId(),
                                "scope", scope,
                                "rootNodes", List.of())));

        CurriculumRuntimeSnapshot.OfferingDescriptor originalOffering =
                snapshot.offeringsById().get("offering-alpha");
        CurriculumRuntimeSnapshot.OfferingDescriptor offering =
                new CurriculumRuntimeSnapshot.OfferingDescriptor(
                        originalOffering.packageId(),
                        originalOffering.offeringId(),
                        originalOffering.landscapeId(),
                        scope,
                        originalOffering.resolutionMode(),
                        originalOffering.mergeDimension(),
                        originalOffering.viewIds());

        List<CurriculumRuntimeSnapshot.PackageDescriptor> packages =
                new ArrayList<>();
        for (CurriculumRuntimeSnapshot.PackageDescriptor descriptor : snapshot.packages()) {
            Map<String, CurriculumRuntimeSnapshot.ScopeDimension> dimensions =
                    new LinkedHashMap<>();
            descriptor.scopeDimensions().forEach(dimension ->
                    dimensions.put(dimension.id(), dimension));
            scope.forEach((dimension, value) -> dimensions.putIfAbsent(
                    dimension,
                    new CurriculumRuntimeSnapshot.ScopeDimension(
                            dimension,
                            List.of(value),
                            List.of())));
            packages.add(new CurriculumRuntimeSnapshot.PackageDescriptor(
                    descriptor.packageId(),
                    descriptor.packageVersion(),
                    descriptor.releaseId(),
                    descriptor.outerZipSha256(),
                    descriptor.manifestSha256(),
                    descriptor.contentDigest(),
                    descriptor.closureDigest(),
                    descriptor.definitionIndexDigest(),
                    List.copyOf(dimensions.values()),
                    descriptor.capabilities()));
        }

        return new CurriculumRuntimeSnapshot(
                snapshot.generationSha256(),
                packages,
                snapshot.rootLandscapeIds(),
                snapshot.landscapesById(),
                Map.of(view.viewId(), view),
                Map.of(offering.offeringId(), offering),
                snapshot.decksByKey(),
                snapshot.resourcesById(),
                snapshot.resourcesByPublicUrl(),
                snapshot.artifactsByKey(),
                snapshot.migrationAliasesJsonByPackageId(),
                snapshot.definitionCount());
    }
}
