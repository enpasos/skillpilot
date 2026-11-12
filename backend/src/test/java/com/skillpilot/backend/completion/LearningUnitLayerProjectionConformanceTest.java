package com.skillpilot.backend.completion;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.util.HexFormat;
import org.junit.jupiter.api.Test;

/**
 * Java side of the learning-unit layer projection conformance: the same reference fingerprints
 * that the TypeScript test ({@code app/scripts/testLearningUnitLayerProjection.ts}) proves equal
 * for TypeScript and Python, and canonical Mathematics with its pilot unit bound exactly as the
 * prerequisite-reduction registry binds it.
 */
class LearningUnitLayerProjectionConformanceTest {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Path REPOSITORY = findRepositoryRoot();
    private static final Path CONFORMANCE = REPOSITORY.resolve("app/scripts/fixtures/learning-unit-layer-projection-conformance.json");
    private static final Path REGISTRY = REPOSITORY.resolve("curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json");

    private static Path findRepositoryRoot() {
        for (Path candidate = Path.of("").toAbsolutePath().normalize(); candidate != null; candidate = candidate.getParent()) {
            if (Files.isDirectory(candidate.resolve("curricula")) && Files.isDirectory(candidate.resolve("backend"))) return candidate;
        }
        throw new IllegalStateException("Cannot locate SkillPilot repository root");
    }

    private static String outcome(JsonNode landscape) {
        try {
            return LearningUnitLayerProjection.documentHash(landscape, MAPPER);
        } catch (IllegalArgumentException unprojectable) {
            return "error";
        }
    }

    @Test
    void javaFingerprintsEqualTheSharedReferencesOfTypeScriptAndPython() throws Exception {
        JsonNode conformance = MAPPER.readTree(CONFORMANCE.toFile());
        byte[] casesBytes = Files.readAllBytes(REPOSITORY.resolve(conformance.path("casesPath").asText()));
        assertThat(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(casesBytes)))
                .as("cases changed; regenerate with npx tsx scripts/testLearningUnitLayerProjection.ts --write")
                .isEqualTo(conformance.path("casesSha256").asText());
        JsonNode cases = MAPPER.readTree(casesBytes).path("cases");
        int position = 0;
        for (JsonNode entry : cases) {
            int index = 0;
            for (JsonNode landscape : entry.path("landscapes")) {
                JsonNode reference = conformance.path("references").get(position++);
                assertThat(reference.path("case").asText()).isEqualTo(entry.path("id").asText());
                assertThat(reference.path("index").asInt()).isEqualTo(index++);
                String expected = reference.path("error").asBoolean(false) ? "error" : reference.path("fingerprint").asText();
                assertThat(outcome(landscape)).as("%s[%d]", entry.path("id").asText(), index - 1).isEqualTo(expected);
            }
        }
        assertThat(position).isEqualTo(conformance.path("references").size()).isPositive();
    }

    @Test
    void canonicalMathematicsWithItsPilotUnitKeepsTheRegistryBinding() throws Exception {
        JsonNode math = MAPPER.readTree(CONFORMANCE.toFile()).path("canonicalMathematics");
        ObjectNode document = (ObjectNode) MAPPER.readTree(REPOSITORY.resolve(math.path("path").asText()).toFile());
        boolean present = false;
        for (JsonNode unit : document.path("programUnits")) present |= LearningUnitLayerProjection.isLearningUnit(unit);
        if (!present) {
            ((ArrayNode) document.get("programUnits")).add(math.path("pilotUnit").deepCopy());
            for (JsonNode placement : math.path("pilotPlacements")) ((ArrayNode) document.get("goalPlacements")).add(placement.deepCopy());
        }
        String expected = null;
        for (JsonNode source : MAPPER.readTree(REGISTRY.toFile()).path("catalogSources")) {
            if (source.path("path").asText().equals(math.path("path").asText())) expected = source.path("currentDocumentDigest").asText();
        }
        assertThat(expected).isNotNull();
        assertThat(LearningUnitLayerProjection.documentHash(document, MAPPER)).isEqualTo(expected);
        ObjectNode goalEdit = document.deepCopy();
        ((ObjectNode) goalEdit.path("goals").get(0)).put("title", "changed");
        assertThat(LearningUnitLayerProjection.documentHash(goalEdit, MAPPER)).isNotEqualTo(expected);
    }

    @Test
    void projectionRemovesExactlyTheLearningUnitLayer() throws Exception {
        JsonNode plain = MAPPER.readTree("""
                {"landscapeId":"L","goals":[{"id":"a"}],"programUnits":[{"id":"p","kind":"program","label":"P"}],
                 "goalPlacements":[{"goalId":"a","unitId":"p","relation":"primary","context":{"stage":"SekI"}}]}""");
        assertThat(LearningUnitLayerProjection.projectOutLearningUnits(plain)).isEqualTo(plain);
        ObjectNode layered = plain.deepCopy();
        ((ArrayNode) layered.get("programUnits")).add(MAPPER.readTree("""
                {"id":"u","kind":"learningUnit","label":"U","coverageReviews":[{"assessmentGoalId":"a"}]}"""));
        ((ArrayNode) layered.get("goalPlacements")).add(MAPPER.readTree("{\"goalId\":\"a\",\"unitId\":\"u\",\"relation\":\"own\"}"))
                .add(MAPPER.readTree("{\"goalId\":\"a\",\"unitId\":\"u\",\"relation\":\"primary\"}"));
        layered.put("learningUnitCoverage", "partial");
        String before = layered.toString();
        assertThat(LearningUnitLayerProjection.projectOutLearningUnits(layered)).isEqualTo(plain);
        assertThat(layered.toString()).as("input is not modified").isEqualTo(before);
        JsonNode onlyLayer = MAPPER.readTree("""
                {"landscapeId":"L","goals":[],"programUnits":[{"id":"u","kind":"learningUnit"}],
                 "goalPlacements":[{"goalId":"a","unitId":"u","relation":"own"}]}""");
        assertThat(LearningUnitLayerProjection.projectOutLearningUnits(onlyLayer)).isEqualTo(MAPPER.readTree("{\"landscapeId\":\"L\",\"goals\":[]}"));
        JsonNode empty = MAPPER.readTree("{\"landscapeId\":\"L\",\"programUnits\":[],\"goalPlacements\":[]}");
        assertThat(LearningUnitLayerProjection.projectOutLearningUnits(empty)).isEqualTo(empty);
        JsonNode calendarBelowUnit = MAPPER.readTree("""
                {"programUnits":[{"id":"u","kind":"learningUnit"},{"id":"y","kind":"year","parentUnitId":"u"}]}""");
        assertThatThrownBy(() -> LearningUnitLayerProjection.projectOutLearningUnits(calendarBelowUnit))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
