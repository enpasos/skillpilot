package com.skillpilot.backend.landscape;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.service.CompositionViewService;
import com.skillpilot.backend.service.DeckResourceService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Repository-backed curriculum services for the authoring/runtime compatibility mode. */
@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(
        prefix = "skillpilot.curriculum",
        name = "source",
        havingValue = "repository",
        matchIfMissing = true)
public class RepositoryCurriculumConfiguration {

    @Bean
    GoalMappingService repositoryGoalMappingService(
            LandscapeProperties properties,
            ObjectMapper objectMapper) {
        return new GoalMappingService(properties, objectMapper);
    }

    @Bean
    LandscapeService repositoryLandscapeService(
            LandscapeProperties properties,
            ObjectMapper objectMapper,
            GoalMappingService goalMappingService) {
        return new LandscapeService(properties, objectMapper, goalMappingService);
    }

    @Bean
    CompositionViewService repositoryCompositionViewService(
            LandscapeProperties properties,
            ObjectMapper objectMapper) {
        return new CompositionViewService(properties, objectMapper);
    }

    @Bean
    DeckResourceService repositoryDeckResourceService(LandscapeProperties properties) {
        return new DeckResourceService(properties);
    }
}
