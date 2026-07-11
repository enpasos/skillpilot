package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.RepositoryCurriculumConfiguration;
import com.skillpilot.backend.service.CompositionViewService;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class CurriculumPackageConfigurationTest {

    @TempDir
    Path tempDir;

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(ObjectMapper.class, ObjectMapper::new)
            .withUserConfiguration(
                    CurriculumSourceConfiguration.class,
                    CurriculumPackageConfiguration.class,
                    RepositoryCurriculumConfiguration.class);

    @Test
    void repositoryModeDoesNotCreateAnyPackageRuntimeBeans() {
        contextRunner
                .withBean(LandscapeProperties.class, () -> {
                    LandscapeProperties properties = new LandscapeProperties();
                    properties.setDirectory(tempDir.resolve("empty-curricula").toString());
                    return properties;
                })
                .withPropertyValues("skillpilot.curriculum.source=repository")
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).doesNotHaveBean(CurriculumPackageRepository.class);
                    assertThat(context).doesNotHaveBean(CurriculumPackageArtifactReader.class);
                    assertThat(context).doesNotHaveBean(CurriculumRuntimeSnapshotProvider.class);
                    assertThat(context).doesNotHaveBean(PackageCurriculumDomainState.class);
                    assertThat(context).doesNotHaveBean(PackageCompositionViewState.class);
                    assertThat(context).doesNotHaveBean(CurriculumCatalogService.class);
                    assertThat(context).hasSingleBean(GoalMappingService.class);
                    assertThat(context).hasSingleBean(LandscapeService.class);
                    assertThat(context).hasSingleBean(CompositionViewService.class);
                });
    }

    @Test
    void packageModeBuildsSnapshotAtStartupFromTheExactLock() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        CurriculumPackageTestFixture fixture = new CurriculumPackageTestFixture(objectMapper);
        CurriculumPackageTestFixture.TestStore store = fixture.create(
                tempDir.resolve("store"),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("alpha", 'a'));
        Path poisonDirectory = tempDir.resolve("repository-poison");
        Files.createDirectories(poisonDirectory);
        Files.writeString(poisonDirectory.resolve("conflict.json"), """
                {
                  "landscapeId": "landscape-alpha",
                  "title": "Repository poison",
                  "goals": [{"id": "goal-alpha", "title": "Wrong repository goal"}]
                }
                """);

        contextRunner
                .withPropertyValues(
                        "skillpilot.curriculum.source=package",
                        "skillpilot.curriculum.packages.store-directory=" + store.root(),
                        "skillpilot.curriculum.packages.active-lock=locks/active.json",
                        "skillpilot.landscapes.directory=" + poisonDirectory)
                .run(context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context).hasSingleBean(CurriculumPackageRepository.class);
                    assertThat(context).hasSingleBean(CurriculumPackageArtifactReader.class);
                    assertThat(context).hasSingleBean(CurriculumRuntimeSnapshotProvider.class);
                    assertThat(context).hasSingleBean(PackageCurriculumDomainState.class);
                    assertThat(context).hasSingleBean(PackageCompositionViewState.class);
                    assertThat(context).hasSingleBean(CurriculumCatalogService.class);
                    assertThat(context).hasSingleBean(GoalMappingService.class);
                    assertThat(context).hasSingleBean(LandscapeService.class);
                    assertThat(context).hasSingleBean(CompositionViewService.class);
                    assertThat(context.getBean(CurriculumRuntimeSnapshotProvider.class)
                            .current().packages()).hasSize(1);
                    PackageCurriculumDomainState domainState =
                            context.getBean(PackageCurriculumDomainState.class);
                    assertThat(domainState.mappingState().mappings()).hasSize(1);
                    assertThat(domainState.mappingState().sourceLandscapesById()).hasSize(1);
                    GoalMappingService mappingService = context.getBean(GoalMappingService.class);
                    assertThat(mappingService.findByLegacyGoalId("source-goal-alpha"))
                            .get()
                            .extracting(mapping -> mapping.canonicalGoalId())
                            .isEqualTo("goal-alpha");
                    LandscapeService landscapeService = context.getBean(LandscapeService.class);
                    assertThat(landscapeService.getAll())
                            .extracting(landscape -> landscape.getTitle())
                            .doesNotContain("Repository poison");
                    assertThat(landscapeService.getOverview("de", true).getSummaries())
                            .extracting(summary -> summary.getCurriculumId())
                            .containsExactly("landscape-alpha");
                    assertThat(landscapeService.resolveSourceLandscapeJurisdiction("source-landscape-alpha"))
                            .isEqualTo("DE-BY");
                    assertThat(landscapeService.resolveLandscapeIdForGoalIncludingArchived("source-goal-alpha"))
                            .isEqualTo("source-landscape-alpha");
                    assertThat(landscapeService.resolveSourceAtomicGoalIds(
                            "source-landscape-alpha", "source-goal-alpha"))
                            .isEmpty();
                    assertThat(landscapeService.getClosure("landscape-alpha").get(0)
                            .getGoals().get(0).getApplicability().get("jurisdiction"))
                            .containsExactly("DE-HE");
                    var catalog = context.getBean(CurriculumCatalogService.class).getCatalog();
                    assertThat(catalog.generationSha256()).isEqualTo(domainState.generationSha256());
                    assertThat(catalog.rootLandscapeIds()).containsExactly("landscape-alpha");
                    assertThat(catalog.landscapes())
                            .extracting(entry -> entry.defaultOfferingId())
                            .containsExactly("offering-alpha");
                    assertThat(catalog.offerings())
                            .extracting(entry -> entry.offeringId())
                            .containsExactly("offering-alpha");
                    CompositionViewService compositionViews = context.getBean(CompositionViewService.class);
                    assertThat(compositionViews.isAuthoritativeForLandscape("landscape-alpha")).isTrue();
                    assertThat(compositionViews.findMatchingView(
                                    "landscape-alpha",
                                    java.util.Map.of("schoolForm", "Gymnasium", "courseProfile", "GK")))
                            .extracting(view -> view.get("viewId"))
                            .isEqualTo("view-alpha");
                    assertThat(compositionViews.findOfferingById("offering-alpha"))
                            .extracting(view -> view.get("viewId"))
                            .isEqualTo("view-alpha");
                    assertThat(compositionViews.findDefaultView("landscape-alpha"))
                            .extracting(view -> view.get("viewId"))
                            .isEqualTo("view-alpha");
                    assertThat(compositionViews.findMatchingView(
                                    "landscape-alpha",
                                    java.util.Map.of("schoolForm", "Gymnasium", "courseProfile", "GK+LK")))
                            .isNull();
                    assertThat(compositionViews.findViewById("merged:view-alpha+view-alpha-secondary"))
                            .isNull();
                    try {
                        String catalogJson = context.getBean(ObjectMapper.class).writeValueAsString(catalog);
                        assertThat(catalogJson)
                                .doesNotContain("artifactPath")
                                .doesNotContain(store.root().toString());
                    } catch (Exception e) {
                        throw new AssertionError(e);
                    }
                });
    }

    @Test
    void packageModeFailsStartupInsteadOfFallingBackWhenLockIsMissing() {
        contextRunner
                .withPropertyValues(
                        "skillpilot.curriculum.source=package",
                        "skillpilot.curriculum.packages.store-directory=" + tempDir.resolve("missing"))
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure()).hasRootCauseInstanceOf(CurriculumPackageException.class);
                });
    }

    @Test
    void unknownSourceModeFailsBindingInsteadOfStartingRepositoryMode() {
        contextRunner
                .withPropertyValues("skillpilot.curriculum.source=typo")
                .run(context -> assertThat(context).hasFailed());
    }
}
