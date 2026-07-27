package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

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
    void findMatchingView_fallsBackFromCombinedCourseProfileToLkCrossStageView() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "CrossStage",
                        "courseProfile", "GK+LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("merged:de-de-gym-math-lk+de-de-gym-math-gk");
        assertThat(match.get("mergedFromViewIds")).isEqualTo(List.of("de-de-gym-math-lk", "de-de-gym-math-gk"));
    }

    @Test
    void findFollowingStructureSiblings_returnsNextYearForMergedMathView() {
        CompositionViewService service = createService();

        List<CompositionViewService.CompositionStructureResolution> siblings =
                service.findFollowingStructureSiblings(
                        "composition:merged:de-de-gym-math-lk+de-de-gym-math-gk:structure:j8");

        assertThat(siblings).isNotEmpty();
        assertThat(siblings.get(0).syntheticGoalId())
                .isEqualTo("composition:merged:de-de-gym-math-lk+de-de-gym-math-gk:structure:j9");
        assertThat(siblings.get(0).label()).isEqualTo("Jahrgangsstufe 9");
        assertThat(siblings.get(0).referencedGoalIds()).isNotEmpty();
    }

    @Test
    void findFollowingScopeSiblings_doesNotReturnSeparateSekOneCapstoneAfterFinalYear() {
        CompositionViewService service = createService();

        List<CompositionViewService.CompositionStructureResolution> siblings =
                service.findFollowingScopeSiblings("composition:de-de-gym-math-lk:structure:j10");

        assertThat(siblings).isEmpty();
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
    void findMatchingView_matchesDeWideSekOneMathViewWithoutJurisdiction() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "SekI"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-de-gym-seki-math");
    }

    @Test
    void findMatchingView_matchesDeWideSekTwoGkMathViewWithoutJurisdiction() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "SekII",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-de-gym-sekii-math-gk");
    }

    @Test
    void findMatchingView_fallsBackFromCombinedCourseProfileToLkSekTwoView() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "SekII",
                        "courseProfile", "GK+LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("merged:de-de-gym-sekii-math-lk+de-de-gym-sekii-math-gk");
        assertThat(match.get("mergedFromViewIds")).isEqualTo(List.of("de-de-gym-sekii-math-lk", "de-de-gym-sekii-math-gk"));
    }

    @Test
    void findMatchingView_prefersBwSpecificCrossStageMathViewOverDeWideFallback() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BW",
                        "stage", "CrossStage",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-bw-gym-math-gk");
    }

    @Test
    void findMatchingView_prefersBwSpecificSekTwoMathViewOverCrossStageFallback() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BW",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-bw-gym-sekii-math-lk");
    }

    @Test
    void findMatchingView_prefersBwSpecificSekOneMathViewOverDeWideFallback() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BW",
                        "stage", "SekI"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-bw-gym-seki-math");
    }

    @Test
    void findMatchingView_prefersHeSpecificSekTwoMathViewOverDeWideFallback() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-HE",
                        "stage", "SekII",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-he-gym-sekii-math-gk");
    }

    @Test
    void findMatchingView_prefersHeSpecificSekTwoMathLkViewOverDeWideFallback() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-HE",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-he-gym-sekii-math-lk");
    }

    @Test
    void findMatchingView_keepsHessianSekTwoMathLkScopeForBothDurationModels() {
        CompositionViewService service = createService();

        for (String durationModel : List.of("G8", "G9")) {
            Map<String, Object> match = service.findMatchingView(
                    CANONICAL_MATH_ID,
                    Map.of(
                            "schoolForm", "Gymnasium",
                            "jurisdiction", "DE-HE",
                            "stage", "SekII",
                            "courseProfile", "LK",
                            "durationModel", durationModel));

            assertThat(match).as(durationModel + " match").isNotNull();
            assertThat(match.get("viewId"))
                    .as(durationModel + " view")
                    .isEqualTo("de-he-gym-sekii-math-lk")
                    .isNotIn("de-he-gym-math-lk-g8", "de-he-gym-math-lk-g9");

            @SuppressWarnings("unchecked")
            Map<String, Object> matchedScope = (Map<String, Object>) match.get("scope");
            assertThat(matchedScope)
                    .as(durationModel + " matched scope")
                    .containsEntry("stage", "SekII")
                    .containsEntry("courseProfile", "LK")
                    .doesNotContainEntry("stage", "CrossStage");
        }
    }

    @Test
    void findMatchingView_prefersHeSpecificCrossStageMathViewOverSekTwoFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-HE",
                        "stage", "CrossStage",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-he-gym-math-gk");
    }

    @Test
    void findMatchingView_prefersHeSpecificCrossStageMathViewOverSekTwoFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-HE",
                        "stage", "CrossStage",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-he-gym-math-lk");
    }

    @Test
    void findMatchingView_prefersNiSpecificSekTwoMathViewOverDeWideFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-NI",
                        "stage", "SekII",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-ni-gym-sekii-math-gk");
    }

    @Test
    void findMatchingView_prefersNiSpecificSekTwoMathViewOverDeWideFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-NI",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-ni-gym-sekii-math-lk");
    }

    @Test
    void findMatchingView_prefersNiSpecificCrossStageMathViewOverSekTwoFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-NI",
                        "stage", "CrossStage",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-ni-gym-math-gk");
    }

    @Test
    void findMatchingView_prefersNiSpecificCrossStageMathViewOverSekTwoFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-NI",
                        "stage", "CrossStage",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-ni-gym-math-lk");
    }

    @Test
    void findMatchingView_prefersNwSpecificSekTwoMathViewOverDeWideFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-NW",
                        "stage", "SekII",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-nw-gym-sekii-math-gk");
    }

    @Test
    void findMatchingView_prefersNwSpecificSekTwoMathViewOverDeWideFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-NW",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-nw-gym-sekii-math-lk");
    }

    @Test
    void findMatchingView_prefersNwSpecificCrossStageMathViewOverSekTwoFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-NW",
                        "stage", "CrossStage",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-nw-gym-math-gk");
    }

    @Test
    void findMatchingView_prefersNwSpecificCrossStageMathViewOverSekTwoFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-NW",
                        "stage", "CrossStage",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-nw-gym-math-lk");
    }

    @Test
    void findMatchingView_prefersShSpecificSekTwoMathViewOverDeWideFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-SH",
                        "stage", "SekII",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-sh-gym-sekii-math-gk");
    }

    @Test
    void findMatchingView_prefersShSpecificSekTwoMathViewOverDeWideFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-SH",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-sh-gym-sekii-math-lk");
    }

    @Test
    void findMatchingView_prefersShSpecificCrossStageMathViewOverSekTwoFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-SH",
                        "stage", "CrossStage",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-sh-gym-math-gk");
    }

    @Test
    void findMatchingView_prefersShSpecificCrossStageMathViewOverSekTwoFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-SH",
                        "stage", "CrossStage",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-sh-gym-math-lk");
    }

    @Test
    void findMatchingView_prefersBeSpecificSekTwoMathViewOverDeWideFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BE",
                        "stage", "SekII",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-be-gym-sekii-math-gk");
    }

    @Test
    void findMatchingView_prefersBeSpecificSekTwoMathViewOverDeWideFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BE",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-be-gym-sekii-math-lk");
    }

    @Test
    void findMatchingView_prefersBeSpecificCrossStageMathViewOverSekTwoFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BE",
                        "stage", "CrossStage",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-be-gym-math-gk");
    }

    @Test
    void findMatchingView_prefersBeSpecificCrossStageMathViewOverSekTwoFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BE",
                        "stage", "CrossStage",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-be-gym-math-lk");
    }

    @Test
    void findMatchingView_prefersBySpecificSekTwoMathViewOverDeWideFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BY",
                        "stage", "SekII",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-by-gym-sekii-math-gk");
    }

    @Test
    void findMatchingView_prefersBySpecificSekTwoMathViewOverDeWideFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BY",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-by-gym-sekii-math-lk");
    }

    @Test
    void findMatchingView_prefersBySpecificCrossStageMathViewOverSekTwoFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BY",
                        "stage", "CrossStage",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-by-gym-math-gk");
    }

    @Test
    void findMatchingView_prefersBySpecificCrossStageMathViewOverSekTwoFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BY",
                        "stage", "CrossStage",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-by-gym-math-lk");
    }

    @Test
    void findMatchingView_prefersBbSpecificSekTwoMathViewOverDeWideFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BB",
                        "stage", "SekII",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-bb-gym-sekii-math-gk");
    }

    @Test
    void findMatchingView_prefersBbSpecificSekTwoMathViewOverDeWideFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BB",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-bb-gym-sekii-math-lk");
    }

    @Test
    void findMatchingView_prefersBbSpecificCrossStageMathViewOverSekTwoFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BB",
                        "stage", "CrossStage",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-bb-gym-math-gk");
    }

    @Test
    void findMatchingView_prefersBbSpecificCrossStageMathViewOverSekTwoFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BB",
                        "stage", "CrossStage",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-bb-gym-math-lk");
    }

    @Test
    void findMatchingView_matchesEveryCanonicalMathCompositionViewByOwnScope() throws IOException {
        CompositionViewService service = createService();
        ObjectMapper objectMapper = new ObjectMapper();
        List<Path> mathViewFiles;
        try (var stream = Files.list(resolveCurriculaDir().resolve("DE/Gymnasium/composition-views/mathematik"))) {
            mathViewFiles = stream
                    .filter(path -> path.getFileName().toString().endsWith(".json"))
                    .sorted()
                    .toList();
        }

        assertThat(mathViewFiles).isNotEmpty();

        for (Path viewFile : mathViewFiles) {
            @SuppressWarnings("unchecked")
            Map<String, Object> view = objectMapper.readValue(viewFile.toFile(), Map.class);
            @SuppressWarnings("unchecked")
            Map<String, Object> rawScope = (Map<String, Object>) view.get("scope");
            String viewId = (String) view.get("viewId");

            assertThat(rawScope)
                    .withFailMessage("Composition view %s is missing a scope: %s", viewId, viewFile)
                    .isNotNull();

            Map<String, String> scope = rawScope.entrySet().stream()
                    .collect(java.util.stream.Collectors.toMap(
                            Map.Entry::getKey,
                            entry -> String.valueOf(entry.getValue())));

            Map<String, Object> match = service.findMatchingView(CANONICAL_MATH_ID, scope);

            assertThat(match)
                    .withFailMessage("No composition-view match found for %s via %s", viewId, viewFile.getFileName())
                    .isNotNull();
            assertThat(match.get("viewId"))
                    .withFailMessage("Unexpected view resolution for %s via %s", viewId, viewFile.getFileName())
                    .isEqualTo(viewId);
        }
    }

    @Test
    void findMatchingView_prefersDurationSpecificScopeOverDurationAgnosticFallback(@TempDir Path tempDir)
            throws IOException {
        Path viewDir = tempDir.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(viewDir);
        Files.writeString(viewDir.resolve("default.view.json"), """
                {
                  "viewId": "default-seki",
                  "landscapeId": "test-landscape",
                  "scope": {
                    "schoolForm": "Gymnasium",
                    "stage": "SekI"
                  },
                  "rootNodes": []
                }
                """);
        Files.writeString(viewDir.resolve("g8.view.json"), """
                {
                  "viewId": "g8-seki",
                  "landscapeId": "test-landscape",
                  "scope": {
                    "schoolForm": "Gymnasium",
                    "stage": "SekI",
                    "durationModel": "G8"
                  },
                  "rootNodes": []
                }
                """);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        CompositionViewService service = new CompositionViewService(properties, new ObjectMapper());

        Map<String, Object> g8Match = service.findMatchingView(
                "test-landscape",
                Map.of("schoolForm", "Gymnasium", "stage", "SekI", "durationModel", "G8"));
        Map<String, Object> g9Match = service.findMatchingView(
                "test-landscape",
                Map.of("schoolForm", "Gymnasium", "stage", "SekI", "durationModel", "G9"));

        assertThat(g8Match).isNotNull();
        assertThat(g8Match.get("viewId")).isEqualTo("g8-seki");
        assertThat(g9Match).isNotNull();
        assertThat(g9Match.get("viewId")).isEqualTo("default-seki");
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

    @Test
    void findMatchingView_prefersHeSpecificCrossStagePhysicsViewOverDeWideFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_PHYSICS_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-HE",
                        "stage", "CrossStage",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-he-gym-physics-gk");
    }

    @Test
    void findMatchingView_prefersBySpecificCrossStagePhysicsViewOverDeWideFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_PHYSICS_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BY",
                        "stage", "CrossStage",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-by-gym-physics-lk");
    }

    @Test
    void findMatchingView_prefersHeSpecificSekTwoPhysicsViewOverDeWideFallbackForGk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_PHYSICS_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-HE",
                        "stage", "SekII",
                        "courseProfile", "GK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-he-gym-sekii-physics-gk");
    }

    @Test
    void findMatchingView_prefersBySpecificSekTwoPhysicsViewOverDeWideFallbackForLk() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_PHYSICS_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-BY",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId")).isEqualTo("de-by-gym-sekii-physics-lk");
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
