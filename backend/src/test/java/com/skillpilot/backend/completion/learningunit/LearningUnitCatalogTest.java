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

    private Archive archive(String status) throws Exception {
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

    private static String hash(byte[] bytes) throws Exception { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes)); }
    private record Archive(byte[] manifest, Map<String, byte[]> files) { }
}
