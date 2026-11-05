package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

class LearningUnitAssessmentVariantsTest {
    private final ObjectMapper mapper = new ObjectMapper();
    private static final String TASK_EN = "DE/Gymnasium/learning-units/inputs/Q.en.task.json";
    private static final String REVIEW_EN = "DE/Gymnasium/quality/Q.en.review.json";

    @Test void reviewedEnglishPairPreservesOneCanonicalClaimAndNormalOutcome() throws Exception {
        var archive = bilingualArchive();
        var loaded = load(archive);
        assertThat(loaded.quarantined()).isEmpty();
        var claim = loaded.definitions().getFirst().assessmentClaims().get("Q");
        assertThat(claim.coveredGoalIds()).containsExactly("A");
        assertThat(claim.taskVariants()).containsOnlyKeys("en");
        assertThat(claim.taskVariants().get("en").rubricRevision()).isEqualTo(claim.rubricRevision());
        assertThat(new LearningUnitEvaluator().evaluate(loaded.compiled(), Set.of("Q")).recognizedGoalIds()).containsExactly("A");
    }

    @Test void changedEnglishTaskOrNormalRubricCannotPassAnOtherwisePinnedArchive() throws Exception {
        for (String path : List.of(TASK_EN, "DE/Gymnasium/learning-units/inputs/Q.rubric.json")) {
            var archive = bilingualArchive();
            ObjectNode content = (ObjectNode) mapper.readTree(archive.files().get(path));
            if (path.equals(TASK_EN)) content.put("taskContent", "A different task");
            else content.put("passingPoints", 1);
            archive.files().put(path, mapper.writeValueAsBytes(content));
            archive = repin(archive);
            var loaded = load(archive);
            assertThat(loaded.definitions()).isEmpty();
            assertThat(loaded.quarantined().values()).singleElement().asString().contains("STALE_ASSESSMENT_BINDING");
        }
    }

    @Test void EnglishReviewMustApproveTheExactFrozenClaimAndOrdinaryMeanings() throws Exception {
        for (String mutation : List.of("claim", "meaning", "reviewer", "decision", "rubric")) {
            var archive = bilingualArchive();
            ObjectNode review = (ObjectNode) mapper.readTree(archive.files().get(REVIEW_EN));
            switch (mutation) {
                case "claim" -> review.putArray("coveredGoalIds").add("A").add("foreign");
                case "meaning" -> ((ObjectNode) review.get("coveredGoalMeaningDigests")).put("A", "other");
                case "reviewer" -> review.put("independentReviewer", "");
                case "decision" -> review.put("decision", "pending");
                case "rubric" -> review.put("rubricRevision", "other");
                default -> throw new AssertionError(mutation);
            }
            archive.files().put(REVIEW_EN, mapper.writeValueAsBytes(review));
            var loaded = load(repin(archive));
            assertThat(loaded.definitions()).isEmpty();
            assertThat(loaded.quarantined().values()).singleElement().asString().contains("ASSESSMENT_VARIANT_REVIEW_REQUIRED");
        }
    }

    @Test void aHashAndUnstructuredReviewDoNotAuthorizeAnEnglishVariant() throws Exception {
        var archive = bilingualArchive();
        archive.files().put(REVIEW_EN, "Looks translated".getBytes(StandardCharsets.UTF_8));
        assertThat(load(repin(archive)).definitions()).isEmpty();
    }

    @Test void normalLocalizationFallbackIsBoundAsActuallyServed() throws Exception {
        var fixture = LearningUnitSourceBindingsTest.fixture();
        var exam = fixture.goals().get("Q").getExamData();
        exam.setTaskContentEn("English task");
        // The normal adapter falls back to DE for an absent translated solution.
        var base = fixture.definition().assessmentClaims().get("Q");
        var english = new LearningUnitDefinition.AssessmentTaskVariant(
                LearningUnitAssessmentVariants.taskDigest("English task", exam.getSolutionContent()),
                base.rubricRevision(), "quality/Q.en.review.json");
        var claim = new LearningUnitDefinition.AssessmentClaim(base.coveredGoalIds(), base.taskRevision(),
                base.rubricRevision(), base.reviewRef(), Map.of("en", english));
        assertThat(LearningUnitSourceBindings.assessmentClaimMatches(claim, exam)).isTrue();
        exam.setSolutionContentEn("Changed translated solution");
        assertThat(LearningUnitSourceBindings.assessmentClaimMatches(claim, exam)).isFalse();
        assertThat(LearningUnitSourceBindings.assessmentClaimMatches(base, exam)).isFalse();
    }

