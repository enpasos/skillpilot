package com.skillpilot.backend.composition;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.service.CompositionViewService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/** Isolated reader fixtures; these are not accepted real curriculum plans. */
class StagePlanRuntimeIndexTest {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final String DIR = "curricula/DE/Gymnasium/stage-plans/";
    private static final String INDEX = DIR + "generated/index.json";
    private static final String SCHEMA = "https://skillpilot.com/schemas/curriculum-package/";

    @Test
    void nativePublicReaderSelectsAndMergesOneDeclaredPlan(@TempDir Path root) throws Exception {
        Fixture f = fixture(root);
        CompositionViewService service = f.service();
        for (String profile : List.of("GK", "LK", "GK+LK")) {
            Map<String, Object> view = service.findLearnerScopeView("subject-0", scope("CrossStage", profile, true));
            assertThat(view).isNotNull();
            Map<String, Object> context = object(view.get("stagePlanProjection"));
            assertThat(object(context.get("plan")).get("planId")).isEqualTo("fixture-he-g9");
            List<Map<String, Object>> records = objects(context.get("views"));
            assertThat(objects(records.getFirst().get("structureBindings"))).hasSize(9);
        }
    }

    @Test
    void explicitLowerStageNeverReceivesTheActivatedFullPlan(@TempDir Path root) throws Exception {
        Fixture f = fixture(root);
        Map<String, Object> lower = map("viewId", "legacy-lower", "landscapeId", "subject-0", "scope", scope("SekI", null, true),
                "rootNodes", List.of(map("kind", "goalEntry", "goalId", "m5")));
        write(root, "curricula/DE/Gymnasium/composition-views/lower.view.json", lower);
        Map<String, Object> view = f.service().findLearnerScopeView("subject-0", scope("SekI", null, true));
        assertThat(view.get("viewId")).isEqualTo("legacy-lower");
        assertThat(view).doesNotContainKey("stagePlanProjection");
        assertThat(objects(view.get("rootNodes"))).extracting(node -> node.get("goalId")).containsExactly("m5");
    }

    @Test
    void missingDurationDoesNotGuessAnActivatedPlan(@TempDir Path root) throws Exception {
        Fixture f = fixture(root);
        Map<String, String> unresolved = scope("CrossStage", "GK", false);
        assertThat(f.service().findLearnerScopeView("subject-0", unresolved)).isNull();
        Map<String, Object> artifact = read(root.resolve("curricula/DE/Gymnasium/composition-views/math-gk.view.json"));
        StagePlanRuntimeIndex index = f.reader();
        Map<String, Object> instrumented = index.instrument(root.resolve("curricula/DE/Gymnasium/composition-views/math-gk.view.json"), artifact);
        assertThatThrownBy(() -> index.bind(instrumented, unresolved)).hasMessageContaining("exactly one plan");
    }

    @Test
    void staleCanonicalFailsStrictQaButKeepsUnrelatedLearnerViewsReadable(@TempDir Path root) throws Exception {
        Fixture f = fixture(root);
        Files.writeString(root.resolve("curricula/DE/Gymnasium/canonical/subject-0.json"), "\n", java.nio.file.StandardOpenOption.APPEND);
        assertThatThrownBy(f::reader).hasMessageContaining("stale raw source");
        Map<String, String> by = new LinkedHashMap<>(scope("CrossStage", "GK", false)); by.put("jurisdiction", "DE-BY");
        write(root, "curricula/DE/Gymnasium/composition-views/legacy-by.view.json", map("viewId", "legacy-by", "landscapeId", "subject-0", "scope", by,
                "rootNodes", List.of(map("kind", "goalEntry", "goalId", "m5"))));
        Map<String, Object> view = f.service().findLearnerScopeView("subject-0", by);
        assertThat(view.get("viewId")).isEqualTo("legacy-by");
        assertThat(view).doesNotContainKey("stagePlanProjection");
    }

    @Test
    void indexedGoalMustActuallyLieInItsClaimedUnit(@TempDir Path root) throws Exception {
        Fixture f = fixture(root);
        object(objects(objects(f.index.get("views")).getFirst().get("placements")).getFirst()).put("planUnitId", "y6");
        f.save();
        assertThatThrownBy(f::reader).hasMessageContaining("role-resolved artifact paths");
    }

