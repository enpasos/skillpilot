package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LearningGoal;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class CompositionViewServiceTest {

    @Test
    void combinedSelectionAndVirtualLookupPreservePartialOrderFormatAndAcquisitionSemantics(@TempDir Path directory) throws IOException {
        Path views = directory.resolve("DE/Gymnasium/composition-views/physik");
        Files.createDirectories(views);
        for (String profile : List.of("GK", "LK")) {
            Files.writeString(views.resolve(profile + ".view.json"), """
                {"$schema":"https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json",
                 "viewFormatVersion":"1.2","language":"de","viewId":"physics-%s","landscapeId":"physics",
                 "scope":{"schoolForm":"Gymnasium","stage":"SekII","courseProfile":"%s"},
                 "rootNodes":[{"kind":"structure","id":"topic","label":"Topic","children":[
                   {"kind":"goalEntry","goalId":"seed"},
                   {"kind":"goalEntry","goalId":"preparation","projectionRole":"prerequisiteOnly","acquisitionPlacement":true}]}]}
                """.formatted(profile, profile));
        }
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        CompositionViewService service = new CompositionViewService(properties, new ObjectMapper());
        Map<String, String> scope = Map.of("schoolForm", "Gymnasium", "stage", "SekII", "courseProfile", "GK+LK");
        Map<String, Object> selected = service.findMatchingView("physics", scope);
        for (Map<String, Object> merged : List.of(selected, service.findViewById((String) selected.get("viewId")))) {
            assertThat(merged).containsEntry("viewFormatVersion", "1.2").containsEntry("language", "de")
                    .containsEntry("$schema", "https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json");
            assertThat(merged.get("rootNodes").toString()).contains("acquisitionPlacement=true");
        }
    }

    @Test
    void combinedSelectionRejectsUnsupportedAndMixedFormatEnvelopes(@TempDir Path directory) throws IOException {
        Path views = directory.resolve("DE/Gymnasium/composition-views/physik");
        Files.createDirectories(views);
        for (String second : List.of("9.9", "1.0")) {
            for (String profile : List.of("GK", "LK")) {
                String version = profile.equals("GK") ? "1.2" : second;
                Files.writeString(views.resolve(profile + ".view.json"), """
                    {"$schema":"https://skillpilot.com/schemas/composition-view/v1.2/composition-view.schema.json",
                     "viewFormatVersion":"%s","language":"de","viewId":"physics-%s","landscapeId":"physics",
                     "scope":{"schoolForm":"Gymnasium","stage":"SekII","courseProfile":"%s"},
                     "rootNodes":[{"kind":"goalEntry","goalId":"seed"}]}
                    """.formatted(version, profile, profile));
            }
            LandscapeProperties properties = new LandscapeProperties();
            properties.setDirectory(directory.toString());
            CompositionViewService service = new CompositionViewService(properties, new ObjectMapper());
            assertThatThrownBy(() -> service.findMatchingView("physics", Map.of("schoolForm", "Gymnasium", "stage", "SekII", "courseProfile", "GK+LK")))
                    .isInstanceOf(IllegalStateException.class).hasMessageContaining("composition view format");
        }
    }

    @Test
    @SuppressWarnings("unchecked")
    void combinedLegacySubjectPairsRetainSupportedEnvelopesWithoutRequiringNewHeaders() throws IOException {
        Path directory = Path.of("../curricula/DE/Gymnasium/composition-views");
        ObjectMapper mapper = new ObjectMapper();
        Map<String, List<Map<String, Object>>> pairs = new TreeMap<>();
        try (var files = Files.walk(directory)) {
            for (Path file : files.filter(path -> path.toString().endsWith(".view.json")).toList()) {
                Map<String, Object> view = mapper.readValue(file.toFile(), new com.fasterxml.jackson.core.type.TypeReference<>() {});
                Map<String, Object> scope = new TreeMap<>((Map<String, Object>) view.get("scope"));
                Object profile = scope.remove("courseProfile");
                if (!"GK".equals(profile) && !"LK".equals(profile)) continue;
                pairs.computeIfAbsent(view.get("landscapeId") + "|" + scope, ignored -> new ArrayList<>()).add(view);
            }
        }
        CompositionViewService service = createService();
        int checked = 0;
        for (List<Map<String, Object>> sources : pairs.values()) {
            if (sources.size() != 2 || sources.stream().anyMatch(source -> source.containsKey("viewFormatVersion")
                    && !"1.0".equals(source.get("viewFormatVersion")))) continue;
            Map<String, String> scope = new LinkedHashMap<>((Map<String, String>) sources.getFirst().get("scope"));
            scope.put("courseProfile", "GK+LK");
            Map<String, Object> merged = service.findMatchingView((String) sources.getFirst().get("landscapeId"), scope);
            assertThat(merged).isNotNull();
            for (String field : List.of("viewFormatVersion", "$schema", "language")) {
                sources.stream().map(source -> source.get(field)).filter(java.util.Objects::nonNull).findFirst()
                        .ifPresent(value -> assertThat(merged).containsEntry(field, value));
            }
            checked++;
        }
        assertThat(checked).as("Legacy GK/LK pairs across the other authored subjects").isGreaterThanOrEqualTo(10);
    }

    private static final String CANONICAL_GYMNASIUM_OVERVIEW_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final String CANONICAL_MATH_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String CANONICAL_PHYSICS_ID = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final String CANONICAL_HISTORY_ID = "92406d94-e3c1-58ec-b7c6-12122278d25a";

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
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> roots = (List<Map<String, Object>>) match.get("rootNodes");
        assertThat(roots).filteredOn(root -> "structure".equals(root.get("kind"))).singleElement().satisfies(root -> {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> children = (List<Map<String, Object>>) root.get("children");
            assertThat(children)
                    .filteredOn(child -> "structure".equals(child.get("kind")))
                    .extracting(child -> child.get("id"))
                    .containsExactly("sek1", "sek2-gk-lk");
        });
        List<String> goalReferences = new ArrayList<>();
        collectGoalReferences(roots, goalReferences);
        assertThat(goalReferences).doesNotHaveDuplicates();
    }

    @Test
    void findViewById_prefersAuthoredMergedIdentityAndKeepsVirtualFallback(
            @TempDir Path tempDir) throws IOException {
        Path viewDir = tempDir.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(viewDir);
        for (String profile : List.of("GK", "LK")) {
            Files.writeString(viewDir.resolve(profile + ".view.json"), """
                    {
                      "viewId": "course-%s",
                      "landscapeId": "test-landscape",
                      "scope": {"schoolForm": "Gymnasium", "stage": "SekII", "courseProfile": "%s"},
                      "rootNodes": [{"kind": "structure", "id": "course-root", "label": "Course",
                        "children": [{"kind": "goalEntry", "goalId": "%s-target"}]}]
                    }
                    """.formatted(profile, profile, profile));
        }
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        Map<String, String> scope = Map.of(
                "schoolForm", "Gymnasium", "stage", "SekII", "courseProfile", "GK+LK");
        String mergedViewId = "merged:course-LK+course-GK";
        CompositionViewService virtualService = new CompositionViewService(properties, new ObjectMapper());
        Map<String, Object> virtualSelection = virtualService.findMatchingView("test-landscape", scope);
        Map<String, Object> virtualLookup = virtualService.findViewById(mergedViewId);

        assertThat(virtualSelection).isNotNull();
        assertThat(virtualSelection.get("viewId")).isEqualTo(mergedViewId);
        assertThat(virtualLookup).isNotNull();
        assertThat(virtualLookup.get("viewId")).isEqualTo(mergedViewId);
        assertThat(virtualLookup.get("rootNodes")).isEqualTo(virtualSelection.get("rootNodes"));
        assertThat(virtualLookup.get("mergedFromViewIds")).isEqualTo(List.of("course-LK", "course-GK"));
        assertThat(virtualService.findRootScopeOptions(mergedViewId)).singleElement().satisfies(option -> {
            assertThat(option.viewId()).isEqualTo(mergedViewId);
            assertThat(option.referencedGoalIds()).containsExactlyInAnyOrder("GK-target", "LK-target");
            assertThat(virtualService.resolveStructureReference(option.syntheticGoalId())).isEqualTo(option);
        });
        assertThat(virtualService.findViewById("merged:missing")).isNull();
        assertThat(virtualService.findViewById("merged:missing+course-GK").get("viewId"))
                .isEqualTo("course-GK");

        Files.writeString(viewDir.resolve("combined.view.json"), """
                {
                  "viewId": "merged:course-LK+course-GK",
                  "landscapeId": "test-landscape",
                  "scope": {"schoolForm": "Gymnasium", "stage": "SekII", "courseProfile": "GK+LK"},
                  "rootNodes": [
                    {"kind": "structure", "id": "course-root", "label": "Authored combined course",
                      "children": [{"kind": "canonicalSubtree", "goalId": "reviewed-target"}]},
                    {"kind": "canonicalSubtree", "goalId": "reviewed-support", "projectionRole": "prerequisiteOnly"}
                  ]
                }
                """);
        CompositionViewService authoredService = new CompositionViewService(properties, new ObjectMapper());
        Map<String, Object> authoredSelection = authoredService.findMatchingView("test-landscape", scope);

        assertThat(authoredSelection).isNotNull();
        assertThat(authoredSelection.get("viewId")).isEqualTo(mergedViewId);
        assertThat(authoredSelection.get("scope")).isEqualTo(scope);
        assertThat(authoredService.findViewById("  " + mergedViewId + "  ")).isEqualTo(authoredSelection);
        assertThat(authoredService.findRootScopeOptions(mergedViewId)).singleElement().satisfies(option -> {
            assertThat(option.syntheticGoalId()).isEqualTo("composition:" + mergedViewId + ":structure:course-root");
            assertThat(option.viewId()).isEqualTo(mergedViewId);
            assertThat(option.label()).isEqualTo("Authored combined course");
            assertThat(option.referencedGoalIds()).containsExactly("reviewed-target");
            assertThat(authoredService.resolveStructureReference(option.syntheticGoalId())).isEqualTo(option);
        });
    }

    @Test
    void findRootScopeOptions_returnsResolvableSyntheticRootForAuthoredView() {
        CompositionViewService service = createService();

        List<CompositionViewService.CompositionStructureResolution> options =
                service.findRootScopeOptions("de-he-gym-math-gk-g9");

        assertThat(options).singleElement().satisfies(option -> {
            assertThat(option.syntheticGoalId())
                    .isEqualTo("composition:de-he-gym-math-gk-g9:structure:math-root");
            assertThat(option.viewId()).isEqualTo("de-he-gym-math-gk-g9");
            assertThat(option.nodeId()).isEqualTo("math-root");
            assertThat(option.label()).isEqualTo("Mathematik");
            assertThat(option.referencedGoalIds()).isNotEmpty();
            assertThat(service.resolveStructureReference(option.syntheticGoalId()))
                    .isEqualTo(option);
        });
    }

    @Test
    void findRootScopeOptions_preservesMergedViewIdentity() {
        CompositionViewService service = createService();
        String mergedViewId = "merged:de-de-gym-math-lk+de-de-gym-math-gk";

        List<CompositionViewService.CompositionStructureResolution> options =
                service.findRootScopeOptions(mergedViewId);

        assertThat(options).singleElement().satisfies(option -> {
            assertThat(option.syntheticGoalId())
                    .isEqualTo("composition:" + mergedViewId + ":structure:math-root");
            assertThat(option.viewId()).isEqualTo(mergedViewId);
            assertThat(option.nodeId()).isEqualTo("math-root");
            assertThat(option.label()).isEqualTo("Mathematik");
            assertThat(option.referencedGoalIds()).isNotEmpty();
            assertThat(service.resolveStructureReference(option.syntheticGoalId()))
                    .isEqualTo(option);
        });
    }

    @Test
    void findRootScopeOptions_excludesPrerequisiteOnlyRootsAndKeepsDirectTargets(
            @TempDir Path tempDir) throws IOException {
        Path viewDir = tempDir.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(viewDir);
        Files.writeString(viewDir.resolve("root-roles.view.json"), """
                {
                  "viewId": "root-roles-view",
                  "landscapeId": "test-landscape",
                  "scope": {"schoolForm": "Gymnasium", "stage": "SekII"},
                  "rootNodes": [
                    {"kind": "goalEntry", "goalId": "precondition", "projectionRole": "prerequisiteOnly"},
                    {"kind": "goalEntry", "goalId": "target"}
                  ]
                }
                """);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        CompositionViewService service = new CompositionViewService(properties, new ObjectMapper());

        assertThat(service.findRootScopeOptions("root-roles-view"))
                .extracting(CompositionViewService.CompositionStructureResolution::syntheticGoalId)
                .containsExactly("target");
    }

    @Test
    void findLearnerFacingFocusAncestors_followsTheSingleAuthoredContainsAndCompositionPath(
            @TempDir Path tempDir) throws IOException {
        Path viewDir = tempDir.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(viewDir);
        Files.writeString(viewDir.resolve("focus-path.view.json"), """
                {
                  "viewId": "focus-path-view",
                  "landscapeId": "test-landscape",
                  "scope": {
                    "schoolForm": "Gymnasium",
                    "stage": "SekII"
                  },
                  "rootNodes": [{
                    "kind": "structure",
                    "id": "outer",
                    "label": "Outer",
                    "children": [
                      {
                        "kind": "structure",
                        "id": "inner",
                        "label": "Inner",
                        "children": [{
                          "kind": "canonicalSubtree",
                          "goalId": "subtree-root",
                          "displayLabel": "Visible subtree root"
                        }]
                      },
                      {
                        "kind": "structure",
                        "id": "direct-inner",
                        "label": "Direct inner",
                        "children": [{
                          "kind": "goalEntry",
                          "goalId": "direct-leaf"
                        }]
                      },
                      {
                        "kind": "structure",
                        "id": "prerequisite-lane",
                        "label": "Prerequisite lane",
                        "children": [{
                          "kind": "goalEntry",
                          "goalId": "requires-decoy",
                          "projectionRole": "prerequisiteOnly"
                        }]
                      }
                    ]
                  }]
                }
                """);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        CompositionViewService service = new CompositionViewService(properties, new ObjectMapper());

        LinkedHashMap<String, LearningGoal> structuralGoals = new LinkedHashMap<>();
        structuralGoals.put("subtree-root", goal(
                "subtree-root",
                "Canonical subtree root",
                List.of("preferred-parent", "hidden-parent", "unrelated-parent"),
                List.of()));
        structuralGoals.put("preferred-parent", goal(
                "preferred-parent",
                "Preferred parent",
                List.of("focus-leaf"),
                List.of()));
        structuralGoals.put("hidden-parent", goal(
                "hidden-parent",
                "Hidden second parent",
                List.of("focus-leaf"),
                List.of()));
        structuralGoals.put("unrelated-parent", goal(
                "unrelated-parent",
                "Unrelated canonical parent",
                List.of("direct-leaf"),
                List.of()));
        structuralGoals.put("focus-leaf", goal(
                "focus-leaf",
                "Focus leaf",
                List.of(),
                List.of("requires-decoy")));
        structuralGoals.put("direct-leaf", goal(
                "direct-leaf",
                "Direct leaf",
                List.of(),
                List.of()));
        structuralGoals.put("requires-decoy", goal(
                "requires-decoy",
                "Requires decoy",
                List.of(),
                List.of()));

        List<CompositionViewService.CompositionStructureResolution> ancestors =
                service.findLearnerFacingFocusAncestors(
                        "focus-path-view",
                        "focus-leaf",
                        structuralGoals);

        assertThat(ancestors)
                .extracting(CompositionViewService.CompositionStructureResolution::syntheticGoalId)
                .containsExactly(
                        "preferred-parent",
                        "subtree-root",
                        "composition:focus-path-view:structure:inner",
                        "composition:focus-path-view:structure:outer");
        assertThat(ancestors)
                .extracting(CompositionViewService.CompositionStructureResolution::label)
                .containsExactly(
                        "Preferred parent",
                        "Visible subtree root",
                        "Inner",
                        "Outer");
        assertThat(ancestors)
                .extracting(CompositionViewService.CompositionStructureResolution::syntheticGoalId)
                .doesNotContain("hidden-parent", "requires-decoy");

        assertThat(service.findLearnerFacingFocusAncestors(
                        "focus-path-view",
                        "subtree-root",
                        structuralGoals))
                .extracting(CompositionViewService.CompositionStructureResolution::syntheticGoalId)
                .containsExactly(
                        "composition:focus-path-view:structure:inner",
                        "composition:focus-path-view:structure:outer");
        assertThat(service.findLearnerFacingFocusAncestors(
                        "focus-path-view",
                        "composition:focus-path-view:structure:inner",
                        structuralGoals))
                .extracting(CompositionViewService.CompositionStructureResolution::syntheticGoalId)
                .containsExactly("composition:focus-path-view:structure:outer");
    }

    @Test
    void findLearnerFacingFocusAncestors_directGoalEntrySkipsCanonicalParentsAndPrerequisiteOnlyPaths(
            @TempDir Path tempDir) throws IOException {
        Path viewDir = tempDir.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(viewDir);
        Files.writeString(viewDir.resolve("focus-path.view.json"), """
                {
                  "viewId": "focus-path-view",
                  "landscapeId": "test-landscape",
                  "scope": {
                    "schoolForm": "Gymnasium",
                    "stage": "SekII"
                  },
                  "rootNodes": [{
                    "kind": "structure",
                    "id": "outer",
                    "label": "Outer",
                    "children": [
                      {
                        "kind": "canonicalSubtree",
                        "goalId": "subtree-root"
                      },
                      {
                        "kind": "structure",
                        "id": "direct-inner",
                        "label": "Direct inner",
                        "children": [{
                          "kind": "goalEntry",
                          "goalId": "direct-leaf"
                        }]
                      },
                      {
                        "kind": "goalEntry",
                        "goalId": "requires-decoy",
                        "projectionRole": "prerequisiteOnly"
                      }
                    ]
                  }]
                }
                """);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        CompositionViewService service = new CompositionViewService(properties, new ObjectMapper());

        LinkedHashMap<String, LearningGoal> structuralGoals = new LinkedHashMap<>();
        structuralGoals.put("subtree-root", goal(
                "subtree-root",
                "Subtree root",
                List.of("unrelated-parent"),
                List.of()));
        structuralGoals.put("unrelated-parent", goal(
                "unrelated-parent",
                "Unrelated canonical parent",
                List.of("direct-leaf"),
                List.of()));
        structuralGoals.put("direct-leaf", goal(
                "direct-leaf",
                "Direct leaf",
                List.of(),
                List.of("requires-decoy")));
        structuralGoals.put("requires-decoy", goal(
                "requires-decoy",
                "Requires decoy",
                List.of(),
                List.of()));

        assertThat(service.findLearnerFacingFocusAncestors(
                        "focus-path-view",
                        "direct-leaf",
                        structuralGoals))
                .extracting(CompositionViewService.CompositionStructureResolution::syntheticGoalId)
                .containsExactly(
                        "composition:focus-path-view:structure:direct-inner",
                        "composition:focus-path-view:structure:outer");
        assertThat(service.findLearnerFacingFocusAncestors(
                        "focus-path-view",
                        "requires-decoy",
                        structuralGoals))
                .isEmpty();
        assertThat(service.findLearnerFacingFocusAncestorPaths("focus-path-view", "direct-leaf", structuralGoals))
                .extracting(path -> path.stream().map(CompositionViewService.CompositionStructureResolution::label).toList())
                .containsExactly(List.of("Direct inner", "Outer"), List.of("Unrelated canonical parent", "Subtree root", "Outer"));
        assertThat(service.findLearnerFacingFocusAncestorPaths("focus-path-view", "requires-decoy", structuralGoals))
                .isEmpty();
        assertThat(service.findLearnerFacingFocusAncestors(
                        "focus-path-view",
                        "composition:other-view:structure:direct-inner",
                        structuralGoals))
                .isEmpty();
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
    void findMatchingView_mergesHessianSekTwoGkAndLkWithoutDuplicateQuarterStructures() {
        CompositionViewService service = createService();

        Map<String, Object> match = service.findMatchingView(
                CANONICAL_MATH_ID,
                Map.of(
                        "schoolForm", "Gymnasium",
                        "jurisdiction", "DE-HE",
                        "stage", "SekII",
                        "courseProfile", "GK+LK"));

        assertThat(match).isNotNull();
        assertThat(match.get("viewId"))
                .isEqualTo("merged:de-he-gym-sekii-math-lk+de-he-gym-sekii-math-gk");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> roots = (List<Map<String, Object>>) match.get("rootNodes");
        assertThat(roots).filteredOn(root -> "structure".equals(root.get("kind"))).singleElement().satisfies(root -> {
            assertThat(root).containsEntry("id", "math-root").containsEntry("label", "Mathematik");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> children = (List<Map<String, Object>>) root.get("children");
            assertThat(children).filteredOn(child -> "structure".equals(child.get("kind")))
                    .extracting(child -> child.get("id")).containsExactly("sek1", "sek2-gk-lk");
            Map<String, Object> upperStage = children.stream()
                    .filter(child -> "sek2-gk-lk".equals(child.get("id"))).findFirst().orElseThrow();
            // Course profile belongs to the committed scope; the shared stage
            // keeps its source-neutral label inside the subject wrapper.
            assertThat(upperStage).containsEntry("label", "Sekundarstufe II");
            List<String> structureIds = new ArrayList<>();
            collectStructureIds(List.of(upperStage), structureIds);
            for (String quarter : List.of("q1", "q2", "q3", "q4")) {
                assertThat(structureIds).filteredOn(quarter::equals).singleElement();
            }
        });
        List<String> goalReferences = new ArrayList<>();
        collectGoalReferences(roots, goalReferences);
        assertThat(goalReferences).doesNotHaveDuplicates();
    }

    @Test
    void findMatchingView_mergesEveryAuthoredExactMathematicsGkLkPair() throws IOException {
        Path viewDirectory = resolveCurriculaDir()
                .resolve("DE/Gymnasium/composition-views/mathematik");
        ObjectMapper mapper = new ObjectMapper();
        Map<String, List<AuthoredProfileView>> viewsByExactScope = new LinkedHashMap<>();
        List<Path> viewPaths;
        try (var paths = Files.list(viewDirectory)) {
            viewPaths = paths
                    .filter(path -> path.getFileName().toString().endsWith(".view.json"))
                    .sorted()
                    .toList();
        }
        for (Path path : viewPaths) {
            @SuppressWarnings("unchecked")
            Map<String, Object> document = mapper.readValue(path.toFile(), Map.class);
            @SuppressWarnings("unchecked")
            Map<String, String> scope = (Map<String, String>) document.get("scope");
            String courseProfile = scope.get("courseProfile");
            if (!"GK".equals(courseProfile) && !"LK".equals(courseProfile)) {
                continue;
            }
            Map<String, String> exactScope = new TreeMap<>(scope);
            exactScope.remove("courseProfile");
            String landscapeId = String.valueOf(document.get("landscapeId"));
            String key = landscapeId + "|" + exactScope;
            viewsByExactScope.computeIfAbsent(key, ignored -> new ArrayList<>())
                    .add(new AuthoredProfileView(
                            landscapeId,
                            Map.copyOf(exactScope),
                            courseProfile,
                            String.valueOf(document.get("viewId"))));
        }

        assertThat(viewsByExactScope).isNotEmpty();
        CompositionViewService service = createService();
        viewsByExactScope.forEach((scopeKey, authoredViews) -> {
            assertThat(authoredViews)
                    .as(scopeKey + " exact GK/LK pair")
                    .extracting(AuthoredProfileView::courseProfile)
                    .containsExactlyInAnyOrder("GK", "LK");
            Map<String, String> requestedScope = new LinkedHashMap<>(authoredViews.getFirst().scope());
            requestedScope.put("courseProfile", "GK+LK");

            Map<String, Object> match = service.findMatchingView(
                    authoredViews.getFirst().landscapeId(),
                    requestedScope);

            assertThat(match).as(scopeKey + " combined match").isNotNull();
            assertThat(match.get("mergedFromViewIds"))
                    .as(scopeKey + " merged sources")
                    .isInstanceOf(List.class);
            List<String> sourceViewIds = ((List<?>) match.get("mergedFromViewIds")).stream()
                    .map(String::valueOf)
                    .toList();
            assertThat(sourceViewIds)
                    .as(scopeKey + " merged sources")
                    .containsExactlyInAnyOrderElementsOf(authoredViews.stream()
                            .map(AuthoredProfileView::viewId)
                            .toList());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> roots = (List<Map<String, Object>>) match.get("rootNodes");
            List<String> goalReferences = new ArrayList<>();
            collectGoalReferences(roots, goalReferences);
            assertThat(goalReferences)
                    .as(scopeKey + " explicit goal references")
                    .doesNotHaveDuplicates();
        });
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

            assertThat(service.findLearnerScopeView(
                            CANONICAL_MATH_ID,
                            Map.of(
                                    "schoolForm", "Gymnasium",
                                    "jurisdiction", "DE-HE",
                                    "stage", "SekII",
                                    "courseProfile", "LK",
                                    "durationModel", durationModel)))
                    .as(durationModel + " exact learner scope")
                    .containsEntry("viewId", "de-he-gym-sekii-math-lk");
        }
    }

    @Test
    void learnerScopeDoesNotInferSekTwoFromCourseProfile() {
        CompositionViewService service = createService();

        for (String courseProfile : List.of("GK", "LK")) {
            assertThat(service.findLearnerScopeView(
                            CANONICAL_MATH_ID,
                            Map.of(
                                    "schoolForm", "Gymnasium",
                                    "jurisdiction", "DE-HE",
                                    "courseProfile", courseProfile)))
                    .as(courseProfile + " without an explicit stage")
                    .isNull();
        }
    }

    @Test
    void learnerScopeResolvesExplicitHessianSekTwoPhysicsGkView() {
        CompositionViewService service = createService();

        assertThat(service.findLearnerScopeView(
                        CANONICAL_PHYSICS_ID,
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "jurisdiction", "DE-HE",
                                "stage", "SekII",
                                "courseProfile", "GK")))
                .containsEntry("viewId", "de-he-gym-sekii-physics-gk");
    }

    @Test
    void learnerScopeRejectsUnrelatedExtraDimensionsInsteadOfUsingRepositorySubsetMatching() {
        CompositionViewService service = createService();
        Map<String, String> requestedScope = Map.of(
                "schoolForm", "Gymnasium",
                "jurisdiction", "DE-HE",
                "stage", "SekI",
                "durationModel", "G9",
                "year", "9");

        assertThat(service.findMatchingView(CANONICAL_MATH_ID, requestedScope))
                .isNotNull();
        assertThat(service.findLearnerScopeView(CANONICAL_MATH_ID, requestedScope))
                .isNull();
    }

    @Test
    void learnerScopePrefersReviewedBrandenburgSekOneViewForCommittedJurisdictionAndDuration() {
        CompositionViewService service = createService();

        assertThat(service.findLearnerScopeView(
                        CANONICAL_MATH_ID,
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "jurisdiction", "DE-BB",
                                "stage", "SekI",
                                "durationModel", "G8")))
                .containsEntry("viewId", "de-bb-gym-seki-math")
                .satisfies(view -> {
                    Map<?, ?> scope = (Map<?, ?>) view.get("scope");
                    assertThat(scope.get("jurisdiction")).isEqualTo("DE-BB");
                    assertThat(scope.get("stage")).isEqualTo("SekI");
                });
    }

    @Test
    void learnerScopePrefiltersStageBeforeChoosingTheMostSpecificAuthoredSubset() {
        CompositionViewService service = createService();
        Map<String, String> committedScope = Map.of(
                "schoolForm", "Gymnasium",
                "jurisdiction", "DE-HE",
                "stage", "CrossStage",
                "courseProfile", "GK");

        assertThat(service.findMatchingView(CANONICAL_HISTORY_ID, committedScope))
                .containsEntry("viewId", "de-he-gym-history-sekii-gk");
        assertThat(service.findLearnerScopeView(CANONICAL_HISTORY_ID, committedScope))
                .containsEntry("viewId", "de-de-gym-history-crossstage");
    }

    @Test
    void learnerScopeChoosesTheMostSpecificReviewedSekOneSubset() {
        CompositionViewService service = createService();

        assertThat(service.findLearnerScopeView(
                        CANONICAL_MATH_ID,
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "jurisdiction", "DE-BW",
                                "stage", "SekI",
                                "durationModel", "G9")))
                .containsEntry("viewId", "de-bw-gym-seki-math");
        assertThat(service.findLearnerScopeView(
                        CANONICAL_MATH_ID,
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "jurisdiction", "DE-HE",
                                "stage", "SekI",
                                "durationModel", "G9")))
                .containsEntry("viewId", "de-he-gym-seki-math-g9");
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
    void findMatchingView_mergesProjectionRolesWithTargetDominance(@TempDir Path tempDir)
            throws IOException {
        Path viewDir = tempDir.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(viewDir);
        Files.writeString(viewDir.resolve("gk.view.json"), """
                {
                  "viewId": "gk-view",
                  "landscapeId": "test-landscape",
                  "scope": {
                    "schoolForm": "Gymnasium",
                    "stage": "SekII",
                    "courseProfile": "GK"
                  },
                  "rootNodes": [{
                    "kind": "goalEntry",
                    "goalId": "goal-alpha",
                    "projectionRole": "prerequisiteOnly"
                  }]
                }
                """);
        Files.writeString(viewDir.resolve("lk.view.json"), """
                {
                  "viewId": "lk-view",
                  "landscapeId": "test-landscape",
                  "scope": {
                    "schoolForm": "Gymnasium",
                    "stage": "SekII",
                    "courseProfile": "LK"
                  },
                  "rootNodes": [{
                    "kind": "goalEntry",
                    "goalId": "goal-alpha"
                  }]
                }
                """);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        CompositionViewService service = new CompositionViewService(properties, new ObjectMapper());

        Map<String, Object> match = service.findMatchingView(
                "test-landscape",
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "SekII",
                        "courseProfile", "GK+LK"));

        assertThat(match).isNotNull();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rootNodes = (List<Map<String, Object>>) match.get("rootNodes");
        assertThat(rootNodes).singleElement()
                .satisfies(node -> assertThat(node)
                        .containsEntry("goalId", "goal-alpha")
                        .containsEntry("projectionRole", "target"));
    }

    @Test
    void findMatchingView_mergesProfileEquivalentStructuresWithoutChangingSingleViews(@TempDir Path tempDir)
            throws IOException {
        Path viewDir = tempDir.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(viewDir);
        Files.writeString(viewDir.resolve("gk.view.json"), """
                {
                  "viewId": "gk-view",
                  "landscapeId": "test-landscape",
                  "scope": {
                    "schoolForm": "Gymnasium",
                    "stage": "SekII",
                    "courseProfile": "GK"
                  },
                  "rootNodes": [{
                    "kind": "structure",
                    "id": "sek2-gk",
                    "label": "Sekundarstufe II (GK)",
                    "children": [
                      {
                        "kind": "goalEntry",
                        "goalId": "shared-goal",
                        "projectionRole": "prerequisiteOnly"
                      },
                      {"kind": "goalEntry", "goalId": "gk-goal"}
                    ]
                  }]
                }
                """);
        Files.writeString(viewDir.resolve("lk.view.json"), """
                {
                  "viewId": "lk-view",
                  "landscapeId": "test-landscape",
                  "scope": {
                    "schoolForm": "Gymnasium",
                    "stage": "SekII",
                    "courseProfile": "LK"
                  },
                  "rootNodes": [{
                    "kind": "structure",
                    "id": "sek2-lk",
                    "label": "Sekundarstufe II (LK)",
                    "children": [
                      {"kind": "canonicalSubtree", "goalId": "shared-goal"},
                      {"kind": "goalEntry", "goalId": "lk-goal"}
                    ]
                  }]
                }
                """);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        CompositionViewService service = new CompositionViewService(properties, new ObjectMapper());

        Map<String, Object> combined = service.findMatchingView(
                "test-landscape",
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "SekII",
                        "courseProfile", "GK+LK"));
        Map<String, Object> gk = service.findMatchingView(
                "test-landscape",
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "SekII",
                        "courseProfile", "GK"));
        Map<String, Object> lk = service.findMatchingView(
                "test-landscape",
                Map.of(
                        "schoolForm", "Gymnasium",
                        "stage", "SekII",
                        "courseProfile", "LK"));

        assertThat(combined).isNotNull();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> combinedRoots = (List<Map<String, Object>>) combined.get("rootNodes");
        assertThat(combinedRoots).singleElement().satisfies(root -> {
            assertThat(root)
                    .containsEntry("id", "sek2-gk-lk")
                    .containsEntry("label", "Sekundarstufe II (GK + LK)");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> children = (List<Map<String, Object>>) root.get("children");
            assertThat(children)
                    .extracting(child -> child.get("goalId"))
                    .containsExactlyInAnyOrder("shared-goal", "gk-goal", "lk-goal");
            assertThat(children)
                    .filteredOn(child -> "shared-goal".equals(child.get("goalId")))
                    .singleElement()
                    .satisfies(child -> assertThat(child)
                            .containsEntry("kind", "canonicalSubtree")
                            .containsEntry("projectionRole", "target"));
        });

        assertThat(gk).isNotNull();
        assertThat((List<?>) gk.get("rootNodes")).singleElement().satisfies(root -> {
            assertThat(((Map<?, ?>) root).get("id")).isEqualTo("sek2-gk");
            assertThat(((Map<?, ?>) root).get("label")).isEqualTo("Sekundarstufe II (GK)");
        });
        assertThat(lk).isNotNull();
        assertThat((List<?>) lk.get("rootNodes")).singleElement().satisfies(root -> {
            assertThat(((Map<?, ?>) root).get("id")).isEqualTo("sek2-lk");
            assertThat(((Map<?, ?>) root).get("label")).isEqualTo("Sekundarstufe II (LK)");
        });
    }

    @Test
    void findMatchingView_rejectsUnsupportedProjectionRole(@TempDir Path tempDir)
            throws IOException {
        Path viewDir = tempDir.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(viewDir);
        Files.writeString(viewDir.resolve("invalid.view.json"), """
                {
                  "viewId": "invalid-view",
                  "landscapeId": "test-landscape",
                  "scope": {
                    "schoolForm": "Gymnasium",
                    "stage": "SekII",
                    "courseProfile": "LK"
                  },
                  "rootNodes": [{
                    "kind": "goalEntry",
                    "goalId": "goal-alpha",
                    "projectionRole": "reviewOnly"
                  }]
                }
                """);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        CompositionViewService service = new CompositionViewService(properties, new ObjectMapper());

        assertThatThrownBy(() -> service.findMatchingView(
                        "test-landscape",
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "stage", "SekII",
                                "courseProfile", "LK")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Unsupported projectionRole");
    }

    @Test
    void findMatchingView_rejectsProjectionRoleOnLandscapeEntry(@TempDir Path tempDir)
            throws IOException {
        Path viewDir = tempDir.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(viewDir);
        Files.writeString(viewDir.resolve("invalid-landscape-entry.view.json"), """
                {
                  "viewId": "invalid-landscape-entry-view",
                  "landscapeId": "test-landscape",
                  "scope": {
                    "schoolForm": "Gymnasium",
                    "stage": "SekII",
                    "courseProfile": "LK"
                  },
                  "rootNodes": [{
                    "kind": "landscapeEntry",
                    "landscapeId": "test-landscape",
                    "projectionRole": "prerequisiteOnly"
                  }]
                }
                """);
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(tempDir.toString());
        CompositionViewService service = new CompositionViewService(properties, new ObjectMapper());

        assertThatThrownBy(() -> service.findMatchingView(
                        "test-landscape",
                        Map.of(
                                "schoolForm", "Gymnasium",
                                "stage", "SekII",
                                "courseProfile", "LK")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("only supported on canonicalSubtree and goalEntry");
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
    @SuppressWarnings("unchecked")
    void findMatchingView_keepsHessianPhysicsStageTreeForEveryCourseAndDuration() {
        CompositionViewService service = createService();
        Map<String, String> exams = Map.of(
                "GK", "61684ca7-b725-534f-944b-c7645cea1792",
                "LK", "79028c45-90ae-57eb-8016-f5a96af18fa2");
        Map<String, List<String>> examParts = Map.of(
                "GK", List.of("abe032d3-97dd-5eaf-964e-0439cea27ac2", "f4eac786-a8e1-5f23-aedf-17bc70fc347f"),
                "LK", List.of("ed3a6f6b-2ca3-51c2-8f00-58e11eb02401", "320732e8-1c44-5fa4-9a47-972243cfc32a"));
        String previousEPhaseCollection = "424b07df-bf66-5d7f-99f5-f28b32ad1f22";
        // E.1 cut (23 Nov 2026): E.1 groups its targets in four child units, each with its closing
        // checks; the multiphase exam moved with the velocity vector to E.3.
        Map<String, List<String>> ePhaseAssessmentPlacements = new java.util.LinkedHashMap<>(Map.of(
                "physics-e1-uniform-motion", List.of(
                        "ee7d5f3d-858f-59d6-89b0-e5a7f437f458"), // A: wagon
                "physics-e1-accelerated-and-free-fall", List.of(
                        "f41e4e30-794e-5ce4-ba5e-cc72712cd691"), // voluntary: two free-fall series
                "physics-e1-air-and-vacuum", List.of(
                        "c933b7d2-edcb-5747-9378-9762659f260a"), // C: vertical throw
                "physics-e1-two-motions", List.of(
                        "39f52dcb-ff1d-5cad-9ccb-30da803cfa85", // B: horizontal throw
                        "6ea3fb3c-abdc-568f-ab13-97c36dc274e4"))); // voluntary: two motions, one time
        ePhaseAssessmentPlacements.putAll(Map.of(
                "physics-e2-newton-and-conservation", List.of(
                        "22561c66-3957-5d55-b07a-25de1f359930",
                        "72649cf5-893c-5f03-88bd-a2497171d434",
                        "be6d4895-65ab-545b-8df9-84e5a308a5e3"),
                "he-physics-topic-287739a3-6143-55d0-abe7-1a08889e9b49", List.of( // E.3
                        "8320bb17-e6ab-50ea-a965-aa331bfd33e1",
                        "2b9e565f-d9b4-5e23-b5b7-b7977cecff06"),
                "he-physics-topic-04d1d2df-a94b-5db4-8d07-cbb512c2e0b9",
                        List.of("dd99528a-bae5-5b78-89e6-c6092c927f8d"), // E.4
                "he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089", List.of( // E.5
                        "1b432223-3d59-5586-86a9-2214b4844101",
                        "7e0308d8-a239-5c0f-b2c0-724f21e4da60",
                        "8a1d4093-9832-5010-b1ca-9d32d8c05afa"),
                "he-physics-topic-df11eb33-4900-52bf-93b3-eb82ff0f9a28",
                        List.of("6ba2e47f-7e88-5d30-8f1a-3f4b4f785ca1"), // E.6
                "he-physics-topic-9743baad-9371-52b6-98ee-72bc6dc68701",
                        List.of("6d25344c-35d7-5853-925d-2bccbaf50630"), // E.7
                "physics-he-ephase-cross-topic-assessments", List.of(
                        "a9562b05-c54d-5635-9244-3f7dd24a8642", // Bewegungsanalyse und freier Fall
                        "5773ccbe-cd20-5ba0-99a5-7ccd5f42be51",
                        "879491c0-7153-570b-91f4-c61d9fe8a143",
                        "7c0b94b9-2af7-59d4-bfae-278a3418f6a8")));
        for (String durationModel : List.of("G8", "G9")) {
            for (String profile : List.of("GK", "LK", "GK+LK")) {
                String context = "Hessen Physics " + durationModel + " " + profile;
                Map<String, Object> match = service.findMatchingView(
                        CANONICAL_PHYSICS_ID,
                        Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "stage", "SekII",
                                "courseProfile", profile, "durationModel", durationModel));
                assertThat(match).as(context).isNotNull();
                assertThat(match.get("viewId")).as(context + " source view").isEqualTo(
                        "GK+LK".equals(profile)
                                ? "merged:de-he-gym-sekii-physics-lk+de-he-gym-sekii-physics-gk"
                                : "de-he-gym-sekii-physics-" + profile.toLowerCase(java.util.Locale.ROOT));
                List<Map<String, Object>> roots = (List<Map<String, Object>>) match.get("rootNodes");
                List<Map<String, Object>> subjectRoots = roots.stream()
                        .filter(node -> "structure".equals(node.get("kind")) && "physics-root".equals(node.get("id"))).toList();
                assertThat(subjectRoots).as(context + " sole subject wrapper").singleElement()
                        .satisfies(root -> assertThat(root).containsEntry("label", "Physik").containsEntry("labelEn", "Physics"));
                List<Map<String, Object>> subjectChildren = (List<Map<String, Object>>) subjectRoots.getFirst().get("children");
                String stageId = "physics-sekii-" + ("GK+LK".equals(profile) ? "gk-lk" : profile.toLowerCase(java.util.Locale.ROOT));
                List<Map<String, Object>> stages = subjectChildren.stream()
                        .filter(node -> stageId.equals(node.get("id"))).toList();
                List<Map<String, Object>> outsideStage = new ArrayList<>(flattenCompositionNodes(roots.stream()
                        .filter(node -> !"physics-root".equals(node.get("id"))).toList()));
                outsideStage.addAll(flattenCompositionNodes(subjectChildren.stream()
                        .filter(node -> !stageId.equals(node.get("id"))).toList()));
                assertThat(outsideStage).as(context + " references outside the stage remain support only")
                        .filteredOn(node -> !"structure".equals(node.get("kind")))
                        .allSatisfy(node -> assertThat(node).containsEntry("projectionRole", "prerequisiteOnly"));
                assertThat(stages).as(context + " sole stage wrapper").singleElement().satisfies(stage -> {
                    assertThat(stage).containsEntry("id", stageId)
                            .containsEntry("labelEn", "Upper Secondary")
                            .containsEntry("label", "Sekundarstufe II ("
                                    + ("GK+LK".equals(profile) ? "GK + LK" : profile) + ")");
                    List<Map<String, Object>> children = (List<Map<String, Object>>) stage.get("children");
                    assertThat(children).filteredOn(node -> "structure".equals(node.get("kind")))
                            .extracting(node -> node.get("id"))
                            .containsExactly("physics-e-phase", "physics-q1", "physics-q2", "physics-q3", "physics-q4", "physics-he-abitur");
                    Map<String, Object> abitur = children.stream()
                            .filter(node -> "physics-he-abitur".equals(node.get("id"))).findFirst().orElseThrow();
                    assertThat(abitur).containsEntry("kind", "structure").containsEntry("label", "Abiturprüfung");
                    List<Map<String, Object>> examEntries = (List<Map<String, Object>>) abitur.get("children");
                    List<String> expectedProfiles = "GK+LK".equals(profile) ? List.of("GK", "LK") : List.of(profile);
                    assertThat(examEntries).allSatisfy(node -> assertThat(node).containsEntry("kind", "canonicalSubtree"));
                    assertThat(examEntries).extracting(node -> node.get("goalId"))
                            .containsExactlyInAnyOrderElementsOf(expectedProfiles.stream().flatMap(course -> examParts.get(course).stream()).toList());
                    assertThat(flattenCompositionNodes(examEntries)).noneSatisfy(node ->
                            assertThat(node.get("goalId")).isIn(exams.values()));
                });
                Map<String, Object> stage = stages.getFirst();
                List<Map<String, Object>> allNodes = flattenCompositionNodes(List.of(stage));
                assertThat(allNodes).as(context + " retired E-phase assessment collection")
                        .noneMatch(node -> previousEPhaseCollection.equals(node.get("goalId"))
                                || ("existing-assessment-path-" + previousEPhaseCollection).equals(node.get("id"))
                                || ("he-physics-topic-" + previousEPhaseCollection).equals(node.get("id")));
                List<Map<String, Object>> stageChildren = (List<Map<String, Object>>) stage.get("children");
                Map<String, Object> ePhase = stageChildren.stream()
                        .filter(node -> "physics-e-phase".equals(node.get("id"))).findFirst().orElseThrow();
                List<Map<String, Object>> phaseChildren = (List<Map<String, Object>>) ePhase.get("children");
                ePhaseAssessmentPlacements.forEach((parentId, assessmentIds) -> {
                    Map<String, Object> parent = flattenCompositionNodes(phaseChildren).stream()
                            .filter(node -> parentId.equals(node.get("id"))).findFirst().orElseThrow();
                    List<Map<String, Object>> entries = (List<Map<String, Object>>) parent.get("children");
                    for (String assessmentId : assessmentIds) {
                        assertThat(entries).as(context + " placement of " + assessmentId + " in " + parentId)
                                .filteredOn(node -> assessmentId.equals(node.get("goalId")))
                                .singleElement().satisfies(node -> assertThat(node)
                                        .containsEntry("kind", "canonicalSubtree")
                                        .doesNotContainEntry("projectionRole", "prerequisiteOnly"));
                        assertThat(allNodes).as(context + " unique placement of " + assessmentId)
                                .filteredOn(node -> assessmentId.equals(node.get("goalId"))).hasSize(1);
                    }
                });
                // In the reviewed Hessian edition C is on the board of E.1 child unit 3. D is on the acceleration board.
                String accelerationProtocol = "f13ca187-b680-5f47-b4ad-76bd474bd8a2";
                Map<String, Object> motion = phaseChildren.stream()
                        .filter(node -> "physics-e1-motion".equals(node.get("id"))).findFirst().orElseThrow();
                List<Map<String, Object>> motionChildren = (List<Map<String, Object>>) motion.get("children");
                assertThat(motionChildren).as(context + " acceleration board in E.1")
                        .filteredOn(node -> "physics-e1-accelerated-and-free-fall".equals(node.get("id")))
                        .singleElement().satisfies(board -> assertThat((List<Map<String, Object>>) board.get("children"))
                                .filteredOn(node -> accelerationProtocol.equals(node.get("goalId")))
                                .singleElement().satisfies(node -> assertThat(node).containsEntry("kind", "goalEntry")
                                        .doesNotContainEntry("projectionRole", "prerequisiteOnly")));
                assertThat(allNodes).as(context + " unique acceleration protocol")
                        .filteredOn(node -> accelerationProtocol.equals(node.get("goalId"))).hasSize(1);
                assertThat(allNodes).as(context + " former throw and protocol editions are not offered")
                        .extracting(node -> node.get("goalId")).doesNotContain(
                                "c5807a37-129e-5df6-8989-482bc7f5683e", "a8dc0290-9f80-5763-8943-e16b8d2aa860");
                List<String> assessmentBranches = List.of(
                        "549a427d-f10a-5537-990e-6fdd7466848b", // Q1
                        "9dd7c596-a751-523c-acba-916f73e900a5", // Q2
                        "b47a2a23-b56d-5433-9036-075d6bb7c782", // Q3
                        "85bbad98-2f48-5d64-85c4-ab6cf67f24c2"); // Q4
                for (String branchId : assessmentBranches) {
                    assertThat(allNodes).as(context + " expandable assessment branch " + branchId)
                            .filteredOn(node -> branchId.equals(node.get("goalId"))
                                    || ("existing-assessment-path-" + branchId).equals(node.get("id"))
                                    || ("he-physics-topic-" + branchId).equals(node.get("id")))
                            .singleElement().satisfies(node -> {
                                if ("canonicalSubtree".equals(node.get("kind"))) {
                                    assertThat(node).containsEntry("goalId", branchId);
                                } else if (("existing-assessment-path-" + branchId).equals(node.get("id"))) {
                                    assertThat(node).containsEntry("kind", "structure")
                                            .containsEntry("id", "existing-assessment-path-" + branchId);
                                    // The Q1 collection was materialized when its
                                    // other assessments moved to their source-backed
                                    // content branches. Its retained Coulomb task
                                    // remains in this exact, expandable collection.
                                    assertThat(branchId).isEqualTo("549a427d-f10a-5537-990e-6fdd7466848b");
                                    assertThat(flattenCompositionNodes((List<Map<String, Object>>) node.get("children")))
                                            .extracting(child -> child.get("goalId"))
                                            .contains("716acf20-d882-5152-9735-099876d631b4");
                                } else {
                                    assertThat(node).containsEntry("kind", "structure")
                                            .containsEntry("id", "he-physics-topic-" + branchId);
                                    assertThat((List<Map<String, Object>>) node.get("children")).isNotEmpty();
                                }
                            });
                }
                Map<String, String> expectedParents = Map.of(
                        "physics-b034-transistor", "b034-preserved-rootNodes-0-children-13-children-6",
                        "physics-final-diode-sekii", "b034-preserved-rootNodes-0-children-13-children-6",
                        "physics-b034-stars", "b034-preserved-rootNodes-0-children-13-children-7",
                        "physics-b034-nuclear", "b034-preserved-rootNodes-0-children-13-children-3",
                        "physics-b034-assessments", "physics-q4");
                expectedParents.forEach((childId, parentId) -> {
                    Map<String, Object> parent = allNodes.stream()
                            .filter(node -> parentId.equals(node.get("id"))).findFirst().orElseThrow();
                    assertThat((List<Map<String, Object>>) parent.get("children"))
                            .as(context + " placement of " + childId)
                            .filteredOn(node -> childId.equals(node.get("id"))).hasSize(1);
                });
                assertThat(allNodes).extracting(node -> node.get("label"))
                        .doesNotContain("Physik", "Dioden: belegte Quellenanteile", "Materialgestützte Prüfungsaufgaben");
                List<String> structures = new ArrayList<>();
                collectStructureIds(roots, structures);
                assertThat(structures).as(context + " unique structures").doesNotHaveDuplicates();
            }
        }
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

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> flattenCompositionNodes(List<Map<String, Object>> nodes) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> node : nodes) {
            result.add(node);
            if (node.get("children") instanceof List<?> children) {
                result.addAll(flattenCompositionNodes((List<Map<String, Object>>) children));
            }
        }
        return result;
    }

    private static LearningGoal goal(
            String id,
            String title,
            List<String> contains,
            List<String> requires) {
        LearningGoal goal = new LearningGoal();
        goal.setId(id);
        goal.setTitle(title);
        goal.setContains(contains);
        goal.setRequires(requires);
        return goal;
    }

    private record AuthoredProfileView(
            String landscapeId,
            Map<String, String> scope,
            String courseProfile,
            String viewId) {
    }

    @SuppressWarnings("unchecked")
    private static void collectGoalReferences(List<Map<String, Object>> nodes, List<String> goalIds) {
        for (Map<String, Object> node : nodes) {
            Object goalId = node.get("goalId");
            if (goalId instanceof String text) {
                goalIds.add(text);
            }
            Object children = node.get("children");
            if (children instanceof List<?> list) {
                collectGoalReferences((List<Map<String, Object>>) list, goalIds);
            }
        }
    }

    @SuppressWarnings("unchecked")
    private static void collectStructureIds(List<Map<String, Object>> nodes, List<String> structureIds) {
        for (Map<String, Object> node : nodes) {
            if ("structure".equals(node.get("kind")) && node.get("id") instanceof String id) {
                structureIds.add(id);
            }
            Object children = node.get("children");
            if (children instanceof List<?> list) {
                collectStructureIds((List<Map<String, Object>>) list, structureIds);
            }
        }
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
