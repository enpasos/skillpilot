package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.CompletionProfileCompiler;
import com.skillpilot.backend.composition.CourseProfileCompositionViewMerger;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.landscape.LandscapeService;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.test.util.ReflectionTestUtils;

class CompositionViewServiceMergedProjectionTest {
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String OVERVIEW = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final LandscapeProperties PROPERTIES = new LandscapeProperties();
    private static SkillLandscape landscape;
    private static Map<String, LearningGoal> goals;
    private static Map<String, List<String>> contains;

    @BeforeAll
    static void loadCanonicalFixture() throws Exception {
        Path curricula = Path.of("../curricula").toAbsolutePath().normalize();
        PROPERTIES.setDirectory(curricula.toString());
        landscape = MAPPER.readValue(curricula.resolve(
                "DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json").toFile(), SkillLandscape.class);
        goals = landscape.getGoals().stream().collect(Collectors.toMap(
                LearningGoal::getId, goal -> goal, (a, b) -> a, TreeMap::new));
        contains = new TreeMap<>();
        goals.forEach((id, goal) -> contains.put(id, goal.getContains()));
    }

    @ParameterizedTest
    @CsvSource({"CrossStage,G8", "CrossStage,G9", "SekII,G8", "SekII,G9"})
    void actualHessianCourseUnionPreservesProjectionAndRequirementsWithUniqueVisiblePaths(
            String stage, String duration) throws Exception {
        var views = new CompositionViewService(PROPERTIES, MAPPER, () -> contains);
        var service = learnerService(views);
        var gkScope = scope(stage, duration, "GK");
        var lkScope = scope(stage, duration, "LK");
        Map<String, Object> gk = views.findLearnerScopeView(MATH, gkScope);
        Map<String, Object> lk = views.findLearnerScopeView(MATH, lkScope);
        String sourceBytes = MAPPER.writeValueAsString(List.of(gk, lk));
        var gkProjection = projection(service, gkScope);
        var lkProjection = projection(service, lkScope);
        Set<String> expectedTargets = union(gkProjection.targets(), lkProjection.targets());
        Set<String> expectedSupport = union(gkProjection.support(), lkProjection.support());
        expectedSupport.removeAll(expectedTargets);

        var combinedScope = scope(stage, duration, "GK+LK");
        Map<String, Object> combined = views.findLearnerScopeView(MATH, combinedScope);
        var projected = projection(service, combinedScope);
        assertThat(projected.targets()).isEqualTo(expectedTargets);
        assertThat(projected.support()).isEqualTo(expectedSupport);
        assertThat(projected.structural()).isEqualTo(goals);

        // This is the formerly shipped repository result. It preserves sets
        // but duplicates visible paths, so a flat visibleGoals map cannot catch it.
        var oldView = new LinkedHashMap<>(combined);
        oldView.put("rootNodes", CourseProfileCompositionViewMerger.mergeViews(
                List.of(roots(lk), roots(gk)), contains));
        var oldViews = fixedView(oldView);
        var oldService = learnerService(oldViews);
        var prior = projection(oldService, combinedScope);
        assertThat(prior.targets()).isEqualTo(projected.targets());
        assertThat(prior.support()).isEqualTo(projected.support());
        assertThat(directRequirements(prior.structural())).isEqualTo(directRequirements(projected.structural()));
        assertThat(normalized(oldService.computeEffectiveRequires(prior.structural())))
                .isEqualTo(normalized(service.computeEffectiveRequires(projected.structural())));
        assertThat(completionContext(prior)).isEqualTo(completionContext(projected));

        var oldPaths = visiblePaths(roots(oldView), prior);
        assertThat(oldPaths.values()).anySatisfy(paths -> assertThat(paths).hasSizeGreaterThan(1));
        var actualPaths = visiblePaths(roots(combined), projected);
        assertThat(actualPaths.keySet()).isEqualTo(projected.targets());
        actualPaths.forEach((id, paths) -> assertThat(paths).as(id + " visible paths").hasSize(1));

        // Exact course requests still return their authored documents, not the union.
        assertThat(MAPPER.writeValueAsString(List.of(
                views.findLearnerScopeView(MATH, gkScope), views.findLearnerScopeView(MATH, lkScope))))
                .isEqualTo(sourceBytes);
        assertThat(projected.visible().keySet()).containsAll(projected.targets());
    }

