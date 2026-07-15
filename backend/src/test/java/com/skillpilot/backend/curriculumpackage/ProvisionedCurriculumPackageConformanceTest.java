package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.Test;

/**
 * Loads the real content-addressed Mathematics store produced earlier by the
 * repository-wide conformance lane. Standalone backend jobs skip this test because
 * their checkout intentionally has no 1.7-GB release artifact.
 */
class ProvisionedCurriculumPackageConformanceTest {

    @Test
    void loadsTheRealProvisionedMathematicsReleaseWithoutRepositoryDiscovery() {
        String configuredStore = System.getenv("SKILLPILOT_CONFORMANCE_PACKAGE_STORE");
        Assumptions.assumeTrue(
                configuredStore != null && !configuredStore.isBlank(),
                "real package store is supplied only by repository-wide conformance");
        Path store = Path.of(configuredStore).toAbsolutePath().normalize();
        Assumptions.assumeTrue(
                Files.isRegularFile(store.resolve("locks/active.json")),
                "real provisioned active lock is unavailable");

        CurriculumPackageProperties properties = new CurriculumPackageProperties();
        properties.setSource(CurriculumSourceMode.PACKAGE);
        properties.setConsumerVersion("0.1.0");
        properties.getPackages().setStoreDirectory(store.toString());
        CurriculumPackageFileReader reader = new CurriculumPackageFileReader();
        ObjectMapper mapper = new ObjectMapper();
        CurriculumPackageRepository repository = new FileSystemCurriculumPackageRepository(
                properties, mapper, reader);

        CurriculumRuntimeSnapshot snapshot = new JsonCurriculumPackageLoader(
                properties, repository, reader, mapper).load();

        assertThat(snapshot.packages()).hasSize(1);
        assertThat(snapshot.packages().getFirst().packageId())
                .isEqualTo("org.skillpilot.curriculum.de.gymnasium.mathematik");
        assertThat(snapshot.packages().getFirst().contentDigest())
                .isEqualTo("sha256:f867f79d44fc2ead12cb4b6d4a4c15c741eb26e369c430d7776dd7e032f45dbb");
        assertThat(snapshot.rootLandscapeIds()).hasSize(1);
        assertThat(snapshot.landscapesById()).hasSize(1);
        assertThat(snapshot.viewsById()).hasSize(88);
        assertThat(snapshot.offeringsById()).hasSize(88);
        assertThat(snapshot.decksByKey()).hasSize(12);
        assertThat(snapshot.resourcesById()).hasSize(826);
        assertThat(snapshot.resourcesByPublicUrl()).hasSize(757);
        long cardCount = snapshot.decksByKey().values().stream().mapToLong(deck -> {
            try {
                return mapper.readTree(deck.json()).path("cards").size();
            } catch (java.io.IOException error) {
                throw new AssertionError("real package deck is not readable JSON", error);
            }
        }).sum();
        assertThat(cardCount).isEqualTo(128);
        assertThat(snapshot.resourcesById().values())
                .filteredOn(resource -> resource.delivery().equals("embedded"))
                .hasSize(757);
        assertThat(snapshot.resourcesById().values().stream()
                        .filter(resource -> resource.delivery().equals("embedded"))
                        .map(CurriculumRuntimeSnapshot.ResourceDescriptor::artifact)
                        .mapToLong(CurriculumRuntimeSnapshot.Artifact::bytes)
                        .sum())
                .isEqualTo(1_696_390_279L);
        assertThat(snapshot.resourcesById().values().stream()
                        .filter(resource -> resource.delivery().equals("embedded"))
                        .filter(resource -> resource.mediaType().equals("image/jpeg"))
                        .count())
                .isEqualTo(748);
        assertThat(snapshot.resourcesById().values().stream()
                        .filter(resource -> resource.delivery().equals("embedded"))
                        .filter(resource -> resource.mediaType().equals("image/png"))
                        .count())
                .isEqualTo(9);
        assertThat(snapshot.artifactsByKey()).hasSize(912);
        assertThat(snapshot.artifactsByRole().get("mapping"))
                .singleElement()
                .satisfies(artifact -> {
                    assertThat(artifact.runtimeRequired()).isFalse();
                    assertThat(artifact.normalizationRole()).isEqualTo("source-to-canonical-mappings");
                });
        assertThat(snapshot.artifactsByRole().get("quality-evidence"))
                .singleElement()
                .satisfies(artifact -> assertThat(artifact.runtimeRequired()).isFalse());
        assertThat(snapshot.definitionCount()).isEqualTo(2403);

        PackageCompositionViewState compositionViews = PackageCompositionViewState.load(snapshot, mapper);
        assertThat(compositionViews.generationSha256()).isEqualTo(snapshot.generationSha256());
        assertThat(compositionViews.viewsById()).hasSize(88);
        assertThat(compositionViews.offeringsById()).hasSize(88);
        assertThat(compositionViews.defaultOfferingsByLandscapeId())
                .containsOnlyKeys("68a8ac50-f5f5-4e24-8aa9-5e408ca01ced");
        snapshot.offeringsById().values().forEach(offering -> {
            PackageCompositionViewState.ResolvedView byId =
                    compositionViews.resolveOffering(offering.offeringId());
            PackageCompositionViewState.ResolvedView byScope =
                    compositionViews.resolve(offering.landscapeId(), offering.scope());
            assertThat(byId).isNotNull().isEqualTo(byScope);
            assertThat(byId.sourceViewIds()).containsExactlyElementsOf(offering.viewIds());
        });
        assertThat(compositionViews.resolve(
                        "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced",
                        java.util.Map.of("schoolForm", "Gymnasium", "courseProfile", "GK+LK")))
                .isNull();
        assertThat(compositionViews.findViewById("merged:de-de-gym-math-gk+de-de-gym-math-lk"))
                .isNull();

        PackageCurriculumDomainState domainState = PackageCurriculumDomainState.load(
                snapshot,
                new CurriculumPackageArtifactReader(reader),
                mapper);
        assertThat(domainState.generationSha256()).isEqualTo(snapshot.generationSha256());
        assertThat(domainState.landscapes()).hasSize(1);
        assertThat(domainState.landscapeIdByGoalId()).hasSize(1079);
        assertThat(domainState.mappingState().packageStates()).singleElement().satisfies(state -> {
            assertThat(state.mappingCollectionCount()).isEqualTo(31);
            assertThat(state.decisionCount()).isEqualTo(10_021);
            assertThat(state.mappingEdgeCount()).isEqualTo(33_382);
            assertThat(state.sourceCollectionCount()).isEqualTo(31);
            assertThat(state.sourceDocumentCount()).isEqualTo(55);
        });
        assertThat(domainState.mappingState().mappingsBySourceGoalId()).hasSize(9_977);
        assertThat(domainState.mappingState().sourceLandscapesById()).hasSize(31);
        assertThat(domainState.mappingState().mappings())
                .allSatisfy(mapping -> assertThat(mapping.sourceFile())
                        .startsWith("package:org.skillpilot.curriculum.de.gymnasium.mathematik/"));

        PackageSourceEvidenceState sourceEvidence = PackageSourceEvidenceState.load(
                snapshot,
                domainState,
                new CurriculumPackageArtifactReader(reader),
                mapper);
        assertThat(sourceEvidence.generationSha256()).isEqualTo(snapshot.generationSha256());
        assertThat(sourceEvidence.catalogEntries()).singleElement().satisfies(entry -> {
            assertThat(entry.targetLandscapeId())
                    .isEqualTo("68a8ac50-f5f5-4e24-8aa9-5e408ca01ced");
            assertThat(entry.sourceCollectionCount()).isEqualTo(31);
            assertThat(entry.sourceDocumentCount()).isEqualTo(55);
            assertThat(entry.sourceGoalCount()).isEqualTo(9_977);
            assertThat(entry.mappingEdgeCount()).isEqualTo(33_382);
            assertThat(entry.goals()).hasSize(869);
            assertThat(entry.href()).isEqualTo(
                    "/api/ui/curriculum-source-evidence/packages/"
                            + "org.skillpilot.curriculum.de.gymnasium.mathematik/"
                            + "0.1.0-conformance.3/goals");
        });
        var exactBavarianMapping = domainState.mappingState().mappings().stream()
                .filter(mapping -> "exact".equals(mapping.matchType()))
                .filter(mapping -> "DE-BY".equals(domainState.mappingState()
                        .sourceLandscapesById()
                        .get(mapping.sourceLandscapeId())
                        .jurisdiction()))
                .findFirst()
                .orElseThrow();
        var exactBavarianEvidence = sourceEvidence.lookup(
                "org.skillpilot.curriculum.de.gymnasium.mathematik",
                "0.1.0-conformance.3",
                exactBavarianMapping.canonicalGoalId(),
                snapshot.generationSha256(),
                "DE-BY");
        assertThat(exactBavarianEvidence.status())
                .isEqualTo(PackageSourceEvidenceState.LookupStatus.FOUND);
        assertThat(exactBavarianEvidence.evidence().matchType()).isEqualTo("exact");
        assertThat(exactBavarianEvidence.evidence().jurisdiction()).isEqualTo("DE-BY");
        assertThat(exactBavarianEvidence.evidence().sourceGoal().sourceGoalId()).isNotBlank();
        assertThat(exactBavarianEvidence.evidence().sourceDocument().url()).startsWith("https://");
        assertThat(mapper.valueToTree(exactBavarianEvidence.evidence()).toString())
                .doesNotContain(store.toString())
                .doesNotContain("data/sources/")
                .doesNotContain("data/mappings/");

        PackageCurriculumResourceState resources = PackageCurriculumResourceState.load(
                snapshot,
                domainState,
                new CurriculumPackageArtifactReader(reader));
        assertThat(resources.generationSha256()).isEqualTo(snapshot.generationSha256());
        assertThat(resources.deckHrefs()).hasSize(12);
        assertThat(resources.resourceHrefs()).hasSize(826);
        var germanDeck = resources.resolveDeck(
                        "org.skillpilot.curriculum.de.gymnasium.mathematik",
                        "0.1.0-conformance.3",
                        "de_gymnasium_math_seki_core",
                        "de-DE")
                .orElseThrow();
        try {
            assertThat(mapper.readTree(germanDeck.bytes()).path("cards")).hasSize(14);
        } catch (java.io.IOException error) {
            throw new AssertionError("real package deck is not readable JSON", error);
        }
        var memoryGoal = domainState.landscapes().getFirst().getGoals().stream()
                .filter(goal -> goal.getTags() != null
                        && goal.getTags().contains("srs-deck:de_gymnasium_math_seki_core"))
                .findFirst()
                .orElseThrow();
        assertThat(resources.resolveGoalDeck(
                        memoryGoal.getId(),
                        String.valueOf(memoryGoal.getExtendedData().get("vocabularySource"))))
                .isPresent();
        assertThat(resources.resolveGoalDeck(
                        memoryGoal.getId(),
                        String.valueOf(memoryGoal.getExtendedData().get("vocabularySourceEn"))))
                .get()
                .extracting(PackageCurriculumResourceState.ResolvedArtifact::filename)
                .isEqualTo("de_gymnasium_math_flashcards_seki_core.en.json");
        var embeddedResource = snapshot.resourcesById().values().stream()
                .filter(resource -> resource.delivery().equals("embedded"))
                .findFirst()
                .orElseThrow();
        var image = resources.resolveResource(
                        embeddedResource.packageId(),
                        "0.1.0-conformance.3",
                        embeddedResource.resourceId())
                .orElseThrow();
        assertThat(image.bytes()).hasSize(Math.toIntExact(embeddedResource.artifact().bytes()));
        assertThat(CurriculumPackageFileReader.sha256(image.bytes()))
                .isEqualTo(embeddedResource.artifact().sha256());
        assertThat(snapshot.resourcesById().values())
                .filteredOn(resource -> resource.delivery().equals("external"))
                .hasSize(69);

        GoalMappingService mappingService = new GoalMappingService(domainState.mappingState());
        String sourceGoalWithFanout = domainState.mappingState().mappingsBySourceGoalId().entrySet().stream()
                .filter(entry -> entry.getValue().size() > 1)
                .findFirst()
                .orElseThrow()
                .getKey();
        assertThat(mappingService.findByLegacyGoalId(sourceGoalWithFanout)).isEmpty();
        assertThat(mappingService.findAllByLegacyGoalId(sourceGoalWithFanout)).hasSizeGreaterThan(1);

        LandscapeService landscapeService = new LandscapeService(mapper, mappingService, domainState);
        assertThat(landscapeService.getOverview("de", true).getSummaries())
                .extracting(summary -> summary.getCurriculumId())
                .containsExactly("68a8ac50-f5f5-4e24-8aa9-5e408ca01ced");
        assertThat(domainState.mappingState().sourceLandscapesById().values())
                .extracting(metadata -> metadata.jurisdiction())
                .containsOnly(
                        "DE-BB", "DE-BE", "DE-BW", "DE-BY", "DE-HB", "DE-HE", "DE-HH", "DE-MV",
                        "DE-NI", "DE-NW", "DE-RP", "DE-SH", "DE-SL", "DE-SN", "DE-ST", "DE-TH");
        assertThat(landscapeService.getClosure("68a8ac50-f5f5-4e24-8aa9-5e408ca01ced").getFirst()
                .getGoals().stream()
                .filter(goal -> goal.getId().equals("bfc4fe23-bfa4-4836-9bd2-793f4305d682"))
                .findFirst()
                .orElseThrow()
                .getApplicability())
                .isNull();
    }
}
