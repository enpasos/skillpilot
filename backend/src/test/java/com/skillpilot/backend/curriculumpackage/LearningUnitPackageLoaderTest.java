package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.landscape.GoalPlacement;
import com.skillpilot.backend.landscape.ProgramUnit;
import com.skillpilot.backend.landscape.SkillLandscape;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Runtime contract 1.2 (learningUnitsV1): the loader accepts the package and its review records,
 * and the landscape model round-trips every learning-unit field. Synthetic store evidence only;
 * the finished-package validator owns the structural unit rules. No recognition is evaluated.
 */
class LearningUnitPackageLoaderTest {
    @TempDir Path temporary;
    final ObjectMapper mapper = new ObjectMapper();
    static final String REVIEW = "data/learning-units/reviews/0123456789abcdef.json";
    static final String REVIEW_SCHEMA =
            "https://skillpilot.com/schemas/curriculum-package/v1.2/learning-unit-coverage-review.schema.json";
    static final String LANDSCAPE = "data/canonical/landscape.json";
    static final String CATALOG = "data/runtime/catalog.json";

    @Test void loadsRuntime12PackageWithLearningUnitsAndRetainsReviewRecords() throws Exception {
        Fixture fixture = fixture(true);
        var snapshot = fixture.loader().load();
        assertThat(snapshot.packages()).singleElement().satisfies(descriptor ->
                assertThat(descriptor.capabilities()).contains("learningUnitsV1").doesNotContain("assessmentCompletionV1"));
        SkillLandscape landscape = mapper.readValue(
                snapshot.landscapesById().values().iterator().next().json(), SkillLandscape.class);
        assertThat(landscape.getLearningUnitCoverage()).isEqualTo("partial");
        ProgramUnit unit = landscape.getProgramUnits().stream().filter(ProgramUnit::isLearningUnit).findFirst().orElseThrow();
        assertThat(unit.getId()).isEqualTo("addition");
        assertThat(unit.getLabelEn()).isEqualTo("Addition");
        assertThat(unit.getPromise()).startsWith("Ich kann");
        assertThat(unit.getPromiseEn()).startsWith("I can");
        assertThat(unit.getRevision()).isEqualTo("2026-11-12-v1");
        assertThat(landscape.getGoalPlacements()).filteredOn(GoalPlacement::isOwnership).hasSize(2);
        ProgramUnit.CoverageReview review = unit.getCoverageReviews().getFirst();
        assertThat(review.getAssessmentGoalId()).isEqualTo("assessment");
        assertThat(review.getGoalIds()).containsExactly("preparation");
        assertThat(review.getReference()).isEqualTo(REVIEW);
        assertThat(review.getTaskRevision()).startsWith("sha256:");
        assertThat(review.getRubricRevision()).startsWith("sha256:");
        assertThat(snapshot.artifactsByRole().get("learning-unit-coverage-review")).singleElement()
                .satisfies(artifact -> {
                    assertThat(artifact.relativePath()).isEqualTo(REVIEW);
                    assertThat(new String(artifact.contentBytes(), StandardCharsets.UTF_8)).contains("coverage-review");
                });
    }

    @Test void loadsRuntime12PackageWithoutAnyLearningUnitOrReview() throws Exception {
        Fixture fixture = fixture(false);
        assertThat(fixture.loader().load().packages()).singleElement()
                .satisfies(descriptor -> assertThat(descriptor.capabilities()).contains("learningUnitsV1"));
    }

    @Test void modelRoundTripKeepsLearningUnitFieldsAndLeavesCalendarUnitsUnchanged() throws Exception {
        ObjectNode landscape = mapper.createObjectNode().put("landscapeId", "L").put("learningUnitCoverage", "complete");
        ObjectNode year = landscape.putArray("programUnits").addObject();
        year.put("id", "y5").put("kind", "year").put("label", "Jahrgangsstufe 5").put("order", 5);
        ObjectNode unit = landscape.withArray("programUnits").addObject();
        unit.put("id", "u").put("kind", "learningUnit").put("label", "Einheit").put("labelEn", "Unit")
                .put("promise", "Ich kann es.").put("promiseEn", "I can do it.").put("revision", "2026-11-12-v1")
                .put("parentUnitId", "parent").put("order", 2);
        landscape.putArray("goalPlacements").addObject().put("goalId", "Q").put("unitId", "u").put("relation", "own");
        ObjectNode goal = landscape.putArray("goals").addObject().put("id", "Q").put("nodeKind", "exam");
        ObjectNode data = goal.putObject("examData").put("taskContent", "Task").put("solutionContent", "Solution");
        data.putObject("scoring").put("maxPoints", 1).put("passingPoints", 1);
        ObjectNode review = unit.putArray("coverageReviews").addObject().put("assessmentGoalId", "Q");
        review.putArray("goalIds").add("A");
        review.put("reference", "curricula/review.md").put("taskRevision", "sha256:" + "a".repeat(64))
                .put("rubricRevision", "sha256:" + "b".repeat(64));

        JsonNode written = mapper.valueToTree(mapper.treeToValue(landscape, SkillLandscape.class));
        assertThat(written.path("learningUnitCoverage").asText()).isEqualTo("complete");
        // Every authored learning-unit field survives; ProgramUnit keeps its existing convention of
        // serializing absent legacy fields (shortLabel, order, parentUnitId) as null and adds no value.
        ObjectNode writtenUnit = ((ObjectNode) written.path("programUnits").get(1)).deepCopy();
        writtenUnit.properties().removeIf(entry -> entry.getValue().isNull());
        assertThat(writtenUnit).isEqualTo(unit);
        assertThat(written.path("goalPlacements").get(0).has("ownership")).isFalse();
        assertThat(written.path("goalPlacements").get(0).path("relation").asText()).isEqualTo("own");
        // Reviews live on the unit; the goal object is serialized without any learning-unit field.
        assertThat(written.path("goals").get(0).path("examData").has("coverageReview")).isFalse();
        assertThat(written.path("programUnits").get(1).path("coverageReviews").get(0)).isEqualTo(review);
        // Calendar units keep exactly their previous serialization: no learning-unit field appears.
        JsonNode calendar = written.path("programUnits").get(0);
        assertThat(calendar.has("labelEn") || calendar.has("promise") || calendar.has("promiseEn")
                || calendar.has("revision") || calendar.has("coverageReviews")).isFalse();
        assertThat(calendar.has("shortLabel")).isTrue();
        assertThat(mapper.treeToValue(year, ProgramUnit.class).isLearningUnit()).isFalse();
    }

