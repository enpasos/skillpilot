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

    private static Map<String, Object> orderedStructure(String id, List<Map<String, Object>> children,
            List<Map<String, Object>> after) {
        return Map.of("kind", "structure", "id", id, "label", "Themen", "children", children,
                "childOrder", Map.of("after", after));
    }

    private static Map<String, Object> orderPair(String unit, String after) {
        return Map.of("unit", unit, "after", after);
    }

    private static List<Map<String, Object>> orderChildren() {
        return List.of("a", "b", "c", "d").stream().map(id -> Map.<String, Object>of(
                "kind", "structure", "id", id, "label", id,
                "children", List.of(Map.of("kind", "goalEntry", "goalId", id + "-goal")))).toList();
    }

    @Test
    void explicitChildOrdersMapProfileAliasesAndReduceTheCombinedDag() {
        Map<String, Object> lower = Map.of("kind", "structure", "id", "lower", "label", "Lower",
                "children", List.of(Map.of("kind", "goalEntry", "goalId", "first")));
        Map<String, Object> upperGk = Map.of("kind", "structure", "id", "upper-gk", "label", "Upper GK",
                "children", List.of(Map.of("kind", "goalEntry", "goalId", "gk")));
        Map<String, Object> upperLk = Map.of("kind", "structure", "id", "upper-lk", "label", "Upper LK",
                "children", List.of(Map.of("kind", "goalEntry", "goalId", "lk")));
        var aliases = CourseProfileCompositionViewMerger.merge(List.of(
                orderedStructure("root", List.of(lower, upperGk), List.of(orderPair("upper-gk", "lower"))),
                orderedStructure("root", List.of(lower, upperLk), List.of(orderPair("upper-lk", "lower")))));
        assertThat(aliases.getFirst().get("childOrder"))
                .isEqualTo(Map.of("after", List.of(orderPair("upper-gk-lk", "lower"))));

        var merged = CourseProfileCompositionViewMerger.merge(List.of(
                orderedStructure("topics", orderChildren(), List.of(orderPair("b", "a"), orderPair("c", "b"))),
                orderedStructure("topics", orderChildren(), List.of(orderPair("c", "a"), orderPair("d", "a")))));
        assertThat(merged.getFirst().get("childOrder"))
                .isEqualTo(Map.of("after", List.of(orderPair("b", "a"), orderPair("c", "b"), orderPair("d", "a"))));
    }

    @Test
    void explicitChildOrderConflictsAndMalformedSourcesFailClosed() {
        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.merge(List.of(
                orderedStructure("topics", orderChildren(), List.of(orderPair("b", "a"))),
                orderedStructure("topics", orderChildren(), List.of(orderPair("a", "b"))))))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("cyclic composition childOrder");
        var implicit = new LinkedHashMap<>(orderedStructure("topics", orderChildren(), List.of()));
        implicit.remove("childOrder");
        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.merge(List.of(
                orderedStructure("topics", orderChildren(), List.of()), implicit)))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("explicit and implicit");
        for (List<Map<String, Object>> pairs : List.of(
                List.of(orderPair("missing", "a")), List.of(orderPair("topics", "a")),
                List.of(orderPair("a", "a")), List.of(orderPair("b", "a"), orderPair("b", "a")),
                List.of(orderPair("a", "b"), orderPair("b", "a")),
                List.of(orderPair("b", "a"), orderPair("c", "b"), orderPair("c", "a")))) {
            assertThatThrownBy(() -> CourseProfileCompositionViewMerger.merge(List.of(
                    orderedStructure("topics", orderChildren(), pairs))))
                    .isInstanceOf(IllegalStateException.class).hasMessageContaining("composition childOrder");
        }
    }

    @Test
    void explicitChildOrderRetainsReachabilityWhenDeduplicationRemovesAnIntermediate() {
        var children = List.of(
                orderedStructure("a", List.of(Map.of("kind", "goalEntry", "goalId", "a-goal")), List.of()),
                orderedStructure("b", List.of(Map.of("kind", "goalEntry", "goalId", "leaf")), List.of()),
                orderedStructure("c", List.of(Map.of("kind", "goalEntry", "goalId", "c-goal")), List.of()));
        var source = orderedStructure("topics", children, List.of(orderPair("b", "a"), orderPair("c", "b")));
        var broad = orderedStructure("topics", List.of(Map.of("kind", "canonicalSubtree", "goalId", "broad")), List.of());
        var merged = CourseProfileCompositionViewMerger.mergeViews(List.of(List.of(source), List.of(broad)),
                Map.of("a-goal", List.of(), "c-goal", List.of(), "leaf", List.of(), "broad", List.of("leaf")), true);
        assertThat(merged.getFirst().get("childOrder")).isEqualTo(Map.of("after", List.of(orderPair("c", "a"))));
    }

    @Test
    void targetDominanceRemovesAcquisitionFlagsInBothSourceOrders() {
        Map<String, Object> support = Map.of("kind", "goalEntry", "goalId", "leaf",
                "projectionRole", "prerequisiteOnly", "acquisitionPlacement", true);
        Map<String, Object> target = Map.of("kind", "goalEntry", "goalId", "leaf", "projectionRole", "target");
        for (var sources : List.of(List.of(support, target), List.of(target, support))) {
            assertThat(CourseProfileCompositionViewMerger.merge(sources)).singleElement().satisfies(node ->
                    assertThat(node).containsEntry("projectionRole", "target").doesNotContainKey("acquisitionPlacement"));
        }
    }

    @Test
    void unlabelledAcquisitionTemplatePreservesTargetLabelAndStillRejectsConflictingLabels() {
        Map<String, Object> support = Map.of("kind", "goalEntry", "goalId", "leaf",
                "projectionRole", "prerequisiteOnly", "acquisitionPlacement", true);
        Map<String, Object> target = Map.of("kind", "canonicalSubtree", "goalId", "leaf",
                "projectionRole", "target", "displayLabel", "Vektorprodukt definieren");
        for (var sources : List.of(List.of(support, target), List.of(target, support))) {
            assertThat(CourseProfileCompositionViewMerger.merge(sources)).singleElement().satisfies(node ->
                    assertThat(node).containsEntry("projectionRole", "target")
                            .containsEntry("displayLabel", "Vektorprodukt definieren")
                            .doesNotContainKey("acquisitionPlacement"));
        }
        var conflictingTarget = Map.<String, Object>of("kind", "goalEntry", "goalId", "leaf",
                "projectionRole", "target", "displayLabel", "Anderer Zieltext");
        var conflictingTemplate = Map.<String, Object>of("kind", "goalEntry", "goalId", "leaf",
                "projectionRole", "prerequisiteOnly", "acquisitionPlacement", true, "displayLabel", "Anderer Zieltext");
        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.merge(List.of(target, conflictingTarget)))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.merge(List.of(conflictingTemplate, target)))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void prerequisiteLeafRetainsExplicitAcquisitionWithoutPromotingItToATargetOrCluster() {
        Map<String, Object> marked = Map.of("kind", "goalEntry", "goalId", "leaf",
                "projectionRole", "prerequisiteOnly", "acquisitionPlacement", true);
        Map<String, Object> unmarked = Map.of("kind", "goalEntry", "goalId", "leaf", "projectionRole", "prerequisiteOnly");
        for (var sources : List.of(List.of(marked, unmarked), List.of(unmarked, marked))) {
            assertThat(CourseProfileCompositionViewMerger.merge(sources)).singleElement().satisfies(node ->
                    assertThat(node).containsEntry("projectionRole", "prerequisiteOnly").containsEntry("acquisitionPlacement", true));
        }
        Map<String, Object> subtree = Map.of("kind", "canonicalSubtree", "goalId", "leaf", "projectionRole", "prerequisiteOnly");
        assertThat(CourseProfileCompositionViewMerger.merge(List.of(marked, subtree))).singleElement().satisfies(node ->
                assertThat(node).containsEntry("kind", "canonicalSubtree").containsEntry("projectionRole", "prerequisiteOnly")
                        .doesNotContainKey("acquisitionPlacement"));
        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.merge(List.of(Map.of(
                "kind", "goalEntry", "goalId", "leaf", "projectionRole", "target", "acquisitionPlacement", true))))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("acquisitionPlacement");
    }

    @Test
    void broadSupportDoesNotEraseAnExplicitPrerequisiteAcquisitionPlace() {
        Map<String, Object> marked = Map.of("kind", "goalEntry", "goalId", "leaf",
                "projectionRole", "prerequisiteOnly", "acquisitionPlacement", true);
        Map<String, Object> support = Map.of("kind", "canonicalSubtree", "goalId", "broad", "projectionRole", "prerequisiteOnly");
        var sources = List.of(List.of(orderedStructure("topic", List.of(marked), List.of()), support));
        var merged = CourseProfileCompositionViewMerger.mergeViews(sources,
                Map.of("leaf", List.of(), "broad", List.of("leaf")), true);
        assertThat(merged).hasSize(2);
        assertThat(merged.getFirst().get("children")).isEqualTo(List.of(marked));
    }

    @Test
    void acquisitionCapabilityStaysAtItsAuthoredPlaceAcrossGlobalLeafDeduplication() {
        Map<String, Object> unmarked = Map.of("kind", "goalEntry", "goalId", "leaf", "projectionRole", "prerequisiteOnly");
        Map<String, Object> marked = Map.of("kind", "goalEntry", "goalId", "leaf", "projectionRole", "prerequisiteOnly", "acquisitionPlacement", true);
        var early = orderedStructure("j7", List.of(unmarked, Map.of("kind", "goalEntry", "goalId", "early-target")), List.of());
        var later = orderedStructure("q3", List.of(marked), List.of());
        for (var sources : List.of(List.of(early, later), List.of(later, early))) {
            var merged = CourseProfileCompositionViewMerger.mergeViews(List.of(sources, sources),
                    Map.of("leaf", List.of(), "early-target", List.of()), true);
            assertThat(merged).filteredOn(node -> "j7".equals(node.get("id"))).singleElement().satisfies(node ->
                    assertThat(node.get("children")).isEqualTo(List.of(Map.of("kind", "goalEntry", "goalId", "early-target"))));
            assertThat(merged).filteredOn(node -> "q3".equals(node.get("id"))).singleElement().satisfies(node ->
                    assertThat(node.get("children")).isEqualTo(List.of(marked)));
        }
    }

    @Test
    void duplicateStructureIdentityUnderDistinctParentsFailsClosedWithoutMergingByTitle() {
        var left = orderedStructure("preserved-18", List.of(orderedStructure("shared-topic",
                List.of(Map.of("kind", "goalEntry", "goalId", "gk-target")), List.of())), List.of());
        var right = orderedStructure("preserved-21", List.of(orderedStructure("shared-topic",
                List.of(Map.of("kind", "goalEntry", "goalId", "lk-target")), List.of())), List.of());
        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.mergeViews(List.of(List.of(left), List.of(right)),
                Map.of("gk-target", List.of(), "lk-target", List.of())))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Duplicate global composition structure ID");
        var differentIdentity = orderedStructure("preserved-21", List.of(orderedStructure("other-topic",
                List.of(Map.of("kind", "goalEntry", "goalId", "lk-target")), List.of())), List.of());
        assertThat(CourseProfileCompositionViewMerger.mergeViews(List.of(List.of(left), List.of(differentIdentity)),
                Map.of("gk-target", List.of(), "lk-target", List.of()))).hasSize(2);
    }

    private static final Map<String, List<String>> ROLE_GRAPH = Map.of(
            "root", List.of("branch", "shared"),
            "branch", List.of("advanced", "support"),
            "shared", List.of(), "advanced", List.of(), "support", List.of(),
            "unreferenced", List.of());

    private static Map<String, Object> reference(String kind, String id, String role) {
        return Map.of("kind", kind, "goalId", id, "projectionRole", role);
    }

    @Test
    void actualTargetPlacementWinsOverASupportHintInEitherTraversalOrder() {
        var hint = Map.<String, Object>of("kind", "structure", "id", "early-hint", "label", "Hint",
                "children", List.of(reference("goalEntry", "shared", "prerequisiteOnly")));
        var target = Map.<String, Object>of("kind", "structure", "id", "authored-late-target", "label", "Target",
                "children", List.of(reference("goalEntry", "shared", "target")));
        for (var source : List.of(List.of(hint, target), List.of(target, hint))) {
            assertThat(CourseProfileCompositionViewMerger.mergeViews(List.of(source), ROLE_GRAPH))
                    .filteredOn(node -> !((List<?>) node.get("children")).isEmpty())
                    .containsExactly(target);
            assertThat(CourseProfileCompositionViewMerger.mergeViews(source.stream().map(List::of).toList(), ROLE_GRAPH))
                    .filteredOn(node -> !((List<?>) node.get("children")).isEmpty())
                    .containsExactly(target);
        }
        assertThat(hint.get("children")).isEqualTo(List.of(reference("goalEntry", "shared", "prerequisiteOnly")));
    }

    @Test
    void duplicateTrueTargetsKeepTheirExistingAuthoredPrecedence() {
        var early = Map.<String, Object>of("kind", "structure", "id", "true-early", "label", "Early",
                "children", List.of(reference("goalEntry", "shared", "target")));
        var late = Map.<String, Object>of("kind", "structure", "id", "true-late", "label", "Late",
                "children", List.of(reference("goalEntry", "shared", "target")));
        assertThat(CourseProfileCompositionViewMerger.mergeViews(List.of(List.of(late, early)), ROLE_GRAPH))
                .filteredOn(node -> !((List<?>) node.get("children")).isEmpty()).containsExactly(late);
        assertThat(CourseProfileCompositionViewMerger.mergeViews(List.of(List.of(early, late)), ROLE_GRAPH))
                .filteredOn(node -> !((List<?>) node.get("children")).isEmpty()).containsExactly(early);
        // In particular, an already carried late target is never moved early
        // merely because another goal needs it; that backflow remains visible.
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
        String mathematicsLandscapeId = mapper.readTree(curricula.resolve(
                "canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json").toFile())
                .path("landscapeId").asText();
        String physicsLandscapeId = mapper.readTree(curricula.resolve(
                "canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json").toFile())
                .path("landscapeId").asText();
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
        int physicsViews = 0;
        try (var files = Files.walk(curricula.resolve("composition-views"))) {
            for (Path file : files.filter(path -> path.toString().endsWith(".view.json")).sorted().toList()) {
                Map<String, Object> view = mapper.readValue(file.toFile(), new TypeReference<>() {});
                if (physicsLandscapeId.equals(view.get("landscapeId"))) physicsViews++;
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
        int physicsPairs = 0;
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
            if (entry.getKey().startsWith(mathematicsLandscapeId + "|")) {
                assertThat(CourseProfileCompositionViewMerger.mergeViews(sources, graph, true))
                        .as(entry.getKey() + " package subtree deduplication").isNotEmpty();
            }
            if (entry.getKey().startsWith(physicsLandscapeId + "|")) {
                // The source schema and a single-profile projection cannot
                // catch one stable unit being packed under different parents
                // in GK and LK. Exercise the real merged global-ID/role/order
                // guards in both traversal orders and both consumer modes.
                for (var order : List.of(sources, List.of(sources.get(1), sources.get(0)))) {
                    for (boolean deduplicate : new boolean[] {false, true}) {
                        var physicsMerged = CourseProfileCompositionViewMerger.mergeViews(order, graph, deduplicate);
                        assertThat(physicsMerged)
                                .as(entry.getKey() + " traversal=" + (order == sources ? "LK/GK" : "GK/LK")
                                        + " subtreeDeduplication=" + deduplicate).isNotEmpty();
                        if (entry.getKey().contains("jurisdiction=DE-HE")) {
                            assertNoEmptyContextUnits(physicsMerged);
                        }
                        if (!entry.getKey().contains("jurisdiction=") || entry.getKey().contains("jurisdiction=DE,")) {
                            assertFlatCanonicalExaminations(physicsMerged);
                        }
                    }
                }
                physicsPairs++;
            }
            assertThat(mapper.writeValueAsString(sources)).as(entry.getKey() + " source immutability")
                    .isEqualTo(before);
            checked++;
        }
        assertThat(checked).as("All currently authored exact GK/LK scope pairs").isGreaterThanOrEqualTo(96);
        assertThat(physicsViews).as("Complete authored Physics stage-view inventory").isEqualTo(90);
        assertThat(physicsPairs).as("Every exact Physics GK/LK scope pair").isEqualTo(36);
    }

    @SuppressWarnings("unchecked")
    private static void assertNoEmptyContextUnits(List<Map<String, Object>> nodes) {
        for (var node : nodes) {
            if (!"structure".equals(node.get("kind"))) continue;
            var children = (List<Map<String, Object>>) node.get("children");
            if (node.get("id").toString().startsWith("physics-context-acquisition-")) {
                assertThat(children).as("No empty filtered-course preparation shell: " + node.get("id")).isNotEmpty();
            }
            assertNoEmptyContextUnits(children);
        }
    }

    @SuppressWarnings("unchecked")
    private static void assertFlatCanonicalExaminations(List<Map<String, Object>> nodes) {
        for (var node : nodes) {
            if (!"structure".equals(node.get("kind"))) continue;
            var children = (List<Map<String, Object>>) node.get("children");
            if ("physics-abitur".equals(node.get("id"))) {
                assertThat(children).as("Exact canonical atomic examination collection").allSatisfy(child ->
                        assertThat(child.get("kind")).isNotEqualTo("structure"));
                assertThat(children.stream().filter(child -> !"prerequisiteOnly".equals(child.get("projectionRole"))).toList())
                        .as("All eight GK and eight LK examination atoms").hasSize(16);
            }
            assertFlatCanonicalExaminations(children);
        }
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
    void graphVerifiedDeduplicationRetainsBroaderPlacementAndPrunesNewlyEmptyWrappers() {
        List<List<Map<String, Object>>> sources = List.of(
                List.of(Map.of("kind", "structure", "id", "course-gk", "children", List.of(
                        Map.of("kind", "structure", "id", "methods", "children", List.of(
                                Map.of("kind", "goalEntry", "goalId", "leaf")))))),
                List.of(Map.of("kind", "structure", "id", "course-lk", "children", List.of(
                        Map.of("kind", "canonicalSubtree", "goalId", "broad")))));
        Map<String, List<String>> graph = Map.of("broad", List.of("leaf"), "leaf", List.of());

        List<Map<String, Object>> merged = CourseProfileCompositionViewMerger.mergeViews(sources, graph, true);

        assertThat(merged).singleElement().satisfies(root -> {
            assertThat(root).containsEntry("id", "course-gk-lk");
            assertThat(root.get("children"))
                    .isEqualTo(List.of(Map.of("kind", "canonicalSubtree", "goalId", "broad")));
        });
    }

    @Test
    void graphVerifiedDeduplicationKeepsDirectClusterEntriesOpaque() {
        List<List<Map<String, Object>>> sources = List.of(
                List.of(Map.of("kind", "goalEntry", "goalId", "cluster")),
                List.of(Map.of("kind", "canonicalSubtree", "goalId", "broad")));
        Map<String, List<String>> graph = Map.of(
                "broad", List.of("cluster"),
                "cluster", List.of("leaf"),
                "leaf", List.of());

        assertThatThrownBy(() -> CourseProfileCompositionViewMerger.mergeViews(sources, graph, true))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Conflicting overlapping goal references");
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
