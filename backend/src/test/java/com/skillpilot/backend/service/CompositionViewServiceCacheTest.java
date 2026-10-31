package com.skillpilot.backend.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class CompositionViewServiceCacheTest {
    @TempDir Path directory;
    private final ObjectMapper mapper = new ObjectMapper();
    private static final String LANDSCAPE = "test-landscape";
    private static final String COMBINED = "merged:lk+gk";
    private static final Map<String, String> SCOPE = Map.of(
            "schoolForm", "Gymnasium", "stage", "SekII", "courseProfile", "GK+LK");

    @Test
    void sharesOnlyMergedRootsAcrossLookupsAndKeepsEachRequestedScopeEnvelope() throws IOException {
        var graph = roleGraph();
        writeRoleViews();
        // Production suppliers also return a new map for unchanged graph content.
        var service = service(() -> new LinkedHashMap<>(graph));
        var combined = service.findMatchingView(LANDSCAPE, SCOPE);
        var byId = service.findViewById(COMBINED);
        assertThat(roots(combined)).containsExactly(reference("root", "target"));
        assertThat(roots(byId)).isSameAs(roots(combined));
        assertThat(combined.get("scope")).isEqualTo(SCOPE);
        assertThat(byId.get("scope")).isEqualTo(scope("LK"));
        var otherScope = new LinkedHashMap<>(SCOPE);
        otherScope.put("jurisdiction", "DE-HE");
        var other = service.findMatchingView(LANDSCAPE, otherScope);
        assertThat(roots(other)).isSameAs(roots(combined));
        assertThat(other.get("scope")).isEqualTo(otherScope);
        assertThat(combined.get("scope")).isEqualTo(SCOPE);
        otherScope.put("unrecognizedDimension", "value");
        assertThat(service.findLearnerScopeView(LANDSCAPE, otherScope)).isNull();
        assertThat(service.findLearnerScopeView(LANDSCAPE,
                Map.of("schoolForm", "Gymnasium", "stage", "SekI", "courseProfile", "GK+LK"))).isNull();
    }

    @Test
    void changedCanonicalChildrenInvalidateTheMergeEvenWhenTheSupplierReusesItsMapAndList() throws IOException {
        var graph = roleGraph();
        var children = new ArrayList<>(List.of("leaf"));
        graph.put("root", children);
        writeRoleViews();
        var service = service(() -> graph);
        var initial = roots(service.findViewById(COMBINED));
        assertThat(initial).containsExactly(reference("root", "target"));

        // The LK subtree no longer targets leaf, so GK's explicit support
        // reference must survive. Returning the cached old tree would lose it.
        children.clear();
        var changed = roots(service.findViewById(COMBINED));
        assertThat(changed).isNotSameAs(initial)
                .containsExactly(reference("root", "target"), leafExclusion());
        assertThat(roots(service.findViewById(COMBINED))).isSameAs(changed);
        children.add("leaf");
        assertThat(roots(service.findViewById(COMBINED))).isNotSameAs(changed).isEqualTo(initial);
    }

    @Test
    void aCachedMergeNeverBypassesValidationOfChangedOrUnavailableCanonicalInputs() throws IOException {
        var graph = roleGraph();
        writeRoleViews();
        var current = new java.util.concurrent.atomic.AtomicReference<Map<String, List<String>>>(graph);
        var service = service(current::get);
        var initial = roots(service.findViewById(COMBINED));
        graph.put("leaf", List.of("root"));
        for (int attempt = 0; attempt < 2; attempt++) {
            assertThatThrownBy(() -> service.findViewById(COMBINED))
                    .isInstanceOf(IllegalStateException.class).hasMessageContaining("contains cycle");
        }
        graph.put("leaf", List.of());
        graph.put("unreferenced", List.of("unreferenced"));
        assertThatThrownBy(() -> service.findViewById(COMBINED))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("contains cycle");
        graph.remove("unreferenced");
        graph.remove("leaf");
        assertThatThrownBy(() -> service.findViewById(COMBINED))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Unknown canonical goal");
        current.set(null);
        assertThatThrownBy(() -> service.findViewById(COMBINED)).isInstanceOf(IllegalArgumentException.class);
        current.set(roleGraph());
        assertThat(roots(service.findViewById(COMBINED))).isNotSameAs(initial).isEqualTo(initial);
    }

    @Test
    void orderedSourceIdentityRemainsPartOfTheCacheKey() throws IOException {
        writeView("gk", "GK", List.of(reference("leaf", "target")));
        writeView("lk", "LK", List.of(reference("extra", "target")));
        var service = service(CompositionViewServiceCacheTest::roleGraph);
        var forward = service.findViewById(COMBINED);
        var reverse = service.findViewById("merged:gk+lk");
        assertThat(roots(forward)).extracting(node -> node.get("goalId")).containsExactly("extra", "leaf");
        assertThat(roots(reverse)).extracting(node -> node.get("goalId")).containsExactly("leaf", "extra");
        assertThat(reverse.get("mergedFromViewIds")).isEqualTo(List.of("gk", "lk"));
        assertThat(roots(service.findViewById(COMBINED))).isSameAs(roots(forward));
        assertThat(roots(service.findViewById("merged:gk+lk"))).isSameAs(roots(reverse));
    }

    @Test
    void equalViewIdentifiersCannotAliasDifferentLandscapeSourceDocuments() throws IOException {
        writeRoleViews();
        Path viewDirectory = directory.resolve("DE/Gymnasium/composition-views/other");
        Files.createDirectories(viewDirectory);
        for (String profile : List.of("GK", "LK")) {
            mapper.writeValue(viewDirectory.resolve(profile + ".view.json").toFile(), Map.of(
                    "viewId", profile.toLowerCase(java.util.Locale.ROOT), "landscapeId", "other-landscape",
                    "scope", scope(profile), "rootNodes", List.of(reference("extra", "target"))));
        }
        var service = service(CompositionViewServiceCacheTest::roleGraph);
        var original = service.findMatchingView(LANDSCAPE, SCOPE);
        var other = service.findMatchingView("other-landscape", SCOPE);
        assertThat(original.get("viewId")).isEqualTo(other.get("viewId"));
        assertThat(roots(original)).containsExactly(reference("root", "target"));
        assertThat(roots(other)).containsExactly(reference("extra", "target"));
        assertThat(other.get("landscapeId")).isEqualTo("other-landscape");
        assertThat(roots(service.findMatchingView(LANDSCAPE, SCOPE))).isSameAs(roots(original));
    }

    @Test
    @SuppressWarnings("unchecked")
    void sourceDocumentsAndCachedTreesAreDeeplyImmutable() throws IOException {
        var node = new LinkedHashMap<>(reference("root", "target"));
        node.put("metadata", Map.of("labels", List.of(List.of("original"))));
        writeView("gk", "GK", List.of(node));
        writeView("lk", "LK", List.of(node));
        var service = service(CompositionViewServiceCacheTest::roleGraph);
        for (var document : List.of(service.findViewById("gk"), service.findViewById(COMBINED))) {
            assertThatThrownBy(() -> document.put("viewId", "forged"))
                    .isInstanceOf(UnsupportedOperationException.class);
            assertThatThrownBy(() -> ((Map<String, Object>) document.get("scope")).put("stage", "SekI"))
                    .isInstanceOf(UnsupportedOperationException.class);
            var roots = roots(document);
            assertThatThrownBy(roots::clear).isInstanceOf(UnsupportedOperationException.class);
            assertThatThrownBy(() -> roots.getFirst().put("projectionRole", "prerequisiteOnly"))
                    .isInstanceOf(UnsupportedOperationException.class);
            var metadata = (Map<String, Object>) roots.getFirst().get("metadata");
            var nested = (List<List<String>>) metadata.get("labels");
            assertThatThrownBy(() -> nested.getFirst().set(0, "forged"))
                    .isInstanceOf(UnsupportedOperationException.class);
        }
        assertThat(roots(service.findViewById(COMBINED)).getFirst()).containsEntry("projectionRole", "target");
    }

    @Test
    void changedAuthoredViewsTakeEffectOnlyInANewServiceSnapshot() throws IOException {
        writeRoleViews();
        var service = service(CompositionViewServiceCacheTest::roleGraph);
        var original = roots(service.findViewById(COMBINED));
        writeView("gk", "GK", List.of(reference("root", "target"), reference("extra", "target")));
        assertThat(roots(service.findViewById(COMBINED))).isSameAs(original);
        var restarted = service(CompositionViewServiceCacheTest::roleGraph);
        assertThat(roots(restarted.findViewById(COMBINED)))
                .containsExactly(reference("root", "target"), reference("extra", "target"));
    }

    @Test
    void boundedCacheEvictsTheLeastRecentlyUsedTreeWithoutChangingItsRebuiltSemantics() throws IOException {
        writeRoleViews();
        for (int i = 0; i < CompositionViewService.MAX_MERGED_VIEW_CACHE_ENTRIES; i++) {
            writeView("view-" + i, "GK", List.of(reference("extra", "target")));
        }
        var service = service(CompositionViewServiceCacheTest::roleGraph);
        var retained = roots(service.findViewById(COMBINED));
        var oldest = roots(service.findViewById("merged:lk+view-0"));
        for (int i = 1; i < CompositionViewService.MAX_MERGED_VIEW_CACHE_ENTRIES - 1; i++) {
            service.findViewById("merged:lk+view-" + i);
        }
        assertThat(roots(service.findViewById(COMBINED))).isSameAs(retained);
        service.findViewById("merged:lk+view-" + (CompositionViewService.MAX_MERGED_VIEW_CACHE_ENTRIES - 1));
        assertThat(roots(service.findViewById(COMBINED))).isSameAs(retained);
        assertThat(roots(service.findViewById("merged:lk+view-0"))).isNotSameAs(oldest).isEqualTo(oldest);
    }

    private CompositionViewService service(java.util.function.Supplier<Map<String, List<String>>> graph) {
        var properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        return new CompositionViewService(properties, mapper, graph);
    }

    private void writeRoleViews() throws IOException {
        writeView("gk", "GK", List.of(reference("root", "target"), leafExclusion()));
        writeView("lk", "LK", List.of(reference("root", "target")));
    }

    private void writeView(String id, String profile, List<Map<String, Object>> roots) throws IOException {
        Path path = directory.resolve("DE/Gymnasium/composition-views/test/" + id + ".view.json");
        Files.createDirectories(path.getParent());
        mapper.writeValue(path.toFile(), Map.of("viewId", id, "landscapeId", LANDSCAPE,
                "scope", scope(profile), "rootNodes", roots));
    }

    private static Map<String, String> scope(String profile) {
        return Map.of("schoolForm", "Gymnasium", "stage", "SekII", "courseProfile", profile);
    }

    private static Map<String, List<String>> roleGraph() {
        return new LinkedHashMap<>(Map.of("root", List.of("leaf"), "leaf", List.of(), "extra", List.of()));
    }

    private static Map<String, Object> reference(String goalId, String role) {
        return Map.of("kind", "canonicalSubtree", "goalId", goalId, "projectionRole", role);
    }

    private static Map<String, Object> leafExclusion() {
        return Map.of("kind", "goalEntry", "goalId", "leaf", "projectionRole", "prerequisiteOnly");
    }

    @SuppressWarnings("unchecked")
    private static List<Map<String, Object>> roots(Map<String, Object> document) {
        return (List<Map<String, Object>>) document.get("rootNodes");
    }
}
