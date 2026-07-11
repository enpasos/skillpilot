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
                .isEqualTo("sha256:3b44444b50b41f45ec1cb12d4d912a4524effe9d560d539788cfe36d4d7ffc60");
        assertThat(snapshot.rootLandscapeIds()).hasSize(1);
        assertThat(snapshot.landscapesById()).hasSize(1);
        assertThat(snapshot.viewsById()).hasSize(88);
        assertThat(snapshot.offeringsById()).hasSize(88);
        assertThat(snapshot.decksByKey()).hasSize(12);
        assertThat(snapshot.resourcesById()).hasSize(825);
        assertThat(snapshot.resourcesByPublicUrl()).hasSize(756);
        assertThat(snapshot.artifactsByKey()).hasSize(911);
        assertThat(snapshot.artifactsByRole().get("mapping"))
                .singleElement()
                .satisfies(artifact -> {
                    assertThat(artifact.runtimeRequired()).isFalse();
                    assertThat(artifact.normalizationRole()).isEqualTo("source-to-canonical-mappings");
                });
        assertThat(snapshot.artifactsByRole().get("quality-evidence"))
                .singleElement()
                .satisfies(artifact -> assertThat(artifact.runtimeRequired()).isFalse());
        assertThat(snapshot.definitionCount()).isEqualTo(2402);

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
