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
        return new CompositionViewService(properties, objectMapper, new java.util.function.Supplier<>() {
            private java.util.List<com.skillpilot.backend.landscape.SkillLandscape> source;
            private com.skillpilot.backend.service.CanonicalContainsGraph graph;

            // The landscape service replaces its landscape list on every load and
            // never changes a loaded goal. The graph is therefore rebuilt exactly
            // when that list is another instance, not for every view lookup.
            @Override
            public synchronized java.util.Map<String, java.util.List<String>> get() {
                java.util.List<com.skillpilot.backend.landscape.SkillLandscape> current = landscapeService.getAll();
                if (graph == null || current != source) {
                    java.util.Map<String, java.util.List<String>> contains = new java.util.LinkedHashMap<>();
                    current.forEach(landscape -> landscape.getGoals().forEach(goal ->
                            contains.put(goal.getId(), goal.getContains() == null
                                    ? java.util.List.of() : goal.getContains())));
                    graph = com.skillpilot.backend.service.CanonicalContainsGraph.copyOf(contains);
                    source = current;
                }
                return graph;
            }
        });
    }

    @Bean
    DeckResourceService repositoryDeckResourceService(LandscapeProperties properties) {
        return new DeckResourceService(properties);
    }
}