    @Test
    void equalScopesWithDifferentKeyOrdersAreStillDuplicateAuthorities(@TempDir Path root) throws Exception {
        Fixture f = fixture(root);
        Map<String, Object> plan = new LinkedHashMap<>(object(objects(f.index.get("plans")).getFirst().get("plan")));
        plan.put("planId", "duplicate-authority");
        List<Map.Entry<String, Object>> entries = new ArrayList<>(object(plan.get("scope")).entrySet()); Collections.reverse(entries);
        Map<String, Object> reordered = new LinkedHashMap<>(); entries.forEach(entry -> reordered.put(entry.getKey(), entry.getValue())); plan.put("scope", reordered);
        String path = DIR + "plans/duplicate.json"; write(root, path, plan);
        objects(f.index.get("plans")).add(map("source", pin(root, path), "plan", plan)); f.save();
        assertThatThrownBy(f::reader).hasMessageContaining("one Land/duration scope");
    }

    @Test
    void aMissingOccupiedUnitAfterMergeIsRejected(@TempDir Path root) throws Exception {
        Fixture f = fixture(root); StagePlanRuntimeIndex index = f.reader();
        String path = "curricula/DE/Gymnasium/composition-views/math-gk.view.json";
        Map<String, Object> view = JSON.readValue(JSON.writeValueAsBytes(index.instrument(root.resolve(path), read(root.resolve(path)))), new TypeReference<>() {});
        objects(objects(view.get("rootNodes")).getFirst().get("children")).removeFirst();
        assertThatThrownBy(() -> index.bind(view, scope("CrossStage", "GK", true))).hasMessageContaining("lost a target-bearing declared unit");
    }

    @Test
    void actualYearOrderAfterMergeMustMatchThePlan(@TempDir Path root) throws Exception {
        Fixture f = fixture(root); StagePlanRuntimeIndex index = f.reader();
        String path = "curricula/DE/Gymnasium/composition-views/math-gk.view.json";
        Map<String, Object> view = JSON.readValue(JSON.writeValueAsBytes(index.instrument(root.resolve(path), read(root.resolve(path)))), new TypeReference<>() {});
        Collections.swap(objects(objects(view.get("rootNodes")).getFirst().get("children")), 0, 1);
        assertThatThrownBy(() -> index.bind(view, scope("CrossStage", "GK", true)))
                .hasMessageContaining("actual unit order");
    }

    @Test
    void repinningAnArtifactDoesNotPermitReversedPhaseSiblings(@TempDir Path root) throws Exception {
        Fixture f = fixture(root);
        String path = "curricula/DE/Gymnasium/composition-views/math-gk.view.json";
        Map<String, Object> artifact = read(root.resolve(path));
        Collections.swap(objects(objects(artifact.get("rootNodes")).getLast().get("children")), 1, 2);
        write(root, path, artifact);
        objects(f.index.get("views")).getFirst().put("artifact", pin(root, path)); f.save();
        assertThatThrownBy(f::reader).hasMessageContaining("actual unit order");
    }

    @Test
    void unboundSubjectWrappersCannotConcealReversedYearOrder(@TempDir Path root) throws Exception {
        Fixture f = fixture(root); StagePlanRuntimeIndex index = f.reader();
        String path = "curricula/DE/Gymnasium/composition-views/math-gk.view.json";
        Map<String, Object> view = JSON.readValue(JSON.writeValueAsBytes(index.instrument(root.resolve(path), read(root.resolve(path)))), new TypeReference<>() {});
        Map<String, Object> lower = objects(view.get("rootNodes")).getFirst();
        List<Map<String, Object>> years = objects(lower.get("children"));
        lower.put("children", List.of(map("kind", "structure", "id", "wrapper-a", "children", List.of(years.getFirst())),
                map("kind", "structure", "id", "wrapper-b", "children", List.of(years.getLast()))));
        assertThat(index.bind(view, scope("CrossStage", "GK", true))).containsKey("stagePlanProjection");
        lower.put("children", List.of(map("kind", "structure", "id", "wrapper-b", "children", List.of(years.getLast())),
                map("kind", "structure", "id", "wrapper-a", "children", List.of(years.getFirst()))));
        assertThatThrownBy(() -> index.bind(view, scope("CrossStage", "GK", true)))
                .hasMessageContaining("actual unit order");
    }

