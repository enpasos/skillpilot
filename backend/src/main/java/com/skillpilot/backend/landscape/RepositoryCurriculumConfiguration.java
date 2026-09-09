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
            ObjectMapper objectMapper,
            LandscapeService landscapeService) {
        return new CompositionViewService(properties, objectMapper, () -> {
            java.util.Map<String, java.util.List<String>> contains = new java.util.LinkedHashMap<>();
            landscapeService.getAll().forEach(landscape -> landscape.getGoals().forEach(goal ->
                    contains.put(goal.getId(), goal.getContains() == null
                            ? java.util.List.of() : java.util.List.copyOf(goal.getContains()))));
            return contains;
        });
    }

    @Bean
    DeckResourceService repositoryDeckResourceService(LandscapeProperties properties) {
        return new DeckResourceService(properties);
    }
}
