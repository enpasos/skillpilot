package com.skillpilot.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.ClassPathResource;

/** Exercise test-only offers with the real repository reader and the ordinary canonical graph. */
@TestConfiguration(proxyBeanMethods = false)
public class VoluntaryOfferTestConfiguration {
    public static final String VIEW = "test-physics-voluntary-gk";
    public static final String MIXED = "composition:" + VIEW + ":structure:mixed";
    public static final String OPTIONAL = "composition:" + VIEW + ":structure:optional";
    public static final String ROOT = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    public static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    public static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    public static final String INTRO = "5c44b9ba-9b05-4774-95d5-073230d3fc4f";
    public static final String TEMPERATURE = "940978fa-1f2d-4e54-9c28-081a6df9b76f";
    public static final String ARROW = "b77a7e93-22f9-5722-a4cc-f18a149ab030";
    public static final String ARROW_TASK = "2569d84a-5bf1-542b-bc43-6ade1df971c4";
    public static final String MASS = "af0e2efb-f634-5f2d-abea-b2e1a67a2894";
    public static final String NUMBER_LINE = "f6b13b8e-1ecd-5420-905d-21290aa996a6";

    @Bean
    @Primary
    CompositionViewService voluntaryOfferViews(ObjectMapper mapper, LandscapeService landscapes) throws IOException {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(new ClassPathResource("fixtures/voluntary-offer-scope").getFile().getPath());
        Map<String, List<String>> children = new HashMap<>();
        landscapes.getAll().forEach(landscape -> landscape.getGoals().forEach(goal ->
                children.put(goal.getId(), goal.getContains() == null ? List.of() : goal.getContains())));
        var graph = CanonicalContainsGraph.copyOf(children);
        return new CompositionViewService(properties, mapper, () -> graph);
    }
}
