package com.skillpilot.backend.curriculumpackage;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillpilot.backend.completion.learningunit.LearningUnitApplicationService;
import com.skillpilot.backend.completion.learningunit.LearningUnitCatalog;
import com.skillpilot.backend.completion.learningunit.LearningUnitOfferBindings;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import com.skillpilot.backend.completion.learningunit.LearningUnitPackageBindings;
import com.skillpilot.backend.landscape.GoalMappingService;

/** Selection from already manifest-verified wrappers; the installed ZIP proof covers the real loader. */
class PackageNativeMappingInputsTest {
    private static final String LIVE = "DE/Gymnasium/mapping/AA/native.json";
    private final ObjectMapper mapper = new ObjectMapper();

    @Test void capabilityAndInputRoleSelectOnlyLiveNativeDocumentsIndependentlyOfABrokenCurrentPointer() throws Exception {
        byte[] mapping = nativeMapping();
        var live = input("offer", LIVE, mapping, false);
        var archived = input("offer", "DE/Gymnasium/learning-units/sources/archive/mapping/old.json", mapping, false);
        var review = input("offer", "DE/Gymnasium/mapping/AA/native.review.json", mapping, false);
        var reviewShape = mapper.readTree(mapping); ((com.fasterxml.jackson.databind.node.ObjectNode) reviewShape).put("reviewId", "review-only");
        var disguisedReview = input("offer", "DE/Gymnasium/mapping/AA/metadata.json", mapper.writeValueAsBytes(reviewShape), false);
        var unrelatedPackage = input("old", "DE/Gymnasium/mapping/AA/old-package.json", mapping, false);
        var catalog = input("offer", "DE/Gymnasium/learning-units/offers/test.catalog.json",
                mapper.writeValueAsBytes(Map.of("schemaVersion", 1, "contracts", List.of(), "currentOfferBinding", "broken")), false);
        var snapshot = snapshot(List.of(live, archived, review, disguisedReview, unrelatedPackage), List.of(catalog));
        Map<String, Map<String, byte[]>> selected = read(snapshot);
        assertThat(selected).containsOnlyKeys("offer");
        assertThat(selected.get("offer")).containsOnlyKeys(LIVE);
        assertThat(selected.get("offer").get(LIVE)).isEqualTo(mapping);
    }

    @Test void anUnverifiedSourcePayloadDoesNotBecomeAnEmptyHealthyOperationalFallback() throws Exception {
        var snapshot = snapshot(List.of(input("offer", LIVE, nativeMapping(), true)), List.of());
        // The selected package remains present so the mapper exposes unavailable,
        // rather than interpreting absence as a legacy compiled-mapping package.
        assertThat(read(snapshot)).containsOnlyKeys("offer").containsEntry("offer", Map.of());
    }

    @Test void malformedLiveShapeCannotDisappearBesideAnotherValidDocument() throws Exception {
        assertMalformedCandidate(mapper.writeValueAsBytes(Map.of("version", 1, "sourceLandscapeId", "legacy",
                "targetLandscapeId", "math", "mappings", "broken")));
    }

    @Test void malformedLiveJsonRetainsItsDigestWithoutAbortingHistoricalPackageBindings() throws Exception {
        assertMalformedCandidate("{".getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    private void assertMalformedCandidate(byte[] broken) throws Exception {
        String badPath = "DE/Gymnasium/mapping/AA/broken.json";
        var snapshot = snapshot(List.of(input("offer", LIVE, nativeMapping(), false), input("offer", badPath, broken, false)), List.of());
        when(snapshot.landscapesById()).thenReturn(Map.of());
        Map<String, Map<String, byte[]>> selected = read(snapshot);
        assertThat(selected.get("offer")).containsOnlyKeys(LIVE, badPath);
        var state = mock(PackageLandscapeMappingState.class);
        when(state.packageId()).thenReturn("offer"); when(state.targetLandscapeId()).thenReturn("math");
        when(state.sourceLandscapesById()).thenReturn(Map.of("legacy", new PackageLandscapeMappingState.SourceLandscapeMetadata(
                "legacy", "DE-HE", "Math", "SekI", List.of("source"))));
        var merged = mock(PackageLandscapeMappingState.Merged.class); when(merged.packageStates()).thenReturn(List.of(state));
        var mappings = new GoalMappingService(merged, mapper, selected);
        assertThat(mappings.operationalProjectionAvailable()).isFalse();
        org.assertj.core.api.Assertions.assertThatThrownBy(mappings::requireOperationalProjection)
                .isInstanceOf(GoalMappingService.ProjectionUnavailableException.class);
        var bindings = new LearningUnitPackageBindings(snapshot, LearningUnitApplicationService.packageInputs(snapshot, mapper), mapper);
        assertThat(bindings.nativeMappingInputDigests()).containsOnlyKeys(LIVE, badPath)
                .containsEntry(badPath, CurriculumPackageFileReader.sha256(broken));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Map<String, byte[]>> read(CurriculumRuntimeSnapshot snapshot) {
        return ReflectionTestUtils.invokeMethod(PackageCurriculumDomainState.class, "readNativeMappingDocuments", snapshot, mapper);
    }

    private CurriculumRuntimeSnapshot snapshot(List<CurriculumRuntimeSnapshot.Artifact> inputs,
                                               List<CurriculumRuntimeSnapshot.Artifact> catalogs) {
        var snapshot = mock(CurriculumRuntimeSnapshot.class);
        when(snapshot.packages()).thenReturn(List.of(descriptor("offer", List.of(LearningUnitOfferBindings.CAPABILITY)),
                descriptor("old", List.of())));
        when(snapshot.artifactsByRole()).thenReturn(Map.of(LearningUnitCatalog.INPUT_ROLE, inputs,
                LearningUnitCatalog.CATALOG_ROLE, catalogs));
        return snapshot;
    }

    private CurriculumRuntimeSnapshot.PackageDescriptor descriptor(String id, List<String> capabilities) {
        return new CurriculumRuntimeSnapshot.PackageDescriptor(id, "1", id + "@1", "a".repeat(64), "a".repeat(64),
                "a".repeat(64), "a".repeat(64), "a".repeat(64), List.of(), capabilities);
    }

    private CurriculumRuntimeSnapshot.Artifact input(String packageId, String path, byte[] bytes, boolean wrongHash) throws Exception {
        var artifact = mock(CurriculumRuntimeSnapshot.Artifact.class);
        when(artifact.packageId()).thenReturn(packageId);
        when(artifact.contentBytes()).thenReturn(mapper.writeValueAsBytes(Map.of("artifactFormatVersion", 1,
                "artifactKind", "input", "id", LearningUnitApplicationService.packageArtifactIdentity(path), "definition",
                Map.of("sourcePath", path, "contentBase64", Base64.getEncoder().encodeToString(bytes),
                        "sha256", wrongHash ? "0".repeat(64) : CurriculumPackageFileReader.sha256(bytes)))));
        return artifact;
    }

    private byte[] nativeMapping() throws Exception {
        return mapper.writeValueAsBytes(Map.of("version", 1, "sourceLandscapeId", "legacy", "targetLandscapeId", "math",
                "mappings", List.of(Map.of("legacyGoalId", "L", "canonicalGoalId", "A", "matchType", "partial"))));
    }
}