    @ParameterizedTest
    @CsvSource({"CrossStage,G8", "CrossStage,G9", "SekII,G8", "SekII,G9"})
    void hessianFocusRootsRemainAccessibleWithoutAliasingPrunedWrappers(String stage, String duration) {
        var views = new CompositionViewService(PROPERTIES, MAPPER, () -> contains);
        var combinedScope = scope(stage, duration, "GK+LK");
        Map<String, Object> combined = views.findLearnerScopeView(MATH, combinedScope);
        var projected = projection(learnerService(views), combinedScope);
        String viewId = (String) combined.get("viewId");
        for (String removed : List.of("q21-common-functions", "q24-gk-fixed-vectors",
                "q24-gk-transition-processes", "q25-gk-selected-matrix-mappings")) {
            String id = "composition:" + viewId + ":structure:" + removed;
            assertThat(views.resolveStructureReference(id)).as("No broadened alias for " + removed).isNull();
            assertThat(views.findLearnerFacingFocusAncestors(viewId, id, goals)).isEmpty();
        }
        // The broader canonical roots were already selected by LK. Their
        // canonical identities remain valid focus roots in the combined offering.
        for (String root : List.of("5ebfc509-0b4c-5c60-befb-2477eb24d4b5",
                "d6d8904c-896f-5850-8181-06c223346b80", "b3d2284c-21e0-5af8-942a-a4c11390c84a")) {
            assertThat(projected.targets()).contains(root);
            assertThat(views.findLearnerFacingFocusAncestors(viewId, root, goals)).isNotEmpty();
        }
        // A surviving authored folder may lose redundant children; it must
        // never gain a broader scope under the same persisted structure ID.
        Map<String, Object> gk = views.findLearnerScopeView(MATH, scope(stage, duration, "GK"));
        Map<String, Object> lk = views.findLearnerScopeView(MATH, scope(stage, duration, "LK"));
        var oldView = new LinkedHashMap<>(combined);
        oldView.put("rootNodes", CourseProfileCompositionViewMerger.mergeViews(
                List.of(roots(lk), roots(gk)), contains));
        var oldViews = fixedView(oldView);
        var oldService = learnerService(oldViews);
        var prior = projection(oldService, combinedScope);
        var currentService = learnerService(views);
        for (String structureId : structureIds(roots(oldView))) {
            String id = "composition:" + viewId + ":structure:" + structureId;
            Set<String> oldTargets = historicalRawStructureTargetMembers(oldViews, id, prior);
            List<String> currentTargets = ReflectionTestUtils.invokeMethod(currentService,
                    "resolveProjectedFocusTargetIds", id, projected.nativeProjection());
            assertThat(oldTargets).as("No scope expansion for " + structureId).containsAll(currentTargets);
        }
    }

    /**
     * Historical membership before the placement-bound resolver. Do not run the new
     * selected-path resolver on the deliberately duplicated former tree to define
     * the old contract. This reference matches the independently executed original
     * Root resolver (768 targets / 642 atoms for both current SekII durations).
     */
    private static Set<String> historicalRawStructureTargetMembers(
            CompositionViewService oldViews,
            String reference,
            Projection prior) {
        var resolution = oldViews.resolveStructureReference(reference);
        if (resolution == null) {
            return Set.of();
        }
        Set<String> activeViews = ReflectionTestUtils.invokeMethod(prior.nativeProjection(), "compositionViewIds");
        assertThat(activeViews).contains(resolution.viewId());
        Set<String> expanded = new TreeSet<>();
        var pending = new java.util.ArrayDeque<>(resolution.referencedGoalIds());
        while (!pending.isEmpty()) {
            String id = pending.removeFirst();
            if (!prior.structural().containsKey(id) && id.contains(":")) {
                id = id.substring(id.indexOf(':') + 1);
            }
            assertThat(prior.structural()).as("Historical authored reference %s", id).containsKey(id);
            if (!expanded.add(id)) {
                continue;
            }
            LearningGoal goal = prior.structural().get(id);
            if (goal.getContains() != null) {
                pending.addAll(goal.getContains());
            }
        }
        expanded.retainAll(prior.targets());
        return expanded;
    }

    private static LearnerService learnerService(CompositionViewService views) {
        var landscapes = mock(LandscapeService.class);
        when(landscapes.getById(MATH)).thenReturn(landscape);
        return new LearnerService(null, null, null, null, landscapes, null, null,
                views, MAPPER, null, null, null);
    }

