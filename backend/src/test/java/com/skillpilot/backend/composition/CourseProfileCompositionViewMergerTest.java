package com.skillpilot.backend.composition;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;
import java.util.Map;
import java.util.Set;
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
