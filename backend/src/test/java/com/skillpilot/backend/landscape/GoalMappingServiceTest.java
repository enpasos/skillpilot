package com.skillpilot.backend.landscape;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import com.skillpilot.backend.curriculumpackage.PackageLandscapeMappingState;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class GoalMappingServiceTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void capabilityNativeDocumentsUseRepositoryOrderingAndFirstPartialIndexWithoutReviewUnion() throws Exception {
        String firstPath = "DE/Gymnasium/mapping/AA/a.json";
        String secondPath = "DE/Gymnasium/mapping/ZZ/z.json";
        byte[] first = nativeDocument("canon-1", "partial");
        byte[] second = nativeDocument("canon-2", "partial");
        writeJson(tempDir.resolve(firstPath), new String(first, java.nio.charset.StandardCharsets.UTF_8));
        writeJson(tempDir.resolve(secondPath), new String(second, java.nio.charset.StandardCharsets.UTF_8));
        var repository = createService(tempDir);
        var reviewOnly = new ResolvedGoalMapping("legacy-math", "canonical-math", "legacy-1", "review-only", "partial", "compiled-review");
        var merged = packageMappings("offer", List.of(reviewOnly));
        var operational = new GoalMappingService(merged, objectMapper,
                Map.of("offer", Map.of(secondPath, second, firstPath, first)));
        assertThat(operational.getAllMappings().stream().map(this::tuple).toList())
                .containsExactlyElementsOf(repository.getAllMappings().stream().map(this::tuple).toList());
        assertThat(operational.findByLegacyGoalId("legacy-1")).get()
                .extracting(ResolvedGoalMapping::canonicalGoalId, ResolvedGoalMapping::sourceFile)
                .containsExactly("canon-1", firstPath);
        assertThat(operational.findAllByLegacyGoalId("legacy-1")).hasSize(2);
        assertThat(merged.packageStates().getFirst().mappings()).containsExactly(reviewOnly);
        assertThat(operational.getAllMappings()).noneMatch(mapping -> "review-only".equals(mapping.canonicalGoalId()));
    }

    @Test
    void nativeCapabilitySelectionDoesNotChangeAnotherPackagesCompiledRelation() throws Exception {
        var nativeState = packageState("offer", List.of(new ResolvedGoalMapping(
                "legacy-math", "canonical-math", "review-source", "review-only", "partial", "review")));
        var ordinary = new ResolvedGoalMapping("legacy-other", "canonical-other", "ordinary-source", "ordinary-goal", "exact", "package:old");
        var oldState = packageState("old", List.of(ordinary));
        var merged = org.mockito.Mockito.mock(PackageLandscapeMappingState.Merged.class);
        org.mockito.Mockito.when(merged.packageStates()).thenReturn(List.of(nativeState, oldState));
        var operational = new GoalMappingService(merged, objectMapper,
                Map.of("offer", Map.of("DE/Gymnasium/mapping/AA/native.json", nativeDocument("canon-1", "partial"))));
        assertThat(operational.getAllMappings()).contains(ordinary).noneMatch(mapping -> "review-only".equals(mapping.canonicalGoalId()));
        assertThat(operational.findByLegacyGoalId("ordinary-source")).contains(ordinary);
    }

    @Test
    void missingMalformedArchivedAndReviewInputsNeverFallBackToTheCompiledRelation() throws Exception {
        var merged = packageMappings("offer", List.of(new ResolvedGoalMapping(
                "legacy-math", "canonical-math", "legacy-1", "review-only", "exact", "review")));
        for (Map<String, byte[]> documents : List.<Map<String, byte[]>>of(
                Map.of(), Map.of("DE/Gymnasium/mapping/AA/native.json", "{}".getBytes()),
                Map.of("DE/Gymnasium/learning-units/sources/archive/mapping/native.json", nativeDocument("canon-1", "partial")),
                Map.of("DE/Gymnasium/mapping/AA/native.review.json", nativeDocument("canon-1", "partial")))) {
            var unavailable = new GoalMappingService(merged, objectMapper, Map.of("offer", documents));
            assertThat(unavailable.operationalProjectionAvailable()).isFalse();
            assertThatThrownBy(unavailable::getAllMappings).isInstanceOf(GoalMappingService.ProjectionUnavailableException.class);
            assertThatThrownBy(() -> unavailable.findByLegacyGoalId("legacy-1")).isInstanceOf(GoalMappingService.ProjectionUnavailableException.class);
        }
    }

    @Test
    void nativeParserRetainsItsExactConflictAndVersionChecks() throws Exception {
        var merged = packageMappings("offer", List.of());
        var conflict = new GoalMappingService(merged, objectMapper, Map.of("offer", Map.of(
                "DE/Gymnasium/mapping/AA/a.json", nativeDocument("canon-1", "partial"),
                "DE/Gymnasium/mapping/ZZ/z.json", nativeDocument("canon-2", "exact"))));
        assertThatThrownBy(conflict::getAllMappings).hasMessageContaining("Conflicting goal mappings");
        var wrong = objectMapper.readTree(nativeDocument("canon-1", "partial"));
        ((com.fasterxml.jackson.databind.node.ObjectNode) wrong).put("version", 99);
        var version = new GoalMappingService(merged, objectMapper, Map.of("offer", Map.of(
                "DE/Gymnasium/mapping/AA/native.json", objectMapper.writeValueAsBytes(wrong))));
        assertThatThrownBy(version::getAllMappings).hasMessageContaining("Unsupported goal mapping version");
    }

    private List<String> tuple(ResolvedGoalMapping mapping) {
        return List.of(mapping.sourceLandscapeId(), mapping.targetLandscapeId(), mapping.legacyGoalId(), mapping.canonicalGoalId(), mapping.matchType());
    }

    private byte[] nativeDocument(String target, String matchType) throws Exception {
        return objectMapper.writeValueAsBytes(Map.of("version", 1, "sourceLandscapeId", "legacy-math",
                "targetLandscapeId", "canonical-math", "mappings", List.of(Map.of("legacyGoalId", "legacy-1",
                        "canonicalGoalId", target, "matchType", matchType))));
    }

    private PackageLandscapeMappingState.Merged packageMappings(String id, List<ResolvedGoalMapping> review) {
        var state = packageState(id, review);
        var merged = org.mockito.Mockito.mock(PackageLandscapeMappingState.Merged.class);
        org.mockito.Mockito.when(merged.packageStates()).thenReturn(List.of(state));
        return merged;
    }

    private PackageLandscapeMappingState packageState(String id, List<ResolvedGoalMapping> review) {
        var state = org.mockito.Mockito.mock(PackageLandscapeMappingState.class);
        org.mockito.Mockito.when(state.packageId()).thenReturn(id);
        org.mockito.Mockito.when(state.targetLandscapeId()).thenReturn("canonical-math");
        org.mockito.Mockito.when(state.sourceLandscapesById()).thenReturn(Map.of("legacy-math",
                new PackageLandscapeMappingState.SourceLandscapeMetadata("legacy-math", "DE-HE", "Math", "SekI", List.of("source"))));
        org.mockito.Mockito.when(state.mappings()).thenReturn(review);
        return state;
    }

    @TempDir
    Path tempDir;

    @Test
    void loadsGoalMappingsAndIndexesByLegacyGoalId() throws IOException {
        writeJson(tempDir.resolve("mapping/math_legacy_to_canonical.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-1",
                      "matchType": "exact"
                    },
                    {
                      "legacyGoalId": "legacy-2",
                      "canonicalGoalId": "canon-2",
                      "matchType": "partial"
                    }
                  ]
                }
                """);

        writeJson(tempDir.resolve("json/legacy_landscape.json"), """
                {
                  "landscapeId": "legacy-math",
                  "title": "Legacy Math",
                  "goals": []
                }
                """);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).hasSize(2);
        assertThat(service.findByLegacyGoalId("legacy-1"))
                .get()
                .extracting(
                        ResolvedGoalMapping::sourceLandscapeId,
                        ResolvedGoalMapping::targetLandscapeId,
                        ResolvedGoalMapping::canonicalGoalId,
                        ResolvedGoalMapping::matchType,
                        ResolvedGoalMapping::sourceFile)
                .containsExactly("legacy-math", "canonical-math", "canon-1", "exact",
                        tempDir.resolve("mapping/math_legacy_to_canonical.json").toString());
        assertThat(service.findByLegacyGoalId("missing")).isEmpty();
        assertThat(service.getMappingsForSourceLandscape("legacy-math")).hasSize(2);
    }

    @Test
    void ignoresNonMappingJsonFiles() throws IOException {
        writeJson(tempDir.resolve("json/random.json"), """
                {
                  "hello": "world"
                }
                """);
        writeJson(tempDir.resolve("json/landscape.json"), """
                {
                  "landscapeId": "some-landscape",
                  "title": "Some Landscape",
                  "goals": []
                }
                """);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).isEmpty();
    }

    @Test
    void doesNotParseJsonFilesOutsideMappingDirectories() throws IOException {
        writeJson(tempDir.resolve("json/broken.json"), "{");
        writeJson(tempDir.resolve("input/HE/source-json/source-extraction.json"), "{");
        writeJson(tempDir.resolve("mapping/runtime.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-1",
                      "matchType": "exact"
                    }
                  ]
                }
                """);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).hasSize(1);
        assertThat(service.findByLegacyGoalId("legacy-1")).isPresent();
    }

    @Test
    void ignoresConflictingHistoricalMappingsInsideQualityDirectories() throws IOException {
        Path activeMapping = tempDir.resolve("DE/Gymnasium/mapping/state/runtime.json");
        writeJson(activeMapping, """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-current",
                      "matchType": "exact"
                    }
                  ]
                }
                """);
        String historicalMapping = """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-historical",
                      "matchType": "exact"
                    }
                  ]
                }
                """;
        writeJson(tempDir.resolve(
                "DE/Gymnasium/quality/goal-evidence/review/inputs/curricula/DE/Gymnasium/mapping/state/runtime.json"),
                historicalMapping);
        writeJson(tempDir.resolve("other-curriculum/quality/review/mapping/runtime.json"), historicalMapping);
        writeJson(tempDir.resolve("mapping/quality/review/runtime.json"), historicalMapping);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).hasSize(1);
        assertThat(service.findByLegacyGoalId("legacy-1"))
                .get()
                .extracting(ResolvedGoalMapping::canonicalGoalId, ResolvedGoalMapping::sourceFile)
                .containsExactly("canon-current", activeMapping.toString());
    }

    @Test
    void doesNotParseMalformedHistoricalMappingsInsideQualityDirectories() throws IOException {
        writeJson(tempDir.resolve("mapping/runtime.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": []
                }
                """);
        writeJson(tempDir.resolve("quality/review/inputs/mapping/broken.json"), "{");

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).isEmpty();
    }

    @Test
    void rejectsConflictingMappingsForSameLegacyGoalId() throws IOException {
        writeJson(tempDir.resolve("mapping/one.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-1",
                      "matchType": "exact"
                    }
                  ]
                }
                """);
        writeJson(tempDir.resolve("mapping/two.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-2",
                      "matchType": "exact"
                    }
                  ]
                }
                """);

        assertThatThrownBy(() -> createService(tempDir))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Conflicting goal mappings for legacyGoalId legacy-1");
    }

    @Test
    void allowsOneLegacyGoalToMapPartiallyToMultipleCanonicalGoals() throws IOException {
        writeJson(tempDir.resolve("mapping/one_to_many_partial.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-chemistry",
                  "targetLandscapeId": "canonical-chemistry",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-practicum",
                      "canonicalGoalId": "canon-analysis",
                      "matchType": "partial"
                    },
                    {
                      "legacyGoalId": "legacy-practicum",
                      "canonicalGoalId": "canon-synthesis",
                      "matchType": "partial"
                    }
                  ]
                }
                """);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).hasSize(2);
        assertThat(service.findAllByLegacyGoalId("legacy-practicum"))
                .extracting(ResolvedGoalMapping::canonicalGoalId)
                .containsExactly("canon-analysis", "canon-synthesis");
        assertThat(service.findByLegacyGoalId("legacy-practicum"))
                .get()
                .extracting(ResolvedGoalMapping::canonicalGoalId)
                .isEqualTo("canon-analysis");
    }

    @Test
    void ignoresSourceExtractionReviewFilesWithOneSourceToManyDecisions() throws IOException {
        writeJson(tempDir.resolve("mapping/runtime.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-runtime",
                      "canonicalGoalId": "canon-runtime",
                      "matchType": "exact"
                    }
                  ]
                }
                """);
        writeJson(tempDir.resolve("mapping/source_extraction.review.json"), """
                {
                  "version": 1,
                  "reviewId": "source-extraction-review",
                  "sourceLandscapeId": "source-extraction-math",
                  "targetLandscapeId": "canonical-math",
                  "sourceExtractionPath": "curricula/source-extraction.json",
                  "mappings": [
                    {
                      "legacyGoalId": "source-goal-1",
                      "canonicalGoalId": "canon-1",
                      "matchType": "exact"
                    },
                    {
                      "legacyGoalId": "source-goal-1",
                      "canonicalGoalId": "canon-2",
                      "matchType": "exact"
                    }
                  ],
                  "decisions": [
                    {
                      "sourceGoalId": "source-goal-1",
                      "decision": "mapped",
                      "canonicalGoalIds": ["canon-1", "canon-2"]
                    }
                  ]
                }
                """);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).hasSize(1);
        assertThat(service.findByLegacyGoalId("legacy-runtime")).isPresent();
        assertThat(service.findByLegacyGoalId("source-goal-1")).isEmpty();
    }

    @Test
    void doesNotParseReviewJsonFilesAsRuntimeMappings() throws IOException {
        writeJson(tempDir.resolve("mapping/source_extraction.review.json"), "{");
        writeJson(tempDir.resolve("mapping/runtime.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-runtime",
                      "canonicalGoalId": "canon-runtime",
                      "matchType": "exact"
                    }
                  ]
                }
                """);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).hasSize(1);
        assertThat(service.findByLegacyGoalId("legacy-runtime")).isPresent();
    }

    @Test
    void rejectsUnsupportedMatchTypes() throws IOException {
        writeJson(tempDir.resolve("mapping/invalid.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "legacy-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": [
                    {
                      "legacyGoalId": "legacy-1",
                      "canonicalGoalId": "canon-1",
                      "matchType": "broader"
                    }
                  ]
                }
                """);

        assertThatThrownBy(() -> createService(tempDir))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Unsupported matchType");
    }

    @Test
    void allowsPlaceholderMappingFilesWithEmptyMappings() throws IOException {
        writeJson(tempDir.resolve("mapping/planned.json"), """
                {
                  "version": 1,
                  "sourceLandscapeId": "planned-state-math",
                  "targetLandscapeId": "canonical-math",
                  "mappings": []
                }
                """);

        GoalMappingService service = createService(tempDir);

        assertThat(service.getAllMappings()).isEmpty();
        assertThat(service.getMappingsForSourceLandscape("planned-state-math")).isEmpty();
    }

    private GoalMappingService createService(Path directory) {
        LandscapeProperties properties = new LandscapeProperties();
        properties.setDirectory(directory.toString());
        return new GoalMappingService(properties, objectMapper);
    }

    private void writeJson(Path file, String json) throws IOException {
        Files.createDirectories(file.getParent());
        Files.writeString(file, json);
    }
}