    @Test
    void pruningAnEmptyYearPreservesRelativeOrderWithoutRequiringTheEmptyUnit(@TempDir Path root) throws Exception {
        Fixture f = fixture(root);
        String path = "curricula/DE/Gymnasium/composition-views/math-gk.view.json";
        Map<String, Object> artifact = read(root.resolve(path));
        objects(objects(artifact.get("rootNodes")).getFirst().get("children")).getLast().put("children", List.of());
        write(root, path, artifact);
        Map<String, Object> indexed = objects(f.index.get("views")).getFirst();
        indexed.put("artifact", pin(root, path));
        objects(indexed.get("placements")).removeIf(placement -> "m6".equals(placement.get("goalId"))); f.save();
        StagePlanRuntimeIndex index = f.reader();
        Map<String, Object> view = JSON.readValue(JSON.writeValueAsBytes(index.instrument(root.resolve(path), artifact)), new TypeReference<>() {});
        objects(objects(view.get("rootNodes")).getFirst().get("children")).removeLast();
        assertThat(index.bind(view, scope("CrossStage", "GK", true))).containsKey("stagePlanProjection");
    }

    @Test
    void reservedRuntimeMetadataAndDuplicateViewIdsCannotSelfActivate(@TempDir Path root) throws Exception {
        Fixture f = fixture(root); StagePlanRuntimeIndex index = f.reader();
        String path = "curricula/DE/Gymnasium/composition-views/math-gk.view.json";
        Map<String, Object> view = read(root.resolve(path)); view.put("stagePlanProjection", map("planId", "unverified"));
        assertThatThrownBy(() -> index.instrument(root.resolve(path), view)).hasMessageContaining("cannot self-assert");
        write(root, "curricula/DE/Gymnasium/composition-views/collision.view.json", read(root.resolve(path)));
        assertThatThrownBy(() -> f.service().findLearnerScopeView("subject-0", scope("CrossStage", "GK", true)))
                .hasMessageContaining("view ID collision");
    }

