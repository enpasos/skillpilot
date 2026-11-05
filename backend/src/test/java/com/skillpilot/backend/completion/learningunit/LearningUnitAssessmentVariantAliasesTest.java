package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class LearningUnitAssessmentVariantAliasesTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void aHistoricalEnglishAlternateCannotAliasAnOtherwiseMatchingGermanAssessment() throws Exception {
        var archive = new LearningUnitCatalogTest().archive("archived");
        var entry = mapper.readValue(archive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        var source = mapper.readValue(archive.files().get(entry.sourceSnapshotPath()), LearningUnitCatalog.SourceSnapshot.class);
        LearningGoal origin = mapper.convertValue(LearningUnitSourceBindingsTest.fixture().goals().get("Q"), LearningGoal.class);
        origin.setId("old-Q");
        origin.getExamData().setTaskContentEn("An unreviewed and much easier English question");
        origin.getExamData().setSolutionContentEn("An unreviewed answer");
        String originPath = "DE/Gymnasium/learning-units/inputs/alias-source.json";
        String mappingPath = "DE/Gymnasium/learning-units/inputs/alias-mapping.json";
        archive.files().put(originPath, mapper.writeValueAsBytes(new LearningUnitCatalog.AliasSource("HE", origin)));
        archive.files().put(mappingPath, mapper.writeValueAsBytes(Map.of("sourceLandscapeId", "HE", "targetLandscapeId", "math",
                "mappings", List.of(Map.of("legacyGoalId", "old-Q", "canonicalGoalId", "Q", "matchType", "exact")))));
        var target = LearningUnitSourceBindingsTest.fixture().goals().get("Q");
        var alias = new LearningUnitCatalog.ResultAlias("HE:old-Q", "Q", originPath,
                LearningUnitSourceBindings.meaningDigest(origin), "assessment", LearningUnitSourceBindings.meaningDigest(target), "assessment",
                mappingPath, "quality/review.md", "Q");
        archive.files().put(entry.sourceSnapshotPath(), mapper.writeValueAsBytes(new LearningUnitCatalog.SourceSnapshot(
                source.schemaVersion(), source.resolverRevision(), source.landscapes(), source.compositionViewDigests(), List.of(alias))));
        var inputs = new LinkedHashMap<>(entry.inputs());
        for (String path : List.of(originPath, mappingPath, entry.sourceSnapshotPath())) {
            inputs.put(path, LearningUnitCatalogTest.hash(archive.files().get(path)));
        }
        var updated = new LearningUnitCatalog.Entry(entry.path(), entry.sha256(), entry.status(), entry.sourceSnapshotPath(),
                inputs, entry.assessmentInputs(), entry.recallInputs());
        var loaded = LearningUnitCatalog.load(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(updated))),
                archive.files()::get, ignored -> {}, mapper);
        assertThat(loaded.definitions()).isEmpty();
        assertThat(loaded.resultAliases()).isEmpty();
        assertThat(loaded.quarantined().values()).singleElement().asString().contains("RESULT_ALIAS_ASSESSMENT_CONFLICT");
    }
}
