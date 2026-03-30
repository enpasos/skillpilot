package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import java.nio.file.Path;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CompositionViewServiceTest {

    private static final String CANONICAL_GYMNASIUM_OVERVIEW_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CANONICAL_MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_PHYSICS_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";

    @Test
    void findMatchingView_matchesDeWideCrossStageViewWithoutJurisdiction() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "CrossStage",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-de-gym-math-lk");
    }

    @Test
    void findMatchingView_prefersExactStageViewOverCrossStageFallback() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-de-gym-sekii-math-lk");
    }

    @Test
    void findMatchingView_matchesOverviewCrossStageView() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_GYMNASIUM_OVERVIEW_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "CrossStage",
                        "jurisdiction", "DE-HE"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-de-gym-overview");
    }

    @Test
    void findMatchingView_matchesOverviewExactSekTwoView() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_GYMNASIUM_OVERVIEW_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "SekII",
                        "jurisdiction", "DE-HE"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-de-gym-overview-sekii");
    }

    @Test
    void findMatchingView_matchesPhysicsCrossStageViewWithoutJurisdiction() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_PHYSICS_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "CrossStage",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-de-gym-physics-lk");
    }

    @Test
    void findMatchingView_matchesPhysicsExactSekTwoView() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_PHYSICS_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-de-gym-sekii-physics-lk");
    }

    private static CompositionViewService createService() {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(resolveCurriculaDir().toString());
        return new CompositionViewService(properties, new ObjectMapper());
    }

    private static Path resolveCurriculaDir() {
        Path cwd = Path.of("").toAbsolutePath().normalize();
        Path direct = cwd.resolve("curricula");
        if (java.nio.file.Files.isDirectory(direct)) {
            return direct;
        }
        return cwd.resolve("../curricula").normalize();
    }
}