    private static Fixture fixture(Path root) throws Exception {
        List<Map<String, Object>> canonical = new ArrayList<>(); Map<String, List<String>> graph = new LinkedHashMap<>();
        for (int i = 0; i < 21; i++) {
            List<Map<String, Object>> goals = new ArrayList<>();
            if (i < 2) for (String slot : List.of("5", "6", "e", "q1", "q2", "q3", "q4")) {
                String id = (i == 0 ? "m" : "p") + slot; goals.add(map("id", id, "type", "atomic", "contains", List.of())); graph.put(id, List.of());
            }
            String path = "curricula/DE/Gymnasium/canonical/subject-" + i + ".json";
            write(root, path, map("landscapeId", "subject-" + i, "goals", goals));
            Map<String, Object> source = pin(root, path); source.put("landscapeId", "subject-" + i); canonical.add(source);
        }
        String manifest = "curricula/curriculum_manifest.json"; write(root, manifest, map("isolatedReaderFixture", true));
        List<Map<String, Object>> units = new ArrayList<>();
        units.add(map("id", "lower", "kind", "stage", "stage", "SekI", "parentUnitId", "root", "after", List.of(), "children", List.of("y5", "y6"), "label", "Sek I"));
        units.add(map("id", "upper", "kind", "stage", "stage", "SekII", "parentUnitId", "root", "after", List.of("lower"), "children", List.of("e", "q1", "q2", "q3", "q4"), "label", "Sek II"));
        for (String id : List.of("y5", "y6", "e", "q1", "q2", "q3", "q4")) {
            boolean year = id.startsWith("y"); List<String> siblings = year ? List.of("y5", "y6") : List.of("e", "q1", "q2", "q3", "q4"); int n = siblings.indexOf(id);
            Map<String, Object> unit = map("id", id, "kind", year ? "year" : "phase", "stage", year ? "SekI" : "SekII", "parentUnitId", year ? "lower" : "upper", "after", n == 0 ? List.of() : List.of(siblings.get(n - 1)), "label", id,
                    "basis", map("kind", "reviewedStructure", "references", List.of("isolated-fixture"), "rationale", "Test only, no official calendar claim."));
            unit.put(year ? "year" : "phase", year ? Integer.parseInt(id.substring(1)) : id.toUpperCase()); units.add(unit);
        }
        List<Map<String, Object>> authorities = new ArrayList<>(), indexedViews = new ArrayList<>(), catalogViews = new ArrayList<>(), activationViews = new ArrayList<>();
        for (int subject = 0; subject < 2; subject++) for (String profile : List.of("gk", "lk")) {
            String prefix = subject == 0 ? "math" : "physics", viewId = prefix + "-" + profile, owner = "subject-" + subject;
            List<Map<String, Object>> roots = new ArrayList<>(), bindings = new ArrayList<>(), placements = new ArrayList<>();
            for (Map<String, Object> stage : units.subList(0, 2)) {
                List<Map<String, Object>> children = new ArrayList<>();
                for (String id : strings(stage.get("children"))) {
                    Map<String, Object> unit = units.stream().filter(u -> id.equals(u.get("id"))).findFirst().orElseThrow();
                    String goal = (subject == 0 ? "m" : "p") + (id.startsWith("y") ? id.substring(1) : id);
                    children.add(map("kind", "structure", "id", viewId + "-" + id, "label", id, "children", List.of(map("kind", "goalEntry", "goalId", goal))));
                    placements.add(map("goalId", goal, "planUnitId", id)); bindings.add(binding(unit, viewId, strings(stage.get("children")).indexOf(id)));
                }
                roots.add(map("kind", "structure", "id", viewId + "-" + stage.get("id"), "label", stage.get("label"), "children", children));
                bindings.add(binding(stage, viewId, units.indexOf(stage)));
            }
            Map<String, Object> artifact = map("$schema", SCHEMA + "v1/composition-view.schema.json", "viewFormatVersion", "1.0", "viewId", viewId, "landscapeId", owner, "language", "de", "scope", scope("CrossStage", profile.toUpperCase(), true), "rootNodes", roots);
            String output = "curricula/DE/Gymnasium/composition-views/" + viewId + ".view.json", source = DIR + "views/" + viewId + ".json";
            write(root, output, artifact);
            Map<String, Object> authority = JSON.readValue(JSON.writeValueAsBytes(artifact), new TypeReference<>() {});
            authority.put("$schema", SCHEMA + "v1.3/composition-view.schema.json"); authority.put("viewFormatVersion", "1.1");
            authority.put("planBinding", map("planId", "fixture-he-g9"));
            addSourceMetadata(objects(authority.get("rootNodes")), bindings); write(root, source, authority);
            authorities.add(map("landscapeId", owner, "courseProfile", profile.toUpperCase(), "viewId", viewId));
            catalogViews.add(map("viewId", viewId, "path", source, "outputPath", output)); activationViews.add(map("viewId", viewId, "outputPath", output));
            indexedViews.add(map("viewId", viewId, "landscapeId", owner, "scope", artifact.get("scope"), "source", pin(root, source), "artifact", pin(root, output), "planIds", List.of("fixture-he-g9"), "structureBindings", bindings, "placements", placements));
        }
        Map<String, Object> plan = map("$schema", SCHEMA + "v1.3/stage-plan.schema.json", "planFormatVersion", "1.0", "planId", "fixture-he-g9", "scope", map("schoolForm", "Gymnasium", "jurisdiction", "DE-HE", "durationModel", "G9"), "rootUnit", map("id", "root", "label", "Isolated fixture", "children", List.of("lower", "upper")), "units", units, "subjectViews", authorities);
        String planPath = DIR + "plans/he-g9.json", catalog = DIR + "catalog.json", activation = "activation.json";
        write(root, planPath, plan); write(root, catalog, map("revision", "isolated-test", "plans", List.of(map("planId", "fixture-he-g9", "path", planPath)), "views", catalogViews));
        Map<String, Object> activated = map("planIds", List.of("fixture-he-g9"), "views", activationViews); write(root, activation, activated);
        Map<String, Object> catalogPin = pin(root, catalog); catalogPin.put("revision", "isolated-test");
        Map<String, Object> index = map("$schema", SCHEMA + "v1.3/stage-plan-projection-index.schema.json", "indexFormatVersion", "1.0", "generatedBy", "skillpilot-stage-plan-materializer-v1", "canonicalDomain", "canonical-gymnasium-21", "catalog", catalogPin, "activationSource", pin(root, activation), "activationInventory", activated, "canonicalSources", canonical, "inventorySources", List.of(pin(root, manifest)), "plans", new ArrayList<>(List.of(map("source", pin(root, planPath), "plan", plan))), "views", indexedViews);
        Fixture f = new Fixture(root, index, graph); f.save(); return f;
    }

