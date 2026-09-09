package com.skillpilot.backend.composition;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.TreeMap;
import java.nio.file.Files;
import java.nio.file.Path;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.junit.jupiter.api.Test;

class CourseProfileCompositionViewMergerTest {

    private static final Map<String, List<String>> ROLE_GRAPH = Map.of(
            "root", List.of("branch", "shared"),
            "branch", List.of("advanced", "support"),
            "shared", List.of(), "advanced", List.of(), "support", List.of(),
            "unreferenced", List.of());

    private static Map<String, Object> reference(String kind, String id, String role) {
        return Map.of("kind", kind, "goalId", id, "projectionRole", role);
    }

    @Test
    void inheritedTargetInOneProfileSurvivesDirectExclusionInAnother() {
        var broad = reference("canonicalSubtree", "root", "target");
        var exclusion = reference("goalEntry", "advanced", "prerequisiteOnly");
        var gk = List.of(broad, exclusion);
        var lk = List.of(broad);
        var merged = CourseProfileCompositionViewMerger.mergeViews(List.of(lk, gk), ROLE_GRAPH);
        assertThat(merged).containsExactly(broad);
        assertThat(gk).containsExactly(broad, exclusion);
        assertThat(CourseProfileCompositionViewMerger.mergeViews(List.of(gk, lk), ROLE_GRAPH))
                .isEqualTo(merged);
    }

    @Test
    void preservesSourceSpecificityAndCommonExclusionsAndDoesNotImportUnreferencedGoals() {
        var broad = reference("canonicalSubtree", "root", "target");
        var exclusion = reference("goalEntry", "support", "prerequisiteOnly");
        var source = List.of(broad, exclusion);
        assertThat(CourseProfileCompositionViewMerger.mergeViews(List.of(source, source), ROLE_GRAPH))
                .containsExactly(broad, exclusion);
    }

    @Test
    void preservesNarrowerSubtreeExclusionUnlessAnotherProfileActuallyTargetsIt() {
        var broad = reference("canonicalSubtree", "root", "target");
        var narrow = reference("canonicalSubtree", "branch", "prerequisiteOnly");
        var excluded = List.of(broad, narrow);
        assertThat(CourseProfileCompositionViewMerger.mergeViews(List.of(excluded, excluded), ROLE_GRAPH))
                .containsExactly(broad, narrow);
        assertThat(CourseProfileCompositionViewMerger.mergeViews(List.of(excluded, List.of(broad)), ROLE_GRAPH))
                .containsExactly(broad);
    }

    @Test
    void targetDominatesOnlyAtEqualSpecificityInsideEachSource() {
        var target = reference("canonicalSubtree", "branch", "target");
        var excluded = reference("canonicalSubtree", "branch", "prerequisiteOnly");
        assertThat(CourseProfileCompositionViewMerger.mergeViews(
                List.of(List.of(target, excluded), List.of(excluded)), ROLE_GRAPH))
                .singleElement().satisfies(node -> assertThat(node).containsEntry("projectionRole", "target"));
    }

    @Test
    void canonicalSpecificityUsesDistanceToSharedDescendantNotUnrelatedRootDepth() {
        Map<String, List<String>> graph = Map.of(
                "outer", List.of("deeper"), "deeper", List.of("far"),
                "far", List.of("middle"), "middle", List.of("shared"),
                "near", List.of("shared"), "shared", List.of());
        var farExcluded = reference("canonicalSubtree", "far", "prerequisiteOnly");
        var nearTarget = reference("canonicalSubtree", "near", "target");
        var directExcluded = reference("goalEntry", "shared", "prerequisiteOnly");
        var source = List.of(farExcluded, nearTarget);
        // The first source really targets shared (one hop from near, two from
        // far). Only the second source explicitly excludes it.
        assertThat(CourseProfileCompositionViewMerger.mergeViews(
                List.of(source, List.of(farExcluded, nearTarget, directExcluded)), graph))
                .containsExactly(farExcluded, nearTarget);
    }