    @Test void reviewedVariantMayBeAddedButItsPreviouslyAdmittedMeaningCannotBeReplaced() throws Exception {
        var base = LearningUnitSourceBindingsTest.fixture().definition();
        var bilingual = load(bilingualArchive()).definitions().getFirst();
        ObjectNode second = mapper.valueToTree(bilingual);
        second.put("revision", "2");
        var added = mapper.treeToValue(second, LearningUnitDefinition.class);
        assertThat(new LearningUnitCompiler().compile(List.of(base, added)).units()).hasSize(2);
        ObjectNode third = second.deepCopy();
        third.put("revision", "3");
        ((ObjectNode) third.path("assessmentClaims").path("Q").path("taskVariants").path("en")).put("taskRevision", "other");
        var conflicting = mapper.treeToValue(third, LearningUnitDefinition.class);
        assertThatThrownBy(() -> new LearningUnitCompiler().compile(List.of(base, added, conflicting)))
                .hasMessageContaining("Previously admitted task variant changed");
    }

    @Test void malformedNewEntryIsQuarantinedWithoutWithdrawingTheValidArchive() throws Exception {
        var archive = new LearningUnitCatalogTest().archive("archived");
        ObjectNode manifest = (ObjectNode) mapper.readTree(archive.manifest());
        ObjectNode unknown = manifest.withArray("contracts").get(0).deepCopy();
        unknown.put("path", "DE/Gymnasium/learning-units/contracts/new/1.json").put("newUnknownSemantics", true);
        manifest.withArray("contracts").insert(0, unknown);
        var loaded = LearningUnitCatalog.load(mapper.writeValueAsBytes(manifest), archive.files()::get, ignored -> {}, mapper);
        assertThat(loaded.definitions()).hasSize(1);
        assertThat(loaded.quarantined()).containsOnlyKeys("DE/Gymnasium/learning-units/contracts/new/1.json");
        manifest.put("unknownManifestMeaning", true);
        assertThatThrownBy(() -> LearningUnitCatalog.load(mapper.writeValueAsBytes(manifest), archive.files()::get, ignored -> {}, mapper))
                .hasMessageContaining("Unsupported learning-unit catalog");
    }