    private record Fixture(Path root, Map<String, Object> index, Map<String, List<String>> graph) {
        void save() throws Exception { write(root, INDEX, index); }
        StagePlanRuntimeIndex reader() { return new StagePlanRuntimeIndex(root.resolve("curricula"), JSON); }
        CompositionViewService service() { LandscapeProperties properties = new LandscapeProperties(); properties.setDirectory(root.resolve("curricula").toString()); return new CompositionViewService(properties, JSON, () -> graph); }
    }
    private static Map<String, Object> binding(Map<String, Object> unit, String viewId, int order) {
        Map<String, Object> binding = new LinkedHashMap<>(unit); binding.remove("id"); binding.remove("label"); binding.remove("basis");
        binding.put("structureId", viewId + "-" + unit.get("id")); binding.put("planUnitId", unit.get("id")); binding.put("order", order); return binding;
    }
    private static void addSourceMetadata(List<Map<String, Object>> nodes, List<Map<String, Object>> bindings) {
        for (Map<String, Object> node : nodes) if ("structure".equals(node.get("kind"))) {
            Map<String, Object> binding = bindings.stream().filter(entry -> entry.get("structureId").equals(node.get("id"))).findFirst().orElseThrow();
            node.put("planUnitId", binding.get("planUnitId")); addSourceMetadata(objects(node.get("children")), bindings);
        } else node.put("placementBasis", map("kind", "reviewedPlacement", "references", List.of("isolated-fixture"), "rationale", "Test placement, no official year claim."));
    }
    private static Map<String, String> scope(String stage, String profile, boolean duration) {
        Map<String, String> scope = new LinkedHashMap<>(); scope.put("schoolForm", "Gymnasium"); scope.put("jurisdiction", "DE-HE"); scope.put("stage", stage); if (duration) scope.put("durationModel", "G9"); if (profile != null) scope.put("courseProfile", profile); return scope;
    }
    private static Map<String, Object> pin(Path root, String relative) throws Exception { return map("path", relative, "sha256", "sha256:" + HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(root.resolve(relative))))); }
    private static void write(Path root, String relative, Object value) throws Exception { Path path = root.resolve(relative); Files.createDirectories(path.getParent()); JSON.writerWithDefaultPrettyPrinter().writeValue(path.toFile(), value); }
    private static Map<String, Object> read(Path path) throws Exception { return JSON.readValue(path.toFile(), new TypeReference<>() {}); }
    private static Map<String, Object> map(Object... pairs) { Map<String, Object> map = new LinkedHashMap<>(); for (int i = 0; i < pairs.length; i += 2) map.put((String) pairs[i], pairs[i + 1]); return map; }
    @SuppressWarnings("unchecked") private static Map<String, Object> object(Object value) { return (Map<String, Object>) value; }
    @SuppressWarnings("unchecked") private static List<Map<String, Object>> objects(Object value) { return (List<Map<String, Object>>) value; }
    @SuppressWarnings("unchecked") private static List<String> strings(Object value) { return (List<String>) value; }
}