    @Test void rejectsLearningUnitCapabilityOutsideRuntime12() throws Exception {
        Fixture fixture = fixture(true);
        ObjectNode catalog = fixture.read(CATALOG);
        ArrayNode capabilities = catalog.withArray("capabilities");
        capabilities.remove(capabilities.size() - 1);
        fixture.write(CATALOG, catalog);
        assertThatThrownBy(() -> fixture.loader().load()).isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("exact runtime 1.2");
    }

    @Test void runtime10PackageCannotCarryReviewRecords() throws Exception {
        Fixture fixture = fixture(true);
        ObjectNode catalog = fixture.read(CATALOG);
        catalog.put("$schema", "https://skillpilot.com/schemas/curriculum-package/v1/runtime-catalog.schema.json")
                .put("catalogVersion", "1.0").put("runtimeContractVersion", "1.0");
        ArrayNode capabilities = catalog.withArray("capabilities");
        capabilities.remove(capabilities.size() - 1);
        fixture.write(CATALOG, catalog);
        fixture.manifest.put("runtimeContractVersion", "1.0").put("releaseProfile", "full-standalone-v1");
        assertThatThrownBy(() -> fixture.loader().load()).isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("Only runtime 1.2");
    }

    @Test void rejectsReviewRecordWhoseContentDigestOrDiscoveryDiffers() throws Exception {
        Fixture fixture = fixture(true);
        ObjectNode wrapper = fixture.read(REVIEW);
        ((ObjectNode) wrapper.get("definition")).put("content", "Changed after review");
        fixture.write(REVIEW, wrapper);
        assertThatThrownBy(() -> fixture.loader().load()).isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("learning-unit review");

        Fixture undiscovered = fixture(true);
        ObjectNode catalog = undiscovered.read(CATALOG);
        catalog.putArray("learningUnitReviews");
        undiscovered.write(CATALOG, catalog);
        assertThatThrownBy(() -> undiscovered.loader().load()).isInstanceOf(CurriculumPackageException.class)
                .hasMessageContaining("exactly cover the manifest review records");
    }

