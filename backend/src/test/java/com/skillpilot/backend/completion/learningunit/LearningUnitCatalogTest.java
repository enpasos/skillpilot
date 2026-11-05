package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class LearningUnitCatalogTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void pinnedArchivedSourceRemainsValidWhenCurrentSourceNoLongerApplies() throws Exception {
        var archive = archive("archived");
        var loaded = LearningUnitCatalog.load(archive.manifest(), archive.files()::get,
                ignored -> { throw new AssertionError("Historical recognition must not read current source"); }, mapper);
        assertThat(loaded.quarantined()).isEmpty();
        assertThat(new LearningUnitEvaluator().evaluate(loaded.compiled(), java.util.Set.of("Q")).recognizedGoalIds()).containsExactly("A");
    }

    @Test
    void neverValidActiveUnitGetsNoRecognition() throws Exception {
        var archive = archive("active");
        var loaded = LearningUnitCatalog.load(archive.manifest(), archive.files()::get,
                ignored -> { throw new IllegalArgumentException("Active placement never matched"); }, mapper);
        assertThat(loaded.definitions()).isEmpty();
        assertThat(loaded.compiled()).isNull();
        assertThat(loaded.quarantined()).hasSize(1);
    }

    @Test
    void rejectedNewEntryCannotWithdrawPreviouslyValidArchive() throws Exception {
        var archive = archive("archived");
        var manifest = mapper.readValue(archive.manifest(), LearningUnitCatalog.Manifest.class);
        var first = manifest.contracts().getFirst();
        var bad = new LearningUnitCatalog.Entry("DE/Gymnasium/learning-units/contracts/unit/2.json", "wrong-hash", "active",
                first.sourceSnapshotPath(), first.inputs(), first.assessmentInputs(), Map.of());
        var loaded = LearningUnitCatalog.load(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(first, bad))),
                path -> archive.files().getOrDefault(path, "invalid".getBytes(StandardCharsets.UTF_8)), ignored -> {}, mapper);
        assertThat(loaded.definitions()).hasSize(1);
        assertThat(loaded.quarantined()).hasSize(1);
        assertThat(new LearningUnitEvaluator().evaluate(loaded.compiled(), java.util.Set.of("Q")).recognizedGoalIds()).containsExactly("A");
    }

    @Test
    void changedReviewOrTaskBytesCannotMasqueradeAsPinnedEvidence() throws Exception {
        for (String path : List.of("DE/Gymnasium/quality/review.md", "DE/Gymnasium/learning-units/inputs/Q.task.json")) {
            var archive = archive("archived");
            archive.files().put(path, "changed".getBytes(StandardCharsets.UTF_8));
            var loaded = LearningUnitCatalog.load(archive.manifest(), archive.files()::get, ignored -> {}, mapper);
            assertThat(loaded.definitions()).isEmpty();
            assertThat(loaded.quarantined()).hasSize(1);
        }
    }

    @Test
    void archivePathsCannotEscapeTheCurriculumRoot() {
        for (String path : List.of("../private", "/etc/passwd", "DE/../private", "DE\\private", "DE/./private")) {
            assertThatThrownBy(() -> LearningUnitCatalog.checkedPath(path)).isInstanceOf(IllegalArgumentException.class);
        }
    }

    @Test void reversedActiveThenArchivedOrderCannotBroadenAnOldAssessmentClaim() throws Exception {
        var archive = archive("archived");
        var original = mapper.readValue(archive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        var broader = broaderEntry(archive, original);
        var loaded = LearningUnitCatalog.load(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(broader, original))),
                archive.files()::get, ignored -> {}, mapper);
        assertThat(loaded.definitions()).singleElement().satisfies(definition -> assertThat(definition.contractId()).isEqualTo("unit"));
        assertThat(loaded.quarantined()).containsKey(broader.path()).doesNotContainKey(original.path());
        assertThat(new LearningUnitEvaluator().evaluate(loaded.compiled(), java.util.Set.of("Q")).recognizedGoalIds()).containsExactly("A").doesNotContain("B");
    }

    @Test void cachedSourceSnapshotCannotReplaceAnotherEntriesOwnInputPin() throws Exception {
        var archive = archive("archived");
        var original = mapper.readValue(archive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        String duplicatePath = "DE/Gymnasium/learning-units/contracts/unit/unpinned-copy.json";
        archive.files().put(duplicatePath, archive.files().get(original.path()));
        Map<String, String> incompleteInputs = new LinkedHashMap<>(original.inputs());
        incompleteInputs.remove(original.sourceSnapshotPath());
        var unpinned = new LearningUnitCatalog.Entry(duplicatePath, original.sha256(), "active", original.sourceSnapshotPath(),
                incompleteInputs, original.assessmentInputs(), Map.of());
        var loaded = LearningUnitCatalog.load(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(original, unpinned))),
                archive.files()::get, ignored -> {}, mapper);
        assertThat(loaded.definitions()).hasSize(1);
        assertThat(loaded.quarantined().get(duplicatePath)).contains("Unpinned frozen input");
    }

    @Test void unchangedTaskCannotExtendItsFrozenCanonicalCoveredCompetenceClaim() throws Exception {
        var archive = archive("archived");
        var original = mapper.readValue(archive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        var broader = broaderEntry(archive, original);
        var snapshot = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(archive.files().get(broader.sourceSnapshotPath()));
        for (var goal : snapshot.path("landscapes").get(0).path("goals")) if ("Q".equals(goal.path("id").asText())) {
            ((com.fasterxml.jackson.databind.node.ObjectNode) goal.path("examData")).putArray("coveredGoalIds").add("A");
        }
        archive.files().put(broader.sourceSnapshotPath(), mapper.writeValueAsBytes(snapshot));
        var inputs = new LinkedHashMap<>(broader.inputs());
        inputs.put(broader.sourceSnapshotPath(), hash(archive.files().get(broader.sourceSnapshotPath())));
        broader = new LearningUnitCatalog.Entry(broader.path(), broader.sha256(), "archived", broader.sourceSnapshotPath(),
                inputs, broader.assessmentInputs(), broader.recallInputs());
        var loaded = LearningUnitCatalog.load(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(broader))),
                archive.files()::get, ignored -> {}, mapper);
        assertThat(loaded.definitions()).isEmpty();
        assertThat(loaded.quarantined().get(broader.path())).startsWith("ASSESSMENT_CLAIM_CONFLICT:");
    }

    private LearningUnitCatalog.Entry broaderEntry(Archive archive, LearningUnitCatalog.Entry original) throws Exception {
        var definition = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(archive.files().get(original.path()));
        definition.put("contractId", "broader").put("revision", "2");
        ((com.fasterxml.jackson.databind.node.ObjectNode) definition.get("sourceBinding")).put("placementRevision", "placements-2");
        definition.withArray("ownGoalIds").add("B");
        var b = new com.skillpilot.backend.landscape.LearningGoal();
        b.setId("B"); b.setTitle("Goal B"); b.setDescription("Can apply B"); b.setType("atomic");
        b.setNodeKind("tutor"); b.setSemanticKind("curricularAtomic"); b.setContains(List.of()); b.setRequires(List.of());
        ((com.fasterxml.jackson.databind.node.ObjectNode) definition.get("ownGoalMeanings")).set("B", mapper.valueToTree(LearningUnitSourceBindings.meaning(b)));
        ((com.fasterxml.jackson.databind.node.ObjectNode) definition.get("ownGoalMeaningDigests")).put("B", LearningUnitSourceBindings.meaningDigest(b));
        ((com.fasterxml.jackson.databind.node.ObjectNode) definition.get("ownResolvedKinds")).put("B", "ordinary");
        ((com.fasterxml.jackson.databind.node.ObjectNode) definition.get("atomicPrerequisites")).putArray("B");
        ((com.fasterxml.jackson.databind.node.ArrayNode) definition.path("atomicPrerequisites").path("Q")).add("B");
        ((com.fasterxml.jackson.databind.node.ArrayNode) definition.path("assessmentClaims").path("Q").path("coveredGoalIds")).add("B");
        var snapshot = (com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(archive.files().get(original.sourceSnapshotPath()));
        var source = (com.fasterxml.jackson.databind.node.ObjectNode) snapshot.path("landscapes").get(0);
        source.withArray("goals").add(mapper.valueToTree(b));
        for (var node : source.withArray("goals")) if ("Q".equals(node.path("id").asText())) {
            ((com.fasterxml.jackson.databind.node.ObjectNode) node).withArray("requires").add("B");
            ((com.fasterxml.jackson.databind.node.ObjectNode) node.get("examData")).putArray("coveredGoalIds").add("A").add("B");
        }
        var unit = (com.fasterxml.jackson.databind.node.ObjectNode) source.path("programUnits").get(0).path("learningUnit");
        unit.put("contractId", "broader").put("revision", "2").put("placementRevision", "placements-2");
        source.withArray("goalPlacements").add(mapper.valueToTree(Map.of("goalId", "B", "unitId", "unit", "relation", "primary", "acquisition", true)));
        String contractPath = "DE/Gymnasium/learning-units/contracts/broader/2.json";
        String snapshotPath = "DE/Gymnasium/learning-units/inputs/broader-source.json";
        archive.files().put(contractPath, mapper.writeValueAsBytes(definition));
        archive.files().put(snapshotPath, mapper.writeValueAsBytes(snapshot));
        Map<String, String> inputs = new LinkedHashMap<>(original.inputs());
        inputs.remove(original.sourceSnapshotPath()); inputs.put(snapshotPath, hash(archive.files().get(snapshotPath)));
        return new LearningUnitCatalog.Entry(contractPath, hash(archive.files().get(contractPath)), "active", snapshotPath,
                inputs, original.assessmentInputs(), Map.of());
    }

    Archive archive(String status) throws Exception {
        var fixture = LearningUnitSourceBindingsTest.fixture();
        String contractPath = "DE/Gymnasium/learning-units/contracts/unit/1.json";
        String sourcePath = "DE/Gymnasium/learning-units/inputs/source.json";
        String taskPath = "DE/Gymnasium/learning-units/inputs/Q.task.json";
        String rubricPath = "DE/Gymnasium/learning-units/inputs/Q.rubric.json";
        String reviewPath = "DE/Gymnasium/quality/review.md";
        String viewPath = "DE/Gymnasium/learning-units/inputs/view.json";
        Map<String, byte[]> files = new HashMap<>();
        files.put(contractPath, mapper.writeValueAsBytes(fixture.definition()));
        files.put(sourcePath, mapper.writeValueAsBytes(new LearningUnitCatalog.SourceSnapshot(1, "completion-goal-kinds-v1",
                List.of(fixture.source()), LearningUnitSourceBindingsTest.viewDigests())));
        files.put(viewPath, mapper.writeValueAsBytes(Map.of("viewId", "view")));
        var exam = fixture.goals().get("Q").getExamData();
        files.put(taskPath, mapper.writeValueAsBytes(Map.of("taskContent", exam.getTaskContent(), "solutionContent", exam.getSolutionContent())));
        files.put(rubricPath, mapper.writeValueAsBytes(exam.getScoring()));
        files.put(reviewPath, "Independent normal task and rubric review".getBytes(StandardCharsets.UTF_8));
        Map<String, String> inputs = new LinkedHashMap<>();
        for (String path : List.of(sourcePath, taskPath, rubricPath, reviewPath, viewPath)) inputs.put(path, hash(files.get(path)));
        var entry = new LearningUnitCatalog.Entry(contractPath, hash(files.get(contractPath)), status, sourcePath, inputs,
                Map.of("Q", new LearningUnitCatalog.AssessmentInputs(taskPath, rubricPath)), Map.of());
        return new Archive(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(entry))), files);
    }

    static String hash(byte[] bytes) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
    record Archive(byte[] manifest, Map<String, byte[]> files) { }
}