    private static Projection projection(LearnerService service, Map<String, String> scope) {
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("filterId", scope.get("courseProfile"));
        config.put("stage", scope.get("stage"));
        config.put("durationModel", scope.get("durationModel"));
        Object result = ReflectionTestUtils.invokeMethod(service, "applyCompositionViewProjection",
                MATH, goals, goals, Map.of(MATH, config, OVERVIEW, Map.of(
                        "filterId", "DE-HE", "stage", scope.get("stage"),
                        "durationModel", scope.get("durationModel"))), List.of(landscape));
        return new Projection(ReflectionTestUtils.invokeMethod(result, "targetGoalIds"),
                ReflectionTestUtils.invokeMethod(result, "prerequisiteOnlyGoalIds"),
                ReflectionTestUtils.invokeMethod(result, "structuralGoals"),
                ReflectionTestUtils.invokeMethod(result, "visibleGoals"), result);
    }

    private static CompositionViewService fixedView(Map<String, Object> view) {
        return new CompositionViewService(PROPERTIES, MAPPER) {
            @Override public Map<String, Object> findLearnerScopeView(String id, Map<String, String> scope) { return view; }
            @Override public Map<String, Object> findViewById(String id) { return view; }
        };
    }

    private static Map<String, Object> completionContext(Projection projection) {
        Set<String> atoms = projection.targets().stream().filter(id -> contains.get(id).isEmpty())
                .collect(Collectors.toCollection(TreeSet::new));
        var graph = new CompletionProfileCompiler().compileAutomatic(
                projection.structural(), atoms, atoms, "hessian-service-union-regression");
        Map<String, List<String>> edges = new TreeMap<>();
        graph.contextGoalIds().forEach(id -> edges.put(id, graph.directPrerequisites(id)));
        return Map.of("context", graph.contextGoalIds(), "protected", graph.protectedGoalIds(),
                "protectedTargets", graph.protectedTargetGoalIds(), "edges", normalized(edges));
    }

    private static Map<String, List<String>> directRequirements(Map<String, LearningGoal> structural) {
        Map<String, List<String>> result = new TreeMap<>();
        structural.forEach((id, goal) -> result.put(id, goal.getRequires()));
        return normalized(result);
    }

    private static Map<String, List<String>> normalized(Map<String, List<String>> requirements) {
        Map<String, List<String>> result = new TreeMap<>();
        requirements.forEach((id, refs) -> result.put(id, refs.stream()
                .map(ref -> ref.substring(ref.indexOf(':') + 1)).distinct().sorted().toList()));
        return result;
    }

    // Observe the service's actual tree; do not merge, select parents, or
    // calculate projection roles here. Native projection supplies the target set.
    private static Map<String, List<String>> visiblePaths(List<Map<String, Object>> nodes, Projection projection) {
        Map<String, List<String>> result = new TreeMap<>();
        visitNodes(nodes, projection, "root", result);
        return result;
    }

    private static void visitNodes(List<Map<String, Object>> nodes, Projection projection,
            String path, Map<String, List<String>> result) {
        for (int i = 0; i < nodes.size(); i++) {
            var node = nodes.get(i);
            String current = path + "/" + i;
            if ("structure".equals(node.get("kind"))) {
                visitNodes(rootsOf(node), projection, current, result);
            } else if (!"prerequisiteOnly".equals(node.get("projectionRole"))) {
                visitGoal((String) node.get("goalId"), "canonicalSubtree".equals(node.get("kind")),
                        projection, current, result);
            }
        }
    }

    private static void visitGoal(String id, boolean subtree, Projection projection,
            String path, Map<String, List<String>> result) {
        if (!projection.targets().contains(id)) return;
        result.computeIfAbsent(id, ignored -> new ArrayList<>()).add(path);
        if (subtree) for (String child : contains.get(id)) visitGoal(child, true, projection, path + "/" + child, result);
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> roots(Map<String, Object> view) {
        return (List<Map<String, Object>>) view.get("rootNodes");
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> rootsOf(Map<String, Object> structure) {
        return (List<Map<String, Object>>) structure.get("children");
    }

    private static Set<String> union(Set<String> left, Set<String> right) {
        Set<String> result = new TreeSet<>(left);
        result.addAll(right);
        return result;
    }

    private static List<String> structureIds(List<Map<String, Object>> nodes) {
        List<String> result = new ArrayList<>();
        for (var node : nodes) if ("structure".equals(node.get("kind"))) {
            result.add((String) node.get("id"));
            result.addAll(structureIds(rootsOf(node)));
        }
        return result;
    }

    private static Map<String, String> scope(String stage, String duration, String course) {
        return Map.of("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "stage", stage,
                "durationModel", duration, "courseProfile", course);
    }

    private record Projection(Set<String> targets, Set<String> support,
            Map<String, LearningGoal> structural, Map<String, LearningGoal> visible, Object nativeProjection) { }
}