    @Test void scopedContractCannotChangeMeaningsOfClaimedAtomsOutsideItsOwnSet() throws Exception {
        var archive = new LearningUnitCatalogTest().archive("archived");
        var original = mapper.readValue(archive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        ObjectNode definition = (ObjectNode) mapper.readTree(archive.files().get(original.path()));
        definition.put("contractId", "external-claim").put("revision", "2");
        definition.putArray("ownGoalIds").add("Q");
        for (String field : List.of("ownGoalMeanings", "ownResolvedKinds", "ownGoalMeaningDigests")) {
            ((ObjectNode) definition.get(field)).remove("A");
        }
        ((ObjectNode) definition.path("sourceBinding")).put("placementRevision", "p2");
        ObjectNode snapshot = (ObjectNode) mapper.readTree(archive.files().get(original.sourceSnapshotPath()));
        ObjectNode landscape = (ObjectNode) snapshot.path("landscapes").get(0);
        for (var goal : landscape.path("goals")) if ("A".equals(goal.path("id").asText())) {
            ((ObjectNode) goal).put("description", "A different ordinary competence under the same ID");
        }
        ((ObjectNode) landscape.path("programUnits").get(0).path("learningUnit"))
                .put("contractId", "external-claim").put("revision", "2").put("placementRevision", "p2");
        var placements = landscape.putArray("goalPlacements");
        placements.add(mapper.valueToTree(Map.of("goalId", "Q", "unitId", "unit", "relation", "assessed", "acquisition", true)));
        String contractPath = "DE/Gymnasium/learning-units/contracts/external-claim/2.json";
        String sourcePath = "DE/Gymnasium/learning-units/inputs/external-claim-source.json";
        archive.files().put(contractPath, mapper.writeValueAsBytes(definition));
        archive.files().put(sourcePath, mapper.writeValueAsBytes(snapshot));
        Map<String, String> inputs = new LinkedHashMap<>(original.inputs());
        inputs.put(sourcePath, LearningUnitCatalogTest.hash(archive.files().get(sourcePath)));
        var candidate = new LearningUnitCatalog.Entry(contractPath, LearningUnitCatalogTest.hash(archive.files().get(contractPath)),
                "active", sourcePath, inputs, original.assessmentInputs(), Map.of());
        var loaded = LearningUnitCatalog.load(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(candidate, original))),
                archive.files()::get, ignored -> {}, mapper);
        assertThat(loaded.definitions()).hasSize(1);
        assertThat(loaded.quarantined().get(contractPath)).contains("Frozen meanings of the full canonical claim changed");
    }

    private LearningUnitCatalog load(LearningUnitCatalogTest.Archive archive) throws Exception {
        return LearningUnitCatalog.load(archive.manifest(), archive.files()::get, ignored -> {}, mapper);
    }

    private LearningUnitCatalogTest.Archive bilingualArchive() throws Exception {
        var archive = new LearningUnitCatalogTest().archive("archived");
        var entry = mapper.readValue(archive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        ObjectNode definition = (ObjectNode) mapper.readTree(archive.files().get(entry.path()));
        ObjectNode snapshot = (ObjectNode) mapper.readTree(archive.files().get(entry.sourceSnapshotPath()));
        for (var goal : snapshot.path("landscapes").get(0).path("goals")) if ("Q".equals(goal.path("id").asText())) {
            ((ObjectNode) goal.path("examData")).put("taskContentEn", "Apply A independently in English.")
                    .put("solutionContentEn", "The complete independent application of A in English.");
        }
        var task = Map.of("taskContent", "Apply A independently in English.",
                "solutionContent", "The complete independent application of A in English.");
        String taskDigest = LearningUnitSourceBindings.canonicalDigest(task);
        String rubricDigest = definition.path("assessmentClaims").path("Q").path("rubricRevision").asText();
        ObjectNode claim = (ObjectNode) definition.path("assessmentClaims").path("Q");
        claim.set("taskVariants", mapper.valueToTree(Map.of("en", new LearningUnitDefinition.AssessmentTaskVariant(taskDigest, rubricDigest, REVIEW_EN))));
        var review = new LearningUnitAssessmentVariants.VariantReview(1, LearningUnitAssessmentVariants.REVIEW_SEMANTICS,
                "Q", "en", List.of("A"), Map.of("A", definition.path("ownGoalMeaningDigests").path("A").asText()),
                taskDigest, rubricDigest, "Independent test reviewer", "same-claim-approved");
        archive.files().put(entry.path(), mapper.writeValueAsBytes(definition));
        archive.files().put(entry.sourceSnapshotPath(), mapper.writeValueAsBytes(snapshot));
        archive.files().put(TASK_EN, mapper.writeValueAsBytes(task));
        archive.files().put(REVIEW_EN, mapper.writeValueAsBytes(review));
        Map<String, String> inputs = new LinkedHashMap<>(entry.inputs());
        inputs.put(TASK_EN, "pending"); inputs.put(REVIEW_EN, "pending");
        var paths = entry.assessmentInputs().get("Q");
        var bilingual = new LearningUnitCatalog.Entry(entry.path(), entry.sha256(), entry.status(), entry.sourceSnapshotPath(), inputs,
                Map.of("Q", new LearningUnitCatalog.AssessmentInputs(paths.taskPath(), paths.rubricPath(),
                        Map.of("en", new LearningUnitCatalog.TaskVariantInputs(TASK_EN, paths.rubricPath())))), Map.of());
        return repin(new LearningUnitCatalogTest.Archive(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(bilingual))), archive.files()));
    }

    private LearningUnitCatalogTest.Archive repin(LearningUnitCatalogTest.Archive archive) throws Exception {
        var entry = mapper.readValue(archive.manifest(), LearningUnitCatalog.Manifest.class).contracts().getFirst();
        Map<String, String> inputs = new LinkedHashMap<>();
        for (String path : entry.inputs().keySet()) inputs.put(path, LearningUnitCatalogTest.hash(archive.files().get(path)));
        var repinned = new LearningUnitCatalog.Entry(entry.path(), LearningUnitCatalogTest.hash(archive.files().get(entry.path())),
                entry.status(), entry.sourceSnapshotPath(), inputs, entry.assessmentInputs(), entry.recallInputs());
        return new LearningUnitCatalogTest.Archive(mapper.writeValueAsBytes(new LearningUnitCatalog.Manifest(1, List.of(repinned))), archive.files());
    }
}
