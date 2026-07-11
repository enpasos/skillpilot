package com.skillpilot.backend.curriculumpackage;

import com.fasterxml.jackson.databind.ObjectMapper;
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
}
