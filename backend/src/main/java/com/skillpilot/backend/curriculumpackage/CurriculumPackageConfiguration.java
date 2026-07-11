package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.DeckResourceService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(prefix = "skillpilot.curriculum", name = "source", havingValue = "package")
public class CurriculumPackageConfiguration {

    @Bean
    CurriculumPackageFileReader curriculumPackageFileReader() {
        return new CurriculumPackageFileReader();
    }

    @Bean
    CurriculumPackageArtifactReader curriculumPackageArtifactReader(CurriculumPackageFileReader fileReader) {
        return new CurriculumPackageArtifactReader(fileReader);
    }

    @Bean
    CurriculumPackageRepository curriculumPackageRepository(
            CurriculumPackageProperties properties,
            ObjectMapper objectMapper,
            CurriculumPackageFileReader fileReader) {
        return new FileSystemCurriculumPackageRepository(properties, objectMapper, fileReader);
    }

    @Bean
    JsonCurriculumPackageLoader jsonCurriculumPackageLoader(
            CurriculumPackageProperties properties,
            CurriculumPackageRepository repository,
            CurriculumPackageFileReader fileReader,
            ObjectMapper objectMapper) {
        return new JsonCurriculumPackageLoader(properties, repository, fileReader, objectMapper);
    }

    @Bean
    CurriculumRuntimeSnapshotProvider curriculumRuntimeSnapshotProvider(JsonCurriculumPackageLoader loader) {
        return new CurriculumRuntimeSnapshotProvider(loader);
    }

    @Bean
    PackageCurriculumDomainState packageCurriculumDomainState(
            CurriculumRuntimeSnapshotProvider snapshotProvider,
            CurriculumPackageArtifactReader artifactReader,
            ObjectMapper objectMapper) {
        return PackageCurriculumDomainState.load(
                snapshotProvider.current(), artifactReader, objectMapper);
    }

    @Bean
    PackageCurriculumResourceState packageCurriculumResourceState(
            CurriculumRuntimeSnapshotProvider snapshotProvider,
            PackageCurriculumDomainState domainState,
            CurriculumPackageArtifactReader artifactReader) {
        return PackageCurriculumResourceState.load(
                snapshotProvider.current(), domainState, artifactReader);
    }

    @Bean
    DeckResourceService packageDeckResourceService(PackageCurriculumResourceState resourceState) {
        return new DeckResourceService(resourceState);
    }

    @Bean
    CurriculumCatalogService curriculumCatalogService(
            CurriculumRuntimeSnapshotProvider snapshotProvider,
            PackageCurriculumDomainState domainState,
            PackageCurriculumResourceState resourceState) {
        CurriculumRuntimeSnapshot snapshot = snapshotProvider.current();
        if (!snapshot.generationSha256().equals(domainState.generationSha256())
                || !snapshot.generationSha256().equals(resourceState.generationSha256())) {
            throw new CurriculumPackageException("Catalog and package domain generations differ");
        }
        return new CurriculumCatalogService(snapshot, resourceState);
    }

    @Bean
    PackageCompositionViewState packageCompositionViewState(
            CurriculumRuntimeSnapshotProvider snapshotProvider,
            PackageCurriculumDomainState domainState,
            ObjectMapper objectMapper) {
        CurriculumRuntimeSnapshot snapshot = snapshotProvider.current();
        if (!snapshot.generationSha256().equals(domainState.generationSha256())) {
            throw new CurriculumPackageException("Composition views and package domain generations differ");
        }
        return PackageCompositionViewState.load(snapshot, objectMapper);
    }

    @Bean
    CompositionViewService packageCompositionViewService(PackageCompositionViewState viewState) {
        return new CompositionViewService(viewState);
    }

    @Bean
    GoalMappingService packageGoalMappingService(PackageCurriculumDomainState domainState) {
        return new GoalMappingService(domainState.mappingState());
    }

    @Bean
    LandscapeService packageLandscapeService(
            ObjectMapper objectMapper,
            GoalMappingService goalMappingService,
            PackageCurriculumDomainState domainState) {
        return new LandscapeService(objectMapper, goalMappingService, domainState);
    }
}
