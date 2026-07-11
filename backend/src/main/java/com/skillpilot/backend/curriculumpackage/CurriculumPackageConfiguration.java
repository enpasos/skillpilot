package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.GoalMappingService;
import com.skillpilot.backend.landscape.LandscapeService;
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
