package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.landscape.LearningGoal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** A current general mapping cannot substitute for an archived same-meaning result binding. */
class LearningUnitResultAliasTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void frozenOrdinaryAndExactExamAliasesAreAdmittedIndependentlyOfCurrentCountry() throws Exception {
        for (String target : List.of("A", "Q")) {
            var input = aliasArchive(target, target, true, false, false);
            var catalog = load(input);
            assertThat(catalog.quarantined()).isEmpty();
            assertThat(catalog.resultAliases()).containsExactly(Map.entry("HE:old-" + target, target));
        }
    }

    @Test void liveExactUnderstandingMappingCannotAuthenticateAnExamOutcome() throws Exception {
        var catalog = load(aliasArchive("Q", "A", true, false, false));
        assertThat(catalog.definitions()).isEmpty();
        assertThat(catalog.resultAliases()).isEmpty();
        assertThat(catalog.quarantined().values()).singleElement().asString().contains("RESULT_ALIAS_MEANING_CONFLICT");
    }

    @Test void unqualifiedAmbiguousHistoricalKeyCannotBecomeACanonicalOutcome() throws Exception {
        var catalog = load(aliasArchive("Q", "Q", false, false, false));
        assertThat(catalog.definitions()).isEmpty();
        assertThat(catalog.quarantined().values()).singleElement().asString().contains("AMBIGUOUS_RESULT_ALIAS");
    }

    @Test void changedHistoricalTaskCannotBecomeTheCurrentExactExam() throws Exception {
        var catalog = load(aliasArchive("Q", "Q", true, true, false));
        assertThat(catalog.definitions()).isEmpty();
        assertThat(catalog.quarantined().values()).singleElement().asString().contains("RESULT_ALIAS_ASSESSMENT_CONFLICT");
    }

    @Test void sameTaskWithADifferentFrozenCompetenceClaimCannotAliasAnExam() throws Exception {
        var catalog = load(aliasArchive("Q", "Q", true, false, true));
        assertThat(catalog.definitions()).isEmpty();
        assertThat(catalog.quarantined().values()).singleElement().asString().contains("RESULT_ALIAS_ASSESSMENT_CONFLICT");
    }

    private LearningUnitCatalog load(LearningUnitCatalogTest.Archive archive) throws Exception {
        return LearningUnitCatalog.load(archive.manifest(), archive.files()::get,
                ignored -> { throw new AssertionError("A frozen alias cannot consult current mappings/source"); }, mapper);
    }

    private LearningUnitCatalogTest.Archive aliasArchive(String target, String sourceType,
            boolean qualified, boolean changeTask, boolean changeCoverage) throws Exception {
        var archive = new LearningUnitCatalogTest().archive("archived");
        var entry = mapper.readValue(archive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        var source = mapper.readValue(archive.files().get(entry.sourceSnapshotPath()), LearningUnitCatalog.SourceSnapshot.class);
        LearningGoal origin = mapper.convertValue(LearningUnitSourceBindingsTest.fixture().goals().get(sourceType), LearningGoal.class);
        origin.setId("old-" + target);
        if (changeTask) origin.getExamData().setTaskContent("A different and easier question");
        if (changeCoverage) origin.getExamData().setCoveredGoalIds(List.of("A", "unreviewed-B"));
        String originPath = "DE/Gymnasium/learning-units/inputs/alias-source.json";
        String mappingPath = "DE/Gymnasium/learning-units/inputs/alias-mapping.json";
        archive.files().put(originPath, mapper.writeValueAsBytes(new LearningUnitCatalog.AliasSource("HE", origin)));
        archive.files().put(mappingPath, mapper.writeValueAsBytes(Map.of("sourceLandscapeId", "HE", "targetLandscapeId", "math",
                "mappings", List.of(Map.of("legacyGoalId", origin.getId(), "canonicalGoalId", target, "matchType", "exact")))));
        var goal = LearningUnitSourceBindingsTest.fixture().goals().get(target);
        var alias = new LearningUnitCatalog.ResultAlias((qualified ? "HE:" : "") + origin.getId(), target, originPath,
                LearningUnitSourceBindings.meaningDigest(origin), LearningUnitSourceBindings.resolvedKind(origin),
                LearningUnitSourceBindings.meaningDigest(goal), LearningUnitSourceBindings.resolvedKind(goal),
                mappingPath, "quality/review.md", "Q".equals(target) ? "Q" : null);
        archive.files().put(entry.sourceSnapshotPath(), mapper.writeValueAsBytes(new LearningUnitCatalog.SourceSnapshot(
                source.schemaVersion(), source.resolverRevision(), source.landscapes(), source.compositionViewDigests(), List.of(alias))));
        var inputs = new LinkedHashMap<>(entry.inputs());
        for (String path : List.of(originPath, mappingPath, entry.sourceSnapshotPath()))
            inputs.put(path, LearningUnitCatalogTest.hash(archive.files().get(path)));
        var updated = new LearningUnitCatalog.Entry(entry.path(), entry.sha256(), entry.status(), entry.sourceSnapshotPath(),
                inputs, entry.assessmentInputs(), entry.recallInputs());
        return new LearningUnitCatalogTest.Archive(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(updated))), archive.files());
    }
}
