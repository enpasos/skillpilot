package com.skillpilot.backend.composition;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class CourseProfileCompositionViewMergerTest {

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
}