    @Test
    void commonDirectExclusionIsNotLostWhenSameGoalHasASubtreeReference() {
        var inherited = reference("canonicalSubtree", "shared", "target");
        var excluded = reference("goalEntry", "shared", "prerequisiteOnly");
        var source = List.of(inherited, excluded);
        assertThat(CourseProfileCompositionViewMerger.mergeViews(List.of(source, source), ROLE_GRAPH))
                .singleElement().satisfies(node -> assertThat(node)
                        .containsEntry("goalId", "shared")
                        .containsEntry("projectionRole", "prerequisiteOnly"));
    }

    @Test
    void refusesUnknownGraphReferencesAndContainsCycles() {
        var source = List.of(reference("canonicalSubtree", "missing", "target"));
        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.mergeViews(List.of(source), ROLE_GRAPH))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Unknown canonical goal");
        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.mergeViews(
                List.of(List.of(reference("canonicalSubtree", "a", "target"))),
                Map.of("a", List.of("b"), "b", List.of("a"))))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("contains cycle");
    }

    @Test
    @SuppressWarnings("unchecked")
    void everyAuthoredExactGkLkPairPreservesItsResolvedUnionAndSourceDocuments() throws Exception {
        Path curricula = Path.of("../curricula/DE/Gymnasium");
        ObjectMapper mapper = new ObjectMapper();
        Map<String, List<String>> graph = new LinkedHashMap<>();
        try (var files = Files.list(curricula.resolve("canonical"))) {
            for (Path file : files.filter(path -> path.toString().endsWith(".json")).sorted().toList()) {
                for (var goal : mapper.readTree(file.toFile()).path("goals")) {
                    List<String> children = new ArrayList<>();
                    goal.path("contains").forEach(child -> children.add(child.asText()));
                    graph.put(goal.path("id").asText(), children);
                }
            }
        }
        Map<String, Map<String, List<Map<String, Object>>>> groups = new TreeMap<>();
        try (var files = Files.walk(curricula.resolve("composition-views"))) {
            for (Path file : files.filter(path -> path.toString().endsWith(".view.json")).sorted().toList()) {
                Map<String, Object> view = mapper.readValue(file.toFile(), new TypeReference<>() {});
                Map<String, Object> scope = new TreeMap<>((Map<String, Object>) view.get("scope"));
                Object profile = scope.remove("courseProfile");
                if (!"GK".equals(profile) && !"LK".equals(profile)) continue;
                String key = view.get("landscapeId") + "|" + scope;
                var pair = groups.computeIfAbsent(key, ignored -> new LinkedHashMap<>());
                assertThat(pair.put((String) profile, (List<Map<String, Object>>) view.get("rootNodes")))
                        .as("Unique profile %s in %s", profile, key).isNull();
            }
        }
        int checked = 0;
        for (var entry : groups.entrySet()) {
            if (entry.getValue().size() != 2) continue;
            List<List<Map<String, Object>>> sources = List.of(
                    entry.getValue().get("LK"), entry.getValue().get("GK"));
            String before = mapper.writeValueAsString(sources);
            // mergeViews checks exact role-resolved union, both before and
            // after any structural processing. Every current subject/stage/
            // jurisdiction/duration combination participates in this guard.
            assertThat(CourseProfileCompositionViewMerger.mergeViews(sources, graph))
                    .as(entry.getKey()).isNotEmpty();
            assertThat(mapper.writeValueAsString(sources)).as(entry.getKey() + " source immutability")
                    .isEqualTo(before);
            checked++;
        }
        assertThat(checked).as("All currently authored exact GK/LK scope pairs").isGreaterThanOrEqualTo(96);
    }

    @Test
    void mergesLongCourseProfileNamesIntoOneNeutralStructure() {
        List<Map<String, Object>> merged = CourseProfileCompositionViewMerger.merge(List.of(
                Map.of(
                        "kind", "structure",
                        "id", "course-grundkurs",
                        "label", "Mathematik Grundkurs",
                        "children", List.of(Map.of("kind", "goalEntry", "goalId", "gk-goal"))),
                Map.of(
                        "kind", "structure",
                        "id", "course-leistungskurs",
                        "label", "Mathematik Leistungskurs",
                        "children", List.of(Map.of("kind", "goalEntry", "goalId", "lk-goal")))));

        assertThat(merged).singleElement().satisfies(root -> {
            assertThat(root)
                    .containsEntry("id", "course-gk-lk")
                    .containsEntry("label", "Mathematik Grund- und Leistungskurs");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> children = (List<Map<String, Object>>) root.get("children");
            assertThat(children)
                    .extracting(child -> child.get("goalId"))
                    .containsExactly("gk-goal", "lk-goal");
        });
    }

    @Test
    void mergesDivergentProfileLabelsOnlyWhenTheirChildrenAreIdentical() {
        Map<String, Object> sharedChild = Map.of("kind", "goalEntry", "goalId", "shared-goal");

        List<Map<String, Object>> merged = CourseProfileCompositionViewMerger.merge(List.of(
                Map.of(
                        "kind", "structure",
                        "id", "advanced-topics-gk",
                        "label", "Q-Phase (GK): Vertiefende Themen",
                        "children", List.of(sharedChild)),
                Map.of(
                        "kind", "structure",
                        "id", "advanced-topics-lk",
                        "label", "Q-Phase (LK): Vertiefungen und komplexe Zahlen",
                        "children", List.of(sharedChild))));

        assertThat(merged).singleElement().satisfies(root -> assertThat(root)
                .containsEntry("id", "advanced-topics-gk-lk")
                .containsEntry(
                        "label",
                        "Q-Phase (GK + LK): Vertiefende Themen / Vertiefungen und komplexe Zahlen"));
    }

    @Test
    void removesStrictlyContainedSiblingSubtreeAfterProfileWrappersMerge() {
        Map<String, Object> gk = Map.of(
                "kind", "structure",
                "id", "course-gk",
                "label", "Mathematik GK",
                "children", List.of(Map.of(
                        "kind", "structure",
                        "id", "alignment-gk",
                        "label", "Quellenabgleich GK",
                        "children", List.of(Map.of(
                                "kind", "canonicalSubtree",
                                "goalId", "narrow-goal")))));
        Map<String, Object> lk = Map.of(
                "kind", "structure",
                "id", "course-lk",
                "label", "Mathematik LK",
                "children", List.of(Map.of(
                        "kind", "structure",
                        "id", "alignment-lk",
                        "label", "Quellenabgleich LK",
                        "children", List.of(Map.of(
                                "kind", "canonicalSubtree",
                                "goalId", "broad-goal")))));
        List<Map<String, Object>> merged = CourseProfileCompositionViewMerger.merge(
                List.of(gk, lk),
                (kind, goalId) -> switch (goalId) {
                    case "broad-goal" -> Set.of("broad-goal", "middle-goal", "narrow-goal");
                    case "narrow-goal" -> Set.of("narrow-goal");
                    default -> throw new IllegalArgumentException("Unexpected goal " + goalId);
                });

        assertThat(merged).singleElement().satisfies(root -> {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> rootChildren = (List<Map<String, Object>>) root.get("children");
            assertThat(rootChildren).singleElement().satisfies(alignment -> {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> children =
                        (List<Map<String, Object>>) alignment.get("children");
                assertThat(children).singleElement().satisfies(child -> assertThat(child)
                        .containsEntry("kind", "canonicalSubtree")
                        .containsEntry("goalId", "broad-goal"));
            });
        });
    }

    @Test
    void keepsContainedReferencesUnderDifferentAuthoredParents() {
        Map<String, Object> gk = Map.of(
                "kind", "structure",
                "id", "course-gk",
                "label", "Mathematik GK",
                "children", List.of(Map.of(
                        "kind", "structure",
                        "id", "primary-placement",
                        "children", List.of(Map.of(
                                "kind", "canonicalSubtree",
                                "goalId", "narrow-goal")))));
        Map<String, Object> lk = Map.of(
                "kind", "structure",
                "id", "course-lk",
                "label", "Mathematik LK",
                "children", List.of(Map.of(
                        "kind", "structure",
                        "id", "advanced-placement",
                        "children", List.of(Map.of(
                                "kind", "canonicalSubtree",
                                "goalId", "broad-goal")))));
        List<Map<String, Object>> merged = CourseProfileCompositionViewMerger.merge(
                List.of(gk, lk),
                (kind, goalId) -> "broad-goal".equals(goalId)
                        ? Set.of("broad-goal", "narrow-goal")
                        : Set.of(goalId));

        assertThat(merged).singleElement().satisfies(root -> {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> children = (List<Map<String, Object>>) root.get("children");
            assertThat(children)
                    .extracting(child -> child.get("id"))
                    .containsExactly("primary-placement", "advanced-placement");
        });
    }

    @Test
    void rejectsPartiallyOverlappingSiblingSubtrees() {
        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.merge(
                        List.of(
                                Map.of(
                                        "kind", "structure",
                                        "id", "course-gk",
                                        "label", "Mathematik GK",
                                        "children", List.of(Map.of(
                                                "kind", "canonicalSubtree",
                                                "goalId", "left-goal"))),
                                Map.of(
                                        "kind", "structure",
                                        "id", "course-lk",
                                        "label", "Mathematik LK",
                                        "children", List.of(Map.of(
                                                "kind", "canonicalSubtree",
                                                "goalId", "right-goal")))),
                        (kind, goalId) -> "left-goal".equals(goalId)
                                ? Set.of("left-goal", "shared-goal")
                                : Set.of("right-goal", "shared-goal")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Conflicting overlapping goal references")
                .hasMessageContaining("left-goal")
                .hasMessageContaining("right-goal");
    }

    @Test
    void keepsDirectGoalEntrySpecificityFailClosedAgainstAncestorSubtree() {
        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.merge(
                        List.of(
                                Map.of(
                                        "kind", "structure",
                                        "id", "course-gk",
                                        "label", "Mathematik GK",
                                        "children", List.of(Map.of(
                                                "kind", "goalEntry",
                                                "goalId", "narrow-goal"))),
                                Map.of(
                                        "kind", "structure",
                                        "id", "course-lk",
                                        "label", "Mathematik LK",
                                        "children", List.of(Map.of(
                                                "kind", "canonicalSubtree",
                                                "goalId", "broad-goal")))),
                        (kind, goalId) -> "broad-goal".equals(goalId)
                                ? Set.of("broad-goal", "narrow-goal")
                                : Set.of(goalId)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Conflicting overlapping goal references")
                .hasMessageContaining("narrow-goal")
                .hasMessageContaining("broad-goal");
    }

    @Test
    void keepsNestedSubtreesWithDifferentProjectionRolesExplicit() {
        List<Map<String, Object>> merged = CourseProfileCompositionViewMerger.merge(
                List.of(
                        Map.of(
                                "kind", "structure",
                                "id", "course-gk",
                                "label", "Mathematik GK",
                                "children", List.of(Map.of(
                                        "kind", "canonicalSubtree",
                                        "goalId", "narrow-goal",
                                        "projectionRole", "target"))),
                        Map.of(
                                "kind", "structure",
                                "id", "course-lk",
                                "label", "Mathematik LK",
                                "children", List.of(Map.of(
                                        "kind", "canonicalSubtree",
                                        "goalId", "broad-goal",
                                        "projectionRole", "prerequisiteOnly")))),
                (kind, goalId) -> "broad-goal".equals(goalId)
                        ? Set.of("broad-goal", "narrow-goal")
                        : Set.of(goalId));

        assertThat(merged).singleElement().satisfies(root -> {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> children = (List<Map<String, Object>>) root.get("children");
            assertThat(children)
                    .extracting(child -> child.get("goalId"))
                    .containsExactly("narrow-goal", "broad-goal");
            assertThat(children)
                    .extracting(child -> child.get("projectionRole"))
                    .containsExactly("target", "prerequisiteOnly");
        });
    }
}
