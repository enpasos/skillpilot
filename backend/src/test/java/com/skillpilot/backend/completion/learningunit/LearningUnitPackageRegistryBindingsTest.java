package com.skillpilot.backend.completion.learningunit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.skillpilot.backend.curriculumpackage.CurriculumRuntimeSnapshot;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class LearningUnitPackageRegistryBindingsTest {
    private static final String MATH = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
    private static final String USED_SOURCE = "2796fc7b-ba9d-446f-8f26-711dd6d8a9a3";
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void exactThreeRealRegistriesBindUsedMathWithoutInstallingForeignSubjects() throws Exception {
        var files = files();
        assertThat(mapper.readTree(files.get(LearningUnitPackageRegistryBindings.SOURCE)).path("entries").size()).isGreaterThan(31);
        for (var input : files.entrySet()) validate(input.getKey(), input.getValue(), files);
    }

    @Test void rebindingSourceBytesCannotChangeAConsumedInstalledJurisdiction() throws Exception {
        var files = files();
        var registry = mapper.readTree(files.get(LearningUnitPackageRegistryBindings.SOURCE));
        for (JsonNode entry : registry.path("entries")) if (USED_SOURCE.equals(entry.path("landscapeId").asText())) {
            ((ObjectNode) entry).put("jurisdiction", "DE-BY");
        }
        byte[] changed = mapper.writeValueAsBytes(registry); files.put(LearningUnitPackageRegistryBindings.SOURCE, changed);
        assertThatThrownBy(() -> validate(LearningUnitPackageRegistryBindings.SOURCE, changed, files))
                .hasMessageContaining("Consumed source jurisdiction differs");
    }

    @Test void consumedCanonicalRegistryCannotInventAnInstalledGoalOrDimension() throws Exception {
        var files = files();
        var registry = mapper.readTree(files.get(LearningUnitPackageRegistryBindings.PROVENANCE));
        for (JsonNode record : registry.path("landscapes")) if (MATH.equals(record.path("landscapeId").asText())) {
            ((ObjectNode) record.path("goalProvenance")).putObject("unknown-installed-goal").put("sourceLandscapeId", USED_SOURCE);
        }
        byte[] changed = mapper.writeValueAsBytes(registry); files.put(LearningUnitPackageRegistryBindings.PROVENANCE, changed);
        assertThatThrownBy(() -> validate(LearningUnitPackageRegistryBindings.PROVENANCE, changed, files))
                .hasMessageContaining("unknown installed goal");
        registry = mapper.readTree(files.get(LearningUnitPackageRegistryBindings.OVERRIDES));
        ((ObjectNode) registry).withArray("landscapes").addObject().put("landscapeId", MATH)
                .putObject("goalApplicabilityOverrides").putObject("3016ec37-1c2e-47db-83f5-e767923bc97e")
                .putArray("unknown-dimension").add("value");
        byte[] override = mapper.writeValueAsBytes(registry); files.put(LearningUnitPackageRegistryBindings.OVERRIDES, override);
        assertThatThrownBy(() -> validate(LearningUnitPackageRegistryBindings.OVERRIDES, override, files))
                .hasMessageContaining("Unsupported consumed applicability dimension");
    }

    @Test void changedUnpinnedBytesAndUnknownRegistryPathsNeverBecomeAGenericJsonBypass() throws Exception {
        var files = files();
        assertThatThrownBy(() -> validate(LearningUnitPackageRegistryBindings.SOURCE, "{}".getBytes(), files))
                .hasMessageContaining("package-bound source bytes");
        var snapshot = mock(CurriculumRuntimeSnapshot.class);
        when(snapshot.landscapesById()).thenReturn(Map.of()); when(snapshot.packages()).thenReturn(List.of());
        var adapter = new LearningUnitPackageBindings(snapshot, files, mapper);
        assertThatThrownBy(() -> adapter.validateCurrentOfferInput("DE/Gymnasium/provenance/other-registry.json",
                files.get(LearningUnitPackageRegistryBindings.SOURCE)))
                .hasMessageContaining("Unsupported current runtime input kind");
    }

    @Test void unsupportedRegistryVersionsFailClosed() throws Exception {
        var files = files();
        var registry = (ObjectNode) mapper.readTree(files.get(LearningUnitPackageRegistryBindings.SOURCE)); registry.put("version", 2);
        byte[] changed = mapper.writeValueAsBytes(registry); files.put(LearningUnitPackageRegistryBindings.SOURCE, changed);
        assertThatThrownBy(() -> validate(LearningUnitPackageRegistryBindings.SOURCE, changed, files))
                .hasMessageContaining("shape/version");
    }

    @Test void reviewedAssessmentClusterEnrichmentDoesNotChangeAnyAtomicResultMeaning() throws Exception {
        validateCurrentEnrichment(false, true);
    }

    @Test void evenALedgerClaimCannotRetypeAnOrdinaryAtomicResultAsAnAssessment() {
        assertThatThrownBy(() -> validateCurrentEnrichment(true, true))
                .hasMessageContaining("Installed current resolved goal kind differs");
    }

    @Test void aStructuralKindEnrichmentStillRequiresItsExactAuthoritativeLedgerDecision() {
        assertThatThrownBy(() -> validateCurrentEnrichment(false, false))
                .hasMessageContaining("lacks its pinned authoritative ledger decision");
    }

    private void validateCurrentEnrichment(boolean retypeAtom, boolean reviewed) throws Exception {
        String path = "DE/Gymnasium/canonical/test.json";
        var raw = mapper.createObjectNode().put("landscapeId", MATH);
        var goals = raw.putArray("goals");
        goals.addObject().put("id", "assessment-cluster").put("type", "cluster").putArray("contains").add("ordinary");
        goals.addObject().put("id", "ordinary").put("type", "atomic");
        var installed = raw.deepCopy();
        ((ObjectNode) installed.path("goals").get(0)).put("semanticKind", "practiceAssessment");
        ((ObjectNode) installed.path("goals").get(1)).put("semanticKind", retypeAtom ? "practiceAssessment" : "curricularAtomic");
        var ledger = mapper.createObjectNode().put("documentType", "semantic-kind-ledger");
        if (reviewed) {
            var decisions = ledger.putArray("decisions");
            decisions.addObject().put("goalId", "assessment-cluster").put("semanticKind", "practiceAssessment").put("decisionStatus", "authoritative");
            decisions.addObject().put("goalId", "ordinary").put("semanticKind", retypeAtom ? "practiceAssessment" : "curricularAtomic").put("decisionStatus", "authoritative");
        }
        byte[] rawBytes = mapper.writeValueAsBytes(raw);
        Map<String, byte[]> inputs = Map.of(path, rawBytes, "DE/Gymnasium/quality/test-ledger.json", mapper.writeValueAsBytes(ledger));
        var snapshot = mock(CurriculumRuntimeSnapshot.class);
        when(snapshot.packages()).thenReturn(List.of());
        when(snapshot.landscapesById()).thenReturn(Map.of(MATH, new CurriculumRuntimeSnapshot.LandscapeDescriptor(
                "test", MATH, "root", "de-DE", "test", "test", "DE", null, "Gymnasium",
                null, null, null, mapper.writeValueAsString(installed))));
        new LearningUnitPackageBindings(snapshot, inputs, mapper).validateCurrentOfferInput(path, rawBytes);
    }

    private void validate(String path, byte[] bytes, Map<String, byte[]> files) throws Exception {
        JsonNode math = mapper.readTree(Files.readAllBytes(Path.of("../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json")));
        LearningUnitPackageRegistryBindings.validate(path, bytes, mapper.readTree(bytes), files, Map.of(MATH, math),
                Map.of(USED_SOURCE, "DE-HE"), mapper);
    }
    private Map<String, byte[]> files() throws Exception {
        Map<String, byte[]> files = new LinkedHashMap<>();
        for (String path : List.of(LearningUnitPackageRegistryBindings.SOURCE, LearningUnitPackageRegistryBindings.PROVENANCE,
                LearningUnitPackageRegistryBindings.OVERRIDES)) files.put(path, Files.readAllBytes(Path.of("../curricula").resolve(path)));
        return files;
    }
}
