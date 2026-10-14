// SPDX-License-Identifier: Apache-2.0
package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class CombinedCourseProfilePrerequisiteRouteTest {
    private static final Map<String, List<String>> GRAPH = Map.of(
            "broad", List.of("narrow", "other"), "narrow", List.of("leaf"),
            "leaf", List.of(), "other", List.of());

    @Test
    void combinedProfileShowsSharedPrerequisiteOnceWhenOneProfileUsesBroaderSubtree(@TempDir Path root)
            throws Exception {
        var gk = structure("q2-gk", List.of(reference("canonicalSubtree", "narrow")));
        var lk = structure("q2-lk", List.of(reference("canonicalSubtree", "broad")));
        var service = fixture(root, List.of(gk), List.of(lk));

        var combined = nodes(service.findMatchingView("test", scope("GK+LK")));
        assertThat(visibleOccurrences(combined)).containsExactlyInAnyOrder("broad", "narrow", "leaf", "other");
        assertThat(nodes(service.findMatchingView("test", scope("GK")))).containsExactly(gk);
        assertThat(nodes(service.findMatchingView("test", scope("LK")))).containsExactly(lk);
    }

    @Test
    void removesRedundantDirectTargetFromOtherBranchAndPrunesItsEmptyWrapper(@TempDir Path root)
            throws Exception {
        var primary = structure("primary", List.of(reference("goalEntry", "leaf")));
        var advanced = structure("advanced", List.of(reference("canonicalSubtree", "broad")));
        var service = fixture(root, List.of(primary), List.of(advanced));

        var combined = nodes(service.findMatchingView("test", scope("GK+LK")));
        assertThat(visibleOccurrences(combined)).containsExactlyInAnyOrder("broad", "narrow", "leaf", "other");
        assertThat(combined).extracting(node -> node.get("id")).containsExactly("advanced");
        assertThat(nodes(service.findMatchingView("test", scope("GK")))).containsExactly(primary);
    }

    @Test
    void retainsCommonDirectPrerequisiteOnlyExclusion(@TempDir Path root) throws Exception {
        var broad = reference("canonicalSubtree", "broad");
        var excluded = new LinkedHashMap<>(reference("goalEntry", "leaf"));
        excluded.put("projectionRole", "prerequisiteOnly");
        var service = fixture(root, List.of(broad, excluded), List.of(broad, excluded));

        assertThat(nodes(service.findMatchingView("test", scope("GK+LK"))))
                .containsExactly(broad, excluded);
    }

    @Test
    void rejectsOverlappingTargetsWhenAuthoredPresentationPreventsLosslessDedup(@TempDir Path root)
            throws Exception {
        var narrow = new LinkedHashMap<>(reference("canonicalSubtree", "narrow"));
        narrow.put("displayLabel", "Authored context");
        var service = fixture(root, List.of(structure("primary", List.of(narrow))),
                List.of(structure("advanced", List.of(reference("canonicalSubtree", "broad")))));
        assertThatThrownBy(() -> service.findMatchingView("test", scope("GK+LK")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Conflicting overlapping goal references");
    }

    @Test
    void rejectsPartiallyOverlappingCanonicalTargetsUnderDifferentParents(@TempDir Path root)
            throws Exception {
        var graph = Map.of("left", List.of("shared", "left-only"),
                "right", List.of("shared", "right-only"), "shared", List.<String>of(),
                "left-only", List.<String>of(), "right-only", List.<String>of());
        var service = fixture(root, List.of(structure("primary", List.of(reference("canonicalSubtree", "left")))),
                List.of(structure("advanced", List.of(reference("canonicalSubtree", "right")))), graph);
        assertThatThrownBy(() -> service.findMatchingView("test", scope("GK+LK")))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Conflicting overlapping goal references");
    }

    private static CompositionViewService fixture(Path root, List<Map<String, Object>> gk,
            List<Map<String, Object>> lk) throws Exception {
        return fixture(root, gk, lk, GRAPH);
    }

    private static CompositionViewService fixture(Path root, List<Map<String, Object>> gk,
            List<Map<String, Object>> lk, Map<String, List<String>> graph) throws Exception {
        var mapper = new ObjectMapper();
        var dir = root.resolve("DE/Gymnasium/composition-views/mathematik");
        Files.createDirectories(dir);
        mapper.writeValue(dir.resolve("gk.view.json").toFile(), Map.of(
                "viewId", "gk", "landscapeId", "test", "scope", scope("GK"), "rootNodes", gk));
        mapper.writeValue(dir.resolve("lk.view.json").toFile(), Map.of(
                "viewId", "lk", "landscapeId", "test", "scope", scope("LK"), "rootNodes", lk));
        var properties = new LandscapeProperties();
        properties.setDirectory(root.toString());
        return new CompositionViewService(properties, mapper, () -> graph);
    }

    private static Map<String, String> scope(String course) {
        return Map.of("schoolForm", "Gymnasium", "stage", "SekII", "courseProfile", course);
    }

    private static Map<String, Object> structure(String id, List<Map<String, Object>> children) {
        return Map.of("kind", "structure", "id", id, "children", children);
    }

    private static Map<String, Object> reference(String kind, String goal) {
        return Map.of("kind", kind, "goalId", goal);
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> nodes(Map<String, Object> view) {
        return (List<Map<String, Object>>) view.get("rootNodes");
    }

    private static List<String> visibleOccurrences(List<Map<String, Object>> nodes) {
        var result = new ArrayList<String>();
        for (var node : nodes) {
            if ("structure".equals(node.get("kind"))) {
                result.addAll(visibleOccurrences(nodes(Map.of("rootNodes", node.get("children")))));
            } else if (!"prerequisiteOnly".equals(node.get("projectionRole"))) {
                var goal = String.valueOf(node.get("goalId"));
                if ("canonicalSubtree".equals(node.get("kind"))) appendSubtree(goal, result);
                else result.add(goal);
            }
        }
        return result;
    }

    private static void appendSubtree(String goal, List<String> result) {
        result.add(goal);
        for (String child : GRAPH.getOrDefault(goal, List.of())) appendSubtree(child, result);
    }
}
