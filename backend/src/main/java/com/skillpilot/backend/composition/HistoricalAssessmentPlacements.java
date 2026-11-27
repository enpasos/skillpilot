package com.skillpilot.backend.composition;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Compatibility metadata for the three previously placed Hessian Physics E.1 assessments. */
final class HistoricalAssessmentPlacements {
    static final String FIELD = "historicalAssessmentPlacements";
    static final String MIGRATION = "he-physik-e1-20261127";

    private static final String PHYSICS = "7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a";
    private static final Placement SERIES = new Placement("f41e4e30-794e-5ce4-ba5e-cc72712cd691",
            "physics-e1-accelerated-and-free-fall");
    private static final Placement PROTOCOL = new Placement("c6e2942d-1ff4-5e86-a52a-4ca4c8568291",
            "physics-he-ephase-cross-topic-assessments");
    private static final Placement SECOND_EXAM = new Placement("bcc56921-7107-5f5f-b721-3d5e0d7e1cd9",
            "physics-e1-two-motions");
    private static final List<Placement> EXTENSION_PLACEMENTS = List.of(SERIES, PROTOCOL);
    private static final Set<Placement> ALL_PLACEMENTS = Set.of(SERIES, PROTOCOL, SECOND_EXAM);

    private HistoricalAssessmentPlacements() {}

    record Placement(String goalId, String parentId) {}

    record Migration(String id, String groupId, String label, String labelEn) {}

    static Migration validate(Map<String, Object> view) {
        Map<String, Object> scope = CompositionViewExtensions.map(view.get("scope"));
        require(PHYSICS.equals(view.get("landscapeId")) && "Gymnasium".equals(scope.get("schoolForm"))
                        && "DE-HE".equals(scope.get("jurisdiction"))
                        && ("SekII".equals(scope.get("stage")) || "CrossStage".equals(scope.get("stage"))),
                "migration is restricted to Hessian Physics views with an upper stage");

        var marker = CompositionViewExtensions.map(view.get(FIELD));
        require(marker.keySet().equals(Set.of("migration", "extension", "legacyOnly"))
                && MIGRATION.equals(marker.get("migration")), "invalid migration record");

        var extension = CompositionViewExtensions.map(marker.get("extension"));
        require(extension.keySet().equals(Set.of("id", "groupId", "label", "labelEn", "placements"))
                        && "physics-he-e1-experimental-assessments".equals(extension.get("id"))
                        && "physics-he-skillpilot-extensions".equals(extension.get("groupId")),
                "invalid historical assessment extension");
        require(EXTENSION_PLACEMENTS.equals(CompositionViewExtensions.maps(extension.get("placements")).stream()
                .map(HistoricalAssessmentPlacements::placement).toList()), "unexpected assessment extension placements");
        require(SECOND_EXAM.equals(placement(CompositionViewExtensions.map(marker.get("legacyOnly")))),
                "unexpected legacy-only placement");

        Set<Placement> found = new LinkedHashSet<>();
        findPlacements(CompositionViewExtensions.maps(view.get("rootNodes")), null, false, found);
        require(found.equals(ALL_PLACEMENTS), "missing historical assessment placement");
        return new Migration(CompositionViewExtensions.identifier(extension, "id"),
                CompositionViewExtensions.identifier(extension, "groupId"),
                CompositionViewExtensions.field(extension, "label"), CompositionViewExtensions.field(extension, "labelEn"));
    }

    private static Placement placement(Map<String, Object> raw) {
        require(raw.keySet().equals(Set.of("goalId", "parentId")), "invalid assessment placement");
        return new Placement(CompositionViewExtensions.identifier(raw, "goalId"),
                CompositionViewExtensions.identifier(raw, "parentId"));
    }

    private static void findPlacements(List<Map<String, Object>> nodes, String parent, boolean insideExtension,
            Set<Placement> found) {
        for (var node : nodes) {
            if ("structure".equals(node.get("kind"))) {
                findPlacements(CompositionViewExtensions.maps(node.get("children")), (String) node.get("id"),
                        insideExtension || node.containsKey("extension"), found);
            } else if (ALL_PLACEMENTS.stream().anyMatch(placement -> placement.goalId().equals(node.get("goalId")))) {
                var placement = new Placement((String) node.get("goalId"), parent);
                require(!insideExtension && ALL_PLACEMENTS.contains(placement)
                        && ("canonicalSubtree".equals(node.get("kind")) || "goalEntry".equals(node.get("kind")))
                        && "target".equals(node.getOrDefault("projectionRole", "target")) && found.add(placement),
                        "changed or repeated historical assessment placement " + node.get("goalId"));
            }
        }
    }

    static boolean exclude(String parent, Object goal, boolean maximum) {
        var placement = new Placement(goal instanceof String id ? id : null, parent);
        return SECOND_EXAM.equals(placement) || (!maximum && EXTENSION_PLACEMENTS.contains(placement));
    }

    private static void require(boolean valid, String message) {
        if (!valid) throw new IllegalStateException(FIELD + ": " + message);
    }
}
