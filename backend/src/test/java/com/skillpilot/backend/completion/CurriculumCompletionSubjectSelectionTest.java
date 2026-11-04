package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import com.skillpilot.backend.landscape.LandscapeProperties;
import com.skillpilot.backend.service.CompositionViewService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class CurriculumCompletionSubjectSelectionTest {
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final ObjectMapper JSON = new ObjectMapper();

    @Test void defaultRetainsEveryFloorAndCurrentM7SubjectBeforeExactSelection() {
        List<Map<String, String>> floors = CurriculumCompletionIntegrityTest.REQUIRED_PROTECTED_SUBJECTS.stream()
                .map(id -> Map.of("landscapeId", id, "subject", id, "minimumMaturity", "M7")).toList();
        var inventory = CurriculumCompletionIntegrityTest.protectedInventory(JSON.valueToTree(Map.of("floors", floors)),
                JSON.valueToTree(Map.of("curricula", List.of(Map.of("landscapeId", "newly-protected", "subject", "New", "maturity", "M7")))));
        assertThat(CurriculumCompletionIntegrityTest.selectSubjects(inventory, null)).hasSize(6);
        assertThat(CurriculumCompletionIntegrityTest.selectSubjects(inventory, MATH)).containsOnlyKeys(MATH);
        assertThat(inventory).hasSize(6);
    }

    @ParameterizedTest
    @ValueSource(strings = {"", " ", "Mathematik", "68a8ac50", "not-known", "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced,",
            "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced,7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a", " 68a8ac50-f5f5-4e24-8aa9-5e408ca01ced"})
    void malformedUnknownOrMultipleSelectorsNeverSilentlyChooseASubset(String selector) {
        assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.selectSubjects(inventory(), selector))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test void aMathSelectorCannotHideAnotherMissingProtectedSubject() {
        Map<String, String> incomplete = new LinkedHashMap<>(inventory());
        incomplete.remove("7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a");
        assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.selectSubjects(incomplete, MATH))
                .isInstanceOf(IllegalStateException.class);
        assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.protectedInventory(
                JSON.createObjectNode(), JSON.createObjectNode())).isInstanceOf(IllegalStateException.class);
    }

    @Test void missingEmptyOrDuplicateOfferingsCannotProduceAnEmptyPassingAudit() throws Exception {
        for (String data : List.of("{}", "null", "{\"DE-HE\":{\"stages\":[],\"durationModels\":[\"G9\"]}}",
                "{\"DE-HE\":{\"stages\":[\"SekII\",\"SekII\"],\"durationModels\":[\"G9\"]}}")) {
            var value = JSON.readTree(data);
            assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.offeredScopes(value))
                    .isInstanceOf(IllegalArgumentException.class);
        }
        assertThat(CurriculumCompletionIntegrityTest.offeredScopes(JSON.readTree(
                "{\"DE-HE\":{\"stages\":[\"SekI\",\"SekII\"],\"durationModels\":[\"G8\",\"G9\"]}}")))
                .hasSize(8);
    }

    @Test void selectingOnlyMathTargetsStillRetainsThePhysicsPrerequisiteContext() {
        var physics = goal("physics-foundation");
        var math = goal("math-content", physics.getId());
        var exam = CurriculumCompletionIntegrityTest.readyExam("math-exam", math.getId());
        Map<String, LearningGoal> fullGraph = Map.of(physics.getId(), physics, math.getId(), math, exam.getId(), exam);
        var compiled = new CompletionProfileCompiler().compileAutomatic(fullGraph,
                Set.of(math.getId(), exam.getId()), Set.of(math.getId(), exam.getId()), "fixture");
        assertThat(compiled.contextGoalIds()).contains(physics.getId());
        assertThat(compiled.targetGoalIds()).doesNotContain(physics.getId());
        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> failures = new ArrayList<>();
        CurriculumCompletionIntegrityTest.audit("Mathematik", "fixture", fullGraph,
                Set.of(math.getId(), exam.getId()), true, Set.of(), rows, failures);
        assertThat(failures).isEmpty();
        assertThat(rows.getFirst().get("uncovered")).isEqualTo(List.of());
    }

    @Test void addedRuntimeViewOrSnapshotInvalidatesTheInputManifest(@TempDir Path root) throws Exception {
        var manifest = boundFixture(root);
        for (String relative : List.of("curricula/DE/Gymnasium/composition-views/mathematik/new.view.json",
                "curricula/DE/Gymnasium/input/SH/upper-secondary/source-json/new.de.json.snapshot")) {
            Path file = root.resolve(relative); Files.createDirectories(file.getParent()); Files.writeString(file, "{}");
            assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.verifyInputs(root, manifest))
                    .isInstanceOf(IllegalStateException.class).hasMessageContaining("input path inventory");
            Files.delete(file);
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"assessments", "visualizations", "quality", "completion-profiles", "completion-scopes"})
    void recursiveViewsAreBoundDespiteShadowDirectoryNames(String directory, @TempDir Path root) throws Exception {
        String view = """
                {"viewId":"nested-runtime-view","landscapeId":"math",
                 "scope":{"jurisdiction":"DE-SH","schoolForm":"Gymnasium","stage":"SekI"},
                 "rootNodes":[{"kind":"goalEntry","goalId":"ordinary","projectionRole":"target"}]}
                """;
        checkNewThenChangedInput(root, "curricula/DE/Gymnasium/composition-views/mathematik/" + directory + "/new.view.json", view);
    }

    @ParameterizedTest
    @ValueSource(strings = {"assessments", "visualizations", "quality", "completion-profiles", "completion-scopes"})
    void sourceSnapshotsAndMappingsAreBoundDespiteShadowDirectoryNames(String directory, @TempDir Path root) throws Exception {
        checkNewThenChangedInput(root, "curricula/DE/Gymnasium/input/SH/" + directory + "/new.de.json.snapshot");
        checkNewThenChangedInput(root, "curricula/DE/Gymnasium/mapping/DE-SH/" + directory + "/new.json");
    }

    @Test void onlyQualityEvidenceIsOfflineUnlessRegistryAddressesAFile(@TempDir Path root) throws Exception {
        var manifest = boundFixture(root);
        Path offline = root.resolve("curricula/DE/Gymnasium/quality/evidence.json");
        Files.createDirectories(offline.getParent()); Files.writeString(offline, "{}");
        CurriculumCompletionIntegrityTest.verifyInputs(root, manifest);
        String source = "curricula/DE/Gymnasium/quality/source.pdf";
        Files.writeString(root.resolve(source), "registry-addressed source");
        String registry = "curricula/DE/Gymnasium/provenance/source-landscape-registry.json";
        writeBound(root, manifest, registry, "{\"entries\":[{\"archiveSourcePath\":\"" + source + "\"}]}");
        assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.verifyInputs(root, manifest))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("input path inventory");
        writeBound(root, manifest, source, "registry-addressed source");
        CurriculumCompletionIntegrityTest.verifyInputs(root, manifest);
        Files.writeString(root.resolve(source), "changed source");
        assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.verifyInputs(root, manifest))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Changed audit input");
    }

    @Test void registryRetainedPathNormalizationBindsExistingNonJsonSources(@TempDir Path root) throws Exception {
        var manifest = boundFixture(root);
        String source = "curricula/DE/Gymnasium/input/HE/source.pdf";
        Path file = root.resolve(source); Files.createDirectories(file.getParent()); Files.writeString(file, "source");
        writeBound(root, manifest, "curricula/DE/Gymnasium/provenance/source-landscape-registry.json",
                "{\"entries\":[{\"archiveSourcePath\":\"curricula/DE/Gymnasium/input/DE-HE/source.pdf\"}]}");
        assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.verifyInputs(root, manifest))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("input path inventory");
        writeBound(root, manifest, source, "source");
        CurriculumCompletionIntegrityTest.verifyInputs(root, manifest);
    }

    @ParameterizedTest
    @ValueSource(strings = {"archivePath", "sourceParent"})
    void registryFallbackExtractionsRemainBoundInsideReservedRoots(String route, @TempDir Path root) throws Exception {
        var manifest = boundFixture(root);
        String source = "curricula/DE/Gymnasium/quality/source.pdf";
        writeBound(root, manifest, source, "source");
        writeBound(root, manifest, "curricula/DE/Gymnasium/provenance/source-landscape-registry.json",
                "{\"entries\":[{\"archiveSourcePath\":\"" + source
                        + "\",\"archivePath\":\"curricula/DE/Gymnasium/quality/archive\"}]}");
        String extraction = "curricula/DE/Gymnasium/quality/" + (route.equals("archivePath") ? "archive/" : "")
                + "source-extraction/nested/runtime.source-extraction.json";
        CurriculumCompletionIntegrityTest.verifyInputs(root, manifest);
        Path file = root.resolve(extraction); Files.createDirectories(file.getParent()); Files.writeString(file, "{}");
        assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.verifyInputs(root, manifest))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("input path inventory");
        writeBound(root, manifest, extraction, "{}");
        CurriculumCompletionIntegrityTest.verifyInputs(root, manifest);
        Files.writeString(file, "{\"changed\":true}");
        assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.verifyInputs(root, manifest))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Changed audit input");
    }

    private void checkNewThenChangedInput(Path root, String relative) throws Exception {
        checkNewThenChangedInput(root, relative, "{}");
    }

    private void checkNewThenChangedInput(Path root, String relative, String content) throws Exception {
        var manifest = boundFixture(root);
        Path file = root.resolve(relative); Files.createDirectories(file.getParent()); Files.writeString(file, content);
        if (relative.endsWith(".view.json")) {
            var properties = new LandscapeProperties(); properties.setDirectory(root.resolve("curricula").toString());
            assertThat(new CompositionViewService(properties, JSON).findViewById("nested-runtime-view"))
                    .as("Actual recursive view loader accepts the bound fixture").isNotNull();
        }
        assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.verifyInputs(root, manifest))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("input path inventory");
        writeBound(root, manifest, relative, content);
        CurriculumCompletionIntegrityTest.verifyInputs(root, manifest);
        Files.writeString(file, content.contains("\"ordinary\"") ? content.replace("\"ordinary\"", "\"changed\"") : "{\"changed\":true}");
        assertThatThrownBy(() -> CurriculumCompletionIntegrityTest.verifyInputs(root, manifest))
                .isInstanceOf(IllegalStateException.class).hasMessageContaining("Changed audit input");
        Files.delete(file);
    }

    private com.fasterxml.jackson.databind.node.ObjectNode boundFixture(Path root) throws Exception {
        var manifest = JSON.createObjectNode();
        manifest.putObject("files");
        Files.createDirectories(root.resolve("curricula"));
        for (String relative : List.of("app/src/generated/gymnasiumDurationOfferings.ts",
                "app/scripts/config/curriculum-maturity-floor-policy.json", "docs/qa-ci/status/curriculum-quality-status.json")) {
            writeBound(root, manifest, relative, "{}");
        }
        CurriculumCompletionIntegrityTest.verifyInputs(root, manifest);
        return manifest;
    }

    private void writeBound(Path root, com.fasterxml.jackson.databind.node.ObjectNode manifest,
            String relative, String content) throws Exception {
        Path file = root.resolve(relative); Files.createDirectories(file.getParent()); Files.writeString(file, content);
        ((com.fasterxml.jackson.databind.node.ObjectNode) manifest.path("files")).put(relative,
                HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(Files.readAllBytes(file))));
    }

    private Map<String, String> inventory() {
        Map<String, String> result = new LinkedHashMap<>();
        CurriculumCompletionIntegrityTest.REQUIRED_PROTECTED_SUBJECTS.forEach(id -> result.put(id, id));
        return result;
    }

    private LearningGoal goal(String id, String... requirements) {
        var goal = new LearningGoal(); goal.setId(id); goal.setTitle(id); goal.setType("atomic");
        goal.setContains(List.of()); goal.setRequires(List.of(requirements)); return goal;
    }
}