    private Fixture fixture(boolean withUnits) throws Exception {
        var helper = new CurriculumPackageTestFixture(mapper);
        var store = helper.create(temporary.resolve(UUID.randomUUID().toString()),
                CurriculumPackageTestFixture.PackageSpec.packageSpec("learning-units", 'd'));
        Path root = store.packages().getFirst().packageRoot();
        ObjectNode manifest = (ObjectNode) helper.readJson(root.resolve("metadata/manifest.json"));
        Fixture fixture = new Fixture(root, manifest, store.packages().getFirst().lockEntry());
        ObjectNode landscape = fixture.read(LANDSCAPE);
        landscape.put("$schema", "https://skillpilot.com/schemas/curriculum-package/v1.2/compiled-landscape.schema.json")
                .put("landscapeFormatVersion", "1.2");
        ObjectNode catalog = fixture.read(CATALOG);
        catalog.put("$schema", "https://skillpilot.com/schemas/curriculum-package/v1.2/runtime-catalog.schema.json")
                .put("catalogVersion", "1.2").put("runtimeContractVersion", "1.2");
        catalog.withArray("capabilities").add("learningUnitsV1");
        ArrayNode discovery = catalog.putArray("learningUnitReviews");
        if (withUnits) {
            ObjectNode ordinary = mapper.createObjectNode().put("id", "preparation").put("title", "Explain addition")
                    .put("description", "Explain addition").put("type", "atomic");
            ordinary.putArray("contains");
            ordinary.putArray("requires");
            ObjectNode exam = mapper.createObjectNode().put("id", "assessment").put("title", "Addition assessment")
                    .put("type", "atomic").put("nodeKind", "exam");
            exam.putArray("contains");
            exam.putArray("requires").add("preparation");
            ObjectNode data = exam.putObject("examData");
            data.putArray("coveredGoalIds").add("preparation");
            data.put("taskContent", "Explain two plus two.").put("solutionContent", "Two pairs make four.");
            data.putObject("scoring").put("maxPoints", 1).put("passingPoints", 1).putArray("steps");
            landscape.withArray("goals").add(ordinary).add(exam);
            ObjectNode unit = landscape.withArray("programUnits").addObject().put("id", "addition").put("kind", "learningUnit")
                    .put("label", "Addition").put("labelEn", "Addition")
                    .put("promise", "Ich kann Summen selbstständig bilden.")
                    .put("promiseEn", "I can form sums independently.").put("revision", "2026-11-12-v1");
            ObjectNode review = unit.putArray("coverageReviews").addObject().put("assessmentGoalId", "assessment");
            review.putArray("goalIds").add("preparation");
            review.put("reference", REVIEW).put("taskRevision", "sha256:" + "1".repeat(64))
                    .put("rubricRevision", "sha256:" + "2".repeat(64));
            for (String goal : List.of("assessment", "preparation")) {
                landscape.withArray("goalPlacements").addObject().put("goalId", goal).put("unitId", "addition")
                        .put("relation", "own");
            }
            landscape.put("learningUnitCoverage", "partial");
            String content = "Synthetic coverage review. No learner data.";
            fixture.write(REVIEW, Map.of("artifactFormatVersion", 1, "artifactKind", "coverage-review", "id", REVIEW,
                    "definition", Map.of("mediaType", "text/markdown", "content", content,
                            "sha256", CurriculumPackageFileReader.sha256(content.getBytes(StandardCharsets.UTF_8)))));
            manifest.withArray("files").addObject().put("path", REVIEW).put("role", "learning-unit-coverage-review")
                    .put("mediaType", "application/json").put("runtimeRequired", true)
                    .put("validationSchemaId", REVIEW_SCHEMA).put("licenseExpression", "CC-BY-4.0")
                    .put("provenanceClass", "first-party-content").put("redistributionStatus", "allowed")
                    .set("semanticBinding", mapper.valueToTree(Map.of("kind", "logical-artifact", "logicalId", REVIEW,
                            "normalizationRole", "learning-unit-coverage-review")));
            discovery.addObject().put("id", REVIEW).put("artifactPath", REVIEW);
        }
        fixture.write(LANDSCAPE, landscape);
        fixture.write(CATALOG, catalog);
        manifest.put("runtimeContractVersion", "1.2").put("releaseProfile", "full-standalone-learning-units-v1");
        return fixture;
    }

    private class Fixture {
        final Path root;
        final ObjectNode manifest;
        final Map<String, Object> originalLock;

        Fixture(Path root, ObjectNode manifest, Map<String, Object> originalLock) {
            this.root = root;
            this.manifest = manifest;
            this.originalLock = originalLock;
        }

        ObjectNode read(String path) throws Exception {
            return (ObjectNode) mapper.readTree(root.resolve(path).toFile());
        }

        void write(String path, Object value) throws Exception {
            Files.createDirectories(root.resolve(path).getParent());
            Files.write(root.resolve(path), mapper.writeValueAsBytes(value));
        }

        JsonCurriculumPackageLoader loader() throws Exception {
            for (JsonNode file : manifest.withArray("files")) {
                byte[] bytes = Files.readAllBytes(root.resolve(file.path("path").asText()));
                ((ObjectNode) file).put("bytes", bytes.length).put("sha256", CurriculumPackageFileReader.sha256(bytes));
            }
            byte[] manifestBytes = mapper.writeValueAsBytes(manifest);
            Files.write(root.resolve("metadata/manifest.json"), manifestBytes);
            var old = originalLock;
            var entry = new CurriculumPackageLock.Entry((String) old.get("packageId"), (String) old.get("packageVersion"),
                    (String) old.get("releaseId"), (String) old.get("outerZipSha256"),
                    CurriculumPackageFileReader.sha256(manifestBytes), (String) old.get("contentDigest"),
                    (String) old.get("archiveRoot"), (String) old.get("closureDigest"),
                    (String) old.get("definitionIndexDigest"), (String) old.get("installRecordSha256"));
            CurriculumPackageRepository repository = () -> new CurriculumPackageRepository.ActivePackageSet("fixture-lock",
                    List.of(new InstalledCurriculumPackage(entry, root, manifest.path("files").size())));
            var properties = new CurriculumPackageProperties();
            properties.setConsumerVersion("0.1.0");
            return new JsonCurriculumPackageLoader(properties, repository, new CurriculumPackageFileReader(), mapper);
        }
    }
}
